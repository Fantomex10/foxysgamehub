import {
  dealHands,
  findTwoOfClubsOwner,
  pushHistory,
  validateReadyToStart,
  findPlayer,
} from '../utils.js';

export const handleStartGame = (state) => {
  const startingFromFinished = state.phase === 'finished';
  const startingFromLobby = state.phase === 'roomLobby';
  if (!startingFromFinished && !startingFromLobby) {
    return state;
  }

  if (startingFromLobby && !validateReadyToStart(state)) {
    return {
      ...state,
      banner: 'Need four ready players to begin Hearts.',
    };
  }

  if (startingFromFinished && state.gameOver) {
    return {
      ...state,
      banner: 'Match complete. Return to the lobby to start a new game.',
    };
  }

  const players = startingFromLobby
    ? state.players.map((player) => ({ ...player, isReady: false, status: 'notReady' }))
    : state.players;

  const hands = dealHands(players);
  const starter = findTwoOfClubsOwner(hands) ?? players[0]?.id;
  const trickCaptures = players.reduce((acc, player) => ({ ...acc, [player.id]: [] }), {});
  const roundScores = players.reduce((acc, player) => ({ ...acc, [player.id]: 0 }), {});

  const starterName = findPlayer(players, starter)?.name ?? 'Player';

  return {
    ...state,
    phase: 'playing',
    players,
    hands,
    currentTurn: starter,
    history: pushHistory([], `${starterName} leads the first trick.`),
    banner: `${starterName} to lead.`,
    trick: [],
    leadSuit: null,
    heartsBroken: false,
    trickCaptures,
    trickCount: 0,
    roundNumber: state.roundNumber + 1,
    roundScores,
    gameOver: false,
  };
};
