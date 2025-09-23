import { describe, expect, it, vi } from 'vitest';
import { createTrickEngine } from '../src/games/shared/trickEngine/index.js';

const pushHistory = (history = [], message) => [message, ...(history ?? [])];

const baseState = {
  phase: 'playing',
  currentTurn: 'p1',
  players: [
    { id: 'p1', name: 'Alice' },
    { id: 'p2', name: 'Bob' },
  ],
  hands: {
    p1: [{ id: 'card-1', rank: 'A', suit: 'spades' }],
    p2: [],
  },
  history: [],
};

const action = {
  type: 'PLAY_CARD',
  payload: {
    playerId: 'p1',
    card: { id: 'card-1', rank: 'A', suit: 'spades' },
  },
};

describe('createTrickEngine', () => {
  it('falls back to default guard when phase or turn are invalid', () => {
    const engine = createTrickEngine({ pushHistory });
    const result = engine({ ...baseState, phase: 'idle' }, action);
    expect(result.phase).toBe('idle');
    expect(result.hands.p1).toHaveLength(1);
  });

  it('returns validation override when validateCard rejects the play', () => {
    const engine = createTrickEngine({
      pushHistory,
      validateCard: (context) => ({
        ...context.initialState,
        banner: 'Nope',
      }),
    });

    const result = engine(baseState, action);
    expect(result.banner).toBe('Nope');
    expect(result.hands.p1).toHaveLength(1);
  });

  it('runs the trick pipeline hooks and finalise phase updates', () => {
    const onCardPlayed = vi.fn((context) => {
      const trick = [...(context.state.trick ?? []), { playerId: context.playerId, card: context.card }];
      context.assign({ trick });
      context.mergeMeta({
        nextTurn: 'p2',
        banner: 'Bob to play.',
      });
      return context.state;
    });

    const onTrickComplete = vi.fn((context) => {
      context.pushHistory('Trick resolved');
      context.assign({ trick: [] });
      context.mergeMeta({
        nextTurn: 'p1',
        banner: 'Alice leads.',
        roundComplete: true,
        handsRemaining: 0,
      });
      return context.state;
    });

    const onRoundComplete = vi.fn((context) => {
      context.pushHistory('Round resolved');
      context.mergeMeta({
        nextTurn: null,
        banner: 'Round over',
        phase: 'finished',
      });
      return context.state;
    });

    const engine = createTrickEngine({
      pushHistory,
      findPlayer: (players, id) => players.find((player) => player.id === id),
      describePlay: (context) => `${context.getPlayer()?.name ?? 'Player'} plays ${context.card.id}`,
      onCardPlayed,
      isTrickComplete: (context) => (context.state.trick?.length === 1 ? { trick: context.state.trick } : null),
      onTrickComplete,
      isRoundComplete: (context) => (context.meta.roundComplete ? {} : null),
      onRoundComplete,
      finalize: (context) => context.assign({
        currentTurn: context.meta.nextTurn,
        banner: context.meta.banner,
        phase: context.meta.phase ?? context.state.phase,
      }),
    });

    const result = engine(baseState, action);

    expect(onCardPlayed).toHaveBeenCalledOnce();
    expect(onTrickComplete).toHaveBeenCalledOnce();
    expect(onRoundComplete).toHaveBeenCalledOnce();

    expect(result.hands.p1).toHaveLength(0);
    expect(result.trick).toEqual([]);
    expect(result.currentTurn).toBeNull();
    expect(result.phase).toBe('finished');
    expect(result.banner).toBe('Round over');
    expect(result.history[0]).toBe('Round resolved');
    expect(result.history[1]).toBe('Trick resolved');
    expect(result.history[2]).toBe('Alice plays card-1');
  });
});
