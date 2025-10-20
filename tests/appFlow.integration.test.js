import { describe, expect, it } from 'vitest';
import { createPhotonClient } from '../src/services/photonClient.js';
import { crazyEightsEngine } from '../src/games/crazyEights/index.js';

describe('App flow integration', () => {
  it('progresses from login to active table play', () => {
    const client = createPhotonClient(crazyEightsEngine);

    client.connect({
      userId: 'player-1',
      userName: 'Test Pilot',
      engineId: crazyEightsEngine.id,
    });

    client.createRoom({
      roomId: 'ABCD',
      settings: {
        roomName: 'Integration Room',
        maxPlayers: 4,
        initialBots: 1,
        rules: {},
      },
    });

    let state = client.getState();
    expect(state.phase).toBe('roomLobby');
    expect(state.players.length).toBeGreaterThanOrEqual(2);

    client.setPlayerStatus(state.userId, 'ready');

    state = client.getState();
    expect(state.players.every((player) => player.isReady)).toBe(true);

    client.startGame();

    state = client.getState();
    expect(state.phase).toBe('playing');
    expect(state.currentTurn).toBeTruthy();
    expect(Array.isArray(state.drawPile)).toBe(true);
    expect(state.drawPile.length).toBeGreaterThan(0);
    expect(Array.isArray(state.hands[state.userId])).toBe(true);
  });
});
