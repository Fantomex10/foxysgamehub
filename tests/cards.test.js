import { describe, expect, it } from 'vitest';
import { SUIT_ICONS } from '../src/lib/cards.js';

describe('card metadata', () => {
  it('exposes Unicode suit glyphs', () => {
    expect(SUIT_ICONS).toMatchObject({
      hearts: '\u2665',
      diamonds: '\u2666',
      clubs: '\u2663',
      spades: '\u2660',
    });
  });
});
