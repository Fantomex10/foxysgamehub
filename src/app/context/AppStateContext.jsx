/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { APP_PHASES } from '../constants.js';
import { useDefaultPlayerInteraction } from '../../hooks/useDefaultPlayerInteraction.js';
import { useEngineCatalog } from '../hooks/useEngineCatalog.js';
import { usePhotonBridge } from '../hooks/usePhotonBridge.js';
import { useLobbyManager } from '../hooks/useLobbyManager.js';
import { useRoomActions } from '../hooks/useRoomActions.js';
import { usePhoton } from './PhotonContext.jsx';
import { useSession } from './SessionContext.jsx';
import { useServiceConfig } from './ServiceConfigContext.jsx';
import { useCustomization } from '../../customization/CustomizationContext.jsx';
import { createAppStateValue } from './createAppStateValue.js';

const AppStateContext = createContext(null);

export const AppStateProvider = ({ children }) => {
  const {
    serviceConfig,
    updateServiceConfig,
    sessionAdapters,
    photonAdapters,
  } = useServiceConfig();
  const {
    engine,
    setEngine,
    photon,
    photonStatus,
  } = usePhoton();
  const {
    authUser,
    authReady,
    updateUserDisplayName,
    profileBlocked,
    setProfileBlocked,
    setAuthUser,
  } = useSession();
  const { setEngineDefaults } = useCustomization();

  const [appPhase, setAppPhase] = useState(APP_PHASES.LOGIN);
  const { engines, gameOptions, engineModules } = useEngineCatalog(engine);
  const { state, profileLoaded } = usePhotonBridge({
    photon,
    engine,
    authUser,
    profileBlocked,
    setProfileBlocked,
    setAuthUser,
  });

  const {
    availableRooms,
    createLobby,
    joinLobby,
    quickSelectGame,
    returnToHub,
    resetLobbyState,
  } = useLobbyManager({
    photon,
    engine,
    authUser,
    state,
    profileLoaded,
    setEngine,
    setAppPhase,
  });

  const serviceConfigRef = useRef(serviceConfig);

  useEffect(() => {
    const previous = serviceConfigRef.current;
    const changed = previous.sessionAdapter !== serviceConfig.sessionAdapter
      || previous.photonAdapter !== serviceConfig.photonAdapter;
    serviceConfigRef.current = serviceConfig;

    if (!changed) {
      return;
    }

    resetLobbyState();
    setProfileBlocked(false);
    photon.resetSession?.();
    setAppPhase(APP_PHASES.LOGIN);
  }, [
    serviceConfig,
    resetLobbyState,
    setProfileBlocked,
    photon,
    setAppPhase,
  ]);

  useEffect(() => {
    if ((state.phase === 'roomLobby' || state.phase === 'playing' || state.phase === 'finished') && appPhase !== APP_PHASES.ROOM) {
      setAppPhase(APP_PHASES.ROOM);
    }
  }, [appPhase, state.phase]);

  const engineId = engine?.id ?? '__none__';
  const engineDefaults = engine?.customizationDefaults ?? null;

  useEffect(() => {
    setEngineDefaults(engineId, engineDefaults, {
      applyOnChange: true,
      force: true,
      resetWhenMissing: true,
    });
  }, [engineId, engineDefaults, setEngineDefaults]);

  const interactionHook = engine.hooks?.usePlayerInteraction ?? useDefaultPlayerInteraction;
  const interaction = interactionHook({ state, photon, authUser, metadata: engine.metadata });

  const roomActions = useRoomActions({
    photon,
    state,
    updateUserDisplayName,
    createLobby,
    joinLobby,
    quickSelectGame,
    returnToHub,
  });

  const contextValue = useMemo(
    () => createAppStateValue({
      engine,
      setEngine,
      engines,
      gameOptions,
      photon,
      photonStatus,
      authUser,
      authReady,
      appPhase,
      setAppPhase,
      availableRooms,
      profileBlocked,
      profileLoaded,
      state,
      interaction,
      roomActions,
      serviceConfig,
      sessionAdapters,
      photonAdapters,
      updateServiceConfig,
      engineModules,
    }),
    [
      engine,
      setEngine,
      engines,
      gameOptions,
      photon,
      photonStatus,
      authUser,
      authReady,
      appPhase,
      setAppPhase,
      availableRooms,
      profileBlocked,
      profileLoaded,
      state,
      engineModules,
      interaction,
      roomActions,
      serviceConfig,
      sessionAdapters,
      photonAdapters,
      updateServiceConfig,
    ],
  );

  return (
    <AppStateContext.Provider value={contextValue}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
