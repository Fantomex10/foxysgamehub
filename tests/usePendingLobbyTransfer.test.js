import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { usePendingLobbyTransfer } from '../src/app/hooks/usePendingLobbyTransfer.js';
import { crazyEightsEngine } from '../src/games/crazyEights/index.js';
import { heartsEngine } from '../src/games/hearts/index.js';

const createConfig = (engineId) => ({
  engineId,
  roomId: 'ROOM-123',
  roomName: 'Room 123',
  settings: {},
});

describe('usePendingLobbyTransfer', () => {
  it('returns target engine immediately when engines match', () => {
    const setEngine = vi.fn();
    const performCreateLobby = vi.fn();

    const { result } = renderHook(() => usePendingLobbyTransfer({
      engine: crazyEightsEngine,
      profileLoaded: true,
      setEngine,
      performCreateLobby,
    }));

    let response;
    act(() => {
      response = result.current.requestTransfer(createConfig(crazyEightsEngine.id));
    });

    expect(response).toEqual({ queued: false, targetEngine: crazyEightsEngine });
    expect(setEngine).not.toHaveBeenCalled();
    expect(performCreateLobby).not.toHaveBeenCalled();
  });

  it('queues transfer when engine differs and resumes once ready', async () => {
    const setEngine = vi.fn();
    const performCreateLobby = vi.fn();
    const config = createConfig(heartsEngine.id);

    const { result, rerender } = renderHook(
      (props) => usePendingLobbyTransfer(props),
      {
        initialProps: {
          engine: crazyEightsEngine,
          profileLoaded: false,
          setEngine,
          performCreateLobby,
        },
      },
    );

    act(() => {
      const response = result.current.requestTransfer(config);
      expect(response).toEqual({ queued: true, targetEngine: heartsEngine });
    });

    expect(setEngine).toHaveBeenCalledWith(heartsEngine);
    expect(performCreateLobby).not.toHaveBeenCalled();

    rerender({
      engine: heartsEngine,
      profileLoaded: true,
      setEngine,
      performCreateLobby,
    });

    await waitFor(() => expect(performCreateLobby).toHaveBeenCalledWith(config, heartsEngine));
  });
});
