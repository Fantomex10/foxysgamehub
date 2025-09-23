import { beforeEach, describe, expect, it } from 'vitest';
import { sessionService, setSessionAdapter } from '../src/services/sessionService.js';

describe('sessionService customization adapters', () => {
  beforeEach(() => {
    setSessionAdapter('mock');
  });

  it('fetches null when no customization exists', async () => {
    const result = await sessionService.fetchCustomizationConfig('test-user');
    expect(result).toBeNull();
  });

  it('persists and retrieves customization config', async () => {
    const uid = 'custom-user';
    const config = {
      themeId: 'summit-dawn',
      presetId: null,
      cardSkinId: 'classic',
      tableSkinId: 'standard',
      pieceSkinId: 'default',
      backdropId: 'aurora',
      unlocks: ['skin.cards.aurora'],
      accessibility: {
        highContrast: true,
        reducedMotion: false,
        largeText: true,
      },
    };

    await sessionService.upsertCustomizationConfig(uid, config);
    const stored = await sessionService.fetchCustomizationConfig(uid);

    expect(stored).toMatchObject(config);
    expect(typeof stored.updatedAt === 'string').toBe(true);
    expect(stored.unlocks).toContain('skin.cards.aurora');
  });
});
