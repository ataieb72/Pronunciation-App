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

### R1-T02: Workspace scaffold ⬚
**Type:** infra | **Effort:** S | **Depends on:** R1-T01 | **Priority:** high

#### What to Build
Root `package.json` with npm 11 workspaces `apps/*` and `packages/*`, pinned `packageManager`. Shared strict `tsconfig.base.json`. ESLint flat config (typescript-eslint, react-hooks), warnings as errors. Root scripts: `typecheck`, `lint`, `test`, `build`, `dev`.

#### Acceptance Criteria
- [ ] `npm install` with npm 11 succeeds from a clean clone
- [ ] `npm run typecheck`, `npm run lint`, `npm test` and `npm run build` all pass

#### Testing Requirements (TDD — write these FIRST)
- Each workspace has at least one passing test

### R1-T03: Key scan and CI ⬚
**Type:** infra | **Effort:** S | **Depends on:** R1-T02 | **Priority:** high

#### What to Build
`scripts/check-bundle-secrets.mjs` scans built files: fail on the key value (from `AZURE_SPEECH_KEY` if set), on the name `AZURE_SPEECH_KEY`, and, outside the Azure SDK chunk, on `fromSubscription` or `Ocp-Apim-Subscription-Key`. GitHub Actions CI: install, typecheck, lint, test, build, key scan.

#### Acceptance Criteria
- [ ] The scan fails on each forbidden pattern and passes on a clean bundle
- [ ] CI runs on every push

#### Testing Requirements (TDD — write these FIRST)
- KeyScan_KeyValueInBundle_Fails · KeyScan_EnvNameInBundle_Fails · KeyScan_SubscriptionHeaderInAppChunk_Fails · KeyScan_SubscriptionHeaderInSdkChunk_Passes · KeyScan_CleanBundle_Passes

### R1-T04: Worker API — health, pairing, speech token ⬚
**Type:** backend | **Effort:** M | **Depends on:** R1-T02 | **Priority:** high

#### What to Build
A Worker with `GET /api/health`, `POST /api/pair`, `DELETE /api/pair` and `POST /api/speech/token` (see `docs/api-reference.md`). D1 migration for `devices` and `rate_counters`. Pairing compares codes in constant time, stores only token hashes, caps active devices (default 2) and rate-limits failed attempts. The token endpoint calls Azure's `issueToken` with a timeout, and applies 30-an-hour and 200-a-day limits.

#### Acceptance Criteria
- [ ] All status codes in `docs/api-reference.md` are covered by tests
- [ ] The Azure key appears in no response and no log line

#### Testing Requirements (TDD — write these FIRST)
- Health_DbUp_Returns200 · Pair_ValidCode_ReturnsTokenAndStoresHashOnly · Pair_WrongCode_Returns401 · Pair_TooManyFailures_Returns429 · Pair_DeviceLimit_Returns403 · Token_NoAuth_Returns401 · Token_RevokedDevice_Returns401 · Token_Valid_ReturnsAzureTokenRegionExpiry · Token_OverHourlyLimit_Returns429 · Token_AzureFails_Returns502 · Token_AzureTimeout_Returns502

### R1-T05: PWA shell with pairing ⬚
**Type:** frontend | **Effort:** S | **Depends on:** R1-T04 | **Priority:** high

#### What to Build
Vite + React + TypeScript app with a web manifest and a service worker (installable on Android). A Pair screen: code field → `POST /api/pair` → device token stored on the phone → "Paired ✓", plus server health.

#### Acceptance Criteria
- [ ] Chrome on Android offers "Install app"
- [ ] Pairing survives an app restart

#### Testing Requirements (TDD — write these FIRST)
- PairScreen_ValidCode_ShowsPaired · PairScreen_WrongCode_ShowsError · PairScreen_TokenStored_StartsPaired · HealthBadge_ServerDown_ShowsOffline

### R1-T06: Deployment ⬚
**Type:** infra | **Effort:** S | **Depends on:** R1-T05 | **Priority:** high

#### What to Build
`wrangler.jsonc` (Worker, static assets from `apps/pwa/dist`, D1 binding). A deploy workflow in GitHub Actions (manual trigger) using repository secrets. `docs/deployment-guide.md` with the owner's one-time steps: Cloudflare account and API token, a new Azure Speech key (F0, EU region), secrets, first deploy, pairing.

#### Acceptance Criteria
- [ ] The owner can deploy from the GitHub web interface alone
- [ ] The Pixel installs the app over HTTPS and shows "Paired ✓"

#### Testing Requirements
- Deployed smoke check: `GET /api/health` returns 200

### R1-T07: Phone test spike (throwaway) ⬚
**Type:** spike | **Effort:** M | **Depends on:** R1-T06 | **Priority:** high

#### What to Build
A hidden `/spike` page: open the mic with processing off and report the applied settings; capture through an AudioWorklet to 16 kHz WAV; fetch a token; run Azure en-US pronunciation assessment (IPA, spoken phonemes, syllables, prosody) and fr-FR speech-to-text; run a 60-second continuous round; log latency; test wired and Bluetooth earbuds; download a JSON report. Save cleaned Azure JSON as test fixtures.

#### Acceptance Criteria
- [ ] Report from the Pixel: applied mic settings, 50 attempts on Wi-Fi and mobile data, latency median ≤ 2.5 s and 90th percentile ≤ 5 s (V2), earbud mic behaviour
- [ ] Go or no-go for the PWA recorded in `docs/validation/r1-phone-test.md`

#### Testing Requirements
- WAV encoder and resampler unit tests in `packages/dsp` (the spike's only kept code)
