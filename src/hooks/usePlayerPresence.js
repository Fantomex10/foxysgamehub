// =================================================================================
// FILE: src/hooks/usePlayerPresence.js (NEW)
// =================================================================================
import { useState, useEffect, useContext } from 'react';
import { ref, onValue } from 'firebase/database';
import { FirebaseContext } from '../context/FirebaseProvider';

export const usePlayerPresence = (playerIds = []) => {
    const { rtdb } = useContext(FirebaseContext);
    const [presence, setPresence] = useState({});

    useEffect(() => {
        if (!rtdb || playerIds.length === 0) {
            setPresence({}); // Clear presence if no players
            return;
        }

        const listeners = playerIds.map(playerId => {
            const userStatusRef = ref(rtdb, `/status/${playerId}`);
            // Set initial state
            setPresence(prev => ({ ...prev, [playerId]: 'offline' }));

            const unsubscribe = onValue(userStatusRef, (snapshot) => {
                const status = snapshot.val()?.state || 'offline';
                setPresence(prev => ({ ...prev, [playerId]: status }));
            });
            return { playerId, unsubscribe };
        });

        // Cleanup function to remove all listeners when the component unmounts
        // or the list of players changes.
        return () => {
            listeners.forEach(({ unsubscribe }) => unsubscribe());
        };
    // Using JSON.stringify is a reliable way to check for deep equality in the dependency array.
    }, [rtdb, JSON.stringify(playerIds)]);

    return presence;
};