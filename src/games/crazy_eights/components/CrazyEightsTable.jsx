/*
================================================================================
|
| FILE: src/games/crazy_eights/components/CrazyEightsTable.jsx
|
| DESCRIPTION: Simplified to a pure view component.
| - Renders UI based on `useGameState` hook.
| - Dispatches all actions via `useGameActions` hook, without conditional logic.
| - Removes internal state management for game logic (e.g., showSuitPicker).
|
| CHANGE LOG (dnd-kit bugfix):
| - FIXED: The DiscardPile component now correctly uses the `isOver` state from
|   the `useDroppable` hook to provide visual feedback. This helps confirm
|   that the drop zone is being detected by dnd-kit.
| - FIXED: The `handleDragEnd` function was simplified by removing the `setTimeout`.
|   This makes the state update more direct and less prone to race conditions,
|   relying on the `dndContextKey` to properly reset dnd-kit's internal state
|   after a card is played.
|
================================================================================
*/
import React, { memo, useEffect, useContext, useState, useCallback } from 'react';
import { DndContext, DragOverlay, useDroppable, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useGameState } from '../../../hooks/useGameState';
import { useGameActions } from '../../../hooks/useGameActions';
import { FirebaseContext } from '../../../context/FirebaseProvider';
import { sortHand } from "./handSorter.js";
import Card from './Card';
import PlayerHand from './PlayerHand';
import Scoreboard from './Scoreboard';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';


const DiscardPile = ({ children }) => {
    const { setNodeRef, isOver } = useDroppable({ id: 'discard-pile-droppable' });
    return (
        <div ref={setNodeRef} className={`relative transition-colors duration-300 rounded-lg ${isOver ? 'bg-yellow-400/30' : ''}`}>
            {children}
            {isOver && <div className="absolute inset-0 border-4 border-dashed border-yellow-300 rounded-lg animate-pulse"></div>}
        </div>
    );
};


