import React from 'react';

export const BenchList = ({
  benchIds,
  participants,
  userId,
  hostId,
  canManageSeats,
  seatsFull,
  styles,
  onSeat,
  onKick,
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
    assignButton,
    kickButton,
    metaText,
  } = styles;

  return (
    <div style={seatSection}>
      <h3 style={sectionTitle}>
        Spectator bench ({benchIds.length})
      </h3>
      <ul style={list}>
        {benchIds.map((id) => {
          const participant = participants.get(id);
          if (!participant) return null;
          const isSelf = participant.id === userId;
          const isHostParticipant = participant.id === hostId;
          const metaLabels = [
            isSelf ? 'You' : null,
            isHostParticipant ? 'Host' : null,
            participant.isBot ? 'Bot' : null,
            'Spectator',
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
                {canManageSeats && (
                  <div style={seatControlStack}>
                    <button
                      type="button"
                      style={assignButton}
                      onClick={() => onSeat(id)}
                      disabled={seatsFull}
                    >
                      Seat
                    </button>
                    <button
                      type="button"
                      style={kickButton}
                      onClick={() => onKick(id)}
                    >
                      Kick
                    </button>
                  </div>
                )}
              </div>
              <div style={seatMetaCell}>
                <span style={metaText}>{metaLabels.join(' | ')}</span>
              </div>
            </li>
          );
        })}

        {benchIds.length === 0 && (
          <li
            style={{
              ...listItem,
              justifyContent: 'center',
              color: '#94a3b8',
            }}
          >
            No spectators currently benched.
          </li>
        )}
      </ul>
    </div>
  );
};
