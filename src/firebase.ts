import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: "AIzaSyDqZVLTv-kdJpeHNZ-CJdLpaUtuUgcmyyA",
  authDomain: "shuvoportfolio-b9502.firebaseapp.com",
  projectId: "shuvoportfolio-b9502",
  storageBucket: "shuvoportfolio-b9502.firebasestorage.app",
  messagingSenderId: "912080804415",
  appId: "1:912080804415:web:e64d2fc5d2e7a587b6b68a",
  measurementId: "G-3ZQD3FFPZN"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // Initialized but not used for Firestore features per request

export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);
