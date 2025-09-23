import { createRegistry } from '../lib/registry.js';

const presetRegistry = createRegistry({ name: 'preset' });

const basePresets = [
  {
    id: 'midnight-classic',
    name: 'Midnight Classic',
    description: 'Default foxhole palette with emerald felt.',
    themeId: 'midnight',
    cardSkinId: 'classic',
    tableSkinId: 'emerald-club',
    pieceSkinId: 'classic',
    backdropId: 'nebula-night',
  },
  {
    id: 'aurora-bloom',
    name: 'Aurora Bloom',
    description: 'Violet bloom with neon deck and cosmic felt.',
    themeId: 'aurora',
    cardSkinId: 'aurora',
    tableSkinId: 'aurora-veil',
    pieceSkinId: 'aurora',
    backdropId: 'aurora-sky',
  },
  {
    id: 'summit-dawn',
    name: 'Summit Dawn',
    description: 'Alpine sunrise with frosted felt and glacier tokens.',
    themeId: 'summit',
    cardSkinId: 'summit',
    tableSkinId: 'summit-felt',
    pieceSkinId: 'summit',
    backdropId: 'summit-horizon',
  },
];

presetRegistry.registerMany(basePresets);

export const registerPreset = (preset, options) => presetRegistry.register(preset, options);

export const unregisterPreset = (id) => presetRegistry.unregister(id);

export const listPresets = () => presetRegistry.list();

export const getPresetById = (id) => presetRegistry.get(id);

export const getDefaultPresetId = () => presetRegistry.getDefaultKey();
