import { deepClone } from '../utils/deepClone.js';

const freezeSnapshot = (value) => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) {
    return value;
  }
  Object.freeze(value);
  if (Array.isArray(value)) {
    value.forEach(freezeSnapshot);
  } else {
    for (const key of Object.keys(value)) {
      freezeSnapshot(value[key]);
    }
  }
  return value;
};

const cloneState = (state) => deepClone(state);

const normalisePlayerStatus = (player) => ({
  ...player,
  isSpectator: false,
  status: ['notReady', 'ready', 'needsTime'].includes(player.status)
    ? player.status
    : (player.isReady ? 'ready' : 'notReady'),
});

const normaliseSpectator = (player) => ({
  ...player,
  isSpectator: true,
  isReady: false,
  status: 'notReady',
});

export {
  cloneState,
  freezeSnapshot,
  normalisePlayerStatus,
  normaliseSpectator,
};
