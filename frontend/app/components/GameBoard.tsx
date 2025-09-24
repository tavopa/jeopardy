'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Clock, 
  CheckCircle, 
  XCircle,
  Zap,
  Target,
  Trophy
} from 'lucide-react'

interface Question {
  id: number
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
}

interface GameBoardProps {
  currentQuestion?: Question | null
  questionTimer?: number
  timeRemaining?: number
  onNextQuestion?: () => void
  onAnswerSelect?: (answer: string) => void
  selectedAnswer?: string
  onSubmitAnswer?: () => void
  answerSubmitted?: boolean
  showResult?: boolean
  isCorrect?: boolean
  isPlayer?: boolean
}

export default function GameBoard({
  currentQuestion,
  questionTimer = 0,
  timeRemaining = 0,
  onNextQuestion,
  onAnswerSelect,
  selectedAnswer,
  onSubmitAnswer,
  answerSubmitted,
  showResult,
  isCorrect,
  isPlayer = false
}: GameBoardProps) {
  const [localTimer, setLocalTimer] = useState(questionTimer)

  useEffect(() => {
    setLocalTimer(questionTimer)
  }, [questionTimer])

  useEffect(() => {
    if (localTimer > 0) {
      const timer = setTimeout(() => {
        setLocalTimer(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [localTimer])

  const options = currentQuestion ? [
    { key: 'A', value: currentQuestion.option_a, letter: 'A' },
    { key: 'B', value: currentQuestion.option_b, letter: 'B' },
    { key: 'C', value: currentQuestion.option_c, letter: 'C' },
    { key: 'D', value: currentQuestion.option_d, letter: 'D' }
  ] : []

  const getOptionClass = (optionKey: string) => {
    let baseClass = "option-button p-6 rounded-xl font-semibold text-lg transition-all duration-300 cursor-pointer"
    
    if (selectedAnswer === optionKey) {
      baseClass += " selected"
    }
    
    if (showResult && isCorrect && selectedAnswer === optionKey) {
      baseClass += " correct"
    }
    
    if (showResult && !isCorrect && selectedAnswer === optionKey) {
      baseClass += " incorrect"
    }
    
    return baseClass
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Timer Display */}
      {(localTimer > 0 || timeRemaining > 0) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className={`timer inline-flex items-center px-8 py-4 rounded-2xl ${localTimer <= 5 ? 'warning' : ''}`}>
            <Clock className="w-8 h-8 mr-3" />
            <span className="text-3xl font-black">
              {localTimer > 0 ? localTimer : timeRemaining}
            </span>
          </div>
        </motion.div>
      )}

      {/* Question Display */}
      {currentQuestion && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="question-card p-8 rounded-2xl mb-8"
        >
          <div className="text-center">
            <motion.h2 
              className="text-3xl font-bold text-white mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {currentQuestion.question_text}
            </motion.h2>
            
            {/* Answer Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {options.map((option, index) => (
                <motion.button
                  key={option.key}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={getOptionClass(option.key)}
                  onClick={() => isPlayer && onAnswerSelect && onAnswerSelect(option.key)}
                  disabled={answerSubmitted || !isPlayer}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center text-black font-bold text-lg">
                      {option.letter}
                    </div>
                    <span className="text-left flex-1">{option.value}</span>
                    {showResult && selectedAnswer === option.key && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        {isCorrect ? (
                          <CheckCircle className="w-8 h-8 text-green-400" />
                        ) : (
                          <XCircle className="w-8 h-8 text-red-400" />
                        )}
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Player Actions */}
            {isPlayer && !answerSubmitted && selectedAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8"
              >
                <motion.button
                  onClick={onSubmitAnswer}
                  className="neon-button px-8 py-4 rounded-xl font-bold text-black text-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Target className="w-6 h-6 inline mr-2" />
                  CONFIRMAR RESPUESTA
                </motion.button>
              </motion.div>
            )}

            {/* Result Display */}
            {showResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-8 p-6 rounded-xl bg-gray-800 border-2 border-cyan-400"
              >
                <div className="text-center">
                  {isCorrect ? (
                    <div className="text-green-400">
                      <CheckCircle className="w-16 h-16 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold mb-2">¡CORRECTO!</h3>
                      <p className="text-lg">¡Bien hecho! +1 punto</p>
                    </div>
                  ) : (
                    <div className="text-red-400">
                      <XCircle className="w-16 h-16 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold mb-2">¡INCORRECTO!</h3>
                      <p className="text-lg">Mejor suerte en la siguiente</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Host Controls */}
            {!isPlayer && onNextQuestion && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8"
              >
                <motion.button
                  onClick={onNextQuestion}
                  className="neon-button px-8 py-4 rounded-xl font-bold text-black text-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Zap className="w-6 h-6 inline mr-2" />
                  SIGUIENTE PREGUNTA
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* No Question State */}
      {!currentQuestion && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="game-board p-8 rounded-2xl text-center"
        >
          <div className="flex flex-col items-center">
            <Trophy className="w-20 h-20 text-yellow-400 mb-6" />
            <h2 className="text-3xl font-bold text-cyan-400 mb-4">
              {isPlayer ? 'Esperando pregunta...' : 'Preparando pregunta...'}
            </h2>
            <p className="text-gray-300 text-lg">
              {isPlayer 
                ? 'El host está preparando la siguiente pregunta' 
                : 'Haz clic en "Siguiente Pregunta" para continuar'
              }
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
