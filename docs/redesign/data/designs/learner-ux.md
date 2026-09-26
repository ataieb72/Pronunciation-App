<!-- Source design 'learner-ux' (Learner-experience-and-adherence-first). Input to design-options.md; not a final spec. -->

# Pronunciation Coach v2: the 10-minute clarity loop

**Design angle:** the learner's experience and whether they keep practising come first.
**Date:** 24 September 2026. **Status:** proposal for the developer to decide on. The architecture choices are options. The developer picks one (CLAUDE.md).
**Evidence sources:**
- "Brief" means `docs/research/evidence-brief.md`.
- "Add." means `docs/research/learner-profile-addendum.md`.
- Citations look like *Brief §3.1 [Strong]*.
- Technical facts were checked on the web on 24 Sep 2026. Appendix A lists them.
- A claim marked *(unverified)* is one I could not check.

---

## Decisions for you (summary)

| # | Decision | Options | My recommendation |
|---|---|---|---|
| D1 | Client platform | A. installable web app (PWA) · B. PWA wrapped with Capacitor · C. native app · D. PWA with scoring on a server | **A.** It must first pass a test on your own phone (epic E0). Fall back to B if iOS audio fails that test. |
| D2 | Backend and hosting | Cloudflare (Pages + Workers + R2) · Render paid (Node + disk) · Fly.io (Node + volume) | **Cloudflare** |
| D3 | Access control | One-time device pairing code · passkey · Cloudflare Access | **Pairing code** |
| D4 | Where data lives | On the phone only, plus export and an optional encrypted backup · a server database with sync | **Phone-first** |
| D5 | Conversation partner | Scripted dialogues only · also an LLM partner (a large language model plays the other speaker) | **Scripted in v2.0.** Add the LLM later if you want it. You choose the model: Claude Opus 5 is the default, and Sonnet 5 or Haiku 4.5 are cheaper. |
| D6 | Azure tier | F0 (free, hard usage cap, 1 request at a time) · S0 (pay as you go) | **F0** for the first month, then decide |
| D7 | Program defaults | 4 sessions a week · 10-minute sessions · 12-week cycle | Please confirm |

---

## 1. Pitch

Pronunciation Coach v2 is a phone-first practice app. It is for one French-speaking adult who wants two things: to be easily understood in English, and to speak clearer French. Every session runs the same loop, **Hear it → Say it → Use it**, and fits in 5, 10 or 15 minutes.

- **Fast first feedback.** Each session opens with a listening game that needs no microphone and no network. So the first useful feedback arrives about 15 seconds after the learner taps the app.
- **Feedback that is usable.** Each speaking attempt gets at most one or two specific, carefully worded corrections. Then comes a retry where the learner corrects themselves, and a "that was right" button.
- **Practice that transfers.** Each session ends by using the targets in a short spoken task. Practice that stays inside drills rarely carries over to real speech.
- **Targets that matter most.** The program runs in 12-week cycles. It trains the features that matter most for how well a French speaker is understood: word stress first, then /h/ and three vowel contrasts, then fluent free speech.
- **Honest progress.** Progress is judged only at Progress Checks every 4 weeks. These use unseen words, new voices and free speech, never practice scores.
- **Habits without streaks.** Instead of streaks: a weekly target, an if-then plan, one reminder, a comeback session with no guilt, and monthly "Then & Now" recordings.
- **A small technical footprint.** The app is an installable web app. It records uncompressed audio on the phone and measures timing and pitch there. It calls Azure directly with a 10-minute access token from a tiny server function. The Azure key never reaches the phone, and there is no server to keep awake.

This design wins because it is built around what makes a busy adult come back 4 or more times a week for 12 weeks. Every feature still traces back to the evidence. And every automatic score counts as noisy until it has been checked on this learner's voice and phone.

---

## 2. Goals and success measures

### 2.1 What "it works" means

1. **English:** listeners understand the learner's *unscripted* speech more easily. That means more words understood and more ease of understanding. Sounding native is not the goal. *Brief §1, §2 #1 [Strong]; Add. §5.1 [Moderate].*
2. **French:** the learner can switch into clear speech on demand, at a natural speed, and keep it up through a whole retell. *Add. §3 [Strong that clear speech helps listeners in noise or with hearing loss; Moderate for the paired method; None found for lasting change].*
3. **Practice:** the learner practises at least 4 times a week for most of 12 weeks, and comes back after gaps. *Add. §4.1 [Weak].*

Three rules follow from the evidence.
- **Headline progress comes only from Progress Checks:** unseen prompts, held-out words, new voices, and delayed probes. Practice scores measure how much was practised, not progress. *Brief §2 #2 [Strong that practice and transfer differ; Moderate for the exact design]; Brief §3.5 (Soderstrom & Bjork) [Moderate].*
- **Every change is compared with measured noise.** The noise is measured on this learner's phone, not assumed. *Brief §2 #10 [Strong that the noise is real].*
- **One Azure number is never "the" score.** Azure accuracy appears only as a secondary figure: "closeness to Azure's native model". *Brief §2 #1.*

### 2.2 Learner outcome measures

| Goal | Measure | Source | When | "Working" looks like (targets are provisional heuristics) |
|---|---|---|---|---|
| EN intelligibility (gold standard) | Share of words listeners write down correctly, plus ease of understanding on a 9-point scale, from free-speech clips. Listeners know the intended message. Old and new clips are mixed, shuffled and unlabelled. | Optional panel of 3–5 listeners | Week 0 and week 12 (also 4 and 8 if possible) | Both go up by more than the listeners' own disagreement *(Brief §3.7 [Moderate])* |
| EN "machine listener" (automatic proxy) | Share of a picture story's key words that speech-to-text (ASR) recognises. The story has a known intended message. Labelled "lenient". | Azure en-US speech-to-text | Every check | Change larger than the learner's noise threshold (the reliable change index, RCI; see 3f) |
| Word stress on new words | Share of held-out words, read and elicited, said with the right stress | Validated stress detector, spot-checked by humans | Every check | Beyond the RCI. The held-out gain is at least half the practice gain. |
| Hearing stress, vowels, /h/ | Listening accuracy with held-out voices and natural human recordings | On the phone | Every check | Gains on natural recordings, not only on TTS (synthetic speech) items *(Brief §3.1)* |
| Saying vowels and /h/ | Machine listener picks the intended word on held-out words | Azure en-US "spoken phoneme" (the sound it thinks was said) | Every check | Beyond the RCI on trained contrasts. Contrasts not yet trained stay flat (they act as controls). |
| Fluency in free speech | Articulation rate (syllables per second, pauses excluded), pauses inside clauses per minute, mean length of run (syllables between pauses) | On the phone, plus the transcript | Every check | Fewer pauses inside clauses. Rate moves toward normal, not toward "as fast as possible". *(Brief §3.4 [Moderate])* |
| Retention | Targets trained 2 or more weeks earlier and not practised since, tested on new words | Check forms | Checks 1–3 and the week-16 probe | A target counts as **"Learned"** only when it passes this test |
| FR clarity | Clear minus habitual difference in pausing, pitch range and vowel length; drop in clarity over a 60-second retell; ASR accuracy with added background noise, compared with the learner's own baseline | On the phone plus Azure fr-FR | Weeks 0, 6, 12 | Clear-mode differences grow and the drop over a retell shrinks. No claim of lasting change. |

### 2.3 Practice and experience measures

- **Sessions per week:** at least 4 in at least 9 of 12 weeks. At least 7 active weeks. *Hwang et al. 2024, Add. §4.1 [Weak; these predict staying with an app, not learning].*
- **Comeback:** after a gap of 5 days or more, the next session happens within 7 days. *Add. §4.1 [Weak].*
- **Time to first useful feedback:** 15 seconds or less from tapping the app. Speaking correction appears within 2.5 s after speech ends (median). Instant signals appear within 0.3 s. *Add. §4.2, §5.10 [Weak].*
- **Session completion:** at least 85% of started sessions are finished.
- **Dispute rate per detector:** used as a quality signal.
- **Self-check calibration:** agreement between the learner's self-checks and the validated detectors should rise over time. *Brief §3.6 [Moderate].*

### 2.4 Program-level decision rules (applied at each check)

- **No clear change after 8 weeks on trained targets' held-out items, despite 4+ sessions a week:** change method. Options are more listening per session, a different feedback style, or a different contrast order. Log the change in an ADR.
- **Untrained contrasts improve as much as trained ones:** the gains are probably from exposure or from taking the test. Say so plainly.
- **Practice accuracy rises but held-out accuracy does not:** show the gap. Shift the mix toward varied words and the Use stage. *Brief §3.2 (Tremblay 2008) [Weak].*

---

## 3. Product design

### 3a. Modules in priority order

**The trust ladder.** Every automatic detector climbs a ladder. It moves up only after it passes validation on this learner (section 6).
- **0 Shadow:** runs silently and logs its verdicts.
- **1 Self-check:** the app asks the learner to listen and judge, and offers the model.
- **2 Hint:** shows a "possibly…" verdict for high-confidence cases only. Hints do not count in statistics.
- **3 Correction:** a full correction card that counts toward target statistics.

This protects the learner's trust. A wrong correction costs more motivation than a missing one. *Brief §3.7 [Strong that scores are noisy].*

#### English, second-language track

