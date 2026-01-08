import { useState, useEffect } from 'react'
import { questService } from '../services/questService'
import { useAuth } from '../contexts/AuthContext'

export const useQuests = () => {
  const [quests, setQuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  const fetchQuests = async () => {
    if (!user) {
      setQuests([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await questService.getQuests()
      setQuests(data)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching quests:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuests()
  }, [user])

  const createQuest = async (questData) => {
    try {
      const newQuest = await questService.createQuest(questData)
      setQuests(prev => [newQuest, ...prev])
      return newQuest
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const updateQuest = async (id, updates) => {
    try {
      const updatedQuest = await questService.updateQuest(id, updates)
      setQuests(prev => prev.map(q => q.id === id ? updatedQuest : q))
      return updatedQuest
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const deleteQuest = async (id) => {
    try {
      await questService.deleteQuest(id)
      setQuests(prev => prev.filter(q => q.id !== id))
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const completeQuest = async (id) => {
    try {
      const completedQuest = await questService.completeQuest(id)
      setQuests(prev => prev.map(q => q.id === id ? completedQuest : q))
      return completedQuest
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  return {
    quests,
    loading,
    error,
    createQuest,
    updateQuest,
    deleteQuest,
    completeQuest,
    refreshQuests: fetchQuests
  }
}
