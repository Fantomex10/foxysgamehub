# Codex Worklog

## Session Snapshot (2025-10-21)
- **Starting point:** Phase 6 structural polish was queued with baseline guardrails untracked after completing Phase 5.
- **What we accomplished:**
  - Ran `npm run lint`, `npm run test`, and `npm run build` to freeze the current healthy baseline (all passing as of 08:08 local).
  - Captured bundle outputs from the build (`firebase-WzMgrUB2.js` 451.47 kB, `react-vendor-CgG7ybVg.js` 182.66 kB, main bundle 148.97 kB) to monitor for regressions during refactors.
  - Reviewed `CreateLobbyForm` and `LobbyView` to note remaining console-stubbed actions (player slot adjustments, table options, bot management) and confirm `SeatManagerDialog.jsx` remains a single 21 kB component slated for slicing.
  - Logged outstanding visual guardrail work (screenshots for Create Lobby, Lobby, Seat Manager, Table) ahead of layout refactors.
- Captured baseline screenshots (2025-10-20) in `docs/screenshots/` covering Create Lobby (public/private + password modal), Join/Lobby host & guest, Seat Manager reassignment, and table handoff; use as rollback reference before cosmetic polish.
- Implemented `useLobbyActions` and `useSeatManagerActions` hooks to centralise host controls, replaced console placeholders with disabled states, and added targeted Vitest coverage for lobby/seat orchestration.
- **Where we stopped:** Visual QA (baseline screenshots) captured on 2025-10-20 in `docs/screenshots/`; cosmetic polish is next.
- **Notes for GitHub entry:** "Phase 6 Kickoff � baseline validated; proceeding with responsibility map for lobby/create refactors."

### Phase 6 Prep Notes (2025-10-21)
- Logic extraction: promote the status/seat action builders in `LobbyView.jsx` into `useLobbySeatManager` + `useLobbyActions`, replacing console placeholders before UI slicing.
- Component slicing: plan `LobbyActionGrid`, `LobbyHeader`, and `SeatManagerSummary` shells so action grids and header copy move out of `LobbyView.jsx`.
- Seat manager breakdown: sketch `SeatList`, `BenchList`, and `SeatControls` components to shrink `SeatManagerDialog.jsx` and enable targeted props/tests.
- Verification: add Vitest units around new hooks/components and keep `tests/appFlow*.integration.test.js` as guard after each extraction.

## Session Snapshot (2025-10-20)
- **Starting point:** Phase 5 remained open with customization coverage gaps in seat management, modal flows, and reduced-motion handling, plus missing registry guidance.
- **What we accomplished:**
  - Threaded customization tokens, font scaling, and reduced-motion toggles through the status control, seat manager dialog, and create/join modals, adding dialog semantics and accessibility affordances.
  - Disabled hover/opacity transitions in AppShell, AppLayout, and HubMenu when reduced motion is active, and added Vitest coverage (`tests/statusControl.test.jsx`, new sanitisation case in `tests/customizationProvider.test.jsx`) to lock in scaling and storage migrations.
  - Documented registry contribution guidelines in `docs/customization.md`, marked Phase 5 complete in `README.md`, and refreshed the worklog for the current state.
  - Ran `npm run lint`, `npm run test`, and `npm run build`; all commands passed with the expanded suite.
- **Where we stopped:** Phase 5 deliverables are complete and documented. Phase 6 cosmetic polish and deployment readiness follow-ups now lead the backlog.
- **Notes for GitHub entry:** Codebase is stable and modular ahead of cosmetic/UI overhaul�share this state as �Working (pre-cosmetic overhaul / UI updates)� so contributors know future commits will focus on visual polish.

