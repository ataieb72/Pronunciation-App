# Pronunciation Coach v2 — Product Design

**Version:** 2.0 · **Status:** approved (2026-09-25) · **Detail:** `docs/redesign/elocution-focus.md` §5–7 and `docs/redesign/design-options.md` §6.2–6.8.

Phone-first. One-handed. Large tap targets. French and English alternate by day (50/50 by default).

## 1. Screens

| Screen | Main elements | Epic |
|---|---|---|
| **Pair** | Pairing-code field, "Paired ✓" state, server health | R1 |
| **Today** | "Start · 10 min" (5 and 15 as options), language of the day, weekly dots (●●●○), next reminder | R3 |
| **Session** | One stage at a time: Warm-up → Say → Listen → Use → Wrap. Big record button, level light, stage progress | R3–R6 |
| **Pair compare** | Usual and clear takes, play each, "Which would your listener catch better?" | R3 |
| **Block summary** | "Changed: volume, vowel length. Not changed: endings." Next cue | R3 |
| **Noisy listener card** | "They heard: …", missed word highlighted, retry | R4 |
| **Talk summary** | Pace band, fade at phrase ends, start-vs-end change | R6 |
| **Check** | Calm, no feedback, habitual part first | R5 |
| **Progress** | Check results only, with ranges and plain wording | R9 |
| **Settings** | Language split, weekly target, reminders, export, backup | R3, R5 |

## 2. Session (10 minutes, default)

| Time | Stage | What happens |
|---|---|---|
| 0:00–0:40 | Warm-up | Distance check; 2 sentences "big and clear" |
| 0:40–4:00 | Say | 4 clear-speech pairs with one sub-cue each; self-judgement; one summary after the block |
| 4:00–6:00 | Listen | 4 unpredictable sentences in café noise; "They heard: …"; retry. English days: about 2 minutes of stress or vowel-pair support when needed |
| 6:00–9:30 | Use | Everyday short talk, 45–60 s, 2–3 rounds; round 1 habitual |
| 9:30–10:00 | Wrap | One cue for next time; no score |

- **5 minutes:** warm-up, 2 pairs, 2 noisy sentences, 1 talk round.
- **15 minutes:** the 10-minute session plus one extension (English sound block, or a rehearsal of a real text).
- **Comeback (3 minutes):** offered after 5 or more days away. It says "Welcome back." It never shows missed days.

## 3. Feedback rules

- No live meter while speaking. The owner judges each pair first.
- The app's numbers come once per block. A feature that holds for 3 sessions appears less often.
- Cues: "big and clear" is the default. Sub-cues: "Open your jaw", "Finish every word ending", "Reach the back of the room", "Keep your voice to the last word". Never "slow down" as a goal.
- Hints use cautious wording ("probably") until a measure passes validation.
- A "That was right" button lets the owner dispute a machine verdict.

## 4. Content

- Everyday sentences in French and English, loaded with endings mumblers drop: French *-ble, -tre, -dre, -pre, -cle*; English final stops and clusters (*asked, helped, world, texts*).
- Unpredictable sentences for the noisy listener (words that context cannot give away).
- Everyday talk prompts: what you did, plans, short opinions, quick questions.
- English support items: stress words (3+ syllables, stress-moving suffixes, French look-alikes) and the vowel pairs /iː–ɪ/, /uː–ʊ/, /æ–ʌ–ɑ/.

## 5. States to handle

Mic permission denied (explain and retry) · take failed the quality check (say why, retake) · distance check off (adjust) · offline (Say and Listen need the network; pairs still record and compare) · scorer slow (after 3 s "Still checking — you can go on"; after 8 s "Couldn't judge this one") · page hidden during a take (discard and pause).
