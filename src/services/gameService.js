/*
================================================================================
|
| FILE: src/services/gameService.js
|
| DESCRIPTION: The Courier (Updated with Secure Data Structure).
| - This version separates public `gameState` from private `privateState`.
| - All functions now correctly read from and write to this new structure.
| - This is a critical step for implementing security rules that prevent cheating.
|
================================================================================
*/

import {
    collection,
    addDoc,
    serverTimestamp,
    doc,
    updateDoc,
    arrayUnion,
    getDoc,
    deleteDoc,
    arrayRemove,
    runTransaction,
    Timestamp
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { createShuffledDeck, dealCards, applyCrazyEightsCardLogic, getNextTurn } from '../games/crazy_eights/logic';

// --- Helper Functions ---
const getAppId = () => typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const getGamesCollection = (db) => collection(db, `artifacts/${getAppId()}/public/data/games`);
const getGameDocRef = (db, gameId) => doc(db, `artifacts/${getAppId()}/public/data/games`, gameId);
const generateJoinCode = () => Math.floor(1000 + Math.random() * 9000).toString();

// --- Game Management Functions ---

export const createGame = async (db, userId, options) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated.");

    const hostPlayer = { id: userId, name: options.playerName || 'Player 1', isHost: true };

    // ** NEW SECURE STRUCTURE **
    const newGame = {
        // Publicly visible game state
        gameState: {
            host: userId,
            status: 'waiting',
            players: [hostPlayer],
            spectators: [],
            playersReady: [],
            createdAt: serverTimestamp(),
            gameName: options.gameName || `${options.playerName}'s Game`,
            gameType: options.gameType || 'crazy_eights',
            maxPlayers: options.maxPlayers || 4,
            joinCode: generateJoinCode(),
            gameOptions: options.gameOptions || {},
        },
        // Private data, only accessible via security rules
        privateState: {
            playersHands: {}, // Initially empty
        }
    };

    const gamesCollection = getGamesCollection(db);
    const docRef = await addDoc(gamesCollection, newGame);
    return docRef.id;
};

export const joinGame = async (db, userId, playerName, gameId) => {
    const gameRef = getGameDocRef(db, gameId);
    return runTransaction(db, async (transaction) => {
        const gameSnap = await transaction.get(gameRef);
        if (!gameSnap.exists()) throw new Error("Game does not exist.");

        const gameData = gameSnap.data().gameState; // Read from gameState
        if (gameData.players.some(p => p.id === userId)) return; // Already in game
        if (gameData.players.length >= gameData.maxPlayers) throw new Error("Game is full.");
        if (gameData.status !== 'waiting') throw new Error("Game has already started.");

        const newPlayer = { id: userId, name: playerName || `Player ${gameData.players.length + 1}`, isHost: false };
        // Update the players array inside gameState
        transaction.update(gameRef, { 'gameState.players': arrayUnion(newPlayer) });
    });
};

export const quitGame = async (db, userId, gameId) => {
    const gameRef = getGameDocRef(db, gameId);
    return runTransaction(db, async (transaction) => {
        const gameSnap = await transaction.get(gameRef);
        if (!gameSnap.exists()) return;

        const gameData = gameSnap.data().gameState;
        const playerToRemove = gameData.players.find(p => p.id === userId);

        if (gameData.host === userId && gameData.players.length <= 1) {
            transaction.delete(gameRef);
        } else {
            const updates = {};
            if (playerToRemove) {
                updates['gameState.players'] = arrayRemove(playerToRemove);
                updates['gameState.playersReady'] = arrayRemove(userId);
                updates[`privateState.playersHands.${userId}`] = deleteField(); // Remove their hand
            }
            if (Object.keys(updates).length > 0) {
                 transaction.update(gameRef, updates);
            }
        }
    });
};

export const setPlayerReady = async (db, gameId, userId, isReady) => {
    const gameRef = getGameDocRef(db, gameId);
    const updateAction = isReady ? arrayUnion(userId) : arrayRemove(userId);
    await updateDoc(gameRef, { 'gameState.playersReady': updateAction });
};

export const startGame = async (db, gameId, hostId) => {
    const gameRef = getGameDocRef(db, gameId);
    await runTransaction(db, async (transaction) => {
        const gameSnap = await transaction.get(gameRef);
        if (!gameSnap.exists()) throw new Error("Game not found.");

        const gameData = gameSnap.data().gameState;
        if (gameData.host !== hostId) throw new Error("Only the host can start the game.");
        if (gameData.status !== 'waiting') throw new Error("Game has already started.");
        if (gameData.players.length < 2) throw new Error("You need at least 2 players to start.");

        // ** DEALING WITH NEW STRUCTURE **
        const shuffledDeck = createShuffledDeck(gameData.players.length);
        const { hands, remainingDeck: deckAfterDealing } = dealCards(shuffledDeck, gameData.players);
        const firstCard = deckAfterDealing.shift();
        const firstPlayer = gameData.players[0];

        // Prepare updates for both public and private state
        transaction.update(gameRef, {
            'gameState.status': 'playing',
            'gameState.drawPile': deckAfterDealing,
            'gameState.discardPile': [firstCard],
            'gameState.currentTurn': firstPlayer.id,
            'gameState.currentSuit': firstCard.rank === '8' ? null : firstCard.suit,
            'gameState.gameDirection': 1,
            'gameState.gameMessage': `Game started! It's ${firstPlayer.name}'s turn.`,
            'gameState.gameHistory': arrayUnion({ timestamp: Timestamp.now(), message: "Game has started." }),
            'gameState.lastPlayedCard': firstCard,
            'privateState.playersHands': hands, // Set all hands in the private state
        });
    });
};
