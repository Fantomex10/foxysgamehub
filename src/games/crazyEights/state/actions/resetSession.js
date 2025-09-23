import { createInitialState } from '../initialState.js';

export const handleResetSession = (state) => {
  const next = createInitialState({ userId: state.userId, userName: state.userName });
  return {
    ...next,
    players: [],
    spectators: [],
  };
};
