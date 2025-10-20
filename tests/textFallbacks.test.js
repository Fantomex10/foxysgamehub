import { describe, expect, it } from 'vitest';
import {
  getRoomTitle,
  getRoomCode,
  getDisplayName,
  getWaitingStatus,
  getLocalTimePlaceholder,
  getBalancePlaceholder,
  getCurrentTurnPlaceholder,
} from '../src/ui/textFallbacks.js';

describe('text fallbacks', () => {
  it('normalises room titles with a fallback', () => {
    expect(getRoomTitle('  Alpha Room  ')).toBe('Alpha Room');
    expect(getRoomTitle('   ', 'Fallback Room')).toBe('Fallback Room');
  });

  it('normalises room codes to uppercase with a fallback', () => {
    expect(getRoomCode('ab12')).toBe('AB12');
    expect(getRoomCode('   ')).toBe('Pending');
  });

  it('normalises display names with defaults', () => {
    expect(getDisplayName(' Player One ')).toBe('Player One');
    expect(getDisplayName('', 'Guest')).toBe('Guest');
    expect(getDisplayName('   ')).toBe('Player');
  });

  it('exposes human readable placeholders', () => {
    expect(getWaitingStatus()).toBe('Waiting for players to ready up...');
    expect(getLocalTimePlaceholder()).toBe('Syncing clock');
    expect(getBalancePlaceholder()).toBe('Not tracked');
    expect(getCurrentTurnPlaceholder()).toBe('Assigning turn');
  });

  it('placeholder strings avoid replacement characters', () => {
    const placeholders = [
      getWaitingStatus(),
      getLocalTimePlaceholder(),
      getBalancePlaceholder(),
      getCurrentTurnPlaceholder(),
    ];

    placeholders.forEach((value) => {
      expect(value).not.toMatch(/\uFFFD/);
    });
  });
});
