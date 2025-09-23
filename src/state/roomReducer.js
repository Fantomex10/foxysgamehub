import { getDefaultGameEngine, getGameEngineById } from '../games/index.js';

const resolveEngine = (engineOrId) => {
  if (!engineOrId) {
    const engine = getDefaultGameEngine();
    if (!engine) {
      throw new Error('No game engines registered.');
    }
    return engine;
  }

  if (typeof engineOrId === 'string') {
    const engine = getGameEngineById(engineOrId);
    if (!engine) {
      throw new Error(`Unknown game engine: ${engineOrId}`);
    }
    return engine;
  }

  if (engineOrId && typeof engineOrId === 'object' && typeof engineOrId.id === 'string') {
    return engineOrId;
  }

  throw new Error('Cannot resolve game engine from provided value.');
};

export const createInitialState = (options = {}, engineOrId) => {
  const { engine, engineId, ...rest } = options ?? {};
  const resolvedEngine = resolveEngine(engineOrId ?? engine ?? engineId);
  return resolvedEngine.createInitialState(rest);
};

export const getRoomReducer = (engineOrId) => resolveEngine(engineOrId).reducer;

export const createRoomBindings = (engineOrId) => {
  const engine = resolveEngine(engineOrId);
  const createState = (stateOptions = {}) => engine.createInitialState(stateOptions);
  const { reducer } = engine;

  return Object.freeze({
    engine,
    createInitialState: createState,
    reducer,
  });
};

const defaultBindings = createRoomBindings();

export const defaultRoomBindings = defaultBindings;
export const roomReducer = defaultBindings.reducer;
export const initialRoomState = defaultBindings.createInitialState();
