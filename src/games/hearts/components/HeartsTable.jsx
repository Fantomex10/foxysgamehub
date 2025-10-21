import { useMemo } from 'react';
import useMediaQuery from '../../../hooks/useMediaQuery.js';
import { useTheme } from '../../../ui/useTheme.js';
import Hand from '../../../components/Hand.jsx';
import Card from '../../../components/Card.jsx';
import TableLayout from '../../../components/TableLayout.jsx';
import { formatCard } from '../utils.js';

const HeartsTable = ({
  players = [],
  userId,
  hostId,
  phase,
  hand,
  trick,
  lastTrick = [],
  discardPile = [],
  scores,
  roundScores,
  heartsBroken,
  currentTurn,
  handLocked,
  gameOver,
  onPlayCard,
  onStartRound,
}) => {
  const { theme } = useTheme();
  const isCompact = useMediaQuery('(max-width: 900px)');

  const trickList = Array.isArray(trick) ? trick : [];
  const fallbackTrick = Array.isArray(lastTrick) ? lastTrick : [];
  const isSpectator = !(Array.isArray(players) && players.some((player) => player.id === userId));
  const isHost = hostId === userId;

  const CARD_FACE_WIDTH = 82;
  const CARD_FACE_HEIGHT = 118;
  const discardScale = 0.75;
  const discardCardWidth = CARD_FACE_WIDTH * discardScale;
  const discardCardHeight = CARD_FACE_HEIGHT * discardScale;
  const discardOverlap = discardCardWidth * 0.58;

  const scoreboardStyle = useMemo(() => {
    const gap = theme.spacing?.xxs ?? theme.spacing?.xs ?? '6px';
    return {
      display: 'flex',
      flexWrap: 'wrap',
      gap,
      justifyContent: isCompact ? 'center' : 'flex-start',
      alignContent: 'flex-start',
      background: theme.table?.panel ?? theme.colors.surfaceAlt,
      border: `1px solid ${theme.table?.border ?? theme.colors.border}`,
      borderRadius: theme.radii.sm,
      padding: isCompact ? '4px 6px' : '8px 10px',
      boxShadow: theme.shadows.panel,
      marginBottom: '4px',
    };
  }, [isCompact, theme]);

  const discardCards = discardPile.slice(-4).reverse();

  const spectatorNoticeStyle = useMemo(() => ({
    padding: '12px 16px',
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.colors.border}`,
    background: theme.colors.surfaceMuted,
    color: theme.colors.textSecondary,
    fontSize: '13px',
    textAlign: 'center',
  }), [theme]);

  const primaryButtonStyle = useMemo(() => ({
    padding: '10px 16px',
    borderRadius: theme.radii.sm,
    border: 'none',
    background: theme.buttons.primaryBg,
    color: theme.buttons.primaryText,
    fontWeight: 600,
    cursor: 'pointer',
  }), [theme]);

  const actionRowStyle = useMemo(() => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: isCompact ? 'stretch' : 'center',
    gap: theme.spacing.md,
    flexDirection: isCompact ? 'column' : 'row',
    background: theme.colors.surfaceMuted,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radii.md,
    padding: '12px 16px',
    color: theme.colors.textPrimary,
  }), [isCompact, theme]);

  const playAreaStyle = {
    background: theme.table?.panel ?? theme.colors.surfaceAlt,
    border: `1px solid ${theme.table?.border ?? theme.colors.border}`,
    borderRadius: theme.radii.sm,
    padding: isCompact ? '8px 10px 12px' : '10px 14px 16px',
    boxShadow: theme.shadows.panel,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    alignItems: 'center',
    boxSizing: 'border-box',
  };

  const handShellStyle = {
    background: theme.table?.panel ?? theme.colors.surfaceAlt,
    border: `1px solid ${theme.table?.border ?? theme.colors.border}`,
    borderRadius: theme.radii.sm,
    padding: isCompact ? '8px 10px 12px' : '10px 14px 16px',
    boxShadow: theme.shadows.panel,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  };

  const statusShellStyle = {
    marginTop: '6px',
    background: theme.colors.surfaceMuted,
    border: `1px solid ${theme.colors.borderSubtle ?? theme.colors.border}`,
    borderRadius: theme.radii.sm,
    padding: '6px 10px',
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: '12px',
    minHeight: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const statusMessage = (() => {
    if (isSpectator) return 'Spectating match';
    if (gameOver || phase === 'finished') return 'Round complete.';
    if (phase === 'playing') {
      if (currentTurn === userId) return 'Your turn';
      if (handLocked) return 'Waiting for your turn...';
      return 'Ready to play.';
    }
    return 'Preparing round...';
  })();

  const statusDisplay = statusMessage || '\u00A0';

  const heartIndicator = (
    <span
      aria-label={heartsBroken ? 'Hearts broken' : 'Hearts intact'}
      role="img"
      style={{
        width: '26px',
        height: '26px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '999px',
        background: heartsBroken
          ? theme.colors.accentDangerSoft ?? 'rgba(239,68,68,0.25)'
          : theme.colors.surfaceMuted,
        color: heartsBroken ? theme.colors.accentDanger : theme.colors.textMuted,
        boxShadow: heartsBroken
          ? `0 0 0 2px ${theme.colors.accentDangerSoft ?? 'rgba(239,68,68,0.25)'}`
          : 'none',
        fontSize: '18px',
      }}
    >
      {heartsBroken ? '\u{1F494}' : '\u2661'}
    </span>
  );

  return (
    <TableLayout>
      <section style={playAreaStyle}>
        <section style={scoreboardStyle}>
          {players.map((player, index) => {
            const total = (scores && scores[player.id]) ?? 0;
            const round = (roundScores && roundScores[player.id]) ?? 0;
            const isCurrent = currentTurn === player.id && phase === 'playing';
            const currentEntry = trickList.find((entry) => entry.playerId === player.id);
            const lastEntry = fallbackTrick.find((entry) => entry.playerId === player.id);
            const activeCard = currentEntry?.card ?? lastEntry?.card ?? null;
            const cardLabel = activeCard ? formatCard(activeCard) : '';
            const tileWidth = isCompact ? '64px' : '76px';
            const cardHeight = isCompact ? '30px' : '34px';
            const cardWidth = isCompact ? '20px' : '22px';
            const displayName = (player && player.name) ? player.name : `Player ${index + 1}`;
            return (
              <div
                key={player.id}
                style={{
                  background: isCurrent ? theme.colors.surfaceAlt : theme.colors.surfaceMuted,
                  borderRadius: theme.radii.sm,
                  border: isCurrent
                    ? `2px solid ${theme.colors.accentPrimary}`
                    : `1px solid ${theme.colors.borderSubtle}`,
                  boxShadow: isCurrent ? `0 0 0 2px ${theme.colors.accentPrimarySoft ?? 'rgba(59,130,246,0.2)'}` : 'none',
                  padding: '5px 7px',
                  color: theme.colors.textPrimary,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  width: tileWidth,
                  minWidth: tileWidth,
                  maxWidth: tileWidth,
                  gap: '3px',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontWeight: 600, fontSize: '11px', color: theme.colors.textPrimary }}>
                  {displayName}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '9px', color: theme.colors.textMuted }}>
                  <span>Total: {total}</span>
                  <span>Round: {round}</span>
                </div>
                <div
                  style={{
                    width: cardWidth,
                    height: cardHeight,
                    borderRadius: theme.radii.sm,
                    border: `1px solid ${isCurrent ? theme.colors.accentPrimary : theme.colors.border}`,
                    background: theme.colors.surface,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: '9px',
                    color: theme.colors.textPrimary,
                    alignSelf: 'flex-start',
                  }}
                >
                  {cardLabel || ''}
                </div>
              </div>
            );
          })}
        </section>

        <section
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 0 6px',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {heartIndicator}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              gap: 0,
              minHeight: `${discardCardHeight}px`,
              minWidth: discardCards.length > 0 ? undefined : `${discardCardWidth}px`,
            }}
          >
            {discardCards.length > 0 ? discardCards.map((entry, index) => (
              <div
                key={`${entry.playerId ?? 'player'}-${index}`}
                style={{
                  transform: 'scale(0.75)',
                  transformOrigin: 'center top',
                  marginLeft: index === 0 ? 0 : `-${discardOverlap}px`,
                  pointerEvents: 'none',
                }}
              >
                <Card card={entry.card} disabled />
              </div>
            )) : (
              <div
                style={{
                  width: discardCardWidth,
                  height: discardCardHeight,
                  borderRadius: theme.radii.sm,
                  opacity: 0,
                }}
              />
            )}
          </div>
        </div>
        {/* omit label to prevent layout shifts */}
        </section>

        {isSpectator ? (
          <div style={{ ...spectatorNoticeStyle, marginTop: '6px', width: '100%' }}>
            You're watching from the spectator bench. Enjoy the match!
          </div>
        ) : (
          <section style={handShellStyle}>
            <Hand
              cards={hand}
              onPlayCard={onPlayCard}
              disabled={handLocked}
              showTitle={false}
            />
          </section>
        )}
      </section>

      {phase === 'finished' && (
        <div style={actionRowStyle}>
          <span>{gameOver ? 'Match complete. Return to the lobby to start a new game.' : 'Round complete. Host may begin the next round.'}</span>
          {!gameOver && isHost && onStartRound && (
            <button
              type="button"
              onClick={onStartRound}
              style={primaryButtonStyle}
            >
              Start next round
            </button>
          )}
        </div>
      )}

      {!isSpectator && (
        <section style={statusShellStyle}>
          <span style={{ color: theme.colors.textSecondary }}>{statusDisplay}</span>
        </section>
      )}
    </TableLayout>
  );
};

export default HeartsTable;







