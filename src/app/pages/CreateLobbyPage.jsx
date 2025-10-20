import CreateLobbyForm from '../../components/CreateLobbyForm.jsx';
import { AppLayout } from '../components/AppLayout.jsx';
import { APP_PHASES } from '../constants.js';
import { useAppState } from '../context/useAppState.js';

const EmptyState = () => (
  <div style={{ padding: '48px 24px', color: '#94a3b8', textAlign: 'center' }}>
    No engines available. Configure an engine to create a lobby.
  </div>
);

export const CreateLobbyPage = () => {
  const { engines, engine, roomActions, setAppPhase } = useAppState();

  if (!Array.isArray(engines) || engines.length === 0) {
    return (
      <AppLayout breadcrumbs="Create lobby" hideProfileToggle>
        <EmptyState />
      </AppLayout>
    );
  }

  const defaultEngineId = engine?.id ?? engines[0]?.id;

  return (
    <AppLayout breadcrumbs="Create lobby" hideProfileToggle>
      <CreateLobbyForm
        engines={engines}
        defaultEngineId={defaultEngineId}
        onCancel={() => setAppPhase(APP_PHASES.HUB)}
        onCreate={roomActions.createLobby}
      />
    </AppLayout>
  );
};
