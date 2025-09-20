# Codex Worklog

## Current Focus
- Prepare Phase 5 (Customization UI & Deployment Readiness) to expose player-facing theme controls and document launch paths.
- Extend customization tokens so assets (cards, tables, pieces) can be swapped independently or as themed bundles.
- Draft the staging vs production config checklist prior to wiring CI.

## Completed (Phase 1 – Mock & Service Hardening)
- Expanded `sessionService`/`photonService` mock adapters, added runtime adapter toggles, and persist developer choices locally.
- Reset app/session state cleanly whenever adapters change and exposed menu controls in `AppLayout` for quick switching.
- Updated `scripts/app-flow-smoke.mjs` to validate offline login → lobby → play with the hardened mocks.

## Completed (Phase 2 – Testing & Tooling)
- Added Vitest + Testing Library to the toolchain with `vitest.config.js` and `tests/setupTests.js`.
- Created reducer smoke tests for Crazy Eights and Hearts to guard lobby/start flows.
- Added a hook-level test for `useDefaultPlayerInteraction` ensuring turn-locking behaviour functions as expected.
- Wired `npm run test` / `npm run test:watch` scripts so the suite can join CI alongside lint/build.

## Completed (Phase 3 – Engine Extensibility)
- Introduced `resolveEngineModules` with defaults for lobby/table menus, profiles, and room metadata.
- Refactored `AppStateProvider`/`RoomPage` to consume modules, enabling per-engine overrides without touching global state.
- Added Hearts- and Crazy-Eights-specific module overrides to demonstrate custom side panels.
- Documented the module contract in `docs/game-engine-contract.md` and validated it with unit tests.

## Completed (Phase 4 – Dynamic Theming & Skins)
- Added a theme registry with Midnigh Shift, Aurora Bloom, and Summit Dawn palettes plus semantic tokens for cards, tables, buttons, and overlays.
- Wrapped the app with `ThemeProvider`, persisted selections to `localStorage`, and surfaced developer toggles for adapters + themes.
- Refactored AppShell, AppLayout, TableLayout, GameBoard, and card-related components to consume live theme tokens.
- Documented theming usage in `docs/theming.md` and introduced Vitest coverage for ThemeContext behaviour.

## Upcoming Tasks
1. Surface a player-facing customization panel in the hub that builds on ThemeProvider and the future CustomizationProvider.
2. Extend theme/customization tokens to secondary screens (login menus, lobby forms) and add accessibility-friendly variants.
3. Sync theme + skin selection with service/session profiles once Firebase integration lands.
4. Capture staging vs production deployment steps alongside environment variable documentation.

## In Progress (Phase 5 – Customization Foundations)
- Documented the customization system design in `docs/customization.md`, outlining registries, provider contract, and implementation roadmap.
- Implemented the customization registries, provider, and token hook; rewired card/table components to consume the new tokens.
- Built the hub customization panel with presets, per-category overrides, and accessibility toggles; added coverage in `tests/customizationProvider.test.jsx` + `tests/customizationPanel.test.jsx`.
- Authored `docs/deployment-checklist.md` to track staging vs production readiness tasks.
- Next: polish panel previews, extend customization to login/lobby screens, and connect selections with service profiles once Firebase integration lands.

## Notes
- Backend connectivity is still optional; keep every new module mock-friendly.
- Maintain reducer/bot contracts in `src/games/*` so future server authority swaps remain straightforward.
- Revisit this log before new sessions to confirm which items are complete or in progress.
- Master plan for future agents lives in this file; update statuses here after each phase.

## Master Plan (Next Phases)

1. **Customization & Skins**
   - Introduce a `CustomizationProvider` layered over ThemeProvider to manage palette + asset selections (themes, card skins, table felt, pieces).
   - Define skin registries for cards/tables/pieces/backgrounds so presets and mix-and-match options are possible.
   - Build a hub customization panel with live previews, presets, and per-category overrides.
   - Persist player selections locally and, later, via Firebase profiles.

2. **Testing & Tooling (Ongoing)**
   - Expand suites to cover new modules and customization flows, integrate coverage thresholds, and add CI recipes.
 
3. **Deployment Readiness**
   - Document environment variables, Firebase/Photon setup, and a pre-launch checklist once feature work stabilises.

## Customization Roadmap Notes

- **Theme Registry → Theme Packs**: Extend `src/ui/theme.js` entries with metadata and optional sections for cards/table/pieces/backgrounds. Allow engine-specific overrides (`themes[themeId].engines.hearts.cards`).
- **Asset Bundles & Skins**: Introduce an asset registry (e.g., `skins/`) describing card backs, felt textures, piece sets. Themes can reference these packs but players should eventually mix-and-match.
- **Customization Provider**: Add `CustomizationProvider` storing `{ themeId, cardSkinId, tableSkinId, pieceSkinId }`, persisting to localStorage (later Firebase). Expose `useCustomization()` hook alongside `useTheme()`.
- **Component Consumption**: Update card/table/piece components to read from the customization context, applying chosen assets and colors. Ensure future board games can register piece skins.
- **Engine Overrides**: Let engines supply optional customization hints via the existing module system (`resolveEngineModules`) so hearts/crazy eights can specify default skins or custom layout tweaks.
- **Player UI**: Build a hub "Customization" panel where users preview presets, edit individual categories, and save combinations (e.g., "Aurora theme + Retro Deck").
- **Data Model**: Define a serialisable `CustomizationConfig` (theme + skins) for storage/sync.
- **Docs**: Extend `docs/theming.md` or add `docs/customization.md` explaining theme/skin definitions, registries, and how to add new assets.

## Legacy Milestones

### App/Foundation Work
- Introduced `AppStateProvider` and reorganised app phases into page components (`src/app/`).
- Extracted `usePhotonRoomState` and default interaction hooks into `src/hooks/` and wired them through context.
- Added `sessionService` abstraction for swapping Firebase with mock adapters.
- Created page components for Login, Hub, Create, Join, and Room while preserving existing UI.
- Implemented `AppLayout` wrapper to centralise shell logic ahead of future table redesigns.

### Presentation & Engine Prep
- Added `photonService` adapter to wrap the local Photon client and prepare for remote authority swaps.
- Introduced `TableLayout` and updated Crazy Eights/Hearts tables to share the same presentation frame.
- Documented the engine contract in `docs/game-engine-contract.md` for future engine additions.

### Theming Baseline
- Centralised theming tokens in `src/ui/theme.js` and migrated `AppShell` to reference them.
- Added `src/lib/config.js` so Firebase/session/Photon services read environment settings from one place.
- Created `scripts/app-flow-smoke.mjs` to simulate login → lobby → play using mock adapters.
