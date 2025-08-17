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
    // --- FIX STARTS HERE ---
    // If there are no players, we are just getting default options for the lobby.
    // Return a default structure without dealing cards.
    if (!players || players.length === 0) {
        return {
            drawPile: [],
            discardPile: [],
            playersHands: {},
            currentTurn: null,
            currentSuit: null,
            gameDirection: 1,
            lastPlayedCard: null,
            gameOptions: gameOptions || { stackTwos: true, jackSkips: true }, // Provide default options
        };
    }
    // --- FIX ENDS HERE ---

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