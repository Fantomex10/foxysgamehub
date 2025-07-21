// =================================================================================
// FILE: src/games/crazy_eights/components/Scoreboard.jsx (Revamped)
// =================================================================================
import React, { useState, useRef, useEffect } from 'react';
import { usePlayerPresence } from '../../../hooks/usePlayerPresence';
import SpectatorPopover from './SpectatorPopover';

// Custom hook to detect clicks outside of a component
const useClickOutside = (ref, callback) => {
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                callback();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref, callback]);
};


const Scoreboard = ({ gameData, userId }) => {
    const { players, playersHands, currentTurn, gameHistory, spectators, gameMessage } = gameData;
    const [showPastMoves, setShowPastMoves] = useState(false);
    const [showSpectators, setShowSpectators] = useState(false);

    const pastMovesRef = useRef(null);
    const spectatorsRef = useRef(null);
    useClickOutside(pastMovesRef, () => setShowPastMoves(false));
    useClickOutside(spectatorsRef, () => setShowSpectators(false));

    const playerIds = players.map(p => p.id);
    const presenceStatus = usePlayerPresence(playerIds);

    const spectatorCount = spectators?.length || 0;
    const isSpectating = spectatorCount > 0;

    return (
        <div className="w-full grid grid-cols-6 gap-2 px-2 sm:px-4 py-2 bg-black/20 rounded-b-lg">
            {/* Left Column: Players */}
            <div className="col-span-2">
                 <div className="grid grid-cols-2 gap-1">
                     {players.map(player => {
                        const isCurrentTurn = player.id === currentTurn;
                        const cardCount = playersHands[player.id]?.length || 0;
                        const isMe = player.id === userId;
                        const isOnline = presenceStatus[player.id] === 'online';

                        return (
                            <div key={player.id} className={`p-1.5 rounded-md text-xs transition-all ${isCurrentTurn ? 'bg-yellow-500/30 ring-1 ring-yellow-400' : 'bg-gray-700/50'}`}>
                                <p className={`font-bold truncate flex items-center gap-1.5 ${isMe ? 'text-yellow-300' : 'text-white'}`}>
                                    <span>{player.name} ({cardCount})</span>
                                    {isCurrentTurn && <span className="text-yellow-200 animate-pulse font-mono">...</span>}
                                    {!isOnline && <span className="text-red-400 font-bold">(DC)</span>}
                                </p>
                            </div>
                        );
                    })}
                 </div>
            </div>

            {/* Center Column: Game Log */}
            <div className="col-span-3 text-center flex flex-col justify-start items-center pt-1" ref={pastMovesRef}>
                 <p className="text-gray-200 font-semibold text-xs leading-tight mb-1 h-12 overflow-hidden">{gameMessage}</p>
                 <button onClick={() => setShowPastMoves(prev => !prev)} className="text-gray-400 hover:text-gray-200 text-xs px-2 py-0.5 rounded-md bg-black/20">
                    Past Moves {showPastMoves ? '▲' : '▼'}
                </button>
                 {showPastMoves && (
                    <div className="absolute z-10 bg-gray-800 border border-purple-600 rounded-lg shadow-xl mt-8 p-2 max-h-40 overflow-y-auto w-full max-w-xs">
                        <ul className="text-left text-gray-200 text-xs space-y-1">
                            {gameHistory && gameHistory.slice().reverse().map((entry, index) => (
                                <li key={index} className="border-b border-gray-600 pb-1 last:border-b-0">
                                    <span className="text-gray-400 mr-2">
                                    {entry.timestamp && typeof entry.timestamp.toDate === 'function'
                                        ? new Date(entry.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                        : ''}
                                    </span>
                                    {entry.message}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Right Column: Spectators */}
            <div className="col-span-1 flex justify-end items-start pt-1" ref={spectatorsRef}>
                 <div className="relative">
                    <button onClick={() => setShowSpectators(prev => !prev)} className={`flex items-center justify-end gap-1.5 transition-colors ${isSpectating ? 'text-yellow-300 hover:text-yellow-200' : 'text-gray-400 hover:text-gray-200'}`}>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C3.732 4.943 9.522 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-9.03 7-9.542 7S3.732 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                        <span className="font-bold text-sm">{spectatorCount}</span>
                    </button>
                    {showSpectators && <SpectatorPopover spectators={spectators} />}
                 </div>
            </div>
        </div>
    );
};

export default Scoreboard;