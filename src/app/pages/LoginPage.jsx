import LoginHub from '../../components/LoginHub.jsx';
import { AppLayout } from '../components/AppLayout.jsx';
import { APP_PHASES } from '../constants.js';
import { useAppState } from '../context/AppStateContext.jsx';

export const LoginPage = () => {
  const { authUser, state, setAppPhase, roomActions } = useAppState();

  return (
    <AppLayout
      menuSections={[]}
      profileSections={[]}
      breadcrumbs="Login"
      hideMenuToggle={false}
      hideProfileToggle={false}
      showIdentity={false}
      forceMenuButton
      forceProfileButton
    >
      <LoginHub
        defaultName={authUser?.displayName ?? state.userName ?? ''}
        onSubmit={(value) => {
          roomActions.updateUserDisplayName(value);
          setAppPhase(APP_PHASES.HUB);
        }}
      />
    </AppLayout>
  );
};
