import { useMemo, useState } from 'react';
import SuitPicker from '../../../components/SuitPicker.jsx';
import { pickSuitForHuman } from '../logic/bot.js';

export const useCrazyEightsPlayerInteraction = ({ state, photon, authUser, metadata }) => {
  const [pendingWildCard, setPendingWildCard] = useState(null);
  const hand = useMemo(() => state.hands[state.userId] ?? [], [state.hands, state.userId]);
  const suits = metadata?.suits ?? ['hearts', 'diamonds', 'clubs', 'spades'];

  const handlePlayCard = (card) => {
    if (!authUser) return;
    if (card.rank === '8') {
      setPendingWildCard(card);
      return;
    }

    photon.playCard(state.userId, card);
  };

  const handleSelectSuit = (suit) => {
    if (!pendingWildCard) return;
    const chosenSuit = suit ?? pickSuitForHuman(hand.filter((c) => c.id !== pendingWildCard.id));
    photon.playCard(state.userId, pendingWildCard, chosenSuit);
    setPendingWildCard(null);
  };

  const handleCancelSuit = () => {
    setPendingWildCard(null);
  };

  const overlays = pendingWildCard ? (
    <SuitPicker suits={suits} onSelect={handleSelectSuit} onCancel={handleCancelSuit} />
  ) : null;

  return {
    hand,
    handLocked: Boolean(pendingWildCard),
    onPlayCard: handlePlayCard,
    overlays,
  };
};
