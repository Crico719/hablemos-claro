import { useState, useEffect, useRef } from 'react'
import './index.css'

// Tipos para la aplicación
type UserRole = 'parent' | 'child'
type LearningTopic = 'coima' | 'recognition' | 'impact' | 'consequences' | 'prevention' | 'ethics' | 'citizen' | 'test'
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
  photoPos: PhotoPos
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

interface PhotoPos {
  x: number
  y: number
  zoom: number
}

const defaultPhotoPos: PhotoPos = { x: 50, y: 50, zoom: 1 }

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
    photoLinkTitle: '🔗 O pega el enlace de una imagen',
    photoLinkPlaceholder: 'https://ejemplo.com/mi-foto.jpg',
    useLink: 'Usar enlace',
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
    photoLinkTitle: '🔗 Utaq willay rikinpa linknin',
    photoLinkPlaceholder: 'https://ejemplo.com/riki.jpg',
    useLink: "Linkta llaqtay",
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
    ethics: 0,
    citizen: 0,
    test: 0,
  },
  quizScores: [],
  lastActiveDate: '',
  streakDays: 0,
}

const getStoredStudentProfile = (): StudentProfile => {
  const stored = localStorage.getItem('hablemos-claro-student-profile')
  if (stored) {
    const parsed = JSON.parse(stored)
    return {
      name: parsed.name ?? '',
      age: parsed.age ?? '',
      district: parsed.district ?? '',
      photo: parsed.photo ?? '',
      photoPos: { ...defaultPhotoPos, ...(parsed.photoPos ?? {}) },
      progress: {
        ...defaultStudentProgress,
        ...parsed.progress,
        topicProgress: {
          ...defaultStudentProgress.topicProgress,
          ...(parsed.progress?.topicProgress ?? {}),
        },
        badges: parsed.progress?.badges ?? [...allBadges],
        quizScores: parsed.progress?.quizScores ?? [],
      },
      customization: {
        ...defaultCustomization,
        ...(parsed.customization ?? {}),
      },
    }
  }
  return {
    name: '',
    age: '',
    district: '',
    photo: '',
    photoPos: defaultPhotoPos,
    progress: defaultStudentProgress,
    customization: defaultCustomization,
  }
}

