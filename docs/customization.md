# Customization System Design

## Phase Context
The project is entering **Phase 5 – Customization UI & Deployment Readiness**. This document captures the foundational design for player-facing customization before implementation begins.

## Goals
- Let players select a theme palette alongside individual skin categories (cards, tables, pieces, backdrops).
- Support preset bundles so players can apply curated combinations quickly.
- Keep the system mock-friendly and engine-agnostic, mirroring the existing theming setup.
- Persist selections locally and prepare for future profile sync via Firebase.
- Provide accessibility toggles (e.g., high contrast, large text) that can piggyback on the same context.

## Non-Goals (for this phase)
- Creating or shipping new art assets.
- Wiring Firebase profile sync or remote storage.
- Finalizing CI deployment scripts (handled later in Phase 5).

## Architecture Overview
```
<App>
  <ThemeProvider>
    <CustomizationProvider>
      {application}
    </CustomizationProvider>
  </ThemeProvider>
</App>
```
- `ThemeProvider` keeps the existing palette registry and persists `themeId`.
- `CustomizationProvider` layers on top, owning the rest of the customization state. When `themeId` changes through customization, it delegates to `ThemeProvider`.
- Consumers can call `useCustomization()` to read/update state and `useCustomizationTokens()` (helper hook) to resolve merged tokens for UI components.

## Data Model
### Core State
```ts
export type CustomizationState = {
  themeId: string;
  presetId: string | null;
  cardSkinId: string;
  tableSkinId: string;
  pieceSkinId: string;
  backdropId: string;
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
    largeText: boolean;
  };
};
```
- Defaults derive from registries (see below) and align with existing theme defaults.
- `presetId` tracks the last applied bundle. Selecting an individual skin clears `presetId` so we know the player is in "custom" mode.
- Entitlements are tracked separately via `unlocks: string[]`; items without an entitlement entry are always available.

### Registries
Files under `src/customization/` will describe available options:
- `src/customization/presets.js` – curated combinations with labels, preview metadata, and references to IDs in other registries.
- `src/customization/skins/cards.js` – card back/front tokens (colors, texture URLs, optional SVG assets).
- `src/customization/skins/table.js` – felt textures, rail accents, chip colors.
- `src/customization/skins/pieces.js` – avatars/tokens for future board pieces.
- `src/customization/backdrops.js` – shell/background imagery or gradient definitions.

Registries are now powered by the shared `createRegistry` helper so content can be added or removed at runtime. Each module exports `register*`, `unregister*`, `list*`, and `get*ById` helpers plus `getDefault*Id` accessors. The core catalog is still seeded on boot, but feature modules (or engines) can layer in additional assets without touching shared files.

Example: registering a limited-time card back during feature initialization.

```ts
import { registerCardSkin } from '@/customization';

registerCardSkin({
  id: 'limited-nebula',
  name: 'Nebula Foil',
  description: 'Animated foil finish from the seasonal pass.',
  entitlement: { id: 'skin.cards.nebula', price: 1200, currency: 'chips' },
  tokens: {
    face: '#1b1035',
    back: '#7f5af0',
    accent: '#ff99dd',
    text: '#f8f9ff',
    border: 'rgba(127,90,240,0.55)',
  },
});
```

Premium entries still add an `entitlement` block so the provider can gate availability and pricing (for example `entitlement: { id: 'skin.cards.aurora', price: 450, currency: 'chips' }`).

The hub UI consumes categories registered via `src/customization/categoriesRegistry.js` so new sections (e.g., avatars, animations) can be added without editing the panel component. Each category contributes a `buildSection(context)` function that returns the props consumed by `OptionSection`.

### Linking Themes and Skins
Themes can provide optional recommendations without enforcing them:
```ts
// in src/ui/theme.js
createTheme('midnight', {
  name: 'Midnight Shift',
  customization: {
    suggestedPresetId: 'midnight-classic',
    suggestedCardSkinId: 'classic',
  },
});
```
- The customization provider reads these hints when applying a theme.
- Engine modules may offer overrides via `engine.customizationDefaults`; the provider sanitises those values and applies them when the engine becomes active.

