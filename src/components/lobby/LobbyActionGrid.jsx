import React, { useMemo } from 'react';
import { LobbyActionButton } from './LobbyActionButton.jsx';

export const LobbyActionGrid = ({
  actions,
  columns,
  isCompact,
  theme,
  fontScale,
  prefersReducedMotion,
  variant = 'primary',
}) => {
  const gridStyle = useMemo(
    () => ({
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      gap: isCompact ? '6px' : theme.spacing.xs,
      width: '100%',
      maxWidth: isCompact ? '100%' : '520px',
      margin: '0 auto',
    }),
    [columns, isCompact, theme.spacing.xs],
  );

  if (!Array.isArray(actions) || actions.length === 0) {
    return null;
  }

  return (
    <div style={gridStyle}>
      {actions.map((action, index) => {
        const buttonKey = action.key ?? action.label ?? `action-${index}`;
        return (
        <LobbyActionButton
          key={buttonKey}
          action={action}
          columns={columns}
          isCompact={isCompact}
          theme={theme}
          fontScale={fontScale}
          prefersReducedMotion={prefersReducedMotion}
          variant={variant}
        />
      );
    })}
    </div>
  );
};
