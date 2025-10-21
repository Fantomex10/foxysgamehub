# Foxy Game Hub (Workspace Snapshot)

Foxy Game Hub is an accessible multiplayer shell that can host multiple turn-based engines (currently Crazy Eights and Hearts). It ships with a mock photon adapter for local play, optional Firebase-backed identity, a fully tokenised theming/customisation stack, and React + Vite for rapid iteration.

---

## Current Capabilities

- **Game Engines**: Crazy Eights and Hearts, registered via `createGameEngine` with their reducers, lobby/table modules, and player-interaction hooks.
- **Session Layer**: Swappable adapters for authentication and realtime state. Defaults to Firebase for identity and a local in-memory photon client for table state; mock adapters remain available for offline use.
- **Customisation & Accessibility**:
  - `ThemeProvider` + `CustomizationProvider` supply palette, card/table/piece/backdrop skinning, and high-contrast / reduced-motion / large-text toggles.
  - A shared `scaleFont` helper drives all inline typography, ensuring large-text mode scales the hub, lobbies, and table UI consistently.
- **Shell & Layout**: `AppLayout` and `AppShell` orchestrate the responsive chrome (menus, profiles, breadcrumbs) while engine modules inject contextual menus, profile details, and room metadata.
- **Build Tooling**: Vite 7 with manual chunk splitting for `react-vendor`, `firebase`, and generic vendor bundles, keeping JS artifacts below the warning threshold.
- **Testing**: Vitest suites cover engine reducers, theme/customisation providers, and default interaction hooks (`tests/*`).

Recent improvements include:

- Reworked vendor chunk strategy (`vite.config.ts`) to silence the 500 kB warning.
- Large-text accessibility propagated across hub, lobby, and table components via the unified typography utility.
- Seat manager, join lobby list, and create lobby form now read the accessibility font scale from `useCustomizationTokens`.
- Accessibility toggles persist and update document classes reliably, and placeholder copy no longer renders garbled glyphs (suit icons, room codes, status banners now show human-friendly defaults).
- Login and lobby experiences now consume customization tokens and accessibility toggles, and the hub preview summarises active presets and pieces.
- Guest lobby creation flow now seeds offline display names and avoids redundant Photon reconnects, so Crazy Eights and Hearts lobbies launch instantly without the "Preparing lobby" hang.
- Lobby and Create Lobby experiences are refactored into modular sections (`PlayersSection`, `SpectatorSection`, `HostControls`, and the `CreateLobby*` helpers), keeping the feature set steady while we prepare for the cosmetic/UI overhaul.

---

## Future Work Roadmap

The following phased plan reflects the current priorities after the latest accessibility and copy polish. Tackle the phases in order; each builds on the previous work.

### Phase 1 - Clear Lint Debt
- Split helper logic out of component files flagged by `react-refresh/only-export-components` (e.g., `CustomizationContext`, `ThemeContext`, `AppStateContext`) to restore fast refresh hygiene.
- Resolve conditional hook usage and `useMemo` dependency warnings in `LobbyView`, `AppStateContext`, and `usePhotonRoomState`.
- Remove unused variables noted by ESLint (such as `targetThemeId`, `hasSuit`, `hasOnlyHearts`).
- **Success criteria**: `npm run lint` completes without warnings or errors.

### Phase 2 - Automation & Guardrails (Complete)
- GitHub Actions workflow `.github/workflows/ci.yml` runs lint and test suites on pushes and pull requests targeting `main`.
- Local git hook runner scripts live in `scripts/git-hooks`; install them via `npm run setup-hooks` to mirror CI before pushing.
- Documentation now outlines both CI and optional local guards. Set `SKIP_HOOKS=1` to bypass hooks temporarily (CI still runs).
- **Status**: lint and test jobs now execute automatically with contributor guidance captured below.

### Phase 3 - Broaden Verification & Polish (Complete)
- Added Vitest integration tests `tests/appFlow.integration.test.js` and `tests/appFlow.endGame.integration.test.js` to cover the login -> table journey and the finished-game return-to-lobby flow.
- README, docs, and in-app copy have been swept for stray mojibake, with fallback text standardised to ASCII (see Crazy Eights profile banner defaults).
- Regression checklist now includes `npm run lint`, `npm run test`, and `npm run build` before updating roadmap status.
- **Status**: Phase 3 is complete; subsequent phases build on the broader coverage and polished copy.

Optional follow-ups after Phase 3:
- Introduce a real photon network adapter (e.g., WebSocket backend) and gate it behind an env flag.
- Sync player customisation preferences to Firebase once remote storage stories are prioritised.

---

## Next Phases

### Phase 5 - Customization Foundations (Complete)
- Seat manager controls, lobby status toggles, and create/join modals now consume customization tokens end-to-end, respecting font scaling, high contrast, and reduced-motion preferences.
- Hub shell buttons and app layout actions disable hover/opacity transitions when reduced motion is enabled, and new Vitest suites cover status control scaling plus customization state sanitisation.
- `docs/customization.md` documents registry naming and preview conventions so future skins/backdrops and presets ship with consistent metadata and accessible color tokens.

