# Staging vs Production Checklist

This checklist captures the minimum steps needed to prepare the hub for staging and production launches. Update it as service integrations evolve.

## Shared Prerequisites
- `NODE_ENV` and Vite mode set appropriately (`development`, `staging`, or `production`).
- Firebase project + Photon configuration values available in `.env` (see `src/lib/config.js`).
- Mock adapters remain accessible so smoke tests can run without external services.
- `npm run validate:env` passes with no errors.
- `npm run build` completes without warnings; `npm run test` and `npm run lint` pass locally (or run them together with `npm run validate`).

## Staging Environment
- Configure Firebase staging credentials (`VITE_FIREBASE_*`) and Photon staging endpoint keys.
- Enable mock services as fallbacks by default; document how to switch to live adapters during QA.
- Seed staging data for default lobbies/profiles if required.
- Run `scripts/app-flow-smoke.mjs` against staging settings.
- Verify customization selections persist via localStorage across deploys.

## Production Environment
- Point Firebase/Photon settings at production resources with least-privilege API keys.
- Lock mock adapters behind developer toggles; default to live services.
- Review analytics/error logging integrations before launch.
- Confirm CDN or hosting bucket has caching rules for `dist/` output.
- Re-run smoke tests in production mode (`npm run build && npm run preview`).
- Prepare rollback plan and monitoring dashboards for launch day.

## Documentation & Handoff
- Update `CODEx_UPDATE.md` with the environment status after each deployment.
- Capture any secret rotation schedules or manual steps in the project wiki.
- Keep this checklist current as CI/CD automation is introduced.

### Realtime Photon (Staging)
- [ ] Provide Photon app credentials: `VITE_PHOTON_APP_ID`, `VITE_PHOTON_REGION`, and optionally `VITE_PHOTON_APP_VERSION` for build tracking.
- [ ] Register the realtime transport by calling `registerPhotonRealtimeTransport` with the Photon SDK transport factory.
- [ ] Confirm the realtime status banner reports **connected** throughout hub and room flows.
- [ ] Exercise a lobby + table flow to ensure the adapter toggles cleanly between realtime and local modes.
