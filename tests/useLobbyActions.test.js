import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useLobbyActions } from '../src/components/lobby/useLobbyActions.js';

const findAction = (actions, key) => actions.find((action) => action.key === key);

describe('useLobbyActions', () => {
  it('exposes host actions with active callbacks', () => {
    const onSetStatus = vi.fn();
    const openSeatManager = vi.fn();
    const onAddBot = vi.fn();
    const onRemoveBot = vi.fn();
    const onStart = vi.fn();
    const onConfigureTable = vi.fn();
    const onReturnToWelcome = vi.fn();
    const onBackToHub = vi.fn();

    const { result } = renderHook(() =>
      useLobbyActions({
        userId: 'host',
        selfStatus: 'ready',
        canChangeOwnStatus: true,
        isHost: true,
        seatManagerEnabled: true,
        openSeatManager,
        onSetStatus,
        onAddBot,
        onRemoveBot,
        onAddPlayerSlot: vi.fn(),
        onRemovePlayerSlot: vi.fn(),
        onStart,
        onConfigureTable,
        onReturnToWelcome,
        onBackToHub,
        canStart: true,
      }),
    );

    const readyAction = findAction(result.current.primaryActions, 'ready');
    act(() => {
      readyAction.onClick();
    });
    expect(onSetStatus).toHaveBeenCalledWith('host', 'ready');

    const seatAction = findAction(result.current.primaryActions, 'seat-select');
    act(() => {
      seatAction.onClick();
    });
    expect(openSeatManager).toHaveBeenCalledTimes(1);

    act(() => {
      findAction(result.current.primaryActions, 'add-bot').onClick();
    });
    expect(onAddBot).toHaveBeenCalledTimes(1);

    act(() => {
      findAction(result.current.primaryActions, 'remove-bot').onClick();
    });
    expect(onRemoveBot).toHaveBeenCalledTimes(1);

    act(() => {
      findAction(result.current.secondaryActions, 'start-game').onClick();
    });
    expect(onStart).toHaveBeenCalledTimes(1);

    act(() => {
      findAction(result.current.secondaryActions, 'table-options').onClick();
    });
    expect(onConfigureTable).toHaveBeenCalledTimes(1);

    act(() => {
      findAction(result.current.secondaryActions, 'reset-lobby').onClick();
    });
    expect(onReturnToWelcome).toHaveBeenCalledTimes(1);

    act(() => {
      findAction(result.current.secondaryActions, 'back-to-hub').onClick();
    });
    expect(onBackToHub).toHaveBeenCalledTimes(1);
  });

  it('disables host-only actions when user lacks permissions', () => {
    const onSetStatus = vi.fn();
    const openSeatManager = vi.fn();

    const { result } = renderHook(() =>
      useLobbyActions({
        userId: 'guest',
        selfStatus: 'notReady',
        canChangeOwnStatus: false,
        isHost: false,
        seatManagerEnabled: false,
        openSeatManager,
        onSetStatus,
        onAddBot: undefined,
        onRemoveBot: undefined,
        onAddPlayerSlot: undefined,
        onRemovePlayerSlot: undefined,
        onStart: undefined,
        onConfigureTable: undefined,
        onReturnToWelcome: undefined,
        onBackToHub: undefined,
        canStart: false,
      }),
    );

    const readyAction = findAction(result.current.primaryActions, 'ready');
    expect(readyAction.disabled).toBe(true);

    const seatAction = findAction(result.current.primaryActions, 'seat-select');
    expect(seatAction.disabled).toBe(true);

    const addBot = findAction(result.current.primaryActions, 'add-bot');
    expect(addBot.disabled).toBe(true);

    const startAction = findAction(result.current.secondaryActions, 'start-game');
    expect(startAction.disabled).toBe(true);
    expect(typeof startAction.onClick).toBe('undefined');

    expect(onSetStatus).not.toHaveBeenCalled();
    expect(openSeatManager).not.toHaveBeenCalled();
  });
});
