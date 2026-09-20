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
  kidsDone: string[]
  guidesDone: string[]
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
  members: FamilyMember[]
  progress: UserProgress
  familyBadges: FamilyBadge[]
  activityLog: ActivityEntry[]
  familyAvatar: string
}

type FamilyRole = 'Padre' | 'Madre' | 'Hijo' | 'Hija' | 'Tutor' | 'Abuelo' | 'Abuela'

interface FamilyMember {
  id: string
  name: string
  role: FamilyRole
  avatar: string
  activities: number
}

type FamilyBadgeId = 'first-conversation' | 'first-learning' | 'united-family' | 'great-conversationalists' | 'against-corruption' | 'committed-family'

interface FamilyBadge {
  id: FamilyBadgeId
  name: string
  emoji: string
  desc: string
  unlocked: boolean
}

interface ActivityEntry {
  id: string
  text: string
  date: string
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

const defaultFamilyBadges: FamilyBadge[] = [
  { id: 'first-conversation', name: 'Primera conversación', emoji: '🏅', desc: 'Completa la primera conversación familiar', unlocked: false },
  { id: 'first-learning', name: 'Primer aprendizaje', emoji: '📚', desc: 'Completa la primera actividad educativa', unlocked: false },
  { id: 'united-family', name: 'Familia unida', emoji: '👨‍👩‍👧‍👦', desc: 'Todos los integrantes participan en una actividad', unlocked: false },
  { id: 'great-conversationalists', name: 'Grandes conversadores', emoji: '💬', desc: 'Completa 5 conversaciones familiares', unlocked: false },
  { id: 'against-corruption', name: 'Contra la corrupción', emoji: '🛡️', desc: 'Completa 3 actividades sobre coimas y corrupción', unlocked: false },
  { id: 'committed-family', name: 'Familia comprometida', emoji: '⭐', desc: 'Completa todas las actividades principales', unlocked: false },
]

const corruptionTopics: LearningTopic[] = ['coima', 'recognition', 'impact', 'consequences', 'prevention']
const mainTopics: LearningTopic[] = ['coima', 'recognition', 'impact', 'consequences', 'prevention', 'ethics', 'citizen']

const topicTitles: Record<LearningTopic, string> = {
  coima: '¿Qué es una coima?',
  recognition: '¿Cómo reconocer una coima?',
  impact: '¿Por qué las coimas hacen daño?',
  consequences: 'Consecuencias legales y sociales',
  prevention: 'Cómo prevenir la corrupción',
  ethics: 'Ética e integridad personal',
  citizen: 'Ciudadanía activa',
  test: 'Examen final',
}

const memberAvatars = ['😊', '👨', '👩', '👦', '👧', '👴', '👵', '🧑']
const familyRoles: FamilyRole[] = ['Padre', 'Madre', 'Hijo', 'Hija', 'Tutor', 'Abuelo', 'Abuela']
const familyAvatarOptions = ['👨‍👩‍👧‍👦', '👨‍👩‍👧', '👩‍👩‍👧‍👦', '👨‍👨‍👧‍👦', '👪', '🏠']
const defaultFamilyAvatar = '👨‍👩‍👧‍👦'

const roleAvatar: Record<FamilyRole, string> = {
  Padre: '👨',
  Madre: '👩',
  Hijo: '👦',
  Hija: '👧',
  Tutor: '🧑',
  Abuelo: '👴',
  Abuela: '👵',
}

// Avatar seguro: nunca muestra imagen rota ni espacio vacío
const avatarOrFallback = (avatar: string | undefined | null): string => {
  if (typeof avatar === 'string' && avatar.trim() !== '') return avatar
  return '😊'
}

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
    familyTagline: 'Aprendiendo juntos, construyendo una sociedad más honesta.',
    editName: 'Editar nombre',
    save: 'Guardar',
    cancel: 'Cancelar',
    quickActivities: 'Actividades',
    quickConvos: 'Conversaciones',
    quickBadges: 'Insignias',
    quickMembers: 'Integrantes',
    recentActivity: 'Actividad reciente',
    noActivity: 'Todavía no hay actividad.',
    membersTitle: 'Integrantes',
    addMember: '+ Agregar integrante',
    memberNamePh: 'Nombre del integrante',
    memberRole: 'Rol',
    memberAvatar: 'Avatar',
    add: 'Agregar',
    statMembers: 'Integrantes',
    progressHint: 'Completa actividades y conversaciones para avanzar.',
    registerActivity: '+1 actividad',
    lockedBadge: 'Bloqueada',
    unlockedBadge: 'Desbloqueada',
    backHome: '← Volver al inicio',
    selectEyebrow: 'ELIGE TU ESPACIO',
    selectTitle: '¿Cómo quieres continuar?',
    selectTagline: 'Aprende, conversa y toma buenas decisiones.',
    studentCardTitle: 'PERFIL ESTUDIANTE',
    studentCardDesc: 'Tu espacio personal para aprender, avanzar y conseguir insignias.',
    familyCardTitle: 'PERFIL FAMILIA',
    familyCardDesc: 'Un espacio para aprender, conversar y participar juntos.',
    enterBtn: 'Continuar →',
    learnTogether: 'Aprendemos juntos para tomar mejores decisiones.',
    bottomQuote: 'Una conversación puede ser el primer paso para generar un cambio.',
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
  kidsDone: [],
  guidesDone: [],
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

const defaultFamilyMember = (): FamilyMember => ({
  id: `m-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
  name: 'Familiar 1',
  role: 'Tutor',
  avatar: '😊',
  activities: 0,
})

const normalizeMembers = (raw: unknown): FamilyMember[] => {
  if (!Array.isArray(raw)) return [defaultFamilyMember()]
  const mapped = (raw as Array<string | Partial<FamilyMember>>).map((m, i) => {
    if (typeof m === 'string') {
      return { id: `m-old-${i}`, name: m, role: 'Tutor' as FamilyRole, avatar: memberAvatars[i % memberAvatars.length], activities: 0 }
    }
    return {
      id: typeof m.id === 'string' ? m.id : `m-old-${i}`,
      name: typeof m.name === 'string' && m.name !== '' ? m.name : `Familiar ${i + 1}`,
      role: (['Padre', 'Madre', 'Hijo', 'Hija', 'Tutor', 'Abuelo', 'Abuela'] as FamilyRole[]).includes(m.role as FamilyRole) ? (m.role as FamilyRole) : 'Tutor',
      avatar: typeof m.avatar === 'string' && m.avatar !== '' ? m.avatar : memberAvatars[i % memberAvatars.length],
      activities: typeof m.activities === 'number' ? m.activities : 0,
    }
  })
  return mapped.length > 0 ? mapped : [defaultFamilyMember()]
}

const normalizeFamilyBadges = (raw: unknown): FamilyBadge[] => {
  const arr = Array.isArray(raw) ? (raw as Array<Partial<FamilyBadge>>) : []
  return defaultFamilyBadges.map(def => {
    const found = arr.find(b => b.id === def.id)
    return found ? { ...def, unlocked: found.unlocked === true } : { ...def }
  })
}

const getStoredFamilyProfile = (): FamilyProfile => {
  const stored = localStorage.getItem('hablemos-claro-family-profile')
  if (stored) {
    const parsed = JSON.parse(stored)
    return {
      name: typeof parsed.name === 'string' && parsed.name !== '' ? parsed.name : 'Mi familia',
      members: normalizeMembers(parsed.members),
      familyAvatar: typeof parsed.familyAvatar === 'string' && parsed.familyAvatar !== '' ? parsed.familyAvatar : defaultFamilyAvatar,
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
      familyBadges: normalizeFamilyBadges(parsed.familyBadges),
      activityLog: Array.isArray(parsed.activityLog) ? parsed.activityLog.slice(0, 10) : [],
    }
  }
  return {
    name: 'Mi familia',
    members: [defaultFamilyMember()],
    familyAvatar: defaultFamilyAvatar,
    progress: defaultStudentProgress,
    familyBadges: defaultFamilyBadges.map(b => ({ ...b })),
    activityLog: [],
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

const topicFilters = ['Todos', 'Corrupción', 'Coimas', 'Decisiones', 'Ciudadanía', 'Familia', 'Actividades']

// Biblioteca de temas para hijos y adolescentes
interface KidTopic {
  id: string
  title: string
  desc: string
  icon: string
  category: string
  core: LearningTopic
  body: string[]
  example: string
  scenarioQ: string
  scenarioOpts: string[]
  scenarioCorrect: number
  scenarioWhy: string
  familyPrompt: string
  familyQuestion: string
  relatedGuide: string
  joint?: boolean
}

const KIDS_TOPICS: KidTopic[] = [
  {
    id: 'k1', title: '¿Qué es la corrupción?', desc: 'Descubre qué significa con ejemplos de todos los días.', icon: '🏛️', category: 'Corrupción', core: 'coima',
    body: ['La corrupción es cuando alguien usa su poder o su puesto para conseguir algo injusto, en vez de hacer lo correcto.', 'No es solo cosa de políticos: puede aparecer en la escuela, en el barrio o en cualquier lugar donde alguien haga trampa para ganar.'],
    example: 'Pagar para evitar una multa que sí cometiste es corrupción: rompe las reglas que son para todos.',
    scenarioQ: 'Un compañero te ofrece dinero para que lo dejes copiar tu examen. ¿Qué es eso?',
    scenarioOpts: ['Una ayuda entre amigos', 'Un acto de corrupción', 'Un juego sin importancia'], scenarioCorrect: 1,
    scenarioWhy: 'Es corrupción: se ofrece algo de valor para obtener un beneficio injusto.',
    familyPrompt: 'Hoy aprendí qué es la corrupción.',
    familyQuestion: '¿En qué lugares crees que puede aparecer la corrupción?',
    relatedGuide: 'p1',
  },
  {
    id: 'k2', title: '¿Qué es una coima?', desc: 'Aprende qué es y por qué afecta a otras personas.', icon: '💰', category: 'Coimas', core: 'coima',
    body: ['Una coima es dinero, regalos o favores que se ofrecen para conseguir algo que no corresponde.', 'El problema es que ese beneficio injusto le quita algo a otra persona: un cupo, un servicio, una oportunidad.'],
    example: 'Ofrecer dinero para que te atiendan primero, saltándose a todos los que esperaban.',
    scenarioQ: '¿Cuál de estos es una coima?',
    scenarioOpts: ['Pagar el precio justo en el mercado', 'Dar dinero para obtener un beneficio que no corresponde', 'Devolver algo prestado'], scenarioCorrect: 1,
    scenarioWhy: 'La coima siempre busca un beneficio indebido a cambio de algo de valor.',
    familyPrompt: 'Hoy aprendí qué es una coima.',
    familyQuestion: '¿Por qué crees que una coima puede afectar a otras personas?',
    relatedGuide: 'p2',
  },
  {
    id: 'k3', title: '¿Por qué alguien ofrece una coima?', desc: 'Entiende las razones sin justificar la conducta.', icon: '🤔', category: 'Coimas', core: 'recognition',
    body: ['Algunas personas ofrecen coimas por impaciencia, por querer ganar sin esfuerzo o porque creen que “todos lo hacen”.', 'Ninguna razón lo justifica: entender por qué ocurre nos ayuda a no caer en lo mismo.'],
    example: 'Alguien ofrece dinero para no hacer la fila del trámite porque no quiere esperar.',
    scenarioQ: 'Un amigo dice: “todos pagan para pasar, hay que hacerlo”. ¿Qué piensas?',
    scenarioOpts: ['Tiene razón, hay que adaptarse', 'Que algo sea común no lo hace correcto', 'Depende del monto'], scenarioCorrect: 1,
    scenarioWhy: 'Que muchos lo hagan no lo vuelve correcto ni legal.',
    familyPrompt: 'Hoy pensé por qué la gente ofrece coimas.',
    familyQuestion: '¿Qué responderías si alguien te dice que “todos lo hacen”?',
    relatedGuide: 'p7',
  },
  {
    id: 'k4', title: '¿Qué harías tú?', desc: 'Decide cómo actuar en distintos escenarios.', icon: '🧭', category: 'Decisiones', core: 'impact',
    body: ['En la vida te vas a cruzar con situaciones injustas. Lo importante es detenerte, pensar en las consecuencias y elegir bien.', 'Puedes practicar aquí con casos de mentira para estar listo cuando pase de verdad.'],
    example: 'Te ofrecen un premio por quedarte callado ante algo injusto.',
    scenarioQ: 'Ves que favorecen injustamente a alguien por dinero. ¿Qué haces?',
    scenarioOpts: ['Me quedo callado, no es mi problema', 'Lo comento con un adulto de confianza', 'Pido que también me favorezcan'], scenarioCorrect: 1,
    scenarioWhy: 'Hablar con alguien de confianza es el primer paso para frenar lo injusto.',
    familyPrompt: 'Hoy practiqué cómo actuar ante situaciones injustas.',
    familyQuestion: 'Si vieras algo injusto, ¿a quién se lo contarías primero?',
    relatedGuide: 'p6',
  },
  {
    id: 'k5', title: 'Presión de grupo', desc: 'Aprende a decir que no cuando te presionan.', icon: '🫂', category: 'Decisiones', core: 'prevention',
    body: ['A veces otras personas intentan convencerte de hacer algo incorrecto para “encajar”. Eso se llama presión de grupo.', 'Decir que no es difícil, pero es una muestra de fuerza: puedes proponer otra cosa, alejarte o pedir ayuda.'],
    example: 'Tus amigos te presionan para copiar en un examen y te dicen que si no lo haces eres un traidor.',
    scenarioQ: '¿Qué haces si te presionan para hacer algo incorrecto?',
    scenarioOpts: ['Acepto para no quedar mal', 'Digo que no y me alejo o pido ayuda', 'Lo hago solo una vez'], scenarioCorrect: 1,
    scenarioWhy: 'Decir que no y buscar apoyo es la respuesta valiente y correcta.',
    familyPrompt: 'Hoy aprendí a enfrentar la presión de grupo.',
    familyQuestion: '¿Qué podrías decir si alguien te presiona a hacer algo malo?',
    relatedGuide: 'p7',
  },
  {
    id: 'k6', title: 'Decisiones y consecuencias', desc: 'Tus decisiones pueden afectar a otras personas.', icon: '⚖️', category: 'Decisiones', core: 'consequences',
    body: ['Cada decisión deja una huella: puede ayudar o puede dañar a quienes te rodean.', 'Antes de decidir, pregúntate: ¿a quién afecta esto? ¿me sentiría orgulloso si todos lo supieran?'],
    example: 'Aceptar un beneficio injusto puede dejar sin oportunidad a alguien que sí se lo merecía.',
    scenarioQ: '¿Qué pregunta te ayuda a decidir bien?',
    scenarioOpts: ['¿Me conviene solo a mí?', '¿A quién afecta y sería justo para todos?', '¿Nadie se dará cuenta?'], scenarioCorrect: 1,
    scenarioWhy: 'Pensar en los demás y en lo justo lleva a mejores decisiones.',
    familyPrompt: 'Hoy aprendí que mis decisiones afectan a otros.',
    familyQuestion: '¿Recuerdas una decisión tuya que haya afectado a alguien?',
    relatedGuide: 'p5',
  },
  {
    id: 'k7', title: 'Corrupción en la vida cotidiana', desc: 'Ejemplos cercanos y fáciles de identificar.', icon: '🏪', category: 'Ciudadanía', core: 'impact',
    body: ['La corrupción no solo sale en las noticias: está en favorecer a alguien injustamente o usar una posición para obtener ventajas.', 'Aprender a verla en lo cotidiano te protege: la reconoces antes de que te atrape.'],
    example: 'Un comerciante cobra de más a quien no conoce y le hace “precio especial” solo a sus amigos en un servicio público.',
    scenarioQ: '¿Cuál de estos es un ejemplo cotidiano de corrupción?',
    scenarioOpts: ['Hacer fila y esperar tu turno', 'Usar un cargo para favorecer injustamente a alguien', 'Pedir ayuda con la tarea'], scenarioCorrect: 1,
    scenarioWhy: 'Usar una posición para dar ventajas injustas es corrupción cotidiana.',
    familyPrompt: 'Hoy descubrí la corrupción en la vida diaria.',
    familyQuestion: '¿Has visto alguna situación injusta en tu escuela o barrio?',
    relatedGuide: 'p4',
  },
  {
    id: 'k8', title: '¿Cómo puedo actuar correctamente?', desc: 'Acciones concretas de honestidad y ciudadanía.', icon: '🌟', category: 'Ciudadanía', core: 'ethics',
    body: ['Actuar bien es un hábito: respetar turnos, decir la verdad, devolver lo perdido y tratar a todos con justicia.', 'Cada pequeña acción honesta construye tu reputación y mejora tu comunidad.'],
    example: 'Devuelves el vuelto de más aunque nadie se haya dado cuenta.',
    scenarioQ: '¿Cuál es una acción correcta?',
    scenarioOpts: ['Quedarme con el vuelto de más', 'Devolver lo que no es mío y ser justo', 'Aprovechar si nadie mira'], scenarioCorrect: 1,
    scenarioWhy: 'La honestidad se demuestra cuando nadie está mirando.',
    familyPrompt: 'Hoy aprendí acciones para actuar correctamente.',
    familyQuestion: '¿Qué acción honesta hiciste esta semana?',
    relatedGuide: 'p5',
  },
  {
    id: 'k9', title: 'Mitos sobre las coimas', desc: 'Descubre si estas afirmaciones son verdaderas o falsas.', icon: '❓', category: 'Actividades', core: 'prevention',
    body: ['Mito 1: “una coima pequeña no hace daño” → Falso: toda coima rompe reglas y quita recursos a todos.', 'Mito 2: “si nadie se entera no pasa nada” → Falso: el daño existe aunque nadie lo vea.', 'Mito 3: “así funcionan las cosas” → Falso: las cosas funcionan mejor con honestidad.'],
    example: 'Decir “es solo un poquito” no lo vuelve correcto.',
    scenarioQ: '“Pagar una coima pequeña no hace daño a nadie.” ¿Verdadero o falso?',
    scenarioOpts: ['Verdadero', 'Falso'], scenarioCorrect: 1,
    scenarioWhy: 'Falso: toda coima hace daño y rompe la confianza.',
    familyPrompt: 'Hoy descubrí los mitos de las coimas.',
    familyQuestion: '¿Qué frase has escuchado que normalice las coimas?',
    relatedGuide: 'p8',
  },
  {
    id: 'k10', title: 'Reto familiar', desc: 'Actividad para hacer junto a tu familia.', icon: '👨‍👩‍👧', category: 'Familia', core: 'citizen', joint: true,
    body: ['Este reto se hace en equipo: elige a tu padre, madre o tutor y conversen juntos.', 'Lean la situación, den su opinión cada uno y escriban su compromiso familiar contra las coimas.'],
    example: 'Compromiso: “En nuestra familia hablamos con la verdad y no aceptamos atajos injustos”.',
    scenarioQ: '¿Ya conversaron y escribieron su compromiso familiar?',
    scenarioOpts: ['Todavía no', '¡Sí, lo hicimos juntos!'], scenarioCorrect: 1,
    scenarioWhy: '¡Felicidades! Conversar en familia ya es un gran paso.',
    familyPrompt: 'Hoy hicimos el reto familiar juntos.',
    familyQuestion: '¿Cuál es el compromiso de nuestra familia?',
    relatedGuide: 'p10',
  },
]

// Biblioteca de guías para padres y tutores
interface ParentGuide {
  id: string
  title: string
  desc: string
  icon: string
  category: string
  body: string[]
  questions: string[]
  tip: string
  relatedKid: string
  joint?: boolean
}

const PARENT_GUIDES: ParentGuide[] = [
  {
    id: 'p1', title: 'Comprender la corrupción', desc: 'Conceptos básicos para conversar con adolescentes.', icon: '🏛️', category: 'Corrupción',
    body: ['La corrupción es el uso indebido del poder para obtener beneficios injustos.', 'Para conversarlo con tu hijo, usa ejemplos cercanos: la escuela, el barrio, los servicios que usan a diario.', 'Evita definiciones frías: lo que queda son las historias y los ejemplos.'],
    questions: ['¿Qué entiendes tú por corrupción?', '¿Dónde crees que puede aparecer?', '¿Por qué nos afecta a todos?'],
    tip: 'Empieza con una pregunta, no con un sermón: la curiosidad abre la conversación.',
    relatedKid: 'k1',
  },
  {
    id: 'p2', title: 'Cómo explicar qué es una coima', desc: 'Guía sencilla sin generar confusión.', icon: '💰', category: 'Coimas',
    body: ['Una coima es ofrecer o aceptar algo de valor para conseguir un beneficio indebido.', 'Explícalo con un ejemplo concreto: saltarse una fila pagando, o ganar algo sin merecerlo.', 'Aclara que no importa el monto: pequeña o grande, sigue siendo coima.'],
    questions: ['¿Por qué crees que una coima afecta a otras personas?', '¿Qué diferencia hay entre un regalo y una coima?', '¿Qué harías si te la ofrecen?'],
    tip: 'Usa el ejemplo de la fila: todos entienden lo injusto de saltársela pagando.',
    relatedKid: 'k2',
  },
  {
    id: 'p3', title: 'Cómo conversar sobre corrupción', desc: 'Preguntas y estrategias para iniciar el diálogo.', icon: '💬', category: 'Familia',
    body: ['Elige un momento tranquilo, sin pantallas de por medio.', 'Haz preguntas abiertas: las que empiezan con “qué”, “cómo” o “por qué”.', 'Valida sus opiniones antes de corregir: “qué interesante, cuéntame más”.'],
    questions: ['¿Qué harías tú en esa situación?', '¿Cómo te sentirías si fueras la persona afectada?', '¿Qué valores están en juego aquí?'],
    tip: 'Escucha el 80% del tiempo y habla el 20%: tu hijo debe ser el protagonista.',
    relatedKid: 'k4',
  },
  {
    id: 'p4', title: 'Enseñar con situaciones cotidianas', desc: 'Usa la vida diaria para generar reflexión.', icon: '🏪', category: 'Ciudadanía',
    body: ['Las noticias, la escuela y el barrio están llenos de ejemplos para conversar.', 'Cuando vean algo injusto juntos, pregúntale qué ve y qué haría.', 'Conecta cada ejemplo con un valor: justicia, respeto, honestidad.'],
    questions: ['¿Qué viste y por qué te pareció injusto?', '¿Quién sale afectado?', '¿Cómo se podría haber hecho bien?'],
    tip: 'Lleva un “diario de situaciones”: anoten juntos un ejemplo por semana.',
    relatedKid: 'k7',
  },
  {
    id: 'p5', title: 'Valores y toma de decisiones', desc: 'Responsabilidad, honestidad, respeto y justicia.', icon: '🌟', category: 'Decisiones',
    body: ['Los valores se enseñan con el ejemplo más que con palabras.', 'Narra tus propias decisiones honestas del día en voz alta.', 'Celebra cuando tu hijo elija bien, sobre todo si le costó.'],
    questions: ['¿Qué valor usaste hoy?', '¿Qué fue lo más difícil de decidir bien?', '¿De qué decisión te sientes orgulloso?'],
    tip: 'Refuerza el esfuerzo, no solo el resultado: “me gusta cómo lo pensaste”.',
    relatedKid: 'k6',
  },
  {
    id: 'p6', title: '¿Qué harías en esta situación?', desc: 'Casos familiares para analizar juntos.', icon: '🧭', category: 'Decisiones',
    body: ['Presenta un caso corto y pidan su opinión antes de dar la tuya.', 'Analicen juntos: qué pasa, dónde está el problema y qué decisión sería responsable.', 'Cierren con un compromiso concreto para situaciones parecidas.'],
    questions: ['¿Qué está pasando aquí?', '¿Dónde está el problema?', '¿Qué decisión tomaríamos como familia?'],
    tip: 'No hay una sola respuesta: lo valioso es el razonamiento que construyen juntos.',
    relatedKid: 'k4',
  },
  {
    id: 'p7', title: 'Cómo responder preguntas difíciles', desc: 'Orientación ante dudas sobre corrupción.', icon: '❓', category: 'Coimas',
    body: ['Si no sabes la respuesta, dilo: “averigüémoslo juntos” también enseña.', 'Responde con otra pregunta para conocer qué piensa primero.', 'Si el tema es delicado, valida su emoción antes de explicar.'],
    questions: ['¿Qué te preocupa de eso que preguntas?', '¿Qué crees tú que deberíamos hacer?', '¿A quién más le podríamos preguntar?'],
    tip: 'Nunca te burles de una pregunta: cada duda es una puerta para conversar.',
    relatedKid: 'k3',
  },
  {
    id: 'p8', title: 'Evitar normalizar las coimas', desc: 'Por qué “así funcionan las cosas” hace daño.', icon: '🚫', category: 'Corrupción',
    body: ['Frases como “así funcionan las cosas” enseñan a rendirse ante lo injusto.', 'Cuando escuches esa frase, pregúntale si le gustaría vivir en un lugar donde todo funcione así.', 'Muéstrale ejemplos donde la honestidad sí funcionó.'],
    questions: ['¿Qué pasa si todos pensamos “así son las cosas”?', '¿Conoces a alguien que haya actuado bien aunque costara?', '¿Cómo sería nuestro barrio si nadie hiciera trampa?'],
    tip: 'Cambia el “así son las cosas” por “¿y si lo hacemos bien?”.',
    relatedKid: 'k9',
  },
  {
    id: 'p9', title: 'Acompañamiento familiar', desc: 'Convierte el aprendizaje en conversación.', icon: '🤝', category: 'Familia',
    body: ['Acompañar es estar presente: pregunta qué aprendió y pide que te enseñe.', 'Convierte cada tema en un ritual corto: 10 minutos de conversación después de aprender.', 'Registra los avances juntos revisando las insignias.'],
    questions: ['¿Qué fue lo que más te sorprendió?', '¿Me enseñas lo que aprendiste?', '¿Qué conversamos la próxima vez?'],
    tip: 'Que tu hijo te enseñe a ti: enseñar es la mejor forma de aprender.',
    relatedKid: 'k10',
    joint: true,
  },
  {
    id: 'p10', title: 'Actividades para realizar en familia', desc: 'Dinámicas cortas para padres e hijos.', icon: '🎲', category: 'Actividades',
    body: ['Elijan una situación injusta y represéntenla: cada uno defiende un rol distinto.', 'Escriban su compromiso familiar y péguenlo en un lugar visible.', 'Cierren con algo positivo: ¿qué hicieron bien hoy como familia?'],
    questions: ['¿Qué rol te tocó y cómo te sentiste?', '¿Cuál es nuestro compromiso familiar?', '¿Qué repetimos la próxima semana?'],
    tip: '15 minutos bastan: la constancia vale más que la duración.',
    relatedKid: 'k10',
    joint: true,
  },
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
  const [learnView, setLearnView] = useState<'hub' | 'kids' | 'parents' | 'kid' | 'guide' | 'exam'>('hub')
  const [activeKidId, setActiveKidId] = useState<string | null>(null)
  const [activeGuideId, setActiveGuideId] = useState<string | null>(null)
  const [kidsFilter, setKidsFilter] = useState('Todos')
  const [parentsFilter, setParentsFilter] = useState('Todos')
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
  const [editingFamName, setEditingFamName] = useState(false)
  const [famNameDraft, setFamNameDraft] = useState('')
  const [editingFamAvatar, setEditingFamAvatar] = useState(false)
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberRole, setNewMemberRole] = useState<FamilyRole>('Hijo')
  const [newMemberAvatar, setNewMemberAvatar] = useState('👦')
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null)
  const [memberNameDraft, setMemberNameDraft] = useState('')
  const badgesRef = useRef<HTMLDivElement | null>(null)
  const membersRef = useRef<HTMLDivElement | null>(null)
  const scrollToRef = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
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
  const t = (key: keyof typeof translations['es']) => (translations[language] as Record<string, string>)[key] ?? translations['es'][key]

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

  // Completar un tema (solo cuenta la primera vez) - un solo guardado para no sobrescribir el desbloqueo
  const completeTopic = (topic: LearningTopic, extraPatch?: Partial<UserProgress>, opts?: { forceCount?: boolean; convInc?: number; extraLog?: string }) => {
    const currentProfile = profileType === 'student' ? studentProfile : familyProfile
    const alreadyDone = (currentProfile.progress.topicProgress[topic] ?? 0) >= 100
    const convInc = opts?.convInc ?? 0
    const countNow = (alreadyDone && !(opts?.forceCount ?? false) && convInc === 0) ? 0 : 1
    const completedActivities = currentProfile.progress.completedActivities + countNow
    const newProgress = {
      ...currentProfile.progress,
      ...(extraPatch ?? {}),
      completedActivities,
      totalActivities: Math.max(currentProfile.progress.totalActivities, completedActivities),
      conversations: currentProfile.progress.conversations + convInc,
      topicProgress: {
        ...currentProfile.progress.topicProgress,
        [topic]: 100,
      },
    }
    if (profileType === 'student') {
      setStudentProfile({ ...studentProfile, progress: newProgress })
      saveStudentProfile({ ...studentProfile, progress: newProgress })
    } else {
      let updated: FamilyProfile = { ...familyProfile, progress: newProgress }
      updated = pushFamilyLog(updated, `📚 Tema completado: ${topicTitles[topic]}.`)
      if (opts?.extraLog) updated = pushFamilyLog(updated, opts.extraLog)
      const checked = checkFamilyBadges(updated)
      setFamilyProfile(checked.profile)
      saveFamilyProfile(checked.profile)
      celebrateFamilyBadges(checked.unlocked)
    }
  }

  // Completar un tema de la biblioteca de hijos (suma actividad + conversación si es reto familiar)
  const completeKidTopic = (id: string) => {
    const kt = KIDS_TOPICS.find(k => k.id === id)
    if (!kt) return
    const cur = profileType === 'student' ? studentProfile : familyProfile
    const prevKids = cur.progress.kidsDone ?? []
    if (prevKids.includes(id)) return
    const kidsDone = [...prevKids, id]
    completeTopic(kt.core, { kidsDone }, kt.joint ? { forceCount: true, convInc: 1, extraLog: '💬 Actividad familiar completada juntos.' } : { forceCount: true })
  }

  // Marcar una guía de padres como revisada
  const reviewGuide = (id: string) => {
    const g = PARENT_GUIDES.find(x => x.id === id)
    if (!g) return
    const cur = profileType === 'student' ? studentProfile : familyProfile
    const prev = cur.progress.guidesDone ?? []
    if (prev.includes(id)) return
    const guidesDone = [...prev, id]
    const completedActivities = cur.progress.completedActivities + 1
    const newProgress = {
      ...cur.progress,
      guidesDone,
      completedActivities,
      totalActivities: Math.max(cur.progress.totalActivities, completedActivities),
    }
    if (profileType === 'student') {
      setStudentProfile({ ...studentProfile, progress: newProgress })
      saveStudentProfile({ ...studentProfile, progress: newProgress })
    } else {
      let updated: FamilyProfile = { ...familyProfile, progress: newProgress }
      updated = pushFamilyLog(updated, `📖 Guía revisada: ${g.title}.`)
      const checked = checkFamilyBadges(updated)
      setFamilyProfile(checked.profile)
      saveFamilyProfile(checked.profile)
      celebrateFamilyBadges(checked.unlocked)
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
      let updated: FamilyProfile = { ...familyProfile, progress: newProgress }
      updated = pushFamilyLog(updated, '🏅 ¡Examen final completado!')
      const checked = checkFamilyBadges(updated)
      setFamilyProfile(checked.profile)
      saveFamilyProfile(checked.profile)
      celebrateFamilyBadges(checked.unlocked)
    }
    const champion = newBadges.find(b => b.id === 'integrity-champion')!
    setEarnedBadge({ ...champion })
    setShowBadgeCelebration(true)
  }

  // --- Acciones de integrantes y nombre de familia ---
  const saveFamilyName = () => {
    const name = famNameDraft.trim() === '' ? 'Mi familia' : famNameDraft.trim()
    const updated = { ...familyProfile, name }
    setFamilyProfile(updated)
    saveFamilyProfile(updated)
    setEditingFamName(false)
  }

  const addFamilyMember = () => {
    const name = newMemberName.trim()
    if (name === '') return
    const member: FamilyMember = {
      id: `m-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      name,
      role: newMemberRole,
      avatar: newMemberAvatar,
      activities: 0,
    }
    let updated: FamilyProfile = { ...familyProfile, members: [...familyProfile.members, member] }
    updated = pushFamilyLog(updated, `👤 ${name} se unió a la familia.`)
    const checked = checkFamilyBadges(updated)
    setFamilyProfile(checked.profile)
    saveFamilyProfile(checked.profile)
    celebrateFamilyBadges(checked.unlocked)
    setNewMemberName('')
    setNewMemberRole('Hijo')
    setNewMemberAvatar('👦')
  }

