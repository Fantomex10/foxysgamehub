// =================================================================================
// FILE: src/games/crazy_eights/logic.js (Updated)
// =================================================================================
// This file contains the pure, state-agnostic game logic for Crazy Eights.
// It has no dependency on React or Firebase.
//
// KEY CHANGE: Added the 'isValidPlay' function required by the new GameEngine.
// =================================================================================

export const name = "Crazy Eights";

/**
 * NEW FUNCTION: Checks if a card can be legally played on top of another.
 * @param {object} cardToPlay - The card the player wants to play.
 * @param {object} topCard - The current card on top of the discard pile.
 * @param {string} currentSuit - The active suit (if an 8 was played).
 * @returns {boolean} - True if the play is valid, false otherwise.
 */
export const isValidPlay = (cardToPlay, topCard, currentSuit) => {
    // An 8 can be played on anything.
    if (cardToPlay.rank === '8') {
        return true;
    }
    // The card must match the active suit (set by a previous 8) or the top card's rank.
    return cardToPlay.suit === currentSuit || cardToPlay.rank === topCard.rank;
};

/**
 * Creates and shuffles a deck of cards. For more than 5 players, it combines
 * and shuffles two decks.
 * @param {number} playerCount - The number of players in the game.
 * @returns {Array<Object>} An array of card objects.
 */
export const createShuffledDeck = (playerCount = 4, existingCards = []) => {
    // If we are reshuffling, use the existing cards. Otherwise, create a new deck.
    if (existingCards.length > 0) {
        console.log(`Reshuffling ${existingCards.length} cards.`);
        for (let i = existingCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [existingCards[i], existingCards[j]] = [existingCards[j], existingCards[i]];
        }
        return existingCards;
    }


    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const singleDeck = suits.flatMap(suit => ranks.map(rank => ({ suit, rank })));
    const numDecks = playerCount > 5 ? 2 : 1;
    let deck = [];
    for (let i = 0; i < numDecks; i++) {
        deck.push(...singleDeck);
    }
    console.log(`Using ${numDecks} deck(s) for ${playerCount} players. Total cards: ${deck.length}`);
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
};

export const dealCards = (deck, players) => {
    const mutableDeck = [...deck];
    const hands = {};
    players.forEach(player => { hands[player.id] = []; });
    const cardsToDeal = players.length > 2 ? 7 : 5; // Official rules adjustment

    for (let i = 0; i < cardsToDeal; i++) {
        players.forEach(player => {
            if (mutableDeck.length > 0) {
                hands[player.id].push(mutableDeck.shift());
            }
        });
    }
    return { hands, remainingDeck: mutableDeck };
};


export const getNextTurn = (currentTurnId, players, gameDirection) => {
    const activePlayers = players.filter(p => p.status !== 'offline');
    if (activePlayers.length === 0) return null;
    const currentIndex = activePlayers.findIndex(p => p.id === currentTurnId);
    if (currentIndex === -1) {
        // Fallback for when the current player might have gone offline
        const originalIndex = players.findIndex(p => p.id === currentTurnId);
        const nextOriginalIndex = (originalIndex + gameDirection + players.length) % players.length;
        return players[nextOriginalIndex].id;
    }
    const nextIndex = (currentIndex + gameDirection + activePlayers.length) % activePlayers.length;
    return activePlayers[nextIndex].id;
};

export const applyCrazyEightsCardLogic = (card, { players, gameDirection, currentTurn, playersHands, drawPile, gameOptions }) => {
    let nextTurn = getNextTurn(currentTurn, players, gameDirection);
    let newGameDirection = gameDirection;
    let newPlayersHands = { ...playersHands };
    let newDrawPile = [...drawPile];
    let gameMessage = "";

    const options = gameOptions || { stackTwos: true, jackSkips: true };

    switch (card.rank) {
        case 'A':
            newGameDirection *= -1;
            nextTurn = getNextTurn(currentTurn, players, newGameDirection);
            gameMessage = "Direction reversed!";
            break;
        case 'J':

            const skippedPlayerId = getNextTurn(currentTurn, players, newGameDirection);
            nextTurn = getNextTurn(skippedPlayerId, players, newGameDirection);
            const skippedPlayer = players.find(p => p.id === skippedPlayerId);
            gameMessage = `${skippedPlayer?.name || 'Next player'} is skipped!`;
            if (players.filter(p => p.status !== 'offline').length === 2) {
                gameMessage += ` Play again.`;

            }
            break;
        case '2':
            const playerToDrawId = nextTurn;
            const playerToDraw = players.find(p => p.id === playerToDrawId);
            if (playerToDraw) {
                if (newDrawPile.length >= 2) {
                    newPlayersHands[playerToDrawId] = [...newPlayersHands[playerToDrawId], newDrawPile.shift(), newDrawPile.shift()];
                } else if (newDrawPile.length === 1) {
                    newPlayersHands[playerToDrawId] = [...newPlayersHands[playerToDrawId], newDrawPile.shift()];
                }
                gameMessage = `${playerToDraw.name} draws 2 cards!`;
            }
            break;
        case '8':
            // The logic for 'choosing_suit' is now handled in the engine,
            // so we just need a message here.
            gameMessage = "Wild card played! Choose a new suit.";
            break;
    }
    return { nextTurn, gameDirection: newGameDirection, playersHands: newPlayersHands, drawPile: newDrawPile, gameMessage };
};

export const getSuit = (card) => card?.suit || null;
export const getRank = (card) => card?.rank || null;
