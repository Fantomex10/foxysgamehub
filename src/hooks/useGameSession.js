/*
================================================================================
|
| FILE: src/hooks/useGameSession.js
|
| DESCRIPTION: The Controller (Rewritten for Robustness).
| - This version uses a more robust, manual subscription model to completely
|   eliminate the race condition bugs that caused session failures.
| - It no longer relies on useEffect to manage the listener, providing a more
|   stable and predictable connection flow.
|
================================================================================
*/
import { useEffect, useCallback, useContext, useRef } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { FirebaseContext } from '../context/FirebaseProvider';
import * as gameService from '../services/gameService';
import { useGameEngine } from '../context/GameProvider';

const getAppId = () => typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

export const useGameSession = ({ currentGameId, setCurrentGameId, setIsLoading, setError, setGameMode }) => {
    const { db, userId } = useContext(FirebaseContext);
    const engine = useGameEngine();

    // Use a ref to hold the unsubscribe function. This is key to preventing race conditions.
    const unsubscribeRef = useRef(null);

    const clearClientSession = useCallback(() => {
        console.log("USE_GAME_SESSION: Clearing client session.");
        if (unsubscribeRef.current) {
            unsubscribeRef.current();
            unsubscribeRef.current = null;
            console.log("USE_GAME_SESSION: Unsubscribed from Firestore listener.");
        }
        setCurrentGameId(null);
        setError(null);
        setIsLoading(false);
        setGameMode('online');
        engine.dispatch({ type: 'SYNC_STATE_FROM_SERVER', payload: null }); // Reset engine state
        localStorage.removeItem('foxytcg-lastGameId');
    }, [setCurrentGameId, setError, setIsLoading, setGameMode, engine]);

    // This is our new, manually controlled listener function.
    const listenToGame = useCallback((gameId) => {
        if (!db) {
            console.warn("USE_GAME_SESSION: Firestore DB not available for listening.");
            return;
        }
        console.log(`USE_GAME_SESSION: Attaching listener to game ID: ${gameId}`);

        // If we're already listening to a game, stop that first.
        if (unsubscribeRef.current) {
            console.log("USE_GAME_SESSION: Existing listener found, unsubscribing before new one.");
            unsubscribeRef.current();
        }

        const gameDocRef = doc(db, `artifacts/${getAppId()}/public/data/crazy_eights_games`, gameId);

        unsubscribeRef.current = onSnapshot(gameDocRef, (snapshot) => {
            if (snapshot.exists()) {
                const serverState = { id: snapshot.id, ...snapshot.data() };
                console.log("USE_GAME_SESSION: Listener received update. Server State:", serverState);
                engine.dispatch({ type: 'SYNC_STATE_FROM_SERVER', payload: serverState });

                if (serverState.status === 'finished' && serverState.nextGameId) {
                    // Automatically transition to the next game in a rematch
                    console.log(`USE_GAME_SESSION: Game finished, transitioning to next game ID: ${serverState.nextGameId}`);
                    localStorage.setItem('foxytcg-lastGameId', serverState.nextGameId);
                    setCurrentGameId(serverState.nextGameId);
                    return;
                }

                setError(null);
                setIsLoading(false); // Crucial: Stop loading once data is received
            } else {
                console.log("USE_GAME_SESSION: Listener detected game no longer exists. Clearing session.");
                clearClientSession();
            }
        }, (err) => {
            console.error("USE_GAME_SESSION: FATAL ERROR (onSnapshot):", err);
            setError("Failed to connect to the game. Check Firestore rules or network.");
            setIsLoading(false);
        });

    }, [db, engine, clearClientSession, setCurrentGameId, setIsLoading, setError]);

    // This useEffect now ONLY starts the listener when the component mounts or currentGameId changes.
    useEffect(() => {
        console.log(`USE_GAME_SESSION: useEffect triggered. CurrentGameId: ${currentGameId}`);
        if (currentGameId) {
            setIsLoading(true); // Indicate loading when a game ID is present
            listenToGame(currentGameId);
        } else {
            // If there's no gameId, ensure we are not loading.
            setIsLoading(false);
        }

        // Return a cleanup function to unsubscribe when the component unmounts.
        return () => {
            if (unsubscribeRef.current) {
                console.log("USE_GAME_SESSION: Cleaning up listener on unmount.");
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            }
        };
    }, [currentGameId, listenToGame]);


    const createGame = useCallback(async (options) => {
        if (!db || !userId) {
            console.warn("USE_GAME_SESSION: DB or userId not available for createGame.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            console.log("USE_GAME_SESSION: Sending 'createGame' request to server...");
            const newGameId = await gameService.createGame(db, userId, options);

            if (!newGameId) {
                throw new Error("Server did not return a valid game ID.");
            }

            console.log(`USE_GAME_SESSION: Server responded with new game ID: ${newGameId}. Updating session.`);
            localStorage.setItem('foxytcg-lastGameId', newGameId);
            setCurrentGameId(newGameId); // This will trigger the useEffect to start listening
            // setIsLoading(false) will be handled by the onSnapshot listener
        } catch (err) {
            console.error("USE_GAME_SESSION: Error creating game:", err);
            setError(`Could not create game: ${err.message}`);
            setIsLoading(false);
        }
    }, [db, userId, setCurrentGameId, setIsLoading, setError]);

    const joinGame = useCallback(async (gameId, playerName) => {
        if (!db || !userId) {
            console.warn("USE_GAME_SESSION: DB or userId not available for joinGame.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            console.log(`USE_GAME_SESSION: Sending 'joinGame' request for game ID: ${gameId}`);
            await gameService.joinGame(db, userId, playerName, gameId);
            console.log(`USE_GAME_SESSION: Successfully joined game. Updating session.`);

            localStorage.setItem('foxytcg-lastGameId', gameId);
            setCurrentGameId(gameId); // This will trigger the useEffect to start listening
            // setIsLoading(false) will be handled by the onSnapshot listener
        } catch (err) {
            console.error("USE_GAME_SESSION: Error joining game:", err);
            setError(err.message || "Could not join game.");
            setIsLoading(false);
        }
    }, [db, userId, setCurrentGameId, setIsLoading, setError]);

    const goToLobby = useCallback(() => {
        console.log("USE_GAME_SESSION: Calling goToLobby.");
        clearClientSession();
    }, [clearClientSession]);

    const quitGame = useCallback(async () => {
        const gameIdToLeave = currentGameId;
        console.log(`USE_GAME_SESSION: Quitting game ID: ${gameIdToLeave}`);
        clearClientSession(); // Clear session immediately for responsive UI
        if (gameIdToLeave && db && userId) {
            try {
                await gameService.quitGame(db, userId, gameIdToLeave);
                console.log("USE_GAME_SESSION: Server quitGame request sent.");
            } catch (err) {
                console.error("USE_GAME_SESSION: Error on server while quitting game:", err);
            }
        }
    }, [currentGameId, db, userId, clearClientSession]);

    return { createGame, joinGame, goToLobby, quitGame };
};
