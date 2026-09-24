<!-- Source design 'lean-mvp' (Lean phone-first MVP). Input to design-options.md; not a final spec. -->

# Pronunciation Coach v2: lean phone-first MVP (design proposal)

**Date:** 2026-09-24 · **Angle:** the smallest phone app that delivers the best-supported mechanisms for this learner · **Status:** proposal for the user to choose from. Per CLAUDE.md, the architecture choices are options, not decisions. Appendix A lists them.

**How to read the citations.** "Brief" is `docs/research/evidence-brief.md`. "Addendum" is `docs/research/learner-profile-addendum.md`. "Brief §7 cap. 4" means ranked capability 4 in section 7 of the brief. Strength labels are copied from those files: [Strong], [Moderate], [Weak], [Mixed], [None found], [Unverified]. Technical claims I could not check this session are marked **(unverified)**. Appendix B lists every technical fact I checked and where I checked it.

---

## 1. One-paragraph pitch

Pronunciation Coach v2 is a small app that installs from the browser onto the phone's home screen. In 5 to 15 minutes a day it trains the few things that most limit how easily a French speaker is understood in English. These are hearing and producing **word stress**, the **vowel pairs French lacks** (sheep/ship, pool/pull, cat/cut/cart), **/h/**, and **smooth pacing in free speech**. Each session follows the same pattern. First the learner hears many voices and picks the word they heard. Then they say words and get one specific correction followed by a retry. A standard session ends with a short retelling task done three times. Every four weeks a separate **Progress Check** measures what carried over to unseen words, new voices and free speech. It also separates real change from noise caused by the phone, the room and Azure's model updates.

This design wins for four reasons:
- It bets only on mechanisms with the strongest evidence for this learner.
- It runs almost entirely on the phone. A tiny serverless function only issues 10-minute Azure tokens. The key stays on the server, and nothing leaves the device except the short clips Azure scores.
- It costs about $0 a month on free tiers.
- A usable first slice can ship in about two to three weeks.

Clear-speech training for native French comes next, as the first add-on, once the English core has proved itself.

---

## 2. Goals and success measures

### 2.1 Goals, in order

1. **G1: Be easily understood in English by international listeners, in free speech, not only when reading aloud.** *Comprehensibility* is how easy a listener finds you to understand. *Intelligibility* is how many of your words they actually get. Both are the target. Accent is not. (Brief §1 and §2 row 1 [Strong]; Addendum §5.1 [Moderate])
2. **G2: Keep practising.** The aim is at least 4 sessions a week for at least 8 weeks, because dropout is the main risk. (Addendum §4.1 [Weak])
3. **G3 (first add-on): Speak native French more clearly on demand, and at a natural speed.** (Addendum §3 [Moderate for the immediate effect; None found for lasting change])

**Not goals:** a native accent, or high practice scores. Practice scores rise with repetition and do not show learning. (Brief §3.5, Soderstrom & Bjork [Moderate])

### 2.2 What counts as success

The evidence says that gains are largest on practised items in read-aloud tasks and much smaller in free speech (Brief §1 [Strong]; Saito & Plonsky 2019). So the app treats practice numbers as the least trustworthy signal. The measures below are ranked by how much the app trusts them.

| Rank | Measure | How it is taken | When | Trusted because |
|---|---|---|---|---|
| 1 | **Free-speech fluency on new prompts.** *Articulation rate* (syllables per second, pauses excluded), *mid-clause pauses* per minute (pauses inside a clause rather than between clauses), and *mean length of run* (syllables between pauses) | A 60-s retelling and a 60-s opinion in the Progress Check, on prompts never practised | Weeks 0, 4, 8 | Fluency correlates r = .82 with comprehensibility (Brief §3.4, Chau & Huensch [Moderate]). These are the most useful automatic measures (Suzuki & Kormos [Moderate]). |
| 2 | **Error rate on held-out words** for each trained target | 30 words that practice never uses, said in a fixed carrier sentence | Weeks 0, 4, 8 | Tests transfer to new words (Brief §2 row 2 [Strong]) |
| 3 | **Delayed probe** | The same held-out measures, taken at least 3 weeks after a target's training block ended | Week 8 for Block A | Shows whether the gain lasts (Brief §7 cap. 1) |
| 4 | **Listening accuracy on held-out voices**, both synthetic test voices and natural recordings | 60 trials in the Progress Check | Weeks 0, 4, 8 | Shows that HVPT gains transfer to new voices, and flags a gap between synthetic and natural voices (Brief §3.1) |
| 5 | **Blind listener ratings** (optional). 3 to 5 listeners rate ease of understanding on a 1–9 scale and write down unpredictable sentences. Old and new clips are shuffled together. | Exported "listener pack" | Weeks 0 and 8 | Closest to the real goal. One rater is noisy, and averaging 3 to 5 raters approaches .80–.90 reliability (Brief §3.7 [Moderate]). |
| Secondary | ASR word accuracy on unpredictable sentences, labelled "lenient". Azure accuracy, labelled "closeness to a US model". Practice accuracy, labelled "inflated by practice". | Automatic | Continuous | ASR hides errors, and Azure measures closeness to a native model (Brief §3.7 [Moderate]) |
| Engagement | Sessions per week, active weeks | Automatic | Weekly | Predicts staying with the app (Addendum §4.1 [Weak]) |

**The "real change" rule (handling noisy scores).** A change counts only when all three conditions hold:
- It is larger than this learner's own measurement noise. The app measures that noise by recording the same 10 anchor sentences on two days at baseline, then computes a *reliable change index* (RCI), a standard test of whether a change is larger than measurement error (Brief §3.7 [Moderate]).
- It appears on held-out items, not only on practised ones.
- It is measured against the same Azure model. At every check the app re-scores the stored baseline audio with today's model (Brief §3.7 [Strong] that models change; the August 2026 en-US and fr-FR update is confirmed in Appendix B).

Error rates for single sounds are pooled across many attempts, with a likely range shown. They are never taken from one attempt (see 3f).

### 2.3 What the MVP proves

The MVP is run as an experiment with one learner (an *N-of-1* study). Before the first Progress Check, the user writes down these five hypotheses in `docs/research/n-of-1-plan.md`, so the results cannot be reinterpreted afterwards. All thresholds below are heuristics, not findings from the evidence.

- **H1, adherence.** The learner does at least 4 sessions a week in at least 6 of 8 weeks.
- **H2, measurement.** On this phone and this voice, Azure's vowel and /h/ verdicts meet two bars. They repeat in at least 80% of cases on re-recording. They agree with a native listener at kappa ≥ .4, a chance-corrected agreement score. Together these would show the verdicts are good enough to steer practice.
- **H3, listening.** Held-out-voice accuracy for the Block A contrasts rises beyond noise. The Block B contrasts, still untrained, stay flat until their own block starts. This is a *multiple baseline across sounds*: training sounds one block at a time shows that change follows training, not the calendar (Brief §3.7 [Moderate]).
- **H4, speaking transfer.** The held-out-word error rate falls beyond noise for at least 2 of the 3 Block A targets, and the gain holds at the week-8 delayed probe.
- **H5, free-speech transfer.** At least one fluency measure improves beyond noise on new prompts by week 8.

### 2.4 Decision gates: when to add the next module

| What the Progress Check shows | What it means | Next step |
|---|---|---|
| H1 fails (under 3 sessions a week on average) | Friction or habit problem | Fix sessions first: shorter default, a better cue time, fewer taps. Add no modules. |
| H2 fails for a feature | The score cannot be trusted for this learner | Keep that feature in "compare" mode with no verdict. Pilot another scorer for it (6, V3). Build nothing that depends on it. |
| H3 holds, H4 fails | Hearing improved but speaking did not | Give speaking a larger share of each session. Add articulation aids such as a lip video. Review the wording of feedback. |
| H3 and H4 hold, H5 fails | Sounds improved but free speech did not | Add E10, sentence stress and phrasing (Brief §3.3: prosody training transferred to free speech [Moderate]) |
| A target reaches "Learned" (see 3f) | It is done for now | Graduate it to light review. Pull the next target from the priority model. |
| H1, H2 and H4 hold | The English core works | Add E8, French clarity, unless it already shipped (decision D6) |
| The stress analyzer passes validation V4 | Stress verdicts can be trusted | Turn on stress verdicts (E9) |

---

## 3. Product design

### 3a. Modules in priority order

**English (second-language track, the main goal)**