const SuitPicker = ({ onSelectSuit, onCancel }) => (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-700 p-6 rounded-xl shadow-xl border-purple-500 w-full max-w-md text-center">
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

const CrazyEightsTable = ({ gameMode }) => {
    const gameState = useGameState();
    const { userId: currentUserId } = useContext(FirebaseContext);

    // FIXED: The local processingAction state and its corresponding useEffect have been removed.
    // They were the source of the race condition.

    const { playCard, drawCard, declareSuit } = useGameActions(gameMode);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
    );

    if (!gameState || !gameState.status) {
        return <LoadingSpinner message="Setting up game board..." />;
    }

    const {
        players,
        drawPile,
        discardPile,
        currentTurn: currentPlayerId,
        lastPlayedCard,
        currentSuit: declaredSuit,
        status,
        winner: winnerId,
        playersHands
    } = gameState;

    const deckSize = drawPile ? drawPile.length : 0;
    const isSpectator = !(players?.some(p => p.id === currentUserId));
    const isMyTurn = Boolean(!isSpectator && currentPlayerId === currentUserId);
    const shouldShowSuitPicker = status === 'choosing_suit' && isMyTurn;

    const myHand = playersHands?.[currentUserId] || [];
    const sortedHand = sortHand(myHand);

    const [activeDragId, setActiveDragId] = useState(null);
    const draggedCardData = activeDragId ? myHand.find(c => `${c.rank}-${c.suit}` === activeDragId) : null;

    // FIXED: Removed the processingAction check. The isMyTurn check, derived
    // from the server state, is the only source of truth required.
    const handlePlayCard = useCallback((card) => {
        if (!isMyTurn) {
            console.warn("[CrazyEightsTable] UI: Not your turn. Aborting playCard.");
            return;
        }
        playCard(card);
    }, [isMyTurn, playCard]);


    // FIXED: Removed the processingAction check here as well.
    const handleDrawCard = useCallback(() => {
        if (!isMyTurn) {
            console.warn("[CrazyEightsTable] UI: Not your turn. Aborting drawCard.");
            return;
        }
        drawCard();
    }, [isMyTurn, drawCard]);


    // FIXED: Removed processingAction check. This action is only available
    // when it's the player's turn anyway.
    const handleSelectSuit = useCallback((suit) => {
        declareSuit(suit);
    }, [declareSuit]);


    const handleDragEnd = useCallback((event) => {
        setActiveDragId(null);
        if (event.active && event.over && event.over.id === 'discard-pile-droppable') {
            const card = event.active.data.current?.card;
            if (card) {
                handlePlayCard(card);
            }
        }
    }, [handlePlayCard]);

    const dndContextKey = gameState.id + (gameState.gameHistory?.length || 0) + (gameState.currentTurn || '');

    return (
        <DndContext
            key={dndContextKey}
            sensors={sensors}
            onDragStart={(e) => {
                if (e.active.data.current?.card) {
                    setActiveDragId(`${e.active.data.current.card.rank}-${e.active.data.current.card.suit}`);
                }
            }}
            onDragEnd={handleDragEnd}
        >
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-700 to-green-900 text-white p-4 font-inter">
                <h1 className="text-4xl font-bold mb-6 text-yellow-300 drop-shadow-lg">Crazy Eights</h1>

                <div className="mb-4 text-lg">
                    <p>Game ID: <span className="font-semibold">{gameState.id}</span></p>
                </div>

                {status === 'finished' && (
                    <div className="text-3xl font-bold mb-4 p-4 bg-purple-600 rounded-lg shadow-md">
                        Game Over! Winner: {winnerId === currentUserId ? 'You!' : players?.find(p => p.id === winnerId)?.name || winnerId}
                    </div>
                )}

                {status === 'playing' || status === 'choosing_suit' ? (
                    <div className="text-2xl mb-4 p-3 bg-indigo-600 rounded-lg shadow-md">
                        {isMyTurn ? 'Your Turn!' : `It's ${players?.find(p => p.id === currentPlayerId)?.name || currentPlayerId}'s Turn`}
                    </div>
                ) : null}

                <div className="mb-8 p-4 bg-green-800 rounded-lg shadow-inner w-full max-w-2xl flex flex-wrap justify-center gap-4">
                    <h3 className="text-xl font-semibold w-full text-center mb-2">Opponents:</h3>
                    {players?.filter(p => p.id !== currentUserId).map(opponent => (
                        <div key={opponent.id} className="text-lg text-center">
                            <p className="font-semibold">{opponent.name || opponent.id}</p>
                            <p>Cards: {playersHands?.[opponent.id]?.length || 0}</p>
                        </div>
                    ))}
                </div>

                <div className="flex items-center space-x-8 mb-8">
                    <DiscardPile>
                        <div className="flex flex-col items-center">
                            <h3 className="text-xl font-semibold mb-2">Discard Pile</h3>
                            {lastPlayedCard ? (
                                <Card card={lastPlayedCard} disabled={true} />
                            ) : (
                                <div className="w-24 h-36 bg-gray-300 rounded-md flex items-center justify-center text-gray-500 text-sm">
                                    Empty
                                </div>
                            )}
                            {declaredSuit && status !== 'choosing_suit' && (
                                <p className="mt-2 text-xl font-bold text-yellow-400">Declared: {declaredSuit}</p>
                            )}
                        </div>
                    </DiscardPile>
                    <div className="flex flex-col items-center">
                        <h3 className="text-xl font-semibold mb-2">Deck</h3>
                        <div
                            className={`w-24 h-36 bg-blue-800 rounded-md border-2 border-blue-600 shadow-lg flex items-center justify-center transition-transform duration-200 ${isMyTurn ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}`}
                            onClick={handleDrawCard}
                            style={{ opacity: isMyTurn ? 1 : 0.5 }}
                        >
                            <span className="text-5xl font-bold text-white">🂡</span>
                        </div>
                        <p className="mt-2 text-lg">Cards left: {deckSize}</p>
                    </div>
                </div>

                {shouldShowSuitPicker && (
                    <SuitPicker
                        onSelectSuit={handleSelectSuit}
                        onCancel={() => handleSelectSuit(null)}
                    />
                )}

                {!isSpectator && (status === 'playing' || status === 'choosing_suit') && (
                    <div className="mt-8 w-full max-w-4xl">
                        <h3 className="text-2xl font-bold mb-4 text-yellow-300 text-center">Your Hand</h3>
                        <PlayerHand
                            cards={sortedHand}
                            onPlayCard={handlePlayCard}
                            isMyTurn={isMyTurn}
                            activeDragId={activeDragId}

                        />
                    </div>
                )}
            </div>
            <DragOverlay>
                {activeDragId && draggedCardData ? <Card card={draggedCardData} disabled={false} /> : null}
            </DragOverlay>
        </DndContext>
    );
};

export default memo(CrazyEightsTable);
