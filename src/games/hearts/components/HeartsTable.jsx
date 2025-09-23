import { useMemo } from 'react';
import useMediaQuery from '../../../hooks/useMediaQuery.js';
import { useCustomizationTokens } from '../../../customization/CustomizationContext.jsx';
import Hand from '../../../components/Hand.jsx';
import TableLayout from '../../../components/TableLayout.jsx';
import { formatCard } from '../utils.js';
import { withAlpha } from '../../../ui/colorUtils.js';

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
  heartsBroken,
  currentTurn,
  handLocked,
  gameOver,
  onPlayCard,
  onStartRound,
}) => {
  const {
    theme,
    pieces,
    scaleFont,
  } = useCustomizationTokens();
  const isCompact = useMediaQuery('(max-width: 900px)');
  const isExtraCompact = useMediaQuery('(max-width: 640px)');

  const trickList = Array.isArray(trick) ? trick : [];
  const fallbackTrick = Array.isArray(lastTrick) ? lastTrick : [];
  const displayTrick = trickList.length > 0 ? trickList : fallbackTrick;
  const trickByPlayer = displayTrick.reduce((acc, entry) => ({ ...acc, [entry.playerId]: entry.card }), {});

  const me = players.find((player) => player.id === userId);
  const isSpectator = !(Array.isArray(players) && players.some((player) => player.id === userId));
  const isHost = hostId === userId;

  const scoreboardStyle = useMemo(() => ({
    display: 'grid',
    gridTemplateColumns: isExtraCompact
      ? 'repeat(1, minmax(0, 1fr))'
      : isCompact
        ? 'repeat(2, minmax(0, 1fr))'
        : 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: theme.spacing.sm,
    background: theme.table?.panel ?? theme.colors.surfaceAlt,
    border: `1px solid ${theme.table?.border ?? pieces.secondary ?? theme.colors.border}`,
    borderRadius: theme.radii.lg,
    padding: isCompact ? '16px' : '20px',
    boxShadow: theme.shadows.panel,
  }), [isCompact, isExtraCompact, theme, pieces.secondary]);

  const trickStyle = useMemo(() => ({
    display: 'grid',
    gridTemplateColumns: isExtraCompact ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))',
    gap: theme.spacing.sm,
    background: theme.table?.panel ?? theme.colors.surfaceAlt,
    border: `1px solid ${theme.table?.border ?? pieces.secondary ?? theme.colors.border}`,
    borderRadius: theme.radii.lg,
    padding: isCompact ? '16px' : '20px',
  }), [isCompact, isExtraCompact, theme, pieces.secondary]);

  const spectatorNoticeStyle = useMemo(() => ({
    padding: '12px 16px',
    borderRadius: theme.radii.sm,
    border: `1px solid ${pieces.primary ?? theme.colors.border}`,
    background: withAlpha(pieces.secondary, 0.25) ?? theme.colors.surfaceMuted,
    color: theme.colors.textSecondary,
    fontSize: scaleFont('13px'),
    textAlign: 'center',
  }), [theme, pieces.primary, pieces.secondary, scaleFont]);

  const primaryButtonStyle = useMemo(() => ({
    padding: '10px 16px',
    borderRadius: theme.radii.sm,
    border: 'none',
    background: pieces.primary ?? theme.buttons.primaryBg,
    color: theme.buttons.primaryText,
    fontWeight: 600,
    fontSize: scaleFont('14px'),
    cursor: 'pointer',
  }), [theme, pieces.primary, scaleFont]);

  const actionRowStyle = useMemo(() => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: isCompact ? 'stretch' : 'center',
    gap: theme.spacing.md,
    flexDirection: isCompact ? 'column' : 'row',
    background: theme.colors.surfaceMuted,
    border: `1px solid ${pieces.secondary ?? theme.colors.border}`,
    borderRadius: theme.radii.md,
    padding: '12px 16px',
    color: theme.colors.textPrimary,
  }), [isCompact, theme, pieces.secondary]);

  return (
    <TableLayout
      title={roomName ?? `Room ${roomId}`}
      subtitle={(
        <span style={{ color: heartsBroken ? theme.colors.accentDanger : theme.colors.textMuted, fontSize: scaleFont('13px') }}>
          Hearts broken: {heartsBroken ? 'Yes' : 'No'}
        </span>
      )}
    >
      <section style={scoreboardStyle}>
        {players.map((player) => {
          const total = (scores && scores[player.id]) ?? 0;
          const round = (roundScores && roundScores[player.id]) ?? 0;
          const isCurrent = currentTurn === player.id && phase === 'playing';
          return (
            <div
              key={player.id}
              style={{
                background: isCurrent ? withAlpha(pieces.primary, 0.3) ?? theme.colors.surfaceAlt : withAlpha(pieces.secondary, 0.2) ?? theme.colors.surfaceMuted,
                borderRadius: theme.radii.md,
                border: `1px solid ${isCurrent ? pieces.primary ?? theme.colors.accentPrimary : pieces.secondary ?? theme.colors.borderSubtle}`,
                padding: '12px',
                color: theme.colors.textPrimary,
              }}
            >
              <div style={{ fontWeight: 600, fontSize: scaleFont('15px') }}>{player.name}</div>
              <div style={{ fontSize: scaleFont('13px'), color: theme.colors.textMuted }}>Total: {total}</div>
              <div style={{ fontSize: scaleFont('13px'), color: theme.colors.textMuted }}>Round: {round}</div>
            </div>
          );
        })}
      </section>

      <section>
        <h3 style={{ margin: '0 0 12px', color: theme.colors.textPrimary, fontSize: scaleFont('16px') }}>Current trick</h3>
        <div style={trickStyle}>
          {(players ?? []).map((player) => {
            const card = trickByPlayer[player.id];
            const isCurrent = player.id === currentTurn && phase === 'playing';
            return (
              <div
                key={`trick-${player.id}`}
                style={{
                  background: theme.colors.surfaceMuted,
                  borderRadius: theme.radii.sm,
                  border: `1px solid ${isCurrent ? pieces.primary ?? theme.colors.accentPrimary : theme.colors.borderSubtle}`,
                  padding: '12px',
                  color: theme.colors.textPrimary,
                  minHeight: '72px',
                  position: 'relative',
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '6px', fontSize: scaleFont('14px') }}>{player.name}</div>
                <div style={{ color: theme.colors.textMuted, fontSize: scaleFont('14px') }}>
                  {card ? formatCard(card) : '—'}
                </div>
                {isCurrent && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '12px',
                      fontSize: scaleFont('11px'),
                      color: pieces.primary ?? theme.colors.accentPrimary,
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
        <div style={actionRowStyle}>
          <span style={{ fontSize: scaleFont('14px') }}>{gameOver ? 'Match complete. Return to the lobby to start a new game.' : 'Round complete. Host may begin the next round.'}</span>
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

      <div>
        {isSpectator ? (
          <div style={spectatorNoticeStyle}>
            You're watching from the spectator bench. Enjoy the match!
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: scaleFont('18px'), marginBottom: '12px', color: theme.colors.textPrimary }}>
              {me ? `${me.name}'s hand` : 'Your hand'}
            </h2>
            <Hand cards={hand} onPlayCard={onPlayCard} disabled={handLocked} />
            <div style={{ marginTop: '8px', fontSize: scaleFont('12px'), color: theme.colors.textMuted }}>
              {handLocked ? 'Waiting for your turn…' : 'Select a legal card to play.'}
            </div>
          </>
        )}
      </div>
    </TableLayout>
  );
};

export default HeartsTable;