| # | Module | What the learner does | Evidence | In MVP? |
|---|---|---|---|---|
| EN1 | **Word stress, listening first** | Tap the strong syllable of a word. Match its shape (●○ versus ○●). Hear 3 or 4 noun/verb pairs such as REcord/reCORD in different voices, then tap the sequence heard. This last task adds memory load, which is where French listeners struggle. Every word's stress pattern is stored and shown as dots. | Addendum §2 rank 1 [Moderate as a priority; Weak for training]. "Stress deafness" in French listeners, Brief §3.3 [Moderate]. Hard, many-voice tasks are needed, and knowing a word's stress pattern helps (Addendum §2 notes [Moderate]). A game without rules worked as well as explicit rules (Schwab et al. 2022 [Weak]). | Yes |
| EN1b | **Word stress, speaking** | Say the word, then compare "syllable bars" (length, loudness and pitch per syllable) for you and the model. There is no verdict until the analyzer passes validation. | Azure has no word-stress error type (Brief §3.7 [Strong]). Automatic stress detection is hard (Korzekwa: 49% recall, Addendum §4.2 [Unverified]). | Compare mode only. Verdicts come in E9. |
| EN2 | **Vowel pairs**: /iː–ɪ/ in Block A; /uː–ʊ/ and /æ–ʌ–ɑː/ in Block B | Listening trials (pick which of 2 or 3 words you heard), then say the words. Feedback names the vowel that was heard: "sounded like *ship*". | Addendum §2 rank 2 [Moderate]. HVPT improved English vowels for French speakers (Iverson et al. 2012). Brief §3.1 [Strong for listening; Moderate for carry-over to speaking]. | Yes |
| EN3 | **/h/** | Listening trials (heat/eat), plus "Is this a real word?" (husband versus "usband"). Then say the words. Dropped /h/ and added /h/ are tracked separately. | Addendum §2 rank 3 [Moderate; one study, gains held at 4 months] | Yes (Block A) |
| EN4 | **Fluency in free speech: Retell ×3** | Read a story card, retell it in 60 s, then 50 s, then 40 s, with a short note between rounds. A new card each session. | Brief §3.4 and §2 row 8 [Moderate] (Suzuki 2021; de Jong & Perfetti 2011; 4/3/2 activity). Addendum §2 rank 4 [Moderate]. | Yes |
| EN5 | Sentence stress and phrasing ("No, I rented a FLAT") | Question-and-answer and correction dialogues | Brief §5.1 #2 and §7 cap. 7 [Moderate] | Later (E10) |
| EN6 | Weak forms (listening only), /θ ð/, final consonant clusters | Only if Progress Checks show they cost intelligibility | Addendum §2 ranks 5–7 [Mixed / Unverified / Not searched] | Later |

**French (native clarity track, the second goal)**

| # | Module | What the learner does | Evidence | In MVP? |
|---|---|---|---|---|
| FR1 | **Clear-speech pairs** | Say a sentence in your usual style, then "over-enunciate" it with concrete cues and a named listener. The app shows which features changed and which did not. | Addendum §3.3 #1–2 and §3.2 [Moderate]. "Over-enunciate" gave the largest gain (Lam & Tjaden). | Add-on E8 (decision D6) |
| FR2 | **Clear at normal speed** | Keep the clarity gains while bringing the speed back to your usual rate | Addendum §3.3 #3 [Weak] | E8 |
| FR3 | French retell | 60–90 s retell, measuring how much clarity drops from start to finish | Addendum §3.3 #5 [Weak] | E8 |
| FR4 | Listener simulation | An ASR "partner" listens to your speech mixed with background noise and sometimes mishears | Brief §7 cap. 10; Addendum §3.3 #4 [Moderate for the immediate effect; untested for lasting change]. Needs calibration first. | Later (E11) |
| FR5 | French vowel probes (vowel resonances, called formants) | "Le mot __ me plaît" | Addendum §3.3 #6 [Mixed]. Phone reliability unknown. | Later, experimental |

**Cross-cutting parts:** onboarding diagnostic, spaced scheduler, weekly goal, and Progress Check.

### 3b. Session design

**Building blocks**
- **Listen block.** HVPT trials of about 4–5 s each, using 4 training voices. Feedback is instant.
- **Say block.** Word items of about 15–20 s each, including feedback.
- **Retell block.** One story card, three rounds.
- **French block** (after E8).

**Rules the session engine enforces**
- **Listening before speaking on the same target.** Keep them in separate blocks while listening accuracy for that contrast is below 80%. Speaking during listening training disrupted learning of new contrasts (Brief §3.1, Baese-Berk & Samuel [Weak]). The 80% cut-off is a heuristic from Brief §7 cap. 4.
- **Blocked, then mixed.** A new contrast is practised on its own. It joins mixed practice after 2 sessions at or above 80% (Brief §3.5 [Mixed]).
- **At most 3 repeats of an item in a row** (Brief §7 cap. 6).
- **One open microphone per session.** The mic is not reopened for each take (Addendum §5.2).
- **Pause and resume.** A phone call or app switch pauses the session. The take in progress is discarded, and the rest of the session is kept.

**A typical day: Tuesday of practice week 2 (Block A)**

The engine has picked today's due targets. /iː–ɪ/ is in training and still blocked, at 72% listening accuracy. Word stress runs as a thread through every session. /h/ is due for its 3-day review.

*10-minute Standard session (the default)*

| Time | What happens | Why |
|---|---|---|
| 0:00–0:20 | Tap **Start · 10 min**. The mic opens once, and the first 0.5 s measures room noise without the user noticing. | Quality check without friction |
| 0:20–2:20 | **Listen /iː–ɪ/**: about 28 "ship or sheep?" trials across 4 voices. Right or wrong shows at once, with "hear both". | HVPT [Strong] |
| 2:20–3:30 | **Listen, stress**: 6 tap-the-strong-syllable trials and 2 sequence-recall trials | Stress first, with memory load (Addendum §2) |
| 3:30–5:00 | **Say /iː–ɪ/**: 6 words, 4 practised and 2 new. Each follows record → result card → retry on your own if wrong → model → a new word with the same sound. | Corrective feedback plus a retry [Moderate] |
| 5:00–6:20 | **Say, stress**: 4 words with syllable bars comparing you and the model | Compare mode until validated |
| 6:20–9:40 | **Retell ×3**: read a card of French bullet facts plus 3 English target words (20 s). Round 1 lasts 60 s, then a note (10 s), round 2 lasts 50 s, then a note, round 3 lasts 40 s. The summary covers rate, pauses and which target words you used. | Task repetition [Moderate]. Targets used in meaningful speech [Weak to Moderate] |
| 9:40–10:00 | **Summary**: "3 of 5 sessions this week", plus a preview of the next focus. The mic closes. | Weekly goal, no streak |

*5-minute Quick session* (counts toward the weekly goal)

| Time | What happens |
|---|---|
| 0:00–0:15 | Start. The mic opens. |
| 0:15–2:30 | Listen block on the single most-due target (about 30 trials) |
| 2:30–4:40 | Say block on the same target (6 items) |
| 4:40–5:00 | Summary |

Quick sessions skip the retell. The weekly plan suggests at least 3 Standard or Full sessions, so the retell happens at least 3 times a week.

*15-minute Full session*

| Time | What happens |
|---|---|
| 0:00–10:00 | The Standard session above |
| 10:00–13:30 | **French clarity block** (after E8): 1 clear-speech warm-up trial (Addendum §3.3 #7 [Weak]). Then 3 sentence pairs, each said in your usual style and then clearly, with a cue card: « Ouvre la mâchoire. Finis chaque consonne finale. Ta collègue t'écoute au téléphone dans un café bruyant. » Then 1 sentence said clearly at your usual speed. |
| 13:30–14:40 | **Mixed review**: listening trials that mix graduated and review targets, plus 2 say items |
| 14:40–15:00 | Summary |

Until E8 ships, the 10:00–13:30 slot holds a second stress set and extra review.

*3-minute Comeback session* (offered after 4 or more days away): easy listening on the best-known contrast in training, then 3 say items. It aims for early success, because past success is the strongest source of self-belief (Brief §3.6 [Moderate]). The review queue is re-spread over the next sessions instead of piling up.

**The multi-week program: an 8-week cycle**

| Practice week | Content |
|---|---|
| Week 0 | **Day 1 onboarding (about 8 min):** profile, goal, if-then plan, mic setup, listening screener (6 contrast sets × 10 trials, 2 voices). **Day 2 baseline, sitting 1** (English speaking, about 9 min). **Day 3 baseline, sitting 2** (listening probe, French recordings, second take of the anchor sentences). |
| Weeks 1–4, **Block A** | Word stress (thread), /iː–ɪ/, /h/. The Block B contrasts stay untrained as controls. |
| End of week 4 | **Progress Check 1** (2 sittings; it replaces 2 sessions that week) |
| Weeks 5–8, **Block B** | Word stress (thread), /uː–ʊ/, /æ–ʌ–ɑː/. Block A moves to spaced review only (1–2 min per session). |
| End of week 8 | **Progress Check 2**, plus the delayed probe for Block A |
| Week 9 onward | Cycle 2 is planned from the results and the gates in 2.4 |

**Dose, stated honestly.** Stress gets about 3 minutes a session. At 5 sessions a week that is about 2 hours by week 8. The addendum suggests about 4 hours for stress (§5.3), so stress continues into cycle 2. Each vowel pair gets roughly 20 sessions in its block, above the "about 8 sessions" design guess in Addendum §2. Programs of 5–8 weeks showed larger effects than 1–4 weeks (Addendum §4.1 [Weak; subgroup]), and good studies ran 10–16 weeks (Brief §3.5 [Moderate]).

**Spacing.** Each item follows a fixed ladder: next day, +3 days, +7 days, +14 days, +28 days. A correct first attempt moves the item up the ladder. An error resets it to 1 day. The ladder is not adaptive (Addendum §5.8 [Moderate in general]; equal and growing gaps worked equally well, Brief §3.5). At most 20 review items come due per session. After a break, overdue items are spread over the following sessions, so there is no "backlog wall" (Brief §7 cap. 6).

### 3c. Screens and flows on a phone

1. **Install and welcome.** Explains why to add the app to the home screen: fewer mic prompts and safer storage. Shows the "Add to Home Screen" steps for iOS and Android, and asks the browser to keep storage permanently.
2. **Pair this phone.** Paste or scan (QR code) the device secret. Shows "Connection OK" once a test token arrives.
3. **About you.** French variety (France, Québec, other). English target: international listeners (the default), with en-US as the *reference model*, explained as "the model Azure scores against, not a goal accent". Goal sentence ("I want to be understood when…"), weekly target (4–6 sessions), if-then plan with a time, and an "Add to calendar" reminder.
4. **Mic setup.** Permission, live level meter, noise meter, a test phrase. Tips: quiet room, phone 15–20 cm away, avoid Bluetooth headsets.
5. **Home (Today).** Weekly ring ("3 of 5"), buttons for Quick 5, Standard 10 and Full 15, today's focus chips ("Stress · ship/sheep"), and banners for "Progress Check due" and "Welcome back".
6. **Listen trial.** A large Play button, 2–3 answer buttons (words or ●○ shapes), right/wrong with the correct answer, "Hear both", progress dots, Pause.
7. **Say trial.** The word with stress dots and a mouth-tip icon. A record button with a live level ring and auto-stop. The result card has one line, then "Try again", "Hear model" (shown after your own retry) and a small "That was right" link. Stress items show syllable bars.
8. **Retell.** Story card (French bullets plus 3 English target words), countdown ring (60/50/40 s), round indicator, a note between rounds, and a final summary.
9. **French clarity** (E8). The sentence, a cue card, "Usual" and "Clear" takes, and bars for each feature compared with your own noise band.
10. **Session summary.** What you did, the week ring and the next focus. No score.
11. **Progress.** Only Progress Check results: a status chip for each target, a range bar for each estimate, fluency trends with noise bands, held-out listening trends, and a before/after audio player. A separate "Practice log" link is labelled "practice numbers, inflated by repetition".
12. **Progress Check.** An intro (why it exists, 2 sittings, same room and phone position), then each part with its timer, then completion.
13. **Target detail.** Why this sound matters for you, the mouth tip, listening accuracy and speaking error rate with ranges, and the token count ("needs about 6 more attempts before a verdict").
14. **Settings and data.** Export and import, storage status (permanent or at risk), mic options (noise suppression on or off), reminder, device secret, content version, and delete everything.
15. **Listener pack.** Build and share a zip of clips, and import the ratings file.
16. **Developer: content review and labelling.** Used by the native checker for content review and by validation steps V3–V5.

**Routing note:** the URL does not change during a session. A WebKit bug reports that iOS asks for mic permission again when the URL fragment changes in home-screen apps (bug 215884; current status unverified).

### 3d. Feedback design

| Attempt | What the user sees | Why |
|---|---|---|
| **Listening trial** | Instant right or wrong, the correct word highlighted, and "hear both" | This is standard HVPT: identification with word labels and instant feedback (Brief §3.1, Carlet & Cebrian [Moderate]) |
| **Say trial, before scoring** | A quality check runs on the phone first: "Too quiet, move closer", "Noisy room", "Didn't catch that". No score, and the take is not sent to Azure. | Azure's quality drops with noise, distance and low volume (Addendum §4.2 [Strong]) |
| **Say trial, self-estimate** (1 trial in 4) | "How did that sound? Right / Wrong / Not sure", before the result | Estimating one's own error helped learning in lab motor tasks (Brief §3.2 [Weak]). Asking on every trial can backfire (Brief §3.6 [Weak]). |
| **Say trial, result** (within about 2–3 s) | **One line about the target sound only**, in cautious words. For example: "Probably heard as /ɪ/ (*ship*), not /iː/ (*sheep*)." Or: "/h/ probably missing in *hold*." Or: "Clear /iː/." There is no 0–100 number and no colouring of every word. Azure's score sits in a details drawer, labelled "closeness to a US model". | At most 1–2 corrections per attempt, and only for errors the system detects with confidence (Brief §2 row 5 [Weak for the limit]). Scores are uncertain, hence "probably" (Brief §7 cap. 5). Colour-coded scores alone do not count as corrective feedback (Brief §1). |
| **After an error** | Step 1: a prompt to fix it yourself, plus a one-sentence mouth cue with a small picture, such as "Longer, tenser vowel, lips spread a little". Step 2: if still wrong, the model plays, then you retry. Step 3: a new word with the same sound. | Prompt first, then the model (Brief §7 cap. 5 [Mixed]). Varied words may help carry-over (Brief §3.2 [Weak]). How-to tips are kept short because evidence on explanations is mixed. |
| **"That was right"** | The dispute is logged, and the token is left out of the weakness estimate | Scorers compare you with one dictionary pronunciation (Brief §3.7 [Weak]). A high dispute rate flags a verdict that cannot be trusted. |
| **Stress item** (before E9) | Syllable bars for you and the model: length, loudness and pitch peak per syllable, with the target syllable marked. No verdict. | Gives visible information about the cues without claiming accuracy that has not been validated |
| **Retell, between rounds** | One note: "Fewer pauses inside phrases this round", or "Try to pause after a full idea". If round 2 or 3 repeats more than 70% of the previous round word for word: "Try new words this time". After round 3: target words used, and at most one target-word note, shown only when Azure is confident. | Short corrections between repetitions (Tran & Saito [Moderate]). Watch for word-for-word recycling (Suzuki & Hanzawa [Moderate]). Free-speech scoring agrees less with humans (Brief §3.7 [Moderate]). |
| **Session end** | What you practised, sessions this week, next focus. Never a daily score chart. | Practice performance is not learning (Brief §3.5 [Moderate]) |

**Data rule:** only first attempts count toward error estimates. An attempt made right after hearing the model is imitation, so it is stored but excluded. A correct retry done without the model is logged as a "self-correction", which is stronger evidence of learning (Brief §3.2).

### 3e. Content plan

**English sets for the MVP**

| Set | Practice items | Held-out items (never practised) | Notes |
|---|---|---|---|
| Stress, single words | 120 words of 2–4 syllables. Patterns ●○, ○●, ●○○, ○●○, ●○○○, ○●○○, ○○●○. Includes stress-shift families (PHOtograph / phoTOgraphy / photoGRAPHic) and French–English look-alikes whose stress differs (CHOColate, deVELop, eCONomy). | 30: 15 core words used at every check, plus 15 that rotate | Common words only |
| Stress, noun/verb pairs | 20 pairs (REcord/reCORD, PREsent/preSENT, OBject/obJECT, PERmit/perMIT, CONduct/conDUCT, INcrease/inCREASE, PROgress/proGRESS, and so on) | 5 pairs | Used for sequence recall |
| /iː–ɪ/ | 40 minimal pairs, plus 20 words inside short phrases | 12 pairs | |
| /uː–ʊ/ | 12 minimal pairs (pool/pull, fool/full, Luke/look, suit/soot, who'd/hood, stewed/stood, wooed/wood, cooed/could, shoed/should), plus 20 single words | 4 pairs and 6 words | English has few minimal pairs here |
| /æ–ʌ–ɑː/ | 25 sets (cat/cut/cart, hat/hut/heart, cap/cup/carp, match/much/march, ban/bun/barn, and so on) | 8 sets | Scored against en-US |
| /h/ | 40 pairs (heat/eat, hair/air, hold/old, hand/and, hill/ill, and so on), plus 20 made-up "words" such as "usband" for real-word decisions | 10 pairs and 5 made-up words | Scoring does not reward adding /h/ (Addendum §6) |
| Retell story cards | 48 cards: French bullet facts plus 3 English target words, built to draw out the current block's targets | 8 cards and 6 opinion prompts kept for Progress Checks | French bullets carry a known message without priming English pronunciation |
| Semantically unpredictable sentences (SUS) | none | 4 sets × 8 sentences | Sentences whose words cannot be guessed from context, used as a rough intelligibility test |
| Anchor sentences | none | 10 fixed sentences covering all targets | Measure repeatability and model drift |
| Mouth-tip cards | 6 cards, one per target | none | One sentence each plus a simple drawing |

**French add-on content (E8):** 60 sentences dense in high-load French contrasts (nasal vowels, le/les, final consonants such as petit/petite, /y–u/; Brief §5.2), 16 retell cards, and 10 check sentences plus 4 cards held out. Record the French baseline at week 0 even if E8 comes later, so French training has a before-measure.

**How the content is produced**
- **Word lists.** Draft them with an LLM, then check every word against the *CMU Pronouncing Dictionary* (CMUdict), a free English pronunciation dictionary whose stress digits give each word's ●○ pattern. Filter by word frequency. For French, use Lexique 3.83 for syllables and frequency (Brief §5.2). The developer finalises the lists by hand.
- **Voices.** Use 4 training voices (Azure en-US neural voices, 2 female and 2 male) and 2 test-only voices (1 en-US; 1 en-GB used only for stress, /iː–ɪ/ and /h/, because /æ–ʌ–ɑː/ differ between varieties). This follows the 4–6 voice default, with some voices kept for tests only (Brief §3.1 [Mixed on voice count]).
- **Natural test recordings.** 2 native speakers record about 120 test items each using the app's recorder mode (about 20 minutes each). A fallback is openly licensed recordings from Wikimedia Commons or Lingua Libre (availability and licence per item unverified).
- **Rendering.** A Node script in `content/` renders all clips at build time, with the Azure key on the developer's machine only. It uses *SSML* (Speech Synthesis Markup Language, markup that controls how TTS says a word) with IPA stress marks, which forces the correct noun or verb stress. Stress marks are a documented feature of Azure SSML (Appendix B). Clips are trimmed, loudness-normalised and saved as MP3 or AAC at about 48 kbps. Total: about 500 items × 6 voices, roughly 3,000 clips of about 20–30 MB, and about 30,000 characters, far inside Azure's free TTS allowance.

**How the content is validated.** Every item must pass all six steps. An item that fails is re-rendered with another voice or dropped.
1. **Word check.** Every word is in CMUdict. Each minimal pair differs by exactly the target sound. The stress pattern comes from CMUdict.
2. **Audio check.** Duration, peak level and leading/trailing silence.
3. **Round trip.** Score each clip with Azure en-US pronunciation assessment against its own text. The target sound must reach an accuracy of 90 or more, and Azure's top "spoken phoneme" must be the target. For stress clips, the app's own stress analyzer must find the dictionary syllable, which is also a first test of the analyzer on clean speech. This checks that the voice really produces the contrast (Brief §3.1).
4. **Human check.** A native English listener reviews every stress-pair clip and a random 15% of the rest in the content-review screen.
5. **Held-out integrity.** Held-out lists are frozen and hashed before training starts. A unit test fails if any held-out item appears in a practice set.
6. **Versioning.** Each content version has a manifest, and every attempt records which content version it used.

### 3f. Progress measurement

**Progress Check design.** Two sittings on consecutive days, about 17 minutes in total. Same room, same phone position, and noise-suppression setting fixed.

| Part | Sitting | Time | Task | Measures |
|---|---|---|---|---|
| 1. Setup | 1 | 0:30 | Stay quiet for the noise check | Noise floor (stored as a condition) |
| 2. Anchors | 1 | 1:30 | 10 fixed sentences, the same every check | Repeatability and model-drift control |
| 3. Held-out words | 1 | 2:00 | 30 words in "Now I say ___ again." (15 core, 15 rotating) | Error rate per target, with a likely range |
| 4. SUS | 1 | 1:30 | 8 new unpredictable sentences | ASR word accuracy (lenient intelligibility estimate, a design inference, Brief §7 cap. 1) |
| 5. Free speech | 1 | 2:30 | 1 unseen story-card retell (60 s) and 1 opinion (60 s) | Fluency measures. Azure prosody (en-US add-on) is logged but not shown. Clips go to the listener pack. |
| 6. Listening probe | 2 | 4:00 | 60 trials in test-only voices and natural recordings, covering all targets | Accuracy per contrast. A synthetic–natural gap above 10 points is flagged. |
| 7. French | 2 | 3:30 | 6 sentences in usual and then clear style, plus a 60-s French retell | Own-baseline clarity measures (analysed once E8 exists) |
| 8. Anchor retake | 2 | 1:00 | The same 10 anchors again, only at baseline and every second check | Test–retest noise, which feeds the reliable change index |
| 9. Self-rating | 2 | 0:20 | "How easy were you to understand this month?" (1–9) | Logged, never trusted: self-ratings are biased (Brief §3.6 [Moderate]) |

**Delayed probes.** Any target whose training block ended at least 3 weeks earlier gets its held-out and listening items analysed as a delayed probe. Block A reaches this at week 8.

**Listener pack (optional).** The app exports 20–30-s excerpts of baseline and current free speech, the SUS recordings and 2 fixed reference clips. File names are random and old and new clips are mixed. A ratings sheet (CSV) asks for "Ease of understanding, 1–9" and "Write what you heard" for the SUS. The answer key stays in the app. The user sends the pack to 3–5 listeners and imports the filled sheets. This follows "old and new together, blind and shuffled, with fixed reference clips" (Brief §3.7 and §7 cap. 1 [Moderate]).

**Target priority model** (Brief §7 cap. 3 [Moderate for English])
- `priority = prior weight × estimated error rate × word-frequency weight`.
- **Prior weights** come from the addendum ranking and are stored as data labelled "provisional": stress 1.0, /iː–ɪ/ 0.8, /h/ 0.7, /uː–ʊ/ 0.7, /æ–ʌ–ɑː/ 0.7, /θ ð/ 0.2.
- **Error rate** uses a *beta-binomial* estimate: it counts right and wrong verdicts, starts from a weak prior equal to about 5 tokens from the screener and baseline, and gives a mean and an 80% likely range. With few tokens the estimate is pulled toward the average and the range stays wide.
- Listening and speaking get separate estimates for each target.
- **In the MVP** the block order is fixed. The model only decides extra review, graduation and the plan for cycle 2.

**Target states**
- *Candidate*: flagged by the screener or baseline, which only suggests candidates (Brief §7 cap. 2).
- *Confirmed weak*: at least 15 tokens, from at least 5 different words, over at least 3 sessions, and the lower end of the 80% range is above 0.30 (Brief §2 row 10 [Weak heuristic]).
- *In training.*
- *Holding*: at a Progress Check the upper end of the held-out range is below 0.20, and listening on held-out voices is at least 85%.
- *Learned*: still Holding at a delayed probe at least 3 weeks after training.
- *Slipping*: back to review.

**Handling noisy scores**
1. Scores become right/wrong verdicts. A verdict is "right" when the target sound's accuracy clears a per-target threshold *and* Azure's top spoken phoneme matches the target. Thresholds are calibrated on the round-trip clips and on validation step V3.
2. Takes that fail the quality check are excluded. Disputed tokens are excluded and counted. A dispute rate above 20% marks that target's verdicts as suspect.
3. Every result stores the provider, the date, a *model epoch* (a number that goes up when drift is detected), device, browser, audio settings and noise level.
4. **Drift control.** At every check the app re-scores the baseline anchors. If they shift by more than the noise band, a new model epoch starts, and all comparisons use baseline audio re-scored with the current model.
5. Charts come only from Progress Checks and always show ranges and noise bands. Single takes are never shown as progress (Addendum §5.11 [Strong]).
6. Fluency trends use NAP (*non-overlap of all pairs*: the share of before–after pairs where the later value is better) together with the reliable change index. The app does not use Tau-U, because it has no confidence interval (Brief §3.7 [Moderate]).

### 3g. Habit and motivation

- **Goal tied to real use.** Onboarding asks for a concrete goal ("be understood in my Thursday meeting"), a weekly target of 4–6 sessions, and an **if-then plan** such as "After I park at work, I do one 10-minute session". If-then plans help modestly: about d = .15 after bias correction (Brief §3.6 [Moderate; outside language learning]).
- **Weekly ring, never a streak.** A missed day changes nothing. Missing one day did not harm habit formation (Brief §2 row 11; Lally 2010 [Weak]).
- **Reminder** as a calendar event (an `.ics` file) at the chosen time. This needs no backend. Web Push works on iOS 16.4 and later for home-screen apps, but it needs server state, so it comes later (Appendix B).
- **Comeback session** and a cap on the review queue after a break (Addendum §5.7).
- **Before/after player** after each Progress Check, with plain statements such as "Your /h/ now holds on new words", and only for changes that pass the real-change rule (Brief §7 cap. 11).
- **One line of "why"** on each module, such as "Hearing the difference first makes saying it easier". Explaining *why* made learners accept harder, mixed practice (Abel & de Bruin, Brief §3.6 [Weak]).
- **The Wake Lock API** keeps the screen on during a session. It works in iOS home-screen apps from iOS 18.4 (Appendix B).
- **Not included:** points, badges, leaderboards and streaks (Brief §3.6: no evidence that streaks help learning).

### 3h. What is deliberately left out, and why

| Left out | Why |
|---|---|
| Tongue-twister speed ladders, tempo tiers, "articulation index" | No evidence, and they reward speed (Brief §4; Addendum §6 [None found]) |
| Shadowing | Weak evidence; only 1 of 44 studies had a delayed test (Brief §3.4). Possible later experiment. |
| LLM voice-conversation partner | Weak evidence for pronunciation; adds cost and complexity (Brief §3.4). Later, if gate H5 fails. |
| Audio LLM as a judge | Poor agreement with human raters (Brief §3.7 [Weak]) |
| /θ ð/, final clusters, producing weak forms | Low priority for this learner and an international target (Addendum §2 ranks 5–7) |
| Sentence stress and pitch-line displays | Moderate or weak evidence and more analysis work. They form the first module after the MVP if gates call for it (E10). |
| Vowel charts from formants, rhythm scores (%V, nPVI), filler counts | Unreliable on phones or not linked to clarity (Brief §4; Addendum §3.4) |
| Azure fr-FR pronunciation scoring for native French | A native speaker scores near the top, and fr-FR returns no phoneme names (Brief §3.7, §5.3) |
| Accounts, cloud sync, server database | One user, privacy, cost. Export files replace them. |
| On-device Whisper speech recognition | A 75–142 MiB download (Addendum §4.2); ASR hides errors, and nothing in the MVP needs it |
| Forced-alignment server (MFA) | Needs a Python server. Azure gives English syllable timing. Later, for French timing work. |
| Web Push, a native app | Need backend state or app stores. A Capacitor wrapper is the escape route if PWA limits bite (4a). |
| A human-rater web page | The exported listener pack covers the MVP |

---

## 4. Technical architecture

```
Phone: installed PWA                                    Cloud
+--------------------------------+   HTTPS   +---------------------------+
| UI (React) + session engine    |---------->| Cloudflare Worker         |--issueToken--> Azure STS
| Scheduler, target model        |<----------|  /api/v1/speech-token     |   (key stays here)
| AudioWorklet -> 16 kHz PCM     |   token   |  static app files         |
| DSP Web Worker (VAD, pitch...) |           +---------------------------+
| Scorer: Azure SDK | Fake       |--- WebSocket + 10-min token ---> Azure Speech (en-US pronunciation assessment)
| IndexedDB: scores, audio, plan |
| Export/import ZIP              |
+--------------------------------+
```

### 4a. Client platform

| Option | Good | Bad |
|---|---|---|
| **A. PWA (recommended)**. A *progressive web app* is a website that installs to the home screen and works offline. | One codebase for iOS and Android, no app store, instant updates, runs offline, reuses the React and TypeScript skills from v1 | iOS limits: no background recording, reported repeat mic prompts, storage-eviction risk if not installed, push only on iOS 16.4 and later |
| B. Capacitor hybrid (the same web app inside a native shell) | Native mic permissions, native audio session, local notifications, store distribution | App-store setup, native build tooling, slower loop |
| C. Native (Swift and/or Kotlin) | The best audio control | Two codebases; too big for a solo MVP |

**Recommendation: A**, with React, Vite, TypeScript and a service worker built with `vite-plugin-pwa`. Keep the code free of browser globals behind small interfaces (AudioSource, Store, Scorer), so moving to option B later means swapping adapters rather than rewriting. Move to B only if the week-2 device spike (E1) shows mic or storage failures that the workarounds cannot fix.

### 4b. Audio capture pipeline on iOS and Android

1. **HTTPS only.** Phones give the microphone only to secure pages (Addendum §4.2 [Strong]).
2. **Start session (a user tap).** Create one `AudioContext` and call `getUserMedia({audio:{channelCount:1, echoCancellation, noiseSuppression, autoGainControl}})`. The three processing flags are a setting, off by default. Whether turning them off helps or hurts is unknown [None found]. Whether iOS honours them is unverified. Validation step V2 decides.
3. **Capture with AudioWorklet.** An *AudioWorklet* is a small browser audio processor that runs while audio arrives. It is supported from Safari 14.1 (Appendix B). It forwards Float32 frames, batched to about 100 ms, to the main thread.
4. **Resample to 16 kHz mono 16-bit PCM** (*PCM* is raw, uncompressed samples). Use a low-pass filter followed by decimation (dropping samples). iOS usually runs at 48 kHz, but the code handles any input rate.
5. **Live signals.** Level meter, clipping flag, and *VAD* (voice activity detection: an energy threshold that adapts to the measured noise floor, with a short hold-over). Auto-stop comes 1.2 s after speech ends. Maximum take length is 8 s for words and 60 s for a retell round.
6. **Stream while recording.** Chunks go into the Azure SDK's push stream during recording, which cuts waiting time (Addendum §4.2). A local copy becomes a WAV file, reusing v1's encoder idea.
7. **Quality check before scoring.** Clipping above 0.1% of samples, speech quieter than −35 dBFS (decibels below digital full scale), signal-to-noise below about 15 dB, or speech shorter than 250 ms each trigger a retake prompt. These thresholds are heuristics, tuned in V2.
8. **Interruptions.** If the page is hidden, the app aborts and discards the take. If iOS reports an "interrupted" audio state (a call or Siri), the app shows "Tap to resume". There is no background practice (Addendum §4.2 [Moderate]).
9. **Metadata** stored with each take: device and browser, `AudioContext.sampleRate`, the mic track's actual settings (`track.getSettings()`), peak level and noise level.
10. **End session.** Stop the tracks, close the AudioContext (v1 leaked AudioContexts) and release the Wake Lock.
11. **Fallback** only if AudioWorklet is missing: MediaRecorder. It checks `isTypeSupported` for `audio/mp4` first (iOS), then `audio/webm;codecs=opus`, decodes the result and resamples it. These takes are marked "lossy" and excluded from the phone's own acoustic measures (Brief §3.7: compression distorts them).
12. **Headsets.** The app warns against Bluetooth headsets, whose call mode lowers audio quality (unverified per device). The phone's own mic or a wired headset is preferred.

### 4c. Scoring and analysis: which tool computes what, and where

| Feature | Language | Computed by | Where | Fallback and notes |
|---|---|---|---|---|
| Listening trials | EN | App logic | Phone | Works offline |
| Vowel and /h/ verdicts | EN | Azure pronunciation assessment, en-US, scripted (reference text given). Settings: phoneme granularity, IPA symbols, `NBestPhonemeCount=5` (returns the sounds most likely said), miscue detection on. | Azure, called from the browser SDK with a token | If offline, the take is saved and scored later. If the SDK fails on iOS, the Worker proxies audio to the Azure REST API instead (option D2-B). |
| Added /h/ and grey-zone vowels | EN | *Dual reference*: score the same audio against both words of the pair ("eat" and "heat") and compare | Azure | Experimental design idea (unverified), checked in V3 |
| Stress syllable bars | EN | Azure en-US syllable start and length, plus the phone's own pitch (YIN algorithm), loudness and duration for each syllable | Phone plus Azure | If Azure returns no syllables, a phone-only detector of syllable peaks (experimental) |
| Stress verdict (E9) | EN | The same cues plus a rule: the strongest syllable wins on at least 2 of 3 cues, and its neighbours are reduced | Phone | Turned on only after V4 passes. A pilot of SpeechSuper, which advertises English "syllable stress analysis", is the backup (claims unverified). |
| Retell fluency | EN | Azure continuous recognition with unscripted assessment, which gives word timings and a logged fluency score. CMUdict syllable counts. Phone VAD for pauses. | Azure plus phone | If offline: pauses from VAD and an approximate rate from syllable peaks |
| Mid-clause pauses | EN | Pauses of 250 ms or more, labelled "mid-clause" unless next to punctuation in Azure's transcript (a proxy for clause boundaries) | Phone | Validated in V5. If it fails, only total pauses are shown. |
| Target-word check in retell | EN | Word-level results from the unscripted assessment, shown only when confident | Azure | Experimental |
| SUS intelligibility estimate | EN | Plain Azure speech-to-text, word accuracy against the script | Azure | Labelled "lenient" (ASR hides errors) |
| Prosody score | EN | Azure prosody (a paid add-on), Progress Check only, logged and not shown | Azure | Used for validation research only |
| Anchors and drift | EN | Azure scoring of anchors, plus re-scoring of baseline audio | Azure | |
| French clarity (E8) | FR | Phone-only signal processing: pitch range (10th–90th percentile, in *semitones*, a pitch unit that treats high and low voices alike), articulation rate (known syllables ÷ speaking time), pause count and ratio, energy in the 1–3 kHz band relative to total, duration | Phone | No cloud needed. Later: Azure fr-FR speech-to-text on audio mixed with babble noise (E11), and the Montreal Forced Aligner for vowel durations. |

**Checked facts behind this table (Appendix B):**
- The JavaScript SDK supports pronunciation assessment, and a browser sample exists.
- Prosody and syllable output are en-US only.
- Single-shot assessment is limited to 30 s. Longer audio needs continuous mode, which does not detect omitted or inserted words, so the app compares the transcript itself.
- The prosody score is a paid add-on. Accuracy, fluency, completeness and miscue are included in the base price.

**A known pitfall from v1:** in the JavaScript SDK, `recognizeOnceAsync` takes callbacks. v1 awaited it as a promise. The adapter wraps it correctly, with an 8-s timeout. **Latency target:** first feedback within about 2–3 s of stopping (Addendum §5.10 [Weak]). The real figure is unmeasured, and the E1 spike measures it.

### 4d. Backend

**Language and platform:** a TypeScript Cloudflare Worker. It has three jobs: serve the static PWA, issue Azure tokens, and answer health checks. It has no database, handles no audio, and has no TTS proxy. This closes v1's open TTS proxy.

```
POST /api/v1/speech-token
  Header: Authorization: Bearer <device secret>
  200 {"token":"…","region":"<azure-region>","expiresAt":"2026-09-24T12:10:00Z"}
  401 wrong secret · 403 wrong origin · 429 over 30 tokens/hour · 502 Azure error

GET /api/v1/health -> {"ok":true,"version":"<git sha>"}
```

- The Worker exchanges `AZURE_SPEECH_KEY` for a token at `https://<region>.api.cognitive.microsoft.com/sts/v1.0/issueToken`. Tokens are valid for 10 minutes (Appendix B). The client keeps a token for 9 minutes and fetches a new one at the start of each session.
- **Worker secrets:** `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`, `DEVICE_SECRET_SHA256`. The secret is compared in constant time, the Origin header is checked, and requests are rate-limited.
- **Region:** pick one near the user, such as a European region. Pronunciation assessment is available in all speech-to-text regions (Appendix B).

### 4e. Data

| Data | Where | Format | How long kept | Backup |
|---|---|---|---|---|
| Content: word lists, manifests, TTS clips, cards | App bundle and service-worker cache (the current block is pre-cached for offline use) | JSON, MP3/AAC | Per content version | Rebuilt from the repo |
| Profile, settings, plan, schedule | IndexedDB through Dexie (IndexedDB is the browser's on-device database; Dexie is a small wrapper for it) | Tables | Forever | Export (JSON) |
| Attempts and verdicts, with provider, model epoch, device and quality data | IndexedDB | Rows | Forever | Export (JSON) |
| Practice audio | IndexedDB (blobs) | WAV, 16 kHz (about 1.9 MB per minute) | 14 days, then deleted; scores are kept | None |
| Baseline, Progress Check and anchor audio | IndexedDB (blobs) | WAV | Forever (about 30 MB per check) | Export (ZIP) |
| Device secret | IndexedDB | String | Until re-paired | Re-pair |
| Azure token | Memory only | String | 9 minutes | None |

- **Persistence.** The app calls `navigator.storage.persist()` at install and shows the result in Settings. Safari deletes script-written data after 7 days without use for sites that are not persistent (Appendix B). Home-screen apps are reported to be exempt (partly verified). The app still nudges a monthly export.
- **Export and import.** A ZIP of JSON plus WAV files, built with the small `fflate` library, saved through the share sheet to Files or iCloud Drive or downloaded. Import restores everything.
- **Privacy.**
  - Audio leaves the phone only as short clips streamed to Azure for scoring, plus listener packs the user builds by hand.
  - There is no analytics and no server-side storage.
  - A Content-Security-Policy header limits network calls to the app's own origin and the Azure speech endpoint. The exact host is confirmed in the E1 spike.
  - Check Azure's data-handling terms for real-time speech-to-text (not checked here; unverified).

### 4f. Hosting, HTTPS, access control, secrets and cost

- **Hosting and HTTPS.** Cloudflare Workers with static assets on a `*.workers.dev` address, which comes with HTTPS. For testing on the phone during development, run `vite --host` behind a Cloudflare quick tunnel to get an HTTPS URL, or use mkcert.
- **Access control (recommended):** a device pairing secret, plus the Azure free tier as a hard cost cap. Alternatives are in Appendix A (D4).
- **Secrets:** Worker secrets in production, a git-ignored `.dev.vars` file locally, and the content-render key in the git-ignored `content/.env`. The key never appears in client code. CI enforces this (4g).

**Usage estimate:** about 4 minutes of scored audio per Standard session (say items, some scored twice, plus a 2.5-min retell). That is about 1.5 hours a month at 5 sessions a week, plus Progress Checks and anchors: about 1.6–1.8 hours of audio a month.

| Path | Items | Monthly cost |
|---|---|---|
| **Free** | Cloudflare Workers Free (about 100,000 requests a day; secondary sources) · workers.dev HTTPS · Azure Speech F0 free tier (5 audio hours of speech-to-text a month and 0.5M TTS characters; secondary sources) | **$0**. Caveats: whether F0 includes the prosody add-on, and its limit on simultaneous requests, are unverified. When 5 hours run out, scoring stops until the next month. |
| **Comfortable** | Azure S0 pay-as-you-go at about $1.00–1.32 per audio hour (secondary sources; the official pricing page was blocked here) × about 2 hours, plus the prosody add-on (price unverified) · optional Workers Paid ($5) · a custom domain (about $1 a month) | **About $3–10** |
| One-off | TTS rendering of about 30,000 characters | Free tier, or under $1 |

### 4g. Testing strategy that fits TDD

Each item below is built Red → Green → Refactor.

- **Pure units** (Vitest):
  - resampler: sine sweeps, checking frequency accuracy and removal of aliasing;
  - WAV encoder: exact header bytes;
  - VAD: synthetic silence, noise and tone bursts;
  - quality check: clipping and level;
  - pitch tracker: synthetic harmonic tones and glides at known pitch, within 1 semitone;
  - syllable prominence: synthetic syllable sequences with set lengths and loudness;
  - fluency metrics: from word-timing fixtures;
  - scheduler: a fake clock;
  - beta-binomial model: property tests (more tokens give a narrower range, and so on);
  - target state machine, feedback decisions, recycling detector.
- **Azure without live calls.** A `Scorer` interface with two implementations, `AzureScorer` and `FakeScorer` (driven by fixtures).
  - A shared *contract test suite* runs against both. The live run is opt-in through an environment variable, run by hand or nightly with a small budget.
  - The **result parser** is a pure function tested on real en-US JSON captured once and redacted, covering scripted, unscripted and continuous results.
  - A "record once, replay forever" developer tool captures Azure responses for about 20 fixture WAVs. Re-running it after a model update shows drift as a snapshot diff.
- **Audio without a mic.** An `AudioSource` interface with a mic source and a file source. Screen tests use Testing Library in jsdom, fed with fixture WAVs.
- **Storage.** Dexie tests on `fake-indexeddb`.
- **Worker.** Vitest with Cloudflare's Workers test pool (`@cloudflare/vitest-pool-workers`) and a mocked `issueToken`. Tests assert that responses never contain the key, and cover 401, 403 and 429.
- **End-to-end.** Playwright on Chromium with a fake mic fed from a WAV file (Chromium flags `--use-fake-device-for-media-stream --use-file-for-fake-audio-capture`, unverified here; confirmed in E0). WebKit cannot fake mic input, so each release gets a short **manual device checklist** on the user's iPhone as a home-screen app and on an Android phone.
- **Security gate in CI** (CLAUDE.md rule 6). After `vite build`, scan `dist/` for the key value (supplied from a CI secret) and for the header name `Ocp-Apim-Subscription-Key`. The build fails on any match.
- **Content tests.** Schema checks, the minimal-pair check, held-out separation, missing audio files, and the round-trip report.
- **Lint** is clean with oxlint and `tsc --noEmit`, with warnings treated as errors. The existing CLAUDE.md pre-commit list stays, and "on-device check for audio changes" is added.

### 4h. What happens to v1 code

1. **Now:** suspend the Render service. It has an open TTS proxy and loses data on every restart. Rotate the Azure key it used.
2. Tag `v1-final` and move the v1 docs to `docs/archive/v1/`. Keep `docs/research/`.
3. The first v2 commit replaces `client/` and `server/` with `web/` (the PWA), `worker/` (Cloudflare) and `content/` (lists and render scripts).
4. **Port:** the WAV encoder idea and its tests, the Vitest and oxlint setup, and the docs and backlog conventions.
5. **Drop:** Express, better-sqlite3, migrations, the TTS proxy, speed ladders and the articulation index, the v1 content packs (mis-tagged, and the nasal-vowel examples are swapped), the Recharts practice-average charts, and `render.yaml`.
6. **Update in the same change:** CLAUDE.md (stack, commands, pre-commit list), `docs/prd.md`, `technical-design.md`, `api-reference.md`, `database-schema.md` (now IndexedDB), a new backlog (E0–E7 replacing F1–F6), and ADR-0001 recording the options the user chose.

---

## 5. Build roadmap

Effort sizes for solo work with AI agents: **S** = 2–3 days, **M** = 4–7 days, **L** = 8–10 days. Build weeks (B) and practice weeks (P) are shown separately. Speaking practice starts only after the baseline is recorded, so the baseline is clean.

| Epic | Goal | Main tasks | Effort | First shippable slice |
|---|---|---|---|---|
| **E0 Reset and skeleton** (B1) | A secure, installable shell | Tag v1; new workspace; PWA shell and manifest; Dexie schema v1; Worker with `/speech-token`, device secret and tests; CI with lint, tests, build and key scan; deploy to workers.dev | S | The app icon is on the user's phone and says "Token OK" |
| **E1 Audio capture and baseline kit** (B1–B2) | Reliable phone recording, and a clean baseline | AudioWorklet, resampler, WAV, VAD, quality check, mic lifecycle, interruptions, Wake Lock. **Device spike:** iOS and Android capture, plus one live Azure SDK push-stream call to measure latency. Baseline flow (Progress Check parts 1–9 as raw recordings, scored later) | M | The user records the week-0 baseline on the phone and can play every take back |
| **E2 Listening trainer** (B2–B3) | HVPT for Block A | Content pipeline v1 (CMUdict, pairs, SSML rendering with 6 voices, audio check, round trip, held-out freeze), listening screener, trial types (2 or 3 choices, tap syllable, shape match, sequence recall, real-word decision), blocked-then-mixed rule, spacing ladder, offline pre-cache | M | **Daily 5-minute offline listening sessions** on stress, /iː–ɪ/ and /h/ (practice week 1 starts) |
| **E3 Say-it with feedback** (B3–B4) | Corrective feedback plus retry | Scorer interface (Fake and Azure), token cache, en-US parser with fixtures, verdict logic (spoken phoneme and dual reference), feedback card with retry → model → new word, dispute, self-estimate, offline queue, stress syllable bars (compare mode) | L | A 7–8-minute listen-and-say session on Block A |
| **E4 Retell ×3** (B5) | Free-speech fluency | 48 story cards, continuous unscripted recognition, fluency metrics, notes between rounds, recycling detector, target-word use | M | **The full 10-minute Standard session** |
| **E5 Program, habit, data safety** (B5–B6) | The app runs the 8-week plan by itself | Block A and B plan, session composer (5/10/15/comeback), weekly ring, if-then plan, `.ics` reminder, queue cap, export and import, storage status | S–M | The user can back up to Files or iCloud. The plan advances without help. |
| **E6 Progress Check and target model** (B6–B7, due by the end of P4) | Measure transfer honestly | Check flow (2 sittings), anchor re-scoring and model epochs, reliable change index, beta-binomial model and target states, Progress screen with ranges, before/after player, listener pack export and import | M–L | **Progress Check 1 runs → the MVP is complete** |
| **E7 Validation sprint** (B3–B8, alongside the others) | Trust only what has been checked | Steps V1–V6 in section 6, developer labelling screen, gates wired to feature flags | M, plus about 2 hours of a native listener's time | Verdicts switch on or off per target based on the evidence |
| *After the MVP* | | | | |
| E8 French clarity lite | FR1–FR3 | 60 sentences, cue cards, phone-only measures, noise bands, clear-at-usual-speed stage | M | The 15-minute session includes French |
| E9 Stress verdicts | Turn on EN1b | Uses the V4 results | S | Stress feedback with verdicts |
| E10 Sentence stress and phrasing | EN5 | Dialogue items, nuclear-stress and pause-placement analysis | M–L | |
| E11 French listener simulation | FR4 | Babble mixing, ASR partner, calibration against a human listener | M | |
| E12 Listener rating page, E13 Web Push, E14 shadowing experiment, E15 Capacitor wrapper | As the gates in 2.4 call for them | | S–M each | |

**Overall:** about 35–48 developer-days. The core the user can practise with (E0–E3) takes about 3–4 weeks. The complete MVP takes about 7–8 weeks, timed so that the Progress Check is ready when practice week 4 ends.

---

## 6. Risks, unknowns and the validation plan

| Risk | Likelihood / impact | Mitigation | Early check |
|---|---|---|---|
| iOS capture problems: AudioWorklet quirks, repeat permission prompts, interruptions | Medium / High | One mic stream per session, no URL changes during sessions, MediaRecorder fallback, Capacitor escape route | E1 spike on the user's own iPhone (B1–B2) |
| The Azure JS SDK push stream fails or is slow in iOS Safari (unverified) | Medium / High | Fallback: the Worker proxies audio to the REST API (under 30 s per request). Retell is split at pauses into pieces under 30 s. | E1 spike: one live call, latency measured |
| Azure verdicts are not trustworthy for this learner | Medium / High | V2 and V3 gates; "compare mode" without verdicts; vendor pilot | B3–B5 |
| Stress cannot be measured reliably | High / Medium | Listening-first design needs no verdict. Compare mode. V4 gate. | B4–B6 |
| Azure model updates look like progress or decline | Certain / Medium | Model epochs and re-scoring of baseline audio | Every check |
| Storage eviction or data loss | Low–Medium / High | Home-screen install, `persist()`, monthly export nudge, storage status shown | Leave the phone unused for 8 days once (B6) |
| Dropout | Medium / High | Weekly goal, if-then plan, 5-minute option, comeback session, gate H1 | Weekly |
| TTS voices mispronounce stress or vowels | Medium / Medium | Round trip, native review, natural test recordings | E2 |
| Free tier runs out or throttles | Low / Low | The app counts seconds sent and warns at 70% of 5 hours; S0 path | Monthly |
| The evidence does not transfer to this learner (much of it is from other first languages or Spanish-word stress studies) | Medium / Medium | The N-of-1 design with multiple baseline and gates **is** the mitigation | Weeks 4 and 8 |
| Scope creep | High / Medium | Only the gates in 2.4 add modules | Each Progress Check |

**Validation plan: check scoring and measures on this learner's voice and phone before trusting them**

All thresholds below are heuristics, set in advance.

- **V1, pipeline (B1–B2).**
  - Record 20 takes on the iPhone as a home-screen app and 20 on Android.
  - Confirm valid 16 kHz WAV files, no clipping, a measured noise level, and no repeat permission prompt within a session.
  - Check the pitch tracker on a held vowel against a tuner app (within 1 semitone).
  - **Gate:** 20 of 20 takes work on the user's phone.
- **V2, test–retest (B3).**
  - Record 10 anchors and 10 target words twice in one session, and again on a second day.
  - Compute how much scores differ, their repeatability (ICC), and the share of verdicts that stay the same.
  - Run it with noise suppression on and off, and with the phone mic and a wired headset.
  - **Choose** the setting with the least variation. **Gate:** at least 80% of verdicts repeat for a target before its verdicts are shown.
- **V3, agreement with a native listener (B4–B5).**
  - Take 60–80 vowel and /h/ tokens from practice.
  - One native English listener (a friend, or a paid online tutor) labels each as "target / other word / unclear" without seeing Azure's result.
  - Compute Cohen's kappa for Azure against the listener, and tune the thresholds for each target, including the dual-reference idea.
  - **Gate:** kappa ≥ .4 to show verdicts. Otherwise use softer wording or compare mode, and consider a SpeechSuper pilot on 40–60 items (Brief §7).
- **V4, stress analyzer (B5–B6).**
  - The learner says 40 stress words twice: once correctly and once deliberately mis-stressed on instruction ("make syllable 2 long and loud").
  - The native listener marks the strongest syllable.
  - **Gate:** the analyzer matches the listener at least 80% of the time on the learner and at least 95% on the TTS models. Only then does E9 ship.
- **V5, fluency measures (B6).**
  - The developer hand-labels pauses in 20 retell clips as mid-clause or boundary, in a developer waveform view or Praat.
  - **Gate:** automatic pause counts correlate r ≥ .8 with the hand labels, and mid-clause labels agree at least 75% of the time. Otherwise show only total pauses and rate.
- **V6, synthetic versus natural voices (weeks 4 and 8).** Compare listening accuracy on test-only TTS voices and on natural recordings. **Flag** a gap above 10 points (Brief §3.1).
- **V7, SUS estimate sanity check (week 4).** Compare ASR word accuracy with the native listener's transcription on 16 SUS. If ASR is far more lenient, keep it labelled lenient or drop it.
- **V8, French measures (with E8).** Record 10 sentences on 2 days to measure the day-to-day spread of each clarity measure. The app shows a "clearer" difference only when it exceeds twice that spread (Addendum §3.4).
- **V9, drift (every check).** Re-score the anchors and bump the model epoch when needed.

**Open unknowns carried forward:**
- the Azure F0 feature set;
- SDK bundle size on phones (unverified; load it only when scoring);
- whether iOS honours the audio-processing flags;
- whether English stress training transfers to free speech for French speakers (Addendum §7 Q3);
- the right dose for 5–15-minute sessions (Addendum §7 Q6).

---

## 7. Evidence map

| Feature | Evidence (section) | Strength | Notes |
|---|---|---|---|
| Understood, not native, as the goal; Azure accuracy secondary | Brief §1, §2 row 1; Addendum §5.1 | Strong | Shapes every metric and label |
| Progress Check separate from practice: held-out items, delayed probes, free speech | Brief §2 row 2, §7 cap. 1 | Strong (principle); Moderate (design) | Core of the MVP's proof |
| HVPT listening trainer | Brief §3.1, §2 row 3; Addendum §2 notes | Strong (listening); Moderate (speaking) | 4 training voices plus 2 test voices and natural recordings |
| Word stress first, listening first, hard tasks | Addendum §2 rank 1, §5.3; Brief §3.3 | Moderate (priority); Weak (training) | Stress patterns stored per word (Tremblay 2008) |
| Vowel pairs /iː–ɪ/, /uː–ʊ/, /æ–ʌ–ɑː/ | Addendum §2 rank 2, §5.5 | Moderate | About 8 sessions per pair is a design guess |
| /h/ with real-word decisions; dropped and added tracked apart | Addendum §2 rank 3, §5.6 | Moderate (one study) | |
| Listening and speaking in separate blocks for new contrasts | Brief §3.1 (Baese-Berk & Samuel) | Weak (lab listeners) | Separate while below 80% |
| Blocked, then mixed | Brief §3.5 | Mixed | Switch rule is a design inference |
| One targeted correction, retry on your own, then model | Brief §3.2, §2 row 5; Addendum §5.4 | Moderate (feedback); Mixed (prompt first); Weak (1–2 limit) | Only first attempts count |
| Self-estimate on some trials | Brief §3.2 (motor learning), §3.6 | Weak | 1 trial in 4 |
| Cautious wording, dispute button, 15–20-token rule | Brief §2 row 10, §3.7 | Strong (noise is real); Weak (thresholds) | |
| Retell ×3 with shrinking time; new prompt next session | Brief §3.4, §2 row 8 | Moderate | Capped at 3 rounds (Suzuki & Hanzawa) |
| Articulation rate and mid-clause pauses as measures | Brief §3.4 (Suzuki & Kormos; Chau & Huensch) | Moderate | Mid-clause labelling validated in V5 |
| No speed ladders; speed never rewarded | Brief §4; Addendum §6 | None found (ladders); Weak–Moderate (rate) | |
| Fixed spacing ladder 1/3/7/14/28 days | Brief §3.5, §7 cap. 6; Addendum §5.8 | Strong (general); Weak (pronunciation) | Not adaptive |
| 8-week cycles, 10-minute default, at least 4 sessions a week | Addendum §4.1, §5.7; Brief §3.5 | Weak–Moderate | Stress dose continues into cycle 2 |
| Weekly goal, no streaks, if-then plan, comeback session | Brief §3.6, §2 row 11; Addendum §4.1 | Moderate (if-then, outside language learning); Weak | |
| Onboarding screener; errors treated as candidates only | Brief §7 cap. 2 | Moderate | |
| Target priority model (weight × error × frequency) | Brief §7 cap. 3 | Moderate (English) | Weights stored as provisional data |
| Uncompressed capture, quality check, HTTPS | Addendum §4.2, §5.2; Brief §3.7 | Strong / Moderate | |
| Store model date; re-score baseline audio | Brief §3.7; Addendum §5.11 | Strong | Model epochs |
| Reliable change from repeat recordings; NAP | Brief §3.7 (single-learner statistics) | Moderate | |
| Multiple baseline (Block B untrained as controls) | Brief §3.7 | Moderate (method) | |
| Blind, shuffled listener pack with reference clips | Brief §3.7, §7 cap. 1 | Moderate | Optional |
| ASR accuracy on unpredictable sentences | Brief §7 cap. 1; Addendum §5.12 | Untested design inference; Moderate that ASR hides errors | Labelled lenient |
| TTS voices checked; natural test voices | Brief §3.1 | Weak | Round trip plus native review |
| Instant phone signals while the cloud score loads | Addendum §4.2, §5.10 | Weak (time targets) | |
| Stress verdict only after validation | Addendum §4.2 (Korzekwa), §7 Q1 | Unverified | Gate V4 |
| French clear-speech pairs, concrete cues, named listener (E8) | Addendum §3.2–3.3; Brief §5.3 | Moderate (immediate); None found (lasting) | Measured against own baseline, never one "clarity score" |
| Clear at usual speed (E8) | Addendum §3.3 #3; Brief §5.3 | Weak | |
| Azure fr-FR not used for native French | Brief §3.7, §5.3; Addendum §3.4 | Strong (technical) | |

---

## Appendix A: Decisions for you (per CLAUDE.md, pick one per row)

| # | Decision | Options | Recommended, and why |
|---|---|---|---|
| D1 | Client platform | A. PWA · B. Capacitor hybrid · C. Native | **A**: one codebase, no store. B stays the escape route. |
| D2 | Scoring path | A. Azure SDK in the browser with a Worker-issued token · B. Worker proxies audio to the Azure REST API · C. Both behind one interface | **A**, with B as the fallback in the same Scorer interface: it streams (lower wait), no audio passes through the server, and it supports continuous recognition for retells |
| D3 | Backend host | A. Cloudflare Worker · B. Vercel or Netlify function · C. Small Node/Express service (closest to v1; free tiers sleep when idle, unverified) | **A**: free, fast, serves the app and the token from one origin |
| D4 | Access control | A. Device pairing secret plus F0 cost cap · B. Cloudflare Access email login (free up to 50 users; how it interacts with the PWA's service worker is unverified) · C. None | **A**: simplest for one user. Rotate the secret if it leaks. |
| D5 | On-device storage | A. IndexedDB through Dexie · B. SQLite compiled to WebAssembly on OPFS (the browser's private file system) | **A**: smaller and easy to test with fake-indexeddb |
| D6 | When French arrives | A. English MVP first, French clarity as E8; French baseline recorded at week 0 · B. French lite inside the MVP (about +1 week) | **A**: the English core is the main goal and has stronger evidence |
| D7 | Azure tier | A. Start on F0 (free) · B. S0 from day one | **A**: usage is about 1.7 hours a month. Move to B if F0 lacks prosody or blocks you. |
| D8 | Reminders | A. Calendar `.ics` · B. Web Push (needs Worker Cron and a key–value store) | **A** for the MVP |

## Appendix B: Technical facts checked this session

| Fact | Status | Source |
|---|---|---|
| Azure STS token valid for 10 minutes; `issueToken` endpoint format | Verified | MicrosoftDocs `azure-ai-docs`, include `cognitive-services-speech-service-rest-auth.md` |
| Pronunciation assessment in the JS SDK; streaming and continuous mode; over 30 s needs continuous mode, where `EnableMiscue` is unsupported; prosody en-US only; syllables en-US only; `NBestPhonemeCount`; IPA alphabet | Verified | `how-to-pronunciation-assessment.md` (ms.date 11/21/2025) |
| Prosody is a paid add-on; accuracy, fluency, completeness and miscue are in the base price | Verified | `pronunciation-assessment-tool.md` § Pricing |
| en-US and fr-FR pronunciation-assessment models updated in August 2026 | Verified | `release-notes-stt.md` |
| Pronunciation assessment available in all speech-to-text regions | Verified | Same release notes |
| REST short audio: at most 30 s for pronunciation assessment; WAV PCM 16 kHz or OGG/Opus; Bearer token accepted | Verified | `rest-speech-to-text-short.md` |
| Browser demo fetches a token server-side | Verified | Azure-Samples `Cognitive-Speech-TTS/PronunciationAssessment/BrowserJS` |
| SSML IPA stress marks supported | Verified | `speech-synthesis-markup-pronunciation.md` |
| Speech SDK for JS: latest 1.51.0 (July 2026) | Verified | npm registry |
| Speech-to-text price about $1.00–1.32 per hour; F0 has 5 hours a month; prosody add-on price | Unverified (secondary sources; official page blocked) | Web search summaries |
| F0 includes prosody and spoken-phoneme output; F0 concurrency limit | Unverified | none |
| Push-stream SDK works in iOS Safari; SDK bundle size on phones | Unverified; E1 spike | none |
| AudioWorklet from Safari 14.1; `storage.persist()` and OPFS from Safari 15.2; Push API in iOS home-screen apps from 16.4; Wake Lock in iOS home-screen apps from 18.4 | Verified | MDN browser-compat-data (GitHub) |
| Safari deletes script-written storage after 7 days without interaction, unless the site's storage is persistent | Verified | MDN, storage quotas and eviction criteria |
| Home-screen web apps exempt from the 7-day cap | Partly verified (WebKit post seen only through search summaries) | webkit.org blocked here |
| Repeat mic prompts in iOS standalone apps when the URL fragment changes (WebKit bug 215884) | Bug exists; current status unverified | Search results |
| Cloudflare Workers Free: 100,000 requests a day; Cloudflare Access free up to 50 users | Verified through secondary sources only | Web search summaries |
| SpeechSuper: French word, sentence and paragraph scoring; English "syllable stress analysis" | Vendor claims verified; accuracy and price unverified | SpeechSuper API samples README and demo pages |
| Chromium fake-mic flags for Playwright; iOS honouring the audio-processing flags; Bluetooth headset quality | Unverified | none |