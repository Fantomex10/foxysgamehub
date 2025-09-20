import LobbyView from '../../components/LobbyView.jsx';
import HeartsTable from './components/HeartsTable.jsx';
import { createGameEngine } from '../engineTypes.js';
import { createInitialState, roomReducer } from './state/roomReducer.js';
import { chooseHeartsBotMove } from './logic/bot.js';
import { useHeartsPlayerInteraction } from './hooks/usePlayerInteraction.jsx';

export const heartsEngine = createGameEngine({
  id: 'hearts',
  name: 'Hearts',
  metadata: {
    playerConfig: {
      requiredPlayers: 4,
      maxPlayers: 4,
      minPlayers: 4,
      minBots: 0,
      maxBots: 3,
      defaultBots: 0,
    },
  },
  components: {
    Lobby: LobbyView,
    Table: HeartsTable,
  },
  hooks: {
    usePlayerInteraction: useHeartsPlayerInteraction,
  },
  modules: {
    lobby: {
      getProfileSections: ({ state, gameDisplayName, playerDisplayName }) => {
        const readyCount = state.players.filter((player) => player.isReady).length;
        return [
          { type: 'highlight', label: 'Hearts lobby', value: state.roomName ?? gameDisplayName },
          { label: 'Room code', value: state.roomId ?? '—' },
          { label: 'Ready players', value: `${readyCount}/4` },
          { label: 'Spectators', value: String(state.spectators?.length ?? 0) },
          { type: 'divider', key: 'hearts-lobby-divider' },
          { label: 'Display name', value: playerDisplayName },
          { label: 'Objective', value: 'Avoid taking hearts or the queen of spades.' },
        ];
      },
    },
    table: {
      getProfileSections: ({ state, gameDisplayName, playerDisplayName }) => {
        const totalScore = state.scores?.[state.userId] ?? 0;
        return [
          { type: 'highlight', label: 'Match', value: state.roomName ?? gameDisplayName },
          { label: 'Round', value: `#${state.roundNumber || 1}` },
          { label: 'Hearts broken', value: state.heartsBroken ? 'Yes' : 'No' },
          { label: 'Current leader', value: state.banner || 'In progress' },
          { type: 'divider', key: 'hearts-table-divider' },
          { label: 'Display name', value: playerDisplayName },
          { label: 'Total score', value: `${totalScore}` },
        ];
      },
    },
  },
  botThinkDelay: 800,
  createInitialState,
  reducer: roomReducer,
  getBotAction: chooseHeartsBotMove,
});
