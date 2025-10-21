import React, { useMemo } from 'react';
import { useCustomizationTokens } from '../../customization/useCustomization.js';

export const CreateLobbyLayout = ({ children }) => {
  const { theme } = useCustomizationTokens();

  const containerStyle = useMemo(
    () => ({
      maxWidth: '680px',
      margin: '0 auto',
      background: theme.colors.surface,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.md,
      boxShadow: theme.shadows.panel,
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing.sm,
      boxSizing: 'border-box',
      width: '100%',
      position: 'relative',
    }),
    [theme],
  );

  return <div style={containerStyle}>{children}</div>;
};
