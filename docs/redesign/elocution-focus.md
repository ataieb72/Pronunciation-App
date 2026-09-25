# Revision: articulation and elocution first

**Date:** 25 September 2026 · **Status:** accepted by the owner (2026-09-25) · **Amends:** `design-options.md` · **Evidence:** `docs/research/` (brief, addendum, and `mumbling-note.md`)

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
| Main cue | — | **"Big and clear":** open the jaw, full vowels, finish every ending. "Reach your listener" (volume) comes second. Never "just slow down". |
| Feedback | A card after every attempt | **You judge each pair yourself; the app's numbers come as a summary after each block**, and appear less often as a feature holds |
| English sound work | Most of each English session: stress, 3 vowel pairs, /h/ | **Support only**: word stress (it is emphasis) and the vowel pairs that make listeners mishear you. /h/ is optional. |
| French | 25% of time, from mid-cycle | **About 50%, from the first slice** |
| Main outcome | Held-out word error rates, listening accuracy | **Clarity of habitual speech**, measured on a fixed "clarity profile" against your own baseline |
| First slice | Listening sessions (no speaking) | **Clear-speech pairs in both languages.** They need no cloud scoring, so they ship sooner. |

## 3. What mumbling is, and what helps

Sources: `docs/research/mumbling-note.md` (cited "Mumble §n"), the addendum ("Add."), and the brief ("Brief"). All mumbling sources were checked through their abstracts only.

**What mumbling is**
- **A normal low-effort style, used too much.** Everyone saves effort when they expect the listener to cope. In conversation, most words differ from their dictionary form. Mumbling is this style in places where the listener cannot cope. It is not a disorder. [Strong, descriptive] (Mumble §1–2)
- **Its parts:**
  - small jaw opening;
  - vowels that drift toward a neutral "uh";
  - low volume;
  - a voice that fades at the end of phrases;
  - fast, run-together words;
  - dropped word endings;
  - a narrow pitch range;
  - little high-frequency energy, which makes the voice sound dull.

  Each part except the fade has evidence linking it to lower intelligibility. [Moderate] (Mumble §2)
- **Jaw opening differs between people, partly because of anatomy.** So some people gain less than others. [Weak–Moderate] (Mumble §2)
- **Crisp articulation makes a voice sound louder** at the same measured level. A mumbler may be heard as "quiet" even at normal volume. [Weak–Moderate] (Mumble §2)

**What helps, ranked**
1. **"Big and clear"**: open the jaw, give vowels their full shape, finish every ending. Clear speech gave the largest vowel gains and the most jaw movement, and it improved intelligibility in noise. "Over-enunciate" was the best cue wording. [Moderate] (Mumble §3; Add. §3.2)
2. **"Reach your listener" (louder).** In healthy adults, loud speech brings larger lip and jaw movements and more pitch variation, within a session. A dB number as the target changes movement differently from "speak over the noise", so the app never uses one as a goal. Loudness *training* that spreads to articulation is proven only in Parkinson's disease. [Moderate within a session; clinical for training] (Mumble §3)
3. **A listener who sometimes mishears you**, or background noise, makes you clearer on the exact words that matter. Noise through headphones works better than noise from a speaker. [Moderate] (Brief §5.3; Mumble §3)
4. **"Slow down" as a first step only.** Slow speech did not improve intelligibility, and it flattens pitch. The goal is clarity at your normal pace. [Moderate against slowing as a goal] (Mumble §3; Add. §3.2)

**What we do not know**
- **No study shows that clear or loud speech becomes habitual in healthy adults.** [None found] (Mumble §4)
- The closest evidence comes from healthy nurses learning to speak *softer*. Summary feedback after a block was kept better than feedback after every attempt. The app copies that schedule. [Moderate, by analogy] (Mumble §4)
- Speech recognition feedback made healthy adults speak more clearly within one session. But it responds to different features than human listeners do. [Moderate] (Mumble §4)

**What the app will not do**
- Cork, pen or pencil drills. They block the jaw opening that mumblers need. [None found for benefit] (Mumble §7)
- Mouth exercises without speech. [Moderate against] (Brief §4; Mumble §7)
- Tongue twisters and speed drills. [None found] (Brief §4)
- "Just slow down" as the goal. [Moderate against] (Mumble §7)
- A dB meter as the target, or clinical results (LSVT LOUD) presented as proof for healthy adults. (Mumble §7)

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

