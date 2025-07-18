/*
================================================================================
|
| FILE: src/services/gameService.js
|
| DESCRIPTION: The Courier.
| - Adds `movePlayerToSpectator`, `moveSpectatorToPlayer`, and `changeMaxPlayers`
|   to support new host controls and spectator mode.
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
    deleteField,
    Timestamp,
    writeBatch
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { createShuffledDeck, dealCards } from '../games/crazy_eights/logic';

const getAppId = () => typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const getGamesCollection = (db) => collection(db, `artifacts/${getAppId()}/public/data/crazy_eights_games`);
const getGameDocRef = (db, gameId) => doc(db, `artifacts/${getAppId()}/public/data/crazy_eights_games`, gameId);

const generateJoinCode = () => Math.floor(1000 + Math.random() * 9000).toString();

export const createGame = async (db, userId, options) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated.");

    const hostPlayer = { id: userId, name: options.playerName || 'Player 1', isHost: true };

    const newGame = {
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
    };

    const docRef = await addDoc(getGamesCollection(db), newGame);
    return docRef.id;
};

export const joinGame = async (db, userId, playerName, gameId) => {
    const gameRef = getGameDocRef(db, gameId);
    return await runTransaction(db, async (transaction) => {
        const gameSnap = await transaction.get(gameRef);
        if (!gameSnap.exists()) throw new Error("Game does not exist.");

        const gameData = gameSnap.data();
        if (gameData.players.some(p => p.id === userId)) return;
        if (gameData.spectators?.some(s => s.id === userId)) {
            return moveSpectatorToPlayer(db, gameId, userId, playerName);
        }

        if (gameData.players.length >= gameData.maxPlayers) {
            const newSpectator = { id: userId, name: playerName };
            transaction.update(gameRef, {
                spectators: arrayUnion(newSpectator),
                gameMessage: `${playerName} is now spectating.`
            });
            return;
        }
        if (gameData.status !== 'waiting') throw new Error("Game has already started.");

        const newPlayer = { id: userId, name: playerName || `Player ${gameData.players.length + 1}`, isHost: false };
        transaction.update(gameRef, { players: arrayUnion(newPlayer) });
    });
};

export const quitGame = async (db, userId, gameId) => {
    const gameRef = getGameDocRef(db, gameId);
    return runTransaction(db, async (transaction) => {
        const gameSnap = await transaction.get(gameRef);
        if (!gameSnap.exists()) return;

        const gameData = gameSnap.data();
        if (gameData.host === userId && gameData.players.length <= 1) {
            transaction.delete(gameRef);
        } else {
            const playerToRemove = gameData.players.find(p => p.id === userId);
            const spectatorToRemove = gameData.spectators?.find(s => s.id === userId);
            const updates = {};

            if (playerToRemove) {
                updates.players = arrayRemove(playerToRemove);
                updates.playersReady = arrayRemove(userId);
                updates.playersReadyForNextGame = arrayRemove(userId);
                updates[`playersHands.${userId}`] = deleteField();
            }
            if (spectatorToRemove) {
                updates.spectators = arrayRemove(spectatorToRemove);
            }
            if (Object.keys(updates).length > 0) {
                 transaction.update(gameRef, updates);
            }
        }
    });
};

export const kickPlayer = async (db, gameId, hostId, playerIdToKick) => {
    // Kicking completely removes a player from the game session.
    return quitGame(db, playerIdToKick, gameId);
};

export const movePlayerToSpectator = async (db, gameId, hostId, playerIdToMove) => {
    const gameRef = getGameDocRef(db, gameId);
    return runTransaction(db, async (transaction) => {
        const gameSnap = await transaction.get(gameRef);
        if (!gameSnap.exists()) throw new Error("Game not found.");

        const gameData = gameSnap.data();
        if (gameData.host !== hostId) throw new Error("Only the host can perform this action.");

        const playerToMove = gameData.players.find(p => p.id === playerIdToMove);
        if (!playerToMove) throw new Error("Player not found in game.");

        const spectator = { id: playerToMove.id, name: playerToMove.name };

        const updates = {
            players: arrayRemove(playerToMove),
            spectators: arrayUnion(spectator),
            playersReady: arrayRemove(playerIdToMove),
            playersReadyForNextGame: arrayRemove(playerIdToMove),
            [`playersHands.${playerIdToMove}`]: deleteField(),
            gameMessage: `${playerToMove.name} is now spectating.`
        };
        transaction.update(gameRef, updates);
    });
};

export const moveSpectatorToPlayer = async (db, gameId, spectatorId, spectatorName) => {
    const gameRef = getGameDocRef(db, gameId);
    return runTransaction(db, async (transaction) => {
        const gameSnap = await transaction.get(gameRef);
        if (!gameSnap.exists()) throw new Error("Game not found.");

        const gameData = gameSnap.data();
        if (gameData.players.length >= gameData.maxPlayers) throw new Error("Game is currently full.");

        const spectatorToRemove = gameData.spectators?.find(s => s.id === spectatorId);
        if (!spectatorToRemove) throw new Error("Spectator not found.");

        const newPlayer = { id: spectatorId, name: spectatorName, isHost: false };

        const updates = {
            spectators: arrayRemove(spectatorToRemove),
            players: arrayUnion(newPlayer),
        };
        transaction.update(gameRef, updates);
    });
};

export const changeMaxPlayers = async (db, gameId, hostId, newMaxPlayers) => {
    const gameRef = getGameDocRef(db, gameId);
    return runTransaction(db, async (transaction) => {
        const gameSnap = await transaction.get(gameRef);
        if (!gameSnap.exists()) throw new Error("Game not found.");
        const gameData = gameSnap.data();

        if (gameData.host !== hostId) throw new Error("Only the host can change game settings.");
        if (newMaxPlayers < gameData.players.length) throw new Error("Cannot set max players below the current number of players.");

        transaction.update(gameRef, { maxPlayers: newMaxPlayers });
    });
};

export const setPlayerReady = async (db, gameId, userId, isReady) => {
    const gameRef = getGameDocRef(db, gameId);
    const updateAction = isReady ? arrayUnion(userId) : arrayRemove(userId);
    await updateDoc(gameRef, { playersReady: updateAction });
};

export const setPlayerReadyForNextGame = async (db, gameId, userId, isReady) => {
    const gameRef = getGameDocRef(db, gameId);
    const updateAction = isReady ? arrayUnion(userId) : arrayRemove(userId);
    await updateDoc(gameRef, { playersReadyForNextGame: updateAction });
};

export const setNextGame = async (db, oldGameId, nextGameId) => {
    const oldGameRef = getGameDocRef(db, oldGameId);
    await updateDoc(oldGameRef, { nextGameId: nextGameId });
};

export const startGame = async (db, gameId, hostId) => {
    const gameRef = getGameDocRef(db, gameId);
    await runTransaction(db, async (transaction) => {
        const gameSnap = await transaction.get(gameRef);
        if (!gameSnap.exists()) throw new Error("Game not found.");

        const gameData = gameSnap.data();
        if (gameData.host !== hostId) throw new Error("Only the host can start the game.");
        if (gameData.status !== 'waiting') throw new Error("Game has already started or finished.");
        if (gameData.playersReady.length !== gameData.players.length) throw new Error("Not all players are ready.");
        if (gameData.players.length < 2) throw new Error("You need at least 2 players to start.");

        const { hands, remainingDeck: deckAfterDealing } = dealCards(createShuffledDeck(gameData.players.length), gameData.players);
        const firstCard = deckAfterDealing.shift();
        const firstPlayer = gameData.players[0];

        transaction.update(gameRef, {
            status: 'playing',
            drawPile: deckAfterDealing,
            discardPile: [firstCard],
            playersHands: hands,
            currentTurn: firstPlayer.id,
            currentSuit: firstCard.rank === '8' ? null : firstCard.suit,
            gameDirection: 1,
            gameMessage: `Game started! It's ${firstPlayer.name}'s turn.`,
            gameHistory: arrayUnion({ timestamp: Timestamp.now(), message: "Game has started." }),
            lastPlayedCard: firstCard,
        });
    });
};

export const startRematch = async (db, oldGameId, hostId) => {
     const oldGameRef = getGameDocRef(db, oldGameId);
     return runTransaction(db, async (transaction) => {
        const oldGameSnap = await transaction.get(oldGameRef);
        if (!oldGameSnap.exists()) throw new Error("Original game not found.");
        const oldGameData = oldGameSnap.data();

        // RACE CONDITION FIX: If a next game already exists, do nothing.
        // The first client to successfully run this transaction wins.
        if (oldGameData.nextGameId) {
            console.log("Rematch already created. Aborting.");
            return oldGameData.nextGameId;
        }

        if (oldGameData.host !== hostId) throw new Error("Only the host can start a rematch.");
        if (oldGameData.playersReadyForNextGame.length !== oldGameData.players.length) throw new Error("Not everyone is ready for a rematch.");

        const newGameData = {
            host: oldGameData.host,
            status: 'waiting',
            players: oldGameData.players.map(p => ({...p, isHost: p.id === hostId})),
            spectators: oldGameData.spectators || [],
            playersReady: [],
            createdAt: serverTimestamp(),
            gameName: oldGameData.gameName,
            gameType: oldGameData.gameType,
            maxPlayers: oldGameData.maxPlayers,
            joinCode: generateJoinCode(),
        };

        const newGameCollection = getGamesCollection(db);
        const newGameRef = doc(newGameCollection);

        transaction.set(newGameRef, newGameData);
        transaction.update(oldGameRef, { nextGameId: newGameRef.id });

        return newGameRef.id;
    });
};
