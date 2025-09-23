# Photon Adapter Integration Plan

## Goals
- Support a production-ready Photon Realtime adapter alongside existing local/mock clients.
- Preserve compatibility with current reducers and engine contracts.
- Provide observable lifecycle states so the UI can react to connection issues.

## Event → Action Mapping
| Photon Event | Local Action | Notes |
| --- | --- | --- |
| room-created | `CREATE_ROOM` | Host receives initial snapshot. |
| room-joined | `loadRoom(snapshot)` | Snapshot merged through client loader. |
| player-updated | `SET_PLAYER_STATUS` / `TOGGLE_READY` | Normalised through reducer. |
| state-sync | `dispatch(snapshot)` | Replace local state when server pushes diff. |
| game-started | `START_GAME` | Guarded by reducer rules. |
| turn-played | `PLAY_CARD` | Payload mirrors reducer contract. |
| lobby-returned | `RETURN_TO_LOBBY` | Snapshot ensures lobby state. |

## Status Lifecycle
Adapters emit status updates via `subscribeStatus(listener)` with payload `{ status, error? }` where status is one of:
- `idle`
- `connecting`
- `connected`
- `error`
- `disconnected`

UI consumes this stream to drive connection banners, retries, and diagnostics.

## Implementation Checklist
1. Add status subscription support to local/mock clients (Phase 1).
2. Create `RealtimePhotonClient` that wraps the Photon SDK and translates events into reducer actions.
3. Feature-flag the adapter through `VITE_PHOTON_ADAPTER` and register a transport via `registerPhotonRealtimeTransport` during bootstrap.
4. Surface connection status in the UI so QA can see `connecting`/`connected`/`error` transitions.
5. Extend smoke scripts/integration tests to exercise realtime flows once SDK access is ready.

## Open Questions
- Token refresh cadence for Photon auth.
- Host migration guarantees when the original creator disconnects.
- Latency smoothing vs optimistic UI after the realtime adapter lands.
## Adapter Contracts

- `createGameEngine` now validates that both lobby and table modules expose a `Component` when supplied. Table components remain mandatory.
- `setPhotonAdapter` and `setSessionAdapter` throw when passed an unknown key, ensuring configuration errors surface immediately.
- When registering new engines via `registerGameEngine`, engine ids must be unique; duplication raises.
