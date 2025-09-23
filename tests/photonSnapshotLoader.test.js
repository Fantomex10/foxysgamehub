import { describe, expect, it } from 'vitest';

import { hydrateRoomSnapshot } from '../src/services/photon/snapshotLoader.js';

describe('hydrateRoomSnapshot', () => {
  const baseRoomState = {
    roomSettings: { maxPlayers: 2 },
    players: [],
    spectators: [],
    hostId: null,
    phase: 'roomLobby',
  };

  it('adds the current user as a player when seats are available', () => {
    const hydrated = hydrateRoomSnapshot(baseRoomState, {
      currentState: { userId: 'existing', userName: 'Existing' },
      currentUser: { userId: 'me', userName: 'Hero' },
    });

    expect(hydrated.players).toEqual([
      expect.objectContaining({ id: 'me', name: 'Hero', isSpectator: false }),
    ]);
    expect(hydrated.spectators).toHaveLength(0);
    expect(hydrated).not.toBe(baseRoomState);
  });

  it('adds the current user as a spectator when the table is full', () => {
    const fullRoom = {
      ...baseRoomState,
      players: [
        { id: 'p1', name: 'One', isBot: false, isReady: true },
        { id: 'p2', name: 'Two', isBot: false, isReady: true },
      ],
    };

    const hydrated = hydrateRoomSnapshot(fullRoom, {
      currentState: { userId: 'existing', userName: 'Existing' },
      currentUser: { userId: 'me', userName: 'Hero' },
    });

    expect(hydrated.players).toHaveLength(2);
    expect(hydrated.spectators).toEqual([
      expect.objectContaining({ id: 'me', name: 'Hero', isSpectator: true }),
    ]);
  });

  it('promotes the host from spectators when necessary', () => {
    const roomState = {
      ...baseRoomState,
      hostId: 'host-1',
      players: [{ id: 'p1', name: 'Player', isBot: false, isReady: true }],
      spectators: [{ id: 'host-1', name: 'Host', isReady: true }],
    };

    const hydrated = hydrateRoomSnapshot(roomState, {
      currentState: { userId: 'p1', userName: 'Player' },
    });

    expect(hydrated.players[0].id).toBe('host-1');
    expect(hydrated.players[1].id).toBe('p1');
    expect(hydrated.spectators).toHaveLength(0);
  });
});
