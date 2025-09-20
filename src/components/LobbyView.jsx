import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useMediaQuery from '../hooks/useMediaQuery.js';
import { useTheme } from '../ui/ThemeContext.jsx';

const hexWithAlpha = (hex, alpha = '66') => {
  if (typeof hex !== 'string' || !hex.startsWith('#')) return hex;
  if (hex.length === 9) return hex;
  if (hex.length === 4) {
    const expanded = hex
      .slice(1)
      .split('')
      .map((char) => char + char)
      .join('');
    return `#${expanded}${alpha}`;
  }
  if (hex.length === 7) return `${hex}${alpha}`;
  return hex;
};

const cardStyle = {
  backgroundColor: 'rgba(15,23,42,0.85)',
  border: '1px solid rgba(148,163,184,0.25)',
  borderRadius: '18px',
  padding: '12px 14px',
  maxWidth: '640px',
  margin: '0 auto',
  boxShadow: '0 24px 48px rgba(15,23,42,0.55)',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  boxSizing: 'border-box',
  width: '100%',
};

const listStyle = {
  display: 'grid',
  gap: '4px',
  gridTemplateColumns: 'repeat(auto-fit, minmax(132px, 1fr))',
};

const playerRowStyle = (isSelf, isReady) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '5px 8px',
  borderRadius: '10px',
  background: isReady ? 'rgba(34, 197, 94, 0.16)' : 'rgba(148,163,184,0.08)',
  border: `1px solid ${isSelf ? 'rgba(96,165,250,0.45)' : 'rgba(148,163,184,0.18)'}`,
  color: '#f8fafc',
  fontSize: '14px',
  fontWeight: isSelf ? 600 : 500,
  minWidth: 0,
  width: '100%',
});

const playerInfoStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '3px',
  flex: '1 1 auto',
  minWidth: 0,
};

const playerNameStyle = {
  margin: 0,
  fontSize: '15px',
  fontWeight: 600,
  color: '#f8fafc',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const playerMetaStyle = {
  margin: 0,
  fontSize: '11px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#94a3b8',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const controlsButtonStyle = {
  padding: '5px 9px',
  borderRadius: '999px',
  border: '1px solid rgba(148,163,184,0.3)',
  background: 'rgba(15,23,42,0.55)',
  color: '#e2e8f0',
  fontSize: '14px',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'background 0.2s ease, border 0.2s ease',
};

const primaryButtonStyle = {
  padding: '7px 11px',
  borderRadius: '10px',
  border: '1px solid rgba(190, 242, 100, 0.45)',
  background: 'linear-gradient(135deg, rgba(190, 242, 100, 0.95), rgba(59, 130, 246, 0.95))',
  color: '#0f172a',
  fontWeight: 600,
  cursor: 'pointer',
};

const outlineButtonStyle = {
  padding: '8px 12px',
  borderRadius: '10px',
  border: '1px solid rgba(148,163,184,0.35)',
  background: 'rgba(15,23,42,0.35)',
  color: '#cbd5f5',
  fontSize: '14px',
  fontWeight: 500,
  cursor: 'pointer',
};

const dropdownMenuStyle = {
  position: 'absolute',
  top: 'calc(100% + 6px)',
  right: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  minWidth: '160px',
  padding: '6px 0',
  background: 'rgba(15,23,42,0.95)',
  border: '1px solid rgba(148,163,184,0.45)',
  borderRadius: '10px',
  boxShadow: '0 16px 32px rgba(15,23,42,0.55)',
  zIndex: 50,
};

const dropdownItemStyle = (active) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 14px',
  width: '100%',
  border: 'none',
  background: active ? 'rgba(148,163,184,0.16)' : 'transparent',
  color: '#e2e8f0',
  fontSize: '13px',
  fontWeight: active ? 600 : 500,
  cursor: 'pointer',
  textAlign: 'left',
});

const seatOverlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15,23,42,0.75)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px',
  zIndex: 100,
};

const seatModalStyle = {
  background: 'rgba(15,23,42,0.95)',
  border: '1px solid rgba(148,163,184,0.35)',
  borderRadius: '18px',
  padding: '14px 14px 22px 6px',
  width: 'min(960px, 100%)',
  minHeight: 'min(88vh, 720px)',
  maxHeight: '94vh',
  overflowY: 'auto',
  color: '#e2e8f0',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  boxShadow: '0 32px 64px rgba(15,23,42,0.65)',
};

const seatColumnsStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '12px',
};

const seatSectionStyle = {
  flex: '1 1 320px',
  minWidth: '290px',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const seatCountRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '13px',
  color: '#e2e8f0',
};

