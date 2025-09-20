import { useMemo, useState } from 'react';

export const useDefaultPlayerInteraction = ({ state, photon }) => {
  const [_placeholder] = useState(null);
  const hand = useMemo(() => state.hands[state.userId] ?? [], [state.hands, state.userId]);
  const isMyTurn = state.currentTurn === state.userId && state.phase === 'playing';
  const onPlayCard = (card) => {
    if (!isMyTurn) return;
    photon.playCard(state.userId, card);
  };
  return {
    hand,
    handLocked: !isMyTurn,
    onPlayCard,
    overlays: null,
  };
};
