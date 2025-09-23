import {
  ensureUserSession,
  fetchPlayerProfile,
  fetchCustomizationConfig,
  upsertPlayerProfile,
  upsertCustomizationConfig,
} from './firebaseClient.js';
import { sessionAdapterKey } from '../lib/config.js';
import { createRegistry } from '../lib/registry.js';

const createMockStore = () => ({
  sessions: new Map(),
  profiles: new Map(),
  customizations: new Map(),
});

const mockStore = createMockStore();

const delay = (value) => Promise.resolve(value);

const sessionAdapterRegistry = createRegistry({
  name: 'session adapter',
  getKey: (_value, options = {}) => options.key,
});

const registerBuiltInAdapter = (key, adapter, options) => {
  sessionAdapterRegistry.register(adapter, { ...options, key });
};

registerBuiltInAdapter('firebase', {
  ensureUserSession,
  fetchPlayerProfile,
  fetchCustomizationConfig,
  upsertPlayerProfile,
  upsertCustomizationConfig,
}, { default: true });

registerBuiltInAdapter('mock', {
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
  fetchCustomizationConfig: async (uid) => {
    if (!uid) return delay(null);
    const customization = mockStore.customizations.get(uid) ?? null;
    return delay(customization ? { ...customization } : null);
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
  upsertCustomizationConfig: async (uid, config = {}) => {
    if (!uid) return delay(null);
    const existing = mockStore.customizations.get(uid) ?? {};
    const next = {
      ...existing,
      ...config,
      updatedAt: new Date().toISOString(),
    };
    mockStore.customizations.set(uid, next);
    return delay({ ...next });
  },
});

const resolveDefaultAdapterKey = () => {
  const configured = sessionAdapterKey()?.toLowerCase();
  if (configured && sessionAdapterRegistry.has(configured)) {
    return configured;
  }
  return sessionAdapterRegistry.getDefaultKey();
};

let activeAdapterKey = resolveDefaultAdapterKey();

const getActiveAdapter = () => {
  if (activeAdapterKey && sessionAdapterRegistry.has(activeAdapterKey)) {
    return sessionAdapterRegistry.get(activeAdapterKey);
  }
  const fallbackId = sessionAdapterRegistry.getDefaultKey();
  if (!fallbackId) {
    throw new Error('No session adapters registered.');
  }
  activeAdapterKey = fallbackId;
  return sessionAdapterRegistry.get(fallbackId);
};

export const setSessionAdapter = (key) => {
  if (!sessionAdapterRegistry.has(key)) {
    throw new Error(`Unknown session adapter: ${key}`);
  }
  activeAdapterKey = key;
};

export const getSessionAdapterKey = () => activeAdapterKey;

export const registerSessionAdapter = (key, adapter, options) => {
  if (!key || typeof key !== 'string') {
    throw new Error('registerSessionAdapter: key must be a string');
  }
  return sessionAdapterRegistry.register(adapter, { ...options, key });
};

export const unregisterSessionAdapter = (key) => sessionAdapterRegistry.unregister(key);

export const listSessionAdapters = () => sessionAdapterRegistry.keys();

export const sessionService = {
  ensureUserSession: (...args) => getActiveAdapter().ensureUserSession(...args),
  fetchPlayerProfile: (...args) => getActiveAdapter().fetchPlayerProfile(...args),
  fetchCustomizationConfig: (...args) => getActiveAdapter().fetchCustomizationConfig(...args),
  upsertPlayerProfile: (...args) => getActiveAdapter().upsertPlayerProfile(...args),
  upsertCustomizationConfig: (...args) => getActiveAdapter().upsertCustomizationConfig(...args),
};
