import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useRoomActions } from '../src/app/hooks/useRoomActions.js';

const createPhotonMock = () => ({
  toggleReady: vi.fn(),
  setPlayerStatus: vi.fn(),
  updateSeatLayout: vi.fn(),
  addBot: vi.fn(),
  removeBot: vi.fn(),
  resetSession: vi.fn(),
  returnToLobby: vi.fn(),
  drawCard: vi.fn(),
  startGame: vi.fn(),
});

describe('useRoomActions', () => {
  it('exposes room operations backed by photon client and higher-level handlers', () => {
    const photon = createPhotonMock();
    const updateUserDisplayName = vi.fn();
    const createLobby = vi.fn();
    const joinLobby = vi.fn();
    const quickSelectGame = vi.fn();
    const returnToHub = vi.fn();
    const state = { userId: 'player-1' };

    const { result } = renderHook(() => useRoomActions({
      photon,
      state,
      updateUserDisplayName,
      createLobby,
      joinLobby,
      quickSelectGame,
      returnToHub,
    }));

    act(() => {
      result.current.updateUserDisplayName('Alias');
      result.current.createLobby({});
      result.current.joinLobby({});
      result.current.quickSelectGame('engine');
      result.current.returnToHub();
      result.current.drawCard();
      result.current.startGame();
      result.current.toggleReady('player-2');
      result.current.setPlayerStatus('player-2', 'ready');
      result.current.updateSeatLayout({});
      result.current.addBot();
      result.current.removeBot();
      result.current.resetSession();
      result.current.returnToLobby();
    });

    expect(updateUserDisplayName).toHaveBeenCalledWith('Alias');
    expect(createLobby).toHaveBeenCalled();
    expect(joinLobby).toHaveBeenCalled();
    expect(quickSelectGame).toHaveBeenCalled();
    expect(returnToHub).toHaveBeenCalled();
    expect(photon.drawCard).toHaveBeenCalledWith('player-1');
    expect(photon.startGame).toHaveBeenCalled();
    expect(photon.toggleReady).toHaveBeenCalledWith('player-2');
    expect(photon.setPlayerStatus).toHaveBeenCalledWith('player-2', 'ready');
    expect(photon.updateSeatLayout).toHaveBeenCalled();
    expect(photon.addBot).toHaveBeenCalled();
    expect(photon.removeBot).toHaveBeenCalled();
    expect(photon.resetSession).toHaveBeenCalled();
    expect(photon.returnToLobby).toHaveBeenCalled();
  });
});
