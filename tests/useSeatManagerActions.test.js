import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useSeatManagerActions } from '../src/components/lobby/useSeatManagerActions.js';

describe('useSeatManagerActions', () => {
  it('disables seat manager controls when host permissions are missing', () => {
    const onUpdateSeats = vi.fn();
    const { result } = renderHook(() =>
      useSeatManagerActions({ isHost: false, onUpdateSeats }),
    );

    expect(result.current.seatManagerEnabled).toBe(false);

    act(() => {
      result.current.openSeatManager();
    });

    expect(result.current.seatManagerOpen).toBe(false);
    expect(onUpdateSeats).not.toHaveBeenCalled();
  });

  it('queues seat updates and closes after synchronous apply', async () => {
    const onUpdateSeats = vi.fn(() => ({ ok: true }));
    const { result } = renderHook(() =>
      useSeatManagerActions({ isHost: true, onUpdateSeats }),
    );

    act(() => {
      result.current.openSeatManager();
    });

    await act(async () => {
      await result.current.handleSeatManagerApply({ seatOrder: ['a', 'b'] });
    });

    expect(onUpdateSeats).toHaveBeenCalledWith({ seatOrder: ['a', 'b'] });
    expect(result.current.seatManagerOpen).toBe(false);
    expect(result.current.getQueuedConfig()).toBeNull();
  });

  it('resets queue after async apply resolves', async () => {
    const onUpdateSeats = vi.fn(() => Promise.resolve('done'));
    const { result } = renderHook(() =>
      useSeatManagerActions({ isHost: true, onUpdateSeats }),
    );

    act(() => {
      result.current.openSeatManager();
    });

    await act(async () => {
      await result.current.handleSeatManagerApply(() => ({ seatOrder: ['x'] }));
    });

    expect(onUpdateSeats).toHaveBeenCalledWith({ seatOrder: ['x'] });
    expect(result.current.getQueuedConfig()).toBeNull();
    expect(result.current.seatManagerOpen).toBe(false);
  });
});
