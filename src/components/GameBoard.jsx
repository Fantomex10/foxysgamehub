import DrawPile from './DrawPile.jsx';
import DiscardPile from './DiscardPile.jsx';
import Hand from './Hand.jsx';

const wrapperStyle = {
  backgroundColor: 'rgba(15,23,42,0.8)',
  border: '1px solid rgba(148,163,184,0.25)',
  borderRadius: '24px',
  padding: '32px',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  boxShadow: '0 32px 64px rgba(15,23,42,0.6)',
};

const boardStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr auto 1fr',
  gap: '32px',
  alignItems: 'flex-start',
};

const playersPanel = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  background: 'rgba(15,23,42,0.55)',
  border: '1px solid rgba(148,163,184,0.15)',
  borderRadius: '18px',
  padding: '18px',
  minWidth: '200px',
};

const playerRow = (active, isSelf) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 12px',
  borderRadius: '12px',
  background: active ? 'rgba(59,130,246,0.2)' : 'rgba(148,163,184,0.08)',
  border: `1px solid ${isSelf ? 'rgba(96,165,250,0.45)' : 'transparent'}`,
  color: '#f8fafc',
  fontSize: '14px',
});

const historyListStyle = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  fontSize: '13px',
  color: '#94a3b8',
};

const prettySuit = (suit) => suit ? suit.charAt(0).toUpperCase() + suit.slice(1) : '—';

const GameBoard = ({
  roomId,
  roomName,
  players,
  userId,
  drawPile,
  discardPile,
  activeSuit,
  hand,
  banner,
  history,
  phase,
  currentTurn,
  handLocked = false,
  onPlayCard,
  onDrawCard,
  onReturnToLobby,
  onResetSession,
  onReturnToHub,
}) => {
  const isMyTurn = currentTurn === userId && phase === 'playing';
  const currentPlayer = players.find((player) => player.id === currentTurn);
  const topDiscard = discardPile.length ? discardPile[discardPile.length - 1] : null;
  const effectiveSuit = activeSuit ?? topDiscard?.suit ?? null;
  const handDisabled = !isMyTurn || phase !== 'playing' || handLocked;

  return (
    <div style={wrapperStyle}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', color: '#f8fafc' }}>{roomName ?? `Room ${roomId}`}</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>Code {roomId}</p>
          <p style={{ marginTop: '4px', color: '#94a3b8', fontSize: '15px' }}>{banner}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={onReturnToLobby}
            style={{
              padding: '10px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(148,163,184,0.35)',
              background: 'rgba(15,118,110,0.45)',
              color: '#f8fafc',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Return to lobby
          </button>
          <button
            type="button"
            onClick={onResetSession}
            style={{
              padding: '10px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(248,113,113,0.45)',
              background: 'rgba(185,28,28,0.25)',
              color: '#fecaca',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reset session
          </button>
          <button
            type="button"
            onClick={onReturnToHub ?? (() => {})}
            style={{
              padding: '10px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(148,163,184,0.35)',
              background: 'rgba(86, 161, 245, 0.25)',
              color: '#bfdbfe',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Main menu
          </button>
        </div>
      </header>

      <section style={boardStyle}>
        <div style={playersPanel}>
          <h3 style={{ margin: 0, fontSize: '16px', color: '#e2e8f0' }}>Turn order</h3>
          {players.map((player) => (
            <div
              key={player.id}
              style={playerRow(currentTurn === player.id, player.id === userId)}
            >
              <span>{player.name}</span>
              <span style={{ color: currentTurn === player.id ? '#93c5fd' : '#94a3b8' }}>
                {currentTurn === player.id ? 'Playing' : `${player.isBot ? 'Bot' : 'Waiting'}`}
              </span>
            </div>
          ))}
          {phase === 'finished' && (
            <div style={{ marginTop: '12px', fontSize: '13px', color: '#4ade80' }}>Round complete.</div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', gap: '48px', alignItems: 'center' }}>
            <DrawPile
              remaining={drawPile.length}
              onDraw={onDrawCard}
              disabled={handDisabled}
            />
            <DiscardPile cards={discardPile} activeSuit={activeSuit} />
          </div>

          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
            <div>Current turn: {currentPlayer ? currentPlayer.name : '—'}</div>
            <div>Cards remaining in deck: {drawPile.length}</div>
            <div>Required suit: {prettySuit(effectiveSuit)}</div>
          </div>
        </div>

        <div style={playersPanel}>
          <h3 style={{ margin: 0, fontSize: '16px', color: '#e2e8f0' }}>Recent actions</h3>
          <ul style={historyListStyle}>
            {history.length === 0 && <li>No actions yet.</li>}
            {history.map((entry, index) => (
              <li key={`${entry}-${index}`}>{entry}</li>
            ))}
          </ul>
        </div>
      </section>

      <Hand cards={hand} onPlayCard={onPlayCard} disabled={handDisabled} />

      {phase === 'finished' && (
        <div
          style={{
            marginTop: '12px',
            padding: '12px 16px',
            borderRadius: '12px',
            background: 'rgba(34,197,94,0.15)',
            border: '1px solid rgba(34,197,94,0.45)',
            color: '#bbf7d0',
            textAlign: 'center',
          }}
        >
          Round finished. Return to the lobby to redeal.
        </div>
      )}
    </div>
  );
};

export default GameBoard;
