import { useMemo } from 'react';
import { useCustomizationTokens } from '../customization/useCustomization.js';
import { useCreateLobbyConfig } from './lobby/useCreateLobbyConfig.js';
import { CreateLobbyNameField } from './createLobby/CreateLobbyNameField.jsx';
import { CreateLobbyEngineSelect } from './createLobby/CreateLobbyEngineSelect.jsx';
import { CreateLobbyVisibilityToggle } from './createLobby/CreateLobbyVisibilityToggle.jsx';
import { CreateLobbyStepperRow } from './createLobby/CreateLobbyStepperRow.jsx';
import { CreateLobbyHelperText } from './createLobby/CreateLobbyHelperText.jsx';
import { CreateLobbyOptionsButton } from './createLobby/CreateLobbyOptionsButton.jsx';
import { CreateLobbyFooter } from './createLobby/CreateLobbyFooter.jsx';
import { CreateLobbyOptionsModal } from './createLobby/CreateLobbyOptionsModal.jsx';
import { CreateLobbyPasswordModal } from './createLobby/CreateLobbyPasswordModal.jsx';

const CreateLobbyForm = ({ engines, defaultEngineId, onCancel, onCreate }) => {
  const { theme } = useCustomizationTokens();
  const {
    state: {
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
      requiredPlayers,
      minPlayers,
      maxPlayersCap,
      minBots,
      maxBotsForPlayers,
      canSubmit,
    },
    actions: {
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
    },
  } = useCreateLobbyConfig({
    engines,
    defaultEngineId,
    onCreate,
  });

  const containerStyle = useMemo(() => ({
    maxWidth: '680px',
    margin: '0 auto',
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radii.lg,
    padding: '16px',
    boxShadow: theme.shadows.panel,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.sm,
    boxSizing: 'border-box',
    width: '100%',
    position: 'relative',
  }), [theme]);

  const handleDecreasePlayers = () => {
    setMaxPlayers((value) => Math.max(minPlayers, Number(value) - 1));
  };

  const handleIncreasePlayers = () => {
    setMaxPlayers((value) => Math.min(maxPlayersCap, Number(value) + 1));
  };

  const handleDecreaseBots = () => {
    setBotCount((value) => Math.max(minBots, Number(value) - 1));
  };

  const handleIncreaseBots = () => {
    setBotCount((value) => Math.min(maxBotsForPlayers, Number(value) + 1));
  };

  return (
    <div style={containerStyle}>
      <CreateLobbyNameField value={roomName} onChange={setRoomName} />
      <CreateLobbyEngineSelect engines={engines} value={engineId} onChange={setEngineId} />
      <CreateLobbyVisibilityToggle isPrivate={isPrivate} onToggle={handleVisibilityToggle} />

      <CreateLobbyStepperRow
        label="Max players"
        value={requiredPlayers ?? maxPlayers}
        onIncrement={handleIncreasePlayers}
        onDecrement={handleDecreasePlayers}
        incrementDisabled={Boolean(requiredPlayers) || maxPlayers >= maxPlayersCap}
        decrementDisabled={Boolean(requiredPlayers) || maxPlayers <= minPlayers}
        incrementAriaLabel="Increase max players"
        decrementAriaLabel="Decrease max players"
      />

      <CreateLobbyStepperRow
        label="Bots"
        value={botCount}
        onIncrement={handleIncreaseBots}
        onDecrement={handleDecreaseBots}
        incrementDisabled={botCount >= maxBotsForPlayers}
        decrementDisabled={botCount <= minBots}
        incrementAriaLabel="Increase bots"
        decrementAriaLabel="Decrease bots"
      />

      {requiredPlayers && (
        <CreateLobbyHelperText>
          Hearts needs four players. Add bots to fill empty seats if required.
        </CreateLobbyHelperText>
      )}

      <CreateLobbyOptionsButton onClick={() => setShowOptionsModal(true)} />

      <CreateLobbyFooter
        canSubmit={canSubmit}
        onSubmit={handleSubmit}
        onCancel={onCancel}
      />

      <CreateLobbyOptionsModal
        open={showOptionsModal}
        titleId={optionsTitleId}
        descriptionId={optionsDescriptionId}
        onClose={() => setShowOptionsModal(false)}
      />

      <CreateLobbyPasswordModal
        open={showPasswordModal}
        titleId={passwordTitleId}
        errorId={passwordErrorId}
        password={password}
        error={passwordError}
        onChange={(value) => {
          setPassword(value);
          setPasswordError('');
        }}
        onCancel={() => {
          setShowPasswordModal(false);
          setPasswordError('');
        }}
        onSubmit={() => {
          if (!password.trim()) {
            setPasswordError('Password cannot be empty.');
            return;
          }
          setShowPasswordModal(false);
          handleSubmit();
        }}
      />
    </div>
  );
};

export default CreateLobbyForm;
