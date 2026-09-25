# Pronunciation Coach — Product Design

**Version:** 1.0 · Four screens, plain CSS, no UI library. Language toggle (FR/EN) persistent in the header on every screen.

## 1. Practice screen (home)
- Current exercise card: text large and readable, track badge (Phoneme/Articulation/Prosody), focus tags, difficulty dots, IPA hint toggle.
- Controls: ▶ Play reference (TTS) · ⏺ Record (waveform animates while recording) · ⏹ Stop → auto-submits for assessment.
- Speed-ladder exercises show ladder position (Slow → Normal → Fast) with the current tier highlighted; reference audio plays at the tier tempo.
- Shadowing exercises (prosody track): reference plays WHILE recording; a "speak along" hint replaces the play-first flow.
- Buttons: "Next exercise", "Drill my weak sounds" (builds a session from the weak-phoneme engine), "Pick exercise" (→ Picker).

## 2. Feedback screen (after each attempt)
- Top: three large numbers — Accuracy, Fluency, Prosody (0–100). Prosody hidden if null.
- Sentence rendered word by word, colored by score: green ≥85, amber 60–84, red <60. Tapping a word expands its phonemes: each with score + expected IPA symbol.
- Articulation panel: rate comparison (+/- %), unexpected pause list with positions, stress, ladder tier for tempo attempts. Enriched via /api/assess with durations and parsed Azure breaks.
- Side-by-side replay implemented.
- Actions: "Retry" · "Next".

## 3. Exercise picker
- Filters: track (phoneme/articulation/prosody), difficulty (1–3), focus (phoneme/cluster/feature dropdown populated from the language pack), level (word/sentence/passage).
- List rows: exercise text preview, badges, personal best score if attempted.
- (Implemented in F5-T04 with filter composition and client-side best scores)

## 4. Progress screen
- Line chart: average overall score per day, one line per language (recharts).
- Phoneme heatmap: phoneme × week, cell color = average score.
- Articulation index over time: mean(accuracy × tier multiplier) across speed-ladder attempts.
- "Weakest sounds right now" list (top 5 per language) with a one-tap "drill this" action.
- (Implemented in F6-T04)

## Flows
1. **Quick practice:** open app → last language remembered → exercise served → record → feedback → next.
2. **Weak-sound drill:** Practice → "Drill my weak sounds" → session of minimal pairs → loaded sentences → passages, advancing at ≥85.
3. **Speed ladder:** pick speedLadder exercise → record at current tier → ≥85 advances tier → ladder position updates.

## States to handle
Mic permission denied (inline explainer + retry) · Azure error/quota (readable message, attempt kept locally unscored) · empty progress (friendly "record your first attempt") · slow network (spinner with "scoring…" max 15 s then timeout message).
