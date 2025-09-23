import { afterEach, describe, expect, it, vi } from 'vitest';
import { wrapEngineComponent } from '../src/app/modules/engineComponentGuard.js';

const DummyComponent = () => null;

describe('engineComponentGuard', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs when a required prop is missing', () => {
    const Guarded = wrapEngineComponent('Table', DummyComponent, [
      { name: 'hand', required: true, type: 'array' },
      { name: 'onPlayCard', required: true, type: 'function' },
    ]);

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    Guarded({ hand: [] });

    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('onPlayCard'));
  });

  it('logs only once for the same missing prop', () => {
    const Guarded = wrapEngineComponent('Table', DummyComponent, [
      { name: 'hand', required: true, type: 'array' },
    ]);

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    Guarded({});
    Guarded({});

    expect(errorSpy).toHaveBeenCalledTimes(1);
  });

  it('does not log when required props are present with valid types', () => {
    const Guarded = wrapEngineComponent('Table', DummyComponent, [
      { name: 'hand', required: true, type: 'array' },
      { name: 'onPlayCard', required: true, type: 'function' },
    ]);

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    Guarded({ hand: [], onPlayCard() {} });

    expect(errorSpy).not.toHaveBeenCalled();
  });
});

