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
  botThinkDelay: 700,
  createInitialState,
  reducer: roomReducer,
  getBotAction: chooseBotMove,
});
