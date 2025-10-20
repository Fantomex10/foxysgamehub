import { useEffect, useMemo, useState } from 'react';
import useMediaQuery from '../hooks/useMediaQuery.js';
import { useCustomizationTokens } from '../customization/useCustomization.js';
import { scaleFont } from '../ui/typography.js';

const MenuIcon = ({ color }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M3 6h14" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    <path d="M3 10h14" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    <path d="M3 14h14" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const ProfileIcon = ({ color }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle cx="10" cy="7" r="3.2" stroke={color} strokeWidth="1.6" />
    <path
      d="M4.5 15.5c1.2-2.1 3.3-3.5 5.5-3.5s4.3 1.4 5.5 3.5"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const AppShell = ({
  playerName,
  leftPanel,
  rightPanel,
  children,
  breadcrumbs,
  roomInfo,
  hideMenuToggle = false,
  hideProfileToggle = false,
  showIdentity = true,
  contentLayout = 'default',
  forceMenuButton = false,
  forceProfileButton = false,
  menuButtonVariant = 'logo',
}) => {
  const { theme, accessibility } = useCustomizationTokens();
  const fontScale = accessibility?.fontScale ?? 1;
  const prefersReducedMotion = accessibility?.prefersReducedMotion ?? false;
  const isCompact = useMediaQuery('(max-width: 900px)');
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  const menuToggleEnabled = forceMenuButton || (!hideMenuToggle && Boolean(leftPanel));
  const profileToggleEnabled = forceProfileButton || (!hideProfileToggle && Boolean(rightPanel));

  useEffect(() => {
    if (isCompact) {
      setLeftOpen(false);
      setRightOpen(false);
    }
  }, [isCompact]);

  useEffect(() => {
    if (!menuToggleEnabled && leftOpen) {
      setLeftOpen(false);
    }
  }, [menuToggleEnabled, leftOpen]);

  useEffect(() => {
    if (!profileToggleEnabled && rightOpen) {
      setRightOpen(false);
    }
  }, [profileToggleEnabled, rightOpen]);

  useEffect(() => {
    if (!leftPanel && leftOpen) {
      setLeftOpen(false);
    }
  }, [leftPanel, leftOpen]);

  useEffect(() => {
    if (!rightPanel && rightOpen) {
      setRightOpen(false);
    }
  }, [rightPanel, rightOpen]);

  useEffect(() => {
    if (!leftPanel) {
      setLeftOpen(false);
    }
  }, [leftPanel]);

  useEffect(() => {
    if (!rightPanel) {
      setRightOpen(false);
    }
  }, [rightPanel]);

  const toggleLeft = () => {
    if (!menuToggleEnabled || !leftPanel) return;
    setLeftOpen((previous) => {
      if (!previous && isCompact) {
        setRightOpen(false);
      }
      return !previous;
    });
  };

  const toggleRight = () => {
    if (!profileToggleEnabled || !rightPanel) return;
    setRightOpen((previous) => {
      if (!previous && isCompact) {
        setLeftOpen(false);
      }
      return !previous;
    });
  };

  const shellStyle = useMemo(() => ({
    display: 'grid',
    gridTemplateRows: 'auto 1fr',
    minHeight: '100dvh',
    width: '100%',
    background: [
      theme.gradients.shellTop,
      theme.gradients.shellBottom,
      theme.colors.background,
    ].join(','),
    color: theme.colors.textPrimary,
  }), [theme]);

  const headerStyle = useMemo(() => ({
    position: 'sticky',
    top: 0,
    zIndex: 20,
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    padding: isCompact ? '14px 18px' : '18px 28px',
    borderBottom: `1px solid ${theme.colors.border}`,
    background: theme.colors.surface,
    backdropFilter: 'blur(12px)',
    boxShadow: theme.shadows.shell,
    gap: isCompact ? '12px' : '16px',
  }), [isCompact, theme]);

  const iconButtonStyle = useMemo(() => ({
    width: isCompact ? '40px' : '44px',
    height: isCompact ? '40px' : '44px',
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.buttons.iconBorder}`,
    background: theme.buttons.iconBg,
    color: theme.colors.textPrimary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: prefersReducedMotion ? 'none' : 'background 0.2s ease, opacity 0.2s ease',
    padding: 0,
  }), [isCompact, theme, prefersReducedMotion]);

  const buttonStyles = (active, disabled) => ({
    ...iconButtonStyle,
    opacity: disabled ? 0.6 : active ? 1 : 0.8,
    cursor: disabled ? 'default' : 'pointer',
    background: active ? theme.buttons.iconActiveBg : theme.buttons.iconBg,
  });

  const sidePanelBase = useMemo(() => ({
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '24px',
    background: theme.colors.surfaceAlt,
    border: `1px solid ${theme.colors.borderSubtle}`,
    borderRadius: theme.radii.lg,
    boxShadow: theme.shadows.panel,
    height: '100%',
    boxSizing: 'border-box',
  }), [theme]);

  const overlayBackdropStyle = useMemo(() => ({
    position: 'fixed',
    inset: 0,
    background: theme.overlays.scrim,
    zIndex: 40,
    display: 'flex',
    justifyContent: 'center',
    padding: '96px 24px 48px',
    overflowY: 'auto',
  }), [theme]);

  const overlayPanelStyle = useMemo(() => ({
    ...sidePanelBase,
    width: '100%',
    maxWidth: '420px',
    borderRadius: theme.radii.xl,
  }), [sidePanelBase, theme.radii]);

  const contentRowStyle = useMemo(() => {
    if (isCompact) {
      return {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        flex: 1,
        minHeight: 0,
      };
    }
    const columns = [
      leftPanel && leftOpen ? '264px' : null,
      'minmax(0, 1fr)',
      rightPanel && rightOpen ? '264px' : null,
    ].filter(Boolean);

    return {
      display: 'grid',
      gridTemplateColumns: columns.join(' '),
      minHeight: 0,
      height: '100%',
      width: '100%',
    };
  }, [isCompact, leftPanel, leftOpen, rightPanel, rightOpen]);

  const mainPadding = useMemo(() => {
    if (contentLayout === 'centered') {
      return isCompact ? '12px 12px 24px' : '18px 18px 28px';
    }
    if (contentLayout === 'flat') {
      return isCompact ? '10px 12px 24px' : '12px 18px 28px';
    }
    return isCompact ? '8px 12px 24px' : '12px 18px 28px';
  }, [contentLayout, isCompact]);

  const mainStyle = useMemo(() => ({
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: contentLayout === 'centered' ? 'center' : 'stretch',
    justifyContent: contentLayout === 'centered' ? 'center' : 'flex-start',
    gap: isCompact ? '18px' : '24px',
    padding: mainPadding,
    height: '100%',
    boxSizing: 'border-box',
    overflowY: contentLayout === 'flat' ? 'visible' : 'auto',
  }), [contentLayout, isCompact, mainPadding]);

  const breadcrumbText = useMemo(() => {
    if (!breadcrumbs) return '';
    if (Array.isArray(breadcrumbs)) return breadcrumbs.join(' / ');
    return breadcrumbs;
  }, [breadcrumbs]);

  const roomInfoBlock = roomInfo ? (
    <div>
      <h1 style={{
        fontSize: scaleFont(isCompact ? '16px' : '18px', fontScale),
        fontWeight: 600,
        margin: 0,
        color: theme.colors.textPrimary,
      }}>
        {roomInfo.title}
      </h1>
      <p style={{
        margin: '2px 0 0',
        fontSize: scaleFont('13px', fontScale),
        color: theme.colors.textMuted,
      }}>
        Code: {roomInfo.code}
      </p>
    </div>
  ) : null;

  const breadcrumbsNode = breadcrumbText ? (
    <p style={{
      margin: 0,
      textAlign: 'center',
      color: theme.colors.textSecondary,
      fontSize: scaleFont(isCompact ? '13px' : '14px', fontScale),
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
    }}>
      {breadcrumbText}
    </p>
  ) : null;

  const identityBlock = showIdentity && playerName ? (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      <p style={{
        margin: 0,
        color: theme.colors.textMuted,
        fontSize: scaleFont('12px', fontScale),
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}>
        Signed in as
      </p>
      <strong>{playerName}</strong>
    </div>
  ) : null;

  const renderMenuLogo = () => {
    if (menuButtonVariant === 'text') {
      return (
        <span style={{ fontSize: scaleFont('14px', fontScale), fontWeight: 600, color: theme.colors.textPrimary }}>
          Foxy Game Hub
        </span>
      );
    }
    return (
      <span
        style={{
          fontWeight: 700,
          letterSpacing: '0.16em',
          fontSize: scaleFont('12px', fontScale),
          color: theme.colors.accentPrimary,
          textTransform: 'uppercase',
        }}
      >
        FGH
      </span>
    );
  };

  const renderDesktopPanel = (panel, align) => {
    if (!panel) return null;
    return (
      <aside
        style={{
          ...sidePanelBase,
          borderRadius: align === 'left' ? `${theme.radii.lg} 0 0 ${theme.radii.lg}` : `0 ${theme.radii.lg} ${theme.radii.lg} 0`,
        }}
      >
        {panel}
      </aside>
    );
  };

  const renderMobileOverlay = (open, onClose, panel) => {
    if (!isCompact || !open || !panel) return null;
    return (
      <div
        role="presentation"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            onClose(false);
          }
        }}
        style={overlayBackdropStyle}
      >
        <aside style={overlayPanelStyle}>
          {panel}
        </aside>
      </div>
    );
  };

  return (
    <div style={shellStyle}>
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isCompact ? '12px' : '16px' }}>
          {menuToggleEnabled && (
            <button
              type="button"
              onClick={toggleLeft}
              disabled={!menuToggleEnabled}
              style={buttonStyles(leftOpen, !menuToggleEnabled)}
              aria-label="Toggle navigation menu"
            >
              <MenuIcon color={theme.colors.textPrimary} />
            </button>
          )}
          {renderMenuLogo()}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '4px' }}>
          {breadcrumbsNode}
          {roomInfoBlock}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {identityBlock}
          {profileToggleEnabled && (
            <button
              type="button"
              onClick={toggleRight}
              disabled={!profileToggleEnabled}
              style={buttonStyles(rightOpen, !profileToggleEnabled)}
              aria-label="Toggle profile panel"
            >
              <ProfileIcon color={theme.colors.textPrimary} />
            </button>
          )}
        </div>
      </header>

      <div style={contentRowStyle}>
        {!isCompact && leftPanel && leftOpen && renderDesktopPanel(leftPanel, 'left')}
        <main style={mainStyle}>
          {children}
        </main>
        {!isCompact && rightPanel && rightOpen && renderDesktopPanel(rightPanel, 'right')}
      </div>

      {renderMobileOverlay(leftOpen, setLeftOpen, leftPanel)}
      {renderMobileOverlay(rightOpen, setRightOpen, rightPanel)}
    </div>
  );
};

export default AppShell;
