'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Users, Play, Settings, Zap, Star } from 'lucide-react'
import HostPanel from './components/HostPanel'
import PlayerPanel from './components/PlayerPanel'
import GameBoard from './components/GameBoard'
import Leaderboard from './components/Leaderboard'

export default function Home() {
  const [isHost, setIsHost] = useState(false)
  const [showRoleSelection, setShowRoleSelection] = useState(true)
  const [gameState, setGameState] = useState('waiting') // waiting, registration, playing, finished
  const [isPlayerFromUrl, setIsPlayerFromUrl] = useState(false)

  useEffect(() => {
    // Check if user came from a room URL
    const urlParams = new URLSearchParams(window.location.search)
    const room = urlParams.get('room')
    
    if (room) {
      setIsPlayerFromUrl(true)
      setShowRoleSelection(false)
      setIsHost(false)
    }
  }, [])

  const handleRoleSelection = (role: 'host' | 'player') => {
    setIsHost(role === 'host')
    setShowRoleSelection(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <AnimatePresence>
          {showRoleSelection && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center justify-center min-h-screen"
            >
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-12"
              >
                <motion.h1 
                  className="text-6xl font-jeopardy font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 mb-4"
                  animate={{ 
                    textShadow: [
                      '0 0 20px #FFD700',
                      '0 0 30px #FFD700, 0 0 40px #FFD700',
                      '0 0 20px #FFD700'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  JEOPARDY
                </motion.h1>
                <motion.p 
                  className="text-2xl text-cyan-400 font-bold mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  TECH EDITION
                </motion.p>
                <motion.p 
                  className="text-lg text-gray-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  ¡Demuestra tus conocimientos en tecnología!
                </motion.p>
              </motion.div>

              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                {/* Host Card */}
                <motion.div
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="game-board p-8 rounded-2xl cursor-pointer group"
                >
                  <div className="text-center">
                    <motion.div
                      className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Settings className="w-10 h-10 text-black" />
                    </motion.div>
                    <h2 className="text-3xl font-bold text-yellow-400 mb-4 group-hover:text-yellow-300 transition-colors">
                      HOST
                    </h2>
                    <p className="text-gray-300 mb-6">
                      Crea una sala, gestiona el juego y controla el flujo de preguntas
                    </p>
                    <motion.button
                      onClick={() => handleRoleSelection('host')}
                      className="neon-button px-8 py-4 rounded-xl font-bold text-black text-lg w-full"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      SER HOST
                    </motion.button>
                  </div>
                </motion.div>

                {/* Player Card */}
                <motion.div
                  whileHover={{ scale: 1.05, rotateY: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="game-board p-8 rounded-2xl cursor-pointer group"
                >
                  <div className="text-center">
                    <motion.div
                      className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Users className="w-10 h-10 text-black" />
                    </motion.div>
                    <h2 className="text-3xl font-bold text-cyan-400 mb-4 group-hover:text-cyan-300 transition-colors">
                      JUGADOR
                    </h2>
                    <p className="text-gray-300 mb-6">
                      Únete a una sala y compite con otros jugadores respondiendo preguntas
                    </p>
                    <motion.button
                      onClick={() => handleRoleSelection('player')}
                      className="neon-button px-8 py-4 rounded-xl font-bold text-black text-lg w-full"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      JUGAR
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div 
                className="mt-12 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                <div className="flex items-center justify-center space-x-4 text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span>Preguntas de tecnología</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <span>Competencia en tiempo real</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span>Ranking de jugadores</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {!showRoleSelection && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {isHost ? (
              <HostPanel onGameStateChange={setGameState} />
            ) : (
              <PlayerPanel gameState={gameState} isFromUrl={isPlayerFromUrl} />
            )}
          </motion.div>
        )}
      </div>
    </main>
  )
}