| Measure | What it shows about mumbling | Where it runs | Evidence for the measure | Status |
|---|---|---|---|---|
| Speech level, **relative to your baseline** | Too quiet | Phone | Phones track *changes* in level well at a fixed distance; absolute dB is unreliable [Moderate] (Mumble §5) | To validate (V3) |
| **Fade at phrase ends** (last word vs the rest of the phrase) | Trailing off | Phone | Works within one take, so distance cancels out. No study links excess fade to intelligibility [None found] | Experiment, shown as a hint only |
| Articulation rate, within your band | Rushing; words run together | Phone (+ Azure word timings) | Syllable-counting method matched human counts on Dutch [Moderate] | To validate (V7), in EN and FR |
| Pauses: count and placement | Run-on speech, or pauses in the middle of phrases | Phone (+ Azure word timings) | [Moderate] (Brief §3.4) | To validate (V7) |
| Pitch range, in semitones | Flat voice | Phone | Accurate on uncompressed phone audio [Moderate] | To validate (V1, V3) |
| Vowel length | Clipped, small vowels | Phone + Azure timings | [Mixed] (Add. §3.4) | To validate |
| Word endings (English) | Dropped final consonants | Azure en-US phoneme scores and omission flags | No validated detector [None found] | To validate (V4) |
| Word endings (French) | Dropped final consonants (*table*, *ministre*) | No validated method | [None found] | Self-judged only |
| Spectral tilt / 1–3 kHz energy | Dull voice; lack of projection | Phone, same device only | [Mixed] (Mumble §5) | Hidden experiment |
| Vowel space (sentence-level, VAI) | Open, distinct vowels | Phone | Fragile on phones; day-to-day reliability unknown [Mixed] | Hidden experiment |
| **Machine listener in noise** | Would a listener catch it? | Phone mixes café noise into the take; Azure speech-to-text (en-US or fr-FR) counts the keywords it got right | Tracks clarity changes, but not the same features as human listeners [Mixed] (Mumble §4–5) | A Check measure after calibration (V9) |

**Recording setup is locked**, because level and tilt depend on it:
- The app asks the browser to turn off auto-gain, noise suppression and echo cancellation. It stores the settings the phone actually applied. If the phone ignores the request, level trends stay hidden.
- A distance check at the start of each session: hold the phone at the same place (for example, a fixed hand-span from your mouth). The app compares your warm-up level with your usual level and asks you to adjust if it is far off.
- Same phone for all trend measures. A phone change starts a new "scoring era" (`design-options.md` §6.7).

Rules:
- A measure appears as a trend only if it is stable on repeat recordings (ICC ≥ .70 in V3).
- The machine listener is labelled "lenient", because speech recognition hides some errors (Brief §3.7).
- The noise level is set per person at week 0, so that your usual speech gets 60–80% of keywords. This leaves room to show gains.

## 6. The session

Every session keeps the four stages from `design-options.md`: warm-up, then **Say → Listen → Use → Wrap**. English and French sessions alternate. The default split is 50/50.

**10-minute session**

| Time | Stage | What happens |
|---|---|---|
| 0:00–0:40 | Warm-up and distance check | 2 sentences, "big and clear". The app checks your level against your usual level at the same distance. |
| 0:40–4:00 | **Say · clear pairs** | 4 sentences. For each one: say it your usual way, then "big and clear", with one sub-cue (for example "Open your jaw", "Finish every word ending", "Reach the back of the room"). Play both takes and answer "Which would your listener catch better?". After the 4 pairs, one summary card: "Changed: volume, vowel length. Not changed: endings." The next block's cue targets what did not change. |
| 4:00–6:00 | **Listen · machine listener in noise** | 4 unpredictable sentences at your normal pace. The phone mixes in café noise and asks the recogniser what it heard: "They heard: *le poison*…". You retry the missed word. |
| 6:00–9:30 | **Use · short talk** | A 45–60 second retell or opinion, 2–3 rounds. Round 1 has no cue: it shows your habitual speech. Then one cue, then "keep it". A summary after the last round shows pace, fade at phrase ends, and how clarity dropped from the start to the end. |
| 9:30–10:00 | Wrap | One cue for next time. No score. |

**Feedback schedule.** There is no live meter while you speak. You judge each pair yourself first. The app's numbers come once per block, as a summary. As a feature holds for 3 sessions, its summary appears less often. This follows the nurse study above (Mumble §4 [Moderate, by analogy]).

**Word endings.** Sentence banks load up on the endings that mumblers drop:
- French: *-ble, -tre, -dre, -pre, -cle* (*table, ministre, prendre, propre, cercle*). In casual Paris French, most such nouns lost at least one sound (Mumble §6 [Moderate]).
- English: final stops and clusters (*asked, helped, world, texts*).

