import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen.jsx';
import LobbyView from './components/LobbyView.jsx';
import GameBoard from './components/GameBoard.jsx';
import SuitPicker from './components/SuitPicker.jsx';
import { initialRoomState, roomReducer } from './state/roomReducer.js';

const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
const BOT_THINK_DELAY = 700;

const countSuitPreference = (hand) => {
  return SUITS.map((suit) => ({
    suit,
    count: hand.filter((card) => card.suit === suit).length,
  }))
    .filter(({ count }) => count > 0)
    .sort((a, b) => b.count - a.count);
};

const chooseBotMove = (state, botPlayer) => {
  const hand = state.hands[botPlayer.id] ?? [];
  if (hand.length === 0) {
    return { type: 'DRAW_CARD', payload: { playerId: botPlayer.id } };
  }

  const topCard = state.discardPile[state.discardPile.length - 1] ?? null;
  const activeSuit = state.activeSuit ?? topCard?.suit ?? null;

  const playable = hand.filter((card) => {
    if (card.rank === '8') return true;
    if (activeSuit && card.suit === activeSuit) return true;
    if (topCard && card.rank === topCard.rank) return true;
    return false;
  });

  if (playable.length === 0) {
    return { type: 'DRAW_CARD', payload: { playerId: botPlayer.id } };
  }

  const twos = playable.filter((card) => card.rank === '2');
  if (twos.length > 0) {
    return { type: 'PLAY_CARD', payload: { playerId: botPlayer.id, card: twos[0] } };
  }

  const suitMatches = playable.filter((card) => card.rank !== '8' && card.suit === activeSuit);
  if (suitMatches.length > 0) {
    return { type: 'PLAY_CARD', payload: { playerId: botPlayer.id, card: suitMatches[0] } };
  }

  const rankMatches = playable.filter(
    (card) => card.rank !== '8' && topCard && card.rank === topCard.rank,
  );
  if (rankMatches.length > 0) {
    return { type: 'PLAY_CARD', payload: { playerId: botPlayer.id, card: rankMatches[0] } };
  }

  const wilds = playable.filter((card) => card.rank === '8');
  if (wilds.length > 0) {
    const suitPreference = countSuitPreference(hand.filter((card) => card.id !== wilds[0].id));
    const preferredSuit = suitPreference.length > 0 ? suitPreference[0].suit : SUITS[0];
    return {
      type: 'PLAY_CARD',
      payload: { playerId: botPlayer.id, card: wilds[0], chosenSuit: preferredSuit },
    };
  }

  return { type: 'DRAW_CARD', payload: { playerId: botPlayer.id } };
};

const pickSuitForHuman = (hand) => {
  const counts = countSuitPreference(hand);
  return counts.length > 0 ? counts[0].suit : SUITS[0];
};

function App() {
  const [state, dispatch] = useReducer(roomReducer, initialRoomState);
  const botMoveTimeoutRef = useRef(null);
  const [pendingWildCard, setPendingWildCard] = useState(null);

  const myHand = useMemo(() => state.hands[state.userId] ?? [], [state.hands, state.userId]);

  useEffect(() => {
    if (state.phase !== 'lobby') return;
    const humans = state.players.filter((player) => !player.isBot);
    if (humans.length === 0) return;
    const humansReady = humans.every((player) => player.isReady);
    const botsNeedReady = state.players.some((player) => player.isBot && !player.isReady);
    if (humansReady && botsNeedReady) {
      dispatch({ type: 'AUTO_READY_BOTS' });
    }
  }, [state.phase, state.players]);

  useEffect(() => {
    if (botMoveTimeoutRef.current) {
      clearTimeout(botMoveTimeoutRef.current);
      botMoveTimeoutRef.current = null;
    }

    if (state.phase !== 'playing') return;
    const currentPlayer = state.players.find((player) => player.id === state.currentTurn);
    if (!currentPlayer || !currentPlayer.isBot) return;

    botMoveTimeoutRef.current = setTimeout(() => {
      const action = chooseBotMove(state, currentPlayer);
      if (action) {
        dispatch(action);
      }
    }, BOT_THINK_DELAY);

    return () => {
      if (botMoveTimeoutRef.current) {
        clearTimeout(botMoveTimeoutRef.current);
        botMoveTimeoutRef.current = null;
      }
    };
  }, [state.phase, state.currentTurn, state.players, state.hands, state.discardPile, state.drawPile, state.activeSuit]);

  useEffect(() => () => {
    if (botMoveTimeoutRef.current) {
      clearTimeout(botMoveTimeoutRef.current);
      botMoveTimeoutRef.current = null;
    }
  }, []);

  if (state.phase === 'welcome') {
    return (
      <WelcomeScreen
        name={state.userName}
        onNameChange={(value) => dispatch({ type: 'SET_NAME', payload: value })}
        onCreateRoom={() => dispatch({ type: 'CREATE_ROOM' })}
      />
    );
  }

  if (state.phase === 'lobby') {
    return (
      <LobbyView
        roomId={state.roomId}
        players={state.players}
        hostId={state.hostId}
        userId={state.userId}
        banner={state.banner}
        onToggleReady={(playerId) => dispatch({ type: 'TOGGLE_READY', payload: { playerId } })}
        onStart={() => dispatch({ type: 'START_GAME' })}
        onAddBot={() => dispatch({ type: 'ADD_BOT' })}
        onRemoveBot={() => dispatch({ type: 'REMOVE_BOT' })}
        onReturnToWelcome={() => dispatch({ type: 'RESET_SESSION' })}
      />
    );
  }

  const handlePlayCard = (card) => {
    if (card.rank === '8') {
      setPendingWildCard(card);
      return;
    }

    dispatch({ type: 'PLAY_CARD', payload: { playerId: state.userId, card } });
  };

  const handleSelectSuit = (suit) => {
    if (!pendingWildCard) return;
    const chosenSuit = suit ?? pickSuitForHuman(myHand.filter((handCard) => handCard.id !== pendingWildCard.id));
    dispatch({
      type: 'PLAY_CARD',
      payload: { playerId: state.userId, card: pendingWildCard, chosenSuit },
    });
    setPendingWildCard(null);
  };

  const handleCancelSuit = () => {
    setPendingWildCard(null);
  };

  return (
    <>
      <GameBoard
        roomId={state.roomId}
        players={state.players}
        userId={state.userId}
        drawPile={state.drawPile}
        discardPile={state.discardPile}
        activeSuit={state.activeSuit}
        hand={myHand}
        banner={state.banner}
        history={state.history}
        phase={state.phase}
        currentTurn={state.currentTurn}
        handLocked={Boolean(pendingWildCard)}
        onPlayCard={handlePlayCard}
        onDrawCard={() => dispatch({ type: 'DRAW_CARD', payload: { playerId: state.userId } })}
        onReturnToLobby={() => dispatch({ type: 'RETURN_TO_LOBBY' })}
        onResetSession={() => dispatch({ type: 'RESET_SESSION' })}
      />

      {pendingWildCard && (
        <SuitPicker
          suits={SUITS}
          onSelect={handleSelectSuit}
          onCancel={handleCancelSuit}
        />
      )}
    </>
  );
}

export default App;
