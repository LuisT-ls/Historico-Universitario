// Firebase configuration
export const firebaseConfig = {
  apiKey: 'AIzaSyCP_TfNncuAqCxUTs0FvLJ0XnfXY9lorTU',
  authDomain: 'historico-universitario-abc12.firebaseapp.com',
  projectId: 'historico-universitario-abc12',
  storageBucket: 'historico-universitario-abc12.firebasestorage.app',
  messagingSenderId: '333663970992',
  appId: '1:333663970992:web:4532164b749f1e38883d75',
  measurementId: 'G-ZBMBGR6J39'
}

// Initialize Firebase
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics } from 'firebase/analytics'

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const analytics = getAnalytics(app)

export { app, auth, db, analytics }
