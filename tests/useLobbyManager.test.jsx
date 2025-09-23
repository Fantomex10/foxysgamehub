import { renderHook, act, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useLobbyManager } from '../src/app/hooks/useLobbyManager.js';
import { APP_PHASES } from '../src/app/constants.js';
import { crazyEightsEngine } from '../src/games/crazyEights/index.js';
import { heartsEngine } from '../src/games/hearts/index.js';

const createPhotonMock = () => ({
  setEngine: vi.fn(),
  createRoom: vi.fn(),
  exportRoomSnapshot: vi.fn(() => ({
    roomId: 'ROOM1',
    roomName: 'Room 1',
    hostId: 'user-1',
    players: [{ id: 'user-1', name: 'Player One' }],
    spectators: [],
    roomSettings: { maxPlayers: 4 },
  })),
  loadRoom: vi.fn(),
  resetSession: vi.fn(),
  setDisplayName: vi.fn(),
});

describe('useLobbyManager', () => {
  let photon;
  let setEngine;
  let setAppPhase;
  const authUser = { uid: 'user-1', displayName: 'Player One' };
  const baseState = {
    phase: 'idle',
    hostId: 'user-1',
    userId: 'user-1',
    roomId: 'ROOM1',
    roomName: 'Room 1',
    userName: 'Player One',
    players: [],
    spectators: [],
  };

  beforeEach(() => {
    photon = createPhotonMock();
    setEngine = vi.fn();
    setAppPhase = vi.fn();
  });

  it('creates a lobby and records it in the available rooms list', async () => {
    const { result } = renderHook(() => useLobbyManager({
      photon,
      engine: crazyEightsEngine,
      authUser,
      state: baseState,
      profileLoaded: true,
      setEngine,
      setAppPhase,
    }));

    act(() => {
      result.current.createLobby({
        engineId: crazyEightsEngine.id,
        roomName: 'Room 1',
        roomId: 'ROOM1',
        settings: {},
      });
    });

    expect(photon.createRoom).toHaveBeenCalled();
    await waitFor(() => expect(result.current.availableRooms).toHaveLength(1));
  });

  it('switches engine and returns to lobby when host quick-selects a game', () => {
    const { result } = renderHook(() => useLobbyManager({
      photon,
      engine: crazyEightsEngine,
      authUser,
      state: baseState,
      profileLoaded: true,
      setEngine,
      setAppPhase,
    }));

    act(() => {
      result.current.quickSelectGame(heartsEngine.id);
    });

    expect(setEngine).toHaveBeenCalledWith(heartsEngine);
    expect(photon.setDisplayName).toHaveBeenCalledWith('Player One');
    expect(photon.resetSession).not.toHaveBeenCalled();
    expect(setAppPhase).toHaveBeenCalledWith(APP_PHASES.ROOM);
  });

  it('returns to hub and clears tracked rooms', async () => {
    const { result } = renderHook(() => useLobbyManager({
      photon,
      engine: crazyEightsEngine,
      authUser,
      state: baseState,
      profileLoaded: true,
      setEngine,
      setAppPhase,
    }));

    act(() => {
      result.current.createLobby({
        engineId: crazyEightsEngine.id,
        roomName: 'Room 1',
        roomId: 'ROOM1',
        settings: {},
      });
    });

    await waitFor(() => expect(result.current.availableRooms).toHaveLength(1));

    act(() => {
      result.current.returnToHub();
    });

    expect(photon.resetSession).toHaveBeenCalled();
    expect(setAppPhase).toHaveBeenCalledWith(APP_PHASES.HUB);
    await waitFor(() => expect(result.current.availableRooms).toHaveLength(0));
  });
});
