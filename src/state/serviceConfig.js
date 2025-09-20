import { photonAdapterKey, sessionAdapterKey } from '../lib/config.js';

const STORAGE_KEY = 'fgb.service-config';

const readStorage = () => {
  if (typeof window === 'undefined' || !window?.localStorage) {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('[ServiceConfig] Failed to read storage', error);
    return null;
  }
};

const writeStorage = (value) => {
  if (typeof window === 'undefined' || !window?.localStorage) {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch (error) {
    console.warn('[ServiceConfig] Failed to persist storage', error);
  }
};

const baseDefaults = () => ({
  sessionAdapter: (sessionAdapterKey() ?? 'firebase').toLowerCase(),
  photonAdapter: (photonAdapterKey() ?? 'local').toLowerCase(),
});

const normalise = (config = {}) => {
  const defaults = baseDefaults();
  const source = (config && typeof config === 'object') ? config : {};
  return {
    sessionAdapter: typeof source.sessionAdapter === 'string'
      ? source.sessionAdapter.toLowerCase()
      : defaults.sessionAdapter,
    photonAdapter: typeof source.photonAdapter === 'string'
      ? source.photonAdapter.toLowerCase()
      : defaults.photonAdapter,
  };
};

export const loadServiceConfig = () => {
  const stored = readStorage();
  return normalise(stored);
};

export const persistServiceConfig = (config) => {
  const normalised = normalise(config);
  writeStorage(normalised);
  return normalised;
};

export const defaultServiceConfig = () => normalise();
