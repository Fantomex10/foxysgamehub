# Shared Game Utilities

This folder groups helpers that keep engine implementations consistent. Import from these modules instead of copying logic between engines.

- `lobbyUtils.js` – Lobby status cycle, seat preparation, ID/room-code builders, and bounded history helpers.
- `reducerFactory.js` – Reducer and initial-state factory helpers (`createReducer`, `createInitialStateFactory`).
- `botHandlers.js` – `createBotHandlers(config)` for add/remove/auto-ready bot flows tailored by seat limits and banners.
- `trickEngine/` – `createTrickEngine(config)` for trick-play reducers with pluggable validation, trick resolution, and scoring.

When adding a new engine, start with these shared pieces and only specialise the callbacks that express your game’s unique rules.
