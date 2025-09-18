/**
 * @typedef {Object} GameEngineComponents
 * @property {React.ComponentType<any>} Welcome optional welcome component
 * @property {React.ComponentType<any>} Lobby optional lobby component
 * @property {React.ComponentType<any>} Table required in-play component
 * @property {React.ComponentType<any>} [SuitPicker] optional overlay component for wild-card selection
 */

/**
 * @typedef {Object} GameEngineHooks
 * @property {(args: { state: any, photon: any, authUser: any, metadata: Record<string, unknown> }) => {
 *   hand?: any[],
 *   handLocked?: boolean,
 *   onPlayCard?: (card: any) => void,
 *   overlays?: React.ReactNode,
 *   extraActions?: Record<string, (...args: any[]) => void>,
 * }} [usePlayerInteraction]
 */

/**
 * @typedef {Object} GameEngineDefinition
 * @property {string} id
 * @property {string} name
 * @property {Record<string, unknown>} [metadata]
 * @property {{
 *   Welcome?: React.ComponentType<any>,
 *   Lobby?: React.ComponentType<any>,
 *   Table: React.ComponentType<any>,
 *   SuitPicker?: React.ComponentType<any>,
 * }} components
 * @property {Record<string, unknown>} [helpers]
 * @property {GameEngineHooks} [hooks]
 * @property {number} [botThinkDelay]
 * @property {(options?: { userId?: string, userName?: string }) => any} createInitialState
 * @property {(state: any, action: any) => any} reducer
 * @property {(state: any, botPlayer: any) => any} [getBotAction]
 */

const REQUIRED_FIELDS = ['id', 'name', 'components', 'createInitialState', 'reducer'];

/**
 * @param {GameEngineDefinition} definition
 */
export const createGameEngine = (definition) => {
  for (const key of REQUIRED_FIELDS) {
    if (!(key in definition)) {
      throw new Error(`Game engine definition missing required field "${key}".`);
    }
  }

  if (!definition.components?.Table) {
    throw new Error('Game engine definition must provide components.Table.');
  }

  const metadata = definition.metadata ?? {};
  const helpers = definition.helpers ?? {};
  const hooks = definition.hooks ?? {};
  const botThinkDelay = definition.botThinkDelay ?? 0;

  return Object.freeze({
    ...definition,
    metadata,
    helpers,
    hooks,
    botThinkDelay,
  });
};
