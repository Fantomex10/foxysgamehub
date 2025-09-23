const SectionHeading = ({ theme, title, scaleFont }) => (
  <div>
    <h2
      style={{
        margin: 0,
        fontSize: scaleFont('20px'),
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

const MenuEntryButton = ({ item, getButtonStyle, scaleFont }) => {
  const baseStyle = getButtonStyle(item.tone);
  return (
    <button
      type="button"
      onClick={item.onClick}
      disabled={item.disabled}
      style={{
        ...baseStyle,
        opacity: item.disabled ? 0.45 : 1,
        cursor: item.disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <span style={{ fontSize: scaleFont('14px') }}>{item.label}</span>
    </button>
  );
};

export const MenuSections = ({ theme, sections, getButtonStyle, scaleFont }) => (
  <nav style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
    {sections.map((section) => (
      <div key={section.title} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
        <SectionHeading theme={theme} title={section.title} scaleFont={scaleFont} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
          {section.items.map((item) => (
            <MenuEntryButton
              key={item.id ?? item.label}
              item={item}
              getButtonStyle={getButtonStyle}
              scaleFont={scaleFont}
            />
          ))}
        </div>
      </div>
    ))}
  </nav>
);

export const ProfileSections = ({ theme, sections, scaleFont }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
    <h2 style={{ margin: 0, fontSize: scaleFont('20px'), color: theme.colors.textPrimary }}>Player profile</h2>
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
                fontSize: scaleFont('12px'),
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
                fontSize: scaleFont('18px'),
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
              fontSize: scaleFont('13px'),
            }}
          >
            {entry.label}
          </p>
          <p
            style={{
              margin: '4px 0 0',
              color: theme.colors.textSecondary,
              fontWeight: 600,
              fontSize: scaleFont('14px'),
            }}
          >
            {entry.value}
          </p>
        </div>
      );
    })}
  </div>
);