## Session Snapshot (2025-10-19)
- **Starting point:** The Phase 3 plan existed, but the documentation sweep, ASCII fallback cleanup, and additional integration coverage were still open.
- **What we accomplished:**
  - Normalised Crazy Eights table profile fallbacks to plain ASCII (`N/A`) and swept README/docs so roadmap copy reflects the completed automation and polishing work.
  - Added Vitest integration `tests/appFlow.endGame.integration.test.js` to exercise the finished-game flow and ensure `returnToLobby` restores a clean state.
  - Extended LoginHub and Lobby surfaces to consume customization tokens/accessibility flags and refreshed the hub preview with piece/backdrop summaries.
 - Introduced `tests/loginHub.test.jsx` alongside docs/README updates so the large-text path stays covered in CI.
 - Ran `npm run lint`, `npm run test`, and `npm run build`; all checks passed with the expanded coverage.
- **Where we stopped:** Phase 3 deliverables are complete; Phase 5 now continues with deeper customization coverage (seat manager, modals) alongside deployment readiness tasks.

## Session Snapshot (2025-10-18)
- **Starting point:** CI was live but local git guardrails and the Phase 3 integration test/document polish remained open.
- **What we accomplished:**
  - Added git-managed `pre-commit` and `pre-push` scripts (see `scripts/git-hooks/`) and an installer (`npm run setup-hooks`) so lint/tests run before code leaves a workstation.
  - Authored Vitest integration test `tests/appFlow.integration.test.js` to cover the login -> lobby -> table flow, ensuring fallback copy and customization defaults stay healthy.
  - Extended `README.md` with hook instructions, current Phase 3 status, and refreshed the documentation sweep.
  - Normalised README/docs/customization content to plain ASCII and updated roadmap notes to reflect the latest automation and testing work.
  - Fixed the guest lobby creation loop by seeding Photon display names before `createRoom` and guarding `usePhotonRoomState` against redundant reconnects, eliminating the "Preparing lobby" freeze.
- **Where we stopped:** Phase 3 now only needs the optional UX copy polish and any additional high-level test coverage you deem valuable.

## Session Snapshot (2025-10-17)
- **Starting point:** Phase 1 "Clear Lint Debt" from the roadmap was still open. Context files exported helpers alongside components, several hooks triggered `react-hooks/exhaustive-deps`, and the README roadmap headings were mis-encoded.
- **What we accomplished:**
  - Split non-component exports into dedicated modules (`themeContext.js`, `useTheme.js`, `customizationContext.js`, `customizationState.js`, `useCustomization.js`, `appStateContext.js`, `useAppState.js`) so Fast Refresh linting passes.
  - Normalised memo dependencies and hook ordering in `AppStateContext.jsx`, `LobbyView.jsx`, and `usePhotonRoomState.js` to silence conditional hook/deps warnings.
  - Removed unused variables (`targetThemeId`, `hasSuit`, `hasOnlyHearts`), replaced mojibake separators in `LobbyView`, and fixed the README roadmap headings.
  - Added the missing `src/ui/themeContext.js` file and re-ran `npm run lint` and `npm run build` (both now clean).
- **Where we stopped:** Phase 1 is complete. Phase 2 (Automation & Guardrails) and Phase 3 (integration test + documentation polish) remain untouched.

