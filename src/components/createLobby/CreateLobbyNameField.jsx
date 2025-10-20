import { useMemo } from 'react';
import { useCustomizationTokens } from '../../customization/useCustomization.js';
import { scaleFont } from '../../ui/typography.js';
import { CreateLobbyRow } from './CreateLobbyRow.jsx';

export const CreateLobbyNameField = ({ value, onChange }) => {
  const { theme, accessibility } = useCustomizationTokens();
  const fontScale = accessibility?.fontScale ?? 1;

  const inputStyle = useMemo(() => ({
    flex: 1,
    width: '100%',
    padding: '8px 12px',
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.colors.border}`,
    background: theme.colors.surfaceMuted,
    color: theme.colors.textPrimary,
    fontSize: scaleFont('15px', fontScale),
  }), [theme, fontScale]);

  return (
    <CreateLobbyRow label="Lobby name" contentStyle={{ justifyContent: 'flex-start' }}>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Foxy Friday Night"
        style={inputStyle}
      />
    </CreateLobbyRow>
  );
};
