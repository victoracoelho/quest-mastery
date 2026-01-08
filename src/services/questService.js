import { supabase } from '../lib/supabaseClient'

export const questService = {
  // Buscar todas as quests do usuário logado
  async getQuests() {
    const { data, error } = await supabase
      .from('quests')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Buscar quest por ID
  async getQuestById(id) {
    const { data, error } = await supabase
      .from('quests')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Criar nova quest
  async createQuest(questData) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')
    
    const { data, error } = await supabase
      .from('quests')
      .insert([{ 
        ...questData, 
        user_id: user.id 
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Atualizar quest
  async updateQuest(id, updates) {
    const { data, error } = await supabase
      .from('quests')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Marcar quest como completa
  async completeQuest(id) {
    return this.updateQuest(id, {
      status: 'completed',
      completed_at: new Date().toISOString()
    })
  },

  // Deletar quest
  async deleteQuest(id) {
    const { error } = await supabase
      .from('quests')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  },

  // Buscar estatísticas do usuário
  async getUserStats() {
    const { data, error } = await supabase
      .from('quests')
      .select('status, xp')
    
    if (error) throw error
    
    const stats = {
      total: data.length,
      completed: data.filter(q => q.status === 'completed').length,
      pending: data.filter(q => q.status === 'pending').length,
      totalXP: data.reduce((sum, q) => sum + (q.xp || 0), 0)
    }
    
    return stats
  }
}
