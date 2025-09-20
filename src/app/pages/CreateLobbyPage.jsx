import CreateLobbyForm from '../../components/CreateLobbyForm.jsx';
import { AppLayout } from '../components/AppLayout.jsx';
import { APP_PHASES } from '../constants.js';
import { useAppState } from '../context/AppStateContext.jsx';

export const CreateLobbyPage = () => {
  const { engines, engine, roomActions, setAppPhase } = useAppState();

  return (
    <AppLayout breadcrumbs="Create lobby">
      <CreateLobbyForm
        engines={engines}
        defaultEngineId={engine.id}
        onCancel={() => setAppPhase(APP_PHASES.HUB)}
        onCreate={roomActions.createLobby}
      />
    </AppLayout>
  );
};