## Immediate Next Steps
1. **Phase 6 - Cosmetic Polish & Structural Refactors (Next Focus)**
   - **Step 0 - Baseline & Guardrails**: Freeze current behaviour by collecting screenshots of Create/Join flows, note outstanding accessibility toggles, and ensure `tests/appFlow*.integration.test.js` pass before touching structure. If work pauses, revert to this checkpoint.
     - DONE 2025-10-21: Lint/test/build recorded at 08:08 with bundle sizes logged; integration suite (`tests/appFlow*.integration.test.js`) still green.
       - Screenshot checklist (capture before structural refactors):
         - Launch `npm run dev`, open `http://localhost:5173/`, and grab Create Lobby (public) with default settings plus the privacy toggle closed.
         - Toggle privacy to capture the Private Lobby state, including the password modal after submitting without a password.
         - Join Lobby view: capture host perspective (all action buttons visible) and a guest perspective (status controls only).
         - Seat Manager dialog: record initial state plus one seat reassignment (bench to seat) to document current controls.
         - Optional: table handoff once `Start game` succeeds, noting banner/status copy for regression tracking.
   - **Step 1 - Responsibility Map**: Catalogue every concern inside `CreateLobbyForm.jsx` and `LobbyView.jsx` (state initialisation, validation, seat manager wiring, status control hooks, modal handling). Capture the list in this CODEx file so later agents know what remains.
     - Mapping snapshot (2025-10-21):
       - `CreateLobbyPage.jsx`: pulls engine context (`useAppState`) and passes `roomActions.createLobby`/`setAppPhase` handlers into the form, with empty-state guard when no engines are registered.
       - `CreateLobbyForm.jsx`: handles layout and styling, delegating state/submission to `useCreateLobbyConfig`; wires subcomponents for inputs, steppers, visibility toggles, and options/password modals.
       - `useCreateLobbyConfig.js`: owns lobby creation state (room name, engine, player/bot counts, privacy/password), clamps based on engine metadata, and packages the payload sent to `roomActions.createLobby`.
       - `LobbyView.jsx`: orchestrates host interactions (status buttons, seat manager toggle, action grids), composes `PlayersSection`, `SpectatorSection`, `LobbyBanner`, and renders action buttons with inline token-aware styles.
       - `useLobbyOrchestration.js`: derives host/guest flags, readiness gating, available games, seat capacity, bench list, and manages seat manager dialog state before calling `onSelectGame`/`onUpdateSeats`.
       - `SeatManagerDialog.jsx`: encapsulates seat/bench editing with local draft state, action stacks (assign, kick, promote), and applies updates through `onApply`; styling is still inline and monolithic (~21 kB).
       - `PlayersSection.jsx` / `SpectatorSection.jsx`: render participant lists, statuses, and game selector; consume customization tokens directly and expose limited props for layout tweaking.
   - **Step 2 - Logic Extraction**: Peel non-UI logic into reusable hooks/utilities (`useCreateLobbyConfig`, `useLobbySeatManager`, `deriveLobbyMeta`). Each extraction should ship with unit tests and keep existing callers untouched. Pause here if timing slips.
     - DONE 2025-10-20: Extracted `useCreateLobbyConfig` (src/components/lobby/useCreateLobbyConfig.js) encapsulating form state, engine clamps, password validation, and submission packaging. `CreateLobbyForm.jsx` now consumes the hook; added coverage in `tests/useCreateLobbyConfig.test.js` (engine switching, privacy validation, successful submission).
     - DONE 2025-10-20: Extracted `useLobbyOrchestration` (src/components/lobby/useLobbyOrchestration.js) to handle host detection, readiness gating, game selection wiring, seat manager toggles, and derived lists (bench, capacity, game select ID). `LobbyView.jsx` now consumes the hook; added coverage in `tests/useLobbyOrchestration.test.js` for host vs guest behaviour, async seat manager apply, and game selection propagation.
     - DONE 2025-10-21: Added `useLobbyActions` + `useSeatManagerActions` hooks, replaced console fallbacks with disabled host-only controls, and introduced `tests/useLobbyActions.test.js` / `tests/useSeatManagerActions.test.js` to verify status toggles and queued seat updates. Updated `useLobbyOrchestration` to consume the new hook while keeping integration tests green.
   - **Step 3 - UI Segmentation**: Split large JSX sections into focused components under `src/components/lobby/` and `src/components/createLobby/`, keeping styling token-driven.
     - NEXT 2025-10-21: Component slicing blueprint
       - `LobbyView.jsx`
         - Extract `LobbyHeader` (players/seat count + game select) and `LobbyActionGrid` (primary/secondary button layouts) so structure lives outside the main view while actions flow from `useLobbyActions`.
         - Introduce a shared `LobbyActionButton` helper that owns tone/size styling and label rendering to replace repeated inline style objects.
         - Add a lightweight `SeatManagerSummary` placeholder under the action grids that consumes seat/bench counts from `useLobbyOrchestration`, readying the UI for future status badges.
       - `SeatManagerDialog.jsx`
         - Split into `SeatList`, `BenchList`, and `SeatControls` children so the dialog manages draft state while children focus on presentation.
         - Move repeated style maps into `seatManagerStyles.js` (or similar) to reduce duplication and ease theming tweaks.
       - `CreateLobbyForm.jsx`
         - Wrap current sections with a `CreateLobbyLayout` shell and introduce reusable `CreateLobbyAdjuster` components for player/bot steppers.
         - Group the privacy toggle, helper copy, and password modal trigger inside a `CreateLobbyPrivacy` component to centralise the private lobby flow.
     - Verification plan:
       - After each extraction run `npm run lint`, `npm run test`, plus targeted suites (`tests/useLobbyActions.test.js`, `tests/useSeatManagerActions.test.js`, `tests/appFlow*.integration.test.js`).
       - Add shallow component tests where behaviour exists (e.g., `LobbyActionButton` handles disabled + active props) and refresh the Step 0 screenshot checklist once segmentation is complete.   - **Step 4 - Page Reassembly**: Rewire `CreateLobbyPage.jsx` and `LobbyView.jsx` to use the new modules, pruning obsolete state. Validate via integration tests and smoke the happy path in the browser; if regressions surface, roll back to Step 2.
     - ? 2025-10-20: Rebuilt `CreateLobbyPage.jsx` around the segmented form, adding an empty-state guard when no engines are registered. `LobbyView.jsx` already consumes the extracted modules; verified `npm run lint` / `npm run test` to lock the reassembly.
   - **Step 5 - Visual QA Prep**: Document Storybook/screenshot targets for the new component boundaries and note any remaining placeholder art. Flag open items in CODEx before handing off.
     - ? 2025-10-20: Logged visual QA targets � capture Create Lobby (public/private, password modal), Join Lobby list states, host vs guest lobby views, and seat manager dialog. Note placeholder icons/backdrops that still need production assets. Added reminder to spin up Storybook stories mirroring these states before Phase 6 polish.

