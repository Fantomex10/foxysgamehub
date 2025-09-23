import { describe, expect, it, vi } from 'vitest';
import { deepClone } from '../src/services/utils/deepClone.js';

describe('deepClone utility', () => {
  it('produces a structural clone that is independent from the source', () => {
    const source = { foo: 'bar', nested: { value: 1 } };
    const clone = deepClone(source);
    expect(clone).toEqual(source);
    expect(clone).not.toBe(source);
    clone.nested.value = 2;
    expect(source.nested.value).toBe(1);
  });

  it('falls back gracefully when structuredClone is unavailable', () => {
    const originalStructuredClone = globalThis.structuredClone;
    globalThis.structuredClone = undefined;

    const source = { list: [1, 2, 3] };
    const clone = deepClone(source);

    expect(clone).toEqual(source);
    expect(clone).not.toBe(source);

    globalThis.structuredClone = originalStructuredClone;
  });

  it('recovers with fallback if structuredClone throws', () => {
    const originalStructuredClone = globalThis.structuredClone;
    globalThis.structuredClone = vi.fn(() => {
      throw new Error('DataCloneError');
    });

    const source = { key: 'value' };
    const clone = deepClone(source);

    expect(clone).toEqual(source);
    expect(clone).not.toBe(source);
    expect(globalThis.structuredClone).toHaveBeenCalled();

    globalThis.structuredClone = originalStructuredClone;
  });
});
