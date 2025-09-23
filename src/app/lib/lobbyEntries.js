export const composeLobbyEntry = (snapshot, engine) => {
  if (!snapshot?.roomId || !engine) return null;
  const host = snapshot.players?.find((player) => player.id === snapshot.hostId);
  return {
    id: snapshot.roomId,
    roomName: snapshot.roomName ?? `Room ${snapshot.roomId}`,
    engineId: engine.id,
    engineName: engine.name,
    hostName: host?.name ?? 'Host',
    playerCount: snapshot.players?.length ?? 0,
    spectatorCount: snapshot.spectators?.length ?? 0,
    maxPlayers: snapshot.roomSettings?.maxPlayers ?? snapshot.players?.length ?? 0,
    snapshot,
  };
};
