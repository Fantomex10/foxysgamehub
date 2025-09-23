# Foxy's Game Hub

Multiplayer card-table experiments powered by Vite + React. The app ships with local/mock adapters for development and can swap to Firebase/Photon services when credentials are supplied.

## Getting Started

```bash
npm install
npm run dev
```

The dev server defaults to mock adapters so you can create lobbies, play through a round, and exercise customization flows without external services.

## Project Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start Vite in development mode. |
| `npm run build` | Produce the production bundle in `dist/`. |
| `npm run preview` | Serve the built bundle locally. |
| `npm run lint` | Lint the codebase with ESLint. |
| `npm run test` | Execute the Vitest suite once. |
| `npm run test:watch` | Run Vitest in watch mode. |
| `npm run validate:env` | Check for missing Firebase/Photon configuration keys. |
| `npm run validate` | Run lint, tests, and build in sequence (pre-flight for releases). |

## Environment Variables

Create a `.env` file (see `.env.example` when available) or export variables in your shell.

| Key | When Required | Purpose |
| --- | --- | --- |
| `VITE_SESSION_ADAPTER` | always | `firebase` (default) or `mock`. Switch to `mock` for offline testing. |
| `VITE_PHOTON_ADAPTER` | always | `local` (default) or `realtime`. Realtime requires Photon credentials. |
| `VITE_FIREBASE_API_KEY` | `VITE_SESSION_ADAPTER=firebase` | Firebase Web API key. |
| `VITE_FIREBASE_AUTH_DOMAIN` | `VITE_SESSION_ADAPTER=firebase` | Firebase auth domain. |
| `VITE_FIREBASE_PROJECT_ID` | `VITE_SESSION_ADAPTER=firebase` | Firebase project id. |
| `VITE_FIREBASE_APP_ID` | `VITE_SESSION_ADAPTER=firebase` | Firebase application id. |
| `VITE_FIREBASE_STORAGE_BUCKET` | optional | Storage bucket for future uploads. |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | optional | Messaging sender id, used for analytics. |
| `VITE_FIREBASE_MEASUREMENT_ID` | optional | Measurement id for analytics. |
| `VITE_PHOTON_APP_ID` | `VITE_PHOTON_ADAPTER=realtime` | Photon Realtime App ID. |
| `VITE_PHOTON_REGION` | `VITE_PHOTON_ADAPTER=realtime` | Photon region (e.g. `us`). |
| `VITE_PHOTON_APP_VERSION` | optional (realtime) | Optional app/build version forwarded to the Photon transport. |

Running `npm run validate:env` will surface missing keys and suggest toggling mock adapters when appropriate.

## Deployment Checklist

The living launch checklist lives in [`docs/deployment-checklist.md`](./docs/deployment-checklist.md). It covers staging/production configuration, smoke tests, and rollback considerations.

## Useful Docs

- [`docs/customization.md`](./docs/customization.md) – customization provider design and registry conventions.
- [`docs/photon-adapter.md`](./docs/photon-adapter.md) – realtime adapter plan and event mapping.
- [`docs/game-engine-contract.md`](./docs/game-engine-contract.md) – engine integration guide.

## Contributing

1. Validate the environment with `npm run validate:env`.
2. Run the full validation pipeline via `npm run validate` before sending PRs.
3. Update `CODEx_UPDATE.md` after landing notable changes so the next session picks up the correct status.
