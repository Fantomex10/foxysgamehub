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
  botThinkDelay: 800,
  createInitialState,
  reducer: roomReducer,
  getBotAction: chooseHeartsBotMove,
});
