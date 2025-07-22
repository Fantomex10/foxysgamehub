/*
================================================================================
|
| FILE: src/games/crazy_eights/GameRoom.jsx
|
| DESCRIPTION: Simplified to use the `useGameActions` hook for rematch logic.
|
================================================================================
*/
import React, { useContext, useState } from 'react';
import { useGameState } from '../../hooks/useGameState';
import { useGameActions } from '../../hooks/useGameActions'; // Import the new actions hook
import { FirebaseContext } from '../../context/FirebaseProvider';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import CrazyEightsTable from './components/CrazyEightsTable';
import WaitingRoom from './components/WaitingRoom';

const GameRoom = ({ isSpectator, gameMode }) => {
    const { userId } = useContext(FirebaseContext);
    const gameData = useGameState(); // Subscribes to GameEngine state

    // Get the actions from our centralized hook, providing the gameMode
    const { readyForRematch, startRematch } = useGameActions(gameMode);

    console.log(`GAMEROOM: Rendered. gameData status: ${gameData?.status}, gameData ID: ${gameData?.id}, isSpectator: ${isSpectator}`);

    // Show loading spinner if gameData is not yet available or status is missing
    if (!gameData || !gameData.status) {
        console.log("GAMEROOM: Showing LoadingSpinner - gameData not fully loaded.");
        return <div className="w-full h-full flex items-center justify-center"><LoadingSpinner message="Loading Game..." /></div>;
    }

    const amIHost = gameData?.host === userId;
    const isPlayerInGame = gameData.players.some(p => p.id === userId);

    // The local handlers now just call the functions from the hook.
    const handleReadyForRematch = () => {
        console.log("GAMEROOM: Player clicked Ready for Rematch.");
        readyForRematch();
    };

    const handleStartRematch = () => {
        console.log("GAMEROOM: Host clicked Start Rematch.");
        startRematch();
    };

    const SpectatorView = () => (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
            {/* Spectators still see the table but cannot interact */}
            <CrazyEightsTable gameId={gameData.id} userId={userId} isSpectator={true} gameMode={gameMode}/>
            <div className="mt-4 text-center">
                <p className="text-xl text-yellow-300 font-bold mb-2">You are spectating.</p>
                {/* Spectator join logic can remain a direct service call for now */}
            </div>
        </div>
    );

    const renderGameContent = () => {
        console.log(`GAMEROOM: renderGameContent - Current gameData.status: ${gameData.status}`);

        // If explicitly a spectator and game is not finished, show spectator view
        if (isSpectator && gameData.status !== 'finished') {
            console.log("GAMEROOM: Rendering SpectatorView.");
            return <SpectatorView />;
        }

        switch (gameData.status) {
            case 'waiting':
                console.log("GAMEROOM: Rendering WaitingRoom.");
                return <div className="w-full h-full flex items-center justify-center p-4"><WaitingRoom gameData={gameData} /></div>;
            case 'playing':
            case 'choosing_suit':
                console.log(`GAMEROOM: Rendering CrazyEightsTable for status: ${gameData.status}.`);
                return <CrazyEightsTable gameId={gameData.id} userId={userId} isSpectator={isSpectator} gameMode={gameMode} />;
            case 'finished':
                console.log("GAMEROOM: Rendering Game Over screen.");
                const winner = gameData.players.find(p => p.id === gameData.winner) || { name: 'Someone' };
                const amIReadyForRematch = gameData.playersReadyForNextGame?.includes(userId);
                const allPlayersReady = gameData.players.length > 0 && gameData.playersReadyForNextGame?.length === gameData.players.length;

                return (
                    <div className="w-full max-w-md mx-auto p-6 bg-gray-800 rounded-2xl shadow-2xl border-2 border-yellow-500 flex flex-col items-center text-center">
                        <h2 className="text-3xl font-bold text-yellow-300 mb-2">Game Over!</h2>
                        <p className="text-lg text-white mb-6">{winner.name} wins the game!</p>

                        {gameMode === 'online' && (
                            <>
                                <div className="w-full mb-6">
                                    <h3 className="text-lg font-semibold text-purple-200 mb-3">Rematch Status</h3>
                                    <ul className="space-y-2">
                                    {gameData.players.map(p => (
                                        <li key={p.id} className="flex justify-between items-center bg-gray-700 p-2 rounded-md">
                                            <span>{p.name}</span>
                                            {gameData.playersReadyForNextGame?.includes(p.id)
                                                    ? <span className="text-green-400 font-bold">Ready</span>
                                                    : <span className="text-gray-400">Waiting...</span>
                                            }
                                        </li>
                                    ))}
                                    </ul>
                                </div>

                                {isPlayerInGame && (
                                    <button onClick={handleReadyForRematch} className={`w-full font-bold py-3 px-6 rounded-lg mb-3 transition-colors ${amIReadyForRematch ? 'bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                        {amIReadyForRematch ? 'Ready for Rematch!' : 'Ready for Rematch?'}
                                    </button>
                                )}

                                {amIHost && (
                                    <button onClick={handleStartRematch} disabled={!allPlayersReady} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                                        {allPlayersReady ? 'Start Rematch' : 'Waiting for Players...'}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                );
            default:
                console.warn(`GAMEROOM: Unknown game state encountered: ${gameData.status}`);
                return <div className="w-full h-full flex items-center justify-center"><LoadingSpinner message="Unknown game state..." /></div>;
        }
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-0 sm:p-4">
            {renderGameContent()}
        </div>
    );
};

export default GameRoom;
