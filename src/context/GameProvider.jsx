// ========================================================================
// FILE: src/context/GameProvider.jsx (Updated)
// ========================================================================
/*
DESCRIPTION:
This file provides the GameEngine instance to the entire React application
using a Context Provider.

KEY CHANGES:
1.  Imports all exported functions from the logic file as a single object,
    'crazyEightsLogic'.
2.  Instantiates the GameEngine with the 'crazyEightsLogic' object,
    fulfilling the new constructor requirement.
*/

import React, { createContext, useContext, useMemo } from 'react';
import { GameEngine } from '../engine/GameEngine';

// Import all the functions from our logic file as a single object
import * as crazyEightsLogic from '../games/crazy_eights/logic';

const GameContext = createContext(null);

export const GameProvider = ({ children }) => {
    // useMemo ensures the GameEngine is only created once per application lifecycle.
    const engine = useMemo(() => {
        // Here is the crucial change: We pass the imported logic
        // object directly to the GameEngine constructor.
        return new GameEngine(crazyEightsLogic);
    }, []);

    return (
        <GameContext.Provider value={engine}>
            {children}
        </GameContext.Provider>
    );
};

// A custom hook to easily access the engine from any component.
export const useGameEngine = () => {
    const engine = useContext(GameContext);
    if (!engine) {
        throw new Error("useGameEngine must be used within a GameProvider.");
    }
    return engine;
};