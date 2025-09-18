import Hand from '../../../components/Hand.jsx';
import { formatCard } from '../utils.js';

const wrapperStyle = {
  backgroundColor: 'rgba(15,23,42,0.85)',
  border: '1px solid rgba(148,163,184,0.25)',
  borderRadius: '24px',
  padding: '32px',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  boxShadow: '0 32px 64px rgba(15,23,42,0.6)',
};

const scoreboardStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  gap: '12px',
  background: 'rgba(15,23,42,0.55)',
  border: '1px solid rgba(148,163,184,0.15)',
  borderRadius: '18px',
  padding: '18px',
};

const trickStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: '12px',
  background: 'rgba(30,41,59,0.8)',
  border: '1px solid rgba(148,163,184,0.2)',
  borderRadius: '18px',
  padding: '18px',
};

const controlButton = (background, color = '#f8fafc') => ({
  padding: '10px 16px',
  borderRadius: '12px',
  border: '1px solid rgba(148,163,184,0.35)',
  background,
  color,
  fontWeight: 600,
  cursor: 'pointer',
});

const HeartsTable = ({
  roomId,
  roomName,
  players = [],
  userId,
  hostId,
  phase,
  hand,
  trick,
  lastTrick = [],
  scores,
  roundScores,
  banner,
  heartsBroken,
  currentTurn,
  handLocked,
  gameOver,
  onPlayCard,
  onReturnToLobby,
  onResetSession,
  onReturnToHub,
  onStartRound,
}) => {
  const trickList = Array.isArray(trick) ? trick : [];
  const fallbackTrick = Array.isArray(lastTrick) ? lastTrick : [];
  const displayTrick = trickList.length > 0 ? trickList : fallbackTrick;
  const trickByPlayer = displayTrick.reduce((acc, entry) => ({ ...acc, [entry.playerId]: entry.card }), {});
  const me = players.find((player) => player.id === userId);
  const isHost = hostId === userId;

  return (
    <div style={wrapperStyle}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', color: '#f8fafc' }}>{roomName ?? `Room ${roomId}`}</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>Code {roomId}</p>
          <p style={{ marginTop: '4px', color: '#94a3b8', fontSize: '15px' }}>{banner}</p>
          <p style={{ marginTop: '4px', color: heartsBroken ? '#f87171' : '#94a3b8', fontSize: '13px' }}>
            Hearts broken: {heartsBroken ? 'Yes' : 'No'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="button" onClick={onReturnToLobby} style={controlButton('rgba(15,118,110,0.45)')}>
            Return to lobby
          </button>
          <button
            type="button"
            onClick={onResetSession}
            style={controlButton('rgba(185,28,28,0.25)', '#fecaca')}
          >
            Reset session
          </button>
          <button
            type="button"
            onClick={onReturnToHub ?? (() => {})}
            style={controlButton('rgba(59,130,246,0.25)', '#bfdbfe')}
          >
            Main menu
          </button>
        </div>
      </header>

      <section style={scoreboardStyle}>
        {players.map((player) => {
          const total = (scores && scores[player.id]) ?? 0;
          const round = (roundScores && roundScores[player.id]) ?? 0;
          const isCurrent = currentTurn === player.id && phase === 'playing';
          return (
            <div
              key={player.id}
              style={{
                background: 'rgba(51,65,85,0.6)',
                borderRadius: '14px',
                border: `1px solid ${isCurrent ? 'rgba(96,165,250,0.45)' : 'rgba(148,163,184,0.15)'}`,
                padding: '12px',
                color: '#f8fafc',
              }}
            >
              <div style={{ fontWeight: 600 }}>{player.name}</div>
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>Total: {total}</div>
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>Round: {round}</div>
            </div>
          );
        })}
      </section>

      <section>
        <h3 style={{ margin: '0 0 12px', color: '#e2e8f0' }}>Current trick</h3>
        <div style={trickStyle}>
          {(players ?? []).map((player) => {
            const card = trickByPlayer[player.id];
            return (
              <div
                key={`trick-${player.id}`}
                style={{
                  background: 'rgba(15,23,42,0.6)',
                  borderRadius: '12px',
                  border: '1px solid rgba(148,163,184,0.2)',
                  padding: '12px',
                  color: '#f8fafc',
                  minHeight: '72px',
                  position: 'relative',
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '6px' }}>{player.name}</div>
                <div style={{ color: '#94a3b8', fontSize: '14px' }}>
                  {card ? formatCard(card) : '—'}
                </div>
                {player.id === currentTurn && phase === 'playing' && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '12px',
                      fontSize: '11px',
                      color: '#38bdf8',
                    }}
                  >
                    Playing
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {phase === 'finished' && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(31,41,55,0.6)',
            border: '1px solid rgba(148,163,184,0.2)',
            borderRadius: '12px',
            padding: '12px 16px',
            color: '#e2e8f0',
          }}
        >
          <span>{gameOver ? 'Match complete. Return to the lobby to start a new game.' : 'Round complete. Host may begin the next round.'}</span>
          {!gameOver && isHost && onStartRound && (
            <button
              type="button"
              onClick={onStartRound}
              style={controlButton('rgba(34,197,94,0.25)', '#bbf7d0')}
            >
              Start next round
            </button>
          )}
        </div>
      )}

      <div>
        <h2 style={{ fontSize: '18px', marginBottom: '12px', color: '#e2e8f0' }}>
          {me ? `${me.name}'s hand` : 'Your hand'}
        </h2>
        <Hand cards={hand} onPlayCard={onPlayCard} disabled={handLocked} />
        <div style={{ marginTop: '8px', fontSize: '12px', color: '#94a3b8' }}>
          {handLocked ? 'Waiting for your turn…' : 'Select a legal card to play.'}
        </div>
      </div>
    </div>
  );
};

export default HeartsTable;
