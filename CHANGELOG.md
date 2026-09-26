# Changelog

## [Unreleased] — v2

### Added
- Evidence base in `docs/research/`: source-checked literature review, learner-profile addendum, and a note on mumbling.
- v2 design in `docs/redesign/`: three options from a judge panel, and the owner's accepted elocution-first revision (Option B).
- ADR 001: rewrite as an elocution-first phone app.
- v2 docs: PRD, product design, technical design, API reference, data model, backlog R1–R11.

- R1: v2 workspace (npm 11, TypeScript 6, ESLint 10 strict type-checked), bundle key scan and CI, installable PWA shell, phone test page (`#/spike`) and `packages/dsp` (resampler, WAV encoder, level measures).
- ADR 002: no server. The app deploys to GitHub Pages on every push to `master`. The owner types the Azure key and region once on the phone ("Connect to Azure" screen). A content security policy limits the page to itself and Azure Speech.

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