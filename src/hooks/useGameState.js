// src/hooks/useGameState.js

import { useState, useEffect } from 'react';
import { useGameEngine } from '../context/GameProvider';

// This hook subscribes a component to the GameEngine's state.
export const useGameState = () => {
    const engine = useGameEngine();
    const [gameState, setGameState] = useState(engine.getState());

    useEffect(() => {
        // The subscribe method returns an `unsubscribe` function.
        // React's useEffect cleanup will call it when the component unmounts.
        const unsubscribe = engine.subscribe(setGameState);
        return unsubscribe;
    }, [engine]);

    return gameState;
};

