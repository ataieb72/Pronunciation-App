# Coding Standards — Pronunciation Coach v2

Follow these standards for every code change. Project rules live in `CLAUDE.md`.

## Test-Driven Development (MANDATORY)

**Red → Green → Refactor** for every non-trivial change. Write the failing test first.

Testing priority:
1. Pure TypeScript in `packages/dsp` (audio) and `packages/core` (domain): synthetic signals, fake clocks, property tests.
2. Worker endpoints (`apps/worker`): Vitest in the real `workerd` runtime with local D1; external calls (Azure) mocked.
3. Scorer adapters: recorded Azure JSON fixtures; live calls only in `npm run test:live`, never in CI.
4. PWA hooks and components: Vitest + React Testing Library.

## Pre-Commit Verification (MANDATORY)

```bash
npm run typecheck && npm run lint && npm test && npm run build && npm run scan:keys
```

Lint warnings are errors. For audio or UI changes, also check on the phone (or Chrome with a fake microphone).

## Conventions

### Workspace
- npm 11 workspaces: `apps/pwa`, `apps/worker`, `packages/dsp`, `packages/core`.
- TypeScript strict mode everywhere. No `any`; for SDK interop, narrow with a typed wrapper.

### Worker (`apps/worker`)
- One small router; each route in its own module; pure helpers for crypto and rate limits.
- D1 through prepared statements. Migrations in `apps/worker/migrations/`.
- Secrets only through `env`. Never log a secret, a token, or a request body that may hold one.
- Every outbound fetch has a timeout.

### PWA (`apps/pwa`)
- Functional components + hooks. Local state, context where needed. No global store until needed.
- One API client module. The device token lives on the phone only.
- Audio code lives in `packages/dsp`; the PWA only wires it to browser APIs.

### Audio & Azure
- Audio is uncompressed 16 kHz mono PCM. Mic auto-gain, noise suppression and echo cancellation are requested off; the applied settings are stored.
- The Azure key never reaches the phone. The phone uses 10-minute tokens from `POST /api/speech/token`.
- Azure SDK results: compare reasons with SDK enums; wrap callback APIs correctly; set timeouts.
- Every score stores provider, locale, SDK version, era and device.

### Evidence
- User-facing claims and feedback rules must match `docs/research/` and `docs/redesign/elocution-focus.md`.
- Do not add tongue twisters, speed drills, non-speech mouth exercises, streaks, or a single "clarity score".
