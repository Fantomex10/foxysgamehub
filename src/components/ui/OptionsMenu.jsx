// =================================================================================
// FILE: src/components/ui/OptionsMenu.jsx (Robustness Fix)
// =================================================================================
// This version fixes a crash by conditionally rendering game-specific settings.
// The "Max Players" and "Save Changes" controls will now only appear if the
// necessary `onMaxPlayersChange` function is provided as a prop.
// =================================================================================
import React, { useState, useContext } from 'react';
import { useUi } from '../../context/UiProvider';

const OptionsMenu = ({ isOpen, onClose, onQuit, gameData, onMaxPlayersChange }) => {
    const { uiScale, setUiScale } = useUi();

    // Safely initialize state, even if gameData is not fully available yet.
    const [newMaxPlayers, setNewMaxPlayers] = useState(gameData?.maxPlayers || 4);

    // BUG FIX: Determine if game-specific options can be changed.
    // This is only possible if the handler function is passed in.
    const canChangeGameSettings = typeof onMaxPlayersChange === 'function';

    // Safely check host status.
    const isHost = gameData?.host && gameData?.players.some(p => p.id === gameData.host);

    const handleSaveChanges = () => {
        // Only proceed if the handler exists.
        if (canChangeGameSettings) {
            onMaxPlayersChange(Number(newMaxPlayers));
        }
        onClose();
    };

    // Don't render if not open
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-700 p-6 rounded-xl shadow-2xl w-full max-w-sm border border-purple-500 text-white">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-yellow-300">Options</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-2xl font-bold">×</button>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-2 text-purple-200">UI Scale</h3>
                        <div className="flex gap-2">
                            <button onClick={() => setUiScale('normal')} className={`flex-1 font-bold py-2 px-4 rounded-lg transition-colors ${uiScale === 'normal' ? 'bg-blue-600 text-white' : 'bg-gray-600 hover:bg-gray-500'}`}>Normal</button>
                            <button onClick={() => setUiScale('large')} className={`flex-1 font-bold py-2 px-4 rounded-lg transition-colors ${uiScale === 'large' ? 'bg-blue-600 text-white' : 'bg-gray-600 hover:bg-gray-500'}`}>Large</button>
                        </div>
                    </div>

                    {/* BUG FIX: Only show this section if the functionality is available */}
                    {canChangeGameSettings && (
                        <div>
                            <h3 className="text-lg font-semibold mb-2 text-purple-200">Max Players</h3>
                             <select
                                value={newMaxPlayers}
                                onChange={(e) => setNewMaxPlayers(e.target.value)}
                                disabled={!isHost}
                                className="w-full p-2 rounded-lg bg-gray-600 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {[2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                            {!isHost && (
                                <p className="text-xs text-gray-400 mt-1">Only the host can change the number of seats.</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-8 flex flex-col gap-3">
                     {/* BUG FIX: Only show this button if the functionality is available */}
                     {canChangeGameSettings && (
                         <button
                            onClick={handleSaveChanges}
                            disabled={!isHost || Number(newMaxPlayers) === gameData?.maxPlayers}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Save Changes
                        </button>
                     )}
                     <button onClick={onQuit} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg">
                        Quit Game
                     </button>
                </div>
            </div>
        </div>
    );
};

export default OptionsMenu;