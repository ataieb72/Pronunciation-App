<!-- Source design 'evidence-max' (Evidence-first program). Input to design-options.md; not a final spec. -->

# Pronunciation Coach v2: evidence-first program design

**Date:** 2026-09-24 · **Status:** proposal waiting for your decisions · **Design angle:** evidence-first

**Inputs.** `docs/research/evidence-brief.md` is cited as "Brief". `docs/research/learner-profile-addendum.md` is cited as "Add.". I also checked technical facts on the web for this document. The Appendix lists them. Any technical claim I could not check is marked **(unverified)**.

**How to read citations.** "Brief §3.1 [Strong]" means section 3.1 of the brief, with its strength label. "Add. §2 r1" means addendum section 2, rank 1.

**Decisions.** Items marked **DECISION** are yours. Per CLAUDE.md, this document presents options and a recommendation. It does not choose the architecture.

---

## 1. Pitch

Pronunciation Coach v2 is a phone-first training program for one French-speaking adult. The main goal is to be easily understood in English. The second goal is clearer native French. The program does five things the research supports and v1 did not do:
- It trains hearing before speaking, with listening practice in many voices.
- It corrects one likely error at a time, then asks for a retry.
- It spaces practice over 12-week cycles.
- It replaces speed ladders with a retelling routine for fluency.
- It measures progress separately, on speech the learner has not practised, and it shows the noise in machine scores.

English starts with word stress. The vowel pairs and /h/ that French lacks come next, in staggered blocks. French is clear-speech training: say the same thing your usual way, then clearly, at your normal speed, to a listener who sometimes mishears you.

This design wins for three reasons:
- Every module maps to a ranked capability in the evidence.
- Every number the app shows has first passed a check on this learner's voice and phone.
- The staggered blocks and Progress Checks let the app tell "better at drills" apart from "easier to understand".

---

## 2. Goals and success measures

### 2.1 Goals

| # | Goal | Evidence |
|---|---|---|
| G1 | English: be easily understood by international listeners in **unscripted** speech. The target is comprehensibility (how easy you are to follow) and intelligibility (how many of your words are understood), not a native accent. | Brief §1, §2 row 1 [Strong]; Add. §5.1 [Moderate] |
| G2 | French: switch into clear speech on demand at a normal speed, and keep more of it in semi-free speech. | Add. §3.2 [Moderate for producing it on demand; None found for lasting carry-over] |
| G3 | Habit: at least 4 sessions a week, for at least 7 active weeks per cycle. | Add. §4.1 [Weak; these figures predict staying with an app, not learning] |

### 2.2 Measurement rules the whole design follows

1. **Practice scores are not progress.** Progress charts use only Progress Check data. A Progress Check is a separate test session with no feedback. (Brief §2 row 2 [Strong]; Brief §3.5, Soderstrom & Bjork [Moderate])
2. **Transfer is the test.** Checks use unseen prompts, held-out words and voices, and delayed probes 2–4 weeks after a block ends. "Held-out" means the item never appears in practice. (Brief §7.1 [Strong principle; Moderate design])
3. **Machine scores are noisy.** At the level of single sounds, machine scores agree with experts at only about r ≈ .6. On word stress they agree at r ≈ .15–.33 (Brief §3.7 [Moderate]). The app therefore does five things:
   - it pools many tokens (one token is one scored instance of a target);
   - it shows ranges, not points;
   - it measures a personal noise floor from repeat recordings;
   - it stores the provider and model date with every score;
   - it re-scores old Check audio whenever Azure's model changes.
4. **Human listeners are the final judge when available.** Listeners hear old and new clips blind, in shuffled order, with fixed reference clips (Brief §3.7, §7.1 [Moderate]).
5. **Reliable change, not raw change.** A change counts only if it exceeds the learner's own measurement noise (reliable change index, section 3f).

### 2.3 What the app measures

| Measure | Language | Task | Who or what computes it | When |
|---|---|---|---|---|
| Comprehensibility (1–9 rating) and intelligibility (% of words transcribed correctly) | EN | Unscripted retell or opinion; unpredictable sentences | Optional panel of 3–5 human listeners | Baseline, week 12 (optionally week 6) |
| Machine intelligibility estimate: ASR word accuracy (ASR = automatic speech recognition) | EN | 10 held-out, semantically unpredictable sentences | Azure speech-to-text, labelled "lenient machine listener" | Every Progress Check |
| Fluency on new prompts: articulation rate (syllables per second, pauses excluded), mid-clause pauses per minute, mean length of run (syllables between pauses), time to first word | EN | First telling of a new retell prompt | Word timings plus on-device pause detection | Every Check; also first rounds in practice |
| Transfer per target: error rate on held-out words, trained targets compared with untrained ones | EN | Held-out word list in a carrier phrase ("Say ___ again.") | Azure en-US scores, pooled by the target model | Every Check |
| Retention | EN | Delayed probe of the previous block's held-out items | Same | 4 weeks after a block ends |
| Listening accuracy on test-only voices and on natural human recordings | EN | Identification trials | On device | Every Check |
| Clarity gain in noise: keyword accuracy of clear speech minus habitual speech, with noise mixed in | FR | Unpredictable French sentences | Azure fr-FR speech-to-text on noise-mixed audio | Every French Check |
| Habitual clarity drift: whether *ordinary* speech becomes clearer over the weeks | FR | Same, habitual takes only | Same | Every French Check (exploratory) |
| Clarity decay: clarity at the start versus the end of a 60–90 s retell | FR | Semi-free retell | On-device acoustic measures | Every French Check |
| Feature profile: pitch range, vowel and word length, 1–3 kHz energy, pause rate | FR | Paired habitual/clear takes | On device, compared only with the learner's own baseline | Every French session |
| Adherence | Both | — | App | Continuous |

### 2.4 Success criteria for cycle 1 (write them down before training starts)

Writing criteria down in advance guards against reading success into noise.

| # | Criterion |
|---|---|
| S1 | ASR word accuracy on held-out sentences shows a reliable gain at week 12 over baseline. |
| S2 | At least 2 of the 3 segmental targets (/h/; /iː-ɪ/ with /uː-ʊ/; /æ-ʌ-ɑ/) pass two tests. First, the held-out error rate drops reliably after that target's block starts, while targets not yet trained stay flat. This is a "multiple-baseline" design: training one target at a time shows that change follows training. Second, the gain holds at the delayed probe. |
| S3 | Word stress: listening identification on test-only voices reaches 80% or more. Stress production counts only if the stress analysis passed validation (section 6). Otherwise production evidence comes from the listener panel. |
| S4 | Fluency on new prompts: mid-clause pauses drop reliably, articulation rate is inside the learner's target band, and mean length of run rises. |
| S5 | Panel, if run: mean comprehensibility rises by more than the noise band estimated from the reference clips. |
| S6 | French: at the learner's habitual speed (within ±10%), the clear-minus-habitual keyword gain in noise is reliably above zero by week 6 and stays there. |
| S7 | At least 4 sessions a week in at least 9 of the 12 weeks. |

**Expectations.** Gains will be largest in drills, smaller on held-out words, and smallest in unscripted speech (Brief §3.2 [Strong]). No study has shown that a self-study app improves listener-rated comprehensibility of spontaneous speech (Brief §8). So a flat S5 at 12 weeks is plausible, and it is useful information, not a bug.

### 2.5 What does not count as progress

Practice accuracy. Azure accuracy on practised items. Minutes spent. Streaks. The Azure prosody number on its own. Self-ratings on their own, because learners overrate themselves (Brief §3.6 [Moderate]).

### 2.6 How the app reports it

A **Cycle Report** at week 12 does four things:
- It lists each criterion as "reliable gain", "within noise" or "reliable decline".
- It compares trained with untrained targets.
- It separates listening from speaking.
- It plays blind A/B before-and-after clips.

It states plainly what the evidence cannot yet show.

---

## 3. Product design

### 3a. Modules in priority order

#### English (L2 track): target listener "international", scoring locale en-US

en-US is the only Azure locale that returns phoneme names, the phoneme the learner probably said instead ("spoken phoneme"), syllables and prosody (Brief §3.7 [Strong]; verified in the Appendix). Listening voices include en-GB, en-AU and en-IN voices, to match an international target.

| Rank | Module | What the learner does | Evidence | Strength |
|---|---|---|---|---|
| E1 | **Word stress (the "spine": runs all 12 weeks, about 3–4 h in total)** | **Listening first.** Hear a word in one of 4–6 voices and tap its stress shape (●○○ / ○●○). Pick the right version from a correct/wrong-stress pair. At harder levels, recall a sequence of stress patterns across several voices. **Then speaking.** Say the word in a carrier phrase. Feedback splits into length, pitch, loudness and vowel reduction. Each word's stress pattern is shown and quizzed. Items include suffix families (PHOtograph / phoTOgraphy / photoGRAphic), noun/verb pairs and English–French look-alikes. | Add. §2 r1, §5.3; Brief §3.3 (stress deafness), §7.7 | Moderate as a priority (correlational); Weak for the training method |
| E2 | **/h/ (block A, weeks 1–4)** | Many-voice identification (heat/eat, hair/air). "Is this a real word?" decisions ("'usband"). Production feedback. Dropped /h/ and added /h/ are tracked as two separate error types. | Add. §2 r3, §5.6 | Moderate (one training study) |
| E3 | **High vowel pairs /iː-ɪ/, /uː-ʊ/ (block B, weeks 5–8)** | Identification with word labels and instant feedback, then speech. Feedback names the vowel that was probably heard ("your /ɪ/ probably sounded like /iː/") and shows vowel length. | Add. §2 r2, §5.5; Brief §3.1 | Moderate (Strong for the listening gains) |
| E4 | **Low vowels /æ-ʌ-ɑ/ (block C, weeks 9–12)** | Same format with cat/cut/cot. The addendum's /ɑː/ ("cart") is rendered as /ɑ/ ("cot") for en-US scoring. | Add. §2 r2 | Moderate |
| E5 | **Fluency retell (replaces speed ladders)** | Retell the same short story 3 times in one session, within 60, 50 and then 40 seconds, with 1–2 corrections between rounds. A new story next session. The app nudges the learner to rephrase if the retellings become word-for-word. Only the first telling of a new story is measured. | Brief §3.4, §7.8; Add. §2 r4 | Moderate |
| E6 | **Sentence stress and phrasing (block C)** | Correction dialogues ("Did you book it for Tuesday?" → "No, for THURSDAY."). Pausing at phrase boundaries. An optional pitch line in semitones (a pitch unit that treats high and low voices alike), scored only at the target word. | Brief §3.3 (Hahn 2004), §7.7 | Moderate (correlational); Weak for the pitch display |
| E7 | **"Use it" micro-tasks** | After drills, a 20-second spoken answer that needs the target words. A "machine listener" shows which words it understood. It is labelled lenient. | Brief §2 row 13, §7.5 step 3; Add. §5.12 | Weak–Moderate; Mixed for ASR as a check |
| E8 | **Weak forms and reduced vowels** | Listening only, plus vowel reduction inside E1. | Add. §2 r5; Brief §5.1 (teach for listening) | Mixed |
| E9 | **Monitored targets**: consonants dropped from clusters, /θ ð/, question intonation, other high-functional-load consonants | Probed at baseline and at each Check. Trained only if the target model promotes them. | Brief §5.1 (clusters [Moderate]); Add. §2 r6–7 [Unverified / Not searched] | Varies |
| E10 | **Shadowing** (speaking along with a recording, slightly behind it; experimental, off by default) | Short dialogues, about 5 passes each. Scored on timing and pitch alignment, not on phonemes. | Brief §3.4; Add. §5.13 | Weak |

