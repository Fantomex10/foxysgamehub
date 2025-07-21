/*
================================================================================
|
| FILE: src/hooks/useGameActions.js
|
| DESCRIPTION: The Action Dispatcher.
| - Centralizes all action logic for both online and offline modes.
| - Ensures the latest gameState is used for gameService calls.
| - Incorporates online logic for playCard, drawCard, and declareSuit.
| - Includes actions for starting, joining, and creating games.
|
================================================================================
*/
import { useCallback, useContext } from 'react';
import { useGameEngine } from '../context/GameProvider';
import { FirebaseContext } from '../context/FirebaseProvider'; // To access db and userId
import { useGameState } from './useGameState'; // To get the latest game state
import * as gameService from '../services/gameService'; // For online mode actions

/**
 * Custom hook to provide centralized game action dispatching.
 * This hook is responsible for directing actions to either
 * the local GameEngine (for offline play) or the gameService (for online play).
 * It ensures that gameService calls always receive the most current game state.
 */
export const useGameActions = () => {
    const engine = useGameEngine(); // Provides access to the GameEngine instance
    const { db, userId } = useContext(FirebaseContext); // Get Firebase db and current user ID
    const gameState = useGameState(); // This hook gets the latest game state from the engine

    // Destructure necessary data from gameState for convenience and to ensure reactivity
    const gameId = gameState?.id;
    const gameMode = gameState?.gameMode; // Assuming gameMode is part of gameState now
    const currentTurn = gameState?.gameData?.currentTurn;
    const currentUserId = gameState?.currentUserId; // The user ID currently playing in the game

    // --- Core Gameplay Actions ---

    /**
     * Dispatches a PLAY_CARD action.
     * In offline mode, dispatches to the local GameEngine.
     * In online mode, calls the gameService to update Firestore.
     * @param {object} card - The card object to play (e.g., {rank: 'A', suit: 'hearts'})
     * @param {string} [declaredSuit] - Optional: The suit declared if an 8 is played.
     */
    const playCard = useCallback(async (card, declaredSuit = null) => {
        if (gameMode === 'offline') {
            console.log(`[useGameActions] Offline: Playing card: ${card.suit}${card.rank}`);
            engine.dispatch({ type: 'PLAY_CARD', payload: { userId: currentUserId, card, declaredSuit } });
        } else if (gameMode === 'online') {
            console.log(`[useGameActions] Online: Attempting to play card: ${card.suit}${card.rank} for game ${gameId}`);
            try {
                // Pass the latest gameId, currentUserId, card, declaredSuit, and gameData
                await gameService.playCard(db, gameId, currentUserId, card, declaredSuit, gameState.gameData);
                console.log(`[useGameActions] Online: Card played successfully.`);
            } catch (error) {
                console.error(`[useGameActions] Online: Error playing card:`, error);
                // TODO: Implement user-facing error handling (e.g., a toast notification)
            }
        }
    }, [engine, gameMode, db, gameId, currentUserId, gameState]);

    /**
     * Dispatches a DRAW_CARD action.
     * In offline mode, dispatches to the local GameEngine.
     * In online mode, calls the gameService to update Firestore.
     */
    const drawCard = useCallback(async () => {
        if (gameMode === 'offline') {
            console.log('[useGameActions] Offline: Drawing card.');
            engine.dispatch({ type: 'DRAW_CARD', payload: { userId: currentUserId } });
        } else if (gameMode === 'online') {
            console.log(`[useGameActions] Online: Attempting to draw card for game ${gameId}`);
            try {
                // Pass the latest gameId, currentUserId, and gameData
                await gameService.drawCard(db, gameId, currentUserId, gameState.gameData);
                console.log(`[useGameActions] Online: Card drawn successfully.`);
            } catch (error) {
                console.error(`[useGameActions] Online: Error drawing card:`, error);
                // TODO: Implement user-facing error handling
            }
        }
    }, [engine, gameMode, db, gameId, currentUserId, gameState]);

    /**
     * Dispatches a DECLARE_SUIT action (used after playing an 8).
     * In offline mode, dispatches to the local GameEngine.
     * In online mode, calls the gameService to update Firestore.
     * @param {string} chosenSuit - The suit declared by the player.
     */
    const declareSuit = useCallback(async (chosenSuit) => {
        if (gameMode === 'offline') {
            console.log(`[useGameActions] Offline: Declaring suit: ${chosenSuit}`);
            engine.dispatch({ type: 'DECLARE_SUIT', payload: { chosenSuit } });
        } else if (gameMode === 'online') {
            console.log(`[useGameActions] Online: Attempting to declare suit: ${chosenSuit} for game ${gameId}`);
            try {
                // This action might be part of the playCard flow for an '8',
                // or a separate action depending on gameService implementation.
                // Assuming it's a separate call for clarity, similar to how it was in CrazyEightsTable.
                // Note: The gameService.declareSuit might need more context like the card that was played.
                // For now, assuming it takes gameId, currentUserId, and the suit.
                await gameService.declareSuit(db, gameId, currentUserId, chosenSuit);
                console.log(`[useGameActions] Online: Suit declared successfully.`);
            } catch (error) {
                console.error(`[useGameActions] Online: Error declaring suit:`, error);
                // TODO: Implement user-facing error handling
            }
        }
    }, [engine, gameMode, db, gameId, currentUserId]);


    // --- Game Management Actions (e.g., from Lobby or Waiting Room) ---

    /**
     * Dispatches a START_GAME action.
     * In offline mode, dispatches to the local GameEngine.
     * In online mode, calls the gameService to update Firestore.
     */
    const startGame = useCallback(async () => {
        if (gameMode === 'offline') {
            console.log('[useGameActions] Offline: Starting game.');
            engine.dispatch({ type: 'START_GAME' });
        } else if (gameMode === 'online') {
            console.log(`[useGameActions] Online: Attempting to start game ${gameId}`);
            try {
                await gameService.startGame(db, gameId); // Assuming gameService.startGame takes db and gameId
                console.log(`[useGameActions] Online: Game started successfully.`);
            } catch (error) {
                console.error(`[useGameActions] Online: Error starting game:`, error);
                // TODO: Handle error
            }
        }
    }, [engine, gameMode, db, gameId]);

    /**
     * Dispatches a JOIN_GAME action.
     * Only applicable for online mode.
     * @param {string} gameIdToJoin - The ID of the game to join.
     */
    const joinGame = useCallback(async (gameIdToJoin) => {
        if (gameMode === 'offline') {
            console.log(`[useGameActions] Offline: Cannot join game in offline mode. Create a new offline game instead.`);
            // Offline mode might handle this differently, e.g., create a new local game.
        } else if (gameMode === 'online') {
            console.log(`[useGameActions] Online: Attempting to join game ${gameIdToJoin}`);
            try {
                // gameService.joinGame should handle adding the current user to the game
                await gameService.joinGame(db, gameIdToJoin, userId); // Use userId from FirebaseContext for joining
                console.log(`[useGameActions] Online: Joined game ${gameIdToJoin} successfully.`);
            } catch (error) {
                console.error(`[useGameActions] Online: Error joining game:`, error);
                // TODO: Handle error
            }
        }
    }, [gameMode, db, userId]);

    /**
     * Dispatches a CREATE_GAME action.
     * In offline mode, dispatches to the local GameEngine.
     * In online mode, calls the gameService to create a new game in Firestore.
     * @param {string} gameType - The type of game to create (e.g., 'crazy_eights').
     * @returns {Promise<string|void>} The ID of the newly created game, or void for offline.
     */
    const createGame = useCallback(async (gameType) => {
        if (gameMode === 'offline') {
            console.log(`[useGameActions] Offline: Creating new offline game of type ${gameType}.`);
            engine.dispatch({ type: 'CREATE_GAME', payload: { gameType, userId: currentUserId } });
        } else if (gameMode === 'online') {
            console.log(`[useGameActions] Online: Attempting to create online game of type ${gameType}`);
            try {
                // gameService.createGame should handle adding the current user as the host
                const newGameId = await gameService.createGame(db, gameType, userId); // Use userId from FirebaseContext for creating
                console.log(`[useGameActions] Online: Game ${newGameId} created successfully.`);
                return newGameId; // Return the new game ID for navigation/state update
            } catch (error) {
                console.error(`[useGameActions] Online: Error creating game:`, error);
                // TODO: Handle error
            }
        }
    }, [engine, gameMode, db, userId, currentUserId]);

    // --- Rematch Actions (Online Only) ---
    // These were already well-implemented in your provided file, just ensuring they use latest state.

    const readyForRematch = useCallback(() => {
        // gameId and userId are already available from useGameState and FirebaseContext respectively
        if (gameMode !== 'online' || !gameId || !userId) return;

        const isReady = gameState.playersReadyForNextGame?.includes(userId);
        gameService.setPlayerReadyForNextGame(db, gameId, userId, !isReady);
    }, [gameMode, db, userId, gameId, gameState]);

    const startRematch = useCallback(async () => {
        // gameId and userId are already available
        if (gameMode !== 'online' || !gameId || !userId) return;
        try {
            await gameService.startRematch(db, gameId, userId);
        } catch (error) {
            console.error("Failed to start rematch:", error);
            // TODO: Handle error
        }
    }, [gameMode, db, userId, gameId]);

    return {
        playCard,
        drawCard,
        declareSuit,
        startGame,
        joinGame,
        createGame,
        readyForRematch,
        startRematch,
    };
};