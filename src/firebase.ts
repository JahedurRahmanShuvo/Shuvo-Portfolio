import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);

// Test connection strictly from server to verify online status
export async function testConnection() {
  try {
    // Attempting a server-only read to force online check
    await getDocFromServer(doc(db, '_connection_test_', 'ping'));
    console.log("Firestore connection verified (Online)");
  } catch (error: any) {
    if (error.message?.includes('the client is offline')) {
      console.error("Firestore Error: The client is offline. Please check your internet connection and Firebase configuration.");
    } else {
      console.warn("Firestore connection check produced an expected error (collection may not exist yet, which is fine):", error.message);
    }
  }
}

// Initial connection test
testConnection();

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
let analytics;
// Analytics might fail in some environments (like SSR or certain browsers), so we guard it
try {
  analytics = getAnalytics(app);
} catch (e) {
  console.warn('Firebase Analytics failed to initialize:', e);
}
export { analytics };

export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    console.error('Firebase Login Error:', error.code, error.message);
    if (error.code === 'auth/configuration-not-found') {
      alert('Error: Google Sign-In is not enabled in your Firebase Console. Please enable it in Authentication > Sign-in method.');
    } else if (error.code === 'auth/unauthorized-domain') {
      alert('Error: This domain is not authorized in Firebase. Please add the current URL to "Authorized domains" in your Firebase Console (Authentication > Settings).');
    }
    throw error;
  }
};

export const logout = () => signOut(auth);
