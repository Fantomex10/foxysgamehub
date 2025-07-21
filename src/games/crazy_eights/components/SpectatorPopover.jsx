// =================================================================================
// FILE: src/games/crazy_eights/components/SpectatorPopover.jsx (NEW)
// =================================================================================
import React from 'react';

const SpectatorPopover = ({ spectators }) => {
    return (
        <div className="absolute z-10 top-full right-0 mt-2 bg-gray-800 border border-purple-600 rounded-lg shadow-xl p-3 w-48">
            <h4 className="font-bold text-purple-200 border-b border-purple-700 pb-1 mb-2">Watching</h4>
            {spectators && spectators.length > 0 ? (
                <ul className="text-left text-gray-200 text-sm space-y-1">
                    {spectators.map(spec => (
                        <li key={spec.id} className="truncate">{spec.name}</li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-400 text-sm">No one is watching.</p>
            )}
        </div>
    );
};

export default SpectatorPopover;