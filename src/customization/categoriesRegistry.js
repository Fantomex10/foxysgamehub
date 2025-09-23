import { createRegistry } from '../lib/registry.js';

const categoryRegistry = createRegistry({
  name: 'customization category',
  getKey: (category, options = {}) => options.key ?? category?.id ?? null,
});

export const registerCustomizationCategory = (category, options = {}) => {
  if (!category?.id) {
    throw new Error('registerCustomizationCategory: category must include an id');
  }
  if (typeof category.buildSection !== 'function') {
    throw new Error(`registerCustomizationCategory: category "${category.id}" must provide buildSection(context)`);
  }
  const payload = {
    order: 0,
    ...category,
  };
  return categoryRegistry.register(payload, { ...options, key: category.id });
};

export const unregisterCustomizationCategory = (id) => categoryRegistry.unregister(id);

export const listCustomizationCategories = () => (
  categoryRegistry
    .list()
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
);

const buildUnlockAndSelect = (actions, setter) => (item) => actions.unlockAndSelect(item, setter);

registerCustomizationCategory({
  id: 'presets',
  order: 10,
  buildSection: ({ available, state, actions }) => {
    if (!available?.presets?.length) {
      return null;
    }
    return {
      id: 'presets',
      title: 'Presets',
      items: available.presets,
      isActive: (item) => state.presetId === item.id,
      onSelect: (item) => actions.applyPreset(item.id),
      onUnlock: (item) => actions.unlockPreset(item),
    };
  },
});

registerCustomizationCategory({
  id: 'themes',
  order: 20,
  buildSection: ({ state, themeContext, actions }) => {
    const themes = themeContext?.availableThemes ?? [];
    if (!themes.length) {
      return null;
    }
    return {
      id: 'themes',
      title: 'Themes',
      items: themes,
      isActive: (item) => state.themeId === item.id,
      onSelect: (item) => actions.setThemeId(item.id),
      renderDescription: () => 'Palette',
    };
  },
});

registerCustomizationCategory({
  id: 'cardSkins',
  order: 30,
  buildSection: ({ available, state, actions }) => {
    if (!available?.cardSkins?.length) {
      return null;
    }
    return {
      id: 'cardSkins',
      title: 'Card backs',
      items: available.cardSkins,
      isActive: (item) => state.cardSkinId === item.id,
      onSelect: (item) => actions.setCardSkin(item.id),
      onUnlock: buildUnlockAndSelect(actions, actions.setCardSkin),
    };
  },
});

registerCustomizationCategory({
  id: 'tableSkins',
  order: 40,
  buildSection: ({ available, state, actions }) => {
    if (!available?.tableSkins?.length) {
      return null;
    }
    return {
      id: 'tableSkins',
      title: 'Table felt',
      items: available.tableSkins,
      isActive: (item) => state.tableSkinId === item.id,
      onSelect: (item) => actions.setTableSkin(item.id),
      onUnlock: buildUnlockAndSelect(actions, actions.setTableSkin),
    };
  },
});

registerCustomizationCategory({
  id: 'pieceSkins',
  order: 50,
  buildSection: ({ available, state, actions }) => {
    if (!available?.pieceSkins?.length) {
      return null;
    }
    return {
      id: 'pieceSkins',
      title: 'Piece skins',
      items: available.pieceSkins,
      isActive: (item) => state.pieceSkinId === item.id,
      onSelect: (item) => actions.setPieceSkin(item.id),
      onUnlock: buildUnlockAndSelect(actions, actions.setPieceSkin),
    };
  },
});

registerCustomizationCategory({
  id: 'backdrops',
  order: 60,
  buildSection: ({ available, state, actions }) => {
    if (!available?.backdrops?.length) {
      return null;
    }
    return {
      id: 'backdrops',
      title: 'Backdrops',
      items: available.backdrops,
      isActive: (item) => state.backdropId === item.id,
      onSelect: (item) => actions.setBackdrop(item.id),
      onUnlock: buildUnlockAndSelect(actions, actions.setBackdrop),
    };
  },
});
