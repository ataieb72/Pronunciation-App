# Changelog

## [Unreleased] — v2

### Added
- Evidence base in `docs/research/`: source-checked literature review, learner-profile addendum, and a note on mumbling.
- v2 design in `docs/redesign/`: three options from a judge panel, and the owner's accepted elocution-first revision (Option B).
- ADR 001: rewrite as an elocution-first phone app.
- v2 docs: PRD, product design, technical design, API reference, data model, backlog R1–R11.

- R1: v2 workspace (npm 11, TypeScript 6, ESLint 10 strict type-checked), bundle key scan and CI, Worker API (health, pairing, speech tokens) with D1, installable PWA shell with pairing.

### Changed
- Focus moves from accent-style pronunciation to articulation and elocution in both languages, aimed at mumbling.
- v1 docs moved to `docs/archive/v1/`.

### Removed
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