import React from 'react';
import { SeatChevronIcon } from './SeatChevronIcon.jsx';

export const SeatList = ({
  seatIds,
  participants,
  userId,
  hostId,
  canManageSeats,
  seatCount,
  styles,
  onBench,
  onReorder,
}) => {
  const {
    seatSection,
    sectionTitle,
    list,
    listItem,
    seatNameCell,
    seatControlsCell,
    seatMetaCell,
    seatControlStack,
    seatArrowRow,
    benchButton,
    arrowButton,
    metaText,
  } = styles;

  return (
    <div style={seatSection}>
      <h3 style={sectionTitle}>
        Seated players ({seatIds.length}/{seatCount})
      </h3>
      <ul style={list}>
        {seatIds.map((id, index) => {
          const participant = participants.get(id);
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
            <li key={id} style={listItem}>
              <div style={seatNameCell}>
                <span
                  style={{
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {participant.name}
                </span>
              </div>
              <div style={seatControlsCell}>
                {canManageParticipant && (
                  <div style={seatControlStack}>
                    <button
                      type="button"
                      style={benchButton}
                      onClick={() => onBench(id)}
                    >
                      Bench
                    </button>
                  </div>
                )}
                <div style={seatArrowRow}>
                  <button
                    type="button"
                    style={arrowButton}
                    onClick={() => onReorder(id, 'up')}
                    disabled={!canMoveUp}
                    aria-label="Move up"
                  >
                    <SeatChevronIcon direction="up" size={12} />
                  </button>
                  <button
                    type="button"
                    style={arrowButton}
                    onClick={() => onReorder(id, 'down')}
                    disabled={!canMoveDown}
                    aria-label="Move down"
                  >
                    <SeatChevronIcon direction="down" size={12} />
                  </button>
                </div>
              </div>
              <div style={seatMetaCell}>
                <span style={metaText}>{metaLabels.join(' | ')}</span>
              </div>
            </li>
          );
        })}

        {seatIds.length === 0 && (
          <li
            style={{
              ...listItem,
              justifyContent: 'center',
              color: '#94a3b8',
            }}
          >
            No players seated.
          </li>
        )}
      </ul>
    </div>
  );
};
