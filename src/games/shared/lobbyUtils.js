export const STATUS_SEQUENCE = ['notReady', 'ready', 'needsTime'];

export const getNextStatus = (current) => {
  const index = STATUS_SEQUENCE.indexOf(current);
  const safeIndex = index === -1 ? 0 : index;
  return STATUS_SEQUENCE[(safeIndex + 1) % STATUS_SEQUENCE.length];
};

export const normaliseStatus = (player) => {
  if (player?.status && STATUS_SEQUENCE.includes(player.status)) {
    return player.status;
  }
  return player?.isReady ? 'ready' : 'notReady';
};

export const prepareSeatedPlayer = (player) => ({
  ...player,
  isSpectator: false,
  isReady: false,
  status: 'notReady',
});

export const prepareSpectator = (player) => ({
  ...player,
  isSpectator: true,
  isReady: false,
  status: 'notReady',
});

export const makeId = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
export const makeRoomCode = () => Math.random().toString(36).slice(2, 6).toUpperCase();

export const findPlayer = (players, playerId) => players.find((player) => player.id === playerId);

export const createHistoryPusher = (limit) => (history, message) => {
  const log = Array.isArray(history) ? history : [];
  return [message, ...log].slice(0, limit);
};
