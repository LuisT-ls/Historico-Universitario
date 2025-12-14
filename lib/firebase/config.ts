import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'
import { getAnalytics, type Analytics } from 'firebase/analytics'
import { GoogleAuthProvider } from 'firebase/auth'

let app: FirebaseApp | undefined
let auth: Auth | undefined
let db: Firestore | undefined
let storage: FirebaseStorage | undefined
let analytics: Analytics | undefined
let googleProvider: GoogleAuthProvider | undefined

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCP_TfNncuAqCxUTs0FvLJ0XnfXY9lorTU',
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    'historico-universitario-abc12.firebaseapp.com',
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'historico-universitario-abc12',
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    'historico-universitario-abc12.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '333663970992',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:333663970992:web:4532164b749f1e38883d75',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-ZBMBGR6J39',
}

if (typeof window !== 'undefined') {
  // Client-side initialization
  if (!getApps().length) {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
    storage = getStorage(app)
    googleProvider = new GoogleAuthProvider()

    if (typeof window !== 'undefined') {
      analytics = getAnalytics(app)
    }
  } else {
    app = getApps()[0]
    auth = getAuth(app)
    db = getFirestore(app)
    storage = getStorage(app)
    googleProvider = new GoogleAuthProvider()
  }
}

export { app, auth, db, storage, analytics, googleProvider }