2. **Testing & Tooling Enhancements (Ongoing Backbone)**
   - **Adapter-Aware Suites**: Parameterise critical tests to run against both `local` and `mock` photon adapters; document how to execute selective matrices.
   - **Automation Hardening**: Evaluate adding coverage thresholds or snapshot alerts to Vitest, and expand CI to surface timing regressions or flaky runs.
   - **Developer UX**: Capture the local workflow in `CONTRIBUTING` (if introduced) and ensure `npm run setup-hooks` remains the single entry point.

3. **Deployment Readiness & Sync (Upcoming)**
   - **Environment Checklist**: Finalise the staging vs production steps in `docs/deployment-checklist.md`, including Photon/Firebase switches and required secrets.
   - **Customization Sync Design**: Prototype how customization selections would persist to Firebase profiles, outlining security-rule updates and data models.
   - **Telemetry & Rollback**: Plan lightweight logging or feature flags for adapter swaps so production rollouts can be monitored and rolled back quickly.

---

## Phase 6 - Cosmetic Polish & Structural Refactors (Planned)

- **UI Polish**
  - Add the pending hub/lobby buttons (matchmaking, daily draw, etc.) with final copy and tooltip support.
  - Align component spacing, drop-shadow, and border radius tokens so panel/button treatments match across pages.
  - Replace placeholder illustrations & glyphs (seat manager avatars, modal icons) with production-ready assets.

- **Accessibility Copy & Microinteraction Pass**
  - Audit inline copy for clarity and voice consistency; introduce ARIA labels where hover-only text is currently used.
  - Layer in focus states and subtle motion for button hover/press, ensuring reduced-motion toggle bypasses transitions cleanly.

- **Structural Refactors**
  - Break down `CreateLobbyForm.jsx` and `LobbyView.jsx` into smaller child components (forms, tables, seat manager) to reduce 400+ line files.
  - Extract orchestration hooks from `AppStateContext.jsx` (service configuration sync, lobby loader, room actions) for testability and maintainability.
  - Split `CustomizationPanel.jsx` into preview + section modules once the UX is locked.

