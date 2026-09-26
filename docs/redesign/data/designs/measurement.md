<!-- Source design 'measurement' (Measurement-and-technology-first). Input to design-options.md; not a final spec. -->

# Pronunciation Coach v2: measurement-first design

**Date:** 2026-09-24 · **Design angle:** measurement and technology first · **Status:** a proposal for you to choose from. Nothing here is decided until you choose.

**How to read this document**
- **Evidence tags.** "Brief §3.1 [Strong]" means section 3.1 of `docs/research/evidence-brief.md`, with its strength label. "Add. §2 #1 [Moderate]" means section 2, rank 1 of `docs/research/learner-profile-addendum.md`.
- **Technical claims.** I checked these on the web on 2026-09-24. Appendix A lists the claims with their sources. A claim I could not check is tagged **(unverified)**.
- **Decision boxes.** Each one marks a choice for you. I give a recommendation, but the choice is yours.
- **Numbers are working rules.** Thresholds such as "15–20 tokens" or "AUC ≥ 0.85" are heuristics, not research findings, unless a tag says otherwise.

---

## 1. Pitch

Pronunciation Coach v2 is a web app for your phone. It helps one French-speaking adult become easy to understand in English, and speak more clearly in French, in sessions of 5–15 minutes.

The design rests on one rule: **the app never shows you a verdict it cannot measure reliably on your voice and your phone.** Each measure starts hidden in a "measurement lab". This includes Azure's sound verdicts, the app's own pitch and timing analysis, and speech-recognition checks. A measure reaches your feedback only after it passes three checks on your own recordings:
- **Repeat check:** it gives the same answer when you say the same thing twice.
- **Known-answer check:** it tells apart right and wrong versions that you say on purpose.
- **Listener check:** it agrees with human listeners.

Training uses the methods with the best support. Listening practice with many voices comes first. Speaking practice with specific feedback and a retry follows. Both are spread over weeks. They target the features that most affect being understood: word stress, three English vowel contrasts, /h/, and pausing. The app judges progress on unseen words, new prompts and free speech, never on practice scores.

The technology has two parts:
- a thin phone app that captures clean, uncompressed audio;
- a small Python service that runs Azure, Praat-based acoustic analysis and forced alignment, and stores every score with its origin.

Why this design wins: the evidence says automatic scores are noisy (Brief §3.7) and that practice gains often fail to reach free speech (Brief §1). A coach that is honest about what it can measure, and that measures transfer, is the only kind whose "you improved" you can believe.

---

## 2. Goals and success measures

### 2.1 What "it works" means for you

| Outcome | How it is measured | When | Evidence |
|---|---|---|---|
| **Primary: English free speech is easier to understand** | A blind listener panel of 3 people rates 20–30-second clips on a 9-point ease scale (comprehensibility) and types out sentences (intelligibility: the share of words they get right). Old and new clips are mixed, shuffled and undated. | Baseline, then at the end of each 8-week cycle | Brief §2 #1–2 [Strong]; Brief §3.7 listener noise [Moderate] |
| Target sounds improve on **words you never practised** | Error rate on held-out words (words kept out of practice), judged only by trusted measures (see 4.3) | Every Progress Check, plus a delayed probe 2–4 weeks after training | Brief §2 #2 [Strong]; Brief §7 #1 |
| You can **hear** the trained contrasts in new voices | Listening accuracy on held-out voices and on natural human recordings | Every Progress Check | Brief §3.1 [Strong] |
| **Fluency on new prompts** | Articulation rate (syllables per second, pauses excluded), pauses inside clauses, and mean length of run (average syllables between pauses), all on prompts you have not practised | Every Progress Check | Brief §3.4 [Moderate] |
| A **lenient automatic check** of intelligibility | The share of intended words that speech recognition gets right on hard-to-predict sentences. It is labelled "rough check". | Every Progress Check | Add. §5 #12 [Moderate/Mixed] |
| **French: everyday speech gets clearer** | Clarity measures in your *usual* (unprompted) speech move toward your own "clear" style. Keyword accuracy of speech recognition on your speech mixed with noise goes up. At cycle end, 2–3 French listeners check it in noise. | Every French Progress Check | Add. §3 [Strong that clear speech helps listeners; None found for lasting change] |

**Size of change that counts.** A change counts as real only when it is larger than your own measurement noise. The app measures that noise by having you record the same "anchor" sentences twice at every check (Brief §3.7, reliable change index [Moderate]). As a practical target, aim for comprehensibility up by at least 1 point on the 9-point scale by the end of cycle 2 (week 16). This number is a heuristic.

**French is an experiment.** No study shows that clear-speech training lasts in everyday speech (Add. §3.2 [None found]). The app therefore runs the French track as an experiment with a clear readout, not as a promise.

### 2.2 How the app knows its own measures work

- Every measure you can see has a validation record. It holds the measure's repeat-check error, its known-answer accuracy and its agreement with listeners (see 4.3 and section 6).
- No verdict ever comes from an unvalidated measure.
- Every stored score carries its origin: provider, provider model date, code version, device, browser and capture settings. Microsoft changes its scoring models without notice (Brief §3.7 [Strong]).
- A monthly re-score of fixed reference clips catches scorer drift (a change in scores caused by the scorer, not by you) within one month.

### 2.3 Practice goals

- At least 4 sessions a week in at least 6 of every 8 weeks.
- At least 7 active weeks per cycle (Add. §4.1 [Weak; secondary]).
- The app shows sessions per week. It never shows a streak.

### 2.4 What does not count as success

These do not count: scores during a session, "retry until green", or Azure accuracy rising on words you have practised. Practice performance is not learning (Brief §3.5 [Moderate]; Brief §4 table).

### 2.5 Rules for changing course (heuristics)

- After 8 weeks at 4 or more sessions a week, if listening on held-out voices has not moved beyond noise: check the voices and the content.
- If listening improves but speaking on held-out words does not: shift time from listening to speaking with feedback.
- If a measure fails validation twice: remove its verdicts. Keep listening-only training for that target.
- If you do fewer than 3 sessions a week for 3 weeks: shorten the default session and move the reminder time.

---

## 3. Product design

### 3a. Modules, in priority order

**English (second-language track).** English uses the US English scoring model and US English model voices, because Azure's richest outputs exist only for US English (Brief §3.7 [Strong]). Vowels use US labels. Keywords name each vowel ("FLEECE" is the vowel in *sheep*).

