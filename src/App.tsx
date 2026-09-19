import { useState } from 'react'
import './index.css'

// Tipos para la aplicación
type UserRole = 'parent' | 'child'
type LearningTopic = 'coima' | 'recognition' | 'impact' | 'consequences' | 'prevention' | 'test'
type PlayMode = 'individual' | 'family'
type BadgeType = 'topics-explorer' | 'game-master' | 'integrity-champion'
type DeviceType = 'pc' | 'phone' | 'laptop'

interface Avatar {
  id: number
  name: string
  color: string
  emoji: string
}

interface Badge {
  id: BadgeType
  name: string
  emoji: string
  color: string
  unlocked: boolean
}

interface UserProgress {
  totalActivities: number
  completedActivities: number
  badges: Badge[]
  conversations: number
}

interface ConversationPrompt {
  id: string
  question: string
  asked: boolean
}

const avatars: Avatar[] = [
  { id: 1, name: 'Valiente', color: '#EF4444', emoji: '🦸' },
  { id: 2, name: 'Sabio', color: '#3B82F6', emoji: '🧠' },
  { id: 3, name: 'Amigable', color: '#10B981', emoji: '🤝' },
  { id: 4, name: 'Creativo', color: '#8B5CF6', emoji: '🎨' },
  { id: 5, name: 'Fuerte', color: '#F59E0B', emoji: '💪' },
  { id: 6, name: 'Brillante', color: '#EC4899', emoji: '✨' },
]

const allBadges: Badge[] = [
  { id: 'topics-explorer', name: 'Explorador de Temas', emoji: '📚', color: '#3B82F6', unlocked: false },
  { id: 'game-master', name: 'Maestro del Juego', emoji: '🎮', color: '#8B5CF6', unlocked: false },
  { id: 'integrity-champion', name: 'Campeón de la Integridad', emoji: '🏆', color: '#F59E0B', unlocked: false },
]

const reelsMessages = [
  { id: '1', author: 'Integridad Plus', message: '¿Sabías que la corrupción afecta a más del 50% de la población mundial? 🌍', time: 'Hace 2h' },
  { id: '2', author: 'Ciudadano Global', message: 'Respetar las reglas no es solo obligación, es una elección. 💪', time: 'Hace 5h' },
  { id: '3', author: 'Educación Primero', message: 'Una familia que conversa sobre valores crea ciudadanos más fuertes. 🏠', time: 'Hace 8h' },
  { id: '4', author: 'Sin Coimas', message: 'Denunciar es un acto de valentía. El silencio cómplice alimenta la corrupción. 📢', time: 'Hace 1d' },
  { id: '5', author: 'Jóvenes Valientes', message: 'Aprender sobre integridad desde joven te protege toda la vida. 🌟', time: 'Hace 1d' },
  { id: '6', author: 'Transparencia Total', message: 'La información es un derecho, no un privilegio. La luz es la mejor herramienta contra la corrupción. 💡', time: 'Hace 2d' },
]

const getStoredProgress = (): UserProgress => {
  const stored = localStorage.getItem('hablemos-claro-progress')
  if (stored) return JSON.parse(stored)
  return {
    totalActivities: 0,
    completedActivities: 0,
    badges: [...allBadges],
    conversations: 0,
  }
}

const saveProgress = (progress: UserProgress) => {
  localStorage.setItem('hablemos-claro-progress', JSON.stringify(progress))
}

// Datos de preguntas para la sección Conversemos
const conversationPrompts: ConversationPrompt[] = [
  { id: '1', question: '¿Qué entiendes por coima?', asked: false },
  { id: '2', question: '¿Por qué crees que algunas personas ofrecen coimas?', asked: false },
  { id: '3', question: '¿Quiénes pueden verse afectados por una coima?', asked: false },
  { id: '4', question: '¿Qué harías si alguien te pidiera participar en algo que sabes que está mal?', asked: false },
  { id: '5', question: '¿Por qué es importante respetar las reglas?', asked: false },
]

// Estado global de la aplicación
const initialProgress = getStoredProgress()

