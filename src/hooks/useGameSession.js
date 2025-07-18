// =================================================================================
// FILE: src/hooks/useGameSession.js
// =================================================================================
import { useState, useEffect, useCallback, useContext } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { FirebaseContext } from '../context/FirebaseProvider';
import * as gameService from '../services/gameService';

const getAppId = () => typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

export const useGameSession = () => {
    const { db, userId } = useContext(FirebaseContext);
    const [currentGameId, setCurrentGameIdState] = useState(() => localStorage.getItem('foxytcg-lastGameId'));
    const [gameData, setGameData] = useState(null);
    const [isLoading, setIsLoading] = useState(!!currentGameId);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState(null);

    const clearClientSession = useCallback(() => {
        setCurrentGameIdState(null);
        setGameData(null);
        setIsLoading(false);
        setIsCreating(false);
    }, []);

    const setCurrentGameId = useCallback((gameId) => {
        setError(null);
        if (gameId) {
            setIsLoading(true);
            setGameData(null);
            setCurrentGameIdState(gameId);
        } else {
            clearClientSession();
        }
    }, [clearClientSession]);

    useEffect(() => {
        if (!currentGameId || !db) {
            if (isLoading) setIsLoading(false);
            if (isCreating) setIsCreating(false);
            return;
        }

        const gameDocRef = doc(db, `artifacts/${getAppId()}/public/data/games`, currentGameId);

        const unsubscribe = onSnapshot(gameDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setIsCreating(false);
                const data = { id: docSnap.id, ...docSnap.data() };
                const isPlayerInGame = data.players.some(p => p.id === userId);
                setGameData(data);
                setError(null);

                if (isLoading && (isPlayerInGame || (data.status === 'finished' && data.nextGameId))) {
                     setIsLoading(false);
                }

                if (data.status === 'finished' && data.nextGameId) {
                    setCurrentGameId(data.nextGameId);
                    localStorage.setItem('foxytcg-lastGameId', data.nextGameId);
                    return;
                }

                if (userId && !isPlayerInGame && !isLoading && data.status !== 'finished') {
                    console.warn("Kicked from game or player removed, returning to lobby.");
                    setError("You are no longer in this game.");
                    localStorage.removeItem('foxytcg-lastGameId');
                    clearClientSession();
                }

            } else {
                if (!isCreating) {
                    setError("Game not found. It may have been deleted by the host.");
                    localStorage.removeItem('foxytcg-lastGameId');
                    clearClientSession();
                }
            }
        }, (err) => {
            console.error("Error listening to game document:", err);
            setError("Failed to connect to the game.");
            setIsLoading(false);
            setIsCreating(false);
        });

        return () => unsubscribe();
    }, [currentGameId, db, userId, isLoading, isCreating, clearClientSession, setCurrentGameId]);

    const createGame = useCallback(async (options) => {
        if (!db || !userId) return;
        setIsLoading(true);
        setIsCreating(true);
        setError(null);
        try {
            const newGameId = await gameService.createGame(db, userId, options);
            setCurrentGameId(newGameId);
            localStorage.setItem('foxytcg-lastGameId', newGameId);
        } catch (err) {
            console.error("Error creating game:", err);
            setError(err.message || "Could not create game.");
            setIsLoading(false);
            setIsCreating(false);
        }
    }, [db, userId, setCurrentGameId]);

    const joinGame = useCallback(async (gameId, playerName) => {
        if (!db || !userId) return;
        setIsLoading(true);
        setIsCreating(false);
        setError(null);
        try {
            await gameService.joinGame(db, userId, playerName, gameId);
            setCurrentGameId(gameId);
            localStorage.setItem('foxytcg-lastGameId', gameId);
        } catch (err) {
            console.error("Error joining game:", err);
            setError(err.message || "Could not join game.");
            setIsLoading(false);
            localStorage.removeItem('foxytcg-lastGameId');
        }
    }, [db, userId, setCurrentGameId]);

    // +++ MODIFIED: This is now a "soft" exit that keeps the rejoin option.
    const returnToLobby = useCallback(() => {
        clearClientSession();
    }, [clearClientSession]);

    // +++ MODIFIED: This is the "hard" quit that removes the player from the game.
    const quitGame = useCallback(async () => {
        const gameIdToLeave = currentGameId;
        localStorage.removeItem('foxytcg-lastGameId');
        clearClientSession();

        if (gameIdToLeave && db && userId) {
            try {
                await gameService.quitGame(db, userId, gameIdToLeave);
            } catch (err) {
                console.warn("Error on server while quitting game (may be benign):", err);
            }
        }
    }, [currentGameId, db, userId, clearClientSession]);

    return { gameData, currentGameId, isLoading, error, createGame, joinGame, returnToLobby, quitGame };
};
