# Deferred UI Actions

This log tracks UI surface areas that are currently hidden because the underlying functionality has not shipped yet. Re-enable the relevant controls once their backing workflows exist.

- `AppLayout` default game menu (`src/app/components/AppLayout.jsx`): hidden entries for **Game options**, **Settings**, and **Support**. Restore by supplying concrete handlers through `menuSections` or reactivating the default section when the features are ready.
- Table tools in engine modules (`src/app/modules/engineModules.js`): **Table options** and **Support** only render when `roomActions.openTableOptions` / `roomActions.openSupport` are implemented.
- Lobby table configuration button (`src/components/LobbyView.jsx`): the **Table options** button now renders only when `onConfigureTable` is provided by the hosting page (`RoomPage`). Wire the prop to the real configuration workflow to surface the control again.

Update this list whenever additional UI placeholders are hidden or when the associated features ship.