**Optional "noisy room" mode.** Café noise plays in wired earbuds while you speak, at a capped safe volume. It fades out over sessions. Noise through headphones brings out clearer speech more than noise from a speaker (Mumble §3 [Moderate]). It is off by default: Bluetooth earbuds can switch the phone to their own low-quality microphone, so the R1 phone test must check this first.

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
| R2 Audio core + clarity signals | Reliable recording; locked mic settings; distance check; level, fade, pauses, rate and pitch on the phone, checked against Praat | Record-and-replay with a quality check and first clarity readings |
| R3 **Clarity core** | Real practice starts, in both languages | **Slice 1:** baselines (habitual and clear) in EN and FR, warm-up, clear pairs with compare player, self-judgement and block summaries, word-ending sentence banks, 5- and 10-minute sessions, weekly target, ZIP export. **Needs no cloud scoring.** |
| R4 Machine listener in noise | "Would they catch it?" | Café-noise mixing, per-person noise level, Azure speech-to-text in en-US and fr-FR, "They heard…" and retry |
| R5 Check recording and backup | Check 1 on time, and safe | Check flow; encrypted backup |
| R6 Short talk | Clarity in longer speech | Retell rounds, fade and drop measures, cue choice from unchanged features |
| R7 English sound support | Stress and the vowel pairs that cause mishearing | Stress compare mode, vowel pairs with Azure spoken phonemes, English word-ending check |
| R8 Trust levels and validation | Trustworthy hints | Detectors move up as they pass validation |
| R9 Check analysis and Progress | Honest progress | Re-scoring, ranges, Progress screen |
| R10 Panel and habit tools | Human judgement; staying with it | Listener panel, weekly voice note, if-then plan, comeback session |
| R11 Experiments (optional) | Test open questions on you | Front-camera jaw and lip feedback, pitch line, SpeechSuper pilot, Capacitor wrap if needed |

## 10. Main risks of this focus

| Risk | Mitigation |
|---|---|
| Clarity never carries over into everyday speech (no evidence either way) | Measure habitual speech first at every Check; weekly voice note; if-then plans; honest "no clear change" results |
| You gain little from trying (some talkers do; jaw anatomy differs) | The app finds the features you *can* change and targets them; results compare you only with yourself |
| The phone ignores the request to turn off auto-gain | Level trends stay hidden; fade, rate, pauses and pitch still work |
| Level varies with how you hold the phone | Distance check each session; trends use only relative changes |
| The fade detector means nothing for listeners | It stays a hint, never a goal, until a listener check supports it |
| Bluetooth earbuds switch to a poor microphone | Noisy-room mode is off by default and tested in R1 with wired earbuds |

## 11. Decisions

**Owner's answers (2026-09-25):**

| # | Decision | Answer |
|---|---|---|
| D1 | Which option | **B**, built in the order of section 9 |
| D3 | Platform, and which phone | **PWA on a Pixel 10 Pro XL (Android, Chrome).** The R1 phone test confirms it. If web audio fails, the fallback is a Capacitor Android app, which needs no Mac and no Apple fee. iOS-only work (audio session type, iOS Wake Lock quirks) drops to low priority, but the code stays standards-based. |
| D15 | Where clarity matters most | **Everyday talk.** Talk topics are everyday conversation: what you did, plans, short opinions, answers to quick questions. Delivery rehearsals for talks drop to an optional extension. |

**What the owner reported:** speech "looks mechanical" and the tongue and lips feel "heavy".
- This fits the low-effort pattern in section 3: small jaw, lip and tongue movements. The main cue, "big and clear", targets exactly this, through speech itself.
- It does not change the plan against mouth exercises without speech. They have no evidence of benefit (section 3).
- **Health note.** The app cannot tell a speaking habit from a medical cause. If the heaviness is new, getting worse, or comes with other changes (slurred speech, trouble swallowing, drooling, facial weakness, unusual tiredness when speaking), a doctor should check it first. A speech-language therapist (orthophoniste) can also assess articulation in one visit.
- Added to R11 as an optional experiment: front-camera feedback on jaw and lip opening. [Weak / research-grade] (Mumble §8)

**Defaults in force until the owner changes them:**

| # | Decision | Default |
|---|---|---|
| D4 | French variety | fr-FR |
| D6 | Human listeners | Friends if possible, at weeks 0 and 12. The app works without them. |
| D7 | English/French split | 50/50, alternating days |

Other decisions in `design-options.md` §8 keep their defaults.