### Phase 6 - Cosmetic Polish & Structural Refactors
- **Step 0 – Guard the Baseline**: Capture screenshots of current create/join flows, verify `npm run lint`, `npm run test`, `npm run build`, and note any known quirks. Treat this as the rollback point if structural work has to pause.
- **Step 1 – Responsibility Map**: Audit `CreateLobbyForm.jsx` and `LobbyView.jsx`, documenting state ownership, validation, modal management, seat/status wiring, and customization hooks. Log uncovered responsibilities in CODEx before editing.
- **Step 2 – Extract Logic Hooks**: Move reusable logic into hooks/utilities (e.g., `useCreateLobbyConfig`, `useLobbySeatManager`, `useLobbyStatusActions`) with accompanying unit tests so pages can re-import them without JSX churn.
- **Step 3 – Slice UI Components**: Lift JSX sections into focused components under `src/components/lobby/` (`CreateLobbyBasics`, `BotStepper`, `LobbyHeader`, `SeatingPanel`). Ensure props carry customization tokens/accessibility flags.
- **Step 4 – Reassemble Pages**: Rewire `CreateLobbyPage.jsx` and `LobbyView.jsx` using the new modules, prune redundant state, and keep service orchestration thin. Run integration flows after each milestone.
- **Step 5 – Visual QA & Follow-up**: List Storybook/screenshot targets, identify any placeholder art/tooltips that still need real assets, and update CODEx/README with the new module layout before moving to wider cosmetic polish.

---

## Development Quick Start

```bash
npm install

# Launch the mock stack (local photon + mock session storage)
npm run dev

# Production build
npm run build

# Run tests
npm run test
```

## Continuous Integration

- GitHub Actions workflow `.github/workflows/ci.yml` runs on pushes and pull requests for `main`.
- The pipeline executes `npm ci`, `npm run lint`, and `npm run test` so CI mirrors the local quality bar.
- Run `npm run lint` and `npm run test` locally before opening PRs to stay aligned with CI results.
- Install local git hooks with `npm run setup-hooks` to run lint on commit and lint/tests on push. Skip locally with `SKIP_HOOKS=1` if required (CI remains authoritative).
- Hook scripts live in `scripts/git-hooks` should you need to adjust the commands.

### Environment Variables

Create an `.env.local` (ignored by git) if you plan to use Firebase-based auth/profile sync:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

If these values are absent the session layer falls back to the mock adapter, allowing offline development. You can also override adapters explicitly:

```
VITE_SESSION_ADAPTER=mock   # or firebase
VITE_PHOTON_ADAPTER=local   # or another adapter once added
```

### Adapter Modes

The shell supports two development modes:

- **Mock (default)**: run `npm run dev` without Firebase environment variables. The session layer falls back to the mock adapter and the photon client uses the local in-memory implementation. Optionally pin this configuration by setting `VITE_SESSION_ADAPTER=mock` and `VITE_PHOTON_ADAPTER=local` in `.env.local`.
- **Firebase-backed**: populate the variables above and set `VITE_SESSION_ADAPTER=firebase`. Keep `VITE_PHOTON_ADAPTER=local` unless you have deployed a compatible remote adapter. Sign-in flows then use Firebase Auth while gameplay state continues to run locally.

Restart Vite after changing adapter environment variables so the selection is reloaded.

---

## Repository Layout

- `src/app` - Top-level pages, shared layout, and app state context.
- `src/components` - Visual building blocks (hub menus, lobby widgets, table UIs) plus the seat manager dialog (`components/lobby`).
- `src/customization` - Registries and provider powering player themes/skins/backdrops/accessibility.
- `src/games` - Engine definitions, reducers, bots, and engine-specific UI.
- `src/services` - Session/photon adapters and Firebase client glue.
- `src/ui` - Theme registry, typography helpers, and provider wrappers.
- `tests` - Vitest suites covering reducers, providers, and hooks.

---

## Progress Log Snapshot (Oct 2025)
- Manual chunk splitting introduced to maintain sub-500 kB bundles.
- Accessibility font scaling unified through `src/ui/typography.js`.
- Hub, lobby, and table panels consume `useCustomizationTokens` for consistent large-text behaviour.
- README refreshed with the current feature overview, roadmap, and placeholder/accessibility fixes (this change).

### Lint Debt Session (17 Oct 2025)
- Started with Phase 1 of the lint roadmap outstanding (contexts exporting helpers, hook dependency warnings, README mojibake).
- Split non-component exports into dedicated modules (`themeContext.js`, `useTheme.js`, `customizationContext.js`, `customizationState.js`, `useCustomization.js`, `appStateContext.js`, `useAppState.js`) and resolved the remaining eslint violations.
- Normalised memo dependencies in `AppStateContext`, `LobbyView`, and `usePhotonRoomState`, and removed unused customization/hearts helpers.
- Verified `npm run lint` and `npm run build` succeed; Phase 1 is complete. Next contributors should pick up Phase 2 (CI lint/test automation) and Phase 3 (integration test + documentation polish).

For a deeper design discussion around customisation, see `docs/customization.md`. The theming notes live in `docs/theming.md`.

---

Maintained with care by the Foxy Game Hub contributors. Feel free to open issues or PRs to continue the roadmap above.




