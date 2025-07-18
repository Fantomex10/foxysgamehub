// =================================================================================
// FILE: src/components/GameLobby.jsx
// DESCRIPTION: Adds the "Rejoin Last Game" feature.
// =================================================================================
import React, { useState, useEffect, useContext } from 'react';
import { FirebaseContext } from '../context/FirebaseProvider';
import { useGameList } from '../hooks/useGameList';
import LoadingSpinner from './ui/LoadingSpinner';

const GameLobby = ({ onCreateGame, onJoinGame }) => {
    const { db, userId } = useContext(FirebaseContext);

    const [playerName, setPlayerName] = useState(() => localStorage.getItem('foxytcg-player-name') || '');
    const [gameName, setGameName] = useState('');
    const [joinCodeInput, setJoinCodeInput] = useState('');
    const [gameType, setGameType] = useState('crazy_eights');
    const [maxPlayers, setMaxPlayers] = useState(4);
    const [message, setMessage] = useState('');
    const [activeTab, setActiveTab] = useState('start');
    const [lastGameId, setLastGameId] = useState(null);

    useEffect(() => {
        if (playerName) localStorage.setItem('foxytcg-player-name', playerName);
    }, [playerName]);

    useEffect(() => {
        // Check for a game to rejoin when the lobby loads
        const gameIdToRejoin = localStorage.getItem('foxytcg-lastGameId');
        if (gameIdToRejoin) {
            setLastGameId(gameIdToRejoin);
        }
    }, []);

    const { activeGames, isRefreshing, refreshGames } = useGameList(db, userId);

    const handleCreateGame = () => {
        if (!playerName.trim()) {
            setMessage('Please enter your name before creating a game.');
            return;
        }
        onCreateGame({
            playerName,
            gameName: gameName.trim() || `${playerName}'s Game`,
            gameType,
            maxPlayers: Number(maxPlayers),
        });
    };

    const handleJoinGame = (gameId) => {
        if (!playerName.trim()) {
            setMessage('Please enter your name before joining a game.');
            return;
        }
        if (!gameId) {
             setMessage('Please enter a valid Join Code or select a game from the list.');
             return;
        }
        onJoinGame(gameId, playerName);
    };

     const handleJoinByCode = () => {
        const code = joinCodeInput.trim();
        if (!code) {
            setMessage("Please enter a join code.");
            return;
        }
        const gameToJoin = activeGames.find(g => g.joinCode === code);
        if (gameToJoin) {
            handleJoinGame(gameToJoin.id);
        } else {
            setMessage(`No game found with code: ${code}`);
        }
    };

    const handleRejoin = () => {
        if (lastGameId) {
            handleJoinGame(lastGameId);
        }
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-start">
            <div className="w-full max-w-full sm:max-w-xl mx-auto flex flex-col items-center p-4 flex-grow">
                <h2 className="text-3xl font-bold mb-4 text-yellow-300">Game Lobby</h2>
                <div className="w-full max-w-md mb-4">
                    <input
                        type="text"
                        placeholder="Enter Your Name"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                </div>

                {lastGameId && (
                    <div className="w-full max-w-md mb-4 p-3 bg-purple-800 border border-purple-600 rounded-lg flex items-center justify-between">
                        <p className="text-white font-semibold">You have a game in progress.</p>
                        <button onClick={handleRejoin} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-1 px-4 rounded-md transition-colors">
                            Rejoin
                        </button>
                    </div>
                )}


                <div className="flex w-full border-b border-purple-700 mb-4">
                    <button onClick={() => setActiveTab('start')} className={`flex-1 py-2 text-sm font-bold transition-colors ${activeTab === 'start' ? 'text-yellow-300 border-b-2 border-yellow-300' : 'text-gray-400'}`}>Create Game</button>
                    <button onClick={() => setActiveTab('browse')} className={`flex-1 py-2 text-sm font-bold transition-colors ${activeTab === 'browse' ? 'text-yellow-300 border-b-2 border-yellow-300' : 'text-gray-400'}`}>Browse Games ({activeGames.length})</button>
                </div>
                {message && <p className="text-center text-yellow-400 mb-4 text-sm">{message}</p>}

                {activeTab === 'start' && (
                    <div className="w-full flex flex-col items-center gap-4 max-w-md">
                        <h3 className="font-bold text-lg text-yellow-200">Create a New Game</h3>
                        <input type="text" placeholder="Custom Game Name (Optional)" value={gameName} onChange={(e) => setGameName(e.target.value)} className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
                        <div className="w-full flex gap-4">
                            <div className="flex-1">
                                <label className="text-xs text-gray-400">Game</label>
                                <select value={gameType} onChange={(e) => setGameType(e.target.value)} className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm">
                                    <option value="crazy_eights">Crazy Eights</option><option disabled>Hearts (soon)</option><option disabled>Spades (soon)</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-gray-400">Players</label>
                                <select value={maxPlayers} onChange={(e) => setMaxPlayers(e.target.value)} className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm">
                                    {[2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>
                        </div>
                        <button onClick={handleCreateGame} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition transform hover:scale-105 text-sm">Create Game</button>
                    </div>
                )}

                {activeTab === 'browse' && (
                     <div className="w-full flex-grow flex flex-col min-h-0">
                        <div className="w-full flex flex-col sm:flex-row gap-2 mb-4">
                            <input type="text" placeholder="Enter 4-Digit Join Code" value={joinCodeInput} onChange={(e) => setJoinCodeInput(e.target.value)} className="flex-grow p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
                            <button onClick={handleJoinByCode} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition transform hover:scale-105 text-sm">Join by Code</button>
                        </div>
                        <div className="flex justify-between items-center w-full border-gray-600 my-4 border-t pt-4">
                            <h3 className="text-lg font-bold text-yellow-200">Active Games</h3>
                            <button onClick={refreshGames} disabled={isRefreshing} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-1 px-3 rounded-lg text-sm transition-opacity disabled:opacity-50">
                                {isRefreshing ? <LoadingSpinner /> : 'Refresh'}
                            </button>
                        </div>
                        <ul className="w-full space-y-2 flex-grow overflow-y-auto">
                            {isRefreshing ? <LoadingSpinner /> : activeGames.length === 0 ? <p className="text-gray-400 text-sm text-center">No active games found.</p> : (
                                activeGames.map((game) => (
                                    <li key={game.id} className="bg-gray-700 p-2 rounded-lg flex flex-col shadow-md text-sm">
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex flex-col">
                                                <p className="text-purple-300 font-bold text-base leading-tight">{game.gameName}</p>
                                                <span className="font-mono text-yellow-300 text-xs leading-none">#{game.joinCode || 'N/A'}</span>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-gray-400 text-base font-semibold whitespace-nowrap">({game.players.length}/{game.maxPlayers})</span>
                                                <button onClick={() => handleJoinGame(game.id)} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-1 px-2 rounded-lg text-xs w-full">Join</button>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-400 leading-tight">{game.gameType} • Host: {game.players.find(p => p.id === game.host)?.name || '...'}</p>
                                    </li>
                                ))
                            )}
                        </ul>
                     </div>
                )}
            </div>
        </div>
    );
};
export default GameLobby;
