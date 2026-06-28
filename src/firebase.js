import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCnYXpvqLyGJKHALxHCzKkL5BJPPrubgB8",
  authDomain: "bolao-copa-2026-62061.firebaseapp.com",
  projectId: "bolao-copa-2026-62061",
  storageBucket: "bolao-copa-2026-62061.firebasestorage.app",
  messagingSenderId: "1005682229645",
  appId: "1:1005682229645:web:31fdb8c5e94826dd497dc4"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
