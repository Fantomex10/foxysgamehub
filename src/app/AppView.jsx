import { APP_PHASES } from './constants.js';
import { useAppState } from './context/useAppState.js';
import { AppLayout } from './components/AppLayout.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { HubPage } from './pages/HubPage.jsx';
import { CreateLobbyPage } from './pages/CreateLobbyPage.jsx';
import { JoinLobbyPage } from './pages/JoinLobbyPage.jsx';
import { RoomPage } from './pages/RoomPage.jsx';

const statusStyle = {
  color: '#e2e8f0',
  textAlign: 'center',
  padding: '48px',
};

export const AppView = () => {
  const {
    authReady,
    profileLoaded,
    profileBlocked,
    appPhase,
    TableComponent,
    engine,
  } = useAppState();

  if (!authReady) {
    return <div style={statusStyle}>Establishing session...</div>;
  }

  if (!profileLoaded && appPhase === APP_PHASES.ROOM && !profileBlocked) {
    return <div style={statusStyle}>Synchronising profile...</div>;
  }

  if (!TableComponent) {
    return (
      <AppLayout useShell={false}>
        <div style={{ ...statusStyle, color: '#f87171' }}>
          Engine "{engine.name}" is missing a Table component.
        </div>
      </AppLayout>
    );
  }

  if (appPhase === APP_PHASES.LOGIN) {
    return <LoginPage />;
  }

  if (appPhase === APP_PHASES.HUB) {
    return <HubPage />;
  }

  if (appPhase === APP_PHASES.CREATE) {
    return <CreateLobbyPage />;
  }

  if (appPhase === APP_PHASES.JOIN) {
    return <JoinLobbyPage />;
  }

  if (appPhase === APP_PHASES.ROOM) {
    return <RoomPage />;
  }

  return null;
};
