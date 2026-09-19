import { useState } from 'react'
import './index.css'

// Tipos para la aplicación
type UserRole = 'parent' | 'child'
type LearningTopic = 'coima' | 'recognition' | 'impact' | 'test'

interface UserProgress {
  totalActivities: number
  completedActivities: number
  points: number
  level: string
  conversations: number
}

interface ConversationPrompt {
  id: string
  question: string
  asked: boolean
}

// Datos de progreso simulados (usando localStorage)
const getStoredProgress = (): UserProgress => {
  const stored = localStorage.getItem('hablemos-claro-progress')
  if (stored) return JSON.parse(stored)
  return {
    totalActivities: 0,
    completedActivities: 0,
    points: 0,
    level: 'Primer paso',
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

// Niveles del sistema de puntos
const levelTitles: Record<string, string> = {
  '0': 'Explorador de la honestidad',
  '20': 'Detective de decisiones',
  '40': 'Ciudadano responsable',
  '60': 'Agente de cambio',
  '80': 'Defensor de la justicia',
  '100': 'Campeón de la integridad',
}

// Estado global de la aplicación
const initialProgress = getStoredProgress()

export default function App() {
  const [progress, setProgress] = useState<UserProgress>(initialProgress)
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'config' | 'home' | 'learn' | 'quiz' | 'result' | 'games' | 'converse' | 'activity' | 'cases' | 'profile' | 'content-for-parents'>('welcome')
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<LearningTopic | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<number[]>([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState<string>('')
  const [showCoimaONo, setShowCoimaONo] = useState(false)
  const [currentCoimaCase, setCurrentCoimaCase] = useState(0)

  // Navegar a siguiente pantalla
  const navigateTo = (screen: typeof currentScreen) => {
    setCurrentScreen(screen)
  }

  // Actualizar progreso
  const updateProgress = (pointsToAdd: number, activitiesIncrement: number = 1) => {
    setProgress(prev => {
      const p: UserProgress = prev
      const newPoints = p.points + pointsToAdd
      const newActivities = p.completedActivities + activitiesIncrement
      const newLevel = Object.entries(levelTitles)
        .reverse()
        .find(([threshold]) => newPoints >= parseInt(threshold))
        ?.[1] || 'Primer paso'
      
      return {
        ...p,
        points: newPoints,
        completedActivities: newActivities,
        level: newLevel,
      }
    })
    saveProgress(getUpdatedProgress())
  }

  const getUpdatedProgress = (): UserProgress => {
    const stored = localStorage.getItem('hablemos-claro-progress')
    if (stored) return JSON.parse(stored)
    return initialProgress
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
      updateProgress(10, 1)
    } else {
      setFeedbackMessage('Casi. Recuerda que una coima es cuando alguien ofrece algo de valor para obtener un beneficio injusto.')
      updateProgress(5, 1) // Puntos por intentarlo
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
    saveProgress(getUpdatedProgress())
  }

  // Reiniciar aplicación

  // Lógica por pantalla
  const handleStart = () => {
    setSelectedRole('parent') // Por defecto, o podríamos preguntar
    setSelectedTopic('coima')
    setCurrentScreen('home')
  }

  // Renderizar según pantalla
  switch (currentScreen) {
    case 'welcome':
      return (
        <div className="min-h-screen bg-light text-dark p-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-primary mb-2">Hablemos Claro</h1>
            <p className="text-xl text-secondary mb-8">Aprender sobre las coimas también es aprender a tomar buenas decisiones.</p>
            
            <div className="space-y-4">
              <button
                onClick={handleStart}
                className="btn-primary w-full py-3 px-6 rounded-lg text-lg font-medium"
              >
                Comenzar
              </button>
              <button
                onClick={() => setCurrentScreen('config')}
                className="btn-secondary w-full py-3 px-6 rounded-lg text-lg font-medium"
              >
                ¿Cómo funciona?
              </button>
            </div>
          </div>
        </div>
      )

    case 'config':
      return (
        <div className="min-h-screen bg-light text-dark p-4">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-primary mb-6">Configuración</h2>
            
            <div className="space-y-4">
              <p>¿Quién está usando la app?</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedRole('parent')}
                  className={selectedRole === 'parent' ? 'btn-primary bg-primary/20 text-primary' : 'btn-outline'}
                >
                  Padre / Madre
                </button>
                <button
                  onClick={() => setSelectedRole('child')}
                  className={selectedRole === 'child' ? 'btn-primary bg-primary/20 text-primary' : 'btn-outline'}
                >
                  Hijo / Hija
                </button>
              </div>

              <p>¿Qué quieres aprender hoy?</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setSelectedTopic('coima'); setCurrentScreen('home'); } }
                  className={selectedTopic === 'coima' ? 'btn-primary bg-primary/20 text-primary' : 'btn-outline'}
                >
                  ¿Qué es una coima?
                </button>
                <button
                  onClick={() => { setSelectedTopic('recognition'); setCurrentScreen('home'); } }
                  className={selectedTopic === 'recognition' ? 'btn-primary bg-primary/20 text-primary' : 'btn-outline'}
                >
                  ¿Cómo reconocer una situación de corrupción?
                </button>
                <button
                  onClick={() => { setSelectedTopic('impact'); setCurrentScreen('home'); } }
                  className={selectedTopic === 'impact' ? 'btn-primary bg-primary/20 text-primary' : 'btn-outline'}
                >
                  ¿Por qué las coimas hacen daño?
                </button>
                <button
                  onClick={() => { setCurrentScreen('games'); } }
                  className={selectedTopic === 'test' ? 'btn-primary bg-primary/20 text-primary' : 'btn-outline'}
                >
                  Quiero ponerme a prueba.
                </button>
              </div>
            </div>

            <div className="mt-8 p-4 bg-white rounded-lg">
              <p className="text-sm">Barra de progreso general</p>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
                <div 
                  className="h-full bg-primary rounded-full transition-width"
                  style={{ width: `${(progress.completedActivities / progress.totalActivities || 0) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {progress.completedActivities} de {progress.totalActivities} actividades completadas
              </p>
            </div>
          </div>
        </div>
      )

    case 'home':
      return (
        <div className="min-h-screen bg-light text-dark p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">¡Hola! 👋</h1>
              <button onClick={() => setCurrentScreen('profile')} className="text-primary text-sm">Perfil</button>
            </div>
            
            <p className="text-base">Hoy podemos aprender algo nuevo.</p>

            <div className="mt-6 bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-primary">Tema de hoy:</h2>
                  <p className="text-gray-600 mt-1">¿Qué es una coima?</p>
                </div>
                <button
                  onClick={() => setCurrentScreen('learn')}
                  className="btn-primary py-2 px-4 rounded text-sm"
                >
                  Aprender ahora
                </button>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium">Tu progreso</h3>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
                  <div 
                    className="h-full bg-primary rounded-full transition-width"
                    style={{ width: `${(progress.completedActivities / Math.max(progress.totalActivities, 1) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {progress.completedActivities} de {progress.totalActivities} actividades completadas
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-medium mt-4">Actividad familiar</h3>
              <p className="text-gray-600 text-sm mb-3">
                Habla con tu hijo/a sobre una situación en la que alguien podría intentar conseguir algo de manera injusta.
              </p>
              <button
                onClick={() => setCurrentScreen('converse')}
                className="btn-primary w-full py-2 px-4 rounded text-sm mt-3"
              >
                Conversar
              </button>
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
        },
        recognition: {
          title: '¿Cómo reconocer una situación de corrupción?',
          explanation: 'Aprende a identificar cuándo alguien está pidiendo un beneficio a cambio de algo injusto.',
          example: 'Un funcionario pide dinero para acelerar un trámite.',
          correct: 'Situación de corrupción',
          incorrect: 'Situación normal',
        },
        impact: {
          title: '¿Por qué las coimas hacen daño?',
          explanation: 'Las coimas afectan a toda la sociedad al desviar recursos de lo que realmente importa.',
          example: 'El dinero de una coima podría haber sido usado para escuelas o hospitales.',
          correct: 'Daño a la sociedad',
          incorrect: 'Sin consecuencias',
        },
        test: {
          title: 'Pon a prueba tus conocimientos',
          explanation: 'Responde estas preguntas para verificar lo que aprendiste.',
          example: '',
          correct: '',
          incorrect: '',
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
            <div className="max-w-2xl mx-auto">
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
                      updateProgress(isCorrect ? 15 : 5, 1)
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
                      updateProgress(isCorrect ? 15 : 5, 1)
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
          <div className="max-w-2xl mx-auto">
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
                    className={progress.points > 0 ? 'btn-outline' : 'btn-primary w-48 py-2 px-4 rounded'}
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
        <div className="min-h-screen bg-light text-dark p-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-primary">¿Qué harías?</h1>
              <button onClick={() => navigateTo('home')} className="text-gray-500 hover:text-primary">
                ← Atrás
              </button>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
              <p className="text-gray-700 mb-4">{quizCases[currentQuestionIndex].situation}</p>
              
              {quizCases[currentQuestionIndex].options.map((opt, _i) => (
                <div key={opt.id} className="mb-2">
                  <button
                    onClick={() => handleAnswer(opt.id)}
                    className="btn-outline w-full py-3 px-4 rounded text-left"
                  >
                    {opt.text}
                  </button>
                </div>
              ))}
            </div>

            {showFeedback && (
              <div className="mt-6 p-4 rounded-lg">
                <p className="font-medium {feedbackMessage.includes('Correcto') ? 'text-primary' : 'text-alert'}">
                  {feedbackMessage}
                </p>
              </div>
            )}

            {!showFeedback && currentQuestionIndex < quizCases.length - 1 && (
              <button
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                className="btn-primary w-full py-3 px-6 rounded-lg text-lg mt-4"
              >
                Siguiente caso
              </button>
            )}

            {showFeedback && currentQuestionIndex >= quizCases.length - 1 && showFeedback && (
              <button
                onClick={() => continueAfterFeedback()}
                className="btn-primary w-full py-3 px-6 rounded-lg text-lg mt-4"
              >
                Terminar quiz
              </button>
            )}
          </div>
        </div>
      )

    case 'result':
      return (
        <div className="min-h-screen bg-light text-dark p-4">
          <div className="max-w-2xl mx-auto text-center">
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
          <div className="max-w-2xl mx-auto">
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
              <p className="font-medium">Puntuación: {progress.points} ⭐</p>
              <p className="text-xs">Sistema de puntos para motivar el aprendizaje</p>
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
          <div className="max-w-2xl mx-auto">
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
          <div className="max-w-2xl mx-auto">
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
          <div className="max-w-3xl mx-auto">
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
        <div className="min-h-screen bg-light text-dark p-4">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path className="w-10 h-10" strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 014 4v3a4 4 0 01-4 4V3a4 4 0 01-4-4zM5 7a2 2 0 012-2h4a2 2 0 012 2v3a2 2 0 01-2h4a2 2 0 01-2v-3zM8 21a4 4 0 01-4-4v-3a4 4 0 014-4h6a4 4 0 014 4v3a4 4 0 01-4 4zm8-13a4 4 0 01-4-4V7a4 4 0 014-4h3a4 4 0 014 4v3a4 4 0 01-4 4h-3z"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-primary">Familia</h2>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-500 text-sm mb-2">Progreso</h3>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-width"
                    style={{ width: `${progress.points / 100 * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">{progress.level}</p>
                <p className="text-xs text-gray-600">60% completado</p>
              </div>

              <div>
                <h3 className="font-medium text-gray-500 text-sm mb-2">Actividades</h3>
                <p className="text-gray-600">{progress.completedActivities} completadas</p>
                <p className="text-gray-600">de {progress.totalActivities}</p>
              </div>

              <div>
                <h3 className="font-medium text-gray-500 text-sm mb-2">Conversaciones</h3>
                <p className="text-gray-600">{progress.conversations} realizadas</p>
              </div>

              <div>
                <h3 className="font-medium text-gray-500 text-sm mb-2">Puntos</h3>
                <p className="text-2xl font-bold text-primary">{progress.points} ⭐</p>
              </div>
            </div>

            <div className="mt-8 p-4 bg-white rounded-lg">
              <h3 className="font-medium text-gray-500 text-sm mb-3">Mi progreso</h3>
              <p className="text-gray-600 text-sm">
                Llevas {progress.completedActivities} de {progress.totalActivities} actividades completadas
              </p>
              <p className="text-gray-600 text-sm">
                {progress.conversations} conversaciones familiares realizadas
              </p>
              <p className="text-gray-600 text-sm">
                {progress.points} puntos acumulados
              </p>
            </div>

            <div className="mt-6">
              <button onClick={() => setCurrentScreen('home')} className="btn-outline w-full py-3 px-4 rounded text-sm">
                Volver al inicio
              </button>
            </div>
          </div>
        </div>
      )

    case 'content-for-parents':
      return (
        <div className="min-h-screen bg-light text-dark p-4">
          <div className="max-w-2xl mx-auto">
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