import { describe, expect, it } from 'vitest';
import { createPhotonClient } from '../src/services/photonClient.js';
import { crazyEightsEngine } from '../src/games/crazyEights/index.js';

describe('App flow end-game handling', () => {
  it('returns finished games to a clean lobby state', () => {
    const client = createPhotonClient(crazyEightsEngine);
    const hostId = 'player-1';

    client.connect({
      userId: hostId,
      userName: 'Host',
      engineId: crazyEightsEngine.id,
    });

    const finishedSnapshot = {
      phase: 'finished',
      userId: hostId,
      userName: 'Host',
      roomId: 'ABCD',
      roomName: 'Integration Room',
      hostId,
      players: [
        {
          id: hostId,
          name: 'Host',
          isBot: false,
          isHost: true,
          isReady: true,
          status: 'ready',
          isSpectator: false,
        },
        {
          id: 'bot-1',
          name: 'Bot 1',
          isBot: true,
          isHost: false,
          isReady: true,
          status: 'ready',
          isSpectator: false,
        },
      ],
      spectators: [],
      roomSettings: {
        maxPlayers: 4,
        roomName: 'Integration Room',
      },
      hands: {
        [hostId]: [],
        'bot-1': [],
      },
      drawPile: [],
      discardPile: [{ suit: 'hearts', rank: 'A' }],
      currentTurn: null,
      activeSuit: 'hearts',
      history: ['Host played the final card.'],
      gameOver: {
        winnerId: hostId,
      },
    };

    client.loadRoom(finishedSnapshot, { userId: hostId, userName: 'Host' });

    let state = client.getState();
    expect(state.phase).toBe('finished');
    expect(state.gameOver?.winnerId).toBe(hostId);
    expect(state.roomName).toBe('Integration Room');

    client.returnToLobby();

    state = client.getState();
    expect(state.phase).toBe('roomLobby');
    expect(state.banner).toBe('Waiting for players to ready up...');
    expect(state.drawPile.length).toBe(0);
    expect(state.discardPile.length).toBe(0);
    expect(state.hands[hostId]).toBeUndefined();
    expect(state.players.every((player) => player.status === 'notReady')).toBe(true);
    expect(state.players.every((player) => player.isSpectator === false)).toBe(true);
    expect(state.roomId).toBe('ABCD');
  });
});

