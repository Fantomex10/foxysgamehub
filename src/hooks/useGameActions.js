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
import { FirebaseContext } from '../context/FirebaseProvider';
import { useGameState } from './useGameState';
import * as gameService from '../services/gameService';

export const useGameActions = (gameMode) => {
    const engine = useGameEngine();
    const { db, userId } = useContext(FirebaseContext);
    const gameState = useGameState();

    const gameId = gameState?.id;

    // --- Core Gameplay Actions ---

    const playCard = useCallback(async (card, declaredSuit = null) => {
        if (gameMode === 'offline') {
            console.log(`[useGameActions] Offline: Playing card: ${card.suit}${card.rank}`);
            engine.dispatch({ type: 'PLAY_CARD', payload: { userId, card, declaredSuit } });
        } else if (gameMode === 'online') {
            console.log(`[useGameActions] Online: Attempting to play card: ${card.rank} of ${card.suit} for game ${gameId}`);
            if (!userId) {
                console.error("[useGameActions] FATAL: User ID is missing. Cannot play card.");
                return;
            }
            try {
                await gameService.playCard(db, gameId, userId, card, declaredSuit, gameState);
                console.log(`[useGameActions] Online: Card played successfully.`);
            } catch (error) {
                console.error(`[useGameActions] Online: Error playing card:`, error);
            }
        }
    }, [engine, gameMode, db, gameId, userId, gameState]);

    const drawCard = useCallback(async () => {
        if (gameMode === 'offline') {
            console.log('[useGameActions] Offline: Drawing card.');
            engine.dispatch({ type: 'DRAW_CARD', payload: { userId } });
        } else if (gameMode === 'online') {
            console.log(`[useGameActions] Online: Attempting to draw card for game ${gameId}`);
            if (!userId) {
                console.error("[useGameActions] FATAL: User ID is missing. Cannot draw card.");
                return;
            }
            try {
                await gameService.drawCard(db, gameId, userId, gameState);
                console.log(`[useGameActions] Online: Card drawn successfully.`);
            } catch (error) {
                console.error(`[useGameActions] Online: Error drawing card:`, error);
            }
        }
    }, [engine, gameMode, db, gameId, userId, gameState]);

    const declareSuit = useCallback(async (chosenSuit) => {
        console.warn("[useGameActions] declareSuit should be handled by calling playCard with the chosen suit.");
    }, []);

    // --- Game Management Actions ---

    const startGame = useCallback(async () => {
        if (gameMode === 'online') {
            console.log(`[useGameActions] Online: Attempting to start game ${gameId}`);
            try {
                await gameService.startGame(db, gameId, userId);
                console.log(`[useGameActions] Online: Game started successfully.`);
            } catch (error) {
                console.error(`[useGameActions] Online: Error starting game:`, error);
            }
        }
    }, [gameMode, db, gameId, userId]);

    // FIXED: The readyForRematch and startRematch functions have been restored.
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

    return {
        playCard,
        drawCard,
        declareSuit,
        startGame,
        readyForRematch, // Restored
        startRematch,   // Restored
    };
};
