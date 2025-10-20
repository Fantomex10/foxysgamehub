import { useCustomizationTokens } from '../../customization/useCustomization.js';
import { scaleFont } from '../../ui/typography.js';

export const CreateLobbyOptionsButton = ({ onClick }) => {
  const { theme, accessibility } = useCustomizationTokens();
  const fontScale = accessibility?.fontScale ?? 1;

  const buttonStyle = {
    padding: '9px 14px',
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.buttons.subtleBorder}`,
    background: theme.buttons.ghostBg,
    color: theme.colors.textSecondary,
    fontWeight: 600,
    fontSize: scaleFont('14px', fontScale),
    cursor: 'pointer',
    alignSelf: 'flex-start',
  };

  return (
    <button type="button" style={buttonStyle} onClick={onClick}>
      Game options
    </button>
  );
};
