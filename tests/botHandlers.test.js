import { describe, expect, it } from 'vitest';
import { createBotHandlers } from '../src/games/shared/botHandlers.js';

const baseState = {
  phase: 'roomLobby',
  hostId: 'host-1',
  userId: 'host-1',
  botCounter: 1,
  players: [],
  spectators: [],
  history: [],
  roomSettings: { maxPlayers: 3 },
};

describe('createBotHandlers', () => {
  it('adds bots until reaching the seat limit and then returns banner', () => {
    const { addBot } = createBotHandlers({
      getSeatLimit: (state) => state.roomSettings.maxPlayers,
      bannerWhenFull: (limit) => `Max players (${limit}) reached.`,
    });

    let state = { ...baseState };
    state = addBot(state);
    state = addBot(state);
    state = addBot(state);

    expect(state.players).toHaveLength(3);
    expect(state.banner).toBeUndefined();

    const fullState = addBot(state);
    expect(fullState.players).toHaveLength(3);
    expect(fullState.banner).toBe('Max players (3) reached.');
  });

  it('prevents non-host or non-lobby interactions when messages provided', () => {
    const { addBot, removeBot, autoReadyBots } = createBotHandlers({
      messages: {
        lobbyOnly: 'Lobby only',
        hostOnly: 'Host only',
        autoReady: 'Bots ready',
      },
      historyLimit: 2,
    });

    const nonLobby = addBot({ ...baseState, phase: 'playing' });
    expect(nonLobby.history[0]).toBe('Lobby only');

    const notHostState = {
      ...baseState,
      userId: 'guest',
      history: [],
    };
    const notHostResult = removeBot(notHostState);
    expect(notHostResult.history[0]).toBe('Host only');

    const autoReadyResult = autoReadyBots(baseState);
    expect(autoReadyResult.players.every((player) => player.isReady === true)).toBe(true);
    expect(autoReadyResult.history[0]).toBe('Bots ready');
    expect(autoReadyResult.history).toHaveLength(1);
  });
});