  const registerMemberActivity = (id: string) => {
    const member = familyProfile.members.find(m => m.id === id)
    if (!member) return
    const members = familyProfile.members.map(m => (m.id === id ? { ...m, activities: m.activities + 1 } : m))
    const completedActivities = familyProfile.progress.completedActivities + 1
    const newProgress = {
      ...familyProfile.progress,
      completedActivities,
      totalActivities: Math.max(familyProfile.progress.totalActivities, completedActivities),
    }
    let updated: FamilyProfile = { ...familyProfile, members, progress: newProgress }
    updated = pushFamilyLog(updated, `✅ ${member.name} completó una actividad.`)
    const checked = checkFamilyBadges(updated)
    setFamilyProfile(checked.profile)
    saveFamilyProfile(checked.profile)
    celebrateFamilyBadges(checked.unlocked)
  }

  const saveMemberName = (id: string) => {
    const name = memberNameDraft.trim()
    if (name === '') {
      setEditingMemberId(null)
      return
    }
    const members = familyProfile.members.map(m => (m.id === id ? { ...m, name } : m))
    const updated = { ...familyProfile, members }
    setFamilyProfile(updated)
    saveFamilyProfile(updated)
    setEditingMemberId(null)
  }

  // --- Perfil familiar: actividad reciente e insignias reales ---
  const pushFamilyLog = (profile: FamilyProfile, text: string): FamilyProfile => {
    const entry: ActivityEntry = { id: `log-${Date.now()}-${Math.floor(Math.random() * 10000)}`, text, date: new Date().toLocaleString() }
    return { ...profile, activityLog: [entry, ...profile.activityLog].slice(0, 10) }
  }

