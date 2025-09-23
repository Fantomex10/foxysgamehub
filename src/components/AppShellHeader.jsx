import { useHeaderStyles } from './AppShellHeader.styles.js';

const MenuIcon = ({ color }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M3 6h14" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    <path d="M3 10h14" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    <path d="M3 14h14" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const ProfileIcon = ({ color }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="10" cy="7" r="3.2" stroke={color} strokeWidth="1.6" />
    <path
      d="M4.5 15.5c1.2-2.1 3.3-3.5 5.5-3.5s4.3 1.4 5.5 3.5"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

export const AppShellHeader = ({
  theme,
  pieces,
  scaleFont,
  motionDuration,
  accessibility,
  menuToggleEnabled,
  profileToggleEnabled,
  leftOpen,
  rightOpen,
  toggleLeft,
  toggleRight,
  playerName,
  breadcrumbsNode,
  roomInfoBlock,
  showIdentity,
  menuButtonVariant,
}) => {
  const { isCompact, headerStyle, buttonStyles } = useHeaderStyles({
    theme,
    pieces,
    scaleFont,
    motionDuration,
    accessibility,
  });

  const renderMenuLogo = () => {
    if (menuButtonVariant === 'text') {
      return (
        <span style={{ fontSize: scaleFont('14px'), fontWeight: 600, color: theme.colors.textPrimary }}>
          Foxy Game Hub
        </span>
      );
    }
    return (
      <span
        style={{
          fontWeight: 700,
          letterSpacing: '0.16em',
          fontSize: scaleFont('12px'),
          color: pieces.primary ?? theme.colors.accentPrimary,
          textTransform: 'uppercase',
        }}
      >
        FGH
      </span>
    );
  };

  const identityBlock = showIdentity && playerName ? (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      <p style={{
        margin: 0,
        color: theme.colors.textMuted,
        fontSize: scaleFont('12px'),
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}>
        Signed in as
      </p>
      <strong style={{ fontSize: scaleFont('14px') }}>{playerName}</strong>
    </div>
  ) : null;

  return (
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
  );
};