#### French (native clarity track): variety fr-FR by default (**DECISION**: fr-FR or fr-CA)

| Rank | Module | What the learner does | Evidence | Strength |
|---|---|---|---|---|
| C1 | **Paired recordings** | Say each item your usual way, then clearly. Each item gets one concrete cue ("Open your jaw more", "Finish every final consonant") and a named listener ("a colleague on a bad phone line"). The app shows which features changed and which did not, and targets the ones that did not. | Add. §3.3 items 1–2, §5.9; Brief §5.3 | Moderate |
| C2 | **Listener game in noise** | Minimal pairs on screen (tu/tout, le/les, bon/beau, petit/petite). An ASR "partner" hears your word mixed with noise, at a level set so it mishears about 20–30% of ordinary takes. When it mishears, the learner retries more clearly. | Brief §5.3 (Buz 2016), §7.10; Add. §3.3 item 4 | Moderate (immediate effect); untested for lasting change |
| C3 | **Clear at your normal speed** | Weeks 1–3 allow "slow and clear". From week 4, a clear take counts only if its rate is within ±10% of your habitual rate. | Add. §3.2–3.3 item 3; Brief §5.3 | Weak |
| C4 | **Semi-free clarity** | A 60–90 s retell addressed to the named listener. The app measures how much clarity drops from start to end. | Add. §3.3 item 5 (Lee & Baese-Berk) | Weak |
| C5 | **Warm-up** | 3 clear-speech trials at the start of a session. | Add. §3.3 item 7 | Weak |
| C6 | **French vowel probes (measurement only, hidden until validated)** | "Le mot __ me plaît." with /i y e ø ɛ œ u o ɔ/. | Add. §3.3 item 6 | Mixed; phone reliability unknown |
| C7 | **Delivery extras (optional, off by default)** | Pause placement, pitch variation, rehearsing a real upcoming talk. | Brief §5.3 (delivery) | Weak |

#### Shared engines

| Engine | Job | Evidence |
|---|---|---|
| Diagnostic and routing | Settings, baseline recordings, listening screener, level check. Errors found here count only as candidates until a probe confirms them. | Brief §7.2 [Moderate] |
| HVPT engine | HVPT (high-variability phonetic training) is many-voice listening practice. The engine runs identification with labels, 4–6 training voices, and test-only voices plus natural recordings. Blocked practice first, then mixed. Difficulty rises as the learner improves. | Brief §3.1, §7.4 [Strong listening; Mixed voices] |
| Feedback loop | Short explanation → controlled practice → use in a task → check on new words a few days later. At most 1–2 corrections per attempt. Self-correction first, then the model recording. | Brief §3.2, §7.5 [Moderate; Mixed for prompts-first] |
| Spaced scheduler | Reviews at 1, 3, 7, 14 and 28 days. At most 3 back-to-back repeats of one item. The review backlog is capped after a break. | Brief §3.5, §7.6 [Strong in general; Weak for pronunciation]; Add. §5.8 |
| Target priority model | A priority score that accounts for noise, per target (section 3f). | Brief §7.3 [Moderate EN; Weak thresholds] |
| Progress Checks | Separate, feedback-free, held-out tests (section 3f). | Brief §7.1 [Strong/Moderate] |
| Habit layer | Weekly goal, if-then plan, comeback session, before/after recordings. | Brief §7.11; Add. §5.7 [Moderate–Weak] |

### 3b. Session design

#### Phases for each target

A new contrast is not practised the same way on day 1 as in week 3.

| Phase | Rule | Why |
|---|---|---|
| 1. Listen only | Stay here until listening accuracy on training voices is 80% or more in 2 sessions (at most 4 sessions). Speaking time goes to other, established targets. | For contrasts the learner cannot yet hear, speaking during listening training disrupted learning (Brief §3.1 [Weak]). Listening-first teaching may beat speaking-first (Brief §3.3 [Weak]). Threshold from Brief §7.4 (a heuristic). |
| 2. Listen, then speak, in separate blocks | Production with feedback and retry. Items in blocked sets. | Brief §3.5 blocked-then-mixed [Mixed] |
| 3. Mixed practice and "use it" | The target is mixed with other contrasts, used in phrases, and then in E7 micro-tasks. | Brief §2 row 13; §3.5 |
| 4. Maintenance | Review queue only. The delayed probe comes at the next Progress Check. | Brief §7.1, §7.6 |

A block runs 4 weeks. It extends by up to 2 weeks if test-voice listening accuracy is still below 80% at the end. The cycle can therefore stretch toward 16 weeks, which the brief allows (Brief §7.6).

**Dose.** Each block gives about 16 English sessions × 3–4 min of listening on that block's contrast, or about 1 hour. That is the low end of the 1–7 hours in the studies (Brief §3.1 [Moderate]). The review queue and 15-minute sessions add more. The app counts dose as **spoken attempts and listening trials per target**, not minutes (Brief §3.5 [Weak]).

#### A typical day: week 6, English, block B (/iː-ɪ/ in phase 2)

**10-minute session (the default)**

| Time | Block | What happens |
|---|---|---|
| 0:00–0:20 | Start | Tap **Start**. The microphone opens once for the whole session. A 3-second room check measures background noise. The screen shows today's 4 blocks. |
| 0:20–3:20 | Listen: /iː-ɪ/ | About 36 trials. A word plays in 1 of 5 training voices. Tap "ship" or "sheep". A tick or cross appears at once, with a replay of both words. When accuracy passes 85%, light background noise is added. |
| 3:20–6:20 | Speak: /iː-ɪ/ | About 10 target words in "Say ___ again." After each: a feedback card (3d). A miss starts self-correction → model → retry, then a **new** word with the same vowel. On about 1 trial in 4, the app asks "How was that?" before showing the result. |
| 6:20–8:50 | Stress spine | 12 shape-matching trials in 3 voices (about 1 min). Then 5 stress words due for review, spoken with cue bars (about 1.5 min). |
| 8:50–9:40 | Use it | "What would you pack for a trip? Use *ship* and *cheap*." The machine listener shows which words it understood. |
| 9:40–10:00 | Wrap-up | "58 listening trials, 22 spoken attempts. Next: /uː-ʊ/ listening. This week: 3 of 4 sessions." |

**5-minute session**

| Time | Block | What happens |
|---|---|---|
| 0:00–0:15 | Start | Room check |
| 0:15–2:15 | Listen | About 25 trials on the block contrast |
| 2:15–4:30 | Speak | About 7 target words with feedback and retry. If a review is overdue, 3 of these are review items. |
| 4:30–5:00 | Wrap-up | Summary |

**Listening-only session** (earbuds, somewhere the learner cannot speak): 5 minutes of HVPT trials. It counts toward listening dose and toward the weekly goal.

**15-minute session**: the 10-minute session plus a 5-minute **fluency retell**.

| Time | What happens |
|---|---|
| 10:00–10:40 | Read a 70-word story. The text then hides. |
| 10:40–11:40 | Round 1: retell within 60 s. This round is measured. |
| 11:40–12:10 | Between-round card with 1–2 corrections, for example one mis-stressed word and one pause inside a phrase. Also a rephrase nudge if needed. |
| 12:10–13:00 | Round 2: 50 s |
| 13:00–13:40 | Round 3: 40 s |
| 13:40–15:00 | Round-1 measures against your own baseline band. No speed reward beyond the band. |

#### A typical French day (10 minutes)

| Time | Block | What happens |
|---|---|---|
| 0:00–0:40 | Warm-up | 3 clear-speech trials: "Le mot *pur* me plaît." |
| 0:40–4:40 | Paired recordings | 5 items: habitual take → clear take, with today's cue and the named listener. After each pair: 3 bars (vowel length, pitch range, crispness) and "Machine listener in noise: habitual 3/6 words, clear 5/6". From week 4, a rate check (±10% of habitual). |
| 4:40–7:40 | Listener game | 12 rounds. The partner hears you through noise. A mishearing triggers a clearer retry aimed at the confusable part. |
| 7:40–9:40 | Semi-free | A 75-second retell to the named listener. The app reports clarity at the start and at the end. |
| 9:40–10:00 | Wrap-up | "Your vowels got longer; your pitch range did not change. Next cue: let your voice move." |

A 5-minute French session is the warm-up plus 5 paired items. A 15-minute French session adds the listener game in a harder mode and a vowel-probe recording (measurement only).

#### Weekly template (target: 5 sessions; minimum: 4)

| Session | Default content |
|---|---|
| 1 | English: block target + stress + review |
| 2 | English: block target + stress + **fluency retell** |
| 3 | **French clarity** |
| 4 | English: block target + stress + review |
| 5 (optional) | English: fluency retell + sentence stress (block C) + review |

The session composer picks each day's content from: the time you choose (5, 10 or 15 min), what is due, your current phase, and a weekly language split. The default split is about 75% English and 25% French (**DECISION**).

#### The 12-week cycle

