/*
================================================================================
|
| FILE: src/App.jsx
|
| DESCRIPTION: The Conductor.
| - Manages state for all primary UI panels (Profile, Menu, Options).
| - Renders a consistent Header and MenuPanel across all screens.
| - Fetches `isSpectator` state to provide the correct view.
|
================================================================================
*/
import React, { useState, useEffect, useContext } from 'react';
import { FirebaseProvider, FirebaseContext } from './context/FirebaseProvider';
import { UiProvider, useUi } from './context/UiProvider';
import { useGameSession } from './hooks/useGameSession';
import SplashScreen from './components/SplashScreen';
import LoadingSpinner from './components/ui/LoadingSpinner';
import GlobalStyles from './components/ui/GlobalStyles';
import GameLobby from './components/GameLobby';
import GameRoom from './games/crazy_eights/GameRoom';
import Header from './components/ui/Header';
import ProfilePanel from './components/ui/ProfilePanel';
import MenuPanel from './components/ui/MenuPanel';
import OptionsModal from './components/ui/OptionsModal';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true };
    }
    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        this.setState({ error: error, errorInfo: errorInfo });
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="fixed inset-0 bg-red-900 bg-opacity-90 flex items-center justify-center z-[100]">
                    <div className="bg-red-800 p-6 rounded-lg shadow-xl text-white text-center max-w-md mx-auto">
                        <h2 className="text-xl font-bold mb-3">Something went wrong!</h2>
                        <p className="mb-4 text-sm">Please try refreshing the page or clearing site data.</p>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

const AppContent = () => {
    const { isAuthReady, userId, error: authError } = useContext(FirebaseContext);
    const { uiScale } = useUi();
    const {
        gameData,
        currentGameId,
        isSpectator,
        isLoading,
        error: gameError,
        createGame,
        joinGame,
        goToLobby,
        quitGame,
    } = useGameSession();

    const [showSplash, setShowSplash] = useState(true);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);

    const isInGame = !!currentGameId;

    useEffect(() => {
        const timer = setTimeout(() => setShowSplash(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        document.body.classList.toggle('large-ui', uiScale === 'large');
    }, [uiScale]);

    const handleGoToLobby = () => {
        setIsMenuOpen(false);
        goToLobby();
    };

    const handleQuitGame = () => {
        const confirmQuit = window.confirm("Are you sure you want to quit the game? This will forfeit the match and cannot be undone.");
        if (confirmQuit) {
            setIsMenuOpen(false);
            quitGame();
        }
    };

    const handleOpenOptions = () => {
        setIsMenuOpen(false);
        setIsOptionsOpen(true);
    }

    const renderContent = () => {
        if (isLoading) {
            return <div className="w-full h-full flex items-center justify-center"><LoadingSpinner message="Connecting..." /></div>;
        }

        if (isInGame && gameData) {
            return <GameRoom gameData={gameData} isSpectator={isSpectator} />;
        }

        return <GameLobby onCreateGame={createGame} onJoinGame={joinGame} />;
    };

    if (showSplash) return <SplashScreen />;
    if (!isAuthReady) return <div className="w-full h-full flex items-center justify-center"><LoadingSpinner message="Authenticating..." /></div>;

    const displayError = authError || gameError;

    return (
        <div className="min-h-screen w-full bg-gray-900 text-white font-sans flex flex-col">
            <GlobalStyles />
            <Header
                isInGame={isInGame}
                gameData={gameData}
                onProfileClick={() => setIsProfileOpen(true)}
                onMenuClick={() => setIsMenuOpen(true)}
            />
            <ProfilePanel isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
            <MenuPanel
                isOpen={isMenuOpen}
                isInGame={isInGame}
                onClose={() => setIsMenuOpen(false)}
                onGoToLobby={handleGoToLobby}
                onOpenOptions={handleOpenOptions}
                onQuitGame={handleQuitGame}
            />

            <main className={`pt-16 transition-all duration-300 ease-in-out flex-grow overflow-y-auto ${isProfileOpen ? 'md:ml-64' : ''}`}>
                 <div className="p-0 h-full w-full flex-grow flex flex-col">
                    {displayError && <div className="text-red-500 bg-red-900 p-3 rounded-md m-4 text-center">{displayError}</div>}
                    {userId ? (
                        <ErrorBoundary>
                            {renderContent()}
                        </ErrorBoundary>
                    ) : (
                         <div className="w-full h-full flex items-center justify-center"><LoadingSpinner /></div>
                    )}
                 </div>
            </main>

            <OptionsModal
                isOpen={isOptionsOpen}
                onClose={() => setIsOptionsOpen(false)}
                gameData={gameData}
            />
        </div>
    );
};

const App = () => (
    <FirebaseProvider>
        <UiProvider>
            <AppContent />
        </UiProvider>
    </FirebaseProvider>
);

export default App;
