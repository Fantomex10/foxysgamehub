export const getDefaultMenuSections = () => ([
  {
    title: 'Game menu',
    items: [
      { label: 'Game options', onClick: () => {}, tone: 'ghost' },
      { label: 'Settings', onClick: () => {}, tone: 'ghost' },
      { label: 'Support', onClick: () => {}, tone: 'ghost' },
    ],
  },
]);

export const getDefaultProfileSections = ({
  gameDisplayName,
  playerDisplayName,
  roomId,
}) => ([
  { type: 'highlight', label: 'Lobby', value: gameDisplayName },
  { label: 'Room code', value: roomId ?? '—' },
  { label: 'Display name', value: playerDisplayName },
  { label: 'Balance', value: '—' },
  { label: 'Local time', value: '--:--' },
  { type: 'divider', key: 'divider-1' },
  { label: 'Stats', value: 'Coming soon' },
  { label: 'Unlocked items', value: 'No items unlocked yet.' },
  { label: 'Friends', value: 'Invite friends to share the table.' },
]);
