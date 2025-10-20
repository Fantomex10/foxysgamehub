import { useCustomizationTokens } from '../customization/useCustomization.js';
import { scaleFont } from '../ui/typography.js';

const DrawPile = ({ remaining, onDraw, disabled = false }) => {
  const { theme, cards, accessibility } = useCustomizationTokens();
  const fontScale = accessibility?.fontScale ?? 1;
  const isDisabled = disabled || remaining === 0;

  const cardStyle = {
    width: '88px',
    height: '128px',
    borderRadius: theme.radii.sm,
    border: `1px solid ${cards.border ?? theme.colors.cardBorder}`,
    background: cards.back ?? theme.buttons.primaryBg,
    boxShadow: theme.shadows.panel,
  };

  return (
    <button
      type="button"
      onClick={onDraw}
      disabled={isDisabled}
      style={{
        position: 'relative',
        width: cardStyle.width,
        height: cardStyle.height,
        border: 'none',
        background: 'transparent',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
      }}
      aria-label="Draw card"
    >
      <div style={{ ...cardStyle, position: 'absolute', top: 8, left: 8, opacity: 0.45 }} />
      <div style={{ ...cardStyle, position: 'absolute', top: 4, left: 4, opacity: 0.7 }} />
      <div
        style={{
          ...cardStyle,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: cards.text ?? theme.colors.textPrimary,
          fontWeight: 700,
          background: cards.back ?? cardStyle.background,
        }}
      >
        Draw
      </div>
      <span
        style={{
          position: 'absolute',
          bottom: -28,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: scaleFont('12px', fontScale),
          color: theme.colors.textMuted,
        }}
      >
        {remaining} left
      </span>
    </button>
  );
};

export default DrawPile;

