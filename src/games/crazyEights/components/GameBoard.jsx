import { useMemo } from 'react';
import useMediaQuery from '../../../hooks/useMediaQuery.js';
import { useCustomizationTokens } from '../../../customization/CustomizationContext.jsx';
import Hand from '../../../components/Hand.jsx';
import TableLayout from '../../../components/TableLayout.jsx';
import { createPanelContainerStyle } from '../../../ui/stylePrimitives.js';
import { withAlpha } from '../../../ui/colorUtils.js';
import DrawPile from './DrawPile.jsx';
import DiscardPile from './DiscardPile.jsx';

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
  const {
    theme,
    table,
    pieces,
    scaleFont,
  } = useCustomizationTokens();
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

  const panelStyle = useMemo(
    () => createPanelContainerStyle(
      { theme, pieces },
      {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing?.sm ?? '12px',
        background: table.panel ?? theme.colors.surfaceMuted,
        border: `1px solid ${table.border ?? pieces.secondary ?? theme.colors.borderFaint}`,
        borderRadius: theme.radii.md,
        padding: '18px',
        minWidth: isCompact ? '0' : '200px',
        color: table.text ?? theme.colors.textPrimary,
      },
    ),
    [theme, table, pieces, isCompact],
  );

  const playerRowStyle = (active, isSelf) => {
    const activeBorder = pieces.highlight ?? pieces.primary ?? theme.colors.accentPrimary;
    const inactiveBg = withAlpha(pieces.secondary, 0.18) ?? 'rgba(148,163,184,0.08)';
    const activeBg = withAlpha(pieces.primary, 0.35) ?? theme.colors.accentPrimarySoft;
    return {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 12px',
      borderRadius: theme.radii.sm,
      background: active ? activeBg : inactiveBg,
      border: `1px solid ${isSelf ? activeBorder : 'transparent'}`,
      color: theme.colors.textPrimary,
      fontSize: scaleFont('14px'),
    };
  };

  const summaryBlockStyle = {
    textAlign: isCompact ? 'left' : 'center',
    color: theme.colors.textMuted,
    fontSize: scaleFont('13px'),
  };

  const spectatorNoticeStyle = {
    padding: '12px 16px',
    borderRadius: theme.radii.sm,
    border: `1px solid ${pieces.primary ?? theme.colors.border}`,
    background: withAlpha(pieces.secondary, 0.25) ?? theme.colors.surfaceMuted,
    color: theme.colors.textSecondary,
    fontSize: scaleFont('13px'),
    textAlign: 'center',
  };

  return (
    <TableLayout title={roomName ?? `Room ${roomId}`}>
      <section style={containerStyle}>
        <div style={{ ...panelStyle, width: isCompact ? '100%' : 'auto' }}>
          <h3 style={{ margin: 0, fontSize: scaleFont('16px'), color: theme.colors.textPrimary }}>Turn order</h3>
          {players.map((player) => {
            const isActive = currentTurn === player.id;
            return (
              <div
                key={player.id}
                style={playerRowStyle(isActive, player.id === userId)}
              >
                <span>{player.name}</span>
                <span
                  style={{
                    color: isActive
                      ? pieces.highlight ?? theme.colors.accentPrimary
                      : theme.colors.textMuted,
                    fontSize: scaleFont('13px'),
                  }}
                >
                  {isActive ? 'Playing' : player.isBot ? 'Bot' : 'Waiting'}
                </span>
              </div>
            );
          })}
          {phase === 'finished' && (
            <div style={{ marginTop: '12px', fontSize: scaleFont('13px'), color: theme.colors.accentSuccess }}>
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
          <h3 style={{ margin: 0, fontSize: scaleFont('16px'), color: theme.colors.textPrimary }}>Recent actions</h3>
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: scaleFont('13px'),
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
              fontSize: scaleFont('12px'),
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
            background: withAlpha(pieces.primary, 0.25) ?? theme.colors.accentSuccessSoft,
            border: `1px solid ${pieces.primary ?? theme.colors.accentSuccess}`,
            color: theme.colors.textPrimary,
            textAlign: 'center',
            fontSize: scaleFont('13px'),
          }}
        >
          Round finished. Return to the lobby to redeal.
        </div>
      )}
    </TableLayout>
  );
};

export default GameBoard;
