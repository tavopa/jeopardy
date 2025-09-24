'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Medal, Award, Users } from 'lucide-react'

interface User {
  id: number
  name: string
  score: number
  is_host: boolean
}

interface LeaderboardProps {
  users: User[]
}

export default function Leaderboard({ users }: LeaderboardProps) {
  const sortedUsers = [...users].sort((a, b) => b.score - a.score)
  const topThree = sortedUsers.slice(0, 3)
  const otherUsers = sortedUsers.slice(3)

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-400" />
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 2:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-gray-400 font-bold">
          {index + 1}
        </span>
    }
  }

  const getRankClass = (index: number) => {
    switch (index) {
      case 0:
        return 'first'
      case 1:
        return 'second'
      case 2:
        return 'third'
      default:
        return ''
    }
  }

  if (users.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="leaderboard p-6 rounded-2xl"
      >
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-400 mb-2">
            No hay jugadores registrados
          </h3>
          <p className="text-gray-500">
            Los jugadores aparecerán aquí una vez que se registren
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="leaderboard p-6 rounded-2xl"
    >
      <h3 className="text-3xl font-bold text-cyan-400 mb-6 text-center">
        TABLA DE PUNTUACIONES
      </h3>
      
      <div className="space-y-4">
        {/* Top 3 Podium */}
        {topThree.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {topThree.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.2 }}
                className={`leaderboard-item p-6 rounded-xl ${getRankClass(index)}`}
              >
                <div className="text-center">
                  <motion.div
                    className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center"
                    animate={{ 
                      scale: index === 0 ? [1, 1.1, 1] : 1,
                      rotate: index === 0 ? [0, 5, -5, 0] : 0
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: index === 0 ? Infinity : 0,
                      repeatDelay: 3
                    }}
                  >
                    {getRankIcon(index)}
                  </motion.div>
                  
                  <h4 className="text-xl font-bold mb-2">
                    {user.name}
                    {user.is_host && (
                      <span className="ml-2 text-sm bg-yellow-400 text-black px-2 py-1 rounded">
                        HOST
                      </span>
                    )}
                  </h4>
                  
                  <div className="text-3xl font-black">
                    {user.score}
                  </div>
                  
                  <div className="text-sm opacity-75 mt-2">
                    {index === 0 ? '🥇 LÍDER' : 
                     index === 1 ? '🥈 SEGUNDO' : 
                     '🥉 TERCERO'}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Rest of the players */}
        {otherUsers.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-lg font-semibold text-gray-300 mb-4 text-center">
              Otros Jugadores
            </h4>
            {otherUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="leaderboard-item p-4 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center text-black font-bold">
                    {index + 4}
                  </div>
                  <div>
                    <h5 className="font-semibold text-white">
                      {user.name}
                      {user.is_host && (
                        <span className="ml-2 text-xs bg-yellow-400 text-black px-2 py-1 rounded">
                          HOST
                        </span>
                      )}
                    </h5>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-xl font-bold text-cyan-400">
                    {user.score}
                  </div>
                  <div className="text-xs text-gray-400">
                    puntos
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center"
      >
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-2xl font-bold text-cyan-400">
            {users.length}
          </div>
          <div className="text-sm text-gray-400">
            Total Jugadores
          </div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-400">
            {sortedUsers[0]?.score || 0}
          </div>
          <div className="text-sm text-gray-400">
            Puntuación Máxima
          </div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-400">
            {Math.round(users.reduce((sum, user) => sum + user.score, 0) / users.length) || 0}
          </div>
          <div className="text-sm text-gray-400">
            Promedio
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
