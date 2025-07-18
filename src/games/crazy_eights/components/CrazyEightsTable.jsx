/*
================================================================================
|
| FILE: src/games/crazy_eights/components/CrazyEightsTable.jsx
|
| DESCRIPTION: The new game table layout.
| - Implements the three-column scoreboard layout at the top.
| - Renders the PlayerHand only for active players, not spectators.
|
================================================================================
*/
import React, { useState, useEffect, useContext, memo, useCallback } from 'react';
import { doc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { DndContext, DragOverlay, useDroppable, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { FirebaseContext } from "../../../context/FirebaseProvider";
import { sortHand } from "./handSorter.js";
import Card from './Card';
import PlayerHand from './PlayerHand';
import Scoreboard from './Scoreboard';
import { applyCrazyEightsCardLogic, getNextTurn } from '../logic';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

const DiscardPile = ({ children, isOver }) => {
    const { setNodeRef } = useDroppable({ id: 'discard-pile-droppable' });
    return (
        <div ref={setNodeRef} className={`relative transition-colors duration-300 rounded-lg ${isOver ? 'bg-yellow-400/30' : ''}`}>
            {children}
            {isOver && <div className="absolute inset-0 border-4 border-dashed border-yellow-300 rounded-lg animate-pulse"></div>}
        </div>
    );
};

const CrazyEightsTable = ({ gameData, gameId, userId, isSpectator, onUserActivity }) => {
    const { db } = useContext(FirebaseContext);
    const [message, setMessage] = useState('');
    const [showSuitPicker, setShowSuitPicker] = useState(false);
    const [cardToPlay, setCardToPlay] = useState(null);
    const [optimisticCard, setOptimisticCard] = useState(null);
    const [isTurnLocked, setIsTurnLocked] = useState(false);
    const [activeDragId, setActiveDragId] = useState(null);
    const [displayMessage, setDisplayMessage] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
    );

    const getAppId = () => typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const isMyTurn = !isSpectator && gameData.currentTurn === userId && !isTurnLocked;

    useEffect(() => {
        if (message) {
            setDisplayMessage(message);
            const timer = setTimeout(() => { setDisplayMessage(''); setMessage(''); }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    useEffect(() => {
        if (optimisticCard && gameData.lastPlayedCard?.rank === optimisticCard.rank && gameData.lastPlayedCard?.suit === optimisticCard.suit) {
            setOptimisticCard(null);
            setIsTurnLocked(false);
        }
        if (gameData.currentTurn !== userId) {
            setIsTurnLocked(false);
        }
    }, [gameData.lastPlayedCard, gameData.currentTurn, optimisticCard, userId]);

    const executePlayCard = useCallback(async (card, chosenSuit) => {
        if (isSpectator) return;
        onUserActivity();
        const appId = getAppId();
        const gameDocRef = doc(db, `artifacts/${appId}/public/data/crazy_eights_games`, gameId);
        try {
            const handAfterPlay = gameData.playersHands[userId].filter(c => !(c.rank === card.rank && c.suit === card.suit));
            const gameStateForLogic = {
                players: gameData.players, gameDirection: gameData.gameDirection,
                currentTurn: gameData.currentTurn,
                playersHands: { ...gameData.playersHands, [userId]: handAfterPlay },
                drawPile: [...gameData.drawPile]
            };
            const logicResult = applyCrazyEightsCardLogic(card, gameStateForLogic);
            const currentPlayer = gameData.players.find(p => p.id === userId);
            const nextPlayer = gameData.players.find(p => p.id === logicResult.nextTurn);
            const updates = {
                playersHands: logicResult.playersHands, drawPile: logicResult.drawPile,
                gameDirection: logicResult.gameDirection, currentTurn: logicResult.nextTurn,
                discardPile: arrayUnion(card), lastPlayedCard: card, currentSuit: chosenSuit,
                gameMessage: `${currentPlayer.name} played a ${card.rank} of ${card.suit}. ${logicResult.gameMessage} It's now ${nextPlayer.name}'s turn.`,
                gameHistory: arrayUnion({ timestamp: Timestamp.now(), message: `${currentPlayer.name} played a ${card.rank} of ${card.suit}.` })
            };
            if (logicResult.playersHands[userId].length === 0) {
                updates.status = 'finished';
                updates.gameMessage = `${currentPlayer.name} wins the game!`;
                updates.winner = userId;
                updates.playersReadyForNextGame = [];
                updates.gameHistory = arrayUnion({ timestamp: Timestamp.now(), message: `${currentPlayer.name} wins the game!` });
            }
            await updateDoc(gameDocRef, updates);
        } catch (error) {
            console.error("Error playing card:", error);
            setDisplayMessage(`Error: ${error.message || error.toString()}`);
            setOptimisticCard(null); setIsTurnLocked(false);
        } finally {
            setShowSuitPicker(false); setCardToPlay(null);
        }
    }, [db, gameId, gameData, userId, isSpectator, onUserActivity]);

    const handlePlayCard = useCallback(async (card) => {
        if (!isMyTurn || isSpectator) return;
        const topCard = gameData.discardPile[gameData.discardPile.length - 1];

        // BUG FIX: If currentSuit is null (e.g., an 8 started the game), any card is valid.
        const isValidMove = !gameData.currentSuit || card.rank === '8' || card.rank === topCard.rank || card.suit === gameData.currentSuit;

        if (!isValidMove) {
            const message = gameData.currentSuit
                ? `Invalid move! Play a ${gameData.currentSuit} or a ${topCard.rank}.`
                : `Invalid move! Play any card to set the suit.`;
            setDisplayMessage(message);
            return;
        }
        setIsTurnLocked(true);
        setOptimisticCard(card);
        if (card.rank === '8') {
            setCardToPlay(card); setShowSuitPicker(true);
        } else {
            executePlayCard(card, card.suit);
        }
    }, [isMyTurn, isSpectator, gameData, executePlayCard]);

    const handleDrawCard = useCallback(async () => {
        if (!isMyTurn || isSpectator) return;
        setIsTurnLocked(true); onUserActivity();
        const appId = getAppId();
        const gameDocRef = doc(db, `artifacts/${appId}/public/data/crazy_eights_games`, gameId);
        let { drawPile, discardPile, players, gameDirection } = gameData;
        if (drawPile.length === 0) {
            if (discardPile.length <= 1) {
                setDisplayMessage("No cards left to draw!"); setIsTurnLocked(false); return;
            }
            const topCard = discardPile.pop();
            drawPile = discardPile.sort(() => Math.random() - 0.5);
            discardPile = [topCard];
        }
        const drawnCard = drawPile.shift();
        const updatedPlayerHand = [...gameData.playersHands[userId], drawnCard];
        const newPlayersHands = { ...gameData.playersHands, [userId]: updatedPlayerHand };
        const nextTurnId = getNextTurn(userId, players, gameDirection);
        const nextPlayer = players.find(p => p.id === nextTurnId);
        const currentPlayer = players.find(p => p.id === userId);
        try {
            await updateDoc(gameDocRef, {
                drawPile, discardPile, playersHands: newPlayersHands,
                currentTurn: nextTurnId,
                gameMessage: `${currentPlayer.name} drew a card. It's now ${nextPlayer.name}'s turn.`,
                gameHistory: arrayUnion({ timestamp: Timestamp.now(), message: `${currentPlayer.name} drew a card.` })
            });
        } catch (error) {
            console.error("Error drawing card:", error);
            setDisplayMessage(`Error: ${error.message || error.toString()}`);
            setIsTurnLocked(false);
        }
    }, [isMyTurn, isSpectator, db, gameId, gameData, onUserActivity, userId]);

    const handleDragStart = (event) => { onUserActivity(); setActiveDragId(event.active.id); };
    const handleDragEnd = (event) => {
        setActiveDragId(null);
        if (event.over && event.over.id === 'discard-pile-droppable') {
            const card = event.active.data.current?.card;
            if (card) handlePlayCard(card);
        }
    };

    const SuitPicker = ({ onSelectSuit, onCancel }) => (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-700 p-6 rounded-xl shadow-xl border border-purple-500 w-full max-w-md text-center">
                <h3 className="text-xl font-bold text-yellow-300 mb-4">Choose a Suit</h3>
                <div className="grid grid-cols-2 gap-2">
                    {['hearts', 'diamonds', 'clubs', 'spades'].map(suit =>
                        <button key={suit} onClick={() => onSelectSuit(suit)} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition">{suit.charAt(0).toUpperCase() + suit.slice(1)}</button>
                    )}
                </div>
                <button onClick={onCancel} className="w-full mt-4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
            </div>
        </div>
    );

    if (!gameData.playersHands) return <LoadingSpinner />;

    const myHand = gameData.playersHands?.[userId] || [];
    const handWithoutOptimistic = myHand.filter(c => !optimisticCard || !(c.rank === optimisticCard.rank && c.suit === optimisticCard.suit));
    const sortedHand = sortHand(handWithoutOptimistic);
    const discardPileForDisplay = (gameData.discardPile || []).slice(-3);
    if (optimisticCard) {
        discardPileForDisplay.push(optimisticCard);
        if (discardPileForDisplay.length > 3) discardPileForDisplay.shift();
    }
    const draggedCardData = activeDragId ? myHand.find(c => `${c.rank}-${c.suit}` === activeDragId) : null;

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="w-full h-full flex flex-col items-center justify-between">
                {displayMessage && <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white p-3 rounded-lg z-50">{displayMessage}</div>}

                <Scoreboard gameData={gameData} userId={userId} />

                <div className={`w-full max-w-sm sm:max-w-md lg:max-w-lg flex flex-col justify-center items-center gap-1 px-0.5 py-1 my-4 bg-green-800/50 rounded-lg border-4 transition-all duration-300 ${isMyTurn ? 'animate-pulse-border' : 'border-transparent'}`}>
                    <div className="flex justify-center items-end gap-3 sm:gap-6">
                        <div className="flex flex-col items-center">
                            <p className="text-gray-200 mb-0.5 h-3 text-xs">Draw ({gameData.drawPile?.length || 0})</p>
                            <button onClick={handleDrawCard} disabled={!isMyTurn || isSpectator}><Card card={{rank: 'DRAW', suit: 'special'}} disabled={!isMyTurn} /></button>
                        </div>
                        <div className="flex flex-col items-center">
                            <p className="text-gray-200 mb-0.5 h-3 text-xs">Discard</p>
                            <DiscardPile isOver={!!activeDragId}>
                                <div className="flex items-center justify-center" style={{height: 'var(--card-height)'}}>
                                    {discardPileForDisplay.length > 0 ? (
                                        discardPileForDisplay.map((card, index) => (
                                            <div key={`${card.rank}-${card.suit}-${index}`} className="-ml-[calc(var(--card-width)_/_1.5)] first:ml-0" style={{ zIndex: index }}>
                                                <Card card={card} disabled={true} />
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{height: 'var(--card-height)', width: 'var(--card-width)'}} className="bg-black/20 rounded-lg"></div>
                                    )}
                                </div>
                            </DiscardPile>
                        </div>
                    </div>
                    <p className="text-gray-300 mt-1 text-xs">Current Suit: <span className="font-bold text-yellow-200">{gameData.currentSuit?.toUpperCase()}</span></p>
                </div>

                {!isSpectator && (
                    <div className="w-full mt-auto p-0.5">
                        <PlayerHand cards={sortedHand} isMyTurn={isMyTurn} />
                    </div>
                )}

                {showSuitPicker && <SuitPicker onSelectSuit={(suit) => executePlayCard(cardToPlay, suit)} onCancel={() => { setShowSuitPicker(false); setCardToPlay(null); setOptimisticCard(null); setIsTurnLocked(false); }} />}
            </div>
            <DragOverlay>
                {activeDragId && draggedCardData ? <Card card={draggedCardData} /> : null}
            </DragOverlay>
        </DndContext>
    );
};

export default memo(CrazyEightsTable);
