# Revision: articulation and elocution first

**Date:** 25 September 2026 · **Status:** draft for the owner's review · **Amends:** `design-options.md`

## 1. The owner's decision

On 25 September 2026 the owner confirmed:
- **The focus is articulation and elocution in both languages**, not accent or pronunciation for its own sake.
- **The main problem is mumbling.**

Terms used here:
- **Articulation:** forming sounds crisply: clear consonants, full vowels, finished word endings.
- **Elocution:** clear, expressive speech as a whole: articulation plus volume, pace, pauses, emphasis on key words, and pitch variation.
- **Mumbling:** speaking with too little effort for the listener. Typical signs are small mouth movements, low volume, words that run together, dropped word endings, and a voice that fades at the end of sentences. Section 3 gives the evidence.
- **Habitual speech:** how you speak when nobody asks you to be clear. This is what listeners hear every day.

`design-options.md` still holds for the technical base, the phone and audio rules, security, and the measurement method. This document replaces its goals, its English content order, its session plan, and its build order.

## 2. What changes, in one table

| Area | Before (design-options.md) | Now |
|---|---|---|
| Main goal | Be understood in English (L2 pronunciation); clear speech in French | **Clear habitual speech in both languages**: listeners catch your words the first time, at your normal pace |
| Core practice | English listening training (HVPT) and sound drills | **Clear-speech pairs** (usual, then clear), a **machine listener in noise**, and **short talks** in both languages |
| English sound work | Most of each English session: stress, 3 vowel pairs, /h/ | **Support only**: word stress (it is emphasis) and the vowel pairs that make listeners mishear you. /h/ is optional. |
| French | 25% of time, from mid-cycle | **About 50%, from the first slice** |
| Main outcome | Held-out word error rates, listening accuracy | **Clarity of habitual speech**, measured on a fixed "clarity profile" against your own baseline |
| First slice | Listening sessions (no speaking) | **Clear-speech pairs in both languages.** They need no cloud scoring, so they ship sooner. |

## 3. What mumbling is, and what helps

> Section to be completed with the focused mumbling review (in progress). The points below come from `docs/research/` and hold already.

- **Clear speech is the opposite of mumbling.** When asked, native speakers switch into it at once. They speak with longer, more distinct vowels, released consonants, finished endings, a wider pitch range and more energy in the 1–3 kHz band. [Strong that clear speech helps listeners in noise or with hearing loss; Moderate that people produce it on request] (Add. §3.1–3.2)
- **The wording of the cue matters.** "Over-enunciate" gave the largest change. "Speak clearly" gave the smallest, though it still helped. [Moderate; 12 native English speakers] (Add. §3.2)
- **A listener who sometimes mishears you makes you clearer** on the exact word they missed. [Moderate; native English, web experiments] (Brief §5.3)
- **Background noise and a real partner bring out clearer speech** in French speakers too. [Moderate; 6 Canadian French speakers; movements measured, not intelligibility] (Add. §3.2)
- **Speed is not the key.** Clear speech at normal pace kept much of the benefit. Slowing down alone did not reproduce it. [Weak to Moderate] (Add. §3.2)
- **Clarity fades.** In conversation, clear speech faded over time and restarted at each new task. No study shows that clarity training changes everyday speech weeks later. [Weak; None found] (Add. §3.2)
- **People differ.** Some talkers gain little from trying to be clear. [Moderate] (Add. §3.2)
- **No evidence supports** tongue twisters, speed drills, or mouth exercises without speech for clarity. (Brief §4)

## 4. Goals

| # | Goal | How it is measured |
|---|---|---|
| G1 | **Clear habitual speech, both languages.** Listeners catch more of your words the first time, at your normal pace, including with background noise. | Habitual (unprompted) parts of each Progress Check: machine listener in noise, clarity profile, and a listener panel if available |
| G2 | **Clear speech on demand**, kept through a 60–90 second talk, at your normal pace (±10%) | Clear takes and short talks: clarity profile, and how much clarity drops from the start to the end of a talk |
| G3 | **English sounds that block clarity**: word stress, and the vowel pairs that make listeners mishear you | Held-out words at Progress Checks (method unchanged from `design-options.md` §6.7) |
| G4 | **Habit:** at least 4 sessions a week in most weeks | Session log |

