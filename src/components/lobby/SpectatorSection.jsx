import { useMemo } from 'react';
import { useCustomizationTokens } from '../../customization/useCustomization.js';
import { scaleFont } from '../../ui/typography.js';

export const SpectatorSection = ({ spectators, userId }) => {
  const { theme, accessibility } = useCustomizationTokens();
  const fontScale = accessibility?.fontScale ?? 1;
  const hasSpectators = spectators.length > 0;

  const containerStyle = useMemo(() => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.xs,
  }), [theme]);

  const spectatorRowStyle = useMemo(() => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.colors.borderSubtle}`,
    background: theme.colors.surfaceMuted,
    color: theme.colors.textSecondary,
  }), [theme]);

  const nameStyle = useMemo(() => ({
    margin: 0,
    fontSize: scaleFont('15px', fontScale),
    fontWeight: 600,
    color: theme.colors.textPrimary,
  }), [theme, fontScale]);

  const metaStyle = useMemo(() => ({
    margin: 0,
    fontSize: scaleFont('11px', fontScale),
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: theme.colors.textMuted,
  }), [theme, fontScale]);

  if (!hasSpectators) {
    return null;
  }

  return (
    <section>
      <h3
        style={{
          margin: `0 0 ${theme.spacing.xs}`,
          fontSize: scaleFont('17px', fontScale),
          color: theme.colors.textSecondary,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        Spectator bench ({spectators.length})
      </h3>
      <div style={containerStyle}>
        {spectators.map((spectator) => {
          const metaLabels = [
            spectator.id === userId ? 'You' : null,
            spectator.isHost ? 'Host' : null,
            spectator.isBot ? 'Bot' : null,
            'Spectator',
          ].filter(Boolean);
          return (
            <div key={spectator.id} style={spectatorRowStyle}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <p style={nameStyle}>{spectator.name}</p>
                <p style={metaStyle}>{metaLabels.join(' | ')}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