| # | Module | What you do | Measured by | Evidence |
|---|---|---|---|---|
| 1 | **Word stress** (listen first, then speak) | *Listen:* hear a word in one of 4 voices and tap its stress shape (●○○, ○●○, ○○●). A harder mode plays 2–3 words, and you tap their shapes in order (sequence recall). Each word's stress pattern is shown and quizzed. *Speak:* say words with 3+ syllables, suffix families (PHOtograph → phoTOgraphy → photoGRAPHic) and English words that look French. | Listening: the app's own answers (direct). Speaking: the app's own prominence measure (length, pitch, loudness, vowel reduction) over Azure's syllable boundaries. It starts in "compare" mode (no verdict) until validated. | Add. §2 #1 [Moderate as priority; Weak for training]; Add. §2 notes: sequence tasks reveal the problem [Moderate]; knowing the pattern helps word recognition (Tremblay 2008) [Moderate]; a game worked as well as rules [Weak] |
| 2 | **Vowel pairs:** FLEECE–KIT /i–ɪ/ (sheep/ship), GOOSE–FOOT /u–ʊ/ (pool/pull), TRAP–STRUT–LOT /æ–ʌ–ɑ/ (cat/cut/cot) | High variability phonetic training (HVPT): pick the word you heard, among 4–6 voices, with instant feedback. Then say the words. Feedback names the vowel it probably heard. | Azure US English "spoken phoneme" (the sound you most likely said), plus vowel length from Azure phoneme timings | Add. §2 #2 [Moderate]; Brief §3.1 [Strong listening, Moderate speaking] |
| 3 | **/h/** | Listen to heat/eat pairs. Decide "Is this a real word?" ("usband"). Say both /h/ words and vowel-initial words. Dropped /h/ and added /h/ are tracked separately. | Azure phoneme verdict for dropped /h/. An own detector of breath noise before the vowel for added /h/ (lab only at first). | Add. §2 #3 [Moderate; one study]; Add. §6: an /h/-only reward could cause wrong insertions (reasoned) |
| 4 | **Fluency in free speech** | Tell the same picture story 3 times with shrinking time limits. Get pace and pause feedback between rounds. Use a new story next session. | Azure speech-to-text word timings, plus the app's own pause detection and clause boundaries | Brief §3.4 task repetition [Moderate]; Add. §2 #4 [Moderate] |
| 5 | **Sentence stress and phrasing** (from week 6) | Correction dialogues: "Did you rent a house?" "No, I rented a FLAT." | Own prominence measure over Azure word boundaries | Brief §3.3 (Hahn 2004) [Moderate]; Brief §5.1 #2 [Moderate] |
| 6 | Weak forms (cycle 2; listening first) | Hear and pick "to/tuh" and similar forms. Some production practice. | Listening answers. Speech is not scored at first. | Add. §2 #5 [Mixed]; Brief §5.1 lower priority |
| — | **Diagnose-only probes:** consonant clusters, /θ ð/, question intonation | These appear in the baseline and in Progress Checks only. A module is added only if your data show frequent errors. | Azure word and phoneme verdicts | Clusters: Brief §5.1 #1 [Moderate, correlational, not French-specific]. /θ ð/: Add. §2 #7 [Not searched]. Intonation: Add. §2 #6 [Unverified] |

**French (native clarity track).** The French second-language list (nasal vowels and so on, Brief §5.2) does not apply, because French is your first language.

| # | Module | What you do | Measured by | Evidence |
|---|---|---|---|---|
| 1 | **Paired recordings** | Say the same hard-to-predict sentence twice: first your usual way, then clearly. Concrete cues ("open your jaw more, finish every final consonant, give each vowel its full shape"). A named listener ("a colleague on a bad phone line"). | The difference between usual and clear on: pace, pitch range, vowel length, energy in the 1–3 kHz band, and a noise test by speech recognition | Add. §3.3 #1–2 [Moderate]; Brief §5.3 [Moderate] |
| 2 | **Clear at your normal speed** | Stage 1: slow and clear. Stage 2: keep the clarity at your usual pace. The app never rewards slowness alone. | Pace compared with your usual baseline, while the other clarity measures hold | Add. §3.3 #3 [Weak]; Add. §3.2 speed is not the key [Mixed/Moderate] |
| 3 | **Semi-free retell** | Retell a story for 60–90 seconds. | Clarity measures in the first 30 s compared with the last 30 s ("clarity drop") | Add. §3.3 #5 [Weak] |
| 4 | **Vowel probes** | Say "Le mot ___ me plaît" with the crowded vowel sets /i y e ø ɛ œ/ and /u o ɔ/. | Vowel length, and how distinct and how consistent the vowels are, from formants (the mouth resonances that make vowels differ). Lab only until validated. | Add. §3.3 #6 [Moderate for change in clear speech; Mixed for link to intelligibility; phone reliability unknown] |
| 5 | **Warm-up** | Say 3 "over-enunciated" sentences at the start. | Not scored | Add. §3.3 #7 [Weak] |
| 6 | **Noise listener** (optional, later) | Quiet background chatter plays in your earbuds, with the volume capped. It fades out over the weeks. | As for module 1 | Add. §3.3 #4 [Moderate for the immediate effect; untested for lasting effect] |

### 3b. Session design

**Rules the session builder follows**
- On a new contrast, a listening block comes before the speaking block. The two stay in separate blocks while your listening accuracy on that contrast is below 80% (a heuristic). Evidence: Brief §7 #4; Brief §3.1, Baese-Berk & Samuel [Weak, lab listeners].
- No item is repeated more than 3 times in a row (Brief §7 #6). After a fix, the next item is a new word with the same target, for variety (Brief §3.2 [Weak]).
- A session holds at most 6 review items.
- Progress Checks never show feedback.

**A typical day.** Week 3, the second session of the week. Current targets:
- stress: listening accuracy 78%, speaking in compare mode;
- FLEECE–KIT: speaking, verdict trusted;
- /h/: listening only this week.

Reviews due: 4 stress words (3-day interval) and 2 FLEECE–KIT words (7-day interval).

**5-minute session**

| Time | Block | What happens |
|---|---|---|
| 0:00–0:15 | Start | Tap Start. The mic opens once for the whole session. The app measures room noise for 1 s while it shows "Today: stress + ship/sheep". If the room is too noisy, it says so. |
| 0:15–1:45 | Listen: stress | 14 trials in 4 training voices. Hear a word and tap its shape. Instant right or wrong, with replay. |
| 1:45–4:15 | Speak: FLEECE–KIT | About 8 attempts on 6 new words. Say it → feedback card (arrives in about 2–3 s) → correct it yourself without the model → next word. |
| 4:15–4:45 | Review | 2 due stress words, with feedback. |
| 4:45–5:00 | Wrap-up | Attempts per target today, the next session's focus, sessions this week. |

**10-minute session (the default)**

| Time | Block | What happens |
|---|---|---|
| 0:00–0:15 | Start | As above. |
| 0:15–2:00 | Listen: stress | 16 trials, 4 of them sequence recall. |
| 2:00–4:00 | Speak: stress (compare mode) | 6 attempts. Your syllable bars appear next to the model's. No verdict yet. |
| 4:00–5:30 | Listen: /h/ | 14 trials: heat/eat identification and "Is this a real word?" |
| 5:30–7:30 | Speak: FLEECE–KIT | 7 attempts with the full feedback loop. |
| 7:30–8:45 | Review | 4 due items, mixed. |
| 8:45–9:40 | Use it | Answer one question in 15–20 s using a target word ("What would you photograph on holiday?"). Feedback covers that target only (Brief §2 #13 [Weak to Moderate]). |
| 9:40–10:00 | Wrap-up | As above. |

**15-minute session.** It runs the 10-minute session, then:

| Time | Block | What happens |
|---|---|---|
| 10:00–14:30 | Fluency (English days) | Tell one picture story 3 times, in 60 s, then 50 s, then 40 s. After each round, a 10-s card compares your pace and your pauses inside phrases with your baseline range and gives one tip. The shrinking time limits follow the 4/3/2 idea (Brief §3.4 [Moderate]). **On French days** this block becomes 3 paired sentences plus a 60-s retell. |
| 14:30–15:00 | Wrap-up | |

**10-minute French session**

| Time | Block | What happens |
|---|---|---|
| 0:00–0:15 | Start | |
| 0:15–1:00 | Warm-up | 3 over-enunciated sentences. |
| 1:00–4:30 | Paired recordings | 5 hard-to-predict sentences, each said usual then clear, with a listener card. After each pair: the change in vowel length and pitch range. The noise-test result arrives in the report. |
| 4:30–6:30 | Vowel probe | 8 words in "Le mot ___ me plaît", clear style. The results are stored for the lab. |
| 6:30–9:00 | Retell | 90 s, clear at your normal pace (stage 2 from week 3). |
| 9:00–10:00 | Report | 2–3 measures that changed compared with your usual speech, and one cue for next time. |

**Comeback session.** After 5 or more days away, you get a 3-minute session: 8 listening trials, then 4 speaking attempts on your easiest current target. There is no backlog. The review queue is capped.

**Week and cycle plan.** The default is 4 sessions a week: 3 English and 1 French. You choose the days. A cycle lasts 8 weeks, plus a delayed probe.

| Week | English | French | Measurement |
|---|---|---|---|
| 0 | Onboarding in 3 × 10 minutes: goal, if-then plan, listening screener, English baseline | French baseline | Baseline Progress Check; anchor sentences recorded twice |
| 1 | Stress: listen. FLEECE–KIT: listen and speak. | Paired recordings | Calibration tasks, 2 min per session (section 6) |
| 2 | + /h/: listen. Stress: speak in compare mode once listening reaches 80%. Fluency retell begins. | + retell | Calibration continues |
| 3 | /h/: speak | Stage 2 (clear at normal pace) | Listener panel round 1 (validation labels) |
| 4 | GOOSE–FOOT: listen | Vowel probe | **Progress Check 1** |
| 5 | GOOSE–FOOT: speak. TRAP–STRUT–LOT: listen. | | |
| 6 | TRAP–STRUT–LOT: speak. Sentence-stress dialogues. | | |
| 7 | Contrasts mixed together. Stress continues. | | |
| 8 | | | **Progress Check 2** + listener panel round 2 (outcome ratings) |
| 9–12 | Cycle 2 starts. The priority model re-ranks the targets. | | Week 11–12: delayed probes, which also serve as the cycle-2 baseline |

**Why the start dates are staggered.** Targets start in different weeks. At Progress Check 1, TRAP–STRUT–LOT has not been trained yet, so it serves as a control. If it stays flat while trained targets improve, the change probably comes from training, not from time or a scorer update. This is a "multiple baseline across targets" single-learner design (Brief §3.7 [Moderate]).

**Spacing.** Each item set comes back 1, 3, 7 and 14 days after its training block. After it passes a delayed probe, it comes back every 30 days. The intervals are fixed; there is no adaptive algorithm (Add. §5 #8 [Moderate]; Brief §3.5 [Strong in general; Weak for pronunciation]).

**Dose.** The app counts attempts per target, not minutes (Brief §3.5 [Weak]). Stress needs about 4 hours in total, which means about 12–15 weeks at 4 sessions a week, so it continues into cycle 2 (Add. §4.1). Vowel pairs get about 8 sessions each. This is a design guess (Add. §2 #2).

### 3c. Screens and flows

| # | Screen | Main elements |
|---|---|---|
| 1 | **Today** | Sessions-this-week ring (e.g. 2/4), three buttons (5 / 10 / 15 min), language chip (EN/FR), next Progress Check date, one line on today's focus |
| 2 | **Session player shell** | Block progress bar, block title, pause and exit. Exiting keeps everything done so far. |
| 3 | **Room check** (inline, about 1 s) | Level meter, noise verdict (OK / noisy / too noisy), a Bluetooth-mic warning |
| 4 | **Listening trial** | Auto-play with a replay button; 2–3 large choices (words or stress shapes); instant right or wrong; "hear both" buttons; progress dots |
| 5 | **Speaking trial** | Prompt word or sentence (the stress pattern is optional and is hidden on test items); a large mic button (tap to start; stops itself after silence); live level; a "checking…" state |
| 6 | **Feedback card** | One message, a small visual (syllable bars or vowel pair), a "Try again — without the model" button, then "Hear the model", a "That was right" button, and a "Details" drawer |
| 7 | **Retell** | Picture panels, a round counter (1/3), a countdown, a between-round card (pace, pauses inside phrases, one tip) |
| 8 | **French pair** | Listener card, step 1 "usual" / step 2 "clear", and a difference card with 2–3 measures |
| 9 | **Session summary** | Attempts per target, listening accuracy per contrast, what comes back and when |
| 10 | **Progress** | Target cards with range bars (an interval, not a point), Progress Check results, "scorer changed" markers, a before/after player |
| 11 | **Progress Check** | Test-mode banner, no feedback, split into 2 short parts |
| 12 | **Onboarding and diagnostic** | Goal, weekly target, if-then plan, reminder time, variety settings, listening screener, baseline recordings |
| 13 | **Settings and data** | Reminders, weekly target, voices, capture settings, export, "delete all", privacy notes |
| 14 | **Measurement Lab** (developer area) | Calibration recordings, repeat-check results, known-answer results, trust levels, per-measure charts, re-score button |
| 15 | **Listener Panel** (a separate web page for raters) | Consent, clip player, the task (type what you heard / which word / which syllable was strongest / 9-point ease), attention checks |

**Flows**
- **First launch:** pair the device → onboarding (screen 12) → first 5-minute session.
- **Daily:** Today → session player (blocks) → summary.
- **Check day:** Today shows "Progress Check due" → 2 parts across 1–2 days → results appear once all analyses finish.
- **Comeback:** after 5+ days away, Today offers the 3-minute session.

### 3d. Feedback design

**After a listening trial.** You get right or wrong at once, with buttons to hear both words. Instant feedback on identification is the tested format (Brief §3.1 [Moderate for task type]).

**After a speaking attempt**
1. **Short wait.** The result arrives in about 2–3 s. On about 1 trial in 4, the card first asks: "Did that sound like *ship* or *sheep*?" Two reasons: estimating your own error before the result helped learning in lab motor tasks (Brief §3.2 [Weak]), and self-ratings asked on every trial backfired (Brief §3.6 [Weak]). Over time, the app shows how well your self-judgement matches the measure.
2. **One message.** It covers the single highest-priority error that a trusted measure detected. The wording is careful. Examples:
   - "*ship* probably sounded like *sheep*. Make the vowel shorter and more relaxed."
   - "We probably heard phoTOgraph. Aim for PHOtograph: make PHO longer and higher, and let *-to-* go weak."

   Evidence: specific corrective feedback [Moderate]; 1–2 errors per attempt [Weak] (Brief §2 #5).
3. **Self-correction first.** "Try again — without the model." A correct self-correction counts as stronger evidence than a correct repeat right after hearing the model (Brief §3.2; prompts versus recasts [Mixed]).
4. **Then the model.** If the retry is still off, the model plays in one of the training voices, you try once more, and the app moves on (at most 3 attempts in a row).
5. **A new word with the same target** comes next.
6. **An unclear result** is labelled "Couldn't judge this one clearly — no verdict". It is excluded from your statistics, never shown as an error.
7. **"That was right"** logs a dispute and puts the clip in the next listener-panel round.
8. **The Details drawer** holds Azure's accuracy score, labelled "closeness to a US model voice". It is a secondary number only (Brief §2 #1 [Strong]).

**Compare mode** (stress, before its measure is trusted). You see your syllable length bars and pitch dots next to the model's, with no verdict. The pitch display is labelled experimental (Brief §2 #14 [Weak]).

**After free speech.** The card compares pace and pauses inside phrases with your own baseline range and gives one tip ("keep your pace; pause between ideas, not inside them"). It never rewards speed itself, because both too slow and too fast hurt (Brief §3.4 [Moderate]).

**After a French pair.** The card names measures that changed and measures that did not. Example: "Clear version: vowels 22% longer ✓, pitch range +2.5 semitones ✓, crispness unchanged. Noise test: 8/10 words understood, compared with 6/10." It never gives a single "clarity score" (Add. §3.4 [Mixed]).

**What feedback never does:** colour every word; show single-take scores as progress; show a verdict from an untrusted measure.

### 3e. Content plan

| Set | Items (cycle 1) | Held out for checks | How it is produced | How it is validated |
|---|---|---|---|---|
| Stress words | 240 words: 3+ syllables, suffix families, cognates that look French, 20 noun/verb pairs (REcord/reCORD) | 80 | CMU Pronouncing Dictionary stress marks; TTS in 6 US/Canadian/UK voices (4 for training, 2 for tests); natural recordings from Lingua Libre (CC BY-SA). Deliberately mis-stressed versions come from SSML IPA stress marks (SSML is Azure's markup for controlling TTS pronunciation). | A second dictionary cross-check. The stress measure runs on native voices (it should reach ≥95% there). Azure scoring runs on the TTS output. |
| FLEECE–KIT | 40 pairs | 12 pairs | TTS in North American voices only, because other accents shift these vowels; plus Lingua Libre | Azure spoken phoneme on the TTS output must match the target, and a length check |
| GOOSE–FOOT | 20 pairs + 20 near pairs | 12 | Same | Same |
| TRAP–STRUT–LOT | 30 sets | 10 | Same | Same |
| /h/ | 40 pairs + 30 non-words ("usband") | 12 pairs + 10 non-words | TTS; non-words via SSML phonemes | Azure check on the /h/ phoneme |
| Sentences | 60 target sentences; 40 correction dialogues | 20 | Written by you and an AI helper at build time, then reviewed | Stress and vowel tags checked by script |
| Unpredictable English sentences (for the recognition check) | 40 | all | Template plus word lists (semantically unpredictable sentences, or SUS) | Native TTS must reach ~100% recognition |
| Fluency prompts | 24 picture stories + 12 opinion prompts; each is used once per cycle | 8 for checks | Openly licensed or generated picture panels (decision open) | Intended message written down for each |
| French SUS | 200 | 40 | Templates plus Lexique 3.83 frequency lists | You review them (you are a native speaker) |
| French vowel probes | 60 words | 20 | Lexique; carrier "Le mot ___ me plaît" | You review them |
| French retell prompts, listener cards | 30 + 20 | 6 | Written | — |
| Anchor sentences | 10 EN + 10 FR, fixed for life | — | — | Used to measure your noise |
| Known-answer sets | 20 EN contrasts said both ways, 20 stress words said right and wrong, 10 /h/ pairs, 10 FR usual/clear pairs | — | You record them during calibration | — |
| Background chatter ("babble") for noise tests | 1 track per language | — | Made by mixing 6–8 TTS voices reading unrelated text (no licence issue) | Level set by script |

**How content is built.** Source lists live in the repo as CSV or YAML files. A build script calls Azure TTS once, checks each voice (Azure scoring and the app's own measures on the TTS output), drops items that fail, writes a manifest with file hashes, and publishes the audio as static MP3 files. **There is no TTS proxy at run time**, which closes v1's open TTS proxy. Four to six voices is the default (Brief §3.1 [Mixed on number]). Evidence for TTS voices is thin (Brief §3.1 [Weak]), so tests always include natural recordings, and the app flags a gap: rising scores on TTS items but not on natural items.

### 3f. Progress measurement

**Progress Check design.** Brief §7 #1 [Strong principle; Moderate design].
- **English part A (about 10 min):**
  - listening test with held-out voices and natural recordings (16 stress trials, 24 vowel trials, 12 /h/ trials);
  - reading held-out words (16 stress, 16 vowel, 10 /h/, 6 cluster probes);
  - 5 anchor sentences, twice.
- **English part B (about 10 min):**
  - 60-s new picture story and 60-s opinion (free speech, with a known intended message);
  - 8 unpredictable sentences for the recognition check;
  - delayed-probe items;
  - 5 anchor sentences, twice.
- **French (about 10 min):** 10 SUS said your usual way (no clarity instruction), a 90-s retell, 12 vowel-probe words (usual, then clear), anchor sentences twice.
- **Listener panel** at baseline and at each cycle end:
  - 3 English listeners (a mix of native and proficient non-native users, to match the "international listener" goal);
  - 2–3 French listeners for the noisy French clips.

  Clips from different dates are mixed, shuffled and undated, with fixed reference clips and 10% repeats to check rater consistency. Raters are not told the intended message (Brief §3.7 [Moderate]).

**How the target priority model works.** Brief §7 #3 [Moderate English; Weak French].
- *Priority = prior weight × estimated error rate × need.*
- **Prior weight** comes from the addendum ranking. It is stored as data and labelled provisional: stress 1.0, FLEECE–KIT 0.8, TRAP–STRUT–LOT 0.7, GOOSE–FOOT 0.6, /h/ 0.6, fluency 0.7, weak forms 0.4, intonation 0.3, /θ ð/ 0.1.
- **Estimated error rate** uses a beta-binomial estimate. This is a statistical method that gives each rate a likely range and pulls rates based on few tokens toward the average. Only verdicts from trusted measures count; "unclear" tokens are excluded.
- **A target counts as weak** only after 15–20 tokens, in at least 5 different words, over at least 3 sessions (Brief §2 #10 [Weak heuristic]).
- **Targets are ranked by range, not by average.** The app uses the lower end of the 80% range, so a target is never called weak on thin data.
- **A target graduates** when the upper end of its error range is below 20% on untrained words at a delayed probe (at least 7 days after its last practice), **and** listening on held-out voices is at least 90%.

**How noisy scores are handled**
- The app never shows a single-take score as progress.
- Progress uses intervals and reliable change. The reliable change index flags change larger than your measured noise.
- Across several checks, the app also reports NAP (non-overlap of all pairs: the share of later results that beat earlier ones) (Brief §3.7 [Moderate]).
- Charts break into **epochs** (periods with one fixed scorer and device) whenever the Azure model or your device changes. Because every recording is kept, the app re-scores baseline audio with the new model, so comparisons stay fair.

### 3g. Habit and motivation design

| Feature | Detail | Evidence |
|---|---|---|
| Concrete goal tied to real use | "Be understood the first time in international calls" | Brief §7 #11 [Moderate to Weak] |
| If-then plan | "After my morning coffee, I do one 10-minute session." Chosen at onboarding and editable. | Brief §3.6 [Moderate; small effect after bias correction] |
| One reminder at a time you choose | Web Push to the home-screen app (iOS 16.4+ and Android), or a calendar file with a repeating event (the cheap and robust option) | Add. §5 #7 [Weak] |
| Weekly target, not a streak | A ring showing sessions this week. A missed day never resets anything. | Brief §3.6; Lally 2010 [Weak] |
| Comeback session | 3 minutes, no backlog | Add. §4.1 [Weak] |
| Monthly before and after | The same anchor sentence from baseline and from today, plus plain statements of what is now reliable | Brief §7 #11; self-efficacy correlates with achievement [Moderate, correlational] |
| Explaining the harder practice | One line explains why items get mixed and why a new word follows a fix | Brief §3.5, Abel & de Bruin [Moderate, non-language] |
| Weekly real-life task | "Use two stress words in a real conversation." Logged with one tap. | Brief §3.6, Derwing et al. [Weak] |
| Dose made visible | "18 attempts on FLEECE–KIT this week", not minutes | Brief §3.5 [Weak] |

### 3h. What is deliberately left out

| Left out | Why |
|---|---|
| Speed ladders and tongue twisters | No evidence of benefit; they reward speed (Brief §4 [No evidence]; Add. §6) |
| A single overall pronunciation score as the main metric | It measures closeness to a native model, which is close to measuring accent (Brief §2 #1 [Strong]) |
| Rhythm scores (%V, nPVI) as targets | Unreliable across speakers (Brief §3.3 [Moderate]; Add. §6 [Mixed]) |
| /θ ð/ training in cycle 1 | Evidence not searched; diagnose only (Add. §2 #7) |
| An AI voice-chat conversation partner | Weak evidence for AI voice chat, cost, and scoring free speech is less reliable (Brief §3.4 [Weak]; Brief §3.7). Retell tasks cover meaningful speaking. |
| An audio AI model as judge | Poor agreement with raters (Brief §3.7 [Weak]) |
| General dictation as the pronunciation judge | It accepts mispronounced words (Add. §6 [Moderate]) |
| Shadowing | Weak evidence and no French-L1 data (Add. §5 #13). A candidate A/B experiment for cycle 2. |
| A vowel chart shown to you | Formants from phones are unvalidated (Brief §4). Lab only. |
| A pitch line matched point by point | Untested, and it may frustrate learners (Brief §3.3 [Weak]) |
| Streaks, leaderboards | No evidence they help learning (Brief §3.6) |
| Mouth exercises | No evidence (Brief §4) |
| Background or lock-screen practice on iOS | The platform blocks it (Add. §4.2 [Moderate]) |
| Voice-care tips counted as progress | Not clarity training (Add. §6 [Weak]) |
| On-device AI models | Not needed for the first release; large downloads (Add. §4.2) |

---

## 4. Technical architecture

```
PHONE (web app, TypeScript)              YOUR SERVER (Python)                   CLOUD
+---------------------------+  HTTPS  +------------------------------+     +-------------------+
| UI + session player       |-------->| API, auth, scheduler         |---->| Azure Speech      |
| Capture (AudioWorklet)    | WAV+meta| Scoring pipeline             |     |  US English PA:   |
| Quality gate, silence     |         |  - Azure adapter (Python SDK)|<----|  IPA, spoken      |
|   detection, level meter  |<--------|  - Parselmouth (Praat) DSP   |     |  phoneme, prosody,|
| Live pitch (display only) | results |  - MFA align_one (aligner    |     |  syllables        |
| Listening player (offline)|         |    container)                |     |  Speech-to-text   |
| Content cache (service    |         |  - spaCy clauses, stats      |     |  en-US / fr-FR    |
|   worker), outbox         |         | SQLite + FLAC audio + backups|     +-------------------+
+---------------------------+         +------------------------------+     (optional pilot:
                                                                             SpeechSuper)
```

### 4a. Client platform

| Option | Pros | Cons |
|---|---|---|
| **P1. PWA** (Progressive Web App: a website you install to the home screen): React + Vite + TypeScript | One codebase; no app store; fast updates; your existing skills | iOS audio quirks; possible repeated mic prompts in home-screen mode (Add. §4.2 [Weak]) |
| P2. PWA wrapped in Capacitor (a native shell around the same code) | Native audio control if iOS misbehaves | Apple developer account ($99 a year, unverified) and a native build chain |
| P3. React Native / Expo | Best native audio | A UI rewrite; much more work solo |

> **Decision D1: client platform.** Recommendation: **P1**, with P2 as a fallback if the week-1 capture test fails on your phone. Please tell me your phone model and OS version. The iOS risk is real; the Android risk is small.

### 4b. Audio capture pipeline (iOS and Android)

1. **Open the mic once per session**, on your first tap. Call `getUserMedia` with `channelCount: 1` and `echoCancellation`, `noiseSuppression` and `autoGainControl` all set to false (automatic volume control is called AGC). Then read what the browser actually applied with `track.getSettings()` and store it. On Chrome, AGC turns off only when echo cancellation is off. Safari's handling of these switches is inconsistent: one report says it records stereo when echo cancellation is off. So the app always downmixes to mono. Whether AGC on or off gives better Azure scores is unknown (Add. §4.2 [None found]). The week-1 test compares both on your phone.
2. **One AudioContext per session.** Create it at the device's native rate (usually 48 kHz) and resume it on each take. Never create a new one per take; this fixes v1's leak. Handle Safari's "interrupted" state.
3. **Capture with AudioWorklet.** An AudioWorklet is a browser feature that processes audio as it arrives. It posts ~20 ms chunks of raw samples to a Web Worker (a background script). The worker downsamples to 16 kHz with an anti-alias filter and converts to 16-bit PCM (uncompressed audio samples). A 300 ms pre-roll buffer keeps the start of each word.
4. **Stop on silence.** A voice-activity detector (VAD: software that detects when someone is speaking) ends a take after about 0.8 s of trailing silence, or at the item's maximum length: 4 s for words, 12 s for sentences, 90 s for free speech. Scripted takes stay under Azure's 30-s limit for pronunciation assessment.
5. **Check quality on the phone** before upload:
   - clipping above 0.1% of samples → retake;
   - peak level below −30 dBFS → "move closer";
   - SNR (signal-to-noise ratio) below 10 dB → retake; below 15 dB → a warning;
   - speech length far from what the item needs → retake;
   - a Bluetooth headset mic → warning, because many headsets send narrowband audio (unverified per model).
6. **Build a WAV file and upload it** with its metadata. If the network drops, the upload waits in an IndexedDB outbox. IndexedDB is the browser's local database.
7. **When the page is hidden:** abort and discard the take and stop the mic tracks. Re-arm the mic on return. iOS stops capture in the background anyway (Add. §4.2 [Moderate]).
8. **Fallback without AudioWorklet** (very old browsers only): MediaRecorder, with the format probed via `isTypeSupported` (audio/mp4 first on iOS). The server decodes it to 16 kHz WAV and marks the take as "compressed". Compressed takes are excluded from formant and energy measures (Add. §4.2 [Moderate]).
9. **Store with every take:** browser, OS, sample rate, applied settings, input device label, noise floor and SNR.

### 4c. Scoring and analysis per language and feature

Everything that produces a score runs **on the server**, in one place, with one set of provider adapters and one record of each score's origin. The phone shows only instant, non-scoring signals: level, room noise, silence stop, timer, and a live pitch trace for display.

| Feature | Lang | Primary measure | Tool | Runs on | Fallback | Starting trust |
|---|---|---|---|---|---|---|
| Vowel identity (FLEECE–KIT etc.) | EN | Top spoken phoneme (IPA, NBestPhonemeCount = 5) + phoneme accuracy | Azure US English PA, via the Python Speech SDK | Server → Azure | Vowel-length ratio from Azure phoneme timings; formants (Parselmouth, normalised to your own vowels); listener panel | Lab |
| Vowel length | EN | Duration of the vowel phoneme | Azure phoneme offsets and durations | Server | MFA alignment | Lab |
| Dropped /h/ | EN | /h/ phoneme accuracy + spoken phoneme | Azure | Server | Own breath-noise detector | Lab |
| Added /h/ | EN | Breath (aperiodic) energy 40–120 ms before the first vowel of vowel-initial words | Parselmouth + Azure word timings | Server | Listening training only | Lab |
| Word-stress placement | EN | Prominence per syllable (vowel length, mean pitch in semitones relative to your median, peak loudness), plus the Azure spoken phoneme on expected schwa as the reduction cue | Own model over **Azure syllable boundaries** (US English only) | Server | Compare mode without a verdict; SpeechSuper stress output (pilot, D4); listener panel | Lab (hard: one research system caught only 49% of real errors, Add. §4.2 [Unverified]) |
| Sentence stress | EN | Most prominent word compared with the expected focus word | Own model over Azure word timings | Server | Compare mode | Lab |
| Pauses, pace (scripted) | EN/FR | Silent pauses ≥ 250 ms, articulation rate | Parselmouth loudness + word timings (Azure for English, MFA for French) | Server; live estimate on phone | Praat "syllable nuclei v3" script (de Jong et al. 2021) | Experimental quickly (easy to check by ear) |
| Free-speech fluency | EN | Articulation rate, pauses inside clauses, mean length of run | Azure speech-to-text (US English) word timings; spaCy clause boundaries (spaCy is an open-source text parser); syllable counts from CMUdict | Server | Syllable-nuclei script (no transcript needed) | Lab → Experimental after 20–30 hand-checked clips (Brief §7) |
| Closeness to a native model | EN | Azure accuracy and prosody scores, break and monotone flags | Azure (prosody costs extra) | Server | — | Details drawer only |
| Rough intelligibility | EN | Word accuracy against the intended text on unpredictable sentences | Azure speech-to-text (optional second opinion: Whisper on the server) | Server | — | Labelled "rough check" |
| Listening accuracy | EN/FR | Your answers | The app | Phone | — | Trusted (direct) |
| Pace, pitch range | FR | Articulation rate; pitch range in semitones (10th–90th percentile) | Parselmouth | Server; live meter on phone | — | Lab → Experimental |
| Vowel length, distinctness, consistency | FR | Durations; F1/F2 formant spread and scatter (normalised) | **MFA French** `align_one` (a forced aligner: it matches the text to the audio to find where each sound starts and ends) + Parselmouth formants | Server (aligner container) | Azure fr-FR word timings (unverified whether fr-FR phoneme timings are usable) | Lab |
| Crispness | FR | Energy in the 1–3 kHz band relative to overall energy | numpy/Parselmouth long-term spectrum | Server | — | Lab |
| Released final consonants | FR | Burst after the final stop, located by MFA | Own detector | Server | — | Lab only (no validated method, Add. §3.4) |
| Intelligibility in noise | FR | Keyword accuracy on SUS mixed with TTS babble at a fixed SNR | Azure fr-FR speech-to-text (Whisper as a second listener, optional) | Server | Human transcription in noise | Lab → Experimental after the listener check |
| Azure fr-FR pronunciation scores | FR | Completeness and omissions only | Azure | Server | — | Not shown: native speakers score near the top (Brief §5.3) |

**Why the server, not the browser, calls Azure.** The Python Speech SDK supports `phonemeAlphabet: IPA`, `nBestPhonemeCount` and `enable_prosody_assessment()`. The short-audio REST API's header lists no NBest-phoneme option, so the spoken-phoneme output needs the SDK. Calling from the server keeps the Azure key off the phone entirely. It gives one adapter to test with recorded responses, stores the raw JSON, and lets the app re-score stored audio after a model update. The browser SDK with a 10-minute token is the fallback if latency is too high (Decision D2).

**Latency budget** (target: at most 3 s from end of speech to verdict)

| Step | Time |
|---|---|
| Silence detection closes the take | 0.8 s |
| Upload of about 100 KB | about 0.2 s (unverified on your network) |
| Azure PA ∥ Parselmouth, in parallel | about 1–3 s (unverified; the week-1 test measures it) |

MFA and the French noise test run in the background; the French report waits for them. If the median is over 4 s, switch to Decision D2.

**Measurement registry and trust levels.** Each measure has an entry in a registry: its definition, code version, inputs, minimum tokens, validation record and trust level.

| Level | Name | Visible where | How a measure gets promoted (heuristics) |
|---|---|---|---|
| 0 | Recorded | Nowhere. Audio and raw provider output are stored. | — |
| 1 | Lab | Measurement Lab only | Implemented, and unit tests on synthetic signals pass |
| 2 | Experimental | You see values labelled "experimental". No verdicts; not used by the priority model. | Repeat-check ICC ≥ 0.70 on ≥20 pairs (ICC is a 0–1 measure of agreement between two recordings), **or** known-answer AUC ≥ 0.80 on ≥20 pairs (AUC is the chance the measure ranks a right version above a wrong one) |
| 3 | Trusted | Drives verdicts, the priority model and progress | Known-answer AUC ≥ 0.85 **and** agreement with the listener majority of κ ≥ 0.60 on ≥40 natural attempts (κ, kappa, measures agreement beyond chance; 0.60 matches expert agreement on single sounds, Brief §3.7). For measures that flag errors: precision ≥ 0.80, meaning at least 80% of flags are real errors. For continuous progress measures: ICC ≥ 0.75, with the measurement error recorded. |

A measure drops back to Experimental after a new scorer epoch or a device change, until it passes a re-check.

**Stored with every score:** provider, provider model date (from the release notes), request settings, raw response, code version, registry version, device, browser, capture settings, SNR and epoch ID.

### 4d. Backend

**Language.** Python 3.12 with FastAPI (a Python web framework) and Pydantic. Python is justified because the measurement tools are Python-native: Parselmouth, MFA, numpy and scipy, spaCy, the Azure Python SDK (Linux x64 and ARM64), optional faster-whisper, and the analysis libraries for validation. The server uses one language and fully replaces Node/Express.

**Parts**
- `api` (FastAPI)
- `pipeline` (the scoring jobs)
- `providers` (Azure adapter, optional SpeechSuper adapter, fakes)
- `dsp` (Parselmouth measures)
- `stats` (beta-binomial, reliable change index, NAP)
- `scheduler` (session plans, spacing)
- `panel` (listener rounds)
- a job table in SQLite with a worker process
- MFA in a separate **aligner container**, because MFA installs through conda; a 30-line HTTP wrapper calls `mfa align_one`, which needs no database

Every external call has a timeout (Azure 15 s, aligner 30 s) and retries with backoff. v1 had no timeouts.

**API sketch**

| Method and path | Purpose |
|---|---|
| `POST /api/pair` | Exchange a one-time pairing code for a device token |
| `GET /api/plan?minutes=10&lang=en` | Today's session: blocks, items, voices |
| `POST /api/sessions`, `PATCH /api/sessions/{id}` | Start and finish a session |
| `POST /api/attempts` | Multipart upload: `audio.wav` + JSON (item, task, session, capture settings, phone quality results). Returns the fast result (verdicts, measures, feedback message, `pending` list). |
| `GET /api/attempts/{id}` | The full result, including background measures |
| `POST /api/attempts/{id}/dispute` | "That was right" |
| `POST /api/listening-trials` | A batch of listening answers (synced from the offline outbox) |
| `GET /api/targets` | Priority model state with ranges |
| `POST /api/progress-checks`, `GET /api/progress` | Progress Checks; trends by epoch |
| `GET /api/content/manifest` | Content version, file list, hashes |
| `POST /api/panel/rounds`; `GET /panel/{token}`; `POST /api/panel/{token}/responses` | Listener rounds and the rater page (scoped, expiring links) |
| `POST /api/lab/rescore`; `GET /api/lab/registry` | Re-score the reference set; trust levels |
| `GET /api/export`; `DELETE /api/data` | Full export as a zip; delete everything |
| `GET /api/health` | Health and provider status |
| `GET /api/azure/token` (**only if D2 is chosen**) | A 10-minute Azure token; authenticated and rate-limited |

### 4e. Data

| Data | Where | Format | Kept | Backup |
|---|---|---|---|---|
| Recordings | Server disk | FLAC (lossless compression), 16 kHz mono, with a SHA-256 hash (about 1 MB per minute of speech) | For the life of the project (needed for re-scoring and panels) | Nightly sync to object storage |
| Attempts, scores, origin records, trials, targets, schedules, checks, panel ratings, registry | Server SQLite | Tables with migrations | Always | Nightly `.backup` to object storage; a monthly automatic test restore |
| Raw provider JSON | SQLite (compressed column) | JSON | Always | As above |
| Content audio and manifest | Static files (server or CDN) + the phone's service-worker cache | MP3 + JSON | Versioned | Rebuilt from sources in the repo |
| Offline outbox, preferences | Phone IndexedDB | — | Until synced | Not needed. Home-screen apps are exempt from Safari's 7-day storage cleanup; the app also calls `navigator.storage.persist()`. |

**Volume.** About 3 minutes of speech a day comes to about 65 MB a month.

**Privacy.** Voice recordings are personal data.
- They stay on your server.
- Azure processes them. Check that Azure's data-logging setting is off (unverified default).
- Listener-panel clips go out only through expiring links, with no names, and with consent text.
- A "delete everything" button removes all data.

### 4f. Hosting, HTTPS, access control, secrets, cost

| Option | What it is | Monthly cost | Trade-off |
|---|---|---|---|
| H1. **Home server + Cloudflare Tunnel** (cheap/free path) | Docker on an always-on home computer. Cloudflare Tunnel (free) gives an HTTPS address on your domain without opening router ports. | About €1 (domain) + electricity | Scoring works only while the home machine is on. Listening still works offline. |
| H2. **Small VPS** (comfortable path; a rented virtual server) | Hetzner CX23 (2 vCPU, 4 GB) at €5.49, or a 4 vCPU / 8 GB plan (about €9–12, unverified) if MFA or Whisper feel slow. Caddy (a web server that gets HTTPS certificates automatically) + Docker Compose. | About €7–15 in total | Always on; you maintain it |
| H3. Paid platform with a volume (Render/Fly) | A managed container with a persistent disk | About $7–20 (unverified) | Less maintenance; cold starts; conda inside is awkward |

**Access control** (single user)
- A pairing code from a server command-line tool gives the phone a long random device token, stored in IndexedDB. Every API call carries it.
- Listener links use separate, read-only, expiring tokens.
- Rate limits apply everywhere.
- Cloudflare Access (free up to 50 users) could sit in front for H1, but whether its login flow works inside an installed iOS home-screen app is unverified.

**Secrets**
- `AZURE_SPEECH_KEY` lives only in the server's environment file, never in the repo.
- No test reads `.env`, which fixes v1's crash.
- A CI step (continuous-integration check) greps the built client bundle for key-like strings and fails the build if it finds one.
- With D2 only, the phone receives a 10-minute token and never the key.

**Estimated monthly cost** (assuming ~2 hours of audio sent to Azure a month)

| Item | Cheap path | Comfortable path |
|---|---|---|
| Server | €0 (home) | €5.49–12 |
| Azure speech-to-text + pronunciation assessment | €0: free tier, 5 audio hours a month (whether the free tier includes prosody is unverified) | About $3: about $1 per audio hour baseline plus a prosody add-on of about $0.30 per hour (partly verified) |
| Azure TTS (content builds) | €0: free tier, 0.5M characters a month | Same |
| Backups | €0: free object-storage tiers (unverified current quotas) | About €1 |
| Domain | About €1 | About €1 |
| SpeechSuper pilot (optional, one month) | — | $20 minimum |
| **Total** | **About €1** | **About €10–15 (+$20 in a pilot month)** |

> **Decision D3: hosting.** Recommendation: **H2** (a small VPS) for reliability. H1 is a fine start if you have an always-on computer. I will not choose for you.

### 4g. Testing strategy (fits TDD)

**Client (Vitest)**
- Pure functions are tested with synthetic signals: resampler (sine sweeps check frequency and alias rejection), WAV encoder (byte-exact headers), VAD, quality gate (generated silence, noise, clipping), live pitch (sines of known frequency).
- The worklet's processing logic sits in a pure function, so it is testable outside the browser.
- UI tests use Testing Library with a mocked API (MSW).
- End-to-end tests use Playwright in Chromium with a fake audio input (`--use-fake-device-for-media-stream --use-file-for-fake-audio-capture=take.wav`).

**Server (pytest + Hypothesis)**
- DSP measures are tested against synthetic sounds with known answers. Praat can synthesise vowels with set formants and tones with set pitch; silence is inserted at known points to test pause detection.
- Statistics are tested with property-based tests (Hypothesis generates many random inputs to check rules that must always hold).
- **The Azure adapter is tested against real recorded responses**, captured during the week-1 test and stored as fixtures, and parsed through Pydantic models. v1's mock mode failed because its fake JSON had the wrong shape.
- A `FakeAzure` provider replays fixtures, keyed by audio hash, for development.
- Live tests are opt-in (`pytest -m live`) and are skipped without a key.

**Other tests**
- **Contract tests** check every fixture against the schema. A nightly live test catches Azure changing its response shape.
- **Validation harness** (`validation/`): scripts compute repeat-check, known-answer and listener-agreement results on your data and write a report. The trust levels in the registry change only in a commit that includes that report.
- **Lint and types:** ESLint + `tsc --strict`, and ruff + mypy (strict). Warnings count as errors.

### 4h. What happens to v1

- Tag the current `main` as `v1-final` and keep a branch `archive/v1`.
- Start the new structure on `main`: `client/` (PWA), `server/` (Python), `aligner/`, `content/`, `validation/`, `docs/`.
- **Reuse:** the WAV encoder idea (rewritten test-first), test-scaffolding patterns, the docs conventions and backlog format, and all of `docs/research/`.
- **Delete:** the Node/Express server, `render.yaml`, the TTS proxy, and the v1 content packs (mis-tagged).
- Replace backlog epics F1–F6 with the epics in section 5.
- Record each decision (D1–D4) as an ADR (architecture decision record) in `docs/adr/`.

### 4i. Decisions and questions for you

| ID | Question | My recommendation |
|---|---|---|
| D1 | Client: PWA, Capacitor, or native? | PWA; Capacitor as a fallback |
| D2 | Azure from the server (Python SDK) or from the browser (JS SDK + token)? | Server; browser if latency is over 4 s |
| D3 | Hosting: home + tunnel, VPS, or paid platform? | VPS |
| D4 | Pilot SpeechSuper (vendor claims English stress and French liaison analysis; untested) on 40–60 of your items? | Yes, but only if our own stress measure fails validation |
| Q1 | Your phone model and OS? | — |
| Q2 | French variety: France (fr-FR) or Québec (fr-CA)? It sets the voices, recognition and aligner (Brief §5.2). | — |
| Q3 | Can you find 3 English listeners and 2–3 French listeners for about 20 minutes each, 2–3 times a cycle? | — |

---

## 5. Build roadmap

Effort: S ≈ 1–3 working days, M ≈ 4–8, L ≈ 10–15 (focused solo days with AI help). Every task follows Red → Green → Refactor, and each change updates its docs.

| # | Epic | Goal | Main tasks | Effort | Ships |
|---|---|---|---|---|---|
| E0 | **Reset + spikes** | Prove the risky parts on *your* phone before building | Archive v1; new repo skeleton; CI (lint, types, tests). HTTPS on the phone for development (tunnel). **Spike 1:** capture → 16 kHz WAV on your phone; AGC on/off; permission prompts. **Spike 2:** Azure US English PA via the Python SDK with IPA + NBest + prosody + syllables; save real JSON fixtures; measure latency. **Spike 3:** Parselmouth on those WAVs. **Spike 4:** MFA `align_one` French latency. ADRs for D1–D3. | M | Spike report |
| E1 | **Capture + storage** | Reliable recording to server storage | Recorder module, quality gate, outbox, upload; server storage (FLAC, SQLite, origin fields); device pairing; backups; export v0 | M | — |
| E2 | **Baseline capture** | Record the baseline before any training | Content sources v0 with the **held-out split fixed**; onboarding (goal, if-then plan, reminder); baseline flows for EN and FR (free speech, read items, anchor sentences twice); known-answer calibration recordings | S–M | **Slice 0:** record your baseline on your phone. Analysis happens later on stored audio: "capture now, analyse later". |
| E3 | **Content pipeline + listening trainer** | Evidence-strong training that needs no scoring | TTS build, voice checks, manifest, offline cache; listening engine (identification, feedback, 4 training + 2 test voices, blocked then mixed, sequence recall, lexical decision); listening screener; 5-minute listening sessions | M | **Slice 1:** daily 5-minute listening for stress shapes, FLEECE–KIT and /h/ |
| E4 | **Scoring core** | Every score measured, versioned and traceable | Azure adapter + fixtures + FakeAzure; measure registry; Parselmouth basics (pitch, loudness, durations); attempts API and job worker | M | — |
| E5 | **Measurement lab + validation harness** | Decide what can be shown | Repeat-check, known-answer and listener-agreement reports; Listener Panel page v1; trust promotion flow | M | Lab screen (for you as developer) |
| E6 | **Speaking loop + feedback cards** | Corrective feedback with self-correction | Vowel-pair and /h/ speaking; feedback card; self-correct → model → new word; dispute; sampled self-estimates | M | **Slice 2:** "Listen & Say" 5/10-minute sessions with *validated* FLEECE–KIT and /h/ feedback |
| E7 | **Scheduler + session builder** | The full 5/10/15 plan and spacing | Targets, beta-binomial priority model, 1/3/7/14 spacing, weekly target ring, comeback session | M | **Slice 3:** full English sessions |
| E8 | **Progress Checks** | Measure transfer honestly | Check flows, held-out sets, reliable change index and NAP, epochs, drift monitor, before/after player, panel rounds for outcomes | M–L | First Progress Check (must be ready by practice week 4) |
| E9 | **Stress production** | Stress feedback you can trust | Prominence features, classifier, native and SSML calibration sets, compare mode, verdict mode once trusted, sentence-stress dialogues | L | **Slice 4:** stress speaking feedback |
| E10 | **Fluency module** | Free-speech pace and pausing | Retell ×3, speech-to-text timings, clause boundaries, pause and rate measures, detection of word-for-word repeating (lab) | M | **Slice 5** |
| E11 | **French clarity track** | Paired clear speech with honest measures | Pairs, listener cards, clarity measures, aligner container, vowel probes, babble + recognition-in-noise, clarity-drop report | L | **Slice 6** |
| E12 | **Habit features** | Keep practice going | Push or calendar reminder, real-life task log, monthly before/after | S | — |
| E13 | **Hardening** | Safe to rely on | Security review, restore drill, delete-all, performance, accessibility | S–M | — |

**Order:** E0 → E1 → E2 → E3 → E4 → E5 → E6 → E7 → E8 → E9 → E10 → E11. E12 is split across E7 and E8. E13 comes last.

**Rough timing:** Slice 0 in about 2–3 weeks, Slice 1 in about 5–6, Slice 2 in about 9–10. The French track (E11) comes late because English is the main goal. French baseline audio is still captured in Slice 0.

---

## 6. Risks, unknowns and validation plan

### 6.1 Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| iOS capture quirks (settings ignored, repeated mic prompts, stereo when echo cancellation is off) | Medium–High on iPhone | High | Spike 1 on your phone; mic stays open per session; downmix to mono; Capacitor fallback (D1) |
| Azure spoken-phoneme output misjudges French-accented vowels | Medium | High | Known-answer and listener checks before any verdict; length cue as a backup; listening-only fallback |
| The stress measure fails validation (a known-hard problem) | High | Medium | Compare mode without verdicts; listening-first stress training; SpeechSuper pilot (D4); listener checks |
| Azure changes its models silently (it did in August 2026) | Certain over time | Medium | Origin record on every score, monthly re-score, epochs, re-scoring stored audio |
| Latency over 4 s | Medium | Medium | Browser SDK streaming with a token (D2) |
| MFA is heavy to run or slow | Medium | Low (French lab measures only) | A separate container; Azure fr-FR timings as a fallback (unverified) |
| No human listeners available | Medium | High for validation | Recruit early; small rounds; paid raters as an option (privacy trade-off) |
| Deliberate errors differ from natural ones | Certain | Medium | Known-answer is necessary but not enough; the listener stage is needed for Trusted |
| Recognition in noise does not track human listeners for you | Medium | Medium | Human check in noise before promotion; labelled "rough check" |
| Scope creep for a solo developer | High | High | Slices; one task at a time; Slice 1 already delivers strong-evidence training |
| You stop practising | Medium (43% of app users quit within 3 months, secondary figure) | High | Habit features; short sessions; comeback session |
| Privacy of voice clips shared with raters | Low–Medium | Medium | Consent, expiring links, minimal clips |

### 6.2 Validation plan: check each measure on your voice and phone before trusting it

| Step | When | What you do | Pass rule (heuristic) |
|---|---|---|---|
| V1. Capture | E0–E1, week 1 | 50 takes in 3 settings (quiet room, normal room, street). Check sample count against duration, clipping, applied settings and latency. Record 10 anchor sentences with AGC on and with AGC off. | Zero corrupt takes. Median latency ≤ 3 s. Choose the AGC setting with the higher SNR and the more stable Azure scores. |
| V2. Repeat check | Weeks 0–2 | Anchor sentences recorded twice in each of 3 sessions | ICC per measure; SEM (standard error of measurement) stored and used as the reliable-change threshold |
| V3. Known-answer | Weeks 1–3, 2 min per session | Say contrasts both ways on purpose (ship/sheep, heat/eat, PHOtograph/phoTOgraph, usual/clear French) | AUC ≥ 0.80 for Experimental, ≥ 0.85 toward Trusted |
| V4. Native reference | During E3/E9 | Run measures on TTS and Lingua Libre native words, and on mis-stressed words made with SSML | ≥ 95% correct on native speech, or the measure is broken |
| V5. Listener agreement | Weeks 3–6 | 3 listeners label 40–60 of your natural attempts per measure (forced choice: which word, which syllable) | κ ≥ 0.60 against the listener majority; precision of error flags ≥ 0.80 |
| V6. Free-speech timing | E10 | You hand-check pause and clause marks on 20–30 clips | ≥ 90% of pauses located within 100 ms; clause labels ≥ 80% correct |
| V7. French recognition in noise | E11 | Choose the SNR at which your usual SUS keyword accuracy is 50–70%. Then 2–3 French listeners transcribe the same noisy clips. | Correlation across sentences ≥ 0.6 between listeners and recognition, or the check stays in the lab |
| V8. Drift and device | Monthly, and on any phone change | Re-score the reference set (20 of your clips + 10 native clips); re-record anchor sentences on a new phone | A shift larger than 2 SEM starts a new epoch and a re-check |
| V9. Panel quality | Each panel round | Repeated clips and reference clips | A rater's consistency (repeat ratings within 1 point) ≥ 0.7, or their ratings are dropped |

### 6.3 Key unknowns

These are open questions in Add. §7 and Brief §8:
- Whether stress training carries over to free speech (Q3).
- The right dose for 5–15-minute sessions (Q6).
- Phone reliability of formants and 1–3 kHz energy (Q7).
- AGC on or off (Q9).
- European French norms (Q10).
- Whether clear French helps listeners in quiet rooms (Q12).

The design treats each one as something to measure on you, not something to assume.

---

## 7. Evidence map

| Feature | Evidence (section) | Strength | Notes |
|---|---|---|---|
| Intelligibility, not accent, as the goal | Brief §2 #1; Add. §5 #1 | Strong / Moderate | Azure accuracy is secondary |
| Progress Checks separate from practice | Brief §2 #2, §7 #1 | Strong (principle); Moderate (design) | Held-out items, delayed probes, free speech |
| Listener panel, blind and shuffled | Brief §3.7 | Moderate | 3 raters; old and new clips mixed |
| Measures shown only after validation | Brief §3.7; Add. §4.2 | Strong (the noise is real); design rule is ours | Trust levels are heuristics |
| Repeat and known-answer checks | Brief §3.7 (reliable change needs a reliability estimate) | Moderate | Known-answer is our own addition |
| Word stress first (English) | Add. §2 #1; Brief §3.3 | Moderate priority; Weak training | Listening first; sequence-recall diagnosis |
| Stress listening game with shapes | Add. §2 notes (Schwab 2022) | Weak | Game worked as well as rules |
| Teaching each word's stress pattern | Add. §2 notes (Tremblay 2008) | Moderate | — |
| Stress production feedback | Add. §4.2 (Korzekwa); Brief §3.7 (r ≈ .15–.33) | Unverified / Moderate | Compare mode until trusted |
| Vowel-pair HVPT + speaking | Add. §2 #2; Brief §3.1 | Moderate; Strong (listening) | North American voices for vowels |
| /h/ module, dropped and added tracked separately | Add. §2 #3 | Moderate (one study) | Added-/h/ detector in the lab |
| Identification task with feedback | Brief §3.1 (Carlet & Cebrian) | Moderate | — |
| 4–6 voices, test-only voices | Brief §3.1, §2 #3 | Mixed | Natural recordings in tests |
| TTS voices for training | Brief §3.1 | Weak | Voices checked; TTS–natural gap flagged |
| Separate listening and speaking blocks for new contrasts | Brief §3.1 (Baese-Berk) | Weak (lab listeners) | 80% threshold is a heuristic |
| Corrective feedback + retry | Brief §3.2, §2 #5; Add. §5 #4 | Moderate | One message per attempt |
| Self-correction before the model | Brief §3.2 (Lyster & Saito) | Mixed | — |
| 1–2 errors per attempt | Brief §2 #5 | Weak | — |
| Sampled self-estimate before the result | Brief §3.2 (Guadagnoli), §3.6 | Weak | About 1 trial in 4 |
| Careful wording and dispute button | Brief §7 #5 | Design inference | — |
| Spacing at 1/3/7/14 days | Brief §3.5; Add. §5 #8 | Strong (general); Weak (pronunciation) | Fixed intervals |
| 8-week cycles, ≥4 sessions a week | Add. §4.1; Brief §3.5 | Weak to Moderate | — |
| Attempts as the dose | Brief §3.5 | Weak | — |
| Fluency: repeated retell with shrinking time | Brief §3.4 (Suzuki 2021; Tran & Saito 2021) | Moderate | New prompt each session |
| Rate on a curve, no speed reward | Brief §3.4 | Moderate (listener ratings) | — |
| Pauses inside clauses, articulation rate | Brief §3.4 (Suzuki & Kormos) | Moderate | Clause parser checked by hand |
| Sentence-stress dialogues | Brief §3.3 (Hahn 2004) | Moderate | From week 6 |
| Pitch display in semitones | Brief §2 #14 | Weak | Display only; labelled experimental |
| Diagnose-only probes (clusters, /θ ð/) | Brief §5.1; Add. §2 #7 | Moderate / Not searched | Module only if data show a need |
| Target priority = weight × error × need | Brief §7 #3 | Moderate (English); Weak (French) | Weights stored as data |
| 15–20 tokens before "weak" | Brief §2 #10 | Weak heuristic | Beta-binomial ranges |
| Staggered target starts (multiple baseline) | Brief §3.7 (single-case designs) | Moderate | Untrained targets act as controls |
| Epochs and re-scoring after model updates | Brief §3.7; Add. §5 #11 | Strong (updates happen) | Audio kept for re-scoring |
| Uncompressed 16 kHz capture with AudioWorklet | Add. §4.2, §5 #2 | Strong (format); Moderate (quality) | MediaRecorder fallback only |
| HTTPS required for the mic | Add. §4.2 | Strong | — |
| No background practice on iOS | Add. §4.2 | Moderate | — |
| French paired recordings with concrete cues | Add. §3.3 #1–2; Brief §5.3 | Moderate | — |
| Clear at a normal pace | Add. §3.3 #3 | Weak | Never reward slowness |
| Clarity drop in retell | Add. §3.3 #5 | Weak | — |
| French vowel probes | Add. §3.3 #6 | Moderate / Mixed | Lab first |
| Recognition in noise as a French check | Add. §3.4; Brief §5.3 | Mixed | Human check in noise needed |
| No single clarity score | Add. §3.4 | Mixed | — |
| Weekly target, no streak, comeback | Brief §3.6; Add. §4.1 | Weak (non-language) | — |
| If-then plan | Brief §3.6 | Moderate (small effect) | — |
| Before/after recordings | Brief §7 #11 | Moderate to Weak | — |
| Real-life task log | Brief §3.6 (Derwing) | Weak | — |
| Speed ladders removed | Brief §4; Add. §6 | No evidence | — |
| AI judges removed | Brief §3.7 | Weak | Text AI only drafts content |
| Shadowing deferred | Add. §5 #13; Brief §3.4 | Weak | A cycle-2 experiment |

---

## Appendix A. Technical claims checked (2026-09-24) and not checked

**Checked on the web**
- Azure pronunciation assessment:
  - Prosody, syllable groups, phoneme names (IPA) and spoken phonemes (NBest) are **US English only**.
  - Phoneme and syllable results include Offset and Duration.
  - The JS and Python SDKs support `enableProsodyAssessment` and `nBestPhonemeCount` with IPA.
  - Continuous mode (over 30 s) does not support miscue detection.
  - Microsoft recommends getting a transcript with speech-to-text and then running a scripted assessment for unscripted speech.
  - Sources: [how-to pronunciation assessment](https://github.com/MicrosoftDocs/azure-ai-docs/blob/main/articles/ai-services/speech-service/how-to-pronunciation-assessment.md).
- The short-audio REST API:
  - pronunciation assessment takes at most 30 s of audio;
  - it accepts WAV/PCM 16 kHz mono or OGG/Opus;
  - it returns final results only;
  - its header keys include `EnableProsodyAssessment` but no NBest-phoneme key.
  - Source: [REST short audio](https://github.com/MicrosoftDocs/azure-ai-docs/blob/main/articles/ai-services/speech-service/rest-speech-to-text-short.md).
- Pricing: pronunciation assessment costs the same as speech-to-text for accuracy, fluency and completeness; **prosody is an add-on charge**. Source: [pronunciation assessment tool doc](https://github.com/MicrosoftDocs/azure-ai-docs/blob/main/articles/ai-services/speech-service/pronunciation-assessment-tool.md). The free tier gives 5 audio hours a month and the add-on is about $0.30 per hour, according to search summaries; the official [pricing page](https://azure.microsoft.com/en-us/pricing/details/speech/) was blocked from here, so the exact figures are **partly verified**.
- SSML `<phoneme alphabet="ipa">` supports stress marks (for example `tə.ˈmeɪ.toʊ`). Source: [SSML pronunciation](https://github.com/MicrosoftDocs/azure-ai-docs/blob/main/articles/ai-services/speech-service/speech-synthesis-markup-pronunciation.md). Azure TTS offers 0.5M free characters a month, then about $16 per million ([summary](https://texttolab.com/blog/azure-text-to-speech-pricing)).
- Browser authorisation tokens last 10 minutes ([JS browser samples](https://github.com/Azure-Samples/cognitive-services-speech-sdk/tree/master/samples/js/browser)). Browser pronunciation assessment with AudioWorklet capture works in a third-party project ([ClearSpeak](https://github.com/toanvv42/clearspeak)). The JS SDK now uses AudioWorkletNode for mic input ([release notes](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/releasenotes)).
- The Python Speech SDK supports Linux x64 and ARM64, needs glibc 2.31 or later, and works with OpenSSL 1.x or 3.x ([PyPI](https://pypi.org/project/azure-cognitiveservices-speech/); [setup docs](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/quickstarts/setup-platform)).
- getUserMedia audio settings: on Chrome, AGC turns off only with echo cancellation off; one report says Safari 26 records stereo when echo cancellation is off ([addpipe](https://blog.addpipe.com/getusermedia-audio-constraints/)).
- Web Push works for home-screen web apps from iOS 16.4 ([WebKit](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)). Home-screen apps are exempt from the 7-day storage cleanup, and `navigator.storage.persist()` is honoured ([WebKit storage policy](https://webkit.org/blog/14403/updates-to-storage-policy/)).
- MFA `align_one` aligns a single file without database structures, and SQLite is MFA 3's default backend ([MFA docs](https://montreal-forced-aligner.readthedocs.io/en/latest/user_guide/workflows/alignment.html)).
- Praat syllable-nuclei v3 fluency scripts (de Jong, Pacilly & Heeren 2021) ([article](https://www.tandfonline.com/doi/full/10.1080/0969594X.2021.1951162)).
- SpeechSuper covers 8 languages including French. It claims syllable stress, liaison and rising/falling tone analysis. Pay-as-you-go has a $20 monthly minimum, at about $0.004 per word request and $0.006 per sentence request ([pricing](https://www.speechsuper.com/pricing.html); [French demo](https://www.speechsuper.com/demo/french/index.html); [samples](https://github.com/speechsuper/SpeechSuper-API-Samples)). Its accuracy is untested.
- Hetzner CX23 costs €5.49 and CAX11 €5.99 after the June 2026 increase ([Northflank](https://northflank.com/blog/hetzner-cloud-server-price-increases); [PrivateDevOps](https://privatedevops.com/news/hetzner-june-2026-cloud-price-increase-what-to-do)).
- Cloudflare Tunnel is free and unmetered; Cloudflare Access is free up to 50 users ([bex.co](https://bex.co/blog/2026/07/28/cloudflare-tunnel-free-zero-open-ports-ingress); [ZeroMetric](https://zerometric.net/research/cloudflare-zero-trust-free-plan-limits-2026/)).
- Lingua Libre is CC BY-SA 4.0, with about 107k English recordings on Commons ([Commons](https://commons.wikimedia.org/wiki/Commons:Lingua_Libre); [Wikipedia](https://en.wikipedia.org/wiki/Lingua_Libre)).

**Not checked (unverified)**
- Azure latency per assessment. Whether the free tier includes prosody. Free-tier concurrency limits. The default for Azure data logging.
- Whether Azure fr-FR phoneme timings are usable as an aligner.
- Safari honouring `autoGainControl` and `noiseSuppression` on iOS. Mic-prompt behaviour on your iOS version. Bluetooth mic bandwidth per model.
- Cloudflare Access login inside an iOS home-screen app.
- Prices for the 4-vCPU Hetzner plan, Render/Fly, and free object-storage quotas. Apple developer fee.
- MFA speed and availability on ARM64. Parselmouth and Whisper speed on a small VPS.
- Lingua Libre coverage for French and for specific English words.
- SpeechSuper stress and French accuracy on your voice.