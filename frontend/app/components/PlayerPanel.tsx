'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Clock, 
  CheckCircle, 
  XCircle,
  Trophy,
  Zap,
  Target
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

export default function PlayerPanel({ gameState, isFromUrl = false }: { gameState: string, isFromUrl?: boolean }) {
  const [playerName, setPlayerName] = useState('')
  const [isRegistered, setIsRegistered] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [questionTimer, setQuestionTimer] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [answerSubmitted, setAnswerSubmitted] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [userId, setUserId] = useState<number | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [gameCountdown, setGameCountdown] = useState(0)
  const [localGameState, setLocalGameState] = useState(gameState)
  const [winnerCountdown, setWinnerCountdown] = useState(0)
  const [winnerName, setWinnerName] = useState('')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    // WebSocket connection
    const websocket = new WebSocket('ws://localhost:8000/ws')
    websocket.onopen = () => {
      console.log('Connected to game server')
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
    const shouldPlay = isRegistered && localGameState === 'playing' && winnerCountdown === 0 && !isMuted
    if (shouldPlay) {
      audio.play().catch(() => {})
    } else {
      audio.pause()
      if (localGameState !== 'playing') {
        audio.currentTime = 0
      }
    }
  }, [isRegistered, localGameState, winnerCountdown, isMuted])

  const handleWebSocketMessage = (data: any) => {
    console.log('Player received WebSocket message:', data)
    switch (data.type) {
      case 'registration_started':
        console.log('Registration started')
        setLocalGameState('registration')
        break
      case 'game_started':
        console.log('Game started')
        setLocalGameState('playing')
        if (data.countdown) {
          setGameCountdown(data.countdown)
          // Start countdown timer
          const countdownInterval = setInterval(() => {
            setGameCountdown(prev => {
              if (prev <= 1) {
                clearInterval(countdownInterval)
                return 0
              }
              return prev - 1
            })
          }, 1000)
        }
        break
      case 'new_question':
        console.log('New question received:', data.question)
        console.log('Setting current question to:', data.question)
        setCurrentQuestion(data.question)
        setQuestionTimer(data.timer || 15)
        setAnswerSubmitted(false)
        setShowResult(false)
        setSelectedAnswer('')
        setGameCountdown(0) // Hide game countdown when question starts
        setLocalGameState('playing') // Ensure game state is playing
        break
      case 'game_finished':
        console.log('Game finished')
        setLocalGameState('finished')
        try {
          const top = data.leaderboard && data.leaderboard.length > 0 ? data.leaderboard[0] : null
          setWinnerName(top ? top.name : '')
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
      default:
        console.log('Unknown message type:', data.type)
    }
  }

  const registerPlayer = async () => {
    if (!playerName.trim()) return

    try {
      const response = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: playerName,
          is_host: false,
        }),
      })

      if (response.ok) {
        const user = await response.json()
        setUserId(user.id)
        setIsRegistered(true)
      }
    } catch (error) {
      console.error('Error registering player:', error)
    }
  }

  const submitAnswer = async () => {
    if (!selectedAnswer || !currentQuestion || !userId) return

    try {
      const response = await fetch('http://localhost:8000/submit-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          question_id: currentQuestion.id,
          selected_answer: selectedAnswer,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setIsCorrect(result.correct)
        setAnswerSubmitted(true)
        setShowResult(true)
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
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
    if (isRegistered) {
      const interval = setInterval(fetchUsers, 2000)
      return () => clearInterval(interval)
    }
  }, [isRegistered])

  // Question timer
  useEffect(() => {
    if (questionTimer > 0) {
      const timer = setTimeout(() => {
        setQuestionTimer(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [questionTimer])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-jeopardy font-black text-cyan-400 mb-4">
            {isFromUrl ? '¡ÚNETE AL JUEGO!' : 'JEOPARDY TECH EDITION'}
          </h1>
          <div className="flex items-center justify-center space-x-4 text-gray-300">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-cyan-400" />
              <span>{isRegistered ? playerName : 'No registrado'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-green-400" />
              <span>Estado: {localGameState}</span>
            </div>
          </div>
        </motion.div>

        {/* Registration Form */}
        {!isRegistered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto"
          >
            <div className="game-board p-8 rounded-2xl">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-cyan-400 mb-6">
                  {isFromUrl ? '¡BIENVENIDO A LA SALA!' : '¡ÚNETE AL JUEGO!'}
                </h2>
                <p className="text-gray-300 mb-8">
                  {isFromUrl 
                    ? 'Ingresa tu nombre para unirte a esta sala de juego' 
                    : 'Ingresa tu nombre para participar en la trivia'
                  }
                </p>
                
                <div className="mb-6">
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full px-4 py-3 bg-gray-800 border-2 border-cyan-400 rounded-lg text-white placeholder-gray-400 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    onKeyPress={(e) => e.key === 'Enter' && registerPlayer()}
                  />
                </div>
                
                <motion.button
                  onClick={registerPlayer}
                  disabled={!playerName.trim()}
                  className="neon-button px-8 py-4 rounded-xl font-bold text-black text-xl w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <User className="w-6 h-6 inline mr-2" />
                  ENTRAR A LA SALA
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Waiting for Game */}
        {isRegistered && localGameState === 'registration' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="game-board p-8 rounded-2xl text-center">
              <h2 className="text-3xl font-bold text-green-400 mb-6">
                ¡REGISTRADO EXITOSAMENTE!
              </h2>
              <p className="text-gray-300 mb-8 text-lg">
                Esperando a que el host inicie el juego...
              </p>
              
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-6"
              />
              
              <p className="text-cyan-400 font-semibold">
                ¡Prepárate para la competencia!
              </p>
            </div>
          </motion.div>
        )}

        {/* Game Countdown */}
        {isRegistered && localGameState === 'playing' && gameCountdown > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
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
                {gameCountdown}
              </motion.div>
              <p className="text-gray-300 text-lg">
                ¡Prepárate para responder las preguntas!
              </p>
            </div>
          </motion.div>
        )}

        {/* Question Display */}
        {isRegistered && localGameState === 'playing' && currentQuestion && (
          <div className="max-w-4xl mx-auto">
            
            <GameBoard 
              currentQuestion={currentQuestion}
              questionTimer={questionTimer}
              onAnswerSelect={setSelectedAnswer}
              selectedAnswer={selectedAnswer}
              onSubmitAnswer={submitAnswer}
              answerSubmitted={answerSubmitted}
              showResult={showResult}
              isCorrect={isCorrect}
              isPlayer={true}
            />
            
            <div className="mt-8">
              <Leaderboard users={users} />
            </div>
          </div>
        )}

        {/* Game Finished */}
        {isRegistered && localGameState === 'finished' && winnerCountdown > 0 && (
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

        {isRegistered && localGameState === 'finished' && winnerCountdown === 0 && (
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
                Gracias por participar en Jeopardy Tech Edition
              </p>
              
              <Leaderboard users={users} />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
