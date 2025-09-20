const readEnv = () => (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {});

const ensureString = (value) => (typeof value === 'string' && value.length > 0 ? value : undefined);

export const getEnv = (key, fallback) => {
  const env = readEnv();
  const value = ensureString(env[key]);
  return value ?? fallback;
};

export const firebaseConfig = () => {
  const env = readEnv();
  const config = {
    apiKey: ensureString(env.VITE_FIREBASE_API_KEY),
    authDomain: ensureString(env.VITE_FIREBASE_AUTH_DOMAIN),
    projectId: ensureString(env.VITE_FIREBASE_PROJECT_ID),
    appId: ensureString(env.VITE_FIREBASE_APP_ID),
    storageBucket: ensureString(env.VITE_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: ensureString(env.VITE_FIREBASE_MESSAGING_SENDER_ID),
    measurementId: ensureString(env.VITE_FIREBASE_MEASUREMENT_ID),
  };
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missing = requiredKeys.filter((key) => !config[key]);
  if (missing.length > 0) {
    const joined = missing.join(', ');
    throw new Error(`Missing Firebase config values: ${joined}. Provide VITE_FIREBASE_* env vars or window.__FIREBASE_CONFIG__.`);
  }
  return config;
};

export const sessionAdapterKey = () => getEnv('VITE_SESSION_ADAPTER', 'firebase');

export const photonAdapterKey = () => getEnv('VITE_PHOTON_ADAPTER', 'local');

export const appConfig = Object.freeze({
  sessionAdapter: sessionAdapterKey(),
  photonAdapter: photonAdapterKey(),
});
