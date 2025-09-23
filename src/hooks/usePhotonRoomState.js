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
  const initialDisplayNameRef = useRef(authUser?.displayName ?? '');
  const userId = authUser?.uid ?? null;
  const isOffline = Boolean(authUser?.isOffline);
  const displayName = authUser?.displayName ?? '';

  useEffect(() => {
    if (userId) {
      initialDisplayNameRef.current = displayName;
    } else {
      initialDisplayNameRef.current = '';
    }
  }, [userId, displayName]);

  useEffect(() => {
    if (!userId) return undefined;

    setProfileLoaded(false);

    photon.setEngine(engine);

    const connectPromise = Promise.resolve(photon.connect({
      userId,
      userName: initialDisplayNameRef.current,
      engineId: engine.id,
    }));

    connectPromise.catch((error) => {
      console.warn('[Photon] Failed to connect', error);
    });

    const unsubscribe = photon.subscribe((nextState) => {
      setState(nextState);
    });

    let cancelled = false;

    if (isOffline || profileBlocked) {
      setProfileLoaded(true);
      return () => {
        cancelled = true;
        unsubscribe();
      };
    }

    session.fetchPlayerProfile(userId)
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
  }, [engine, photon, userId, isOffline, profileBlocked, session, onProfileError]);

  useEffect(() => {
    if (!userId || isOffline || profileBlocked) return;
    const trimmedName = state.userName?.trim();
    if (!trimmedName || trimmedName === lastPersistedNameRef.current) {
      return;
    }
    session.upsertPlayerProfile(userId, { displayName: trimmedName })
      .then(() => {
        lastPersistedNameRef.current = trimmedName;
      })
      .catch((error) => {
        console.warn('[Session] Failed to persist display name', error);
        onProfileError?.();
      });
  }, [userId, isOffline, profileBlocked, state.userName, session, onProfileError]);

  return { state, profileLoaded };
};
