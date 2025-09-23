import { describe, expect, it } from 'vitest';
import { resolveEngineModules } from '../src/app/modules/engineModules.js';

const DummyTable = () => null;

describe('resolveEngineModules', () => {
  it('provides default lobby/table modules when none are supplied', () => {
    const engine = {
      name: 'Test Engine',
      components: {
        Table: DummyTable,
      },
    };

    const modules = resolveEngineModules(engine);

    expect(typeof modules.lobby.getMenuSections).toBe('function');
    expect(typeof modules.lobby.getProfileSections).toBe('function');
    const renderedTable = modules.table.Component({
      players: [],
      userId: 'user-1',
      phase: 'idle',
      hand: [],
      handLocked: false,
      onPlayCard: () => {},
    });
    expect(renderedTable.type).toBe(DummyTable);

    const info = modules.lobby.getRoomInfo({ state: { roomName: 'Alpha', roomId: '1234' }, engine, fallbackName: 'Fallback' });
    expect(info).toEqual({ title: 'Alpha', code: '1234' });
  });

  it('honours module overrides defined on the engine', () => {
    const CustomLobby = () => null;
    const customMenu = () => [];
    const engine = {
      name: 'Test Engine',
      components: {
        Table: DummyTable,
      },
      modules: {
        lobby: {
          Component: CustomLobby,
          getMenuSections: customMenu,
        },
      },
    };

    const modules = resolveEngineModules(engine);

    const renderedLobby = modules.lobby.Component({
      players: [],
      hostId: 'host-1',
      userId: 'user-1',
      onStart: () => {},
      onReturnToWelcome: () => {},
      onBackToHub: () => {},
    });
    expect(renderedLobby.type).toBe(CustomLobby);
    expect(modules.lobby.getMenuSections).toBe(customMenu);
  });
});
