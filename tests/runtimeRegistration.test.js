import { describe, expect, it, afterEach } from 'vitest';
import {
  registerCardSkin,
  unregisterCardSkin,
  getCardSkinById,
} from '../src/customization/skins/cards.js';
import {
  registerTheme,
  unregisterTheme,
  getThemeById,
  listThemes,
} from '../src/ui/theme.js';
import {
  registerSessionAdapter,
  unregisterSessionAdapter,
  setSessionAdapter,
  getSessionAdapterKey,
  sessionService,
} from '../src/services/sessionService.js';
import {
  registerPhotonAdapter,
  unregisterPhotonAdapter,
  setPhotonAdapter,
  getPhotonAdapterKey,
  photonService,
} from '../src/services/photonService.js';
import { getDefaultGameEngine } from '../src/games/index.js';

const originalSessionAdapterKey = getSessionAdapterKey();
const originalPhotonAdapterKey = getPhotonAdapterKey();

describe('runtime registries', () => {
  afterEach(() => {
    setSessionAdapter(originalSessionAdapterKey);
    setPhotonAdapter(originalPhotonAdapterKey);
  });

  it('allows registering and removing a custom card skin', () => {
    const skinId = 'test-skin';
    registerCardSkin({
      id: skinId,
      name: 'Test Skin',
      tokens: {
        face: '#ffffff',
        back: '#000000',
        accent: '#ff0000',
        text: '#00ff00',
        border: 'rgba(0,0,0,0.2)',
      },
    });

    expect(getCardSkinById(skinId)?.name).toBe('Test Skin');

    unregisterCardSkin(skinId);
    expect(getCardSkinById(skinId)?.id).not.toBe(skinId);
  });

  it('allows registering a theme at runtime', () => {
    const baseTheme = getThemeById('midnight');
    const themeId = 'runtime-theme';
    registerTheme({
      ...baseTheme,
      id: themeId,
      name: 'Runtime Theme',
    });

    const themeIds = listThemes().map((theme) => theme.id);
    expect(themeIds).toContain(themeId);

    unregisterTheme(themeId);
    expect(listThemes().map((theme) => theme.id)).not.toContain(themeId);
  });

  it('switches to a dynamically registered session adapter', async () => {
    const previous = getSessionAdapterKey();
    const adapterKey = 'custom-session';

    registerSessionAdapter(adapterKey, {
      ensureUserSession: () => Promise.resolve({ uid: 'runtime-user', displayName: 'Runtime' }),
      fetchPlayerProfile: () => Promise.resolve(null),
      fetchCustomizationConfig: () => Promise.resolve(null),
      upsertPlayerProfile: () => Promise.resolve(null),
      upsertCustomizationConfig: () => Promise.resolve(null),
    });

    setSessionAdapter(adapterKey);
    const user = await sessionService.ensureUserSession();
    expect(user.uid).toBe('runtime-user');

    setSessionAdapter(previous);
    unregisterSessionAdapter(adapterKey);
  });

  it('switches to a dynamically registered photon adapter', () => {
    const previous = getPhotonAdapterKey();
    const adapterKey = 'custom-photon';
    const engine = getDefaultGameEngine();

    registerPhotonAdapter(adapterKey, {
      createClient: (targetEngine) => ({
        __adapter: adapterKey,
        targetEngine: targetEngine.id,
      }),
    });

    setPhotonAdapter(adapterKey);
    const client = photonService.createClient(engine);
    expect(client.__adapter).toBe(adapterKey);
    expect(client.targetEngine).toBe(engine.id);

    setPhotonAdapter(previous);
    unregisterPhotonAdapter(adapterKey);
  });

  it('annotates realtime fallback with effective adapter details', () => {
    const previous = getPhotonAdapterKey();
    const engine = getDefaultGameEngine();

    setPhotonAdapter('realtime');
    const client = photonService.createClient(engine);

    expect(client.__requestedAdapter).toBe('realtime');
    expect(client.__effectiveAdapter).toBe('local');
    expect(client.__adapter).toBe('local');

    setPhotonAdapter(previous);
  });
});
