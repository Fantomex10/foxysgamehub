import { useMemo, useState } from 'react';
import useMediaQuery from '../hooks/useMediaQuery.js';
import useViewportSize from '../hooks/useViewportSize.js';
import { useTheme } from '../ui/ThemeContext.jsx';

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
  const { theme } = useTheme();

  const handleSubmit = () => {
    if (!ready) return;
    onSubmit?.(name.trim());
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
    gap: isCompact ? '12px' : '20px',
    textAlign: 'center',
    boxSizing: 'border-box',
    position: 'relative',
  }), [isCompact, isShort, theme]);

  const inputStyle = useMemo(() => ({
    padding: isCompact || isShort ? '11px 14px' : '12px 16px',
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.colors.border}`,
    background: theme.colors.surfaceMuted,
    color: theme.colors.textPrimary,
    fontSize: isCompact || isShort ? '15px' : '16px',
  }), [isCompact, isShort, theme]);

  const primaryButtonStyle = useMemo(() => ({
    padding: '10px 16px',
    borderRadius: '999px',
    border: 'none',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    color: theme.buttons.primaryText,
    background: theme.buttons.primaryBg,
    transition: 'transform 0.2s ease, opacity 0.2s ease',
  }), [theme]);

  const secondaryButtonStyle = useMemo(() => ({
    padding: '10px 16px',
    borderRadius: '999px',
    border: `1px solid ${theme.buttons.subtleBorder}`,
    background: theme.buttons.subtleBg,
    color: theme.buttons.subtleText,
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'transform 0.2s ease, opacity 0.2s ease',
  }), [theme]);

  const providerButtonStyle = useMemo(() => ({
    padding: '8px 12px',
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.buttons.subtleBorder}`,
    background: theme.buttons.ghostBg,
    color: theme.colors.textSecondary,
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'transform 0.2s ease, border 0.2s ease',
    textAlign: 'center',
  }), [theme]);

  const labelStyle = useMemo(() => ({
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    color: theme.colors.textSecondary,
    fontSize: isCompact || isShort ? '14px' : '15px',
  }), [isCompact, isShort, theme]);

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: isCompact || isShort ? '24px' : '28px',
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
            onClick={() => setLoginUnavailable(true)}
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {providerOptions.map((label) => (
            <button key={label} type="button" style={providerButtonStyle}>
              {label}
            </button>
          ))}
        </div>

        {loginUnavailable && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: theme.overlays.scrim,
              borderRadius: theme.radii.lg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              zIndex: 2,
            }}
          >
            <div
              style={{
                maxWidth: '320px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                textAlign: 'center',
                color: theme.colors.textPrimary,
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: '22px' }}>Login unavailable</h2>
                <p style={{ marginTop: '10px', color: theme.colors.textMuted, fontSize: '14px' }}>
                  Direct login is coming soon. Proceeding as a guest for now.
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
