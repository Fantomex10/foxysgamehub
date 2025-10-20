import HubMenu from '../../components/HubMenu.jsx';
import CustomizationPanel from '../../components/CustomizationPanel.jsx';
import { AppLayout } from '../components/AppLayout.jsx';
import { APP_PHASES } from '../constants.js';
import { useAppState } from '../context/useAppState.js';

export const HubPage = () => {
  const { setAppPhase } = useAppState();

  const contentStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '24px',
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '100%',
  };

  return (
    <AppLayout breadcrumbs="Main menu" contentLayout="centered" forceProfileButton>
      <div style={contentStyle}>
        <HubMenu
          onPlayWithFriends={() => setAppPhase(APP_PHASES.JOIN)}
          onCreate={() => setAppPhase(APP_PHASES.CREATE)}
          onJoin={() => setAppPhase(APP_PHASES.JOIN)}
        />
        <CustomizationPanel />
      </div>
    </AppLayout>
  );
};
