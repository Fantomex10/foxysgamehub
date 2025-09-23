import { describe, expect, it, vi } from 'vitest';
import { buildDeveloperMenu } from '../src/app/lib/developerControls.js';

const baseConfig = {
  sessionAdapter: 'firebase',
  photonAdapter: 'local',
};

describe('buildDeveloperMenu', () => {
  it('returns null when service config is missing', () => {
    expect(buildDeveloperMenu({ serviceConfig: null })).toBeNull();
  });

  it('cycles through adapters and themes when options are available', () => {
    let currentConfig = { ...baseConfig };
    const updateServiceConfig = vi.fn((updater) => {
      currentConfig = typeof updater === 'function'
        ? updater(currentConfig)
        : { ...currentConfig, ...updater };
    });

    const setThemeId = vi.fn();

    const menu = buildDeveloperMenu({
      serviceConfig: currentConfig,
      sessionAdapters: ['firebase', 'mock'],
      photonAdapters: ['local', 'mock'],
      availableThemes: [{ id: 'midnight', name: 'Midnight' }, { id: 'aurora', name: 'Aurora' }],
      themeId: 'midnight',
      setThemeId,
      updateServiceConfig,
    });

    expect(menu?.title).toBe('Developer toggles');
    expect(menu?.items).toHaveLength(3);

    menu.items[0].onClick();
    expect(currentConfig.sessionAdapter).toBe('mock');

    menu.items[1].onClick();
    expect(currentConfig.photonAdapter).toBe('mock');

    menu.items[2].onClick();

    expect(updateServiceConfig).toHaveBeenCalledTimes(2);
    expect(setThemeId).toHaveBeenCalledWith('aurora');
  });
});