- **Visual Regression & Storybook**
  - Capture key states (login, lobby ready/not-ready, customization panel variants) in screenshots/storybook stories.
  - Wire Vite/Storybook (or Chromatic) to help catch regressions during future cosmetic passes.

- **QA Sign-off**
  - Run a final manual checklist covering both accessibility toggles (keyboard, high contrast, reduced motion) and responsive breakpoints.
  - Document test accounts, staging URLs, and any manual cleanup steps for QA in README or a new `docs/qa-checklist.md`.

## Reminders for Next Agent
- Prefer importing the new hooks (`useTheme`, `useCustomization`, `useAppState`) over direct context usage.
- Customization utilities now live in `customizationState.js`; extend registries via that module rather than reintroducing helpers in context files.
- Keep README roadmap headings in plain ASCII to avoid the mojibake regression we just fixed.
- GitHub Actions now runs lint/test on pushes and PRs; use `npm run lint` / `npm run test` locally (or `npm run setup-hooks` to keep git hooks synced) before opening requests.

---

## Historical Reference (Pre-2025-10-17)

### Current Focus
- Prepare Phase 5 (Customization UI & Deployment Readiness) to expose player-facing theme controls and document launch paths.
- Extend customization tokens so assets (cards, tables, pieces) can be swapped independently or as themed bundles.
- Draft the staging vs production config checklist prior to wiring CI.

### Completed (Phase 1 - Mock & Service Hardening)
- Expanded `sessionService`/`photonService` mock adapters, added runtime adapter toggles, and persist developer choices locally.
- Reset app/session state cleanly whenever adapters change and exposed menu controls in `AppLayout` for quick switching.
- Updated `scripts/app-flow-smoke.mjs` to validate offline login + lobby + play with the hardened mocks.

### Completed (Phase 2 - Testing & Tooling)
- Added Vitest + Testing Library to the toolchain with `vitest.config.js` and `tests/setupTests.js`.
- Created reducer smoke tests for Crazy Eights and Hearts to guard lobby/start flows.
- Added a hook-level test for `useDefaultPlayerInteraction` ensuring turn-locking behaviour functions as expected.
- Wired `npm run test` / `npm run test:watch` scripts so the suite can join CI alongside lint/build.

### Completed (Phase 3 - Engine Extensibility)
- Introduced `resolveEngineModules` with defaults for lobby/table menus, profiles, and room metadata.
- Refactored `AppStateProvider`/`RoomPage` to consume modules, enabling per-engine overrides without touching global state.
- Added Hearts- and Crazy-Eights-specific module overrides to demonstrate custom side panels.
- Documented the module contract in `docs/game-engine-contract.md` and validated it with unit tests.

### Completed (Phase 4 - Dynamic Theming & Skins)
- Added a theme registry with Midnight Shift, Aurora Bloom, and Summit Dawn palettes plus semantic tokens for cards, tables, buttons, and overlays.
- Wrapped the app with `ThemeProvider`, persisted selections to `localStorage`, and surfaced developer toggles for adapters + themes.
- Refactored AppShell, AppLayout, TableLayout, GameBoard, and card-related components to consume live theme tokens.
- Documented theming usage in `docs/theming.md` and introduced Vitest coverage for ThemeContext behaviour.

### Upcoming Tasks (Legacy View)
1. Surface a player-facing customization panel in the hub that builds on ThemeProvider and the future CustomizationProvider.
2. Extend theme/customization tokens to secondary screens (login menus, lobby forms) and add accessibility-friendly variants.
3. Sync theme + skin selection with service/session profiles once Firebase integration lands.
4. Capture staging vs production deployment steps alongside environment variable documentation.

