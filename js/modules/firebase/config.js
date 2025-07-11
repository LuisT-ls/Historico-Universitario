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
  apiKey: process.env.FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'YOUR_AUTH_DOMAIN',
  projectId: process.env.FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'YOUR_STORAGE_BUCKET',
  messagingSenderId:
    process.env.FIREBASE_MESSAGING_SENDER_ID || 'YOUR_MESSAGING_SENDER_ID',
  appId: process.env.FIREBASE_APP_ID || 'YOUR_APP_ID',
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || 'YOUR_MEASUREMENT_ID'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const analytics = getAnalytics(app)
const googleProvider = new GoogleAuthProvider()

// Export Firebase services
export { auth, db, googleProvider, analytics }
