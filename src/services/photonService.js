import { createPhotonClient } from './photonClient.js';
import { photonAdapterKey } from '../lib/config.js';

const makeClient = (engine) => createPhotonClient(engine);

const adapters = {
  local: {
    createClient: (engine) => {
      const client = makeClient(engine);
      client.__adapter = 'local';
      return client;
    },
  },
  mock: {
    createClient: (engine) => {
      const client = makeClient(engine);
      client.__adapter = 'mock';
      return client;
    },
  },
};

const resolveDefaultAdapterKey = () => {
  const configured = photonAdapterKey()?.toLowerCase();
  return configured && configured in adapters ? configured : 'local';
};

let activeAdapterKey = resolveDefaultAdapterKey();

export const setPhotonAdapter = (key) => {
  if (adapters[key]) {
    activeAdapterKey = key;
  }
};

export const getPhotonAdapterKey = () => activeAdapterKey;

const getActiveAdapter = () => adapters[activeAdapterKey] ?? adapters.local;

export const photonService = {
  createClient: (...args) => getActiveAdapter().createClient(...args),
};

export const listPhotonAdapters = () => Object.keys(adapters);
