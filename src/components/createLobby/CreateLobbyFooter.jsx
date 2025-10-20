import { useCustomizationTokens } from '../../customization/useCustomization.js';
import { scaleFont } from '../../ui/typography.js';

export const CreateLobbyFooter = ({ canSubmit, onSubmit, onCancel }) => {
  const { theme, accessibility } = useCustomizationTokens();
  const fontScale = accessibility?.fontScale ?? 1;

  const primaryButton = {
    padding: '10px 16px',
    borderRadius: theme.radii.sm,
    border: 'none',
    background: theme.buttons.primaryBg,
    color: theme.buttons.primaryText,
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: scaleFont('15px', fontScale),
  };

  const tertiaryButton = {
    padding: '10px 16px',
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.buttons.subtleBorder}`,
    background: theme.buttons.subtleBg,
    color: theme.buttons.subtleText,
    fontWeight: 500,
    cursor: 'pointer',
    fontSize: scaleFont('15px', fontScale),
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '4px',
        gap: '8px',
      }}
    >
      <button type="button" onClick={onCancel} style={tertiaryButton}>
        Back
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit}
        style={{
          ...primaryButton,
          opacity: canSubmit ? 1 : 0.4,
          cursor: canSubmit ? 'pointer' : 'not-allowed',
        }}
      >
        Create lobby
      </button>
    </div>
  );
};
