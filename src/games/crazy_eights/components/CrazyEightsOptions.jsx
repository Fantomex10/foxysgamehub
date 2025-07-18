// =================================================================================
// FILE: src/games/crazy_eights/components/CrazyEightsOptions.jsx
// =================================================================================
import React from 'react';

const CrazyEightsOptions = ({ options, setOptions, disabled }) => {
    const handleOptionChange = (e) => {
        const { name, checked } = e.target;
        setOptions(prev => ({ ...prev, [name]: checked }));
    };

    return (
        <div className="w-full p-3 bg-gray-700/50 rounded-lg border border-purple-700">
            <h4 className="text-md font-semibold text-purple-200 mb-2">Game Rules</h4>
            <div className="space-y-2 text-sm">
                <label className={`flex items-center justify-between ${disabled ? 'opacity-50' : ''}`}>
                    <span className="text-gray-300">Stacking Twos (+2, +4, etc.)</span>
                    <input
                        type="checkbox"
                        name="stackTwos"
                        checked={options.stackTwos}
                        onChange={handleOptionChange}
                        disabled={disabled}
                        className="form-checkbox h-5 w-5 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                    />
                </label>
                <label className={`flex items-center justify-between ${disabled ? 'opacity-50' : ''}`}>
                    <span className="text-gray-300">Jacks Skip Turn</span>
                    <input
                        type="checkbox"
                        name="jackSkips"
                        checked={options.jackSkips}
                        onChange={handleOptionChange}
                        disabled={disabled}
                        className="form-checkbox h-5 w-5 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                    />
                </label>
            </div>
        </div>
    );
};

export default CrazyEightsOptions;
