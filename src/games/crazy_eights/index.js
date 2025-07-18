// =================================================================================
// FILE: src/games/crazy_eights/index.js
// =================================================================================
import GameRoom from './GameRoom';
import CrazyEightsOptions from './components/CrazyEightsOptions';
import { createShuffledDeck, dealCards } from './logic';

// Export the main React component for the game room UI.
export const GameComponent = GameRoom;

// Export the options component for the lobby.
export const OptionsComponent = CrazyEightsOptions;

// Export a standardized 'logic' object.
export const logic = {
  getInitialState: (players, gameOptions) => {
    const { hands, remainingDeck: deckAfterDealing } = dealCards(createShuffledDeck(players.length), players);
    const firstCard = deckAfterDealing.shift();
    return {
      drawPile: deckAfterDealing,
      discardPile: [firstCard],
      playersHands: hands,
      currentTurn: players[0].id,
      currentSuit: firstCard.rank === '8' ? null : firstCard.suit,
      gameDirection: 1,
      lastPlayedCard: firstCard,
      gameOptions: gameOptions,
    };
  },
};
