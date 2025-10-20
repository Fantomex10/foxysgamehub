import { useMemo } from 'react';
import { useCustomizationTokens } from '../../customization/useCustomization.js';
import { scaleFont } from '../../ui/typography.js';

export const CreateLobbyOptionsModal = ({ open, titleId, descriptionId, onClose }) => {
  const { theme, accessibility } = useCustomizationTokens();
  const fontScale = accessibility?.fontScale ?? 1;
  const prefersReducedMotion = accessibility?.prefersReducedMotion ?? false;

  const backdropStyle = useMemo(() => {
    const padding = scaleFont('24px', fontScale);
    return {
      position: 'absolute',
      inset: 0,
      background: theme.overlays.scrim,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding,
      borderRadius: theme.radii.lg,
      zIndex: 2,
      transition: prefersReducedMotion ? 'none' : 'opacity 0.2s ease',
    };
  }, [theme, fontScale, prefersReducedMotion]);

  const modalStyle = useMemo(() => {
    const padding = scaleFont('18px', fontScale);
    const gap = scaleFont('12px', fontScale);
    return {
      width: '100%',
      maxWidth: '360px',
      background: theme.colors.surfaceElevated ?? theme.colors.surface,
      border: `1px solid ${theme.colors.borderSubtle}`,
      borderRadius: theme.radii.md,
      padding,
      display: 'flex',
      flexDirection: 'column',
      gap,
      color: theme.colors.textPrimary,
      boxShadow: theme.shadows.panel,
      transition: prefersReducedMotion ? 'none' : 'transform 0.2s ease, opacity 0.2s ease',
    };
  }, [theme, fontScale, prefersReducedMotion]);

  const buttonStyle = {
    padding: '8px 14px',
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.buttons.subtleBorder}`,
    background: theme.buttons.subtleBg,
    color: theme.buttons.subtleText,
    fontWeight: 500,
    cursor: 'pointer',
    alignSelf: 'flex-end',
  };

  if (!open) return null;

  return (
    <div style={backdropStyle} role="presentation">
      <div
        style={modalStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <p id={titleId} style={{ margin: 0, fontSize: scaleFont('16px', fontScale), fontWeight: 600 }}>
          Custom game rules
        </p>
        <p
          id={descriptionId}
          style={{ margin: 0, color: theme.colors.textSecondary, fontSize: scaleFont('14px', fontScale) }}
        >
          Rule editing isn&apos;t ready yet. Join the Discord to share suggestions!
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} style={buttonStyle}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
