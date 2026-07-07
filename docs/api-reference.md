# Pronunciation Coach — API Reference

Base URL: http://localhost:3001 (Express). All endpoints unauthenticated (localhost, single user). JSON unless noted.

## GET /api/health
→ 200 `{ "status": "ok", "db": true }`

## POST /api/attempts
multipart/form-data: `audio` (WAV file), `language` (e.g. "en-US"), `exercise_id`.
Saves WAV to server/audio/{yyyy-mm}/, inserts attempts row (scores null until F3).
→ 201 `{ "id": 42, "language": "en-US", "exercise_id": "en-001", "audio_path": "server/audio/2026-07/..." }`

## POST /api/assess
JSON: `{ "attemptId": 42, "referenceText": "...", "language": "fr-FR" }`.
Runs Azure Pronunciation Assessment (granularity Phoneme, prosody enabled) on the stored WAV; writes scores + full JSON to the attempt; updates phoneme_stats (transaction); if tempo_tier set, applies ladder rule (advance at accuracy ≥85).
→ 200 `{ "overall": 82, "accuracy": 80, "fluency": 88, "prosody": 76, "words": [ { "word": "...", "score": 91, "phonemes": [ { "phoneme": "...", "score": 74 } ] } ], "ladder": { "tier": 1, "advanced": false } }`
Errors: 404 unknown attempt · 502 Azure failure (attempt kept, scores null) · 429 quota with readable message.

## GET /api/tts?text=...&lang=fr-FR&rate=1.0
Neural TTS reference audio. Voices: fr-FR-DeniseNeural, en-US-JennyNeural. `rate` ∈ {0.75, 1.0, 1.25} maps to SSML prosody rate. Disk cache keyed by sha256(text+voice+rate). → 200 audio/mpeg.

## GET /api/weak-phonemes?lang=fr-FR
5 lowest avg_score phonemes with attempt_count ≥ 3. → 200 `{ "phonemes": [ { "phoneme": "...", "avgScore": 61, "attempts": 7 } ] }`

## GET /api/progress?lang=fr-FR
Aggregates for the Progress screen: daily average scores, phoneme×week matrix, articulation index series (mean of accuracy × tier multiplier; multipliers 0.9/1.0/1.15 for tiers 0/1/2).

## GET /api/attempts/:id/audio
→ the stored WAV (for "play my attempt").
