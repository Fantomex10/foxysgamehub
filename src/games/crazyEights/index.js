import WelcomeScreen from '../../components/WelcomeScreen.jsx';
import LobbyView from '../../components/LobbyView.jsx';
import GameBoard from '../../components/GameBoard.jsx';
import SuitPicker from '../../components/SuitPicker.jsx';
import { SUITS } from '../../lib/cards.js';
import { chooseBotMove, pickSuitForHuman } from './logic/bot.js';
import { createInitialState, roomReducer } from './state/roomReducer.js';
import { createGameEngine } from '../engineTypes.js';
import { useCrazyEightsPlayerInteraction } from './hooks/usePlayerInteraction.jsx';

export const crazyEightsEngine = createGameEngine({
  id: 'crazy-eights',
  name: 'Crazy Eights',
  metadata: {
    suits: SUITS,
    playerConfig: {
      minPlayers: 2,
      maxPlayers: 8,
      minBots: 0,
      maxBots: 7,
      defaultBots: 0,
    },
  },
  customizationDefaults: {
    presetId: 'midnight-classic',
  },
  components: {
    Welcome: WelcomeScreen,
    Lobby: LobbyView,
    Table: GameBoard,
    SuitPicker,
  },
  helpers: {
    pickSuitForHuman,
  },
  hooks: {
    usePlayerInteraction: useCrazyEightsPlayerInteraction,
  },
  modules: {
    table: {
      getProfileSections: ({ state, gameDisplayName, playerDisplayName }) => {
        const activeSuit = state.activeSuit ?? state.discardPile?.[state.discardPile.length - 1]?.suit ?? '—';
        return [
          { type: 'highlight', label: 'Lobby', value: state.roomName ?? gameDisplayName },
          { label: 'Room code', value: state.roomId ?? '—' },
          { label: 'Active suit', value: activeSuit.toUpperCase?.() ?? String(activeSuit) },
          { label: 'Cards remaining', value: String(state.drawPile?.length ?? 0) },
          { type: 'divider', key: 'crazy-eights-divider' },
          { label: 'Display name', value: playerDisplayName },
          { label: 'Hand size', value: String(state.hands?.[state.userId]?.length ?? 0) },
        ];
      },
    },
  },
  botThinkDelay: 700,
  createInitialState,
  reducer: roomReducer,
  getBotAction: chooseBotMove,
});

export const gameEngines = [
  { engine: crazyEightsEngine, options: { default: true } },
];
