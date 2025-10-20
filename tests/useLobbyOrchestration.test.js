import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useLobbyOrchestration } from '../src/components/lobby/useLobbyOrchestration.js';

const basePlayers = [
  { id: 'host', name: 'Host', isReady: true, isHost: true },
  { id: 'p2', name: 'Player 2', isReady: true },
];

const baseSpectators = [
  { id: 's1', name: 'Spectator 1', isHost: false, isBot: false },
];

const baseGames = [
  { id: 'crazy-eights', name: 'Crazy Eights' },
  { id: 'hearts', name: 'Hearts' },
];

describe('useLobbyOrchestration', () => {
  const renderOrchestration = (overrides = {}) => renderHook(() => useLobbyOrchestration({
    roomId: 'room-1',
    players: basePlayers,
    spectators: baseSpectators,
    hostId: 'host',
    userId: 'host',
    gameOptions: baseGames,
    selectedGameId: 'crazy-eights',
    roomSettings: { maxPlayers: 4 },
    onSelectGame: overrides.onSelectGame,
    onUpdateSeats: overrides.onUpdateSeats,
    ...overrides,
  }));

  it('derives host state, readiness, and game selection handling', () => {
    const onSelectGame = vi.fn();
    const { result } = renderOrchestration({ onSelectGame });

    expect(result.current.isHost).toBe(true);
    expect(result.current.canStart).toBe(true);
    expect(result.current.availableGames).toHaveLength(2);
    expect(result.current.currentGameId).toBe('crazy-eights');
    expect(result.current.showGameSelect).toBe(true);
    expect(result.current.seatCapacity).toBe(4);
    expect(result.current.benchList).toHaveLength(1);
    expect(result.current.gameSelectId).toBe('lobby-game-select-room-1');

    act(() => {
      result.current.handleGameSelection('hearts');
    });

    expect(onSelectGame).toHaveBeenCalledWith('hearts');
  });

  it('guards against seat manager actions for non-hosts', () => {
    const { result } = renderHook(() => useLobbyOrchestration({
      roomId: 'room-2',
      players: basePlayers,
      spectators: [],
      hostId: 'host',
      userId: 'guest',
      gameOptions: baseGames,
      selectedGameId: 'crazy-eights',
      roomSettings: null,
      onSelectGame: vi.fn(),
      onUpdateSeats: vi.fn(),
    }));

    expect(result.current.isHost).toBe(false);
    expect(result.current.seatManagerEnabled).toBe(false);

    act(() => {
      result.current.openSeatManager();
    });
    expect(result.current.seatManagerOpen).toBe(false);
  });

  it('opens, applies, and closes the seat manager dialog', async () => {
    const onUpdateSeats = vi.fn(() => Promise.resolve());
    const { result } = renderOrchestration({ onUpdateSeats });

    act(() => {
      result.current.openSeatManager();
    });
    expect(result.current.seatManagerOpen).toBe(true);

    await act(async () => {
      await result.current.handleSeatManagerApply({ seatOrder: [] });
    });

    expect(onUpdateSeats).toHaveBeenCalledWith({ seatOrder: [] });
    expect(result.current.seatManagerOpen).toBe(false);
  });
});