const getStoredFamilyProfile = (): FamilyProfile => {
  const stored = localStorage.getItem('hablemos-claro-family-profile')
  if (stored) {
    const parsed = JSON.parse(stored)
    return {
      name: parsed.name ?? '',
      members: parsed.members ?? [],
      progress: {
        ...defaultStudentProgress,
        ...parsed.progress,
        topicProgress: {
          ...defaultStudentProgress.topicProgress,
          ...(parsed.progress?.topicProgress ?? {}),
        },
        badges: parsed.progress?.badges ?? [...allBadges],
        quizScores: parsed.progress?.quizScores ?? [],
      },
    }
  }
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

// Banco del examen final: cubre todos los temas
interface ExamQuestion {
  topic: string
  icon: string
  question: string
  options: string[]
  correct: number
}

const examQuestions: ExamQuestion[] = [
  { topic: '¿Qué es una coima?', icon: '💰', question: '¿Qué es una coima?', options: ['Respetar las reglas sin ofrecer nada', 'Ofrecer dinero o regalos para obtener un beneficio indebido', 'Pedir ayuda para una tarea'], correct: 1 },
  { topic: '¿Qué es una coima?', icon: '💰', question: '¿Cuál de estos es un ejemplo de coima?', options: ['Un funcionario pide dinero para acelerar un trámite', 'Pagar el precio justo en el mercado', 'Devolver una billetera perdida'], correct: 0 },
  { topic: 'Reconocerla', icon: '🔍', question: '¿Cuál es una señal de alerta de corrupción?', options: ['Te dan comprobante por todo', 'Te explican el procedimiento con calma', 'Te presionan a decidir rápido y en secreto'], correct: 2 },
  { topic: 'Reconocerla', icon: '🔍', question: 'Un inspector dice: “dame un regalito y cierro los ojos”. ¿Qué es?', options: ['Un trámite normal', 'Una multa legal', 'Una coima'], correct: 2 },
  { topic: 'El daño', icon: '💔', question: '¿A quién dañan las coimas?', options: ['A toda la sociedad, sobre todo a los más vulnerables', 'Solo a quien la ofrece', 'A nadie realmente'], correct: 0 },
  { topic: 'El daño', icon: '💔', question: 'El dinero de una coima en una obra podría haberse usado en…', options: ['Fiestas privadas', 'Escuelas y hospitales', 'Nada importante'], correct: 1 },
  { topic: 'Consecuencias', icon: '⚖️', question: '¿Qué le puede pasar a quien ofrece o acepta una coima?', options: ['Solo una llamada de atención', 'Nada si nadie se entera', 'Prisión, multas e inhabilitación'], correct: 2 },
  { topic: 'Consecuencias', icon: '⚖️', question: 'Además de lo legal, la corrupción destruye…', options: ['La confianza entre ciudadanos', 'Los semáforos', 'Los feriados'], correct: 0 },
  { topic: 'Prevención', icon: '🛡️', question: '¿Cómo se previene la corrupción?', options: ['Exigiendo transparencia y denunciando', 'Ignorando lo que pasa', 'Pagando más rápido'], correct: 0 },
  { topic: 'Prevención', icon: '🛡️', question: 'Si ves algo incorrecto en tu municipalidad, puedes…', options: ['Quedarte callado', 'Denunciar por canales seguros', 'Participar del reparto'], correct: 1 },
  { topic: 'Ética', icon: '🧭', question: 'La integridad significa…', options: ['Seguir a la mayoría', 'Hacer lo que conviene', 'Hacer lo correcto aunque nadie mire'], correct: 2 },
  { topic: 'Ética', icon: '🧭', question: 'Encuentras una billetera con dinero. ¿Qué muestra integridad?', options: ['Devolverla con todo su contenido', 'Quedarse con el dinero', 'Gastarlo y devolver el resto'], correct: 0 },
  { topic: 'Ciudadanía', icon: '🗳️', question: 'Ser un ciudadano activo es…', options: ['Vigilar, participar y exigir cuentas', 'Votar y olvidar el tema', 'Dejar todo a los políticos'], correct: 0 },
  { topic: 'Ciudadanía', icon: '🗳️', question: 'Un comité vecinal detecta sobreprecio en una obra. ¿Qué puede hacer?', options: ['Pedir su parte', 'No meterse', 'Exigir el expediente y denunciar'], correct: 2 },
]

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
  const [selectedTopic, setSelectedTopic] = useState<LearningTopic | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<number[]>([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState<string>('')
  const [showCoimaONo, setShowCoimaONo] = useState(false)
  const [currentCoimaCase, setCurrentCoimaCase] = useState(0)
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({})
  const [device, setDevice] = useState<DeviceType>('pc')
  const [showBadgeCelebration, setShowBadgeCelebration] = useState(false)
  const [earnedBadge, setEarnedBadge] = useState<Badge | null>(null)
  const [userName, setUserName] = useState<string>(() => localStorage.getItem('hablemos-claro-name') || '')
  const [userAge, setUserAge] = useState<string>(() => localStorage.getItem('hablemos-claro-age') || '')
  const [userDistrict, setUserDistrict] = useState<string>(() => localStorage.getItem('hablemos-claro-district') || '')
  const [language, setLanguage] = useState<'es' | 'qu'>(() => (localStorage.getItem('hablemos-claro-lang') as 'es' | 'qu') || 'es')
  const [profileType, setProfileType] = useState<ProfileType>('student')
  const [editPhotoModal, setEditPhotoModal] = useState(false)
  const [photoUrl, setPhotoUrl] = useState('')
  const [posDraft, setPosDraft] = useState<PhotoPos>(defaultPhotoPos)
  const dragStart = useRef<{ sx: number; sy: number; x: number; y: number } | null>(null)
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

  // Actualizar progreso (las insignias SOLO se consiguen completando el test final)
  const updateProgress = (activitiesIncrement: number = 1) => {
    const currentProfile = profileType === 'student' ? studentProfile : familyProfile
    const newProgress = { ...currentProfile.progress }
    newProgress.completedActivities += activitiesIncrement
    newProgress.totalActivities = Math.max(newProgress.totalActivities, newProgress.completedActivities)

    if (profileType === 'student') {
      setStudentProfile({ ...studentProfile, progress: newProgress })
      saveStudentProfile({ ...studentProfile, progress: newProgress })
    } else {
      setFamilyProfile({ ...familyProfile, progress: newProgress })
      saveFamilyProfile({ ...familyProfile, progress: newProgress })
    }
  }

  // Orden obligatorio de temas (paso por paso, sin saltos)
  const topicOrder: LearningTopic[] = ['coima', 'recognition', 'impact', 'consequences', 'prevention', 'ethics', 'citizen', 'test']

  // Completar un tema (solo cuenta la primera vez) - un solo guardado para no sobrescribir el desbloqueo
  const completeTopic = (topic: LearningTopic) => {
    const currentProfile = profileType === 'student' ? studentProfile : familyProfile
    const alreadyDone = (currentProfile.progress.topicProgress[topic] ?? 0) >= 100
    const completedActivities = currentProfile.progress.completedActivities + (alreadyDone ? 0 : 1)
    const newProgress = {
      ...currentProfile.progress,
      completedActivities,
      totalActivities: Math.max(currentProfile.progress.totalActivities, completedActivities),
      topicProgress: {
        ...currentProfile.progress.topicProgress,
        [topic]: 100,
      },
    }
    if (profileType === 'student') {
      setStudentProfile({ ...studentProfile, progress: newProgress })
      saveStudentProfile({ ...studentProfile, progress: newProgress })
    } else {
      setFamilyProfile({ ...familyProfile, progress: newProgress })
      saveFamilyProfile({ ...familyProfile, progress: newProgress })
    }
  }

  // Completar el test final: única forma de conseguir las insignias - un solo guardado
  const completeTest = () => {
    const currentProfile = profileType === 'student' ? studentProfile : familyProfile
    const alreadyDone = (currentProfile.progress.topicProgress['test'] ?? 0) >= 100
    const newBadges = currentProfile.progress.badges.map(b => ({ ...b, unlocked: true }))
    const completedActivities = currentProfile.progress.completedActivities + (alreadyDone ? 0 : 1)
    const newProgress = {
      ...currentProfile.progress,
      completedActivities,
      totalActivities: Math.max(currentProfile.progress.totalActivities, completedActivities),
      topicProgress: {
        ...currentProfile.progress.topicProgress,
        test: 100,
      },
      badges: newBadges,
    }
    if (profileType === 'student') {
      setStudentProfile({ ...studentProfile, progress: newProgress })
      saveStudentProfile({ ...studentProfile, progress: newProgress })
    } else {
      setFamilyProfile({ ...familyProfile, progress: newProgress })
      saveFamilyProfile({ ...familyProfile, progress: newProgress })
    }
    const champion = newBadges.find(b => b.id === 'integrity-champion')!
    setEarnedBadge({ ...champion })
    setShowBadgeCelebration(true)
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
            <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm">
              <h1 className="text-3xl font-bold gradient-text mb-2">{t('chooseProfile')}</h1>
              <p className="text-gray-600">{t('welcomeSub')}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-10">
              <button
                onClick={() => {
                  setProfileType('student')
                  setCurrentScreen('home')
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
                  setCurrentScreen('home')
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
            <div className="bg-white rounded-2xl p-6 mb-12 shadow-sm">
              <h1 className="text-3xl font-bold gradient-text">{t('aboutTitle')}</h1>
              <p className="text-gray-600 mt-2">{t('aboutSub')}</p>
            </div>

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
            <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm">
              <h1 className="text-3xl font-bold gradient-text mb-2">{t('deviceQuestion')}</h1>
              <p className="text-gray-600">{t('deviceSub')}</p>
            </div>

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
            <div className="bg-white rounded-2xl p-6 mb-10 shadow-sm text-center">
              <h2 className="text-3xl font-bold gradient-text">{t('configTitle')}</h2>
            </div>
            
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

              <p className="text-black font-bold text-center text-lg bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-200">{t('roleQuestion')}</p>
              <div className="grid grid-cols-2 gap-5 mt-3">
                <button
                  onClick={() => setSelectedRole('parent')}
                  className={selectedRole === 'parent' ? 'bg-primary text-white font-bold py-5 px-6 rounded-xl shadow-lg text-lg' : 'bg-white font-bold py-5 px-6 rounded-xl text-black border-2 border-gray-200 shadow-sm hover:bg-primary/20 transition-all text-lg'}
                >
                  {t('parent')}
                </button>
                <button
                  onClick={() => setSelectedRole('child')}
                  className={selectedRole === 'child' ? 'bg-secondary text-white font-bold py-5 px-6 rounded-xl shadow-lg text-lg' : 'bg-white font-bold py-5 px-6 rounded-xl text-black border-2 border-gray-200 shadow-sm hover:bg-secondary/20 transition-all text-lg'}
                >
                  {t('child')}
                </button>
              </div>

              <p className="text-black font-bold text-center text-lg bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-200 mt-10">{t('deviceQuestion')}</p>
              <div className="grid grid-cols-3 gap-5 mt-3">
                <button
                  onClick={() => setDevice('pc')}
                  className={device === 'pc' ? 'bg-primary text-white font-bold py-5 px-6 rounded-xl shadow-lg text-lg' : 'bg-white font-bold py-5 px-6 rounded-xl text-black border-2 border-gray-200 shadow-sm hover:bg-primary/20 transition-all text-lg'}
                >
                  🖥️ PC
                </button>
                <button
                  onClick={() => setDevice('phone')}
                  className={device === 'phone' ? 'bg-secondary text-white font-bold py-5 px-6 rounded-xl shadow-lg text-lg' : 'bg-white font-bold py-5 px-6 rounded-xl text-black border-2 border-gray-200 shadow-sm hover:bg-secondary/20 transition-all text-lg'}
                >
                  📱 Móvil
                </button>
                <button
                  onClick={() => setDevice('laptop')}
                  className={device === 'laptop' ? 'bg-warning text-white font-bold py-5 px-6 rounded-xl shadow-lg text-lg' : 'bg-white font-bold py-5 px-6 rounded-xl text-black border-2 border-gray-200 shadow-sm hover:bg-warning/20 transition-all text-lg'}
                >
                  💻 Laptop
                </button>
              </div>

              <p className="text-black font-bold text-center text-lg bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-200 mt-10">{t('languageTitle')}</p>
              <div className="grid grid-cols-2 gap-5 mt-3">
                <button
                  onClick={() => changeLanguage('es')}
                  className={language === 'es' ? 'bg-primary text-white font-bold py-5 px-6 rounded-xl shadow-lg text-lg' : 'bg-white font-bold py-5 px-6 rounded-xl text-black border-2 border-gray-200 shadow-sm hover:bg-primary/20 transition-all text-lg'}
                >
                  {t('spanish')}
                </button>
                <button
                  onClick={() => changeLanguage('qu')}
                  className={language === 'qu' ? 'bg-secondary text-white font-bold py-5 px-6 rounded-xl shadow-lg text-lg' : 'bg-white font-bold py-5 px-6 rounded-xl text-black border-2 border-gray-200 shadow-sm hover:bg-secondary/20 transition-all text-lg'}
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
          <div className="max-w-6xl mx-auto animate-slide-up space-y-16">
            
            {/* Header */}
            <div className="bg-white rounded-2xl p-6 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="glass-card px-5 py-3 rounded-xl text-primary font-bold text-xl shadow-lg">
                  🏅 {unlockedCount}/3
                </div>
                <div>
                  <h1 className="text-3xl font-black text-black">{t('greeting')}</h1>
                  <p className="text-base text-gray-600">{device === 'phone' ? '📱 Móvil' : device === 'laptop' ? '💻 Laptop' : '🖥️ PC'}</p>
                </div>
              </div>
              <button onClick={() => setCurrentScreen('config')} className="glass-card px-5 py-3 rounded-xl text-primary text-base font-medium hover:bg-primary/10 transition-all">
                ⚙️ {t('configTitle')}
              </button>
            </div>

            {/* Welcome line */}
            <div className="rounded-2xl px-6 py-5 shadow-lg text-center" style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED, #EC4899)' }}>
              <p className="text-xl text-white font-bold drop-shadow">✨ {t('welcomeLine')} 🌟</p>
            </div>

            {/* Badges Card */}
            <div className="glass-card rounded-2xl p-10 card-hover">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-secondary text-xl">{t('badges')}</h3>
                <span className="text-lg font-bold text-primary">{unlockedCount}/3</span>
              </div>
              <div className="flex gap-6 mb-8">
                {currentProgress.badges.map(badge => (
                  <div key={badge.id} className={`flex-1 text-center p-5 rounded-xl ${badge.unlocked ? 'animate-float' : 'opacity-30 grayscale'}`}>
                    <div className="text-4xl">{badge.emoji}</div>
                    <div className="text-xs font-bold mt-2 truncate">{badge.name}</div>
                  </div>
                ))}
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="progress-bar h-full"
                  style={{ width: `${Math.min((unlockedCount / 3) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Main Grid - 2x2 */}
            <div className="grid grid-cols-2 gap-12">
              <button
                onClick={() => setCurrentScreen('learn')}
                className="glass-card rounded-2xl p-10 card-hover shadow-custom-lg min-h-[180px] flex flex-col justify-between group"
              >
                <div>
                  <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">📚</div>
                  <h3 className="font-bold text-primary text-2xl mb-3">{t('themes')}</h3>
                  <p className="text-gray-500 leading-relaxed">{t('themesDesc')}</p>
                </div>
              </button>
              <button
                onClick={() => setCurrentScreen('games')}
                className="glass-card rounded-2xl p-10 card-hover shadow-custom-lg min-h-[180px] flex flex-col justify-between group"
              >
                <div>
                  <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">🎮</div>
                  <h3 className="font-bold text-secondary text-2xl mb-3">{t('game')}</h3>
                  <p className="text-gray-500 leading-relaxed">{t('gameDesc')}</p>
                </div>
              </button>
              <button
                onClick={() => setCurrentScreen('reels')}
                className="glass-card rounded-2xl p-10 card-hover shadow-custom-lg min-h-[180px] flex flex-col justify-between group"
              >
                <div>
                  <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">📱</div>
                  <h3 className="font-bold text-warning text-2xl mb-3">{t('reels')}</h3>
                  <p className="text-gray-500 leading-relaxed">{t('reelsDesc')}</p>
                </div>
              </button>
              <button
                onClick={() => setCurrentScreen('profile')}
                className="glass-card rounded-2xl p-10 card-hover shadow-custom-lg min-h-[180px] flex flex-col justify-between group"
              >
                <div>
                  <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">👤</div>
                  <h3 className="font-bold text-success text-2xl mb-3">{t('profile')}</h3>
                  <p className="text-gray-500 leading-relaxed">{t('profileDesc')}</p>
                </div>
              </button>
            </div>

            {/* Divider */}
            <hr className="border-gray-200 my-16" />

            {/* Family Activity */}
            <div className="glass-card rounded-2xl p-10 card-hover text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="font-bold text-warning text-xl mb-4">{t('familyActivity')}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed max-w-xl mx-auto">
                {t('familyDesc')}
              </p>
              <button
                onClick={() => setCurrentScreen('converse')}
                className="btn-glow bg-warning text-white font-bold py-4 px-8 rounded-xl text-base w-full max-w-xs"
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
            <div className="bg-white rounded-2xl p-5 flex items-center justify-between mb-6 shadow-sm">
              <div>
                <h1 className="text-3xl font-bold gradient-text">{t('reels')} 📱</h1>
                <p className="text-sm text-gray-600">{t('reelsDesc')}</p>
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
          icon: '💰',
          color: 'primary',
          explanation: 'Una coima (también llamada soborno) ocurre cuando alguien ofrece, entrega, pide o acepta dinero, regalos o favores para obtener un beneficio indebido o influir incorrectamente en una decisión.',
          keyPoints: [
            'Puede ser dinero, regalos, favores o promesas futuras',
            'Siempre busca un beneficio que no le corresponde',
            'Corrompe la imparcialidad de quien decide',
            'Es delito en casi todos los países'
          ],
          example: 'Un contratista ofrece dinero a un funcionario para ganar una licitación sin cumplir requisitos.',
          correct: 'Es un delito',
          incorrect: 'Es una práctica normal',
          video: 'https://www.youtube.com/embed/5LbVY6qH3kM',
          theorem: 'Principio de Transparencia: Toda decisión pública debe estar abierta a la supervisión. La información es un derecho, no un privilegio.',
        },
        recognition: {
          title: '¿Cómo reconocer una coima?',
          icon: '🔍',
          color: 'secondary',
          explanation: 'Las coimas suelen disfrazarse. Aprende a detectar las señales de alerta antes de caer en una trampa.',
          keyPoints: [
            'Ofertas "demasiado buenas para ser verdad"',
            'Presión para decidir rápido sin revisar',
            'Reuniones secretas sin testigos ni registro',
            'Pedidos de "favores" a cambio de agilizar trámites',
            'Regalos costosos antes de una decisión importante'
          ],
          example: 'Un inspector dice: "Si me das un regalito, cierro los ojos ante esta infracción".',
          correct: 'Situación de corrupción',
          incorrect: 'Trato normal',
          video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          theorem: 'Principio de Responsabilidad: Quien decide debe rendir cuentas. El poder sin control es abuso.',
        },
        impact: {
          title: '¿Por qué las coimas hacen daño?',
          icon: '💔',
          color: 'warning',
          explanation: 'Cada coima roba recursos que pertenecen a todos. El daño no es abstracto: afecta directamente tu calidad de vida y la de tu familia.',
          keyPoints: [
            'Menos dinero para escuelas, hospitales y seguridad',
            'Servicios públicos de peor calidad',
            'Aumenta la desigualdad: paga el más vulnerable',
            'Destruye la confianza en las instituciones',
            'Frena el desarrollo del país'
          ],
          example: 'El dinero de una coima en una obra pública podría haber equipado 3 aulas escolares.',
          correct: 'Daño real a la sociedad',
          incorrect: 'Solo afecta a los involucrados',
          video: 'https://www.youtube.com/embed/9bZkp7q19f0',
          theorem: 'Principio de Equidad: Todos merecemos igual trato. La corrupción rompe la igualdad y agrava la pobreza.',
        },
        consequences: {
          title: 'Consecuencias legales y sociales',
          icon: '⚖️',
          color: 'error',
          explanation: 'Ofrecer o aceptar una coima es delito grave. Las consecuencias van más allá de lo legal: destruyen tu reputación y futuro.',
          keyPoints: [
            'Prisión: 3 a 8 años (Perú) o más según el caso',
            'Multas económicas elevadas',
            'Inhabilitación para cargo público (hasta de por vida)',
            'Antecedentes penales que limitan empleo y viajes',
            'Estigma social y familiar permanente'
          ],
          example: 'Un alcalde condenado por cohecho pierde su cargo, va a prisión y su familia carga el estigma.',
          correct: 'Consecuencias graves e irreversibles',
          incorrect: 'Solo una multa leve',
          video: 'https://www.youtube.com/embed/DqP2rR0fB4s',
          theorem: 'Principio de Proporcionalidad: La pena debe ser proporcional. La prevención siempre supera al castigo.',
        },
        prevention: {
          title: 'Cómo prevenir la corrupción',
          icon: '🛡️',
          color: 'success',
          explanation: 'La mejor defensa es la prevención activa. Cada persona puede ser un agente de cambio desde su entorno.',
          keyPoints: [
            'Conoce tus derechos y los procedimientos correctos',
            'Exige transparencia: pide comprobantes y actas',
            'Denuncia: usa canales seguros y anónimos',
            'Educa a tu familia: habla de integridad en casa',
            'Participa: vigila obras y gastos públicos'
          ],
          example: 'Vecinos organizados exigen ver el expediente de una obra y evitan sobreprecio.',
          correct: 'Sí, la prevención funciona',
          incorrect: 'No se puede hacer nada',
          video: 'https://www.youtube.com/embed/kffacxfA7G4',
          theorem: 'Principio de Participación: La democracia se fortalece cuando todos vigilamos. El silencio es cómplice.',
        },
        ethics: {
          title: 'Ética e integridad personal',
          icon: '🧭',
          color: 'info',
          explanation: 'La integridad no es solo no robar: es hacer lo correcto cuando nadie mira. Es tu brújula interna.',
          keyPoints: [
            'Honestidad: decir la verdad aunque cueste',
            'Coherencia: actuar según tus valores',
            'Valentía: decir no a lo incorrecto',
            'Empatía: pensar en cómo afectas a otros',
            'Ejemplo: tu conducta inspira a otros'
          ],
          example: 'Un estudiante devuelve una billetera perdida con todo su contenido sin esperar recompensa.',
          correct: 'Es mi responsabilidad',
          incorrect: 'Cada quien se arregla solo',
          video: 'https://www.youtube.com/embed/ethics101',
          theorem: 'Principio de Integridad: Hacer lo correcto cuando nadie mira define tu carácter real.',
        },
        citizen: {
          title: 'Ciudadanía activa',
          icon: '🗳️',
          color: 'purple',
          explanation: 'Ser ciudadano no es solo votar cada 5 años. Es participar, vigilar y exigir cuentas todos los días.',
          keyPoints: [
            'Vigila: revisa obras y gastos de tu municipalidad',
            'Participa: asiste a audiencias y cabildos',
            'Denuncia: usa la Defensoría, Contraloría o Fiscalía',
            'Organiza: junta vecinos para fiscalizar juntos',
            'Vota informado: investiga antecedentes de candidatos'
          ],
          example: 'Un comité vecinal detecta sobreprecio en una pista y logra anular el contrato.',
          correct: 'Es mi poder y deber',
          incorrect: 'Los políticos sabrán qué hacer',
          video: 'https://www.youtube.com/embed/citizen101',
          theorem: 'Principio de Soberanía: El poder emana del pueblo. Ejercerlo es defender tus derechos.',
        },
        test: {
          title: 'Pon a prueba tus conocimientos',
          icon: '📝',
          color: 'primary',
          explanation: 'Responde estas preguntas para verificar lo que aprendiste. No hay respuestas "malas", solo oportunidades de aprender.',
          keyPoints: [],
          example: '',
          correct: '',
          incorrect: '',
          video: '',
          theorem: 'Recuerda: La integridad no es solo no hacer lo malo, sino actuar correctamente aunque nadie te vea.',
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
      const cust7 = getCustomization();

      // Pantalla "¿Coima o no?"
      if (showCoimaONo) {
        const currentCase = coimaCases[currentCoimaCase]
        const cust8 = getCustomization();
        return (
          <div className="min-h-screen p-8" style={{ background: cust8.backgroundValue, backgroundSize: cust8.backgroundType === 'pattern' ? '50px 50px' : 'cover' }}>
            <div className="max-w-3xl mx-auto animate-slide-up space-y-8 text-center">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold gradient-text">¿Coima o no?</h1>
                <button onClick={() => { setShowCoimaONo(false); setCurrentCoimaCase(0); }} className="glass-card px-4 py-2 rounded-xl text-gray-500 hover:text-primary text-sm font-medium">
                  ← Atrás
                </button>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden max-w-xs mx-auto">
                <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${((currentCoimaCase + 1) / coimaCases.length) * 100}%` }}></div>
              </div>
              <p className="text-sm text-gray-500">Caso {currentCoimaCase + 1} de {coimaCases.length}</p>

              <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">Caso {currentCoimaCase + 1} de {coimaCases.length}</span>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden w-48">
                    <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${((currentCoimaCase + 1) / coimaCases.length) * 100}%` }}></div>
                  </div>
                </div>

                <p className="text-lg text-gray-700 mb-6">{currentCase.situation}</p>

                <div className="grid grid-cols-2 gap-6">
                  <button
                    onClick={() => {
                      const isCorrect = currentCase.isCoima === true
                      setFeedbackMessage(isCorrect ? currentCase.explanation : 'Incorrecto. ' + currentCase.explanation)
                      setShowFeedback(true)
                      updateProgress()
                    }}
                    className="btn-glow bg-primary text-white font-bold py-5 px-6 rounded-xl text-lg font-medium w-full shadow-lg"
                  >
                    ✅ Sí, es una coima
                  </button>
                  <button
                    onClick={() => {
                      const isCorrect = currentCase.isCoima === false
                      setFeedbackMessage(isCorrect ? currentCase.explanation : 'Incorrecto. ' + currentCase.explanation)
                      setShowFeedback(true)
                      updateProgress()
                    }}
                    className="btn-glow bg-white border-2 border-primary text-primary font-bold py-5 px-6 rounded-xl text-lg font-medium hover:bg-primary/5"
                  >
                    ❌ No, no es una coima
                  </button>
                </div>
              </div>

              {showFeedback && (
                <div className="glass-card rounded-2xl p-6 animate-fade-in">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                         style={{ background: feedbackMessage.includes('Correcto') ? '#10B98120' : '#EF444420' }}>
                      {feedbackMessage.includes('Correcto') ? '✅' : '❌'}
                    </div>
                    <p className="font-bold text-lg" style={{ color: feedbackMessage.includes('Correcto') ? '#10B981' : '#EF4444' }}>
                      {feedbackMessage.includes('Correcto') ? '¡Correcto!' : 'Intenta de nuevo'}
                    </p>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{feedbackMessage}</p>
                </div>
              )}

              {showFeedback && (
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
                  className="btn-glow bg-primary text-white font-bold py-4 px-8 rounded-xl text-lg w-full"
                >
                  {currentCoimaCase < coimaCases.length - 1 ? 'Siguiente caso →' : 'Volver al inicio'}
                </button>
              )}
            </div>
          </div>
        )
      }

      return (
        <div className="min-h-screen p-8" style={{ background: cust7.backgroundValue, backgroundSize: cust7.backgroundType === 'pattern' ? '50px 50px' : 'cover' }}>
          <div className="max-w-4xl mx-auto animate-slide-up space-y-14">
            
            {/* Header */}
            <div className="bg-white rounded-2xl p-6 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-4xl">
                  {currentTopicData.icon}
                </div>
                <div>
                  <h1 className="text-3xl font-bold gradient-text">{currentTopicData.title}</h1>
                  <p className="text-gray-600 mt-1">Tema {Object.keys(topics).indexOf(selectedTopic || 'coima') + 1} de {Object.keys(topics).length}</p>
                </div>
              </div>
              <button onClick={() => navigateTo('home')} className="glass-card px-5 py-2 rounded-xl text-gray-500 hover:text-primary text-sm font-medium hover:bg-gray-100 transition-all">
                ← Inicio
              </button>
            </div>

            {/* Main Content */}

            {/* Topic menu */}
            <div className="glass-card rounded-2xl p-10">
              <h2 className="text-xl font-bold text-dark mb-3">Ruta de aprendizaje</h2>
              <p className="text-gray-500 mb-8">Avanza paso por paso, sin saltos. El test se desbloquea al terminar todos los temas.</p>
              <div className="grid grid-cols-2 gap-6">
                {topicOrder.map((key) => {
                  const idx = topicOrder.indexOf(key)
                  const prevKey = idx > 0 ? topicOrder[idx - 1] : null
                  const prevDone = prevKey === null || (getProgress().topicProgress[prevKey] ?? 0) >= 100
                  const done = (getProgress().topicProgress[key] ?? 0) >= 100
                  const locked = !prevDone
                  const isTest = key === 'test'
                  return (
                    <button
                      key={key}
                      disabled={locked}
                      onClick={() => { setSelectedTopic(key); setShowCoimaONo(false); setShowFeedback(false); }}
                      className={`rounded-2xl p-5 text-left transition-all border-2 ${
                        locked
                          ? 'bg-gray-100 text-gray-400 border-gray-200 opacity-70'
                          : (selectedTopic ?? 'coima') === key
                            ? 'bg-primary text-white border-primary shadow-lg'
                            : 'glass-card text-dark border-transparent hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-3xl mb-2">{locked ? '🔒' : topics[key].icon}</div>
                        {done && !locked && <div className="text-xl">✅</div>}
                      </div>
                      <div className="font-bold leading-snug">
                        {idx + 1}. {topics[key].title}
                        {isTest && locked && ' (bloqueado)'}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {selectedTopic !== 'test' && !showCoimaONo && (
              <div className="rounded-2xl p-10 border-2 border-black" style={{ background: '#FFE45E' }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-xl bg-black flex items-center justify-center text-2xl">📖</div>
                  <h2 className="text-2xl font-bold text-black">Explicación</h2>
                </div>
                <p className="text-black text-lg leading-loose">{currentTopicData.explanation}</p>

                {currentTopicData.keyPoints.length > 0 && (
                  <div className="mt-10">
                    <h3 className="font-bold text-black mb-5">Puntos clave</h3>
                    <ul className="space-y-6">
                      {currentTopicData.keyPoints.map((point, i) => (
                        <li key={i} className="flex items-start gap-4 p-5 bg-white rounded-xl border border-black/10">
                          <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold flex-shrink-0">
                            {i + 1}
                          </div>
                          <p className="text-black leading-relaxed">{point}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-10 p-6 bg-white border-l-4 border-black rounded-xl">
                  <p className="font-bold text-black mb-3">💡 Ejemplo</p>
                  <p className="text-black leading-loose italic">“{currentTopicData.example}”</p>
                </div>

                <div className="mt-8 p-6 bg-white border-2 border-black rounded-xl">
                  <p className="font-bold text-black mb-3">⚖️ Principio</p>
                  <p className="text-black leading-loose font-medium">“{currentTopicData.theorem}”</p>
                </div>

                <div className="mt-10">
                  <h3 className="font-bold text-black mb-5">Comprensión rápida</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <button
                      onClick={() => handleAnswer(0)}
                      className="btn-glow bg-success text-white font-bold py-4 px-5 rounded-xl text-lg border-2 border-white"
                    >
                      ✅ {currentTopicData.correct}
                    </button>
                    <button
                      onClick={() => handleAnswer(1)}
                      className="btn-glow bg-white border-2 border-white text-black font-bold py-4 px-5 rounded-xl hover:border-primary/50"
                    >
                      ❌ {currentTopicData.incorrect}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {selectedTopic !== 'test' && !showCoimaONo && (
              <div className="glass-card rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-primary mb-3">¿Coima o no?</h2>
                <p className="text-gray-600 leading-relaxed mb-6">Pon a prueba tu criterio con situaciones de la vida real.</p>
                <button
                  onClick={() => setShowCoimaONo(true)}
                  className="btn-glow bg-primary text-white font-bold py-4 px-6 rounded-xl text-lg w-full"
                >
                  Empezar test →
                </button>
              </div>
            )}

            {selectedTopic === 'test' && (
              <div className="glass-card rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-primary mb-3">📝 Examen final</h2>
                <p className="text-gray-600 leading-relaxed mb-2">
                  {examQuestions.length} preguntas de todos los temas. Responde todo para conseguir tus insignias 🏅
                </p>
                <p className="text-sm font-bold text-primary mb-8">
                  Respondidas: {Object.keys(examAnswers).length} de {examQuestions.length}
                </p>

                {examQuestions.map((q, qi) => (
                  <div key={qi} className="glass-card rounded-xl p-6 mb-6 border border-primary/15">
                    <p className="text-sm font-bold text-gray-500 mb-2">{q.icon} {q.topic} · Pregunta {qi + 1}</p>
                    <p className="text-gray-800 text-lg mb-5">{q.question}</p>
                    <div className="space-y-4">
                      {q.options.map((opt, oi) => (
                        <button
                          key={oi}
                          onClick={() => setExamAnswers(prev => ({ ...prev, [qi]: oi }))}
                          className={`btn-glow w-full py-4 px-5 rounded-xl text-left font-medium border-2 ${
                            examAnswers[qi] === oi
                              ? 'bg-primary text-white border-primary shadow-lg'
                              : 'bg-white border-gray-200 text-dark hover:border-primary/50'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => { completeTest(); navigateTo('result'); }}
                  disabled={Object.keys(examAnswers).length < examQuestions.length}
                  className={`font-bold py-4 px-6 rounded-xl text-lg w-full ${
                    Object.keys(examAnswers).length < examQuestions.length
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'btn-glow bg-success text-white'
                  }`}
                >
                  {Object.keys(examAnswers).length < examQuestions.length
                    ? `Responde todo (${Object.keys(examAnswers).length}/${examQuestions.length})`
                    : 'Terminar examen y conseguir insignias 🏅'}
                </button>
              </div>
            )}

            {selectedTopic !== 'test' && !showCoimaONo && (
              <button
                onClick={() => {
                  const activeKey = selectedTopic ?? 'coima'
                  const alreadyDone = (getProgress().topicProgress[activeKey] ?? 0) >= 100
                  if (!alreadyDone) completeTopic(activeKey)
                  const currentIndex = topicOrder.indexOf(activeKey)
                  setSelectedTopic(topicOrder[(currentIndex + 1) % topicOrder.length])
                  setShowCoimaONo(false)
                  setShowFeedback(false)
                }}
                className="btn-glow bg-gradient-to-r from-primary to-secondary text-white font-bold py-4 px-6 rounded-xl text-lg w-full"
              >
                {((getProgress().topicProgress[selectedTopic ?? 'coima'] ?? 0) >= 100)
                  ? 'Siguiente tema →'
                  : 'Terminar tema y continuar →'}
              </button>
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
            <div className="bg-white rounded-2xl p-5 flex items-center justify-between mb-6 shadow-sm">
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
                        <img
                          src={studentProfile.photo}
                          alt="Perfil"
                          className="w-full h-full object-cover rounded-full"
                          style={{
                            objectPosition: `${studentProfile.photoPos?.x ?? 50}% ${studentProfile.photoPos?.y ?? 50}%`,
                            transform: `scale(${studentProfile.photoPos?.zoom ?? 1})`,
                          }}
                        />
                      ) : (
                        '👤'
                      )}
                    </div>
                    {/* Edit photo button - pencil icon */}
                    <button
                      onClick={() => {
                        setTempPhoto(studentProfile.photo)
                        setPhotoUrl(studentProfile.photo.startsWith('http') ? studentProfile.photo : '')
                        setPosDraft(studentProfile.photoPos ?? defaultPhotoPos)
                        setEditPhotoModal(true)
                      }}
                      className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all text-xl"
                      aria-label={t('editPhoto')}
                    >
                      ✏️
                    </button>
                  </div>
                  <div className="bg-white rounded-2xl px-6 py-5 shadow-sm">
                    <h2 className="text-4xl font-bold gradient-text">{studentProfile.name || 'Estudiante'}</h2>
                    <p className="text-gray-600 mt-2 text-lg">{t('profileSub')}</p>
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
                  <div className="bg-white rounded-2xl px-6 py-5 shadow-sm">
                    <h2 className="text-3xl font-bold gradient-text">{familyProfile.name || 'Familia'}</h2>
                    <p className="text-gray-600 mt-1">Perfil familiar compartido</p>
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

            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="font-bold text-dark mb-3">{t('photoLinkTitle')}</p>
              <input
                type="url"
                value={photoUrl}
                onChange={e => setPhotoUrl(e.target.value)}
                placeholder={t('photoLinkPlaceholder')}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-dark focus:outline-none focus:ring-2 focus:ring-primary font-medium"
              />
              {photoUrl.trim() !== '' && (
                <div className="mt-3 flex justify-center">
                  <img
                    src={photoUrl.trim()}
                    alt="Vista previa"
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                </div>
              )}
              <button
                onClick={() => {
                  const url = photoUrl.trim()
                  if (url === '') return
                  setTempPhoto(url)
                  const updated = { ...studentProfile, photo: url }
                  setStudentProfile(updated)
                  saveStudentProfile(updated)
                }}
                disabled={photoUrl.trim() === ''}
                className={`font-bold py-3 px-6 rounded-xl w-full mt-3 ${
                  photoUrl.trim() === ''
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'btn-glow bg-success text-white'
                }`}
              >
                🔗 {t('useLink')}
              </button>
            </div>
            
              <button
                onClick={() => setEditPhotoModal(false)}
                className="text-gray-500 hover:text-primary text-sm font-medium"
              >
                {t('back')}
              </button>
            </div>

            {(photoUrl.trim() !== '' || studentProfile.photo !== '') && (
              <div className="bg-white rounded-xl p-4 border border-gray-200 mt-3 text-left">
                <p className="font-bold text-dark mb-1">🖼️ Encuadrar imagen</p>
                <p className="text-sm text-gray-500 mb-3">Arrastra la foto para moverla y usa los controles para ajustar.</p>
                <div
                  className="w-full aspect-square rounded-xl overflow-hidden bg-gray-100 touch-none cursor-move select-none"
                  onPointerDown={(e) => {
                    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
                    dragStart.current = { sx: e.clientX, sy: e.clientY, x: posDraft.x, y: posDraft.y }
                  }}
                  onPointerMove={(e) => {
                    const d = dragStart.current
                    if (!d) return
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                    const nx = Math.min(100, Math.max(0, d.x - ((e.clientX - d.sx) / rect.width) * 100))
                    const ny = Math.min(100, Math.max(0, d.y - ((e.clientY - d.sy) / rect.height) * 100))
                    setPosDraft(prev => ({ ...prev, x: nx, y: ny }))
                  }}
                  onPointerUp={() => { dragStart.current = null }}
                  onPointerCancel={() => { dragStart.current = null }}
                >
                  <img
                    src={photoUrl.trim() !== '' ? photoUrl.trim() : studentProfile.photo}
                    alt="Ajuste"
                    draggable={false}
                    className="w-full h-full object-cover pointer-events-none"
                    style={{
                      objectPosition: `${posDraft.x}% ${posDraft.y}%`,
                      transform: `scale(${posDraft.zoom})`,
                    }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                </div>
                <div className="mt-4 space-y-3">
                  <label className="block text-sm font-medium text-dark">
                    ↔ Horizontal: {Math.round(posDraft.x)}%
                    <input
                      type="range" min={0} max={100} value={posDraft.x}
                      onChange={e => setPosDraft(prev => ({ ...prev, x: Number(e.target.value) }))}
                      className="w-full"
                    />
                  </label>
                  <label className="block text-sm font-medium text-dark">
                    ↕ Vertical: {Math.round(posDraft.y)}%
                    <input
                      type="range" min={0} max={100} value={posDraft.y}
                      onChange={e => setPosDraft(prev => ({ ...prev, y: Number(e.target.value) }))}
                      className="w-full"
                    />
                  </label>
                  <label className="block text-sm font-medium text-dark">
                    🔍 Zoom: {posDraft.zoom.toFixed(1)}x
                    <input
                      type="range" min={1} max={2.5} step={0.1} value={posDraft.zoom}
                      onChange={e => setPosDraft(prev => ({ ...prev, zoom: Number(e.target.value) }))}
                      className="w-full"
                    />
                  </label>
                </div>
                <button
                  onClick={() => {
                    const updated = { ...studentProfile, photoPos: posDraft }
                    setStudentProfile(updated)
                    saveStudentProfile(updated)
                    setEditPhotoModal(false)
                  }}
                  className="btn-glow bg-primary text-white font-bold py-3 px-6 rounded-xl w-full mt-4"
                >
                  Guardar encuadre ✓
                </button>
              </div>
            )}
        </div>
      </div>
    ) : null

  return (
    <div className={`${device === 'pc' ? 'pc-mode' : ''}`}>
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