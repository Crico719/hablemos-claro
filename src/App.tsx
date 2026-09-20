import { useState, useEffect } from 'react'
import './index.css'

// Tipos para la aplicación
type UserRole = 'parent' | 'child'
type LearningTopic = 'coima' | 'recognition' | 'impact' | 'consequences' | 'prevention' | 'test'
type BadgeType = 'topics-explorer' | 'game-master' | 'integrity-champion'
type DeviceType = 'pc' | 'phone' | 'laptop'
type ProfileType = 'student' | 'family'

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
  topicProgress: Record<LearningTopic, number>
  quizScores: number[]
  lastActiveDate: string
  streakDays: number
}

interface StudentProfile {
  name: string
  age: string
  district: string
  photo: string
  progress: UserProgress
  customization: ProfileCustomization
}

interface FamilyProfile {
  name: string
  members: string[]
  progress: UserProgress
}

interface ProfileCustomization {
  themeColor: string
  backgroundType: 'gradient' | 'pattern' | 'solid'
  backgroundValue: string
  cardStyle: 'glass' | 'solid' | 'outlined'
  decorations: string[]
}

interface ConversationPrompt {
  id: string
  question: string
  asked: boolean
}

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

const backgrounds: Array<{ name: string; type: 'gradient' | 'pattern' | 'solid'; value: string }> = [
  { name: 'Enfoque Azul', type: 'gradient', value: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%)' },
  { name: 'Enfoque Verde', type: 'gradient', value: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #10b981 100%)' },
  { name: 'Enfoque Neutro', type: 'gradient', value: 'linear-gradient(135deg, #374151 0%, #4b5563 50%, #6b7280 100%)' },
  { name: 'Enfoque Suave', type: 'gradient', value: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)' },
  { name: 'Zen Claro', type: 'solid', value: '#f1f5f9' },
  { name: 'Zen Oscuro', type: 'solid', value: '#1e293b' },
  { name: 'Papel', type: 'solid', value: '#fefce8' },
  { name: 'Menta', type: 'solid', value: '#f0fdf4' },
  { name: 'Lavanda', type: 'solid', value: '#faf5ff' },
]

const translations = {
  es: {
    greeting: '¡Hola! 👋',
    welcomeLine: 'Hoy podemos aprender algo nuevo juntos.',
    welcomeTitle: 'Hablemos Claro',
    welcomeSub: 'Aprender sobre las coimas también es aprender a tomar buenas decisiones.',
    start: '🎮 Empecemos',
    howItWorks: '¿Cómo funciona la app?',
    badges: '🏅 Tus insignias',
    themes: 'Temas',
    themesDesc: 'Aprende sobre las coimas',
    game: 'Juego',
    gameDesc: 'Pon a prueba lo que sabes',
    reels: 'Reels',
    reelsDesc: 'Mensajes de integridad',
    profile: 'Perfil',
    profileDesc: 'Tu progreso e insignias',
    familyActivity: '💬 Actividad familiar',
    familyDesc: 'Habla con tu hijo/a sobre una situación en la que alguien podría intentar conseguir algo de manera injusta.',
    converse: 'Conversar →',
    back: '← Atrás',
    continue: 'Continuar',
    profileTitle: 'Tu perfil',
    profileSub: 'Tu progreso de aprendizaje',
    myBadges: '🎯 Tus Insignias',
    status: 'Estado',
    champion: '🏆 Campeón',
    inProgress: 'En progreso',
    activities: 'Actividades',
    conversations: 'Conversaciones',
    generalProgress: 'Progreso General',
    aboutTitle: '¿Cómo funciona?',
    aboutSub: 'Todo lo que necesitas saber antes de empezar.',
    configTitle: 'Configuración',
    yourData: '📝 Tus datos',
    name: 'Nombre',
    age: 'Edad',
    district: 'Distrito del Perú',
    roleQuestion: '¿Quién está usando la app?',
    parent: 'Padre / Madre',
    child: 'Hijo / Hija',
    deviceQuestion: '¿Qué dispositivo estás usando?',
    deviceSub: 'Elige cómo quieres ver la app',
    darkModeTitle: '🌙 Modo de color',
    light: '☀️ Claro',
    dark: '🌙 Oscuro',
    languageTitle: '🗣️ Idioma',
    spanish: '🇪🇸 Español',
    quechua: '🦙 Quechua',
    whichTopic: '¿Qué quieres aprender hoy?',
    goHome: 'Ir a la pantalla principal',
    whatIsCoima: '¿Qué es una coima?',
    recognize: '¿Cómo reconocer una situación de corrupción?',
    impact: '¿Por qué las coimas hacen daño?',
    legal: 'Consecuencias legales',
    prevent: 'Cómo prevenir la corrupción',
    wantTest: 'Quiero ponerme a prueba.',
    ageYears: 'años',
    // Profile types
    studentProfile: '👤 Perfil Estudiante',
    familyProfile: '👨‍👩‍👧 Perfil Familia',
    chooseProfile: '¿Quién usa la app?',
    editPhoto: 'Editar foto',
    choosePhoto: 'Elegir foto',
    takePhoto: 'Tomar foto',
    customization: '🎨 Personalizar mi app',
    themeColors: 'Colores del tema',
    backgrounds: 'Fondos',
    cardStyles: 'Estilo de tarjetas',
    decorations: 'Decoraciones',
    preview: 'Vista previa',
    resetCustomization: 'Restablecer',
    noBadgesYet: 'Aún no tienes insignias',
    yourStats: 'Tus estadísticas',
    topicsCompleted: 'Temas completados',
    avgQuizScore: 'Promedio en quizzes',
    activitiesDone: 'Actividades realizadas',
    timeSpent: 'Tiempo invertido',
    streak: 'Racha de días',
    topicProgress: 'Progreso por tema',
  },
  qu: {
    greeting: '¡Napaykullayki! 👋',
    welcomeLine: 'Kunanqa musuq imatapas yachaykushwan.',
    welcomeTitle: 'Hablemos Claro',
    welcomeSub: 'Coimamanta yachayqa, allin ruwaykunamanta yachaymi.',
    start: '🎮 Qallariy Aventura',
    howItWorks: '¿Imaynatam ruwan?',
    badges: '🏅 Insigniykikuna',
    themes: 'Yachaykuna',
    themesDesc: 'Coimakunamanta yachay',
    game: 'Pukllay',
    gameDesc: 'Yachasqaykita kamachiy',
    reels: 'Reels',
    reelsDesc: 'Allin kawsay willakuykuna',
    profile: 'Kaynin',
    profileDesc: 'Progresoyki, insigniykikuna',
    familyActivity: '💬 Ayllu ruway',
    familyDesc: 'Wawaykiwan rimariy, imaynatam mana allin hapinakuyta mana allin harkaymanta.',
    converse: 'Rimay →',
    back: '← Kutiy',
    continue: 'Katichiy',
    profileTitle: 'Kayniykikuna',
    profileSub: 'Yachay ñanniyki',
    myBadges: '🎯 Insigniykikuna',
    status: 'Kaynin',
    champion: '🏆 Atipaq',
    inProgress: 'Kunan ruwakuchkan',
    activities: 'Ruwaykuna',
    conversations: 'Rimaykuna',
    generalProgress: 'Wiñay Progreso',
    aboutTitle: '¿Imaynatam ruwan?',
    aboutSub: 'Qallarinaykipaq tukuynintam riqsi.',
    configTitle: 'Kamachiykuna',
    yourData: '📝 Kayniykikuna',
    name: 'Suti',
    age: 'Watakuna',
    district: 'Piruw distrito',
    roleQuestion: '¿Pitaq kayta llamkachkan?',
    parent: 'Tayta / Mama',
    child: 'Wawa',
    deviceQuestion: '¿Imaykanatam llamkachkanki?',
    deviceSub: 'Aqllay imaynatam kayta rikuchiy',
    darkModeTitle: '🌙 Llimpikuna',
    light: "☀️ K'anchaq",
    dark: '🌙 Tutayay',
    languageTitle: '🗣️ Simi',
    spanish: '🇪🇸 Castellano',
    quechua: '🦙 Runa Simi',
    whichTopic: '¿Imatam kunan yachayta munanki?',
    goHome: 'Wasiman kutiy',
    whatIsCoima: '¿Imam coima?',
    recognize: '¿Imaynatam riqsin manam allin kaqta?',
    impact: '¿Imaraykum coimakuna dañan?',
    legal: 'Kamachiy harkaykuna',
    prevent: 'Imaynatam harkayman coimata',
    wantTest: 'Kunanmi yachayta munani.',
    ageYears: 'wata',
    // Profile types
    studentProfile: '👤 Kayni Wawa',
    familyProfile: '👨‍👩‍👧 Kayni Ayllu',
    chooseProfile: '¿Pitaq kayta llamkachkan?',
    editPhoto: 'Riqchiy rikin',
    choosePhoto: 'Aqllay rikin',
    takePhoto: 'Riqsiy rikin',
    customization: '🎨 Kaynin ñiqqiy',
    themeColors: 'Llimpi kullkikuna',
    backgrounds: 'Ukukuna',
    cardStyles: 'Tarjeta kullkikuna',
    decorations: 'Willakuykuna',
    preview: 'Rikchiy',
    resetCustomization: 'Kunanta qaykuy',
    noBadgesYet: 'Manam insigniykikichu kanqanchik',
    yourStats: 'Estadístikaykikik',
    topicsCompleted: 'Yachaykuna yuraykukuna',
    avgQuizScore: 'Quiz promedio',
    activitiesDone: 'Ruwaykuna yuraykukuna',
    timeSpent: 'Hora qawaykuy',
    streak: 'Punchaw qallariy',
    topicProgress: 'Yachay ñanni',
  },
}

const defaultCustomization: ProfileCustomization = {
  themeColor: '#2563EB',
  backgroundType: 'gradient',
  backgroundValue: 'linear-gradient(135deg, #2563EB, #7C3AED)',
  cardStyle: 'glass',
  decorations: [],
}

const defaultStudentProgress: UserProgress = {
  totalActivities: 0,
  completedActivities: 0,
  badges: [...allBadges],
  conversations: 0,
  topicProgress: {
    coima: 0,
    recognition: 0,
    impact: 0,
    consequences: 0,
    prevention: 0,
    test: 0,
  },
  quizScores: [],
  lastActiveDate: '',
  streakDays: 0,
}

const getStoredStudentProfile = (): StudentProfile => {
  const stored = localStorage.getItem('hablemos-claro-student-profile')
  if (stored) return JSON.parse(stored)
  return {
    name: '',
    age: '',
    district: '',
    photo: '',
    progress: defaultStudentProgress,
    customization: defaultCustomization,
  }
}

const getStoredFamilyProfile = (): FamilyProfile => {
  const stored = localStorage.getItem('hablemos-claro-family-profile')
  if (stored) return JSON.parse(stored)
  return {
    name: '',
    members: [],
    progress: defaultStudentProgress,
  }
}

const saveStudentProfile = (profile: StudentProfile) => {
  localStorage.setItem('hablemos-claro-student-profile', JSON.stringify(profile))
}

const saveFamilyProfile = (profile: FamilyProfile) => {
  localStorage.setItem('hablemos-claro-family-profile', JSON.stringify(profile))
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
const initialStudentProfile = getStoredStudentProfile()
const initialFamilyProfile = getStoredFamilyProfile()

export default function App() {
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(initialStudentProfile)
  const [familyProfile, setFamilyProfile] = useState<FamilyProfile>(initialFamilyProfile)
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'about' | 'avatar' | 'device' | 'config' | 'home' | 'reels' | 'learn' | 'quiz' | 'result' | 'games' | 'converse' | 'activity' | 'cases' | 'profile' | 'content-for-parents' | 'profile-type'>('welcome')
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [selectedTopic] = useState<LearningTopic | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<number[]>([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState<string>('')
  const [showCoimaONo, setShowCoimaONo] = useState(false)
  const [currentCoimaCase, setCurrentCoimaCase] = useState(0)
  const [device, setDevice] = useState<DeviceType>('pc')
  const [showBadgeCelebration, setShowBadgeCelebration] = useState(false)
  const [earnedBadge, setEarnedBadge] = useState<Badge | null>(null)
  const [darkMode, setDarkMode] = useState<boolean>(() => localStorage.getItem('hablemos-claro-dark') === 'true')
  const [userName, setUserName] = useState<string>(() => localStorage.getItem('hablemos-claro-name') || '')
  const [userAge, setUserAge] = useState<string>(() => localStorage.getItem('hablemos-claro-age') || '')
  const [userDistrict, setUserDistrict] = useState<string>(() => localStorage.getItem('hablemos-claro-district') || '')
  const [language, setLanguage] = useState<'es' | 'qu'>(() => (localStorage.getItem('hablemos-claro-lang') as 'es' | 'qu') || 'es')
  const [profileType, setProfileType] = useState<ProfileType>('student')
  const [editPhotoModal, setEditPhotoModal] = useState(false)
  const [_tempPhoto, setTempPhoto] = useState<string>('')

  // Sincronizar userName/userAge/userDistrict con studentProfile
  useEffect(() => {
    setUserName(studentProfile.name)
    setUserAge(studentProfile.age)
    setUserDistrict(studentProfile.district)
  }, [studentProfile])

  useEffect(() => {
    localStorage.setItem('hablemos-claro-name', studentProfile.name)
    localStorage.setItem('hablemos-claro-age', studentProfile.age)
    localStorage.setItem('hablemos-claro-district', studentProfile.district)
  }, [studentProfile.name, studentProfile.age, studentProfile.district])

  // Traducción según idioma
  const t = (key: keyof typeof translations['es']) => translations[language][key] ?? translations['es'][key]

  // Helper to get current profile's progress
  const getProgress = () => profileType === 'student' ? studentProfile.progress : familyProfile.progress
  const getBadges = () => profileType === 'student' ? studentProfile.progress.badges : familyProfile.progress.badges
  const getCustomization = () => profileType === 'student' ? studentProfile.customization : defaultCustomization

  // Guardar datos personales
  const saveUserData = () => {
    const updatedStudent = { ...studentProfile, name: userName, age: userAge, district: userDistrict }
    setStudentProfile(updatedStudent)
    saveStudentProfile(updatedStudent)
  }

  // Cambiar modo claro/oscuro
  const changeDarkMode = (value: boolean) => {
    setDarkMode(value)
    localStorage.setItem('hablemos-claro-dark', String(value))
  }

  // Cambiar idioma
  const changeLanguage = (value: 'es' | 'qu') => {
    setLanguage(value)
    localStorage.setItem('hablemos-claro-lang', value)
  }

  // Ir al inicio marcando la app como configurada
  const goHome = () => {
    localStorage.setItem('hablemos-claro-configured', 'true')
    setCurrentScreen('home')
  }

  // Navegar a siguiente pantalla
  const navigateTo = (screen: typeof currentScreen) => {
    setCurrentScreen(screen)
  }

  // Actualizar progreso y verificar insignias
  const updateProgress = (activitiesIncrement: number = 1) => {
    const currentProfile = profileType === 'student' ? studentProfile : familyProfile
    const newProgress = { ...currentProfile.progress }
    newProgress.completedActivities += activitiesIncrement
    newProgress.totalActivities = Math.max(newProgress.totalActivities, newProgress.completedActivities)
    
    const newBadges = [...newProgress.badges]
    let newBadgeToShow: Badge | null = null

    const isExplorer = newBadges.find(b => b.id === 'topics-explorer')!
    if (!isExplorer.unlocked && newProgress.completedActivities >= 1) {
      isExplorer.unlocked = true
      newBadgeToShow = { ...isExplorer }
    }

    const isMaster = newBadges.find(b => b.id === 'game-master')!
    if (!isMaster.unlocked && newProgress.completedActivities >= 5) {
      isMaster.unlocked = true
      newBadgeToShow = { ...isMaster }
    }

    const isChampion = newBadges.find(b => b.id === 'integrity-champion')!
    if (!isChampion.unlocked && isExplorer.unlocked && isMaster.unlocked) {
      isChampion.unlocked = true
      newBadgeToShow = { ...isChampion }
    }

    newProgress.badges = newBadges
    
    if (profileType === 'student') {
      setStudentProfile({ ...studentProfile, progress: newProgress })
      saveStudentProfile({ ...studentProfile, progress: newProgress })
    } else {
      setFamilyProfile({ ...familyProfile, progress: newProgress })
      saveFamilyProfile({ ...familyProfile, progress: newProgress })
    }
    
    if (newBadgeToShow) {
      setEarnedBadge(newBadgeToShow)
      setShowBadgeCelebration(true)
    }
  }

  const completeConversation = () => {
    const currentProfile = profileType === 'student' ? studentProfile : familyProfile
    const newProgress = { ...currentProfile.progress, conversations: currentProfile.progress.conversations + 1 }
    if (profileType === 'student') {
      setStudentProfile({ ...studentProfile, progress: newProgress })
      saveStudentProfile({ ...studentProfile, progress: newProgress })
    } else {
      setFamilyProfile({ ...familyProfile, progress: newProgress })
      saveFamilyProfile({ ...familyProfile, progress: newProgress })
    }
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
  // (ya definida arriba)

  // Reiniciar aplicación

  // Renderizar según pantalla
  const renderScreen = () => {
    switch (currentScreen) {
    case 'welcome':
      return (
        <div className="min-h-screen welcome-bg flex items-center justify-center p-8">
          <div className="max-w-5xl mx-auto text-center text-white animate-fade-in">
            <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">{t('welcomeTitle')}</h1>
            <p className="text-xl mb-8 opacity-90">{t('welcomeSub')}</p>
            
            <div className="space-y-4">
<button
                onClick={() => setCurrentScreen('profile-type')}
                className="btn-glow bg-white text-black font-bold py-4 px-8 rounded-full text-lg shadow-lg w-full"
              >
                {t('start')}
              </button>
              <button
                onClick={() => setCurrentScreen('about')}
                className="bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white font-bold py-4 px-8 rounded-full text-lg w-full hover:bg-white/30 transition-all"
              >
                {t('howItWorks')}
              </button>
            </div>
          </div>
        </div>
      )

    case 'profile-type':
      const cust0 = getCustomization()
      return (
        <div className="min-h-screen p-8" style={{ background: cust0.backgroundValue, backgroundSize: cust0.backgroundType === 'pattern' ? '50px 50px' : 'cover' }}>
          <div className="max-w-3xl mx-auto animate-slide-up text-center">
            <h1 className="text-3xl font-bold gradient-text mb-2">{t('chooseProfile')}</h1>
            <p className="text-gray-500 mb-8">{t('welcomeSub')}</p>
            
            <div className="grid grid-cols-2 gap-6 mb-10">
              <button
                onClick={() => {
                  setProfileType('student')
                  setCurrentScreen('avatar')
                }}
                className="glass-card rounded-2xl p-8 card-hover shadow-custom-lg border-2 border-primary/20"
              >
                <div className="text-6xl mb-4">👤</div>
                <h3 className="text-xl font-bold text-primary mb-2">{t('studentProfile')}</h3>
                <p className="text-gray-600 text-sm">Tu perfil personal con insignias, progreso y personalización</p>
              </button>
              <button
                onClick={() => {
                  setProfileType('family')
                  setCurrentScreen('avatar')
                }}
                className="glass-card rounded-2xl p-8 card-hover shadow-custom-lg border-2 border-secondary/20"
              >
                <div className="text-6xl mb-4">👨‍👩‍👧</div>
                <h3 className="text-xl font-bold text-secondary mb-2">{t('familyProfile')}</h3>
                <p className="text-gray-600 text-sm">Perfil familiar compartido con actividades en conjunto</p>
              </button>
            </div>
            
            <button
              onClick={() => setCurrentScreen('welcome')}
              className="glass-card px-4 py-2 rounded-xl text-gray-600 text-sm hover:bg-gray-100 transition-all"
            >
              {t('back')}
            </button>
          </div>
        </div>
      )

case 'about':
      const cust2 = getCustomization();
      return (
        <div className="min-h-screen p-8" style={{ background: cust2.backgroundValue, backgroundSize: cust2.backgroundType === 'pattern' ? '50px 50px' : 'cover' }}>
          <div className="max-w-3xl mx-auto animate-slide-up text-center relative">
            <button onClick={() => setCurrentScreen('welcome')} className="absolute top-0 right-0 glass-card px-3 py-1 rounded-xl text-gray-600 text-sm hover:bg-gray-100 transition-all">
              {t('back')}
            </button>
            <h1 className="text-3xl font-bold gradient-text">{t('aboutTitle')}</h1>
            <p className="text-gray-500 mb-12">{t('aboutSub')}</p>

            <div className="glass-card rounded-3xl p-8 mb-10 card-hover shadow-custom-lg text-center">
              <div className="flex items-center justify-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center text-3xl">🔎</div>
                <h2 className="text-2xl font-bold text-primary">¿De qué trata la app?</h2>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg">
                <strong>Hablemos Claro</strong> es una aplicación educativa para que las familias aprendan a conversar sobre las <strong>coimas (sobornos)</strong> y la corrupción.
              </p>
              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="rounded-2xl bg-primary/5 p-5 border border-primary/10 text-center">
                  <div className="text-3xl mb-2">📚</div>
                  <p className="font-bold text-primary mb-1">Temas</p>
                  <p className="text-sm text-gray-600 leading-relaxed">Explica qué es una coima, cómo reconocerla, por qué hace daño y cómo prevenirla.</p>
                </div>
                <div className="rounded-2xl bg-secondary/5 p-5 border border-secondary/10 text-center">
                  <div className="text-3xl mb-2">🎮</div>
                  <p className="font-bold text-secondary mb-1">Juego</p>
                  <p className="text-sm text-gray-600 leading-relaxed">Actividades para aplicar lo aprendido.</p>
                </div>
                <div className="rounded-2xl bg-warning/5 p-5 border border-warning/10 text-center">
                  <div className="text-3xl mb-2">📱</div>
                  <p className="font-bold text-warning mb-1">Reels</p>
                  <p className="text-sm text-gray-600 leading-relaxed">Mensajes cortos que refuerzan la integridad.</p>
                </div>
                <div className="rounded-2xl bg-success/5 p-5 border border-success/10 text-center">
                  <div className="text-3xl mb-2">💬</div>
                  <p className="font-bold text-success mb-1">Conversaciones</p>
                  <p className="text-sm text-gray-600 leading-relaxed">Preguntas para dialogar en familia.</p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-8 mb-10 card-hover shadow-custom-lg text-center">
              <div className="flex items-center justify-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-secondary/15 flex items-center justify-center text-3xl">👨‍👩‍👧‍👦</div>
                <h2 className="text-2xl font-bold text-secondary">¿A quién está dirigida?</h2>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg">
                Está pensada para <strong>padres, madres, hijos e hijas</strong> de todas las edades, para que aprendan juntos en casa. También sirve a jóvenes y docentes interesados en entender la corrupción y promover valores como la honestidad y la transparencia.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mt-8">
                <span className="px-4 py-2 rounded-full bg-primary/10 text-primary font-bold">👨‍👩‍👧 Familias</span>
                <span className="px-4 py-2 rounded-full bg-secondary/10 text-secondary font-bold">🧑‍🎓 Jóvenes</span>
                <span className="px-4 py-2 rounded-full bg-warning/10 text-warning font-bold">📚 Docentes</span>
                <span className="px-4 py-2 rounded-full bg-success/10 text-success font-bold">💡 Todos en casa</span>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-8 mb-12 card-hover shadow-custom-lg text-center">
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-warning/15 flex items-center justify-center text-3xl">🛠️</div>
                <h2 className="text-2xl font-bold text-warning">¿Cómo usar la app?</h2>
              </div>
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0 text-xl">1</div>
                  <div className="text-center">
                    <p className="font-bold text-dark text-lg leading-tight">Crea tu avatar</p>
                    <p className="text-gray-600 mt-1">Elige tu personaje favorito para personalizar tu perfil.</p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-secondary text-white flex items-center justify-center font-bold shrink-0 text-xl">2</div>
                  <div className="text-center">
                    <p className="font-bold text-dark text-lg leading-tight">Elige el modo</p>
                    <p className="text-gray-600 mt-1">Individual 👤 o con familia 👨‍👩‍👧‍👦.</p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-warning text-white flex items-center justify-center font-bold shrink-0 text-xl">3</div>
                  <div className="text-center">
                    <p className="font-bold text-dark text-lg leading-tight">Configura la app</p>
                    <p className="text-gray-600 mt-1">Tu rol (padre/hijo), tu dispositivo (PC, móvil o laptop) y el tema del día.</p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-success text-white flex items-center justify-center font-bold shrink-0 text-xl">4</div>
                  <div className="text-center">
                    <p className="font-bold text-dark text-lg leading-tight">Explora los Temas</p>
                    <p className="text-gray-600 mt-1">Desde la pantalla de inicio.</p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0 text-xl">5</div>
                  <div className="text-center">
                    <p className="font-bold text-dark text-lg leading-tight">Juega y desbloquea las 3 insignias</p>
                    <p className="text-gray-600 mt-1">🏅 Consíguelas todas desde tu perfil.</p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-secondary text-white flex items-center justify-center font-bold shrink-0 text-xl">6</div>
                  <div className="text-center">
                    <p className="font-bold text-dark text-lg leading-tight">Mira los Reels</p>
                    <p className="text-gray-600 mt-1">Para reforzar lo aprendido.</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setCurrentScreen('avatar')}
              className="btn-glow bg-primary text-white font-bold py-4 px-6 rounded-xl text-lg w-full"
            >
              ¡Empezar aventura! 🎮
            </button>
          </div>
        </div>
      )

    case 'device':
      const cust3 = getCustomization();
      return (
        <div className="min-h-screen p-8" style={{ background: cust3.backgroundValue, backgroundSize: cust3.backgroundType === 'pattern' ? '50px 50px' : 'cover' }}>
          <div className="max-w-3xl mx-auto animate-slide-up text-center">
            <div className="flex items-center justify-between mb-2">
              <button onClick={() => setCurrentScreen('welcome')} className="glass-card px-3 py-1 rounded-xl text-gray-600 text-sm hover:bg-gray-100 transition-all">
                {t('back')}
              </button>
              <span className="text-xs text-gray-400 font-medium">1 / 2</span>
            </div>
            <h1 className="text-3xl font-bold gradient-text mb-2 mt-4">{t('deviceQuestion')}</h1>
            <p className="text-gray-500 mb-8">{t('deviceSub')}</p>

            <div className="grid grid-cols-3 gap-8 mb-12">
              <button
                onClick={() => setDevice('pc')}
                className={`glass-card rounded-2xl p-8 card-hover shadow-custom-lg ${device === 'pc' ? 'ring-4 ring-primary' : ''}`}
              >
                <div className="text-6xl mb-4 animate-float">🖥️</div>
                <div className="font-bold text-dark text-xl mb-2">PC</div>
                <p className="text-sm text-gray-500">Pantalla completa</p>
              </button>
              <button
                onClick={() => setDevice('phone')}
                className={`glass-card rounded-2xl p-8 card-hover shadow-custom-lg ${device === 'phone' ? 'ring-4 ring-secondary' : ''}`}
              >
                <div className="text-6xl mb-4 animate-float">📱</div>
                <div className="font-bold text-dark text-xl mb-2">Móvil</div>
                <p className="text-sm text-gray-500">Formato celular</p>
              </button>
              <button
                onClick={() => setDevice('laptop')}
                className={`glass-card rounded-2xl p-8 card-hover shadow-custom-lg ${device === 'laptop' ? 'ring-4 ring-warning' : ''}`}
              >
                <div className="text-6xl mb-4 animate-float">💻</div>
                <div className="font-bold text-dark text-xl mb-2">Laptop</div>
                <p className="text-sm text-gray-500">Formato portátil</p>
              </button>
            </div>

            <button
              onClick={goHome}
              className="btn-glow bg-primary text-white font-bold py-5 px-8 rounded-xl text-xl w-full mt-10"
            >
              {t('continue')} →
            </button>
          </div>
        </div>
      )

    case 'config':
      const cust4 = getCustomization();
      return (
        <div className="min-h-screen p-8" style={{ background: cust4.backgroundValue, backgroundSize: cust4.backgroundType === 'pattern' ? '50px 50px' : 'cover' }}>
          <div className="max-w-4xl mx-auto animate-slide-up">
            <h2 className="text-3xl font-bold gradient-text mb-10 text-center">{t('configTitle')}</h2>
            
            <div className="space-y-8">
              <div className="glass-card rounded-2xl p-8 mb-6">
                <h3 className="font-bold text-xl mb-6 text-center">{t('yourData')}</h3>
                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-dark mb-2 block">{t('name')}</label>
                    <input
                      type="text"
                      value={userName}
                      onChange={e => setUserName(e.target.value)}
                      onBlur={saveUserData}
                      placeholder={t('name')}
                      className="mt-1 w-full px-5 py-4 rounded-xl border border-gray-200 bg-white text-dark focus:outline-none focus:ring-2 focus:ring-primary font-medium text-lg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-medium text-dark mb-2 block">{t('age')}</label>
                      <input
                        type="number"
                        min="0"
                        max="120"
                        value={userAge}
                        onChange={e => setUserAge(e.target.value)}
                        onBlur={saveUserData}
                        placeholder={t('age')}
                        className="mt-1 w-full px-5 py-4 rounded-xl border border-gray-200 bg-white text-dark focus:outline-none focus:ring-2 focus:ring-primary font-medium text-lg"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-dark mb-2 block">{t('district')}</label>
                      <input
                        type="text"
                        value={userDistrict}
                        onChange={e => setUserDistrict(e.target.value)}
                        onBlur={saveUserData}
                        placeholder={t('district')}
                        className="mt-1 w-full px-5 py-4 rounded-xl border border-gray-200 bg-white text-dark focus:outline-none focus:ring-2 focus:ring-primary font-medium text-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-dark font-medium text-center text-lg">{t('roleQuestion')}</p>
              <div className="grid grid-cols-2 gap-5 mt-3">
                <button
                  onClick={() => setSelectedRole('parent')}
                  className={selectedRole === 'parent' ? 'bg-primary text-white font-bold py-5 px-6 rounded-xl shadow-lg text-lg' : 'glass-card font-bold py-5 px-6 rounded-xl text-dark hover:bg-primary/20 transition-all text-lg'}
                >
                  {t('parent')}
                </button>
                <button
                  onClick={() => setSelectedRole('child')}
                  className={selectedRole === 'child' ? 'bg-secondary text-white font-bold py-5 px-6 rounded-xl shadow-lg text-lg' : 'glass-card font-bold py-5 px-6 rounded-xl text-dark hover:bg-secondary/20 transition-all text-lg'}
                >
                  {t('child')}
                </button>
              </div>

              <p className="text-dark font-medium text-center text-lg mt-10">{t('deviceQuestion')}</p>
              <div className="grid grid-cols-3 gap-5 mt-3">
                <button
                  onClick={() => setDevice('pc')}
                  className={device === 'pc' ? 'bg-primary text-white font-bold py-3 px-4 rounded-xl shadow-lg' : 'glass-card font-bold py-3 px-4 rounded-xl text-dark hover:bg-primary/20 transition-all'}
                >
                  🖥️ PC
                </button>
                <button
                  onClick={() => setDevice('phone')}
                  className={device === 'phone' ? 'bg-secondary text-white font-bold py-5 px-6 rounded-xl shadow-lg text-lg' : 'glass-card font-bold py-5 px-6 rounded-xl text-dark hover:bg-secondary/20 transition-all text-lg'}
                >
                  📱 Móvil
                </button>
                <button
                  onClick={() => setDevice('laptop')}
                  className={device === 'laptop' ? 'bg-warning text-white font-bold py-5 px-6 rounded-xl shadow-lg text-lg' : 'glass-card font-bold py-5 px-6 rounded-xl text-dark hover:bg-warning/20 transition-all text-lg'}
                >
                  💻 Laptop
                </button>
              </div>

              <p className="text-dark font-medium text-center text-lg mt-10">{t('darkModeTitle')}</p>
              <div className="grid grid-cols-2 gap-5 mt-3">
                <button
                  onClick={() => changeDarkMode(false)}
                  className={!darkMode ? 'bg-primary text-white font-bold py-5 px-6 rounded-xl shadow-lg text-lg' : 'glass-card font-bold py-5 px-6 rounded-xl text-dark hover:bg-primary/20 transition-all text-lg'}
                >
                  {t('light')}
                </button>
                <button
                  onClick={() => changeDarkMode(true)}
                  className={darkMode ? 'bg-secondary text-white font-bold py-5 px-6 rounded-xl shadow-lg text-lg' : 'glass-card font-bold py-5 px-6 rounded-xl text-dark hover:bg-secondary/20 transition-all text-lg'}
                >
                  {t('dark')}
                </button>
              </div>

              <p className="text-dark font-medium text-center text-lg mt-10">{t('languageTitle')}</p>
              <div className="grid grid-cols-2 gap-5 mt-3">
                <button
                  onClick={() => changeLanguage('es')}
                  className={language === 'es' ? 'bg-primary text-white font-bold py-5 px-6 rounded-xl shadow-lg text-lg' : 'glass-card font-bold py-5 px-6 rounded-xl text-dark hover:bg-primary/20 transition-all text-lg'}
                >
                  {t('spanish')}
                </button>
                <button
                  onClick={() => changeLanguage('qu')}
                  className={language === 'qu' ? 'bg-secondary text-white font-bold py-5 px-6 rounded-xl shadow-lg text-lg' : 'glass-card font-bold py-5 px-6 rounded-xl text-dark hover:bg-secondary/20 transition-all text-lg'}
                >
                  {t('quechua')}
                </button>
              </div>
</div>

              <button
                onClick={goHome}
                className="btn-glow bg-primary text-white font-bold py-5 px-8 rounded-xl text-xl w-full mt-10"
              >
                🏠 {t('goHome')}
              </button>
          </div>
        </div>
      )

    case 'home':
      const currentProgress = getProgress()
      const unlockedCount = currentProgress.badges.filter(b => b.unlocked).length
      const cust5 = getCustomization();
      return (
        <div className="min-h-screen p-8" style={{ background: cust5.backgroundValue, backgroundSize: cust5.backgroundType === 'pattern' ? '50px 50px' : 'cover' }}>
          <div className="max-w-6xl mx-auto animate-slide-up">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="glass-card px-4 py-2 rounded-xl text-primary font-bold text-lg shadow-lg">
                  🏅 {unlockedCount}/3
                </div>
                <div>
                  <h1 className="text-2xl font-bold gradient-text">{t('greeting')}</h1>
                  <p className="text-sm text-gray-500">{device === 'phone' ? '📱 Móvil' : device === 'laptop' ? '💻 Laptop' : '🖥️ PC'}</p>
                </div>
              </div>
              <button onClick={() => setCurrentScreen('config')} className="glass-card px-4 py-2 rounded-xl text-primary text-sm font-medium hover:bg-primary/10 transition-all">
                ⚙️ {t('configTitle')}
              </button>
            </div>

            <p className="text-lg text-gray-600 mb-8">{t('welcomeLine')}</p>

            {/* Progreso + insignias */}
            <div className="glass-card rounded-2xl p-8 mb-8 card-hover">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-secondary text-lg">{t('badges')}</h3>
                <span className="text-sm font-bold text-primary">{unlockedCount}/3</span>
              </div>
              <div className="flex gap-4 mb-6">
                {currentProgress.badges.map(badge => (
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
            <div className="grid grid-cols-2 gap-8 mb-12">
              <button
                onClick={() => setCurrentScreen('learn')}
                className="glass-card rounded-2xl p-8 text-left card-hover shadow-custom-lg min-h-[160px] flex flex-col justify-between"
              >
                <div>
                  <div className="text-5xl mb-4">📚</div>
                  <h3 className="font-bold text-primary text-xl mb-2">{t('themes')}</h3>
                  <p className="text-gray-500 leading-relaxed">{t('themesDesc')}</p>
                </div>
              </button>
              <button
                onClick={() => setCurrentScreen('games')}
                className="glass-card rounded-2xl p-8 text-left card-hover shadow-custom-lg min-h-[160px] flex flex-col justify-between"
              >
                <div>
                  <div className="text-5xl mb-4">🎮</div>
                  <h3 className="font-bold text-secondary text-xl mb-2">{t('game')}</h3>
                  <p className="text-gray-500 leading-relaxed">{t('gameDesc')}</p>
                </div>
              </button>
              <button
                onClick={() => setCurrentScreen('reels')}
                className="glass-card rounded-2xl p-8 text-left card-hover shadow-custom-lg min-h-[160px] flex flex-col justify-between"
              >
                <div>
                  <div className="text-5xl mb-4">📱</div>
                  <h3 className="font-bold text-warning text-xl mb-2">{t('reels')}</h3>
                  <p className="text-gray-500 leading-relaxed">{t('reelsDesc')}</p>
                </div>
              </button>
              <button
                onClick={() => setCurrentScreen('profile')}
                className="glass-card rounded-2xl p-8 text-left card-hover shadow-custom-lg min-h-[160px] flex flex-col justify-between"
              >
                <div>
                  <div className="text-5xl mb-4">👤</div>
                  <h3 className="font-bold text-success text-xl mb-2">{t('profile')}</h3>
                  <p className="text-gray-500 leading-relaxed">{t('profileDesc')}</p>
                </div>
              </button>
              <button
                onClick={() => setCurrentScreen('config')}
                className="glass-card rounded-2xl p-8 text-left card-hover shadow-custom-lg col-span-2 flex items-center justify-between min-h-[140px]"
              >
                <div className="flex items-center gap-6">
                  <div className="text-5xl">⚙️</div>
                  <div>
                    <h3 className="font-bold text-dark text-xl mb-2">{t('configTitle')}</h3>
                    <p className="text-gray-500">{t('languageTitle')} · {t('darkModeTitle')} · {t('deviceQuestion')}</p>
                  </div>
                </div>
                <span className="text-primary font-bold text-3xl">→</span>
              </button>
            </div>

            <hr className="border-gray-200 my-20" />

            <div className="glass-card rounded-2xl p-8 card-hover">
              <h3 className="font-bold text-warning text-xl mb-4">{t('familyActivity')}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {t('familyDesc')}
              </p>
              <button
                onClick={() => setCurrentScreen('converse')}
                className="btn-glow bg-warning text-white font-bold py-3 px-6 rounded-xl text-sm w-full"
              >
                {t('converse')}
              </button>
            </div>
          </div>
        </div>
      )

    case 'reels':
      const cust6 = getCustomization();
      return (
        <div className="min-h-screen p-8" style={{ background: cust6.backgroundValue, backgroundSize: cust6.backgroundType === 'pattern' ? '50px 50px' : 'cover' }}>
          <div className="max-w-5xl mx-auto animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold gradient-text">{t('reels')} 📱</h1>
                <p className="text-sm text-gray-500">{t('reelsDesc')}</p>
              </div>
              <button onClick={() => navigateTo('home')} className="glass-card px-3 py-1 rounded-xl text-gray-600 text-sm hover:bg-gray-100 transition-all">
                {t('back')}
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
          <div className="min-h-screen bg-light text-dark p-8">
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

                <div className="grid grid-cols-2 gap-8">
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
        <div className="min-h-screen bg-light text-dark p-8">
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
                    className={getProgress().completedActivities > 0 ? 'btn-outline' : 'btn-primary w-48 py-2 px-4 rounded'}
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
        <div className="min-h-screen bg-gradient-to-br from-secondary/10 via-primary/5 to-success/10 p-8">
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
      const cust8 = getCustomization();
      const resultProgress = getProgress();
      return (
        <div className="min-h-screen p-8" style={{ background: cust8.backgroundValue, backgroundSize: cust8.backgroundType === 'pattern' ? '50px 50px' : 'cover' }}>
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-primary mb-4">¡Actividad completada! 🎉</h2>
            <p className="text-3xl font-bold">{resultProgress.completedActivities}/{resultProgress.totalActivities}</p>
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
      const cust9 = getCustomization();
      return (
        <div className="min-h-screen p-8" style={{ background: cust9.backgroundValue, backgroundSize: cust9.backgroundType === 'pattern' ? '50px 50px' : 'cover' }}>
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
              <p className="font-medium">Insignias: {getBadges().filter(b => b.unlocked).length}/3 ⭐</p>
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
      const cust10 = getCustomization();
      return (
        <div className="min-h-screen p-8" style={{ background: cust10.backgroundValue, backgroundSize: cust10.backgroundType === 'pattern' ? '50px 50px' : 'cover' }}>
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
      const cust11 = getCustomization();
      return (
        <div className="min-h-screen p-8" style={{ background: cust11.backgroundValue, backgroundSize: cust11.backgroundType === 'pattern' ? '50px 50px' : 'cover' }}>
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
              
              <div className="grid grid-cols-2 gap-8">
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
        <div className="min-h-screen bg-light text-dark p-8">
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
      const currentBadges = getBadges()
      const currentUnlockedCount = currentBadges.filter(b => b.unlocked).length
      const cust13 = getCustomization();
      
      return (
        <div className="min-h-screen p-8" style={{ background: cust13.backgroundValue, backgroundSize: cust13.backgroundType === 'pattern' ? '50px 50px' : 'cover' }}>
          <div className="max-w-6xl mx-auto animate-slide-up">
            {/* Profile Type Tabs */}
            <div className="glass-card rounded-2xl p-3 mb-8 flex gap-3">
              <button
                onClick={() => setProfileType('student')}
                className={`flex-1 py-4 px-6 rounded-xl font-bold text-base transition-all ${
                  profileType === 'student' ? 'bg-primary text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {t('studentProfile')}
              </button>
              <button
                onClick={() => setProfileType('family')}
                className={`flex-1 py-4 px-6 rounded-xl font-bold text-base transition-all ${
                  profileType === 'family' ? 'bg-secondary text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {t('familyProfile')}
              </button>
            </div>

            {profileType === 'student' ? (
              // STUDENT PROFILE
              <>
                {/* Header with editable photo */}
                <div className="text-center mb-10 relative">
                  <div className="relative inline-block">
                    <div className="w-32 h-32 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-float text-7xl overflow-hidden border-4 border-white">
                      {studentProfile.photo ? (
                        <img src={studentProfile.photo} alt="Perfil" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        '👤'
                      )}
                    </div>
                    {/* Edit photo button - pencil icon */}
                    <button
                      onClick={() => {
                        setTempPhoto(studentProfile.photo)
                        setEditPhotoModal(true)
                      }}
                      className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all text-xl"
                      aria-label={t('editPhoto')}
                    >
                      ✏️
                    </button>
                  </div>
                  <h2 className="text-4xl font-bold gradient-text">{studentProfile.name || 'Estudiante'}</h2>
                  <p className="text-gray-500 mt-2 text-lg">{t('profileSub')}</p>
                  {(studentProfile.age || studentProfile.district) && (
                    <div className="flex justify-center gap-3 mt-4 flex-wrap">
                      {studentProfile.age && (
                        <span className="px-5 py-2 rounded-full bg-primary/10 text-primary text-base font-medium">
                          🎂 {studentProfile.age} {t('ageYears')}
                        </span>
                      )}
                      {studentProfile.district && (
                        <span className="px-5 py-2 rounded-full bg-secondary/10 text-secondary text-base font-medium">
                          📍 {studentProfile.district}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Stats Cards */}
                <div className="glass-card rounded-2xl p-8 shadow-custom-lg mb-8">
                  <div className="grid grid-cols-4 gap-6">
                    <div className="text-center p-5 bg-primary/5 rounded-xl">
                      <div className="text-4xl font-bold gradient-text">{currentUnlockedCount}/3</div>
                      <div className="text-base text-gray-500 mt-2">{t('myBadges')}</div>
                    </div>
                    <div className="text-center p-5 bg-secondary/5 rounded-xl">
                      <div className="text-4xl font-bold text-secondary">{getProgress().completedActivities}</div>
                      <div className="text-base text-gray-500 mt-2">{t('activities')}</div>
                    </div>
                    <div className="text-center p-5 bg-warning/5 rounded-xl">
                      <div className="text-4xl font-bold text-warning">{getProgress().conversations}</div>
                      <div className="text-base text-gray-500 mt-2">{t('conversations')}</div>
                    </div>
                    <div className="text-center p-5 bg-success/5 rounded-xl">
                      <div className="text-2xl font-bold text-primary">{getProgress().streakDays}</div>
                      <div className="text-base text-gray-500 mt-2">{t('streak')}</div>
                    </div>
                  </div>
                </div>

                {/* Badges or Stats when no badges */}
                <div className="glass-card rounded-2xl p-8 mb-8">
                  {currentUnlockedCount > 0 ? (
                    <>
                      <h3 className="font-bold text-dark mb-4">{t('myBadges')}</h3>
                      <div className="flex gap-4 justify-center">
                        {currentBadges.map(badge => (
                          <div key={badge.id} className={`text-center p-4 rounded-xl ${badge.unlocked ? '' : 'opacity-40 grayscale'}`} style={{ border: badge.unlocked ? `3px solid ${badge.color}` : '2px dashed gray' }}>
                            <div className="text-3xl">{badge.emoji}</div>
                            <div className="text-xs font-bold mt-2" style={{ color: badge.color }}>{badge.name}</div>
                            <div className="text-[10px] text-gray-500 mt-1">{badge.unlocked ? '✓ Desbloqueada' : 'Bloqueada'}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    // Stats/Graphs when no badges
                    <>
                      <h3 className="font-bold text-dark mb-4">{t('noBadgesYet')} - {t('yourStats')}</h3>
                      <div className="space-y-6">
                        {/* Progress bars per topic */}
                        <div>
                          <h4 className="font-bold text-primary mb-3">{t('topicProgress')}</h4>
                          <div className="space-y-3">
                            {Object.entries(getProgress().topicProgress).map(([topic, value]) => (
                              <div key={topic} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="capitalize">{topic}</span>
                                  <span className="font-bold text-primary">{value}%</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                                    style={{ width: `${value}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Quiz scores chart */}
                        {getProgress().quizScores.length > 0 && (
                          <div>
                            <h4 className="font-bold text-secondary mb-3">{t('avgQuizScore')}</h4>
                            <div className="h-32 flex items-end justify-around gap-2">
                              {getProgress().quizScores.slice(-6).map((score, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center">
                                  <div 
                                    className="w-full bg-gradient-to-t from-secondary to-primary rounded-t transition-all"
                                    style={{ height: `${score}%` }}
                                  ></div>
                                  <span className="text-xs text-gray-500 mt-1">Q{i + 1}</span>
                                </div>
                              ))}
                            </div>
                            <p className="text-center text-sm text-gray-500 mt-2">
                              Promedio: {Math.round(getProgress().quizScores.reduce((a, b) => a + b, 0) / getProgress().quizScores.length)}%
                            </p>
                          </div>
                        )}
                        
                        {/* Summary stats */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                          <div className="text-center p-3 bg-primary/5 rounded-xl">
                            <div className="text-2xl font-bold text-primary">{getProgress().completedActivities}</div>
                            <div className="text-xs text-gray-500">{t('activitiesDone')}</div>
                          </div>
                          <div className="text-center p-3 bg-secondary/5 rounded-xl">
                            <div className="text-2xl font-bold text-secondary">{getProgress().conversations}</div>
                            <div className="text-xs text-gray-500">{t('conversations')}</div>
                          </div>
                          <div className="text-center p-3 bg-warning/5 rounded-xl">
                            <div className="text-2xl font-bold text-warning">{getProgress().streakDays}</div>
                            <div className="text-xs text-gray-500">{t('streak')}</div>
                          </div>
                          <div className="text-center p-3 bg-success/5 rounded-xl">
                            <div className="text-2xl font-bold text-success">{Object.values(getProgress().topicProgress).filter(v => v >= 100).length}</div>
                            <div className="text-xs text-gray-500">{t('topicsCompleted')}</div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* General Progress */}
                <div className="glass-card rounded-2xl p-6 mb-6">
                  <h3 className="font-bold text-dark mb-3">{t('generalProgress')}</h3>
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="progress-bar h-full"
                      style={{ width: `${getProgress().totalActivities > 0 ? (getProgress().completedActivities / getProgress().totalActivities) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-gray-500">{getProgress().completedActivities} de {getProgress().totalActivities}</span>
                    <span className="text-sm font-bold text-primary">{getProgress().totalActivities > 0 ? Math.round((getProgress().completedActivities / getProgress().totalActivities) * 100) : 0}%</span>
                  </div>
                </div>

                {/* Customization Panel - Solo Fondos */}
                <div className="glass-card rounded-2xl p-8 mb-8">
                  <h3 className="font-bold text-dark mb-6 flex items-center gap-2">{t('customization')}</h3>
                  
                  {/* Backgrounds */}
                  <div className="mb-8">
                    <h4 className="font-medium text-gray-700 mb-4">{t('backgrounds')}</h4>
                    <div className="grid grid-cols-3 gap-5">
                      {backgrounds.map(bg => (
                        <button
                          key={bg.name}
                          onClick={() => {
                            const updated = { 
                              ...studentProfile, 
                              customization: { 
                                ...studentProfile.customization, 
                                backgroundType: bg.type,
                                backgroundValue: bg.value 
                              } 
                            }
                            setStudentProfile(updated)
                            saveStudentProfile(updated)
                          }}
                          className={`p-5 rounded-xl border-3 transition-all text-center ${
                            studentProfile.customization.backgroundType === bg.type && studentProfile.customization.backgroundValue === bg.value 
                              ? 'ring-4 ring-secondary' 
                              : 'border-transparent hover:border-gray-300'
                          }`}
                          style={{ 
                            background: bg.value,
                            backgroundSize: bg.type === 'pattern' ? '50px 50px' : 'cover'
                          }}
                        >
                          <span className="block text-sm font-medium text-gray-700 mt-3">{bg.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reset button */}
                  <button
                    onClick={() => {
                      const updated = { ...studentProfile, customization: defaultCustomization }
                      setStudentProfile(updated)
                      saveStudentProfile(updated)
                    }}
                    className="w-full py-3 px-5 rounded-xl text-base text-gray-500 hover:text-primary hover:bg-gray-100 transition-all"
                  >
                    {t('resetCustomization')}
                  </button>
                </div>

                {/* Back button */}
                <div className="mt-6">
                  <button onClick={() => setCurrentScreen('home')} className="btn-glow bg-primary text-white font-bold py-4 px-6 rounded-xl text-lg w-full">
                    ← Volver al inicio
                  </button>
                </div>
              </>
            ) : (
              // FAMILY PROFILE
              <>
                <div className="text-center mb-8">
                  <div className="w-28 h-28 bg-gradient-to-br from-secondary to-warning rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-float text-5xl">
                    👨‍👩‍👧
                  </div>
                  <h2 className="text-3xl font-bold gradient-text">{familyProfile.name || 'Familia'}</h2>
                  <p className="text-gray-500 mt-1">Perfil familiar compartido</p>
                  {familyProfile.members.length > 0 && (
                    <div className="flex justify-center gap-2 mt-3 flex-wrap">
                      {familyProfile.members.map((member, i) => (
                        <span key={i} className="px-4 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium">
                          {member}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="glass-card rounded-2xl p-6 shadow-custom-lg mb-6">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-3">
                      <div className="text-3xl font-bold gradient-text">{currentUnlockedCount}/3</div>
                      <div className="text-sm text-gray-500 mt-1">{t('myBadges')}</div>
                    </div>
                    <div className="text-center p-3">
                      <div className="text-3xl font-bold text-secondary">{getProgress().completedActivities}</div>
                      <div className="text-sm text-gray-500 mt-1">{t('activities')}</div>
                    </div>
                    <div className="text-center p-3">
                      <div className="text-3xl font-bold text-warning">{getProgress().conversations}</div>
                      <div className="text-sm text-gray-500 mt-1">{t('conversations')}</div>
                    </div>
                    <div className="text-center p-3">
                      <div className="text-lg font-bold text-primary">{familyProfile.members.length}</div>
                      <div className="text-sm text-gray-500 mt-1">Integrantes</div>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-6 mb-6">
                  <h3 className="font-bold text-dark mb-3">{t('generalProgress')}</h3>
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="progress-bar h-full"
                      style={{ width: `${getProgress().totalActivities > 0 ? (getProgress().completedActivities / getProgress().totalActivities) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-gray-500">{getProgress().completedActivities} de {getProgress().totalActivities}</span>
                    <span className="text-sm font-bold text-primary">{getProgress().totalActivities > 0 ? Math.round((getProgress().completedActivities / getProgress().totalActivities) * 100) : 0}%</span>
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-6 mb-6">
                  <h3 className="font-bold text-dark mb-4">{t('myBadges')}</h3>
                  <div className="flex gap-4 justify-center">
                    {currentBadges.map(badge => (
                      <div key={badge.id} className={`text-center p-4 rounded-xl ${badge.unlocked ? '' : 'opacity-40 grayscale'}`} style={{ border: badge.unlocked ? `3px solid ${badge.color}` : '2px dashed gray' }}>
                        <div className="text-3xl">{badge.emoji}</div>
                        <div className="text-xs font-bold mt-2" style={{ color: badge.color }}>{badge.name}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <button onClick={() => setCurrentScreen('home')} className="btn-glow bg-primary text-white font-bold py-4 px-6 rounded-xl text-lg w-full">
                    ← Volver al inicio
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )

    case 'content-for-parents':
      return (
        <div className="min-h-screen bg-light text-dark p-8">
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

    // Edit Photo Modal
    const editPhotoModalContent = editPhotoModal ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div className="glass-card rounded-3xl p-8 max-w-md w-full text-center animate-slide-up shadow-2xl">
          <h3 className="text-2xl font-bold gradient-text mb-2">{t('editPhoto')}</h3>
          <p className="text-gray-500 mb-6">{t('choosePhoto')}</p>
          
          <div className="space-y-3 mb-6">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = (event) => {
                      const result = event.target?.result as string
                      setTempPhoto(result)
                      const updated = { ...studentProfile, photo: result }
                      setStudentProfile(updated)
                      saveStudentProfile(updated)
                      setEditPhotoModal(false)
                    }
                    reader.readAsDataURL(file)
                  }
                }}
              />
              <button className="btn-glow bg-primary text-white font-bold py-3 px-6 rounded-xl w-full">
                📷 {t('takePhoto')}
              </button>
            </label>
            
            <button
              onClick={() => {
                const updated = { ...studentProfile, photo: '' }
                setStudentProfile(updated)
                saveStudentProfile(updated)
                setEditPhotoModal(false)
              }}
              className="btn-glow bg-secondary text-white font-bold py-3 px-6 rounded-xl w-full"
            >
              Eliminar foto
            </button>
            
            <button
              onClick={() => setEditPhotoModal(false)}
              className="text-gray-500 hover:text-primary text-sm font-medium"
            >
              {t('back')}
            </button>
          </div>
        </div>
      </div>
    ) : null

  return (
    <div className={`${darkMode ? 'dark' : ''} ${device === 'pc' ? 'pc-mode' : ''}`}>
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
              Continuar
            </button>
          </div>
        </div>
      )}
      {editPhotoModalContent}
    </div>
  )
}