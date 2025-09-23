import { useCallback, useMemo } from 'react';
import { usePhotonRoomState } from '../../hooks/usePhotonRoomState.js';

export const usePhotonBridge = ({
  photon,
  engine,
  authUser,
  profileBlocked,
  setProfileBlocked,
  setAuthUser,
}) => {
  const handleProfileError = useCallback(() => {
    setProfileBlocked(true);
    setAuthUser((previous) => (previous ? { ...previous, isOffline: true } : previous));
  }, [setAuthUser, setProfileBlocked]);

  const photonRoomStateOptions = useMemo(
    () => ({
      onProfileError: handleProfileError,
      profileBlocked,
    }),
    [handleProfileError, profileBlocked],
  );

  const { state, profileLoaded } = usePhotonRoomState(
    photon,
    engine,
    authUser,
    photonRoomStateOptions,
  );

  return {
    state,
    profileLoaded,
  };
};
