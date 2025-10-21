import React, { useMemo, useState } from 'react';
import useMediaQuery from '../hooks/useMediaQuery.js';
import useViewportSize from '../hooks/useViewportSize.js';
import { useCustomizationTokens } from '../customization/useCustomization.js';
import { scaleFont } from '../ui/typography.js';

const providerOptions = [
  'Login with Google',
  'Login with Apple ID',
  'Login with other',
  'Create a new account',
];

const LoginHub = ({ defaultName = '', onSubmit }) => {
  const [name, setName] = useState(defaultName);
  const ready = Boolean(name.trim());
  const [loginUnavailable, setLoginUnavailable] = useState(false);
  const isCompact = useMediaQuery('(max-width: 640px)');
  const { height: viewportHeight } = useViewportSize();
  const isShortBreakpoint = useMediaQuery('(max-height: 720px)');
  const isShort = viewportHeight > 0 ? viewportHeight < 720 : isShortBreakpoint;
  const { theme, accessibility } = useCustomizationTokens();
  const fontScale = accessibility?.fontScale ?? 1;
  const prefersReducedMotion = accessibility?.prefersReducedMotion ?? false;

  const handleSubmit = () => {
    if (!ready) return;
    onSubmit?.(name.trim());
  };

  const handleUnavailable = () => {
    setLoginUnavailable(true);
  };

  const containerStyle = useMemo(() => ({
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    padding: isCompact ? '10px' : isShort ? '11px' : '12px',
    boxSizing: 'border-box',
  }), [isCompact, isShort]);

  const cardStyle = useMemo(() => ({
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radii.lg,
    padding: isCompact ? '14px 12px' : isShort ? '18px 16px' : '22px 18px',
    maxWidth: isCompact ? '100%' : '520px',
    width: '100%',
    margin: '0 auto',
    boxShadow: theme.shadows.panel,
    display: 'flex',
    flexDirection: 'column',
    gap: isCompact ? theme.spacing.sm : theme.spacing.md,
    textAlign: 'center',
    boxSizing: 'border-box',
    position: 'relative',
  }), [isCompact, isShort, theme]);

  const entryWidth = '50%';

  const inputStyle = useMemo(() => ({
    padding: isCompact || isShort ? '11px 14px' : '12px 16px',
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.colors.border}`,
    background: theme.colors.surfaceMuted,
    color: theme.colors.textPrimary,
    fontSize: scaleFont(isCompact || isShort ? '15px' : '16px', fontScale),
    width: entryWidth,
    alignSelf: 'center',
  }), [isCompact, isShort, theme, fontScale]);

  const transitionStyle = prefersReducedMotion ? 'none' : 'transform 0.2s ease, opacity 0.2s ease';
  const subtleTransition = prefersReducedMotion ? 'none' : 'transform 0.2s ease, border 0.2s ease';

  const primaryButtonStyle = useMemo(() => ({
    padding: '10px 16px',
    borderRadius: '999px',
    border: 'none',
    fontSize: scaleFont('16px', fontScale),
    fontWeight: 600,
    cursor: 'pointer',
    color: theme.buttons.primaryText,
    background: theme.buttons.primaryBg,
    transition: transitionStyle,
  }), [theme, fontScale, transitionStyle]);

  const secondaryButtonStyle = useMemo(() => ({
    padding: '10px 16px',
    borderRadius: '999px',
    border: `1px solid ${theme.buttons.subtleBorder}`,
    background: theme.buttons.subtleBg,
    color: theme.buttons.subtleText,
    fontSize: scaleFont('16px', fontScale),
    fontWeight: 600,
    cursor: 'pointer',
    transition: transitionStyle,
  }), [theme, fontScale, transitionStyle]);

  const providerButtonStyle = useMemo(() => ({
    padding: '8px 12px',
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.buttons.subtleBorder}`,
    background: theme.buttons.ghostBg,
    color: theme.colors.textSecondary,
    fontSize: scaleFont('14px', fontScale),
    fontWeight: 600,
    cursor: 'pointer',
    transition: subtleTransition,
    textAlign: 'center',
    width: entryWidth,
  }), [theme, fontScale, subtleTransition]);

  const labelStyle = useMemo(() => ({
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    color: theme.colors.textSecondary,
    fontSize: scaleFont(isCompact || isShort ? '14px' : '15px', fontScale),
  }), [isCompact, isShort, theme, fontScale]);

  const overlayContainerStyle = useMemo(() => ({
    position: 'absolute',
    inset: 0,
    background: theme.overlays.scrim,
    borderRadius: theme.radii.lg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    zIndex: 2,
  }), [theme]);

  const overlayContentStyle = useMemo(() => ({
    maxWidth: '320px',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.md,
    textAlign: 'center',
    color: theme.colors.textPrimary,
  }), [theme]);

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: scaleFont(isCompact || isShort ? '24px' : '28px', fontScale),
              color: theme.colors.textPrimary,
            }}
          >
            Foxy Game Hub
          </h1>
        </div>

        <label style={labelStyle}>
          User name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="FoxyFan"
            style={inputStyle}
          />
        </label>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={handleUnavailable}
            style={{
              ...secondaryButtonStyle,
              opacity: ready ? 1 : 0.4,
              cursor: ready ? 'pointer' : 'not-allowed',
            }}
            disabled={!ready}
          >
            Login
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!ready}
            style={{
              ...primaryButtonStyle,
              opacity: ready ? 1 : 0.4,
              cursor: ready ? 'pointer' : 'not-allowed',
            }}
          >
            Guest
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
          {providerOptions.map((label) => (
            <button
              key={label}
              type="button"
              onClick={handleUnavailable}
              style={providerButtonStyle}
            >
              {label}
            </button>
          ))}
        </div>

        {loginUnavailable && (
          <div style={overlayContainerStyle}>
            <div style={overlayContentStyle}>
              <div>
                <h2 style={{ margin: 0, fontSize: scaleFont('22px', fontScale) }}>Login unavailable</h2>
                <p
                  style={{
                    marginTop: '10px',
                    color: theme.colors.textMuted,
                    fontSize: scaleFont('14px', fontScale),
                  }}
                >
                  Direct login and identity providers will arrive soon. Continue as a guest for now.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => setLoginUnavailable(false)}
                  style={secondaryButtonStyle}
                >
                  OK
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginUnavailable(false);
                    handleSubmit();
                  }}
                  style={primaryButtonStyle}
                >
                  Continue as guest
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginHub;



