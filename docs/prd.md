# Pronunciation Coach v2 — Product Requirements

**Version:** 2.0 · **Owner:** Ahmed · **Status:** approved for build (2026-09-25)
**Sources:** `docs/redesign/elocution-focus.md` (accepted revision) and `docs/redesign/design-options.md` (Option B). Evidence: `docs/research/`.

## 1. Problem

The owner mumbles in everyday talk, in French (first language) and in English. Speech feels mechanical, and the tongue and lips feel heavy. Listeners miss words. v1 trained accent-style pronunciation with methods that lack evidence, and its scoring loop did not work.

**Terms:**
- **Articulation:** forming sounds crisply: clear consonants, full vowels, finished word endings.
- **Elocution:** articulation plus volume, pace, pauses, emphasis and pitch variation.
- **Mumbling:** speaking with too little effort for the listener: small mouth movements, low volume, run-together words, dropped endings, a voice that fades at the end of phrases.
- **Habitual speech:** how you speak when nobody asks you to be clear.

## 2. User

One adult, French first language, English second language. Practises on a **Pixel 10 Pro XL (Android, Chrome)**, in sessions of 5–15 minutes, at least 4 times a week. No accounts. No other users.

## 3. Goals

| # | Goal | Evidence |
|---|---|---|
| G1 | **Clear habitual speech in both languages.** Listeners catch more words the first time, at normal pace, including with background noise. | No study shows lasting change in habitual speech [None found]. The app measures it honestly. |
| G2 | **Clear speech on demand**, kept through a 60–90 second talk, at normal pace (±10%). | Producing clear speech on request [Moderate] |
| G3 | **English sounds that block clarity:** word stress and the vowel pairs that make listeners mishear. | [Moderate] |
| G4 | **Habit:** at least 4 sessions a week in most weeks. | Adherence predicts staying with an app [Weak] |

Not goals: a native accent; high practice scores.

## 4. Core product

1. **Clear-speech pairs.** Say a sentence your usual way, then "big and clear" (open the jaw, full vowels, finish every ending), with one cue. Judge the pair yourself; the app summarises what changed after each block.
2. **Machine listener in noise.** The phone mixes café noise into a take. Speech recognition reports what it heard. Retry missed words.
3. **Short talks.** 45–60 second everyday retells or opinions, 2–3 rounds. Round 1 shows habitual speech.
4. **English support.** Word stress and the vowel pairs that cause mishearing, when the data show a need.
5. **Clarity profile.** Level, fade at phrase ends, articulation rate, pauses, pitch range, word endings, machine listener in noise. Each measure is compared with the owner's own baseline. There is never one "clarity score".
6. **Progress Checks every 4 weeks.** Habitual speech first, with no cue. Practice scores never count as progress.
7. **Habit support.** Weekly target, if-then plans, comeback sessions, a weekly unprompted voice note. No streaks.

Details: `docs/product-design.md`.

## 5. Left out, with reasons

Tongue twisters and speed drills; cork or pen drills; mouth exercises without speech; "just slow down" as a goal; a dB meter as a target; streaks and points; an LLM as a pronunciation judge. See `docs/redesign/elocution-focus.md` §3.

## 6. Success criteria

Written down before practice week 1 (`docs/redesign/design-options.md` §6.7, adapted in `elocution-focus.md` §7). A flat G1 result at week 12 is possible and counts as useful information.

## 7. Constraints

- The Azure Speech key never reaches the phone. The phone uses 10-minute tokens from the Worker.
- HTTPS only. Uncompressed 16 kHz audio. Mic auto-gain, noise suppression and echo cancellation off where the phone allows.
- Data lives on the phone first. Encrypted backups later (R5).
- Budget: start on free tiers (Azure F0, Cloudflare free). Ceiling about $10 a month.

## 8. Health note

The app trains a speaking habit. It cannot tell a habit from a medical cause. If the heaviness in the tongue or lips is new, getting worse, or comes with other changes (slurred speech, trouble swallowing, drooling, facial weakness), a doctor should check it first.
