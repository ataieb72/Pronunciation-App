# Pronunciation Coach v2 — Technical Design

**Version:** 2.0 · **Status:** approved (2026-09-25) · **Decision record:** `docs/adr/001-v2-rewrite.md` · **Detail:** `docs/redesign/design-options.md` §2.6–2.8, §6.9–6.13.

## 1. Architecture

```
PIXEL (installed PWA: React + TypeScript)                 CLOUDFLARE (one Worker)
+--------------------------------------------+   HTTPS   +------------------------------+
| UI: Pair, Today, Session, Check, Progress   |---------->| Static assets: the PWA       |
| packages/core: session builder, scheduler,  |           | /api/health                  |
|   target model, statistics (pure TS)        |           | /api/pair        (D1)        |
| packages/dsp: resampler, WAV, VAD, quality  |<----------| /api/speech/token (D1 + Azure)|
|   gate, level, fade, pitch, pauses (pure TS)|  10-min   | /api/backup/*   (R2, from R5) |
| Scorer: Azure JS SDK | Fixture scorer       |  token    +------------------------------+
| IndexedDB (Dexie): sessions, takes, audio   |                       |
+----------------------+---------------------+                        v
                       | WebSocket + token                 Azure token service
                       v                                   (key stays in the Worker)
      Azure Speech: en-US / fr-FR speech-to-text and pronunciation assessment
```

- **One Worker** serves the static PWA and the API from the same origin. There is no CORS to manage.
- **The Azure key lives only in a Worker secret.** The phone gets a 10-minute token and calls Azure directly through the browser SDK.
- **Phone-side measures** run in TypeScript, so they work offline and cost nothing.

## 2. Workspace

| Path | What | Added in |
|---|---|---|
| `apps/worker` | Cloudflare Worker: API + static asset serving. D1 migrations. | R1 |
| `apps/pwa` | Vite + React + TypeScript PWA | R1 |
| `packages/dsp` | Pure TypeScript audio code: resampler, WAV encoder, VAD, quality gate, measures | R1 (spike), R2 |
| `packages/core` | Pure TypeScript domain logic: sessions, scheduling, statistics | R3 |
| `tools/key-scan` | Bundle key scan (`npm run scan:keys`) | R1 |

- **npm 11** workspaces (`packageManager` is pinned). npm 10.9 fails on Vitest 4 peer dependencies.
- TypeScript 6.0 strict mode everywhere, with `noUncheckedIndexedAccess`. ESLint 10 with typescript-eslint `strictTypeChecked` (type-aware rules such as `await-thenable` and `no-floating-promises`); warnings are errors.
- Vitest 4.1 in every workspace (`@cloudflare/vitest-pool-workers` 0.22 requires Vitest 4.1).
- The Worker's `compatibility_date` must not be newer than the date the test runtime supports (2026-08-22 with pool-workers 0.22). Raise it when the pool package updates.

## 3. Audio pipeline (R2; a throwaway version in the R1 spike)

1. One AudioContext and one mic stream per session. Request `autoGainControl`, `noiseSuppression` and `echoCancellation` off; store the settings the phone actually applied.
2. An AudioWorklet posts frames; the app resamples to 16 kHz mono 16-bit PCM and keeps a 300 ms pre-roll.
3. VAD stops a take 0.8 s after speech ends. Caps: words 8 s, sentences 15 s, talk rounds 60 s.
4. Quality gate: clipping > 0.1%, peak < −35 dBFS, SNR < ~15 dB, or speech < 250 ms → retake. Test V3 tunes the thresholds.
5. WAV to IndexedDB with metadata (device, browser, applied settings, noise level, SNR).
6. Close tracks and the AudioContext at the end of the session.

## 4. Scoring and measures

| Measure | Computed by | Where |
|---|---|---|
| Level (relative), fade at phrase ends, articulation rate, pauses, pitch range | `packages/dsp` | Phone |
| Word timings | Azure speech-to-text (en-US, fr-FR) | Azure |
| Machine listener in noise | Phone mixes babble at a personal SNR; Azure speech-to-text counts keywords | Phone + Azure |
| English word endings, stress, vowel pairs | Azure en-US pronunciation assessment (IPA, spoken phonemes, syllables) + phone measures | Azure + phone |

- Every scorer sits behind one `SpeechScorer` interface. A `FixtureScorer` replays recorded results in tests.
- Azure SDK calls use callbacks or promise wrappers correctly, compare result reasons with SDK enums, and have timeouts. v1's bugs become named tests (R4).
- Scores store provider, locale, SDK version, model date ("era") and device.

## 5. Security

- Pairing: `POST /api/pair` with a code held as a Worker secret returns a random device token. D1 stores only its SHA-256 hash. Failed pairing attempts are rate-limited.
- `POST /api/speech/token` needs a device token. Limits: 30 an hour, 200 a day per device.
- The CI key scan (`tools/key-scan`) fails the build if a client file contains the key value or the name `AZURE_SPEECH_KEY`, or if app code calls `fromSubscription` or sets the subscription-key header. It skips the Azure SDK's own chunk (`azure-speech-sdk-*`, set by the PWA build), which contains that header name.

## 6. Testing (TDD)

| Layer | How |
|---|---|
| Worker | Vitest with `@cloudflare/vitest-pool-workers` (real `workerd` runtime, local D1). Azure's token endpoint is mocked. |
| PWA | Vitest + jsdom + React Testing Library |
| `packages/dsp`, `packages/core` | Vitest with synthetic signals, fake clocks, property tests |
| Key scan | Vitest over fixture bundles |
| Live Azure | `npm run test:live`, by hand only, never in CI (from R4) |
| On the phone | A manual checklist on the Pixel for every audio change |

## 7. Deployment

`apps/worker/wrangler.jsonc` defines the Worker, its static assets (`apps/pwa/dist`) and the D1 binding. Secrets: `AZURE_SPEECH_KEY`, `PAIRING_CODE`. Variable: `AZURE_SPEECH_REGION`. Steps: `docs/deployment-guide.md` (R1-T06).
