import { useMemo } from 'react';
import { useCustomizationTokens } from '../../customization/useCustomization.js';
import { scaleFont } from '../../ui/typography.js';

export const CreateLobbyPasswordModal = ({
  open,
  titleId,
  errorId,
  password,
  error,
  onChange,
  onCancel,
  onSubmit,
}) => {
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

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.colors.border}`,
    background: theme.colors.surfaceMuted,
    color: theme.colors.textPrimary,
    fontSize: scaleFont('15px', fontScale),
  };

  const tertiaryButton = {
    padding: '8px 14px',
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.buttons.subtleBorder}`,
    background: theme.buttons.subtleBg,
    color: theme.buttons.subtleText,
    fontWeight: 500,
    cursor: 'pointer',
  };

  const primaryButton = {
    padding: '8px 14px',
    borderRadius: theme.radii.sm,
    border: 'none',
    background: theme.buttons.primaryBg,
    color: theme.buttons.primaryText,
    fontWeight: 600,
    cursor: 'pointer',
  };

  if (!open) return null;

  return (
    <div style={backdropStyle} role="presentation">
      <div
        style={modalStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={error ? errorId : undefined}
      >
        <p id={titleId} style={{ margin: 0, fontSize: scaleFont('16px', fontScale), fontWeight: 600 }}>
          Set lobby password
        </p>
        <input
          value={password}
          onChange={(event) => onChange(event.target.value)}
          placeholder="eg. foxes-rule"
          style={inputStyle}
          type="password"
          aria-label="Lobby password"
        />
        {error && (
          <p
            id={errorId}
            style={{ margin: 0, fontSize: scaleFont('12px', fontScale), color: theme.colors.accentDanger, textAlign: 'left' }}
          >
            {error}
          </p>
        )}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onCancel} style={tertiaryButton}>
            Cancel
          </button>
          <button type="button" onClick={onSubmit} style={primaryButton}>
            Save &amp; continue
          </button>
        </div>
      </div>
    </div>
  );
};