| Week | English block | Stress spine | Fluency | French | Measurement |
|---|---|---|---|---|---|
| 0 | Onboarding diagnostic (3 short sessions) | Pretest | Baseline retell | Baseline pairs, sentences in noise | **Baseline** (+ panel clips) |
| 1–4 | **A: /h/** | Phase 1 (listening) weeks 1–3, then speaking | From week 2 | 1×/week, "slow and clear" allowed | — |
| 4 (end) | | | | | **Check 1**: all targets; French Check |
| 5–8 | **B: /iː-ɪ/, /uː-ʊ/** | Speaking + review | 1–2×/week | 1×/week, "clear at normal speed" | — |
| 8 (end) | | | | | **Check 2** + delayed probe for A |
| 9–12 | **C: /æ-ʌ-ɑ/ + sentence stress** | Review + mixed practice | 1–2×/week | 1×/week | — |
| 12 (end) | | | | | **Check 3** + delayed probe for B + panel + Cycle Report |
| Cycle 2, week 2 | | | | | Delayed probe for C |

The fixed order (stress, then /h/, then high vowels, then low vowels) follows the addendum ranking. Two adjustments are allowed:
- The target model can skip a block when baseline probes confirm the target is already fine.
- The target model can add a monitored target (E9) when it is confirmed weak and carries a high functional load.

Cycle 2 re-ranks all targets from the model.

#### Spacing and progression rules

- Each item family (a target plus a set of words) enters a review queue. It comes back after 1, 3, 7, 14 and 28 days. A failed review returns to 1 day, with no penalty shown. Fixed presets, not an adaptive algorithm (Add. §5.8 [Moderate]; Brief §3.5: equal and growing gaps did about equally well, so exact intervals are not hard-coded).
- At most 3 back-to-back repeats of one item (Brief §7.6).
- **Welcome back.** After 4 or more days away, the app offers a 3-minute comeback session. The backlog is capped at 12 items and the rest are quietly rescheduled (Add. §5.7; Brief §7.6).
- **Progress Checks** replace the normal session on their day. They can be split into two parts of about 7 minutes (section 3f).

### 3c. Screens and flows on a phone

| # | Screen | Main elements |
|---|---|---|
| 1 | **Welcome and pairing** | Enter the one-time pairing code. Guide to "Add to Home Screen". Explanation of why the app needs the microphone. |
| 2 | **About you** | First language; which language is native; target listener (international by default); varieties (en-US scoring; fr-FR or fr-CA). |
| 3 | **Goal and plan** | A real-life goal ("be easy to follow in meetings"). Weekly target (4–5). If-then plan ("After my morning coffee, I do one session"). **Add to calendar** creates a repeating reminder. |
| 4 | **Microphone and room check** | Live level meter. Noise reading. "Hold the phone 15–20 cm from your mouth." Pass or retry. |
| 5 | **Baseline stepper** | A 3-part checklist across 3 days: speaking baselines, listening screener, French baseline. Progress dots. |
| 6 | **Today (home)** | One big **Start** button; 5 / 10 / 15 minute chips; "Listening only" chip. A weekly ring (sessions this week out of the target; never a streak). Date of the next Check. A welcome-back banner after a gap. |
| 7 | **Session runner (frame)** | A thin progress bar split into blocks. Block title. Small microphone status dot. Pause and exit buttons. |
| 7a | Listening trial | Replay button; 2–3 large answer buttons (words, or stress shapes ●○○); instant ✓ or ✗; "hear both". |
| 7b | Learn card (first time only, or on tap) | One-sentence tip, mouth picture or lip video, "hear examples". |
| 7c | Speaking trial | Prompt with the stress shown as syllable bubbles. Tap to talk, with automatic stop on silence. Live level meter. Optional pitch line. Occasional "How was that?" (yes / not sure / no). |
| 7d | Feedback card | See 3d. Buttons: **Try again**, **Hear model** (appears after the retry), **That was right**. |
| 7e | Retell | Prompt, then hidden text. Timer ring (60 / 50 / 40 s). Round counter. Between-round card. |
| 7f | Clear-speech pair (French) | "Your usual way" → "Now clearly, for [listener]". Comparison bars. Machine-listener word counts. |
| 7g | Listener game (French) | Partner avatar, noise level indicator, 2–4 word cards, "Heard: *tout*". |
| 8 | **Session summary** | What was practised. One plain sentence on what is now reliable. What comes next. "Mixed practice feels harder. That is on purpose." |
| 9 | **Progress** | (a) Check timeline with ranges; (b) targets list with status and a range bar for each; (c) before/after player with blind A/B; (d) Cycle Report. |
| 10 | **Target detail** | Status (candidate / uncertain / likely weak / training / improving / holds on new words / learned). Token count, word count, session count. Listening track and speaking track side by side. Dose. "Practice accuracy (not a measure of learning)", shown small. |
| 11 | **Progress Check runner** | A distinct calm theme. No feedback. "This is a test, not practice." Can be split into 2 parts. |
| 12 | **Listener panel manager** | Pick clips (Check clips only). Create listener links. Status. Results with ranges. |
| 13 | **Listener page** (for panel listeners, any browser) | Play a clip; type what you heard, or rate ease of understanding on a 1–9 scale (with the task prompt shown, section 3f); next. |
| 14 | **Settings and data** | Varieties, reminders, audio-processing toggle, English/French split. Export, encrypted backup, delete everything. Scoring eras. "Why this works" (evidence notes). |
| 15 | **Validation Lab** | Repeat-recording sets, deliberate-error scripts, export. Used in F3 and again every quarter. |

**Main flows**
- **First run:** 1 → 2 → 3 → 4 → 5 (part 1, then a first stress-listening taster).
- **Daily:** 6 → 7 → 8.
- **Check day:** 6 (banner) → 11 → 8 → 9.
- **End of cycle:** 9d → 12 → 13 (listeners) → 9d updated.

### 3d. Feedback design

**After each speaking attempt, in order:**

1. **Instant, on the phone, in under 0.3 s.** Level and length confirmed, or "Too quiet / clipped / noisy: please retake". A failed take is not scored. (Add. §5.2)
2. **Self-estimate, on about 1 trial in 4 only.** "Did you get the stress on the right syllable?" Yes / not sure / no. Estimating one's own error before seeing the result helped learning in lab motor tasks [Weak]. Asking on every trial can backfire (Brief §3.2, §3.6 [Weak]).
3. **Result, in about 1–2 s as the cloud score arrives.** A short natural delay is fine; it may even help (Brief §3.2, Swinnen [Weak]). The app adds no artificial wait.
4. **One focus.** The card shows at most one correction, and never more than two. It shows a correction only if it concerns the trained target, or if it is a recurring error that the system detects with confidence (Brief §7.5 [Moderate; Weak for the 1–2 limit]). Other errors are logged silently and feed the target model.

**Example card (vowel):**
> **ship**: probably heard as **sheep**
> Your vowel sounded long and tense, like /iː/.
> **Try:** a shorter, looser vowel, with lips relaxed.
> [mouth picture] · length bar: yours ▮▮▮▮ / target ▮▮
> **[Try again]** · (after the retry: **[Hear model]**) · *That was right*

**Example card (stress):**
> **deVELop**: your strongest syllable was the **1st**
> Length ✓ 2nd longest · Pitch ✗ highest on 1st · Vowel in "de": full, not reduced
> **Try:** make "VEL" longer and higher; keep "de" short and weak.

Until stress detection passes validation (section 6), the card shows only the **cue pattern**: "your strongest syllable looks like…". It gives no right/wrong verdict (Add. §5.3; Brief §3.7).

**Retry loop:**
1. **Self-correction first.** The card names the fix and does not play the model yet. Prompting before modelling is **Mixed** evidence (Brief §3.2), so the model is always one tap away.
2. If still wrong: **Hear model**, then retry.
3. Then a **new word** with the same sound. Varied words may aid transfer (Brief §3.2 [Weak]).
4. Credit for the target model: a self-corrected success counts as stronger evidence than a success right after hearing the model (Brief §3.2 app implications).

**Honesty rules**
- Cautious words: "probably", "looks like".
- The **That was right** button lowers that token's weight and flags the item. If more than 15% of a target's tokens are disputed, the target is audited.
- Accepted-variant lists prevent false alarms: English weak forms and stress variants (for example "advertisement"); French optional liaison and dropped schwa (Brief §7.5).
- No colour-coding of every word. No 0–100 score by default; numbers sit behind a **Details** tap. Colour-coded scores alone are not corrective feedback (Brief §1 [Moderate]).

**Pitch line** (E6 and stress): shown in semitones and scaled to the learner's own range. Only direction and timing at the target point are judged. The line fades over time: shown on every trial in week 1 of a target, then half the trials, then a quarter. This design is **experimental** (Brief §2 row 14, §7.7 [Weak]).

**Fluency feedback** (between retell rounds): one content-free observation, such as "2 pauses inside phrases, like 'I went to | the station'". One pronunciation correction taken from the transcript. A rephrase nudge when more than about 70% of 4-word sequences repeat the previous round. Rate is shown only against a band, never as "faster is better" (Brief §3.4 [Moderate]).

**French feedback:** compare with your own habitual take only. Name the feature you did **not** change and give one cue. Never show a single "clarity score" (Add. §3.4 [Mixed]).

### 3e. Content plan

**Production pipeline** (scripts in `tools/content`, run on the developer's machine; outputs are versioned packs):

1. **Mine candidate items.**
   - English: CMU Pronouncing Dictionary (stress digits, phonemes) plus word frequencies from SUBTLEX-US.
   - French: Lexique 3.83 (Brief §3.7 already uses it).
   - Minimal pairs are found automatically, then filtered by frequency and familiarity.
2. **Draft the sentences and stories.** A text LLM can draft stories, unpredictable sentences and French pseudo-words (made-up words that follow French sound rules). A human reviews every item. (Brief §7 technology options: an LLM may generate content, never score.)
3. **Generate audio with neural TTS** (text-to-speech) using SSML, the markup language that controls synthetic speech.
   - Wrong-stress foils use the SSML `<phoneme alphabet="ipa">` tag with the stress mark moved. Azure supports IPA stress marks in SSML (verified).
   - Audio is compressed (AAC) for listening only. Compression is fine for listening, not for measurement.
4. **Automatic checks for each audio token.**
   - English contrast tokens: score each token with Azure en-US against its intended word **and** its competitor word. Keep the token only if the intended word scores higher by a set margin and the spoken phoneme matches the target. This implements Brief §3.1: "check that the TTS voice actually produces the contrast."
   - Stress foils: the app's own stress-cue extractor must find the prominence on the intended syllable, on at least 2 of 3 cues.
   - French tokens: the learner is a native French speaker and spot-checks them by ear. An Azure fr-FR score against the competitor word is a secondary check.
5. **Human spot-checks.** A native English listener (a friend, or a paid listener) checks about 10% of English tokens, all wrong-stress foils, and all Check items.
6. **Split into train and test.** A seeded split assigns items and voices to training or test-only. A unit test fails if any test item or test voice appears in practice.

**Voices.**
- English training voices: 4–6. For example, 3 en-US voices, 1 en-GB, 1 en-AU and 1 en-IN. Azure lists 50+ en-US, 16 en-GB, 15 en-AU and 20+ en-IN neural voices (verified).
- English test-only voices: 2 voices never used in practice, plus **natural human recordings**. Candidate sources are CC-licensed word recordings on Lingua Libre or Wikimedia Commons (coverage per word unverified) and 1–2 recorded volunteers.
- The app flags a gap between TTS accuracy and natural-recording accuracy of more than 10 points (Brief §3.1).
- French: fr-FR has 20+ neural voices and fr-CA has 6 (verified). French voices are mostly used to build the babble noise.

| Pack | Items | Held out for Checks | Notes |
|---|---|---|---|
| EN stress words | 360 (2–5 syllables) | 120 | Suffix families (40), noun/verb pairs (30), compound vs phrase (20), English–French look-alikes (100), frequent 3+ syllable words. Each word gets 1 correct and 1–2 wrong-stress foils in 6 voices. |
| EN stress sequence sets | 40 | 10 | Pairs such as REcord/reCORD, for the hard listening tasks (Add. §2 notes) |
| EN /h/ | 60 minimal pairs + 60 lexical-decision items | 20 + 20 | Both dropped-/h/ nonwords ("'oliday") and added-/h/ nonwords, so the drill does not reward adding /h/ (Add. §6) |
| EN /iː-ɪ/ | 80 pairs | 25 | Plentiful in the lexicon |
| EN /uː-ʊ/ | about 20 pairs + near-pairs + nonwords | 7 | True pairs are scarce (pull/pool, full/fool, look/Luke) |
| EN /æ-ʌ-ɑ/ | 60 sets | 20 | en-US values |
| EN sentence stress | 60 correction dialogues | 15 | |
| EN retell stories | 40 stories of about 70 words, level B1–B2 | 12 (3 forms × 4 Checks) | Level set by the onboarding sentence-repetition test |
| EN opinion prompts | 20 | 8 | |
| EN unpredictable sentences | 120 | 120 (Checks only) | 5–8 words, grammatical, hard to guess from context |
| EN phrase bank | 150 frequent spoken chunks | — | Used in retell and shadowing |
| EN diagnostic read passage | 1 custom passage | — | Covers the targets |
| EN repeatability set | 10 sentences | fixed | Recorded twice at onboarding and at each Check |
| FR paired items | 120 sentences + 120 pseudo-words | 30 + 30 | Pseudo-words balance /i y u e ɛ ø o ɔ a/ and the nasal vowels |
| FR listener-game pairs | 150 | — | Nasal/oral vowels, le/les, tu/tout, final consonants (petit/petite) |
| FR unpredictable sentences | 120 | 120 (Checks only) | |
| FR retell prompts | 30 | 8 | |
| FR vowel probes | 60 words | fixed | "Le mot __ me plaît." |
| Babble noise | 3 tracks of 2 min | — | Mixed from 6–8 TTS voices reading unrelated texts; no licence issues |

Each attempt records the content pack version. Explanations and mouth pictures are one sentence each, following the addendum's "keep explanations short, practice first" (Add. §5.14 [Weak]).

**TTS cost.** Content is generated once, not live, so the open TTS proxy from v1 disappears. My rough estimate is a few hundred thousand characters. That fits within Azure's free 0.5M characters a month (secondary source). Whether SSML tags count as billed characters is **(unverified)**.

### 3f. Progress measurement

#### Progress Check design

Checks happen every 4 weeks, within the brief's 2–4 week range. They use a different visual theme and give no feedback. The English Check is split in two parts of about 7 minutes each.

| Part | Task | Measures |
|---|---|---|
| EN part A (speaking) | (1) Retell a **new** story; the intended message is known, which helps both ASR and raters. (2) A 60-s opinion. (3) 10 unpredictable sentences. (4) The 10-sentence repeatability set. | Fluency measures; ASR intelligibility; noise floor |
| EN part B (targets) | (5) Held-out words for **all** segmental targets and stress, in a carrier phrase, including targets not yet trained. (6) Listening: 40 trials on test voices and natural recordings (stress, vowels, /h/ lexical decision). (7) Delayed probe of the last block. | Transfer per target; listening; retention |
| FR (about 8 min, on the French day) | Habitual and clear takes of 8 held-out sentences (noise mixed in afterwards); a 75-s retell; 5 repeatability items. | Clarity gain in noise; habitual drift; decay; noise floor |

- **Forms.** Each Check uses a new form (a new story, new sentences, new held-out words). Forms rotate in counterbalanced order.
- **Mastery rule.** A target is marked **learned** only when it holds on untrained items at the delayed probe (Brief §7.1).
- **Store first, analyse later.** Check audio is always stored. A Check can therefore be recorded before its analysis code exists, and all Checks can be re-scored together later.

#### Personal noise floor

At onboarding and at every Check, the learner records the same 10 sentences twice. From these pairs the app estimates two things for each measure:
- the **standard error of measurement (SEM)**, the typical size of a score's random error;
- **test–retest reliability**, how well two recordings of the same items agree.

The app then computes the **reliable change index** for each measure: RCI = (new − old) / (√2 × SEM). A change counts as real when |RCI| > 1.96 (Brief §3.7 [Moderate]). Measures with test–retest ICC below about .7 are not shown as trends. (ICC, the intraclass correlation, is a 0–1 agreement measure; the .7 cut-off is a heuristic.)

#### Target priority model

This is the noise-aware replacement for v1's "5 lowest averages".

For each target *t* (for example "/ɪ in ship-type words", "word stress", "/h/ dropped", "pauses inside clauses"):

1. **Tokens.** Each scored instance gives an outcome *y* (1 = error, 0 = no error) and a weight *w* between 0 and 1:
   *w* = quality (1 if the take passed the gate, 0.5 if marginal) × confidence (1 when two error signals agree, such as a low phoneme score **and** the competitor as spoken phoneme; 0.5 when only one) × dispute factor (0.3 if disputed) × recency (halves every 45 days, so old attempts fade; v1's all-time average never forgot).
2. **Estimate.** A beta-binomial model: a method that turns counts into a likely range and pulls estimates based on few tokens toward a sensible prior (Brief §7 technology options). Error rate ~ Beta(α₀ + Σ*w·y*, β₀ + Σ*w·*(1−*y*)). The prior mean comes from the French-speaker profile (for example stress 0.5, /ɪ/ 0.4, /h/ 0.35), with weak strength (α₀ + β₀ = 4).
3. **Evidence gate.** A target cannot be called weak or fine until it has 15–20 tokens, in at least 5 different words, over at least 3 sessions (Brief §2 row 10; a heuristic [Weak]).
4. **Status**, from the 80% credible interval [L, U] (the range the true error rate probably lies in) against a threshold θ calibrated in validation (default 0.25):
   - **likely weak**: gate passed and L > θ;
   - **likely fine**: gate passed and U < θ;
   - **uncertain**: everything else. An uncertain target gets **probe** slots (short targeted tests), not training slots.
5. **Priority** = functional load × expected error rate × frequency coverage × perception factor.
   - Functional load comes from a data file. Stress, /h/ and pausing take weights from the addendum ranking. The segment weights must come from a published functional-load ranking, to be sourced and cited before use.
   - The perception factor is 1.2 when listening accuracy is below 80%, which routes the target to listening first.
   - All weights live in a data file labelled *provisional*.
6. **Two tracks per target.** Listening accuracy (Wilson interval) and speaking error rate are kept apart, so the app can say "hearing problem" or "speaking problem" (Brief §3.1).
7. **French.** The French track uses the same machinery on clarity features, not phonemes. For each feature (pitch range, vowel length, 1–3 kHz energy, pause rate, keywords understood in noise), the model tracks how much it changes between habitual and clear takes. Features the learner does not change become cue targets (Add. §3.3 item 1). This follows the finding that the speakers who gained most lengthened their vowels and spread them apart more (Ferguson & Kewley-Port).

#### Handling noisy and drifting scores

- **Quality gate before scoring** (section 4b). Failed takes are never scored.
- **Provenance on every score:** provider, locale, SDK version, date, device and browser, content pack version, and **scoring era**.
- **Scoring eras.** Once a month, the 10 stored baseline sentences are re-scored. Azure updated its en-US and fr-FR models in August 2026, and the documentation offers no way to lock a model version (Brief §3.7). If the monthly re-score shifts beyond the noise floor, or Microsoft announces a model update, the app opens a new era. It then re-scores **all stored Check audio** before comparing Checks, since Checks are only about 10 minutes of audio each. Comparisons across eras are never made on raw scores.
- **Single-case statistics.** For sequences of Checks, the app reports NAP (non-overlap of all pairs: the share of before/after pairs where the later value is better) and the log response ratio (the change in average as a ratio), plus the RCI. It avoids Tau-U (Brief §3.7). With 3 or more staggered targets, the design meets the reported minimum for a multiple-baseline design (Kratochwill, not re-checked).
- **Display.** Trends show ranges. There are no single-take verdicts and no daily practice averages on the Progress screen.

#### Optional human listener panel

- **When:** at baseline and week 12, optionally week 6.
- **Who:** 3–5 listeners willing to follow short instructions, or about 10 untrained ones (Brief §7.1).
- **What each listener gets:** a link to a page with baseline and new clips, the first 30 s of retells plus the unpredictable sentences, shuffled, undated, with fixed reference clips.
- **Two task types:**
  - *Transcription* of unpredictable sentences, without seeing the text. This measures intelligibility.
  - *Comprehensibility rating* (1–9) of retells, **with** the story prompt visible. Raters who did not know the intended message rated L2 French speech as easier to understand (Brief §3.7, De Fino [Moderate]).
- **Noise band:** the variability of ratings on the reference clips.

### 3g. Habit and motivation design

| Feature | Design | Evidence |
|---|---|---|
| Goal tied to real use | Asked at onboarding and shown on the Progress screen | Brief §7.11 [Moderate–Weak] |
| Weekly target, not streaks | A ring showing sessions this week out of the target. Never resets. Never punishes a missed day. | Brief §3.6 (Lally: a missed day did no harm) [Weak]; Brief §4 (no evidence for streaks) |
| If-then plan | "After [cue], I do one session." A calendar file creates a repeating reminder, with no push server needed. Web push is possible later: home-screen web apps on iOS support it from 16.4 (verified). | Brief §3.6 [Moderate; small effect after bias correction] |
| Always a possible session | 5-minute and listening-only options mean a busy day still counts | Add. §5.7 [Weak] |
| Welcome back | 3-minute comeback session and capped backlog | Add. §5.7; Brief §3.6 (pausing and returning is common) |
| Visible competence | Monthly blind A/B before/after clips ("which one is clearer?"), then the reveal. Plain statements of what is now reliable. | Brief §7.11; self-efficacy correlates with achievement (Brief §3.6 [Moderate]) |
| Explain the difficulty | One line on why mixed practice feels harder but works better | Brief §3.5 (Abel & de Bruin [non-language]) |
| Real-world speaking log | Weekly: "Did you speak English with someone? How did it go?" (one tap plus an optional voice note) | Brief §3.6 (real-world use) [Weak] |
| No points, badges or leaderboards | Nothing to game | Brief §3.6 (game features: motivation effects not robust) |

### 3h. What is deliberately left out

| Left out | Why |
|---|---|
| Tongue-twister speed ladders, tempo tiers, "articulation index" rewards | No evidence of benefit, and v1 rewarded speed (Brief §4 [No evidence]; Add. §5.15) |
| Mouth exercises without speech; cork or pen drills | No evidence, and the only data come from children in therapy (Brief §4) |
| Native accent as the goal; Azure accuracy as the headline score | Accent is partly separate from being understood (Brief §1 [Strong]) |
| Rhythm scores (%V, nPVI) as targets | They vary between speakers and tasks as much as between languages (Brief §3.3 [Moderate]; Add. §6 [Mixed]) |
| Streaks | No evidence (Brief §4) |
| An audio LLM (AI model that takes sound) as pronunciation judge; a text LLM as scorer | Biased and poorly matched to raters (Brief §3.7 [Weak]) |
| ASR accuracy as a pronunciation score | Accent-biased and hides errors (Brief §3.7 [Moderate]); used only as a labelled "lenient machine listener" |
| Typed chat practice | Typed practice transferred weakly to speaking (Brief §3.4, d = 0.29, not significant) |
| Free-form AI voice conversation (for now) | No blind comprehensibility data for LLM partners (Brief §3.4 [Weak]). Guided spoken tasks (E7) cover the need. Revisit in cycle 2. |
| Vowel charts from formants; released final consonant scoring | Formants vary with device and compression; no validated method exists for release (Brief §4; Add. §3.4). Only as hidden experiments. |
| Counting filler words as a clarity measure | Fillers can help listeners (Brief §3.4) |
| Voice-care or diction course content | No intelligibility outcome measured (Brief §4 [Weak]). At most a side panel, never counted as progress. |
| /θ ð/ training in cycle 1 | Low priority for French speakers (Brief §5.1; Add. §2 r7). Monitored only. |
| Liaison, nasal vowels and other L2-French targets | French is native, so the clarity track applies, not the L2 track (Brief §5) |
| Background or lock-screen practice | iOS stops capture when the page is hidden (Add. §4.2 [Moderate]) |
| Per-word colour maps and all-errors feedback | At most 1–2 corrections (Brief §7.5) |

---

## 4. Technical architecture

### 4a. Client platform

**Options (DECISION)**

| | Option 1: local-first PWA + small edge backend (**recommended**) | Option 2: PWA + server that holds the data | Option 3: Capacitor hybrid app |
|---|---|---|---|
| What it is | A PWA (progressive web app: a website you install to the home screen). All learner data stays on the phone. A tiny serverless function issues speech tokens and handles optional backups and panel links. | A thin PWA. Audio uploads to your Node server, which stores everything in SQLite on a persistent disk and calls Azure. | The same web code inside a native shell (Capacitor), with native plugins for audio, files and notifications |
| Speech path | The phone streams audio straight to Azure using a 10-minute token | Phone → your server → Azure | Same as Option 1 |
| Feedback delay | Lowest: audio streams while you speak | Higher: upload, then Azure | Lowest |
| iOS risks | Web audio quirks; permission re-prompts (below) | Same | Fewer audio quirks; needs a Mac and Xcode. Free Apple signing expires every 7 days; the paid programme is US$99 a year (verified). |
| Heavy analysis (Praat, forced alignment) | Not in production; developer laptop only | Possible (a Python sidecar) | Not in production |
| Hosting cost | About $0 | About $2–10 a month (4f) | About $0 + $99 a year |
| Solo effort | Lowest | Medium (server operations, backups, auth) | Medium–High |
| Evidence fit | Meets everything, because the analysis the evidence needs is timing and pitch, which runs on the phone | Meets everything | Meets everything |

**Recommendation: Option 1.** The analysis the evidence needs is light enough for a phone: pitch, timing, pauses, energy. Azure does the heavy acoustic scoring. Keeping data on the phone removes v1's ephemeral-disk problem. The domain logic lives in pure TypeScript packages, so moving to Option 3 later means wrapping the app, not rewriting it. **Escape hatch:** if iOS web audio fails validation (section 6, V7), wrap with Capacitor.

**Client stack (within Option 1):** React + TypeScript + Vite (the stack you already know). `vite-plugin-pwa` for the service worker (the offline cache). Dexie over IndexedDB (the browser's built-in database). OPFS (Origin Private File System, the browser's private file storage) for audio. Screen Wake Lock during sessions keeps the screen on (iOS support **unverified**).

Routing must not use URL hash changes. A WebKit bug (215884) causes repeated microphone prompts in home-screen apps when the hash changes (verified).

### 4b. Audio capture pipeline on iOS and Android

```
[Tap "Start"] -> getUserMedia (once per session) -> AudioContext (created inside the tap)
   -> AudioWorklet "capture" node (Float32 frames at 44.1 or 48 kHz)
        |-> level meter + voice-activity detection (VAD) -> auto-stop after about 1.2 s of silence
        |-> ring buffer -> Web Worker: anti-aliased resample to 16 kHz, 16-bit mono
                 |-> quality gate (clipping %, level, noise floor, estimated SNR, speech length)
                 |-> streamed to the Azure Speech SDK push stream while you speak
                 |-> WAV saved in OPFS (the local audio store)
                 '-> on-device analysis: pitch, intensity, pauses, 1-3 kHz energy, noise mixing
```

- **Secure page.** The app is served over HTTPS. Phones allow the microphone only on secure pages (Add. §4.2 [Strong]).
- **Capture.** AudioWorklet (a browser feature that processes audio as it arrives) is supported in Safari 14.1+ and Chrome 66+ (verified).
  - Fallback: MediaRecorder, the built-in recorder. The app picks a format by testing support (`audio/mp4` first on iOS, `audio/webm` on Chrome), then decodes to PCM (uncompressed samples). v1 hard-coded `audio/webm`, which fails on some iPhones.
- **One microphone stream per session.** The stream stays open across takes and closes at the end of the session. v1 stopped the microphone after every take and leaked AudioContexts.
- **Browser audio processing.** Echo cancellation, noise suppression and automatic volume are requested **off**, because the app's own measures need raw audio. Whether this helps or hurts Azure scores is unknown (Add. §7 Q9), so validation test V1 compares both settings. Whether iOS honours these requests is **(unverified)**.
- **Interruptions.**
  - When the page is hidden, or iOS puts the AudioContext in its "interrupted" state (a call, Siri), the take is discarded and the learner sees "Take interrupted, please redo".
  - The AudioContext is resumed only inside a tap.
  - No background recording (Add. §4.2).
- **Take limits.** Items last about 3–15 s. Scripted assessments are capped at 30 s, the REST limit for pronunciation assessment (verified). Retells of 40–90 s use the SDK's continuous mode. In continuous mode Azure does not detect omitted or inserted words (verified), so the app computes these itself for retells.
- **Resampling.** A proper low-pass filter (windowed-sinc) runs before downsampling. v1's linear fallback had none, which causes aliasing (distortion from high frequencies folding down).
- **Voice-activity detection (VAD).** First an energy-based detector (pure TypeScript, testable). Optionally Silero VAD through `@ricky0123/vad-web`, which adds about 10 MB of model and runtime (verified).
- **Pitch.** The McLeod pitch method via `pitchy` (verified: pure ES module; returns pitch plus a clarity value between 0 and 1). Frames with clarity below 0.9 are ignored.
- **Playback while recording** (earbud noise in French mode): iOS audio routing in this case is **(unverified)** and is tested in V7. Noise for *measurement* is always mixed digitally at a fixed SNR (signal-to-noise ratio), never picked up by the microphone.

**Android:** the same pipeline. Chrome Android supports AudioWorklet and both MediaRecorder formats.

### 4c. Scoring and analysis per language and feature

| Feature | Lang | What computes it | Where it runs | Fallback | Status |
|---|---|---|---|---|---|
| Sound accuracy (vowels, /h/, clusters) | EN | Azure Pronunciation Assessment, en-US, scripted: phoneme granularity, IPA, `nbestPhonemeCount` 5 (spoken phoneme), miscue detection on | Cloud (streamed from the phone) | Relay through the Worker to the REST short-audio API; SpeechSuper pilot | JS SDK exposes `nbestPhonemeCount`, `phonemeAlphabet` and `enableProsodyAssessment` (verified in SDK source). Detection on this voice: V2. |
| Vowel length | EN | Phoneme timings from Azure (Offset/Duration) | Phone | — | Timings present in en-US results (verified) |
| Word stress cues | EN | Azure en-US syllable timings + on-phone pitch (semitones against the speaker's median), peak loudness and vowel-nucleus length + reduction from the spoken phoneme (schwa or full vowel). A weighted cue model predicts the strongest syllable. | Phone + cloud | SpeechSuper, which advertises English "syllable stress" detection (vendor claim, **unverified**) | **Must pass V3 before verdicts appear.** Azure has no stress error type (Brief §3.7). One research system caught only 49% of errors (Add. §4.2). |
| Sentence (nuclear) stress | EN | Azure word timings + on-phone prominence (pitch excursion, length, loudness) at the target word | Phone | — | V3b |
| Listening trials (HVPT, stress, lexical decision) | EN | App logic only | Phone, works offline | — | — |
| Fluency (articulation rate, mid-clause pauses, run length, time to first word) | EN | Azure continuous recognition (words + timings) → syllable counts from CMUdict (text-based counting beat acoustic counting in one study, Brief §3.4 [Weak]) → pauses ≥250 ms from VAD and word gaps → a rule-based clause splitter (punctuation + conjunctions) labels pauses mid-clause or boundary | Cloud + phone | Syllable counting from loudness peaks | V5: 20–30 hand-labelled recordings |
| Word-for-word recycling | EN | 4-word-sequence overlap between retell rounds | Phone | — | Simple, testable |
| Machine listener / ASR intelligibility | EN | Azure speech-to-text en-US (plain recognition) → word accuracy against the intended text | Cloud | — | Labelled lenient (Add. §5.12) |
| Prosody number, "monotone" and "break" flags | EN | Azure en-US prosody | Cloud | — | Stored, secondary only |
| Clarity in noise | FR | Phone mixes babble into the WAV at a calibrated SNR → Azure fr-FR speech-to-text → keyword accuracy | Phone + cloud | Whisper on the phone later (**unverified** on iOS memory) | V4: SNR calibration + 2 human transcribers |
| Pitch range, word and vowel length, pause rate, 1–3 kHz energy ratio | FR | Phone DSP (digital signal processing) using Azure fr-FR word timings. Vowel timing from fr-FR phoneme timings, mapped through the app's French lexicon because fr-FR phonemes have no names. | Phone | Syllable nuclei from loudness peaks | fr-FR phoneme timings **(unverified)**; V4 |
| Azure fr-FR accuracy | FR | Azure | Cloud | — | Stored, not shown (a native speaker scores near the ceiling) |
| Vowel distinctness (formants) | FR | Phone LPC (a method that estimates formants from the audio) | Phone | — | Experimental, hidden (Add. §3.4 [Mixed]) |
| Shadowing alignment | EN | Dynamic time warping (DTW: stretches one recording in time to line it up with another) of pitch and loudness against the model | Phone | — | Experimental |

**Validation tools (never in the live app):**
- Praat through Parselmouth computes pitch, intensity and durations. It serves as a **test oracle**: a trusted reference that the app's own DSP must match within set tolerances.
- The Montreal Forced Aligner (MFA) cross-checks Azure's timings on validation clips. It runs on the developer's laptop; secondary sources say it needs 8 GB of RAM or more **(unverified)**.

**Provider interface.** `SpeechScorer` has adapters `AzureSdkScorer`, `AzureRestRelayScorer`, `FixtureScorer` and later `SpeechSuperScorer`. Every result is converted into one typed internal model with provenance.

### 4d. Backend

**Language and host (Option 1):** TypeScript on Cloudflare Workers (a serverless function platform), with the Hono web framework. Static app and content on Cloudflare Pages. KV (a key-value store) or D1 (Cloudflare's SQLite service) for small state. R2 (object storage) for blobs.

**Responsibilities.** The backend holds no learner data by default.
1. Pair a device and check it on each call.
2. Issue short-lived Azure tokens. The key stays in a Worker secret. Tokens are valid for 10 minutes, and the docs recommend reusing one for 9 minutes (verified).
3. Rate-limit token issuing.
4. Optionally relay audio to the REST API.
5. Store encrypted backups (optional).
6. Host the listener panel.
7. Serve content packs.

**API sketch**

| Method and path | Auth | Purpose |
|---|---|---|
| `GET /api/health` | none | Health check |
| `POST /api/pair` `{pairingCode}` | one-time code (Worker secret) | Returns a revocable device token |
| `POST /api/speech/token` | device token | `{token, region, expiresAt}`. Limits: 30 an hour, 200 a day. |
| `POST /api/speech/assess?locale=en-US` | device token | Fallback relay: streams WAV to Azure REST short audio with the pronunciation-assessment header. Chunked upload, which Microsoft recommends (verified). |
| `PUT /api/backup/:id`, `GET /api/backup`, `GET /api/backup/:id` | device token | Encrypted snapshots (AES-GCM, key derived from your passphrase on the phone). The server never sees plain data. |
| `POST /api/panel` → `{panelId, links[]}`; `PUT /api/panel/:id/clips/:clipId` | device token | Create a listener panel and upload the chosen Check clips |
| `GET /l/:listenerToken`; `GET /api/l/:listenerToken/next`; `POST /api/l/:listenerToken/responses` | unguessable link, expires after 14 days | Listener page and answers |
| `GET /api/panel/:id/results`; `DELETE /api/panel/:id` | device token | Results; delete the clips |
| `GET /content/:pack/:version/*` | none (immutable cache) | Content packs and audio |

**Option 2 alternative:** the same routes on a Node/Hono server with SQLite on a persistent volume. It adds `POST /api/attempts` (audio upload plus scoring) and server-side storage.

### 4e. Data

| Data | Where | Persistence | Notes |
|---|---|---|---|
| Profile, settings, plan | IndexedDB | Permanent | |
| Attempts (metadata, raw Azure JSON, derived measures, provenance) | IndexedDB | Permanent | Raw JSON is kept so the data can be re-parsed later |
| Target tokens, model state, review queue, sessions | IndexedDB | Permanent | |
| Progress Checks, measures, scoring eras | IndexedDB | Permanent | |
| Practice audio (16 kHz WAV, about 32 KB per second) | OPFS | Pruned after 30 days, unless flagged or disputed | About 1–3 MB per session |
| Baseline, repeatability and Check audio | OPFS | Permanent | Needed for re-scoring and before/after |
| Content packs (JSON + AAC) | Cache Storage via the service worker | Versioned | Listening works offline |
| Device tokens, rate counters, panel metadata | Cloudflare KV or D1 | Server | No learner content |
| Encrypted backups; panel clips | R2 | Backups until you delete them; panel clips until the panel closes or after 14 days | Panel clips are the only unencrypted audio stored off the phone, and only when you opt in |

- **Staying persistent on iOS.** Install to the home screen and call `navigator.storage.persist()`. Home-screen web apps are exempt from Safari's 7-day eviction of data created by scripts (verified).
- **Export.** "Export everything" creates a zip (JSON + Check audio) saved through the share sheet. A monthly reminder prompts a backup.
- **Delete.** One button wipes the phone data and asks the Worker to delete the backups.
- **Privacy.** Audio leaves the phone only to Azure for processing, to R2 as encrypted backups, and to R2 as panel clips you chose. Azure's handling of real-time audio should be checked in Microsoft's privacy documentation **(unverified here)**.

### 4f. Hosting, HTTPS, access control, secrets, cost

- **HTTPS:** automatic on Cloudflare Pages and Workers, on `*.pages.dev` or a custom domain.
- **Access control.** A pairing code (Worker secret) exchanged once for a device token stored on the phone. Tokens are revocable, and token issuing is rate-limited. Alternative: Cloudflare Access with a one-time email PIN, free for up to 50 users (verified). Its behaviour inside an iOS home-screen app is **(unverified)**, so it is not the default.
- **Secrets:** `AZURE_SPEECH_KEY` and the pairing secret are stored with `wrangler secret`. The key never reaches client code: the continuous-integration pipeline (CI) builds the bundle and fails if the key or its variable name appears in it (CLAUDE.md rule 6).
- **Spending guard:** Azure F0 (free tier) has a hard cap. On S0 (pay-as-you-go), set a budget alert.

**Estimated usage:** about 1–3 minutes of scored audio per session, about 20 sessions a month, plus Checks, comes to about **1–2 audio hours a month**. The validation month is heavier, at about 3–4 h.

| Item | Cheap / free path | Comfortable path |
|---|---|---|
| Static app + Worker | Cloudflare free: 100k requests a day, 10 ms CPU per call (secondary sources) | Workers Paid, $5 a month (optional) |
| Storage | R2 free 10 GB, no egress fees; D1 free 5 GB (secondary sources) | Same |
| Azure speech-to-text + pronunciation assessment | **F0**: 5 audio hours a month free (secondary), 1 concurrent request (verified), hard stop. Whether F0 includes pronunciation assessment and prosody is **(unverified)**; test in F3. | **S0**: about $1 per hour base + about $0.30 per hour for the pronunciation add-on (secondary; the official page was blocked for me) → about **$2–5 a month** |
| Azure TTS (build time only) | F0: 0.5M characters a month (secondary) | Standard, about $15–16 per 1M characters (secondary) |
| Domain | None (`*.pages.dev`) | About $1 a month |
| Listener panel | Friends | Paid listeners (price **unverified**) |
| SpeechSuper pilot | — | Pricing not published; contact sales (verified) |
| **Total** | **About $0 a month** | **About $5–15 a month** (+$99 a year if Option 3) |

**Option 2 costs, for comparison:**
- Fly.io: shared-cpu-1x 256 MB for about $2 a month; volumes $0.15 per GB-month; no free tier for new customers; a pricing change takes effect 1 Oct 2026 (secondary sources).
- Render: Starter $7 a month + disk $0.25 per GB; the free tier spins down after 15 minutes idle (secondary).

### 4g. Testing strategy (fits Red → Green → Refactor)

**Layers**
- `packages/core` is pure TypeScript with no DOM. It holds the scheduler, target model, statistics (beta posterior, Wilson interval, RCI, NAP), feedback policy, session composer, Check scoring and the content-split rules. Every function has a unit test written first (Vitest), plus property-based tests with `fast-check` (for example: "a posterior interval always contains the posterior mean"; "no test item is ever scheduled in practice").
- `packages/dsp` is pure TypeScript and runs in a Web Worker. It holds the resampler, WAV encoder, quality gate, VAD, pitch, intensity, band energy, noise mixing, syllable nuclei and DTW.

**Testing audio without a microphone**
- **Synthetic signals.** Sine waves at known pitch (the measured pitch must be within 0.5 semitone), amplitude-shaped "syllables" of known length (within 10 ms), white noise mixed at a known SNR (estimate within 2 dB), clipped signals, silence.
- **Golden fixtures.** 20–40 short real WAVs, from the learner and from TTS, committed at 16 kHz. Expected values come from Praat/Parselmouth, computed once by a script and committed as JSON. The app's DSP must match within tolerances.
- **Resampler tests:** frequency response (aliasing below −40 dB) and round-trip length.

**Testing scoring without live Azure**
- **Recorded fixtures.** Real Azure JSON captured once through the Validation Lab (en-US with prosody, syllables and spoken phonemes; fr-FR without phoneme names; unscripted; continuous; error cases), cleaned and committed.
- **Parser contract tests** turn v1's bugs into regression tests: the right JSON path to words, prosody requested and present, the detail result read correctly, results handled through callbacks rather than an awaited promise, result reason compared with the SDK enum rather than a string.
- `FixtureScorer` drives UI and flow tests.
- A **live suite** (`npm run test:live`) runs only when you set an environment variable. It never runs in CI. Tests never crash when `.env` is missing, because configuration is validated lazily.

**Worker:** Vitest with Cloudflare's Workers test pool (Miniflare). `issueToken` is mocked with a fetch mock. Tests cover pairing, rate limits, token expiry and panel link expiry.

**UI:** React Testing Library for components and flows. Playwright end-to-end tests use Chrome's fake microphone flag (`--use-file-for-fake-audio-capture`), which plays a fixture WAV as microphone input, together with `FixtureScorer`.

**Phone:** a manual checklist for each release on a real iPhone and Android phone (permission, interruption, backgrounding, offline listening, install, storage after 2 weeks). This is CLAUDE.md check 4.

**Gates in CI:** type-check, lint (warnings treated as errors), unit tests, build, bundle secret scan.

### 4h. What happens to v1 code

1. **Now, before anything else:** delete or suspend the Render service and **rotate the Azure key**. v1 exposes an open TTS proxy that spends your key (context: v1 review).
2. Tag `v1-final` and move `docs/backlog/` into `docs/backlog/archive/v1/`. Record the decision in `docs/adr/001-v2-rewrite.md`.
3. **Keep:** `pcmToWav` and its tests, moved into `packages/dsp`. **Replace** its linear resampler. Also keep the Vitest scaffolding patterns, the docs and backlog conventions, and the research folder.
4. **Delete:** the Express server, TTS proxy, SQLite schema and migrations, `useRecorder`, content packs (mis-tagged, and the nasal-vowel examples swapped), speed ladder, drills, progress service, and `render.yaml`.
5. Rewrite `docs/prd.md`, `product-design.md`, `technical-design.md`, `api-reference.md` and `database-schema.md` (which becomes the client IndexedDB schema) in the same changes as the new code.

---

## 5. Build roadmap

**Effort, solo developer with AI agents:** S = 2–4 days, M = 1–2 weeks, L = 3–4 weeks. Epics keep the `F{n}` naming. Order: F1 → F2 → F3 → F4 → F5 → {F6, F7} → F8 → F9 → F10 → F11.

**Measurement comes first.** Baseline audio is recorded in F3, **before any training**. Analysis can come later because the audio is stored.

| Epic | Goal | Main tasks | Effort | Shippable result |
|---|---|---|---|---|
| **F1 Reset and skeleton** | Clean start, decisions recorded, deployable shell | ADRs (platform, data location, English/French split); shut down Render and rotate the key; tag v1 and archive it; workspace layout (`apps/pwa`, `apps/edge`, `packages/core`, `packages/dsp`, `tools/content`); CI with secret scan; PWA shell with install guide; Worker with health, pairing and token endpoints (tests with mocked Azure); deploy | M | App installed on your phone over HTTPS, showing "Paired ✓" |
| **F2 Audio capture and quality gate** | Reliable recording on iPhone and Android | Capture worklet; microphone scoped to the session; anti-aliased resampler; WAV; VAD auto-stop; quality gate; OPFS store; interruption handling; MediaRecorder fallback; playback; wake lock | M | "Microphone check" and record/replay with quality verdicts on both phones |
| **F3 Scoring adapter, baseline and Validation Lab** | Trustworthy scoring pipeline; baseline captured before training | `SpeechScorer` interface; Azure SDK adapter (token refresh, push stream, en-US assessment with prosody, IPA, spoken phonemes and syllables; fr-FR assessment; plain speech-to-text; unscripted; continuous); typed parser + fixtures + v1-bug regression tests; provenance and eras; Validation Lab; **baseline capture** (EN retell, opinion, read passage, repeatability set; FR pairs, sentences, retell); run V1, V2, V4a, V7 | L | You record your baseline and run validation on your phone |
| **F4 Stress Starter (first practice slice)** | Daily practice on the top-ranked English target | Content pipeline (CMUdict + frequency, SSML foils, TTS batch, automatic checks, train/test split test); HVPT engine (identification, shape matching, sequence recall, voice pools, test-only voices); stress speaking with cue display (no verdicts yet); feedback card + retry loop; minimal 5-minute session runner and 1/3/7/14 review; weekly ring; stress pretest; run V3 | L | **A daily 5-minute "Stress Starter" on your phone.** Your first real practice. |
| **F5 Session engine, scheduler, habit, Check capture** | Full 5/10/15-minute sessions and multi-week structure | Session composer; phase rules; blocked-then-mixed; spaced queue with cap; welcome-back; goal and if-then plan; calendar reminder; summary screen; home screen; listening-only mode; **Progress Check runner (capture only)** | M | Full English sessions and the week-4 Check recorded on time |
| **F6 /h/ and vowel-pair modules** | Blocks A–C | General contrast HVPT; /h/ lexical decision; spoken-phoneme feedback cards; vowel-length bars; transfer words; dispute button; mouth pictures; "use it" micro-tasks with the machine listener; content for A, B and C, including natural test recordings | L | Block A running; B and C ready on schedule |
| **F7 Check analysis and target model** | Honest progress | ASR intelligibility; fluency measures + clause splitter (V5); held-out accuracy; listening on test voices; beta-binomial target model and statuses; RCI and NAP; re-scoring by era; monthly anchor re-score; Progress and target-detail screens; delayed probes; Cycle Report | L | Check 1 report with ranges and "reliable / within noise" labels |
| **F8 Fluency and sentence stress** | E5, E6, E10 | Retell ×3 flow; rephrase detection; phrase bank; correction dialogues; experimental pitch line with fading; shadowing (experimental, off) | M | 15-minute sessions with a retell |
| **F9 French clear-speech track** | C1–C7 | Paired-take flow; cue library; babble generation; digital noise mixing; SNR staircase for the listener game; French feature measures; rate gate; semi-free decay; French Check; V4b | L | Weekly French clarity session |
| **F10 Listener panel, backup, export** | Human validation and data safety | Encrypted backup; zip export; panel creation; listener page; blind shuffled ordering with reference clips; results with noise band; deletion | M | Week-12 panel runs; data backed up |
| **F11 Experiments (optional)** | Evidence gaps tested on this learner | Capacitor wrap; SpeechSuper pilot (V8); "tap the beat" in alternating weeks; exaggerated-then-faded stress cues; vowel chart; text-LLM explanation layer ("not sure" when confidence is low) | S each | Each is a switchable experiment with its own before/after |

**Timeline pressure.** Check 1 falls at week 4 of practice. F5 therefore ships Check *capture* early. F7's analysis can follow, because the audio is stored. If F6 slips, the stress spine continues alone and block A starts late; the multiple-baseline design tolerates staggered starts.

**Decisions needed before F1 starts**
1. Platform option: 1, 2 or 3.
2. French variety: fr-FR or fr-CA.
3. English/French time split (default 75/25).
4. Budget path: F0 free or S0.
5. Listener panel: none, friends, or paid.
6. Cloud backup: on or off.
7. Pre-registered success criteria (2.4): accept or edit.

---

## 6. Risks, unknowns and validation plan

### 6.1 Validation sprint (inside F3/F4, about 2 weeks): check before trusting

No number reaches the learner until the relevant check passes. The pass thresholds below are design heuristics, not evidence-based cut-offs.

| # | Question | Method on this learner's voice and phone | Pass rule → consequence |
|---|---|---|---|
| V1 | How noisy is the recording chain? | 10 sentences × 2 takes × {processing on, off} × {quiet, normal room}. Compute test–retest ICC and SEM per measure. | Use the setting with lower SEM. Measures with ICC below .7 are not shown as trends. |
| V2 | Does Azure en-US catch this learner's errors without false alarms? | 60 items: 30 intended-correct (judged by a native listener) + 30 **deliberate** errors (ship→sheep, dropped /h/, full vowel instead of schwa, cluster simplification). Compute detection rate and precision per error type. Calibrate the error threshold. | Show feedback for an error type only if precision ≥ .80. Otherwise log it silently. |
| V3 | Is the stress-cue model valid? | 80 words read with stress deliberately on the right or wrong syllable (guided by TTS foils) + 40 natural attempts judged by 1–2 native listeners. Also compare against SpeechSuper if piloted. | Stress verdicts only if kappa ≥ .6 (a chance-corrected agreement measure) **and** precision ≥ .85 (high precision, low recall accepted, per Add. §4.2). Otherwise show cues only. |
| V3b | Sentence stress detection | 30 correction dialogues, with the right and wrong word stressed | Same rule |
| V4a | Does the fr-FR phoneme-to-lexicon mapping work? | 20 words: check that the returned phoneme count and timings match the lexicon (the fr-FR gaps are in Brief §6). | If it fails, French vowel timing falls back to syllable nuclei. |
| V4b | Calibrating the French noise test | Choose the SNR at which habitual speech gives 60–80% keyword accuracy (room to improve). 20 noise-mixed clips transcribed by 2 humans, compared with ASR. | Use it only if ASR tracks the humans' ordering of habitual vs clear takes. |
| V5 | Fluency measures | Hand-label pauses and clause boundaries in 20–30 recordings (Brief §7) | Correlation ≥ .8 for mid-clause pause counts. Otherwise show total pauses only. |
| V6 | Do the TTS voices carry the contrasts? | Automatic checks (3e) + human spot-checks | Drop failing tokens and voices |
| V7 | Phone behaviour and latency | Time to feedback, median and 90th percentile, on Wi-Fi and 4G. iOS: permission persistence, interruptions, playback while recording, storage after 2 weeks. Android: the same. | Target ≤ 2–3 s to first cloud feedback (Add. §5.10 [Weak]). If iOS fails badly → Option 3. |
| V8 (optional) | SpeechSuper vs Azure | 40–60 items side by side with a native listener (Brief §7) | Adopt it for a feature only if it clearly beats Azure |

**Ongoing checks**
- Monthly anchor re-score (eras).
- A quarterly mini re-validation: 20 clips against a human listener.
- An alert when disputes exceed 15% on a target.
- An alert when the gap between TTS and natural-recording listening accuracy exceeds 10 points.

### 6.2 Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| iOS web-audio quirks (re-prompts, interruptions, audio routing) | Medium | High | No hash routing; one stream per session; V7; Capacitor escape hatch |
| Stress detection not valid on this voice | High | Medium | Cue-only display; listening-first stress training does not depend on it; panel as judge |
| Azure model updates move scores | Certain (documented) | Medium | Eras; re-score Check audio; never compare across eras |
| Azure F0 limits (1 concurrent request, 5 h hard stop) or F0 lacking pronunciation assessment | Medium | Medium | Content validation runs as a sequential batch; upgrade to S0 (about $2–5 a month) |
| Machine intelligibility too lenient (ASR hides errors) | High | Medium | Labelled lenient; unpredictable sentences; panel at week 12 |
| French clarity measures unreliable on a phone | Medium | Medium | Own-baseline only; several measures; V1/V4; formant measures hidden |
| TTS voices do not produce the contrasts; TTS-only listening gains | Medium | Medium | Automatic checks; natural test recordings; gap alert |
| Dropout | Medium | High | Weekly goal, no streaks, 5-minute and listening-only options, comeback session, visible competence |
| Scope creep for a solo developer | High | High | Strict epic order; first slice (F4) is small; experiments isolated in F11 |
| Dose too low for the vowel blocks | Medium | Medium | Adaptive block extension (+2 weeks); dose tracked per target |
| Panel clips and privacy | Low | Medium | Opt-in, Check clips only, expiring links, deletion |
| Token endpoint abuse | Low | Medium | Pairing, revocation, rate limits, spending cap or alert |

### 6.3 Unknowns the design treats as experiments on this learner

1. Does English stress training transfer to free speech? (Add. §7 Q3) Answered through Checks and the panel.
2. Browser noise suppression on or off for Azure. (Add. §7 Q9) Answered by V1.
3. Shadowing versus listen-and-repeat. (Add. §7 Q4) F11, alternating weeks.
4. Does clear-speech practice raise *habitual* French clarity? (Add. §7 Q12) Measured as habitual drift.
5. Does French clear-speech practice carry over to English clarity, or the reverse? (Add. §7 Q13) Exploratory: compare English Check changes before and after the French track starts.
6. Right dose and spacing for 5–15-minute sessions. (Add. §7 Q6) Dose logs set against Check gains, over cycles.
7. Cost of /θ ð/ and final clusters. (Add. §7 Q2) The monitored targets give data; a literature check comes before cycle 2.

---

## 7. Evidence map

| Feature | Evidence (section) | Strength | Notes |
|---|---|---|---|
| Intelligibility and comprehensibility as the goal; accent score secondary | Brief §1, §2 row 1; Add. §5.1 | Strong / Moderate | Azure accuracy shown only in Details |
| Separate Progress Checks (unseen prompts, held-out items, delayed probes) | Brief §2 row 2, §3.2, §7.1 | Strong (principle); Moderate (design) | Every 4 weeks; store first, analyse later |
| Personal noise floor, RCI, NAP, multiple baseline | Brief §3.7, §7 technology options | Moderate | Staggered blocks A, B, C |
| Scoring eras and re-scoring after model updates | Brief §3.7, §4; Add. §5.11 | Strong (documented) | Monthly anchor re-score |
| Quality gate; uncompressed 16 kHz capture | Add. §4.2, §5.2; Brief §3.7 | Strong (format, limits); Moderate (quality) | AudioWorklet pipeline |
| Onboarding diagnostic; errors only candidates until probed | Brief §7.2 | Moderate | Spread over 3 short sessions |
| Target priority model (functional load × error rate × frequency; 15–20 tokens, 5 words, 3 sessions; intervals) | Brief §2 row 6, row 10, §7.3 | Moderate (EN); Weak (thresholds) | Beta-binomial; weights provisional |
| HVPT, identification with labels, instant feedback | Brief §3.1, §7.4; Add. §2 notes | Strong (listening); Moderate (speaking) | 4–6 training voices |
| Test-only voices and natural recordings | Brief §3.1, §7.4 | Mixed (voices); Weak (TTS) | TTS–natural gap alert |
| Listening first; separate blocks below 80% | Brief §3.1, §3.3; Add. §5.3 | Weak | Phase 1 rule |
| Blocked, then mixed | Brief §3.5 | Mixed | Phases 2 → 3 |
| Word stress as the first English module | Add. §2 r1, §5.3; Brief §3.3 | Moderate (priority); Weak (training) | About 3–4 h spine |
| Hard stress diagnostics (many voices, sequence recall) | Add. §2 notes (Dupoux) | Moderate | In the pretest and hard levels |
| Teach each word's stress pattern | Add. §2 notes (Tremblay 2008) | Moderate | Syllable bubbles on prompts |
| Stress feedback split into length, pitch, loudness, reduction | Add. §5.3 | Weak (method); needs validation | Cues only until V3 passes |
| /h/ module with lexical decision; drops and additions tracked separately | Add. §2 r3, §5.6 | Moderate (one study) | Block A |
| Vowel pairs /iː-ɪ/, /uː-ʊ/, /æ-ʌ-ɑ/ with named-vowel feedback | Add. §2 r2, §5.5 | Moderate | Blocks B and C; spoken phoneme en-US only |
| Corrective feedback + retry; at most 1–2 corrections | Brief §2 row 5, §3.2, §7.5; Add. §5.4 | Moderate; Weak (limit) | Feedback card |
| Self-correction before model | Brief §3.2 | Mixed | Model one tap away |
| Short how-to tip with mouth picture | Brief §3.2 (Saito 2013 vs Kissling 2013) | Mixed | One sentence |
| Self-estimate on some trials | Brief §3.2, §3.6 | Weak | About 1 in 4 trials |
| Cautious wording, dispute button, accepted variants | Brief §7.5 | Weak (design inference) | Lowers token weight |
| Targets used in meaningful speech ("use it") | Brief §2 row 13 | Weak–Moderate | E7 |
| Machine listener as a lenient "was I understood" check | Add. §5.12; Brief §3.2 (Mroz) | Moderate/Mixed; Weak | Never a pronunciation score |
| Spaced review 1/3/7/14/28 days; at most 3 back-to-back repeats; backlog cap | Brief §3.5, §7.6; Add. §5.8 | Strong (general L2); Weak (pronunciation) | Preset intervals |
| 12-week cycles; at least 4 sessions a week; 10-minute default with 5 and 15 | Brief §3.5, §7.6; Add. §4.1, §5.7 | Moderate (longer programmes); Weak (session specifics) | Blocks extend up to 16 weeks |
| Dose counted as attempts and trials per target | Brief §3.5 | Weak | Target detail screen |
| Fluency: retell ×3 in a session, new prompt next session | Brief §2 row 8, §3.4, §7.8 | Moderate | Replaces speed ladders |
| Articulation rate, mid-clause pauses, run length on new prompts | Brief §3.4 | Moderate | Only the first telling is measured |
| Rate band, not "faster is better" | Brief §3.4 | Moderate (listener ratings) | |
| Rephrase nudge for word-for-word repetition | Brief §3.4 (Suzuki & Hanzawa) | Moderate | 4-word overlap |
| Sentence stress correction dialogues | Brief §3.3, §7.7 | Moderate (correlational) | Block C |
| Pitch line in semitones, target points, fading | Brief §2 row 14, §7.7 | Weak | Experimental |
| Shadowing | Brief §3.4; Add. §5.13 | Weak | Off by default |
| Clear-speech paired recordings | Brief §2 row 12, §5.3; Add. §3.3, §5.9 | Moderate (immediate); None found (lasting) | C1 |
| "Over-enunciate" and named-listener cues | Add. §3.2 | Moderate | Concrete mouth cues untested |
| Listener simulation in noise | Brief §5.3, §7.10; Add. §3.2 | Moderate (immediate) | ASR partner checked against humans (V4b) |
| Clear at normal rate | Add. §3.2; Brief §5.3 | Weak | Rate gate from week 4 |
| Several clarity measures against own baseline; no single score | Add. §3.4 | Mixed | Feature profile |
| ASR in noise with unpredictable sentences | Add. §3.4; Brief §5.3 | Mixed | Calibrated SNR |
| Semi-free clarity decay | Add. §3.3 (Lee & Baese-Berk) | Weak | Retell start vs end |
| Human listener panel (blind, shuffled, reference clips, prompt visible) | Brief §3.7, §7.1 | Moderate | Optional, F10 |
| Weekly goal, if-then plan, no streaks, welcome back | Brief §2 row 11, §3.6, §7.11; Add. §4.1 | Moderate–Weak (non-language) | Habit layer |
| Before/after recordings | Brief §7.11 | Weak | Monthly blind A/B |
| Instant on-phone cues while the cloud score loads | Add. §5.10 | Weak (latency targets) | Level, length, pitch line |
| Speed ladders removed | Brief §4; Add. §5.15 | No evidence | Left out |
| No audio-LLM judge | Brief §3.7 | Weak | Left out |

---

## Appendix: technical facts checked on the web for this document

**Checked (primary sources or official repositories):**
- **Azure Pronunciation Assessment**:
  - The JavaScript Speech SDK supports it.
  - Prosody, IPA phoneme names, spoken phonemes and syllable groups are **en-US only**.
  - Results carry Offset/Duration for words, syllables and phonemes (en-US example).
  - Unscripted assessment works by leaving out the reference text.
  - Audio over 30 s needs continuous mode, which does not support miscue detection.
  - Content assessment was retired in SDK 1.46.
  - Source: MicrosoftDocs `how-to-pronunciation-assessment.md` on GitHub.
- **JS SDK `PronunciationAssessmentConfig`** exposes `enableProsodyAssessment`, `nbestPhonemeCount`, `phonemeAlphabet` and `enableMiscue` (SDK source on GitHub). Microphone input works only in browsers, and a push stream is available (MicrosoftDocs JS quickstart).
- **Azure REST short audio**: WAV PCM or OGG Opus at 16 kHz mono; pronunciation assessment limited to 30 s or less; chunked upload recommended. **Tokens** last 10 minutes; reuse for 9 (MicrosoftDocs REST pages).
- **Azure F0** speech-to-text allows 1 concurrent request (quotas page, via search).
- **Azure neural voice counts** (en-US 50+, en-GB 16, en-AU 15, en-IN 20+, fr-FR 20+, fr-CA 6) and **SSML IPA with stress marks** (MicrosoftDocs `tts.md`, `speech-synthesis-markup-pronunciation.md`).
- **AudioWorklet**: Safari 14.1+, Chrome 66+ (MDN browser-compat-data).
- **iOS home-screen apps**: Web Push from iOS 16.4 (WebKit blog). Exempt from the 7-day storage eviction; `navigator.storage.persist()` (WebKit "Updates to Storage Policy").
- **WebKit bug 215884**: recurring getUserMedia prompts in standalone mode when the hash changes.
- **Libraries**: `pitchy` (McLeod pitch method, ES module); `@ricky0123/vad-web` (Silero VAD, about 10 MB with the runtime).
- **Apple signing**: free provisioning expires after 7 days; paid programme $99 a year; TestFlight builds last 90 days.
- **SpeechSuper**: 8 languages including French; phoneme-level mispronunciation detection; "syllable stress analysis" (GitHub samples README). These are vendor claims, not independently tested.

**Secondary sources only (official pages were blocked by my network proxy):**
- Azure pricing: about $1 per hour speech-to-text, about $0.30 per hour pronunciation add-on, F0 5 h a month, TTS 0.5M characters free then about $15–16 per 1M.
- Cloudflare free limits.
- Fly.io and Render prices.
- MFA RAM needs.

**Unverified; tested in the validation plan:**
- Azure pronunciation assessment with token auth and a push stream on iOS Safari, end to end.
- fr-FR phoneme timings.
- F0 support for pronunciation assessment and prosody.
- Whether SSML tags are billed as characters.
- iOS honouring requests to switch off echo cancellation and noise suppression.
- Screen Wake Lock on iOS.
- Audio playback during recording on iOS.
- Cloudflare Access inside an iOS home-screen app.
- Lingua Libre coverage per word.
- On-device Whisper memory on iPhone.

**Sources:**
- [Azure pronunciation assessment docs (GitHub source)](https://raw.githubusercontent.com/MicrosoftDocs/azure-ai-docs/main/articles/ai-services/speech-service/how-to-pronunciation-assessment.md)
- [Azure REST short audio](https://raw.githubusercontent.com/MicrosoftDocs/azure-ai-docs/main/articles/ai-services/speech-service/rest-speech-to-text-short.md)
- [Azure REST auth (token validity)](https://raw.githubusercontent.com/MicrosoftDocs/azure-ai-docs/main/articles/ai-services/speech-service/includes/cognitive-services-speech-service-rest-auth.md)
- [Speech SDK JS `PronunciationAssessmentConfig` source](https://raw.githubusercontent.com/microsoft/cognitive-services-speech-sdk-js/master/src/sdk/PronunciationAssessmentConfig.ts)
- [Azure TTS voice list](https://raw.githubusercontent.com/MicrosoftDocs/azure-ai-docs/main/articles/ai-services/speech-service/includes/language-support/tts.md)
- [SSML pronunciation](https://raw.githubusercontent.com/MicrosoftDocs/azure-ai-docs/main/articles/ai-services/speech-service/speech-synthesis-markup-pronunciation.md)
- [Azure Speech quotas](https://github.com/MicrosoftDocs/azure-ai-docs/blob/main/articles/ai-services/speech-service/speech-services-quotas-and-limits.md)
- [Azure pricing Q&A](https://learn.microsoft.com/en-us/answers/questions/5608069/pricing-and-usage-of-pronunciation-assessment-feat)
- [Azure Speech pricing](https://azure.microsoft.com/en-us/pricing/details/speech/)
- [MDN AudioWorklet compatibility data](https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/AudioWorklet.json)
- [WebKit storage policy](https://webkit.org/blog/14403/updates-to-storage-policy/)
- [WebKit Web Push for web apps](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)
- [WebKit bug 215884](https://bugs.webkit.org/show_bug.cgi?id=215884)
- [pitchy](https://github.com/ianprime0509/pitchy/blob/main/README.md)
- [vad-web](https://docs.vad.ricky0123.com/user-guide/browser/)
- [SpeechSuper API samples](https://github.com/speechsuper/SpeechSuper-API-Samples)
- [Cloudflare Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Cloudflare R2](https://www.cloudflare.com/products/r2/)
- [Cloudflare one-time PIN](https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/one-time-pin/)
- [Fly.io pricing](https://fly.io/docs/about/pricing/)
- [Render pricing overview](https://livemy.app/blog/render-pricing)
- [Apple membership comparison](https://developer.apple.com/support/compare-memberships/)
- [MFA installation docs](https://montreal-forced-aligner.readthedocs.io/en/latest/installation.html)