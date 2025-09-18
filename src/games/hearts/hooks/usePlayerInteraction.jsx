import { useMemo, useState } from 'react';
import { getLegalMoves } from '../utils.js';

export const useHeartsPlayerInteraction = ({ state, photon }) => {
  const [_placeholder] = useState(null); // maintain hook parity with other engines
  const hand = useMemo(() => state.hands[state.userId] ?? [], [state.hands, state.userId]);
  const isMyTurn = state.currentTurn === state.userId && state.phase === 'playing';
  const legalMoves = isMyTurn ? getLegalMoves(state, state.userId) : [];
  const legalIds = new Set(legalMoves.map((card) => card.id));

  const onPlayCard = (card) => {
    if (!isMyTurn) return;
    if (legalIds.size > 0 && !legalIds.has(card.id)) return;
    photon.playCard(state.userId, card);
  };

  return {
    hand,
    handLocked: !isMyTurn,
    onPlayCard,
    overlays: null,
    legalIds,
  };
};
