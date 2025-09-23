import { describe, expect, it } from 'vitest';
import {
  STATUS_SEQUENCE,
  getNextStatus,
  normaliseStatus,
  prepareSeatedPlayer,
  prepareSpectator,
  makeId,
  makeRoomCode,
  findPlayer,
  createHistoryPusher,
} from '../src/games/shared/lobbyUtils.js';

describe('lobbyUtils', () => {
  it('cycles through status sequence', () => {
    expect(getNextStatus('notReady')).toBe('ready');
    expect(getNextStatus('ready')).toBe('needsTime');
    expect(getNextStatus('needsTime')).toBe('notReady');
  });

  it('defaults to start of sequence for unknown status', () => {
    expect(getNextStatus('unknown')).toBe(STATUS_SEQUENCE[1]);
  });

  it('normalises status based on player flags', () => {
    expect(normaliseStatus({ status: 'needsTime', isReady: false })).toBe('needsTime');
    expect(normaliseStatus({ status: 'invalid', isReady: true })).toBe('ready');
    expect(normaliseStatus({ isReady: false })).toBe('notReady');
  });

  it('prepares seated players with default lobby flags', () => {
    const player = prepareSeatedPlayer({ id: 'p1', name: 'Test' });
    expect(player).toMatchObject({
      isSpectator: false,
      isReady: false,
      status: 'notReady',
    });
  });

  it('prepares spectators with default lobby flags', () => {
    const player = prepareSpectator({ id: 'p1', name: 'Test' });
    expect(player).toMatchObject({
      isSpectator: true,
      isReady: false,
      status: 'notReady',
    });
  });

  it('generates identifiers with the provided prefix', () => {
    const id = makeId('bot');
    expect(id.startsWith('bot-')).toBe(true);
    expect(id.length).toBeGreaterThan(6);
  });

  it('generates uppercase room codes', () => {
    const roomCode = makeRoomCode();
    expect(roomCode).toHaveLength(4);
    expect(roomCode).toBe(roomCode.toUpperCase());
  });

  it('finds players by identifier', () => {
    const players = [
      { id: 'a', name: 'A' },
      { id: 'b', name: 'B' },
    ];
    expect(findPlayer(players, 'b')).toEqual(players[1]);
    expect(findPlayer(players, 'x')).toBeUndefined();
  });

  it('creates a bounded history log', () => {
    const pushHistory = createHistoryPusher(3);
    let history = pushHistory(undefined, 'one');
    history = pushHistory(history, 'two');
    history = pushHistory(history, 'three');
    history = pushHistory(history, 'four');

    expect(history).toEqual(['four', 'three', 'two']);
  });
});