  const checkFamilyBadges = (profile: FamilyProfile): { profile: FamilyProfile; unlocked: FamilyBadge[] } => {
    const tp = profile.progress.topicProgress
    const conv = profile.progress.conversations
    const acts = profile.progress.completedActivities
    const shouldUnlock = (id: FamilyBadgeId): boolean => {
      switch (id) {
        case 'first-conversation': return conv >= 1
        case 'first-learning': return acts >= 1
        case 'united-family': return profile.members.length > 0 && profile.members.every(m => m.activities >= 1)
        case 'great-conversationalists': return conv >= 5
        case 'against-corruption': return corruptionTopics.filter(t => (tp[t] ?? 0) >= 100).length >= 3
        case 'committed-family': return mainTopics.every(t => (tp[t] ?? 0) >= 100)
      }
    }
    let updated = profile
    const unlocked: FamilyBadge[] = []
    defaultFamilyBadges.forEach(def => {
      const current = updated.familyBadges.find(b => b.id === def.id)!
      if (!current.unlocked && shouldUnlock(def.id)) {
        const nb = { ...current, unlocked: true }
        updated = { ...updated, familyBadges: updated.familyBadges.map(b => (b.id === def.id ? nb : b)) }
        unlocked.push(nb)
        updated = pushFamilyLog(updated, `🏅 Se desbloqueó la insignia ${nb.name}.`)
      }
    })
    return { profile: updated, unlocked }
  }

