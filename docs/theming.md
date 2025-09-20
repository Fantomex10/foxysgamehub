# Theming & Skins

The UI now consumes themes through `ThemeProvider` (`src/ui/ThemeContext.jsx`). Each theme is defined in `src/ui/theme.js` and exposes semantic tokens for surfaces, typography, buttons, cards, and table assets.

## Available Themes

| Id | Name | Notes |
| --- | --- | --- |
| `midnight` | Midnight Shift | Default palette with cool blues and emerald felt. |
| `aurora` | Aurora Bloom | Neon purple/pink variant suited for high-contrast tables. |
| `summit` | Summit Dawn | Teal/orange palette inspired by sunrise over alpine tables. |

## Usage

- Wrap the app in `<ThemeProvider>` (already wired in `src/App.jsx`).
- Components can read the active theme via `const { theme } = useTheme()`.
- Theme tokens include:
  - `theme.colors.*` for global surfaces and text
  - `theme.cards.*` for card face/back styling
  - `theme.table.*` for felt, highlight, and panel surfaces
  - `theme.buttons.*` for primary/subtle/ghost/icon button backgrounds
  - `theme.overlays.*` for modal scrims

Switching themes updates component styles automatically. The provider persists the last selection in `localStorage` under `fgb.theme`.

## Adding A Theme

1. Extend the `themes` map in `src/ui/theme.js` with a call to `createTheme(id, config)`.
2. Override only the tokens you need; unspecified values inherit from the base palette.
3. Ensure gradients or translucent colors use rgba for smooth fades.
4. Run `npm run test` to confirm the theming tests still pass.

## Developer Toggle

A developer-only toggle lives in the AppLayout side panel. Cycling this switch updates the active theme and persists it for future sessions.
