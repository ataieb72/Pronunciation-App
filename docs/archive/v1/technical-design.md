# Pronunciation Coach — Technical Design

**Version:** 1.0

## 1. Architecture

```
┌──────────────────────┐        ┌───────────────────────────┐        ┌─────────────────┐
│  React + Vite client │  HTTP  │  Node/Express server      │  SDK   │  Azure Speech   │
│  MediaRecorder → WAV │ ─────▶ │  key holder, thin proxy   │ ─────▶ │  Pron. Assess.  │
│  recharts, plain CSS │ ◀───── │  better-sqlite3, fs audio │ ◀───── │  Neural TTS     │
└──────────────────────┘        └───────────────────────────┘        └─────────────────┘
```

- Monorepo: `/client` (Vite React), `/server` (Express). Root `package.json` with npm workspaces; `npm run dev` runs both (concurrently).
- The server exists for exactly three reasons: hold `AZURE_SPEECH_KEY`, run assessments/TTS via `microsoft-cognitiveservices-speech-sdk`, persist attempts/stats in SQLite. No business logic in the client beyond UI state.
- No auth, binds to localhost.

## 2. Audio pipeline (the riskiest part — build and test first in F2)

1. `navigator.mediaDevices.getUserMedia({ audio: true })`.
2. MediaRecorder produces webm/opus in Chrome — Azure needs WAV PCM 16 kHz 16-bit mono. Convert client-side with an AudioContext + OfflineAudioContext resample → hand-rolled WAV encoder (small util, ~60 lines, unit-tested against known fixtures).
3. Upload as multipart to `POST /api/attempts`; server stores under `server/audio/{yyyy-mm}/{id}.wav`.
4. Assessment reads the file server-side via a push audio input stream into the Speech SDK.

Fallback: if MediaRecorder mime negotiation fails, use `audio/wav` where supported, else record webm and convert. Never send webm to Azure.

## 3. Azure integration

- SDK: `microsoft-cognitiveservices-speech-sdk` (server only).
- Pronunciation Assessment config: reference text from the exercise, grading system HundredMark, granularity Phoneme, `enableProsodyAssessment: true`, phoneme alphabet IPA.
- Locales: `fr-FR`, `en-US`. Prosody assessment availability differs by locale — treat prosody score as nullable everywhere.
- TTS: `fr-FR-DeniseNeural`, `en-US-JennyNeural`; SSML `<prosody rate>` for ladder tempos (0.75×/1×/1.25×); cache MP3 on disk keyed by sha256(text+voice+rate); record the reference audio duration in the cache index (used for speaking-rate comparison in the feedback UI).
- Config via `.env`: `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`. Startup fails fast with a clear message if missing.

## 4. Language packs (config-driven, engine stays generic)

```
client/src/languages/
  fr-FR/ { phonemes.json, exercises.json }
  en-US/ { phonemes.json, exercises.json }
```

- `phonemes.json`: inventory with IPA symbol, display name, example word, difficulty note.
- `exercises.json`: array of `{ id, track, text, focus[], difficulty, level, speedLadder?, shadowing? }` per PRD §5.
- The engine imports packs dynamically by locale; NOTHING outside these folders is language-specific. Adding a language = adding a folder + two voices in a server-side voice map.

## 5. Drill engines (server-side, pure functions, heavily unit-tested)

- **Weak-sound engine:** query phoneme_stats (≥3 attempts, 5 lowest) → build a session: minimal pairs whose focus intersects the weak set, then loaded sentences, then passages; level advances at ≥85 average over the level's attempts.
- **Speed ladder:** per (exercise, language) tier in ladder_progress; attempt at current tier with accuracy ≥85 advances the tier (max 2). Tier multipliers 0.9/1.0/1.15 feed the articulation index.
- **Articulation index:** mean(accuracy × tier multiplier) over speed-ladder attempts per day — a single number that only rises when clarity survives speed.

## 6. Testing strategy (TDD)

- WAV encoder: golden-file tests (fixed input buffer → expected header/bytes).
- Drill engines + ladder rule + rolling average: pure-function unit tests, edge cases (exactly 85, <3 attempts, tier at max).
- API: integration tests with the Azure SDK mocked (record one real response JSON as fixture).
- UI: component tests for score coloring thresholds (85/60 boundaries) with Vitest + Testing Library.
- One manual E2E script per epic (documented in the epic's acceptance criteria).

## 7. Decisions (mini-ADRs)

1. **Azure over SpeechAce/self-hosted:** phoneme-level scores for both locales, free tier, one vendor for scoring + TTS.
2. **Client-side WAV conversion over server-side ffmpeg:** no native deps, keeps server thin; cost is a small tested util.
3. **SQLite over JSON files:** transactional stats updates, easy aggregation for progress queries.
4. **Speed ladders as articulation proxy:** Azure has no "clarity" score; accuracy-under-tempo is the standard speech-therapy proxy and is measurable with the tools we have.
