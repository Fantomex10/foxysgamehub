import { useEffect, useRef, useState } from 'react';
import { sessionService } from '../services/sessionService.js';

export const usePhotonRoomState = (
  photon,
  engine,
  authUser,
  { onProfileError, profileBlocked, session = sessionService } = {},
) => {
  const [state, setState] = useState(() => photon.getState());
  const [profileLoaded, setProfileLoaded] = useState(false);
  const lastPersistedNameRef = useRef(null);

  useEffect(() => {
    if (!authUser) return undefined;

    setProfileLoaded(false);

    photon.setEngine(engine);

    photon.connect({
      userId: authUser.uid,
      userName: authUser.displayName ?? '',
      engineId: engine.id,
    });

    const unsubscribe = photon.subscribe((nextState) => {
      setState(nextState);
    });

    let cancelled = false;

    if (authUser.isOffline || profileBlocked) {
      setProfileLoaded(true);
      return () => {
        cancelled = true;
        unsubscribe();
      };
    }

    session.fetchPlayerProfile(authUser.uid)
      .then((existingProfile) => {
        if (cancelled) return;
        if (existingProfile?.displayName) {
          lastPersistedNameRef.current = existingProfile.displayName;
          photon.setDisplayName(existingProfile.displayName);
        }
        setProfileLoaded(true);
      })
      .catch((error) => {
        if (cancelled) return;
        console.warn('[Session] Could not load player profile', error);
        setProfileLoaded(true);
        onProfileError?.();
      });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [authUser, photon, engine, profileBlocked, session]);

  useEffect(() => {
    if (!authUser || authUser.isOffline || profileBlocked) return;
    const trimmedName = state.userName?.trim();
    if (!trimmedName || trimmedName === lastPersistedNameRef.current) {
      return;
    }
    session.upsertPlayerProfile(authUser.uid, { displayName: trimmedName })
      .then(() => {
        lastPersistedNameRef.current = trimmedName;
      })
      .catch((error) => {
        console.warn('[Session] Failed to persist display name', error);
        onProfileError?.();
      });
  }, [authUser, state.userName, engine, profileBlocked, session]);

  return { state, profileLoaded };
};
