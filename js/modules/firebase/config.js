// Firebase Configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js'
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js'
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js'
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-analytics.js'

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCP_TfNncuAqCxUTs0FvLJ0XnfXY9lorTU',
  authDomain: 'historico-universitario-abc12.firebaseapp.com',
  projectId: 'historico-universitario-abc12',
  storageBucket: 'historico-universitario-abc12.firebasestorage.app',
  messagingSenderId: '333663970992',
  appId: '1:333663970992:web:4532164b749f1e38883d75',
  measurementId: 'G-ZBMBGR6J39'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const analytics = getAnalytics(app)
const googleProvider = new GoogleAuthProvider()

// Export Firebase services
export { auth, db, googleProvider, analytics }
