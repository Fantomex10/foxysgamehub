import { describe, expect, it } from 'vitest';

import {
  cloneState,
  freezeSnapshot,
  normalisePlayerStatus,
  normaliseSpectator,
} from '../src/services/photon/stateUtils.js';

describe('stateUtils', () => {
  it('cloneState creates a deep copy', () => {
    const original = { value: 1, nested: { count: 2 } };
    const cloned = cloneState(original);

    expect(cloned).not.toBe(original);
    expect(cloned).toEqual(original);

    cloned.nested.count = 3;
    expect(original.nested.count).toBe(2);
  });

  it('freezeSnapshot deep freezes nested structures', () => {
    const snapshot = { list: [{ id: 1 }, { id: 2 }] };

    const frozen = freezeSnapshot(snapshot);

    expect(Object.isFrozen(frozen)).toBe(true);
    expect(Object.isFrozen(frozen.list)).toBe(true);
    expect(Object.isFrozen(frozen.list[0])).toBe(true);
  });

  it('normalisePlayerStatus keeps allowed statuses and normalises others', () => {
    expect(normalisePlayerStatus({ id: '1', isReady: false }).status).toBe('notReady');
    expect(normalisePlayerStatus({ id: '2', status: 'ready', isReady: false }).status).toBe('ready');
    expect(normalisePlayerStatus({ id: '3', status: 'custom', isReady: true }).status).toBe('ready');
    expect(normalisePlayerStatus({ id: '4' }).isSpectator).toBe(false);
  });

  it('normaliseSpectator forces spectator defaults', () => {
    const spectator = normaliseSpectator({ id: 'S', isReady: true, status: 'ready' });
    expect(spectator.isSpectator).toBe(true);
    expect(spectator.isReady).toBe(false);
    expect(spectator.status).toBe('notReady');
  });
});
