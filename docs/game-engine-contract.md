# Game Engine Contract

This project loads card-game engines through `createGameEngine` (`src/games/engineTypes.js`). Each engine definition must conform to the interface below so the hub, contexts, and shared UI can remain generic.

## Required Fields

| Field | Type | Purpose |
| --- | --- | --- |
| `id` | `string` | Stable identifier (e.g., `crazy-eights`). |
| `name` | `string` | Display label shown in menus and headers. |
| `components.Table` | `React.ComponentType` | Main in-game view rendered inside `RoomPage`. |
| `createInitialState` | `({ userId?, userName? }) => any` | Factory for the engine state consumed by `PhotonClient`. |
| `reducer` | `(state, action) => state` | Pure reducer handling lobby + gameplay actions. |

## Optional Fields

| Field | Type | Notes |
| --- | --- | --- |
| `metadata` | `Record<string, unknown>` | Arbitrary data exposed to hooks/components (e.g., player limits). |
| `components.Welcome` | `React.ComponentType` | Intro screen before lobby (unused today). |
| `components.Lobby` | `React.ComponentType` | Custom lobby body rendered inside `RoomPage` during `roomLobby` phase. |
| `components.SuitPicker` | `React.ComponentType` | Optional overlay for wild-card selection. |
| `hooks.usePlayerInteraction` | `({ state, photon, authUser, metadata }) => interaction` | Overrides default hand logic (returns hand, handlers, overlays). |
| `helpers` | `Record<string, Function>` | Utility functions exposed to UI or bots. |
| `botThinkDelay` | `number` | Milliseconds to wait before bot actions. |
| `getBotAction` | `(state, botPlayer) => action` | Provides automated moves when `botThinkDelay` elapses. |
| `modules` | `EngineModules` | Optional per-engine UI modules overriding lobby/table menus, side panels, and room metadata. |
| `customizationDefaults` | `Partial<CustomizationState>` | Optional baseline cosmetic selection applied when the engine activates. |

## Interaction Contract

- Reducers must accept the actions produced by `PhotonClient` (`PLAY_CARD`, `DRAW_CARD`, `SET_NAME`, etc.).
- Returned state should keep these top-level keys so shared UI remains functional:
  - `phase`: `'idle' | 'roomLobby' | 'playing' | 'finished'`
  - `players`, `spectators`, `hands`, `drawPile`, `discardPile`, `currentTurn`
  - `roomSettings`, `roomId`, `roomName`, `hostId`
- Optional fields such as `history`, `banner`, `scores`, or engine-specific data may be added; UI will read them defensively.
- The `usePlayerInteraction` hook should return:
  - `hand` (array) – cards currently in the player's hand
  - `handLocked` (boolean) – disables interaction when true
  - `onPlayCard(card)` – called from shared components when the player selects a card
  - `overlays` (React nodes) – injected above the table via `RoomPage`

## Shared Engine Toolkit

The `src/games/shared/` directory houses reusable helpers that engines should adopt instead of re-implementing boilerplate:

- `lobbyUtils.js` – status cycling, lobby seat preparation, ID/room-code generation, bounded history logging, and player lookup.
- `reducerFactory.js` – `createReducer(actionMap)` and `createInitialStateFactory(baseStateBuilder)` remove reducer/initial-state wiring duplication.
- `botHandlers.js` – `createBotHandlers(config)` returns `addBot`, `removeBot`, and `autoReadyBots` with seat-limit and banner customisation.
- `trickEngine/` – `createTrickEngine(config)` orchestrates trick play by combining validation, per-card effects, trick resolution, and round resolution callbacks.

When extending the hub with a new engine, start with these helpers and add game-specific behaviour through the provided hooks.

## Module Contract

`engine.modules` may override the default lobby/table presentation without modifying app-level state. All module hooks receive a context object with `{ state, engine, roomActions, playerDisplayName, gameDisplayName, gameOptions? }` and should return plain data structures.

- `modules.welcome.Component` – Replaces the welcome screen shown before lobby entry.
- `modules.lobby` – `{ Component, getMenuSections(ctx), getProfileSections(ctx), getRoomInfo({ state, engine, fallbackName }) }`.
- `modules.table` – Same shape as `modules.lobby`, used once the game is in progress.

If omitted, the hub falls back to shared components (`LobbyView`, shared menus, etc.). Any custom module should keep the contract for props consumed by `RoomPage` (e.g., lobby component should accept the same props as `LobbyView`).

## Adding A New Engine

1. Create a new folder under `src/games/<engineName>/` with `index.js`, `state/`, `logic/`, and optional `hooks/` directories mirroring Crazy Eights.
2. Implement the reducer/state factory with the required fields above.
3. Export your engine from `src/games/index.js` so it appears in the registry.
4. Provide any custom lobby/table components and interaction hooks; they will automatically receive the `roomActions` from context.
5. Verify the reducer with a minimal smoke test to guarantee core transitions (e.g., lobby -> playing -> finished).

Keeping to this contract ensures the hub can swap engines without additional wiring or special-case logic.

## Migration Checklist For Trick-Based Engines

1. Use `createInitialStateFactory` with your `createBaseState` function so user overrides stay consistent across engines.
2. Build reducers with `createReducer(actionMap)` to keep action dispatch uniform.
3. Configure `createBotHandlers` with seat limits, banners, and history messaging, then re-export the generated handlers from your action directory.
4. Wire `PLAY_CARD` handling through `createTrickEngine`, supplying callbacks for validation, per-card side effects, trick resolution, and round completion.
5. Import lobby helpers (status sequencing, lobby preparation, IDs, history) from `lobbyUtils.js` instead of duplicating them.
6. Extend your test suite to exercise custom trick callbacks and scoring so the shared pipeline remains verified.
