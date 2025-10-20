import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useCreateLobbyConfig } from '../src/components/lobby/useCreateLobbyConfig.js';

const sampleEngines = [
  {
    id: 'crazy-eights',
    name: 'Crazy Eights',
    metadata: {
      playerConfig: {
        minPlayers: 2,
        maxPlayers: 4,
        maxBots: 3,
        defaultBots: 1,
      },
    },
  },
  {
    id: 'hearts',
    name: 'Hearts',
    metadata: {
      playerConfig: {
        requiredPlayers: 4,
        maxPlayers: 4,
        minBots: 0,
      },
    },
  },
];

describe('useCreateLobbyConfig', () => {
  const renderConfig = (props = {}) => renderHook(() => useCreateLobbyConfig({
    engines: sampleEngines,
    defaultEngineId: 'crazy-eights',
    onCreate: props.onCreate,
    ...props,
  }));

  it('initialises with defaults and clamps bots when engine changes', () => {
    const { result } = renderConfig();

    expect(result.current.state.engineId).toBe('crazy-eights');
    expect(result.current.state.botCount).toBe(1);
    expect(result.current.state.maxPlayers).toBe(4);

    act(() => {
      result.current.actions.setEngineId('hearts');
    });

    expect(result.current.state.engineId).toBe('hearts');
    expect(result.current.state.maxPlayers).toBe(4); // required players
    expect(result.current.state.botCount).toBe(3); // requiredPlayers - 1 clamp
    expect(result.current.state.requiredPlayers).toBe(4);
    expect(result.current.state.canSubmit).toBe(true);
  });

  it('blocks submission when password missing in private mode', () => {
    const handleCreate = vi.fn();
    const { result } = renderConfig({ onCreate: handleCreate });

    act(() => {
      result.current.actions.handleVisibilityToggle(true);
    });

    act(() => {
      result.current.actions.handleSubmit();
    });

    expect(handleCreate).not.toHaveBeenCalled();
    expect(result.current.state.showPasswordModal).toBe(true);
    expect(result.current.state.passwordError).toBe('Set a password to create a private lobby.');
  });

  it('submits payload after validations pass', () => {
    const handleCreate = vi.fn();
    const { result } = renderConfig({ onCreate: handleCreate });

    act(() => {
      result.current.actions.setRoomName('Test Lobby');
      result.current.actions.setBotCount(2);
    });

    act(() => {
      result.current.actions.handleSubmit();
    });

    expect(handleCreate).toHaveBeenCalledTimes(1);
    expect(handleCreate.mock.calls[0][0]).toEqual({
      roomName: 'Test Lobby',
      engineId: 'crazy-eights',
      settings: expect.objectContaining({
        maxPlayers: 4,
        initialBots: 2,
        visibility: 'public',
        password: null,
      }),
    });
  });
});
