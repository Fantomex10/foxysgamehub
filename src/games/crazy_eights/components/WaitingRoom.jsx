// =================================================================================
// FILE: src/games/crazy_eights/components/WaitingRoom.jsx (NEW)
// =================================================================================
// This new component serves as the pre-game staging area, fulfilling the user's
// request for a lobby with a "Ready Up" system before the game starts.
// =================================================================================
import { useContext, useState } from 'react'; // Removed 'React' from import
import { FirebaseContext } from '../../../context/FirebaseProvider';
import * as gameService from '../../../services/gameService';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

const WaitingRoom = ({ gameData }) => {
    const { db, userId } = useContext(FirebaseContext);
    const [startError, setStartError] = useState(null);

    console.log(`WAITING_ROOM: Rendered. gameData status: ${gameData?.status}, gameData ID: ${gameData?.id}, userId: ${userId}`);

    if (!gameData || !userId) {
        console.log("WAITING_ROOM: Showing LoadingSpinner - gameData or userId not available.");
        return <LoadingSpinner message="Entering waiting room..." />;
    }

    const { id: gameId, players, playersReady, host: hostId, maxPlayers, gameName, joinCode } = gameData;
    const amIHost = userId === hostId;
    const isPlayerReady = playersReady.includes(userId);
    const allPlayersReady = players.length > 0 && players.length === playersReady.length;

    const handleReadyClick = () => {
        console.log(`WAITING_ROOM: Player ${userId} toggling ready status.`);
        gameService.setPlayerReady(db, gameId, userId, !isPlayerReady);
    };

    const handleStartGame = async () => {
        if (!amIHost) {
            console.warn("WAITING_ROOM: Non-host tried to start game.");
            return;
        }
        setStartError(null); // Clear previous errors
        console.log(`WAITING_ROOM: Host ${userId} attempting to start game ${gameId}.`);
        try {
            await gameService.startGame(db, gameId, userId);
            console.log(`WAITING_ROOM: Host ${userId} successfully initiated startGame service call.`);
        } catch (error) {
            console.error("WAITING_ROOM: Failed to start game:", error);
            setStartError(error.message);
        }
    };

    const readyButtonText = isPlayerReady ? 'Ready!' : 'Ready Up';
    const readyButtonClasses = isPlayerReady
        ? 'bg-green-600 hover:bg-green-700'
        : 'bg-gray-500 hover:bg-gray-600';

    return (
        <div className="w-full max-w-lg mx-auto p-6 bg-gray-800 rounded-2xl shadow-2xl border-2 border-purple-800 flex flex-col items-center">
            <h2 className="text-2xl font-bold text-yellow-300 mb-2">{gameName}</h2>
            <div className="mb-4 text-center">
                <p className="text-gray-400">Join Code:</p>
                <p className="text-2xl font-mono text-yellow-300 tracking-widest bg-black/20 px-4 py-1 rounded-md">{joinCode}</p>
            </div>
            <p className="text-lg text-purple-300 mb-4">Waiting for players... ({players.length}/{maxPlayers})</p>

            <ul className="w-full space-y-3 mb-6">
                {players.map(player => (
                    <li key={player.id} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                        <span className="font-semibold text-white">{player.name} {player.isHost && '(Host)'}</span>
                        {playersReady.includes(player.id) ? (
                            <span className="text-green-400 font-bold flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                                Ready
                            </span>
                        ) : (
                            <span className="text-gray-400 font-bold">Not Ready</span>
                        )}
                    </li>
                ))}
            </ul>

            {startError && <p className="text-red-400 text-center mb-4">{startError}</p>}

            <div className="w-full space-y-3">
                 <button
                    onClick={handleReadyClick}
                    className={`w-full font-bold py-3 px-6 rounded-lg transition-colors ${readyButtonClasses}`}
                >
                    {readyButtonText}
                </button>

                {amIHost && (
                    <button
                        onClick={handleStartGame}
                        disabled={!allPlayersReady || players.length < 2}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-600"
                    >
                        {players.length < 2 ? 'Need at least 2 players' : !allPlayersReady ? 'Waiting for players to be ready' : 'Start Game'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default WaitingRoom;
