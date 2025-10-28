'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, Save, X, BookOpen } from 'lucide-react'

interface Question {
  id?: number
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: string
}

export default function QuestionManager() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<Question>({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A'
  })

  
  const API_BASE = (typeof window !== 'undefined' && (window as any).__API_URL__) || (process && process.env && process.env.NEXT_PUBLIC_API_URL) || 'http://localhost:8000'

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`${API_BASE}/questions`)
      const data = await response.json()
      setQuestions(data)
    } catch (error) {
      console.error('Error fetching questions:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingId 
        ? `${API_BASE}/questions/${editingId}`
        : `${API_BASE}/questions`
      
      const method = editingId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        fetchQuestions()
        resetForm()
      }
    } catch (error) {
      console.error('Error saving question:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta pregunta?')) return
    
    try {
      const response = await fetch(`${API_BASE}/questions/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchQuestions()
      }
    } catch (error) {
      console.error('Error deleting question:', error)
    }
  }

  const handleEdit = (question: Question) => {
    setFormData(question)
    setEditingId(question.id || null)
    setIsAdding(true)
  }

  const resetForm = () => {
    setFormData({
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'A'
    })
    setIsAdding(false)
    setEditingId(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-jeopardy font-black text-yellow-400 mb-4">
            ADMINISTRADOR DE PREGUNTAS
          </h1>
          <p className="text-gray-300">
            Gestiona las preguntas que se usarán en el juego
          </p>
        </motion.div>

        {/* Add/Edit Form */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-2xl mx-auto mb-8"
            >
              <div className="game-board p-6 rounded-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-cyan-400">
                    {editingId ? 'Editar Pregunta' : 'Nueva Pregunta'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Pregunta
                    </label>
                    <textarea
                      value={formData.question_text}
                      onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border-2 border-cyan-400 rounded-lg text-white placeholder-gray-400 focus:border-yellow-400 focus:outline-none"
                      rows={3}
                      required
                      placeholder="Escribe la pregunta aquí..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Opción A
                      </label>
                      <input
                        type="text"
                        value={formData.option_a}
                        onChange={(e) => setFormData({ ...formData, option_a: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-800 border-2 border-cyan-400 rounded-lg text-white placeholder-gray-400 focus:border-yellow-400 focus:outline-none"
                        required
                        placeholder="Primera opción"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Opción B
                      </label>
                      <input
                        type="text"
                        value={formData.option_b}
                        onChange={(e) => setFormData({ ...formData, option_b: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-800 border-2 border-cyan-400 rounded-lg text-white placeholder-gray-400 focus:border-yellow-400 focus:outline-none"
                        required
                        placeholder="Segunda opción"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Opción C
                      </label>
                      <input
                        type="text"
                        value={formData.option_c}
                        onChange={(e) => setFormData({ ...formData, option_c: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-800 border-2 border-cyan-400 rounded-lg text-white placeholder-gray-400 focus:border-yellow-400 focus:outline-none"
                        required
                        placeholder="Tercera opción"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Opción D
                      </label>
                      <input
                        type="text"
                        value={formData.option_d}
                        onChange={(e) => setFormData({ ...formData, option_d: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-800 border-2 border-cyan-400 rounded-lg text-white placeholder-gray-400 focus:border-yellow-400 focus:outline-none"
                        required
                        placeholder="Cuarta opción"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Respuesta Correcta
                    </label>
                    <select
                      value={formData.correct_answer}
                      onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border-2 border-cyan-400 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
                      required
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>

                  <div className="flex gap-4">
                    <motion.button
                      type="submit"
                      className="neon-button px-6 py-3 rounded-xl font-bold text-black flex-1"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Save className="w-5 h-5 inline mr-2" />
                      {editingId ? 'Actualizar' : 'Guardar'}
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={resetForm}
                      className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-xl font-bold text-white"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancelar
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Button */}
        {!isAdding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <motion.button
              onClick={() => setIsAdding(true)}
              className="neon-button px-6 py-3 rounded-xl font-bold text-black w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Agregar Nueva Pregunta
            </motion.button>
          </motion.div>
        )}

        {/* Questions List */}
        <div className="max-w-4xl mx-auto">
          <div className="game-board p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-cyan-400 flex items-center">
                <BookOpen className="w-6 h-6 mr-2" />
                Preguntas Registradas ({questions.length})
              </h2>
            </div>

            {questions.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No hay preguntas registradas</p>
                <p className="text-sm">Agrega tu primera pregunta para comenzar</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="question-card p-4 rounded-xl"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-3">
                          {question.question_text}
                        </h3>
                        <div className="grid grid-cols-2 gap-2 text-sm" style={{ color: '#FFFFFF' }}>
                          <div className={`p-2 rounded ${question.correct_answer === 'A' ? 'bg-green-900/30 border border-green-500' : 'bg-gray-800'}`}>
                            <span className="font-bold text-cyan-400">A:</span> {question.option_a}
                          </div>
                          <div className={`p-2 rounded ${question.correct_answer === 'B' ? 'bg-green-900/30 border border-green-500' : 'bg-gray-800'}`}>
                            <span className="font-bold text-cyan-400">B:</span> {question.option_b}
                          </div>
                          <div className={`p-2 rounded ${question.correct_answer === 'C' ? 'bg-green-900/30 border border-green-500' : 'bg-gray-800'}`}>
                            <span className="font-bold text-cyan-400">C:</span> {question.option_c}
                          </div>
                          <div className={`p-2 rounded ${question.correct_answer === 'D' ? 'bg-green-900/30 border border-green-500' : 'bg-gray-800'}`}>
                            <span className="font-bold text-cyan-400">D:</span> {question.option_d}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(question)}
                          className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => question.id && handleDelete(question.id)}
                          className="p-2 bg-red-600 hover:bg-red-500 rounded-lg text-white transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
