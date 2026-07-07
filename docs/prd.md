# Pronunciation Coach — Product Requirements Document

**Version:** 1.0 · **Owner:** Ahmed · **Status:** Approved for build

## 1. Problem & Goal

Ahmed wants to improve both **pronunciation** (producing the right sounds — phoneme accuracy) and **articulation** (clarity and mechanics of delivery — crisp consonants, pacing, rhythm, stress) in **French and English**. Existing apps focus on vocabulary or generic "repeat after me" without phoneme-level feedback or articulation training.

**Goal:** a single-user web app with a tight practice loop — pick an exercise → hear a native reference → record → get phoneme + prosody scores → drill weak sounds → track progress.

## 2. Users

One user (the developer). No accounts, no multi-tenancy, no sharing.

## 3. Scoring model (two dimensions, one engine)

- **Pronunciation** → Azure Pronunciation Assessment per-phoneme accuracy scores.
- **Articulation** → Azure fluency + prosody scores (pacing, stress, pauses) combined with **speed ladders**: the same text scored at increasing tempo; accuracy under speed = articulation quality.

## 4. Features (mapped to backlog epics)

| Epic | Feature | Summary |
|------|---------|---------|
| F1 | Project scaffold | Monorepo, SQLite schema, health check |
| F2 | Recording | Mic capture → 16 kHz mono WAV → upload → stored attempt |
| F3 | Azure integration | Pronunciation Assessment (phoneme granularity + prosody) and Neural TTS reference audio, cached |
| F4 | Feedback UI | Per-word/per-phoneme color-coded scores, IPA, articulation panel (rate vs. reference, pauses, stress), replay attempt vs. reference |
| F5 | Language packs | Three tracks per language (see §5), exercise picker with filters |
| F6 | Drills & progress | Weak-sound progression engine, speed ladders, progress charts + articulation index |

## 5. Exercise design — three tracks per language

Every exercise is tagged: `track` (phoneme | articulation | prosody), `focus` (target phoneme(s), cluster, or prosody feature), `difficulty` (1–3), `level` (word | sentence | passage).

**Track A — Phoneme accuracy (pronunciation).** Speech-therapy progression: isolate → word → sentence → connected speech. Minimal pairs (three/tree, vin/vent), loaded sentences ("thirty-three thick thistles"), passages dense in the target sound. Advance a level only at ≥85 on the current one.

**Track B — Articulation (clarity & mechanics).** Tongue twisters and consonant-cluster drills as speed ladders ("strengths", "les chaussettes de l'archiduchesse", "je ne le lui redemanderai pas"), over-articulation drills, long-passage reads scored for completeness (dropped syllables = mumbling signal).

**Track C — Prosody (rhythm & stress).** English: stress-timing, vowel reduction, contrastive stress. French: liaison and enchaînement, even-syllable rhythm. Both: shadowing the TTS reference at matched pace.

## 6. Language coverage

`fr-FR` and `en-US` at launch. One shared engine + config-driven language packs under `client/src/languages/{locale}/`; adding a language later = adding a folder. French pack targets nasal vowels /ɑ̃ ɛ̃ ɔ̃/, uvular R, u/ou contrast, liaison. English pack targets /θ ð/, vowel pairs /ɪ iː/ and /æ ʌ/, consonant clusters, stress-timing.

## 7. Success metrics

- Per-phoneme score trend visible after 5 attempts on a sound.
- Weak-sound engine correctly serves the 5 lowest-scoring phonemes (min 3 attempts each).
- Speed-ladder tier advances only at ≥85 accuracy at the current tempo.
- End-to-end latency record → feedback under 5 seconds on a normal connection.

## 8. Non-goals (v1)

Accounts/auth · mobile apps · gamification/streaks · social features · more than 2 languages · offline scoring · production hosting.

## 9. Constraints

- Azure Speech free tier (F0): 5 audio hours/month — sufficient for personal use; no quota handling needed beyond a clear error message.
- `AZURE_SPEECH_KEY` lives server-side only; the client never sees it.
- Audio files stay on local disk; SQLite for all persistence.