## Provider Contract
```ts
const CustomizationContext = createContext({
  state: defaultCustomizationState,
  unlocks: [] as string[],
  setThemeId: (id: string) => void,
  setCardSkin: (id: string) => void,
  setTableSkin: (id: string) => void,
  setPieceSkin: (id: string) => void,
  setBackdrop: (id: string) => void,
  toggleAccessibility: (flag: keyof AccessibilityFlags) => void,
  applyPreset: (presetId: string) => void,
  reset: () => void,
  hydrateFromProfile: (config: Partial<CustomizationState> & { unlocks?: string[] }) => void,
  unlockItem: (entitlementId: string) => void,
  unlockItems: (entitlementIds: string[]) => void,
  setSyncStatus: (status: SyncStatus, error?: Error) => void,
  syncState: { status: SyncStatus; error: Error | null },
});
```
- `setThemeId` delegates to `ThemeContext.setThemeId` to keep providers in sync.
- `applyPreset` updates all relevant IDs and stores `presetId`.
- `reset` returns to defaults (pulling from registries and the active theme suggestions).
- `unlockItem(s)` mutate the entitlement set once purchases or rewards complete.

### Persistence & Sync
- Local persistence mirrors the existing theme storage (`fgb.customization`).
- Remote persistence (when the session adapter is Firebase) stores the payload at `players/{uid}/settings/customization` with a server `updatedAt` timestamp.
- `AppStateProvider` hydrates the provider after auth and debounces writes via `sessionService.upsertCustomizationConfig()`.
- Sync status is exposed through `syncState` (`idle`, `syncing`, `synced`, `offline`, `error`) so UI surfaces can show progress and failures.
- When the theme registry changes (IDs removed), the provider falls back to defaults gracefully before persisting.
- Unlock arrays travel alongside the state so premium ownership is rehydrated consistently across devices.

### Helper Hooks
- `useCustomization()` – primary API returning `{ state, actions }`.
- `useCustomizationTokens()` – merges theme tokens with skin tokens for components that need a single resolved object (`{ theme, cards, table, pieces, backdrop, accessibility }`).
- `useCustomization()` also exposes `unlocks`, `unlockItem`, and `unlockItems` for monetisation flows.

## UI Integration Targets
- `Card`, `Hand`, `DrawPile`, `DiscardPile`, and `TableLayout` will consume tokens via `useCustomizationTokens()` rather than hardcoding `theme.cards`.
- `AppShell` and `HubMenu` will apply backdrop or shell-level tweaks (e.g., backgrounds from `backdropId`).
- Login and lobby screens will use accessibility flags (large text, high contrast once available).
- The customization panel surfaces entitlement status and unlock CTAs for premium content.

## Testing Strategy
- Add unit tests for `CustomizationProvider` covering defaults, persistence, preset application, and delegation to `ThemeContext`.
- Snapshot or DOM-based tests for the customization panel once built, ensuring buttons flip state and tokens propagate.

## Open Questions & Future Hooks
- Piece skins may not have consumers yet; keep registry but gate UI until pieces exist.
- Accessibility flags need UX follow-up; start with toggles that can drive CSS classes (e.g., `data-large-text`).
- Firebase sync will wrap `CustomizationProvider` once backend stories land; design keeps state serialisable for that future phase.

## Implementation Roadmap
1. **Phase 1 (Design & Foundations)** – This document, finalize data model, confirm registry layout (✅ once this doc lands).
2. **Phase 2 (Provider & Tokens)** – Implement provider, registries, and helper hooks; migrate core components to consume customization tokens.
3. **Phase 3 (Player UI & Docs)** – Build customization hub panel, expand tests, update docs + CODEx, prepare staging vs production checklist.
4. **Phase 4 (Monetisation Readiness)** – Annotate registries with entitlements, persist unlocks, surface locked states/CTAs in the UI.

## Hub Customization Panel

The Hub page now renders a player-facing customization panel adjacent to the main menu. It exposes:

- **Presets** – Applies curated combinations of theme, cards, table, pieces, and backdrop in one tap.
- **Theme selection** – Cycles palette-only changes while keeping the other selections intact.
- **Per-category overrides** – Lets players pick card backs, felt, piece skins, and backdrops independently.
- **Accessibility toggles** – High contrast, reduced motion, and large text flags persisted alongside other selections.
- **Preview** – Shows a mini shell preview reflecting the current mix, so visual choices update instantly.

Selections persist locally through `CustomizationProvider`; resetting reverts to the active theme’s suggested bundle.
