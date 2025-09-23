import { describe, expect, it, vi } from 'vitest';

import {
  getBotThinkDelay,
  resolveBotTurnPlayer,
  selectBotAction,
  shouldAutoReadyBots,
} from '../src/services/photon/automation.js';

describe('photon automation helpers', () => {
  it('shouldAutoReadyBots triggers only when humans are ready and bots are not', () => {
    const baseState = {
      phase: 'roomLobby',
      players: [
        { id: 'human', isBot: false, isReady: true },
        { id: 'bot-1', isBot: true, isReady: false },
      ],
    };

    expect(shouldAutoReadyBots(baseState)).toBe(true);
    expect(shouldAutoReadyBots({ ...baseState, players: [] })).toBe(false);
    expect(shouldAutoReadyBots({ ...baseState, phase: 'playing' })).toBe(false);
  });

  it('resolveBotTurnPlayer returns the active bot during playing phase', () => {
    const state = {
      phase: 'playing',
      currentTurn: 'bot-1',
      players: [
        { id: 'human', isBot: false },
        { id: 'bot-1', isBot: true },
      ],
    };
    expect(resolveBotTurnPlayer(state)).toEqual({ id: 'bot-1', isBot: true });
    expect(resolveBotTurnPlayer({ ...state, currentTurn: 'human' })).toBeNull();
    expect(resolveBotTurnPlayer({ ...state, phase: 'finished' })).toBeNull();
  });

  it('selectBotAction delegates to the engine when provided', () => {
    const engine = { getBotAction: vi.fn().mockReturnValue({ type: 'PLAY' }) };
    const state = { phase: 'playing' };
    const player = { id: 'bot', isBot: true };

    expect(selectBotAction(engine, state, player)).toEqual({ type: 'PLAY' });
    expect(engine.getBotAction).toHaveBeenCalledWith(state, player);
    expect(selectBotAction({}, state, player)).toBeNull();
  });

  it('getBotThinkDelay normalises invalid values to zero', () => {
    expect(getBotThinkDelay({ botThinkDelay: 400 })).toBe(400);
    expect(getBotThinkDelay({ botThinkDelay: -5 })).toBe(0);
    expect(getBotThinkDelay({})).toBe(0);
  });
});
