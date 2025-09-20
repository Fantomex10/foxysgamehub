import JoinLobbyList from '../../components/JoinLobbyList.jsx';
import { AppLayout } from '../components/AppLayout.jsx';
import { APP_PHASES } from '../constants.js';
import { useAppState } from '../context/AppStateContext.jsx';

export const JoinLobbyPage = () => {
  const { availableRooms, roomActions, setAppPhase } = useAppState();

  return (
    <AppLayout breadcrumbs="Join lobby">
      <JoinLobbyList
        lobbies={availableRooms}
        onJoin={roomActions.joinLobby}
        onBack={() => setAppPhase(APP_PHASES.HUB)}
      />
    </AppLayout>
  );
};
