import { useEffect, useId, useMemo, useRef, useState } from 'react';

/**
 * Centralised state + helpers for CreateLobbyForm so the component can focus on layout.
 * Handles engine defaults, clamps, privacy/password flows, and submission packaging.
 */
export const useCreateLobbyConfig = ({
  engines,
  defaultEngineId,
  onCreate,
}) => {
  const [roomName, setRoomName] = useState('Friendly Match');
  const [engineId, setEngineId] = useState(defaultEngineId);
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [botCount, setBotCount] = useState(1);
  const [isPrivate, setIsPrivate] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const optionsTitleId = useId();
  const optionsDescriptionId = useId();
  const passwordTitleId = useId();
  const passwordErrorId = `${passwordTitleId}-error`;

  const defaultEngineRef = useRef(defaultEngineId);
  const lastEngineIdRef = useRef(engineId);

  const availableEngines = useMemo(
    () => (Array.isArray(engines) && engines.length > 0 ? engines : []),
    [engines],
  );
  const selectedEngine = availableEngines.find((engine) => engine.id === engineId) ?? availableEngines[0] ?? null;
  const playerConfig = selectedEngine?.metadata?.playerConfig ?? {};
  const requiredPlayers = playerConfig.requiredPlayers ?? null;
  const minPlayers = playerConfig.minPlayers ?? requiredPlayers ?? 2;
  const maxPlayersCap = playerConfig.maxPlayers ?? Math.max(4, minPlayers);
  const minBots = playerConfig.minBots ?? 0;

  useEffect(() => {
    if (defaultEngineRef.current !== defaultEngineId) {
      defaultEngineRef.current = defaultEngineId;
      if (availableEngines.some((engine) => engine.id === defaultEngineId)) {
        setEngineId(defaultEngineId);
      }
    }
  }, [defaultEngineId, availableEngines]);

  useEffect(() => {
    const desiredPlayers = requiredPlayers ?? maxPlayers;
    const clampedPlayers = requiredPlayers ?? Math.min(Math.max(minPlayers, desiredPlayers), maxPlayersCap);
    if (clampedPlayers !== maxPlayers) {
      setMaxPlayers(clampedPlayers);
    }

    const targetPlayers = clampedPlayers;
    const maxAllowedBots = Math.max(0, Math.min(playerConfig.maxBots ?? targetPlayers - 1, targetPlayers - 1));

    let desiredBots = botCount;
    if (lastEngineIdRef.current !== engineId) {
      if (playerConfig.defaultBots !== undefined) {
        desiredBots = playerConfig.defaultBots;
      } else if (requiredPlayers) {
        desiredBots = requiredPlayers - 1;
      } else {
        desiredBots = Math.min(botCount, maxAllowedBots);
      }
    }

    const clampedBots = Math.min(Math.max(minBots, desiredBots), maxAllowedBots);
    if (clampedBots !== botCount) {
      setBotCount(clampedBots);
    }

    lastEngineIdRef.current = engineId;
  }, [
    engineId,
    playerConfig.maxBots,
    playerConfig.defaultBots,
    requiredPlayers,
    minPlayers,
    maxPlayersCap,
    minBots,
    maxPlayers,
    botCount,
  ]);

  const maxBotsForPlayers = useMemo(() => {
    const targetPlayers = requiredPlayers ?? maxPlayers;
    const maxBotsCap = playerConfig.maxBots ?? targetPlayers - 1;
    return Math.max(0, Math.min(maxBotsCap, targetPlayers - 1));
  }, [playerConfig.maxBots, maxPlayers, requiredPlayers]);

  const canSubmit = Boolean(selectedEngine) && maxPlayers >= minPlayers;

  const handleSubmit = () => {
    if (!canSubmit) return;
    if (isPrivate && password.trim().length === 0) {
      setPassword('');
      setPasswordError('Set a password to create a private lobby.');
      setShowPasswordModal(true);
      return;
    }

    onCreate?.({
      roomName: roomName.trim() || 'Friendly Match',
      engineId,
      settings: {
        maxPlayers: requiredPlayers ?? Number(maxPlayers),
        initialBots: Math.min(Number(botCount), maxBotsForPlayers),
        rules: {},
        visibility: isPrivate ? 'private' : 'public',
        password: isPrivate ? password.trim() : null,
      },
    });
    if (isPrivate) {
      setPassword('');
    }
  };

  const handleVisibilityToggle = (privateMode) => {
    setIsPrivate(privateMode);
    if (!privateMode) {
      setPassword('');
      setPasswordError('');
    }
  };

  const state = {
    roomName,
    engineId,
    maxPlayers,
    botCount,
    isPrivate,
    showOptionsModal,
    showPasswordModal,
    password,
    passwordError,
    optionsTitleId,
    optionsDescriptionId,
    passwordTitleId,
    passwordErrorId,
    selectedEngine,
    playerConfig,
    requiredPlayers,
    minPlayers,
    maxPlayersCap,
    minBots,
    maxBotsForPlayers,
    canSubmit,
  };

  const actions = {
    setRoomName,
    setEngineId,
    setMaxPlayers,
    setBotCount,
    handleVisibilityToggle,
    setShowOptionsModal,
    setShowPasswordModal,
    setPassword,
    setPasswordError,
    handleSubmit,
  };

  return {
    state,
    actions,
  };
};