export default function App() {
  const [progress, setProgress] = useState<UserProgress>(initialProgress)
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'avatar' | 'config' | 'home' | 'reels' | 'learn' | 'quiz' | 'result' | 'games' | 'converse' | 'activity' | 'cases' | 'profile' | 'content-for-parents'>('welcome')
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<LearningTopic | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<number[]>([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState<string>('')
  const [showCoimaONo, setShowCoimaONo] = useState(false)
  const [currentCoimaCase, setCurrentCoimaCase] = useState(0)
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null)
  const [playMode, setPlayMode] = useState<PlayMode>('individual')
  const [device, setDevice] = useState<DeviceType>('pc')
  const [showBadgeCelebration, setShowBadgeCelebration] = useState(false)
  const [earnedBadge, setEarnedBadge] = useState<Badge | null>(null)

  // Navegar a siguiente pantalla
  const navigateTo = (screen: typeof currentScreen) => {
    setCurrentScreen(screen)
  }

  // Actualizar progreso y verificar insignias
  const updateProgress = (activitiesIncrement: number = 1) => {
    setProgress(prev => {
      const newActivities = prev.completedActivities + activitiesIncrement
      const newBadges = [...prev.badges]
      let newBadgeToShow: Badge | null = null

      // Explorador de Temas: completar la primera actividad
      const isExplorer = newBadges.find(b => b.id === 'topics-explorer')!
      if (!isExplorer.unlocked && newActivities >= 1) {
        isExplorer.unlocked = true
        newBadgeToShow = { ...isExplorer }
      }

      // Maestro del Juego: completar 5+ actividades
      const isMaster = newBadges.find(b => b.id === 'game-master')!
      if (!isMaster.unlocked && newActivities >= 5) {
        isMaster.unlocked = true
        newBadgeToShow = { ...isMaster }
      }

      // Campeón de la Integridad: ambas insignias desbloqueadas
      const isChampion = newBadges.find(b => b.id === 'integrity-champion')!
      if (!isChampion.unlocked && isExplorer.unlocked && isMaster.unlocked) {
        isChampion.unlocked = true
        newBadgeToShow = { ...isChampion }
      }

      saveProgress({ ...prev, completedActivities: newActivities, badges: newBadges })
      if (newBadgeToShow) {
        setEarnedBadge(newBadgeToShow)
        setShowBadgeCelebration(true)
      }
      return { ...prev, completedActivities: newActivities, badges: newBadges }
    })
  }

  // Responder pregunta del quiz
  const handleAnswer = (selected: number) => {
    setUserAnswers(prev => [...prev, selected])
    setShowFeedback(true)
    
    // Determinar si es correcta
    const correctAnswers = [1] // Índice correcto para cada pregunta
    const isCorrect = selected === correctAnswers[userAnswers.length - 1]
    
    if (isCorrect) {
      setFeedbackMessage('¡Correcto! Has aprendido algo nuevo.')
      updateProgress()
    } else {
      setFeedbackMessage('Casi. Recuerda que una coima es cuando alguien ofrece algo de valor para obtener un beneficio injusto.')
      updateProgress()
    }
  }

  // Continuar después del feedback
  const continueAfterFeedback = () => {
    setShowFeedback(false)
    setUserAnswers([])
    
    // Avanzar según la pantalla actual
    switch (currentScreen) {
      case 'quiz':
        // Verificar si completaron todas las preguntas
        if (userAnswers.length >= 3) {
          navigateTo('result')
        }
        break
      case 'games':
        navigateTo('converse')
        break
      case 'activity':
        navigateTo('cases')
        break
      default:
        // Ya no hacer nada, solo cerrar feedback
    }
  }

  // Completar conversación
  const completeConversation = () => {
    setProgress(prev => ({
      ...prev,
      conversations: prev.conversations + 1,
    }))
  }

  // Reiniciar aplicación

  // Renderizar según pantalla
  const renderScreen = () => {
    switch (currentScreen) {
    case 'welcome':
      return (
        <div className="min-h-screen welcome-bg flex items-center justify-center p-4">
          <div className="max-w-5xl mx-auto text-center text-white animate-fade-in">
            <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">Hablemos Claro</h1>
            <p className="text-xl mb-8 opacity-90">Aprender sobre las coimas también es aprender a tomar buenas decisiones.</p>
            
            <div className="space-y-4">
              <button
                onClick={() => setCurrentScreen('avatar')}
                className="btn-glow bg-white text-primary font-bold py-4 px-8 rounded-full text-lg shadow-lg w-full"
              >
                🎮 Empezar Aventura
              </button>
              <button
                onClick={() => setCurrentScreen('config')}
                className="bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white font-bold py-4 px-8 rounded-full text-lg w-full hover:bg-white/30 transition-all"
              >
                ¿Cómo funciona?
              </button>
            </div>
          </div>
        </div>
      )

    case 'avatar':
      return (
        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-success/10 p-4">
          <div className="max-w-5xl mx-auto animate-slide-up">
            <h1 className="text-3xl font-bold gradient-text text-center mb-2">Crea tu Avatar</h1>
            <p className="text-center text-gray-500 mb-6">Elige tu personaje para la aventura</p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {avatars.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`glass-card rounded-2xl p-4 text-center card-hover ${selectedAvatar?.id === avatar.id ? 'ring-4 ring-primary border-primary' : ''}`}
                  style={{ borderColor: selectedAvatar?.id === avatar.id ? avatar.color : 'transparent' }}
                >
                  <div className="text-5xl mb-2 animate-float">{avatar.emoji}</div>
                  <div className="font-bold text-dark text-sm">{avatar.name}</div>
                </button>
              ))}
            </div>

            <div className="glass-card rounded-2xl p-6 mb-6">
              <h3 className="font-bold text-lg mb-4 text-center">🎮 Modo de juego</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPlayMode('individual')}
                  className={`py-4 px-6 rounded-xl font-bold transition-all ${playMode === 'individual' ? 'bg-primary text-white shadow-lg' : 'glass-card text-dark hover:bg-primary/10'}`}
                >
                  👤 Individual
                </button>
                <button
                  onClick={() => setPlayMode('family')}
                  className={`py-4 px-6 rounded-xl font-bold transition-all ${playMode === 'family' ? 'bg-secondary text-white shadow-lg' : 'glass-card text-dark hover:bg-secondary/10'}`}
                >
                  👨‍👩‍👧‍👦 Con familia
                </button>
              </div>
            </div>

            {selectedAvatar && (
              <div className="glass-card rounded-2xl p-6 mb-6 animate-fade-in">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="text-6xl animate-float">{selectedAvatar.emoji}</div>
                  <div>
                    <div className="text-2xl font-bold" style={{ color: selectedAvatar.color }}>{selectedAvatar.name}</div>
                    <div className="text-gray-500">{playMode === 'individual' ? 'Jugando solo' : 'Jugando con familia'}</div>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => { if (selectedAvatar) setCurrentScreen('config'); }}
              disabled={!selectedAvatar}
              className={`w-full py-4 rounded-xl font-bold text-lg ${selectedAvatar ? 'btn-glow bg-primary text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            >
              Continuar →
            </button>
          </div>
        </div>
      )

    case 'config':
      return (
        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-success/10 p-4">
          <div className="max-w-4xl mx-auto animate-slide-up">
            <h2 className="text-3xl font-bold gradient-text mb-6 text-center">Configuración</h2>
            
            <div className="space-y-4">
              <p className="text-dark font-medium text-center">¿Quién está usando la app?</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedRole('parent')}
                  className={selectedRole === 'parent' ? 'bg-primary text-white font-bold py-3 px-4 rounded-xl shadow-lg' : 'glass-card font-bold py-3 px-4 rounded-xl text-dark hover:bg-primary/20 transition-all'}
                >
                  Padre / Madre
                </button>
                <button
                  onClick={() => setSelectedRole('child')}
                  className={selectedRole === 'child' ? 'bg-secondary text-white font-bold py-3 px-4 rounded-xl shadow-lg' : 'glass-card font-bold py-3 px-4 rounded-xl text-dark hover:bg-secondary/20 transition-all'}
                >
                  Hijo / Hija
                </button>
              </div>

              <p className="text-dark font-medium text-center mt-6">¿Qué dispositivo estás usando?</p>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setDevice('pc')}
                  className={device === 'pc' ? 'bg-primary text-white font-bold py-3 px-4 rounded-xl shadow-lg' : 'glass-card font-bold py-3 px-4 rounded-xl text-dark hover:bg-primary/20 transition-all'}
                >
                  💻 PC
                </button>
                <button
                  onClick={() => setDevice('phone')}
                  className={device === 'phone' ? 'bg-secondary text-white font-bold py-3 px-4 rounded-xl shadow-lg' : 'glass-card font-bold py-3 px-4 rounded-xl text-dark hover:bg-secondary/20 transition-all'}
                >
                  📱 Móvil
                </button>
                <button
                  onClick={() => setDevice('laptop')}
                  className={device === 'laptop' ? 'bg-warning text-white font-bold py-3 px-4 rounded-xl shadow-lg' : 'glass-card font-bold py-3 px-4 rounded-xl text-dark hover:bg-warning/20 transition-all'}
                >
                  🖥️ Laptop
                </button>
              </div>

              <p className="text-dark font-medium text-center mt-6">¿Qué quieres aprender hoy?</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setSelectedTopic('coima'); setCurrentScreen('home'); } }
                  className={selectedTopic === 'coima' ? 'bg-primary text-white font-bold py-3 px-4 rounded-xl shadow-lg' : 'glass-card font-bold py-3 px-4 rounded-xl text-dark hover:bg-primary/20 transition-all card-hover'}
                >
                  ¿Qué es una coima?
                </button>
                <button
                  onClick={() => { setSelectedTopic('recognition'); setCurrentScreen('home'); } }
                  className={selectedTopic === 'recognition' ? 'bg-primary text-white font-bold py-3 px-4 rounded-xl shadow-lg' : 'glass-card font-bold py-3 px-4 rounded-xl text-dark hover:bg-primary/20 transition-all card-hover'}
                >
                  ¿Cómo reconocer una situación de corrupción?
                </button>
                <button
                  onClick={() => { setSelectedTopic('impact'); setCurrentScreen('home'); } }
                  className={selectedTopic === 'impact' ? 'bg-primary text-white font-bold py-3 px-4 rounded-xl shadow-lg' : 'glass-card font-bold py-3 px-4 rounded-xl text-dark hover:bg-primary/20 transition-all card-hover'}
                >
                  ¿Por qué las coimas hacen daño?
                </button>
                <button
                  onClick={() => { setSelectedTopic('consequences'); setCurrentScreen('home'); } }
                  className={selectedTopic === 'consequences' ? 'bg-primary text-white font-bold py-3 px-4 rounded-xl shadow-lg' : 'glass-card font-bold py-3 px-4 rounded-xl text-dark hover:bg-primary/20 transition-all card-hover'}
                >
                  Consecuencias legales
                </button>
                <button
                  onClick={() => { setSelectedTopic('prevention'); setCurrentScreen('home'); } }
                  className={selectedTopic === 'prevention' ? 'bg-primary text-white font-bold py-3 px-4 rounded-xl shadow-lg' : 'glass-card font-bold py-3 px-4 rounded-xl text-dark hover:bg-primary/20 transition-all card-hover'}
                >
                  Cómo prevenir la corrupción
                </button>
                <button
                  onClick={() => { setSelectedTopic('test'); setCurrentScreen('home'); } }
                  className={selectedTopic === 'test' ? 'bg-primary text-white font-bold py-3 px-4 rounded-xl shadow-lg' : 'glass-card font-bold py-3 px-4 rounded-xl text-dark hover:bg-primary/20 transition-all card-hover'}
                >
                  Quiero ponerme a prueba.
                </button>
              </div>
            </div>

            <div className="mt-8 p-5 glass-card rounded-2xl">
              <p className="text-sm font-medium text-dark">Barra de progreso general</p>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden mt-3">
                <div 
                  className="progress-bar h-full"
                  style={{ width: `${(progress.completedActivities / Math.max(progress.totalActivities, 1)) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {progress.completedActivities} de {progress.totalActivities} actividades completadas
              </p>
            </div>
          </div>
        </div>
      )

    case 'home':
      const unlockedCount = progress.badges.filter(b => b.unlocked).length
      return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 p-4">
          <div className="max-w-6xl mx-auto animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl shadow-lg animate-float">
                  {selectedAvatar ? selectedAvatar.emoji : '🦸'}
                </div>
                <div>
                  <h1 className="text-2xl font-bold gradient-text">¡Hola! 👋</h1>
                  <p className="text-sm text-gray-500">{device === 'phone' ? '📱 Móvil' : device === 'laptop' ? '🖥️ Laptop' : '💻 PC'}</p>
                </div>
              </div>
              <button onClick={() => setCurrentScreen('profile')} className="glass-card px-4 py-2 rounded-xl text-primary text-sm font-medium hover:bg-primary/10 transition-all">
                Perfil ⭐
              </button>
            </div>

            <p className="text-lg text-gray-600 mb-6">Hoy podemos aprender algo nuevo juntos.</p>

            {/* Progreso + insignias */}
            <div className="glass-card rounded-2xl p-6 mb-6 card-hover">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-secondary text-lg">🏅 Tus insignias</h3>
                <span className="text-sm font-bold text-primary">{unlockedCount}/3</span>
              </div>
              <div className="flex gap-3 mb-4">
                {progress.badges.map(badge => (
                  <div key={badge.id} className={`flex-1 text-center p-3 rounded-xl ${badge.unlocked ? 'animate-float' : 'opacity-30 grayscale'}`}>
                    <div className="text-3xl">{badge.emoji}</div>
                    <div className="text-[10px] font-bold mt-1 truncate">{badge.name}</div>
                  </div>
                ))}
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="progress-bar h-full"
                  style={{ width: `${Math.min((unlockedCount / 3) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Accesos principales */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setCurrentScreen('learn')}
                className="glass-card rounded-2xl p-6 text-left card-hover shadow-custom-lg"
              >
                <div className="text-4xl mb-2">📚</div>
                <h3 className="font-bold text-primary">Temas</h3>
                <p className="text-sm text-gray-500">Aprende sobre las coimas</p>
              </button>
              <button
                onClick={() => setCurrentScreen('games')}
                className="glass-card rounded-2xl p-6 text-left card-hover shadow-custom-lg"
              >
                <div className="text-4xl mb-2">🎮</div>
                <h3 className="font-bold text-secondary">Juego</h3>
                <p className="text-sm text-gray-500">Pon a prueba lo que sabes</p>
              </button>
              <button
                onClick={() => setCurrentScreen('reels')}
                className="glass-card rounded-2xl p-6 text-left card-hover shadow-custom-lg"
              >
                <div className="text-4xl mb-2">📱</div>
                <h3 className="font-bold text-warning">Reels</h3>
                <p className="text-sm text-gray-500">Mensajes de integridad</p>
              </button>
              <button
                onClick={() => setCurrentScreen('profile')}
                className="glass-card rounded-2xl p-6 text-left card-hover shadow-custom-lg"
              >
                <div className="text-4xl mb-2">👤</div>
                <h3 className="font-bold text-success">Perfil</h3>
                <p className="text-sm text-gray-500">Tu progreso e insignias</p>
              </button>
            </div>

            <div className="glass-card rounded-2xl p-6 card-hover">
              <h3 className="font-bold text-warning text-lg mb-2">💬 Actividad familiar</h3>
              <p className="text-gray-600 text-sm mb-4">
                Habla con tu hijo/a sobre una situación en la que alguien podría intentar conseguir algo de manera injusta.
              </p>
              <button
                onClick={() => setCurrentScreen('converse')}
                className="btn-glow bg-warning text-white font-bold py-3 px-6 rounded-xl text-sm w-full"
              >
                Conversar →
              </button>
            </div>
          </div>
        </div>
      )

    case 'reels':
      return (
        <div className="min-h-screen bg-gradient-to-br from-warning/10 via-white to-primary/5 p-4">
          <div className="max-w-5xl mx-auto animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold gradient-text">Reels 📱</h1>
                <p className="text-sm text-gray-500">Mensajes cortos para reflexionar</p>
              </div>
              <button onClick={() => navigateTo('home')} className="glass-card px-3 py-1 rounded-xl text-gray-600 text-sm hover:bg-gray-100 transition-all">
                ← Atrás
              </button>
            </div>

            <div className="space-y-4">
              {reelsMessages.map((reel, index) => (
                <div key={reel.id} className="glass-card rounded-2xl p-6 shadow-custom-lg card-hover animate-slide-up" style={{ animationDelay: `${index * 80}ms` }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-warning to-primary flex items-center justify-center text-white font-bold">
                      {reel.author[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-dark">{reel.author}</p>
                      <p className="text-xs text-gray-500">{reel.time}</p>
                    </div>
                  </div>
                  <p className="text-lg text-gray-700 leading-relaxed">{reel.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )

    case 'learn':
      // Temas educativos
      const topics = {
        coima: {
          title: '¿Qué es una coima?',
          explanation: 'Una coima es cuando una persona ofrece, entrega, pide o acepta algo de valor para conseguir un beneficio indebido o para influir de manera incorrecta en una decisión.',
          example: 'Una persona ofrece dinero para que alguien ignore una regla que debería cumplir.',
          correct: 'No es correcto',
          incorrect: 'Lo correcto es respetar las reglas.',
          video: 'https://www.youtube.com/embed/5LbVY6qH3kM',
          theorem: 'Principio de Transparencia: Toda decisión pública debe estar abierta a la supervisión de los ciudadanos. La información es un derecho, no un privilegio.',
        },
        recognition: {
          title: '¿Cómo reconocer una situación de corrupción?',
          explanation: 'Aprende a identificar cuándo alguien está pidiendo un beneficio a cambio de algo injusto. Señales: ofertas secretas, tratos exclusivos, presión por decidir rápido.',
          example: 'Un funcionario pide dinero para acelerar un trámite.',
          correct: 'Situación de corrupción',
          incorrect: 'Situación normal',
          video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          theorem: 'Principio de Responsabilidad: Quien toma una decisión debe rendir cuentas sobre sus actos. El poder sin control es abuso.',
        },
        impact: {
          title: '¿Por qué las coimas hacen daño?',
          explanation: 'Las coimas afectan a toda la sociedad al desviar recursos de lo que realmente importa: salud, educación, seguridad. El daño es desigual, siempre paga el más vulnerable.',
          example: 'El dinero de una coima podría haber sido usado para escuelas o hospitales.',
          correct: 'Daño a la sociedad',
          incorrect: 'Sin consecuencias',
          video: 'https://www.youtube.com/embed/9bZkp7q19f0',
          theorem: 'Principio de Equidad: Todos merecemos el mismo trato justo. La corrupción rompe la igualdad ante la ley y agrava la pobreza.',
        },
        consequences: {
          title: 'Consecuencias legales y sociales',
          explanation: 'Quien ofrece o acepta una coima comete un delito. Las consecuencias incluyen multas, cárcel, pérdida de empleo y daño permanente a la reputación. También destruye la confianza entre ciudadanos.',
          example: 'Un alcalde que recibe sobornos puede ir a la cárcel y su comunidad pierde servicios públicos.',
          correct: 'Consecuencias graves',
          incorrect: 'No pasa nada',
          video: 'https://www.youtube.com/embed/DqP2rR0fB4s',
          theorem: 'Principio de Proporcionalidad: La pena debe ser proporcional al delito. Pero la prevención siempre es mejor que el castigo.',
        },
        prevention: {
          title: 'Cómo prevenir la corrupción',
          explanation: 'La prevención empieza con la educación. Conocer tus derechos, denunciar cuando algo está mal, y fomentar la cultura de la honestidad son herramientas poderosas. Cada persona puede marcar la diferencia.',
          example: 'Un grupo de vecinos que exige rendición de cuentas a su comité comunitario previene el uso indebido de fondos.',
          correct: 'Sí, la prevención funciona',
          incorrect: 'No se puede hacer nada',
          video: 'https://www.youtube.com/embed/kffacxfA7G4',
          theorem: 'Principio de Participación Ciudadana: La democracia se fortalece cuando todos vigilamos y participamos. El silencio cómplice es la mayor herramienta de la corrupción.',
        },
        test: {
          title: 'Pon a prueba tus conocimientos',
          explanation: 'Responde estas preguntas para verificar lo que aprendiste sobre todos los temas.',
          example: '',
          correct: '',
          incorrect: '',
          video: '',
          theorem: 'Recuerda: La integridad no es solo no hacer lo malo, sino actuar correctamente incluso cuando nadie te ve.',
        },
      }

      const coimaCases = [
        {
          id: 1,
          situation: 'Una persona ofrece dinero para que le den un trato especial que no le corresponde.',
          isCoima: true,
          explanation: 'Correcto. Se está ofreciendo algo para obtener un beneficio que no corresponde.'
        },
        {
          id: 2,
          situation: 'Un funcionario pide un "extra" para acelerar un trámite importante.',
          isCoima: true,
          explanation: 'Correcto. Pedir dinero extra por hacer su trabajo es una coima.'
        },
        {
          id: 3,
          situation: 'Un amigo te presta su cuaderno para que copies la tarea.',
          isCoima: false,
          explanation: 'Correcto. Prestar un cuaderno entre amigos no es una coima, es ayuda entre compañeros.'
        },
        {
          id: 4,
          situation: 'Una persona ofrece un regalo caro a un juez para que falle a su favor.',
          isCoima: true,
          explanation: 'Correcto. Ofrecer regalos a autoridades para influir en decisiones es coima.'
        },
        {
          id: 5,
          situation: 'Un comerciante paga el precio justo por un producto en el mercado.',
          isCoima: false,
          explanation: 'Correcto. Pagar el precio acordado en una transacción honesta no es coima.'
        },
      ]

      const currentTopicData = selectedTopic ? topics[selectedTopic] : topics.coima

      // Pantalla "¿Coima o no?"
      if (showCoimaONo) {
        const currentCase = coimaCases[currentCoimaCase]
        return (
          <div className="min-h-screen bg-light text-dark p-4">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-primary">¿Coima o no?</h1>
                <button onClick={() => { setShowCoimaONo(false); setCurrentCoimaCase(0); }} className="text-gray-500 hover:text-primary">
                  ← Atrás
                </button>
              </div>

              <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">Caso {currentCoimaCase + 1} de {coimaCases.length}</span>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden w-48">
                    <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${((currentCoimaCase + 1) / coimaCases.length) * 100}%` }}></div>
                  </div>
                </div>

                <p className="text-lg text-gray-700 mb-6">{currentCase.situation}</p>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      const isCorrect = currentCase.isCoima === true
                      setFeedbackMessage(isCorrect ? currentCase.explanation : 'Incorrecto. ' + currentCase.explanation)
                      setShowFeedback(true)
                      updateProgress()
                    }}
                    className="btn-primary py-4 px-6 rounded-lg text-lg font-medium"
                  >
                    Sí, es una coima
                  </button>
                  <button
                    onClick={() => {
                      const isCorrect = currentCase.isCoima === false
                      setFeedbackMessage(isCorrect ? currentCase.explanation : 'Incorrecto. ' + currentCase.explanation)
                      setShowFeedback(true)
                      updateProgress()
                    }}
                    className="btn-outline py-4 px-6 rounded-lg text-lg font-medium border-2 border-primary text-primary"
                  >
                    No, no es una coima
                  </button>
                </div>
              </div>

              {showFeedback && (
                <div className="mt-6 p-4 rounded-lg bg-white shadow-sm">
                  <p className="font-medium {feedbackMessage.includes('Correcto') ? 'text-primary' : 'text-alert'}">
                    {feedbackMessage}
                  </p>
                </div>
              )}

              {showFeedback && (
                <div className="mt-6">
                  <button
                    onClick={() => {
                      setShowFeedback(false)
                      if (currentCoimaCase < coimaCases.length - 1) {
                        setCurrentCoimaCase(prev => prev + 1)
                      } else {
                        setShowCoimaONo(false)
                        setCurrentCoimaCase(0)
                        navigateTo('home')
                      }
                    }}
                    className="btn-primary w-full py-3 px-6 rounded-lg text-lg"
                  >
                    {currentCoimaCase < coimaCases.length - 1 ? 'Siguiente caso' : 'Volver al inicio'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      }

      return (
        <div className="min-h-screen bg-light text-dark p-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-primary">
                {currentTopicData.title}
              </h1>
              <button onClick={() => navigateTo('home')} className="text-gray-500 hover:text-primary">
                ← Atrás
              </button>
            </div>

            {selectedTopic !== 'test' && !showCoimaONo && (
              <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
                <h2 className="text-xl font-bold text-primary mb-4">Explicación</h2>
                <p className="text-gray-700">{currentTopicData.explanation}</p>
                
                <div className="mt-4 p-3 bg-primary/5 rounded">
                  <p className="font-medium text-primary">Ejemplo:</p>
                  <p className="text-gray-700 mt-1">{currentTopicData.example}</p>
                </div>

                <div className="mt-6 flex gap-2">
                  <button
                    onClick={() => handleAnswer(0)}
                    className={progress.completedActivities > 0 ? 'btn-outline' : 'btn-primary w-48 py-2 px-4 rounded'}
                  >
                    ✅ {currentTopicData.correct}
                  </button>
                  <button
                    onClick={() => handleAnswer(1)}
                    className="btn-outline w-48 py-2 px-4 rounded"
                  >
                    ❌ {currentTopicData.incorrect}
                  </button>
                </div>
              </div>
            )}

            {selectedTopic !== 'test' && !showCoimaONo && (
              <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
                <h2 className="text-xl font-bold text-primary mb-4">¿Coima o no?</h2>
                <p className="text-gray-700 mb-4">Pon a prueba tu criterio con situaciones de la vida real.</p>
                <button
                  onClick={() => setShowCoimaONo(true)}
                  className="btn-primary w-full py-3 px-6 rounded-lg text-lg"
                >
                  Empezar test
                </button>
              </div>
            )}

            {selectedTopic === 'test' && (
              <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
                <h2 className="text-xl font-bold text-primary mb-4">Pon a prueba tus conocimientos</h2>
                <p className="text-gray-700 mb-4">
                  Responde las siguientes preguntas seleccionando la opción correcta.
                </p>
                
                {/* Pregunta 1 */}
                <div className="mb-4">
                  <p className="font-medium text-gray-800 mb-2">Pregunta 1:</p>
                  <p className="text-gray-700 mb-3">¿Qué es una coima?</p>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleAnswer(0)}
                      className="btn-outline w-full py-2 px-4 rounded text-left"
                    >
                      <span className="font-medium">Ofrecer dinero para saltarse una regla</span>
                    </button>
                    <button
                      onClick={() => handleAnswer(1)}
                      className="btn-outline w-full py-2 px-4 rounded text-left"
                    >
                      <span className="font-medium">Respetar las reglas sin ofrecer nada</span>
                    </button>
                  </div>
                </div>

                {/* Pregunta 2 */}
                <div className="mb-4">
                  <p className="font-medium text-gray-800 mb-2">Pregunta 2:</p>
                  <p className="text-gray-700 mb-3">¿Puedo ofrecerle dinero a un amigo para que gane un concurso?</p>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleAnswer(0)}
                      className="btn-outline w-full py-2 px-4 rounded text-left"
                    >
                      <span className="font-medium">Sí, es un regalo amable</span>
                    </button>
                    <button
                      onClick={() => handleAnswer(1)}
                      className="btn-outline w-full py-2 px-4 rounded text-left"
                    >
                      <span className="font-medium">No, eso no es correcto</span>
                    </button>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => navigateTo('result')}
                    className="btn-primary w-full py-3 px-6 rounded-lg text-lg font-medium"
                  >
                    Terminar prueba
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )

    case 'quiz':
      // Quiz interactivo con casos
      const quizCases = [
        {
          id: 1,
          situation: 'Un adulto te dice que puede darte dinero para que alguien haga algo que no debería.',
          options: [
            { id: 0, text: 'Aceptarlo' },
            { id: 1, text: 'Ignorarlo y seguir' },
            { id: 2, text: 'Hablar con un adulto de confianza y explicar la situación' },
          ]
        },
        {
          id: 2,
          situation: 'Una persona ofrece dinero para que le den un trato especial que no le corresponde.',
          options: [
            { id: 0, text: 'Sí, es una coima' },
            { id: 1, text: 'No, no es una coima' },
          ]
        },
        {
          id: 3,
          situation: 'Un funcionario pide un "extra" para acelerar un trámite importante.',
          options: [
            { id: 0, text: 'Sí, es una coima' },
            { id: 1, text: 'No, no es una coima' },
          ]
        },
      ]

      return (
        <div className="min-h-screen bg-gradient-to-br from-secondary/10 via-primary/5 to-success/10 p-4">
          <div className="max-w-5xl mx-auto animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold gradient-text">¿Qué harías?</h1>
              <button onClick={() => navigateTo('home')} className="glass-card px-3 py-1 rounded-xl text-gray-600 text-sm hover:bg-gray-100 transition-all">
                ← Atrás
              </button>
            </div>

            <div className="glass-card rounded-2xl p-6 shadow-custom-lg mb-6 card-hover">
              <p className="text-lg text-gray-700 mb-4 leading-relaxed">{quizCases[currentQuestionIndex].situation}</p>
              
              {quizCases[currentQuestionIndex].options.map((opt, _i) => (
                <div key={opt.id} className="mb-3">
                  <button
                    onClick={() => handleAnswer(opt.id)}
                    className="btn-glow w-full py-4 px-5 rounded-xl text-left glass-card hover:border-primary/50 transition-all text-dark font-medium"
                  >
                    {opt.text}
                  </button>
                </div>
              ))}
            </div>

            {showFeedback && (
              <div className="mt-4 p-5 rounded-xl bg-primary/10 border border-primary/20 animate-fade-in">
                <p className="font-bold text-primary text-lg">{feedbackMessage}</p>
              </div>
            )}

            {!showFeedback && currentQuestionIndex < quizCases.length - 1 && (
              <button
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                className="btn-glow bg-primary text-white font-bold py-4 px-6 rounded-xl text-lg w-full mt-4"
              >
                Siguiente caso →
              </button>
            )}

            {showFeedback && currentQuestionIndex >= quizCases.length - 1 && showFeedback && (
              <button
                onClick={() => continueAfterFeedback()}
                className="btn-glow bg-success text-white font-bold py-4 px-6 rounded-xl text-lg w-full mt-4"
              >
                Terminar quiz →
              </button>
            )}
          </div>
        </div>
      )

    case 'result':
      return (
        <div className="min-h-screen bg-light text-dark p-4">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-primary mb-4">¡Actividad completada! 🎉</h2>
            <p className="text-3xl font-bold">{progress.completedActivities}/{progress.totalActivities}</p>
            <p className="text-gray-700 mt-4">Has aprendido a identificar algunas situaciones relacionadas con las coimas.</p>
            
            <div className="mt-6 p-4 bg-primary/5 rounded">
              <p className="font-medium text-primary">+20 puntos</p>
            </div>

            <div className="mt-8 space-y-3">
              <button
                onClick={() => navigateTo('games')}
                className="btn-primary w-full py-3 px-6 rounded-lg text-lg"
              >
                Continuar aprendiendo
              </button>
              <button
                onClick={() => navigateTo('converse')}
                className="btn-outline w-full py-3 px-6 rounded-lg text-lg mt-2"
              >
                Conversar con mi familia
              </button>
            </div>
          </div>
        </div>
      )

    case 'games':
      return (
        <div className="min-h-screen bg-light text-dark p-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-primary">Pon a prueba lo que sabes 🎮</h1>
              <button onClick={() => navigateTo('home')} className="text-gray-500 hover:text-primary">
                ← Atrás
              </button>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
              <h2 className="text-xl font-bold text-primary mb-6">Minijuegos</h2>
              
              {/* Juego 1: ¿Qué harías? */}
              <div className="mb-6">
                <h3 className="font-medium text-primary mb-3">Juego 1: ¿Qué harías?</h3>
                <p className="text-gray-700 mb-4">"Un adulto te dice que puede darte dinero para que alguien haga algo que no debería."</p>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleAnswer(0)}
                    className="btn-outline py-2 px-4 rounded"
                  >
                    Aceptarlo
                  </button>
                  <button
                    onClick={() => handleAnswer(1)}
                    className="btn-outline py-2 px-4 rounded"
                  >
                    Ignorarlo y seguir
                  </button>
                  <button
                    onClick={() => handleAnswer(2)}
                    className="btn-outline py-2 px-4 rounded"
                  >
                    Hablar con un adulto de confianza
                  </button>
                </div>
              </div>

              {/* Juego 2: Verdadero o falso */}
              <div>
                <h3 className="font-medium text-primary mb-3">Juego 2: Verdadero o falso</h3>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={() => handleAnswer(0)}
                    className="btn-outline py-2 px-4 rounded"
                  >
                    <span>A) Una coima solo ocurre cuando se entrega dinero.</span>
                  </button>
                  <button
                    onClick={() => handleAnswer(1)}
                    className="btn-outline py-2 px-4 rounded"
                  >
                    <span>B) Las coimas pueden perjudicar a otras personas.</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleAnswer(0)}
                    className="btn-outline py-2 px-4 rounded"
                  >
                    <span>C) Pedir un beneficio injusto puede ser parte de un acto de corrupción.</span>
                  </button>
                  <button
                    onClick={() => handleAnswer(1)}
                    className="btn-outline py-2 px-4 rounded"
                  >
                    <span>D) Las coimas son siempre graves.</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-primary/5 rounded">
              <p className="font-medium">Insignias: {progress.badges.filter(b => b.unlocked).length}/3 ⭐</p>
              <p className="text-xs">Desbloquea todas para ser Campeón</p>
            </div>

            <button
              onClick={() => navigateTo('converse')}
              className="btn-primary w-full py-3 px-6 rounded-lg text-lg mt-4"
            >
                Continuar a Conversemos
            </button>
          </div>
        </div>
      )

    case 'converse':
      return (
        <div className="min-h-screen bg-light text-dark p-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-primary">Conversemos en familia 💬</h1>
              <button onClick={() => navigateTo('home')} className="text-gray-500 hover:text-primary">
                ← Atrás
              </button>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
              <h2 className="text-xl font-bold text-primary mb-6">Preguntas para conversar</h2>
              
              {conversationPrompts.map((prompt, _index) => (
                <div key={prompt.id} className="mb-4">
                  <p className="font-medium text-gray-800 mb-2">{prompt.question}</p>
                  <button
                    onClick={() => {
// Marcar como preguntado y guardar progreso
                       completeConversation()
                    }}
                    className="btn-primary py-2 px-4 rounded text-sm"
                  >
                    Empezar conversación
                  </button>
                  
                  {prompt.asked && (
                    <p className="text-green-600 text-sm mt-2">✓ Ya conversamos</p>
                  )}
                </div>
              ))}

              {conversationPrompts.every(p => p.asked) && (
                <div className="mt-8 p-4 bg-primary/5 rounded text-center">
                  <h3 className="font-bold text-primary">¡Excelente! Hoy tuvieron una conversación importante.</h3>
                  <p>Han completado todas las preguntas de conversación familiar.</p>
                </div>
              )}
            </div>

            <div>
              <button
                onClick={() => navigateTo('activity')}
                className="btn-primary w-full py-3 px-6 rounded-lg text-lg mt-4"
              >
                Ir a Actividad familiar
              </button>
            </div>
          </div>
        </div>
      )

    case 'activity':
      return (
        <div className="min-h-screen bg-light text-dark p-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-family">Detectemos juntos</h1>
              <button onClick={() => navigateTo('converse')} className="text-gray-500 hover:text-primary">
                ← Atrás
              </button>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
              <p className="text-gray-700 mb-4">
                "Una persona quiere obtener un beneficio que no le corresponde y ofrece dinero para conseguirlo."
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Señales de alerta:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>Ofrecer dinero para obtener algo injusto</li>
                    <li>Pedidos discretos para "ayudar"</li>
                    <li>Intentos de saltarse reglas</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium">¿Qué harían?</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="btn-outline py-2 px-3 rounded">Padre: Detener la situación</button>
                    <button className="btn-outline py-2 px-3 rounded">Hijo: Preguntar por qué está mal</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-primary/5 rounded">
              <p className="font-medium text-primary">
                Hablar sobre estas situaciones ayuda a reconocer decisiones incorrectas antes de enfrentarlas en la vida real.
              </p>
            </div>

            <button
              onClick={() => navigateTo('cases')}
              className="btn-primary w-full py-3 px-6 rounded-lg text-lg mt-4"
            >
                Ver casos de la vida cotidiana
            </button>
          </div>
        </div>
      )

    case 'cases':
      const lifeCases = [
        {
          title: ' Escuela',
          situation: 'Un estudiante ofrece dinero a un compañero para que le permita copiar un examen.',
          questions: [
            '¿Qué está pasando?',
            '¿Dónde está el problema?',
            '¿Qué consecuencias podría tener?',
            '¿Qué decisión sería responsable?',
          ]
        },
        {
          title: ' Trámites',
          situation: 'Una persona ofrece "propina" al funcionario para que su trámite sea procesado más rápido.',
          questions: [
            '¿Qué está pasando?',
            '¿Dónde está el problema?',
            '¿Qué consecuencias podría tener?',
            '¿Qué decisión sería responsable?',
          ]
        },
        {
          title: ' Competencias',
          situation: 'Un atleta ofrece dinero al entrenador para que sea incluido en el equipo titular.',
          questions: [
            '¿Qué está pasando?',
            '¿Dónde está el problema?',
            '¿Qué consecuencias podría tener?',
            '¿Qué decisión sería responsable?',
          ]
        },
        {
          title: ' Servicios',
          situation: 'Un vecino ofrece dinero al encargado del edificio para que repare su fuga antes que al resto.',
          questions: [
            '¿Qué está pasando?',
            '¿Dónde está el problema?',
            '¿Qué consecuencias podría tener?',
            '¿Qué decisión sería responsable?',
          ]
        },
        {
          title: ' Situaciones comunitarias',
          situation: 'Un comerciante ofrece dinero al comité local para que su negocio sea el elegido para un festival.',
          questions: [
            '¿Qué está pasando?',
            '¿Dónde está el problema?',
            '¿Qué consecuencias podría tener?',
            '¿Qué decisión sería responsable?',
          ]
        },
      ]

      return (
        <div className="min-h-screen bg-light text-dark p-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-primary">Casos de la vida cotidiana</h1>
              <button onClick={() => navigateTo('activity')} className="text-gray-500 hover:text-primary">
                ← Atrás
              </button>
            </div>

            <div className="space-y-6">
              {lifeCases.map((caseItem, index) => (
                <div key={index} className="bg-white rounded-lg p-5 shadow-sm">
                  <h3 className="text-lg font-bold text-primary mb-3">{caseItem.title}</h3>
                  <p className="text-gray-700 mb-4">{caseItem.situation}</p>
                  
                  <div>
                    <p className="font-medium">1. ¿Qué está pasando?</p>
                    <p className="text-gray-600 italic small">(Para discutir en familia)</p>
                  </div>
                  
                  <div>
                    <p className="font-medium">2. ¿Dónde está el problema?</p>
                    <p className="text-gray-600 italic small">(Reflexionar juntos)</p>
                  </div>
                  
                  <div>
                    <p className="font-medium">3. ¿Qué consecuencias podría tener?</p>
                    <p className="text-gray-600 italic small">(Analizar impactos)</p>
                  </div>
                  
                  <div>
                    <p className="font-medium">4. ¿Qué decisión sería responsable?</p>
                    <p className="text-gray-600 italic small">(Tomar una decisión)</p>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <button
                onClick={() => navigateTo('profile')}
                className="btn-primary w-full py-3 px-6 rounded-lg text-lg mt-4"
              >
                Ver mi perfil
              </button>
            </div>
          </div>
        </div>
      )

    case 'profile':
      return (
        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/5 to-warning/10 p-4">
          <div className="max-w-4xl mx-auto animate-slide-up">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-float">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 014 4v3a4 4 0 01-4 4V3a4 4 0 01-4-4zM5 7a2 2 0 012-2h4a2 2 0 012 2v3a2 2 0 01-2h4a2 2 0 01-2v-3zM8 21a4 4 0 01-4-4v-3a4 4 0 014-4h6a4 4 0 014 4v3a4 4 0 01-4 4zm8-13a4 4 0 01-4-4V7a4 4 0 014-4h3a4 4 0 014 4v3a4 4 0 01-4 4h-3z"></path>
                </svg>
              </div>
              <h2 className="text-3xl font-bold gradient-text">Familia 👨‍👩‍👧‍👦</h2>
              <p className="text-gray-500 mt-1">Tu progreso de aprendizaje</p>
            </div>

            <div className="glass-card rounded-2xl p-6 shadow-custom-lg mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3">
                  <div className="text-3xl font-bold gradient-text">{progress.badges.filter(b => b.unlocked).length}/3</div>
                  <div className="text-sm text-gray-500 mt-1">Insignias</div>
                </div>
                <div className="text-center p-3">
                  <div className="text-3xl font-bold text-secondary">{progress.completedActivities}</div>
                  <div className="text-sm text-gray-500 mt-1">Actividades</div>
                </div>
                <div className="text-center p-3">
                  <div className="text-3xl font-bold text-warning">{progress.conversations}</div>
                  <div className="text-sm text-gray-500 mt-1">Conversaciones</div>
                </div>
                <div className="text-center p-3">
                  <div className="text-lg font-bold text-primary">{progress.badges.find(b => b.id === 'integrity-champion')?.unlocked ? '🏆 Campeón' : 'En progreso'}</div>
                  <div className="text-sm text-gray-500 mt-1">Estado</div>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 mb-4">
              <h3 className="font-bold text-dark mb-3">Progreso General</h3>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="progress-bar h-full"
                  style={{ width: `${progress.totalActivities > 0 ? (progress.completedActivities / progress.totalActivities) * 100 : 0}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-sm text-gray-500">{progress.completedActivities} de {progress.totalActivities}</span>
                <span className="text-sm font-bold text-primary">{progress.totalActivities > 0 ? Math.round((progress.completedActivities / progress.totalActivities) * 100) : 0}%</span>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 mb-4">
              <h3 className="font-bold text-dark mb-2">🎯 Tus Insignias</h3>
              <div className="flex gap-3 mt-3">
                {progress.badges.map(badge => (
                  <div key={badge.id} className={`text-center p-3 rounded-xl ${badge.unlocked ? '' : 'opacity-40 grayscale'}`} style={{ border: badge.unlocked ? `2px solid ${badge.color}` : '2px solid gray' }}>
                    <div className="text-2xl">{badge.emoji}</div>
                    <div className="text-xs font-bold mt-1" style={{ color: badge.color }}>{badge.name}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <button onClick={() => setCurrentScreen('home')} className="btn-glow bg-primary text-white font-bold py-4 px-6 rounded-xl text-lg w-full">
                ← Volver al inicio
              </button>
            </div>
          </div>
        </div>
      )

    case 'content-for-parents':
      return (
        <div className="min-h-screen bg-light text-dark p-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-primary">Guía para conversar</h1>
              <button onClick={() => navigateTo('home')} className="text-gray-500 hover:text-primary">
                ← Atrás
              </button>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-gray-700 text-lg mb-6">Consejos para padres y madres:</p>
              
              <ul className="space-y-4">
                <li className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-primary mb-1">Escucha primero.</p>
                  <p className="text-gray-600 text-sm">Permite que tu hijo/a exprese sus opiniones sin interrumpir.</p>
                </li>
                
                <li className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-primary mb-1">No conviertas la conversación en un interrogatorio.</p>
                  <p className="text-gray-600 text-sm">Haz preguntas abiertas y naturales.</p>
                </li>
                
                <li className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-primary mb-1">Utiliza ejemplos cotidianos.</p>
                  <p className="text-gray-600 text-sm">Conecta el tema con situaciones que vivan juntos.</p>
                </li>
                
                <li className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-primary mb-1">Pregunta qué piensa tu hijo.</p>
                  <p className="text-gray-600 text-sm">Valida sus opiniones y reflexiona juntos.</p>
                </li>
                
                <li className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-primary mb-1">Explícale las consecuencias.</p>
                  <p className="text-gray-600 text-sm">Ayúdalo a entender el impacto de las acciones.</p>
                </li>
                
                <li className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-primary mb-1">Refuerza valores como honestidad y responsabilidad.</p>
                  <p className="text-gray-600 text-sm">Elogia las decisiones correctas.</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )

    default:
      return null
    }
  }

  return (
    <>
      {device === 'phone' ? (
        // Marco de móvil: la app se muestra como un celular centrado
        <div className="min-h-screen flex items-center justify-center p-3" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b, #0f172a)' }}>
          <div className="relative w-[390px] max-w-full h-screen rounded-[3rem] bg-slate-900 p-2.5 shadow-2xl">
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-32 h-5 rounded-full bg-slate-900 border border-slate-700 z-20 pointer-events-none"></div>
            <div className="h-full rounded-[2rem] overflow-y-auto overflow-x-hidden bg-white">
              {renderScreen()}
            </div>
          </div>
        </div>
      ) : device === 'laptop' ? (
        // Marco de laptop: formato de computadora portátil centrado
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #334155, #1e293b, #334155)' }}>
          <div className="w-full max-w-[1280px] h-screen rounded-2xl overflow-hidden shadow-2xl bg-white relative">
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-slate-400 z-20 pointer-events-none"></div>
            <div className="max-w-6xl mx-auto">
              {renderScreen()}
            </div>
          </div>
        </div>
      ) : (
        // PC: la app ocupa toda la pantalla
        renderScreen()
      )}
      {showBadgeCelebration && earnedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="rounded-3xl p-8 max-w-sm w-full text-center text-white animate-slide-up shadow-2xl" style={{ background: 'linear-gradient(135deg, #1e3a8a, #6d28d9, #b45309)' }}>
            <div className="text-7xl mb-4 animate-float">{earnedBadge.emoji}</div>
            <p className="text-2xl font-bold mb-1">¡Insignia desbloqueada!</p>
            <p className="text-lg mb-6" style={{ color: earnedBadge.color }}>{earnedBadge.name}</p>
            <p className="text-sm text-white/70 mb-6">Sigue aprendiendo para conseguir las demás insignias. 🌟</p>
            <button
              onClick={() => setShowBadgeCelebration(false)}
              className="bg-white text-primary font-bold py-3 px-8 rounded-full text-lg w-full"
            >
              ¡Genial! 🎉
            </button>
          </div>
        </div>
      )}
    </>
  )
}