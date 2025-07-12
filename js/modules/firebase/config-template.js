// Firebase Configuration Template

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
  apiKey: 'SUA_API_KEY_AQUI',
  authDomain: 'seu-projeto.firebaseapp.com',
  projectId: 'seu-projeto-id',
  storageBucket: 'seu-projeto.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef123456',
  measurementId: 'G-XXXXXXXXXX'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const analytics = getAnalytics(app)
const googleProvider = new GoogleAuthProvider()

// Export Firebase services
export { auth, db, googleProvider, analytics }
