
/*
================================================================================
|
| FILE: src/App.jsx
|
| DESCRIPTION: The Conductor.
| - Passes currentGameId to the lobby to act as the single source of truth.
|
================================================================================
*/
import React, { useState, useEffect, useContext } from 'react';
import { FirebaseProvider, FirebaseContext } from './context/FirebaseProvider';
import { UiProvider, useUi } from './context/UiProvider';
import { GameProvider } from './context/GameProvider';
import { useGameSession } from './hooks/useGameSession';
import { useGameState } from './hooks/useGameState';
import SplashScreen from './components/SplashScreen';
import LoadingSpinner from './components/ui/LoadingSpinner';
import GameLobby from './components/GameLobby';
import Header from './components/ui/Header';
import ProfilePanel from './components/ui/ProfilePanel';
import MenuPanel from './components/ui/MenuPanel';
import OptionsModal from './components/ui/OptionsModal';
import ConfirmDialog from './components/ui/ConfirmDialog';

import { gameRegistry } from './games';

// ErrorBoundary remains the same
class ErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false }; }
    static getDerivedStateFromError(error) { return { hasError: true }; }
    componentDidCatch(error, errorInfo) { console.error("ErrorBoundary caught an error:", error, errorInfo); }
    render() {
        if (this.state.hasError) {
            return <div className="fixed inset-0 bg-red-900 bg-opacity-90 flex items-center justify-center z-[100]"><div className="bg-red-800 p-6 rounded-lg shadow-xl text-white text-center max-w-md mx-auto"><h2 className="text-xl font-bold mb-3">Something went wrong!</h2><p className="mb-4 text-sm">Please try refreshing the page.</p></div></div>;
        }
        return this.props.children;
    }
}

const AppContent = () => {
    const { isAuthReady, userId, error: authError } = useContext(FirebaseContext);
    const { uiScale } = useUi();


    const [currentGameId, setCurrentGameId] = useState(() => localStorage.getItem('foxytcg-lastGameId'));
    const [isLoading, setIsLoading] = useState(!!currentGameId);
    const [error, setError] = useState(null);
    const [gameMode, setGameMode] = useState('online');

    const { createGame, joinGame, goToLobby, quitGame } = useGameSession({
        currentGameId,
        setCurrentGameId,
        setIsLoading,
        setError,
        setGameMode,
    });

    const gameData = useGameState();


    const [showSplash, setShowSplash] = useState(true);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);

    // Determine if the user is currently in an active game (not just in the lobby)
    const isInGame = !!gameData?.id && gameData.status !== 'lobby';

    // Effect for splash screen
    useEffect(() => {
        const timer = setTimeout(() => setShowSplash(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    // Effect for UI scaling
    useEffect(() => {
        document.body.classList.toggle('large-ui', uiScale === 'large');
    }, [uiScale]);


    // Handlers for menu actions
    const handleGoToLobby = () => {
        setIsMenuOpen(false);
        goToLobby();
        console.log("APP: Navigating to lobby.");
    };

    const handleQuitGame = () => {
        // Using a custom modal/dialog is recommended instead of window.confirm for better UX
        const confirmQuit = window.confirm("Are you sure you want to quit the game? This will forfeit the match and cannot be undone.");
        if (confirmQuit) {
            setIsMenuOpen(false);
            quitGame();
            console.log("APP: Quitting game.");
        }

    };

    const handleOpenOptions = () => {
        setIsMenuOpen(false);
        setIsOptionsOpen(true);
        console.log("APP: Opening options modal.");
        // Crucial fix: When opening options, ensure any game-related UI state is reset if needed
        // This was the source of the previous "freeze" bug.
        // For now, we rely on OptionsModal's own onClose to reset its state.
    }

    const renderContent = () => {
        console.log(`APP: renderContent - isLoading: ${isLoading}, currentGameId: ${currentGameId}, gameData.id: ${gameData?.id}, gameData.status: ${gameData?.status}, isInGame: ${isInGame}`);

        // If we have a currentGameId but no gameData yet, we are loading.
        // This condition ensures the spinner shows while waiting for Firestore data.
        if ((isLoading || (currentGameId && !gameData.id)) && gameMode === 'online') {
            return <div className="w-full h-full flex items-center justify-center"><LoadingSpinner message="Connecting..." /></div>;
        }


        // If we are in an active game, render the GameRoom
        if (isInGame) {
            console.log("APP: Rendering GameRoom.");
            const isSpectator = gameData.spectators?.some(s => s.id === userId) && !gameData.players.some(p => p.id === userId);
            return <GameRoom isSpectator={isSpectator} gameMode={gameMode} />;

        }

        // Otherwise, render the GameLobby
        console.log("APP: Rendering GameLobby.");
        return <GameLobby
            onCreateGame={createGame}
            onJoinGame={joinGame}
            setGameMode={setGameMode}
            activeGameId={currentGameId} // Pass the active game ID
        />;
    };

    // Initial splash screen display
    if (showSplash) {
        console.log("APP: Showing SplashScreen.");
        return <SplashScreen />;
    }

    // Authentication loading state
    if (!isAuthReady) {
        console.log("APP: Authenticating...");
        return <div className="w-full h-full flex items-center justify-center"><LoadingSpinner message="Authenticating..." /></div>;
    }

    // Display any general errors
    const displayError = error || authError;

    return (
        <div className="min-h-screen w-full bg-gray-900 text-white font-sans flex flex-col">


            <Header isInGame={isInGame} gameData={gameData} onProfileClick={() => setIsProfileOpen(true)} onMenuClick={() => setIsMenuOpen(true)} />
            <ProfilePanel isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
            <MenuPanel isOpen={isMenuOpen} isInGame={isInGame} onClose={() => setIsMenuOpen(false)} onGoToLobby={handleGoToLobby} onOpenOptions={handleOpenOptions} onQuitGame={handleQuitGame} />

            <main className={`pt-16 transition-all duration-300 ease-in-out flex-grow overflow-y-auto ${isProfileOpen ? 'md:ml-64' : ''}`}>
                 <div className="p-0 h-full w-full flex-grow flex flex-col">
                    {displayError && <div className="text-red-500 bg-red-900 p-3 rounded-md m-4 text-center">{displayError}</div>}
                    {userId ? <ErrorBoundary>{renderContent()}</ErrorBoundary> : <div className="w-full h-full flex items-center justify-center"><LoadingSpinner /></div>}
                 </div>
            </main>
            <OptionsModal isOpen={isOptionsOpen} onClose={() => setIsOptionsOpen(false)} gameData={gameData} />
        </div>
    );
};

const App = () => (
    <FirebaseProvider>

        <GameProvider>
            <UiProvider>
                <AppContent />
            </UiProvider>
        </GameProvider>

    </FirebaseProvider>
);

export default App;
