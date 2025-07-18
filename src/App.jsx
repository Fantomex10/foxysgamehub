// =================================================================================
// FILE: src/App.jsx (UPDATED)
// DESC: The import and usage of the `<GlobalStyles />` component have been
//       removed, as these styles are now handled by `src/index.css`.
// =================================================================================
import React, { useState, useEffect, useContext } from 'react';
import { FirebaseProvider, FirebaseContext } from './context/FirebaseProvider';
import { UiProvider, useUi } from './context/UiProvider';
import { ModalProvider, useModal } from './context/ModalProvider';
import { useGameSession } from './hooks/useGameSession';
import SplashScreen from './components/SplashScreen';
import LoadingSpinner from './components/ui/LoadingSpinner';
// REMOVED: import GlobalStyles from './components/ui/GlobalStyles';
import GameLobby from './components/GameLobby';
import Header from './components/ui/Header';
import ProfilePanel from './components/ui/ProfilePanel';
import MenuPanel from './components/ui/MenuPanel';
import OptionsModal from './components/ui/OptionsModal';
import ConfirmDialog from './components/ui/ConfirmDialog';

import { gameRegistry } from './games';

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
    const { showConfirm } = useModal();
    const {
        gameData,
        currentGameId,
        isSpectator,
        isLoading,
        error: gameError,
        createGame,
        joinGame,
        returnToLobby,
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

    const handleReturnToLobby = () => {
        setIsMenuOpen(false);
        returnToLobby();
    };

    const handleQuitGame = () => {
        showConfirm({
            title: "Quit Game?",
            message: "Are you sure you want to quit? This will forfeit the match and cannot be undone.",
            onConfirm: async () => {
                setIsMenuOpen(false);
                try {
                    await quitGame();
                } catch (err) {
                    console.error("Gracefully handling quitGame error:", err);
                }
            }
        });
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
            const gameType = gameData.gameType;
            const Game = gameRegistry[gameType]?.GameComponent;

            if (Game) {
                return <Game gameData={gameData} isSpectator={isSpectator} returnToLobby={returnToLobby} />;
            } else {
                return <div className="text-red-500 p-4">Error: Unknown game type "{gameType}".</div>;
            }
        }

        return <GameLobby onCreateGame={createGame} onJoinGame={joinGame} />;
    };

    if (showSplash) return <SplashScreen />;
    if (!isAuthReady) return <div className="w-full h-full flex items-center justify-center"><LoadingSpinner message="Authenticating..." /></div>;

    const displayError = authError || gameError;

    return (
        <div className="min-h-screen w-full bg-gray-900 text-white font-sans flex flex-col">
            {/* REMOVED: <GlobalStyles /> is no longer needed */}
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
                onGoToLobby={handleReturnToLobby}
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
            <ModalProvider>
                <AppContent />
                <ConfirmDialog />
            </ModalProvider>
        </UiProvider>
    </FirebaseProvider>
);

export default App;
