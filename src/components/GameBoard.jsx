import useMediaQuery from '../hooks/useMediaQuery.js';
import { useCustomizationTokens } from '../customization/CustomizationContext.jsx';
import DrawPile from './DrawPile.jsx';
import DiscardPile from './DiscardPile.jsx';
import Hand from './Hand.jsx';
import TableLayout from './TableLayout.jsx';

const prettySuit = (suit) => (suit ? suit.charAt(0).toUpperCase() + suit.slice(1) : '—');

const GameBoard = ({
  roomId,
  roomName,
  players,
  userId,
  drawPile,
  discardPile,
  activeSuit,
  hand,
  history,
  phase,
  currentTurn,
  handLocked = false,
  onPlayCard,
  onDrawCard,
}) => {
  const { theme, table } = useCustomizationTokens();
  const isCompact = useMediaQuery('(max-width: 900px)');
  const isSpectator = !(Array.isArray(players) && players.some((player) => player.id === userId));
  const isMyTurn = !isSpectator && currentTurn === userId && phase === 'playing';
  const currentPlayer = players.find((player) => player.id === currentTurn);
  const topDiscard = discardPile.length ? discardPile[discardPile.length - 1] : null;
  const effectiveSuit = activeSuit ?? topDiscard?.suit ?? null;
  const handDisabled = !isMyTurn || phase !== 'playing' || handLocked;

  const containerStyle = isCompact
    ? { display: 'flex', flexDirection: 'column', gap: '16px' }
    : {
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        gap: '24px',
        alignItems: 'flex-start',
      };

  const panelStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    background: table.panel ?? theme.colors.surfaceMuted,
    border: `1px solid ${table.border ?? theme.colors.borderFaint}`,
    borderRadius: theme.radii.md,
    padding: '18px',
    minWidth: isCompact ? '0' : '200px',
    color: table.text ?? theme.colors.textPrimary,
  };

  const playerRowStyle = (active, isSelf) => {
    const highlightColor = table.highlight;
    let activeFill = theme.colors.accentPrimarySoft;
    if (typeof highlightColor === 'string') {
      if (highlightColor.startsWith('#') && highlightColor.length === 7) {
        activeFill = `${highlightColor}33`;
      } else {
        activeFill = highlightColor;
      }
    }
    return {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 12px',
      borderRadius: theme.radii.sm,
      background: active ? activeFill : 'rgba(148,163,184,0.08)',
      border: `1px solid ${isSelf ? theme.colors.accentPrimary : 'transparent'}`,
      color: theme.colors.textPrimary,
      fontSize: '14px',
    };
  };

  const summaryBlockStyle = {
    textAlign: isCompact ? 'left' : 'center',
    color: theme.colors.textMuted,
    fontSize: '13px',
  };

  const spectatorNoticeStyle = {
    padding: '12px 16px',
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.colors.border}`,
    background: theme.colors.surfaceMuted,
    color: theme.colors.textSecondary,
    fontSize: '13px',
    textAlign: 'center',
  };

  return (
    <TableLayout title={roomName ?? `Room ${roomId}`}>
      <section style={containerStyle}>
        <div style={{ ...panelStyle, width: isCompact ? '100%' : 'auto' }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: theme.colors.textPrimary }}>Turn order</h3>
          {players.map((player) => (
            <div
              key={player.id}
              style={playerRowStyle(currentTurn === player.id, player.id === userId)}
            >
              <span>{player.name}</span>
              <span
                style={{
                  color: currentTurn === player.id ? theme.colors.accentPrimary : theme.colors.textMuted,
                }}
              >
                {currentTurn === player.id ? 'Playing' : player.isBot ? 'Bot' : 'Waiting'}
              </span>
            </div>
          ))}
          {phase === 'finished' && (
            <div style={{ marginTop: '12px', fontSize: '13px', color: theme.colors.accentSuccess }}>
              Round complete.
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: isCompact ? 'stretch' : 'center',
            gap: isCompact ? '20px' : '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: isCompact ? 'column' : 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: isCompact ? '20px' : '48px',
            }}
          >
            <DrawPile remaining={drawPile.length} onDraw={onDrawCard} disabled={handDisabled} />
            <DiscardPile cards={discardPile} activeSuit={activeSuit} />
          </div>

          <div style={summaryBlockStyle}>
            <div>Current turn: {currentPlayer ? currentPlayer.name : '—'}</div>
            <div>Cards remaining in deck: {drawPile.length}</div>
            <div>Required suit: {prettySuit(effectiveSuit)}</div>
          </div>
        </div>

        <div style={{ ...panelStyle, width: isCompact ? '100%' : 'auto' }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: theme.colors.textPrimary }}>Recent actions</h3>
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '13px',
              color: theme.colors.textMuted,
            }}
          >
            {history.length === 0 && <li>No actions yet.</li>}
            {history.map((entry, index) => (
              <li key={`${entry}-${index}`}>{entry}</li>
            ))}
          </ul>
        </div>
      </section>

      {isSpectator ? (
        <div style={spectatorNoticeStyle}>You're watching from the spectator bench. Enjoy the match!</div>
      ) : (
        <>
          <Hand cards={hand} onPlayCard={onPlayCard} disabled={handDisabled} />
          <div
            style={{
              marginTop: '8px',
              fontSize: '12px',
              color: theme.colors.textMuted,
            }}
          >
            {handLocked ? 'Waiting for your turn…' : 'Select a legal card to play.'}
          </div>
        </>
      )}

      {phase === 'finished' && (
        <div
          style={{
            marginTop: '12px',
            padding: '12px 16px',
            borderRadius: theme.radii.sm,
            background: theme.colors.accentSuccessSoft,
            border: `1px solid ${theme.colors.accentSuccess}`,
            color: theme.colors.textPrimary,
            textAlign: 'center',
          }}
        >
          Round finished. Return to the lobby to redeal.
        </div>
      )}
    </TableLayout>
  );
};

export default GameBoard;
