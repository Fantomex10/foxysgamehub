import { useCustomizationTokens } from '../../customization/useCustomization.js';
import { scaleFont } from '../../ui/typography.js';

export const CreateLobbyHelperText = ({ children }) => {
  const { theme, accessibility } = useCustomizationTokens();
  const fontScale = accessibility?.fontScale ?? 1;

  return (
    <div style={{ color: theme.colors.textMuted, fontSize: scaleFont('12px', fontScale), textAlign: 'right' }}>
      {children}
    </div>
  );
};
