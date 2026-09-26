# R1 — Reset and phone test ✅

**Completed:** 2026-09-26. The PWA is confirmed on the Pixel (`docs/validation/r1-phone-test.md`).

**Goal:** a clean v2 workspace, the app online over HTTPS and installed on the phone, and a go/no-go test of web audio and Azure on the Pixel. **Depends on:** —

> **ADR 002 (2026-09-26):** the owner chose no server. The Worker from T04 and the Cloudflare deploy from T06 were removed; the app is static files on GitHub Pages, and the owner types the Azure key on the phone. Commit `8fd3a99` holds the removed code.

### R1-T01: Retire v1 ✅
**Type:** docs/infra | **Effort:** S | **Priority:** high

#### What to Build
ADR 001. Move v1 docs to `docs/archive/v1/`. Write the v2 PRD, product design, technical design, API reference, data model and backlog. Delete the v1 code (`client/`, `server/`, `render.yaml`, v1 root `package.json` and `package-lock.json`, `.env.example`) **after the owner confirms**. Update `CLAUDE.md`, the agent instruction files and the session bootstrap scripts.

#### Acceptance Criteria
- [x] No v1 code remains; `docs/archive/v1/` holds the v1 docs
- [x] `CLAUDE.md` describes the v2 stack, commands and pre-commit checks

#### Testing Requirements
- None (no code).

**Completed (2026-09-25):** ADR 001; v2 PRD, product design, technical design, API reference, data model, deployment guide (parts 1–2), backlog R1–R11; v1 docs archived; CLAUDE.md, agent instructions and coding standards rewritten; v1 code deleted with the owner's approval.

### R1-T02: Workspace scaffold ✅
**Type:** infra | **Effort:** S | **Depends on:** R1-T01 | **Priority:** high

#### What to Build
Root `package.json` with npm 11 workspaces `apps/*` and `packages/*`, pinned `packageManager`. Shared strict `tsconfig.base.json`. ESLint flat config (typescript-eslint, react-hooks), warnings as errors. Root scripts: `typecheck`, `lint`, `test`, `build`, `dev`.

#### Acceptance Criteria
- [x] `npm install` with npm 11 succeeds from a clean clone
- [x] `npm run typecheck`, `npm run lint`, `npm test` and `npm run build` all pass

#### Testing Requirements (TDD — write these FIRST)
- Each workspace has at least one passing test