  const celebrateFamilyBadges = (unlocked: FamilyBadge[]) => {
    if (unlocked.length === 0) return
    const last = unlocked[unlocked.length - 1]
    setEarnedBadge({ id: 'integrity-champion', name: last.name, emoji: last.emoji, color: '#F59E0B', unlocked: true })
    setShowBadgeCelebration(true)
  }

  const familyProgressPercent = (p: FamilyProfile): number => {
    const topicsDone = mainTopics.filter(t => (p.progress.topicProgress[t] ?? 0) >= 100).length
    const topicsPart = (topicsDone / mainTopics.length) * 60
    const convPart = Math.min(p.progress.conversations / 5, 1) * 20
    const badgePart = p.familyBadges.length > 0 ? (p.familyBadges.filter(b => b.unlocked).length / p.familyBadges.length) * 20 : 0
    return Math.round(topicsPart + convPart + badgePart)
  }

  const completeConversation = () => {
    const currentProfile = profileType === 'student' ? studentProfile : familyProfile
    const newProgress = { ...currentProfile.progress, conversations: currentProfile.progress.conversations + 1 }
    if (profileType === 'student') {
      setStudentProfile({ ...studentProfile, progress: newProgress })
      saveStudentProfile({ ...studentProfile, progress: newProgress })
    } else {
      let updated: FamilyProfile = { ...familyProfile, progress: newProgress }
      updated = pushFamilyLog(updated, '💬 La familia inició una conversación.')
      const checked = checkFamilyBadges(updated)
      setFamilyProfile(checked.profile)
      saveFamilyProfile(checked.profile)
      celebrateFamilyBadges(checked.unlocked)
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
      return (
        <div className="min-h-screen p-6 md:p-10 flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #FFFFFF 50%, #F5F0FF 100%)' }}>
          {/* Fondo decorativo sutil */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-28 -right-20 w-[28rem] h-[28rem] rounded-full bg-secondary/10 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] rounded-full bg-warning/5 blur-3xl" />
            <svg className="absolute top-12 left-[7%] w-16 h-16 text-primary/15 hidden md:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 5.5h16a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H9l-5 4v-4H4a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Z" />
              <circle cx="9" cy="10.5" r="0.6" fill="currentColor" />
              <circle cx="12.5" cy="10.5" r="0.6" fill="currentColor" />
              <circle cx="16" cy="10.5" r="0.6" fill="currentColor" />
            </svg>
            <svg className="absolute bottom-14 right-[8%] w-16 h-16 text-secondary/15 hidden md:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 6c-2-1.5-5-2-8-2v13c3 0 6 .5 8 2 2-1.5 5-2 8-2V4c-3 0-6 .5-8 2Z" />
              <path d="M12 6v13" />
            </svg>
            <svg className="absolute top-1/3 right-[4%] w-8 h-8 text-warning/25 hidden lg:block" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.2 6.6L21 11l-6.8 2.4L12 20l-2.2-6.6L3 11l6.8-2.4L12 2Z" />
            </svg>
            <svg className="absolute bottom-1/4 left-[5%] w-6 h-6 text-success/25 hidden lg:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>

          <button
            onClick={() => setCurrentScreen('welcome')}
            className="absolute top-5 left-5 bg-white/80 backdrop-blur px-4 py-2 rounded-full text-gray-600 text-sm font-bold shadow-sm hover:bg-white hover:text-primary transition-all"
          >
            {t('back')}
          </button>

          <div className="relative w-full max-w-5xl mx-auto animate-slide-up text-center py-6">
            {/* Encabezado */}
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}>
                <svg viewBox="0 0 24 24" className="w-7 h-7" aria-hidden>
                  <path d="M4 5.5h16a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H9l-5 4v-4H4a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Z" fill="#FFFFFF" />
                  <circle cx="9" cy="10.5" r="1.3" fill="#2563EB" />
                  <circle cx="12.5" cy="10.5" r="1.3" fill="#2563EB" />
                  <circle cx="16" cy="10.5" r="1.3" fill="#2563EB" />
                </svg>
              </div>
              <span className="text-2xl font-black text-dark">Hablemos Claro</span>
            </div>
            <p className="text-gray-500 font-medium mb-8">{t('selectTagline')}</p>

            <p className="text-xs font-black tracking-[0.25em] text-secondary mb-2">{t('selectEyebrow')}</p>
            <h1 className="text-3xl md:text-4xl font-black text-dark mb-2">{t('selectTitle')}</h1>
            <p className="text-gray-500 mb-8 max-w-xl mx-auto">{t('welcomeSub')}</p>

            {/* Tarjetas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 text-left">
              <button
                onClick={() => {
                  setProfileType('student')
                  setCurrentScreen('home')
                }}
                className="group bg-white rounded-3xl p-7 md:p-8 shadow-xl border border-gray-100 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl cursor-pointer"
              >
                <div className="rounded-2xl p-4 mb-5 flex justify-center" style={{ background: 'linear-gradient(135deg, #DBEAFE, #EDE9FE)' }}>
                  <svg role="img" aria-label="Ilustración de estudiante aprendiendo" viewBox="0 0 220 170" className="w-full max-w-[230px] h-auto transition-transform duration-300 group-hover:scale-105">
                    <ellipse cx="110" cy="88" rx="92" ry="68" fill="#DBEAFE" />
                    <path d="M150 34l42 14-42 14-42-14 42-14Z" fill="#1F2937" />
                    <path d="M178 52v22" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="178" cy="78" r="4" fill="#F59E0B" />
                    <path d="M40 44l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5 2.5-6Z" fill="#7C3AED" />
                    <circle cx="196" cy="120" r="5" fill="#93C5FD" />
                    <rect x="82" y="106" width="56" height="48" rx="16" fill="#2563EB" />
                    <circle cx="110" cy="74" r="24" fill="#FCD9B8" />
                    <path d="M88 68C88 52 98 46 110 46c12 0 22 6 22 22-6-8-14-10-22-10s-16 2-22 10Z" fill="#1F2937" />
                    <circle cx="102" cy="76" r="2.5" fill="#1F2937" />
                    <circle cx="118" cy="76" r="2.5" fill="#1F2937" />
                    <path d="M104 84q6 5 12 0" stroke="#1F2937" strokeWidth="2" fill="none" strokeLinecap="round" />
                    <path d="M60 128q25-10 50 0v24q-25-10-50 0Z" fill="#FFFFFF" stroke="#BFDBFE" strokeWidth="2" />
                    <path d="M160 128q-25-10-50 0v24q25-10 50 0Z" fill="#FFFFFF" stroke="#BFDBFE" strokeWidth="2" />
                    <path d="M110 128v24" stroke="#BFDBFE" strokeWidth="2" />
                  </svg>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M12 4 22 9l-10 5L2 9l10-5Z" />
                    <path d="M6 11.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5" />
                    <path d="M22 9v6" />
                  </svg>
                  <h2 className="text-lg font-black tracking-wide text-primary">{t('studentCardTitle')}</h2>
                </div>
                <p className="text-gray-600 leading-relaxed mb-6">{t('studentCardDesc')}</p>
                <span className="inline-flex items-center gap-2 bg-primary text-white font-bold py-3 px-6 rounded-full transition-all duration-300 group-hover:gap-3 group-hover:shadow-lg">
                  {t('enterBtn')}
                </span>
              </button>

              <button
                onClick={() => {
                  setProfileType('family')
                  setCurrentScreen('home')
                }}
                className="group bg-white rounded-3xl p-7 md:p-8 shadow-xl border border-gray-100 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl cursor-pointer"
              >
                <div className="rounded-2xl p-4 mb-5 flex justify-center" style={{ background: 'linear-gradient(135deg, #EDE9FE, #FEF3C7)' }}>
                  <svg role="img" aria-label="Ilustración de familia unida" viewBox="0 0 220 170" className="w-full max-w-[230px] h-auto transition-transform duration-300 group-hover:scale-105">
                    <ellipse cx="110" cy="92" rx="95" ry="66" fill="#EDE9FE" />
                    <ellipse cx="110" cy="154" rx="78" ry="9" fill="#DDD6FE" />
                    <path d="M110 32c-6-12-22-12-22 0 0 8 10 14 22 22 12-8 22-14 22-22 0-12-16-12-22 0Z" fill="#EC4899" />
                    <rect x="20" y="26" width="42" height="28" rx="9" fill="#FFFFFF" stroke="#BFDBFE" strokeWidth="2" />
                    <path d="M30 54l5 8 6-8" fill="#FFFFFF" stroke="#BFDBFE" strokeWidth="2" strokeLinejoin="round" />
                    <circle cx="32" cy="40" r="2.5" fill="#7C3AED" />
                    <circle cx="41" cy="40" r="2.5" fill="#7C3AED" />
                    <circle cx="50" cy="40" r="2.5" fill="#7C3AED" />
                    <rect x="46" y="86" width="40" height="60" rx="15" fill="#7C3AED" />
                    <circle cx="66" cy="66" r="19" fill="#FCD9B8" />
                    <path d="M47 66a19 19 0 0 1 38 0Z" fill="#1F2937" />
                    <rect x="96" y="82" width="40" height="64" rx="15" fill="#10B981" />
                    <circle cx="116" cy="62" r="19" fill="#F1C27D" />
                    <path d="M97 62a19 19 0 0 1 38 0Z" fill="#7C4A2D" />
                    <rect x="148" y="108" width="28" height="38" rx="12" fill="#F59E0B" />
                    <circle cx="162" cy="94" r="14" fill="#FCD9B8" />
                    <path d="M148 94a14 14 0 0 1 28 0Z" fill="#1F2937" />
                    <path d="M186 96l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" fill="#F59E0B" />
                  </svg>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <circle cx="9" cy="8" r="3.2" />
                    <path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" />
                    <circle cx="16.8" cy="9" r="2.4" />
                    <path d="M16 14.3c2.6.4 4.3 2 4.7 4.2" />
                  </svg>
                  <h2 className="text-lg font-black tracking-wide text-secondary">{t('familyCardTitle')}</h2>
                </div>
                <p className="text-gray-600 leading-relaxed mb-6">{t('familyCardDesc')}</p>
                <span className="inline-flex items-center gap-2 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 group-hover:gap-3 group-hover:shadow-lg" style={{ background: '#7C3AED' }}>
                  {t('enterBtn')}
                </span>
              </button>
            </div>

            <p className="text-sm font-bold text-gray-500 mb-6">{t('learnTogether')}</p>
            <p className="text-xs text-gray-400 italic">“{t('bottomQuote')}”</p>
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
      const isFamHome = profileType === 'family'
      const homeBadgeCount = isFamHome ? familyProfile.familyBadges.filter(b => b.unlocked).length : unlockedCount
      const homeBadgeTotal = isFamHome ? familyProfile.familyBadges.length : 3
      return (
        <div className="min-h-screen p-8" style={{ background: cust5.backgroundValue, backgroundSize: cust5.backgroundType === 'pattern' ? '50px 50px' : 'cover' }}>
          <div className="max-w-6xl mx-auto animate-slide-up space-y-16">
            
            {/* Header */}
            <div className="bg-white rounded-2xl p-6 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="glass-card px-5 py-3 rounded-xl text-primary font-bold text-xl shadow-lg">
                  🏅 {homeBadgeCount}/{homeBadgeTotal}
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
                <span className="text-lg font-bold text-primary">{homeBadgeCount}/{homeBadgeTotal}</span>
              </div>
              <div className="flex gap-6 mb-8">
                {(isFamHome ? familyProfile.familyBadges : currentProgress.badges).map(badge => (
                  <div key={badge.id} className={`flex-1 text-center p-5 rounded-xl ${badge.unlocked ? 'animate-float' : 'opacity-30 grayscale'}`}>
                    <div className="text-4xl">{badge.emoji}</div>
                    <div className="text-xs font-bold mt-2 truncate">{badge.name}</div>
                  </div>
                ))}
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="progress-bar h-full"
                  style={{ width: `${Math.min((homeBadgeCount / Math.max(homeBadgeTotal, 1)) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Main Grid - 2x2 */}
            <div className="grid grid-cols-2 gap-12">
              <button
                onClick={() => { setLearnView('hub'); setCurrentScreen('learn') }}
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
          kidsExplanation: 'Una coima es cuando alguien ofrece dinero o regalos para conseguir algo que no le corresponde, como saltarse la fila o ganar sin merecerlo. Es una trampa que nos hace daño a todos.',
          kidsExample: 'Un niño ofrece sus juguetes a cambio de que le pasen las respuestas del examen.',
          parentTip: 'Pregúntale a tu hijo qué haría si alguien le ofrece algo a cambio de hacer trampa. Escucha sin juzgar y felicita las respuestas honestas.',
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
          kidsExplanation: 'Puedes darte cuenta cuando algo no está bien: si te piden guardar un secreto, si te apuran para decidir rápido o si te ofrecen un premio por hacer algo injusto.',
          kidsExample: 'Una persona te dice: “no le cuentes a nadie y te doy esto”.',
          parentTip: 'Enseña la regla de oro: “si hay que esconderlo, probablemente está mal”. Practiquen con ejemplos de la vida diaria.',
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
          kidsExplanation: 'Cuando alguien hace trampa con dinero, hay menos dinero para cosas importantes como escuelas, hospitales y parques. Todos salimos perdiendo.',
          kidsExample: 'Si el dinero para arreglar tu escuela se pierde en una coima, tu aula sigue rota.',
          parentTip: 'Conéctalo con su realidad: pregúntale qué le gustaría mejorar en su escuela o barrio y de dónde sale ese dinero.',
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
          kidsExplanation: 'Hacer trampa con dinero es un delito. Quien lo hace puede ir a la cárcel, pagar multas y perder la confianza de todos para siempre.',
          kidsExample: 'Un alcalde que aceptó dinero perdió su trabajo y fue a la cárcel.',
          parentTip: 'Habla de consecuencias sin asustar: enfócate en que las decisiones tienen efectos y en que siempre se puede elegir bien.',
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
          kidsExplanation: 'Tú puedes ayudar a que no haya trampas: conociendo tus derechos, contando lo que está mal y siendo honesto siempre.',
          kidsExample: 'Si ves algo injusto en tu escuela, cuéntaselo a un profesor o a tus padres.',
          parentTip: 'Crea un ambiente donde tu hijo se sienta seguro contándote cosas difíciles. Felicítalo cuando te cuente algo aunque sea incómodo.',
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
          kidsExplanation: 'Ser íntegro es hacer lo correcto aunque nadie te esté mirando, como devolver algo que no es tuyo.',
          kidsExample: 'Encuentras dinero en el patio y lo entregas sin que nadie te lo pida.',
          parentTip: 'Los hijos aprenden mirando: cuenta en voz alta tus propias decisiones honestas del día.',
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
          kidsExplanation: 'Ser un buen ciudadano es cuidar lo que es de todos: participar, respetar las reglas y avisar cuando algo está mal.',
          kidsExample: 'Cuidas el parque de tu barrio y avisas si alguien lo daña.',
          parentTip: 'Llévalo a una actividad comunitaria o revisen juntos una obra del barrio: la participación se aprende participando.',
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
          kidsExplanation: '',
          kidsExample: '',
          parentTip: '',
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

      const kidsDone = getProgress().kidsDone ?? []
      const guidesDone = getProgress().guidesDone ?? []
      const activeKid = KIDS_TOPICS.find(k => k.id === activeKidId) ?? null
      const activeGuide = PARENT_GUIDES.find(g => g.id === activeGuideId) ?? null
      const activeKidCore = activeKid ? topics[activeKid.core] : null
      const examUnlocked = kidsDone.length >= KIDS_TOPICS.length
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
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-4xl">📚</div>
                <div>
                  <h1 className="text-3xl font-bold gradient-text">Explora los temas</h1>
                  <p className="text-gray-600 mt-1">Elige contenidos según tu rol dentro de la familia.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (learnView === 'hub') navigateTo('home')
                  else if (learnView === 'kid') setLearnView('kids')
                  else if (learnView === 'guide') setLearnView('parents')
                  else if (learnView === 'exam') setLearnView('kids')
                  else setLearnView('hub')
                }}
                className="glass-card px-5 py-2 rounded-xl text-gray-500 hover:text-primary text-sm font-medium hover:bg-gray-100 transition-all"
              >
                {learnView === 'hub' ? '← Inicio' : '← Atrás'}
              </button>
            </div>

            {/* HUB */}
            {learnView === 'hub' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <button
                  onClick={() => setLearnView('kids')}
                  className="group bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-left transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer"
                >
                  <div className="w-20 h-20 rounded-3xl mb-5 flex items-center justify-center transition-transform duration-300 group-hover:scale-105" style={{ background: 'linear-gradient(135deg, #DBEAFE, #EDE9FE)' }}>
                    <svg viewBox="0 0 24 24" className="w-10 h-10 text-primary" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M12 4 22 9l-10 5L2 9l10-5Z" />
                      <path d="M6 11.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5" />
                      <path d="M22 9v6" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-black text-primary mb-2">PARA HIJOS</h2>
                  <p className="text-gray-600 leading-relaxed mb-6">Aprende de forma sencilla, interactiva y con ejemplos de situaciones cotidianas.</p>
                  <span className="inline-flex items-center gap-2 bg-primary text-white font-bold py-3 px-6 rounded-full transition-all duration-300 group-hover:gap-3">
                    Explorar temas →
                  </span>
                  <p className="text-sm font-bold text-gray-400 mt-4">{kidsDone.length} de {KIDS_TOPICS.length} completados</p>
                </button>
                <button
                  onClick={() => setLearnView('parents')}
                  className="group bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-left transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer"
                >
                  <div className="w-20 h-20 rounded-3xl mb-5 flex items-center justify-center transition-transform duration-300 group-hover:scale-105" style={{ background: 'linear-gradient(135deg, #EDE9FE, #FEF3C7)' }}>
                    <svg viewBox="0 0 24 24" className="w-10 h-10 text-secondary" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <circle cx="9" cy="8" r="3.2" />
                      <path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" />
                      <circle cx="16.8" cy="9" r="2.4" />
                      <path d="M16 14.3c2.6.4 4.3 2 4.7 4.2" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-black text-secondary mb-2">PARA PADRES Y TUTORES</h2>
                  <p className="text-gray-600 leading-relaxed mb-6">Encuentra herramientas para conversar y acompañar a tus hijos.</p>
                  <span className="inline-flex items-center gap-2 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 group-hover:gap-3" style={{ background: '#7C3AED' }}>
                    Explorar temas →
                  </span>
                  <p className="text-sm font-bold text-gray-400 mt-4">{guidesDone.length} de {PARENT_GUIDES.length} revisados</p>
                </button>
              </div>
            )}

            {/* BIBLIOTECA HIJOS */}
            {learnView === 'kids' && (
              <>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-black text-primary">🧒 Temas para ti</h2>
                    <span className="font-bold text-primary">{kidsDone.length}/{KIDS_TOPICS.length}</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-5">
                    <div className="progress-bar h-full" style={{ width: `${(kidsDone.length / KIDS_TOPICS.length) * 100}%` }}></div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {topicFilters.map(f => (
                      <button
                        key={f}
                        onClick={() => setKidsFilter(f)}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                          kidsFilter === f ? 'bg-primary text-white shadow' : 'bg-gray-100 text-dark hover:bg-gray-200'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {KIDS_TOPICS.filter(k => kidsFilter === 'Todos' || k.category === kidsFilter).map((k, i) => {
                    const done = kidsDone.includes(k.id)
                    return (
                      <button
                        key={k.id}
                        onClick={() => { setActiveKidId(k.id); setLearnView('kid'); setShowFeedback(false); }}
                        className="bg-white rounded-2xl p-6 shadow-sm text-left border border-gray-100 transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center text-4xl shrink-0">
                            {k.icon}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-gray-400">{String(i + 1).padStart(2, '0')} · {k.category}{k.joint ? ' · 👨‍👩‍👧 Juntos' : ''}</p>
                            <h3 className="font-bold text-dark text-lg leading-snug mt-1">{k.title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed mt-1">{k.desc}</p>
                            <span className={`inline-block mt-3 font-bold text-sm px-4 py-2 rounded-full ${done ? 'bg-success/15 text-success' : 'bg-primary text-white'}`}>
                              {done ? '✓ Completado' : 'Comenzar →'}
                            </span>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => { if (examUnlocked) { setActiveKidId(null); setLearnView('exam'); setExamAnswers({}); } }}
                  disabled={!examUnlocked}
                  className={`rounded-2xl p-6 w-full text-left transition-all ${
                    examUnlocked
                      ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl cursor-pointer'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">{examUnlocked ? '📝' : '🔒'}</div>
                    <div>
                      <h3 className="font-black text-xl">Examen final</h3>
                      <p className={`text-sm ${examUnlocked ? 'text-white/85' : ''}`}>
                        {examUnlocked ? '14 preguntas de todos los temas. ¡Consigue tus insignias! →' : `Completa los ${KIDS_TOPICS.length} temas para desbloquearlo`}
                      </p>
                    </div>
                  </div>
                </button>
              </>
            )}

            {/* BIBLIOTECA PADRES */}
            {learnView === 'parents' && (
              <>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-black text-secondary">👨‍👩‍👧 Guías para acompañar</h2>
                    <span className="font-bold text-secondary">{guidesDone.length}/{PARENT_GUIDES.length}</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-5">
                    <div className="h-full rounded-full" style={{ width: `${(guidesDone.length / PARENT_GUIDES.length) * 100}%`, background: 'linear-gradient(90deg, #7C3AED, #EC4899)' }}></div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {topicFilters.map(f => (
                      <button
                        key={f}
                        onClick={() => setParentsFilter(f)}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                          parentsFilter === f ? 'bg-secondary text-white shadow' : 'bg-gray-100 text-dark hover:bg-gray-200'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {PARENT_GUIDES.filter(g => parentsFilter === 'Todos' || g.category === parentsFilter).map((g, i) => {
                    const done = guidesDone.includes(g.id)
                    return (
                      <button
                        key={g.id}
                        onClick={() => { setActiveGuideId(g.id); setLearnView('guide'); }}
                        className="bg-white rounded-2xl p-6 shadow-sm text-left border border-gray-100 transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-3xl shrink-0">
                            {g.icon}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-gray-400">{String(i + 1).padStart(2, '0')} · {g.category}{g.joint ? ' · 👨‍👩‍👧 Juntos' : ''}</p>
                            <h3 className="font-bold text-dark text-lg leading-snug mt-1">{g.title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed mt-1">{g.desc}</p>
                            <span className={`inline-block mt-3 font-bold text-sm px-4 py-2 rounded-full ${done ? 'bg-success/15 text-success' : 'bg-secondary text-white'}`}>
                              {done ? '✓ Revisada' : 'Ver guía →'}
                            </span>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </>
            )}

            {/* DETALLE TEMA HIJO */}
            {learnView === 'kid' && activeKid && (
              <>
                <div className="rounded-2xl p-8 md:p-10 border-2 border-black" style={{ background: '#FFE45E' }}>
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center text-3xl shrink-0">{activeKid.icon}</div>
                      <div>
                        <p className="text-xs font-black text-black/60">{activeKid.category}{activeKid.joint ? ' · 👨‍👩‍👧 JUNTOS' : ''}</p>
                        <h2 className="text-2xl font-black text-black leading-tight">{activeKid.title}</h2>
                      </div>
                    </div>
                    {kidsDone.includes(activeKid.id) && <span className="px-3 py-1 rounded-full bg-black text-white text-xs font-bold shrink-0">✓ Listo</span>}
                  </div>
                  <div className="space-y-4 mb-8">
                    {activeKid.body.map((p, i) => (
                      <p key={i} className="text-black text-lg leading-loose">{p}</p>
                    ))}
                  </div>
                  <div className="p-5 bg-white border-l-4 border-black rounded-xl mb-8">
                    <p className="font-bold text-black mb-2">💡 Ejemplo</p>
                    <p className="text-black leading-loose italic">“{activeKid.example}”</p>
                  </div>
                  {activeKidCore && activeKidCore.keyPoints.length > 0 && (
                    <div className="mb-8">
                      <h3 className="font-bold text-black mb-4">Puntos clave</h3>
                      <ul className="space-y-4">
                        {activeKidCore.keyPoints.map((point, i) => (
                          <li key={i} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-black/10">
                            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold flex-shrink-0">
                              {i + 1}
                            </div>
                            <p className="text-black leading-relaxed">{point}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {activeKidCore && activeKidCore.theorem !== '' && (
                    <div className="p-5 bg-white border-2 border-black rounded-xl mb-8">
                      <p className="font-bold text-black mb-2">⚖️ Principio</p>
                      <p className="text-black leading-loose font-medium">“{activeKidCore.theorem}”</p>
                    </div>
                  )}
                  <div className="bg-white rounded-xl p-6 border border-black/10">
                    <p className="font-bold text-black text-lg mb-4">{activeKid.scenarioQ}</p>
                    <div className="space-y-4">
                      {activeKid.scenarioOpts.map((opt, oi) => (
                        <button
                          key={oi}
                          onClick={() => {
                            const ok = oi === activeKid.scenarioCorrect
                            setFeedbackMessage((ok ? '¡Muy bien! ' : 'Casi… ') + activeKid.scenarioWhy)
                            setShowFeedback(true)
                          }}
                          className="btn-glow w-full py-4 px-5 rounded-xl text-left bg-white border-2 border-gray-200 hover:border-primary/60 font-medium text-dark"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    {showFeedback && (
                      <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20 animate-fade-in">
                        <p className="font-bold text-primary">{feedbackMessage}</p>
                      </div>
                    )}
                  </div>
                  {activeKid.id === 'k4' && (
                    <button
                      onClick={() => { setShowCoimaONo(true); setCurrentCoimaCase(0); setShowFeedback(false); }}
                      className="btn-glow bg-black text-white font-bold py-4 px-6 rounded-xl text-lg w-full mt-8"
                    >
                      🎯 Jugar ¿Coima o no?
                    </button>
                  )}
                  <button
                    onClick={() => completeKidTopic(activeKid.id)}
                    disabled={kidsDone.includes(activeKid.id)}
                    className={`font-bold py-4 px-6 rounded-xl text-lg w-full mt-6 ${
                      kidsDone.includes(activeKid.id)
                        ? 'bg-black text-white cursor-default'
                        : 'btn-glow bg-success text-white'
                    }`}
                  >
                    {kidsDone.includes(activeKid.id) ? '✓ Tema completado' : 'Marcar como terminado ✓'}
                  </button>
                </div>
                <div className="glass-card rounded-2xl p-8">
                  <h3 className="font-bold text-warning text-xl mb-2">💬 Conversarlo en familia</h3>
                  <p className="text-gray-700 italic leading-relaxed">“{activeKid.familyPrompt}”</p>
                  <p className="text-dark font-bold mt-3">Pregunta para conversar: {activeKid.familyQuestion}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <button
                      onClick={() => setCurrentScreen('converse')}
                      className="btn-glow bg-warning text-white font-bold py-4 px-6 rounded-xl"
                    >
                      Iniciar conversación familiar →
                    </button>
                    <button
                      onClick={() => { setActiveGuideId(activeKid.relatedGuide); setLearnView('guide'); setShowFeedback(false); }}
                      className="btn-glow bg-white border-2 border-secondary text-secondary font-bold py-4 px-6 rounded-xl"
                    >
                      Ver guía para padres →
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* DETALLE GUÍA PADRES */}
            {learnView === 'guide' && activeGuide && (
              <>
                <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-gray-100">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-3xl shrink-0">{activeGuide.icon}</div>
                    <div>
                      <p className="text-xs font-black text-gray-400">{activeGuide.category}{activeGuide.joint ? ' · 👨‍👩‍👧 JUNTOS' : ''}</p>
                      <h2 className="text-2xl font-black text-dark leading-tight">{activeGuide.title}</h2>
                      <p className="text-gray-500 mt-1">{activeGuide.desc}</p>
                    </div>
                  </div>
                  <div className="space-y-4 mb-8">
                    {activeGuide.body.map((p, i) => (
                      <p key={i} className="text-gray-700 text-lg leading-relaxed">{p}</p>
                    ))}
                  </div>
                  <div className="bg-secondary/5 rounded-2xl p-6 border border-secondary/15 mb-6">
                    <h3 className="font-bold text-secondary text-lg mb-4">Preguntas para conversar</h3>
                    <ul className="space-y-4">
                      {activeGuide.questions.map((q, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold flex-shrink-0 text-sm">
                            {i + 1}
                          </div>
                          <p className="text-dark leading-relaxed font-medium">{q}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-5 bg-dark rounded-2xl mb-8" style={{ background: '#1F2937' }}>
                    <p className="font-bold text-white mb-2">💡 Consejo</p>
                    <p className="text-white/90 leading-relaxed">{activeGuide.tip}</p>
                  </div>
                  <button
                    onClick={() => reviewGuide(activeGuide.id)}
                    disabled={guidesDone.includes(activeGuide.id)}
                    className={`font-bold py-4 px-6 rounded-xl text-lg w-full ${
                      guidesDone.includes(activeGuide.id)
                        ? 'bg-gray-200 text-gray-500 cursor-default'
                        : 'btn-glow bg-secondary text-white'
                    }`}
                  >
                    {guidesDone.includes(activeGuide.id) ? '✓ Guía revisada' : 'Marcar como revisada ✓'}
                  </button>
                </div>
                <div className="glass-card rounded-2xl p-8">
                  <h3 className="font-bold text-primary text-xl mb-2">👦 Actividad relacionada</h3>
                  <p className="text-gray-600 mb-6">Tu hijo puede trabajar este tema desde su biblioteca.</p>
                  <button
                    onClick={() => { setActiveKidId(activeGuide.relatedKid); setLearnView('kid'); setShowFeedback(false); }}
                    className="btn-glow bg-primary text-white font-bold py-4 px-6 rounded-xl w-full"
                  >
                    Ver tema relacionado →
                  </button>
                </div>
              </>
            )}

            {/* EXAMEN FINAL */}
            {learnView === 'exam' && examUnlocked && (
              <div className="glass-card rounded-2xl p-8">
                <button onClick={() => setLearnView('kids')} className="text-gray-500 hover:text-primary text-sm font-medium mb-4">
                  ← Biblioteca
                </button>
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
              <p className="font-medium">Insignias: {profileType === 'family' ? `${familyProfile.familyBadges.filter(b => b.unlocked).length}/${familyProfile.familyBadges.length}` : `${getBadges().filter(b => b.unlocked).length}/3`} ⭐</p>
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
      const famBadges = familyProfile.familyBadges
      const famUnlocked = famBadges.filter(b => b.unlocked).length
      const famPct = familyProgressPercent(familyProfile)
      const ringC = 2 * Math.PI * 54
      
      return (
        <div className="min-h-screen p-8" style={{ background: cust13.backgroundValue, backgroundSize: cust13.backgroundType === 'pattern' ? '50px 50px' : 'cover' }}>
          <div className="max-w-6xl mx-auto animate-slide-up relative">
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -top-10 -left-10 w-56 h-56 rounded-full bg-secondary/10 blur-2xl" />
              <div className="absolute top-1/3 -right-12 w-64 h-64 rounded-full bg-warning/10 blur-2xl" />
              <div className="absolute bottom-10 left-1/4 w-40 h-40 rounded-full bg-primary/10 blur-2xl" />
              <span className="absolute top-28 right-6 text-3xl opacity-20 animate-float">💬</span>
              <span className="absolute bottom-48 left-4 text-3xl opacity-20 animate-float">📚</span>
              <span className="absolute top-1/2 left-1 text-2xl opacity-20">🤝</span>
              <span className="absolute bottom-24 right-8 text-2xl opacity-20">💡</span>
            </div>
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
                <div className="text-center mb-8 relative">
                  <div className="relative inline-block">
                    <div className="w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg text-6xl overflow-hidden border-4 border-white bg-gradient-to-br from-secondary to-warning">
                      <span className="leading-none">{avatarOrFallback(familyProfile.familyAvatar)}</span>
                    </div>
                    <button
                      onClick={() => setEditingFamAvatar(v => !v)}
                      className="absolute bottom-3 right-0 w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                      aria-label={t('editName')}
                    >
                      ✏️
                    </button>
                  </div>
                  {editingFamAvatar && (
                    <div className="bg-white rounded-2xl px-4 py-4 shadow-sm mb-4 animate-fade-in">
                      <p className="text-sm font-bold text-dark mb-3">Elige el avatar de la familia</p>
                      <div className="flex gap-2 justify-center flex-wrap">
                        {familyAvatarOptions.map(a => (
                          <button
                            key={a}
                            onClick={() => {
                              const updated = { ...familyProfile, familyAvatar: a }
                              setFamilyProfile(updated)
                              saveFamilyProfile(updated)
                              setEditingFamAvatar(false)
                            }}
                            className={`relative w-14 h-14 rounded-full text-3xl flex items-center justify-center transition-all hover:scale-110 ${
                              familyProfile.familyAvatar === a
                                ? 'bg-primary/15 ring-2 ring-primary scale-105'
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            <span className="leading-none">{a}</span>
                            {familyProfile.familyAvatar === a && <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-success text-white text-[10px] flex items-center justify-center font-bold">✓</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="bg-white rounded-2xl px-6 py-5 shadow-sm">
                    {editingFamName ? (
                      <div className="flex gap-2 justify-center">
                        <input
                          type="text"
                          value={famNameDraft}
                          onChange={e => setFamNameDraft(e.target.value)}
                          placeholder="Nombre de la familia"
                          className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-dark focus:outline-none focus:ring-2 focus:ring-primary font-bold text-xl text-center max-w-xs"
                        />
                        <button onClick={saveFamilyName} className="bg-success text-white font-bold px-4 py-2 rounded-xl">✓</button>
                        <button onClick={() => setEditingFamName(false)} className="bg-gray-200 text-gray-600 font-bold px-4 py-2 rounded-xl">✕</button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <h2 className="text-3xl font-bold gradient-text">{familyProfile.name}</h2>
                        <button
                          onClick={() => { setFamNameDraft(familyProfile.name); setEditingFamName(true) }}
                          className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                          aria-label={t('editName')}
                        >
                          ✏️
                        </button>
                      </div>
                    )}
                    <p className="text-gray-600 mt-2">{t('familyTagline')}</p>
                  </div>
                </div>

                {/* Accesos rápidos */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <button onClick={() => setCurrentScreen('learn')} className="glass-card rounded-2xl p-4 font-bold text-primary card-hover">
                    📚 {t('quickActivities')}
                  </button>
                  <button onClick={() => setCurrentScreen('converse')} className="glass-card rounded-2xl p-4 font-bold text-warning card-hover">
                    💬 {t('quickConvos')}
                  </button>
                  <button onClick={() => scrollToRef(badgesRef)} className="glass-card rounded-2xl p-4 font-bold text-secondary card-hover">
                    🏅 {t('quickBadges')}
                  </button>
                  <button onClick={() => scrollToRef(membersRef)} className="glass-card rounded-2xl p-4 font-bold text-success card-hover">
                    👨‍👩‍👧 {t('quickMembers')}
                  </button>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <button onClick={() => scrollToRef(badgesRef)} className="bg-white rounded-2xl p-5 shadow-sm text-center card-hover">
                    <div className="text-3xl mb-1">🏅</div>
                    <div className="text-3xl font-black text-dark">{famUnlocked}/6</div>
                    <div className="text-sm text-gray-500 mt-1">{t('myBadges')}</div>
                  </button>
                  <button onClick={() => setCurrentScreen('learn')} className="bg-white rounded-2xl p-5 shadow-sm text-center card-hover">
                    <div className="text-3xl mb-1">📚</div>
                    <div className="text-3xl font-black text-secondary">{familyProfile.progress.completedActivities}</div>
                    <div className="text-sm text-gray-500 mt-1">{t('activities')}</div>
                  </button>
                  <button onClick={() => setCurrentScreen('converse')} className="bg-white rounded-2xl p-5 shadow-sm text-center card-hover">
                    <div className="text-3xl mb-1">💬</div>
                    <div className="text-3xl font-black text-warning">{familyProfile.progress.conversations}</div>
                    <div className="text-sm text-gray-500 mt-1">{t('conversations')}</div>
                  </button>
                  <button onClick={() => scrollToRef(membersRef)} className="bg-white rounded-2xl p-5 shadow-sm text-center card-hover">
                    <div className="text-3xl mb-1">👨‍👩‍👧</div>
                    <div className="text-3xl font-black text-success">{familyProfile.members.length}</div>
                    <div className="text-sm text-gray-500 mt-1">{t('statMembers')}</div>
                  </button>
                </div>

                {/* Progreso general */}
                <div className="glass-card rounded-2xl p-8 mb-8 text-center">
                  <h3 className="font-bold text-dark text-xl mb-4">{t('generalProgress')}</h3>
                  <div className="flex justify-center">
                    <svg width="150" height="150" viewBox="0 0 140 140">
                      <circle cx="70" cy="70" r="54" fill="none" stroke="#E5E7EB" strokeWidth="14" />
                      <circle
                        cx="70" cy="70" r="54" fill="none" stroke="#8B5CF6" strokeWidth="14" strokeLinecap="round"
                        strokeDasharray={ringC}
                        strokeDashoffset={ringC - (ringC * famPct) / 100}
                        transform="rotate(-90 70 70)"
                        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                      />
                      <text x="70" y="80" textAnchor="middle" fontSize="28" fontWeight="900" fill="#1F2937">{famPct}%</text>
                    </svg>
                  </div>
                  <p className="text-gray-500 mt-4">{t('progressHint')}</p>
                </div>

                {/* Mis insignias */}
                <div ref={badgesRef} className="glass-card rounded-2xl p-8 mb-8 scroll-mt-4 relative overflow-hidden">
                  <span aria-hidden className="pointer-events-none absolute top-3 right-5 text-xl opacity-30 animate-float">✨</span>
                  <span aria-hidden className="pointer-events-none absolute top-3 left-5 text-xl opacity-30">🌟</span>
                  <h3 className="font-bold text-dark text-xl mb-1">🏅 {t('myBadges')}</h3>
                  <p className="text-gray-500 mb-6">{famUnlocked} de 6 desbloqueadas</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                    {famBadges.map(b => (
                      <div
                        key={b.id}
                        className={`rounded-2xl p-5 text-center border-2 ${
                          b.unlocked
                            ? 'bg-white border-warning shadow-lg'
                            : 'bg-gray-50 border-dashed border-gray-300'
                        }`}
                      >
                        <div className="relative inline-block">
                          <div className={`text-5xl mb-2 ${b.unlocked ? 'animate-float' : 'grayscale opacity-50'}`}>{b.emoji}</div>
                          {!b.unlocked && <div className="absolute -top-1 -right-1 text-lg">🔒</div>}
                        </div>
                        <div className="font-bold text-dark">{b.name}</div>
                        <div className="text-xs text-gray-500 mt-1 leading-snug">{b.desc}</div>
                        <div className={`text-xs font-bold mt-2 ${b.unlocked ? 'text-success' : 'text-gray-400'}`}>
                          {b.unlocked ? `✓ ${t('unlockedBadge')}` : t('lockedBadge')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actividad reciente */}
                <div className="glass-card rounded-2xl p-8 mb-8">
                  <h3 className="font-bold text-dark text-xl mb-4">🕘 {t('recentActivity')}</h3>
                  {familyProfile.activityLog.length === 0 ? (
                    <p className="text-gray-500">{t('noActivity')}</p>
                  ) : (
                    <ul className="space-y-3">
                      {familyProfile.activityLog.slice(0, 6).map(e => (
                        <li key={e.id} className="bg-white rounded-xl px-4 py-3 shadow-sm">
                          <p className="text-dark font-medium">{e.text}</p>
                          <p className="text-xs text-gray-400">{e.date}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Integrantes */}
                <div ref={membersRef} className="glass-card rounded-2xl p-8 mb-8 scroll-mt-4">
                  <h3 className="font-bold text-dark text-xl mb-6">👨‍👩‍👧 {t('membersTitle')} ({familyProfile.members.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-8">
                    {familyProfile.members.map(m => (
                      <div key={m.id} className="bg-white rounded-2xl p-5 shadow-sm text-center border border-gray-100 transition-transform hover:-translate-y-1">
                        <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-4xl bg-gradient-to-br from-primary/15 to-secondary/15 border-2 border-white shadow overflow-hidden">
                          <span className="leading-none">{avatarOrFallback(m.avatar)}</span>
                        </div>
                        {editingMemberId === m.id ? (
                          <div className="flex gap-1 justify-center mb-2">
                            <input
                              type="text"
                              value={memberNameDraft}
                              onChange={e => setMemberNameDraft(e.target.value)}
                              className="w-full px-2 py-1 rounded-lg border border-gray-200 text-dark font-bold text-center"
                            />
                            <button onClick={() => saveMemberName(m.id)} className="bg-success text-white font-bold px-3 py-1 rounded-lg">✓</button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <p className="font-bold text-dark">{m.name}</p>
                            <button
                              onClick={() => { setEditingMemberId(m.id); setMemberNameDraft(m.name) }}
                              className="text-xs text-gray-400 hover:text-primary"
                              aria-label={t('editName')}
                            >
                              ✏️
                            </button>
                          </div>
                        )}
                        <span className="inline-block px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold mt-2">{m.role}</span>
                        <p className="text-sm text-gray-500 mt-2">{m.activities} actividades</p>
                        <button
                          onClick={() => registerMemberActivity(m.id)}
                          className="mt-3 w-full bg-success text-white font-bold py-2 px-4 rounded-xl text-sm"
                        >
                          {t('registerActivity')}
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white rounded-2xl p-5 border-2 border-dashed border-gray-300">
                    <h4 className="font-bold text-dark mb-4">{t('addMember')}</h4>
                    <input
                      type="text"
                      value={newMemberName}
                      onChange={e => setNewMemberName(e.target.value)}
                      placeholder={t('memberNamePh')}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-dark focus:outline-none focus:ring-2 focus:ring-primary font-medium mb-3"
                    />
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <p className="text-sm font-medium text-dark mb-2">{t('memberRole')}</p>
                        <select
                          value={newMemberRole}
                          onChange={e => {
                            const role = e.target.value as FamilyRole
                            setNewMemberRole(role)
                            setNewMemberAvatar(roleAvatar[role])
                          }}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-dark font-medium"
                        >
                          {familyRoles.map(r => (
                            <option key={r} value={r}>{roleAvatar[r]} {r}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-dark mb-2">{t('memberAvatar')}</p>
                        <div className="flex gap-2 flex-wrap">
                          {memberAvatars.map(a => (
                            <button
                              key={a}
                              onClick={() => setNewMemberAvatar(a)}
                              className={`relative w-11 h-11 rounded-full text-2xl flex items-center justify-center transition-all hover:scale-110 ${
                                newMemberAvatar === a
                                  ? 'bg-primary/15 ring-2 ring-primary scale-105'
                                  : 'bg-gray-100 hover:bg-gray-200'
                              }`}
                            >
                              <span className="leading-none">{a}</span>
                              {newMemberAvatar === a && <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-success text-white text-[9px] flex items-center justify-center font-bold">✓</span>}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={addFamilyMember}
                      disabled={newMemberName.trim() === ''}
                      className={`font-bold py-3 px-6 rounded-xl w-full ${
                        newMemberName.trim() === ''
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'btn-glow bg-primary text-white'
                      }`}
                    >
                      {t('add')}
                    </button>
                  </div>
                </div>

                <div className="mt-6">
                  <button onClick={() => setCurrentScreen('home')} className="btn-glow bg-primary text-white font-bold py-4 px-6 rounded-xl text-lg w-full">
                    {t('backHome')}
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

            <button
              onClick={() => {
                const url = photoUrl.trim()
                setTempPhoto(url !== '' ? url : studentProfile.photo)
                const updated = {
                  ...studentProfile,
                  photo: url !== '' ? url : studentProfile.photo,
                  photoPos: posDraft,
                }
                setStudentProfile(updated)
                saveStudentProfile(updated)
                setEditPhotoModal(false)
              }}
              className="btn-glow bg-success text-white font-bold py-3 px-6 rounded-xl w-full"
            >
              💾 Guardar foto ✓
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