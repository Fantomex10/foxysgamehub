import { createPhotonClient } from './photonClient.js';
import { createRealtimePhotonClient } from './photon/realtimeAdapter.js';
import { photonAdapterKey } from '../lib/config.js';
import { createRegistry } from '../lib/registry.js';

const makeLocalClient = (engine, options) => createPhotonClient(engine, options);

const photonAdapterRegistry = createRegistry({
  name: 'photon adapter',
  getKey: (_value, options = {}) => options.key,
});

const adapterOptions = {};

const registerBuiltInAdapter = (key, adapter, options) => {
  photonAdapterRegistry.register(adapter, { ...options, key });
};

registerBuiltInAdapter('local', {
  createClient: (engine, options) => {
    const client = makeLocalClient(engine, options);
    client.__adapter = 'local';
    return client;
  },
}, { default: true });

registerBuiltInAdapter('mock', {
  createClient: (engine, options) => {
    const client = makeLocalClient(engine, options);
    client.__adapter = 'mock';
    return client;
  },
});

registerBuiltInAdapter('realtime', {
  createClient: (engine, options) => {
    const client = createRealtimePhotonClient(engine, options);
    client.__adapter = 'realtime';
    return client;
  },
});

const hasRealtimeTransport = (options) => Boolean(options && typeof options.transportFactory === 'function');

export const configurePhotonAdapter = (key, options) => {
  if (!photonAdapterRegistry.has(key)) {
    return;
  }
  adapterOptions[key] = options;
};

export const isPhotonAdapterConfigured = (key) => {
  if (!photonAdapterRegistry.has(key)) {
    return false;
  }
  if (key === 'realtime') {
    return hasRealtimeTransport(adapterOptions.realtime);
  }
  return true;
};

const resolveDefaultAdapterKey = () => {
  const configured = photonAdapterKey()?.toLowerCase();
  if (configured && photonAdapterRegistry.has(configured)) {
    return configured;
  }
  return photonAdapterRegistry.getDefaultKey();
};

let activeAdapterKey = resolveDefaultAdapterKey();
let requestedAdapterKey = activeAdapterKey;

const annotateClient = (client, requestedKey, effectiveKey = requestedKey) => {
  if (!client || typeof client !== 'object') {
    return client;
  }
  client.__requestedAdapter = requestedKey;
  client.__effectiveAdapter = effectiveKey;
  if (client.__adapter === undefined || client.__adapter === requestedKey) {
    client.__adapter = effectiveKey;
  }
  return client;
};

const getAdapterByKey = (key) => {
  if (key && photonAdapterRegistry.has(key)) {
    return photonAdapterRegistry.get(key);
  }
  const fallbackId = photonAdapterRegistry.getDefaultKey();
  if (!fallbackId) {
    throw new Error('No photon adapters registered.');
  }
  activeAdapterKey = fallbackId;
  return photonAdapterRegistry.get(fallbackId);
};

export const setPhotonAdapter = (key) => {
  if (!photonAdapterRegistry.has(key)) {
    throw new Error(`Unknown photon adapter: ${key}`);
  }
  requestedAdapterKey = key;
  if (key === 'realtime' && !isPhotonAdapterConfigured('realtime')) {
    console.warn('[Photon] Realtime adapter is not configured; continuing with local adapter.');
    activeAdapterKey = 'local';
    return;
  }
  activeAdapterKey = key;
};

export const getPhotonAdapterKey = () => activeAdapterKey;
export const getRequestedPhotonAdapterKey = () => requestedAdapterKey;

export const registerPhotonAdapter = (key, adapter, options) => {
  if (!key || typeof key !== 'string') {
    throw new Error('registerPhotonAdapter: key must be a string');
  }
  return photonAdapterRegistry.register(adapter, { ...options, key });
};

export const unregisterPhotonAdapter = (key) => photonAdapterRegistry.unregister(key);

const getActiveAdapter = () => getAdapterByKey(activeAdapterKey);

export const photonService = {
  createClient: (engine, options) => {
    const requestedKey = requestedAdapterKey;
    const currentEffectiveKey = activeAdapterKey;
    if (requestedKey === 'realtime') {
      const mergedOptions = options ?? adapterOptions.realtime;
      if (!hasRealtimeTransport(mergedOptions)) {
        console.warn('[Photon] Realtime adapter missing transportFactory; using local adapter until configured.');
        const fallbackKey = 'local';
        const localAdapter = getAdapterByKey(fallbackKey);
        const fallback = localAdapter.createClient(engine, options ?? adapterOptions[fallbackKey]);
        return annotateClient(fallback, requestedKey, fallbackKey);
      }
      const realtimeAdapter = photonAdapterRegistry.get('realtime');
      const client = realtimeAdapter.createClient(engine, mergedOptions);
      return annotateClient(client, requestedKey, requestedKey);
    }
    const adapter = getActiveAdapter();
    const client = adapter.createClient(engine, options ?? adapterOptions[currentEffectiveKey]);
    return annotateClient(client, requestedKey, currentEffectiveKey);
  },
};

export const listPhotonAdapters = () => photonAdapterRegistry.keys().filter((key) => isPhotonAdapterConfigured(key));