G1 is the goal that matters. It is also the one with the least evidence: no study shows lasting change in habitual speech. So the app treats every carry-over feature as an experiment and measures it honestly. A flat G1 result at week 12 is possible, and it is useful information.

## 5. The clarity profile (what the app measures)

The app never shows a single "clarity score". It shows a few measures, each compared only with your own baseline, on the same phone, held at the same distance.

| Measure | What it shows about mumbling | Where it runs | Status |
|---|---|---|---|
| Speech level, and **fade at phrase ends** | Too quiet; trailing off | Phone | To validate (V3) |
| Articulation rate, within your band | Rushing; words run together | Phone (+ Azure word timings) | To validate (V7) |
| Pauses: count and placement | Run-on speech, or pauses in the middle of phrases | Phone (+ Azure word timings) | To validate (V7) |
| Pitch range, in semitones | Flat voice | Phone | To validate (V1, V3) |
| Vowel length | Clipped, small vowels | Phone + Azure timings | To validate |
| Word endings (English) | Dropped final consonants | Azure en-US phoneme scores and omission flags | To validate (V4) |
| Word endings (French) | Dropped final consonants | No validated method (Add. §3.4) | Experiment only |
| 1–3 kHz energy; vowel distinctness | "Crispness"; open mouth | Phone | Hidden experiment (Add. §3.4 [Mixed]) |
| **Machine listener in noise** | Would a listener catch it? | Phone mixes café noise into the take; Azure speech-to-text (en-US or fr-FR) counts the keywords it got right | A Check measure after calibration (V9) |

Rules:
- A measure appears as a trend only if it is stable on repeat recordings (ICC ≥ .70 in V3).
- The machine listener is labelled "lenient", because speech recognition hides some errors (Brief §3.7).
- The noise level is set per person at week 0, so that your usual speech gets 60–80% of keywords. This leaves room to show gains.

## 6. The session

Every session keeps the four stages from `design-options.md`: warm-up, then **Say → Listen → Use → Wrap**. English and French sessions alternate. The default split is 50/50.

**10-minute session**

| Time | Stage | What happens |
|---|---|---|
| 0:00–0:40 | Warm-up | 2 sentences, over-enunciated. |
| 0:40–4:00 | **Say · clear pairs** | 4 sentences. For each one: say it your usual way, then clearly, with one cue card (for example "Finish every word ending", "Open your jaw", "Keep your volume to the last word"). Then answer "Which would your listener catch better?" before the app shows its card: "Changed: volume, vowel length. Not changed: endings." The next cue targets what did not change. |
| 4:00–6:00 | **Listen · machine listener in noise** | 4 unpredictable sentences at your normal pace. The phone mixes in café noise and asks the recogniser what it heard: "They heard: *le poison*…". You retry the missed word. |
| 6:00–9:30 | **Use · short talk** | A 45–60 second retell or opinion, 2–3 rounds. Round 1 has no cue: it shows your habitual speech. Then one cue, then "keep it". The app measures pace, fade at phrase ends, and how clarity drops from the start to the end. |
| 9:30–10:00 | Wrap | One cue for next time. No score. |

**In English sessions,** about 2 minutes of the Listen stage go to support work when your data show a need: word-stress listening and speaking, and one vowel pair that makes listeners mishear you (method unchanged from `design-options.md` §2.5).

**5-minute session:** warm-up, 2 pairs, 2 noisy sentences, 1 talk round.
**15-minute session:** the 10-minute session plus one extension, such as a delivery rehearsal on a real text you need (a meeting update or a talk), or an English sound block.

