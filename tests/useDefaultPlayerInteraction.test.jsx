import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useDefaultPlayerInteraction } from '../src/hooks/useDefaultPlayerInteraction.js';

describe('useDefaultPlayerInteraction', () => {
  it('only plays a card when it is the player\'s turn', () => {
    const photon = { playCard: vi.fn() };
    const card = { id: 'card-1', rank: '5', suit: 'hearts' };
    const baseState = {
      userId: 'player-1',
      currentTurn: 'player-1',
      phase: 'playing',
      hands: { 'player-1': [card] },
    };

    const { result, rerender } = renderHook(({ state }) => useDefaultPlayerInteraction({ state, photon }), {
      initialProps: { state: baseState },
    });

    expect(result.current.handLocked).toBe(false);

    act(() => {
      result.current.onPlayCard(card);
    });

    expect(photon.playCard).toHaveBeenCalledWith('player-1', card);

    rerender({ state: { ...baseState, currentTurn: 'player-2' } });

    expect(result.current.handLocked).toBe(true);

    act(() => {
      result.current.onPlayCard(card);
    });

    expect(photon.playCard).toHaveBeenCalledTimes(1);
  });
});
