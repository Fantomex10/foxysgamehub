import { useCallback, useMemo } from 'react';
import AppShell from '../../components/AppShell.jsx';
import { useCustomizationTokens } from '../../customization/CustomizationContext.jsx';
import { useTheme } from '../../ui/ThemeContext.jsx';
import { useAppState } from '../context/AppStateContext.jsx';
import { getDefaultMenuSections, getDefaultProfileSections } from '../lib/menuDefaults.js';
import { buildDeveloperMenu } from '../lib/developerControls.js';
import { createActionButtonStyle } from '../../ui/stylePrimitives.js';
import { withAlpha } from '../../ui/colorUtils.js';
import { MenuSections, ProfileSections } from './AppLayoutPanels.jsx';


export const AppLayout = ({
  children,
  menuSections,
  profileSections,
  breadcrumbs,
  roomInfo,
  hideMenuToggle,
  hideProfileToggle,
  showIdentity = true,
  contentLayout = 'default',
  useShell = true,
  forceMenuButton = false,
  forceProfileButton = false,
  menuButtonVariant,
}) => {
  const {
    playerDisplayName,
    gameDisplayName,
    state,
    serviceConfig,
    availableSessionAdapters,
    availablePhotonAdapters,
    updateServiceConfig,
    photonStatus,
  } = useAppState();
  const {
    theme,
    pieces,
    scaleFont,
    motionDuration,
    accessibility,
  } = useCustomizationTokens();
  const { availableThemes, themeId, setThemeId } = useTheme();

  const defaultMenuSections = useMemo(
    () => getDefaultMenuSections(),
    [],
  );

  const defaultProfileSections = useMemo(
    () => getDefaultProfileSections({
      gameDisplayName,
      playerDisplayName,
      roomId: state.roomId,
    }),
    [gameDisplayName, playerDisplayName, state.roomId],
  );

  const developerMenuSection = useMemo(
    () => buildDeveloperMenu({
      serviceConfig,
      sessionAdapters: availableSessionAdapters,
      photonAdapters: availablePhotonAdapters,
      availableThemes,
      themeId,
      setThemeId,
      updateServiceConfig,
    }),
    [
      serviceConfig,
      availableSessionAdapters,
      availablePhotonAdapters,
      availableThemes,
      themeId,
      setThemeId,
      updateServiceConfig,
    ],
  );

  const finalMenuSections = useMemo(() => {
    const sections = menuSections ?? defaultMenuSections;
    if (!developerMenuSection) {
      return sections;
    }
    return [...sections, developerMenuSection];
  }, [menuSections, defaultMenuSections, developerMenuSection]);

  const finalProfileSections = profileSections ?? defaultProfileSections;

  const buttonTokens = useMemo(
    () => ({
      theme,
      pieces,
      scaleFont,
      motionDuration,
      accessibility,
    }),
    [theme, pieces, scaleFont, motionDuration, accessibility],
  );

  const getMenuButtonStyle = useCallback(
    (tone = 'default') => createActionButtonStyle(buttonTokens, tone),
    [buttonTokens],
  );

  const leftPanelNode = finalMenuSections && finalMenuSections.length > 0
    ? (
      <MenuSections
        theme={theme}
        sections={finalMenuSections}
        getButtonStyle={getMenuButtonStyle}
        scaleFont={scaleFont}
      />
    )
    : null;

  const rightPanelNode = finalProfileSections && finalProfileSections.length > 0
    ? (
      <ProfileSections
        theme={theme}
        sections={finalProfileSections}
        scaleFont={scaleFont}
      />
    )
    : null;

  const connectionBanner = useMemo(() => {
    if (serviceConfig?.photonAdapter !== 'realtime') {
      return null;
    }

    const status = photonStatus?.status ?? 'idle';
    if (status === 'connected') {
      return null;
    }

    const errorMessage = photonStatus?.error?.message ?? photonStatus?.error?.toString?.() ?? '';

    let tone = 'info';
    let message = 'Realtime service initialising…';
    if (status === 'connecting') {
      message = 'Connecting to realtime service…';
    } else if (status === 'disconnected') {
      tone = 'warning';
      message = 'Realtime connection lost. Attempting to reconnect…';
    } else if (status === 'error') {
      tone = 'danger';
      message = errorMessage ? `Realtime error: ${errorMessage}` : 'Realtime connection encountered an error.';
    } else if (status === 'idle') {
      message = 'Realtime service waiting for a session…';
    }

    const palette = {
      info: {
        background: withAlpha(theme.colors?.accentPrimary ?? '#38bdf8', 0.18, theme.colors?.surfaceMuted),
        border: theme.colors?.accentPrimary ?? pieces.primary ?? theme.colors?.border,
        text: theme.colors?.accentPrimary ?? theme.colors?.textSecondary,
      },
      warning: {
        background: withAlpha(theme.colors?.accentWarning ?? '#fbbf24', 0.2, theme.colors?.surfaceMuted),
        border: theme.colors?.accentWarning ?? theme.colors?.border,
        text: theme.colors?.accentWarning ?? theme.colors?.textSecondary,
      },
      danger: {
        background: withAlpha(theme.colors?.accentDanger ?? '#f87171', 0.2, theme.colors?.surfaceMuted),
        border: theme.colors?.accentDanger ?? theme.colors?.border,
        text: theme.colors?.accentDanger ?? theme.colors?.textSecondary,
      },
    }[tone];

    const bannerStyle = {
      width: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing?.sm ?? '8px',
      padding: '12px 16px',
      borderRadius: theme.radii?.sm ?? theme.radii?.md ?? '12px',
      border: `1px solid ${palette.border}`,
      background: palette.background,
      color: palette.text,
      fontSize: scaleFont('13px'),
      marginBottom: theme.spacing?.sm ?? '12px',
    };

    const labelStyle = {
      fontSize: scaleFont('12px'),
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    };

    return (
      <div style={bannerStyle}>
        <span style={labelStyle}>Realtime</span>
        <span style={{ flex: 1 }}>{message}</span>
      </div>
    );
  }, [photonStatus, scaleFont, serviceConfig?.photonAdapter, theme, pieces]);

  if (!useShell) {
    return children;
  }

  return (
    <AppShell
      playerName={playerDisplayName}
      leftPanel={leftPanelNode}
      rightPanel={rightPanelNode}
      breadcrumbs={breadcrumbs}
      roomInfo={roomInfo}
      hideMenuToggle={hideMenuToggle ?? !leftPanelNode}
      hideProfileToggle={hideProfileToggle ?? !rightPanelNode}
      showIdentity={showIdentity}
      contentLayout={contentLayout}
      forceMenuButton={forceMenuButton}
      forceProfileButton={forceProfileButton}
      menuButtonVariant={menuButtonVariant}
      statusBanner={connectionBanner}
    >
      {children}
    </AppShell>
  );
};
