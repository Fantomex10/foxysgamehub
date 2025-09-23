/**
 * @deprecated Bot helpers now live inside their respective engine packages.
 * Import helpers from the engine that owns them (e.g. games/crazyEights/logic/bot.js).
 */
export const BOT_HELPERS_MODULE_DEPRECATED_MESSAGE = 'src/lib/bot.js is deprecated. Import bot helpers from the owning game engine module.';

export const getBotHelperMigrationMessage = () => BOT_HELPERS_MODULE_DEPRECATED_MESSAGE;

export default {};
