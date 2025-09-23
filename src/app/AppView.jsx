import { useMemo } from 'react';
import { APP_PHASES } from './constants.js';
import { useAppState } from './context/AppStateContext.jsx';
import { AppLayout } from './components/AppLayout.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { HubPage } from './pages/HubPage.jsx';
import { CreateLobbyPage } from './pages/CreateLobbyPage.jsx';
import { JoinLobbyPage } from './pages/JoinLobbyPage.jsx';
import { RoomPage } from './pages/RoomPage.jsx';
import { useCustomizationTokens } from '../customization/CustomizationContext.jsx';
import { createStatusMessageStyle } from '../ui/stylePrimitives.js';

export const AppView = () => {
  const {
    authReady,
    profileLoaded,
    profileBlocked,
    appPhase,
    TableComponent,
    engine,
  } = useAppState();
  const { theme, scaleFont } = useCustomizationTokens();
  const defaultStatusStyle = useMemo(
    () => createStatusMessageStyle({ theme, scaleFont }),
    [theme, scaleFont],
  );
  const dangerStatusStyle = useMemo(
    () => createStatusMessageStyle({ theme, scaleFont }, { tone: 'danger' }),
    [theme, scaleFont],
  );

  if (!authReady) {
    return <div style={defaultStatusStyle}>Establishing session…</div>;
  }

  if (!profileLoaded && appPhase === APP_PHASES.ROOM && !profileBlocked) {
    return <div style={defaultStatusStyle}>Synchronising profile…</div>;
  }

  if (!TableComponent) {
    return (
      <AppLayout useShell={false}>
        <div style={dangerStatusStyle}>
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
