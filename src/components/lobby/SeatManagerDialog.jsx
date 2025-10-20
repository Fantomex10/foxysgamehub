import { useEffect, useMemo, useState } from 'react';
import { useCustomizationTokens } from '../../customization/useCustomization.js';
import { scaleFont } from '../../ui/typography.js';

const ChevronIcon = ({ direction = 'up', size = 12 }) => {
  const path = direction === 'down'
    ? 'M3 4.5 6 7.5 9 4.5'
    : 'M3 7.5 6 4.5 9 7.5';

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 12 12"
      role="img"
      style={{ display: 'block' }}
    >
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const baseOverlayStyle = {
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px',
  zIndex: 100,
};

const baseModalStyle = {
  borderRadius: '18px',
  padding: '14px 14px 22px 6px',
  width: 'min(960px, 100%)',
  minHeight: 'min(88vh, 720px)',
  maxHeight: '94vh',
  overflowY: 'auto',
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

const baseListStyle = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  columnGap: '5px',
  rowGap: '3px',
};

const baseListItemStyle = {
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
  fontSize: '10px',
  letterSpacing: '0.01em',
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

const seatControlButtonStyle = {
  padding: '1px 4px',
  borderRadius: '8px',
  border: '1px solid rgba(148,163,184,0.3)',
  background: 'rgba(15,23,42,0.6)',
  color: '#e2e8f0',
  fontSize: '10px',
  cursor: 'pointer',
};

const baseBenchButtonStyle = {
  padding: '2px 6px',
  borderRadius: '999px',
  border: '1px solid rgba(148,163,184,0.35)',
  background: 'rgba(15,23,42,0.35)',
  color: '#cbd5f5',
  fontSize: '10px',
  fontWeight: 600,
  cursor: 'pointer',
};

const baseAssignButtonStyle = {
  padding: '2px 6px',
  borderRadius: '999px',
  border: '1px solid rgba(34,197,94,0.45)',
  background: 'rgba(34,197,94,0.18)',
  color: '#bbf7d0',
  fontSize: '10px',
  fontWeight: 600,
  cursor: 'pointer',
};

const baseKickButtonStyle = {
  padding: '2px 6px',
  borderRadius: '999px',
  border: '1px solid rgba(248,113,113,0.6)',
  background: 'rgba(239,68,68,0.25)',
  color: '#fecaca',
  fontSize: '10px',
  fontWeight: 600,
  cursor: 'pointer',
};

const gameSelectStyle = (theme, scale) => ({
  padding: '6px 10px',
  borderRadius: theme.radii.sm,
  border: `1px solid ${theme.colors.border}`,
  background: theme.colors.surfaceMuted,
  color: theme.colors.textPrimary,
  fontSize: scaleFont('13px', scale),
  fontWeight: 500,
  cursor: 'pointer',
  minWidth: '92px',
});

export const SeatManagerDialog = ({
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
  const { theme, accessibility } = useCustomizationTokens();
  const fontScale = accessibility?.fontScale ?? 1;

  const overlayStyles = useMemo(() => ({
    ...baseOverlayStyle,
    background: theme.overlays.scrim,
  }), [theme]);

  const modalStyles = useMemo(() => ({
    ...baseModalStyle,
    background: theme.colors.surfaceElevated ?? theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    color: theme.colors.textPrimary,
    boxShadow: theme.shadows.panel,
  }), [theme]);

  const listItemStyles = useMemo(() => ({
    ...baseListItemStyle,
    border: `1px solid ${theme.colors.borderSubtle}`,
    background: theme.colors.surfaceMuted,
    color: theme.colors.textPrimary,
    fontSize: scaleFont('12px', fontScale),
  }), [theme, fontScale]);

  const benchButtonStyle = useMemo(() => ({
    ...baseBenchButtonStyle,
    border: `1px solid ${theme.buttons.subtleBorder}`,
    background: theme.buttons.ghostBg,
    color: theme.colors.textSecondary,
    fontSize: scaleFont('10px', fontScale),
  }), [theme, fontScale]);

  const assignButtonStyle = useMemo(() => ({
    ...baseAssignButtonStyle,
    border: `1px solid ${theme.colors.accentPrimary}`,
    background: theme.colors.accentPrimarySoft,
    color: theme.colors.accentPrimary,
    fontSize: scaleFont('10px', fontScale),
  }), [theme, fontScale]);

  const kickButtonStyle = useMemo(() => ({
    ...baseKickButtonStyle,
    border: `1px solid ${theme.colors.accentDanger}`,
    background: theme.colors.accentDangerSoft,
    color: theme.colors.accentDanger,
    fontSize: scaleFont('10px', fontScale),
  }), [theme, fontScale]);

  const arrowButtonStyle = useMemo(() => ({
    ...seatControlButtonStyle,
    border: `1px solid ${theme.buttons.subtleBorder}`,
    background: theme.buttons.subtleBg,
    color: theme.buttons.subtleText,
    fontSize: scaleFont('10px', fontScale),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '24px',
    minHeight: '24px',
    padding: 0,
  }), [theme, fontScale]);

  const seatMetaStyles = useMemo(() => ({
    ...seatMetaCellStyle,
    fontSize: scaleFont('10px', fontScale),
  }), [fontScale]);

  const metaTextStyle = useMemo(() => ({
    fontSize: scaleFont('10px', fontScale),
    letterSpacing: '0.01em',
    color: theme.colors.textMuted,
  }), [theme, fontScale]);

  const countRowStyles = useMemo(() => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: scaleFont('13px', fontScale),
    color: theme.colors.textSecondary,
  }), [theme, fontScale]);

  const actionRowStyle = useMemo(() => ({
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  }), []);

  const actionButtonStyle = useMemo(() => ({
    ...seatControlButtonStyle,
    padding: '6px 12px',
    fontSize: scaleFont('12px', fontScale),
    border: `1px solid ${theme.buttons.subtleBorder}`,
    background: theme.buttons.subtleBg,
    color: theme.buttons.subtleText,
  }), [theme, fontScale]);

  const saveButtonStyle = useMemo(() => ({
    ...actionButtonStyle,
    border: `1px solid ${theme.colors.accentSuccess}`,
    background: theme.colors.accentSuccessSoft,
    color: theme.colors.accentSuccess,
  }), [actionButtonStyle, theme]);

  const canManageSeats = hostId === userId;

  const allParticipants = useMemo(() => {
    const map = new Map();
    for (const participant of Array.isArray(players) ? players : []) {
      if (participant?.id) map.set(participant.id, participant);
    }
    for (const participant of Array.isArray(spectators) ? spectators : []) {
      if (participant?.id && !map.has(participant.id)) {
        map.set(participant.id, participant);
      }
    }
    return Array.from(map.values());
  }, [players, spectators]);

  const activePlayerCount = useMemo(
    () => (Array.isArray(players) ? players.length : 0),
    [players],
  );

  const allIds = useMemo(
    () => allParticipants.map((participant) => participant.id),
    [allParticipants],
  );

  const availableSet = useMemo(() => new Set(allIds), [allIds]);

  const requiredSeats = seatRules?.requiredPlayers ?? null;
  const minSeats = Math.max(2, requiredSeats ?? seatRules?.minPlayers ?? 2);
  const maxSeats = Math.max(
    minSeats,
    seatRules?.maxPlayers ?? requiredSeats ?? roomSettings?.maxPlayers ?? minSeats,
  );

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
            <p style={{ margin: 0, color: theme.colors.textMuted, fontSize: scaleFont('13px', fontScale) }}>
              Seat count fixed to {seatCount} for this game.
            </p>
          ) : (
            <div style={countRowStyles}>
              <span style={{ fontWeight: 600, color: theme.colors.textPrimary }}>Seat count</span>
              <select
                value={seatCount}
                onChange={handleSeatCountChange}
                style={gameSelectStyle(theme, fontScale)}
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

        <div style={seatColumnsStyle}>
          <div style={seatSectionStyle}>
            <h3 style={{ margin: 0, fontSize: scaleFont('13px', fontScale), color: theme.colors.textSecondary, letterSpacing: '0.05em' }}>
              Seated players ({seatIds.length}/{seatCount})
            </h3>
            <ul style={baseListStyle}>
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
                  `Seat ${index + 1}`,
                ].filter(Boolean);
                return (
                  <li key={id} style={listItemStyles}>
                    <div style={seatNameCellStyle}>
                      <span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{participant.name}</span>
                    </div>
                    <div style={seatControlsCellStyle}>
                      {canManageParticipant && (
                        <div style={seatControlStackStyle}>
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
                          style={arrowButtonStyle}
                          onClick={() => handleReorder(id, 'up')}
                          disabled={!canMoveUp}
                          aria-label="Move up"
                        >
                        <ChevronIcon direction="up" size={12} />
                      </button>
                        <button
                          type="button"
                          style={arrowButtonStyle}
                          onClick={() => handleReorder(id, 'down')}
                          disabled={!canMoveDown}
                          aria-label="Move down"
                        >
                        <ChevronIcon direction="down" size={12} />
                      </button>
                      </div>
                    </div>
                    <div style={seatMetaStyles}>
                      <span style={metaTextStyle}>{metaLabels.join(' | ')}</span>
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

          <div style={seatSectionStyle}>
            <h3 style={{ margin: 0, fontSize: scaleFont('13px', fontScale), color: theme.colors.textSecondary, letterSpacing: '0.05em' }}>
              Spectator bench ({benchIds.length})
            </h3>
            <ul style={baseListStyle}>
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
                        <div style={seatControlStackStyle}>
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
                    <div style={seatMetaStyles}>
                      <span style={metaTextStyle}>{metaLabels.join(' | ')}</span>
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

        <div style={actionRowStyle}>
          <button type="button" style={actionButtonStyle} onClick={onClose}>
            Cancel
          </button>
          <button type="button" style={saveButtonStyle} onClick={handleSave}>
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
};










