import { describe, expect, it } from 'vitest';
import { scaleFont } from '../src/ui/typography.js';

describe('scaleFont', () => {
  it('returns the original value when scale is 1', () => {
    expect(scaleFont('14px')).toBe('14px');
    expect(scaleFont(16)).toBe(16);
  });

  it('scales numeric CSS values while preserving the unit', () => {
    expect(scaleFont('12px', 1.5)).toBe('18px');
    expect(scaleFont('1.6rem', 0.75, 2)).toBe('1.2rem');
  });

  it('scales numbers and respects precision', () => {
    expect(scaleFont(10, 1.2, 2)).toBe(12);
  });

  it('returns the original value when the format cannot be parsed', () => {
    expect(scaleFont('bold', 1.5)).toBe('bold');
    expect(scaleFont(null, 1.5)).toBeNull();
  });
});
