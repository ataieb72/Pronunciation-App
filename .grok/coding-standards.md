# Coding Standards — Pronunciation Coach v2

Follow these standards for every code change. Project rules live in `CLAUDE.md`.

## Test-Driven Development (MANDATORY)

**Red → Green → Refactor** for every non-trivial change. Write the failing test first.

Testing priority:
1. Pure TypeScript in `packages/dsp` (audio) and `packages/core` (domain): synthetic signals, fake clocks, property tests.
2. Scorer adapters: recorded Azure JSON fixtures; live calls only in `npm run test:live`, never in CI.
3. PWA hooks and components: Vitest + React Testing Library.

## Pre-Commit Verification (MANDATORY)

```bash
npm run typecheck && npm run lint && npm test && npm run build && npm run scan:keys
```

Lint warnings are errors. For audio or UI changes, also check on the phone (or Chrome with a fake microphone).

## Conventions

### Workspace
- npm 11 workspaces: `apps/pwa`, `packages/dsp`, `packages/core`, `tools/key-scan`. No server (`docs/adr/002-no-server.md`).
- TypeScript strict mode everywhere. No `any`; for SDK interop, narrow with a typed wrapper.

### PWA (`apps/pwa`)
- Functional components + hooks. Local state, context where needed. No global store until needed.
- Pages use the URL hash (`#/spike`); GitHub Pages has no deep-link fallback. Paths to public files use `import.meta.env.BASE_URL`.
- Every outbound call has a timeout.
- Audio code lives in `packages/dsp`; the PWA only wires it to browser APIs.

### Audio & Azure
- Audio is uncompressed 16 kHz mono PCM. Mic auto-gain, noise suppression and echo cancellation are requested off; the applied settings are stored.
- The Azure key comes only from `azureSettings` (typed by the owner on the phone). Never put a key in code, config, tests with real values, logs or error messages. Never widen the content security policy in `apps/pwa/vite.config.ts` beyond the app and Azure Speech.
- Azure SDK results: compare reasons with SDK enums; wrap callback APIs correctly; set timeouts.
- Every score stores provider, locale, SDK version, era and device.

### Evidence
- User-facing claims and feedback rules must match `docs/research/` and `docs/redesign/elocution-focus.md`.
- Do not add tongue twisters, speed drills, non-speech mouth exercises, streaks, or a single "clarity score".
