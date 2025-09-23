/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { sessionService } from '../../services/sessionService.js';
import { useServiceConfig } from './ServiceConfigContext.jsx';
import { usePhoton } from './PhotonContext.jsx';
import { useCustomization } from '../../customization/CustomizationContext.jsx';
import { sanitiseState } from '../../customization/useCustomizationStateMachine.js';
import { logAppEvent } from '../lib/telemetry.js';

const SessionContext = createContext(null);

const toMillis = (value) => {
  if (value == null) {
    return null;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  if (typeof value === 'object' && typeof value.toMillis === 'function') {
    try {
      const millis = value.toMillis();
      return Number.isFinite(millis) ? millis : null;
    } catch (error) {
      console.warn('[Customization] Failed to convert timestamp', error);
    }
  }
  return null;
};

const serializeCustomizationSnapshot = (state, unlocks, updatedAt) => JSON.stringify({
  state,
  unlocks,
  updatedAt: typeof updatedAt === 'number' ? updatedAt : null,
});

export const SessionProvider = ({ children }) => {
  const { serviceConfig } = useServiceConfig();
  const { photon } = usePhoton();
  const {
    state: customizationState,
    updatedAt: customizationUpdatedAt,
    unlocks: customizationUnlocks,
    hydrateFromProfile,
    setSyncStatus: setCustomizationSyncStatus,
  } = useCustomization();

  const [authUser, setAuthUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [profileBlocked, setProfileBlocked] = useState(false);

  const lastCustomizationSnapshotRef = useRef(null);

  useEffect(() => {
    if (lastCustomizationSnapshotRef.current === null) {
      lastCustomizationSnapshotRef.current = serializeCustomizationSnapshot(
        customizationState,
        customizationUnlocks,
        customizationUpdatedAt,
      );
    }
  }, [customizationState, customizationUnlocks, customizationUpdatedAt]);

  useEffect(() => {
    let cancelled = false;
    setAuthReady(false);

    sessionService
      .ensureUserSession({
        fallbackUserId: photon.getState().userId,
        fallbackDisplayName: photon.getState().userName ?? '',
      })
      .then((user) => {
        if (cancelled) return;
        setAuthUser(user);
        setAuthReady(true);
        logAppEvent('session:auth', { adapter: serviceConfig.sessionAdapter, offline: Boolean(user?.isOffline) });
      })
      .catch((error) => {
        console.warn('[Session] Falling back to offline mode', error);
        if (cancelled) return;
        const fallback = {
          uid: photon.getState().userId,
          displayName: photon.getState().userName ?? '',
          isOffline: true,
        };
        setAuthUser(fallback);
        setAuthReady(true);
        logAppEvent('session:auth-fallback', { adapter: serviceConfig.sessionAdapter, error: error?.message });
      });

    return () => {
      cancelled = true;
    };
  }, [photon, serviceConfig.sessionAdapter]);

  useEffect(() => {
    if (!authUser?.uid) {
      setCustomizationSyncStatus('idle', null);
      lastCustomizationSnapshotRef.current = serializeCustomizationSnapshot(
        customizationState,
        customizationUnlocks,
        customizationUpdatedAt,
      );
      return undefined;
    }

    if (authUser.isOffline || profileBlocked) {
      setCustomizationSyncStatus('offline', null);
      lastCustomizationSnapshotRef.current = serializeCustomizationSnapshot(
        customizationState,
        customizationUnlocks,
        customizationUpdatedAt,
      );
      return undefined;
    }

    let cancelled = false;
    setCustomizationSyncStatus('syncing', null);

    sessionService.fetchCustomizationConfig(authUser.uid)
      .then((remoteConfig) => {
        if (cancelled) return;
        const remoteUpdatedAt = toMillis(remoteConfig?.updatedAt);
        const localUpdatedAt = customizationUpdatedAt ?? null;

        if (remoteConfig) {
          const fallbackTheme = remoteConfig.themeId ?? customizationState.themeId;
          const sanitizedRemoteState = sanitiseState(remoteConfig, fallbackTheme);
          const remoteUnlocks = Array.isArray(remoteConfig.unlocks) ? remoteConfig.unlocks : [];
          const remoteSnapshot = serializeCustomizationSnapshot(sanitizedRemoteState, remoteUnlocks, remoteUpdatedAt);

          const shouldApplyRemote = !localUpdatedAt
            || (remoteUpdatedAt && remoteUpdatedAt > localUpdatedAt);

          if (shouldApplyRemote) {
            hydrateFromProfile(
              { ...sanitizedRemoteState, unlocks: remoteUnlocks },
              { updatedAt: remoteUpdatedAt ?? Date.now() },
            );
            lastCustomizationSnapshotRef.current = remoteSnapshot;
          }
        } else {
          lastCustomizationSnapshotRef.current = serializeCustomizationSnapshot(
            customizationState,
            customizationUnlocks,
            customizationUpdatedAt,
          );
        }

        setCustomizationSyncStatus('synced', null);
        logAppEvent('customization:loaded', { source: remoteConfig ? 'remote' : 'absent' });
      })
      .catch((error) => {
        if (cancelled) return;
        console.warn('[Customization] Failed to load config', error);
        setCustomizationSyncStatus('error', error);
        logAppEvent('customization:load-error', { error: error?.message });
      });

    return () => {
      cancelled = true;
    };
  }, [
    authUser?.uid,
    authUser?.isOffline,
    customizationState,
    customizationUnlocks,
    customizationUpdatedAt,
    hydrateFromProfile,
    profileBlocked,
    setCustomizationSyncStatus,
    serviceConfig.sessionAdapter,
  ]);

  useEffect(() => {
    if (!authUser?.uid || authUser.isOffline || profileBlocked) {
      return;
    }

    const serialized = serializeCustomizationSnapshot(
      customizationState,
      customizationUnlocks,
      customizationUpdatedAt,
    );
    if (serialized === lastCustomizationSnapshotRef.current) {
      return;
    }

    const timeout = setTimeout(() => {
      setCustomizationSyncStatus('syncing', null);
      sessionService.upsertCustomizationConfig(authUser.uid, {
        ...customizationState,
        unlocks: customizationUnlocks,
      })
        .then(() => {
          lastCustomizationSnapshotRef.current = serialized;
          setCustomizationSyncStatus('synced', null);
          logAppEvent('customization:persisted', { size: serialized.length });
        })
        .catch((error) => {
          console.warn('[Customization] Failed to persist config', error);
          setCustomizationSyncStatus('error', error);
          logAppEvent('customization:persist-error', { error: error?.message });
        });
    }, 400);

    return () => {
      clearTimeout(timeout);
    };
  }, [
    authUser?.uid,
    authUser?.isOffline,
    customizationState,
    customizationUnlocks,
    customizationUpdatedAt,
    profileBlocked,
    setCustomizationSyncStatus,
    serviceConfig.sessionAdapter,
  ]);

  const updateUserDisplayName = useCallback((name) => {
    photon.setDisplayName(name);
    setAuthUser((previous) => (previous ? { ...previous, displayName: name } : previous));
  }, [photon]);

  const contextValue = useMemo(
    () => ({
      authUser,
      authReady,
      updateUserDisplayName,
      profileBlocked,
      setProfileBlocked,
      setAuthUser,
    }),
    [authUser, authReady, profileBlocked, updateUserDisplayName, setAuthUser],
  );

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
