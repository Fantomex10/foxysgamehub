import React from 'react';

const ACCESSIBILITY_OPTIONS = [
  { id: 'highContrast', label: 'High contrast' },
  { id: 'reducedMotion', label: 'Reduced motion' },
  { id: 'largeText', label: 'Large text' },
];

export const AccessibilityToggleGroup = ({
  accessibility,
  onToggle,
  toggleButtonStyle,
  scaleFont,
  theme,
}) => (
  <section style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
    <h3 style={{
      margin: 0,
      fontSize: scaleFont('14px'),
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      color: theme.colors.textMuted,
    }}>
      Accessibility
    </h3>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing.sm }}>
      {ACCESSIBILITY_OPTIONS.map((entry) => {
        const active = Boolean(accessibility?.[entry.id]);
        return (
          <button
            key={entry.id}
            type="button"
            onClick={() => onToggle(entry.id)}
            style={toggleButtonStyle(active)}
            aria-pressed={active}
            data-active={active}
          >
            <span style={{ fontSize: scaleFont('13px') }}>{entry.label}</span>
          </button>
        );
      })}
    </div>
  </section>
);

export default AccessibilityToggleGroup;
