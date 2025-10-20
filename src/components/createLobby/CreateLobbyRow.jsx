import { useCustomizationTokens } from '../../customization/useCustomization.js';
import { scaleFont } from '../../ui/typography.js';

export const CreateLobbyRow = ({ label, children, alignTop = false, contentStyle }) => {
  const { theme, accessibility } = useCustomizationTokens();
  const fontScale = accessibility?.fontScale ?? 1;

  const rowStyle = {
    display: 'flex',
    alignItems: alignTop ? 'flex-start' : 'center',
    justifyContent: 'space-between',
    gap: '6px',
    color: theme.colors.textSecondary,
    fontSize: scaleFont('15px', fontScale),
  };

  const labelStyle = {
    minWidth: '100px',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontSize: scaleFont('11px', fontScale),
  };

  const wrapperStyle = {
    flex: 1,
    display: 'flex',
    gap: '6px',
    justifyContent: 'flex-end',
    ...(contentStyle ?? {}),
  };

  return (
    <div style={rowStyle}>
      <span style={labelStyle}>{label}</span>
      <div style={wrapperStyle}>{children}</div>
    </div>
  );
};
