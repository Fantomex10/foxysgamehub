
/*
================================================================================
|
| FILE: src/services/gameService.js
|
| DESCRIPTION: The Courier.
| - This version contains the complete, working implementation for all game
|   actions, fixing the bug where createGame was not defined.
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

    Timestamp
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { createShuffledDeck, dealCards, applyCrazyEightsCardLogic, getNextTurn } from '../games/crazy_eights/logic';


const getAppId = () => typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const getGamesCollection = (db) => collection(db, `artifacts/${getAppId()}/public/data/games`);
const getGameDocRef = (db, gameId) => doc(db, `artifacts/${getAppId()}/public/data/games`, gameId);

const generateJoinCode = () => Math.floor(1000 + Math.random() * 9000).toString();

export const createGame = async (db, userId, options) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
        console.error("GAME_SERVICE: User not authenticated for createGame.");
        throw new Error("User not authenticated.");
    }

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
        gameOptions: options.gameOptions || {},
    };

    try {
        console.log("GAME_SERVICE: Attempting to create game in Firestore.");
        const gamesCollection = getGamesCollection(db);
        const docRef = await addDoc(gamesCollection, newGame);
        console.log(`GAME_SERVICE: Game created with ID: ${docRef.id}`);
        return docRef.id;
    } catch (error) {
        console.error("GAME_SERVICE: FATAL ERROR (gameService): Failed to create game in Firestore.", error);
        throw error;
    }
};

export const deleteGame = async (db, gameId, userId) => {
    const gameRef = getGameDocRef(db, gameId);
    const gameSnap = await getDoc(gameRef);
    if (!gameSnap.exists()) throw new Error("Game not found.");

    const gameData = gameSnap.data();
    if (gameData.host !== userId) throw new Error("Only the host can delete the game.");
    if (gameData.status !== 'waiting') throw new Error("Cannot delete a game that has already started.");

    await deleteDoc(gameRef);
};

// +++ ADDED: New function for the host to update game options.
export const updateGameOptions = async (db, gameId, hostId, newOptions) => {
    const gameRef = getGameDocRef(db, gameId);
    return runTransaction(db, async (transaction) => {
        const gameSnap = await transaction.get(gameRef);
        if (!gameSnap.exists()) throw new Error("Game not found.");
        const gameData = gameSnap.data();
        if (gameData.host !== hostId) throw new Error("Only the host can change game settings.");

        transaction.update(gameRef, { gameOptions: newOptions });
    });
};


export const joinGame = async (db, userId, playerName, gameId) => {
    const gameRef = getGameDocRef(db, gameId);
    console.log(`GAME_SERVICE: Attempting to join game ID: ${gameId} for user: ${userId}`);
    return await runTransaction(db, async (transaction) => {
        const gameSnap = await transaction.get(gameRef);
        if (!gameSnap.exists()) {
            console.error(`GAME_SERVICE: Game ID ${gameId} does not exist.`);
            throw new Error("Game does not exist.");
        }

        const gameData = gameSnap.data();
        if (gameData.players.some(p => p.id === userId)) {
            console.log(`GAME_SERVICE: User ${userId} already in game ${gameId}.`);
            return; // Already in game
        }

        if (gameData.players.length >= gameData.maxPlayers) {
            console.error(`GAME_SERVICE: Game ${gameId} is full.`);
            throw new Error("Game is full.");
        }
        if (gameData.status !== 'waiting') {
            console.error(`GAME_SERVICE: Game ${gameId} has already started.`);
            throw new Error("Game has already started.");
        }

        const newPlayer = { id: userId, name: playerName || `Player ${gameData.players.length + 1}`, isHost: false };
        transaction.update(gameRef, { players: arrayUnion(newPlayer) });
        console.log(`GAME_SERVICE: User ${userId} successfully added to game ${gameId}.`);
    });
};

export const quitGame = async (db, userId, gameId) => {
    const gameRef = getGameDocRef(db, gameId);
    console.log(`GAME_SERVICE: Attempting to quit game ID: ${gameId} for user: ${userId}`);
    return runTransaction(db, async (transaction) => {
        const gameSnap = await transaction.get(gameRef);
        if (!gameSnap.exists()) {
            console.warn(`GAME_SERVICE: Game ID ${gameId} not found during quit operation.`);
            return;
        }

        const gameData = gameSnap.data();
        if (gameData.host === userId && gameData.players.length <= 1) {
            console.log(`GAME_SERVICE: Host ${userId} is last player in game ${gameId}, deleting game.`);
            transaction.delete(gameRef);
        } else {
            const playerToRemove = gameData.players.find(p => p.id === userId);
            const updates = {};
            if (playerToRemove) {
                updates.players = arrayRemove(playerToRemove);
                updates.playersReady = arrayRemove(userId); // Also remove from ready list
                console.log(`GAME_SERVICE: Removing player ${userId} from game ${gameId}.`);
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
    console.log(`GAME_SERVICE: Setting player ${userId} ready status to ${isReady} for game ${gameId}.`);
    await updateDoc(gameRef, { playersReady: updateAction });
};

export const startGame = async (db, gameId, hostId) => {
    const gameRef = getGameDocRef(db, gameId);
    console.log(`GAME_SERVICE: Host ${hostId} attempting to start game ID: ${gameId}.`);
    await runTransaction(db, async (transaction) => {
        const gameSnap = await transaction.get(gameRef);
        if (!gameSnap.exists()) {
            console.error(`GAME_SERVICE: Game ${gameId} not found during startGame transaction.`);
            throw new Error("Game not found.");
        }

        const gameData = gameSnap.data();
        if (gameData.host !== hostId) {
            console.error(`GAME_SERVICE: User ${hostId} is not host of game ${gameId}.`);
            throw new Error("Only the host can start the game.");
        }
        if (gameData.status !== 'waiting') {
            console.error(`GAME_SERVICE: Game ${gameId} is not in 'waiting' status.`);
            throw new Error("Game has already started.");
        }
        if (gameData.playersReady.length !== gameData.players.length) {
            console.error(`GAME_SERVICE: Not all players are ready in game ${gameId}.`);
            throw new Error("Not all players are ready.");
        }
        if (gameData.players.length < 2) {
            console.error(`GAME_SERVICE: Not enough players to start game ${gameId}.`);
            throw new Error("You need at least 2 players to start.");
        }


        // Prepare game state for start
        const shuffledDeck = createShuffledDeck(gameData.players.length);
        const { hands, remainingDeck: deckAfterDealing } = dealCards(shuffledDeck, gameData.players);
        const firstCard = deckAfterDealing.shift();

        const firstPlayer = gameData.players[0];

        const updates = {
            status: 'playing',

            drawPile: deckAfterDealing,
            discardPile: [firstCard],
            playersHands: hands,
            currentTurn: firstPlayer.id,
            // If first card is an '8', currentSuit is null, requiring player to choose
            currentSuit: firstCard.rank === '8' ? null : firstCard.suit,
            gameDirection: 1, // Default to forward
            gameMessage: `Game started! It's ${firstPlayer.name}'s turn.`,
            gameHistory: arrayUnion({ timestamp: Timestamp.now(), message: "Game has started." }),
            lastPlayedCard: firstCard,
        };

        transaction.update(gameRef, updates);
        console.log(`GAME_SERVICE: Game ${gameId} successfully updated to 'playing' status with initial state.`);
        console.log("GAME_SERVICE: StartGame Transaction Updates:", updates); // Log the updates object

    });
};

export const playCard = async (db, gameId, userId, card, chosenSuit, gameData) => {
    const gameDocRef = getGameDocRef(db, gameId);
    console.log(`GAME_SERVICE: Player ${userId} attempting to play card ${card.rank} of ${card.suit} in game ${gameId}.`);

    // Optimistically filter the hand for local UI updates, but server will be source of truth
    const handAfterPlay = gameData.playersHands[userId].filter(c => !(c.rank === card.rank && c.suit === card.suit));
    const updates = {};

    if (handAfterPlay.length === 0) {
        const winner = gameData.players.find(p => p.id === userId);
        updates.status = 'finished';
        updates.gameMessage = `${winner.name} wins the game!`;
        updates.winner = userId;
        updates.playersReadyForNextGame = []; // Reset for rematch
        console.log(`GAME_SERVICE: Player ${userId} wins game ${gameId}.`);
    } else {
        const gameStateForLogic = {
            players: gameData.players,
            gameDirection: gameData.gameDirection,
            currentTurn: gameData.currentTurn,
            playersHands: { ...gameData.playersHands, [userId]: handAfterPlay }, // Pass updated hand for logic
            drawPile: [...gameData.drawPile]
        };
        const logicResult = applyCrazyEightsCardLogic(card, gameStateForLogic);
        const currentPlayer = gameData.players.find(p => p.id === userId);
        const nextPlayer = gameData.players.find(p => p.id === logicResult.nextTurn);

        updates.playersHands = logicResult.playersHands;
        updates.drawPile = logicResult.drawPile;
        updates.gameDirection = logicResult.gameDirection;
        updates.currentTurn = logicResult.nextTurn;
        updates.currentSuit = chosenSuit; // This will be null unless an '8' was played and suit chosen
        updates.gameMessage = `${currentPlayer.name} played a ${card.rank} of ${card.suit}. ${logicResult.gameMessage || ''} It's now ${nextPlayer.name}'s turn.`;
        console.log(`GAME_SERVICE: Card played, next turn for ${nextPlayer.name}.`);
    }

    updates.discardPile = arrayUnion(card); // Add card to discard pile
    updates.lastPlayedCard = card;
    updates.gameHistory = arrayUnion({ timestamp: Timestamp.now(), message: `${gameData.players.find(p=>p.id===userId).name} played a ${card.rank} of ${card.suit}.` });

    console.log("GAME_SERVICE: PlayCard Updates to Firestore:", updates); // Log the updates object

    try {
        await updateDoc(gameDocRef, updates);
        console.log(`GAME_SERVICE: Firestore updated for playCard action in game ${gameId}.`);
    } catch (error) {
        console.error("GAME_SERVICE: Error updating document for playCard:", error);
        throw error;
    }
};

export const drawCard = async (db, gameId, userId, gameData) => {
    const gameDocRef = getGameDocRef(db, gameId);
    console.log(`GAME_SERVICE: Player ${userId} attempting to draw card in game ${gameId}.`);
    let { drawPile, discardPile, players, gameDirection } = gameData;

    // Reshuffle discard pile into draw pile if draw pile is empty
    if (drawPile.length === 0) {
        if (discardPile.length <= 1) {
            console.warn(`GAME_SERVICE: Cannot draw, drawPile and discardPile almost empty in game ${gameId}.`);
            throw new Error("No cards left to draw!"); // Or handle game end/stalemate
        }
        const topCard = discardPile.pop(); // Keep the top card
        drawPile = discardPile.sort(() => Math.random() - 0.5); // Simple shuffle
        discardPile = [topCard];
        console.log(`GAME_SERVICE: Reshuffled discard pile into draw pile for game ${gameId}.`);
    }

    const drawnCard = drawPile.shift();
    const updatedPlayerHand = [...gameData.playersHands[userId], drawnCard];
    const newPlayersHands = { ...gameData.playersHands, [userId]: updatedPlayerHand };
    const nextTurnId = getNextTurn(userId, players, gameDirection);
    const currentPlayer = players.find(p => p.id === userId);
    const nextPlayer = players.find(p => p.id === nextTurnId);

    const updates = {
        drawPile,
        discardPile,
        playersHands: newPlayersHands,
        currentTurn: nextTurnId,
        gameMessage: `${currentPlayer.name} drew a card. It's now ${nextPlayer.name}'s turn.`,
        gameHistory: arrayUnion({ timestamp: Timestamp.now(), message: `${currentPlayer.name} drew a card.` })
    };
    console.log("GAME_SERVICE: DrawCard Updates to Firestore:", updates); // Log the updates object

    try {
        await updateDoc(gameDocRef, updates);
        console.log(`GAME_SERVICE: Firestore updated for drawCard action in game ${gameId}.`);
    } catch (error) {
        console.error("GAME_SERVICE: Error updating document for drawCard:", error);
        throw error;
    }
};

export const setPlayerReadyForNextGame = async (db, gameId, userId, isReady) => {
    const gameRef = getGameDocRef(db, gameId);
    const updateAction = isReady ? arrayUnion(userId) : arrayRemove(userId);
    console.log(`GAME_SERVICE: Setting player ${userId} ready for next game to ${isReady} in game ${gameId}.`);
    await updateDoc(gameRef, { playersReadyForNextGame: updateAction });
};

export const startRematch = async (db, oldGameId, hostId) => {
     const oldGameRef = getGameDocRef(db, oldGameId);
     console.log(`GAME_SERVICE: Host ${hostId} attempting to start rematch for old game ID: ${oldGameId}.`);
     return runTransaction(db, async (transaction) => {
        const oldGameSnap = await transaction.get(oldGameRef);
        if (!oldGameSnap.exists()) {
            console.error(`GAME_SERVICE: Original game ${oldGameId} not found for rematch.`);
            throw new Error("Original game not found.");
        }
        const oldGameData = oldGameSnap.data();

        if (oldGameData.nextGameId) {
            console.log(`GAME_SERVICE: Rematch already initiated for ${oldGameId}, next game ID: ${oldGameData.nextGameId}.`);
            return oldGameData.nextGameId; // Rematch already created, return its ID
        }


        if (oldGameData.host !== hostId) {
            console.error(`GAME_SERVICE: User ${hostId} is not host of old game ${oldGameId}, cannot start rematch.`);
            throw new Error("Only the host can start a rematch.");
        }
        if (oldGameData.playersReadyForNextGame.length !== oldGameData.players.length) {
            console.error(`GAME_SERVICE: Not all players ready for rematch in old game ${oldGameId}.`);
            throw new Error("Not everyone is ready for a rematch.");
        }

        const newGameData = {
            host: oldGameData.host,
            status: 'waiting', // New game starts in waiting
            players: oldGameData.players.map(p => ({...p, isHost: p.id === hostId})), // Reset host status for new game
            spectators: oldGameData.spectators || [],
            playersReady: [], // Reset ready status for new game
            createdAt: serverTimestamp(),
            gameName: oldGameData.gameName,
            gameType: oldGameData.gameType,
            maxPlayers: oldGameData.maxPlayers,
            joinCode: generateJoinCode(),
            gameOptions: oldGameData.gameOptions || {},
        };
        const newGameCollection = getGamesCollection(db);

        const newGameRef = doc(newGameCollection); // Firestore generates a new ID

        transaction.set(newGameRef, newGameData); // Create the new game document
        transaction.update(oldGameRef, { nextGameId: newGameRef.id }); // Link old game to new game

        console.log(`GAME_SERVICE: Rematch for ${oldGameId} successfully created as new game ID: ${newGameRef.id}.`);

        return newGameRef.id;
    });
};
