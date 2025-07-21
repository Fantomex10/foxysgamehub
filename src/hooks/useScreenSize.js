// =================================================================================
// FILE: src/hooks/useScreenSize.js
// =================================================================================
import { useState, useEffect } from 'react';

export const useScreenSize = () => {
    const [screenSize, setScreenSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        const handleResize = () => {
            setScreenSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);

        // Cleanup the event listener when the component unmounts
        return () => window.removeEventListener('resize', handleResize);
    }, []); // Empty dependency array ensures this runs only once on mount

    return screenSize;
};