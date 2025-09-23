import { useEffect, useMemo, useState } from 'react';
import { useLobbyTokens, colorWithOpacity, resolveStatusSoftColor } from './utils.js';
import { createOverlayStyle, createSurfaceStyle } from '../../ui/stylePrimitives.js';

const seatOverlayStyle = {
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px',
  zIndex: 100,
};

const seatModalStyle = {
  borderRadius: '18px',
  padding: '14px 14px 22px 6px',
  width: 'min(960px, 100%)',
  minHeight: 'min(88vh, 720px)',
  maxHeight: '94vh',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
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

const seatMetaCellStyle = {
  gridColumn: '1 / 2',
  gridRow: '2 / 3',
  fontSize: '10px',
  letterSpacing: '0.01em',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
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

const seatControlStackStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  alignItems: 'flex-end',
};

const seatListMetaStyle = {
  fontSize: '10px',
  letterSpacing: '0.01em',
  textTransform: 'none',
};

const seatBenchButtonStyle = {
  padding: '2px 6px',
  borderRadius: '999px',
  fontSize: '10px',
  fontWeight: 600,
  cursor: 'pointer',
};

const seatKickButtonStyle = {
  padding: '2px 6px',
  borderRadius: '999px',
  fontSize: '10px',
  fontWeight: 600,
  cursor: 'pointer',
};

const seatAssignButtonStyle = {
  padding: '2px 6px',
  borderRadius: '999px',
  fontSize: '10px',
  fontWeight: 600,
  cursor: 'pointer',
};

const seatControlButtonStyle = {
  padding: '1px 4px',
  borderRadius: '8px',
  fontSize: '10px',
  cursor: 'pointer',
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
  const {
    theme,
    pieces,
    scaleFont,
    motionDuration,
    accessibility,
  } = useLobbyTokens();
  const transitionValue = accessibility?.reducedMotion ? 'none' : `background ${motionDuration('0.2s')} ease, transform ${motionDuration('0.2s')} ease`;

  const overlayStyles = useMemo(
    () => createOverlayStyle({ theme }, seatOverlayStyle),
    [theme],
  );
  const modalStyles = useMemo(
    () => createSurfaceStyle({ theme }, {
      ...seatModalStyle,
      background: theme.colors.surfaceElevated ?? theme.colors.surface,
    }),
    [theme],
  );
  const listItemStyles = useMemo(() => ({
    ...seatListItemStyle,
    border: `1px solid ${theme.colors.borderSubtle}`,
    background: theme.colors.surfaceMuted,
    color: theme.colors.textPrimary,
  }), [theme]);
  const metaTextStyle = useMemo(() => ({
    ...seatListMetaStyle,
    color: theme.colors.textMuted,
    fontSize: scaleFont('10px'),
  }), [theme, scaleFont]);
  const actionButtonStyle = useMemo(() => ({
    ...seatControlButtonStyle,
    border: `1px solid ${theme.buttons.subtleBorder}`,
    background: theme.buttons.subtleBg,
    color: theme.buttons.subtleText,
    transition: transitionValue,
    fontSize: scaleFont('11px'),
  }), [theme, transitionValue, scaleFont]);
  const assignButtonStyle = useMemo(() => ({
    ...seatAssignButtonStyle,
    border: `1px solid ${pieces.primary ?? theme.colors.accentPrimary}`,
    background: pieces.primary ? colorWithOpacity(pieces.primary, 0.25) : (theme.colors.accentPrimarySoft ?? colorWithOpacity(theme.colors.accentPrimary, 0.2)),
    color: pieces.primary ?? theme.colors.accentPrimary,
    transition: transitionValue,
    fontSize: scaleFont('11px'),
  }), [theme, pieces.primary, transitionValue, scaleFont]);
  const kickButtonStyle = useMemo(() => ({
    ...seatKickButtonStyle,
    border: `1px solid ${theme.colors.accentDanger}`,
    background: theme.colors.accentDangerSoft,
    color: theme.colors.accentDanger,
    transition: transitionValue,
    fontSize: scaleFont('11px'),
  }), [theme, transitionValue, scaleFont]);
  const benchButtonStyle = useMemo(() => ({
    ...seatBenchButtonStyle,
    border: `1px solid ${theme.buttons.subtleBorder}`,
    background: theme.buttons.ghostBg,
    color: theme.colors.textSecondary,
    transition: transitionValue,
    fontSize: scaleFont('11px'),
  }), [theme, transitionValue, scaleFont]);
  const columnStyles = useMemo(() => ({ ...seatColumnsStyle }), []);
  const sectionStyles = useMemo(() => ({ ...seatSectionStyle }), []);
  const countRowStyles = useMemo(() => ({
    ...seatCountRowStyle,
    color: theme.colors.textSecondary,
    fontSize: scaleFont('13px'),
  }), [theme, scaleFont]);
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
        [next[index], next[index + 1]] = [next[index + 1], next[index]];
      }
      return next;
    });
  };

  const handleSave = () => {
    if (!canManageSeats) {
      onClose?.();
      return;
    }
    const payload = {
      seatOrder: seatIds,
      benchOrder: benchIds,
      maxSeats: seatCount,
      kickedIds,
    };
    onApply?.(payload);
  };

  if (!open) {
    return null;
  }

  return (
    <div style={overlayStyles}>
      <div style={modalStyles}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: scaleFont('20px') }}>Seat manager</h2>
          <button type="button" onClick={onClose} style={actionButtonStyle}>
            Close
          </button>
        </header>

        <section style={columnStyles}>
          <div style={sectionStyles}>
            <div style={countRowStyles}>
              <span>Seats</span>
              <select
                value={seatCount}
                onChange={handleSeatCountChange}
                disabled={seatCountFixed}
                style={{
                  padding: '6px 10px',
                  borderRadius: '10px',
                  border: `1px solid ${theme.colors.borderSubtle}`,
                  background: theme.colors.surfaceMuted,
                  color: theme.colors.textPrimary,
                  fontSize: scaleFont('13px'),
                }}
              >
                {seatCountOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <ul style={listStyles}>
              {seatIds.map((id) => {
                const participant = allParticipants.find((candidate) => candidate.id === id);
                if (!participant) return null;
                const meta = [];
                if (participant.id === hostId) meta.push('Host');
                if (participant.id === userId) meta.push('You');
                if (participant.isBot) meta.push('Bot');

                return (
                  <li key={participant.id} style={listItemStyles}>
                    <div style={seatNameCellStyle}>
                      <span style={{ fontWeight: 600, fontSize: scaleFont('13px'), color: theme.colors.textPrimary }}>
                        {participant.name}
                      </span>
                    </div>
                    <div style={seatMetaCellStyle}>
                      <span style={metaTextStyle}>{meta.join(' · ')}</span>
                    </div>
                    <div style={seatControlsCellStyle}>
                      <div style={seatControlStackStyle}>
                        <button type="button" onClick={() => handleReorder(participant.id, 'up')} style={actionButtonStyle}>
                          ↑
                        </button>
                        <button type="button" onClick={() => handleReorder(participant.id, 'down')} style={actionButtonStyle}>
                          ↓
                        </button>
                      </div>
                      <div style={seatControlStackStyle}>
                        <button type="button" onClick={() => handleBench(participant.id)} style={benchButtonStyle}>
                          Bench
                        </button>
                        <button type="button" onClick={() => handleKick(participant.id)} style={kickButtonStyle}>
                          Kick
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div style={sectionStyles}>
            <h3 style={{ margin: '4px 0', fontSize: scaleFont('15px'), color: theme.colors.textPrimary }}>Bench</h3>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {benchIds.length === 0 && (
                <li style={{ fontSize: scaleFont('12px'), color: theme.colors.textMuted }}>Bench is empty.</li>
              )}
              {benchIds.map((id) => {
                const participant = allParticipants.find((candidate) => candidate.id === id);
                if (!participant) return null;
                const meta = [];
                if (participant.id === hostId) meta.push('Host');
                if (participant.id === userId) meta.push('You');
                if (participant.isBot) meta.push('Bot');

                return (
                  <li key={participant.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '6px 10px',
                    borderRadius: theme.radii.sm,
                    border: `1px solid ${theme.colors.borderSubtle}`,
                    background: theme.colors.surfaceMuted,
                    color: theme.colors.textPrimary,
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: scaleFont('13px') }}>{participant.name}</div>
                      <div style={{ fontSize: scaleFont('11px'), color: theme.colors.textMuted }}>{meta.join(' · ') || 'Spectator'}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button type="button" onClick={() => handleSeat(participant.id)} style={assignButtonStyle}>
                        Seat
                      </button>
                      <button type="button" onClick={() => handleKick(participant.id)} style={kickButtonStyle}>
                        Kick
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" onClick={onClose} style={actionButtonStyle}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{
              ...actionButtonStyle,
              border: `1px solid ${theme.colors.accentSuccess}`,
              background: resolveStatusSoftColor('ready', theme),
              color: theme.colors.accentSuccess,
            }}
          >
            Save changes
          </button>
        </footer>
      </div>
    </div>
  );
};

export default SeatManagerDialog;
