/*
================================================================================
|
| FILE: src/games/crazy_eights/GameRoom.jsx
|
| DESCRIPTION: The Game Arena.
| - Renders the correct view based on game status (Waiting, Playing, Finished).
| - Renders a dedicated Spectator view with a "Join Game" button.
| - Features a new "Ready for Rematch" system on the game over screen.
|
================================================================================
*/
import React, { useContext, useState } from 'react';
import { FirebaseContext } from '../../context/FirebaseProvider';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import CrazyEightsTable from './components/CrazyEightsTable';
import WaitingRoom from './components/WaitingRoom';
import * as gameService from '../../services/gameService';

const GameRoom = ({ gameData, isSpectator }) => {
    const { db, userId } = useContext(FirebaseContext);
    const [rematchError, setRematchError] = useState(null);

    if (!gameData || !gameData.status) {
        return <div className="w-full h-full flex items-center justify-center"><LoadingSpinner message="Loading Game..." /></div>;
    }

    const amIHost = gameData?.host === userId;
    const isPlayerInGame = gameData.players.some(p => p.id === userId);

    const handleReadyForRematch = () => {
        if (!isPlayerInGame) return;
        const isReady = gameData.playersReadyForNextGame?.includes(userId);
        gameService.setPlayerReadyForNextGame(db, gameData.id, userId, !isReady);
    };

    const handleStartRematch = async () => {
        if (!amIHost) return;
        setRematchError(null);
        try {
            await gameService.startRematch(db, gameData.id, userId);
        } catch (error) {
            console.error("Failed to start rematch:", error);
            setRematchError(error.message);
        }
    };

    const SpectatorView = () => (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <CrazyEightsTable gameData={gameData} gameId={gameData.id} userId={userId} isSpectator={true} onUserActivity={() => {}} />
            <div className="mt-4 text-center">
                <p className="text-xl text-yellow-300 font-bold mb-2">You are spectating.</p>
                {gameData.players.length < gameData.maxPlayers && (
                    <button
                        onClick={() => gameService.moveSpectatorToPlayer(db, gameData.id, userId, gameData.spectators.find(s => s.id === userId)?.name || 'Player')}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
                    >
                        Join Game
                    </button>
                )}
            </div>
        </div>
    );

    const renderGameContent = () => {
        if (isSpectator && gameData.status !== 'finished') {
            return <SpectatorView />;
        }

        switch (gameData.status) {
            case 'waiting':
                return <div className="w-full h-full flex items-center justify-center p-4"><WaitingRoom gameData={gameData} /></div>;
            case 'playing':
                return <CrazyEightsTable gameData={gameData} gameId={gameData.id} userId={userId} isSpectator={false} onUserActivity={() => {}} />;
            case 'finished':
                const winner = gameData.players.find(p => p.id === gameData.winner) || { name: 'Someone' };
                const amIReadyForRematch = gameData.playersReadyForNextGame?.includes(userId);
                const allPlayersReady = gameData.players.length > 0 && gameData.playersReadyForNextGame?.length === gameData.players.length;

                return (
                    <div className="w-full max-w-md mx-auto p-6 bg-gray-800 rounded-2xl shadow-2xl border-2 border-yellow-500 flex flex-col items-center text-center">
                        <h2 className="text-3xl font-bold text-yellow-300 mb-2">Game Over!</h2>
                        <p className="text-lg text-white mb-6">{winner.name} wins the game!</p>

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

                        {rematchError && <p className="text-red-400 mb-4">{rematchError}</p>}

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
                    </div>
                );
            default:
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
