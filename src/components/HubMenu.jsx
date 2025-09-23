import React, { useMemo, useState } from 'react';
import { useCustomizationTokens } from '../customization/CustomizationContext.jsx';
import { createPanelContainerStyle, createActionButtonStyle, createOverlayStyle, createStackStyle } from '../ui/stylePrimitives.js';

const MENU_ITEMS = [
  {
    id: 'friends',
    label: 'Play with friends',
    tone: 'primary',
    fallback: 'Friend lobbies will appear here soon.',
    handlerKey: 'onPlayWithFriends',
  },
  {
    id: 'create',
    label: 'Create lobby',
    tone: 'ghost',
    fallback: 'Creating lobbies is disabled right now.',
    handlerKey: 'onCreate',
  },
  {
    id: 'join',
    label: 'Join lobby',
    tone: 'ghost',
    fallback: 'Lobby browser is unavailable.',
    handlerKey: 'onJoin',
  },
  {
    id: 'matchmaking',
    label: 'Match making',
    tone: 'default',
    fallback: 'Matchmaking queues are on the roadmap.',
    handlerKey: 'onMatchmaking',
  },
  {
    id: 'daily-draw',
    label: 'Enter Daily Draw',
    tone: 'danger',
    fallback: 'Daily draw rewards will unlock soon.',
    handlerKey: 'onDailyDraw',
  },
];

const HubMenu = (props) => {
  const [modalMessage, setModalMessage] = useState(null);
  const {
    theme,
    pieces,
    scaleFont,
    motionDuration,
    accessibility,
  } = useCustomizationTokens();

  const buttonTokens = useMemo(
    () => ({ theme, pieces, scaleFont, motionDuration, accessibility }),
    [theme, pieces, scaleFont, motionDuration, accessibility],
  );

  const containerStyle = useMemo(
    () => createPanelContainerStyle(
      { theme, pieces },
      {
        maxWidth: '640px',
        margin: '0 auto',
        padding: `${theme.spacing?.xl ?? '28px'} ${theme.spacing?.lg ?? '24px'}`,
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing?.md ?? '16px',
        boxSizing: 'border-box',
        width: '100%',
        position: 'relative',
      },
    ),
    [theme, pieces],
  );

  const stackStyle = useMemo(
    () => createStackStyle({ theme }, { gap: 'sm' }),
    [theme],
  );

  const buttonStyles = useMemo(() => {
    const overrides = {
      friends: { padding: '14px 18px', fontSize: '18px', fontWeight: 700 },
      create: { padding: '14px 18px', fontSize: '18px', fontWeight: 600, color: theme.colors.textSecondary },
      join: { padding: '14px 18px', fontSize: '18px', fontWeight: 600, color: theme.colors.textSecondary },
      matchmaking: { padding: '13px 18px', fontSize: '17px', fontWeight: 600 },
      'daily-draw': {
        padding: '13px 18px',
        fontSize: '17px',
        fontWeight: 600,
        background: theme.colors.accentDangerSoft,
        color: theme.colors.accentDanger,
      },
    };
    return MENU_ITEMS.reduce((map, item) => {
      map[item.id] = createActionButtonStyle(buttonTokens, item.tone, overrides[item.id]);
      return map;
    }, {});
  }, [buttonTokens, theme.colors.accentDanger, theme.colors.accentDangerSoft, theme.colors.textSecondary]);

  const overlayBackdropStyle = useMemo(
    () => createOverlayStyle({ theme }, {
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing?.lg ?? '24px',
    }),
    [theme],
  );

  const overlayContentStyle = useMemo(
    () => createPanelContainerStyle(
      { theme, pieces },
      {
        padding: theme.spacing?.lg ?? '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing?.md ?? '16px',
        maxWidth: '360px',
        textAlign: 'center',
      },
    ),
    [theme, pieces],
  );

  const closeButtonStyle = useMemo(
    () => createActionButtonStyle(buttonTokens, 'default', { padding: '10px 18px', fontWeight: 600 }),
    [buttonTokens],
  );

  const handleAction = (item) => {
    const callback = props[item.handlerKey];
    if (typeof callback === 'function') {
      callback();
      return;
    }
    setModalMessage(item.fallback);
  };

  return (
    <div style={containerStyle}>
      <div style={stackStyle}>
        {MENU_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleAction(item)}
            style={buttonStyles[item.id]}
          >
            {item.label}
          </button>
        ))}
      </div>

      {modalMessage && (
        <div
          style={overlayBackdropStyle}
          role="presentation"
          onClick={() => setModalMessage(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            style={overlayContentStyle}
            onClick={(event) => event.stopPropagation()}
          >
            <p style={{ margin: 0, fontSize: scaleFont('18px'), fontWeight: 600 }}>Coming soon</p>
            <p style={{ margin: 0, fontSize: scaleFont('15px'), color: theme.colors.textSecondary }}>{modalMessage}</p>
            <button
              type="button"
              onClick={() => setModalMessage(null)}
              style={closeButtonStyle}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HubMenu;
