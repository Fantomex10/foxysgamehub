const defaultGetHand = (state, playerId) => {
  if (!state || !state.hands) {
    return [];
  }
  return state.hands[playerId] ?? [];
};

const removeCardFromHand = (hand, card) => {
  if (!Array.isArray(hand) || !card) {
    return null;
  }

  const index = hand.findIndex((candidate) => candidate && candidate.id === card.id);
  if (index === -1) {
    return null;
  }

  const nextHand = [...hand];
  const [removed] = nextHand.splice(index, 1);
  return { card: removed, hand: nextHand };
};

const defaultGuard = (context) => {
  if (context.initialState.phase !== 'playing') {
    return context.initialState;
  }
  if (context.initialState.currentTurn !== context.playerId) {
    return context.initialState;
  }
  return null;
};

const createContext = (state, action, helpers) => {
  const payload = action?.payload ?? {};
  const context = {
    initialState: state,
    state,
    action,
    payload,
    playerId: payload.playerId,
    card: payload.card,
    chosenSuit: payload.chosenSuit,
    hand: null,
    nextHand: null,
    meta: {},
    helpers,
    setState(nextState) {
      this.state = nextState;
      return this.state;
    },
    assign(updates) {
      this.state = { ...this.state, ...updates };
      return this.state;
    },
    replaceHands(updates) {
      this.assign({ hands: updates });
    },
    mergeMeta(additional) {
      if (additional && typeof additional === 'object') {
        Object.assign(this.meta, additional);
      }
    },
    pushHistory(message) {
      if (!message || typeof message !== 'string') {
        return this.state;
      }
      if (typeof this.helpers.pushHistory !== 'function') {
        throw new TypeError('createTrickEngine requires a pushHistory helper');
      }
      const nextHistory = this.helpers.pushHistory(this.state.history, message);
      this.assign({ history: nextHistory });
      return this.state;
    },
    getPlayer(targetId = this.playerId) {
      if (!targetId) return null;
      if (typeof this.helpers.findPlayer === 'function') {
        return this.helpers.findPlayer(this.state.players, targetId) ?? null;
      }
      return this.state.players?.find((player) => player.id === targetId) ?? null;
    },
    getPlayerIndex(targetId = this.playerId) {
      if (!targetId) return -1;
      return this.state.players?.findIndex((player) => player.id === targetId) ?? -1;
    },
  };
  return context;
};

export const createTrickEngine = (config = {}) => {
  const {
    guardPlay,
    getHand,
    pushHistory,
    findPlayer,
    describePlay,
    validateCard,
    onCardRemoved,
    onCardPlayed,
    isTrickComplete,
    onTrickComplete,
    isRoundComplete,
    onRoundComplete,
    finalize,
  } = config;

  if (typeof pushHistory !== 'function') {
    throw new TypeError('createTrickEngine requires a pushHistory function');
  }

  const helpers = {
    pushHistory,
    findPlayer,
    getHand: typeof getHand === 'function' ? getHand : defaultGetHand,
  };

  return (state, action = {}) => {
    const context = createContext(state, action, helpers);
    if (!context.playerId || !context.card) {
      return state;
    }

    const guardResult = typeof guardPlay === 'function'
      ? guardPlay(context)
      : defaultGuard(context);

    if (guardResult) {
      return guardResult;
    }

    const hand = helpers.getHand(state, context.playerId);
    const removal = removeCardFromHand(hand, context.card);
    if (!removal) {
      return state;
    }

    context.hand = hand;
    context.card = removal.card;
    context.nextHand = removal.hand;

    if (typeof validateCard === 'function') {
      const invalidState = validateCard(context);
      if (invalidState) {
        return invalidState;
      }
    }

    const nextHands = {
      ...(state.hands ?? {}),
      [context.playerId]: context.nextHand,
    };

    context.setState({
      ...state,
      hands: nextHands,
    });

    if (typeof onCardRemoved === 'function') {
      const updated = onCardRemoved(context);
      if (updated) {
        context.setState(updated);
      }
    }

    if (typeof describePlay === 'function') {
      context.pushHistory(describePlay(context));
    }

    if (typeof onCardPlayed === 'function') {
      const updated = onCardPlayed(context);
      if (updated) {
        context.setState(updated);
      }
    }

    const trickMeta = typeof isTrickComplete === 'function' ? isTrickComplete(context) : null;
    if (trickMeta) {
      context.meta.trickResolved = true;
      if (typeof trickMeta === 'object') {
        context.mergeMeta(trickMeta);
      }
      if (typeof onTrickComplete === 'function') {
        const updated = onTrickComplete(context, trickMeta);
        if (updated) {
          context.setState(updated);
        }
      }
    }

    const roundMeta = typeof isRoundComplete === 'function' ? isRoundComplete(context) : null;
    if (roundMeta) {
      context.meta.roundResolved = true;
      if (typeof roundMeta === 'object') {
        context.mergeMeta(roundMeta);
      }
      if (typeof onRoundComplete === 'function') {
        const updated = onRoundComplete(context, roundMeta);
        if (updated) {
          context.setState(updated);
        }
      }
    }

    if (typeof finalize === 'function') {
      const updated = finalize(context);
      if (updated) {
        context.setState(updated);
      }
    }

    return context.state;
  };
};

export default createTrickEngine;
