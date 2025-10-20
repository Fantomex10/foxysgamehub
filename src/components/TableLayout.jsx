import useMediaQuery from '../hooks/useMediaQuery.js';
import { useCustomizationTokens } from '../customization/useCustomization.js';
import { scaleFont } from '../ui/typography.js';

const TableLayout = ({
  title,
  subtitle,
  headerExtras,
  children,
  footer,
}) => {
  const { theme, table, accessibility } = useCustomizationTokens();
  const isCompact = useMediaQuery('(max-width: 900px)');
  const fontScale = accessibility?.fontScale ?? 1;

  const wrapperStyle = {
    background: table.panel ?? theme.colors.surfaceAlt,
    border: `1px solid ${table.border ?? theme.colors.border}`,
    borderRadius: isCompact ? theme.radii.lg : theme.radii.xl,
    padding: isCompact ? '24px 20px' : '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: isCompact ? '16px' : '24px',
    boxShadow: theme.shadows.panel,
    boxSizing: 'border-box',
    width: '100%',
  };

  const headerStyle = {
    display: 'flex',
    alignItems: isCompact ? 'flex-start' : 'center',
    justifyContent: 'space-between',
    gap: '16px',
    flexDirection: isCompact ? 'column' : 'row',
  };

  const titleStyle = {
    margin: 0,
    fontSize: scaleFont(isCompact ? '22px' : '26px', fontScale),
    color: table.text ?? theme.colors.textPrimary,
  };

  const subtitleNode = typeof subtitle === 'string'
    ? (
      <p
        style={{
          margin: '6px 0 0',
          color: theme.colors.textMuted,
          fontSize: scaleFont('13px', fontScale),
        }}
      >
        {subtitle}
      </p>
    )
    : subtitle;

  return (
    <div style={wrapperStyle}>
      {(title || subtitleNode || headerExtras) && (
        <header style={headerStyle}>
          <div>
            {title && <h1 style={titleStyle}>{title}</h1>}
            {subtitleNode}
          </div>
          {headerExtras}
        </header>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: isCompact ? '16px' : '20px' }}>
        {children}
      </div>

      {footer}
    </div>
  );
};

export default TableLayout;

