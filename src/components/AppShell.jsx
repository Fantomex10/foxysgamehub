import { useMemo } from 'react';
import useMediaQuery from '../hooks/useMediaQuery.js';
import { useCustomizationTokens } from '../customization/CustomizationContext.jsx';
import { createOverlayStyle, createPanelContainerStyle, createStackStyle } from '../ui/stylePrimitives.js';
import { AppShellHeader } from './AppShellHeader.jsx';
import { useSidePanels } from './useSidePanels.js';

const SidePanelOverlay = ({
  isCompact,
  open,
  panel,
  overlayStyle,
  panelStyle,
  onClose,
}) => {
  if (!isCompact || !open || !panel) {
    return null;
  }

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div
      role="presentation"
      onClick={handleBackdropClick}
      style={overlayStyle}
    >
      <aside style={panelStyle}>
        {panel}
      </aside>
    </div>
  );
};

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
  statusBanner = null,
}) => {
  const {
    theme,
    backdrop,
    accessibility,
    pieces,
    scaleFont,
    motionDuration,
  } = useCustomizationTokens();
  const isCompact = useMediaQuery('(max-width: 900px)');

  const {
    leftOpen,
    rightOpen,
    toggleLeft,
    toggleRight,
    menuToggleEnabled,
    profileToggleEnabled,
    closeLeft,
    closeRight,
  } = useSidePanels({
    isCompact,
    hasLeftPanel: Boolean(leftPanel),
    hasRightPanel: Boolean(rightPanel),
    hideMenuToggle,
    hideProfileToggle,
    forceMenuButton,
    forceProfileButton,
  });

  const shellStyle = useMemo(() => {
    const layers = [];
    if (backdrop?.tokens?.overlay) {
      layers.push(backdrop.tokens.overlay);
    }
    if (backdrop?.tokens?.background) {
      layers.push(backdrop.tokens.background);
    } else {
      layers.push(theme.gradients.shellTop, theme.gradients.shellBottom, theme.colors.background);
    }
    return {
      display: 'grid',
      gridTemplateRows: 'auto 1fr',
      minHeight: '100dvh',
      width: '100%',
      background: layers.join(','),
      color: theme.colors.textPrimary,
      filter: accessibility?.highContrast ? 'contrast(1.15) saturate(1.05)' : undefined,
      fontSize: accessibility?.largeText ? '112%' : '100%',
    };
  }, [backdrop, theme, accessibility?.highContrast, accessibility?.largeText]);

  const sidePanelBase = useMemo(
    () => createPanelContainerStyle(
      { theme, pieces },
      {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing?.md ?? '16px',
        padding: theme.spacing?.xl ?? '24px',
        background: theme.colors.surfaceAlt,
        border: `1px solid ${pieces.secondary ?? theme.colors.borderSubtle}`,
        height: '100%',
        boxSizing: 'border-box',
      },
    ),
    [theme, pieces],
  );

  const overlayBackdropStyle = useMemo(
    () => createOverlayStyle({ theme }, {
      zIndex: 40,
      justifyContent: 'center',
      padding: '96px 24px 48px',
      overflowY: 'auto',
    }),
    [theme],
  );

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
    ...createStackStyle({ theme }, {
      direction: 'column',
      gap: isCompact ? theme.spacing?.lg ?? '18px' : theme.spacing?.xl ?? '24px',
      align: contentLayout === 'centered' ? 'center' : 'stretch',
      justify: contentLayout === 'centered' ? 'center' : 'flex-start',
    }),
    minWidth: 0,
    padding: mainPadding,
    height: '100%',
    boxSizing: 'border-box',
    overflowY: contentLayout === 'flat' ? 'visible' : 'auto',
  }), [theme, contentLayout, isCompact, mainPadding]);

  const breadcrumbText = Array.isArray(breadcrumbs)
    ? breadcrumbs.join(' / ')
    : breadcrumbs || '';

  const breadcrumbsNode = breadcrumbText ? (
    <p style={{
      margin: 0,
      textAlign: 'center',
      color: theme.colors.textSecondary,
      fontSize: scaleFont(isCompact ? '13px' : '14px'),
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
    }}>
      {breadcrumbText}
    </p>
  ) : null;

  const roomInfoBlock = roomInfo ? (
    <div>
      <h1 style={{
        fontSize: scaleFont(isCompact ? '16px' : '18px'),
        fontWeight: 600,
        margin: 0,
        color: theme.colors.textPrimary,
      }}>
        {roomInfo.title}
      </h1>
      <p style={{
        margin: '2px 0 0',
        fontSize: scaleFont('13px'),
        color: theme.colors.textMuted,
      }}>
        Code: {roomInfo.code}
      </p>
    </div>
  ) : null;

  const renderDesktopPanel = (panel, align) => {
    if (!panel) return null;
    return (
      <aside
        style={{
          ...sidePanelBase,
          borderRadius: align === 'left'
            ? `${theme.radii.lg} 0 0 ${theme.radii.lg}`
            : `0 ${theme.radii.lg} ${theme.radii.lg} 0`,
        }}
      >
        {panel}
      </aside>
    );
  };

  return (
    <div
      style={shellStyle}
      data-accessibility-high-contrast={accessibility?.highContrast ? 'true' : 'false'}
      data-accessibility-large-text={accessibility?.largeText ? 'true' : 'false'}
      data-accessibility-reduced-motion={accessibility?.reducedMotion ? 'true' : 'false'}
    >
      <AppShellHeader
        theme={theme}
        pieces={pieces}
        scaleFont={scaleFont}
        motionDuration={motionDuration}
        accessibility={accessibility}
        menuToggleEnabled={menuToggleEnabled}
        profileToggleEnabled={profileToggleEnabled}
        leftOpen={leftOpen}
        rightOpen={rightOpen}
        toggleLeft={toggleLeft}
        toggleRight={toggleRight}
        playerName={playerName}
        breadcrumbsNode={breadcrumbsNode}
        roomInfoBlock={roomInfoBlock}
        showIdentity={showIdentity}
        menuButtonVariant={menuButtonVariant}
      />

      <div style={contentRowStyle}>
        {!isCompact && leftPanel && leftOpen && renderDesktopPanel(leftPanel, 'left')}
        <main style={mainStyle}>
          {statusBanner}
          {children}
        </main>
        {!isCompact && rightPanel && rightOpen && renderDesktopPanel(rightPanel, 'right')}
      </div>

      <SidePanelOverlay
        isCompact={isCompact}
        open={leftOpen}
        panel={leftPanel}
        overlayStyle={overlayBackdropStyle}
        panelStyle={overlayPanelStyle}
        onClose={closeLeft}
      />
      <SidePanelOverlay
        isCompact={isCompact}
        open={rightOpen}
        panel={rightPanel}
        overlayStyle={overlayBackdropStyle}
        panelStyle={overlayPanelStyle}
        onClose={closeRight}
      />
    </div>
  );
};

export default AppShell;
