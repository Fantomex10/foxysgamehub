import React from 'react';
import { CreateLobbyVisibilityToggle } from './CreateLobbyVisibilityToggle.jsx';
import { CreateLobbyOptionsButton } from './CreateLobbyOptionsButton.jsx';

export const CreateLobbyPrivacy = ({
  isPrivate,
  onToggle,
  onOptionsClick,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <CreateLobbyVisibilityToggle isPrivate={isPrivate} onToggle={onToggle} />
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <CreateLobbyOptionsButton onClick={onOptionsClick} />
    </div>
  </div>
);
