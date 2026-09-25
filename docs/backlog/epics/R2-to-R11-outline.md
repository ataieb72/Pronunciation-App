# R2–R11 — Outline

Each epic gets its own file with full tasks (What to Build, Acceptance Criteria, TDD tests, Docs) when it starts. Source: `docs/redesign/elocution-focus.md` §9 and `docs/redesign/design-options.md` §6.16–6.17.

## R2
**Audio core + clarity signals.** AudioWorklet capture; resampler and WAV encoder; VAD; quality gate; locked mic settings with applied-settings record; distance check; one AudioContext per session; interruption handling; IndexedDB audio store with `storage.persist()`. Measures: relative level, fade at phrase ends, articulation rate, pauses, pitch range in semitones — checked against Praat on golden fixtures (V1, V3, V7).

## R3
**Clarity core — Slice 1 (first real practice).** Baselines (habitual and clear) in English and French; warm-up and distance check; clear-speech pairs with compare player and self-judgement; block summaries with cue choice from unchanged features; everyday sentence banks with word-ending loads; 5- and 10-minute sessions; weekly target; ZIP export. No cloud scoring.

## R4
**Machine listener in noise.** Babble generation and mixing on the phone; personal noise level calibrated so habitual speech gets 60–80% of keywords (V9); `SpeechScorer` interface with Azure SDK and fixture scorers; token cache; timeouts; eras; v1 bugs as named tests; "They heard…" and retry; unpredictable sentence banks in both languages.

## R5
**Check recording and backup.** Check flow: habitual part first, then clear part, anchors twice, English support probes; no feedback; AES-GCM backup to R2 after each Check and weekly; restore test.

## R6
**Short talk.** Everyday talk prompts; 2–3 rounds with round 1 habitual; start-vs-end clarity drop; fade and pace summaries; 15-minute session builder; comeback session.

## R7
**English sound support.** Word stress (listening with many voices, compare mode for speaking); vowel pairs /iː–ɪ/, /uː–ʊ/, /æ–ʌ–ɑ/ with Azure spoken phonemes; English word-ending check.

## R8
**Trust levels and validation.** Detector registry; Silent → Hint → Correction rules; known-answer checks (V4, V6); reports in `docs/validation/`; dispute review.

## R9
**Check analysis and Progress.** Re-scoring all Check audio in the current era; RCI and NAP; plain-wording results; Progress screen; monthly anchor re-score.

## R10
**Panel and habit tools.** Encrypted listener panel (intelligibility in noise on habitual speech); weekly unprompted voice note; if-then plans for everyday situations; reminders; weekly review.

## R11
**Experiments (optional, each off by default).** Front-camera jaw and lip opening feedback; pitch line in semitones; optional noisy-room mode through wired earbuds; SpeechSuper pilot; Capacitor Android wrap if web audio fails.
