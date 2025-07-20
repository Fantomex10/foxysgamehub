// =================================================================================
// FILE: src/hooks/useGameList.js
// =================================================================================
import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, onSnapshot, getDocs, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';

const getAppId = () => typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

export const useGameList = (db, userId) => {
    const [activeGames, setActiveGames] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const gamesQuery = useCallback(() => {
        if (!db) return null;
        const appId = getAppId();
        const gamesCollectionRef = collection(db, `artifacts/${appId}/public/data/games`);
        return query(gamesCollectionRef, where("status", "==", "waiting"));
    }, [db]);

    const refreshGames = useCallback(async () => {
        const q = gamesQuery();
        if (!q) return;

        setIsRefreshing(true);
        try {
            const querySnapshot = await getDocs(q);
            const games = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setActiveGames(games);
        } catch (error) {
            console.error("Error manually refreshing games:", error);
        } finally {
            setIsRefreshing(false);
        }
    }, [gamesQuery]);

    useEffect(() => {
        const q = gamesQuery();
        if (!q || !userId) return;

        setIsRefreshing(true);
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const games = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setActiveGames(games);
            setIsRefreshing(false);
        }, (error) => {
            console.error("Error with game list listener:", error);
            setIsRefreshing(false);
        });

        return () => unsubscribe();
    }, [userId, gamesQuery]);

    useEffect(() => {
        if (!db) return;
        const cleanupGames = async () => {
            const appId = getAppId();
            const gamesCollectionRef = collection(db, `artifacts/${appId}/public/data/games`);
            const now = Date.now();
            const STALE_GAME_TIMEOUT = 30 * 60 * 1000; // 30 minutes

            try {
                const q = query(gamesCollectionRef, where("status", "==", "waiting"));
                const querySnapshot = await getDocs(q);
                querySnapshot.forEach(async (docSnapshot) => {
                    const game = docSnapshot.data();

                    if (!game.createdAt || typeof game.createdAt.toDate !== 'function') {
                        return;
                    }

                    const createdAt = game.createdAt.toDate().getTime();

                    if (now - createdAt > STALE_GAME_TIMEOUT) {
                         console.log(`Deleting stale waiting game: ${docSnapshot.id}`);
                         await deleteDoc(docSnapshot.ref);
                    }
                });
            } catch (error) {
                console.error("Error during stale game cleanup:", error);
            }
        };

        const intervalId = setInterval(cleanupGames, 5 * 60 * 1000);
        cleanupGames();

        return () => clearInterval(intervalId);
    }, [db]);

    return { activeGames, isRefreshing, refreshGames };
};
