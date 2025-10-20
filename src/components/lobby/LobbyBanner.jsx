import { useCustomizationTokens } from '../../customization/useCustomization.js';
import { scaleFont } from '../../ui/typography.js';

export const LobbyBanner = ({ banner }) => {
  const { theme, accessibility } = useCustomizationTokens();
  const fontScale = accessibility?.fontScale ?? 1;

  return (
    <div
      style={{
        background: theme.colors.accentDangerSoft,
        border: `1px solid ${theme.colors.accentDanger}`,
        color: theme.colors.accentDanger,
        padding: '10px 14px',
        borderRadius: theme.radii.sm,
        fontSize: scaleFont('14px', fontScale),
      }}
    >
      {banner}
    </div>
  );
};
