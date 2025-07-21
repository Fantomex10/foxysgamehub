 
// =================================================================================
// FILE: src/context/UiProvider.jsx
// =================================================================================
import React, { createContext, useState, useEffect, useMemo, useContext } from 'react';

export const UiContext = createContext(null);

export const UiProvider = ({ children }) => {
    // Get the saved preference or default to 'normal'
    const [uiScale, setUiScale] = useState(
        () => localStorage.getItem('foxytcg-ui-scale') || 'normal'
    );

    // Save the preference whenever it changes
    useEffect(() => {
        localStorage.setItem('foxytcg-ui-scale', uiScale);
    }, [uiScale]);

    // useMemo ensures the context value object is stable
    const value = useMemo(() => ({
        uiScale,    // 'normal' or 'large'
        setUiScale, // function to change the scale
    }), [uiScale]);

    return (
        <UiContext.Provider value={value}>
            {children}
        </UiContext.Provider>
    );
};

// Custom hook for easier consumption
export const useUi = () => {
    const context = useContext(UiContext);
    if (!context) {
        throw new Error('useUi must be used within a UiProvider');
    }
    return context;
};