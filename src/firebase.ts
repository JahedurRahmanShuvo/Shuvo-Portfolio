import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Analytics initialization
let analytics;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (e) {
    console.warn('Firebase Analytics failed to initialize:', e);
  }
}
export { analytics };

export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (error: any) {
    console.error('Firebase Login Error:', error.code, error.message);
    
    if (error.code === 'auth/configuration-not-found') {
      alert('Firebase Error: Google Sign-In is not enabled. Go to Firebase Console > Authentication > Sign-in method and enable Google.');
    } else if (error.code === 'auth/unauthorized-domain') {
      const currentDomain = window.location.hostname;
      alert(`Domain Error: "${currentDomain}" is not authorized in Firebase.\n\nTo fix:\n1. Open Firebase Console\n2. Go to Authentication > Settings > Authorized domains\n3. Add "${currentDomain}" to the list.`);
    } else if (error.code === 'auth/popup-blocked') {
      alert('Login Error: Popup was blocked by your browser. Please allow popups for this site or try again.');
    } else {
      alert(`Login Error (${error.code}): ${error.message}`);
    }
    throw error;
  }
};

export const logout = () => signOut(auth);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
