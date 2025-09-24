'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Users, 
  Settings, 
  Trophy, 
  Clock, 
  ChevronRight,
  Zap,
  Target,
  BarChart3
} from 'lucide-react'
import GameBoard from './GameBoard'
import Leaderboard from './Leaderboard'

interface User {
  id: number
  name: string
  score: number
  is_host: boolean
}

interface Question {
  id: number
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
}

export default function HostPanel({ onGameStateChange }: { onGameStateChange: (state: string) => void }) {
  const [gameState, setGameState] = useState('waiting')
  const [users, setUsers] = useState<User[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [questionTimer, setQuestionTimer] = useState(0)
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [registrationUrl, setRegistrationUrl] = useState('')
  const [winnerCountdown, setWinnerCountdown] = useState(0)
  const [winnerName, setWinnerName] = useState('')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    // Generate registration URL
    const url = `${window.location.origin}?room=${Date.now()}`
    setRegistrationUrl(url)

    // WebSocket connection
    const websocket = new WebSocket('ws://localhost:8000/ws')
    websocket.onopen = () => {
      websocket.send(JSON.stringify({ type: 'host_connect' }))
    }
    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      handleWebSocketMessage(data)
    }
    setWs(websocket)

    return () => {
      websocket.close()
    }
  }, [])

  // Initialize suspense music audio element once on mount
  useEffect(() => {
    if (!audioRef.current) {
      const win: any = typeof window !== 'undefined' ? window : undefined
      const src = (win && win.__SUSPENSE_URL__) || 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_2f9b7e1b4e.mp3?filename=suspense-ambient-110241.mp3'
      const audio = new Audio(src)
      audio.loop = true
      audio.volume = 0.25
      audioRef.current = audio
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
    }
  }, [])

  // Control playback based on game state
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const shouldPlay = gameState === 'playing' && winnerCountdown === 0 && !isMuted
    if (shouldPlay) {
      audio.play().catch(() => {})
    } else {
      audio.pause()
      if (gameState !== 'playing') {
        audio.currentTime = 0
      }
    }
  }, [gameState, winnerCountdown, isMuted])

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'host_confirmed':
        console.log('Host confirmed')
        break
      case 'game_state':
        setGameState(data.state.is_registration_open ? 'registration' : 
                   data.state.is_game_started ? 'playing' : 'waiting')
        break
      case 'registration_started':
        setGameState('registration')
        onGameStateChange('registration')
        break
      case 'game_started':
        setGameState('playing')
        onGameStateChange('playing')
        if (data.countdown) {
          setTimeRemaining(data.countdown)
          // Start countdown timer
          const countdown = setInterval(() => {
            setTimeRemaining(prev => {
              if (prev <= 1) {
                clearInterval(countdown)
                // Automatically start first question after countdown
                startFirstQuestion()
                return 0
              }
              return prev - 1
            })
          }, 1000)
        }
        break
      case 'new_question':
        setCurrentQuestion(data.question)
        setQuestionTimer(15)
        break
      case 'game_finished':
        setGameState('finished')
        onGameStateChange('finished')
        // Determine winner name from payload if provided, else from current users state
        try {
          const top = data.leaderboard && data.leaderboard.length > 0 ? data.leaderboard[0] : null
          setWinnerName(top ? top.name : (users.sort((a,b)=>b.score-a.score)[0]?.name || ''))
        } catch (e) {
          setWinnerName('')
        }
        setWinnerCountdown(10)
        const wc = setInterval(() => {
          setWinnerCountdown(prev => {
            if (prev <= 1) {
              clearInterval(wc)
              return 0
            }
            return prev - 1
          })
        }, 1000)
        break
    }
  }

  const startRegistration = async () => {
    try {
      const response = await fetch('http://localhost:8000/start-registration', {
        method: 'POST',
      })
      if (response.ok) {
        setGameState('registration')
        onGameStateChange('registration')
      }
    } catch (error) {
      console.error('Error starting registration:', error)
    }
  }

  const startGame = async () => {
    try {
      const response = await fetch('http://localhost:8000/start-game', {
        method: 'POST',
      })
      if (response.ok) {
        console.log('Game start request sent')
        // The WebSocket message will handle the countdown
      }
    } catch (error) {
      console.error('Error starting game:', error)
    }
  }

  const startFirstQuestion = async () => {
    try {
      const response = await fetch('http://localhost:8000/start-first-question', {
        method: 'POST',
      })
      if (response.ok) {
        console.log('First question started')
      }
    } catch (error) {
      console.error('Error starting first question:', error)
    }
  }

  const nextQuestion = async () => {
    try {
      console.log('Requesting next question...')
      const response = await fetch('http://localhost:8000/next-question', {
        method: 'POST',
      })
      if (response.ok) {
        console.log('Next question request successful')
        // The WebSocket will handle the new question
      } else {
        console.error('Next question request failed:', response.status)
      }
    } catch (error) {
      console.error('Error getting next question:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8000/users')
      const usersData = await response.json()
      setUsers(usersData)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  useEffect(() => {
    if (gameState === 'registration' || gameState === 'playing') {
      const interval = setInterval(fetchUsers, 2000)
      return () => clearInterval(interval)
    }
  }, [gameState])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-jeopardy font-black text-yellow-400 mb-4">
            PANEL DE HOST
          </h1>
          <div className="flex items-center justify-center space-x-4 text-gray-300">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <span>{users.length} jugadores</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-green-400" />
              <span>Estado: {gameState}</span>
            </div>
          </div>
        </motion.div>

        {/* Registration Section */}
        {gameState === 'waiting' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto"
          >
            <div className="game-board p-8 rounded-2xl mb-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-cyan-400 mb-6">
                  ¡Bienvenido, Host!
                </h2>
                <p className="text-gray-300 mb-8 text-lg">
                  Gestiona tu sala de Jeopardy y controla el flujo del juego
                </p>
                
                <motion.button
                  onClick={startRegistration}
                  className="neon-button px-8 py-4 rounded-xl font-bold text-black text-xl mb-6"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-6 h-6 inline mr-2" />
                  ABRIR REGISTRO
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Registration Open */}
        {gameState === 'registration' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="game-board p-8 rounded-2xl mb-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-green-400 mb-6">
                  REGISTRO ABIERTO
                </h2>
                <p className="text-gray-300 mb-6">
                  Comparte esta URL con los jugadores:
                </p>
                <div className="bg-gray-800 p-4 rounded-lg mb-6">
                  <code className="text-cyan-400 text-lg break-all">
                    {registrationUrl}
                  </code>
                </div>
                <p className="text-gray-300 mb-8">
                  Los jugadores pueden unirse usando la URL de arriba
                </p>
                
                <motion.button
                  onClick={startGame}
                  className="neon-button px-8 py-4 rounded-xl font-bold text-black text-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Zap className="w-6 h-6 inline mr-2" />
                  INICIAR JUEGO
                </motion.button>
              </div>
            </div>

            {/* Players List */}
            <div className="game-board p-6 rounded-2xl">
              <h3 className="text-2xl font-bold text-cyan-400 mb-4 text-center">
                JUGADORES REGISTRADOS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-800 p-4 rounded-lg border border-cyan-400"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center">
                        <span className="text-black font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-semibold">{user.name}</p>
                        <p className="text-gray-400 text-sm">Puntuación: {user.score}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Game Countdown */}
        {gameState === 'playing' && timeRemaining > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="game-board p-8 rounded-2xl text-center">
              <h2 className="text-4xl font-bold text-yellow-400 mb-6">
                ¡EL JUEGO COMIENZA EN!
              </h2>
              <motion.div
                className="timer text-6xl font-black text-red-400 mb-6"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {timeRemaining}
              </motion.div>
              <p className="text-gray-300 text-lg">
                ¡Prepárate para la primera pregunta!
              </p>
            </div>
          </motion.div>
        )}

        {/* Game in Progress */}
        {gameState === 'playing' && timeRemaining === 0 && (
          <div className="max-w-6xl mx-auto">
            <div className="game-board p-8 rounded-2xl mb-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-green-400 mb-6">
                  ¡JUEGO EN PROGRESO!
                </h2>
                <p className="text-gray-300 mb-8 text-lg">
                  Los jugadores están respondiendo las preguntas. Usa los controles de abajo para gestionar el juego.
                </p>
                
                
                <motion.button
                  onClick={nextQuestion}
                  className="neon-button px-8 py-4 rounded-xl font-bold text-black text-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Zap className="w-6 h-6 inline mr-2" />
                  SIGUIENTE PREGUNTA
                </motion.button>
              </div>
            </div>
            
            <div className="mt-8">
              <Leaderboard users={users} />
            </div>
          </div>
        )}

        {/* Game Finished */}
        {gameState === 'finished' && winnerCountdown > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto"
          >
            <div className="game-board p-8 rounded-2xl text-center">
              <h2 className="text-4xl font-bold text-yellow-400 mb-4">
                ¡TENEMOS UN GANADOR!
              </h2>
              
              <p className="text-gray-300 mb-2 text-lg">Mostrando podio en...</p>
              <motion.div
                className="timer text-6xl font-black text-red-400"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {winnerCountdown}
              </motion.div>
            </div>
          </motion.div>
        )}

        {gameState === 'finished' && winnerCountdown === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto"
          >
            <div className="game-board p-8 rounded-2xl text-center">
              <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-6" />
              <h2 className="text-4xl font-bold text-yellow-400 mb-6">
                ¡JUEGO TERMINADO!
              </h2>
              <p className="text-gray-300 mb-8 text-lg">
                Gracias por jugar Jeopardy Tech Edition
              </p>
              
              <Leaderboard users={users} />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
