import React, { useEffect, useMemo, useState } from 'react';
import { useCustomizationTokens } from '../../customization/useCustomization.js';
import { getSeatManagerStyles } from './seatManager/seatManagerStyles.js';
import { SeatList } from './seatManager/SeatList.jsx';
import { BenchList } from './seatManager/BenchList.jsx';

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

  const styles = useMemo(
    () => getSeatManagerStyles({ theme, fontScale }),
    [theme, fontScale],
  );

  const allParticipants = useMemo(() => {
    const map = new Map();
    if (Array.isArray(players)) {
      players.forEach((player) => {
        if (player?.id) map.set(player.id, player);
      });
    }
    if (Array.isArray(spectators)) {
      spectators.forEach((spectator) => {
        if (spectator?.id && !map.has(spectator.id)) {
          map.set(spectator.id, spectator);
        }
      });
    }
    return Array.from(map.values());
  }, [players, spectators]);

  const allIds = useMemo(
    () => allParticipants.map((participant) => participant.id),
    [allParticipants],
  );

  const participantLookup = useMemo(() => {
    const lookup = new Map();
    for (const participant of allParticipants) {
      if (participant?.id) {
        lookup.set(participant.id, participant);
      }
    }
    return lookup;
  }, [allParticipants]);

  const availableSet = useMemo(() => new Set(allIds), [allIds]);

  const requiredSeats = seatRules?.requiredPlayers ?? null;
  const minSeats = Math.max(2, requiredSeats ?? seatRules?.minPlayers ?? 2);
  const maxSeats = Math.max(
    minSeats,
    seatRules?.maxPlayers ?? requiredSeats ?? roomSettings?.maxPlayers ?? minSeats,
  );

  const initialSeatCount = useMemo(() => {
    const raw = roomSettings?.maxPlayers ?? (Array.isArray(players) ? players.length : minSeats);
    return Math.min(Math.max(raw, minSeats), maxSeats);
  }, [roomSettings?.maxPlayers, players, minSeats, maxSeats]);

  const [seatCount, setSeatCount] = useState(initialSeatCount);
  const [seatIds, setSeatIds] = useState(() =>
    Array.isArray(players) ? players.map((player) => player.id) : [],
  );
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
  const canManageSeats = hostId === userId;

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
    const benchOrder = allIds.filter(
      (id) => !effectiveSeatIds.includes(id) && !kickedIds.includes(id),
    );
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
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div>
          {seatCountFixed ? (
            <p style={styles.infoText}>
              Seat count fixed to {seatCount} for this game.
            </p>
          ) : (
            <div style={styles.countRow}>
              <span style={{ fontWeight: 600, color: theme.colors.textPrimary }}>Seat count</span>
              <select
                value={seatCount}
                onChange={handleSeatCountChange}
                style={styles.seatSelect}
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

        <div style={styles.seatColumns}>
          <SeatList
            seatIds={seatIds}
            participants={participantLookup}
            userId={userId}
            hostId={hostId}
            canManageSeats={canManageSeats}
            seatCount={seatCount}
            styles={styles}
            onBench={handleBench}
            onReorder={handleReorder}
          />

          <BenchList
            benchIds={benchIds}
            participants={participantLookup}
            userId={userId}
            hostId={hostId}
            canManageSeats={canManageSeats}
            seatsFull={seatsFull}
            styles={styles}
            onSeat={handleSeat}
            onKick={handleKick}
          />
        </div>

        <div style={styles.actionRow}>
          <button type="button" style={styles.actionButton} onClick={onClose}>
            Cancel
          </button>
          <button type="button" style={styles.saveButton} onClick={handleSave}>
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatManagerDialog;