### In Progress (Phase 5 - Customization Foundations)
- Documented the customization system design in `docs/customization.md`, outlining registries, provider contract, and implementation roadmap.
- Implemented the customization registries, provider, and token hook; rewired card/table components to consume the new tokens.
- Built the hub customization panel with presets, per-category overrides, and accessibility toggles; added coverage in `tests/customizationProvider.test.jsx` + `tests/customizationPanel.test.jsx`.
- Authored `docs/deployment-checklist.md` to track staging vs production readiness tasks.
- Next: polish panel previews, extend customization to login/lobby screens, and connect selections with service profiles once Firebase integration lands.

### Notes
- Backend connectivity is still optional; keep every new module mock-friendly.
- Maintain reducer/bot contracts in `src/games/*` so future server authority swaps remain straightforward.
- Revisit this log before new sessions to confirm which items are complete or in progress.
- Master plan for future agents lives in this file; update statuses here after each phase.

### Master Plan (Next Phases)

1. **Customization & Skins**
   - Introduce a `CustomizationProvider` layered over ThemeProvider to manage palette + asset selections (themes, card skins, table felt, pieces).
   - Define skin registries for cards/tables/pieces/backgrounds so presets and mix-and-match options are possible.
   - Build a hub customization panel with live previews, presets, and per-category overrides.
   - Persist player selections locally and, later, via Firebase profiles.

2. **Testing & Tooling (Ongoing)**
   - Expand suites to cover new modules and customization flows, integrate coverage thresholds, and add CI recipes.
 
3. **Deployment Readiness**
   - Document environment variables, Firebase/Photon setup, and a pre-launch checklist once feature work stabilises.

### Customization Roadmap Notes
- **Theme Registry + Theme Packs**: Extend `src/ui/theme.js` entries with metadata and optional sections for cards/table/pieces/backgrounds. Allow engine-specific overrides (`themes[themeId].engines.hearts.cards`).
- **Asset Bundles & Skins**: Introduce an asset registry (e.g., `skins/`) describing card backs, felt textures, piece sets. Themes can reference these packs but players should eventually mix-and-match.
- **Customization Provider**: Add `CustomizationProvider` storing `{ themeId, cardSkinId, tableSkinId, pieceSkinId }`, persisting to localStorage (later Firebase). Expose `useCustomization()` hook alongside `useTheme()`.
- **Component Consumption**: Update card/table/piece components to read from the customization context, applying chosen assets and colors. Ensure future board games can register piece skins.
- **Engine Overrides**: Let engines supply optional customization hints via the existing module system (`resolveEngineModules`) so hearts/crazy eights can specify default skins or custom layout tweaks.
- **Player UI**: Build a hub "Customization" panel where users preview presets, edit individual categories, and save combinations (e.g., "Aurora theme + Retro Deck").
- **Data Model**: Define a serialisable `CustomizationConfig` (theme + skins) for storage/sync.
- **Docs**: Extend `docs/theming.md` or add `docs/customization.md` explaining theme/skin definitions, registries, and how to add new assets.

### Legacy Milestones

#### App/Foundation Work
- Introduced `AppStateProvider` and reorganised app phases into page components (`src/app/`).
- Extracted `usePhotonRoomState` and default interaction hooks into `src/hooks/` and wired them through context.
- Added `sessionService` abstraction for swapping Firebase with mock adapters.
- Created page components for Login, Hub, Create, Join, and Room while preserving existing UI.
- Implemented `AppLayout` wrapper to centralise shell logic ahead of future table redesigns.

#### Presentation & Engine Prep
- Added `photonService` adapter to wrap the local Photon client and prepare for remote authority swaps.
- Introduced `TableLayout` and updated Crazy Eights/Hearts tables to share the same presentation frame.
- Documented the engine contract in `docs/game-engine-contract.md` for future engine additions.

#### Theming Baseline
- Centralised theming tokens in `src/ui/theme.js` and migrated `AppShell` to reference them.
- Added `src/lib/config.js` so Firebase/session/Photon services read environment settings from one place.
- Created `scripts/app-flow-smoke.mjs` to simulate login + lobby + play using mock adapters.




















