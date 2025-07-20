// ========================================================================
// FILE: src/engine/GameEngine.js (Refactored)
// ========================================================================
/*
DESCRIPTION:
This is the refactored GameEngine. It is now a generic, "plug-and-play"
state machine for turn-based card games.

KEY CHANGES:
1.  REMOVED direct import of 'crazy_eights/logic'. The engine is no longer
    aware of any specific game.
2.  ADDED a private '#gameLogic' property to hold the rules for the
    currently loaded game.
3.  MODIFIED the constructor to REQUIRE a 'gameLogic' object upon
    instantiation. The engine is non-functional without it.
4.  UPDATED the '#reducer' to delegate all game rule decisions (dealing,
    playing cards, special logic) to the methods on 'this.#gameLogic'.
*/

export class GameEngine {
    #state;
    #listeners = new Set();
    #gameLogic; // Holds the logic for the specific game (e.g., Crazy Eights)

    /**
     * Initializes the Game Engine.
     * @param {object} gameLogic - An object containing all the pure functions for a specific game's rules.
     * @param {object | null} initialState - An optional initial state for the game.
     */
    constructor(gameLogic, initialState = null) {
        if (!gameLogic || typeof gameLogic !== 'object') {
            throw new Error("GameEngine: A 'gameLogic' object must be provided to the constructor.");
        }
        this.#gameLogic = gameLogic;
        this.#state = initialState || this.#getInitialState();
        console.log("GameEngine Initialized with game logic:", this.#gameLogic.name || 'Unnamed Logic');
    }

    getState() {
        return this.#state;
    }

    subscribe(listener) {
        this.#listeners.add(listener);
        return () => this.#listeners.delete(listener);
    }

    dispatch(action) {
        console.log("GAME_ENGINE: ACTION DISPATCHED:", action.type, action.payload);
        const nextState = this.#reducer(this.#state, action);
        this.#state = nextState;
        this.#listeners.forEach(listener => listener(this.#state));
        console.log("GAME_ENGINE: New State after dispatch:", this.#state);
    }

    #getInitialState() {
        return {
            id: null,
            status: 'lobby', // lobby, waiting, active, choosing_suit, finished
            players: [],
            playersHands: {},
            drawPile: [],
            discardPile: [],
            currentTurn: null,
            currentSuit: null, // For Crazy Eights '8's
            gameDirection: 1, // 1 for forward, -1 for reverse
            gameMessage: "Waiting for game to start.",
            gameHistory: [],
            winner: null,
            maxPlayers: 4, // Default max players
        };
    }

    #reducer(state, action) {
        // console.log("GAME_ENGINE: Reducer processing action:", action.type, "Current State:", state); // Too verbose, use dispatch log

        switch (action.type) {
            case 'START_GAME': {
                console.log("GAME_ENGINE: Reducer - START_GAME action.");
                const { players } = state;
                const deck = this.#gameLogic.createShuffledDeck(players.length);
                const { hands, remainingDeck } = this.#gameLogic.dealCards(deck, players);

                // Flip the first card to start the discard pile
                const discardPile = [remainingDeck.shift()];
                const drawPile = remainingDeck;
                const firstPlayer = players[0].id;

                const nextState = {
                    ...state,
                    status: 'playing',
                    playersHands: hands,
                    drawPile,
                    discardPile,
                    currentTurn: firstPlayer,
                    currentSuit: this.#gameLogic.getSuit(discardPile[0]), // Set initial suit from first card
                    gameMessage: `${players.find(p => p.id === firstPlayer).name}'s turn to start!`,
                };
                console.log("GAME_ENGINE: Reducer - START_GAME nextState:", nextState);
                return nextState;
            }

            case 'PLAY_CARD': {
                console.log("GAME_ENGINE: Reducer - PLAY_CARD action. Payload:", action.payload);
                const { player, card } = action.payload;
                const { players, currentTurn, playersHands, discardPile, drawPile, gameDirection, currentSuit } = state;

                // Basic validation (should ideally be done before dispatch for UI feedback)
                if (player.id !== currentTurn) {
                    console.warn("GAME_ENGINE: Not your turn to play card!");
                    return state;
                }

                // DELEGATE VALIDATION: Ask the game logic if this move is valid.
                if (!this.#gameLogic.isValidPlay(card, discardPile[0], currentSuit)) {
                    console.warn("GAME_ENGINE: Invalid play according to game logic!");
                    return state;
                }

                // Update hand and discard pile
                const newHand = playersHands[player.id].filter(c => !(c.suit === card.suit && c.rank === card.rank));
                const newPlayersHands = { ...playersHands, [player.id]: newHand };
                const newDiscardPile = [card, ...discardPile];

                // Check for a winner
                if (newHand.length === 0) {
                    const nextState = {
                        ...state,
                        status: 'finished',
                        winner: player.id,
                        playersHands: newPlayersHands,
                        discardPile: newDiscardPile,
                        gameMessage: `${player.name} wins the game!`,
                        currentTurn: null, // No turn when finished
                    };
                    console.log("GAME_ENGINE: Reducer - PLAY_CARD (Winner) nextState:", nextState);
                    return nextState;
                }

                // DELEGATE SPECIAL LOGIC: Ask the game logic to apply card effects.
                const logicResult = this.#gameLogic.applyCardLogic(card, {
                    players,
                    gameDirection,
                    currentTurn,
                    playersHands: newPlayersHands, // Pass the updated hands
                    drawPile // Pass current drawPile for logic that might use it (e.g., draw 2)
                });
                console.log("GAME_ENGINE: Reducer - PLAY_CARD logicResult from gameLogic:", logicResult);


                // Handle Wild Card (e.g., Crazy Eights '8')
                if (this.#gameLogic.getRank(card) === '8') {
                    const nextState = {
                        ...state,
                        status: 'choosing_suit', // Game state changes to choosing suit
                        playersHands: newPlayersHands,
                        discardPile: newDiscardPile,
                        gameMessage: `${player.name} played a wild card. Choose a suit.`,
                        // Note: currentTurn does NOT change yet, player needs to choose suit
                        currentTurn: player.id, // Player who played 8 still has turn to choose suit
                        lastPlayedCard: card, // Update last played card
                    };
                    console.log("GAME_ENGINE: Reducer - PLAY_CARD (Wild Card) nextState:", nextState);
                    return nextState;
                }

                // Normal card play or other special card effects handled by logicResult
                const nextState = {
                    ...state,
                    playersHands: logicResult.playersHands,
                    discardPile: newDiscardPile,
                    drawPile: logicResult.drawPile,
                    currentTurn: logicResult.nextTurn,
                    gameDirection: logicResult.gameDirection,
                    currentSuit: this.#gameLogic.getSuit(card), // Set current suit based on played card
                    gameMessage: logicResult.gameMessage || `${players.find(p => p.id === logicResult.nextTurn)?.name}'s turn.`,
                    lastPlayedCard: card, // Update last played card
                };
                console.log("GAME_ENGINE: Reducer - PLAY_CARD (Normal) nextState:", nextState);
                return nextState;
            }

