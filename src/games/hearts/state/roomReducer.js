import { actionHandlers } from './actions/index.js';
import { createInitialState as createInitialStateBase } from './initialState.js';
import { createReducer } from '../../shared/reducerFactory.js';

export const createInitialState = createInitialStateBase;

export const roomReducer = createReducer(actionHandlers);
