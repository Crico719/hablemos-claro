import { useState, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import './index.css'

// Tipos para la aplicación
type UserRole = 'parent' | 'child'
type LearningTopic = 'coima' | 'recognition' | 'impact' | 'consequences' | 'prevention' | 'ethics' | 'citizen' | 'test'
type BadgeType = 'topics-explorer' | 'game-master' | 'integrity-champion'
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
  type: 'closed' | 'open'
  question: string
  kidQuestion: string
  parentQuestion?: string
  kidOptions?: string[]
  parentOptions?: string[]
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
]

const defaultFamilyBadges: FamilyBadge[] = [
  { id: 'first-conversation', name: 'Primera conversación', emoji: '🏅', desc: 'Completa la primera conversación familiar', unlocked: false },
  { id: 'first-learning', name: 'Primer aprendizaje', emoji: '📚', desc: 'Completa la primera actividad educativa', unlocked: false },
  { id: 'united-family', name: 'Familia unida', emoji: '👨‍👩‍👧‍👦', desc: 'Todos los integrantes participan en una actividad', unlocked: false },
  { id: 'great-conversationalists', name: 'Grandes conversadores', emoji: '💬', desc: 'Completa 5 conversaciones familiares', unlocked: false },
  { id: 'against-corruption', name: 'Contra la corrupción', emoji: '🛡️', desc: 'Completa 3 actividades sobre coimas y corrupción', unlocked: false },
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
   { name: 'Enfoque Neutro', type: 'gradient', value: 'linear-gradient(135deg, #374151 0%, #4b5563 50%, #6b7280 100%)' },
   { name: 'Enfoque Suave', type: 'gradient', value: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)' },
   { name: 'Zen Claro', type: 'solid', value: '#f1f5f9' },
   { name: 'Zen Oscuro', type: 'solid', value: '#1e293b' },
   { name: 'Papel', type: 'solid', value: '#fefce8' },
   { name: 'Menta', type: 'solid', value: '#f0fdf4' },
   { name: 'Lavanda', type: 'solid', value: '#faf5ff' },
   { name: 'Amanecer', type: 'gradient', value: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 50%, #faf5ff 100%)' },
   { name: 'Ocre', type: 'gradient', value: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fef9e7 100%)' },
   { name: 'Noche', type: 'gradient', value: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #0f172a 100%)' },
   { name: 'Tierra', type: 'gradient', value: 'linear-gradient(135deg, #7c2d12 0%, #9a3412 50%, #3b1500 100%)' },
   { name: 'Cereza', type: 'gradient', value: 'linear-gradient(135deg, #fce7f3 0%, #f9a8d4 50%, #faf5ff 100%)' },
   { name: 'Melocotón', type: 'gradient', value: 'linear-gradient(135deg, #ffedd5 0%, #fdba74 50%, #fefce8 100%)' },
   { name: 'Hielo', type: 'solid', value: '#f8fafc' },
   { name: 'Nieve', type: 'solid', value: '#ffffff' },
   { name: 'Loto', type: 'solid', value: '#fdf4ff' },
 ]

// Determina colores de texto según el fondo del tema (oscuro = blanco, claro = oscuro)
 const getTextColorForTheme = (backgroundValue: string): { primary: string; secondary: string; cardBg: string; label: string; border: string } => {
   const isLight = ['#f1f5f9', '#fefce8', '#f0fdf4', '#faf5ff', '#f8fafc', '#e2e8f0', '#cbd5e1', '#fef9e7', '#fef3c7', '#fdf4ff'].some(c => backgroundValue.includes(c)) ||
     backgroundValue.includes('#f8fafc') || backgroundValue.includes('#f1f5f9') || backgroundValue.includes('#fefce8') ||
     backgroundValue.includes('#f0fdf4') || backgroundValue.includes('#faf5ff') || backgroundValue.includes('white') ||
     backgroundValue.includes('#cbd5e1') || backgroundValue.includes('#e2e8f0') || backgroundValue.includes('#fef9e7') ||
     backgroundValue.includes('#fdf4ff')
   if (isLight) {
     return { primary: '#1e293b', secondary: '#475569', cardBg: '#ffffff', label: '#334155', border: '#cbd5e1' }
   }
   return { primary: '#ffffff', secondary: '#cbd5e1', cardBg: 'rgba(255,255,255,0.15)', label: '#f1f5f9', border: 'rgba(255,255,255,0.2)' }
 }

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
    homeNav: 'Inicio',
    homeSubtitle: 'Continúa donde lo dejaste',
    learnSection: 'Aprender',
    practiceSection: 'Practicar',
    myProgressSection: 'Mi perfil',
    continueLearning: 'Continuar aprendiendo',
    viewActivity: 'Ver actividad',
    topicsProgressLabel: 'Progreso en temas',
    completedLabel: 'temas completados',
    continueLesson: 'Continuar lección',
    nextStepLabel: 'Tu siguiente paso',
    allDone: '¡Lo lograste! Completaste todo tu camino de aprendizaje. 🎉',
    goalAlmost: '¡Muy cerca! Te falta poco para completar tu nivel.',
    goalKeepGoing: 'Sigue con tus lecciones para completar tu nivel.',
    recommendationTitle: 'Recomendación del día',
    goToTopic: 'Ir al tema',
    yourProgress: 'Tu progreso',
    learningPath: 'Tu ruta de aprendizaje',
    next: 'Siguiente',
    pendingState: 'Pendiente',
    completedState: 'Completado',
    achievements: 'Mis logros',
    nextBadgeLabel: 'Próxima insignia',
    familyActivityLabel: 'Actividad familiar',
    lessonWord: 'Lección',
    explore: 'Explorar',
    seeAll: 'Ver todos',
    carouselAria: 'Carrusel del inicio',
    slideDiscoverPill: 'Descubre',
    slideDiscoverTitle: 'Aprende y descubre',
    slideDiscoverDesc: 'Explora los temas y materiales disponibles.',
    slidePlayPill: 'Juega',
    slidePlayTitle: 'Pon a prueba lo que sabes',
    slidePlayDesc: 'Juega y avanza en tu camino hacia la integridad.',
    slidePlayBtn: 'Jugar ahora',
    slideFamilyPill: 'En familia',
    viewMore: 'Ver más',
    slidePrev: 'Anterior',
    slideNext: 'Siguiente',
    heroEyebrow: '✨ Tu espacio de aprendizaje',
    heroTitle: 'Aprende, conversa y toma decisiones justas',
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
    homeNav: 'Wasipi',
    homeSubtitle: 'Saqillasqaykimanta katichiy',
    learnSection: 'Yachay',
    practiceSection: 'Kamachiy',
    myProgressSection: 'Kayniymi',
    continueLearning: 'Yachayta katichiy',
    viewActivity: 'Ruwayta rikuy',
    topicsProgressLabel: 'Yachaykuna progreso',
    completedLabel: 'yachaykuna tukukusqa',
    continueLesson: 'Yachayta katichiy',
    nextStepLabel: 'Qatiq ruwayki',
    allDone: '¡Atiyki! Tukuy yachay ñanniykita tukukuykurqanki. 🎉',
    goalAlmost: '¡Ñakaña! Pisillamanta puchun nivelniykita tukukuykunaykipaq.',
    goalKeepGoing: 'Yachaykunaykita qatiy nivelniykita tukukuykunaykipaq.',
    recommendationTitle: 'Kunan punchaw willakuq',
    goToTopic: 'Yachayman risun',
    yourProgress: 'Progresoyki',
    learningPath: 'Yachay ñanniyki',
    next: 'Qatiq',
    pendingState: 'Manaraq',
    completedState: 'Tukukusqa',
    achievements: 'Atiyniykuna',
    quickBadges: 'Insigniykuna',
    nextBadgeLabel: 'Qatiq insignia',
    familyActivityLabel: 'Ayllu ruway',
    lessonWord: 'Yachay',
    explore: 'Qhaway',
    seeAll: 'Tukuyta rikuy',
    carouselAria: 'Qallariy carrusel',
    slideDiscoverPill: 'Riqsiy',
    slideDiscoverTitle: 'Yachay, riqsiy',
    slideDiscoverDesc: 'Yachaykunata qhaway yachayta qatiy.',
    slidePlayPill: 'Pukllay',
    slidePlayTitle: 'Yachasqaykita riqsichiy',
    slidePlayDesc: 'Pukllaspa yachay allin kawsayman.',
    slidePlayBtn: 'Kunan pukllay',
    slideFamilyPill: 'Ayllupawan',
    viewMore: 'Aswanta rikuy',
    slidePrev: 'Ñawpaqman',
    slideNext: 'Qatiqman',
    heroEyebrow: '✨ Yachayninkipa wasin',
    heroTitle: 'Yachay, rimay, allin yuyayta churakuy',
  },
}

 const defaultCustomization: ProfileCustomization = {
   themeColor: '#2563EB',
   backgroundType: 'solid',
   backgroundValue: '#ffffff',
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



// Biblioteca de temas para hijos y adolescentes
interface KidTopic {
  id: string
  title: string
  desc: string
  icon: string
  art: 'scale' | 'paths' | 'hands' | 'shield' | 'chat'
  category: string
  core: LearningTopic
  summary: string
  deepen?: string
  shortTerm?: string
  longTerm?: string
  affectsPeople?: string
  affectsCommunity?: string
  affectsCountry?: string
  identify?: { text: string; isCorruption: boolean; why: string }[]
  reflectMore?: string[]
  trueFalse?: { text: string; answer: boolean; why: string }[]
  blanks?: { before: string; answer: string; after: string }[]
  wordBank?: string[]
  beyond?: string[]
  problems: string[]
  compareA?: string
  compareB?: string
  compareNote?: string
  body: string[]
  example: string
  observe: string
  reflectQ: string
  finalTask: string
  scenarioQ: string
  scenarioOpts: string[]
  scenarioCorrect: number
  scenarioFeedback: string[]
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
    art: 'scale',
    summary: 'La corrupción es usar un poder o una posición para conseguir algo injusto.',
    problems: ['Rompe reglas que son para todos: cuando alguien hace trampa, las normas dejan de proteger a quienes sí las cumplen.', 'Da ventajas injustas a algunos: quien hace trampa consigue lugares, premios o servicios que le tocaban a otra persona.', 'Debilita la confianza: si la gente cree que todo está arreglado, deja de participar y de creer en su escuela, su barrio y su país.'],
    observe: 'En el recreo, un grupo paga a otro para usar primero la cancha, aunque no era su turno.',
    reflectQ: '¿A quiénes afecta que unos pocos se salten las reglas?',
    finalTask: 'Cuéntale a alguien de tu familia un ejemplo de corrupción que hayas visto o imaginado.',
    scenarioQ: 'Un compañero te ofrece dinero para que ignores una regla del juego. ¿Qué haces?',
    scenarioOpts: ['Acepto el dinero', 'Digo que no y sigo las reglas', 'Acepto pero no digo nada'], scenarioCorrect: 1,
    scenarioFeedback: [
      'Aceptar te hace parte de la trampa y otros salen perdiendo.',
      'Bien: decir que no mantiene el juego justo para todos.',
      'Quedarte callado deja que la trampa siga.'
    ],
    familyPrompt: 'Hoy aprendí qué es la corrupción.',
    familyQuestion: '¿En qué lugares crees que puede aparecer la corrupción?',
    deepen: 'Ocurre cuando alguien pone su interés personal por encima de lo justo. Muchas veces empieza con algo pequeño, como colarse en una fila, y crece si nadie dice nada.',
    shortTerm: 'A corto plazo, alguien pierde su turno, su premio o su oportunidad, y se siente triste o enojado por la injusticia.',
    longTerm: 'A largo plazo, si nadie la frena, la corrupción se vuelve costumbre: los servicios empeoran y la gente deja de confiar.',
    affectsPeople: 'A ti y a tu familia: pueden quitarte un cupo, un premio o un servicio que te correspondía.',
    affectsCommunity: 'A tu escuela y tu barrio: las reglas dejan de cumplirse y el ambiente se vuelve injusto para todos.',
    affectsCountry: 'Al país: se pierden recursos para hospitales, escuelas y caminos, y todos vivimos peor.',
    identify: [
      { text: 'Un funcionario pide dinero para agilizar un trámite → ¿es corrupción?', isCorruption: true, why: 'Pedir dinero para hacer su trabajo es usar su puesto para beneficio propio.' },
      { text: 'Una niña ayuda a su amiga con la tarea sin pedir nada a cambio → ¿es corrupción?', isCorruption: false, why: 'Ayudar sin pedir nada a cambio es solidaridad, no corrupción.' },
      { text: 'Un árbitro cobra para favorecer a un equipo en la final → ¿es corrupción?', isCorruption: true, why: 'Rompe las reglas del juego para beneficiar a unos y perjudicar a otros.' },
      { text: 'Un médico atiende a los pacientes en orden de llegada → ¿es corrupción?', isCorruption: false, why: 'Atender por orden es justo: nadie recibe ventajas indebidas.' },
    ],
    reflectMore: ['¿Por qué la corrupción rompe la confianza entre las personas?', '¿Qué sentirías si te quitaran algo que te ganaste con esfuerzo?', '¿Qué puedes hacer tú cuando veas algo injusto?'],
    trueFalse: [
      { text: 'La corrupción solo la hacen los políticos.', answer: false, why: 'Puede aparecer en la escuela, el barrio o cualquier lugar.' },
      { text: 'Usar un puesto para conseguir ventajas injustas es corrupción.', answer: true, why: 'Esa es justamente su definición.' },
      { text: 'Si nadie se entera, no hay daño.', answer: false, why: 'El daño existe aunque nadie lo vea: alguien pierde algo.' },
      { text: 'Decir la verdad ayuda a frenar la corrupción.', answer: true, why: 'Hablar y reportar es el primer paso para detenerla.' },
      { text: 'Las reglas están para proteger a todos por igual.', answer: true, why: 'Por eso romperlas para ganar ventaja es injusto.' },
    ],
    blanks: [
      { before: 'La corrupción es usar el', answer: 'poder', after: 'para conseguir algo injusto.' },
      { before: 'Cuando alguien hace trampa, rompe las', answer: 'reglas', after: 'que son para todos.' },
      { before: 'La corrupción debilita la', answer: 'confianza', after: 'entre las personas.' },
    ],
    wordBank: ['poder', 'reglas', 'confianza', 'dinero'],
    beyond: ['La transparencia es mostrar con claridad cómo se usan los recursos y se toman las decisiones; así nadie puede hacer trampa a escondidas.', 'La rendición de cuentas significa explicar qué hiciste con lo que te confiaron, como el dinero de un grupo o una tarea encargada.', 'La ética es hacer lo correcto aunque nadie mire; la ley lo exige por escrito. Cuando se juntan, la sociedad funciona mejor.', 'Acción justa: esperar tu turno en la fila. Acción injusta: pagar para pasar primero. La diferencia está en respetar a los demás.'],
    relatedGuide: 'p1',
  },
  {
    id: 'k2', title: '¿Qué es una coima?', desc: 'Aprende qué es y por qué afecta a otras personas.', icon: '💰', category: 'Coimas', core: 'coima',
    body: ['Una coima es dinero, regalos o favores que se ofrecen para conseguir algo que no corresponde.', 'El problema es que ese beneficio injusto le quita algo a otra persona: un cupo, un servicio, una oportunidad.'],
    example: 'Ofrecer dinero para que te atiendan primero, saltándose a todos los que esperaban.',
    art: 'hands',
    summary: 'Una coima es ofrecer o entregar dinero, un regalo o un favor para obtener una ventaja que no corresponde. Aunque parezca una solución rápida, puede ser injusta y afectar a otras personas.',
    problems: ['Rompe las reglas: la coima salta las normas que ordenan quién va primero o quién merece algo.', 'Da una ventaja injusta: quien paga pasa adelante aunque no le corresponda.', 'Puede perjudicar a otras personas: cada ventaja indebida le quita algo a alguien que esperaba su turno.', 'Debilita la confianza: cuando pagar se vuelve normal, nadie cree en las reglas.'],
    compareA: 'Corrupción: uso indebido del poder o de una posición para obtener un beneficio personal.',
    compareB: 'Coima: dinero, regalo o favor que se ofrece o entrega para conseguir una ventaja indebida.',
    compareNote: 'La coima es una forma de corrupción, pero no toda corrupción ocurre mediante una coima.',
    observe: 'Una persona ofrece dinero para evitar una multa que sí debe pagar.',
    reflectQ: 'Si aceptas algo injusto una vez, ¿será más fácil aceptar la próxima?',
    finalTask: 'Escribe con tus palabras qué es una coima y por qué hace daño.',
    scenarioQ: 'Tu amigo te dice que puede pagar para evitar una multa. ¿Qué opción elegirías?',
    scenarioOpts: ['Aceptar porque todos lo hacen', 'Decir que no y respetar las reglas', 'No decir nada', 'Preguntar a un adulto de confianza'], scenarioCorrect: 1,
    scenarioFeedback: [
      'Si todos lo hacen, el daño se reparte entre todos: menos recursos y menos confianza.',
      'Buena decisión. Respetar las reglas ayuda a que todas las personas reciban un trato justo.',
      'Guardar silencio deja que lo injusto siga pasando y puede volverse costumbre.',
      'Muy bien: pedir ayuda a un adulto de confianza es una forma valiente y segura de actuar.'
    ],
    familyPrompt: 'Hoy aprendí qué es una coima.',
    familyQuestion: '¿Por qué crees que una coima puede afectar a otras personas?',
    deepen: 'Ocurre porque alguien quiere algo rápido sin ganárselo, y otra persona acepta a cambio de dinero o favores. Las dos partes rompen las reglas, aunque solo una haya ofrecido.',
    shortTerm: 'A corto plazo, quienes esperaban su turno pierden tiempo y oportunidades, y se sienten tratados injustamente.',
    longTerm: 'A largo plazo, si las coimas se vuelven normales, los servicios se reparten por dinero y no por necesidad o mérito.',
    affectsPeople: 'A ti y a tu familia: pueden atenderte después o negarte algo que te tocaba, solo porque otro pagó.',
    affectsCommunity: 'A tu comunidad: los trámites y servicios se vuelven lentos e injustos para quienes no pagan.',
    affectsCountry: 'Al país: el dinero de las coimas se pierde en bolsillos privados en vez de usarse en obras y servicios.',
    identify: [
      { text: 'Un conductor ofrece dinero al policía para que no le ponga la multa → ¿es corrupción?', isCorruption: true, why: 'Es una coima: dinero a cambio de evitar una sanción justa.' },
      { text: 'Una abuela le regala frutas al vecino por ayudarla → ¿es corrupción?', isCorruption: false, why: 'Es agradecimiento sincero, no busca una ventaja indebida.' },
      { text: 'Un padre paga para que su hijo entre a un equipo sin hacer la prueba → ¿es corrupción?', isCorruption: true, why: 'Compra un lugar que otro niño se habría ganado con esfuerzo.' },
      { text: 'Un estudiante felicita a su compañero por ganar limpiamente → ¿es corrupción?', isCorruption: false, why: 'Reconocer el mérito ajeno es justo y honesto.' },
    ],
    reflectMore: ['¿Por qué una solución rápida e injusta termina dañando a más personas?', '¿Qué diferencia hay entre un regalo sincero y una coima?', '¿Qué harías si alguien te ofrece algo a cambio de romper una regla?'],
    trueFalse: [
      { text: 'Una coima siempre es dinero en efectivo.', answer: false, why: 'También puede ser un regalo, un favor o una promesa.' },
      { text: 'Aceptar una coima también es corrupción.', answer: true, why: 'Quien ofrece y quien acepta rompen las reglas.' },
      { text: 'Si la coima es pequeña, no afecta a nadie.', answer: false, why: 'Toda ventaja indebida le quita algo a otra persona.' },
      { text: 'Decir que no a una coima protege a los demás.', answer: true, why: 'Tu negativa mantiene el trato justo para todos.' },
      { text: 'Pedir ayuda a un adulto ante una coima es de valientes.', answer: true, why: 'Buscar apoyo es la forma segura de actuar bien.' },
    ],
    blanks: [
      { before: 'Una coima es dinero, un regalo o un', answer: 'favor', after: 'para lograr algo indebido.' },
      { before: 'Quien ofrece y quien', answer: 'acepta', after: 'una coima rompen las reglas.' },
      { before: 'Decir que no a una coima mantiene el trato', answer: 'justo', after: 'para todos.' },
    ],
    wordBank: ['favor', 'acepta', 'justo', 'regalo'],
    beyond: ['La transparencia importa porque cuando todo se hace a la vista, es mucho más difícil pedir o aceptar coimas.', 'Rendir cuentas es explicar en qué se usó cada recurso: así se nota si algo se desvió por una coima.', 'La ética te dice que no aceptes ventajas indebidas; la ley lo castiga. Las dos te protegen.', 'Acción justa: ganar un puesto con tu esfuerzo. Acción injusta: comprarlo con una coima.'],
    relatedGuide: 'p2',
  },
  {
    id: 'k3', title: '¿Por qué alguien ofrece una coima?', desc: 'Entiende las razones sin justificar la conducta.', icon: '🤔', category: 'Coimas', core: 'recognition',
    body: ['Algunas personas ofrecen coimas por impaciencia, por querer ganar sin esfuerzo o porque creen que “todos lo hacen”.', 'Ninguna razón lo justifica: entender por qué ocurre nos ayuda a no caer en lo mismo.'],
    example: 'Alguien ofrece dinero para no hacer la fila del trámite porque no quiere esperar.',
    art: 'paths',
    summary: 'Algunas personas ofrecen coimas por impaciencia o por querer ganar sin esfuerzo. Ninguna razón lo justifica.',
    problems: ['Normaliza la trampa como un “atajo”: si todos pagan, los niños aprenden que hacer trampa es lo normal.', 'Presiona a otros a hacer lo mismo: quien no quiere pagar queda fuera o es criticado.', 'Esconde lo que cada uno realmente puede lograr: el mérito deja de importar y solo cuenta el dinero.'],
    observe: '“Aquí todos pagan para pasar rápido”, dice un señor en la fila del trámite.',
    reflectQ: '¿Por qué crees que algunas personas prefieren pagar en vez de esperar?',
    finalTask: 'Piensa una respuesta firme para decir que no y compártela en familia.',
    scenarioQ: 'Un amigo dice: “todos pagan para pasar, hay que hacerlo”. ¿Qué haces?',
    scenarioOpts: ['Acepto para no quedar mal', 'Le digo que eso no está bien', 'Me alejo y lo comento con un adulto'], scenarioCorrect: 1,
    scenarioFeedback: [
      'Quedar bien un momento puede costar tu tranquilidad después.',
      'Exacto: que algo sea común no lo vuelve correcto.',
      'Bien: alejarte y pedir ayuda también es una gran respuesta.'
    ],
    familyPrompt: 'Hoy pensé por qué la gente ofrece coimas.',
    familyQuestion: '¿Qué responderías si alguien te dice que “todos lo hacen”?',
    deepen: 'Ocurre por impaciencia, por flojera o por miedo a perder. Algunos creen que “así funciona el mundo”, pero eso solo es una excusa: entender la causa sirve para no repetirla, no para justificarla.',
    shortTerm: 'A corto plazo, quien paga consigue lo que quiere rápido, pero enseña a otros que la trampa funciona.',
    longTerm: 'A largo plazo, esa idea se contagia: cada vez más gente paga y las reglas dejan de valer para todos.',
    affectsPeople: 'A ti: te presiona a pagar o a quedarte atrás aunque hagas las cosas bien.',
    affectsCommunity: 'A tu comunidad: se crea la idea de que sin dinero no se avanza, y eso desanima a todos.',
    affectsCountry: 'Al país: cuando el “todos lo hacen” se vuelve normal, la corrupción crece y frena el desarrollo.',
    identify: [
      { text: '“Paga para pasar rápido, aquí todos lo hacen” → ¿es corrupción?', isCorruption: true, why: 'Que sea común no lo vuelve correcto: sigue siendo una ventaja indebida.' },
      { text: 'Esperar tu turno aunque la fila sea larga → ¿es corrupción?', isCorruption: false, why: 'Respetar la fila es actuar con justicia y paciencia.' },
      { text: 'Un amigo te presiona para pagar y no quedar mal → ¿es corrupción?', isCorruption: true, why: 'Presionar a otros para romper reglas también es parte del problema.' },
      { text: 'Decir “no, gracias” y esperar como los demás → ¿es corrupción?', isCorruption: false, why: 'Es la respuesta honesta: ni pagas ni aceptas la trampa.' },
    ],
    reflectMore: ['¿Por qué “todos lo hacen” nunca es una buena razón?', '¿Qué pesa más: la impaciencia de hoy o tu tranquilidad de mañana?', '¿Cómo puedes responder con firmeza sin pelear?'],
    trueFalse: [
      { text: 'Si todos pagan coimas, entonces está bien hacerlo.', answer: false, why: 'Que algo sea común no lo vuelve correcto ni justo.' },
      { text: 'La impaciencia es una causa frecuente de las coimas.', answer: true, why: 'Muchos pagan por no querer esperar su turno.' },
      { text: 'Entender por qué ocurre sirve para no caer en lo mismo.', answer: true, why: 'Conocer la causa te ayuda a reconocerla y frenarla.' },
      { text: 'Decir que no cuando te presionan es de débiles.', answer: false, why: 'Al contrario: decir que no es una muestra de fuerza.' },
      { text: 'Una excusa nunca convierte una trampa en algo justo.', answer: true, why: 'Las razones no justifican romper las reglas.' },
    ],
    blanks: [
      { before: 'Muchos ofrecen coimas por impaciencia o por no querer', answer: 'esperar', after: 'su turno.' },
      { before: 'Que “todos lo hagan” no lo vuelve', answer: 'correcto', after: 'ni justo.' },
      { before: 'Decir que no ante la presión es una muestra de', answer: 'fuerza', after: 'y valentía.' },
    ],
    wordBank: ['esperar', 'correcto', 'fuerza', 'dinero'],
    beyond: ['La transparencia ayuda porque cuando los trámites son claros y públicos, hay menos espacio para “pagos rápidos”.', 'Rendir cuentas es contar qué se hizo y por qué: quien actúa bien no teme explicarlo.', 'La ética te pide paciencia y respeto; la ley castiga el soborno. Ambas van en la misma dirección.', 'Acción justa: proponer que la fila avance por orden. Acción injusta: pagar para colarte.'],
    relatedGuide: 'p7',
  },
  {
    id: 'k4', title: '¿Qué harías tú?', desc: 'Decide cómo actuar en distintos escenarios.', icon: '🧭', category: 'Decisiones', core: 'impact',
    body: ['En la vida te vas a cruzar con situaciones injustas. Lo importante es detenerte, pensar en las consecuencias y elegir bien.', 'Puedes practicar aquí con casos de mentira para estar listo cuando pase de verdad.'],
    example: 'Te ofrecen un premio por quedarte callado ante algo injusto.',
    art: 'paths',
    summary: 'Cuando veas algo injusto, detente, piensa en las consecuencias y elige lo correcto.',
    problems: ['Quedarte callado deja que lo injusto continúe: el silencio es como darle permiso a la trampa.', 'Seguir a otros te hace parte del problema: copiar una mala acción también es una mala acción.', 'Actuar bien protege a los demás y a ti: una sola persona valiente puede frenar una injusticia.'],
    observe: 'Ves que a un compañero lo favorecen por dinero en un concurso escolar.',
    reflectQ: '¿Qué sentirías si fueras quien merecía ganar?',
    finalTask: 'Dibuja o escribe cómo actuarías tú en esa situación.',
    scenarioQ: 'Ves que favorecen injustamente a alguien por dinero. ¿Qué haces?',
    scenarioOpts: ['Me quedo callado, no es mi problema', 'Lo comento con un adulto de confianza', 'Pido que también me favorezcan'], scenarioCorrect: 1,
    scenarioFeedback: [
      'El silencio ayuda a que lo injusto se repita.',
      'Muy bien: contarle a un adulto de confianza es el primer paso para frenar lo injusto.',
      'Pedir lo mismo te convierte en parte del problema.'
    ],
    familyPrompt: 'Hoy practiqué cómo actuar ante situaciones injustas.',
    familyQuestion: 'Si vieras algo injusto, ¿a quién se lo contarías primero?',
    deepen: 'Ocurre porque a veces es más fácil mirar a otro lado que actuar. Pero cada vez que alguien se queda callado, lo injusto gana fuerza; y cada vez que alguien habla, lo justo gana terreno.',
    shortTerm: 'A corto plazo, hablar puede dar nervios, pero callar deja una culpa que dura más.',
    longTerm: 'A largo plazo, las personas que actúan con valentía construyen comunidades donde se puede confiar.',
    affectsPeople: 'A ti: tus decisiones muestran quién eres y te dan tranquilidad o culpa.',
    affectsCommunity: 'A tu escuela o barrio: una voz valiente anima a otros a hablar también.',
    affectsCountry: 'Al país: los ciudadanos que no se callan son el mejor freno contra la corrupción.',
    identify: [
      { text: 'Ves que le regalan puntos a un equipo y no dices nada → ¿es corrupción?', isCorruption: true, why: 'Callar ante una trampa que beneficia injustamente también sostiene la corrupción.' },
      { text: 'Le cuentas a tu profesora que viste copiar en el examen → ¿es corrupción?', isCorruption: false, why: 'Avisar a un adulto de confianza es actuar con honestidad.' },
      { text: 'Te ofrecen un premio por guardar silencio ante algo injusto → ¿es corrupción?', isCorruption: true, why: 'Comprar tu silencio es una forma de corrupción.' },
      { text: 'Defiendes a un compañero al que culpan injustamente → ¿es corrupción?', isCorruption: false, why: 'Defender lo justo es lo contrario de la corrupción.' },
    ],
    reflectMore: ['¿Por qué cuesta más hablar que quedarse callado?', '¿Qué sentirías si nadie hablara por ti cuando lo necesitas?', '¿A quién admiras por haber actuado con valentía?'],
    trueFalse: [
      { text: 'Quedarse callado ante una injusticia ayuda a que se repita.', answer: true, why: 'El silencio deja que lo injusto continúe sin freno.' },
      { text: 'Si no participas en la trampa, no es tu problema.', answer: false, why: 'Mirar a otro lado también deja que el daño siga.' },
      { text: 'Contarle a un adulto de confianza es un buen primer paso.', answer: true, why: 'Pedir ayuda es actuar con responsabilidad.' },
      { text: 'Una sola persona no puede cambiar nada.', answer: false, why: 'Una voz valiente anima a muchas más.' },
      { text: 'Pensar antes de actuar lleva a mejores decisiones.', answer: true, why: 'Detenerte y pensar evita arrepentimientos.' },
    ],
    blanks: [
      { before: 'Ante algo injusto, primero me detengo y', answer: 'pienso', after: 'en las consecuencias.' },
      { before: 'Quedarse callado deja que lo injusto', answer: 'continúe', after: 'y se repita.' },
      { before: 'Contar lo que vi a un adulto de', answer: 'confianza', after: 'es actuar con valentía.' },
    ],
    wordBank: ['pienso', 'continúe', 'confianza', 'silencio'],
    beyond: ['La transparencia empieza contigo: contar lo que viste con claridad ayuda a que todo se aclare.', 'Rendir cuentas también es personal: explicar por qué actuaste como actuaste.', 'La ética te invita a defender lo justo; la ley protege a quien denuncia de buena fe.', 'Acción justa: avisar cuando ves trampa. Acción injusta: aprovecharte de la trampa ajena.'],
    relatedGuide: 'p6',
  },
  {
    id: 'k5', title: 'Presión de grupo', desc: 'Aprende a decir que no cuando te presionan.', icon: '🫂', category: 'Decisiones', core: 'prevention',
    body: ['A veces otras personas intentan convencerte de hacer algo incorrecto para “encajar”. Eso se llama presión de grupo.', 'Decir que no es difícil, pero es una muestra de fuerza: puedes proponer otra cosa, alejarte o pedir ayuda.'],
    example: 'Tus amigos te presionan para copiar en un examen y te dicen que si no lo haces eres un traidor.',
    art: 'shield',
    summary: 'Decir que no cuando te presionan es una muestra de fuerza, no de debilidad.',
    problems: ['Ceder una vez facilita ceder la próxima: cada “sí” hace más difícil el siguiente “no”.', 'Puedes meterte en problemas serios: lo que empieza como juego puede terminar en castigo o daño real.', 'Pierdes la confianza de quienes te quieren: tu familia y tus verdaderos amigos valoran tu honestidad.'],
    observe: 'Tus amigos insisten en copiar y te dicen traidor si no aceptas.',
    reflectQ: '¿Qué pesa más: quedar bien un momento o tu tranquilidad?',
    finalTask: 'Practica en voz alta una frase para decir que no.',
    scenarioQ: '¿Qué haces si te presionan para hacer algo incorrecto?',
    scenarioOpts: ['Acepto para no quedar mal', 'Digo que no y me alejo o pido ayuda', 'Lo hago solo una vez'], scenarioCorrect: 1,
    scenarioFeedback: [
      'Quedar bien con el grupo no vale un problema mayor.',
      'Exacto: decir que no y buscar apoyo es la respuesta valiente.',
      '“Solo una vez” suele ser el inicio de muchas veces.'
    ],
    familyPrompt: 'Hoy aprendí a enfrentar la presión de grupo.',
    familyQuestion: '¿Qué podrías decir si alguien te presiona a hacer algo malo?',
    deepen: 'Ocurre porque queremos encajar y tememos que se burlen de nosotros. Los grupos que te exigen hacer algo malo no son buenos amigos: un verdadero amigo respeta tu “no”.',
    shortTerm: 'A corto plazo, ceder te evita una burla, pero te deja intranquilo y con miedo a que se repita.',
    longTerm: 'A largo plazo, aprender a decir que no te protege de presiones cada vez más peligrosas.',
    affectsPeople: 'A ti: ceder te mete en problemas y te aleja de lo que realmente quieres ser.',
    affectsCommunity: 'A tu grupo: si todos ceden, el grupo entero entra en conductas de riesgo.',
    affectsCountry: 'Al país: los jóvenes que resisten la presión de hoy serán los adultos íntegros de mañana.',
    identify: [
      { text: 'Tus amigos te dicen traidor si no copias en el examen → ¿es corrupción?', isCorruption: true, why: 'Presionarte para hacer trampa es obligarte a ser deshonesto.' },
      { text: 'Tus amigos respetan que no quieras copiar → ¿es corrupción?', isCorruption: false, why: 'Respetar tu decisión es amistad de verdad.' },
      { text: 'Te piden dinero para comprar las respuestas del examen → ¿es corrupción?', isCorruption: true, why: 'Comprar respuestas es trampa y rompe las reglas para todos.' },
      { text: 'Propones estudiar juntos en vez de copiar → ¿es corrupción?', isCorruption: false, why: 'Proponer algo bueno es liderar con el ejemplo.' },
    ],
    reflectMore: ['¿Qué pesa más: quedar bien un momento o tu tranquilidad?', '¿Cómo sabes si un grupo de amigos es bueno para ti?', '¿Qué frase firme puedes usar para decir que no?'],
    trueFalse: [
      { text: 'Decir que no cuando te presionan es de valientes.', answer: true, why: 'Resistir la presión es una muestra de fuerza.' },
      { text: '“Solo una vez” nunca trae consecuencias.', answer: false, why: 'Una vez suele ser el inicio de muchas veces.' },
      { text: 'Un buen amigo respeta tu decisión de no hacer trampa.', answer: true, why: 'La amistad de verdad no exige hacer lo incorrecto.' },
      { text: 'Alejarse y pedir ayuda también es una buena respuesta.', answer: true, why: 'No tienes que enfrentar la presión a solas.' },
      { text: 'Si todo el grupo lo hace, no hay nada malo.', answer: false, why: 'Que muchos lo hagan no lo vuelve correcto.' },
    ],
    blanks: [
      { before: 'Decir que no ante la presión es una muestra de', answer: 'fuerza', after: 'y valentía.' },
      { before: '“Solo una vez” suele ser el inicio de', answer: 'muchas', after: 'veces.' },
      { before: 'Un verdadero amigo respeta tu', answer: 'decisión', after: 'de actuar bien.' },
    ],
    wordBank: ['fuerza', 'muchas', 'decisión', 'miedo'],
    beyond: ['La transparencia con tus amigos es decir lo que piensas sin miedo: “yo no copio”.', 'Rendir cuentas es contarle a tu familia cuando te presionan, para que te apoyen.', 'La ética te dice que tu conciencia vale más que encajar; la ley protege tu derecho a decidir.', 'Acción justa: proponer estudiar juntos. Acción injusta: copiar para que te acepten.'],
    relatedGuide: 'p7',
  },
  {
    id: 'k6', title: 'Decisiones y consecuencias', desc: 'Tus decisiones pueden afectar a otras personas.', icon: '⚖️', category: 'Decisiones', core: 'consequences',
    body: ['Cada decisión deja una huella: puede ayudar o puede dañar a quienes te rodean.', 'Antes de decidir, pregúntate: ¿a quién afecta esto? ¿me sentiría orgulloso si todos lo supieran?'],
    example: 'Aceptar un beneficio injusto puede dejar sin oportunidad a alguien que sí se lo merecía.',
    art: 'scale',
    summary: 'Cada decisión deja huella: piensa a quién afecta antes de elegir.',
    problems: ['Una mala decisión puede quitarle algo a otro: un cupo, un premio o una oportunidad que no vuelve.', 'Los efectos duran más de lo que crees: una trampa de hoy puede cerrar puertas mañana.', 'Tus decisiones hablan de quién eres: la gente confía en ti según cómo actúas.'],
    observe: 'Alguien acepta un beneficio injusto y otro se queda sin su oportunidad.',
    reflectQ: '¿Qué consecuencias puede tener una decisión así para los demás?',
    finalTask: 'Recuerda una decisión tuya y escribe a quién afectó.',
    scenarioQ: '¿Qué pregunta te ayuda a decidir bien?',
    scenarioOpts: ['¿Me conviene solo a mí?', '¿A quién afecta y sería justo para todos?', '¿Nadie se dará cuenta?'], scenarioCorrect: 1,
    scenarioFeedback: [
      'Pensar solo en ti deja fuera a los demás.',
      'Exacto: pensar en los demás y en lo justo lleva a mejores decisiones.',
      'Que nadie lo vea no lo vuelve correcto.'
    ],
    familyPrompt: 'Hoy aprendí que mis decisiones afectan a otros.',
    familyQuestion: '¿Recuerdas una decisión tuya que haya afectado a alguien?',
    deepen: 'Ocurre porque solemos pensar solo en lo que ganamos nosotros, sin ver a quién afecta. Hacerte dos preguntas —“¿a quién afecta?” y “¿sería justo para todos?”— cambia por completo tu decisión.',
    shortTerm: 'A corto plazo, una mala decisión puede darte algo rápido, pero deja a alguien triste o enojado.',
    longTerm: 'A largo plazo, tus decisiones forman tu reputación: la gente recuerda si fuiste justo o no.',
    affectsPeople: 'A ti y a otros: cada elección tuya toca la vida de alguien, para bien o para mal.',
    affectsCommunity: 'A tu comunidad: muchas decisiones injustas juntas crean un ambiente de desconfianza.',
    affectsCountry: 'Al país: las decisiones de hoy (votar, pagar impuestos, respetar reglas) construyen el país de mañana.',
    identify: [
      { text: 'Aceptas un premio que sabes que ganó otro compañero → ¿es corrupción?', isCorruption: true, why: 'Quedarte con lo ajeno es injusto aunque nadie reclame.' },
      { text: 'Devuelves el premio explicando que no era tuyo → ¿es corrupción?', isCorruption: false, why: 'Reconocer el mérito ajeno es honestidad.' },
      { text: 'Eliges no copiar aunque eso signifique menor nota → ¿es corrupción?', isCorruption: false, why: 'Elegir lo correcto aunque cueste es integridad.' },
      { text: 'Votas por tu amigo en un concurso aunque otro lo hizo mejor → ¿es corrupción?', isCorruption: true, why: 'Favorecer injustamente quita el premio a quien lo merecía.' },
    ],
    reflectMore: ['¿Qué consecuencias puede tener una decisión así para los demás?', '¿Te sentirías orgulloso si todos supieran lo que decidiste?', '¿Qué pregunta te ayuda a decidir bien antes de actuar?'],
    trueFalse: [
      { text: 'Cada decisión deja una huella en los demás.', answer: true, why: 'Lo que eliges toca la vida de otras personas.' },
      { text: 'Si solo me beneficia a mí, igual es buena decisión.', answer: false, why: 'Hay que pensar también en si es justo para todos.' },
      { text: 'Los efectos de una mala decisión se olvidan rápido.', answer: false, why: 'Pueden durar mucho más de lo que crees.' },
      { text: 'Preguntarte “¿a quién afecta?” ayuda a decidir bien.', answer: true, why: 'Esa pregunta te pone en los zapatos de los demás.' },
      { text: 'Tus decisiones muestran quién eres.', answer: true, why: 'La confianza se gana con actos justos.' },
    ],
    blanks: [
      { before: 'Antes de decidir, pregúntate a quién', answer: 'afecta', after: 'tu elección.' },
      { before: 'Una decisión injusta puede quitarle algo a', answer: 'otro', after: 'que sí lo merecía.' },
      { before: 'Tus decisiones hablan de', answer: 'quién', after: 'eres realmente.' },
    ],
    wordBank: ['afecta', 'otro', 'quién', 'siempre'],
    beyond: ['La transparencia en tus decisiones es poder explicar por qué elegiste algo sin esconder nada.', 'Rendir cuentas es asumir las consecuencias de lo que decidiste, bueno o malo.', 'La ética guía tus decisiones diarias; la ley marca los límites que nadie debe cruzar.', 'Acción justa: elegir por mérito. Acción injusta: elegir por favoritismo.'],
    relatedGuide: 'p5',
  },
  {
    id: 'k7', title: 'Corrupción en la vida cotidiana', desc: 'Ejemplos cercanos y fáciles de identificar.', icon: '🏪', category: 'Ciudadanía', core: 'impact',
    body: ['La corrupción no solo sale en las noticias: está en favorecer a alguien injustamente o usar una posición para obtener ventajas.', 'Aprender a verla en lo cotidiano te protege: la reconoces antes de que te atrape.'],
    example: 'Un comerciante cobra de más a quien no conoce y le hace “precio especial” solo a sus amigos en un servicio público.',
    art: 'hands',
    summary: 'La corrupción también aparece en lo cotidiano: reconocerla te protege.',
    problems: ['Se esconde en favores y “precios especiales”: lo cotidiano la disfraza de algo normal.', 'Afecta servicios que usas a diario: el mercado, el transporte, la escuela.', 'Si la ignoras, crece: lo pequeño de hoy es lo grande de mañana.'],
    observe: 'En el mercado, a unos les cobran de más por no conocer los precios.',
    reflectQ: '¿Qué situaciones injustas has visto en tu escuela o barrio?',
    finalTask: 'Anota una situación injusta que veas esta semana.',
    scenarioQ: '¿Cuál de estos es un ejemplo cotidiano de corrupción?',
    scenarioOpts: ['Hacer fila y esperar tu turno', 'Usar un cargo para favorecer injustamente a alguien', 'Pedir ayuda con la tarea'], scenarioCorrect: 1,
    scenarioFeedback: [
      'Bien: respetar tu turno es actuar con justicia.',
      'Exacto: usar una posición para dar ventajas injustas es corrupción cotidiana.',
      'Pedir ayuda para aprender no es trampa.'
    ],
    familyPrompt: 'Hoy descubrí la corrupción en la vida diaria.',
    familyQuestion: '¿Has visto alguna situación injusta en tu escuela o barrio?',
    deepen: 'Ocurre porque estamos acostumbrados a verla y dejamos de notarla: el “precio especial”, el favorcito, la fila que se salta. Nombrarla es el primer paso para frenarla.',
    shortTerm: 'A corto plazo, alguien paga de más o espera más por culpa de un trato injusto.',
    longTerm: 'A largo plazo, lo cotidiano injusto se vuelve sistema: todos pierden un poco cada día.',
    affectsPeople: 'A ti: pagas de más, esperas más o recibes peor servicio sin merecerlo.',
    affectsCommunity: 'A tu barrio: los comercios y servicios injustos empobrecen la convivencia.',
    affectsCountry: 'Al país: millones de pequeñas injusticias suman un gran daño nacional.',
    identify: [
      { text: 'En el mercado cobran de más a quien no conoce los precios → ¿es corrupción?', isCorruption: true, why: 'Aprovecharse del desconocimiento para cobrar más es injusto.' },
      { text: 'El vendedor muestra los precios claros para todos → ¿es corrupción?', isCorruption: false, why: 'La claridad y el trato igual son honestidad.' },
      { text: 'Un chofer cobra lo justo aunque podría cobrar más → ¿es corrupción?', isCorruption: false, why: 'Cobrar lo correcto es actuar con justicia.' },
      { text: 'Te cuelan en la fila a cambio de guardarles el puesto después → ¿es corrupción?', isCorruption: true, why: 'Es un intercambio de favores que rompe el orden justo de la fila.' },
    ],
    reflectMore: ['¿Qué situaciones injustas has visto en tu escuela o barrio?', '¿Por qué lo cotidiano injusto cuesta más reconocer?', '¿Qué detalle pequeño podrías cambiar desde hoy?'],
    trueFalse: [
      { text: 'La corrupción solo pasa en las noticias.', answer: false, why: 'También aparece en el mercado, la escuela y el barrio.' },
      { text: 'Cobrar de más a quien no sabe es una injusticia.', answer: true, why: 'Aprovecharse del otro rompe el trato justo.' },
      { text: 'Si es algo pequeño, no vale la pena decir nada.', answer: false, why: 'Lo pequeño de hoy es lo grande de mañana.' },
      { text: 'Reconocer la corrupción cotidiana te protege.', answer: true, why: 'Verla es el primer paso para no caer en ella.' },
      { text: 'Pedir precios claros es un acto de honestidad.', answer: true, why: 'La claridad protege a todos por igual.' },
    ],
    blanks: [
      { before: 'La corrupción también aparece en lo', answer: 'cotidiano', after: 'y hay que saber verla.' },
      { before: 'Cobrar de más a quien no conoce es una', answer: 'injusticia', after: 'que daña a todos.' },
      { before: 'Si ignoramos lo injusto, con el tiempo', answer: 'crece', after: 'y se vuelve costumbre.' },
    ],
    wordBank: ['cotidiano', 'injusticia', 'crece', 'escuela'],
    beyond: ['La transparencia en lo cotidiano es pedir y dar precios claros, turnos visibles y reglas parejas.', 'Rendir cuentas en casa es explicar en qué se gastó el dinero del hogar.', 'La ética diaria está en los detalles: la fila, el vuelto, el trato. La ley castiga cuando esos detalles se vuelven delito.', 'Acción justa: cobrar lo mismo a todos. Acción injusta: cobrar según la cara.'],
    relatedGuide: 'p4',
  },
  {
    id: 'k8', title: '¿Cómo puedo actuar correctamente?', desc: 'Acciones concretas de honestidad y ciudadanía.', icon: '🌟', category: 'Ciudadanía', core: 'ethics',
    body: ['Actuar bien es un hábito: respetar turnos, decir la verdad, devolver lo perdido y tratar a todos con justicia.', 'Cada pequeña acción honesta construye tu reputación y mejora tu comunidad.'],
    example: 'Devuelves el vuelto de más aunque nadie se haya dado cuenta.',
    art: 'shield',
    summary: 'Actuar bien es un hábito: pequeños actos honestos todos los días.',
    problems: ['La honestidad se nota aunque nadie mire: tu conciencia siempre sabe lo que hiciste.', 'Tu ejemplo inspira a otros: cuando actúas bien, animas a tus amigos a hacerlo.', 'Lo correcto casi siempre es lo más simple: no necesitas excusas ni mentiras.'],
    observe: 'Alguien devuelve el vuelto de más sin que nadie se dé cuenta.',
    reflectQ: '¿Por qué cuesta hacer lo correcto cuando nadie mira?',
    finalTask: 'Haz una acción honesta hoy y cuéntala en familia.',
    scenarioQ: '¿Cuál es una acción correcta?',
    scenarioOpts: ['Quedarme con el vuelto de más', 'Devolver lo que no es mío y ser justo', 'Aprovechar si nadie mira'], scenarioCorrect: 1,
    scenarioFeedback: [
      'Quedarte con lo ajeno rompe la confianza, aunque nadie lo note.',
      'Exacto: la honestidad se demuestra cuando nadie está mirando.',
      'Que nadie mire no lo vuelve correcto.'
    ],
    familyPrompt: 'Hoy aprendí acciones para actuar correctamente.',
    familyQuestion: '¿Qué acción honesta hiciste esta semana?',
    deepen: 'Ocurre porque la honestidad es como un músculo: cada vez que la usas se fortalece. Empezar con actos pequeños —devolver el vuelto, decir la verdad— te prepara para decisiones grandes.',
    shortTerm: 'A corto plazo, actuar bien te da tranquilidad inmediata y la confianza de tu familia.',
    longTerm: 'A largo plazo, los hábitos honestos construyen tu reputación y te abren puertas toda la vida.',
    affectsPeople: 'A ti: cada acto honesto te hace más fuerte y más libre.',
    affectsCommunity: 'A tu comunidad: un barrio con gente honesta es un lugar donde se puede confiar.',
    affectsCountry: 'Al país: millones de actos honestos diarios sostienen la convivencia de todos.',
    identify: [
      { text: 'Devuelves el vuelto de más aunque nadie lo notó → ¿es corrupción?', isCorruption: false, why: 'Es honestidad: devuelves lo que no es tuyo.' },
      { text: 'Te quedas con el vuelto de más porque nadie mira → ¿es corrupción?', isCorruption: true, why: 'Quedarte con lo ajeno rompe la confianza.' },
      { text: 'Dices la verdad aunque te cueste un castigo → ¿es corrupción?', isCorruption: false, why: 'La verdad aunque duela es integridad.' },
      { text: 'Encuentras dinero perdido y lo gastas sin buscar al dueño → ¿es corrupción?', isCorruption: true, why: 'Usar lo ajeno sin intentar devolverlo es injusto.' },
    ],
    reflectMore: ['¿Por qué cuesta hacer lo correcto cuando nadie mira?', '¿Qué acto honesto pequeño puedes hacer hoy?', '¿A quién admiras por su honestidad y por qué?'],
    trueFalse: [
      { text: 'Devolver lo que no es tuyo es honestidad.', answer: true, why: 'Lo ajeno se devuelve, se mire o no.' },
      { text: 'Si nadie se da cuenta, quedarse con algo ajeno está bien.', answer: false, why: 'Tu conciencia sí se da cuenta siempre.' },
      { text: 'Los actos honestos pequeños también cuentan.', answer: true, why: 'La honestidad se entrena todos los días.' },
      { text: 'Ser honesto te hace perder siempre.', answer: false, why: 'Te da confianza, reputación y tranquilidad.' },
      { text: 'Tu ejemplo puede inspirar a otros a actuar bien.', answer: true, why: 'Lo bueno también se contagia.' },
    ],
    blanks: [
      { before: 'Actuar bien es un', answer: 'hábito', after: 'que se entrena cada día.' },
      { before: 'La honestidad se demuestra cuando nadie está', answer: 'mirando', after: 'y aun así eliges bien.' },
      { before: 'Devolver lo que no es', answer: 'mío', after: 'es actuar con justicia.' },
    ],
    wordBank: ['hábito', 'mirando', 'mío', 'siempre'],
    beyond: ['La transparencia personal es no tener nada que esconder: tus actos resisten cualquier mirada.', 'Rendir cuentas es reconocer tus errores y corregirlos sin que te obliguen.', 'La ética diaria y la ley apuntan al mismo lugar: respetar lo ajeno y decir la verdad.', 'Acción justa: devolver el vuelto de más. Acción injusta: gastarlo en silencio.'],
    relatedGuide: 'p5',
  },
  {
    id: 'k9', title: 'Mitos sobre las coimas', desc: 'Descubre si estas afirmaciones son verdaderas o falsas.', icon: '❓', category: 'Actividades', core: 'prevention',
    body: ['Mito 1: “una coima pequeña no hace daño” → Falso: toda coima rompe reglas y quita recursos a todos.', 'Mito 2: “si nadie se entera no pasa nada” → Falso: el daño existe aunque nadie lo vea.', 'Mito 3: “así funcionan las cosas” → Falso: las cosas funcionan mejor con honestidad.'],
    example: 'Decir “es solo un poquito” no lo vuelve correcto.',
    art: 'chat',
    summary: 'Muchas frases sobre coimas son mitos: aquí descubres la verdad.',
    problems: ['“Es solo un poquito” no lo vuelve correcto: el tamaño no cambia que sea trampa.', '“Nadie se entera” no evita el daño: alguien pierde aunque nadie lo vea.', '“Así son las cosas” se puede cambiar: cada persona honesta rompe esa idea.'],
    observe: 'Escuchas decir: “es solo un poquito, no hace daño”.',
    reflectQ: '¿Un daño pequeño deja de ser daño?',
    finalTask: 'Explica a alguien por qué “un poquito” también cuenta.',
    scenarioQ: '“Pagar una coima pequeña no hace daño a nadie.” ¿Verdadero o falso?',
    scenarioOpts: ['Verdadero', 'Falso'], scenarioCorrect: 1,
    scenarioFeedback: [
      'Aunque sea pequeña, rompe reglas y quita recursos a todos.',
      'Exacto: toda coima hace daño y rompe la confianza.'
    ],
    familyPrompt: 'Hoy descubrí los mitos de las coimas.',
    familyQuestion: '¿Qué frase has escuchado que normalice las coimas?',
    deepen: 'Ocurren porque las frases hechas suenan a verdad cuando se repiten mucho. Pero cada mito se cae con una pregunta simple: “¿sería justo si me lo hicieran a mí?”.',
    shortTerm: 'A corto plazo, creer un mito te hace justificar trampas pequeñas sin culpa.',
    longTerm: 'A largo plazo, vivir de mitos normaliza la corrupción en todo un país.',
    affectsPeople: 'A ti: los mitos te engañan para aceptar lo inaceptable.',
    affectsCommunity: 'A tu comunidad: cuando todos repiten el mito, nadie frena la trampa.',
    affectsCountry: 'Al país: los mitos son el escudo favorito de la corrupción.',
    identify: [
      { text: '“Es solo un poquito, no hace daño” → ¿es corrupción?', isCorruption: true, why: 'Es el mito más común: lo pequeño también rompe reglas.' },
      { text: '“La honestidad siempre es lo mejor” → ¿es corrupción?', isCorruption: false, why: 'Es verdad: actuar bien protege a todos.' },
      { text: '“Si nadie se entera no pasa nada” → ¿es corrupción?', isCorruption: true, why: 'Otro mito: el daño existe aunque nadie lo vea.' },
      { text: '“Pagar coimas es la única forma de avanzar” → ¿es corrupción?', isCorruption: true, why: 'Mito peligroso: se avanza mejor con mérito y honestidad.' },
    ],
    reflectMore: ['¿Un daño pequeño deja de ser daño?', '¿Qué frases has escuchado que normalicen las coimas?', '¿Cómo responderías a alguien que dice “así son las cosas”?'],
    trueFalse: [
      { text: '“Una coima pequeña no hace daño” es un mito.', answer: true, why: 'Toda coima rompe reglas y quita recursos.' },
      { text: '“Si nadie se entera no pasa nada” es verdad.', answer: false, why: 'El daño existe aunque nadie lo vea.' },
      { text: '“Así funcionan las cosas” se puede cambiar.', answer: true, why: 'Cada persona honesta rompe esa idea.' },
      { text: 'Preguntarte “¿sería justo si me lo hicieran a mí?” desenmascara mitos.', answer: true, why: 'Ponerte en el lugar del otro revela la injusticia.' },
      { text: 'Repetir una frase muchas veces la vuelve verdad.', answer: false, why: 'La repetición no convierte lo falso en verdadero.' },
    ],
    blanks: [
      { before: '“Es solo un poquito” es un', answer: 'mito', after: 'que esconde una trampa.' },
      { before: 'Aunque nadie se entere, el', answer: 'daño', after: 'sí existe.' },
      { before: 'Cada persona honesta ayuda a', answer: 'cambiar', after: 'las cosas.' },
    ],
    wordBank: ['mito', 'daño', 'cambiar', 'verdad'],
    beyond: ['La transparencia desarma mitos: cuando todo se ve claro, las excusas se caen.', 'Rendir cuentas es demostrar con hechos que no necesitas trampas ni mitos.', 'La ética piensa por sí misma; la ley castiga aunque “todos lo hagan”.', 'Acción justa: cuestionar las frases hechas. Acción injusta: repetirlas para justificar trampas.'],
    relatedGuide: 'p8',
  },
  {
    id: 'k10', title: 'Reto familiar', desc: 'Actividad para hacer junto a tu familia.', icon: '👨‍👩‍👧', category: 'Familia', core: 'citizen', joint: true,
    body: ['Este reto se hace en equipo: elige a tu padre, madre o tutor y conversen juntos.', 'Lean la situación, den su opinión cada uno y escriban su compromiso familiar contra las coimas.'],
    example: 'Compromiso: “En nuestra familia hablamos con la verdad y no aceptamos atajos injustos”.',
    art: 'chat',
    summary: 'Un reto para hacer en equipo con tu familia y conversar de verdad.',
    problems: ['Conversar une a la familia: hablar de lo difícil acerca a las personas.', 'Un compromiso escrito se cumple mejor: lo que se firma se recuerda y se respeta.', 'Aprender juntos es más divertido: en equipo todo se entiende mejor.'],
    observe: 'Tu familia conversa sobre un problema del barrio.',
    reflectQ: '¿Qué compromiso puede asumir tu familia?',
    finalTask: 'Escriban juntos su compromiso familiar y péguenlo en un lugar visible.',
    scenarioQ: '¿Ya conversaron y escribieron su compromiso familiar?',
    scenarioOpts: ['Todavía no', '¡Sí, lo hicimos juntos!'], scenarioCorrect: 1,
    scenarioFeedback: [
      'Cuando estén listos, conversen y escríbanlo juntos.',
      '¡Felicidades! Conversar en familia ya es un gran paso.'
    ],
    familyPrompt: 'Hoy hicimos el reto familiar juntos.',
    familyQuestion: '¿Cuál es el compromiso de nuestra familia?',
    deepen: 'Ocurre porque en familia se aprenden los valores más importantes: lo que conversan y acuerdan juntos se vuelve regla del hogar. Un compromiso familiar es como una pequeña ley hecha con amor.',
    shortTerm: 'A corto plazo, conversar une y deja acuerdos claros para la semana.',
    longTerm: 'A largo plazo, las familias que conversan forman personas íntegras toda la vida.',
    affectsPeople: 'A ti: sentir el apoyo de tu familia te da fuerza para decir que no.',
    affectsCommunity: 'A tu comunidad: familias unidas crean barrios más justos.',
    affectsCountry: 'Al país: los valores se aprenden en casa antes que en la escuela.',
    identify: [
      { text: 'En casa acuerdan decir siempre la verdad → ¿es corrupción?', isCorruption: false, why: 'Es un compromiso de honestidad familiar.' },
      { text: 'La familia paga para evitar una multa justa → ¿es corrupción?', isCorruption: true, why: 'En familia tampoco se justifican las trampas.' },
      { text: 'Padres e hijos conversan sobre un problema del barrio → ¿es corrupción?', isCorruption: false, why: 'Conversar y buscar soluciones justas es ciudadanía.' },
      { text: 'Toda la familia guarda silencio ante una injusticia del vecino → ¿es corrupción?', isCorruption: true, why: 'El silencio familiar también deja que lo injusto siga.' },
    ],
    reflectMore: ['¿Qué compromiso puede asumir tu familia?', '¿Por qué un compromiso escrito se cumple mejor?', '¿Cómo puede tu familia ayudar al barrio a ser más justo?'],
    trueFalse: [
      { text: 'Conversar en familia une y protege contra las trampas.', answer: true, why: 'Hablar de lo difícil acerca y fortalece.' },
      { text: 'Un compromiso escrito se recuerda y se respeta más.', answer: true, why: 'Lo firmado queda como acuerdo visible.' },
      { text: 'Los valores se aprenden primero en casa.', answer: true, why: 'La familia es la primera escuela.' },
      { text: 'En familia sí se justifican las trampas pequeñas.', answer: false, why: 'La honestidad empieza en casa, sin excepciones.' },
      { text: 'Aprender juntos es más divertido y efectivo.', answer: true, why: 'En equipo todo se entiende mejor.' },
    ],
    blanks: [
      { before: 'En nuestra familia hablamos con la', answer: 'verdad', after: 'y no aceptamos atajos injustos.' },
      { before: 'Un compromiso escrito se cumple', answer: 'mejor', after: 'porque se recuerda.' },
      { before: 'Conversar en familia nos hace más', answer: 'fuertes', after: 'ante las trampas.' },
    ],
    wordBank: ['verdad', 'mejor', 'fuertes', 'unidos'],
    beyond: ['La transparencia en casa es hablar claro del dinero y las decisiones familiares.', 'Rendir cuentas en familia es cumplir lo que se promete a los demás miembros.', 'La ética del hogar y las leyes del país apuntan a lo mismo: respeto y justicia.', 'Acción justa: firmar juntos un compromiso. Acción injusta: pactar guardar silencio.'],
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

// Ilustraciones vectoriales para los temas (mismo estilo plano en toda la app)
const KID_ART: Record<string, ReactNode> = {
  scale: (
    <svg role="img" aria-label="Ilustración de una balanza de justicia" viewBox="0 0 200 150" className="w-full max-w-[260px] h-auto">
      <ellipse cx="100" cy="132" rx="62" ry="10" fill="#DBEAFE" />
      <rect x="96" y="30" width="8" height="96" rx="4" fill="#166534" />
      <rect x="88" y="122" width="24" height="8" rx="4" fill="#166534" />
      <rect x="30" y="44" width="140" height="8" rx="4" fill="#166534" />
      <path d="M100 22l8-12 8 12-8 5-8-5Z" fill="#166534" />
      <line x1="45" y1="52" x2="32" y2="88" stroke="#166534" strokeWidth="3" />
      <line x1="45" y1="52" x2="58" y2="88" stroke="#166534" strokeWidth="3" />
      <path d="M22 88a18 12 0 0 0 36 0Z" fill="#F59E0B" />
      <line x1="155" y1="52" x2="142" y2="88" stroke="#166534" strokeWidth="3" />
      <line x1="155" y1="52" x2="168" y2="88" stroke="#166534" strokeWidth="3" />
      <path d="M132 88a18 12 0 0 0 36 0Z" fill="#F59E0B" />
      <circle cx="168" cy="30" r="4" fill="#10B981" />
      <circle cx="30" cy="110" r="4" fill="#7C3AED" />
    </svg>
  ),
  paths: (
    <svg role="img" aria-label="Ilustración de una persona frente a dos caminos" viewBox="0 0 200 150" className="w-full max-w-[260px] h-auto">
      <ellipse cx="100" cy="132" rx="70" ry="10" fill="#DBEAFE" />
      <path d="M100 128C80 110 50 104 30 108" stroke="#93C5FD" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d="M100 128c20-18 50-24 70-20" stroke="#166534" strokeWidth="10" fill="none" strokeLinecap="round" />
      <circle cx="100" cy="72" r="16" fill="#FCD9B8" />
      <path d="M84 70a16 16 0 0 1 32 0Z" fill="#1F2937" />
      <rect x="86" y="90" width="28" height="34" rx="10" fill="#2563EB" />
      <path d="M168 46l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" fill="#F59E0B" />
      <circle cx="38" cy="52" r="4" fill="#7C3AED" />
    </svg>
  ),
  hands: (
    <svg role="img" aria-label="Ilustración de una mano rechazando un sobre de dinero" viewBox="0 0 200 150" className="w-full max-w-[260px] h-auto">
      <ellipse cx="100" cy="130" rx="66" ry="10" fill="#DBEAFE" />
      <rect x="62" y="52" width="76" height="52" rx="8" fill="#FFFFFF" stroke="#166534" strokeWidth="4" />
      <path d="M62 60l38 24 38-24" fill="none" stroke="#166534" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="86" y="70" width="28" height="16" rx="3" fill="#F59E0B" />
      <circle cx="100" cy="78" r="34" fill="none" stroke="#EF4444" strokeWidth="7" />
      <path d="M76 54l48 48" stroke="#EF4444" strokeWidth="7" strokeLinecap="round" />
      <path d="M162 40l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" fill="#10B981" />
    </svg>
  ),
  shield: (
    <svg role="img" aria-label="Ilustración de un escudo de protección" viewBox="0 0 200 150" className="w-full max-w-[260px] h-auto">
      <ellipse cx="100" cy="130" rx="60" ry="10" fill="#DBEAFE" />
      <path d="M100 22l44 16v34c0 30-19 50-44 60-25-10-44-30-44-60V38l44-16Z" fill="#10B981" />
      <path d="M100 34l33 12v26c0 22-14 37-33 45-19-8-33-23-33-45V46l33-12Z" fill="#FFFFFF" />
      <path d="M88 76l9 9 17-18" fill="none" stroke="#166534" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="160" cy="44" r="4" fill="#F59E0B" />
      <circle cx="40" cy="60" r="4" fill="#7C3AED" />
    </svg>
  ),
  chat: (
    <svg role="img" aria-label="Ilustración de dos personas conversando" viewBox="0 0 200 150" className="w-full max-w-[260px] h-auto">
      <ellipse cx="100" cy="132" rx="70" ry="10" fill="#DBEAFE" />
      <circle cx="72" cy="70" r="18" fill="#FCD9B8" />
      <rect x="52" y="90" width="40" height="38" rx="13" fill="#2563EB" />
      <circle cx="130" cy="66" r="18" fill="#F1C27D" />
      <rect x="110" y="86" width="40" height="42" rx="13" fill="#7C3AED" />
      <rect x="86" y="18" width="52" height="30" rx="10" fill="#FFFFFF" stroke="#BFDBFE" strokeWidth="3" />
      <circle cx="104" cy="33" r="3" fill="#2563EB" />
      <circle cx="114" cy="33" r="3" fill="#7C3AED" />
      <circle cx="124" cy="33" r="3" fill="#10B981" />
      <path d="M162 30l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" fill="#F59E0B" />
    </svg>
  ),
}

// Datos de preguntas para la sección Conversemos
const conversationPrompts: ConversationPrompt[] = [
  { id: '1', type: 'closed', question: '¿Qué es una coima?', kidQuestion: '¿Qué es una coima según tú?', parentQuestion: '¿Qué es una coima para un adulto?', kidOptions: ['Es dinero que se da por trabajo', 'Es dinero o favor injusto por un beneficio', 'Es un regalo bonito', 'Es un salario más alto'], parentOptions: ['Es un pago por servicio', 'Es un soborno por ventaja injusta', 'Es una propina normal', 'Es una tarifa oficial'], asked: false },
  { id: '2', type: 'closed', question: '¿Cómo reconoces una coima?', kidQuestion: '¿Qué señal te dice que están pidiendo una coima?', parentQuestion: '¿Qué te dice un adulto que están pidiendo una coima?', kidOptions: ['Te piden dinero para trabajar', 'Te ofrecen ayuda sin pedir nada', 'Te dan un regalo sorpresa', 'Te invitan a comer'], parentOptions: ['Te exigen pago para agilizar un trámite', 'Te piden un favor sin condiciones', 'Te regalan algo genuinamente', 'Te invitan a una comida social'], asked: false },
  { id: '3', type: 'open', question: '¿Qué harías si alguien te pide una coima?', kidQuestion: 'Si un adulto te pide dinero para resolver algo rápido, ¿qué harías?', parentQuestion: 'Si un funcionario te pide un "extra" para agilizar un trámite, ¿qué harías?', asked: false },
  { id: '4', type: 'closed', question: '¿Qué le pasa a la familia cuando hay coimas?', kidQuestion: '¿Qué sentiría tu familia si alguien les pide una coima?', parentQuestion: '¿Qué sentiría la familia de un adulto ante una coima?', kidOptions: ['Triste y enojada', 'Feliz porque se resuelve', 'Indiferente', 'Contenta porque ahorra dinero'], parentOptions: ['Frustrada e injusta', 'Agradecida porque se resolvió', 'Sin opinión', 'Contenta porque ahorró tiempo'], asked: false },
  { id: '5', type: 'open', question: '¿Cómo podemos prevenir las coimas en nuestra familia?', kidQuestion: '¿Qué regla podemos poner en casa para evitar coimas?', parentQuestion: '¿Qué acuerdo familiar pueden hacer todos sobre las coimas?', asked: false },
]

// Preguntas para la actividad familiar - pool de ≥20 preguntas organizadas por tipo
const familyActivityQuestions = [
  // COMPRENDEMOS - usando familyQuestion de los kid topics
  { id: 'f1', text: '¿Qué aprendiste en esta actividad?', type: 'comprendemos', category: 'kids', asked: false, answered: false },
  { id: 'f2', text: '¿Qué significa actuar con integridad?', type: 'comprendemos', category: 'kids', asked: false, answered: false },
  { id: 'f3', text: '¿Qué aprendiste hoy y cómo puedes aplicarlo en casa?', type: 'comprendemos', category: 'kids', asked: false, answered: false },
  // RELACIONAMOS - usando familyQuestion de kids topics
  { id: 'f4', text: '¿Te ha ocurrido algo parecido?', type: 'relaciona', category: 'kids', asked: false, answered: false },
  { id: 'f5', text: '¿Cómo te sentirías en esa situación?', type: 'relaciona', category: 'kids', asked: false, answered: false },
  { id: 'f6', text: '¿Has vivido una situación como esta en la escuela?', type: 'relaciona', category: 'kids', asked: false, answered: false },
  // ACTUAMOS - usando questions de parent guides
  { id: 'f7', text: '¿Qué podríamos hacer como familia?', type: 'actuamos', category: 'parents', asked: false, answered: false },
  { id: 'f8', text: '¿Qué regla nos ayuda a convivir mejor?', type: 'actuamos', category: 'parents', asked: false, answered: false },
  { id: 'f9', text: '¿Qué acción haríamos para corregir esto?', type: 'actuamos', category: 'parents', asked: false, answered: false },
  // Additional questions from conversation prompts
  { id: 'f10', text: '¿Por qué es importante respetar las reglas?', type: 'comprendemos', category: 'conversation', asked: false, answered: false },
  { id: 'f11', text: '¿Qué harías si alguien te pidiera participar en algo que sabes que está mal?', type: 'comprendemos', category: 'conversation', asked: false, answered: false },
  { id: 'f12', text: '¿Quiénes pueden verse afectados por una coima?', type: 'relaciona', category: 'conversation', asked: false, answered: false },
  { id: 'f13', text: '¿Por qué crees que algunas personas ofrecen coimas?', type: 'relaciona', category: 'conversation', asked: false, answered: false },
  { id: 'f14', text: '¿Qué entiendes por coima?', type: 'comprendemos', category: 'conversation', asked: false, answered: false },
  // More questions from parent guides (using their questions array)
  { id: 'f15', text: '¿Cómo iniciaríamos esta conversación en casa?', type: 'actuamos', category: 'parents', asked: false, answered: false },
  { id: 'f16', text: '¿Qué escucharíamos más importante en la respuesta de nuestros hijos?', type: 'actuamos', category: 'parents', asked: false, answered: false },
  { id: 'f17', text: '¿Qué valor familiar se reforzaría con esta actividad?', type: 'actuamos', category: 'parents', asked: false, answered: false },
  { id: 'f18', text: '¿Cómo celebraríamos haber completado la actividad?', type: 'comprendemos', category: 'parents', asked: false, answered: false },
  { id: 'f19', text: '¿A qué hora del día sería mejor para conversar en familia?', type: 'relaciona', category: 'familia', asked: false, answered: false },
  { id: 'f20', text: '¿Qué aprendimos juntos y cómo lo recordaremos?', type: 'comprendemos', category: 'familia', asked: false, answered: false },
]

const initialStudentProfile = getStoredStudentProfile()
const initialFamilyProfile = getStoredFamilyProfile()

// Mascota Duli — búho guía de la Academia de Integridad
function DuliMascot({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 210" className={className} role="img" aria-label="Duli, el búho de la academia" xmlns="http://www.w3.org/2000/svg">
      {/* patas */}
      <ellipse cx="76" cy="199" rx="18" ry="8" fill="#FF9600" />
      <ellipse cx="124" cy="199" rx="18" ry="8" fill="#FF9600" />
      <path d="M68 201 v5 M76 203 v5 M84 201 v5 M116 201 v5 M124 203 v5 M132 201 v5" stroke="#E58500" strokeWidth="3" strokeLinecap="round" />
      {/* penachos */}
      <path d="M62 52 L50 14 L88 38 Z" fill="#46A302" />
      <path d="M138 52 L150 14 L112 38 Z" fill="#46A302" />
      {/* cuerpo */}
      <path d="M100 26 C150 26 178 70 178 118 C178 166 144 200 100 200 C56 200 22 166 22 118 C22 70 50 26 100 26 Z" fill="#58CC02" />
      {/* panza */}
      <ellipse cx="100" cy="150" rx="44" ry="38" fill="#F0FCD9" />
      {/* alas */}
      <path d="M34 112 Q16 152 40 186 Q58 172 56 136 Q54 116 44 108 Q38 104 34 112 Z" fill="#46A302" />
      <path className="duli-wing" d="M166 112 Q184 152 160 186 Q142 172 144 136 Q146 116 156 108 Q162 104 166 112 Z" fill="#46A302" />
      {/* mejillas */}
      <circle cx="46" cy="130" r="9" fill="#FF8F85" opacity="0.5" />
      <circle cx="154" cy="130" r="9" fill="#FF8F85" opacity="0.5" />
      {/* ojos */}
      <g className="duli-eyes">
        <circle cx="72" cy="96" r="30" fill="#FFFFFF" />
        <circle cx="128" cy="96" r="30" fill="#FFFFFF" />
        <circle cx="72" cy="99" r="14" fill="#1F2937" />
        <circle cx="128" cy="99" r="14" fill="#1F2937" />
        <circle cx="77" cy="94" r="5" fill="#FFFFFF" />
        <circle cx="133" cy="94" r="5" fill="#FFFFFF" />
      </g>
      {/* cejas */}
      <path d="M50 64 Q72 52 94 64" stroke="#3F6D12" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M106 64 Q128 52 150 64" stroke="#3F6D12" strokeWidth="7" fill="none" strokeLinecap="round" />
      {/* pico */}
      <path d="M78 120 L122 120 L100 154 Z" fill="#FF9600" stroke="#E58500" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

function RoadmapReveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) { setVisible(true); return }
    if (typeof IntersectionObserver === 'undefined') { setVisible(true); return }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) { setVisible(true); obs.unobserve(e.target) }
        })
      },
      { threshold: 0.2, rootMargin: '0px 0px -40px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

// Enlace profundo: si la URL trae #temas... abrimos directo la pestaña de Temas
const BOOT_HASH = (() => {
  const h = window.location.hash.replace('#', '').trim()
  if (!h.startsWith('temas')) return null
  const parts = h.split('-')
  return { view: parts[1] ?? 'hub', id: parts.slice(2).join('-') || null }
})()

// Abrir Temas en una pestaña nueva del navegador (Pantalla queda en su pestaña)
const openTemasTab = (deep = '') => {
  const url = `${window.location.origin}${window.location.pathname}${window.location.search}#temas${deep}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

// Brain Flight — juego HTML5 (GDevelop export) hosteado en GitHub Pages
const BRAIN_FLIGHT_URL = 'https://crico719.github.io/brain-flight/?v=14'

export default function App() {
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(initialStudentProfile)
  const [familyProfile, setFamilyProfile] = useState<FamilyProfile>(initialFamilyProfile)
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'about' | 'avatar' | 'config' | 'home' | 'reels' | 'learn' | 'quiz' | 'result' | 'games' | 'brainflight' | 'converse' | 'activity' | 'cases' | 'profile' | 'content-for-parents' | 'profile-type'>(BOOT_HASH ? 'learn' : 'welcome')
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [learnView, setLearnView] = useState<'hub' | 'kid' | 'guide' | 'exam'>(BOOT_HASH ? (BOOT_HASH.view === 'tema' ? 'kid' : BOOT_HASH.view === 'guia' ? 'guide' : BOOT_HASH.view === 'examen' ? 'exam' : 'hub') : 'hub')
  const [activeKidId, setActiveKidId] = useState<string | null>(BOOT_HASH && BOOT_HASH.view === 'tema' ? BOOT_HASH.id : null)
  const [activeGuideId, setActiveGuideId] = useState<string | null>(BOOT_HASH && BOOT_HASH.view === 'guia' ? BOOT_HASH.id : null)
  const [topicStep, setTopicStep] = useState(0)
  const [answeredOpt, setAnsweredOpt] = useState<number | null>(null)
  const [revealedCases, setRevealedCases] = useState<number[]>([])
  const [reflectNote, setReflectNote] = useState('')
  const [tfAnswers, setTfAnswers] = useState<Record<number, boolean>>({})
  const [tfRevealed, setTfRevealed] = useState(false)
  const [blankInputs, setBlankInputs] = useState<Record<number, string>>({})
  const [blanksChecked, setBlanksChecked] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [familyActivityIndex, setFamilyActivityIndex] = useState(0)
  const [familyDoneList, setFamilyDoneList] = useState<number[]>([])
  const [familyWeeklyAction, setFamilyWeeklyAction] = useState<number | null>(null)
  const [userAnswers, setUserAnswers] = useState<number[]>([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState<string>('')
  const [showCoimaONo, setShowCoimaONo] = useState(false)
  const [currentCoimaCase, setCurrentCoimaCase] = useState(0)
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({})
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
const [conversationTurn, setConversationTurn] = useState<'kid' | 'parent'>('kid')
  const [kidAnswer, setKidAnswer] = useState<string>('')
  const [parentAnswer, setParentAnswer] = useState<string>('')

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

  // Al cambiar de perfil: volver al inicio de Temas y limpiar respuestas (no mezclar datos)
  // (solo al CAMBIAR profileType: evita pisar deep-links y el doble-mount de StrictMode)
  const prevProfileTypeRef = useRef(profileType)
  useEffect(() => {
    if (prevProfileTypeRef.current === profileType) return
    prevProfileTypeRef.current = profileType
    setLearnView('hub')
    setActiveKidId(null)
    setActiveGuideId(null)
    setExamAnswers({})
    setShowFeedback(false)
    setShowCoimaONo(false)
  }, [profileType])

  // Traducción según idioma
  const t = (key: keyof typeof translations['es']) => (translations[language] as Record<string, string>)[key] ?? translations['es'][key]

  // Helper to get current profile's progress
  const getProgress = () => profileType === 'student' ? studentProfile.progress : familyProfile.progress
  const getBadges = () => profileType === 'student' ? studentProfile.progress.badges : familyProfile.progress.badges
  const getCustomization = () => studentProfile.customization

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
      const checked = checkStudentBadges({ ...studentProfile, progress: newProgress })
      setStudentProfile({ ...studentProfile, progress: checked.profile.progress })
      saveStudentProfile({ ...studentProfile, progress: checked.profile.progress })
      if (checked.unlocked.length > 0) {
        setEarnedBadge({ ...checked.unlocked[0] })
        setShowBadgeCelebration(true)
      }
    } else {
      let updated: FamilyProfile = { ...familyProfile, progress: newProgress }
      updated = pushFamilyLog(updated, '📖 Actividad completada.')
      const checked = checkFamilyBadges(updated)
      setFamilyProfile(checked.profile)
      saveFamilyProfile(checked.profile)
      celebrateFamilyBadges(checked.unlocked)
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
      const checked = checkStudentBadges({ ...studentProfile, progress: newProgress })
      setStudentProfile({ ...studentProfile, progress: checked.profile.progress })
      saveStudentProfile({ ...studentProfile, progress: checked.profile.progress })
      if (checked.unlocked.length > 0) {
        setEarnedBadge({ ...checked.unlocked[0] })
        setShowBadgeCelebration(true)
      }
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
      const checked = checkStudentBadges({ ...studentProfile, progress: newProgress })
      setStudentProfile({ ...studentProfile, progress: checked.profile.progress })
      saveStudentProfile({ ...studentProfile, progress: checked.profile.progress })
      if (checked.unlocked.length > 0) {
        setEarnedBadge({ ...checked.unlocked[0] })
        setShowBadgeCelebration(true)
      }
    } else {
      let updated: FamilyProfile = { ...familyProfile, progress: newProgress }
      updated = pushFamilyLog(updated, `📖 Guía revisada: ${g.title}.`)
      const checked = checkFamilyBadges(updated)
      setFamilyProfile(checked.profile)
      saveFamilyProfile(checked.profile)
      celebrateFamilyBadges(checked.unlocked)
    }
  }

  // Completar el test final: desbloqueo condicional de insignias
  const completeTest = () => {
    const currentProfile = profileType === 'student' ? studentProfile : familyProfile
    const alreadyDone = (currentProfile.progress.topicProgress['test'] ?? 0) >= 100

    if (profileType === 'student') {
      const checked = checkStudentBadges({ ...studentProfile, progress: { ...studentProfile.progress, topicProgress: { ...studentProfile.progress.topicProgress, test: 100 } } })
      const completedActivities = studentProfile.progress.completedActivities + (alreadyDone ? 0 : 1)
      const newProgress = {
        ...studentProfile.progress,
        completedActivities,
        totalActivities: Math.max(studentProfile.progress.totalActivities, completedActivities),
        topicProgress: { ...studentProfile.progress.topicProgress, test: 100 },
        badges: checked.profile.progress.badges,
      }
      setStudentProfile({ ...studentProfile, progress: newProgress })
      saveStudentProfile({ ...studentProfile, progress: newProgress })
      if (checked.unlocked.length > 0) {
        setEarnedBadge({ ...checked.unlocked[0] })
        setShowBadgeCelebration(true)
      }
    } else {
      const completedActivities = familyProfile.progress.completedActivities + (alreadyDone ? 0 : 1)
      const newProgress = {
        ...familyProfile.progress,
        completedActivities,
        totalActivities: Math.max(familyProfile.progress.totalActivities, completedActivities),
        topicProgress: { ...familyProfile.progress.topicProgress, test: 100 },
        badges: familyProfile.progress.badges,
      }
      let updated: FamilyProfile = { ...familyProfile, progress: newProgress }
      updated = pushFamilyLog(updated, '🏅 ¡Examen final completado!')
      const checked = checkFamilyBadges(updated)
      setFamilyProfile(checked.profile)
      saveFamilyProfile(checked.profile)
      celebrateFamilyBadges(checked.unlocked)
    }
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
        case 'committed-family': return acts >= 3 && conv >= 3
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

   const checkStudentBadges = (profile: StudentProfile): { profile: StudentProfile; unlocked: Badge[] } => {
     const tp = profile.progress.topicProgress
     const quizPlayed = profile.progress.quizScores.length > 0
     const topicsCompleted = mainTopics.filter(t => (tp[t] ?? 0) >= 100).length
     const shouldUnlock = (id: string): boolean => {
       switch (id) {
         case 'topics-explorer': return topicsCompleted >= 3
         case 'game-master': return quizPlayed
       }
       return false
     }
     let updated = profile
     const unlocked: Badge[] = []
     allBadges.forEach(def => {
       const current = updated.progress.badges.find(b => b.id === def.id)!
       if (!current.unlocked && shouldUnlock(def.id)) {
         const nb = { ...current, unlocked: true }
         updated = { ...updated, progress: { ...updated.progress, badges: updated.progress.badges.map(b => (b.id === def.id ? nb : b)) } }
         unlocked.push(nb)
       }
     })
     return { profile: updated, unlocked }
   }

   const celebrateFamilyBadges = (unlocked: FamilyBadge[]) => {
    if (unlocked.length === 0) return
    const last = unlocked[unlocked.length - 1]
    setEarnedBadge({ id: last.id as unknown as BadgeType, name: last.name, emoji: last.emoji, color: '#F59E0B', unlocked: true })
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
       const checked = checkStudentBadges({ ...studentProfile, progress: newProgress })
       setStudentProfile({ ...studentProfile, progress: checked.profile.progress })
       saveStudentProfile({ ...studentProfile, progress: checked.profile.progress })
       if (checked.unlocked.length > 0) {
         setEarnedBadge({ ...checked.unlocked[0] })
         setShowBadgeCelebration(true)
       }
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
           // Guardar puntaje del quiz
           const correctCount = userAnswers.filter(a => a === 1).length
           const score = Math.round((correctCount / userAnswers.length) * 100)
           const currentProf = profileType === 'student' ? studentProfile : familyProfile
           const newQuizScores = [...currentProf.progress.quizScores, score]
           if (profileType === 'student') {
             const newProgress = { ...studentProfile.progress, quizScores: newQuizScores }
             const checked = checkStudentBadges({ ...studentProfile, progress: newProgress })
             setStudentProfile({ ...studentProfile, progress: checked.profile.progress })
             saveStudentProfile({ ...studentProfile, progress: checked.profile.progress })
             if (checked.unlocked.length > 0) {
               setEarnedBadge({ ...checked.unlocked[0] })
               setShowBadgeCelebration(true)
             }
           }
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
        <div className="min-h-screen welcome-bg flex items-center justify-center p-6 md:p-8 relative overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -top-20 -left-16 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-24 -right-16 w-96 h-96 rounded-full bg-white/15 blur-3xl" />
          </div>
          <div className="relative max-w-2xl mx-auto text-center text-white animate-fade-in py-10 md:py-16">
            <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-8 rounded-3xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-5xl md:text-6xl shadow-xl animate-float">
              💬
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-5 drop-shadow-lg tracking-tight">{t('welcomeTitle')}</h1>
            <p className="text-lg md:text-2xl mb-10 opacity-90 leading-relaxed max-w-xl mx-auto">{t('welcomeSub')}</p>

            <div className="space-y-4 max-w-sm mx-auto">
              <button
                onClick={() => setCurrentScreen('profile-type')}
                className="btn-glow bg-white text-indigo-700 font-extrabold py-5 px-8 rounded-2xl text-lg shadow-xl w-full transition-transform hover:scale-[1.02]"
              >
                {t('start')} <span aria-hidden>→</span>
              </button>
              <button
                onClick={() => setCurrentScreen('about')}
                className="bg-white/15 backdrop-blur-md border-2 border-white/30 text-white font-bold py-4 px-8 rounded-2xl text-lg w-full hover:bg-white/25 transition-all"
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
      const aboutSteps = [
        { icon: '🎨', title: 'Crea tu avatar', desc: 'Elige tu personaje y hazlo único.', ring: 'text-primary', chip: 'bg-primary/10' },
        { icon: '📚', title: 'Aprende temas', desc: 'Historias cortas sobre coimas y honestidad.', ring: 'text-secondary', chip: 'bg-secondary/10' },
        { icon: '🎮', title: 'Juega y gana XP', desc: 'Quizzes y retos: desbloquea insignias 🏅.', ring: 'text-warning', chip: 'bg-warning/10' },
        { icon: '💬', title: 'Conversa en familia', desc: 'Preguntas para hablar juntos en casa.', ring: 'text-success', chip: 'bg-success/10' },
      ];
      return (
        <div className="min-h-screen p-6 md:p-10 relative overflow-hidden" style={{ background: cust2.backgroundValue, backgroundSize: cust2.backgroundType === 'pattern' ? '50px 50px' : 'cover' }}>
          {/* Decoración de fondo */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 -left-20 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-28 -right-24 w-[28rem] h-[28rem] rounded-full bg-secondary/10 blur-3xl" />
            <div className="absolute top-16 right-[10%] text-4xl animate-float hidden md:block">✨</div>
            <div className="absolute bottom-32 left-[7%] text-4xl animate-float hidden md:block" style={{ animationDelay: '1.2s' }}>🎮</div>
            <div className="absolute top-2/5 left-[3%] text-3xl animate-float hidden lg:block" style={{ animationDelay: '0.6s' }}>💬</div>
          </div>

          <button
            onClick={() => setCurrentScreen('welcome')}
            className="absolute top-5 left-5 z-10 bg-white/80 backdrop-blur px-4 py-2 rounded-full text-gray-600 text-sm font-bold shadow-sm hover:bg-white hover:text-primary transition-all"
          >
            {t('back')}
          </button>

          <div className="relative w-full max-w-3xl mx-auto animate-slide-up py-8 md:py-12">
            {/* Encabezado */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-primary to-secondary shadow-lg flex items-center justify-center text-4xl animate-float">
                💡
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white drop-shadow-lg mb-2">{t('aboutTitle')}</h1>
              <p className="text-white/85 font-medium">{t('aboutSub')}</p>
            </div>

            {/* ¿De qué trata? */}
            <div className="bg-white/85 backdrop-blur-xl rounded-3xl p-6 mb-6 shadow-custom border border-white/60 card-hover animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-2xl shrink-0">💬</div>
                <div>
                  <h2 className="font-extrabold text-dark text-lg mb-1">¿De qué trata?</h2>
                  <p className="text-gray-600 leading-relaxed">
                    <strong>Hablemos Claro</strong> es para aprender en familia a reconocer <strong>coimas</strong> y a elegir lo honesto. Con temas cortos, juegos y conversaciones: ¡sin aburrimiento! 🚀
                  </p>
                </div>
              </div>
            </div>

            {/* Pasos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {aboutSteps.map((s, i) => (
                <div
                  key={s.title}
                  className="bg-white/85 backdrop-blur-xl rounded-3xl p-5 shadow-custom border border-white/60 card-hover animate-fade-in"
                  style={{ animationDelay: `${i * 90}ms` }}
                >
                  <div className="flex gap-3">
                    <div className={`w-12 h-12 rounded-2xl ${s.chip} flex items-center justify-center text-2xl shrink-0`}>{s.icon}</div>
                    <div className="min-w-0">
                      <p className={`text-xs font-black uppercase tracking-wide ${s.ring}`}>Paso {i + 1}</p>
                      <h3 className="font-extrabold text-dark leading-tight">{s.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed mt-1">{s.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Para quién + extras */}
            <div className="bg-white/85 backdrop-blur-xl rounded-3xl p-5 mb-7 shadow-custom border border-white/60 animate-fade-in" style={{ animationDelay: '400ms' }}>
              <p className="font-extrabold text-dark mb-3 text-center">¿Para quién es? 🎯</p>
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold">👨‍👩‍👧 Familias</span>
                <span className="px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-bold">🧑‍🎓 Jóvenes</span>
                <span className="px-3 py-1.5 rounded-full bg-warning/10 text-warning text-sm font-bold">📚 Docentes</span>
                <span className="px-3 py-1.5 rounded-full bg-success/10 text-success text-sm font-bold">🏡 En casa</span>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="px-3 py-1.5 rounded-full bg-alert/10 text-alert text-sm font-bold">🎮 Modo juego</span>
                <span className="px-3 py-1.5 rounded-full bg-warning/10 text-warning text-sm font-bold">🏅 Insignias</span>
                <span className="px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-bold">📱 Reels</span>
                <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold">🗣️ Quechua</span>
              </div>
            </div>

            <button
              onClick={goHome}
              className="btn-glow bg-primary text-white font-extrabold py-5 px-8 rounded-2xl text-lg w-full shadow-xl transition-transform hover:scale-[1.02]"
            >
              ¡Empezar! <span aria-hidden>→</span>
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
              <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-lg shadow-indigo-500/5 p-8 mb-6">
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
      const isFamHome = profileType === 'family'
      const homeBadgeCount = isFamHome ? familyProfile.familyBadges.filter(b => b.unlocked).length : unlockedCount
       const homeBadgeTotal = isFamHome ? familyProfile.familyBadges.length : getBadges().length
      const kidsDoneArr = currentProgress.kidsDone ?? []
      const kidsDoneCount = kidsDoneArr.length
      const kidsTotal = KIDS_TOPICS.length
      const lessonsPct = kidsTotal > 0 ? Math.round((kidsDoneCount / kidsTotal) * 100) : 0
      const streakDays = currentProgress.streakDays ?? 0
      const nextKid = KIDS_TOPICS.find(k => !kidsDoneArr.includes(k.id)) ?? null
      const nextGuide = PARENT_GUIDES.find(g => !(currentProgress.guidesDone ?? []).includes(g.id)) ?? null
      const nextLesson = nextKid
        ? { title: nextKid.title, desc: nextKid.desc, icon: nextKid.icon, go: () => openTemasTab(`-tema-${nextKid.id}`) }
        : nextGuide
          ? { title: nextGuide.title, desc: nextGuide.desc, icon: nextGuide.icon, go: () => openTemasTab(`-guia-${nextGuide.id}`) }
          : null
      const lessonTotal = nextKid ? kidsTotal : nextGuide ? PARENT_GUIDES.length : kidsTotal
      const nextLessonNum = nextKid ? KIDS_TOPICS.indexOf(nextKid) + 1 : nextGuide ? PARENT_GUIDES.indexOf(nextGuide) + 1 : kidsDoneCount


      const custHome = getCustomization()
      const textColors = getTextColorForTheme(custHome.backgroundValue)
      return (
        <div className="min-h-screen pb-36" style={{ background: custHome.backgroundValue, backgroundSize: custHome.backgroundType === 'pattern' ? '50px 50px' : 'cover' }}>
          {/* NAVBAR */}
          <header className="h-16 md:h-[68px] bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-30">
            <div className="mx-auto w-full max-w-[1120px] px-5 md:px-8 lg:px-6 h-full flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 md:w-11 md:h-11 shrink-0 rounded-xl bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center text-lg shadow-md shadow-primary/20">
                  🛡️
                </div>
                <div className="min-w-0">
                  <p className="font-black text-slate-800 leading-tight truncate text-[15px] md:text-base">{t('welcomeTitle')}</p>
                  <p className="text-[11px] md:text-xs font-semibold text-slate-500 truncate">🏠 {t('homeNav')}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2 shrink-0 flex-wrap justify-end">
                <div className="px-2.5 py-1.5 rounded-xl bg-white shadow-sm border border-slate-100 text-slate-700 font-bold text-xs md:text-sm" title={t('streak')}>🔥 {streakDays}</div>
                <div className="px-2.5 py-1.5 rounded-xl bg-white shadow-sm border border-slate-100 text-slate-700 font-bold text-xs md:text-sm" title={t('quickBadges')}>🏅 {homeBadgeCount}/{homeBadgeTotal}</div>
                <button onClick={() => setCurrentScreen('profile')} className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white hover:bg-primary/10 shadow-sm text-lg transition-colors" aria-label={t('profile')} title={t('profile')}>👤</button>
                <button onClick={() => setCurrentScreen('config')} className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white hover:bg-primary/10 shadow-sm text-base transition-colors" aria-label={t('configTitle')} title={t('configTitle')}>⚙️</button>
              </div>
            </div>
          </header>

            <main className="mx-auto w-full max-w-[1120px] px-5 md:px-8 lg:px-6 pt-10 md:pt-16 pb-16 animate-slide-up">
               {/* HERO */}
               <section className="relative overflow-hidden rounded-[28px] border shadow-[0_16px_48px_rgba(124,58,237,0.08)] px-6 py-12 md:px-14 md:py-20 text-center" style={{ background: textColors.cardBg, borderColor: textColors.border }}>
                 {/* Elementos decorativos animados */}
                 <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '0s', background: `rgba(124,58,237,0.1)` }} />
                 <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '1s', background: `rgba(59,130,246,0.1)` }} />
                 <div aria-hidden className="pointer-events-none absolute top-1/4 -right-16 w-40 h-40 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s', background: `rgba(245,158,11,0.1)` }} />
                 <div aria-hidden className="pointer-events-none absolute -top-8 left-1/2 w-32 h-32 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '0.5s', background: `rgba(16,185,129,0.1)` }} />
                 {/* Estrellas decorativas */}
                 <div aria-hidden className="pointer-events-none absolute top-8 left-12 text-2xl animate-float opacity-30" style={{ animationDelay: '0.3s' }}>✨</div>
                 <div aria-hidden className="pointer-events-none absolute top-20 right-16 text-xl animate-float opacity-30" style={{ animationDelay: '1.5s' }}>⭐</div>
                 <div aria-hidden className="pointer-events-none absolute bottom-12 left-20 text-xl animate-float opacity-20" style={{ animationDelay: '2.5s' }}>🎮</div>

                 <div className="relative mx-auto max-w-2xl flex flex-col items-center gap-5">
                   <span className="inline-flex items-center gap-2 w-max px-4 py-1.5 rounded-full border text-[11px] font-bold uppercase tracking-widest shadow-sm backdrop-blur-sm" style={{ background: `${textColors.cardBg}80`, borderColor: textColors.border, color: textColors.primary }}>
                     ✨ {t('heroEyebrow')}
                   </span>
                   <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-4xl md:text-5xl shadow-lg shadow-primary/25 animate-float">
                     🛡️
                   </div>
                   <h1 className="text-3xl md:text-[42px] font-black leading-[1.08] max-w-xl" style={{ color: textColors.primary}}>{t('heroTitle')}</h1>
                   <p className="text-base md:text-lg leading-relaxed max-w-lg" style={{ color: textColors.secondary}}>{t('welcomeLine')}</p>

                   <div className="flex flex-col sm:flex-row items-center gap-3 mt-2 w-full sm:w-auto">
                     <button
                       onClick={nextLesson ? nextLesson.go : () => openTemasTab('')}
                       className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 text-white text-sm md:text-[15px] font-bold rounded-full px-8 h-12 bg-gradient-to-r from-primary to-secondary shadow-lg shadow-primary/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                     >
                       {t('continueLesson')} <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                     </button>
                     <button
                       onClick={() => setCurrentScreen('games')}
                       className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm md:text-[15px] font-bold rounded-full px-8 h-12 border-2 hover:bg-primary/5 hover:border-primary/50 hover:shadow-lg active:scale-[0.98] transition-all duration-200"
                       style={{ color: textColors.primary, borderColor: `${textColors.primary}40`, backgroundColor: `${textColors.cardBg}80` }}
                     >
                       🎮 Jugar ahora <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                     </button>
                   </div>

                   <div className="flex items-center gap-3 w-full max-w-[360px] mt-4">
                     <div className="flex-1 h-2.5 rounded-full overflow-hidden shadow-inner" style={{ background: `${textColors.border}80` }} role="progressbar" aria-valuenow={lessonsPct} aria-valuemin={0} aria-valuemax={100} aria-label={t('topicsCompleted')}>
                       <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-[width] duration-700 shadow-sm" style={{ width: `${lessonsPct}%` }}></div>
                     </div>
                     <span className="text-xs md:text-sm font-bold shrink-0 tabular-nums" style={{ color: textColors.secondary }}>
                       {t('lessonWord')} {nextLessonNum} de {lessonTotal}
                     </span>
                   </div>
                 </div>
               </section>

             {/* CARACTERÍSTICAS */}
             <section className="mt-12 md:mt-16">
               <div className="flex items-center gap-3 mb-6 justify-center">
                 <span className="h-px flex-1 max-w-[120px]" style={{ background: `${textColors.border}80` }} aria-hidden />
                 <h2 className="text-[11px] md:text-xs font-black uppercase tracking-widest" style={{ color: textColors.secondary}}>✨ {t('learnSection')}</h2>
                 <span className="h-px flex-1 max-w-[120px]" style={{ background: `${textColors.border}80` }} aria-hidden />
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                 <button
                   onClick={() => openTemasTab('')}
                   className="group rounded-[22px] backdrop-blur-xl border p-6 md:p-7 text-left shadow-[0_6px_24px_rgba(30,41,82,0.05)] hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(30,41,82,0.10)] hover:border-secondary/30 transition-all duration-200 flex flex-col gap-3"
                   style={{ background: `${textColors.cardBg}cc`, borderColor: textColors.border }}
                 >
                   <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-secondary/60 flex items-center justify-center text-2xl transition-transform duration-200 group-hover:scale-110" aria-hidden>📖</div>
                   <div className="flex-1">
                     <p className="font-extrabold text-lg" style={{ color: textColors.primary}}>{t('themes')}</p>
                     <p className="text-sm mt-1 leading-relaxed" style={{ color: textColors.secondary}}>{t('themesDesc')}</p>
                   </div>
                   <span className="inline-flex items-center gap-1 text-sm font-bold mt-1" style={{ color: textColors.secondary}}>
                     {t('viewMore')} <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                   </span>
                 </button>
                 <button
                   onClick={() => setCurrentScreen('games')}
                   className="group rounded-[22px] backdrop-blur-xl border p-6 md:p-7 text-left shadow-[0_6px_24px_rgba(124,58,237,0.08)] hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(124,58,237,0.15)] hover:border-primary/30 transition-all duration-200 flex flex-col gap-3"
                   style={{ background: `${textColors.cardBg}cc`, borderColor: textColors.border }}
                  >
                   <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl transition-transform duration-200 group-hover:scale-110" aria-hidden>🎮</div>
                   <div className="flex-1">
                     <p className="font-extrabold text-lg" style={{ color: textColors.primary}}>{t('game')}</p>
                     <p className="text-sm mt-1 leading-relaxed" style={{ color: textColors.secondary}}>{t('gameDesc')}</p>
                   </div>
                   <span className="inline-flex items-center gap-1 text-sm font-bold mt-1" style={{ color: textColors.primary}}>
                     {t('viewMore')} <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                   </span>
                 </button>
                 <button
                   onClick={() => setCurrentScreen('reels')}
                   className="group rounded-[22px] backdrop-blur-xl border p-6 md:p-7 text-left shadow-[0_6px_24px_rgba(30,41,82,0.05)] hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(30,41,82,0.10)] hover:border-warning/30 transition-all duration-200 flex flex-col gap-3"
                   style={{ background: `${textColors.cardBg}cc`, borderColor: textColors.border }}
                 >
                   <div className="w-12 h-12 rounded-full bg-gradient-to-br from-warning to-warning/60 flex items-center justify-center text-2xl transition-transform duration-200 group-hover:scale-110" aria-hidden>📱</div>
                   <div className="flex-1">
                     <p className="font-extrabold text-lg" style={{ color: textColors.primary}}>{t('reels')}</p>
                     <p className="text-sm mt-1 leading-relaxed" style={{ color: textColors.secondary}}>{t('reelsDesc')}</p>
                   </div>
                   <span className="inline-flex items-center gap-1 text-sm font-bold mt-1" style={{ color: textColors.secondary}}>
                     {t('viewMore')} <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                   </span>
                 </button>
                 <button
                   onClick={() => setCurrentScreen('converse')}
                   className="group rounded-[22px] backdrop-blur-xl border p-6 md:p-7 text-left shadow-[0_6px_24px_rgba(30,41,82,0.05)] hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(30,41,82,0.10)] hover:border-success/30 transition-all duration-200 flex flex-col gap-3"
                   style={{ background: `${textColors.cardBg}cc`, borderColor: textColors.border }}
                 >
                   <div className="w-12 h-12 rounded-full bg-gradient-to-br from-success to-success/60 flex items-center justify-center text-2xl transition-transform duration-200 group-hover:scale-110" aria-hidden>👨‍👩‍👧</div>
                   <div className="flex-1">
                     <p className="font-extrabold text-lg" style={{ color: textColors.primary}}>{t('familyActivityLabel')}</p>
                     <p className="text-sm mt-1 leading-relaxed" style={{ color: textColors.secondary}}>{t('familyDesc')}</p>
                   </div>
                   <span className="inline-flex items-center gap-1 text-sm font-bold mt-1" style={{ color: textColors.secondary}}>
                     {t('viewMore')} <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                   </span>
                 </button>
              </div>
            </section>

             {/* Banner de juegos rápido */}
             <section className="mt-12 md:mt-16">
               <button
                 onClick={() => setCurrentScreen('games')}
                 className="group w-full relative overflow-hidden rounded-[24px] shadow-lg hover:shadow-2xl transition-all duration-300"
                 style={{ background: `linear-gradient(135deg, ${textColors.primary}20, ${textColors.secondary}20)`, border: `2px solid ${textColors.primary}40` }}
               >
                 <div className="rounded-[22px] p-6 md:p-8 flex items-center gap-4 md:gap-6" style={{ background: `${textColors.cardBg}cc` }}>
                   <div className="w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl md:text-3xl shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform duration-300">
                     🎮
                   </div>
                   <div className="flex-1 min-w-0">
                     <h3 className="text-xl md:text-2xl font-black" style={{ color: textColors.primary}}>¿Listo para jugar?</h3>
                     <p className="text-sm md:text-base mt-1" style={{ color: textColors.secondary}}>Brain Flight te espera: esquiva, recoge energía y supera tu mejor puntaje.</p>
                   </div>
                   <span className="shrink-0 inline-flex items-center gap-1 font-bold group-hover:translate-x-1 transition-transform" style={{ color: textColors.primary}}>
                     Jugar ahora →
                   </span>
                 </div>
               </button>
             </section>

             {/* ESTADO RÁPIDO */}
             <section className="grid grid-cols-3 gap-3 md:gap-5 mt-12 md:mt-16">
               <button onClick={() => setCurrentScreen('profile')} className="group rounded-[20px] backdrop-blur-xl border p-4 md:p-6 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-200 shadow-[0_4px_20px_rgba(30,41,82,0.04)]" style={{ background: `${textColors.cardBg}cc`, borderColor: textColors.border }}>
                 <div className="text-2xl md:text-3xl" aria-hidden>📈</div>
                 <p className="font-black text-lg md:text-2xl tabular-nums mt-1" style={{ color: textColors.primary}}>{lessonsPct}%</p>
                 <p className="text-[11px] font-bold uppercase tracking-wide mt-0.5 truncate" style={{ color: textColors.secondary}}>{t('yourProgress')}</p>
               </button>
               <button onClick={() => setCurrentScreen('profile')} className="group rounded-[20px] backdrop-blur-xl border p-4 md:p-6 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-200 shadow-[0_4px_20px_rgba(30,41,82,0.04)]" style={{ background: `${textColors.cardBg}cc`, borderColor: textColors.border }}>
                 <div className="text-2xl md:text-3xl" aria-hidden>🔥</div>
                 <p className="font-black text-lg md:text-2xl tabular-nums mt-1" style={{ color: textColors.primary}}>{streakDays}</p>
                 <p className="text-[11px] font-bold uppercase tracking-wide mt-0.5 truncate" style={{ color: textColors.secondary}}>{t('streak')}</p>
               </button>
               <button onClick={() => setCurrentScreen('profile')} className="group rounded-[20px] backdrop-blur-xl border p-4 md:p-6 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-200 shadow-[0_4px_20px_rgba(30,41,82,0.04)]" style={{ background: `${textColors.cardBg}cc`, borderColor: textColors.border }}>
                 <div className="text-2xl md:text-3xl" aria-hidden>🏅</div>
                 <p className="font-black text-lg md:text-2xl tabular-nums mt-1" style={{ color: textColors.primary}}>{homeBadgeCount}<span className="text-sm font-bold">/{homeBadgeTotal}</span></p>
                 <p className="text-[11px] font-bold uppercase tracking-wide mt-0.5 truncate" style={{ color: textColors.secondary}}>{t('quickBadges')}</p>
               </button>
             </section>

            {/* PIE DEL LANDING */}
            <footer className="mt-14 md:mt-16 text-center">
              <p className="text-slate-500 text-sm">{t('bottomQuote')}</p>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-2">Hablemos Claro · {t('selectTagline')}</p>
            </footer>
          </main>

           {/* Navegación principal */}
           <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-max max-w-[94vw] backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-500/10 px-3 py-2 flex items-center gap-1" style={{ background: `${textColors.cardBg}ee`, border: `1px solid ${textColors.border}` }}>
             {[
               { label: t('homeNav'), icon: '🏠', active: true, go: () => setCurrentScreen('home') },
               { label: t('themes'), icon: '📖', active: false, go: () => openTemasTab('') },
               { label: t('reels'), icon: '📱', active: false, go: () => setCurrentScreen('reels') },
               { label: t('profile'), icon: '👤', active: false, go: () => setCurrentScreen('profile') },
             ].map(navItem => (
               <button
                 key={navItem.label}
                 onClick={navItem.go}
                 className={`px-3 md:px-4 py-2 rounded-2xl flex flex-col items-center gap-0.5 text-xs font-bold transition-all ${navItem.active ? 'text-white bg-gradient-to-r from-primary to-secondary shadow-md shadow-primary/25' : ''}`}
                 style={{ color: navItem.active ? '#ffffff' : textColors.secondary, backgroundColor: navItem.active ? undefined : `${textColors.border}20` }}
               >
                 <span className="text-base leading-none">{navItem.icon}</span>
                 {navItem.label}
               </button>
             ))}
           </nav>
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
                <div key={reel.id} className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-lg shadow-indigo-500/5 p-6 shadow-custom-lg card-hover animate-slide-up" style={{ animationDelay: `${index * 80}ms` }}>
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
      const duliTip = (() => {
        const kd = getProgress().kidsDone ?? []
        return kd.length === 0
          ? '¡Toca el primer tema y gana tu primer XP! 🚀'
          : kd.length < KIDS_TOPICS.length
            ? `¡Vas ${kd.length}/${KIDS_TOPICS.length}! No pierdas tu racha 🔥`
            : '¡Todos los temas listos! ¿Probamos el examen? 🏆'
      })()
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
      const examUnlocked = kidsDone.length >= KIDS_TOPICS.length
      const cust7 = getCustomization();
      const learnStreak = getProgress().streakDays ?? 0
      const learnBadge = getProgress().badges?.filter(b => b.unlocked).length ?? 0
      const learnBadgeTotal = getProgress().badges?.length ?? 3
      const kidsXp = kidsDone.length * 50
      const guidesXp = guidesDone.length * 30

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
                <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-lg shadow-indigo-500/5 p-6 animate-fade-in">
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
            <div className="bg-white rounded-2xl p-8 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-4xl">📚</div>
                <div>
                  <h1 className="text-4xl font-bold gradient-text">Explora los temas</h1>
                  <p className="text-gray-600 text-lg mt-2 mb-1">Elige contenidos según tu rol dentro de la familia.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (learnView !== 'hub') {
                    setLearnView('hub')
                  } else if (BOOT_HASH) {
                    window.close()
                  } else {
                    navigateTo('home')
                  }
                }}
                className="glass-card px-6 py-3 rounded-xl text-gray-600 hover:text-primary text-base font-bold hover:bg-gray-100 transition-all shrink-0"
              >
                {learnView === 'hub' ? '← Inicio' : '← Volver al mapa'}
              </button>
            </div>

            {/* HUB — ACADEMIA SEPARADA EN ISLAS */}
            {learnView === 'hub' && (
              <div className="space-y-10 md:space-y-14 max-w-2xl mx-auto">
                {/* HERO COMPARTIDO */}
                <section className="relative overflow-hidden rounded-[28px] border border-primary/15 bg-gradient-to-br from-primary via-primary/90 to-secondary shadow-[0_16px_48px_rgba(37,99,235,0.25)] px-6 py-8 md:px-10 md:py-10 text-white text-center">
                  <div aria-hidden className="pointer-events-none absolute -top-16 -left-16 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
                  <div aria-hidden className="pointer-events-none absolute -bottom-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
                  <div aria-hidden className="pointer-events-none absolute top-6 right-8 text-4xl opacity-30">☁️</div>
                  <div aria-hidden className="pointer-events-none absolute bottom-6 left-8 text-4xl opacity-30">☁️</div>
                  <div className="relative flex flex-col items-center gap-3">
                    <div className="flex items-center justify-center gap-4 pt-1">
                      <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 animate-float" style={{ filter: 'drop-shadow(0 10px 18px rgba(15,23,42,0.3))' }}>
                        <DuliMascot className="w-full h-full" />
                      </div>
                      <div className="text-left bg-white text-slate-800 rounded-2xl rounded-bl-sm px-4 py-3 shadow-xl border border-white/80 max-w-[230px]">
                        <p className="text-sm font-black leading-tight">¡Hola, soy Duli! 🦉</p>
                        <p className="text-xs font-semibold text-slate-500 mt-1 leading-snug">Te acompaño a aprender integridad paso a paso.</p>
                      </div>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black leading-tight">Academia de Integridad</h2>
                    <p className="text-white/85 text-sm md:text-base max-w-md leading-relaxed">
                      Espacios separados para cada etapa: los hijos aprenden temas cortitos con reto y racha; los padres encuentran guías para conversar en familia.
                    </p>
                    {/* CHIPS */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                      <div className="px-3 py-2 rounded-2xl bg-white/15 backdrop-blur border border-white/20 font-bold text-sm">🔥 {learnStreak}</div>
                      <div className="px-3 py-2 rounded-2xl bg-white/15 backdrop-blur border border-white/20 font-bold text-sm">⭐ {kidsXp + guidesXp} XP</div>
                      <div className="px-3 py-2 rounded-2xl bg-white/15 backdrop-blur border border-white/20 font-bold text-sm">🏅 {learnBadge}/{learnBadgeTotal}</div>
                      <div className="px-3 py-2 rounded-2xl bg-white/15 backdrop-blur border border-white/20 font-bold text-sm">📖 {kidsDone.length + guidesDone.length} lecciones</div>
                    </div>
                  </div>
                </section>

                {/* ISLA 1 · ACADEMIA HIJOS */}
                <section className="rounded-[28px] border border-primary/10 bg-gradient-to-b from-white to-primary/[0.03] shadow-xl overflow-hidden">
                  {/* cabecera de la isla */}
                  <div className="pt-8 px-6 md:px-10 text-center">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/10 text-[11px] font-black uppercase tracking-wider">🎓 Academia Hijos</span>
                    <h3 className="mt-3 text-2xl md:text-3xl font-black text-primary">Para Hijos y Estudiante</h3>
                    <p className="text-slate-500 text-sm md:text-base max-w-md mx-auto leading-relaxed mt-1">
                      Temas cortitos, con reflexión, reto y racha diaria. ¡Completa los {KIDS_TOPICS.length} para desbloquear el examen!
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                      <div className="px-3 py-2 rounded-2xl bg-slate-100 border border-slate-200 font-bold text-sm">🔥 {learnStreak}</div>
                      <div className="px-3 py-2 rounded-2xl bg-slate-100 border border-slate-200 font-bold text-sm">⭐ {kidsXp} XP</div>
                      <div className="px-3 py-2 rounded-2xl bg-slate-100 border border-slate-200 font-bold text-sm">🏅 {learnBadge}/{learnBadgeTotal}</div>
                      <div className="px-3 py-2 rounded-2xl bg-slate-100 border border-slate-200 font-bold text-sm">📖 {kidsDone.length}/{KIDS_TOPICS.length}</div>
                    </div>
                    <div className="w-full max-w-[360px] mx-auto mt-5">
                      <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full progress-bar bg-primary transition-[width] duration-700" style={{ width: `${(kidsDone.length / KIDS_TOPICS.length) * 100}%` }}></div>
                      </div>
                      <p className="text-sm font-bold text-gray-500 mt-2">{kidsDone.length} de {KIDS_TOPICS.length} temas completados</p>
                    </div>
                  </div>
                  {/* camino de la isla */}
                  <div className="px-4 md:px-6 pb-2">
                    {(() => {
                      const firstUndone = KIDS_TOPICS.findIndex(k => !kidsDone.includes(k.id))
                      const openTopic = (k: KidTopic) => { setActiveKidId(k.id); setLearnView('kid'); setShowFeedback(false); setTopicStep(0); setAnsweredOpt(null); setRevealedCases([]); setReflectNote(''); setTfAnswers({}); setTfRevealed(false); setBlankInputs({}); setBlanksChecked(false) }
                      return (
                        <section className="relative">
                          {KIDS_TOPICS.map((k, i) => {
                            const done = kidsDone.includes(k.id)
                            const isCurrent = i === firstUndone
                            const locked = !done && !isCurrent
                            const even = i % 2 === 0
                            return (
                              <RoadmapReveal key={k.id}>
                                <div className={`relative py-12 md:py-20 ${locked ? 'opacity-75' : ''}`}>
                                  {/* segmento de línea */}
                                  <div aria-hidden className={`absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[3px] rounded-full transition-colors duration-500 ${
                                    done
                                      ? 'bg-gradient-to-b from-success to-emerald-400'
                                      : isCurrent
                                        ? 'bg-gradient-to-b from-primary to-teal-400'
                                        : 'bg-secondary-100'
                                  }`} />
                                  {/* nodo */}
                                  <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2 z-10">
                                    <button
                                      onClick={locked ? undefined : () => openTopic(k)}
                                      disabled={!!locked}
                                      title={locked ? 'Completa el tema anterior para desbloquearlo.' : undefined}
                                      aria-label={k.title}
                                      className={`relative w-14 h-14 md:w-[68px] md:h-[68px] rounded-full flex items-center justify-center text-2xl md:text-3xl font-black border-2 transition-all duration-300 ${
                                        done
                                          ? 'bg-gradient-to-br from-success to-emerald-400 text-white border-emerald-300/60 shadow-[0_8px_24px_rgba(16,185,129,0.35)] hover:scale-105 active:scale-95 cursor-pointer'
                                          : isCurrent
                                            ? 'bg-gradient-to-br from-primary to-teal-400 text-white border-white ring-4 ring-primary/15 shadow-[0_10px_30px_rgba(37,99,235,0.45)] animate-pulse hover:scale-110 active:scale-95 cursor-pointer'
                                            : 'bg-slate-100 text-slate-400 border-slate-200 opacity-70 cursor-not-allowed'
                                      }`}
                                    >
                                      {done ? '✓' : locked ? '🔒' : k.icon}
                                      {isCurrent && <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-warning text-white text-[11px] font-black flex items-center justify-center shadow-md">👆</span>}
                                    </button>
                                  </div>
                                  {/* contenido */}
                                  <div className={`w-[calc(50%-2.5rem)] md:w-[calc(50%-6rem)] ${even ? 'mr-auto' : 'ml-auto'}`}>
                                    <div className={`bg-white rounded-[20px] border p-4 md:p-5 text-center shadow-sm transition-all duration-300 ${
                                      done ? 'border-success/20' : isCurrent ? 'border-primary/30 shadow-md shadow-primary/10' : 'border-slate-100'
                                    }`}>
                                      <span className={`inline-flex items-center justify-center gap-1 text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                                        done
                                          ? 'bg-success/15 text-success'
                                          : isCurrent
                                            ? 'bg-gradient-to-r from-primary to-teal-500 text-white shadow-sm shadow-primary/25'
                                            : 'bg-slate-100 text-slate-400'
                                      }`}>
                                        {done ? '✓ Completado' : isCurrent ? (kidsDone.length === 0 ? '● Empezar' : '● Continuar') : '🔒 Bloqueado'}
                                      </span>
                                      <p className="mt-3 text-[11px] font-bold text-slate-400 tabular-nums">{String(i + 1).padStart(2, '0')} · {k.category}</p>
                                      <h4 className="mt-1 font-bold text-slate-800 text-[17px] md:text-lg leading-snug">{k.title}</h4>
                                      <p className="text-sm text-slate-500 leading-relaxed mt-1 line-clamp-2">{k.desc}</p>
                                      <div className="flex items-center justify-center gap-2 mt-3">
                                        <span className="text-xs font-black text-primary">+50 XP</span>
                                        <span className={`text-xs font-bold ${isCurrent && !done ? 'text-primary' : 'text-slate-400'}`}>{done ? '✓ Repasado' : '1 lección'}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </RoadmapReveal>
                            )
                          })}
                          {/* Nodo EXAMEN FINAL */}
                          <RoadmapReveal>
                            <div className="relative py-12 md:py-20">
                              <div aria-hidden className={`absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[3px] rounded-full transition-colors duration-500 ${
                                examUnlocked ? 'bg-gradient-to-b from-secondary to-warning' : 'bg-secondary-100'
                              }`} />
                              <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2 z-10">
                                <button
                                  aria-label="Examen final"
                                  disabled={!examUnlocked}
                                  onClick={examUnlocked ? () => { setActiveKidId(null); setLearnView('exam'); setExamAnswers({}) } : undefined}
                                  title={examUnlocked ? undefined : 'Completa todos los temas para desbloquearlo.'}
                                  className={`relative w-14 h-14 md:w-[68px] md:h-[68px] rounded-full flex items-center justify-center text-2xl md:text-3xl font-black border-2 transition-all duration-300 ${
                                    examUnlocked
                                      ? 'bg-gradient-to-br from-secondary to-warning text-white border-purple-300/60 shadow-[0_8px_24px_rgba(217,70,239,0.35)] hover:scale-105 active:scale-95 cursor-pointer'
                                      : 'bg-slate-100 text-slate-400 border-slate-200 opacity-70 cursor-not-allowed'
                                  }`}
                                >
                                  {examUnlocked ? '🏁' : '🔒'}
                                </button>
                              </div>
                              <div className="w-[calc(50%-2.5rem)] md:w-[calc(50%-6rem)] ml-auto">
                                <div className={`bg-white rounded-[20px] border p-4 md:p-5 text-center shadow-sm transition-all duration-300 ${
                                  examUnlocked ? 'border-warning/30 shadow-md shadow-warning/10' : 'border-slate-100'
                                }`}>
                                  <span className={`inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                                    examUnlocked ? 'bg-warning/15 text-warning' : 'bg-slate-100 text-slate-400'
                                  }`}>
                                    {examUnlocked ? '🎓 Examen final' : '🔒 Bloqueado'}
                                  </span>
                                  <p className="mt-3 text-[11px] font-bold text-slate-400 tabular-nums">{String(KIDS_TOPICS.length + 1).padStart(2, '0')} · Reto final</p>
                                  <h4 className="mt-1 font-bold text-slate-800 text-[17px] md:text-lg leading-snug">Examen final</h4>
                                  <p className="text-sm text-slate-500 leading-relaxed mt-1 line-clamp-2">
                                    {examUnlocked ? 'Pon a prueba todo lo aprendido y consigue tus insignias.' : `Completa los ${KIDS_TOPICS.length} temas para desbloquearlo.`}
                                  </p>
                                  <div className="flex items-center justify-center gap-2 mt-3">
                                    <span className="text-xs font-black text-warning">🏅 Insignias</span>
                                    <span className={`text-xs font-bold ${examUnlocked ? 'text-warning' : 'text-slate-400'}`}>{examUnlocked ? 'Disponible' : 'Bloqueado'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </RoadmapReveal>
                        </section>
                      )
                    })()}
                  </div>
                </section>

                {/* ISLA 2 · ACADEMIA PADRES */}
                <section className="rounded-[28px] border border-secondary/10 bg-gradient-to-b from-white to-secondary/[0.03] shadow-xl overflow-hidden">
                  {/* cabecera de la isla */}
                  <div className="pt-8 px-6 md:px-10 text-center">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary border border-secondary/10 text-[11px] font-black uppercase tracking-wider">👨‍👩‍👧‍👦 Academia Padres</span>
                    <h3 className="mt-3 text-2xl md:text-3xl font-black text-secondary">Para Padres y Tutores</h3>
                    <p className="text-slate-500 text-sm md:text-base max-w-md mx-auto leading-relaxed mt-1">
                      Guías cortitas para conversar y acompañar a tus hijos. Revisa las {PARENT_GUIDES.length} a tu ritmo.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                      <div className="px-3 py-2 rounded-2xl bg-slate-100 border border-slate-200 font-bold text-sm">🔥 {learnStreak}</div>
                      <div className="px-3 py-2 rounded-2xl bg-slate-100 border border-slate-200 font-bold text-sm">⭐ {guidesXp} XP</div>
                      <div className="px-3 py-2 rounded-2xl bg-slate-100 border border-slate-200 font-bold text-sm">📖 {guidesDone.length}/{PARENT_GUIDES.length}</div>
                    </div>
                    <div className="w-full max-w-[360px] mx-auto mt-5">
                      <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full progress-bar transition-[width] duration-700" style={{ width: `${(guidesDone.length / PARENT_GUIDES.length) * 100}%`, background: '#7C3AED' }}></div>
                      </div>
                      <p className="text-sm font-bold text-gray-500 mt-2">{guidesDone.length} de {PARENT_GUIDES.length} guías revisadas</p>
                    </div>
                  </div>
                  {/* camino de la isla */}
                  <div className="px-4 md:px-6 pb-2">
                    {(() => {
                      const firstUndone = PARENT_GUIDES.findIndex(g => !guidesDone.includes(g.id))
                      const openGuide = (g: ParentGuide) => { setActiveGuideId(g.id); setLearnView('guide'); setShowFeedback(false) }
                      return (
                        <section className="relative">
                          {PARENT_GUIDES.map((g, i) => {
                            const done = guidesDone.includes(g.id)
                            const isCurrent = i === firstUndone
                            const locked = !done && !isCurrent
                            const even = i % 2 === 0
                            return (
                              <RoadmapReveal key={g.id}>
                                <div className={`relative py-12 md:py-20 ${locked ? 'opacity-75' : ''}`}>
                                  {/* segmento de línea */}
                                  <div aria-hidden className={`absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[3px] rounded-full transition-colors duration-500 ${
                                    done
                                      ? 'bg-gradient-to-b from-success to-emerald-400'
                                      : isCurrent
                                        ? 'bg-gradient-to-b from-secondary to-fuchsia-400'
                                        : 'bg-secondary-100'
                                  }`} />
                                  {/* nodo */}
                                  <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2 z-10">
                                    <button
                                      onClick={locked ? undefined : () => openGuide(g)}
                                      disabled={!!locked}
                                      title={locked ? 'Revisa la guía anterior para desbloquear esta.' : undefined}
                                      aria-label={g.title}
                                      className={`relative w-14 h-14 md:w-[68px] md:h-[68px] rounded-full flex items-center justify-center text-2xl md:text-3xl font-black border-2 transition-all duration-300 ${
                                        done
                                          ? 'bg-gradient-to-br from-success to-emerald-400 text-white border-emerald-300/60 shadow-[0_8px_24px_rgba(16,185,129,0.35)] hover:scale-105 active:scale-95 cursor-pointer'
                                          : isCurrent
                                            ? 'bg-gradient-to-br from-fuchsia-500 to-secondary text-white border-white ring-4 ring-secondary/15 shadow-[0_10px_30px_rgba(217,70,239,0.45)] animate-pulse hover:scale-110 active:scale-95 cursor-pointer'
                                            : 'bg-slate-100 text-slate-400 border-slate-200 opacity-70 cursor-not-allowed'
                                      }`}
                                    >
                                      {done ? '✓' : locked ? '🔒' : g.icon}
                                      {isCurrent && <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-warning text-white text-[11px] font-black flex items-center justify-center shadow-md">👆</span>}
                                    </button>
                                  </div>
                                  {/* contenido */}
                                  <div className={`w-[calc(50%-2.5rem)] md:w-[calc(50%-6rem)] ${even ? 'mr-auto' : 'ml-auto'}`}>
                                    <div className={`bg-white rounded-[20px] border p-4 md:p-5 text-center shadow-sm transition-all duration-300 ${
                                      done ? 'border-success/20' : isCurrent ? 'border-secondary/30 shadow-md shadow-secondary/10' : 'border-slate-100'
                                    }`}>
                                      <span className={`inline-flex items-center justify-center gap-1 text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                                        done
                                          ? 'bg-success/15 text-success'
                                          : isCurrent
                                            ? 'bg-gradient-to-r from-fuchsia-500 to-secondary text-white shadow-sm shadow-secondary/25'
                                            : 'bg-slate-100 text-slate-400'
                                      }`}>
                                        {done ? '✓ Revisada' : isCurrent ? (guidesDone.length === 0 ? '● Empezar' : '● Continuar') : '🔒 Bloqueado'}
                                      </span>
                                      <p className="mt-3 text-[11px] font-bold text-slate-400 tabular-nums">{String(i + 1).padStart(2, '0')} · {g.category}{g.joint ? ' · 👨‍👩‍👧' : ''}</p>
                                      <h4 className="mt-1 font-bold text-slate-800 text-[17px] md:text-lg leading-snug">{g.title}</h4>
                                      <p className="text-sm text-slate-500 leading-relaxed mt-1 line-clamp-2">{g.desc}</p>
                                      <div className="flex items-center justify-center gap-2 mt-3">
                                        <span className="text-xs font-black text-secondary">+30 XP</span>
                                        <span className={`text-xs font-bold ${isCurrent && !done ? 'text-secondary' : 'text-slate-400'}`}>{done ? '✓ Repasada' : '1 guía'}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </RoadmapReveal>
                            )
                          })}
                        </section>
                      )
                    })()}
                  </div>
                </section>
              </div>
            )}

            {/* DETALLE TEMA HIJO */}
            {learnView === 'kid' && activeKid && (
              <div className="w-full max-w-[760px] mx-auto rounded-[28px] p-4 md:p-8 space-y-6" style={{ background: 'linear-gradient(180deg, #F8FAFF 0%, #EDF1F9 100%)' }}>
                {/* NAVBAR */}
                <div className="bg-white/90 backdrop-blur-xl border border-slate-100 rounded-[20px] px-4 md:px-5 py-3 flex items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center overflow-hidden shadow-sm">
                      <DuliMascot className="w-8 h-8" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-slate-800 leading-tight truncate text-[15px]">Hablemos Claro</p>
                      <p className="text-[11px] font-semibold text-slate-500 truncate">📚 Temas</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                    <span className="px-2.5 py-1.5 rounded-xl bg-white shadow-sm border border-slate-100 text-slate-700 font-bold text-xs tabular-nums">{Math.round((kidsDone.length / KIDS_TOPICS.length) * 100)}%</span>
                    <button onClick={() => setCurrentScreen('profile')} className="w-9 h-9 rounded-xl bg-white hover:bg-primary/10 shadow-sm text-base transition-colors" aria-label="Mi progreso" title="Mi progreso">📈</button>
                    <button onClick={() => setLearnView('hub')} className="px-3 h-9 rounded-xl bg-white hover:bg-primary/10 shadow-sm text-sm font-bold text-slate-600 hover:text-primary transition-colors">← Volver a temas</button>
                  </div>
                </div>

                {/* HERO */}
                <section className="relative overflow-hidden rounded-[28px] border border-slate-100 bg-gradient-to-br from-primary-50 via-white to-secondary-50 shadow-[0_16px_48px_rgba(124,58,237,0.08)] px-6 py-10 md:px-10 md:py-12 text-center">
                  <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-secondary-100/60 blur-3xl" />
                  <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-primary-100/60 blur-3xl" />
                  <div className="relative flex flex-col items-center gap-4">
                    <span className="inline-flex gap-2 w-max px-4 py-1.5 rounded-full bg-white/80 border border-slate-100 text-[11px] font-bold uppercase tracking-widest text-primary shadow-sm">
                      ✨ Tema {KIDS_TOPICS.findIndex(k => k.id === activeKid.id) + 1} de {KIDS_TOPICS.length} · {activeKid.category}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-black gradient-text leading-tight max-w-xl">{activeKid.title}</h2>
                    <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-lg mt-1">{activeKid.desc}</p>
                    <div className="inline-flex items-center gap-2 bg-white/90 border border-slate-100 rounded-full pl-1.5 pr-4 py-1.5 shadow-sm">
                      <DuliMascot className="w-8 h-8 animate-float" />
                      <span className="text-xs font-black text-slate-600">¡Tú puedes! Aprende y gana XP 💪</span>
                    </div>
                    <div className="flex items-center gap-3 w-full max-w-[360px] mt-2">
                      <div className="flex-1 h-2 bg-slate-200/70 rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round((kidsDone.length / KIDS_TOPICS.length) * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso de temas">
                        <div className="progress-bar h-full rounded-full transition-[width] duration-700" style={{ width: `${Math.round((kidsDone.length / KIDS_TOPICS.length) * 100)}%`, background: 'linear-gradient(90deg, #10B981, #2563EB)' }}></div>
                      </div>
                      <span className="text-xs md:text-sm font-bold text-slate-600 shrink-0 tabular-nums">{Math.round((kidsDone.length / KIDS_TOPICS.length) * 100)}% completado</span>
                    </div>
                  </div>
                </section>

                {/* PASOS */}
                <div className="flex gap-2 flex-wrap justify-center">
                  {['Aprende', 'Observa', 'Reflexiona', 'Elige', 'Conversa', 'Completa'].map((s, i) => (
                    <button
                      key={s}
                      onClick={() => { setTopicStep(i); setShowFeedback(false); setRevealedCases([]); setReflectNote(''); setTfAnswers({}); setTfRevealed(false); setBlankInputs({}); setBlanksChecked(false); }}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all ${
                        topicStep === i
                          ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-primary/25'
                          : topicStep > i
                            ? 'bg-success/15 text-success'
                            : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
                      }`}
                    >
                      {topicStep > i ? '✓ ' : `${i + 1} · `}{s}
                    </button>
                  ))}
                </div>
                <p className="text-center text-xs font-bold text-slate-400 mt-3">Paso {topicStep + 1} de 6</p>

                {/* Ilustración */}
                <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(30,41,82,0.05)] border border-slate-100 flex justify-center">
                  {KID_ART[activeKid.art]}
                </div>

                {/* 1. APRENDE */}
                {topicStep === 0 && (
                  <>
                <div className="bg-white rounded-[20px] p-6 md:p-8 border border-slate-100 shadow-[0_4px_20px_rgba(30,41,82,0.05)]">
                  <span className="inline-flex items-center gap-1.5 w-max px-3 py-[5px] rounded-full bg-primary-50 text-primary text-[11px] font-bold uppercase tracking-wider mb-3">1 · EN POCAS PALABRAS</span>
                  <p className="text-slate-700 text-lg leading-loose">{activeKid.summary}</p>
                  {activeKid.deepen && (
                    <p className="text-slate-700 text-lg leading-loose mt-4 pt-4 border-t border-slate-100">{activeKid.deepen}</p>
                  )}
                </div>

                {/* 3. Por qué es un problema */}
                <div className="bg-white rounded-[20px] p-6 md:p-8 border border-slate-100 shadow-[0_4px_20px_rgba(30,41,82,0.05)]">
                  <span className="inline-flex items-center gap-1.5 w-max px-3 py-[5px] rounded-full bg-primary-50 text-primary text-[11px] font-bold uppercase tracking-wider mb-4">3 · ¿POR QUÉ ES UN PROBLEMA?</span>
                  <ul className="space-y-4">
                    {activeKid.problems.map((pb, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm shadow-primary/25">✓</span>
                        <p className="text-slate-700 text-lg leading-relaxed">{pb}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Corto y largo plazo */}
                {activeKid.shortTerm && (
                <div className="bg-white rounded-[20px] p-6 md:p-8 border border-slate-100 shadow-[0_4px_20px_rgba(30,41,82,0.05)]">
                  <span className="inline-flex items-center gap-1.5 w-max px-3 py-[5px] rounded-full bg-primary-50 text-primary text-[11px] font-bold uppercase tracking-wider mb-4">⏳ CORTO Y LARGO PLAZO</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl p-5 bg-primary-50 border border-primary/15">
                      <p className="font-black text-primary text-sm mb-2">⚡ A CORTO PLAZO</p>
                      <p className="text-slate-700 leading-relaxed">{activeKid.shortTerm}</p>
                    </div>
                    <div className="rounded-xl p-5 bg-warning-50 border border-warning/25">
                      <p className="font-black text-warning text-sm mb-2">🕰️ A LARGO PLAZO</p>
                      <p className="text-slate-700 leading-relaxed">{activeKid.longTerm}</p>
                    </div>
                  </div>
                </div>
                )}

                {/* A quién afecta */}
                {activeKid.affectsPeople && (
                <div className="bg-white rounded-[20px] p-6 md:p-8 border border-slate-100 shadow-[0_4px_20px_rgba(30,41,82,0.05)]">
                  <span className="inline-flex items-center gap-1.5 w-max px-3 py-[5px] rounded-full bg-primary-50 text-primary text-[11px] font-bold uppercase tracking-wider mb-4">👥 ¿A QUIÉN AFECTA?</span>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <span className="text-2xl shrink-0">🧒</span>
                      <p className="text-slate-700 text-lg leading-relaxed"><strong>Personas:</strong> {activeKid.affectsPeople}</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-2xl shrink-0">🏘️</span>
                      <p className="text-slate-700 text-lg leading-relaxed"><strong>Comunidad:</strong> {activeKid.affectsCommunity}</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-2xl shrink-0">🌎</span>
                      <p className="text-slate-700 text-lg leading-relaxed"><strong>País:</strong> {activeKid.affectsCountry}</p>
                    </li>
                  </ul>
                </div>
                )}

                {/* Mira más allá */}
                {activeKid.beyond && (
                <div className="bg-white rounded-[20px] p-6 md:p-8 border border-slate-100 shadow-[0_4px_20px_rgba(30,41,82,0.05)]">
                  <span className="inline-flex items-center gap-1.5 w-max px-3 py-[5px] rounded-full bg-primary-50 text-primary text-[11px] font-bold uppercase tracking-wider mb-4">🔭 MIRA MÁS ALLÁ</span>
                  <ul className="space-y-4">
                    {activeKid.beyond.map((b, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm shadow-primary/25">{i + 1}</span>
                        <p className="text-slate-700 text-lg leading-relaxed">{b}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                )}

                {/* Corrupción vs coima */}
                {activeKid.compareA && (
                  <div className="bg-white rounded-[20px] p-6 md:p-8 border border-slate-100 shadow-[0_4px_20px_rgba(30,41,82,0.05)]">
                    <span className="inline-flex items-center gap-1.5 w-max px-3 py-[5px] rounded-full bg-warning-50 text-warning text-[11px] font-bold uppercase tracking-wider mb-4">⚖️ CORRUPCIÓN Y COIMA NO SON LO MISMO</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-xl p-5 bg-primary-50 border border-primary/15">
                        <p className="text-slate-700 leading-relaxed">{activeKid.compareA}</p>
                      </div>
                      <div className="rounded-xl p-5 bg-warning-50 border border-warning/25">
                        <p className="text-slate-700 leading-relaxed">{activeKid.compareB}</p>
                      </div>
                    </div>
                    <p className="text-center font-bold text-slate-800 mt-5">{activeKid.compareNote}</p>
                  </div>
                )}
                  </>
                )}
                {/* 2. OBSERVA */}
                {topicStep === 1 && (
                  <>
                    <div className="bg-white rounded-[20px] p-6 md:p-8 border border-slate-100 shadow-[0_4px_20px_rgba(30,41,82,0.05)] border-l-8" style={{ borderLeftColor: '#F59E0B' }}>
                      <span className="inline-flex items-center gap-1.5 w-max px-3 py-[5px] rounded-full bg-warning-50 text-warning text-[11px] font-bold uppercase tracking-wider mb-3">2 · OBSERVA</span>
                      <p className="text-slate-700 text-lg leading-loose italic">“{activeKid.observe}”</p>
                    </div>
                    <div className="bg-white rounded-[20px] p-6 md:p-8 border border-slate-100 shadow-[0_4px_20px_rgba(30,41,82,0.05)]">
                      <p className="font-bold text-slate-800 mb-2">💡 Ejemplo cotidiano</p>
                      <p className="text-slate-700 text-lg leading-loose italic">“{activeKid.example}”</p>
                    </div>
                    {activeKid.identify && (
                    <div className="bg-white rounded-[20px] p-6 md:p-8 border border-slate-100 shadow-[0_4px_20px_rgba(30,41,82,0.05)]">
                      <span className="inline-flex items-center gap-1.5 w-max px-3 py-[5px] rounded-full bg-warning-50 text-warning text-[11px] font-bold uppercase tracking-wider mb-3">🔍 IDENTIFICA LA SITUACIÓN</span>
                      <p className="text-slate-500 mb-4">Lee cada caso y decide: ¿es corrupción o no? Toca la tarjeta para ver la respuesta.</p>
                      <div className="space-y-4">
                        {activeKid.identify.map((cs, ci) => {
                          const open = revealedCases.includes(ci)
                          return (
                            <button
                              key={ci}
                              onClick={() => setRevealedCases(open ? revealedCases.filter(x => x !== ci) : [...revealedCases, ci])}
                              className={`w-full text-left rounded-[18px] border-2 p-5 transition-all ${open ? 'bg-white border-primary/40' : 'bg-white border-gray-200 hover:border-primary/60'}`}
                            >
                              <p className="text-slate-800 text-lg leading-relaxed">{cs.text}</p>
                              {open && (
                                <div className={`mt-3 p-4 rounded-xl border ${cs.isCorruption ? 'bg-warning-50 border-warning/25' : 'bg-success/10 border-success/30'}`}>
                                  <p className="font-black text-sm mb-1">{cs.isCorruption ? '⛔ Sí es corrupción' : '✅ No es corrupción'}</p>
                                  <p className="text-slate-700 leading-relaxed">{cs.why}</p>
                                </div>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    )}
                  </>
                )}
                {/* 3. REFLEXIONA */}
                {topicStep === 2 && (
                  <div className="bg-white rounded-[20px] p-6 md:p-8 border border-slate-100 shadow-[0_4px_20px_rgba(30,41,82,0.05)] text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-[5px] rounded-full bg-primary-50 text-primary text-[11px] font-bold uppercase tracking-wider mb-3">3 · REFLEXIONA</span>
                    <div className="text-5xl mb-4 mt-3">🤔</div>
                    <p className="text-slate-800 text-xl leading-relaxed font-medium">{activeKid.reflectQ}</p>
                    <p className="text-slate-500 mt-4">Tómate un momento para pensarlo antes de continuar.</p>
                    {activeKid.reflectMore && (
                    <div className="mt-6 pt-6 border-t border-slate-100 text-left">
                      <p className="font-black text-primary text-sm tracking-widest mb-4">🧠 REFLEXIONA Y EXPLICA</p>
                      <ul className="space-y-3 mb-5">
                        {activeKid.reflectMore.map((q, qi) => (
                          <li key={qi} className="flex items-start gap-3">
                            <span className="w-7 h-7 rounded-full bg-primary-50 text-primary flex items-center justify-center font-bold text-sm shrink-0">?</span>
                            <p className="text-slate-800 text-lg leading-relaxed font-medium">{q}</p>
                          </li>
                        ))}
                      </ul>
                      <textarea
                        value={reflectNote}
                        onChange={e => setReflectNote(e.target.value)}
                        rows={3}
                        placeholder="Escribe tu reflexión aquí con tus propias palabras..."
                        className="w-full p-4 rounded-[18px] border-2 border-slate-200 focus:border-primary/60 outline-none text-slate-700 text-lg leading-relaxed"
                      />
                    </div>
                    )}
                  </div>
                )}
                {/* 4. ELIGE */}
                {topicStep === 3 && (
                <div className="bg-white rounded-[20px] p-6 md:p-8 border border-slate-100 shadow-[0_4px_20px_rgba(30,41,82,0.05)] border-2 border-primary/20">
                  <span className="inline-flex items-center gap-1.5 w-max px-3 py-[5px] rounded-full bg-primary-50 text-primary text-[11px] font-bold uppercase tracking-wider mb-3">4 · ¿QUÉ HARÍAS TÚ?</span>
                  <p className="text-slate-800 text-lg mb-5">{activeKid.scenarioQ}</p>
                  <div className="space-y-4">
                    {activeKid.scenarioOpts.map((opt, oi) => (
                      <button
                        key={oi}
                        onClick={() => {
                          setAnsweredOpt(oi)
                          setFeedbackMessage(activeKid.scenarioFeedback[oi] ?? '')
                          setShowFeedback(true)
                        }}
                        className={`btn-glow w-full py-4 px-5 rounded-[18px] text-center font-medium text-lg border-2 transition-all ${
                          answeredOpt === oi
                            ? oi === activeKid.scenarioCorrect
                              ? 'bg-success text-white border-success shadow-lg'
                              : 'bg-white border-warning text-slate-800'
                            : 'bg-white border-gray-200 hover:border-primary/60 text-slate-800'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  {showFeedback && (
                    <div className="mt-5 p-5 rounded-[18px] bg-primary-50 border border-primary/20 animate-fade-in">
                      <p className="text-[11px] font-black tracking-widest text-primary mb-2">💡 PARA PENSAR</p>
                      <p className="text-slate-800 text-lg leading-relaxed">{feedbackMessage}</p>
                    </div>
                  )}
                  {activeKid.trueFalse && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <span className="inline-flex items-center gap-1.5 w-max px-3 py-[5px] rounded-full bg-primary-50 text-primary text-[11px] font-bold uppercase tracking-wider mb-3">✅ VERDADERO O FALSO</span>
                    <p className="text-slate-500 mb-4">Marca V o F en cada afirmación y luego comprueba tus respuestas.</p>
                    <div className="space-y-4">
                      {activeKid.trueFalse.map((tf, ti) => {
                        const ans = tfAnswers[ti]
                        const graded = tfRevealed && ans !== undefined
                        const ok = ans === tf.answer
                        return (
                          <div key={ti} className={`rounded-[18px] border-2 p-5 transition-all ${graded ? (ok ? 'bg-success/10 border-success/40' : 'bg-warning-50 border-warning/40') : 'bg-white border-gray-200'}`}>
                            <p className="text-slate-800 text-lg leading-relaxed mb-3">{ti + 1}. {tf.text}</p>
                            <div className="flex gap-3">
                              {([true, false] as boolean[]).map(v => (
                                <button
                                  key={String(v)}
                                  disabled={tfRevealed}
                                  onClick={() => setTfAnswers({ ...tfAnswers, [ti]: v })}
                                  className={`flex-1 py-2.5 rounded-full font-black transition-all ${
                                    ans === v
                                      ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/25'
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  } ${tfRevealed ? 'opacity-60 cursor-default' : ''}`}
                                >
                                  {v ? 'V' : 'F'}
                                </button>
                              ))}
                            </div>
                            {graded && (
                              <div className="mt-3">
                                <p className="font-black text-sm mb-1">{ok ? '✅ ¡Correcto!' : `❌ La respuesta es: ${tf.answer ? 'Verdadero' : 'Falso'}`}</p>
                                <p className="text-slate-700 leading-relaxed">{tf.why}</p>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex gap-3 mt-5">
                      <button
                        onClick={() => setTfRevealed(true)}
                        className="flex-1 btn-glow bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 px-6 rounded-full"
                      >
                        Comprobar ✅
                      </button>
                      <button
                        onClick={() => { setTfAnswers({}); setTfRevealed(false); }}
                        className="flex-1 bg-white border-2 border-slate-200 text-slate-600 font-bold py-3 px-6 rounded-full hover:bg-slate-50"
                      >
                        Intentar de nuevo
                      </button>
                    </div>
                    {tfRevealed && (
                      <p className="text-center font-black text-primary mt-4">
                        Acertaste {activeKid.trueFalse.filter((tf, ti) => tfAnswers[ti] === tf.answer).length} de {activeKid.trueFalse.length} 🎯
                      </p>
                    )}
                  </div>
                  )}
                  {activeKid.id === 'k4' && (
                    <button
                      onClick={() => { setShowCoimaONo(true); setCurrentCoimaCase(0); setShowFeedback(false); }}
                      className="btn-glow bg-gradient-to-r from-warning to-primary text-white font-bold py-4 px-6 rounded-full text-lg w-full mt-6"
                    >
                      🎯 Jugar ¿Coima o no?
                    </button>
                  )}
                </div>
                )}
                {/* 5. CONVERSA */}
                {topicStep === 4 && (
                <div className="bg-white/85 backdrop-blur-xl rounded-[26px] shadow-lg shadow-indigo-500/5 p-8 border border-warning/20">
                  <span className="inline-flex items-center gap-1.5 w-max px-3 py-[5px] rounded-full bg-warning-50 text-warning text-[11px] font-bold uppercase tracking-wider mb-2">5 · CONVERSA EN FAMILIA</span>
                  <h3 className="font-bold text-warning text-xl mb-2 mt-2">💬 Conversarlo en familia</h3>
                  <p className="text-slate-700 italic leading-relaxed">“{activeKid.familyPrompt}”</p>
                  <p className="text-slate-800 font-bold mt-3">Pregunta para conversar: {activeKid.familyQuestion}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <button
                      onClick={() => setCurrentScreen('converse')}
                      className="btn-glow bg-warning text-white font-bold py-4 px-6 rounded-full"
                    >
                      Iniciar conversación familiar →
                    </button>
                    <button
                      onClick={() => { setActiveGuideId(activeKid.relatedGuide); setLearnView('guide'); setShowFeedback(false); }}
                      className="btn-glow bg-white border-2 border-secondary text-secondary font-bold py-4 px-6 rounded-full"
                    >
                      Ver guía para padres →
                    </button>
                  </div>
                </div>
                )}
                {/* 6. COMPLETA */}
                {topicStep === 5 && (
                <>
                <div className="bg-white rounded-[20px] p-6 md:p-8 border border-slate-100 shadow-[0_4px_20px_rgba(30,41,82,0.05)] text-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-[5px] rounded-full bg-primary-50 text-primary text-[11px] font-bold uppercase tracking-wider mb-3">6 · COMPLETA</span>
                  <div className="text-5xl mb-3 mt-3">🎯</div>
                  <p className="text-slate-800 text-lg leading-relaxed mb-2">{activeKid.finalTask}</p>
                </div>
                {activeKid.blanks && (
                <div className="bg-white rounded-[20px] p-6 md:p-8 border border-slate-100 shadow-[0_4px_20px_rgba(30,41,82,0.05)] text-left">
                  <span className="inline-flex items-center gap-1.5 w-max px-3 py-[5px] rounded-full bg-primary-50 text-primary text-[11px] font-bold uppercase tracking-wider mb-3">📝 COMPLETA LO QUE FALTA</span>
                  <p className="text-slate-500 mb-4">Rellena los espacios con palabras del banco y luego comprueba.</p>
                  {activeKid.wordBank && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {activeKid.wordBank.map((w, wi) => (
                      <button
                        key={wi}
                        disabled={blanksChecked}
                        onClick={() => {
                          const idx = activeKid.blanks!.findIndex((b, bi) => !(blankInputs[bi] ?? '').trim() || (blanksChecked && blankInputs[bi].trim().toLowerCase() !== b.answer.toLowerCase()))
                          if (idx >= 0) setBlankInputs({ ...blankInputs, [idx]: w })
                        }}
                        className="px-4 py-2 rounded-full bg-primary-50 border border-primary/20 text-primary font-bold hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                  )}
                  <div className="space-y-4">
                    {activeKid.blanks.map((b, bi) => {
                      const val = blankInputs[bi] ?? ''
                      const graded = blanksChecked && val.trim() !== ''
                      const ok = val.trim().toLowerCase() === b.answer.toLowerCase()
                      return (
                        <p key={bi} className="text-slate-800 text-lg leading-loose">
                          {b.before}{' '}
                          <input
                            value={val}
                            disabled={blanksChecked}
                            onChange={e => setBlankInputs({ ...blankInputs, [bi]: e.target.value })}
                            size={Math.max(b.answer.length + 2, 8)}
                            placeholder="..."
                            className={`inline-block px-3 py-1 rounded-xl border-2 outline-none font-bold text-center transition-all ${
                              graded
                                ? ok
                                  ? 'bg-success/10 border-success/50 text-success'
                                  : 'bg-warning-50 border-warning/50 text-slate-800'
                                : 'bg-white border-slate-200 focus:border-primary/60 text-slate-800'
                            }`}
                          />{' '}
                          {b.after}
                          {graded && !ok && (
                            <span className="block text-sm font-bold text-warning mt-1">Respuesta: {b.answer}</span>
                          )}
                        </p>
                      )
                    })}
                  </div>
                  <div className="flex gap-3 mt-5">
                    <button
                      onClick={() => setBlanksChecked(true)}
                      className="flex-1 btn-glow bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 px-6 rounded-full"
                    >
                      Comprobar ✅
                    </button>
                    <button
                      onClick={() => { setBlankInputs({}); setBlanksChecked(false); }}
                      className="flex-1 bg-white border-2 border-slate-200 text-slate-600 font-bold py-3 px-6 rounded-full hover:bg-slate-50"
                    >
                      Intentar de nuevo
                    </button>
                  </div>
                </div>
                )}
                {(() => {
                  const scenarioOK = answeredOpt === activeKid.scenarioCorrect
                  const tfList = activeKid.trueFalse ?? []
                  const tfScore = tfList.filter((tf, ti) => tfAnswers[ti] === tf.answer).length
                  const tfOK = tfList.length > 0 && tfScore === tfList.length
                  const blankList = activeKid.blanks ?? []
                  const blanksOK = blankList.length > 0 && blankList.every((b, bi) => (blankInputs[bi] ?? '').trim().toLowerCase() === b.answer.toLowerCase())
                  const mastered = scenarioOK && tfOK && blanksOK
                  return (
                <>
                <div className="bg-white rounded-[20px] p-5 md:p-6 border border-slate-100 shadow-[0_4px_20px_rgba(30,41,82,0.05)]">
                  <p className="font-black text-primary text-sm tracking-widest mb-3">🎓 PARA COMPLETAR EL TEMA RESPONDE TODO BIEN</p>
                  <ul className="space-y-2">
                    <li className={`flex items-center gap-2 font-bold ${scenarioOK ? 'text-success' : 'text-slate-500'}`}>
                      <span>{scenarioOK ? '✓' : '○'}</span> Elige bien en “¿Qué harías tú?” (paso 4)
                    </li>
                    <li className={`flex items-center gap-2 font-bold ${tfOK ? 'text-success' : 'text-slate-500'}`}>
                      <span>{tfOK ? '✓' : '○'}</span> Verdadero o falso: {tfScore}/{tfList.length} correctas
                    </li>
                    <li className={`flex items-center gap-2 font-bold ${blanksOK ? 'text-success' : 'text-slate-500'}`}>
                      <span>{blanksOK ? '✓' : '○'}</span> Completa lo que falta sin errores
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => completeKidTopic(activeKid.id)}
                  disabled={kidsDone.includes(activeKid.id) || !mastered}
                  className={`font-bold py-4 px-6 rounded-full text-lg w-full transition-all ${
                    kidsDone.includes(activeKid.id)
                      ? 'bg-success/15 text-success cursor-default'
                      : !mastered
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'btn-glow bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/25 hover:scale-[1.01] active:scale-[0.99]'
                  }`}
                >
                  {kidsDone.includes(activeKid.id)
                    ? '✓ Tema completado'
                    : !mastered
                      ? 'Responde todo correctamente para completar'
                      : 'Marcar como terminado ✓'}
                </button>
                </>
                  )
                })()}
                {kidsDone.includes(activeKid.id) && (() => {
                  const next = KIDS_TOPICS.find(k => !kidsDone.includes(k.id))
                  return (
                    <button
                      onClick={() => {
                        if (next) {
                          setActiveKidId(next.id)
                          setShowFeedback(false)
                          setTopicStep(0)
                          setAnsweredOpt(null)
                          setRevealedCases([]); setReflectNote(''); setTfAnswers({}); setTfRevealed(false); setBlankInputs({}); setBlanksChecked(false)
                        } else {
                          setLearnView('hub')
                        }
                      }}
                      className="btn-glow bg-gradient-to-r from-primary to-secondary text-white font-bold py-4 px-6 rounded-full text-lg w-full shadow-lg shadow-primary/25 hover:scale-[1.01] active:scale-[0.99]"
                    >
                      {next ? `Continuar con: ${next.title} →` : 'Volver a la biblioteca →'}
                    </button>
                  )
                })()}
                </>
                )}
                {/* Navegación entre pasos */}
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => { setTopicStep(Math.max(0, topicStep - 1)); setShowFeedback(false); setRevealedCases([]); setReflectNote(''); setTfAnswers({}); setTfRevealed(false); setBlankInputs({}); setBlanksChecked(false); }}
                    disabled={topicStep === 0}
                    className={`font-bold py-3 px-4 rounded-full transition-all ${
                      topicStep === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-slate-700 shadow-sm border border-slate-100 hover:bg-gray-50'
                    }`}
                  >
                    ← Anterior
                  </button>
                  <button
                    onClick={() => setLearnView('hub')}
                    className="bg-white text-slate-700 font-bold py-3 px-4 rounded-full shadow-sm border border-slate-100 hover:bg-gray-50 transition-all"
                  >
                    Ver temas
                  </button>
                  <button
                    onClick={() => { setTopicStep(Math.min(5, topicStep + 1)); setShowFeedback(false); setRevealedCases([]); setReflectNote(''); setTfAnswers({}); setTfRevealed(false); setBlankInputs({}); setBlanksChecked(false); }}
                    disabled={topicStep === 5}
                    className={`font-bold py-3 px-4 rounded-full transition-all text-white ${
                      topicStep === 5
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-primary to-secondary shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                  >
                    Siguiente →
                  </button>
                </div>

                {/* Footer */}
                <footer className="text-center">
                  <p className="text-slate-500 text-sm">{t('bottomQuote')}</p>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-2">Hablemos Claro · {t('selectTagline')}</p>
                </footer>
              </div>
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
                      <li key={i} className="flex items-start justify-center gap-3">
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
                  <button
                    onClick={() => {
                      const kid = KIDS_TOPICS.find(k => k.id === activeGuide.relatedKid)
                      if (profileType === 'family') {
                        let updated: FamilyProfile = { ...familyProfile }
                        updated = pushFamilyLog(updated, `📌 Actividad familiar asignada: ${kid ? kid.title : activeGuide.title}.`)
                        const checked = checkFamilyBadges(updated)
                        setFamilyProfile(checked.profile)
                        saveFamilyProfile(checked.profile)
                        celebrateFamilyBadges(checked.unlocked)
                      }
                      if (kid) {
                        setActiveKidId(kid.id)
                        setLearnView('kid')
                        setShowFeedback(false)
                      }
                    }}
                    className="btn-glow bg-white border-2 border-warning text-warning font-bold py-4 px-6 rounded-xl text-lg w-full mt-4"
                  >
                    📌 Asignar actividad familiar
                  </button>
                </div>
                <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-lg shadow-indigo-500/5 p-8">
                  <h3 className="font-bold text-primary text-xl mb-2">👦 Actividad relacionada</h3>
                  <p className="text-gray-600 mb-6">Tu hijo puede trabajar este tema desde su biblioteca.</p>
                  <button
                    onClick={() => { setActiveKidId(activeGuide.relatedKid); setLearnView('kid'); setShowFeedback(false); setTopicStep(0); setAnsweredOpt(null); setRevealedCases([]); setReflectNote(''); setTfAnswers({}); setTfRevealed(false); setBlankInputs({}); setBlanksChecked(false); }}
                    className="btn-glow bg-primary text-white font-bold py-4 px-6 rounded-xl w-full"
                  >
                    Ver tema relacionado →
                  </button>
                </div>
              </>
            )}

            {/* EXAMEN FINAL */}
            {learnView === 'exam' && examUnlocked && (
              <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-lg shadow-indigo-500/5 p-8">
                <button onClick={() => setLearnView('hub')} className="text-gray-500 hover:text-primary text-sm font-medium mb-4">
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

          {/* MASCOTA DULI — compañera flotante del mapa de Temas */}
          {learnView === 'hub' && (
            <div className="fixed bottom-5 right-5 z-40 flex items-end gap-2 pointer-events-none">
              <div className="relative bg-white rounded-2xl rounded-br-sm border border-slate-100 shadow-xl px-3.5 py-2.5 max-w-[210px] pointer-events-auto">
                <p className="text-[11px] font-black text-slate-700 leading-snug">{duliTip}</p>
                <span className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-white border-r border-b border-slate-100 rotate-45" aria-hidden />
              </div>
              <div className="w-14 h-14 md:w-16 md:h-16 shrink-0 animate-float pointer-events-auto" style={{ filter: 'drop-shadow(0 8px 16px rgba(30,41,82,0.25))' }}>
                <DuliMascot className="w-full h-full" />
              </div>
            </div>
          )}
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

            <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-lg shadow-indigo-500/5 p-6 shadow-custom-lg mb-6 card-hover">
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

    case 'brainflight':
      return (
        <div className="min-h-screen flex flex-col bg-[#0b1020]">
          {/* Header del juego */}
          <div className="flex items-center justify-between gap-3 px-4 md:px-6 py-3 bg-[#111731] border-b border-white/10 shrink-0">
            <button
              onClick={() => navigateTo('games')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-colors shrink-0"
            >
              ← Juegos
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl">🧠</span>
              <span className="text-white font-black text-sm md:text-base truncate">Brain Flight</span>
            </div>
            <button
              onClick={() => window.open(BRAIN_FLIGHT_URL, '_blank', 'noopener,noreferrer')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-colors shrink-0"
              title="Abrir en una pestaña nueva"
            >
              ↗ Abrir
            </button>
          </div>
          {/* Juego a pantalla completa */}
          <iframe
            src={BRAIN_FLIGHT_URL}
            title="Brain Flight"
            className="flex-1 w-full border-0"
            allow="autoplay; fullscreen; gamepad; clipboard-write; encrypted-media"
            allowFullScreen
          />
        </div>
      )

    case 'games':
      const cust9 = getCustomization();
      const gamesBadgeCount = profileType === 'family' ? familyProfile.familyBadges.filter(b => b.unlocked).length : getBadges().filter(b => b.unlocked).length;
       const gamesBadgeTotal = profileType === 'family' ? familyProfile.familyBadges.length : getBadges().length;
      return (
        <div className="min-h-screen pb-24" style={{ background: cust9.backgroundValue, backgroundSize: cust9.backgroundType === 'pattern' ? '50px 50px' : 'cover' }}>
          {/* Decoración de fondo */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-secondary/10 to-primary/10 blur-3xl" />
            <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-warning/5 blur-3xl" />
          </div>

          <div className="relative max-w-5xl mx-auto px-6 md:px-8 pt-10 md:pt-16 pb-16 animate-slide-up">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 text-sm font-bold text-primary mb-6">
                🎮 Centro de Juegos
              </div>
              <h1 className="text-4xl md:text-5xl font-black gradient-text mb-3">¡Divertirse y aprender!</h1>
              <p className="text-slate-600 text-lg max-w-lg mx-auto">Juega, aprende sobre integridad y desbloquea insignias con cada desafío.</p>
            </div>

            {/* Brain Flight - Tarjeta principal */}
            <button
              onClick={() => navigateTo('brainflight')}
              className="group w-full mb-8 text-left relative overflow-hidden rounded-[28px] bg-gradient-to-br from-primary via-secondary to-primary p-[2px] shadow-xl shadow-primary/20 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300"
            >
              <div className="bg-white rounded-[26px] p-6 md:p-8 flex items-center gap-4 md:gap-6">
                <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-4xl md:text-5xl shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform duration-300">
                  🧠
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl md:text-3xl font-black text-primary">Brain Flight</h2>
                    <span className="px-2.5 py-1 rounded-full bg-success/15 text-success text-[11px] font-black uppercase tracking-wider animate-pulse">Nuevo</span>
                  </div>
                  <p className="text-gray-600 text-base md:text-lg">Pilota tu cerebro: esquiva obstáculos, recoge energía y supera tu mejor puntaje.</p>
                  <p className="text-primary text-sm font-bold mt-1 group-hover:underline">▶ Jugar ahora →</p>
                </div>
                <div className="shrink-0 hidden md:flex items-center gap-1 text-slate-400 group-hover:text-primary transition-colors">
                  <span className="text-2xl">🕹️</span>
                </div>
              </div>
            </button>

            {/* Sección de actividad y badges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg shadow-indigo-500/5 border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warning to-warning/60 flex items-center justify-center text-xl">🏅</div>
                  <div>
                    <h3 className="font-black text-slate-800 text-lg">Insignias</h3>
                    <p className="text-sm text-slate-500">Desbloquea todas para ser Campeón</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-warning to-warning/60 transition-all duration-700" style={{ width: `${(gamesBadgeCount / gamesBadgeTotal) * 100}%` }} />
                  </div>
                  <span className="text-sm font-bold text-slate-700 shrink-0">{gamesBadgeCount}/{gamesBadgeTotal}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  {['🛡️', '🎮', '🏆'].map((emoji, i) => (
                    <span key={i} className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border-2 ${i < gamesBadgeCount ? 'bg-white border-primary/30 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-40'}`}>
                      {i < gamesBadgeCount ? emoji : '🔒'}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg shadow-indigo-500/5 border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl">🔥</div>
                  <div>
                    <h3 className="font-black text-slate-800 text-lg">Racha</h3>
                    <p className="text-sm text-slate-500">Días consecutivos jugando</p>
                  </div>
                </div>
                <p className="text-4xl font-black gradient-text">{Math.max(1, Math.floor(Math.random() * 7) + 1)}<span className="text-xl text-slate-500 ml-2">días</span></p>
                <p className="text-xs text-slate-400 mt-1">¡Mantén tu racha activa!</p>
              </div>
            </div>

            {/* CTA principal */}
            <div className="text-center mt-10">
              <button
                onClick={() => navigateTo('brainflight')}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 text-white text-lg font-bold rounded-full px-10 py-4 bg-gradient-to-r from-primary to-secondary shadow-lg shadow-primary/30 hover:shadow-xl hover:scale-105 active:scale-[0.98] transition-all duration-200"
              >
                🚀 Jugar Brain Flight
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </button>
            </div>

            {/* Footer */}
            <footer className="mt-14 text-center">
              <p className="text-slate-500 text-sm">Hablemos Claro · Aprende con juegos 🎮</p>
            </footer>
          </div>

          {/* Navegación inferior */}
          <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-max max-w-[94vw] bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-500/10 px-3 py-2 flex items-center gap-1">
            {[
              { label: 'Inicio', icon: '🏠', go: () => navigateTo('home') },
              { label: 'Temas', icon: '📖', go: () => openTemasTab('') },
              { label: 'Juegos', icon: '🎮', active: true, go: () => setCurrentScreen('games') },
              { label: 'Perfil', icon: '👤', go: () => navigateTo('profile') },
            ].map(navItem => (
              <button
                key={navItem.label}
                onClick={navItem.go}
                className={`px-3 md:px-4 py-2 rounded-2xl flex flex-col items-center gap-0.5 text-xs font-bold transition-all ${navItem.active ? 'text-white bg-gradient-to-r from-primary to-secondary shadow-md shadow-primary/25' : 'text-slate-500 hover:text-primary hover:bg-primary/5'}`}
              >
                <span className="text-base leading-none">{navItem.icon}</span>
                {navItem.label}
              </button>
            ))}
          </nav>
        </div>
      )

    case 'converse':
      const cust10 = getCustomization()
      const convTextColors = getTextColorForTheme(cust10.backgroundValue)
      const prompt = conversationPrompts[currentQuestionIndex]
      const isLastQ = currentQuestionIndex >= conversationPrompts.length
      const turnIsKid = conversationTurn === 'kid'
      const isClosed = prompt?.type === 'closed'
      const convPct = Math.round((Math.min(currentQuestionIndex, conversationPrompts.length) / conversationPrompts.length) * 100)

      return (
        <div className="min-h-screen p-4 md:p-8 relative overflow-hidden" style={{ background: cust10.backgroundValue, backgroundSize: cust10.backgroundType === 'pattern' ? '50px 50px' : 'cover' }}>
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -top-20 -right-16 w-72 h-72 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(16,185,129,0.18)' }} />
            <div className="absolute -bottom-24 -left-16 w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(37,99,235,0.18)' }} />
            <div className="absolute top-24 left-[6%] text-3xl animate-float hidden md:block">💬</div>
            <div className="absolute bottom-32 right-[7%] text-3xl animate-float hidden md:block" style={{ animationDelay: '1.1s' }}>👨‍👧</div>
          </div>

          <div className="relative max-w-3xl mx-auto animate-slide-up py-2">
            {/* Encabezado */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto mb-3 rounded-3xl shadow-lg flex items-center justify-center text-3xl animate-float" style={{ background: 'linear-gradient(135deg, #10b981, #2563EB)' }}>
                💬
              </div>
              <h1 className="text-2xl md:text-4xl font-black mb-2" style={{ color: convTextColors.primary }}>Conversemos en familia</h1>
              <p className="text-sm md:text-base max-w-lg mx-auto" style={{ color: convTextColors.secondary }}>
                Respondan por turnos: primero 👦 y luego 👨. ¡Aquí no hay respuestas malas!
              </p>
            </div>

            {!isLastQ ? (
              <>
                {/* Progreso */}
                <div className="mb-5">
                  <div className="flex justify-between mb-1.5 text-xs font-black" style={{ color: convTextColors.secondary }}>
                    <span>Pregunta {currentQuestionIndex + 1} de {conversationPrompts.length}</span>
                    <span>{convPct}%</span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: convTextColors.border }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${convPct}%`, background: 'linear-gradient(90deg, #10b981, #2563EB)' }} />
                  </div>
                </div>

                {/* Turno actual */}
                <div className="flex justify-center mb-5">
                  <span className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-black shadow-lg" style={{ background: turnIsKid ? 'linear-gradient(135deg, #2563EB, #7C3AED)' : 'linear-gradient(135deg, #10b981, #059669)', color: '#ffffff' }}>
                    {turnIsKid ? '👧 Turno del joven' : '👨 Turno del padre'}
                  </span>
                </div>

                {/* Tarjeta de pregunta */}
                <div className="rounded-3xl p-6 md:p-8 shadow-custom-lg border border-white/70 mb-6 animate-fade-in" style={{ backgroundColor: '#ffffff' }}>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="text-2xl">{turnIsKid ? '👦' : '👨'}</span>
                    <span className="font-black text-slate-800">{turnIsKid ? 'Joven' : 'Padre'}</span>
                    <span className="ml-auto text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: isClosed ? '#EFF6FF' : '#F0FDF4', color: isClosed ? '#2563EB' : '#059669' }}>
                      {isClosed ? 'Opción múltiple ✅' : 'Respuesta abierta ✍️'}
                    </span>
                  </div>
                  <p className="text-xl md:text-2xl font-black text-center text-slate-900 leading-snug mb-6">
                    {turnIsKid ? prompt.kidQuestion : prompt.parentQuestion}
                  </p>

                  {isClosed ? (
                    <div className="space-y-3">
                      {(turnIsKid ? prompt?.kidOptions : prompt?.parentOptions)?.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            if (turnIsKid) {
                              setKidAnswer(opt)
                            } else {
                              setParentAnswer(opt)
                            }
                            // Auto-advance to next turn or next question
                            setTimeout(() => {
                              if (!turnIsKid) {
                                // Parent just answered, move to next question
                                setConversationTurn('kid')
                                setKidAnswer('')
                                setParentAnswer('')
                                setCurrentQuestionIndex(prev => prev + 1)
                              } else {
                                // Kid just answered, switch to parent
                                setConversationTurn('parent')
                              }
                            }, 300)
                          }}
                          className="w-full text-left py-3.5 px-4 rounded-2xl border-2 border-slate-200 text-sm font-bold text-slate-700 hover:border-emerald-400 hover:bg-emerald-50 transition-all"
                        >
                          <span className="mr-2 font-black text-slate-400">{'ABCDEF'[i] ?? '•'}</span>{opt}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <textarea
                        className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-emerald-400 focus:outline-none resize-none min-h-[120px] placeholder-slate-400 text-slate-800 bg-white"
                        placeholder={turnIsKid ? 'Escribe tu respuesta como joven...' : 'Escribe tu respuesta como padre...'}
                        value={turnIsKid ? kidAnswer : parentAnswer}
                        onChange={(e) => {
                          if (turnIsKid) setKidAnswer(e.target.value)
                          else setParentAnswer(e.target.value)
                        }}
                      ></textarea>
                      <button
                        onClick={() => {
                          const answer = turnIsKid ? kidAnswer : parentAnswer
                          if (answer.trim()) {
                            if (turnIsKid) {
                              setKidAnswer(answer)
                            } else {
                              setParentAnswer(answer)
                            }
                            if (!turnIsKid) {
                              // Parent finished, go to next question
                              setConversationTurn('kid')
                              setKidAnswer('')
                              setParentAnswer('')
                              setCurrentQuestionIndex(prev => prev + 1)
                            } else {
                              // Kid finished, switch to parent
                              setConversationTurn('parent')
                            }
                          }
                        }}
                        className="mt-3 w-full py-3.5 rounded-2xl text-white font-black text-sm transition-all hover:scale-[1.01] shadow-lg"
                        style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                      >
                        {turnIsKid ? '👦 Respondí → Le toca al padre' : '👨 Respondí → Siguiente pregunta'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Navegación */}
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => navigateTo('home')}
                    className="py-2.5 px-5 rounded-full text-sm font-bold transition-all"
                    style={{ backgroundColor: convTextColors.cardBg, color: convTextColors.label, border: `1.5px solid ${convTextColors.border}` }}
                  >
                    🏠 Inicio
                  </button>
                  <button
                    onClick={() => navigateTo('activity')}
                    className="py-2.5 px-5 rounded-full text-sm font-black text-white shadow-lg transition-all hover:scale-[1.02]"
                    style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}
                  >
                    🎯 Actividad familiar completa →
                  </button>
                </div>
              </>
            ) : (
              /* Completado */
              <div className="rounded-3xl p-7 md:p-9 shadow-custom-lg border border-white/70 text-center animate-slide-up" style={{ backgroundColor: '#ffffff' }}>
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 text-4xl animate-float" style={{ backgroundColor: '#ECFDF5' }}>🎉</div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">¡Excelente conversación!</h2>
                <p className="text-slate-600 mb-1">Los dos participaron: así se construye una familia más honesta. 💚</p>
                <p className="text-sm text-slate-500 mb-6">Tu progreso se guardó en el perfil.</p>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setCurrentQuestionIndex(0)
                      setConversationTurn('kid')
                      setKidAnswer('')
                      setParentAnswer('')
                      completeConversation()
                    }}
                    className="w-full py-3.5 px-6 rounded-2xl text-white font-black transition-all hover:scale-[1.01] shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                  >
                    🔄 Volver a empezar
                  </button>
                  <button
                    onClick={() => navigateTo('activity')}
                    className="w-full py-3.5 px-6 rounded-2xl text-white font-black transition-all hover:scale-[1.01] shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}
                  >
                    🎯 Seguir con la actividad familiar
                  </button>
                  <button
                    onClick={() => navigateTo('home')}
                    className="w-full py-3.5 px-6 rounded-2xl font-black transition-all bg-slate-100 text-slate-700 hover:bg-slate-200"
                  >
                    🏠 Volver al inicio
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )
    case 'activity':
      const cust11 = getCustomization();
      const totalPrompts = familyActivityQuestions.length;
      const isDoneView = familyActivityIndex >= totalPrompts;
      const safeIndex = Math.min(familyActivityIndex, totalPrompts - 1);
      const currentPrompt = familyActivityQuestions[safeIndex];
      const isLastPrompt = safeIndex === totalPrompts - 1;
      const activityPct = isDoneView ? 100 : Math.round((safeIndex / totalPrompts) * 100);
      const phaseTabs = [
        { id: 'comprendemos' as const, dataType: 'comprendemos', label: 'Comprendemos', emoji: '🧠', color: '#2563EB' },
        { id: 'relacionamos' as const, dataType: 'relaciona', label: 'Relacionamos', emoji: '🔗', color: '#7C3AED' },
        { id: 'actuamos' as const, dataType: 'actuamos', label: 'Actuamos', emoji: '🚀', color: '#10b981' },
      ];
      const activePhase = phaseTabs.find(p => p.dataType === currentPrompt.type)?.id ?? 'comprendemos';
      const activePhaseMeta = phaseTabs.find(p => p.id === activePhase) ?? phaseTabs[0];
      const typeSubs: Record<string, string> = {
        comprendemos: 'Hablen juntos sobre lo aprendido',
        relaciona: 'Conecten con sus experiencias',
        actuamos: 'Propongan acciones en familia',
      };
      const speakPrompt = () => {
        try {
          const synth = window.speechSynthesis;
          if (!synth) return;
          synth.cancel();
          const utter = new SpeechSynthesisUtterance(currentPrompt.text);
          utter.lang = 'es-PE';
          utter.rate = 0.95;
          synth.speak(utter);
        } catch {
          // El navegador no soporta lectura en voz alta
        }
      };

      return (
        <div className="min-h-screen p-4 md:p-8 relative overflow-hidden" style={{ background: cust11.backgroundValue, backgroundSize: cust11.backgroundType === 'pattern' ? '50px 50px' : 'cover' }}>
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -top-20 -left-16 w-72 h-72 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(124,58,237,0.18)' }} />
            <div className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(16,185,129,0.16)' }} />
            <div className="absolute top-24 right-[8%] text-3xl animate-float hidden md:block">✨</div>
            <div className="absolute bottom-32 left-[7%] text-3xl animate-float hidden md:block" style={{ animationDelay: '1.2s' }}>🎯</div>
          </div>

          <button
            onClick={() => navigateTo('converse')}
            className="absolute top-5 left-5 z-10 bg-white/80 backdrop-blur px-4 py-2 rounded-full text-gray-600 text-sm font-bold shadow-sm hover:bg-white hover:text-primary transition-all"
          >
            ← Atrás
          </button>

          <div className="relative max-w-3xl mx-auto animate-slide-up py-10 md:py-14">
            {/* Encabezado */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto mb-3 rounded-3xl shadow-lg flex items-center justify-center text-3xl animate-float" style={{ background: 'linear-gradient(135deg, #7C3AED, #10b981)' }}>
                🗣️
              </div>
              <h1 className="text-2xl md:text-4xl font-black text-white drop-shadow-lg mb-2">Conversamos en familia</h1>
              <p className="text-white/85 text-sm md:text-base max-w-lg mx-auto">
                Elijan una pregunta, hablen 5 minutos todos y escriban solo palabras clave. ¡Escuchar es tan importante como hablar! 👂
              </p>
            </div>

            {/* Fases */}
            {!isDoneView && (
              <div className="flex justify-center gap-2 mb-5 flex-wrap">
                {phaseTabs.map(tab => {
                  const active = activePhase === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        const first = familyActivityQuestions.findIndex(q => q.type === tab.dataType);
                        if (first >= 0) setFamilyActivityIndex(first);
                      }}
                      className="px-4 py-2 rounded-full text-xs md:text-sm font-black transition-all shadow-sm"
                      style={
                        active
                          ? { background: tab.color, color: '#ffffff', boxShadow: `0 6px 16px ${tab.color}55` }
                          : { backgroundColor: 'rgba(255,255,255,0.85)', color: '#475569' }
                      }
                    >
                      {tab.emoji} {tab.label}
                    </button>
                  );
                })}
              </div>
            )}

            {!isDoneView ? (
              <>
                {/* Progreso */}
                <div className="mb-5">
                  <div className="flex justify-between mb-1.5 text-xs font-black text-white/85">
                    <span>Pregunta {safeIndex + 1} de {totalPrompts}</span>
                    <span>{activityPct}%</span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden bg-white/25">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${activityPct}%`, background: 'linear-gradient(90deg, #7C3AED, #10b981)' }} />
                  </div>
                </div>

                {/* Tarjeta de pregunta */}
                <div className="rounded-3xl p-6 md:p-9 shadow-custom-lg border border-white/70 mb-6 animate-fade-in" style={{ backgroundColor: '#ffffff' }}>
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black" style={{ backgroundColor: `${activePhaseMeta.color}18`, color: activePhaseMeta.color }}>
                      {activePhaseMeta.emoji} {activePhaseMeta.label}
                    </span>
                    {isLastPrompt ? (
                      <span className="text-xs font-black px-2.5 py-1 rounded-full" style={{ backgroundColor: '#FFF7ED', color: '#C2410C' }}>🏁 ¡Última pregunta!</span>
                    ) : (
                      <span className="text-xs font-bold text-slate-400">{typeSubs[currentPrompt.type]}</span>
                    )}
                  </div>

                  <p className="text-2xl md:text-3xl font-black text-slate-900 leading-snug mb-6">
                    {currentPrompt.text}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-5">
                    <button
                      onClick={speakPrompt}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-black transition-all hover:scale-[1.02]"
                      style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}
                    >
                      🔊 Leer en voz alta
                    </button>
                    <button
                      onClick={() => setFamilyDoneList(prev => prev.includes(safeIndex) ? prev.filter(i => i !== safeIndex) : [...prev, safeIndex])}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-black transition-all hover:scale-[1.02]"
                      style={
                        familyDoneList.includes(safeIndex)
                          ? { backgroundColor: '#DCFCE7', color: '#15803D' }
                          : { backgroundColor: '#F8FAFC', color: '#64748B' }
                      }
                    >
                      {familyDoneList.includes(safeIndex) ? '⭐ Ya la conversaron' : '☆ Marcar como conversada'}
                    </button>
                    <span className="inline-flex items-center px-3 py-2.5 text-xs font-bold text-white/80">
                      ⭐ {familyDoneList.length}/{totalPrompts}
                    </span>
                  </div>

                  <label className="block text-sm font-bold text-slate-600 mb-2">Notas de la familia ✍️ (opcional)</label>
                  <textarea
                    className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-emerald-400 focus:outline-none resize-none min-h-[100px] text-slate-800 placeholder-slate-400"
                    placeholder="Escriban palabras clave de lo que hablaron..."
                  ></textarea>
                </div>

                {/* Navegación */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setFamilyActivityIndex(prev => Math.max(0, prev - 1))}
                    disabled={safeIndex === 0}
                    className="flex-1 py-3.5 px-4 rounded-2xl text-sm font-black transition-all disabled:opacity-40 bg-white/90 text-slate-700 border-2 border-white hover:bg-white"
                  >
                    ← Anterior
                  </button>
                  <button
                    onClick={() => setFamilyActivityIndex(prev => (prev < totalPrompts - 1 ? prev + 1 : totalPrompts))}
                    className="flex-1 py-3.5 px-6 rounded-2xl text-sm font-black text-white shadow-lg transition-all hover:scale-[1.02]"
                    style={{ background: isLastPrompt ? 'linear-gradient(135deg, #F59E0B, #EA580C)' : 'linear-gradient(135deg, #7C3AED, #2563EB)' }}
                  >
                    {isLastPrompt ? '🏁 Terminar' : 'Siguiente →'}
                  </button>
                </div>
              </>
            ) : (
              // Completado
              <div className="rounded-3xl p-7 md:p-9 shadow-custom-lg border border-white/70 text-center animate-slide-up" style={{ backgroundColor: '#ffffff' }}>
                <div className="text-6xl mb-3 animate-float">🎉</div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">¡Actividad completada!</h2>
                <p className="text-slate-600 mb-1">Conversar en familia nos ayuda a aprender y convivir mejor. 💚</p>
                <p className="text-sm text-slate-500 mb-5">
                  Marcaron {familyDoneList.length} de {totalPrompts} preguntas.
                </p>

                <p className="font-black text-slate-800 mb-3">Elijan UNA acción para esta semana 👇</p>
                <div className="grid gap-2.5 mb-6 text-left">
                  {[
                    '😄 Compartir un momento de alegría cada día',
                    '🏅 Reconocer una buena decisión familiar esta semana',
                    '🗣️ Crear un ritual de conversación familiar',
                  ].map((actionText, i) => {
                    const selected = familyWeeklyAction === i;
                    return (
                      <button
                        key={i}
                        onClick={() => setFamilyWeeklyAction(i)}
                        className="w-full py-3 px-4 rounded-2xl text-sm font-bold text-left transition-all border-2"
                        style={
                          selected
                            ? { backgroundColor: '#ECFDF5', borderColor: '#10b981', color: '#065F46' }
                            : { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', color: '#334155' }
                        }
                      >
                        {selected ? '✅ ' : ''}{actionText}
                      </button>
                    );
                  })}
                </div>

                <div className="grid gap-2.5">
                  <button
                    onClick={() => {
                      setFamilyActivityIndex(0);
                      setFamilyDoneList([]);
                      setFamilyWeeklyAction(null);
                    }}
                    className="w-full py-3.5 rounded-2xl text-white font-black transition-all hover:scale-[1.01] shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}
                  >
                    🔄 Volver a empezar
                  </button>
                  <button
                    onClick={() => goHome()}
                    className="w-full py-3.5 rounded-2xl font-black transition-all bg-slate-100 text-slate-700 hover:bg-slate-200"
                  >
                    🏠 Volver al inicio
                  </button>
                </div>
              </div>
            )}
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
            <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-lg shadow-indigo-500/5 p-3 mb-8 flex gap-3">
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
                {/* Header con avatar mejorado */}
                <div className="text-center mb-10 relative">
                  <div className="relative inline-block">
                    <div className="relative w-36 h-36 mx-auto mb-6">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-secondary p-[3px] shadow-lg shadow-primary/30 animate-float">
                        <div className="w-full h-full rounded-full overflow-hidden border-4 border-white">
                          {studentProfile.photo ? (
                            <img
                              src={studentProfile.photo}
                              alt="Perfil"
                              className="w-full h-full object-cover"
                              style={{
                                objectPosition: `${studentProfile.photoPos?.x ?? 50}% ${studentProfile.photoPos?.y ?? 50}%`,
                                transform: `scale(${studentProfile.photoPos?.zoom ?? 1})`,
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-6xl">
                              👤
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Badge de nivel */}
                      <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br from-warning to-secondary flex items-center justify-center text-lg shadow-lg border-4 border-white font-black text-white">
                        {currentUnlockedCount >= 3 ? '🏆' : currentUnlockedCount >= 1 ? '🥇' : currentUnlockedCount >= 1 ? '🥈' : '🥉'}
                      </div>
                    </div>
                    {/* Edit photo button */}
                    <button
                      onClick={() => {
                        setTempPhoto(studentProfile.photo)
                        setPhotoUrl(studentProfile.photo.startsWith('http') ? studentProfile.photo : '')
                        setPosDraft(studentProfile.photoPos ?? defaultPhotoPos)
                        setEditPhotoModal(true)
                      }}
                      className="absolute bottom-0 right-0 w-11 h-11 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all text-xl"
                      aria-label={t('editPhoto')}
                    >
                      ✏️
                    </button>
                  </div>
                  <div className="bg-white/85 backdrop-blur-xl rounded-3xl px-6 py-5 shadow-lg shadow-indigo-500/5 inline-block">
                    <h2 className="text-4xl font-black gradient-text mb-1">{studentProfile.name || 'Estudiante'}</h2>
                    <p className="text-gray-500 mt-1 text-sm">{t('profileSub')}</p>
                    {(studentProfile.age || studentProfile.district) && (
                      <div className="flex justify-center gap-2 mt-3 flex-wrap">
                        {studentProfile.age && (
                          <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold">
                            🎂 {studentProfile.age} {t('ageYears')}
                          </span>
                        )}
                        {studentProfile.district && (
                          <span className="px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-bold">
                            📍 {studentProfile.district}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* XP Level Bar */}
                <div className="bg-white/85 backdrop-blur-xl rounded-2xl p-4 mb-6 flex items-center gap-4 shadow-lg shadow-indigo-500/5">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl shadow-md">
                    {currentUnlockedCount >= 3 ? '🏆' : '⭐'}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-bold text-slate-800">Nivel {currentUnlockedCount >= 3 ? 'Campeón' : currentUnlockedCount >= 1 ? 'En camino' : 'Aprendiz'}</span>
                      <span className="text-sm font-bold text-primary">{currentUnlockedCount}/3 insignias</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-700 shadow-sm" style={{ width: `${(currentUnlockedCount / 3) * 100}%` }} />
                    </div>
                  </div>
                </div>

                {/* Stats Cards mejoradas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
                  <button onClick={() => setCurrentScreen('profile')} className="group rounded-[20px] bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-4 md:p-6 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
                    <div className="text-3xl md:text-4xl mb-1 group-hover:scale-110 transition-transform">🏅</div>
                    <div className="text-xl md:text-2xl font-black gradient-text">{currentUnlockedCount}/3</div>
                    <div className="text-xs md:text-sm font-bold text-primary/80 mt-1">{t('myBadges')}</div>
                  </button>
                  <button onClick={() => setCurrentScreen('profile')} className="group rounded-[20px] bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 p-4 md:p-6 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
                    <div className="text-3xl md:text-4xl mb-1 group-hover:scale-110 transition-transform">📚</div>
                    <div className="text-xl md:text-2xl font-black text-secondary">{getProgress().completedActivities}</div>
                    <div className="text-xs md:text-sm font-bold text-secondary/80 mt-1">{t('activities')}</div>
                  </button>
                  <button onClick={() => setCurrentScreen('profile')} className="group rounded-[20px] bg-gradient-to-br from-warning/10 to-warning/5 border border-warning/20 p-4 md:p-6 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
                    <div className="text-3xl md:text-4xl mb-1 group-hover:scale-110 transition-transform">💬</div>
                    <div className="text-xl md:text-2xl font-black text-warning">{getProgress().conversations}</div>
                    <div className="text-xs md:text-sm font-bold text-warning/80 mt-1">{t('conversations')}</div>
                  </button>
                  <button onClick={() => setCurrentScreen('profile')} className="group rounded-[20px] bg-gradient-to-br from-success/10 to-success/5 border border-success/20 p-4 md:p-6 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
                    <div className="text-3xl md:text-4xl mb-1 group-hover:scale-110 transition-transform">🔥</div>
                    <div className="text-xl md:text-2xl font-black text-success">{getProgress().streakDays}</div>
                    <div className="text-xs md:text-sm font-bold text-success/80 mt-1">{t('streak')}</div>
                  </button>
                </div>

                {/* Badges o Stats */}
                <div className="bg-white/85 backdrop-blur-xl rounded-3xl p-6 md:p-8 mb-8 shadow-lg shadow-indigo-500/5">
                  {currentUnlockedCount > 0 ? (
                    <>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-black text-dark text-lg">{t('myBadges')}</h3>
                        <span className="text-sm font-bold text-primary">{currentUnlockedCount}/3</span>
                      </div>
                      <div className="flex flex-wrap gap-4 md:gap-6 justify-center">
                        {currentBadges.map(badge => (
                          <div key={badge.id} className={`flex-1 min-w-[130px] max-w-[200px] text-center p-5 rounded-2xl transition-all hover:-translate-y-1 ${badge.unlocked ? 'bg-gradient-to-br from-warning/10 to-primary/10 border-2 border-warning/30 shadow-md animate-float' : 'bg-gray-50 border-2 border-dashed border-gray-200 opacity-60'}`}>
                            <div className="text-5xl mb-2">{badge.emoji}</div>
                            <div className="text-sm font-bold mt-1" style={{ color: badge.color }}>{badge.name}</div>
                            <div className="text-xs mt-1" style={{ color: badge.unlocked ? '#059669' : '#94a3b8' }}>
                              {badge.unlocked ? '✓ Desbloqueada' : '🔒 Bloqueada'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="font-black text-dark text-lg mb-6">{t('noBadgesYet')} - {t('yourStats')}</h3>
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-bold text-primary mb-3">{t('topicProgress')}</h4>
                          <div className="space-y-3">
                            {Object.entries(getProgress().topicProgress).map(([topic, value]) => (
                              <div key={topic} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="capitalize font-medium text-slate-700">{topic}</span>
                                  <span className="font-bold text-primary">{value}%</span>
                                </div>
                                <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-700 shadow-sm" style={{ width: `${value}%` }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        {getProgress().quizScores.length > 0 && (
                          <div>
                            <h4 className="font-bold text-secondary mb-3">{t('avgQuizScore')}</h4>
                            <div className="h-36 flex items-end justify-around gap-2">
                              {getProgress().quizScores.slice(-6).map((score, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center">
                                  <div className="w-full bg-gradient-to-t from-secondary to-primary rounded-t transition-all shadow-sm" style={{ height: `${score}%` }} />
                                  <span className="text-xs text-gray-500 mt-1">Q{i + 1}</span>
                                </div>
                              ))}
                            </div>
                            <p className="text-center text-sm text-gray-500 mt-2">
                              Promedio: {Math.round(getProgress().quizScores.reduce((a, b) => a + b, 0) / getProgress().quizScores.length)}%
                            </p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                          <div className="text-center p-4 bg-primary/5 rounded-xl">
                            <div className="text-2xl font-bold text-primary">{getProgress().completedActivities}</div>
                            <div className="text-xs text-gray-500">{t('activitiesDone')}</div>
                          </div>
                          <div className="text-center p-4 bg-secondary/5 rounded-xl">
                            <div className="text-2xl font-bold text-secondary">{getProgress().conversations}</div>
                            <div className="text-xs text-gray-500">{t('conversations')}</div>
                          </div>
                          <div className="text-center p-4 bg-warning/5 rounded-xl">
                            <div className="text-2xl font-bold text-warning">{getProgress().streakDays}</div>
                            <div className="text-xs text-gray-500">{t('streak')}</div>
                          </div>
                          <div className="text-center p-4 bg-success/5 rounded-xl">
                            <div className="text-2xl font-bold text-success">{Object.values(getProgress().topicProgress).filter(v => v >= 100).length}</div>
                            <div className="text-xs text-gray-500">{t('topicsCompleted')}</div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* General Progress */}
                <div className="bg-white/85 backdrop-blur-xl rounded-3xl p-6 mb-6 shadow-lg shadow-indigo-500/5">
                  <h3 className="font-black text-dark mb-4">{t('generalProgress')}</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-700 shadow-sm"
                        style={{ width: `${getProgress().totalActivities > 0 ? (getProgress().completedActivities / getProgress().totalActivities) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-primary whitespace-nowrap">
                      {getProgress().completedActivities}/{getProgress().totalActivities}
                    </span>
                  </div>
                </div>

                {/* Customization Panel */}
                <div className="bg-white/85 backdrop-blur-xl rounded-3xl p-8 mb-8 shadow-lg shadow-indigo-500/5">
                  <h3 className="font-black text-dark mb-6 flex items-center gap-2">🎨 {t('customization')}</h3>
                  <div className="mb-8">
                    <h4 className="font-bold text-gray-700 mb-4">{t('backgrounds')}</h4>
                    <div className="grid grid-cols-3 gap-4">
                      {backgrounds.map(bg => (
                        <button
                          key={bg.name}
                          onClick={() => {
                            const updated = { ...studentProfile, customization: { ...studentProfile.customization, backgroundType: bg.type, backgroundValue: bg.value } }
                            setStudentProfile(updated)
                            saveStudentProfile(updated)
                          }}
                          className={`p-4 rounded-xl border-3 transition-all text-center ${
                            studentProfile.customization.backgroundType === bg.type && studentProfile.customization.backgroundValue === bg.value
                              ? 'ring-4 ring-secondary shadow-md'
                              : 'border-transparent hover:border-gray-300 hover:shadow-sm'
                          }`}
                          style={{ background: bg.value, backgroundSize: bg.type === 'pattern' ? '50px 50px' : 'cover' }}
                        >
                          <span className="block text-sm font-bold text-gray-700 mt-2">{bg.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const updated = { ...studentProfile, customization: defaultCustomization }
                      setStudentProfile(updated)
                      saveStudentProfile(updated)
                    }}
                    className="w-full py-3 px-5 rounded-xl text-base text-gray-500 hover:text-primary hover:bg-gray-100 transition-all font-bold"
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
                {/* Header con avatar mejorado */}
                <div className="text-center mb-10 relative">
                  <div className="relative inline-block">
                    <div className="relative w-36 h-36 mx-auto mb-6">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-secondary to-warning p-[3px] shadow-lg shadow-secondary/30 animate-float">
                        <div className="w-full h-full rounded-full overflow-hidden border-4 border-white flex items-center justify-center text-5xl bg-white">
                          {familyProfile.familyAvatar ? (
                            <span className="leading-none">{familyProfile.familyAvatar}</span>
                          ) : (
                            <span className="leading-none text-5xl">👨‍👩‍👧</span>
                          )}
                        </div>
                      </div>
                      {/* Badge de progreso */}
                      <div className="absolute -bottom-2 -right-2 w-14 h-14 rounded-full bg-gradient-to-br from-secondary to-warning flex items-center justify-center text-xl shadow-lg border-4 border-white font-black text-white">
                        {famUnlocked >= 4 ? '🏆' : famUnlocked >= 2 ? '🥇' : '🥉'}
                      </div>
                    </div>
                    {/* Edit avatar button */}
                    <button
                      onClick={() => setEditingFamAvatar(v => !v)}
                      className="absolute bottom-0 right-0 w-11 h-11 rounded-full bg-gradient-to-br from-secondary to-warning text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform text-xl"
                      aria-label={t('editName')}
                    >
                      ✏️
                    </button>
                    {editingFamAvatar && (
                      <div className="bg-white rounded-2xl px-4 py-4 shadow-lg shadow-indigo-500/5 mb-4 animate-fade-in">
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
                    <div className="bg-white/85 backdrop-blur-xl rounded-3xl px-6 py-5 shadow-lg shadow-indigo-500/5 inline-block">
                      {editingFamName ? (
                        <div className="flex gap-2 justify-center">
                          <input type="text" value={famNameDraft} onChange={e => setFamNameDraft(e.target.value)} placeholder="Nombre de la familia" className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-dark focus:outline-none focus:ring-2 focus:ring-primary font-bold text-xl text-center max-w-xs" />
                          <button onClick={saveFamilyName} className="bg-success text-white font-bold px-4 py-2 rounded-xl">✓</button>
                          <button onClick={() => setEditingFamName(false)} className="bg-gray-200 text-gray-600 font-bold px-4 py-2 rounded-xl">✕</button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <h2 className="text-3xl font-black gradient-text">{familyProfile.name}</h2>
                          <button onClick={() => { setFamNameDraft(familyProfile.name); setEditingFamName(true) }} className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all" aria-label={t('editName')}>✏️</button>
                        </div>
                      )}
                      <p className="text-gray-500 mt-1">{t('familyTagline')}</p>
                    </div>
                  </div>
                </div>

                {/* Accesos rápidos mejorados */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
                  <button onClick={() => setCurrentScreen('learn')} className="group rounded-[20px] bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-4 md:p-6 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
                    <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">📚</div>
                    <div className="text-sm font-bold text-primary">{t('quickActivities')}</div>
                  </button>
                  <button onClick={() => setCurrentScreen('converse')} className="group rounded-[20px] bg-gradient-to-br from-warning/10 to-warning/5 border border-warning/20 p-4 md:p-6 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
                    <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">💬</div>
                    <div className="text-sm font-bold text-warning">{t('quickConvos')}</div>
                  </button>
                  <button onClick={() => scrollToRef(badgesRef)} className="group rounded-[20px] bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 p-4 md:p-6 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
                    <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">🏅</div>
                    <div className="text-sm font-bold text-secondary">{t('quickBadges')}</div>
                  </button>
                  <button onClick={() => scrollToRef(membersRef)} className="group rounded-[20px] bg-gradient-to-br from-success/10 to-success/5 border border-success/20 p-4 md:p-6 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
                    <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">👨‍👩‍👧</div>
                    <div className="text-sm font-bold text-success">{t('quickMembers')}</div>
                  </button>
                </div>

                {/* Estadísticas mejoradas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
                  <button onClick={() => scrollToRef(badgesRef)} className="group rounded-[20px] bg-gradient-to-br from-warning/10 to-warning/5 border border-warning/20 p-4 md:p-6 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
                    <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">🏅</div>
                    <div className="text-2xl md:text-3xl font-black text-warning">{famUnlocked}<span className="text-sm text-gray-400">/6</span></div>
                    <div className="text-xs font-bold text-warning/80 mt-1">{t('myBadges')}</div>
                  </button>
                  <button onClick={() => setCurrentScreen('learn')} className="group rounded-[20px] bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-4 md:p-6 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
                    <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">📚</div>
                    <div className="text-2xl md:text-3xl font-black text-primary">{familyProfile.progress.completedActivities}</div>
                    <div className="text-xs font-bold text-primary/80 mt-1">{t('activities')}</div>
                  </button>
                  <button onClick={() => setCurrentScreen('converse')} className="group rounded-[20px] bg-gradient-to-br from-warning/10 to-warning/5 border border-warning/20 p-4 md:p-6 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
                    <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">💬</div>
                    <div className="text-2xl md:text-3xl font-black text-warning">{familyProfile.progress.conversations}</div>
                    <div className="text-xs font-bold text-warning/80 mt-1">{t('conversations')}</div>
                  </button>
                  <button onClick={() => scrollToRef(membersRef)} className="group rounded-[20px] bg-gradient-to-br from-success/10 to-success/5 border border-success/20 p-4 md:p-6 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
                    <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">👨‍👩‍👧</div>
                    <div className="text-2xl md:text-3xl font-black text-success">{familyProfile.members.length}</div>
                    <div className="text-xs font-bold text-success/80 mt-1">{t('statMembers')}</div>
                  </button>
                </div>

                {/* Progreso circular mejorado */}
                <div className="bg-white/85 backdrop-blur-xl rounded-3xl p-8 mb-8 shadow-lg shadow-indigo-500/5 text-center relative overflow-hidden">
                  <span aria-hidden className="pointer-events-none absolute top-4 right-4 text-3xl opacity-20 animate-float">✨</span>
                  <h3 className="font-black text-dark text-xl mb-6">{t('generalProgress')}</h3>
                  <div className="flex justify-center">
                    <div className="relative">
                      <svg width="160" height="160" viewBox="0 0 140 140">
                        <circle cx="70" cy="70" r="54" fill="none" stroke="#E5E7EB" strokeWidth="14" />
                        <circle cx="70" cy="70" r="54" fill="none" stroke="url(#familyProgressGrad)" strokeWidth="14" strokeLinecap="round" strokeDasharray={ringC} strokeDashoffset={ringC - (ringC * famPct) / 100} transform="rotate(-90 70 70)" style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
                        <defs>
                          <linearGradient id="familyProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8B5CF6" />
                            <stop offset="100%" stopColor="#10B981" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl font-black gradient-text">{famPct}%</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-500 mt-4">{t('progressHint')}</p>
                </div>

                {/* Insignias mejoradas */}
                <div ref={badgesRef} className="bg-white/85 backdrop-blur-xl rounded-3xl p-7 md:p-8 mb-8 scroll-mt-4 relative overflow-hidden shadow-lg shadow-indigo-500/5">
                  <span aria-hidden className="pointer-events-none absolute top-4 right-5 text-xl opacity-30 animate-float">✨</span>
                  <span aria-hidden className="pointer-events-none absolute top-4 left-5 text-xl opacity-30">🌟</span>
                  <h3 className="font-black text-dark text-xl mb-1">🏅 {t('myBadges')}</h3>
                  <p className="text-gray-500 mb-6">{famUnlocked} de 6 desbloqueadas</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                    {famBadges.map(b => (
                      <div key={b.id} className={`rounded-2xl p-5 text-center border-2 card-hover ${b.unlocked ? 'bg-gradient-to-br from-warning/10 to-primary/10 border-warning/30 shadow-lg' : 'bg-gray-50 border-dashed border-gray-200'}`}>
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

                {/* Actividad reciente con timeline */}
                <div className="bg-white/85 backdrop-blur-xl rounded-3xl p-8 mb-8 shadow-lg shadow-indigo-500/5">
                  <h3 className="font-black text-dark text-xl mb-6">🕘 {t('recentActivity')}</h3>
                  {familyProfile.activityLog.length === 0 ? (
                    <p className="text-gray-500">{t('noActivity')}</p>
                  ) : (
                    <div className="space-y-3 relative">
                      <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gradient-to-b from-secondary/30 to-transparent" />
                      {familyProfile.activityLog.slice(0, 6).map(e => (
                        <div key={e.id} className="relative flex items-start gap-4 pl-8 animate-slide-up">
                          <div className="absolute left-1.5 top-2 w-3 h-3 rounded-full bg-secondary border-2 border-white shadow-sm" />
                          <div className="bg-white rounded-xl px-4 py-3 shadow-sm flex-1 border border-gray-50">
                            <p className="text-dark font-medium text-sm">{e.text}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{e.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Integrantes mejorados */}
                <div ref={membersRef} className="bg-white/85 backdrop-blur-xl rounded-3xl p-8 mb-8 scroll-mt-4">
                  <h3 className="font-black text-dark text-xl mb-6">👨‍👩‍👧 {t('membersTitle')} ({familyProfile.members.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    {familyProfile.members.map(m => (
                      <div key={m.id} className="bg-white rounded-2xl p-5 shadow-sm text-center border border-gray-100 transition-all hover:-translate-y-1 hover:shadow-md">
                        <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-4xl bg-gradient-to-br from-primary/15 to-secondary/15 border-2 border-white shadow overflow-hidden">
                          <span className="leading-none">{avatarOrFallback(m.avatar)}</span>
                        </div>
                        {editingMemberId === m.id ? (
                          <div className="flex gap-1 justify-center mb-2">
                            <input type="text" value={memberNameDraft} onChange={e => setMemberNameDraft(e.target.value)} className="w-full px-2 py-1 rounded-lg border border-gray-200 text-dark font-bold text-center" />
                            <button onClick={() => saveMemberName(m.id)} className="bg-success text-white font-bold px-3 py-1 rounded-lg">✓</button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <p className="font-bold text-dark text-sm">{m.name}</p>
                            <button onClick={() => { setEditingMemberId(m.id); setMemberNameDraft(m.name) }} className="text-xs text-gray-400 hover:text-primary" aria-label={t('editName')}>✏️</button>
                          </div>
                        )}
                        <span className="inline-block px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold mt-2">{m.role}</span>
                        <p className="text-sm text-gray-500 mt-2">{m.activities} actividades</p>
                        <button onClick={() => registerMemberActivity(m.id)} className="mt-3 w-full bg-gradient-to-r from-success to-success/80 text-white font-bold py-2 px-4 rounded-xl text-sm hover:shadow-md transition-all">
                          {t('registerActivity')}
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white rounded-2xl p-5 border-2 border-dashed border-gray-300">
                    <h4 className="font-bold text-dark mb-4">{t('addMember')}</h4>
                    <input type="text" value={newMemberName} onChange={e => setNewMemberName(e.target.value)} placeholder={t('memberNamePh')} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-dark focus:outline-none focus:ring-2 focus:ring-primary font-medium mb-3" />
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <p className="text-sm font-medium text-dark mb-2">{t('memberRole')}</p>
                        <select value={newMemberRole} onChange={e => { const role = e.target.value as FamilyRole; setNewMemberRole(role); setNewMemberAvatar(roleAvatar[role]) }} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-dark font-medium">
                          {familyRoles.map(r => <option key={r} value={r}>{roleAvatar[r]} {r}</option>)}
                        </select>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-dark mb-2">{t('memberAvatar')}</p>
                        <div className="flex gap-2 flex-wrap">
                          {memberAvatars.map(a => (
                            <button key={a} onClick={() => setNewMemberAvatar(a)} className={`relative w-11 h-11 rounded-full text-2xl flex items-center justify-center transition-all hover:scale-110 ${newMemberAvatar === a ? 'bg-primary/15 ring-2 ring-primary scale-105' : 'bg-gray-100 hover:bg-gray-200'}`}>
                              <span className="leading-none">{a}</span>
                              {newMemberAvatar === a && <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-success text-white text-[9px] flex items-center justify-center font-bold">✓</span>}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button onClick={addFamilyMember} disabled={newMemberName.trim() === ''} className={`font-bold py-3 px-6 rounded-xl w-full ${newMemberName.trim() === '' ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'btn-glow bg-primary text-white'}`}>
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
    <div className="pc-mode">
      {renderScreen()}
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