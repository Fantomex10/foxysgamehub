import { useMemo } from 'react';
import AppShell from '../../components/AppShell.jsx';
import { useTheme } from '../../ui/ThemeContext.jsx';
import { useAppState } from '../context/AppStateContext.jsx';

const SectionHeading = ({ theme, title }) => (
  <div>
    <h2
      style={{
        margin: 0,
        fontSize: '20px',
        color: theme.colors.textPrimary,
      }}
    >
      {title}
    </h2>
    <div
      style={{
        height: '1px',
        background: `linear-gradient(to right, transparent, ${theme.colors.borderStrong}, transparent)`,
      }}
    />
  </div>
);

const renderMenuSections = (theme, sections, createButtonStyle) => (
  <nav style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
    {sections.map((section) => (
      <div key={section.title} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
        <SectionHeading theme={theme} title={section.title} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
          {section.items.map((item) => {
            const buttonStyle = createButtonStyle(item.tone);
            return (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                disabled={item.disabled}
                style={{
                  ...buttonStyle,
                  opacity: item.disabled ? 0.45 : 1,
                  cursor: item.disabled ? 'not-allowed' : 'pointer',
                }}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    ))}
  </nav>
);

const renderProfileSections = (theme, sections) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
    <h2 style={{ margin: 0, fontSize: '20px', color: theme.colors.textPrimary }}>Player profile</h2>
    <div
      style={{
        height: '1px',
        background: `linear-gradient(to right, transparent, ${theme.colors.borderStrong}, transparent)`,
      }}
    />
    {sections.map((entry) => {
      if (entry.type === 'divider') {
        return (
          <div
            key={entry.key ?? entry.label ?? Math.random()}
            style={{
              height: '1px',
              background: `linear-gradient(to right, transparent, ${theme.colors.borderSoft}, transparent)`,
            }}
          />
        );
      }
      if (entry.type === 'highlight') {
        return (
          <div key={entry.label}>
            <p
              style={{
                margin: 0,
                color: theme.colors.textMuted,
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              {entry.label}
            </p>
            <p
              style={{
                margin: '4px 0 0',
                color: theme.colors.textPrimary,
                fontSize: '18px',
                fontWeight: 700,
              }}
            >
              {entry.value}
            </p>
          </div>
        );
      }
      return (
        <div key={entry.label}>
          <p
            style={{
              margin: 0,
              color: theme.colors.textMuted,
              fontSize: '13px',
            }}
          >
            {entry.label}
          </p>
          <p
            style={{
              margin: '4px 0 0',
              color: theme.colors.textSecondary,
              fontWeight: 600,
            }}
          >
            {entry.value}
          </p>
        </div>
      );
    })}
  </div>
);

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
  } = useAppState();
  const { theme, availableThemes, themeId, setThemeId } = useTheme();

  const defaultMenuSections = useMemo(
    () => [
      {
        title: 'Game menu',
        items: [
          { label: 'Game options', onClick: () => {}, tone: 'ghost' },
          { label: 'Settings', onClick: () => {}, tone: 'ghost' },
          { label: 'Support', onClick: () => {}, tone: 'ghost' },
        ],
      },
    ],
    [],
  );

  const defaultProfileSections = useMemo(
    () => [
      { type: 'highlight', label: 'Lobby', value: gameDisplayName },
      { label: 'Room code', value: state.roomId ?? '—' },
      { label: 'Display name', value: playerDisplayName },
      { label: 'Balance', value: '—' },
      { label: 'Local time', value: '--:--' },
      { type: 'divider', key: 'divider-1' },
      { label: 'Stats', value: 'Coming soon' },
      { label: 'Unlocked items', value: 'No items unlocked yet.' },
      { label: 'Friends', value: 'Invite friends to share the table.' },
    ],
    [gameDisplayName, playerDisplayName, state.roomId],
  );

  const developerMenuSection = useMemo(() => {
    if (!serviceConfig) {
      return null;
    }

    const cycleOption = (options, current) => {
      if (!Array.isArray(options) || options.length === 0) {
        return current;
      }
      const index = options.indexOf(current);
      if (index === -1) {
        return options[0];
      }
      return options[(index + 1) % options.length];
    };

    const sessionOptions = availableSessionAdapters ?? [];
    const photonOptions = availablePhotonAdapters ?? [];
    const themeOptions = availableThemes ?? [];
    const currentTheme = themeOptions.find((entry) => entry.id === themeId) ?? themeOptions[0];

    const items = [
      {
        label: `Session adapter: ${serviceConfig.sessionAdapter}`,
        onClick: () => updateServiceConfig((current) => ({
          ...current,
          sessionAdapter: cycleOption(sessionOptions, current.sessionAdapter),
        })),
        disabled: sessionOptions.length <= 1,
      },
      {
        label: `Photon adapter: ${serviceConfig.photonAdapter}`,
        onClick: () => updateServiceConfig((current) => ({
          ...current,
          photonAdapter: cycleOption(photonOptions, current.photonAdapter),
        })),
        disabled: photonOptions.length <= 1,
      },
      {
        label: `Theme: ${currentTheme?.name ?? themeId}`,
        onClick: () => {
          if (!themeOptions.length) return;
          const ids = themeOptions.map((entry) => entry.id);
          const nextId = cycleOption(ids, themeId);
          setThemeId(nextId);
        },
        disabled: themeOptions.length <= 1,
      },
    ];

    return {
      title: 'Developer toggles',
      items,
    };
  }, [
    serviceConfig,
    availableSessionAdapters,
    availablePhotonAdapters,
    availableThemes,
    themeId,
    setThemeId,
    updateServiceConfig,
  ]);

  const finalMenuSections = useMemo(() => {
    const sections = menuSections ?? defaultMenuSections;
    if (!developerMenuSection) {
      return sections;
    }
    return [...sections, developerMenuSection];
  }, [menuSections, defaultMenuSections, developerMenuSection]);

  const finalProfileSections = profileSections ?? defaultProfileSections;

  const createButtonStyle = (tone = 'default') => {
    if (tone === 'primary') {
      return {
        padding: '12px 14px',
        borderRadius: theme.radii.sm,
        border: `1px solid ${theme.buttons.primaryBorder}`,
        background: theme.buttons.primaryBg,
        color: theme.buttons.primaryText,
        fontSize: '14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'background 0.2s ease, transform 0.2s ease',
      };
    }
    if (tone === 'danger') {
      return {
        padding: '12px 14px',
        borderRadius: theme.radii.sm,
        border: `1px solid ${theme.buttons.dangerBorder}`,
        background: theme.buttons.dangerBg,
        color: theme.buttons.dangerText,
        fontSize: '14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'background 0.2s ease, transform 0.2s ease',
      };
    }
    if (tone === 'ghost') {
      return {
        padding: '12px 14px',
        borderRadius: theme.radii.sm,
        border: `1px solid ${theme.buttons.subtleBorder}`,
        background: theme.buttons.ghostBg,
        color: theme.buttons.ghostText,
        fontSize: '14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'background 0.2s ease, transform 0.2s ease',
      };
    }
    return {
      padding: '12px 14px',
      borderRadius: theme.radii.sm,
      border: `1px solid ${theme.buttons.subtleBorder}`,
      background: theme.buttons.subtleBg,
      color: theme.buttons.subtleText,
      fontSize: '14px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      transition: 'background 0.2s ease, transform 0.2s ease',
    };
  };

  const leftPanelNode = finalMenuSections && finalMenuSections.length > 0
    ? renderMenuSections(theme, finalMenuSections, createButtonStyle)
    : null;

  const rightPanelNode = finalProfileSections && finalProfileSections.length > 0
    ? renderProfileSections(theme, finalProfileSections)
    : null;

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
    >
      {children}
    </AppShell>
  );
};
