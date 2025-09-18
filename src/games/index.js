import { crazyEightsEngine } from './crazyEights/index.js';
import { heartsEngine } from './hearts/index.js';

const registry = new Map([[crazyEightsEngine.id, crazyEightsEngine], [heartsEngine.id, heartsEngine]]);

export const listGameEngines = () => Array.from(registry.values());

export const getGameEngineById = (id) => registry.get(id) ?? null;

export const getDefaultGameEngine = () => crazyEightsEngine;
