import { useMemo } from 'react';
import { useCustomizationTokens } from '../../customization/CustomizationContext.jsx';

export const OverlayModal = ({
  children,
  onClose,
  maxWidth = 'min(640px, 100%)',
  zIndex = 100,
  padding = '24px',
  role = 'dialog',
  ariaLabel,
}) => {
  const { theme, table } = useCustomizationTokens();

  const panelStyle = useMemo(() => ({
    background: table.panel ?? theme.colors.surface,
    border: `1px solid ${table.border ?? theme.colors.border}`,
    borderRadius: theme.radii.lg,
    padding,
    width: maxWidth,
    boxShadow: theme.shadows.panel,
    color: theme.colors.textPrimary,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  }), [table, theme, maxWidth, padding]);

  return (
    <div
      role={role}
      aria-modal="true"
      aria-label={ariaLabel}
      style={{
        position: 'fixed',
        inset: 0,
        background: theme.overlays.scrim,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        zIndex,
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div
        style={panelStyle}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        {children}
      </div>
    </div>
  );
};
