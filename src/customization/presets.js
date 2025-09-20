export const presets = {
  'midnight-classic': {
    id: 'midnight-classic',
    name: 'Midnight Classic',
    description: 'Default foxhole palette with emerald felt.',
    themeId: 'midnight',
    cardSkinId: 'classic',
    tableSkinId: 'emerald-club',
    pieceSkinId: 'classic',
    backdropId: 'nebula-night',
  },
  'aurora-bloom': {
    id: 'aurora-bloom',
    name: 'Aurora Bloom',
    description: 'Violet bloom with neon deck and cosmic felt.',
    themeId: 'aurora',
    cardSkinId: 'aurora',
    tableSkinId: 'aurora-veil',
    pieceSkinId: 'aurora',
    backdropId: 'aurora-sky',
  },
  'summit-dawn': {
    id: 'summit-dawn',
    name: 'Summit Dawn',
    description: 'Alpine sunrise with frosted felt and glacier tokens.',
    themeId: 'summit',
    cardSkinId: 'summit',
    tableSkinId: 'summit-felt',
    pieceSkinId: 'summit',
    backdropId: 'summit-horizon',
  },
};

export const defaultPresetId = 'midnight-classic';

export const listPresets = () => Object.values(presets);

export const getPresetById = (id) => presets[id] ?? null;
