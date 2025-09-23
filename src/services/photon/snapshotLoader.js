import {
  cloneState,
  normalisePlayerStatus,
  normaliseSpectator,
} from './stateUtils.js';

const dedupeById = (records = []) => records.filter((record, index, array) => (
  array.findIndex((candidate) => candidate?.id === record?.id) === index
));

const ensurePlayers = (players = []) => dedupeById(players.map((player) => normalisePlayerStatus({ ...player })));

const ensureSpectators = (spectators = []) => dedupeById(spectators.map((spectator) => normaliseSpectator({ ...spectator })));

const resolveUserIdentity = ({ snapshot, currentState, currentUser }) => {
  const fallbackId = currentUser?.userId ?? currentState?.userId ?? snapshot.userId;
  const fallbackName = currentUser?.userName ?? currentState?.userName ?? snapshot.userName ?? 'Player';
  return {
    userId: fallbackId,
    userName: fallbackName,
  };
};

const addOrUpdateUserRecord = (snapshot, userId, userName) => {
  const seatLimit = snapshot.roomSettings?.maxPlayers ?? Infinity;

  const playerIndex = snapshot.players.findIndex((player) => player.id === userId);
  const spectatorIndex = snapshot.spectators.findIndex((spectator) => spectator.id === userId);

  if (playerIndex === -1 && spectatorIndex === -1) {
    if (snapshot.players.length >= seatLimit) {
      snapshot.spectators.push(normaliseSpectator({ id: userId, name: userName, isBot: false, isHost: false }));
    } else {
      snapshot.players.push(normalisePlayerStatus({
        id: userId,
        name: userName,
        isBot: false,
        isHost: false,
        isReady: false,
      }));
    }
    return;
  }

  if (playerIndex >= 0) {
    snapshot.players[playerIndex] = normalisePlayerStatus({
      ...snapshot.players[playerIndex],
      name: userName,
      isBot: false,
    });
    return;
  }

  if (spectatorIndex >= 0) {
    snapshot.spectators[spectatorIndex] = normaliseSpectator({
      ...snapshot.spectators[spectatorIndex],
      name: userName,
      isBot: false,
      isHost: false,
    });
  }
};

const elevateHostRecord = (snapshot) => {
  if (!snapshot.hostId) {
    return;
  }

  const seatLimit = snapshot.roomSettings?.maxPlayers ?? Infinity;
  const hostInPlayers = snapshot.players.some((player) => player.id === snapshot.hostId);

  if (hostInPlayers) {
    return;
  }

  const hostSpectatorIndex = snapshot.spectators.findIndex((spectator) => spectator.id === snapshot.hostId);
  if (hostSpectatorIndex === -1) {
    return;
  }

  const [hostRecord] = snapshot.spectators.splice(hostSpectatorIndex, 1);
  if (snapshot.players.length >= seatLimit) {
    snapshot.spectators.push(normaliseSpectator(hostRecord));
  } else {
    snapshot.players.unshift(normalisePlayerStatus(hostRecord));
  }
};

const ensurePhase = (phase) => (
  phase === 'playing' || phase === 'finished' ? phase : 'roomLobby'
);

const hydrateRoomSnapshot = (roomState, { currentState = {}, currentUser = {} } = {}) => {
  const snapshot = cloneState(roomState);
  snapshot.players = ensurePlayers(snapshot.players);
  snapshot.spectators = ensureSpectators(snapshot.spectators);

  const { userId, userName } = resolveUserIdentity({ snapshot, currentState, currentUser });
  snapshot.userId = userId;
  snapshot.userName = userName;

  addOrUpdateUserRecord(snapshot, userId, userName);
  elevateHostRecord(snapshot);

  snapshot.phase = ensurePhase(snapshot.phase);
  return snapshot;
};

export {
  hydrateRoomSnapshot,
};
