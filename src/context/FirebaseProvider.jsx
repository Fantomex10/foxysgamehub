// =================================================================================
// FILE: src/context/FirebaseProvider.jsx (Singleton Fix)
// =================================================================================
// This version fixes the double-initialization bug caused by React's StrictMode.
// Firebase is now initialized once as a module-level singleton, and the provider
// component only handles the authentication state.
// =================================================================================
import React, { createContext, useEffect, useState } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { getDatabase, ref, onValue, set, onDisconnect, serverTimestamp } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';

// --- SINGLETON INITIALIZATION ---
// This code now runs only ONCE when the module is first imported.
let firebaseApp;
let db, auth, rtdb;

try {
    // Check if a Firebase app is already initialized to prevent errors.
    if (!getApps().length) {
        console.log("Initializing Firebase App for the first time...");
        let firebaseConfig;

        if (typeof __firebase_config !== 'undefined' && __firebase_config) {
            console.log("Using Canvas environment variables for Firebase config.");
            firebaseConfig = JSON.parse(__firebase_config);
        } else if (import.meta.env.VITE_FIREBASE_PROJECT_ID) {
            console.log("Using .env variables for Firebase config (Vite).");
            firebaseConfig = {
                apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
                authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
                projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
                storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
                messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
                appId: import.meta.env.VITE_FIREBASE_APP_ID,
                databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
            };
        } else {
            throw new Error("Firebase configuration is missing.");
        }
        firebaseApp = initializeApp(firebaseConfig);
    } else {
        console.log("Firebase App already initialized.");
        firebaseApp = getApps()[0];
    }

    // Initialize services from the single app instance.
    db = getFirestore(firebaseApp);
    auth = getAuth(firebaseApp);
    rtdb = getDatabase(firebaseApp);

} catch (e) {
    console.error("FATAL: Firebase failed to initialize.", e);
    // We can expose the error through a dummy provider if needed,
    // but for now, the app will likely crash, which is appropriate.
}
// --- END SINGLETON INITIALIZATION ---


// Create the context that our components will use to access Firebase services
export const FirebaseContext = createContext(null);

// Create a custom provider component
export const FirebaseProvider = ({ children }) => {
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // The useEffect hook now only handles the authentication logic,
        // which is safe to run multiple times under StrictMode.
        console.log("Setting up Firebase Auth listener...");

        if (!auth) {
            setError("Firebase Auth service is not available.");
            setIsAuthReady(true);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            try {
                if (user) {
                    setUserId(user.uid);

                    // --- PRESENCE LOGIC for Realtime Database ---
                    const userStatusDatabaseRef = ref(rtdb, '/status/' + user.uid);
                    const isOfflineForDatabase = { state: 'offline', last_changed: serverTimestamp() };
                    const isOnlineForDatabase = { state: 'online', last_changed: serverTimestamp() };
                    const connectedRef = ref(rtdb, '.info/connected');

                    onValue(connectedRef, (snap) => {
                        if (snap.val() === true) {
                            onDisconnect(userStatusDatabaseRef).set(isOfflineForDatabase).then(() => {
                                set(userStatusDatabaseRef, isOnlineForDatabase);
                            });
                        }
                    });
                    // --- END PRESENCE LOGIC ---
                } else {
                    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                        await signInWithCustomToken(auth, __initial_auth_token);
                    } else {
                        await signInAnonymously(auth);
                    }
                }
            } catch (authError) {
                console.error("Authentication Error:", authError);
                setError(`Authentication failed: ${authError.message}`);
            } finally {
                // This ensures the app doesn't unblock until auth state is resolved.
                if (!isAuthReady) {
                    setIsAuthReady(true);
                }
            }
        });

        return () => {
            console.log("Cleaning up Firebase Auth listener.");
            unsubscribe();
        }
    }, [isAuthReady]); // Dependency ensures this runs once auth is ready.

    // The value now provides the singleton instances of the services.
    const value = { db, auth, rtdb, userId, isAuthReady, error };

    return (
        <FirebaseContext.Provider value={value}>
            {children}
        </FirebaseContext.Provider>
    );
};