            case 'DECLARE_SUIT': {
                console.log("GAME_ENGINE: Reducer - DECLARE_SUIT action. Payload:", action.payload);
                const { suit } = action.payload;
                const { players, currentTurn, gameDirection } = state;

                // If suit is null, it means cancel. Revert to previous state or specific cancel logic.
                // For now, if suit is null, we assume the player is cancelling the suit choice
                // and the turn should not advance. The player might need to pick up a card or re-play.
                // This logic might need refinement based on game rules for 'cancel'.
                if (suit === null) {
                    console.warn("GAME_ENGINE: Suit declaration cancelled. State remains as 'choosing_suit'.");
                    // Optionally, you might want to revert the card play or force a draw here.
                    // For now, just keep status as 'choosing_suit' and currentTurn as is.
                    return {
                        ...state,
                        gameMessage: `${state.players.find(p => p.id === currentTurn)?.name} cancelled suit choice. Choose a suit.`,
                        status: 'choosing_suit', // Remain in choosing_suit status
                    };
                }


                // DELEGATE TURN LOGIC
                const nextTurn = this.#gameLogic.getNextTurn(currentTurn, players, gameDirection);

                const nextState = {
                    ...state,
                    status: 'playing', // Back to playing status
                    currentSuit: suit,
                    currentTurn: nextTurn,
                    gameMessage: `Suit set to ${suit}. ${players.find(p => p.id === nextTurn)?.name}'s turn.`,
                };
                console.log("GAME_ENGINE: Reducer - DECLARE_SUIT nextState:", nextState);
                return nextState;
            }

            case 'DRAW_CARD': {
                console.log("GAME_ENGINE: Reducer - DRAW_CARD action. Payload:", action.payload);
                const { player } = action.payload;
                let { drawPile, discardPile, playersHands } = state;

                if (drawPile.length === 0) {
                    // Reshuffle discard pile into new draw pile
                    const topCard = discardPile.shift(); // Keep the top card
                    drawPile = this.#gameLogic.createShuffledDeck(1, discardPile); // Use a simple shuffle
                    discardPile = [topCard];
                    console.log("GAME_ENGINE: Reducer - Reshuffled discard pile into draw pile.");
                }

                if (drawPile.length > 0) {
                    const drawnCard = drawPile.shift();
                    const newHand = [...playersHands[player.id], drawnCard];
                    const newPlayersHands = { ...playersHands, [player.id]: newHand };
                    const nextTurn = this.#gameLogic.getNextTurn(state.currentTurn, state.players, state.gameDirection);

                    const nextState = {
                        ...state,
                        drawPile,
                        discardPile,
                        playersHands: newPlayersHands,
                        currentTurn: nextTurn, // Move to next player after drawing
                        gameMessage: `${player.name} drew a card. ${state.players.find(p => p.id === nextTurn)?.name}'s turn.`,
                    };
                    console.log("GAME_ENGINE: Reducer - DRAW_CARD nextState:", nextState);
                    return nextState;
                }

                console.warn("GAME_ENGINE: Reducer - No cards to draw after reshuffle attempt.");
                return state; // No cards to draw
            }


            // --- Engine-Level Actions (No Game Logic Needed) ---
            case 'SYNC_STATE_FROM_SERVER': {
                console.log("GAME_ENGINE: Reducer - SYNC_STATE_FROM_SERVER action. Payload:", action.payload);
                const nextState = action.payload ? { ...action.payload } : this.#getInitialState();
                console.log("GAME_ENGINE: Reducer - SYNC_STATE_FROM_SERVER nextState:", nextState);
                return nextState;
            }

            case 'SETUP_OFFLINE_GAME': {
                console.log("GAME_ENGINE: Reducer - SETUP_OFFLINE_GAME action. Payload:", action.payload);
                const { humanPlayer, botPlayers } = action.payload;
                const allPlayers = [humanPlayer, ...botPlayers];
                const nextState = {
                    ...this.#getInitialState(),
                    id: `offline_${Date.now()}`,
                    status: 'waiting',
                    players: allPlayers,
                    gameMessage: "Offline game ready. Click Start."
                };
                console.log("GAME_ENGINE: Reducer - SETUP_OFFLINE_GAME nextState:", nextState);
                return nextState;
            }

            default: {
                console.warn("GAME_ENGINE: Reducer - Unknown action type:", action.type);
                return state;
            }
        }
    }
}
