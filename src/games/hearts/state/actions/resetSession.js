import { createInitialState } from '../initialState.js';

export const handleResetSession = (state) => ({
  ...createInitialState({ userId: state.userId, userName: state.userName }),
  players: [],
  spectators: [],
});
