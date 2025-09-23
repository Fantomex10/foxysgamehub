import * as crazyEightsModule from './crazyEights/index.js';
import * as heartsModule from './hearts/index.js';

import { createRegistry } from '../lib/registry.js';

const engineRegistry = createRegistry({ name: 'game engine' });

export const registerGameEngine = (engine, options) => {
  if (!engine?.id) {
    throw new Error('registerGameEngine: engine must provide an id');
  }
  return engineRegistry.register(engine, options);
};

export const unregisterGameEngine = (id) => engineRegistry.unregister(id);

const isGameEngineDefinition = (candidate) => Boolean(
  candidate
  && typeof candidate === 'object'
  && typeof candidate.id === 'string'
  && typeof candidate.createInitialState === 'function'
  && typeof candidate.reducer === 'function',
);

const normaliseManifestEntry = (entry) => {
  if (!entry) {
    return null;
  }
  if (isGameEngineDefinition(entry)) {
    return { engine: entry, options: {} };
  }
  if (isGameEngineDefinition(entry.engine)) {
    const options = { ...(entry.options ?? {}) };
    if (entry.default === true && options.default === undefined) {
      options.default = true;
    }
    return { engine: entry.engine, options };
  }
  return null;
};

const registerDiscoveredEngines = (moduleExports) => {
  if (!moduleExports) {
    return;
  }

  const entries = [];

  if (Array.isArray(moduleExports.gameEngines)) {
    entries.push(...moduleExports.gameEngines);
  }

  if (moduleExports.gameEngine) {
    entries.push(moduleExports.gameEngine);
  }

  if (entries.length === 0) {
    Object.values(moduleExports).forEach((value) => {
      if (isGameEngineDefinition(value)) {
        entries.push(value);
      }
    });
  }

  entries
    .map(normaliseManifestEntry)
    .filter(Boolean)
    .forEach(({ engine, options }) => {
      if (!engineRegistry.has(engine.id)) {
        registerGameEngine(engine, options);
      }
    });
};

const discoveredModules = typeof import.meta.glob === 'function'
  ? import.meta.glob('./*/index.js', { eager: true })
  : {};

Object.entries(discoveredModules)
  .sort(([left], [right]) => left.localeCompare(right))
  .forEach(([, moduleExports]) => {
    registerDiscoveredEngines(moduleExports);
  });

[crazyEightsModule, heartsModule].forEach((moduleExports) => {
  registerDiscoveredEngines(moduleExports);
});

export const listGameEngines = () => engineRegistry.list();

export const getGameEngineById = (id) => engineRegistry.has(id)
  ? engineRegistry.get(id)
  : null;

export const getDefaultGameEngine = () => {
  const defaultId = engineRegistry.getDefaultKey();
  return defaultId ? engineRegistry.get(defaultId) : null;
};
