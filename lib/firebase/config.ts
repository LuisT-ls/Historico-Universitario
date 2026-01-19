import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { GoogleAuthProvider } from 'firebase/auth'
import type { Analytics } from 'firebase/analytics'
import type { FirebaseStorage } from 'firebase/storage'
import { logger } from '@/lib/logger'

let app: FirebaseApp | undefined
let auth: Auth | undefined
let db: Firestore | undefined
let storage: FirebaseStorage | undefined
let analytics: Analytics | undefined
let googleProvider: GoogleAuthProvider | undefined

/**
 * Valida e retorna as variáveis de ambiente necessárias do Firebase
 * @throws Error se alguma variável obrigatória estiver faltando
 */
function getFirebaseConfig() {
  const requiredEnvVars = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  }

  // Validar se todas as variáveis estão presentes
  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missingVars.length > 0) {
    const errorMsg = `❌ Variáveis de ambiente do Firebase faltando: ${missingVars.join(', ')}\n` +
      `Por favor, configure o arquivo .env.local com as credenciais do Firebase.\n` +
      `Consulte .env.example para um template.`

    throw new Error(errorMsg)
  }

  return {
    apiKey: requiredEnvVars.apiKey!,
    authDomain: requiredEnvVars.authDomain!,
    projectId: requiredEnvVars.projectId!,
    storageBucket: requiredEnvVars.storageBucket!,
    messagingSenderId: requiredEnvVars.messagingSenderId!,
    appId: requiredEnvVars.appId!,
    measurementId: requiredEnvVars.measurementId!,
  }
}

const firebaseConfig = getFirebaseConfig()

// Função lazy para carregar Storage apenas quando necessário
async function getStorageLazy() {
  if (storage) return storage
  if (!app) return undefined

  const { getStorage } = await import('firebase/storage')
  storage = getStorage(app)
  return storage
}

if (typeof window !== 'undefined') {
  // Client-side initialization
  if (!getApps().length) {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
    googleProvider = new GoogleAuthProvider()

    // Delay analytics para não impactar o LCP/Performance inicial no mobile
    const initAnalytics = () => {
      import('firebase/analytics').then(({ getAnalytics }) => {
        analytics = getAnalytics(app!)
      }).catch(err => logger.warn('Analytics failed:', { error: err }))
    }

    // Só inicializa quando o navegador estiver realmente ocioso
    const hasIdleCallback = 'requestIdleCallback' in window
    if (hasIdleCallback) {
      window.requestIdleCallback(() => setTimeout(initAnalytics, 3000), { timeout: 10000 })
    } else {
      // Fallback para navegadores sem suporte
      if (document.readyState === 'complete') {
        setTimeout(initAnalytics, 5000)
      } else {
        const win = window as Window & typeof globalThis
        win.addEventListener('load', () => setTimeout(initAnalytics, 5000))
      }
    }
  } else {
    app = getApps()[0]
    auth = getAuth(app)
    db = getFirestore(app)
    googleProvider = new GoogleAuthProvider()
  }
}

export { app, auth, db, storage, analytics, googleProvider, getStorageLazy }

