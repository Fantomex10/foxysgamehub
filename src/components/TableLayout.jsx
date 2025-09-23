import { useMemo } from 'react';
import useMediaQuery from '../hooks/useMediaQuery.js';
import { useCustomizationTokens } from '../customization/CustomizationContext.jsx';
import { createPanelContainerStyle, createStackStyle } from '../ui/stylePrimitives.js';

const TableLayout = ({
  title,
  subtitle,
  headerExtras,
  children,
  footer,
}) => {
  const { theme, table, pieces, scaleFont } = useCustomizationTokens();
  const isCompact = useMediaQuery('(max-width: 900px)');

  const wrapperStyle = useMemo(
    () => createPanelContainerStyle(
      { theme, pieces },
      {
        background: table.panel ?? theme.colors.surfaceAlt,
        border: `1px solid ${table.border ?? pieces.secondary ?? theme.colors.border}`,
        borderRadius: isCompact ? theme.radii.lg : theme.radii.xl,
        padding: isCompact ? '24px 20px' : '32px',
        display: 'flex',
        flexDirection: 'column',
        gap: isCompact ? '16px' : '24px',
        boxSizing: 'border-box',
        width: '100%',
      },
    ),
    [theme, table, pieces, isCompact],
  );

  const headerStyle = useMemo(
    () => createStackStyle(
      { theme },
      {
        direction: isCompact ? 'column' : 'row',
        align: isCompact ? 'flex-start' : 'center',
        justify: 'space-between',
        gap: '16px',
      },
    ),
    [theme, isCompact],
  );

  const titleStyle = {
    margin: 0,
    fontSize: scaleFont(isCompact ? '22px' : '26px'),
    color: table.text ?? theme.colors.textPrimary,
  };

  const subtitleNode = typeof subtitle === 'string'
    ? (
      <p
        style={{
          margin: '6px 0 0',
          color: theme.colors.textMuted,
          fontSize: scaleFont('13px'),
        }}
      >
        {subtitle}
      </p>
    )
    : subtitle;


  const contentStackStyle = useMemo(
    () => createStackStyle({ theme }, { direction: 'column', gap: isCompact ? '16px' : '20px' }),
    [theme, isCompact],
  );
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

      <div style={contentStackStyle}>
        {children}
      </div>

      {footer}
    </div>
  );
};

export default TableLayout;
