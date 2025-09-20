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
import { firebaseConfig } from '../lib/config.js';

const resolveFirebaseConfig = () => {
  if (typeof window !== 'undefined' && window.__FIREBASE_CONFIG__) {
    return window.__FIREBASE_CONFIG__;
  }

  return firebaseConfig();
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
