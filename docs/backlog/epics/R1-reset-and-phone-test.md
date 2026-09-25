# R1 — Reset and phone test

**Goal:** a clean v2 workspace, a deployed Worker that pairs the phone and issues Azure tokens, and a go/no-go test of web audio and Azure on the Pixel. **Depends on:** —

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

### R1-T04: Worker API — health, pairing, speech token ✅
**Type:** backend | **Effort:** M | **Depends on:** R1-T02 | **Priority:** high

#### What to Build
A Worker with `GET /api/health`, `POST /api/pair`, `DELETE /api/pair` and `POST /api/speech/token` (see `docs/api-reference.md`). D1 migration for `devices` and `rate_counters`. Pairing compares codes in constant time, stores only token hashes, caps active devices (default 2) and rate-limits failed attempts. The token endpoint calls Azure's `issueToken` with a timeout, and applies 30-an-hour and 200-a-day limits.

#### Acceptance Criteria
- [x] All status codes in `docs/api-reference.md` are covered by tests
- [x] The Azure key appears in no response and no log line

#### Testing Requirements (TDD — write these FIRST)
- Health_DbUp_Returns200 · Pair_ValidCode_ReturnsTokenAndStoresHashOnly · Pair_WrongCode_Returns401 · Pair_TooManyFailures_Returns429 · Pair_DeviceLimit_Returns403 · Token_NoAuth_Returns401 · Token_RevokedDevice_Returns401 · Token_Valid_ReturnsAzureTokenRegionExpiry · Token_OverHourlyLimit_Returns429 · Token_AzureFails_Returns502 · Token_AzureTimeout_Returns502

**Completed (2026-09-25):** 37 tests in the real `workerd` runtime with local D1 (migration `0001_init.sql`): the planned tests plus malformed bodies, pairing disabled for weak codes, revoked devices freeing slots, unpairing, daily limit, Azure network errors, and region validation. Azure's token endpoint is mocked with a `fetch` spy. D1 column renamed `window` → `bucket` (`window` is an SQL keyword). Known limit: two pairings at the same instant could exceed the device cap by one; acceptable for one user.

### R1-T05: PWA shell with pairing ✅
**Type:** frontend | **Effort:** S | **Depends on:** R1-T04 | **Priority:** high

#### What to Build
Vite + React + TypeScript app with a web manifest and a service worker (installable on Android). A Pair screen: code field → `POST /api/pair` → device token stored on the phone → "Paired ✓", plus server health.

#### Acceptance Criteria
- [ ] Chrome on Android offers "Install app" — checked on the Pixel after the first deploy (R1-T06)
- [x] Pairing survives an app restart

#### Testing Requirements (TDD — write these FIRST)
- PairScreen_ValidCode_ShowsPaired · PairScreen_WrongCode_ShowsError · PairScreen_TokenStored_StartsPaired · HealthBadge_ServerDown_ShowsOffline

**Completed (2026-09-25):** 32 PWA tests (API client status mapping, device-token storage with blocked-storage fallback, Pair screen: success, wrong code, rate limit in minutes, device limit, offline, remembered pairing, unpair, offline unpair keeps the token; health badge online/degraded/offline). `vite-plugin-pwa` builds the manifest (standalone, portrait, 192/512 icons and a maskable icon) and a Workbox service worker that never serves `/api/*`. Icons are drawn by `apps/pwa/scripts/make_icons.py` (standard library only). Visual check in Chromium at 412×915 (light and dark, mocked API): layout and messages correct. The dev server proxies `/api` to the local Worker on port 8787.

### R1-T06: Deployment 🔄 (waiting on the owner's first deploy)
**Type:** infra | **Effort:** S | **Depends on:** R1-T05 | **Priority:** high

#### What to Build
`wrangler.jsonc` (Worker, static assets from `apps/pwa/dist`, D1 binding). A deploy workflow in GitHub Actions (manual trigger) using repository secrets. `docs/deployment-guide.md` with the owner's one-time steps: Cloudflare account and API token, a new Azure Speech key (F0, EU region), secrets, first deploy, pairing.

#### Acceptance Criteria
- [ ] The owner can deploy from the GitHub web interface alone
- [ ] The Pixel installs the app over HTTPS and shows "Paired ✓"

#### Testing Requirements
- Deployed smoke check: `GET /api/health` returns 200

**Built (2026-09-25):** `wrangler.jsonc` serves `apps/pwa/dist` as assets (single-page-app fallback; `/api/*` runs the Worker first) with the D1 binding. `.github/workflows/deploy.yml` (manual): settings check → typecheck, lint, test, build, key scan → find or create D1 (Western Europe) and apply migrations → `wrangler deploy --secrets-file` (secrets file removed on exit) with the region as a variable → live `/api/health` check → address in the run summary. `tools/deploy` (18 tests) holds the pure helpers. The Worker's `build` is a Wrangler dry run, so CI checks the bundle and config. Local run of the real Worker (built app, local D1): health, `/` and app routes, manifest, pairing, unpairing and the speech-token config check all behaved as specified. Guide: `docs/deployment-guide.md` Part 3. **Remaining:** the owner adds the GitHub secrets and runs the first deploy; then the install check on the Pixel.

### R1-T07: Phone test spike (throwaway) ⬚
**Type:** spike | **Effort:** M | **Depends on:** R1-T06 | **Priority:** high

#### What to Build
A hidden `/spike` page: open the mic with processing off and report the applied settings; capture through an AudioWorklet to 16 kHz WAV; fetch a token; run Azure en-US pronunciation assessment (IPA, spoken phonemes, syllables, prosody) and fr-FR speech-to-text; run a 60-second continuous round; log latency; test wired and Bluetooth earbuds; download a JSON report. Save cleaned Azure JSON as test fixtures.

#### Acceptance Criteria
- [ ] Report from the Pixel: applied mic settings, 50 attempts on Wi-Fi and mobile data, latency median ≤ 2.5 s and 90th percentile ≤ 5 s (V2), earbud mic behaviour
- [ ] Go or no-go for the PWA recorded in `docs/validation/r1-phone-test.md`

#### Testing Requirements
- WAV encoder and resampler unit tests in `packages/dsp` (the spike's only kept code)
