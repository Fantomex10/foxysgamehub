export {
  CustomizationProvider,
  useCustomization,
  useCustomizationTokens,
} from './CustomizationContext.jsx';

export {
  registerCardSkin,
  unregisterCardSkin,
  listCardSkins,
  getCardSkinById,
  getDefaultCardSkinId,
} from './skins/cards.js';

export {
  registerTableSkin,
  unregisterTableSkin,
  listTableSkins,
  getTableSkinById,
  getDefaultTableSkinId,
} from './skins/table.js';

export {
  registerPieceSkin,
  unregisterPieceSkin,
  listPieceSkins,
  getPieceSkinById,
  getDefaultPieceSkinId,
} from './skins/pieces.js';

export {
  registerBackdrop,
  unregisterBackdrop,
  listBackdrops,
  getBackdropById,
  getDefaultBackdropId,
} from './backdrops.js';

export {
  registerPreset,
  unregisterPreset,
  listPresets,
  getPresetById,
  getDefaultPresetId,
} from './presets.js';

export {
  registerCustomizationCategory,
  unregisterCustomizationCategory,
  listCustomizationCategories,
} from './categoriesRegistry.js';
