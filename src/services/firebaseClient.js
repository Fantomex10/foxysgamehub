import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

const resolveFirebaseConfig = () => {
  if (typeof window !== 'undefined' && window.__FIREBASE_CONFIG__) {
    return window.__FIREBASE_CONFIG__;
  }

  const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};

  const config = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    appId: env.VITE_FIREBASE_APP_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
  };

  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missing = requiredKeys.filter((key) => !config[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing Firebase config values: ${missing.join(', ')}. Provide VITE_FIREBASE_* env vars or window.__FIREBASE_CONFIG__.`,
    );
  }

  return config;
};

export const initFirebaseApp = () => {
  if (!getApps().length) {
    initializeApp(resolveFirebaseConfig());
  }
  return getApp();
};

export const ensureUserSession = async () => {
  const app = initFirebaseApp();
  const auth = getAuth(app);
  if (auth.currentUser) {
    return auth.currentUser;
  }

  const credential = await signInAnonymously(auth);
  return credential.user;
};

export const fetchPlayerProfile = async (uid) => {
  const app = initFirebaseApp();
  const firestore = getFirestore(app);
  const profileRef = doc(firestore, 'players', uid);
  const snapshot = await getDoc(profileRef);
  if (!snapshot.exists()) {
    return null;
  }
  return snapshot.data();
};

export const upsertPlayerProfile = async (uid, profile) => {
  const app = initFirebaseApp();
  const firestore = getFirestore(app);
  const profileRef = doc(firestore, 'players', uid);
  await setDoc(
    profileRef,
    {
      ...profile,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
};

export const recordMatchResult = async (uid, match) => {
  const app = initFirebaseApp();
  const firestore = getFirestore(app);
  const matchRef = doc(
    firestore,
    'players',
    uid,
    'matches',
    match.id,
  );
  await setDoc(
    matchRef,
    {
      ...match,
      recordedAt: serverTimestamp(),
    },
    { merge: true },
  );
};
