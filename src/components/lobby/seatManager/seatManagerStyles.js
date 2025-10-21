import { scaleFont } from '../../../ui/typography.js';

export const getSeatManagerStyles = ({ theme, fontScale }) => {
  const overlay = {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    zIndex: 100,
    background: theme.overlays.scrim,
  };

  const modal = {
    borderRadius: '18px',
    padding: '14px 14px 22px 6px',
    width: 'min(960px, 100%)',
    minHeight: 'min(88vh, 720px)',
    maxHeight: '94vh',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    boxShadow: theme.shadows.panel,
    background: theme.colors.surfaceElevated ?? theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    color: theme.colors.textPrimary,
  };

  const seatColumns = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
  };

  const seatSection = {
    flex: '1 1 320px',
    minWidth: '290px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  };

  const sectionTitle = {
    margin: 0,
    fontSize: scaleFont('13px', fontScale),
    color: theme.colors.textSecondary,
    letterSpacing: '0.05em',
  };

  const list = {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    columnGap: '5px',
    rowGap: '3px',
  };

  const listItem = {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    gridTemplateRows: 'auto auto',
    alignItems: 'center',
    columnGap: '4px',
    rowGap: '1px',
    padding: '2px 4px 2px 2px',
    borderRadius: '8px',
    border: `1px solid ${theme.colors.borderSubtle}`,
    background: theme.colors.surfaceMuted,
    color: theme.colors.textPrimary,
    fontSize: scaleFont('12px', fontScale),
  };

  const seatNameCell = {
    gridColumn: '1 / 2',
    gridRow: '1 / 2',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    minWidth: 0,
  };

  const seatControlsCell = {
    gridColumn: '2 / 3',
    gridRow: '1 / 3',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    alignItems: 'flex-end',
    minWidth: '82px',
  };

  const seatMetaCell = {
    gridColumn: '1 / 2',
    gridRow: '2 / 3',
    fontSize: scaleFont('10px', fontScale),
    letterSpacing: '0.01em',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const metaText = {
    fontSize: scaleFont('10px', fontScale),
    letterSpacing: '0.01em',
    color: theme.colors.textMuted,
  };

  const seatControlStack = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    alignItems: 'flex-end',
  };

  const seatArrowRow = {
    display: 'flex',
    gap: '2px',
  };

  const basePill = {
    padding: '2px 6px',
    borderRadius: '999px',
    fontSize: scaleFont('10px', fontScale),
    fontWeight: 600,
    cursor: 'pointer',
  };

  const benchButton = {
    ...basePill,
    border: `1px solid ${theme.buttons.subtleBorder}`,
    background: theme.buttons.ghostBg,
    color: theme.colors.textSecondary,
  };

  const assignButton = {
    ...basePill,
    border: `1px solid ${theme.colors.accentPrimary}`,
    background: theme.colors.accentPrimarySoft,
    color: theme.colors.accentPrimary,
  };

  const kickButton = {
    ...basePill,
    border: `1px solid ${theme.colors.accentDanger}`,
    background: theme.colors.accentDangerSoft,
    color: theme.colors.accentDanger,
  };

  const arrowButton = {
    padding: 0,
    borderRadius: '8px',
    border: `1px solid ${theme.buttons.subtleBorder}`,
    background: theme.buttons.subtleBg,
    color: theme.buttons.subtleText,
    fontSize: scaleFont('10px', fontScale),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '24px',
    minHeight: '24px',
    cursor: 'pointer',
  };

  const countRow = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: scaleFont('13px', fontScale),
    color: theme.colors.textSecondary,
  };

  const actionRow = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  };

  const actionButton = {
    padding: '6px 12px',
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.buttons.subtleBorder}`,
    background: theme.buttons.subtleBg,
    color: theme.buttons.subtleText,
    fontSize: scaleFont('12px', fontScale),
    cursor: 'pointer',
  };

  const saveButton = {
    ...actionButton,
    border: `1px solid ${theme.colors.accentSuccess}`,
    background: theme.colors.accentSuccessSoft,
    color: theme.colors.accentSuccess,
  };

  const seatSelect = {
    padding: '6px 10px',
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.colors.border}`,
    background: theme.colors.surfaceMuted,
    color: theme.colors.textPrimary,
    fontSize: scaleFont('13px', fontScale),
    fontWeight: 500,
    cursor: 'pointer',
    minWidth: '92px',
  };

  const infoText = {
    margin: 0,
    color: theme.colors.textMuted,
    fontSize: scaleFont('13px', fontScale),
  };

  return {
    overlay,
    modal,
    seatColumns,
    seatSection,
    sectionTitle,
    list,
    listItem,
    seatNameCell,
    seatControlsCell,
    seatMetaCell,
    metaText,
    seatControlStack,
    seatArrowRow,
    benchButton,
    assignButton,
    kickButton,
    arrowButton,
    countRow,
    actionRow,
    actionButton,
    saveButton,
    seatSelect,
    infoText,
  };
};