**Carry-over experiments** (G1 has no evidence yet, so each one is tested on you):
- An if-then plan for real life, for example "When I start a call, I will keep my volume to the last word."
- A weekly unprompted 60-second voice note about your day. It measures habitual speech between Checks.
- Cues that fade over the weeks: cards show less often as a feature holds. This follows motor-learning advice to reduce feedback over time (Brief §3.2; mostly clinical evidence).

## 7. Progress Check (every 4 weeks)

The structure from `design-options.md` §6.7 stays. The main change is the order and the outcome:
1. **Habitual part first, with no clarity cue:** 8 unpredictable sentences at normal pace, and a new 60-second retell. This is the main G1 outcome.
2. **Clear part:** the same kind of material, now said clearly (G2).
3. **Anchors:** 10 fixed sentences, twice, to measure your normal day-to-day spread.
4. **English support probes:** held-out stress words and vowel-pair words (G3).

Both languages are checked at every Check. A listener panel (optional) writes down the noisy habitual sentences without seeing the text.

## 8. What happens to the options

The technical base does not change: an installed web app (PWA), a small Cloudflare function that issues short-lived Azure passes, Azure in the browser, measures computed on the phone, and data stored on the phone. The clarity profile is mostly phone-side signal processing, so a phone-first design fits it well.

| Option | Before | Now |
|---|---|---|
| **A** | Lean English core | **Lean clarity core:** clear pairs, the machine listener in noise, and short talks in both languages. Data on the phone only, with ZIP export. No English sound work. |
| **B (recommended)** | Full phone program | **Full clarity program:** A, plus English sound support, trust levels, encrypted backup, the listener panel, and the carry-over experiments. |
| **C** | Server measurement lab | Unchanged. Server acoustic tools (Parselmouth) matter a little more now, but the phone can compute the main clarity measures. C stays the heaviest option. |

## 9. New build order (Option B)

| Epic | Goal | What ships |
|---|---|---|
| R1 Reset and phone test | Clean start; go or no-go on your phone | App installed; phone test report |
| R2 Audio core + clarity signals | Reliable recording; level, fade, pauses, rate and pitch on the phone, checked against Praat | Record-and-replay with a quality check and first clarity readings |
| R3 **Clarity core** | Real practice starts, in both languages | **Slice 1:** baselines (habitual and clear) in EN and FR, warm-up, clear pairs with compare player and self-judgement, 5- and 10-minute sessions, weekly target, ZIP export. **Needs no cloud scoring.** |
| R4 Machine listener in noise | "Would they catch it?" | Café-noise mixing, per-person noise level, Azure speech-to-text in en-US and fr-FR, "They heard…" and retry |
| R5 Check recording and backup | Check 1 on time, and safe | Check flow; encrypted backup |
| R6 Short talk | Clarity in longer speech | Retell rounds, fade and drop measures, cue choice from unchanged features |
| R7 English sound support | Stress and the vowel pairs that cause mishearing | Stress compare mode, vowel pairs with Azure spoken phonemes, English word-ending check |
| R8 Trust levels and validation | Trustworthy hints | Detectors move up as they pass validation |
| R9 Check analysis and Progress | Honest progress | Re-scoring, ranges, Progress screen |
| R10 Panel and habit tools | Human judgement; staying with it | Listener panel, weekly voice note, if-then plan, comeback session |
| R11 Experiments (optional) | Test open questions on you | Pitch line, SpeechSuper pilot, Capacitor wrap if needed |

## 10. Decisions still open

| # | Decision | Recommended default |
|---|---|---|
| D1 | Which option | **B**, built in the order above |
| D3 | Platform, and which phone | PWA, confirmed by the R1 phone test. **Please send your phone model and OS version.** |
| D4 | French variety | fr-FR, unless you speak Québec French |
| D6 | Human listeners | Friends if possible, at weeks 0 and 12. The app works without them. |
| D7 | English/French split | **50/50**, alternating days |
| D15 | Where you most need clarity | Meetings, calls, presentations, or everyday talk. This chooses the talk topics and the delivery rehearsals. |

Other decisions in `design-options.md` §8 keep their defaults.