| # | Module | What the learner does | Evidence | Strength |
|---|---|---|---|---|
| EN-1 | **Word stress and reduced vowels.** The "stress thread" runs in every session for all 12 weeks. | Hear: tap the stress shape (●○○ / ○●○ / ○○●). Pick the correct version of a word from two (right stress vs shifted stress). From level 2, hear two words in a row from different voices. Say: read words with stress dots shown; on review items the dots are hidden. Feedback covers the stressed syllable plus a "weak vowel" cue (e.g. "pho-" said as "fuh"). Words have 3+ syllables, suffix families that move stress (photograph → photographer), and English–French look-alikes (hotel, develop, comfortable). | Add. §2 rank 1, §5.3; hard multi-voice tasks: Add. §2 notes (Dupoux); knowing the pattern helps: Tremblay 2008 | Moderate as a priority; Weak for the training; Moderate for hard tasks and teaching the pattern |
| EN-2 | **/h/** (weeks 1–2, about 8 sessions) | Hear: heat/eat, hair/air with 4 voices, plus "Is this a real word?" ("usband" ✗). Say: /h/ words and vowel-first words mixed together. Dropped /h/ and added /h/ are tracked separately, so the drill never rewards simply adding /h/. | Add. §2 rank 3, §5.6 (Melnik & Peperkamp 2021) | Moderate (one study) |
| EN-3 | **Vowel pairs** /iː–ɪ/, then /uː–ʊ/, then /æ–ʌ–ɑː/ (about 8 sessions each; about 12 for the three-way set) | Hear: pick the word (ship/sheep) with 4 voices. Say: the "machine listener" reports what it heard ("Heard: ship (probably)"). One-line cue about length and lip shape. | Add. §2 rank 2, §5.5; Brief §3.1 | Moderate. 8 sessions per pair is a design guess. |
| EN-4 | **Use it: fluency in free speech.** Runs every session. | Retell a picture story or give a 60-second opinion. Repeat the same prompt up to 3 times with shrinking time (60 / 45 / 30 s), then use a new prompt next session. After each round, feedback covers only the current targets plus one pacing note. | Brief §3.4, §2 #8, #13; Add. §2 rank 4 | Moderate for task repetition; Weak–Moderate for targets inside tasks |
| EN-5 | **Sentence (main) stress in dialogues.** From week 5. | Correction dialogues read by TTS: "So you rented a HOUSE?" → "No, I rented a FLAT." | Brief §3.3 (Hahn 2004), §7 capability 7 | Moderate (correlational). The detector is experimental and starts in Shadow. |
| EN-6 | **Weak forms** (to, for, can, of). From week 7. | Mostly listening ("How many words?"), plus a few reduced phrases in Say | Brief §5.1; Add. §2 rank 5 | Mixed. Production gets low weight. |
| EN-7 | **Consonant watch** (turned on only if the diagnostic flags it) | High-functional-load consonants and dropped consonants from clusters, including "-ed" endings. Runs only if the baseline plus the priority model flag it. | Brief §5.1 #1, §2 #9; Add. §2 rank 7 | Moderate (correlational) for English overall; not searched for French speakers |
| EN-8 | **Talk: guided role-play** | Scripted partner lines in TTS, with a goal (book, complain, explain). Spoken only. Feedback at the end. An LLM partner is optional later. | Brief §3.4 (Bibauw 2022: d = 0.84 for spoken practice, 0.29 for typed) | Moderate for dialogue systems; Weak for LLM voice chat |
| Later | Question intonation; shadowing; /θ ð/ | Off by default | Add. §2 rank 6 [Unverified]; Brief §3.4 shadowing [Weak]; Add. §2 rank 7 [Not searched] | — |

The scoring locale is always **en-US**. Only en-US gives syllables, spoken phonemes and prosody. The listening voices still mix US, UK and Australian English, because the target listener is international. The app says so plainly.

#### French, native clarity track (1–2 short sessions a week)

| # | Module | What the learner does | Evidence | Strength |
|---|---|---|---|---|
| FR-1 | **Paired recordings: habitual vs clear** | Read a sentence the usual way, then clearly for a named listener ("your uncle on a bad phone line"). Compare the two. The app names one thing that changed and one that did not. | Add. §3.3 #1–2; Brief §2 #12 | Moderate |
| FR-2 | **Concrete cues** | "Over-enunciate: open your jaw, finish every final consonant, give each vowel its full shape." Never just "be clearer". | Add. §3.2 (Lam & Tjaden) | Moderate for the "over-enunciate" instruction and the listener framing; the mouth cues are untested |
| FR-3 | **Clear at natural speed** | Stage 1 is slow and clear. Stage 2 keeps the clarity while the speed comes back. Slowness is never rewarded. | Add. §3.3 #3 | Weak |
| FR-4 | **Noisy-café partner** | Low-predictability sentences. Optional café noise in earbuds, at a capped volume, faded out over weeks. The machine listener hears the learner's audio with noise mixed in and shows what it understood. | Add. §3.3 #4; Brief §5.3 (Buz 2016) | Moderate for the immediate effect; untested whether it lasts; the ASR check is Mixed |
| FR-5 | **Retell 45–90 s** | Keep it clear to the end. The app shows the clarity drop from the first 15 s to the last 15 s. | Add. §3.3 #5 | Weak |
| FR-6 | **Warm-up** | Two clear-speech sentences at the start | Add. §3.3 #7 | Weak |
| FR-7 | **Vowel probes** ("Le mot __ me plaît") | Measurement only, hidden until its day-to-day stability is shown | Add. §3.3 #6, §3.4 | Moderate/Mixed; reliability on phones unknown |
| Opt. | **Delivery** for a real upcoming talk | Pause placement and pitch range | Brief §5.3 | Weak |

French never gets accent work, an Azure accuracy score as a goal (native speakers score near the top anyway), or rhythm scores. *Add. §3.4; Brief §5.3.*

### 3b. Session design

**Rules for every session**
1. **The same loop every time:** Hear → Say → Use → Wrap. A familiar routine makes starting cheap.
2. **Listening first.** It gives feedback in under 0.1 s, needs no mic prompt and no network, and gives an easy early success. *Brief §3.3 (Lee, Plonsky & Saito 2020) [Weak].*
3. **Listening and speaking stay in separate stages.** No "hear, then repeat" on every trial of a new contrast. *Brief §3.1, §4 [Weak; lab listeners].*
4. **In Say, the prompt comes first.** The learner tries first, then gets a retry prompt, then the model. At most 3 attempts in a row on one item, then a new word with the same target. *Brief §3.2, §7 capabilities 5–6 [Moderate/Mixed].*
5. **Dose is counted in attempts per target, not minutes.** *Brief §3.5 [Weak].*
6. **Every length is a complete session.** Any session of 3 minutes or more counts toward the weekly target.

#### 10-minute session: a typical Tuesday in week 3

Today's plan: stress thread level 2, sound thread /iː–ɪ/ day 2, retell prompt "Weekend at a hotel".

| Time | Stage | What happens | Why |
|---|---|---|---|
| 0:00–0:10 | Open | Tap the icon. The Today screen shows **Start · 10 min**; one tap starts. The week's audio is already cached. The Azure library and token load in the background during Hear. | Fast first feedback; one tap to start |
| 0:10–1:30 | Hear · stress | 16 trials, 4 voices. A voice says "develop", and the learner taps ○●○. ✓ or ✗ appears instantly. On ✗, the correct and chosen versions play back to back. The last 4 trials are two words in a row by different voices. | HVPT (listening practice with many voices); hard tasks reveal "stress deafness" |
| 1:30–2:40 | Hear · vowels | 16 trials of ship/sheep. This contrast is still practised alone (blocked), because accuracy is below 80%. | HVPT; block a new contrast first |
| 2:40–2:50 | Mic | The first spoken word opens the mic for the whole session. A level and noise check runs on that word. A separate check appears only if it fails. | Quality gate; one permission prompt per session |
| 2:50–5:10 | Say · stress | 8 words: 5 new and 3 due reviews (dots hidden). Say → card (if confident) → self-retry → model and retry if needed → next word. Self-check on 2 of the 8. | Feedback plus retry; recall practice; sampled self-checks |
| 5:10–6:40 | Say · vowels | 6 items ("sheep", "ship", "a big ship"). "Heard: ship (probably). For *sheep*: smile slightly and hold it longer." | Feedback that names the vowel heard |
| 6:40–9:20 | Use | 4-panel story. Round 1 (60 s), then a card with 1 target note ("HO-tel twice → ho-TEL") and 1 pacing note. Round 2 (45 s). Optional round 3 (30 s). If round 2 repeats round 1 almost word for word: "Try saying it a different way." | Task repetition; transfer; avoid word-for-word recycling |
| 9:20–10:00 | Wrap | "Done: 32 listening trials, 14 words, 2 retells." One keep-doing line. Weekly dots ●●●○. "Next: Thursday 7:30, after coffee." | Weekly target; if-then cue |

#### 5-minute version (complete, counts fully)
- 0:05–1:35 Hear: 12 stress trials and 8 sound trials.
- 1:35–3:35 Say: 5 stress items and 3 sound items.
- 3:35–4:40 Use: one 45-second round plus one note.
- 4:40–5:00 Wrap.

#### 15-minute version
The 10-minute session plus one 5-minute extension. By default the extension rotates. The learner can swap it.
- **Français clair**, 1–2 days a week.
- **Talk:** a guided role-play.
- **Use+:** a third retell round plus sentence-stress dialogues.
- **Shadowing:** later, marked experimental.

#### Français clair, 5 minutes (as an extension or on its own)

| Time | What happens |
|---|---|
| 0:00–0:30 | Warm-up: 2 sentences, "over-enunciate" |
| 0:30–2:30 | 3 pairs: habitual → clear for a named listener. Play both. "Changed: pitch range +3 semitones, vowels longer. Not changed: pauses." |
| 2:30–3:45 | Noisy café: 3 low-predictability sentences. "They heard: *le poison* …" Retry the missed word. |
| 3:45–4:45 | Retell 45–60 s at natural speed. The app shows the first 15 s against the last 15 s. |
| 4:45–5:00 | Wrap |

#### Comeback session (3 minutes)
- **Trigger:** 5 or more days since the last session.
- **Content:** 8 listening trials on the learner's *strongest* recent target (success first), 3 Say items, and one 30-second retell.
- **Message:** "Welcome back. Pick up where it counts." Nothing about missed days.
- **Review queue:** trimmed to 12 items. Overdue items are rescheduled and never shown as a debt. *Add. §5.7; Brief §7 capability 11 [Weak].*

#### Progress Check (replaces a session and counts toward the target)
- **Part A, Say (about 9 min):**
  - the anchor set (the same 10 sentences at every check);
  - a held-out word form (30 stress words in a carrier phrase, plus 10 words per contrast, trained and untrained);
  - a new 60-second picture story;
  - a new 60-second opinion.
- **Part B, Hear (about 6 min):** held-out voices plus natural recordings, all contrasts. It adds the French anchor set and a retell in French check weeks.
- **During the check:** no feedback. Results appear after Part B, in plain words with their uncertainty.

#### The 12-week program

| Week | Stress thread (every session) | Sound thread | Use / Talk | French (1–2×/week) | Checks |
|---|---|---|---|---|---|
| 0 | — | — | — | Baseline in the first Français clair session | **Baseline**, 2 sittings |
| 1–2 | L1: 2–3 syllables; stress shapes; dots shown | /h/ | Retells | Pairs + cues | — |
| 3–4 | L2: 3–4 syllables; French look-alikes | /iː–ɪ/ (blocked, then mixed) | Retells + opinions | + noisy café | **Check 1** (end of week 4). Delayed probe for /h/. |
| 5–6 | L3: suffix families; sentence-stress dialogues begin | /uː–ʊ/; reviews of /h/ and /iː–ɪ/ | Role-plays with corrections | + retell drop | — |
| 7–9 | L4: mixed review; weak forms (listening) | /æ–ʌ–ɑː/ | Information-gap tasks; optional Talk | Vowel probes (Shadow) | **Check 2** (end of week 8); French check |
| 10–11 | L5: stress in free speech (Use feedback) | Mixed review; Consonant watch if flagged | Longer retells | Clear at natural speed | — |
| 12 | Mixed review | Mixed review | Rehearse a real upcoming talk | Retell | **Check 3**; Then & Now; French check |
| 13–16 | Maintenance: 2 short sessions a week (optional) | — | — | — | **Week-16 delayed probe** |

- **Stress dose:** 12 weeks × about 4.5 sessions × about 4 minutes ≈ 3.6 hours. That is close to the addendum's estimate of about 4 hours. *Add. §4.1, §5.3.*
- **A built-in control.** Contrasts start at different weeks. So untrained contrasts act as controls at each check. This is a "multiple baseline across targets" design with at least 3 targets. *Brief §3.7 [Moderate].*
- **Program start.** The program starts when the first slice ships. The sound thread joins when epic E6 ships (section 5). This also lengthens the untrained baselines.

**Spacing and sequencing rules**
- **Item review:** each item returns at +1, +3, +7 and +14 days. This preset schedule is not adaptive. A failed review restarts at +1. *Add. §5.8 [Moderate]; Brief §3.5 [Strong for L2 learning in general; Weak for pronunciation].*
- **Blocked, then mixed:** a new contrast is practised on its own until listening accuracy is at least 80% in 2 sessions in a row. Then it is mixed with earlier contrasts. *Brief §3.5 [Mixed]; the 80% threshold is a heuristic.*
- **Reviews:** at most 40% of Say items. At most 12 per session. Overflow is rescheduled silently.
- **Use prompts:** the same prompt for up to 3 rounds, then a new prompt next session. Topic families rotate weekly. *Brief §3.4 (Suzuki 2021; de Jong & Perfetti 2011) [Moderate].*

### 3c. Screens and flows on a phone

All primary actions sit in the bottom third of the screen, for one-thumb use. There are no scores on the home screen.

1. **Today (home)**
   - Big **Start** button with a 5 / 10 / 15 selector (10 is preselected).
   - Weekly dots ("3 of 4 this week").
   - Plan chip ("After coffee · 7:30").
   - Small Français counter ("1 of 2").
   - Next check date.
   - This week's real-life mission, logged with one tap.
2. **Session shell**
   - Stage bar: Hear · Say · Use · Done.
   - Exit. An exit after 3 or more minutes still counts.
   - Pause when the app goes to the background.
3. **Hear trial**
   - The audio plays automatically. A replay button.
   - 2–3 large answer buttons: word labels or stress shapes.
   - Instant ✓ or ✗; the correct and chosen versions play back to back.
   - Voice name hidden.
4. **Say trial**
   - Prompt word or phrase, with stress dots when relevant.
   - Tap to talk, with auto-stop by voice activity detection (VAD: software that detects when speech starts and stops). A live level meter.
   - "Hear model" is hidden on the first attempt.
   - The feedback card follows (3d).
5. **Mic check sheet** (only when the automatic check fails)
   - Level and noise meters.
   - Tips: move closer, find a quieter spot, avoid a Bluetooth headset mic.
6. **Use task**
   - Picture strip or prompt card, and a timer ring (60/45/30).
   - Record. A summary card after each round. "Again" (round 2 of 3).
7. **Wrap:** what you did, one keep-doing note, weekly dots, the next plan time.
8. **Progress**
   - Four headline cards, each with check points at weeks 0/4/8/12 and uncertainty bands: *Understood* (panel or machine listener), *Stress on new words*, *Sounds heard and said*, *Pace and pauses in free speech*.
   - A separate "Practice" area: sessions per week and attempts per target, labelled "practice, not progress".
9. **Targets list**
   - Each target shows a status: New / Learning / Holding / Check pending / **Learned**.
   - An evidence line, e.g. "42 attempts, 14 words, 6 sessions", with a range bar.
10. **Then & Now**
    - Week-0 and latest clips of the same task type.
    - An optional blind game: "Which is newer?"
    - Plain statements of what is now reliable.
11. **Progress Check flow:** Part A and Part B, a results page, and a "why these numbers wobble" explainer.
12. **Recordings library:** play, star, delete, export.
13. **Plan and reminders:** weekly target (3–6), if-then plan, backup plan, reminder time, pause mode (vacation).
14. **Disputes review**
    - Weekly, optional, 2 minutes.
    - Listen again to disputed clips with fresh ears and confirm or withdraw.
15. **Français clair screens:** habitual and clear tabs, a compare player, the noisy-café card, a retell drop meter.
16. **Settings**
    - Listening voices and variety.
    - French variety (fr-FR / fr-CA).
    - Audio processing options (the result of the test in section 6).
    - Data export and import, backup, privacy.
    - Scorer information: provider, SDK version, model dates.
    - Validation dashboard: each detector's step on the trust ladder and its agreement statistics.

**Key flows**
- **First run, sitting 1 (about 9 min).**
  1. Goal tied to real use ("Speak up in the Tuesday team call").
  2. Weekly target, if-then plan and backup plan.
  3. Reminder: a calendar file, or a web push notification if the app is installed.
  4. Speaking baseline: story, opinion, read passage, held-out words, anchor take 1.
  5. A one-minute listening taste game on untested words so the first day ends on a win.
- **First run, sitting 2 (about 9 min).** Listening screener (stress with sequences, vowels, /h/; 2 voices; no feedback). Level check by sentence repetition (12 sentences). Anchor take 2.
- **Daily session:** Today → Hear → Say → Use → Wrap.
- **Comeback:** triggered automatically by the gap rule.
- **Check:** runs on its due day, can be moved by ±3 days, and splits across two sittings if needed.

### 3d. Feedback design

**After a listening trial (under 0.1 s).** ✓ or ✗ with a short sound. On ✗: "It was ○●○ (de-VE-lop). You chose ●○○." The two versions play one after the other. No score. *Brief §3.1 [Strong]; Carlet & Cebrian [Moderate].*

**After a speaking attempt**

| Moment | What the learner sees | Why |
|---|---|---|
| Under 0.3 s (on the phone) | "Got it" plus a small level trace. Or "Let's redo that one: too quiet / clipped / noisy". A redo is not counted and not sent to Azure. | Quality gate *(Add. §4.2 [Moderate])*; saves cost |
| 1 in 4 trials, before the verdict | Self-check: "Where was your stress?" (tap a syllable) / "Ship or sheep?" / "Did you say the /h/?" / "Not sure" | Self-monitoring; learners overrate themselves and improve with feedback *(Brief §3.6 [Moderate])*. Sampled only, because rating every trial can backfire *(Brief §3.6 [Weak])*. The pause also delays feedback by a few seconds *(Brief §3.2 [Weak])*. |
| About 1–2.5 s | **At most 1 correction card** (2 only when both are confident and on current targets). Otherwise "Clear ✓". | Specific feedback plus retry *(Brief §3.2 [Moderate])*; focused feedback *(Brief §2 #5 [Weak for the 1–2 limit])* |
| Then | Self-retry without the model → if still off, the model plays, then a retry → then a new word with the same target | Prompt first, then model *(Mixed)*; varied words *(Brief §3.2 [Weak])* |

**Anatomy of a correction card**
- **Headline** in cautious wording: "Probably stressed: **PHO**-to-gra-phy. Aim: pho-**TO**-gra-phy."
- **One cue** in one sentence: "Make TO longer and higher; keep 'pho' short, like 'fuh'."
- **Mouth picture** only for sounds (/iː/ vs /ɪ/, /h/ as "fog a mirror", jaw opening for /æ–ʌ–ɑː/). *Brief §3.2 [Mixed for how-to explanations; Weak for mouth visuals].*
- **Buttons:** **Hear yours**, **Hear model** (after retry 1), **Try again**, and **"I think I said it right"** (dispute).
- **Optional "Details":** syllable timing bars, a pitch trace in semitones (a unit that treats high and low voices alike), and Azure closeness. Labelled experimental. *Brief §2 #14 [Weak].*

**Rules**
- **Show only what is confident.** Only errors on *current targets* that the detector finds with confidence above its validated threshold. Everything else is logged silently. *Brief §3.2 (Neri 2002; Levis 2007) [Moderate reasoning].*
- **No colour-coding of every word.** No 0–100 score on the main screen. *Brief §4 [Moderate].*
- **Accepted variants are never flagged:** English weak forms, US and UK vowel variants in the listening sets, French optional liaison and dropped schwa. *Brief §7 capability 5.*
- **A self-correction counts more** than a correct attempt made just after hearing the model. *Brief §3.2.*
- **Disputes are excluded** from target statistics until they are reviewed. If more than 25% of a detector's flags are disputed and upheld, the detector drops one step on the trust ladder.

**Feedback after a Use round**
- It comes at the end of the round, never in the middle of speech. *Brief §4 [Weak].*
- One target note ("You said HO-tel twice").
- One pacing note ("3 pauses fell inside phrases, after 'the', 'a', 'to'. Pause after the full idea instead.").
- A round-to-round line ("Round 2: pauses inside phrases 5 → 3"), labelled "within today".
- Never a reward for speed. *Brief §3.4, §4 [Weak–Moderate].*

**French feedback**
- A pair comparison: "changed / didn't change" on validated measures only (pauses, pitch range, vowel length).
- Before validation: compare playback plus "Which would your listener catch better?"
- In the noisy café: "They heard …", with missed words highlighted.

**Never shown:** single-take scores as progress, streaks, points, leaderboards, rhythm scores, or a single "clarity score". *Add. §3.4, §6; Brief §4.*

### 3e. Content plan

**English sets**

| Set | Count | Train / held out | Source | Notes |
|---|---|---|---|---|
| Stress words | 600 | 480 / 120 (4 parallel forms of 30) | Stress digits from the CMU Pronouncing Dictionary; frequency bands from a frequency list (licences to check) | 2-syllable noun/verb pairs (about 40), 3+ syllables (about 250), suffix families (about 60 families), French look-alikes (about 120), compound vs phrase (about 30) |
| Wrong-stress foils (versions with the stress in the wrong place) | 300 words × 2 voices | Training only | Azure TTS with SSML phoneme tags (IPA with stress marks) | Every foil checked by ear and by the detector |
| Sentence-stress dialogues | 120 pairs | 90 / 30 | Written in-house | "No, I rented a FLAT" type |
| /h/ | 80 minimal pairs + 40 pseudo-words | 64 / 16 | Melnik & Peperkamp-style lists | Real-word decisions |
| /iː–ɪ/ | 80 pairs | 64 / 16 | Standard minimal-pair lists | In a carrier phrase and in short phrases |
| /uː–ʊ/ | 25–30 pairs | 20 / 8 | Pool/pull, fool/full, Luke/look… | Few pairs exist |
| /æ–ʌ–ɑː/ | 50 sets | 40 / 10 | Variety-specific: en-US cat/cut/cot; en-GB cat/cut/cart | Tagged by variety |
| Weak-form phrases | 60 | Listening | In-house | — |
| Use prompts | 60 (24 picture stories, 18 opinions, 18 role-plays) | Check prompts kept separate (12 stories, 8 opinions) | In-house. Simple 4-panel drawings with a known message and key words. | Each tagged with the target words it draws out |
| Anchor set | 10 sentences | Constant | In-house | Measures noise only |
| Level check | 12 sentences of rising length | — | In-house | Sets content difficulty |

**French sets**
- **Paired-reading sentences:** 160, including 40 low-predictability sentences × 4 forms for the ASR-with-noise check.
- **Vowel-probe words:** 40, covering /i y e ø ɛ œ/, /u o ɔ/ and nasal vowels.
- **Retell prompts:** 30.
- **Listener personas:** 8.
- **Café babble noise:** made in-house by mixing 6 or more TTS voices, so there is no licence issue.
- **Anchor set:** 10 sentences.

**Voices**
- **English:** 4 training voices (2 en-US, 1 en-GB, 1 en-AU; 2 women and 2 men) and 2 test-only voices (en-US, en-GB).
- **Natural recordings for tests:** Lingua Libre (CC BY-SA 4.0), plus 1–3 volunteers who record through an in-app "voice pack" link.
- **Why 4 voices, not 6:** a pool of 4–6 is sensible. More voices are not reliably better, and high variety can hinder some learners. *Brief §3.1 [Mixed].*
- **French:** 3 fr-FR voices, plus fr-CA if that variety is chosen.

**Production pipeline** (build time, never at runtime)
1. Source YAML is checked by a validator: schema, stress pattern against CMUdict or Lexique, no overlap between held-out and training items, variety tags.
2. A Node script renders TTS using the key from a local `.env`. It outputs MP3 for playback and 16 kHz WAV for validation.
3. Automatic validation:
   - Azure pronunciation assessment on each rendered word must score at least 90.
   - The stress detector must agree with the intended pattern.
   - Foils must be detected as wrong.
4. Human spot-check:
   - The learner checks 10% of items.
   - A native listener identifies 20 tokens per voice per contrast. A voice needs at least 90% correct, otherwise it is dropped for that contrast.
5. The content pack is published with a version number. Every attempt stores the content version.

- **Size:** about 200–300k TTS characters in total. That fits in one month of the free tier (0.5M characters). Otherwise it costs about $5 at $16 per million characters (secondary source). *Brief §3.1 [Weak for TTS in HVPT] and "check that a TTS voice produces the contrast".*
- **Caching:** audio is cached one week at a time by the service worker.

### 3f. Progress measurement

**Progress Check design.** Every 4 weeks plus a probe at week 16 (details in 3b). *Brief §7 capability 1.*
- **Parallel forms A–D** keep the check items fresh.
- **The anchor set stays constant** and measures noise.
- **Free-speech tasks have a known intended message**, because listeners who don't know the message rate speech as easier to understand. *Brief §3.7 [Moderate].*
- **Like-for-like scoring.** Before comparing, the app **re-scores all past check audio with today's scorer**. Raw check audio is kept forever for this reason. A model update then cannot look like learner progress. *Brief §3.7 [Strong that models change].*
- **Optional listener panel** (weeks 0 and 12; also 4 and 8 if possible):
  - 3–5 listeners write down what they hear and rate ease from 1 to 9;
  - old and new clips are mixed, shuffled and unlabelled, plus fixed reference clips;
  - the pack is shared with an expiring link. *Brief §3.7, §7 capability 1 [Moderate].*

**Target priority model**
- **Per target and mode** (hear or say), the error rate is estimated with a beta-binomial model. This gives each rate a likely range and pulls estimates based on few tokens toward a prior.
  - Tokens count only above the detector's confidence threshold.
  - A self-corrected success counts 1.0. A success just after the model counts 0.5. Disputed tokens are excluded.
- **Priority** = functional-load weight × expected error rate × word-frequency weight.
  - Starting weights: stress 1.0, vowels 0.8, fluency 0.8, /h/ 0.7, weak forms 0.4, intonation 0.3, /θ ð/ 0.2.
  - They live in `content/weights.json`, with their source and a "provisional" flag. *Brief §2 #6, §7 capability 3 [Moderate English; Weak French]; Add. §2.*
- **"Weak" label** only after 15–20 tokens in at least 5 words over at least 3 sessions. Targets are ranked by the lower bound of their range, not by the raw mean. *Brief §2 #10 [Weak heuristic].*
- **Hearing and saying are tracked separately.** This shows whether a problem is in hearing or in producing the sound. *Brief §3.1.*
- **The baseline can reorder the sound thread.** For example, /h/ is skipped if listening is at least 90% on hard tasks and production is fine. The stress thread stays first unless the baseline shows it is strong.

**Handling noisy scores**
1. **Quality gate** before any scoring: clipping, level, signal-to-noise ratio, duration.
2. **Confidence gating** per detector, and the trust ladder (3a).
3. **Pool evidence.** Never show one take as progress.
4. **Measure the learner's own noise.** The anchor set is recorded twice at baseline and at every check. A change counts only when it exceeds the reliable change index (RCI: change larger than typical take-to-take variation). *Brief §3.7 [Moderate].*
   - For rates, the app compares ranges. It says "probably better" when the chance that the later rate is higher is at least 0.9, and "clearly better" when it is at least 0.975. These are heuristics.
5. **Across 3 or more checks:** NAP (non-overlap of all pairs: the share of before–after pairs where the later score is higher). No Tau-U (a similar statistic without a confidence interval). *Brief §3.7.*
6. **Every score stores** its provider, locale, SDK version, date, device, browser and audio settings. Twenty reference clips are re-scored monthly, and model changes are marked on charts. *Add. §5.11.*
7. **Plain wording** on results: "Clearly better / Probably better / No clear change / Probably worse", with one sentence on why.

### 3g. Habit and motivation design

- **A concrete goal tied to real use** is set at onboarding and shown on Today. *Brief §7 capability 11.*
- **Weekly target, not a streak.** The default is 4, adjustable from 3 to 6. Sessions per week show as dots. Missing a day changes nothing. "Weeks active" is counted, not "consecutive days". *Brief §2 #11; Lally 2010 [Weak].*
- **If-then plan plus backup plan.** "After my morning coffee, I do one 10-minute session. If I miss it, I do the 5-minute version on the train home." *Brief §3.6 [Moderate, non-language; d ≈ .15 after bias correction].*
- **One reminder, on plan days only.**
  - The default is a recurring calendar event (.ics file). It needs no server and works on iOS and Android.
  - Optional web push notifications work in installed home-screen apps (iOS 16.4+).
  - No nagging, no second reminder.
- **Comeback session** with no backlog (3b). *Add. §4.1 [Weak; returning after pauses was common].*
- **Early successes on purpose.** Sessions open with listening, comebacks start on the strongest target, and the wrap-up names what was done. Past success is the strongest source of belief in one's ability. *Brief §3.6 [Moderate, correlational].*
- **Then & Now** every month, plus plain statements like "On new words you now put stress right 8 of 10 times; in week 0 it was 5 of 10." *Brief §2 #11.*
- **Honest framing.** "Practice, not progress" labels on practice statistics. A one-screen explainer on why mixed, spaced practice feels harder but works better. *Brief §3.5 (Abel & de Bruin) [non-language].*
- **Weekly 20-second review** (first session of the week): "Last week 4/4. Keep the plan?" plus an optional "What got in the way?" with one tap. Repeated misses suggest a 5-minute default or a new cue time.
- **Real-life mission** each week, e.g. "Use 'develop' in a meeting and notice the stress". Logged with one tap or a 20-second voice memo. *Brief §3.6 (Derwing & Munro) [Weak].*
- **Pause mode** for holidays: no reminders, and no comeback prompt until it ends.
- **Tone:** warm and brief. No guilt, no confetti, no points. Game features help learning in education studies, but effects on motivation are less robust, and no study shows streaks help. *Brief §3.6.*

### 3h. What is deliberately left out

| Left out | Why |
|---|---|
| Speed ladders and tongue twisters | No evidence for clarity. They reward speed and decide on one noisy take. *Brief §4; Add. §6 [No evidence]* |
| Non-speech mouth exercises | No evidence of benefit *(children with speech disorders)* |
| Native accent or Azure accuracy as the main score | Accent is partly separate from being understood *[Strong]* |
| "Retry until green", advancing on one score of 85 or more | Practice performance is not learning *[Moderate]* |
| Colour-coding every word; bare scores | Not corrective feedback *[Moderate]* |
| Rhythm scores (%V, nPVI) as targets | They vary as much between speakers and tasks as between languages *[Moderate/Mixed]* |
| English stress drills applied to French | French prominence falls at the end of the phrase *[Moderate descriptive]* |
| Typed chat practice | Weak transfer to speaking *(d = 0.29, not significant)* |
| An LLM or audio LLM as a pronunciation judge | Biased; poor agreement with raters *[Weak]* |
| Streaks, leaderboards, points | No evidence they help learning; one missed day does not harm habits |
| Long rule lessons and IPA tutorials | Explicit and non-explicit stress training worked equally well *(Schwab 2022) [Weak]* |
| Background, lock-screen or hands-free practice on iOS | iOS stops capture when the page is hidden *[Moderate]* |
| /θ ð/, question intonation, vowel charts, VOT meter (the delay before the voice starts after /p t k/), clapping (v2.0) | Low priority, not searched, or Weak/untested. Revisit after checking. |
| Rewarding slowness in French | Rate did not predict intelligibility; clear speech at normal rate keeps much of the benefit *[Mixed/Moderate]* |

---

## 4. Technical architecture

### 4a. Client platform

| Option | What it is | For the learner | Against | Pick when |
|---|---|---|---|---|
| **A. Installable web app (PWA)**: React + TypeScript + Vite; Azure Speech JS SDK in the browser with a short-lived token | One codebase. Works on iOS and Android. Installed from the browser. | Instant updates. Opens from a home-screen icon. Offline listening. Nothing to install from an app store. | iOS audio quirks: permission prompts, output routing, silent switch. Needs HTTPS. Reminders are limited to web push or calendar files. | **Recommended**, if the E0 test on your phone passes |
| **B. PWA + Capacitor** (same web code inside a native shell) | Same UI, with native audio capture and local notifications | Most reliable mic permission and audio session on iOS. Local reminders. | A Mac and Xcode are needed. $99 a year for an Apple developer account (free signing expires every 7 days). Store or TestFlight overhead. | If the iPhone fails the E0 audio test |
| **C. Native** (Swift and Kotlin, or React Native) with native Azure SDKs | Two native apps or a bridge | Best audio control | Largest effort; two platforms; slower changes | Only if A and B both fail |
| **D. PWA with scoring on a server** (phone uploads WAV; a server function calls Azure's REST API) | A thinner client | The key stays on the server; easy to log raw results | An extra network hop and delay. 30-second limit for short audio. Needs server compute. | **Built into A as a fallback path** if the SDK misbehaves on iOS |

**Why A serves the experience.**
- One tap from the home screen, and the week's audio is already cached. So the listening stage works offline and gives feedback in well under a second.
- The phone does the fast work: level, pauses, pitch. The cloud does the phoneme work. *Add. §4.2 [Moderate].*
- Every iOS browser uses the same engine (WebKit). One web build covers them all, with no app store.
- The Azure SDK is loaded lazily during the Hear stage, so the Say stage is ready when the learner reaches it.

**Stack for option A**
- React 19, TypeScript (strict), Vite, `vite-plugin-pwa`.
- Dexie (an IndexedDB wrapper) for storage.
- A Web Worker for signal processing (DSP).
- An AudioWorklet for capture.
- `microsoft-cognitiveservices-speech-sdk` 1.51.0, loaded lazily (about 378 KB minified).
- Cloudflare Worker with Hono for the backend.

### 4b. Audio capture pipeline (iOS and Android)

1. **Start on a tap.** When the learner starts the Say stage, create one `AudioContext` and one `getUserMedia` stream **for the whole session**.
   - Do not stop tracks between takes. Do not change the URL path or hash during a session: WebKit bug 215884 caused repeated permission prompts when the URL changed in home-screen apps. It is marked resolved (Feb 2026), but behaviour on your iOS version is *unverified*.
   - Stop the mic at session end.
2. **iOS audio session.** Set `navigator.audioSession.type = 'play-and-record'` (Safari 16.4+). Test on your phone:
   - playback volume and output route while the mic is open (*unverified*);
   - whether the silent switch mutes Web Audio (*unverified*).

   Play model audio through `HTMLAudioElement`, or through the same context if tests show it is better. **Never record while model audio plays** (half-duplex: one direction at a time).
3. **Capture.** An AudioWorklet (Safari 14.1+, Chrome) posts 20 ms frames of raw samples. The main thread passes them to:
   - a **resampler** to 16 kHz mono 16-bit PCM (uncompressed). It is written as a pure function so it can be tested; a context created at 16 kHz is the tested alternative;
   - a **ring buffer** that builds the WAV file;
   - the **Azure push stream** during a take;
   - the **DSP worker**, which computes level, VAD, pitch (McLeod pitch method, e.g. the `pitchy` library, or YIN), energy and a pause map.
4. **Microphone processing.** Default: `echoCancellation`, `noiseSuppression` and `autoGainControl` set to false, for measurement fidelity. It is an open question whether this helps or hurts Azure scores (Add. §7 Q9). A test in E0 decides. The chosen settings are stored with every attempt. Whether iOS obeys these settings is *unverified*.
5. **Auto-stop.** A VAD with an adaptive noise floor stops the take about 0.6 s after speech ends. Takes are capped at 30 s for items and 60 s for Use rounds; long rounds use the SDK's continuous mode.
6. **Quality gate:** clipping ratio, level window, estimated signal-to-noise ratio, minimum duration. A take that fails is redone and not sent to Azure.
7. **Interruptions.** On `visibilitychange` to hidden, or iOS `AudioContext` "interrupted": abort and discard the take, and show "Paused". *Add. §4.2 [Moderate].*
8. **Screen.** Wake Lock keeps the screen on during a session (iOS 18.4+, Android).
9. **Fallback** when AudioWorklet is missing: `MediaRecorder` with `isTypeSupported` (audio/mp4 first on iOS), decoded to PCM. Such attempts are marked "lossy" and excluded from acoustic measures. *Add. §4.2 [Strong].*
10. **Bluetooth headset mics** may lower quality (*unverified*). The mic check warns when the input device label suggests Bluetooth.

**Android.** Chrome follows the same path with fewer quirks. Web push and install prompts work natively.

### 4c. Scoring and analysis per language and feature

| Feature | Language | What computes it | Where | Fallback | Starts on ladder at |
|---|---|---|---|---|---|
| Listening trials | EN, FR | Answer key | Phone | — (works offline) | Correction (exact) |
| Stressed syllable | EN | Azure en-US scripted assessment (phoneme detail, IPA, 5 spoken-phoneme candidates) gives **syllable start and length**. The phone computes per-syllable length (normalised), pitch peak in semitones relative to the speaker's median, and loudness peak. A simple weighted model picks the stressed syllable and a confidence margin. | Azure cloud + phone | No Azure: the phone finds syllable centres from energy and voicing (experimental); show self-check only | Shadow |
| Unreduced weak vowel | EN | Azure spoken phoneme on the unstressed vowel (full vowel vs /ə/ or /ɪ/) plus its length | Cloud + phone | Self-check | Shadow |
| Vowel contrasts | EN | Azure spoken phoneme on the target vowel (top candidate and its margin) plus vowel length. If the margin is ambiguous, **two-reference comparison**: score the stored audio against both words and take the better match (sequential on F0). | Cloud + phone | Self-check | Shadow → Hint |
| /h/ dropped or added | EN | Azure phoneme score and spoken phoneme for /h/. Added /h/: two-reference comparison (eat vs heat) plus a phone check for breath noise before the vowel (experimental). | Cloud + phone | Self-check | Shadow |
| Fluency in free speech | EN, FR | Live Azure speech-to-text during the round gives the transcript and word timings. The phone gives the pause map (pauses of at least 250 ms, a configurable heuristic; *unverified* as a standard). Syllable counts come from transcript words via CMUdict or Lexique. Pauses inside vs between clauses: punctuation plus conjunction rules. | Cloud + phone | Phone only: pause rate and phonation ratio | Hint (after validation V6) |
| Stress on target words in free speech | EN | Speech-to-text transcript, then scripted assessment on that transcript (Microsoft's recommended path for unscripted speech), then the stress model on the key words | Cloud + phone | Skip | Shadow. Agreement drops for unscripted speech *(Brief §3.7)*. |
| Sentence stress | EN | Word timings plus per-word pitch, loudness and length peaks | Cloud + phone | Skip | Shadow |
| Prosody score and break flags | EN | Azure prosody (add-on cost). Break confidence thresholds are set from our own data (0.75 suggested). | Cloud | — | Details only |
| Machine listener (intelligibility proxy) | EN | Azure en-US speech-to-text key-word hits on known-message tasks | Cloud | — | Check measure, labelled lenient |
| Pause and pitch-range changes | FR | Phone (pitch in semitones; pauses) | Phone | — | Hint after V7 |
| Vowel length | FR | Azure fr-FR word and phoneme timings (phoneme timing and count mapping *unverified*), or local vowel detection | Cloud + phone | Word-level length | Shadow |
| 1–3 kHz energy share, formants (vowel resonances) | FR | Phone FFT and LPC | Phone | — | Shadow (experimental) |
| ASR with added noise | FR | Phone mixes café babble into the WAV at a fixed signal-to-noise ratio, then Azure fr-FR speech-to-text gives word accuracy on low-predictability sentences | Phone + cloud | — | Check measure; baseline-relative |
| Accuracy on French sounds | FR | Azure fr-FR phoneme scores (no phoneme names), mapped through our own lexicon | Cloud | SpeechSuper pilot (French word, sentence and paragraph scoring with phoneme-level scores; labels and pricing *unverified*) | Shadow; near the ceiling for a native speaker |
| Talk partner turns | EN | LLM (text only), then Azure TTS in the browser | Cloud | Scripted lines | Never scores |

**Azure adapter details.** v1's bugs become regression tests.
- Wrap the callback-based `recognizeOnceAsync` in a promise with an 8-second timeout.
- Read `SpeechServiceResponse_JsonResult` and parse `NBest[0].Words[].Syllables/Phonemes`.
- Turn on prosody explicitly for en-US Use tasks.
- Compare result reasons with enum values, not strings.
- Refresh the token (10-minute life) at 8 minutes.
- Serialise requests on F0 (1 concurrent request).
- Store the raw JSON.

All providers sit behind one `ScoringProvider` interface. *Brief §7 technology options.*

### 4d. Backend

**Language:** TypeScript on Cloudflare Workers (Hono).

**Responsibilities.** The backend only does what a phone cannot safely do:
- issue Azure tokens;
- relay LLM calls;
- store encrypted blobs.

It never scores and never stores plaintext learner data.

| Endpoint | Purpose | Notes |
|---|---|---|
| `POST /api/pair` `{setupCode}` → `{deviceToken}` | One-time pairing of a phone | The setup code is a Worker secret. The token is stored hashed (KV or D1). |
| `POST /api/speech/token` → `{token, region, expiresInSec: 540}` | Azure token via `issueToken` | Needs `Authorization: Bearer <deviceToken>`. Rate-limited to 30 per hour. |
| `POST /api/speech/assess-rest` (WAV ≤ 30 s, config) | Fallback D: short-audio REST assessment | Only if the SDK path fails on iOS |
| `POST /api/talk/turn` `{scenarioId, turns[], learnerText}` → `{partnerText, done}` | LLM partner (optional, epic E8) | Fixed system prompt per scenario. Token caps. No audio is sent. |
| `PUT /api/backup/:id`, `GET /api/backup/latest` | Encrypted backup to R2 | Encrypted on the phone (AES-GCM, key derived from a passphrase). The server cannot read it. |
| `POST /api/panel`, `GET /api/panel/:id`, `POST /api/panel/:id/responses` | Listener-panel packs | Clips are encrypted. The key travels in the link fragment (`#k=…`), which is never sent to the server. Packs expire after 14 days. |
| `GET /api/health` | Health check | — |

**Build tools (not deployed):** a TTS render script, a content validator, and a fixture recorder.

### 4e. Data

| Data | Where | Kept for | Notes |
|---|---|---|---|
| Content (items, audio, weights) | Static files, cached by the service worker | Versioned | Attempts store the content version |
| Profile, plan, settings, schedule | IndexedDB (Dexie) | Always | — |
| Attempts: features, raw Azure JSON, verdicts, self-checks, disputes, scorer metadata, device, audio settings | IndexedDB | Always | About 5–10 KB each |
| Practice audio (16 kHz WAV, about 32 KB/s) | IndexedDB blobs or OPFS (the browser's private file system) | 30 days, unless starred, disputed or used for validation | About 7–8 MB per session → about 150–250 MB kept at a time |
| Baseline, check and anchor audio | IndexedDB or OPFS | **Forever** (needed for re-scoring) | About 20 MB per check |
| Encrypted backups | Cloudflare R2 | Last 8 snapshots | Optional |
| Panel packs | R2, encrypted | 14 days | Optional; clips chosen one by one |

**Persistence**
- Install to the home screen. Home-screen apps have their own days-of-use counter and are exempt from Safari's 7-day eviction.
- Call `navigator.storage.persist()`.
- A monthly reminder to export a ZIP (JSON plus WAV) through the share sheet (Web Share with files).
- The optional encrypted backup runs automatically after each check.

**Privacy: what leaves the phone**
- Audio to Azure, for scoring only. Use an EU region, e.g. `francecentral` or `westeurope`. Whether Microsoft keeps real-time audio by default is *unverified*.
- Text-only Talk turns to Anthropic, if the LLM partner is enabled.
- Encrypted blobs to R2.
- Nothing else. No analytics SDK; practice metrics are computed on the phone.

### 4f. Hosting, HTTPS, access, secrets and cost

- **Hosting options (D2).**
  - Cloudflare (recommended): Pages for the app, Workers for the API, R2 for blobs. Automatic HTTPS on `*.pages.dev` or your own domain. The microphone needs HTTPS. The free tier covers this use.
  - Render paid: Node with a persistent disk.
  - Fly.io: Node with a volume.
- **Access (D3).** A one-time pairing code gives the phone a long random device token.
  - A passkey (WebAuthn) is a later option.
  - Cloudflare Access is an option, but its login redirects can be awkward inside an installed app (*unverified*).
  - CORS locked to the app's origin, a strict CSP, and rate limits.
- **Secrets.**
  - `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`, and `ANTHROPIC_API_KEY` (optional) are Worker secrets.
  - The local `.env` is used only by build scripts.
  - Rotate between Azure's two keys.
  - **A CI step fails the build** if `dist/` contains the variable name or any 32-character hex string.

| Monthly cost | Cheap / free path | Comfortable path |
|---|---|---|
| Azure speech: about 2–2.5 audio hours a month (about 4.4 min of scored audio per session, 20 sessions, plus French, checks and validation) | **F0: $0** (5 audio hours; 1 request at a time; whether prosody works on F0 is *unverified*) | S0: about $1.30 per hour (speech-to-text $1 plus about $0.30 assessment add-on, secondary sources) ≈ **$3–4**, plus prosody add-on (price *unverified*) |
| Azure TTS | One-off render inside the free 0.5M characters: **$0** | ≈ $5 once at $16 per million characters; Talk TTS about 20k characters a month ≈ $0.30 |
| Cloudflare | Free (Workers 100k requests a day; R2 10 GB; secondary sources): **$0** | Workers Paid ≈ $5 (*unverified*) |
| LLM partner (optional) | Off: $0 | About 300k input and 30k output tokens a month: Claude Opus 5 ≈ **$2.25**; Sonnet 5 ≈ $0.90; Haiku 4.5 ≈ $0.45 (your choice) |
| Domain | `*.pages.dev`: $0 | About $10–15 a year (*unverified*) |
| Apple (option B only) | — | $99 a year |
| **Total** | **$0–3 a month** | **About $10–15 a month** (+$99 a year with Capacitor on iOS) |

### 4g. Testing strategy (TDD)

| Layer | What | Tools | How audio and scoring are tested without live Azure |
|---|---|---|---|
| Domain (pure functions) | Session composer (time budget → stage plan), spacing queue, blocked→mixed rule, priority model (beta-binomial), feedback selector (1–2 rule, confidence gating, accepted variants), statistics (RCI, NAP), trust-ladder promotion and demotion | Vitest; fast-check (property-based tests) | No I/O. Red → Green → Refactor on each rule. |
| DSP | Resampler, WAV encoder, VAD, pitch, pause map, syllable prominence, band energy | Vitest + fast-check + golden files | **Synthetic signals:** sine sweeps with known pitch, silence and noise with known pause positions, clipped signals. **Recorded fixtures:** your voice plus TTS words with known correct and wrong stress. Assertions use tolerances (pitch within ±0.5 semitone; pause edges within ±30 ms). |
| Azure adapter | Request config, JSON parsing (en-US words, syllables, spoken phonemes, prosody; fr-FR shape), timeout and retry, token refresh, F0 serialisation | Vitest with **recorded JSON fixtures** captured in spike E0 | A `FakeScoringProvider` feeds fixtures. The SDK is stubbed behind an interface. v1 bugs become named tests. |
| Live contract (opt-in) | 10 real calls: en-US, fr-FR, TTS | `npm run test:live` (manual; never in default CI) | Also a monthly drift test on the reference clips |
| Storage | Dexie schema, migrations, retention, export/import round trip | fake-indexeddb | — |
| Worker | Pairing, token endpoint, rate limits, backup, panel | `@cloudflare/vitest-pool-workers` | Azure `issueToken` mocked with fetch mocks |
| UI | Cards, trials, flows | React Testing Library | Fake provider plus a fake clock |
| End to end | Full session on emulated phones | Playwright; Chromium with `--use-fake-device-for-media-stream --use-file-for-fake-audio-capture=fixture.wav` | A fixture WAV plays as the microphone. Whether WebKit can fake mic input is *unverified*, so there is a **manual real-phone checklist** per release (iPhone and Android). |
| Content | Schema, stress consistency, held-out overlap, variety tags, licences | Vitest over the content files | Runs in CI |

**Pre-commit rules (from CLAUDE.md):** build, lint with zero warnings, all tests, docs updated in the same change, and the key-leak check.

### 4h. What happens to v1 code

- Tag `v1-final`, push branch `archive/v1`, and then remove v1 from `main` in one commit: "chore: archive v1". Write an ADR explaining why.
- **Removed from main:**
  - the Express server;
  - the open TTS proxy;
  - `render.yaml` (its free tier loses data on restart);
  - speed ladders;
  - the "weak phoneme" engine;
  - the content packs;
  - the v1 recorder.
- **Kept or reused:**
  - the WAV encoder idea, rewritten test-first;
  - test scaffolding patterns;
  - docs and backlog conventions (status icons, `F{n}-T{NN}` naming, adapted to the new epics);
  - the CLAUDE.md working style;
  - correct v1 content items, after review. The nasal-vowel examples were swapped and several items were mis-tagged.
- **Docs to rewrite:** `prd.md`, `product-design.md`, `technical-design.md`, `api-reference.md`, `database-schema.md`, and a new backlog with the epics below.

---

## 5. Build roadmap

Effort for a solo developer with AI agents: **S** = 1–3 focused days, **M** = 1–2 weeks, **L** = 3 weeks or more.

| Order | Epic | Goal | Main tasks | Effort | Shippable result |
|---|---|---|---|---|---|
| 0 | **E0 Decide and test on your phone** | Settle D1–D7 on evidence from *your* phones | ADRs; **Spike A:** PWA capture → WAV → token → SDK push stream → assessment on your iPhone and/or Android, with 50 attempts to measure latency and permission behaviour; **Spike B:** record Azure JSON fixtures (en-US syllables, spoken phonemes, prosody; fr-FR shape); **Spike C:** check wrong-stress TTS foils by ear | S–M | Decisions + fixtures. **Go/no-go for option A.** |
| 1 | **E1 Clean foundation** | A deployable empty app | Archive v1; repo layout (`app/`, `worker/`, `content/`, `tools/`, `docs/`); TypeScript strict, ESLint, Vitest, Playwright, CI; Cloudflare deploy with HTTPS; pairing; token endpoint; key-leak check; installable PWA shell | M | Installable app on the phone |
| 2 | **E2 Audio core** | Reliable capture on both platforms | Worklet, resampler, WAV, level meter, VAD auto-stop, quality gate, session-long mic, page-hide handling, audio session, wake lock; pitch and pause features in the DSP worker; fixtures | M | Record and play back with instant signals |
| 3 | **E3 First slice: "Stress Starter"** | Real practice starts, and validation data starts to build up | Onboarding (goal, weekly target, if-then plan, calendar reminder); **baseline capture** (English speaking + listening screener, raw audio stored); stress content v0 (150 words, 4 training + 2 test voices); Hear (stress shapes, with feedback); Say (record, self-check, compare with model; Azure scoring runs in Shadow and is logged); one Use retell (self-listen only); Wrap; weekly dots; ZIP export | M–L | **First shippable slice** (details below) |
| 4 | **E4 Feedback engine and validation** | Trustworthy corrections | Detector framework, confidence, trust ladder, correction cards, dispute and review, accepted variants; stress model v1; validation dashboard; import of human labels; run V3–V4 (section 6), then promote the stress detector | M | Stress corrections switched on once V4 passes |
| 5 | **E5 Scheduler and composer** | 5/10/15 sessions with spacing | Session builders, +1/3/7/14 queue, blocked→mixed rule, backlog cap, comeback session, dose accounting | M | Full daily program for the stress thread |
| 6 | **E7 Progress Checks and Then & Now** | Honest progress (must exist before week 4) | Check flow A/B, parallel forms, re-scoring with the current model, beta-binomial ranges, RCI, NAP, Progress and Targets screens, Then & Now; listener-panel pack (optional, +S–M) | M | Check 1 at week 4 |
| 7 | **E6 Sound thread** | /h/ and the vowel pairs | Content and voice validation; HVPT sets; spoken-phoneme and two-reference detectors; V5 | L | The sound thread joins the program |
| 8 | **E9 Habit layer** | Practice over 12 weeks | Weekly review, optional web push, missions, pause mode, explainer | S–M | — |
| 9 | **E8 Use and Talk** | Transfer into speech | Shrinking-time rounds, recycling detection, fluency measures (V6), sentence-stress dialogues, scripted role-plays; optional LLM partner (+L) | M (+L) | Full Use stage |
| 10 | **E10 Français clair** | Second goal | Pairs, cues, noisy café (ASR with added noise, calibrated in V7), retell drop, vowel probes (Shadow), French check | M–L | French sessions |
| 11 | **E11 Data safety and drift** | Nothing lost, nothing drifts | Encrypted backup and restore, retention jobs, monthly re-score of reference clips, storage monitor | S–M | — |

**First shippable slice (after E0–E3): "Stress Starter".** The learner installs the app on their phone and completes the two baseline sittings. From then on they can do real 5- or 10-minute sessions:
- stress-shape listening with 4 voices and instant feedback;
- speaking stress words with a self-check and a "compare with model" player;
- one retell to listen back to;
- a weekly target with a reminder;
- a ZIP export.

Azure scores are captured silently in Shadow mode. This builds the labelled data that validation needs. The design principle is **use first, trust later**. The listening half already rests on the strongest evidence (HVPT *[Strong]*). The baseline exists before any training.

*Order note:* French comes after the English core because it is the second goal. If you want French sooner, E10 can move before E8.

---

## 6. Risks, unknowns and validation plan

### Risks

| # | Risk | Impact | Mitigation |
|---|---|---|---|
| R1 | iOS web-app audio: repeated permission prompts, quiet or rerouted playback while the mic is open, silent switch, interruptions | Friction; people quit | Spike A on your phone; one stream per session; audio-session hint; half-duplex. **Fallback: option B (Capacitor).** |
| R2 | Azure JS SDK push-stream assessment misbehaves on iOS Safari (*unverified*) | No speaking feedback | Fallback D: WAV to the Worker, then the REST short-audio API (≤ 30 s) |
| R3 | Stress detector not valid for this learner | Wrong corrections; trust lost | Trust ladder; validation V4; fall back to self-check with model comparison |
| R4 | Azure take-to-take noise on this phone is large | False "progress" | Anchor sets; RCI; pooling; checks only |
| R5 | Azure model updates (en-US and fr-FR changed Aug 2026) | Fake changes | Store dates; re-score old check audio; monthly reference re-score |
| R6 | fr-FR output lacks usable phoneme timing or mapping (*unverified*) | Weaker French vowel measures | Rely on phone measures; SpeechSuper pilot on 40–60 items |
| R7 | TTS voices blur contrasts; foils sound odd | Training on bad input | Automatic checks plus native-listener identification ≥ 90% per voice |
| R8 | Motivation fades (about 43% dropout within 3 months, secondary figure) | No dose | 5-minute sessions, comebacks, weekly review, early wins, plan cues |
| R9 | Practice statistics mistaken for progress | Wrong decisions | Separate Practice and Progress areas; wording rules |
| R10 | Privacy of voice data | Trust | Phone-first data, EU region, encrypted backups and panel packs |
| R11 | Evidence gaps: English stress training for French speakers, and whether clear-speech practice lasts, are untested | Program may not work | Multiple-baseline design; decision rules at checks (2.4); honest claims |
| R12 | Cost or key abuse | Money | Pairing, rate limits, F0 hard cap, CI key-leak check |

### Validation plan (on THIS learner's voice and phone, before trusting any number)

| Step | When | Protocol | Pass criterion (heuristic) | If it fails |
|---|---|---|---|---|
| V1 Device audio | E0 | Record 20 s of room noise and 10 sentences in a quiet and a typical noisy place, with mic processing on and off, on 2 days. Compare the phone's pitch track with Praat run offline on the same WAV. | Pitch within ±1 semitone on ≥ 90% of voiced frames; no clipping at normal voice | Change mic settings; recommend a quieter spot or wired earbuds; option B |
| V2 Latency | E0 | 50 short attempts over mobile data and Wi-Fi | End of speech → card: median ≤ 2.5 s, 90th percentile ≤ 5 s | Push audio while the learner speaks; show instant signals only; fallback D |
| V3 Azure repeatability | E0 and every check | Anchor set ×2 takes ×3 days | Gives the per-measure RCI thresholds (always passes; it is a measurement) | — |
| V4 Stress detector | E4 (after about 200 attempts) | (a) TTS right and wrong versions from 6 voices × 50 words; (b) 200 of your attempts, labelled blind by 1–2 native or expert listeners, plus your own labels (known to be biased) | (a) ≥ 95% correct. (b) Precision of "wrong stress" ≥ 0.8 at the chosen threshold, and kappa ≥ 0.6 (kappa is an agreement measure corrected for chance; experts agree at about .60 on sound errors, Brief §3.7). | Stay at the self-check step; retune; raise the threshold |
| V5 Vowel and /h/ detectors | E6 | 40 items per contrast in which you *deliberately* say each member, plus natural attempts, with human labels | Same as V4 | Hint only |
| V6 Fluency measures | E8 | 20–30 free-speech clips hand-labelled for pauses and clause boundaries | Pause edges ±50 ms; inside-vs-between clause label ≥ 80% agreement | Report pause rate only |
| V7 French measures | E10 | 10 sentences, habitual and clear, on 3 days. For the noise check, choose a noise level at which habitual speech gets about 60–80% of words; compare with one human transcriber on 20 sentences. | Clear-vs-habitual differences exceed day-to-day variation; ASR agrees with the human on direction | Show playback comparison only |
| V8 Content | Before each content pack | Native listener identifies voice contrasts; foils judged wrong | ≥ 90% | Drop the voice or item |
| V9 Scorer drift | Monthly | Re-score 20 reference clips | Shift below the RCI | Mark the model change; re-score check audio |
| V10 Listener panel | Weeks 0 and 12 (optional) | 3–5 listeners, blind and shuffled | — (gold standard) | — |

**Open questions carried forward:** Add. §7 Q1, Q2, Q6–Q11, Q16; Brief §8. Answers go into ADRs as they arrive.

---

## 7. Evidence map

| Feature | Evidence | Strength | Notes |
|---|---|---|---|
| Intelligibility as the goal; Azure accuracy secondary | Brief §1, §2 #1; Add. §5.1 | Strong / Moderate | Headline measures come from checks |
| Progress Checks on unseen items, free speech, delayed probes | Brief §2 #2, §7 cap. 1 | Strong (the gap); Moderate (the design) | Parallel forms; re-scoring |
| Hear stage (HVPT, 4 training + 2 test voices, natural recordings in tests) | Brief §3.1, §2 #3; Add. §2 notes | Strong (listening); Moderate (speaking); Mixed (number of voices) | Flag gains on TTS items only |
| Pick-the-word task with labels | Brief §3.1 (Carlet & Cebrian) | Moderate | — |
| Listening and speaking in separate stages | Brief §3.1, §4 | Weak (lab listeners) | — |
| Stress thread first and throughout | Add. §2 rank 1, §5.3 | Moderate (priority); Weak (training) | About 3.6 h of dose |
| Hard stress tasks (many voices, sequences) | Add. §2 notes (Dupoux) | Moderate | Also used in the screener |
| Show and quiz stress patterns | Add. §2 notes (Tremblay 2008) | Moderate | Dots hidden on reviews |
| Stress feedback from own length, pitch and reduction analysis | Add. §2 rank 1, §4.2; Brief §3.3 | Weak / Unverified | Trust ladder; V4 |
| /h/ module, dropped and added tracked separately | Add. §2 rank 3, §5.6 | Moderate (one study) | Never rewards adding /h/ |
| Vowel pairs, naming the vowel heard | Add. §2 rank 2, §5.5 | Moderate | 8 sessions per pair is a guess |
| Correction card, retry, prompt first then model | Brief §3.2, §2 #5 | Moderate; Mixed (prompts); Weak (1–2 limit) | — |
| One-sentence cue and mouth picture | Brief §3.2; Add. §5.14 | Mixed / Weak | Short |
| Sampled self-checks | Brief §3.6, §3.2 | Moderate (bias); Weak (sampling) | 1 in 4 trials |
| Dispute button, confidence gating, cautious wording | Brief §2 #10, §3.7, §7 cap. 5 | Strong (noise is real); heuristic design | Disputes feed validation |
| Use stage: retell ×3 with shrinking time, new prompt next session | Brief §3.4, §2 #8 | Moderate | Recycling detection |
| Targets inside meaningful tasks | Brief §2 #13 | Weak–Moderate | Feedback on targets only |
| Fluency measures (rate, pauses inside clauses, run length) | Brief §3.4 | Moderate | Pause habits partly carry over from the first language |
| No speed rewards | Brief §3.4, §4 | Weak–Moderate | — |
| Sentence-stress dialogues | Brief §3.3 (Hahn 2004), §7 cap. 7 | Moderate (correlational) | Detector starts in Shadow |
| Weak forms mainly for listening | Brief §5.1; Add. §2 rank 5 | Mixed | — |
| Spoken guided Talk; LLM never scores | Brief §3.4 (Bibauw 2022), §3.7 | Moderate (dialogue systems); Weak (LLM) | Spoken only |
| Spacing +1/3/7/14 | Add. §5.8; Brief §3.5 | Moderate / Strong (general); Weak (pronunciation) | Not adaptive |
| Blocked, then mixed | Brief §3.5 | Mixed | 80% rule is a heuristic |
| 10-min default, complete 5-min version, ≥ 4/week, 12-week cycles | Add. §4.1, §5.7; Brief §3.5 | Weak–Moderate | — |
| Weekly target, if-then plan, no streaks, comeback | Brief §3.6, §2 #11; Add. §4.1 | Moderate (if-then, non-language); Weak | — |
| Then & Now recordings | Brief §2 #11, §7 cap. 11 | Weak–Moderate | — |
| Priority = functional load × error × frequency; minimum tokens | Brief §2 #6, #10, §7 cap. 3 | Moderate (English); Weak (thresholds) | Weights stored as data |
| RCI, NAP, multiple baseline across targets | Brief §3.7 | Moderate | ≥ 3 targets |
| Listener panel, blind and shuffled, message known | Brief §3.7, §7 cap. 1 | Moderate | Optional |
| Machine listener (ASR) as a lenient check | Add. §5.12; Brief §3.7 | Moderate / Mixed | Never a pronunciation score |
| Diagnose first (baseline, screener, level check) | Brief §2 #9, §7 cap. 2 | Moderate | Two sittings |
| FR paired habitual vs clear | Add. §3.3 #1; Brief §2 #12 | Moderate | — |
| FR concrete cues and a named listener | Add. §3.2, §3.3 #2 | Moderate | — |
| FR clear at natural speed | Add. §3.3 #3 | Weak | — |
| FR noisy-café partner | Add. §3.3 #4; Brief §5.3 (Buz) | Moderate (immediate); lasting effect untested | Volume capped |
| FR retell drop | Add. §3.3 #5 | Weak | — |
| FR several measures against own baseline, no clarity score | Add. §3.4 | Mixed | — |
| FR vowel probes | Add. §3.3 #6 | Moderate / Mixed | Shadow until V7 |
| Uncompressed 16 kHz capture and quality gate | Add. §4.2, §5.2 | Strong / Moderate | — |
| Mic opened once per session; stop on page hide | Add. §4.2 | Moderate / Weak | — |
| Instant phone signals; cloud result within 2–3 s | Add. §5.10 | Weak (time targets) | V2 |
| Store scorer date and device; re-score references | Add. §5.11; Brief §3.7 | Strong (model changes) | — |
| Azure en-US for syllables and spoken phonemes; fr-FR limited | Brief §3.7 table; Add. §4.2 | Strong | Checked on the web (App. A) |
| Left out: speed ladders, tongue twisters, mouth exercises | Brief §4; Add. §6 | No evidence | — |
| Left out: rhythm scores as targets | Brief §3.3; Add. §2 notes | Moderate / Mixed | — |
| Pitch display only as experimental "Details" | Brief §2 #14 | Weak | — |

---

## Appendix A: Technical facts checked on the web (24 Sep 2026)

1. **Azure Speech JS SDK 1.51.0** (npm, 21 Jul 2026). Its type definitions include:
   - `SpeechConfig.fromAuthorizationToken`;
   - `AudioInputStream.createPushStream`;
   - `AudioStreamFormat.getWaveFormatPCM`;
   - `PronunciationAssessmentConfig` with `enableProsodyAssessment`, `nbestPhonemeCount` and `phonemeAlphabet`.

   The browser bundle is about 378 KB minified.
2. **Tokens.** Tokens from `issueToken` last about 10 minutes. The recommended browser flow issues them from a backend. ([MS Q&A](https://learn.microsoft.com/en-us/answers/questions/5552241/how-to-securely-use-azure-speech-services-in-spa-a); [SpeechConfig](https://learn.microsoft.com/en-us/javascript/api/microsoft-cognitiveservices-speech-sdk/speechconfig?view=azure-node-latest))
3. **Pronunciation assessment documentation.** ([source](https://raw.githubusercontent.com/MicrosoftDocs/azure-ai-docs/main/articles/ai-services/speech-service/how-to-pronunciation-assessment.md))
   - Streaming through the SDK has no length limit. Audio over 30 s needs continuous mode, which has no miscue detection.
   - Prosody, syllable groups, spoken phonemes and IPA phoneme names are **en-US only**.
   - Syllables and phonemes carry start time (Offset) and Duration.
   - Unscripted mode uses a different speech-to-text model. Microsoft recommends running speech-to-text first, then a scripted assessment.
   - Word error types include UnexpectedBreak, MissingBreak and Monotone. The suggested break threshold is 0.75.
4. **Pricing.** Assessment costs the same as speech-to-text; prosody is an add-on. ([source](https://raw.githubusercontent.com/MicrosoftDocs/azure-ai-docs/main/articles/ai-services/speech-service/pronunciation-assessment-tool.md)) Secondary sources give:
   - speech-to-text $1 per hour, plus about $0.30 per hour for the assessment add-on;
   - F0: 5 audio hours a month and 0.5M neural TTS characters;
   - neural TTS $16 per million characters. ([example](https://texttolab.com/blog/azure-text-to-speech-pricing))
5. **F0 limit.** The F0 tier allows **1 concurrent speech-to-text request**, and this cannot be changed. ([quotas](https://raw.githubusercontent.com/MicrosoftDocs/azure-ai-docs/main/articles/ai-services/speech-service/speech-services-quotas-and-limits.md))
6. **TTS voices.** Standard neural voices: en-US 31, en-GB 14, en-AU 14, fr-FR 14, fr-CA 4. These voices support the SSML phoneme element. IPA with stress marks works (the "tə.ˈmeɪ.toʊ" example). ([voices](https://raw.githubusercontent.com/MicrosoftDocs/azure-ai-docs/main/articles/ai-services/speech-service/includes/language-support/tts.md); [SSML](https://raw.githubusercontent.com/MicrosoftDocs/azure-ai-docs/main/articles/ai-services/speech-service/speech-synthesis-markup-pronunciation.md))
7. **Browser support** (MDN browser-compat-data; iOS mirrors Safari unless noted). ([BCD](https://github.com/mdn/browser-compat-data))

   | Feature | Safari / iOS | Chrome Android |
   |---|---|---|
   | AudioWorklet | Safari 14.1 | — |
   | AudioContext `sampleRate` option | Safari 14.1 | — |
   | Audio Session API | Safari 16.4 | — |
   | `storage.persist()` | Safari 15.2 | — |
   | OPFS | Safari 15.2 | 109 |
   | Push API | iOS 16.4 | — |
   | Wake Lock | iOS 18.4 | — |
   | Web Share with files | Safari 14 | 76 |
   | MediaRecorder | Safari 14.1 | — |

8. **WebKit storage policy.** Home-screen web apps have their own days-of-use counter and are exempt from the 7-day eviction. Persistent mode is exempt from eviction. ([WebKit](https://webkit.org/blog/14403/updates-to-storage-policy/))
9. **WebKit bug 215884** (repeated getUserMedia prompts in home-screen apps when the URL changes) is marked "RESOLVED, CONFIGURATION CHANGED" (Feb 2026). ([bug](https://bugs.webkit.org/show_bug.cgi?id=215884))
10. **Cloudflare free tier:** Workers 100k requests a day; R2 10 GB. Secondary sources. ([example](https://dev.to/nayankyada/cloudflare-r2-pricing-2026-free-tier-limits-egress-costs-when-to-upgrade-52ph))
11. **SpeechSuper French:** word, sentence and paragraph scoring with phoneme-level scores, fluency and rhythm. Pricing is not public. ([demo](https://www.speechsuper.com/demo/french/index.html))
12. **Lingua Libre:** CC BY-SA 4.0, more than 1.4M recordings, with English and French categories. ([Wikipedia](https://en.wikipedia.org/wiki/Lingua_Libre))
13. **Chromium fake microphone for tests:** `--use-fake-device-for-media-stream --use-file-for-fake-audio-capture`. ([example](https://maddevs.io/writeups/testing-web-apps-with-speech-and-image-recognition/))
14. **Apple:** the developer program costs $99 a year; free signing expires after 7 days. ([Apple](https://developer.apple.com/support/compare-memberships/))
15. **npm packages** exist at these versions: pitchy 4.1.0, dexie 4.4.6, vite-plugin-pwa 1.3.0, fake-indexeddb 6.2.5, @cloudflare/vitest-pool-workers 0.22.0, hono 4.13.9, @capacitor/core 8.5.2, fast-check 4.10.2.
16. **Claude API list prices** (per million input / output tokens): Opus 5 $5 / $25; Sonnet 5 $2 / $10; Haiku 4.5 $1 / $5. Source: Anthropic's API reference, as cached on 24 June 2026.

## Appendix B: Unverified claims (check before relying on them)

**Audio on the phone**
- Azure SDK push-stream assessment working in iOS Safari as an installed home-screen app.
- Real latency numbers.
- Output routing, ducking and silent-switch behaviour on iOS with the mic open.
- Whether iOS obeys `echoCancellation`, `noiseSuppression` and `autoGainControl` set to false.
- Loss of quality with Bluetooth headset mics.

**Azure**
- Whether fr-FR returns phoneme-level timing that maps to our lexicon.
- Prosody availability on F0, and the price of the prosody add-on.
- Whether TTS billing counts SSML characters.
- Microsoft's retention of real-time audio.

**Cloudflare and other costs**
- Workers Paid at $5.
- Pages file-count limits.
- Cold-start behaviour.
- Cron triggers on the free plan.
- Domain prices.

**Measurement choices**
- The 250 ms pause threshold as a standard.
- The achievable accuracy of the stress detector.

**Other**
- Licences for CMUdict and the frequency lists.
- Cloudflare Access behaviour inside an installed app.