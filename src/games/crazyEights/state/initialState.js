import { createBaseState } from './utils.js';
import { createInitialStateFactory } from '../../shared/reducerFactory.js';

export const createInitialState = createInitialStateFactory(createBaseState);
