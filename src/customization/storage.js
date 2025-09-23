const CUSTOMIZATION_STORAGE_KEY = 'fgb.customization';

const isStorageAvailable = () => typeof window !== 'undefined' && Boolean(window.localStorage);

const normaliseStoredPayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return { state: payload ?? null, updatedAt: null, unlocks: [] };
  }
  if ('state' in payload || 'updatedAt' in payload || 'unlocks' in payload) {
    const unlocks = Array.isArray(payload.unlocks)
      ? payload.unlocks.filter((id) => typeof id === 'string' && id.length > 0)
      : [];
    return {
      state: payload.state ?? null,
      updatedAt: typeof payload.updatedAt === 'number' ? payload.updatedAt : null,
      unlocks,
    };
  }
  return { state: payload, updatedAt: null, unlocks: [] };
};

export const readStoredCustomization = () => {
  if (!isStorageAvailable()) {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(CUSTOMIZATION_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    const { state, updatedAt, unlocks } = normaliseStoredPayload(parsed);
    if (!state) {
      return null;
    }
    return { state, updatedAt, unlocks };
  } catch (error) {
    console.warn('[Customization] Failed to read stored state', error);
    return null;
  }
};

export const writeStoredCustomization = (state, updatedAt, unlocks = []) => {
  if (!isStorageAvailable()) {
    return;
  }
  try {
    const payload = {
      state,
      updatedAt: typeof updatedAt === 'number' ? updatedAt : null,
      unlocks: Array.isArray(unlocks)
        ? unlocks.filter((id) => typeof id === 'string' && id.length > 0)
        : [],
    };
    window.localStorage.setItem(CUSTOMIZATION_STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('[Customization] Failed to persist state', error);
  }
};

export const __internal = {
  CUSTOMIZATION_STORAGE_KEY,
  isStorageAvailable,
  normaliseStoredPayload,
};