const seatListStyle = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  columnGap: '5px',
  rowGap: '3px',
};

const seatListItemStyle = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gridTemplateRows: 'auto auto',
  alignItems: 'center',
  columnGap: '4px',
  rowGap: '1px',
  padding: '2px 4px 2px 2px',
  borderRadius: '8px',
  border: '1px solid rgba(148,163,184,0.25)',
  background: 'rgba(148,163,184,0.12)',
  color: '#f8fafc',
  fontSize: '12px',
};

const seatNameCellStyle = {
  gridColumn: '1 / 2',
  gridRow: '1 / 2',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  minWidth: 0,
};

const seatControlsCellStyle = {
  gridColumn: '2 / 3',
  gridRow: '1 / 3',
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  alignItems: 'flex-end',
  minWidth: '82px',
};

const seatMetaCellStyle = {
  gridColumn: '1 / 2',
  gridRow: '2 / 3',
  color: '#94a3b8',
  fontSize: '10px',
  letterSpacing: '0.01em',
  textTransform: 'none',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const seatControlStackStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  alignItems: 'flex-end',
};

const seatArrowRowStyle = {
  display: 'flex',
  gap: '2px',
};

const seatListMetaStyle = {
  fontSize: '10px',
  letterSpacing: '0.01em',
  textTransform: 'none',
  color: '#94a3b8',
};

const seatBenchButtonStyle = {
  padding: '2px 6px',
  borderRadius: '999px',
  border: '1px solid rgba(248,113,113,0.45)',
  background: 'rgba(248,113,113,0.18)',
  color: '#fecaca',
  fontSize: '10px',
  fontWeight: 600,
  cursor: 'pointer',
};

const seatKickButtonStyle = {
  padding: '2px 6px',
  borderRadius: '999px',
  border: '1px solid rgba(248,113,113,0.6)',
  background: 'rgba(239,68,68,0.25)',
  color: '#fecaca',
  fontSize: '10px',
  fontWeight: 600,
  cursor: 'pointer',
};

const seatAssignButtonStyle = {
  padding: '2px 6px',
  borderRadius: '999px',
  border: '1px solid rgba(34,197,94,0.45)',
  background: 'rgba(34,197,94,0.18)',
  color: '#bbf7d0',
  fontSize: '10px',
  fontWeight: 600,
  cursor: 'pointer',
};

const seatControlButtonStyle = {
  padding: '1px 4px',
  borderRadius: '8px',
  border: '1px solid rgba(148,163,184,0.3)',
  background: 'rgba(15,23,42,0.6)',
  color: '#e2e8f0',
  fontSize: '10px',
  cursor: 'pointer',
};

const benchRowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '5px 8px',
  borderRadius: '10px',
  border: '1px solid rgba(148,163,184,0.2)',
  background: 'rgba(30,41,59,0.4)',
  color: '#cbd5f5',
  fontSize: '13px',
};

const dropdownWrapperStyle = {
  position: 'relative',
  marginLeft: 'auto',
  display: 'inline-flex',
};

const headerRowStyle = (isCompact) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: isCompact ? '6px' : '12px',
  flexWrap: 'wrap',
  marginBottom: isCompact ? '4px' : '8px',
});

const gameSelectWrapperStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  marginLeft: 'auto',
};

const gameSelectStyle = (isCompact) => ({
  padding: isCompact ? '6px 8px' : '6px 10px',
  borderRadius: '10px',
  border: '1px solid rgba(148,163,184,0.35)',
  background: 'rgba(15,23,42,0.55)',
  color: '#e2e8f0',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
});

const gameSelectLabelStyle = {
  fontSize: '10px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#94a3b8',
};

const STATIC_CONTROL_STYLE = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4px 6px',
  borderRadius: '999px',
  minWidth: '32px',
  height: '28px',
};

const STATUS_META = {
  notReady: {
    label: 'Not ready',
    color: '#facc15',
  },
  ready: {
    label: 'Ready',
    color: '#4ade80',
  },
  needsTime: {
    label: 'Needs time',
    color: '#f87171',
  },
};

const STATUS_OPTIONS = ['notReady', 'ready', 'needsTime'];

