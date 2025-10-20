import { useMemo } from 'react';
import { useCustomizationTokens } from '../../customization/useCustomization.js';
import { scaleFont } from '../../ui/typography.js';
import { CreateLobbyRow } from './CreateLobbyRow.jsx';

export const CreateLobbyEngineSelect = ({ engines, value, onChange }) => {
  const { theme, accessibility } = useCustomizationTokens();
  const fontScale = accessibility?.fontScale ?? 1;
  const options = Array.isArray(engines) ? engines : [];

  const selectStyle = useMemo(() => ({
    flex: 1,
    maxWidth: '260px',
    padding: '8px 12px',
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.colors.border}`,
    background: theme.colors.surfaceMuted,
    color: theme.colors.textPrimary,
    fontSize: scaleFont('15px', fontScale),
    appearance: 'none',
    backgroundImage: `linear-gradient(45deg, transparent 50%, ${theme.colors.textMuted} 50%), linear-gradient(135deg, ${theme.colors.textMuted} 50%, transparent 50%)`,
    backgroundPosition: 'calc(100% - 18px) calc(50% - 5px), calc(100% - 13px) calc(50% - 5px)',
    backgroundSize: '6px 6px',
    backgroundRepeat: 'no-repeat',
  }), [theme, fontScale]);

  return (
    <CreateLobbyRow label="Game" contentStyle={{ justifyContent: 'flex-start' }}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={selectStyle}
      >
        {options.map((engine) => (
          <option key={engine.id} value={engine.id}>
            {engine.name}
          </option>
        ))}
      </select>
    </CreateLobbyRow>
  );
};
