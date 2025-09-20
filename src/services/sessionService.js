import { ensureUserSession, fetchPlayerProfile, upsertPlayerProfile } from './firebaseClient.js';
import { sessionAdapterKey } from '../lib/config.js';

const createMockStore = () => ({
  sessions: new Map(),
  profiles: new Map(),
});

const mockStore = createMockStore();

const delay = (value) => Promise.resolve(value);

const adapters = {
  firebase: {
    ensureUserSession,
    fetchPlayerProfile,
    upsertPlayerProfile,
  },
  mock: {
    ensureUserSession: async (options = {}) => {
      const fallbackId = options?.fallbackUserId ?? `mock-${Math.random().toString(36).slice(2, 10)}`;
      const fallbackName = options?.fallbackDisplayName ?? 'Mock Player';
      if (!mockStore.sessions.has(fallbackId)) {
        mockStore.sessions.set(fallbackId, {
          uid: fallbackId,
          displayName: fallbackName,
          isAnonymous: true,
          isOffline: true,
        });
      }
      const record = mockStore.sessions.get(fallbackId);
      return delay({ ...record });
    },
    fetchPlayerProfile: async (uid) => {
      const profile = uid ? mockStore.profiles.get(uid) ?? null : null;
      return delay(profile ? { ...profile } : null);
    },
    upsertPlayerProfile: async (uid, profile = {}) => {
      if (!uid) return delay(null);
      const existing = mockStore.profiles.get(uid) ?? {};
      const next = {
        ...existing,
        ...profile,
        updatedAt: new Date().toISOString(),
      };
      mockStore.profiles.set(uid, next);
      return delay({ ...next });
    },
  },
};

const resolveDefaultAdapterKey = () => {
  const configured = sessionAdapterKey()?.toLowerCase();
  return configured && configured in adapters ? configured : 'firebase';
};

let activeAdapterKey = resolveDefaultAdapterKey();

export const setSessionAdapter = (key) => {
  if (adapters[key]) {
    activeAdapterKey = key;
  }
};

export const getSessionAdapterKey = () => activeAdapterKey;

const getActiveAdapter = () => adapters[activeAdapterKey] ?? adapters.firebase;

export const sessionService = {
  ensureUserSession: (...args) => getActiveAdapter().ensureUserSession(...args),
  fetchPlayerProfile: (...args) => getActiveAdapter().fetchPlayerProfile(...args),
  upsertPlayerProfile: (...args) => getActiveAdapter().upsertPlayerProfile(...args),
};

export const listSessionAdapters = () => Object.keys(adapters);
