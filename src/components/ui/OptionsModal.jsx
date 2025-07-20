// =================================================================================
// FILE: src/components/ui/OptionsModal.jsx
// =================================================================================
import React, { useContext, useState, useEffect } from 'react';
import { useUi } from '../../context/UiProvider';
import { FirebaseContext } from '../../context/FirebaseProvider';
import * as gameService from '../../services/gameService';
import { gameRegistry } from '../../games'; // +++ ADDED

const OptionsModal = ({ isOpen, onClose, gameData }) => {
    const { uiScale, setUiScale } = useUi();
    const { db, userId } = useContext(FirebaseContext);
    const [maxPlayers, setMaxPlayers] = useState(gameData?.maxPlayers || 4);
    const [settingsMessage, setSettingsMessage] = useState('');
    // +++ ADDED: State for game options
    const [gameOptions, setGameOptions] = useState(gameData?.gameOptions || {});

    useEffect(() => {
        if (isOpen && gameData) {
            setMaxPlayers(gameData.maxPlayers);
            setGameOptions(gameData.gameOptions || {});
            setSettingsMessage('');
        }
    }, [isOpen, gameData]);

    if (!isOpen || !gameData) return null;

    const amIHost = gameData.host === userId;
    const canChangeSettings = amIHost && (gameData.status === 'waiting' || gameData.status === 'finished');

    const handleKickPlayer = (playerIdToKick) => {
        if (!amIHost) return;
        const player = gameData.players.find(p => p.id === playerIdToKick);
        if (window.confirm(`Are you sure you want to KICK ${player.name}? They will be removed from the game.`)) {
            gameService.kickPlayer(db, gameData.id, userId, playerIdToKick)
                .catch(err => alert(`Failed to kick player: ${err.message}`));
        }
    };

    const handleMoveToSpectator = (playerIdToMove) => {
        if (!amIHost) return;
        const player = gameData.players.find(p => p.id === playerIdToMove);
        if (window.confirm(`Are you sure you want to move ${player.name} to spectators? They can rejoin if a spot opens.`)) {
            gameService.movePlayerToSpectator(db, gameData.id, userId, playerIdToMove)
                .catch(err => alert(`Failed to move player: ${err.message}`));
        }
    };

    const handleSaveChanges = async () => {
        if (!canChangeSettings) return;
        setSettingsMessage('');
        try {
            await gameService.changeMaxPlayers(db, gameData.id, userId, Number(maxPlayers));
            await gameService.updateGameOptions(db, gameData.id, userId, gameOptions);
            setSettingsMessage('Settings updated!');
        } catch (error) {
            setSettingsMessage(`Error: ${error.message}`);
        } finally {
            setTimeout(() => setSettingsMessage(''), 3000);
        }
    };

    const OptionsComponent = gameRegistry[gameData.gameType]?.OptionsComponent;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md border-2 border-purple-700 text-white">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-yellow-300">Options</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-3xl font-bold">&times;</button>
                </div>

                <div className="space-y-6">
                    {/* UI Scale */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2 text-purple-200">UI Scale</h3>
                        <div className="flex gap-2">
                            <button onClick={() => setUiScale('normal')} className={`flex-1 font-bold py-2 px-4 rounded-lg transition-colors ${uiScale === 'normal' ? 'bg-blue-600 text-white' : 'bg-gray-600 hover:bg-gray-500'}`}>Normal</button>
                            <button onClick={() => setUiScale('large')} className={`flex-1 font-bold py-2 px-4 rounded-lg transition-colors ${uiScale === 'large' ? 'bg-blue-600 text-white' : 'bg-gray-600 hover:bg-gray-500'}`}>Large</button>
                        </div>
                    </div>

                     {amIHost && (
                        <>
                            {/* Game Settings */}
                            <div>
                                <h3 className="text-lg font-semibold mb-2 text-purple-200">Game Settings</h3>
                                <div className="flex items-center gap-3 mb-4">
                                    <label htmlFor="maxPlayers" className="text-gray-300">Max Players:</label>
                                    <select id="maxPlayers" value={maxPlayers} onChange={(e) => setMaxPlayers(e.target.value)} disabled={!canChangeSettings} className="p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm disabled:opacity-50">
                                        {[2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                                {OptionsComponent && <OptionsComponent options={gameOptions} setOptions={setGameOptions} disabled={!canChangeSettings} />}
                                {canChangeSettings && (
                                    <button onClick={handleSaveChanges} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-sm mt-4">Apply Changes</button>
                                )}
                                {!canChangeSettings && <p className="text-xs text-gray-400 mt-2">Game settings can only be changed by the host in the lobby or after a game.</p>}
                                {settingsMessage && <p className="text-sm text-yellow-300 mt-2">{settingsMessage}</p>}
                            </div>

                            {/* Player Management */}
                            <div>
                                <h3 className="text-lg font-semibold mb-2 text-purple-200">Player Management</h3>
                                <ul className="space-y-2 max-h-40 overflow-y-auto">
                                    {gameData.players.filter(p => p.id !== userId).map(player => (
                                        <li key={player.id} className="bg-gray-700 p-2 rounded-lg flex items-center justify-between">
                                            <span className="font-semibold">{player.name}</span>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleMoveToSpectator(player.id)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded-md text-xs">Spectate</button>
                                                <button onClick={() => handleKickPlayer(player.id)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded-md text-xs">Kick</button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OptionsModal;