**Completed (2026-09-25):** npm 11 workspaces with `apps/worker` and `apps/pwa`; strict `tsconfig.base.json` (with `noUncheckedIndexedAccess`); ESLint 10 flat config with typescript-eslint `strictTypeChecked` (checked: it rejects `await` on a non-promise, v1's main bug) and React hooks rules. Worker: a small router, `GET /api/health`, JSON helpers, tests in the real `workerd` runtime (4 tests). PWA: Vite 8 + React 19 shell, phone-first base styles with dark mode (1 test). Versions: TypeScript 6.0 (typescript-eslint supports < 6.1), Vitest 4.1 (required by `@cloudflare/vitest-pool-workers` 0.22). The Worker's `compatibility_date` is 2026-08-20, because the test runtime supports dates up to 2026-08-22.

### R1-T03: Key scan and CI ✅
**Type:** infra | **Effort:** S | **Depends on:** R1-T02 | **Priority:** high

#### What to Build
`scripts/check-bundle-secrets.mjs` scans built files: fail on the key value (from `AZURE_SPEECH_KEY` if set), on the name `AZURE_SPEECH_KEY`, and, outside the Azure SDK chunk, on `fromSubscription` or `Ocp-Apim-Subscription-Key`. GitHub Actions CI: install, typecheck, lint, test, build, key scan.

#### Acceptance Criteria
- [x] The scan fails on each forbidden pattern and passes on a clean bundle
- [x] CI runs on every push

#### Testing Requirements (TDD — write these FIRST)
- KeyScan_KeyValueInBundle_Fails · KeyScan_EnvNameInBundle_Fails · KeyScan_SubscriptionHeaderInAppChunk_Fails · KeyScan_SubscriptionHeaderInSdkChunk_Passes · KeyScan_CleanBundle_Passes

**Completed (2026-09-25):** `tools/key-scan` (pure `scanFiles` + CLI `run`, 12 tests, runs on Node's built-in type stripping). Rules: key value (when `AZURE_SPEECH_KEY` is set; never printed), env name, subscription header (case-insensitive) and `fromSubscription` outside the `azure-speech-sdk-*` chunk. Exit 2 when the build folder is missing, so CI cannot pass a scan that did not run. `npm run scan:keys` scans `apps/pwa/dist`. CI (`.github/workflows/ci.yml`): npm 11, `npm ci`, typecheck, lint, test, build, key scan. **Note for R1-T07:** the PWA build must put the Azure SDK in a chunk named `azure-speech-sdk-*`.

### R1-T04: Worker API — health, pairing, speech token ✅ (removed by ADR 002)
**Type:** backend | **Effort:** M | **Depends on:** R1-T02 | **Priority:** high

#### What to Build
A Worker with `GET /api/health`, `POST /api/pair`, `DELETE /api/pair` and `POST /api/speech/token` (see `docs/archive/worker/api-reference.md`). D1 migration for `devices` and `rate_counters`. Pairing compares codes in constant time, stores only token hashes, caps active devices (default 2) and rate-limits failed attempts. The token endpoint calls Azure's `issueToken` with a timeout, and applies 30-an-hour and 200-a-day limits.

#### Acceptance Criteria
- [x] All status codes in `docs/archive/worker/api-reference.md` are covered by tests
- [x] The Azure key appears in no response and no log line

#### Testing Requirements (TDD — write these FIRST)
- Health_DbUp_Returns200 · Pair_ValidCode_ReturnsTokenAndStoresHashOnly · Pair_WrongCode_Returns401 · Pair_TooManyFailures_Returns429 · Pair_DeviceLimit_Returns403 · Token_NoAuth_Returns401 · Token_RevokedDevice_Returns401 · Token_Valid_ReturnsAzureTokenRegionExpiry · Token_OverHourlyLimit_Returns429 · Token_AzureFails_Returns502 · Token_AzureTimeout_Returns502

**Completed (2026-09-25):** 37 tests in the real `workerd` runtime with local D1 (migration `0001_init.sql`): the planned tests plus malformed bodies, pairing disabled for weak codes, revoked devices freeing slots, unpairing, daily limit, Azure network errors, and region validation. Azure's token endpoint is mocked with a `fetch` spy. D1 column renamed `window` → `bucket` (`window` is an SQL keyword). Known limit: two pairings at the same instant could exceed the device cap by one; acceptable for one user.

**Removed (2026-09-26, ADR 002):** the owner chose no server. The Worker, its D1 migration and its 37 tests are deleted; commit `8fd3a99` holds them. The API reference moved to `docs/archive/worker/`.

### R1-T05: PWA shell with Azure key setup ✅
**Type:** frontend | **Effort:** S | **Depends on:** R1-T04 | **Priority:** high

#### What to Build
Vite + React + TypeScript app with a web manifest and a service worker (installable on Android). ~~A Pair screen with server health~~ → since ADR 002, a "Connect to Azure" screen: key and region fields → checked and stored on the phone → "Azure key saved ✓".

#### Acceptance Criteria
- [x] Chrome on Android offers "Install app" — confirmed by the owner on the Pixel (2026-09-26)
- [x] The saved key survives an app restart

#### Testing Requirements (TDD — write these FIRST)
- ~~PairScreen_ValidCode_ShowsPaired · PairScreen_WrongCode_ShowsError · PairScreen_TokenStored_StartsPaired · HealthBadge_ServerDown_ShowsOffline~~ (ADR 002)
- Setup_ValidValues_SavesAndShowsMaskedKey · Setup_BadKey_ShowsKeyErrorAndSavesNothing · Setup_BadRegion_ShowsRegionError · Setup_SavedEarlier_StartsSavedWithTestLink · Setup_RemoveConfirmed_ClearsKey · Settings_StoredValue_*_IsIgnored · App_SpikeHash_ShowsPhoneTest

**Completed (2026-09-25):** 32 PWA tests (API client status mapping, device-token storage with blocked-storage fallback, Pair screen: success, wrong code, rate limit in minutes, device limit, offline, remembered pairing, unpair, offline unpair keeps the token; health badge online/degraded/offline). `vite-plugin-pwa` builds the manifest (standalone, portrait, 192/512 icons and a maskable icon) and a Workbox service worker that never serves `/api/*`. Icons are drawn by `apps/pwa/scripts/make_icons.py` (standard library only). Visual check in Chromium at 412×915 (light and dark, mocked API): layout and messages correct. The dev server proxies `/api` to the local Worker on port 8787.

**Changed (2026-09-26, ADR 002):** the Pair screen, health badge and API client are replaced by `components/AzureSetup.tsx` and `azureSettings.ts`. The key is checked (32–128 letters and digits), the region normalised ("UK South" → `uksouth`) and checked, and both stored in `localStorage` (`pc.azure`). The screen shows only the key's last 4 characters; removing the key asks first; blocked storage shows an error instead of a false "saved". Pages use the URL hash (`#/spike`). The phone test removes the key from error messages before it stores or reports them. 41 PWA tests. Checked in Chromium at 412×915 under `/Pronunciation-App/`: save, masked display, phone-test link, direct `#/spike` load.

### R1-T06: Deployment ✅
**Type:** infra | **Effort:** S | **Depends on:** R1-T05 | **Priority:** high

#### What to Build
~~`wrangler.jsonc` and a Cloudflare deploy workflow with repository secrets~~ → since ADR 002: a GitHub Pages workflow with no secrets. `docs/deployment-guide.md` with the owner's one-time steps: a Free F0 Azure Speech key, switch on Pages, merge to `master`, install on the phone, paste the key.

#### Acceptance Criteria
- [x] The owner can deploy from the GitHub web interface alone (2026-09-26: Pages switched on, pull request #1 merged, "Deploy to GitHub Pages" run #1 green in 52 s)
- [x] The Pixel installs the app over HTTPS and shows "Azure key saved ✓" (owner, 2026-09-26)

#### Testing Requirements
- The Pages workflow runs every check (type check, lint, tests, build, key scan) before it publishes

**Built (2026-09-25):** `wrangler.jsonc` serves `apps/pwa/dist` as assets (single-page-app fallback; `/api/*` runs the Worker first) with the D1 binding. `.github/workflows/deploy.yml` (manual): settings check → typecheck, lint, test, build, key scan → find or create D1 (Western Europe) and apply migrations → `wrangler deploy --secrets-file` (secrets file removed on exit) with the region as a variable → live `/api/health` check → address in the run summary. `tools/deploy` (18 tests) holds the pure helpers. The Worker's `build` is a Wrangler dry run, so CI checks the bundle and config. Local run of the real Worker (built app, local D1): health, `/` and app routes, manifest, pairing, unpairing and the speech-token config check all behaved as specified. Guide: `docs/deployment-guide.md` Part 3. ~~**Remaining:** the owner adds the GitHub secrets and runs the first deploy~~

**Changed (2026-09-26, ADR 002):** `apps/worker`, `tools/deploy` (18 tests) and `deploy.yml` are removed. `.github/workflows/pages.yml` runs on every push to `master` (and by hand): type check, lint, tests, build with `PC_BASE_PATH` from `actions/configure-pages`, key scan, then publish `apps/pwa/dist`. The build sets the manifest scope, service worker and worklet path to `/Pronunciation-App/`, and adds a content security policy (meta tag; scripts only from the app; network only to the app and Azure Speech). CI no longer reads an `AZURE_SPEECH_KEY` secret. Guide rewritten: 3 parts, about 15 minutes, no Cloudflare. ~~**Remaining:** the owner switches on Pages and merges the branch into `master`~~ — done 2026-09-26. Install on the Pixel confirmed by the owner the same day.

### R1-T07: Phone test spike (throwaway) ✅
**Type:** spike | **Effort:** M | **Depends on:** R1-T06 | **Priority:** high

#### What to Build
A hidden `/spike` page: open the mic with processing off and report the applied settings; capture through an AudioWorklet to 16 kHz WAV; ~~fetch a token~~ use the key saved on the phone (ADR 002); run Azure en-US pronunciation assessment (IPA, spoken phonemes, syllables, prosody) and fr-FR speech-to-text; run a 60-second continuous round; log latency; test wired and Bluetooth earbuds; download a JSON report. Save cleaned Azure JSON as test fixtures.

#### Acceptance Criteria
- [x] Report from the Pixel: applied mic settings, 50 attempts on Wi-Fi and mobile data, latency median ≤ 2.5 s and 90th percentile ≤ 5 s (V2). Earbud mic behaviour not run (optional; carried to R2)
- [x] Go or no-go for the PWA recorded in `docs/validation/r1-phone-test.md` — **go**

#### Testing Requirements
- WAV encoder and resampler unit tests in `packages/dsp` (the spike's only kept code)

**Built (2026-09-25):** `packages/dsp` (kept): band-limited resampler (Blackman-windowed sinc; tones above the new Nyquist attenuated by more than 40 dB; pitch and level kept), PCM16/WAV encoder, level measures — 20 tests with synthetic signals. Spike page `/spike` (lazy chunk): AudioWorklet capture with processing requested off and applied settings reported, resampling to 16 kHz, token from the Worker, Azure en-US pronunciation assessment (IPA, 5 "sounded like" candidates, prosody) and fr-FR assessment through the browser SDK (callbacks wrapped in a promise with a timeout; cancelled results become errors), a 60-second continuous round, per-attempt levels and latency, JSON report and WAV download. 8 tests for its pure parts. The SDK lands in the `azure-speech-sdk-*` chunk (369 KB); the main bundle is unchanged. Checked in Chromium with a fake microphone: capture, resampling (30 ms for 2 s), WAV output and the error path all behave as specified; Azure itself is unreachable from the build sandbox. **Changed (2026-09-26, ADR 002):** the page reads the key from `azureSettings` and calls `SpeechConfig.fromSubscription`; the worklet path follows the base path; the page lives at `#/spike`. Checked in Chromium with a fake microphone under `/Pronunciation-App/`: the SDK opened its WebSocket to `wss://uksouth.stt.speech.microsoft.com` with no content-security-policy block (the sandbox then refused the connection, as expected). The JSON report and WAV downloads work under the policy, and neither the stored attempts nor the report contain the key. A browser cannot see why Azure refused a WebSocket, so a wrong key also shows as `ConnectionFailure`; the page now hints to check the internet, then the key and region. **Remaining:** the owner's run on the Pixel, recorded in `docs/validation/r1-phone-test.md`, and Azure JSON fixtures from the report.

**Fixed (2026-09-26, first Pixel run):** the 60-second round failed with "Azure transcription timed out after 90000 ms". Cause: after the first 5 s of audio the SDK paces sending with timers from a web worker loaded from a `data:` URL, and the content security policy (`worker-src 'self'`) blocks it, so sending stopped at 5 s. Any take longer than 5 s was affected. Fix: `WebWorkerLoadType` = `off`, so the SDK uses the page's timers; the policy stays strict. Test first (`test/spike/azure.test.ts`, SDK mocked). Checked in Chromium against a fake Azure WebSocket (Playwright `routeWebSocket`): before the fix, 5.0 s of a 9 s take arrived and the page stayed on "Scoring…" with a CSP report; after it, a 20 s take, a full 60 s round (all 60 s sent in 28 s) and a 3 s sentence all completed, with no CSP reports.

**Completed (2026-09-26):** run 2 on the Pixel: 55 attempts, no errors. Latency median 0.87 s on Wi-Fi and 1.16 s on 4G (90th percentiles 1.14 s and 2.44 s). Mic processing off as requested. en-US gives IPA phonemes and prosody; fr-FR gives scores only, as expected. **Decision: PWA confirmed.** Open: earbud check (optional, carried to R2). Azure JSON fixtures: the owner approved them (2026-09-26); six sentence results (3 en-US, 3 fr-FR, request ids removed, no audio, no free talk) are in `apps/pwa/test/fixtures/azure/` with tests of `summarizeAzureJson`.
