import { useCreateLobbyConfig } from './lobby/useCreateLobbyConfig.js';
import { CreateLobbyNameField } from './createLobby/CreateLobbyNameField.jsx';
import { CreateLobbyEngineSelect } from './createLobby/CreateLobbyEngineSelect.jsx';
import { CreateLobbyFooter } from './createLobby/CreateLobbyFooter.jsx';
import { CreateLobbyOptionsModal } from './createLobby/CreateLobbyOptionsModal.jsx';
import { CreateLobbyPasswordModal } from './createLobby/CreateLobbyPasswordModal.jsx';
import { CreateLobbyLayout } from './createLobby/CreateLobbyLayout.jsx';
import { CreateLobbyAdjuster } from './createLobby/CreateLobbyAdjuster.jsx';
import { CreateLobbyPrivacy } from './createLobby/CreateLobbyPrivacy.jsx';

const CreateLobbyForm = ({ engines, defaultEngineId, onCancel, onCreate }) => {
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
    <CreateLobbyLayout>
      <CreateLobbyNameField value={roomName} onChange={setRoomName} />
      <CreateLobbyEngineSelect engines={engines} value={engineId} onChange={setEngineId} />

      <CreateLobbyAdjuster
        label="Max players"
        value={requiredPlayers ?? maxPlayers}
        onIncrement={handleIncreasePlayers}
        onDecrement={handleDecreasePlayers}
        incrementDisabled={Boolean(requiredPlayers) || maxPlayers >= maxPlayersCap}
        decrementDisabled={Boolean(requiredPlayers) || maxPlayers <= minPlayers}
        incrementAriaLabel="Increase max players"
        decrementAriaLabel="Decrease max players"
        helperText={
          requiredPlayers
            ? 'Seat count locked by engine; add bots to fill empty seats.'
            : undefined
        }
      />

      <CreateLobbyAdjuster
        label="Bots"
        value={botCount}
        onIncrement={handleIncreaseBots}
        onDecrement={handleDecreaseBots}
        incrementDisabled={botCount >= maxBotsForPlayers}
        decrementDisabled={botCount <= minBots}
        incrementAriaLabel="Increase bots"
        decrementAriaLabel="Decrease bots"
        helperText={
          requiredPlayers
            ? 'Hearts needs four players. Add bots to fill empty seats if required.'
            : undefined
        }
      />

      <CreateLobbyPrivacy
        isPrivate={isPrivate}
        onToggle={handleVisibilityToggle}
        onOptionsClick={() => setShowOptionsModal(true)}
      />

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
    </CreateLobbyLayout>
  );
};

export default CreateLobbyForm;
