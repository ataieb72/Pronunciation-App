# Changelog

## [Unreleased] — v2

### Added
- Evidence base in `docs/research/`: source-checked literature review, learner-profile addendum, and a note on mumbling.
- v2 design in `docs/redesign/`: three options from a judge panel, and the owner's accepted elocution-first revision (Option B).
- ADR 001: rewrite as an elocution-first phone app.
- v2 docs: PRD, product design, technical design, API reference, data model, backlog R1–R11.

- R1: v2 workspace (npm 11, TypeScript 6, ESLint 10 strict type-checked), bundle key scan and CI, installable PWA shell, phone test page (`#/spike`) and `packages/dsp` (resampler, WAV encoder, level measures).
- ADR 002: no server. The app deploys to GitHub Pages on every push to `master`. The owner types the Azure key and region once on the phone ("Connect to Azure" screen). A content security policy limits the page to itself and Azure Speech.

- R1 done (2026-09-26): phone test on the Pixel confirms the PWA (latency median 0.87 s on Wi-Fi and 1.16 s on 4G). Real Azure results for six test sentences saved as test fixtures, with the owner's approval.

- R2 audio core (2026-09-26): Praat golden fixtures (synthetic voices only); speech detection and a quality gate; Praat-style pitch, intensity, pauses, syllable nuclei and articulation rate, speech level and fade, all matching Praat on the golden set; recording that stops by itself, with Wake Lock and a discard on a hidden page; takes saved on the phone (Dexie); a record-and-replay screen with plain verdicts, test readings (not scores), a distance note, replay, download and a ZIP of all takes.

- R2 done (2026-09-26). The owner-voice check (R2-T08) moves to R3 and runs on normal practice takes, with no separate test session.

- R3 started (2026-09-26): `packages/core` with everyday sentence banks in English and French (40 practice and 8 held-out baseline sentences each, loaded with word endings), the block summary for clear-speech pairs, the language of the day, the session plan and the weekly target.
- R3 first practice (2026-09-26): the start page is now **Today** (language of the day, Start 10 or 5 minutes, week dots, practice days a week). Sessions: warm-up with the distance check, blocks of clear-speech pairs (usual, then big and clear with one cue), "Which would your listener catch better?", a block summary with the next cue, and a wrap. The first session in each language records the baseline. Takes store their session, sentence and role (database version 2); the ZIP file adds the sessions.

### Removed
- The R1 phone-test page (`#/spike`); its Azure code moved to `apps/pwa/src/azure/` for R4.

### Fixed
- Phone test: takes longer than 5 s (including the 60-second round) timed out, because the content security policy blocked the Speech SDK's timer worker. The SDK now uses the page's timers.

### Changed
- Focus moves from accent-style pronunciation to articulation and elocution in both languages, aimed at mumbling.
- v1 docs moved to `docs/archive/v1/`.

### Removed
- The Cloudflare Worker (pairing, speech tokens, D1), its deploy tools and workflow, and the pairing screen (ADR 002; last commit with them: `8fd3a99`).
- v1 code: `client/`, `server/`, `render.yaml`, v1 package files (last v1 commit: `20b075a`).

## v1 (retired)

### Added
- F3: Full Azure scoring + TTS loop (T01 assessment service, T02 TTS cache, T03 client wiring)
- End-to-end: record → upload → assess → scores + reference audio
- API client with tests (mocked fetch for error paths)

### Changed
- F3-T03: Wired full client loop in App (scores state, api layer, play ref)

## Previous
- F1 Scaffold complete (monorepo, SQLite, health)
- F2 Recording complete (WAV encoder, recorder hook + UI, upload)