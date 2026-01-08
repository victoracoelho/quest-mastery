import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useQuests } from '../hooks/useQuests'
import LoginForm from './auth/LoginForm'
import SignUpForm from './auth/SignUpForm'

export default function TestQuests() {
  const { user, signOut } = useAuth()
  const { quests, loading, createQuest, completeQuest, deleteQuest } = useQuests()
  const [showSignUp, setShowSignUp] = useState(false)
  const [newQuestTitle, setNewQuestTitle] = useState('')

  const handleCreateQuest = async (e) => {
    e.preventDefault()
    if (!newQuestTitle.trim()) return

    try {
      await createQuest({
        title: newQuestTitle,
        description: 'Quest criada para teste',
        xp: 100
      })
      setNewQuestTitle('')
      alert('Quest criada com sucesso!')
    } catch (error) {
      alert('Erro ao criar quest: ' + error.message)
    }
  }

  if (!user) {
    return showSignUp ? (
      <SignUpForm onToggleMode={() => setShowSignUp(false)} />
    ) : (
      <LoginForm onToggleMode={() => setShowSignUp(true)} />
    )
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Quest Mastery</h2>
          <p>Logado como: {user.email}</p>
        </div>
        <button onClick={signOut}>Sair</button>
      </div>

      <form onSubmit={handleCreateQuest} style={{ marginBottom: '30px' }}>
        <h3>Criar Nova Quest</h3>
        <input
          type="text"
          value={newQuestTitle}
          onChange={(e) => setNewQuestTitle(e.target.value)}
          placeholder="Título da quest..."
          style={{ width: '70%', padding: '10px', marginRight: '10px' }}
        />
        <button type="submit" style={{ padding: '10px 20px' }}>
          Adicionar Quest
        </button>
      </form>

      <h3>Suas Quests ({quests.length})</h3>
      {loading ? (
        <p>Carregando...</p>
      ) : quests.length === 0 ? (
        <p>Nenhuma quest ainda. Crie sua primeira!</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {quests.map((quest) => (
            <li 
              key={quest.id} 
              style={{ 
                padding: '15px', 
                marginBottom: '10px', 
                border: '1px solid #ddd',
                borderRadius: '5px',
                backgroundColor: quest.status === 'completed' ? '#e8f5e9' : 'white'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{quest.title}</strong>
                  <p style={{ margin: '5px 0', color: '#666' }}>{quest.description}</p>
                  <small>XP: {quest.xp} | Status: {quest.status}</small>
                </div>
                <div>
                  {quest.status !== 'completed' && (
                    <button 
                      onClick={() => completeQuest(quest.id)}
                      style={{ marginRight: '10px', padding: '5px 10px' }}
                    >
                      Completar
                    </button>
                  )}
                  <button 
                    onClick={() => deleteQuest(quest.id)}
                    style={{ padding: '5px 10px', background: '#f44336', color: 'white' }}
                  >
                    Deletar
                    </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
