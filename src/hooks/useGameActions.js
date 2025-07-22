/*
================================================================================
|
| FILE: src/hooks/useGameActions.js
|
| DESCRIPTION: The Action Dispatcher (Corrected & Robust).
| - This version fixes multiple critical bugs that prevented actions from being
|   dispatched correctly.
| - It now accepts `gameMode` as a parameter to correctly differentiate between
|   online and offline actions.
| - It uses the correct `userId` from Firebase context.
| - It passes the correct, flat `gameState` object to services.
| - It formats payloads correctly for the offline game engine.
|
================================================================================
*/
import { useCallback, useContext } from 'react';
import { useGameEngine } from '../context/GameProvider';
import { FirebaseContext } from '../context/FirebaseProvider';
import { useGameState } from './useGameState';
import * as gameService from '../services/gameService';

/**
 * Custom hook to provide centralized game action dispatching.
 * This hook is responsible for directing actions to either
 * the local GameEngine (for offline play) or the gameService (for online play).
 * @param {string} gameMode - The current mode of the game ('online' or 'offline').
 */
export const useGameActions = (gameMode) => {
    const engine = useGameEngine();
    const { db, userId } = useContext(FirebaseContext);
    const gameState = useGameState();

    const { id: gameId, players } = gameState;

    // Helper to get the full player object for the current user.
    const getMe = useCallback(() => {
        return players?.find(p => p.id === userId);
    }, [players, userId]);


    const playCard = useCallback(async (card, declaredSuit = null) => {
        if (gameMode === 'offline') {
            const me = getMe();
            if (me) {
                engine.dispatch({ type: 'PLAY_CARD', payload: { player: me, card, declaredSuit } });
            } else {
                console.error("[useGameActions] Offline: Could not find player object for current user.");
            }
        } else if (gameMode === 'online') {
            try {
                // Pass the entire gameState, which the service expects as 'gameData'
                await gameService.playCard(db, gameId, userId, card, declaredSuit, gameState);
            } catch (error) {
                console.error(`[useGameActions] Online: Error playing card:`, error);
            }
        }
    }, [engine, gameMode, db, gameId, userId, gameState, getMe]);


    const drawCard = useCallback(async () => {
        if (gameMode === 'offline') {
            const me = getMe();
            if (me) {
                engine.dispatch({ type: 'DRAW_CARD', payload: { player: me } });
            } else {
                 console.error("[useGameActions] Offline: Could not find player object for current user.");
            }
        } else if (gameMode === 'online') {
            try {
                await gameService.drawCard(db, gameId, userId, gameState);
            } catch (error) {
                console.error(`[useGameActions] Online: Error drawing card:`, error);
            }
        }
    }, [engine, gameMode, db, gameId, userId, gameState, getMe]);


    const declareSuit = useCallback(async (chosenSuit) => {
        if (gameMode === 'offline') {
            engine.dispatch({ type: 'DECLARE_SUIT', payload: { suit: chosenSuit } });
        } else if (gameMode === 'online') {
            // In online mode, the suit choice is tied to the 'playCard' action that played the 8.
            // The card is already on the discard pile. We just need to update the suit and advance the turn.
            // Let's assume a dedicated service function for this for clarity.
             const lastCardPlayed = gameState?.lastPlayedCard;
             if (lastCardPlayed?.rank === '8') {
                 try {
                     // This is a conceptual function. `gameService` needs to be updated to handle this.
                     // For now, we will call playCard again with the original card and the declared suit.
                     // This is how the current gameService is structured.
                     await gameService.playCard(db, gameId, userId, lastCardPlayed, chosenSuit, gameState);
                 } catch (error) {
                     console.error(`[useGameActions] Online: Error declaring suit:`, error);
                 }
             } else {
                 console.warn("[useGameActions] Tried to declare suit without an '8' being played.");
             }
        }
    }, [engine, gameMode, db, gameId, userId, gameState]);


    const readyForRematch = useCallback(() => {
        if (gameMode !== 'online' || !gameId || !userId) return;

        const isReady = gameState.playersReadyForNextGame?.includes(userId);
        gameService.setPlayerReadyForNextGame(db, gameId, userId, !isReady);
    }, [gameMode, db, userId, gameId, gameState]);

    const startRematch = useCallback(async () => {
        if (gameMode !== 'online' || !gameId || !userId) return;
        try {
            await gameService.startRematch(db, gameId, userId);
        } catch (error) {
            console.error("Failed to start rematch:", error);
        }
    }, [gameMode, db, userId, gameId]);

    // Exposing other actions would go here, ensuring they also respect gameMode.
    return {
        playCard,
        drawCard,
        declareSuit,
        readyForRematch,
        startRematch,
    };
};
