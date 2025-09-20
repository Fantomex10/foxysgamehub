import { setSessionAdapter, sessionService, getSessionAdapterKey } from '../src/services/sessionService.js';
import { setPhotonAdapter, photonService, getPhotonAdapterKey } from '../src/services/photonService.js';
import { getDefaultGameEngine } from '../src/games/index.js';

const divider = () => console.log('—'.repeat(48));

async function run() {
  divider();
  console.log('App flow smoke: ensuring mock adapters cover offline flow');

  setSessionAdapter('mock');
  setPhotonAdapter('mock');

  console.log('Session adapter ->', getSessionAdapterKey());
  console.log('Photon adapter  ->', getPhotonAdapterKey());

  const engine = getDefaultGameEngine();
  const photon = photonService.createClient(engine);

  const user = await sessionService.ensureUserSession({ fallbackDisplayName: 'Smoke Tester' });
  console.log('Session established:', user.uid, user.displayName ?? '<no name>');

  await sessionService.upsertPlayerProfile(user.uid, { displayName: user.displayName ?? 'Smoke Tester' });
  const storedProfile = await sessionService.fetchPlayerProfile(user.uid);
  if (!storedProfile || storedProfile.displayName !== (user.displayName ?? 'Smoke Tester')) {
    throw new Error('Mock session adapter failed to persist the player profile.');
  }
  console.log('Profile stored offline:', storedProfile.displayName);

  photon.connect({ userId: user.uid, userName: user.displayName ?? 'Tester', engineId: engine.id });
  const initialState = photon.getState();
  console.log('Initial phase:', initialState.phase);

  const roomName = 'Smoke Lounge';
  photon.createRoom({ settings: { roomName }, roomId: 'TEST' });
  const afterCreate = photon.getState();
  if (afterCreate.players.length === 0) {
    throw new Error('Expected host player to be present after creating a room.');
  }
  console.log('Room created -> phase:', afterCreate.phase, '| players:', afterCreate.players.length);

  if (afterCreate.roomName !== roomName) {
    throw new Error(`Expected room name to be "${roomName}" but received "${afterCreate.roomName}"`);
  }

  photon.startGame();
  if (photon.getState().phase !== 'playing') {
    throw new Error('Expected game to enter playing phase after startGame().');
  }

  console.log('Game started. Current turn:', photon.getState().currentTurn ?? '<none>');

  photon.returnToLobby();
  if (photon.getState().phase !== 'roomLobby') {
    throw new Error('Expected returnToLobby() to restore lobby phase.');
  }
  console.log('Lobby restored after game.');
  divider();
  console.log('Smoke run complete.');
}

run().catch((error) => {
  console.error('Smoke run failed:', error);
  process.exitCode = 1;
});