const NotReadyIcon = ({ color = '#facc15', size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <circle cx="9" cy="9" r="7.5" stroke={color} strokeWidth="2" />
    <line x1="5" y1="9" x2="13" y2="9" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ReadyIcon = ({ color = '#4ade80', size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <circle cx="9" cy="9" r="7.5" stroke={color} strokeWidth="2" />
    <polyline points="4.5,9.5 7.5,12.5 13.5,6.5" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const NeedsTimeIcon = ({ color = '#f87171', size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <circle cx="9" cy="9" r="7.5" stroke={color} strokeWidth="2" />
    <line x1="9" y1="9" x2="9" y2="5" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <line x1="9" y1="9" x2="12" y2="11" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ICON_LOOKUP = {
  notReady: NotReadyIcon,
  ready: ReadyIcon,
  needsTime: NeedsTimeIcon,
};

const StatusIcon = ({ status, size = 18 }) => {
  const meta = STATUS_META[status] ?? STATUS_META.notReady;
  const IconComponent = ICON_LOOKUP[status] ?? NotReadyIcon;
  return <IconComponent color={meta.color} size={size} />;
};

const ChevronDownIcon = ({ color = '#cbd5f5', size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M3 4.5L6 7.5L9 4.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const StatusControl = ({ status, interactive, onSelect, onCycle, playerName }) => {
  const { theme } = useTheme();
  const meta = STATUS_META[status] ?? STATUS_META.notReady;
  const currentLabel = meta.label;

  if (!interactive) {
    return (
      <div style={dropdownWrapperStyle}>
        <div
          style={{
            ...STATIC_CONTROL_STYLE,
            border: `1px solid ${hexWithAlpha(meta.color, '55')}`,
            background: theme.colors.surfaceMuted,
            color: meta.color,
            cursor: 'default',
          }}
          aria-label={`Status for ${playerName ?? 'player'}: ${currentLabel}`}
          title={currentLabel}
        >
          <StatusIcon status={status} size={14} />
        </div>
      </div>
    );
  }

  if (!onSelect) {
    return (
      <div style={dropdownWrapperStyle}>
        <button
          type="button"
          onClick={onCycle}
          style={{
            ...STATIC_CONTROL_STYLE,
            border: `1px solid ${hexWithAlpha(meta.color, '70')}`,
            background: theme.colors.surfaceMuted,
            color: meta.color,
            cursor: 'pointer',
          }}
          aria-label={`Toggle status for ${playerName ?? 'player'} (currently ${currentLabel})`}
          title={`Toggle status (currently ${currentLabel})`}
        >
          <StatusIcon status={status} size={14} />
        </button>
      </div>
    );
  }

  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return () => {};

    const handlePointer = (event) => {
      if (!menuRef.current || !buttonRef.current) return;
      if (menuRef.current.contains(event.target) || buttonRef.current.contains(event.target)) {
        return;
      }
      setOpen(false);
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('touchstart', handlePointer);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('touchstart', handlePointer);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleSelect = (value) => {
    setOpen(false);
    if (value && value !== status) {
      onSelect(value);
    }
  };

  return (
      <div style={dropdownWrapperStyle}>
        <button
          type="button"
          ref={buttonRef}
          onClick={() => setOpen((prev) => !prev)}
          style={{
            ...STATIC_CONTROL_STYLE,
            gap: '4px',
            border: `1px solid ${hexWithAlpha(meta.color, open ? 'AA' : '70')}`,
            background: open ? theme.colors.surfaceAlt : theme.colors.surfaceMuted,
            color: meta.color,
            cursor: 'pointer',
          }}
          aria-haspopup="listbox"
          aria-expanded={open}
        aria-label={`Change status for ${playerName ?? 'player'} (currently ${currentLabel})`}
        title={`Change status (currently ${currentLabel})`}
      >
        <StatusIcon status={status} size={14} />
        <ChevronDownIcon color={meta.color} size={11} />
      </button>
      {open && (
        <div
          ref={menuRef}
          style={{
            ...dropdownMenuStyle,
            background: theme.colors.surfaceElevated ?? theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
          }}
          role="listbox"
          aria-label={`Select a status for ${playerName ?? 'player'}`}
        >
          {STATUS_OPTIONS.map((option) => {
            const optionMeta = STATUS_META[option] ?? STATUS_META.notReady;
            const isActive = option === status;
            return (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(option)}
                style={{
                  ...dropdownItemStyle(isActive),
                  background: isActive ? theme.colors.surfaceMuted : 'transparent',
                  color: theme.colors.textPrimary,
                }}
                role="option"
                aria-selected={isActive}
              >
                <StatusIcon status={option} size={14} />
                <span>{optionMeta.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};


const SeatManagerDialog = ({
  open,
  onClose,
  onApply,
  players,
  spectators,
  hostId,
  seatRules,
  roomSettings,
  userId,
}) => {
  const { theme } = useTheme();
  const overlayStyles = useMemo(() => ({
    ...seatOverlayStyle,
    background: theme.overlays.scrim,
  }), [theme]);
  const modalStyles = useMemo(() => ({
    ...seatModalStyle,
    background: theme.colors.surfaceElevated ?? theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    color: theme.colors.textPrimary,
    boxShadow: theme.shadows.panel,
  }), [theme]);
  const listItemStyles = useMemo(() => ({
    ...seatListItemStyle,
    border: `1px solid ${theme.colors.borderSubtle}`,
    background: theme.colors.surfaceMuted,
    color: theme.colors.textPrimary,
  }), [theme]);
  const benchRowStyles = useMemo(() => ({
    ...benchRowStyle,
    border: `1px solid ${theme.colors.borderSubtle}`,
    background: theme.colors.surfaceMuted,
    color: theme.colors.textSecondary,
  }), [theme]);
  const metaTextStyle = useMemo(() => ({
    ...seatListMetaStyle,
    color: theme.colors.textMuted,
  }), [theme]);
  const controlStackStyles = useMemo(() => ({
    ...seatControlStackStyle,
  }), []); // static
  const actionButtonStyle = useMemo(() => ({
    ...seatControlButtonStyle,
    border: `1px solid ${theme.buttons.subtleBorder}`,
    background: theme.buttons.subtleBg,
    color: theme.buttons.subtleText,
  }), [theme]);
  const assignButtonStyle = useMemo(() => ({
    ...seatAssignButtonStyle,
    border: `1px solid ${theme.colors.accentPrimary}`,
    background: theme.colors.accentPrimarySoft,
    color: theme.colors.accentPrimary,
  }), [theme]);
  const kickButtonStyle = useMemo(() => ({
    ...seatKickButtonStyle,
    border: `1px solid ${theme.colors.accentDanger}`,
    background: theme.colors.accentDangerSoft,
    color: theme.colors.accentDanger,
  }), [theme]);
  const benchButtonStyle = useMemo(() => ({
    ...seatBenchButtonStyle,
    border: `1px solid ${theme.buttons.subtleBorder}`,
    background: theme.buttons.ghostBg,
    color: theme.colors.textSecondary,
  }), [theme]);
  const columnStyles = useMemo(() => ({ ...seatColumnsStyle }), []);
  const sectionStyles = useMemo(() => ({ ...seatSectionStyle }), []);
  const countRowStyles = useMemo(() => ({
    ...seatCountRowStyle,
    color: theme.colors.textSecondary,
  }), [theme]);
  const listStyles = useMemo(() => ({ ...seatListStyle }), []);
  const canManageSeats = hostId === userId;
  const allParticipants = useMemo(() => {
    const map = new Map();
    for (const participant of Array.isArray(players) ? players : []) {
      if (participant?.id) {
        map.set(participant.id, participant);
      }
    }
    for (const participant of Array.isArray(spectators) ? spectators : []) {
      if (participant?.id && !map.has(participant.id)) {
        map.set(participant.id, participant);
      }
    }
    return Array.from(map.values());
  }, [players, spectators]);

  const activePlayerCount = useMemo(() => (Array.isArray(players) ? players.length : 0), [players]);

  const allIds = useMemo(() => allParticipants.map((participant) => participant.id), [allParticipants]);
  const availableSet = useMemo(() => new Set(allIds), [allIds]);

  const requiredSeats = seatRules?.requiredPlayers ?? null;
  const minSeats = Math.max(2, requiredSeats ?? seatRules?.minPlayers ?? 2);
  const maxSeats = Math.max(minSeats, seatRules?.maxPlayers ?? requiredSeats ?? roomSettings?.maxPlayers ?? minSeats);

  const initialSeatCount = useMemo(() => {
    const raw = roomSettings?.maxPlayers ?? activePlayerCount ?? minSeats;
    return Math.min(Math.max(raw, minSeats), maxSeats);
  }, [roomSettings?.maxPlayers, activePlayerCount, minSeats, maxSeats]);

  const [seatCount, setSeatCount] = useState(initialSeatCount);
  const [seatIds, setSeatIds] = useState(() => (Array.isArray(players) ? players.map((player) => player.id) : []));
  const [kickedIds, setKickedIds] = useState([]);

  useEffect(() => {
    if (!open) return;
    setSeatCount(initialSeatCount);
    setSeatIds(Array.isArray(players) ? players.map((player) => player.id) : []);
    setKickedIds([]);
  }, [open, initialSeatCount, players]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const applySeatLimit = (candidateIds, desiredCount) => {
    const limit = Math.min(Math.max(desiredCount ?? seatCount, minSeats), maxSeats);
    const ordered = [];
    for (const id of candidateIds) {
      if (!availableSet.has(id)) continue;
      if (ordered.includes(id)) continue;
      ordered.push(id);
      if (ordered.length === limit) break;
    }
    if (hostId && availableSet.has(hostId) && !ordered.includes(hostId)) {
      ordered.unshift(hostId);
    }
    const final = [];
    for (const id of ordered) {
      if (final.length >= limit) break;
      if (!final.includes(id)) {
        final.push(id);
      }
    }
    if (final.length === 0) {
      const fallback = hostId && availableSet.has(hostId) ? hostId : allIds[0];
      if (fallback) {
        final.push(fallback);
      }
    }
    if (hostId && availableSet.has(hostId) && !final.includes(hostId)) {
      if (final.length < limit) {
        final.push(hostId);
      } else if (final.length > 0) {
        final[0] = hostId;
      }
      const deduped = [];
      for (const id of final) {
        if (deduped.length >= limit) break;
        if (!deduped.includes(id)) {
          deduped.push(id);
        }
      }
      return deduped;
    }
    return final;
  };

  const clampSeatCount = (value) => {
    const numeric = typeof value === 'number' ? value : Number.parseInt(value, 10);
    if (Number.isNaN(numeric)) {
      return seatCount;
    }
    return Math.min(Math.max(numeric, minSeats), maxSeats);
  };

  const benchIds = useMemo(
    () => allIds.filter((id) => !seatIds.includes(id) && !kickedIds.includes(id)),
    [allIds, seatIds, kickedIds],
  );
  const seatsFull = seatIds.length >= seatCount;
  const seatCountOptions = useMemo(() => {
    const options = [];
    for (let option = minSeats; option <= maxSeats; option += 1) {
      options.push(option);
    }
    return options;
  }, [minSeats, maxSeats]);
  const seatCountFixed = seatCountOptions.length === 1;

  const handleSeatCountChange = (event) => {
    const nextCount = clampSeatCount(event.target.value);
    setSeatCount(nextCount);
    setSeatIds((current) => applySeatLimit(current, nextCount));
  };

  const handleBench = (id) => {
    if (id === hostId) return;
    if (!canManageSeats) return;
    setSeatIds((current) => applySeatLimit(current.filter((item) => item !== id), seatCount));
    setKickedIds((current) => current.filter((item) => item !== id));
  };

  const handleSeat = (id) => {
    if (!canManageSeats) return;
    setKickedIds((current) => current.filter((item) => item !== id));
    setSeatIds((current) => applySeatLimit([...current, id], seatCount));
  };

  const handleKick = (id) => {
    if (id === hostId) return;
    if (!canManageSeats) return;
    setSeatIds((current) => current.filter((item) => item !== id));
    setKickedIds((current) => (current.includes(id) ? current : [...current, id]));
  };

  const handleReorder = (id, direction) => {
    if (!canManageSeats) return;
    setSeatIds((current) => {
      const index = current.indexOf(id);
      if (index === -1) return current;
      const next = [...current];
      if (direction === 'up' && index > 0) {
        [next[index - 1], next[index]] = [next[index], next[index - 1]];
      }
      if (direction === 'down' && index < next.length - 1) {
        [next[index + 1], next[index]] = [next[index], next[index + 1]];
      }
      return applySeatLimit(next, seatCount);
    });
  };

  const handleSave = () => {
    if (typeof onApply !== 'function') {
      onClose?.();
      return;
    }
    const effectiveSeatIds = seatIds.filter((id) => !kickedIds.includes(id));
    const benchOrder = allIds.filter((id) => !effectiveSeatIds.includes(id) && !kickedIds.includes(id));
    onApply({
      maxSeats: seatCount,
      seatOrder: effectiveSeatIds,
      benchOrder,
      kickedIds,
    });
  };

  if (!open) {
    return null;
  }

  return (
    <div style={overlayStyles} onClick={onClose}>
      <div style={modalStyles} onClick={(event) => event.stopPropagation()}>
        <div>
          {seatCountFixed ? (
            <p style={{ margin: 0, color: theme.colors.textMuted, fontSize: '13px' }}>
              Seat count fixed to {seatCount} for this game.
            </p>
          ) : (
            <div style={countRowStyles}>
              <span style={{ fontWeight: 600, color: theme.colors.textPrimary }}>Seat count</span>
              <select
                value={seatCount}
                onChange={handleSeatCountChange}
                style={{
                  ...gameSelectStyle(false),
                  border: `1px solid ${theme.colors.border}`,
                  background: theme.colors.surfaceMuted,
                  color: theme.colors.textPrimary,
                  minWidth: '92px',
                }}
              >
                {seatCountOptions.map((count) => (
                  <option key={count} value={count}>
                    {count} seats
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div style={columnStyles}>
          <div style={sectionStyles}>
            <h3 style={{ margin: 0, fontSize: '13px', color: theme.colors.textSecondary, letterSpacing: '0.05em' }}>
              Seated players ({seatIds.length}/{seatCount})
            </h3>
            <ul style={listStyles}>
              {seatIds.map((id, index) => {
                const participant = allParticipants.find((entry) => entry.id === id);
                if (!participant) return null;
                const isHostParticipant = participant.id === hostId;
                const isSelfParticipant = participant.id === userId;
                const canMoveUp = index > 0;
                const canMoveDown = index < seatIds.length - 1;
                const canManageParticipant = canManageSeats && !isHostParticipant;
                const metaLabels = [
                  isSelfParticipant ? 'You' : null,
                  isHostParticipant ? 'Host' : null,
                  participant.isBot ? 'Bot' : null,
                  `Seat ${index + 1}`
                ].filter(Boolean);
                return (
                  <li key={id} style={listItemStyles}>
                    <div style={seatNameCellStyle}>
                      <span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{participant.name}</span>
                    </div>
                    <div style={seatControlsCellStyle}>
                      {canManageParticipant && (
                        <div style={controlStackStyles}>
                          <button
                            type="button"
                            style={benchButtonStyle}
                            onClick={() => handleBench(id)}
                          >
                            Bench
                          </button>
                        </div>
                      )}
                      <div style={seatArrowRowStyle}>
                        <button
                          type="button"
                          style={actionButtonStyle}
                          onClick={() => handleReorder(id, 'up')}
                          disabled={!canMoveUp}
                          aria-label="Move up"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          style={actionButtonStyle}
                          onClick={() => handleReorder(id, 'down')}
                          disabled={!canMoveDown}
                          aria-label="Move down"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                    <div style={seatMetaCellStyle}>
                      <span style={metaTextStyle}>{metaLabels.join(' · ')}</span>
                    </div>
                  </li>
                );
              })}
              {seatIds.length === 0 && (
                <li style={{ ...listItemStyles, justifyContent: 'center', color: theme.colors.textMuted }}>
                  No players seated.
                </li>
              )}
            </ul>
          </div>

          <div style={sectionStyles}>
            <h3 style={{ margin: 0, fontSize: '13px', color: theme.colors.textSecondary, letterSpacing: '0.05em' }}>
              Spectator bench ({benchIds.length})
            </h3>
            <ul style={listStyles}>
              {benchIds.map((id) => {
                const participant = allParticipants.find((entry) => entry.id === id);
                if (!participant) return null;
                const metaLabels = [
                  participant.id === userId ? 'You' : null,
                  participant.isHost ? 'Host' : null,
                  participant.isBot ? 'Bot' : null,
                  'Spectator',
                ].filter(Boolean);
                return (
                  <li key={id} style={listItemStyles}>
                    <div style={seatNameCellStyle}>
                      <span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{participant.name}</span>
                    </div>
                    <div style={seatControlsCellStyle}>
                      {canManageSeats && (
                        <div style={controlStackStyles}>
                          <button
                            type="button"
                            style={assignButtonStyle}
                            onClick={() => handleSeat(id)}
                            disabled={seatsFull}
                          >
                            Seat
                          </button>
                          <button
                            type="button"
                            style={kickButtonStyle}
                            onClick={() => handleKick(id)}
                          >
                            Kick
                          </button>
                        </div>
                      )}
                    </div>
                    <div style={seatMetaCellStyle}>
                      <span style={metaTextStyle}>{metaLabels.join(' · ')}</span>
                    </div>
                  </li>
                );
              })}
              {benchIds.length === 0 && (
                <li style={{ ...listItemStyles, justifyContent: 'center', color: theme.colors.textMuted }}>
                  No spectators currently benched.
                </li>
              )}
            </ul>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" style={actionButtonStyle} onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            style={{
              ...actionButtonStyle,
              border: `1px solid ${theme.colors.accentSuccess}`,
              background: theme.colors.accentSuccessSoft,
              color: theme.colors.accentSuccess,
            }}
            onClick={handleSave}
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
};

const getPlayerStatus = (player) => {
  if (['notReady', 'ready', 'needsTime'].includes(player.status)) {
    return player.status;
  }
  return player.isReady ? 'ready' : 'notReady';
};

const DEFAULT_BANNER = 'Waiting for players to ready up…';

const LobbyView = ({
  roomId,
  roomName,
  players,
  spectators = [],
  hostId,
  userId,
  banner,
  gameOptions,
  selectedGameId,
  seatRules,
  roomSettings,
  onSelectGame,
  onCycleStatus,
  onSetStatus,
  onUpdateSeats,
  onStart,
  onAddBot,
  onRemoveBot,
  onReturnToWelcome,
  onBackToHub,
  onConfigureTable,
}) => {
  const { theme } = useTheme();
  const isHost = hostId === userId;
  const readyCount = players.filter((player) => player.isReady).length;
  const canStart = isHost && players.length >= 2 && readyCount === players.length;
  const isCompactLayout = useMediaQuery('(max-width: 600px)');
  const containerStyles = useMemo(() => ({
    ...cardStyle,
    padding: isCompactLayout ? '4px 10px 12px' : cardStyle.padding,
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    boxShadow: theme.shadows.panel,
  }), [isCompactLayout, theme]);
  const playerRowFor = useMemo(() => (
    (isSelf, isReady) => ({
      ...playerRowStyle(isSelf, isReady),
      background: isReady ? theme.colors.accentSuccessSoft : theme.colors.surfaceMuted,
      border: `1px solid ${isSelf ? theme.colors.accentPrimary : theme.colors.borderSubtle}`,
      color: theme.colors.textPrimary,
    })
  ), [theme]);
  const playerNameStyles = useMemo(() => ({ ...playerNameStyle, color: theme.colors.textPrimary }), [theme]);
  const playerMetaStyles = useMemo(() => ({ ...playerMetaStyle, color: theme.colors.textMuted }), [theme]);
  const baseControlButton = useMemo(() => ({
    ...controlsButtonStyle,
    border: `1px solid ${theme.buttons.subtleBorder}`,
    background: theme.buttons.subtleBg,
    color: theme.buttons.subtleText,
  }), [theme]);
  const primaryActionButton = useMemo(() => ({
    ...primaryButtonStyle,
    border: 'none',
    background: theme.buttons.primaryBg,
    color: theme.buttons.primaryText,
  }), [theme]);
  const outlineActionButton = useMemo(() => ({
    ...outlineButtonStyle,
    border: `1px solid ${theme.buttons.subtleBorder}`,
    background: theme.buttons.ghostBg,
    color: theme.colors.textSecondary,
  }), [theme]);
  const benchRowThemed = useMemo(() => ({
    ...benchRowStyle,
    background: theme.colors.surfaceMuted,
    border: `1px solid ${theme.colors.borderSubtle}`,
    color: theme.colors.textSecondary,
  }), [theme]);
  const gameSelectId = roomId ? `lobby-game-select-${roomId}` : 'lobby-game-select';
  const availableGames = Array.isArray(gameOptions) ? gameOptions : [];
  const currentGameId = selectedGameId && availableGames.some((game) => game.id === selectedGameId)
    ? selectedGameId
    : (availableGames[0]?.id ?? '');
  const showGameSelect = isHost && availableGames.length > 0 && typeof onSelectGame === 'function';
  const handleGameSelectChange = (event) => {
    const nextGameId = event.target.value;
    if (!nextGameId || nextGameId === currentGameId) return;
    onSelectGame(nextGameId);
  };

  const seatCapacity = roomSettings?.maxPlayers ?? players.length;
  const benchList = Array.isArray(spectators) ? spectators : [];
  const [seatManagerOpen, setSeatManagerOpen] = useState(false);
  const seatManagerEnabled = isHost && typeof onUpdateSeats === 'function';
  const handleSeatManagerApply = (config) => {
    if (!seatManagerEnabled) return;
    const result = onUpdateSeats(config);
    if (result && typeof result.then === 'function') {
      result.finally(() => setSeatManagerOpen(false));
    } else {
      setSeatManagerOpen(false);
    }
  };

  return (
    <div style={containerStyles}>
      <section>
        <div style={{ ...headerRowStyle(isCompactLayout), color: theme.colors.textPrimary }}>
          <h3 style={{ margin: 0, fontSize: '17px', color: theme.colors.textSecondary, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Players ({players.length}/{seatCapacity})
          </h3>
          {showGameSelect && (
            <div style={gameSelectWrapperStyle}>
              <span style={{ ...gameSelectLabelStyle, color: theme.colors.textMuted }}>Game</span>
              <select
                id={gameSelectId}
                value={currentGameId}
                onChange={handleGameSelectChange}
                style={{
                  ...gameSelectStyle(isCompactLayout),
                  border: `1px solid ${theme.colors.border}`,
                  background: theme.colors.surfaceMuted,
                  color: theme.colors.textPrimary,
                }}
                aria-label="Select game"
              >
                {availableGames.map((game) => (
                  <option key={game.id} value={game.id}>
                    {game.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div style={listStyle}>
          {players.map((player) => {
            const metaLabels = [];
            if (player.id === userId) metaLabels.push('You');
            if (player.isHost) metaLabels.push('Host');
            if (player.isBot) metaLabels.push('Bot');
            const status = getPlayerStatus(player);
            const canChangeStatus = player.id === userId || (isHost && player.isBot);
            const handleStatusSelect = (nextStatus) => {
              if (!canChangeStatus) return;
              if (onSetStatus) {
                onSetStatus(player.id, nextStatus);
              } else {
                onCycleStatus?.(player.id);
              }
            };
            const handleStatusCycle = () => {
              if (!canChangeStatus) return;
              onCycleStatus?.(player.id);
            };
            return (
              <div
                key={player.id}
                style={playerRowFor(player.id === userId, player.isReady)}
              >
                <div style={playerInfoStyle}>
                  <p style={playerNameStyles}>{player.name}</p>
                  {metaLabels.length > 0 && <p style={playerMetaStyles}>{metaLabels.join(' · ')}</p>}
                </div>
                <StatusControl
                  status={status}
                  interactive={canChangeStatus}
                  onSelect={onSetStatus ? handleStatusSelect : null}
                  onCycle={!onSetStatus ? handleStatusCycle : null}
                  playerName={player.name}
                />
              </div>
            );
          })}
        </div>
      </section>

      {benchList.length > 0 && (
        <section>
          <h3 style={{ marginBottom: '4px', fontSize: '17px', color: theme.colors.textSecondary, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Spectator bench ({benchList.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {benchList.map((spectator) => {
              const metaLabels = [];
              if (spectator.id === userId) metaLabels.push('You');
              if (spectator.isHost) metaLabels.push('Host');
              if (spectator.isBot) metaLabels.push('Bot');
              metaLabels.push('Spectator');
              return (
                <div key={spectator.id} style={benchRowThemed}>
                  <div style={playerInfoStyle}>
                    <p style={playerNameStyles}>{spectator.name}</p>
                    <p style={playerMetaStyles}>{metaLabels.join(' · ')}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
      {banner && banner !== DEFAULT_BANNER && (
        <div
          style={{
            background: theme.colors.accentDangerSoft,
            border: `1px solid ${theme.colors.accentDanger}`,
            color: theme.colors.accentDanger,
            padding: '10px 14px',
            borderRadius: theme.radii.sm,
            fontSize: '14px',
          }}
        >
          {banner}
        </div>
      )}

      {isHost && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={onAddBot}
              style={{
                ...baseControlButton,
                border: `1px solid ${theme.colors.accentSuccess}`,
                background: theme.colors.accentSuccessSoft,
                color: theme.colors.accentSuccess,
              }}
            >
              Add bot
            </button>
            <button
              type="button"
              onClick={onRemoveBot}
              style={{
                ...baseControlButton,
                border: `1px solid ${theme.colors.accentDanger}`,
                background: theme.colors.accentDangerSoft,
                color: theme.colors.accentDanger,
              }}
            >
              Remove bot
            </button>
            <button
              type="button"
              onClick={() => seatManagerEnabled && setSeatManagerOpen(true)}
              disabled={!seatManagerEnabled}
              style={{
                ...baseControlButton,
                border: `1px solid ${theme.colors.accentPrimary}`,
                background: theme.colors.accentPrimarySoft,
                color: theme.colors.accentPrimary,
                opacity: seatManagerEnabled ? 1 : 0.45,
                cursor: seatManagerEnabled ? 'pointer' : 'not-allowed',
              }}
            >
              Seat select
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '280px' }}>
            <button
              type="button"
              onClick={onStart}
              disabled={!canStart}
              style={{
                ...primaryActionButton,
                opacity: canStart ? 1 : 0.4,
                cursor: canStart ? 'pointer' : 'not-allowed',
              }}
            >
              Start game
            </button>
            <button
              type="button"
              onClick={onConfigureTable ?? (() => {})}
              style={outlineActionButton}
            >
              Table options
            </button>
          </div>
        </section>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        {isHost && (
          <button type="button" onClick={onReturnToWelcome} style={baseControlButton}>
            Reset lobby
          </button>
        )}
        <button type="button" onClick={onBackToHub} style={baseControlButton}>
          Back to hub
        </button>
      </div>
      {seatManagerEnabled && (
        <SeatManagerDialog
          open={seatManagerOpen}
          onClose={() => setSeatManagerOpen(false)}
          onApply={handleSeatManagerApply}
          players={players}
          spectators={benchList}
          hostId={hostId}
          userId={userId}
          seatRules={seatRules}
          roomSettings={roomSettings}
        />
      )}
    </div>
  );
};

export default LobbyView;
