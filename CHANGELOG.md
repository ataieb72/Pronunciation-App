# Changelog

## [Unreleased]

### Added
- F3: Full Azure scoring + TTS loop (T01 assessment service, T02 TTS cache, T03 client wiring)
- End-to-end: record → upload → assess → scores + reference audio
- API client with tests (mocked fetch for error paths)

### Changed
- F3-T03: Wired full client loop in App (scores state, api layer, play ref)

## Previous
- F1 Scaffold complete (monorepo, SQLite, health)
- F2 Recording complete (WAV encoder, recorder hook + UI, upload)