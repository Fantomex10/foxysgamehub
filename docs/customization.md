# Customization System Design

## Phase Context
The project is entering **Phase 5 - Customization UI & Deployment Readiness**. This document captures the foundational design for player-facing customization before implementation begins.

## Goals
- Let players select a theme palette alongside individual skin categories (cards, tables, pieces, backdrops).
- Support preset bundles so players can apply curated combinations quickly.
- Keep the system mock-friendly and engine-agnostic, mirroring the existing theming setup.
- Persist selections locally and prepare for future profile sync via Firebase.
- Provide accessibility toggles (e.g., high contrast, large text) that can piggyback on the same context.

### Implementation Status (Oct 2025)
- Providers, registries, and helper hooks are live and power the hub customization panel.
- Accessibility toggles (`high contrast`, `large text`, `reduced motion`) propagate to root classes; large text now scales inline UI through the shared `scaleFont` helper (`src/ui/typography.js`).
- Hub, login, and table surfaces consume `useCustomizationTokens`, so future skin tweaks only require registry changes across the full onboarding flow.
- The hub customization preview now showcases cards, table felt, and token pieces with preset/accessibility summaries to make active selections glanceable.
- Remaining roadmap items are tracked in README (add table/support actions, polish placeholder strings, replace seat manager glyphs).

### Accessibility Effects
- `High contrast` now increases contrast in tokenized components and adds a `fgb-high-contrast` class to the document root.
- `Large text` scales inline typography in the lobby/table surfaces and bumps the global root font size.
- `Reduced motion` removes button/card transitions and applies a `fgb-reduced-motion` class for global animation suppression.

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

### Registries
Files under `src/customization/` describe the available options:
- `src/customization/presets.js` - curated combinations with labels, preview metadata, and references to IDs in other registries.
- `src/customization/skins/cards.js` - card back/front tokens (colors, texture URLs, optional SVG assets).
- `src/customization/skins/table.js` - felt textures, rail accents, chip colors.
- `src/customization/skins/pieces.js` - avatars/tokens for future board pieces.
- `src/customization/backdrops.js` - shell/backdrop imagery or gradient definitions.

Each registry entry sticks to plain objects so engines can extend them without React imports:
```ts
export const cardSkins = {
  classic: {
    id: 'classic',
    name: 'Classic Deck',
    description: 'Neutral face cards with midnight backs.',
    tokens: {
      face: '#1f2937',
      back: '#2563eb',
      accent: '#38bdf8',
      text: '#f8fafc',
      border: 'rgba(148,163,184,0.4)',
    },
  },
  retro: { /* ... */ },
};
```

### Registry Contribution Guidelines
- **IDs & Naming**: Keep IDs lowercase and `kebab-case` (e.g., `aurora-veil`). Pair each ID with a concise `name` and a single-sentence `description` so the customization panel surfaces readable copy.
- **Token Coverage**: Provide the full token set expected by the consumer. Cards should declare `face`, `back`, `accent`, `text`, and `border`; tables should ship `felt`, `border`, `highlight`, `panel`, and `text`; pieces should expose `primary`, `secondary`, and `highlight`; backdrops should define `background` and `overlay`. These keys drive the live preview tiles, so omit them only when the UI does not require the value.
- **Preview Contrast**: Favour high-contrast combinations. The hub preview renders text using your supplied `text` tokens, so target a minimum 4.5:1 contrast ratio against felt/backdrop colors to keep selections legible in both normal and high-contrast modes.
- **Asset Storage**: If a token references textures (`url(...)`), add assets under `public/assets/customization/` and include a solid or gradient fallback to avoid flashes while images load.
- **Preset Updates**: When introducing new registry entries, review `src/customization/presets.js` to decide whether an existing preset should adopt them or if a new preset is warranted. Keep preset IDs aligned with the default theme they showcase.
- **Documentation & Tests**: Update this guide and extend `tests/customizationProvider.test.jsx` whenever registry shapes change (new required keys, defaults, or migrations). Running `npm run test` ensures sanitisation keeps older localStorage payloads valid.
- **ASCII-Only Metadata**: Stick to ASCII for IDs and metadata to avoid reintroducing encoding issues in docs or UI copy.

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
- Engine modules may offer overrides via a new optional key (`engine.customizationDefaults`).

## Provider Contract
```ts
const CustomizationContext = createContext({
  state: defaultCustomizationState,
  setThemeId: (id: string) => void,
  setCardSkin: (id: string) => void,
  setTableSkin: (id: string) => void,
  setPieceSkin: (id: string) => void,
  setBackdrop: (id: string) => void,
  toggleAccessibility: (flag: keyof AccessibilityFlags) => void,
  applyPreset: (presetId: string) => void,
  reset: () => void,
});
```
- `setThemeId` delegates to `ThemeContext.setThemeId` to keep providers in sync.
- `applyPreset` updates all relevant IDs and stores `presetId`.
- `reset` returns to defaults (pulling from registries and the active theme suggestions).

### Storage
- Local persistence mirrors the existing theme storage (`fgb.customization`).
- Storage payload roughly matches `CustomizationState`.
- When the theme registry changes (IDs removed), the provider falls back to defaults gracefully.

### Helper Hooks
- `useCustomization()` - primary API returning `{ state, actions }`.
- `useCustomizationTokens()` - merges theme tokens with skin tokens for components that need a single resolved object (`{ theme, cards, table, pieces, backdrop, accessibility }`).

## UI Integration Targets
- `Card`, `Hand`, `DrawPile`, `DiscardPile`, and `TableLayout` will consume tokens via `useCustomizationTokens()` rather than hardcoding `theme.cards`.
- `AppShell` and `HubMenu` will apply backdrop or shell-level tweaks (e.g., backgrounds from `backdropId`).
- Login and lobby screens will use accessibility flags (large text, high contrast once available).

## Testing Strategy
- Add unit tests for `CustomizationProvider` covering defaults, persistence, preset application, and delegation to `ThemeContext`.
- Snapshot or DOM-based tests for the customization panel once built, ensuring buttons flip state and tokens propagate.

## Open Questions & Future Hooks
- Piece skins may not have consumers yet; keep registry but gate UI until pieces exist.
- Accessibility flags need UX follow-up; start with toggles that can drive CSS classes (e.g., `data-large-text`).
- Firebase sync will wrap `CustomizationProvider` once backend stories land; design keeps state serialisable for that future phase.

## Implementation Roadmap
1. **Phase 1 (Design & Foundations)** - Capture this document, finalize the data model, confirm the registry layout.
2. **Phase 2 (Provider & Tokens)** - Implement the provider, registries, and helper hooks; migrate core components to consume customization tokens.
3. **Phase 3 (Player UI & Docs)** - Build the customization hub panel, expand tests, update docs and CODEx, prepare the staging vs production checklist.

## Hub Customization Panel

The Hub page now renders a player-facing customization panel adjacent to the main menu. It exposes:

- **Presets** - Apply curated combinations of theme, cards, table, pieces, and backdrop in one tap.
- **Theme selection** - Cycle palette-only changes while keeping the other selections intact.
- **Per-category overrides** - Let players pick card backs, felt, piece skins, and backdrops independently.
- **Accessibility toggles** - Persist high contrast, reduced motion, and large text flags alongside other selections.
- **Preview** - Show a mini shell preview reflecting the current mix so visual choices update instantly.

Selections persist locally through `CustomizationProvider`; resetting reverts to the active theme's suggested bundle.








