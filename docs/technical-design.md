# Pronunciation Coach v2 — Technical Design

**Version:** 2.1 · **Status:** approved (2026-09-25); hosting changed by `docs/adr/002-no-server.md` (2026-09-26) · **Decision record:** `docs/adr/001-v2-rewrite.md` · **Detail:** `docs/redesign/design-options.md` §2.6–2.8, §6.9–6.13.

## 1. Architecture

```
PIXEL (installed PWA: React + TypeScript)                GITHUB PAGES (static files only)
+--------------------------------------------+  HTTPS   +------------------------------+
| UI: Connect to Azure, Today, Session,       |<---------| index.html, JS, CSS, icons,  |
|   Check, Progress                           |  once,   | service worker, manifest     |
| packages/core: session builder, scheduler,  |  then    +------------------------------+
|   target model, statistics (pure TS)        |  cached
| packages/dsp: resampler, WAV, VAD, quality  |
|   gate, level, fade, pitch, pauses (pure TS)|
| Scorer: Azure JS SDK | Fixture scorer       |
| localStorage: Azure key + region (pc.azure) |
| IndexedDB (Dexie): sessions, takes, audio   |
+----------------------+---------------------+
                       | WebSocket (WSS) with the key
                       v
      Azure Speech (Free F0): en-US / fr-FR speech-to-text and pronunciation assessment
```

- **No server** (`docs/adr/002-no-server.md`). GitHub Pages serves static files over HTTPS. The service worker caches them, so the app opens offline.
- **The owner types the Azure key and region once on the phone.** They stay in `localStorage` on that phone. The SDK sends the key only to Azure (`SpeechConfig.fromSubscription`).
- **Phone-side measures** run in TypeScript, so they work offline and cost nothing.
- **Pages use the URL hash** (`#/spike`), because GitHub Pages has no fallback for deep links.

## 2. Workspace

| Path | What | Added in |
|---|---|---|
| `apps/pwa` | Vite + React + TypeScript PWA | R1 |
| `packages/dsp` | Pure TypeScript audio code. Built: band-limited resampler, PCM16/WAV encoder and decoder, level measures, voice activity detection (streaming), quality gate, FFT, Praat-style pitch tracker, intensity, silences, syllable nuclei, pauses, articulation rate, speech level and fade at phrase ends (all checked against Praat) | R1, R2 |
| `packages/dsp/golden` | Praat reference: synthetic EN/FR test recordings (espeak-ng) and the values Praat measures on them (Parselmouth). Python, run by hand; outputs are committed | R2 |
| `packages/core` | Pure TypeScript domain logic: sessions, scheduling, statistics | R3 |
| `tools/key-scan` | Bundle key scan (`npm run scan:keys`) | R1 |

- **npm 11** workspaces (`packageManager` is pinned). npm 10.9 fails on Vitest 4 peer dependencies.
- TypeScript 6.0 strict mode everywhere, with `noUncheckedIndexedAccess`. ESLint 10 with typescript-eslint `strictTypeChecked` (type-aware rules such as `await-thenable` and `no-floating-promises`); warnings are errors.
- Vitest 4.1 in every workspace.
- The build reads `PC_BASE_PATH` for the app's folder (`/Pronunciation-App/` on GitHub Pages; `/` by default). The manifest's `start_url` and `scope`, the service worker and the worklet path follow it.

## 3. Audio pipeline (R2; code in `apps/pwa/src/audio/`)

1. One AudioContext and one mic stream per session (`microphone.ts`). Request `autoGainControl`, `noiseSuppression` and `echoCancellation` off; store the settings the phone actually applied.
2. An AudioWorklet posts batches of 1024 samples at the mic's rate. The speech detector runs on them directly, on the main thread (it needs only 10 ms frame energies). When the take ends, the app keeps the audio from 300 ms before the first speech and resamples it once to 16 kHz mono (`takeRecorder.ts`).
3. The detector stops a take 0.8 s after speech ends (4 s for talk rounds, where thinking pauses are normal). Caps: words 8 s, sentences 15 s, talk rounds 60 s. A sound held steady for more than about 3 s counts as background, because the detector follows the room's level; real speech dips between syllables. `takeController.ts` keeps the screen awake while recording and discards the take if the page is hidden.
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

- **The key:** the owner pastes it on the "Connect to Azure" screen. The app checks its form (32–128 letters and digits) and the region (a plain name such as `uksouth`, so a typo cannot send the key to another host), then stores both in `localStorage` (`pc.azure`). The screen shows only the last 4 characters. "Remove the key from this phone" deletes it.
- **Only Free F0.** F0 never bills and stops at 5 audio hours a month, so a leaked key cannot cost money. If the key leaks, regenerate it in the Azure portal.
- **Content security policy** (a meta tag, added in builds only): scripts, styles and images only from the app itself; network only to the app and Azure Speech (`*.api.cognitive.microsoft.com`, `*.stt.speech.microsoft.com`); no plug-ins. This limits where injected code could send the key.
- **The SDK's timer worker is off** (`PropertyId.WebWorkerLoadType` = `off`). The SDK loads it from a `data:` URL, which the policy blocks; without it, sending stalled after 5 s of audio. The SDK uses the page's timers instead, so keep the page open while a take is scored.
- **Known limits** (ADR 002): code running in the app can read the key; the Speech SDK puts the key in its WebSocket address (encrypted by WSS); every GitHub Pages project of the same owner shares the origin `https://<owner>.github.io` and its storage.
- **The key scan** (`tools/key-scan`) fails the build if a client file contains the key value (when `AZURE_SPEECH_KEY` is set in the shell) or the name `AZURE_SPEECH_KEY`, or if app code sets the subscription-key header. It skips the Azure SDK's own chunk (`azure-speech-sdk-*`, set by the PWA build), which contains that header name. App code may call `fromSubscription`: the key arrives at run time.

## 6. Testing (TDD)

| Layer | How |
|---|---|
| PWA | Vitest + jsdom + React Testing Library |
| `packages/dsp`, `packages/core` | Vitest with synthetic signals, fake clocks, property tests; golden fixtures checked against Praat (`packages/dsp/golden/`) |
| Key scan | Vitest over fixture bundles |
| Live Azure | `npm run test:live`, by hand only, never in CI (from R4) |
| On the phone | A manual checklist on the Pixel for every audio change |

## 7. Deployment

`.github/workflows/pages.yml` runs on every push to `master` and by hand ("Run workflow"). It runs the type check, lint, tests, build (with `PC_BASE_PATH` from `actions/configure-pages`) and key scan, then publishes `apps/pwa/dist` to GitHub Pages. No secrets. Address: `https://<owner>.github.io/<repository>/`. Steps: `docs/deployment-guide.md`.
