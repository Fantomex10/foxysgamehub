import { useMemo } from 'react';
import { useCustomizationTokens } from '../../customization/useCustomization.js';
import { scaleFont } from '../../ui/typography.js';
import { CreateLobbyRow } from './CreateLobbyRow.jsx';

export const CreateLobbyVisibilityToggle = ({ isPrivate, onToggle }) => {
  const { theme, accessibility } = useCustomizationTokens();
  const fontScale = accessibility?.fontScale ?? 1;

  const buttonStyle = useMemo(() => ({
    borderRadius: '999px',
    border: `1px solid ${theme.buttons.subtleBorder}`,
    background: theme.buttons.ghostBg,
    color: theme.colors.textSecondary,
    fontSize: scaleFont('14px', fontScale),
    fontWeight: 600,
    cursor: 'pointer',
    padding: '8px 12px',
    minWidth: '72px',
  }), [theme, fontScale]);

  const activeButtonStyle = {
    border: `1px solid ${theme.buttons.primaryBorder ?? theme.colors.accentPrimary}`,
    background: theme.buttons.primaryBg,
    color: theme.buttons.primaryText,
  };

  return (
    <CreateLobbyRow label="Visibility" contentStyle={{ justifyContent: 'flex-start' }}>
      <button
        type="button"
        style={isPrivate ? buttonStyle : { ...buttonStyle, ...activeButtonStyle }}
        onClick={() => onToggle(false)}
      >
        Public
      </button>
      <button
        type="button"
        style={isPrivate ? { ...buttonStyle, ...activeButtonStyle } : buttonStyle}
        onClick={() => onToggle(true)}
      >
        Private
      </button>
    </CreateLobbyRow>
  );
};
