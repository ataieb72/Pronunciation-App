# Pronunciation Coach v2: design options

**Date:** 24 September 2026
**Status:** Ready for your decision. Nothing in this document has been built yet. A red-team review checked it on 24 September 2026.
**What you decide:** which option to build, and the choices in section 8. After that, we build the app step by step with TDD (test-driven development: Red → Green → Refactor). Each code change updates the docs it affects.

**Inputs**
- `docs/research/evidence-brief.md`, cited as "Brief".
- `docs/research/learner-profile-addendum.md`, cited as "Add.".
- Four independent designs: "evidence-max", "lean-mvp", "measurement" and "learner-ux".
- Three judge reviews of those four designs.
- Web checks of technical facts (Appendix A).

---

## How to read this document

- **Evidence labels** come from the two research files: [Strong], [Moderate], [Weak], [Mixed], [No evidence], [None found], [Unverified], [Not searched].
  - "Brief §3.1 [Strong]" means section 3.1 of the brief, with its label.
  - "Add. §2 r1" means addendum section 2, rank 1.
  - "Brief §7 cap. 4" means ranked capability 4 in Brief §7.
- **Working rules.** A number such as "80%" or "15 instances" is a working rule (a heuristic), unless a label says otherwise.
- **Technical facts** carry one of these tags:
  - **(checked)**: I checked it on 24 September 2026 against official documentation, source code or the published package.
  - **(checked by review)**: a judge checked it on 24 September 2026. I could not reopen the source.
  - **(secondary)**: only secondary sources support it, because the official page could not be reached.
  - **(unverified)**: nobody has checked it. We test it before we rely on it.
- **Build weeks** are full-time weeks of about 5 working days, for you working with AI coding agents. Part-time work stretches them. All build times are estimates.

### Terms used

| Term | Meaning in this document |
|---|---|
| Intelligibility | How many of your words a listener gets right, for example when the listener writes down what you said. |
| Comprehensibility | How easy a listener finds you to understand, rated on a 1–9 scale. |
| Prosody | The timing, loudness and pitch patterns of speech: stress, rhythm, intonation and pauses. |
| Word stress | Making one syllable of a word stronger than the others, as in PHOto and phoTOgraphy. |
| Schwa, weak forms | Schwa is the short, relaxed "uh" vowel of unstressed syllables. Weak forms are reduced small words, such as "to" said as "tuh". |
| Liaison | In French, a normally silent final consonant said before a vowel, as in *les‿amis*. Some liaisons are optional. |
| Formants | Resonances of the mouth that make one vowel sound different from another. Software measures them to judge vowel quality. |
| Minimal pair | Two words that differ in one sound, such as ship/sheep. |
| IPA | The International Phonetic Alphabet: standard symbols for speech sounds, such as /ɪ/ in "ship". |
| HVPT | High-variability phonetic training. This is listening practice: you hear a word in one of several voices, pick the word you heard, and get instant right or wrong feedback. |
| Held-out item | A word, sentence, prompt or voice that practice never uses. Tests use held-out items to check transfer. |
| Transfer | A gain that also shows on new words, in new voices and in free speech. |
| Progress Check | A separate test session every 4 weeks. It gives no feedback. |
| Delayed probe | A test of a target 2–4 weeks after its training ended. |
| Anchor sentences | 10 fixed sentences you record twice at every Check. They show how much scores vary when nothing has changed. |
| ASR | Automatic speech recognition: software that turns speech into text. |
| TTS | Text-to-speech: synthetic voices. |
| LLM | Large language model: AI software, such as a chatbot, that works with text. An audio LLM also takes sound as input. |
| Azure Speech | Microsoft's cloud speech service. Its "pronunciation assessment" scores your speech against a reference text. |
| F0, S0 | Azure's free tier (F0) and its pay-as-you-go tier (S0). In this document, F0 never means pitch. |
| Spoken phoneme | An Azure output that names the sound you most likely said instead of the target. It exists for US English (en-US) only. |
| SDK | Software development kit. Here it means Microsoft's code library for calling Azure. |
| Access token | A pass that lets the phone call Azure for 10 minutes. A small server makes it from the secret key, so the key never reaches the phone. |
| PWA | Progressive web app: a website that you install on the home screen. It opens like an app and can work offline. |
| Capacitor | A tool that puts the same web code inside a native iPhone or Android app shell. |
| Worker | A Cloudflare Worker: a small function that runs in Cloudflare's cloud only when it is called. You have no server to keep running. |
| Web Worker | A background thread inside the browser. The app uses one for audio processing. It is not a Cloudflare Worker. |
| VPS | Virtual private server: a rented computer in a data centre. You keep it running and install its security updates. |
| IndexedDB | The browser's built-in database, stored on the phone. |
| AudioWorklet | A browser feature that processes audio as it arrives. It lets the app record uncompressed audio. |
| DSP | Digital signal processing: the app's own sound measures, such as pitch, pauses and loudness. |
| VAD | Voice activity detection: finding where speech starts and stops. |
| SNR | Signal-to-noise ratio: how much louder your voice is than the background, in decibels (dB). |
| Quality gate | Checks that run on each recording (too quiet, clipped, noisy, too short) before anything is scored. |
| Scoring era | A period in which the scorer did not change: the same Azure model, SDK version and phone. The app never compares scores from different eras directly. |
| SEM, RCI | SEM (standard error of measurement) is the typical size of random error in a score. RCI (reliable change index) tests whether a change is larger than that error. |
| Kappa (κ) | A measure of agreement that corrects for chance. 1 means perfect agreement and 0 means chance. Expert listeners agree at about κ = .60 on single-sound errors (Brief §3.7). |
| Precision | Of all the errors the app flags, the share that are real errors. |
| Multiple baseline | A design for testing one learner. Targets start training at different times. If each target improves only after its own training starts, the training probably caused the change. |
| Beta-binomial estimate | A method that turns counts of right and wrong into a likely range. With few scored instances, the range stays wide. |
| Scored instance | One scored example of a target sound or pattern. The research files call it a "token". |
| Slice | A small, working version of the app that you can use for real practice. |

---

## 1. Summary

You are choosing three things:
- how much to build before you start using the app;
- where scoring runs;
- where your recordings live.

There are three options. Each one can work.

- **Option A: Lean English core.**
  - It is the smallest phone app that delivers the best-supported English training.
  - French training waits until a Progress Check shows that the English core works. The app still records your French baseline in week 0.
  - All data stays on your phone.
  - Cost: about $0 a month on free tiers, or about $3–6 on Azure's paid tier (secondary prices).
  - Build time: about 9–12 build weeks until it is complete.
- **Option B: Full phone coaching program (recommended).**
  - It uses the same technical base as Option A.
  - It adds French clarity sessions in cycle 1, from about practice week 6–10. Decision D14 can start them earlier.
  - It adds three trust levels for machine verdicts, automatic encrypted backup, a listener-panel link and a full 12-week program.
  - Cost: about $0–1 a month on free tiers, or about $3–8 on Azure's paid tier (secondary prices).
  - First practice comes as early as in Option A. The full program takes about 16–22 build weeks.
- **Option C: Server measurement lab.**
  - A Python server scores and stores every recording. It adds research-grade acoustic tools.
  - It keeps the most complete record of your data. It is also the hardest to build and to run.
  - Cost: about €12–18 a month.
  - First speaking feedback comes after about 8–10 build weeks.

**Recommendation: Option B, built in the order of Option A.** The first two slices of both options are the same, so Option B does not delay your first practice. If Option B grows too large, you can stop at Option A's scope at any Progress Check and lose no work. Section 5 gives the reasons.

**Do these now, whichever option you choose:**
1. Shut down the v1 service on Render and create a new Azure key. v1 runs an open TTS proxy, which lets anyone spend on your key.
2. Tell me your phone model and its iOS or Android version.
3. Answer the decisions in section 8.

---

## 2. Common core: what every option includes

The evidence supports everything in this section, so every option has it. The options differ only in scope, in where scoring runs, and in where data lives.

### 2.1 Goals

| # | Goal | Evidence |
|---|---|---|
| G1 | **English:** be easily understood by international listeners in *unscripted* speech. The targets are intelligibility and comprehensibility, not a native accent. | Brief §1, §2 #1 [Strong]; Add. §5.1 [Moderate] |
| G2 | **French:** switch into clear speech on demand, at your normal speed, and keep it through a 60–90-second retell. This is diction work, not accent work. | Add. §3.2 [Moderate for producing clear speech on demand]; Add. §3.3 #3, #5 [Weak for keeping it at normal speed and through a retell]; Add. §3.2 [None found for lasting carry-over] |
| G3 | **Habit:** at least 4 sessions a week in most weeks of a cycle. | Add. §4.1 [Weak: these figures predict staying with an app, not learning] |

These are not goals: a native accent, and high practice scores.

### 2.2 Measurement rules

1. **Practice scores are not progress.** The Progress screen uses only Progress Check data. Brief §2 #2 [Strong for the gap between practice and transfer; Moderate for the exact design]. Brief §3.5, Soderstrom & Bjork [Moderate].
2. **A Progress Check runs every 4 weeks.** It uses:
   - held-out words;
   - test-only voices and natural human recordings;
   - new speaking prompts;
   - a delayed probe 2–4 weeks after each training block ends.

   Brief §7 cap. 1.
3. **Machine scores are noisy.**
   - On an English benchmark (Mandarin speakers, half of them children), open scoring models agreed with experts at r ≈ .61–.68 for single sounds. For word stress they agreed at only r ≈ .15–.33, partly because the benchmark's stress labels are coarse.
   - On the same benchmark, Azure's overall score matched about one expert (r = .78).
   - The research team found no test–retest data for Azure, and no validation of Azure for French. (Brief §3.7 [Moderate])

   So the app does five things:
   - It pools 15–20 scored instances, from at least 5 different words, over at least 3 sessions, before it calls a target weak. Brief §2 #10 [Weak heuristic].
   - It shows ranges, not single points.
   - It measures your own noise with the anchor sentences.
   - It stores the provider, model date, SDK version and phone with every score.
   - It re-scores stored Check audio whenever the scorer changes. Microsoft updated its en-US and fr-FR assessment models in August 2026 (checked).
4. **Only first attempts count** toward error estimates.
   - An attempt made just after hearing the model is imitation. The app stores it but leaves it out of the estimates.
   - A correct retry made without the model is a self-correction. The app logs it as a separate sign of progress. It does not enter the error estimate. Treating it as stronger evidence of learning is a design inference from Brief §3.2.
5. **Human listeners are the final judge, when you have them.** The protocol:
   - For **comprehensibility** (1–9 ratings), listeners see the intended message. In one study of L2 French, raters who did not know the message rated speech as easier to understand (Brief §3.7, De Fino, a conference paper [Moderate]; Brief §4).
   - For **intelligibility**, listeners write down unpredictable sentences without seeing the text.
   - The app mixes old and new clips, shuffles them and removes their dates. It adds fixed reference clips, plus about 10% repeated clips to check each listener's consistency.
   - The panel is 3–5 trained listeners or about 10 untrained ones (Brief §3.7, §7 cap. 1 [Moderate]). Friends with a short briefing count as untrained.
6. **You write the success criteria down before training starts.** Set your expectations to match the evidence:
   - Gains are largest in drills, smaller on held-out words, and smallest in free speech (Brief §1, §3.2 [Strong]).
   - The research team found no controlled study showing that a self-study app improves how listeners rate the comprehensibility of free speech (Brief §8).
   - So a flat panel result at week 12 is plausible. It is useful information, not a failure of the app.
7. **Decision gates at each Check, with adherence first.** If you average fewer than 3 sessions a week, we fix friction (a shorter default session, a new cue time, fewer taps) before we add any module.

### 2.3 English content, in priority order

1. **Word stress** runs in every session, all cycle long. The addendum estimates that about 4 hours in total are needed (Add. §4.1). The default session plan gives about 2 hours in a 12-week cycle (section 6.3). Decision D8 lets you double that. Add. §2 r1, §4.1, §5.3 [Moderate as a priority; Weak for the training method].
2. **Vowel pairs** that French lacks: /iː–ɪ/ (sheep/ship), /uː–ʊ/ (pool/pull) and /æ–ʌ–ɑ/ (cat/cut/cot). Add. §2 r2 [Moderate].
   - The addendum's third example word, "cart", becomes "cot", because "cart" has an /r/ in the US English that Azure scores against.
3. **/h/**, with "Is this a real word?" decisions. The app tracks dropped /h/ and added /h/ as separate errors, so the drill never rewards adding /h/. Add. §2 r3 [Moderate; one study]; Add. §6.
4. **Fluency in free speech**, through retelling tasks (Brief §3.4 [Moderate]; Add. §2 r4 [Moderate]).

**Monitored only.** Every Check probes these targets. The app trains one only if your data show a need.
- **Consonants dropped from clusters.** Brief §5.1 ranks keeping consonants in clusters at the start and middle of words first for international listeners [Moderate; correlational; not specific to French speakers]. The addendum ranks word-final clusters last, but only because nobody searched for French-specific evidence (Add. §2 r7 [Not searched]). So this is a judgement call. The probes cover initial, medial and final clusters, and your data decide.
- /θ ð/: Add. §2 r7 [Not searched]; Brief §5.1 gives it low priority.
- Question intonation: Add. §2 r6 [Unverified].

### 2.4 French clarity content

- **Paired recordings.** You say the same item your usual way, then clearly.
  - Each item has one concrete cue, such as "Over-enunciate", "Open your jaw more" or "Finish every final consonant".
  - Each item names a listener, such as "a colleague on a bad phone line".
  - The app names the features you did *not* change and targets them.
  - Add. §3.3 #1–2 [Moderate for the pairing, the "over-enunciate" cue and a named listener; the mouth cues are untested]; Brief §5.3 [Moderate].
  - Not every talker gains. In one database, only about 23 of 41 talkers gave listeners a significant benefit (Add. §3.2 [Moderate]).
- **Clear at your normal speed.** From week 4 of the French track, a clear take counts only if its rate is within ±10% of your usual rate. The ±10% band is a working rule. Add. §3.3 #3 [Weak].
- **Several measures**, each compared only with your own baseline on the same phone. There is never a single "clarity score". Add. §3.4 [Mixed].
- **Azure fr-FR accuracy** is stored but never used as a goal. fr-FR returns no phoneme names (Brief §3.7 [Strong]). A native speaker also scores near the top anyway, which leaves no room to show gains (Brief §5.3; reasoned, not tested).
- **French baseline.** Every option records your French baseline in week 0.

### 2.5 Training methods

- **Listening practice (HVPT)** for every sound target.
  - You identify the word you heard. Word labels are on screen and feedback is instant.
  - Practice uses 4 training voices. Tests use 1–2 test-only voices plus natural human recordings.
  - Brief §3.1 [Strong for listening; Moderate for speaking; Mixed on the number of voices].
- **Separate stages.** Listening and speaking run in separate stages. On a new contrast, you never "hear it, then repeat it" on every trial. Brief §3.1, Baese-Berk & Samuel [Weak; lab listeners].
- **Blocked, then mixed.** A new contrast is practised on its own until listening accuracy is at least 80% in 2 sessions in a row. Then it is mixed with other contrasts. Brief §3.5 [Mixed]; the 80% cut-off is a heuristic.
- **Dose is counted in trials and attempts,** not in minutes or sessions. Brief §3.5 [Weak].
  - The plan gives about 45–50 minutes of listening (about 560 trials) per 4-week sound block (section 6.3).
  - Across blocks A and C, the three vowel pairs get about 1.5 hours. The studies that gave lasting gains used 1–7 hours in total for a whole set of vowels (Brief §3.1 [Moderate]). So the plan is inside that range, at its low end. It is also near the bottom of the brief's planning figure of 8–15 sessions of 10–20 minutes per contrast set (Brief §7 cap. 4). Each single pair gets only about 30 minutes.
  - A block extends by up to 2 weeks if your accuracy on test voices stays below 80%.
- **Corrective feedback, then a retry.**
  - The card shows one correction per attempt, and never more than two.
  - You try to correct yourself first. Then the model plays. Then you get a new word with the same sound.
  - Brief §2 #5, §3.2 [Moderate for feedback; Mixed for self-correction first; Weak for the 1–2 limit].
- **Spaced review.** Items come back after 1, 3, 7, 14 and 28 days. These intervals live in a settings file, not in the code, because the best spacing for pronunciation is unknown (Brief §3.5). An item repeats at most 3 times in a row. After a break, the app caps the review queue. Brief §3.5, §7 cap. 6 [Strong for L2 learning in general; Weak for pronunciation]; Add. §5.8.
- **Fluency practice.** You retell the same story 3 times in one session, within 60, then 50, then 40 seconds.
  - You get one tip between rounds, and a new story next session.
  - If a round repeats more than 70% of the previous round's 4-word sequences, the app asks you to rephrase. The 70% cut-off is a working rule.
  - The app judges your speaking rate against a band, never as "faster is better".
  - Pause habits partly carry over from your first language. So the app reads your English pauses against the pauses in your French baseline retell (Brief §3.4 [Weak–Moderate]).
  - Brief §3.4, §7 cap. 8 [Moderate].
- **Session lengths.** Sessions last 5, 10 or 15 minutes. 10 is the default. Every length is a complete session. Add. §5.7 [Weak].
- **Habit support.** A weekly target, never a streak. An if-then plan, a comeback session and one reminder. Brief §3.6 [Moderate for if-then plans, outside language learning, with a small effect of about d = .15 after bias correction; Weak for the rest].

### 2.6 Phone and audio rules

1. **HTTPS only.** Phones allow the microphone only on secure pages (Add. §4.2 [Strong]).
2. **Uncompressed audio.**
   - The app records with AudioWorklet and builds a 16 kHz mono WAV file on the phone. WAV holds PCM, which is raw, uncompressed samples.
   - Azure's REST API for short audio accepts only WAV/PCM or OGG/Opus at 16 kHz mono (checked). The SDK takes the same 16 kHz PCM.
   - Compression distorts the app's own sound measures (Add. §4.2 [Moderate]).
   - MediaRecorder, the browser's built-in recorder, is a fallback only. It picks a format by testing what the browser supports, trying audio/mp4 first on iOS. The app decodes its takes to PCM before scoring, marks them "lossy" and leaves them out of acoustic measures. (v1 hard-coded audio/webm, which fails on some iPhones.)
3. **No microphone in the Hear stage.** Listening trials play from cached audio. They work offline and show no microphone prompt.
   - The mic opens at the first spoken item and stays open until the session ends.
   - On iPhones, an open mic switches audio into a recording mode. Developers report that this mode can make playback quieter or send it to the earpiece on some iOS versions (secondary). How your own phone behaves is unverified.
4. **Playback and recording never overlap.** The app waits for model audio to end before it records. It sets `navigator.audioSession.type` to "playback" in Hear stages and to "play-and-record" when the mic opens (Safari 16.4 and later; checked). Whether this keeps playback on the loudspeaker on your phone is unverified. Test V1 checks it.
5. **Gate first, then send.**
   - For word and sentence items, the app holds the take on the phone, runs the quality gate, and only then sends the audio to Azure. Azure never receives or bills a failed take.
   - Long retell rounds are the exception. They stream while you speak, because waiting for a 60-second round would be too slow. So Azure also bills a noisy round.
6. **One AudioContext per session.** The app closes it at the end of the session. v1 leaked AudioContexts.
7. **Interruptions.** If the page is hidden, or iOS interrupts audio (a call, Siri), the app discards the take and pauses the session. There is no background or lock-screen practice (Add. §4.2 [Moderate]).
8. **The URL does not change during a session.** WebKit bug 215884 ("getUserMedia recurring permissions prompts in standalone when hash changes") caused repeated mic prompts in home-screen apps when the URL changed. Search results say it is marked resolved as of February 2026 (secondary: the bug tracker was blocked). Keeping the URL fixed costs nothing.
9. **Screen stays on.** Screen Wake Lock keeps the screen on during a session. It works in iOS home-screen apps from iOS 18.4. On iOS 16.4–18.3 it works only in a Safari tab (checked).
10. **Waiting states.**
    - After 3 seconds, the app shows "Still checking — you can go on."
    - After 8 seconds, it shows "Couldn't judge this one — no verdict." The app keeps the audio. It may score it later for validation, but the result never enters the target model or any statistic.
    - A 2021 report on SDK versions 1.18–1.19, in a browser with pronunciation assessment, found that about 5% of requests took about 20 seconds (checked; current behaviour unverified).
11. **Microphone processing settings.** These are echo cancellation, noise suppression and automatic volume. Nobody knows whether turning them off helps or hurts Azure scores (Add. §4.2 [None found]). Whether iOS obeys the "off" request is unverified. Test V3 decides. The app stores the settings that were actually applied with every take.
12. **A test on your own phone comes first.** It decides between a PWA and Capacitor.

### 2.7 Scoring rules

- **English scoring** uses Azure en-US pronunciation assessment, with phoneme detail, IPA phoneme names and spoken phonemes.
  - en-US is the only locale that returns spoken phonemes, IPA names, syllables and prosody (Brief §3.7 [Strong]; checked).
  - The browser JS SDK exposes all of these options and signs in with an access token (`fromAuthorizationToken`) (checked in SDK 1.51.0).
  - Prosody costs extra (checked). The app requests it only for Check retells and anchors, and stores it for later comparison. No feature depends on it.
- **Takes longer than 30 seconds** use continuous mode. In that mode, Azure does not support miscue detection, so it does not flag omitted or inserted words. The app compares the transcript itself (Brief §3.7 [Strong]; checked).
- **For free speech,** the app gets an ASR transcript first, then runs a scripted assessment against that transcript. Microsoft recommends this path when accurate recognised text matters (checked). It sends each retell to Azure twice, so it doubles the audio time for retells.
- **The REST short-audio API is not a full fallback.**
  - Its documented pronunciation-assessment header lists only these keys: `ReferenceText`, `GradingSystem`, `Granularity`, `Dimension`, `EnableMiscue`, `EnableProsodyAssessment` and `ScenarioId`. It documents no `NBestPhonemeCount` and no `PhonemeAlphabet` (checked). Whether REST accepts them anyway is unverified.
  - A REST fallback would therefore probably lose the "sounded like *sheep*" feedback.
  - Real fallbacks keep the SDK: native audio capture inside Capacitor, or the SDK running on a small server.
- **Azure free tier (F0).**
  - F0 allows 1 request at a time, and this limit cannot be changed (checked). The app sends requests one at a time.
  - F0 gives 5 audio hours a month (secondary).
  - Whether F0 includes prosody is unverified. It does not matter, because no feature depends on prosody.
- **Audio budget.**
  - Practice uses about 2.5 audio hours a month at 5 sessions a week. A 10-minute session sends about 6 minutes of audio. Most of it is the three retell rounds, sent twice.
  - Build and validation months use more. Checking TTS clips against competing words, the validation sittings and re-scoring Check audio can add 2–4 hours.
  - So laptop tools use a separate S0 resource, or run spread over several months. This also stops them from taking F0's single request slot while you practise.
- **One interface.** Every scorer sits behind one interface (`SpeechScorer`). A fixture scorer (`FixtureScorer`) replays recorded results for tests.
- **No LLM judge.** No language model or audio language model judges pronunciation (Brief §3.7 [Weak]).
- **v1's scoring bugs become named tests:**
  - the SDK call handled with callbacks, not awaited as a promise;
  - result reasons compared with SDK enum values, not strings;
  - words read from the `NBest[0].Words` path;
  - prosody actually requested where it is used;
  - correct audio type labels;
  - timeouts on every call.

### 2.8 Security and cost guards

- **The Azure key never reaches the phone.** The phone uses a 10-minute access token from a server. Microsoft recommends reusing a token for 9 minutes (checked).
- **Continuous integration (CI) checks the built app.** CI is the automatic build-and-test run on every commit.
  - The build fails if any bundle file contains the real key value (CI receives it as a secret) or the name `AZURE_SPEECH_KEY`.
  - The build fails if the app's own code contains the header name `Ocp-Apim-Subscription-Key` or calls `SpeechConfig.fromSubscription`. This check skips the Azure SDK's chunk, because the SDK itself contains that header name (checked in SDK 1.51.0). A whole-bundle scan for it would always fail.
- **TTS audio is made once**, at build time, on your computer. There is no TTS proxy at run time.
- **Pairing.** A one-time pairing code gives your phone a device token that can be revoked. The server stores only a hash of the token. It issues at most 30 access tokens an hour.
- **Tests never need a `.env` file.** The code reads settings only when it needs them, which fixes v1's test crash.
- **Usage warning.** The app counts the audio seconds it sends to Azure, and laptop tools log theirs. A monthly look at Azure's own usage figures catches the rest. The app warns you at 70% of the free-tier allowance.

### 2.9 Deliberately left out

| Left out | Why |
|---|---|
| Tongue-twister speed ladders, tempo tiers, "articulation index" | No evidence of benefit, and they reward speed (Brief §4 [No evidence]; Add. §5.15, §6 [None found]) |
| Mouth exercises without speech | No evidence of benefit. The only data come from children with speech disorders (Brief §4). |
| Native accent or Azure accuracy as the main score | Accent is partly separate from being understood (Brief §1 [Strong]) |
| Rhythm scores (%V, nPVI) as targets | They vary between speakers and tasks as much as between languages (Brief §3.3 [Moderate]; Add. §2 notes [Mixed]) |
| Streaks | No evidence that they help learning (Brief §3.6). Points and badges are also left out. That is a design choice, not a finding: game features helped learning in education studies [Moderate], but their effect on motivation was not robust (Brief §3.6). |
| LLM or audio-LLM as a pronunciation judge | Biased, and agrees poorly with raters (Brief §3.7 [Weak]) |
| ASR accuracy as a pronunciation score | It is biased by accent and hides errors (Brief §3.7 [Moderate]). The app uses it only as a "lenient machine listener". |
| Typed chat practice | Weak transfer to speaking (d = 0.29, not significant; Brief §3.4) |
| Colour on every word; a 0–100 score on the main screen | Not corrective feedback (Brief §1 [Moderate]) |
| Vowel charts from formants shown to you | Formants vary by device and noise, and nobody knows how stable they are from day to day on a phone (Brief §4; Add. §3.4 [Mixed]). They run hidden, as experiments only. |
| Counting filler words as a clarity measure | Fillers can help listeners (Brief §3.4) |
| Background or lock-screen practice on iOS | iOS stops capture when the page is hidden (Add. §4.2 [Moderate]) |

---

## 3. The options

### 3.1 Option A: Lean English core

**What it is.** This is the smallest app that delivers the best-supported English training on your phone. It trains English only in cycle 1. It records your French baseline in week 0. French training starts only when a Progress Check shows that the English core works. Option A is based on the "lean-mvp" design, with the judges' fixes applied.

**What you get and when.**

| Build week | What you get |
|---|---|
| ~1–2 | The app is on your phone, plus a report from the phone test |
| ~3–6 | **First slice:** your baseline is recorded, and you can do daily 5-minute listening sessions offline (stress, /iː–ɪ/) |
| ~5–8 | Listen-and-say sessions with a self-check and the model |
| ~7–10 | The full 10-minute session with retelling; Progress Check 1 can be recorded |
| ~9–12 | The /h/ block, Check analysis, the target model and the Progress screen. The core app is then complete. If /h/ is not ready by practice week 5, block A continues until it is. |
| After a gate | French training (typically in cycle 2) |

**Product scope**
- **Included:**
  - word stress; /iː–ɪ/ (block A, weeks 1–4); /h/ (block B, weeks 5–8);
  - retell ×3;
  - Progress Checks at weeks 0, 4 and 8, with a delayed probe for block A at week 8;
  - a listener pack exported as a zip file with a rating sheet (CSV);
  - a calendar reminder and a manual ZIP export.
- **Cycle 2 targets.** /uː–ʊ/ and /æ–ʌ–ɑ/ stay untrained in cycle 1. They act as the untrained comparison and start in cycle 2.
- **Left out until a gate calls for it:** French training, sentence-stress dialogues, a listener web page, cloud backup, the review screen for disputed verdicts, the talk partner and push notifications.

**Architecture**
- A PWA (React, TypeScript, Vite).
- A Cloudflare Worker with three endpoints: pairing, access token and health check. It stores only hashed device tokens and rate counters, in D1 (Cloudflare's small SQL database).
- The Azure JS SDK runs in the browser.
- DSP (pitch, pauses, levels) runs on the phone.
- The server never handles audio.

**Scoring per language and feature**

| Feature | How |
|---|---|
| Listening trials | On the phone, offline |
| Vowels, /h/ | Azure en-US spoken phoneme and phoneme score. Verdicts appear, in "possibly…" wording, once precision is at least .80 on your deliberate-error recordings. A native-listener check (κ ≥ .60) is added when a listener is available. Before that, you compare your recording with the model. |
| Word stress | Compare mode: bars show each syllable's length, loudness and pitch, for you and for the model. There is no verdict until validation passes. |
| Fluency | Azure continuous recognition plus pause detection on the phone |
| Machine listener | ASR on unpredictable sentences, labelled "lenient" |
| French | Baseline recordings only in cycle 1 |

**Data and hosting**
- All data is in IndexedDB on your phone.
- The app asks you to install it to the home screen and asks the browser to keep its storage permanently.
- A monthly reminder prompts you to export a ZIP file.
- There is no cloud backup.
- The Worker runs on Cloudflare's free plan.

**Monthly cost**
- $0 on Azure F0 and the Cloudflare free plan.
- About $3–6 on Azure's pay-as-you-go tier (S0) (secondary prices). Build months cost a few dollars more if laptop tools run on S0.

**Build effort.** About 40–60 developer-days, over 9–12 build weeks, in 7 epics.

**Main risks**
- Your second goal, clearer French, waits for months.
- Check audio lives on one phone until you export it. If you lose the phone, you cannot re-score after a model update.
- Without a native listener, vowel and /h/ feedback stays at "possibly…", and stress stays in compare mode.
- The 8-week cycle gives only about 1.3 hours of stress practice. The addendum's estimate is about 4 hours (Add. §4.1).
- In cycle 1, only two of the three targets are trained. The third stays untrained until cycle 2, so cycle 1 alone falls short of the reported standard of at least 3 trained targets (Brief §3.7; the standard was not re-checked).

**Evidence fit.** Strong for the main English mechanisms: HVPT, feedback with retry, spacing, retelling and transfer checks. Weaker for the French goal and for outcomes judged by human listeners.

**Who should pick it.** Pick Option A if you want real practice as soon as possible and the smallest build, and you are content to put French on hold.

### 3.2 Option B: Full phone coaching program (recommended)

**What it is.** A phone-first coaching program for both of your goals. Every session follows the same four stages: **Hear → Say → Use → Wrap**. It uses Option A's technical base and adds five things:
- French clarity sessions in cycle 1, 1–2 times a week, from about practice week 6–10 (decision D14 can start them earlier);
- three trust levels for machine verdicts (Silent → Hint → Correction; section 6.5);
- automatic encrypted backup after each Check;
- an encrypted link for a listener panel;
- a full 12-week program with three staggered targets and a delayed probe at week 16.

It combines the best-rated parts of the four designs:

| Part | Taken from |
|---|---|
| The session stages, trust levels, iOS audio handling and habit tools | "learner-ux" |
| The measurement plan: criteria written in advance, three staggered targets, scoring eras, the panel protocol, dose rules and TTS checks | "evidence-max" |
| The build order, the first-attempt rule, the token-only Worker and the decision gates | "lean-mvp" |
| Committed validation reports, known-answer checks and "no verdict" handling | "measurement" |

**What you get and when**

| Build week | What you get |
|---|---|
| ~1–2 | The app is installed and the phone test is done (go or no-go) |
| ~3–6 | **Slice 1, "Listen Starter":** your baseline plus daily listening sessions offline. Practice week 1 starts. |
| ~5–8 | **Slice 2:** listen-and-say sessions. You check yourself; Azure logs its verdicts silently. |
| ~6–9 | Progress Check recording and automatic backup, so Check 1 happens on time |
| ~8–11 | **Slice 3:** the full 10-minute session with retelling |
| ~9–12 | The /h/ block, sentence-stress dialogues and weak-form listening. If /h/ is not ready by practice week 5, block A continues until it is. |
| ~10–13 | **Slice 4:** 5-minute French clarity sessions (about practice week 6–10) |
| ~11–15 | Validation. Hints and corrections switch on as each detector passes. |
| ~13–18 | Check analysis, the target model and the Progress screen. Checks 1 and 2 are analysed from stored audio. |
| ~15–22 | The listener panel, the remaining habit tools, and the French noisy-café game and measures |

**Product scope.** All English modules, including sentence stress and weak forms (for listening). The full French clarity track. The panel. Backup. Experiments stay off by default: shadowing, an LLM talk partner and a pitch line.

**Architecture.** A PWA, plus a Cloudflare Worker for pairing, access tokens, encrypted backups and encrypted panel packs. Cloudflare's R2 object storage holds the encrypted data, and D1 holds token hashes and counters. The Azure JS SDK runs in the browser, and DSP runs on the phone. Details are in section 6.9.

**Scoring per language and feature.** English and French scoring are as in the common core. Section 6.10 has the full table.

**Data and hosting**
- Data lives on your phone first, in IndexedDB.
- An encrypted backup goes to R2 automatically after each Check, and weekly.
  - It holds all your data plus baseline, Check and anchor audio. Rolling practice audio stays on the phone.
  - The phone encrypts it with AES-GCM, a standard encryption method. The key comes from a passphrase that only you know.
  - The phone uploads it in parts under 100 MB, the Worker's request limit on the free plan (checked).
  - The server cannot read the backup.
- You can also export a ZIP file.
- Everything runs on Cloudflare's free plan. R2 asks for a payment method before you can turn it on, even on the free plan (secondary).

**Monthly cost.** About $0–1 on free tiers. About $3–8 if you move to Azure S0 (secondary prices). The top of that range is for months when you build content.

**Build effort.** 13 epics, R1–R13 (section 6.16), including optional experiments. About 16–22 build weeks for the full cycle-1 program. The epic sizes add up to between about 11 and 26 weeks. You practise from about build week 3–6.

**Main risks**
- The scope is large for one developer. Mitigations:
  - the build follows Option A's order;
  - each slice is useful on its own;
  - decision gates stop new modules if you practise too little.
- iOS web audio may misbehave. Mitigations: the phone test first, and Capacitor as the fallback.
- The stress detector may never pass validation.
- French starts about halfway through cycle 1, so cycle 1 gives only about 5–10 French sessions. Mitigation: D14 can start a first version earlier.
- If you forget the backup passphrase, the backup is lost.
- The listening dose may still be too low. Mitigation: blocks extend when test-voice accuracy stays below 80%.

**Evidence fit.** The highest of the three options.
- It covers ranked capabilities 1–8, 10 and 11 in Brief §7.
- It covers capability 9 (spoken tasks) only through retells, and capability 12 (optional tools) only in part.
- It leaves out the phrase bank of spoken chunks in capability 8 [Moderate; correlational].
- It serves both goals, though French starts mid-cycle.
- It measures transfer with three staggered targets, delayed probes and re-scoring.

**Who should pick it.** Pick Option B if you want both goals in cycle 1 and a "you improved" you can trust, and you accept a longer build while you already practise.

### 3.3 Option C: Server measurement lab

**What it is.**
- A thin phone app records clean audio and uploads it after the quality gate.
- A Python server (FastAPI) does all the scoring. It runs:
  - Azure, through the Python Speech SDK;
  - Praat-based measures, through Parselmouth;
  - forced alignment for French vowel timing, through the Montreal Forced Aligner (MFA). Forced alignment matches the text to the audio to find where each sound starts and ends.
- The server stores all audio as lossless FLAC files, and all scores in SQLite. It takes nightly backups.
- A registry gives each measure a trust record.

Option C is based on the "measurement" design, with four fixes:
- raters see the intended message;
- corrective feedback no longer waits for human listeners, because it uses Option B's Hint level;
- daily scoring never depends on a computer at home;
- it uses Option B's 12-week program, because the original 8-week cycle cannot fit three 4-week blocks.

**What you get and when**

| Build week | What you get |
|---|---|
| ~1–3 | Phone and server tests; your baseline is recorded |
| ~5–6 | Daily listening sessions |
| ~8–10 | Listen-and-say sessions with hints |
| ~12–14 | Full English sessions and Check analysis |
| ~20–24 | The French track with aligner-based measures |

**Product scope.** The same English and French modules as Option B, in the same 12-week program. It adds lab measures: French vowel distinctness from formants, and a detector for added /h/. These stay hidden until they are validated.

**Architecture**
- A TypeScript PWA.
- A VPS running the Python API, a job worker and an MFA container.
- Caddy, a web server, provides HTTPS. Docker Compose runs the parts together.

**Scoring per language and feature.** Everything is scored on the server. The phone shows only instant signals: level, noise, silence detection and a pitch trace.

**Data and hosting**
- FLAC audio on the server disk.
- SQLite with migrations.
- A nightly backup to object storage, with a monthly test restore.
- A VPS with at least 8 GB of memory, because MFA reportedly needs that much (secondary). After the June 2026 price rise, Hetzner's CX33 (4 vCPUs, 8 GB) costs about €8.49 a month before VAT and a paid IPv4 address (secondary). The cheaper CX23 (€5.49; secondary) has less memory.

**Monthly cost.** About €12–18 in total: the VPS with VAT, Azure S0 (about $3–4), backups (about €1) and a domain (about €1).

**Build effort.** About 14 epics in two languages (TypeScript and Python), plus running a server. About 20–24 build weeks.

**Main risks**
- The heaviest build and operations load of the three options.
- Speaking feedback needs the network. Takes recorded offline wait in a queue on the phone.
- Uploading before scoring adds a step and may add delay. The delay budget is unverified.
- A server that holds voice recordings needs security updates.
- MFA speed on a small VPS is unverified.
- The most expensive tools serve the secondary goal, French.

**Evidence fit**
- High on measurement.
- Lower on value to you as a learner, because feedback arrives later.
- The extra production tools (Parselmouth, MFA) have little validation on learner speech (Brief §3.7 [Moderate]).

**Who should pick it.** Pick Option C if you value a research-grade record of your data and French acoustic measures, you are comfortable running a Linux server, and you accept that speaking feedback starts later.

---

## 4. Comparison table

| | **A: Lean English core** | **B: Full phone program (recommended)** | **C: Server measurement lab** |
|---|---|---|---|
| Built mainly from | lean-mvp | learner-ux + evidence-max, with lean-mvp's build order | measurement |
| Judges' average score of the base design (1–10) | 7.7 | 7.7 and 7.3 (the combined design was not scored) | 5.9 |
| First real practice on your phone | ~3–6 build weeks | ~3–6 build weeks | ~5–6 build weeks |
| First speaking feedback | ~5–8 (self-check); hints after validation | ~5–8 (self-check); hints and corrections after validation | ~8–10 |
| French training starts | After a gate, usually cycle 2 | Cycle 1, about practice week 6–10 (build weeks ~10–13); earlier with D14 | Late in cycle 1 (build week ~20+) |
| Build time for cycle 1 | ~9–12 weeks | ~16–22 weeks | ~20–24 weeks |
| Where scoring runs | Browser SDK with an access token | Browser SDK with an access token | Python server |
| Where data lives | Phone only | Phone, plus an encrypted cloud backup | Server |
| Protection of Check audio | Manual ZIP export | Automatic encrypted backup, plus export | Nightly server backup, plus test restores |
| Listening works offline | Yes | Yes | Yes |
| Speaking needs the network | Yes | Yes | Yes (upload queue on the phone) |
| Without human listeners you get | "Possibly…" verdicts and compare mode | Hints (validated by known-answer checks) | Hints |
| Staggered targets in cycle 1 (multiple baseline) | 3 targets, but only 2 trained in cycle 1 | 3, each trained and probed after a delay | 3, with B's 12-week program |
| Cycle length | 8 weeks | 12 weeks plus a week-16 probe | 12 weeks plus probes |
| Monthly cost | $0 (F0) to ~$6 (S0) | $0–1 (free tiers) to ~$8 (S0) | ~€12–18 |
| Server to maintain | None | None | A VPS |
| Fit for one developer | High | Medium (depends on the build order) | Low–medium |
| Fit with the evidence | Good for English, weak for French | Highest | High for measurement, lower for learner value |
| Main risk | French waits; data on one device | Scope; French starts mid-cycle | Build and operations load |

---

## 5. Recommendation

**Build Option B, in the order of Option A.**

**Reasons**
1. **It starts both of your goals in cycle 1.** French sessions start about halfway through the cycle, or earlier with D14. Paired French recordings need no cloud scoring, so they are cheap to add. Producing clear speech on demand has Moderate evidence for an immediate effect (Add. §3.2). Nobody has shown that the effect lasts [None found].
2. **You start practising as early as with Option A.** The first two slices of A and B are the same. B's third slice comes about a week later, because B builds automatic backup first. Real training starts with the method that has the strongest evidence, many-voice listening (Brief §3.1 [Strong for listening]).
3. **You always get feedback, but never an unchecked verdict.**
   - Until a detector passes validation, you judge yourself against the model while Azure logs its verdicts silently.
   - Hints need no human listeners.
   - Full corrections need one native listener.
   - This avoids two failures: showing wrong corrections, and leaving you with no speaking feedback at all.
4. **"You improved" means something.** Three staggered targets, delayed probes, anchor sentences and re-scoring of all Check audio help separate real change from practice effects and model updates.
5. **Your recordings are protected at no cost.** An encrypted backup of your data and Check audio runs after every Check. Re-scoring after a model update depends on those recordings.
6. **No server to run.** It avoids Option C's server work, and it keeps C's best measurement ideas in a lighter form.

**Why not Option A.** French waits for months. Your data lives on one device. Cycle 1 trains only two staggered targets. Choose A if you want to commit to the core only. Because B builds A first, you can switch from B to A at any Progress Check and lose no work.

**Why not Option C.** It is the hardest to build and to run. It delays speaking feedback. Its heaviest tools serve the secondary goal.

**Condition.** The recommendation depends on the phone test in R1. If iOS web audio fails that test, Option B moves into a Capacitor shell with the same code. On an iPhone, that costs US$99 a year for Apple's developer program, because free signing expires after 7 days. It also needs a Mac (checked by review). An Android phone needs neither.

---

## 6. Option B in detail

### 6.1 Modules in priority order

**English (second-language track; scored against en-US)**

| # | Module | What you do | Evidence |
|---|---|---|---|
| EN-1 | **Word stress.** Runs in every session for 12 weeks. Planned dose: about 2 hours, or about 4 with D8's larger share. The addendum estimates about 4 hours. | **Hear:**<br>• Tap a word's stress shape (●○○ / ○●○).<br>• Pick the correct version of a word from a correct/wrong-stress pair.<br>• From level 2, recall a sequence of 2–3 words said by different voices.<br>• A short quiz: "Which syllable is strong in *develop*?"<br>**Say:**<br>• Say the word in a carrier phrase ("Say ___ again.").<br>• Dots show the stress on new words and are hidden on review words, so you practise recalling the pattern.<br>• Feedback covers length, pitch, loudness and vowel reduction.<br>**Words:** 3 or more syllables, suffix families (PHOtograph / phoTOgraphy / photoGRAphic), noun/verb pairs (REcord/reCORD), and English words that look French (hotel, develop, chocolate). Words whose stress differs between US and British English are voiced in one variety only, or left out. | Add. §2 r1, §5.3 [Moderate as a priority; Weak for training]. Hard many-voice tasks: Add. §2 notes, Dupoux [Moderate]. Knowing the pattern helps: Tremblay 2008 [Moderate]. Recalling beats re-studying: Brief §3.2 [Moderate; outside language learning; untested for pronunciation]. |
| EN-2 | **High vowels: /iː–ɪ/, then /uː–ʊ/.** Block A, weeks 1–4. /uː–ʊ/ joins once /iː–ɪ/ listening reaches 80%. | Hear: pick the word (ship/sheep, pool/pull). Say: the card names the vowel it probably heard ("Possibly heard as *sheep*") and shows vowel length. | Add. §2 r2, §5.5 [Moderate]. Brief §3.1 [Strong for listening]. "About 8 sessions per pair" is a design guess (Add. §2). |
| EN-3 | **/h/.** Block B, weeks 5–8. | Hear: heat/eat and hair/air. Decide "Is this a real word?" ("usband" ✗, "hadvice" ✗). Say: /h/ words and vowel-first words, mixed. | Add. §2 r3, §5.6 [Moderate; one study; gains held at 4 months] |
| EN-4 | **Low vowels: /æ–ʌ–ɑ/.** Block C, weeks 9–12. | Same format, with cat/cut/cot. | Add. §2 r2 [Moderate] |
| EN-5 | **Use stage: fluency in free speech.** In every session, including 5-minute ones. | Retell a story card: French bullet facts plus 3 English target words. Rounds of 60, 50 and 40 seconds, with one tip between rounds. A new card next session. | Brief §2 #8, §3.4, §7 cap. 8 [Moderate]. Targets used in real speech: Brief §2 #13 [Weak–Moderate]. |
| EN-6 | **Sentence (main) stress.** From week 5, in 15-minute sessions. | Correction dialogues: "So you rented a HOUSE?" "No, I rented a FLAT." | Brief §3.3 (Hahn 2004), §7 cap. 7 [Moderate]. The detector starts at the Silent level. |
| EN-7 | **Weak forms.** From week 9. Listening only. | "How many words did you hear?" with to, for, can, of. | Brief §5.1 (teach for listening); Add. §2 r5 [Mixed] |
| EN-8 | **Monitored targets:** clusters, /θ ð/, question intonation | Probed at every Check. Trained only if data show a need. | Brief §5.1 [Moderate; ranks clusters high]; Add. §2 r6 [Unverified], r7 [Not searched] |
| Off by default | Shadowing; pitch line; LLM talk partner; "tap the beat" | Experiments you can switch on after a Check | Brief §3.4 shadowing [Weak]; Brief §2 #14 pitch line [Weak]; Brief §3.3, §7 cap. 12 "tap the beat" [Weak; mostly children]; Brief §3.4: dialogue systems [Moderate], but the meta-analysis had no pronunciation outcome, and LLM voice chat is [Weak] |

**French (native clarity track; 1–2 sessions a week)**

| # | Module | What you do | Evidence |
|---|---|---|---|
| FR-1 | Warm-up | 2 sentences, "over-enunciated" | Add. §3.3 #7 [Weak] |
| FR-2 | Paired recordings | Your usual way, then clearly, with one concrete cue and a named listener. Before validation, you compare the two takes and answer "Which would your listener catch better?" After validation, the app shows what changed and what did not. | Add. §3.3 #1–2 [Moderate; the mouth cues are untested] |
| FR-3 | Clear at your normal speed | Stage 1: slow and clear. Stage 2 (from French week 4): a clear take counts only within ±10% of your usual rate. | Add. §3.3 #3 [Weak] |
| FR-4 | Noisy-café partner | Unpredictable sentences. After you record, the app mixes background chatter into your recording. An ASR "partner" shows what it understood. The app sets the noise so that the partner mishears about 20–30% of your usual takes (a working rule). You retry the missed word more clearly. You do not hear the noise while you speak, because playback during recording breaks the audio rules. So the evidence that applies is the partner who sometimes mishears, not speaking in noise. | Brief §5.3 (Buz 2016), §7 cap. 10 [Moderate for the immediate effect; native English speakers]; untested whether it lasts; ASR as a check [Mixed]. Add. §3.3 #4 (noise heard while speaking) does not apply. |
| FR-5 | Retell, 45–90 seconds | Keep it clear to the end. The app compares your first 15 seconds with your last 15 seconds. | Add. §3.3 #5 [Weak] |
| FR-6 | Vowel probes ("Le mot __ me plaît") | Measurement only, hidden until they prove stable from day to day | Add. §3.3 #6 [Moderate that clear speech changes vowels; Mixed link to intelligibility; phone reliability unknown] |

### 6.2 A typical session

**10-minute session (the default).** Week 6: block B (/h/) is in training, stress is at level 3, and two /iː–ɪ/ review items are due.

| Time | Stage | What happens |
|---|---|---|
| 0:00–0:10 | Open | Tap the icon, then **Start · 10 min** (already selected). This week's audio is already on the phone. The Azure library and an access token load in the background. |
| 0:10–1:20 | Hear · stress | 14 trials in 4 voices. The last 4 are two-word sequences. ✓ or ✗ appears instantly. After a ✗, the correct version and your choice play one after the other. |
| 1:20–3:20 | Hear · /h/ | 24 trials: 16 heat/eat identifications and 8 real-word decisions. The contrast stays on its own (blocked) while your accuracy is below 80%. |
| 3:20–3:30 | Mic opens | Your first spoken word opens the microphone. The level and noise check runs on that word. A separate check screen appears only if the check fails. |
| 3:30–5:30 | Say · /h/ and review | 8 items: 5 /h/ or vowel-first words and 3 due /iː–ɪ/ reviews. For each item: record, quality gate, Azure, card, retry. On 2 of the 8, you first answer a self-check question. |
| 5:30–6:30 | Say · stress | 4 words. Dots are hidden on the 2 review words. |
| 6:30–9:35 | Use | A story card, for example about a hotel stay. The French bullets give the facts; the English targets are *hotel*, *husband* and *develop*. Round 1 (60 s), a tip, round 2 (50 s), a tip, round 3 (40 s). |
| 9:35–10:00 | Wrap | "38 listening trials, 12 words, 3 retell rounds." Weekly dots ●●●○. "Next: Thursday 7:30, after coffee." No score. |

Stress gets about 2 minutes 10 seconds of this session: 1:10 of listening and 1:00 of speaking. The trial rate (about 12 listening trials a minute) is a design assumption. The phone test measures it. Tips between retell rounds use the phone's pause measures, so they do not wait for Azure.

**5-minute session** (a complete session that counts fully)
- 0:05–2:05 Hear: 10 stress trials and 14 trials on the block contrast.
- 2:05–3:35 Say: 6 items.
- 3:35–4:45 Use: one 50-second round and one tip.
- 4:45–5:00 Wrap.

**15-minute session:** the 10-minute session, plus one 5-minute extension. The extension rotates by default, and you can swap it:
- Français clair (1–2 times a week);
- "Use+": sentence-stress dialogues, plus an opinion task;
- extra Hear trials on the block contrast or on stress.

Extra Hear trials run before the mic opens, because an open mic can make playback quieter on iPhones.

**Listening-only session** (5 minutes; earbuds; for places where you cannot speak)
- About 60 trials: about 45 on the block contrast and 15 on stress.
- No microphone.
- It counts toward the weekly target and toward your listening dose.

**Comeback session** (3 minutes; offered after 5 or more days away)
- 8 listening trials on your *strongest* recent target, 3 Say items and one 30-second retell.
- It says: "Welcome back." It says nothing about missed days.
- The app trims the review queue to 12 items. It reschedules the rest quietly and never shows them as a debt.

**Français clair: 5-minute extension, or a session on its own**

| Time | What happens |
|---|---|
| 0:00–0:30 | Warm-up: 2 over-enunciated sentences |
| 0:30–2:30 | 3 pairs, each usual then clear, with a cue card and a named listener. Compare playback. Before validation, you answer "Which would your listener catch better?" After validation, the card says, for example: "Changed: pitch range, vowel length. Not changed: pauses." |
| 2:30–3:45 | Noisy café, once R12 ships: 3 unpredictable sentences. "They heard: *le poison*…" You retry the missed word. Until then, this slot holds 2 more pairs. |
| 3:45–4:45 | Retell, 45–60 seconds, at your normal speed |
| 4:45–5:00 | Wrap, with one cue for next time |

**Weekly plan**
- **Target:** 4 sessions a week (decision D8). The typical week below has 5 slots, so one can slip.
- **A typical week:** English 10 · English 10 + French 5 · English 5 or listening-only · English 10 · English 15 (Use+).
- **Language split:** about 75% English and 25% French (decision D7).
- **What counts:** a session counts toward the weekly target when it lasts 5 minutes or more. Engaged app users had sessions of at least 5 minutes (Add. §4.1 [Weak]). The 3-minute comeback session is the one exception. It counts, because returning matters most after a gap.

### 6.3 The 12-week program and its dose

| Practice week | Word stress (every session) | Sound block | Use stage | French | Measurement |
|---|---|---|---|---|---|
| 0 | — | — | — | Baseline | **Baseline** (form A), in 2 sittings on 2 days |
| 1–4 | Levels 1–2: 2–3 syllables, noun/verb pairs, dots shown | **Block A:** /iː–ɪ/, then /uː–ʊ/ | Retells | — | **Check 1**, end of week 4 (form B) |
| 5–8 | Level 3: suffix families, look-alike words | **Block B:** /h/. Block A moves to review. | Retells and opinions; sentence stress in 15-minute sessions | Starts when slice 4 ships (about week 6–10): paired takes, "slow and clear" allowed | **Check 2**, end of week 8 (form C), plus the delayed probe for A; French Check (a second French baseline if French has not started yet) |
| 9–12 | Level 4: mixed review, dots hidden more often | **Block C:** /æ–ʌ–ɑ/. Weak forms (listening). A and B in review. | Longer retells; rehearsing a real talk you have coming up | Clear at normal speed from French week 4; noisy café once R12 ships; retell clarity drop | **Check 3**, end of week 12 (form D), plus the delayed probe for B, the panel and the Cycle Report; French Check |
| 13–16 | 2–3 maintenance sessions a week, or start cycle 2 | Review | — | French continues | **Check 4** at week 16 (form E), plus the delayed probe for C |

**Why the start weeks are staggered.** Blocks A, B and C start at weeks 1, 5 and 9. So at each Check, the untrained blocks act as a comparison. This meets the reported minimum of 3 staggered targets (Brief §3.7, Kratochwill; not re-checked). Word stress trains from week 1 in every session, so it has no untrained comparison. The app judges its gains on held-out words and new voices only. It cannot separate them from test practice as cleanly.

**Rules**
- If untrained targets improve as much as trained ones, the gain probably comes from exposure or from taking the test. The report says so plainly.
- The block order follows the addendum ranking: vowel pairs (rank 2) before /h/ (rank 3). Decision D9 lets you put /h/ first instead.
- The baseline only suggests candidates (Brief §7 cap. 2). If it flags a target as possibly fine (listening at least 90% on hard trials), the app gives that target short probe slots first. It skips the block only when the probes meet the evidence gate (15–20 instances, 5 words, 3 sessions) and the upper end of the error range is below 0.20. Then it moves the next block up.
- If a block extends, the next block starts late. Checks stay every 4 weeks, and every Check still probes every target.
- The program starts when slice 1 ships. If block B's content is not ready by practice week 5, block A continues until it is.

**Dose (planned; the app counts the real numbers)**

| Target | Per week (4 regular sessions + 1 listening-only) | Over the program |
|---|---|---|
| Word stress | About 10 minutes | About 2 hours over 12 weeks (about 2.2 at 5 regular sessions). That is about half the addendum's estimate of 4 hours (Add. §4.1). D8's larger share (about 4 minutes a session) reaches about 4 hours. Any shortfall continues in cycle 2. |
| Block contrast (listening) | About 140 trials (about 12 minutes) | About 560 trials (45–50 minutes) per 4-week block, and about 2.3 hours across the three blocks |
| Block contrast (speaking) | About 20 first attempts (30–40 attempts with retries) | About 80 first attempts (about 150 attempts) per block |

**An honest note on dose.**
- The studies gave lasting gains after 1–7 hours in total for a whole vowel set (Brief §3.1 [Moderate]). This plan gives the three vowel pairs about 1.5 hours, at the low end of that range.
- The research files do not give the minutes per session in the 8-session French studies (Add. §4.1).
- The right dose for 5–15-minute sessions is unknown (Add. §7 Q6).
- The block-extension rule is the safeguard.
- D8's larger stress share has a cost: it roughly halves the time for the sound block.

### 6.4 Screens and flows

All main buttons sit in the bottom third of the screen, so you can use them with one thumb. The home screen shows no scores.

| # | Screen | Main elements |
|---|---|---|
| 1 | Welcome and pairing | Steps to add the app to the home screen; the pairing code; why the app needs the microphone |
| 2 | Onboarding | Varieties (en-US scoring; fr-FR or fr-CA); target listener; a goal tied to real use ("Speak up in the Tuesday team call"); weekly target; if-then plan and backup plan; reminder (calendar file) |
| 3 | Baseline steps | 2 sittings, with progress dots |
| 4 | **Today** (home) | A big **Start** button; 5 / 10 / 15 chips (10 selected); a "Listening only" chip; weekly dots (never a streak); plan chip ("After coffee · 7:30"); French counter ("1 of 2"); next Check date; welcome-back banner; this week's real-life task |
| 5 | Session frame | Stage bar (Hear · Say · Use · Wrap); pause; exit. Leaving after 5 or more minutes still counts. |
| 6 | Hear trial | Audio plays by itself; a replay button; 2–3 large answer buttons (words or stress shapes); instant ✓ or ✗; the voice name is hidden |
| 7 | Say trial | The word or phrase (stress dots on new items); tap to talk; automatic stop after silence; a live level meter. "Hear model" is hidden on the first try. |
| 8 | Feedback card | See 6.5 |
| 9 | Mic check sheet | Appears only when the automatic check fails. Level and noise meters, and tips (move closer, find a quieter spot, avoid a Bluetooth headset mic). |
| 10 | Use | Story card; timer ring (60 / 50 / 40); round counter; one tip between rounds |
| 11 | Français clair | Usual and clear takes; compare player; listener card; noisy-café card; retell start/end player |
| 12 | Wrap | What you did; weekly dots; next plan time; no score |
| 13 | **Progress** | Four headline cards, each with a range per Check:<br>• *Understood by listeners* (panel only; otherwise "No listener data yet");<br>• *Stress on new words*;<br>• *Sounds heard and said*;<br>• *Pace and pauses in new speech*.<br>A separate "Machine listener (lenient)" card. A separate "Practice, not progress" area. **Then & Now.** |
| 14 | Target detail | Status; a range bar each for listening and speaking; evidence ("42 attempts, 14 words, 6 sessions"); dose; "needs about 6 more attempts before a verdict" |
| 15 | Progress Check | A calm, different colour scheme. "This is a test, not practice." Two parts. No feedback. |
| 16 | Settings and data | Varieties; reminders; weekly target; pause mode; backup and passphrase; export; delete everything; storage status; scorer information (scoring eras) |
| 17 | Developer area (hidden) | Validation lab; trust level of each detector; review of disputed verdicts; listener-panel manager |
| 18 | Listener page | For panel listeners, in any browser: play a clip; write what you heard, or rate how easy it was to understand (1–9, with the task prompt shown) |

**Flows**
- **First run:** 1 → 2 → 3, sitting 1: speaking baseline and the first anchor take. It ends with a 1-minute listening game on words that are not in any test, so day 1 ends on a success.
- **First run, sitting 2:** listening screener (stress sequences, vowels, /h/; 2 voices; no feedback), a 12-sentence repetition test to set content level, the second anchor take, and the French baseline. The French baseline includes a 60-second French retell, which also serves as your first-language pause reference.
- **Daily:** 4 → 5 (Hear → Say → Use) → 12.
- **Check day:** 4 shows a banner → 15 → 12 → 13. The Check can move by up to 3 days and can be split over 2 sittings.
- **Comeback:** starts from Today, automatically, after the gap.

### 6.5 Feedback design

**After a listening trial** (under 0.1 s): ✓ or ✗. After a ✗: "It was ○●○ (de-VE-lop). You chose ●○○." Both versions play. No score. (Brief §3.1 [Strong]; Carlet & Cebrian [Moderate])

**After a speaking attempt**

| When | What you see | Why |
|---|---|---|
| Under 0.3 s (on the phone) | "Got it", or "Let's redo that one: too quiet / clipped / noisy". A redo is not counted and not sent to Azure. | Quality gate (Add. §4.2 [Strong for Microsoft's guidance]) |
| On 1 attempt in 4, before the result | A self-check: "Where was your stress?" (tap a syllable) / "Ship or sheep?" / "Did you say the /h/?" / "Not sure" | Learners overrate themselves and become more accurate with feedback (Brief §3.6 [Moderate]). Asking on every trial can backfire (Brief §3.6 [Weak]). |
| About 1–2.5 s | The result, according to the detector's trust level (table below). At most 1 card; 2 only when both are confident and both concern current targets. | Brief §2 #5 [Moderate feedback; Weak for the 1–2 limit]. A delay of a few seconds may even help (Brief §3.2 [Weak; lab movement tasks]). |
| After 3 s | "Still checking — you can go on." | Slow replies happen; how often is unverified today |
| After 8 s | "Couldn't judge this one — no verdict." It never enters the target model or any statistic, and it is never shown as an error. | From the "measurement" design |

**Trust levels for each detector**

| Level | What you see | How a detector reaches this level (heuristics) | Counts in the target model? |
|---|---|---|---|
| **0 Silent** | A self-check plus the model: "Listen to yours and to the model. Ship or sheep?" For stress: bars for each syllable, for you and the model. | The default for every new detector. Azure's verdict is logged for validation. | No |
| **1 Hint** | "Possibly heard as *sheep*. Try a shorter, looser vowel." Shown only above the detector's confidence threshold. | A known-answer check passes, with no human listener needed:<br>• precision of at least .80 on your deliberate right and wrong recordings (at least 40 per contrast);<br>• at least 95% correct on native and TTS reference words;<br>• the verdict repeats on re-recording at least 80% of the time.<br>Deliberate errors are cleaner than natural ones, so this check probably overstates precision on natural speech. That is why Hints say "possibly" and count at half weight. | Yes, at half weight, marked provisional |
| **2 Correction** | The full card (below) | Agreement with a native listener on at least 40 natural attempts (60 where possible; with 40 items, κ can be off by about ±0.25): κ ≥ .60 and precision ≥ .80. For stress, precision must be at least .85. | Yes |

**When a detector moves down**
- If more than 25% of a detector's last 40 flags are disputed and the dispute is upheld, it drops one level.
- A new scoring era or a new phone drops it one level until a quick re-check passes: the anchors plus 20 known-answer items.

**Where trust levels are recorded.** Trust levels live in a data file. They change only in a commit that also adds the validation report under `docs/validation/`. A κ of .60 matches expert agreement on single-sound errors (Brief §3.7).

**Correction card (vowel)**
> **ship** — probably heard as **sheep**
> Your vowel sounded long and tense.
> **Try:** a shorter, looser vowel, with lips relaxed.
> [mouth picture] · length: yours ▮▮▮▮ / target ▮▮
> **[Try again]** · (after one retry: **[Hear model]**) · *I think I said it right*

**Correction card (stress)**
> **deVELop** — your strongest syllable was probably the **1st**
> Make "VEL" longer and higher. Keep "de" short and weak, like "di".

**The retry sequence**
1. **Self-correction first.** The card names the fix and does not play the model yet. The model is always one tap away, because the evidence for correcting yourself first is Mixed (Brief §3.2).
2. **If still off:** the model plays, then you try again. At most 3 attempts in a row.
3. **Then a new word** with the same sound. Varied words may help transfer (Brief §3.2 [Weak]).

**Honesty rules**
- The app uses cautious words: "probably", "possibly".
- Cards cover only errors on *current targets*, found above the detector's threshold. The app logs everything else silently. (Brief §3.2, Neri; Levis [Moderate for the reasoning])
- The app never flags accepted variants: English weak forms, known stress variants, French optional liaison and dropped schwa (Brief §7 cap. 5).
- A disputed verdict stays out of statistics until you review it.
- The mouth picture is used only for sounds. Evidence for how-to explanations is Mixed (Brief §3.2), and for lip visuals it is Weak (Brief §3.1).

**After a Use round**
- Feedback comes at the end of the round, never while you speak.
- It gives one target note, shown only for a detector at Hint level or above, for example: "*HO-tel* twice → ho-TEL". A Silent detector gives a prompt instead: "Listen to how you said *hotel*."
- It gives one pacing note, for example: "3 pauses fell inside phrases, after 'the', 'a' and 'to'. Pause after the full idea instead."
- It never compares numbers from round to round, because a round-to-round gain is expected from repetition and is not progress (Brief §3.4).
- It never rewards speed.

**French feedback**
- Before validation: compare playback, plus "Which would your listener catch better?"
- After validation: "Changed / not changed" on validated measures only (pauses, pitch range, vowel length), with one cue for the feature you did not change.
- In the noisy café: "They heard…", with the missed words highlighted.

**Never shown:** single-take scores as progress, streaks, points, leaderboards, rhythm scores, a single "clarity score", or colour on every word.

### 6.6 Content plan

**English sets**

| Set | Training items | Held out for Checks | Notes |
|---|---|---|---|
| Stress words | 360 (2–5 syllables) | 150 (5 forms × 30: 20 for speaking, 10 for listening) | Suffix families (40), noun/verb pairs (30), compound vs phrase (20), look-alike words (100), frequent words of 3+ syllables. 1–2 wrong-stress versions per training word, in 2 voices. |
| Stress sequence sets | 40 | 10 | For the hard recall trials (Add. §2 notes) |
| /iː–ɪ/ | 80 pairs | 20 pairs (listening) + 50 words (speaking) | Carrier phrase and short phrases |
| /uː–ʊ/ | About 20 pairs + near-pairs + made-up words | 8 pairs (listening; reused across Checks in new test voices) + 50 words (speaking) | True pairs are few: pool/pull, fool/full, Luke/look |
| /æ–ʌ–ɑ/ | 50 sets (cat/cut/cot) | 12 sets (listening) + 50 words (speaking) | en-US values |
| /h/ | 60 pairs + 40 made-up words | 16 pairs + 10 made-up words (listening) + 50 words (speaking) | Made-up words of both kinds: dropped /h/ ("usband") and added /h/ ("hadvice") |
| Clusters (monitored) | — | 50 words | Initial, medial and final clusters |
| /θ ð/ (monitored) | — | 50 words | Probes only |
| Question intonation (monitored) | — | 25 questions | Probes only |
| Sentence-stress dialogues | 60 | 15 | "No, I rented a FLAT" type |
| Weak-form phrases | 60 | — | Listening only |
| Story cards | 48 | 12 stories + 8 opinion prompts (5 forms) | French bullet facts plus 3 English target words. The intended message is known, and you do not read English aloud. Topic groups rotate weekly. |
| Unpredictable sentences | — | 120 (Checks only) | 5–8 words each, grammatical, hard to guess from context |
| Anchor sentences | — | 10, fixed for life | Cover all targets. Recorded twice at every Check. |
| Level-check sentences | 12 | — | Rising length |
| Mouth-tip cards | 8 | — | One sentence and one drawing each |

Held-out speaking items need not be minimal pairs. Any word with the target sound works. Each Check uses 10 per target, so 5 Checks need 50.

**French sets**
- 120 paired sentences and 60 pseudo-words (made-up words), balanced across vowels and nasal vowels.
- 160 unpredictable sentences, for Checks and the noisy café.
- 30 retell prompts (8 held out).
- 40 vowel-probe words.
- 8 listener cards ("your uncle on a bad phone line").
- 10 anchor sentences.
- 3 babble tracks, each 2 minutes, mixed from 6–8 TTS voices reading unrelated texts. This avoids licence issues.

**Voices**
- **Vowels and /h/, training:** 4 en-US voices (2 women, 2 men). A single variety keeps the vowel system the same as the variety used for scoring. (A judge warned that mixing en-IN, en-AU and en-GB voices in vowel training could confuse the contrast. High voice variety can hinder some learners (Brief §3.1 [Mixed]).)
- **Stress, training:** 2 en-US, 1 en-GB and 1 en-AU voice, for the international target.
- **Tests only:** 1 en-US voice, 1 en-GB voice (stress only), and natural human recordings.
- **Natural recordings:** Lingua Libre (CC BY-SA 4.0; coverage for each word unverified), plus 1–3 volunteers who record through an in-app link.
- **Azure voice counts:** sources differ (31 against 50+ en-US voices, depending on which voice types are counted). This does not matter for a pool of 4–6 voices.

**Production steps** (run on your computer at build time; never at run time)
1. **Source lists** in YAML or CSV files. A validator checks:
   - that the stress pattern and sounds match CMUdict (the free CMU Pronouncing Dictionary) or Lexique 3.83 (a French word database);
   - that each pair differs in exactly the target sound;
   - that words whose stress differs between varieties are voiced in one variety only;
   - variety tags and licences;
   - that no held-out item overlaps with training items.
   Frequencies come from SUBTLEX-US, a word-frequency list built from film subtitles.
2. **Drafting.** A text LLM may draft stories and unpredictable sentences. You review every item. An LLM never scores (Brief §7).
3. **TTS rendering.** Rendering uses SSML, the markup that controls synthetic speech. Wrong-stress versions use SSML IPA stress marks (checked by review). Audio is saved as AAC for playback and as 16 kHz WAV for checks.
4. **Automatic checks for each audio clip:**
   - Each English contrast clip is scored against its intended word *and* the competing word. It is kept only if the intended word wins by a margin and Azure's spoken phoneme matches the target. This applies Brief §3.1: "check that the TTS voice actually produces the contrast."
   - For each wrong-stress version, the app's own prominence analysis must find the intended syllable on at least 2 of 3 cues.
5. **Human spot-check.**
   - If a native English listener is available, they identify 20 clips per voice per contrast. A voice needs at least 90% correct, or it is dropped for that contrast.
   - You check 10% of the French items by ear.
6. **Versioned packs.** Packs carry version numbers, and every attempt stores the content version. The app flags a gap of more than 10 points between listening accuracy on TTS voices and on natural recordings.

**Size.** Azure bills SSML markup as characters, except the `<speak>` and `<voice>` tags (checked). Wrong-stress versions carry phoneme tags, so they cost more characters. The estimate is about 300,000–350,000 characters. That fits within Azure's free 0.5 million characters a month (secondary) if you do not re-render many times.

### 6.7 Progress Check, target model and success criteria

**Progress Check** (weeks 0, 4, 8, 12 and 16; forms A–E; can be split over 2 sittings; no feedback)

| Part | Tasks | Measures |
|---|---|---|
| **A · Say** (about 10 minutes) | • 10 anchor sentences, twice (at baseline, on 2 days)<br>• held-out words in a carrier phrase: 10 per sound target, including untrained and monitored targets, plus 20 stress words<br>• 8 unpredictable sentences<br>• a new 60-second story retell (first telling) and a new 60-second opinion | Your noise level (SEM and RCI); error rates on held-out words; machine-listener word accuracy (lenient); fluency on first tellings; clips for the panel |
| **B · Hear** (about 6 minutes) | 48 trials in test-only voices and natural recordings, for every contrast (including untrained ones), plus 10 stress words and stress sequences | Listening accuracy for each contrast; the gap between TTS and natural voices |
| **French** (about 6 minutes; weeks 0, 8 and 12) | 6 unpredictable sentences, usual and then clear (noise is mixed in later on the phone); a 60-second retell; 5 anchors | Clear-minus-usual keyword gain in noise; drift in your usual speech; clarity drop across the retell |

**Rules**
- **Store first, analyse later.** The app keeps all Check audio for good. So a Check can happen before its analysis code exists.
- **Like-for-like scoring.** Before comparing Checks, the app re-scores all past Check audio with the current scorer. A model update then cannot look like progress or decline.
- **Plain wording for results:**
  - "Clearly better": RCI > 1.96, or a probability of at least .975 that the rate improved;
  - "Probably better": probability of at least .90;
  - "No clear change";
  - "Probably worse".

  Each result comes with one sentence explaining why. The thresholds are heuristics.
- **Across 3 or more Checks,** the app also reports NAP (non-overlap of all pairs: the share of before-and-after pairs where the later value is better). It does not use Tau-U, which has no confidence interval (Brief §3.7).
- **"Learned"** means that a target still holds on held-out items at its delayed probe (Brief §7 cap. 1).

**Target model** (Brief §7 cap. 3 [Moderate for English; Weak for French])
1. **Scored instances.** Each gives an outcome (error or no error) and a weight. The weight is:
   - quality (1 if the take passed the gate, 0.5 if borderline);
   - × confidence (1 when two signals agree, for example a low phoneme score *and* the competing sound as the spoken phoneme; 0.5 when only one does);
   - × trust level (0.5 for Hint);
   - × recency (the weight halves every 45 days).

   Disputed instances and "no verdict" results are left out. Only first attempts count.
2. **Estimate.** A beta-binomial estimate gives an 80% range. It starts from a neutral starting value (mean 0.3, worth 4 instances). This value is **provisional**. It does not come from the evidence.
3. **Evidence gate.** A target needs 15–20 instances, from at least 5 words, over at least 3 sessions, before it can be called weak or fine.
4. **Status:**
   - *Candidate*: flagged by the baseline, which only suggests candidates (Brief §7 cap. 2).
   - *Uncertain*: gets short probe slots, not training slots.
   - *Likely weak*: the lower end of the range is above 0.25, a threshold set during validation.
   - *In training*.
   - *Holding*: at a Check, the upper end of the held-out range is below 0.20, and listening on test voices is at least 85%.
   - *Learned*.
   - *Slipping*.
5. **Priority** = weight for how much the target matters to understanding × expected error rate × word-frequency coverage × a listening factor (1.2 when listening is below 80%). The weights sit in `content/weights.json`, marked provisional: stress 1.0, /iː–ɪ/ 0.8, fluency 0.8, /h/ 0.7, /æ–ʌ–ɑ/ 0.7, /uː–ʊ/ 0.6, clusters 0.5, weak forms 0.4, intonation 0.3, /θ ð/ 0.2.
   - They roughly follow the addendum's rank order, with two deliberate exceptions. Fluency (rank 4) sits level with /iː–ɪ/, and clusters (rank 7) sit above weak forms. The reason is that the brief ranks pausing and clusters high for international listeners (Brief §5.1).
   - A published ranking of how much each sound contrast matters should replace the sound weights before cycle 2.
6. **Two tracks per target.** Hearing and speaking are estimated separately. This shows whether a problem is in hearing or in speaking (Brief §3.1).
7. **French** uses the same method on clarity features. For each feature, the model tracks the change between your usual and clear takes. Features you do not change become the next cues.

**Success criteria** (you accept or edit them in `docs/research/n-of-1-plan.md` before practice week 1)

| # | Criterion | Expectation |
|---|---|---|
| S1 | Listening on test voices and natural recordings shows a reliable gain for each trained block, while untrained blocks stay flat until their own start | Likely: listening training has Strong evidence |
| S2 | The error rate on held-out words drops reliably for at least 2 of the 3 blocks after their start, and holds at the delayed probe | Possible: speaking gains are smaller (Brief §3.1) |
| S3 | Stress listening on test voices reaches at least 80% by week 12. Stress speaking counts only through a validated detector or the panel. | Uncertain: the evidence comes from Spanish words (Add. §2), and the planned stress dose is about half the addendum's estimate |
| S4 | On first tellings of new prompts, mid-clause pauses drop reliably, mean length of run rises, and articulation rate stays within your band | Possible |
| S5 | Machine-listener word accuracy on unpredictable sentences rises reliably (lenient) | Possible; ASR hides errors |
| S6 | Panel (if run): comprehensibility and intelligibility rise by more than the listeners' noise band | **A flat result is plausible** (Brief §8) |
| S7 | French, at your usual speed (±10%): the clear-minus-usual keyword gain in noise at week 12 is larger than at week 0, by more than your day-to-day spread (V9). Drift in your *usual* speech is exploratory. | Uncertain. Producing clear speech on demand has Moderate evidence, but keeping it at normal speed is Weak, and some talkers gain little (Add. §3.2, §3.3 #3). French starts mid-cycle, so the dose is small. Drift in usual speech: [None found]. |
| S8 | At least 4 sessions a week in at least 9 of 12 weeks | Adherence is the main risk (Add. §4.1) |

**Listener panel** (optional; weeks 0 and 12, plus 4 and 8 if possible)
- **Listeners:** 3–5 trained listeners or about 10 untrained ones. Friends with a short briefing count as untrained. For the international target, mix native and proficient non-native listeners (decision D5).
- **Tasks:** listeners write down the unpredictable sentences without seeing the text, and rate 20–30-second retell clips from 1 to 9 with the story prompt visible.
- **Clips:** shuffled and undated, with fixed reference clips and about 10% repeated clips. The app leaves out a listener whose repeated ratings differ by more than 1 point on more than 30% of repeats (a heuristic).
- **Delivery:** your phone encrypts the clips. The key travels in the link's fragment (the part after "#"), which the browser never sends to the server. Links expire after 14 days. A zip and CSV pack is the fallback.

### 6.8 Habit design

| Feature | Design | Evidence |
|---|---|---|
| Goal tied to real use | Set at onboarding and shown on Today | Brief §7 cap. 11 [Moderate–Weak] |
| Weekly target, not a streak | Default 4 (range 3–6), shown as dots. A missed day changes nothing. | Brief §2 #11; Lally 2010 [Weak; outside language learning] |
| If-then plan and backup plan | "After my morning coffee, I do one 10-minute session. If I miss it, I do the 5-minute version on the train." | Brief §3.6 [Moderate; outside language learning; about d = .15 after bias correction] |
| One reminder | A recurring calendar event (an `.ics` file) by default. Web push is optional, for the installed app (iOS 16.4 and later; checked by review). | Add. §5.7 [Weak] |
| A session is always possible | 5-minute and listening-only sessions count | Add. §4.1 [Weak] |
| Comeback session | 3 minutes; starts on your strongest target; no backlog; counts toward the target | Add. §4.1, §5.7 [Weak] |
| Pause mode | For holidays: no reminders, and no comeback prompt until it ends | Design choice |
| Weekly 20-second review | "Last week 4 of 4. Keep the plan?" plus an optional one-tap "What got in the way?" | Design choice |
| Early successes | Sessions open with listening, and the wrap-up names what you did | Self-efficacy correlates with achievement; past success is its strongest source (Brief §3.6 [Moderate; correlational]) |
| Then & Now | Monthly: your week-0 clip and your latest clip of the same task, in an optional blind "Which is newer?" game. Plain statements such as "On new words you now put stress right 8 times out of 10; in week 0 it was 5." | Brief §7 cap. 11 [Weak–Moderate] |
| Honest labels | "Practice, not progress"; one line explaining why mixed practice feels harder but works better | Brief §3.5, Abel & de Bruin [Moderate; outside language learning] |
| Real-life task | "Use *develop* in a meeting and notice the stress." Logged with one tap. | Brief §3.6, Derwing & Munro [Weak] |
| Adherence gate | Below 3 sessions a week for 3 weeks: the app suggests a shorter default session and a new cue time. We add no new module. | From the lean-mvp and measurement designs |

### 6.9 Architecture

```
PHONE (installed PWA: React + TypeScript)                     CLOUD
+------------------------------------------+
| UI: Today, Session, Progress, Check       |
| core (pure TypeScript): session builder,  |
|   scheduler, target model, trust levels,  |
|   statistics, feedback rules              |
| Hear player: cached audio, no mic         |     HTTPS     +-----------------------+
| Say/Use capture: AudioWorklet ->          |-------------->| Cloudflare Worker      |--> Azure token service
|   16 kHz PCM -> quality gate              |<--------------|  /pair /speech/token   |    (key stays here)
| DSP Web Worker (pure TypeScript): VAD,    |  access token |  /backup /panels       |
|   pitch, pauses, prominence, 1-3 kHz      |               +----+-------------+----+
|   energy, noise mixing                    |                    |             |
| Scorer: Azure JS SDK | Fixture scorer     |             +------v------+ +----v--------+
| IndexedDB: attempts, audio, Checks, eras  |--encrypted->| R2 storage  | | D1: token   |
| Backup: AES-GCM encryption on the phone   |  parts      +-------------+ | hashes,     |
+--------------------+---------------------+  (<100 MB)                   | counters    |
                     | WebSocket + 10-minute token                         +-------------+
                     | (word items: sent after the quality gate;
                     |  retell rounds: streamed while you speak)
                     v
     Azure Speech: en-US and fr-FR pronunciation assessment;
                   en-US and fr-FR speech-to-text

Static app and content packs: Cloudflare static hosting -> service-worker cache on the phone
```

**Audio pipeline**
1. **Start.** The Say stage starts on a tap. The app creates one AudioContext and one microphone stream, and sets the audio session type.
2. **Capture.** An AudioWorklet posts 20 ms frames to a Web Worker. The Web Worker filters the audio to prevent aliasing (distortion from high frequencies folding down), resamples it to 16 kHz mono 16-bit PCM, and keeps a 300 ms buffer before speech starts.
3. **Voice activity detection (VAD).** An energy detector adapts to the room's noise level. It stops a take 0.8 s after speech ends. Words are capped at 8 s, sentences at 15 s and retell rounds at 60 s.
4. **Quality gate.** The app asks for a retake if:
   - more than 0.1% of samples are clipped;
   - the peak level is below −35 dBFS (decibels below full scale);
   - the SNR is below about 15 dB;
   - the speech lasts less than 250 ms.

   Test V3 tunes these thresholds.
5. **Send.** Word items go from the buffer into the SDK's push stream. Retell rounds stream live. Requests go one at a time.
6. **Store.** A WAV file goes into IndexedDB. The metadata includes the device, browser, sample rate, applied settings, noise level and SNR.
7. **End.** The app stops the tracks, closes the AudioContext and releases Wake Lock.

**Fallback order if iOS fails the phone test**
1. A Capacitor shell with native audio capture. The same SDK code sends the audio.
2. A small relay server that runs the Speech SDK. This keeps spoken phonemes. It is unverified for this exact use.

The REST short-audio API is not a fallback (section 2.7).

### 6.10 Scoring and analysis per feature

| Feature | Language | What computes it | Where | Starting trust level |
|---|---|---|---|---|
| Listening trials | EN, FR | Answer key | Phone, offline | Exact |
| Vowel contrasts | EN | Azure en-US: the top spoken phoneme (up to 5 candidates, in IPA) and its margin, plus vowel length from phoneme timings. When the margin is unclear, the app scores the stored audio against both words, one request at a time on F0. | Azure + phone | Silent |
| /h/ dropped | EN | Azure /h/ phoneme score and spoken phoneme | Azure | Silent |
| /h/ added | EN | Scoring against both words (eat vs heat), plus a phone check for breath noise before the vowel (experimental) | Azure + phone | Silent |
| Stressed syllable | EN | Azure en-US syllable timings. The phone adds, for each syllable, the length (normalised), the pitch peak in semitones relative to your median, the loudness peak, and vowel reduction (spoken phoneme: schwa or full vowel). A weighted model picks the strongest syllable and a confidence margin. | Azure + phone | Silent (compare bars) |
| Sentence stress | EN | Word timings plus prominence at the target word | Azure + phone | Silent |
| Fluency | EN | Transcript and word timings from Azure continuous recognition. Syllable counts from CMUdict (for French, counting from text beat counting from sound in one study of teenagers, Brief §3.4 [Weak]). Pauses of at least 250 ms from VAD and word gaps; the 250 ms threshold is unverified as a standard. A rule-based clause splitter labels pauses as mid-clause or at a boundary. Pauses are read against your French baseline. | Azure + phone | Hint after V7 |
| Target words in a retell | EN | Transcript, then a scripted assessment on that transcript, then the stress model on the target words | Azure + phone | Silent (agreement is lower for unscripted speech, Brief §3.7) |
| Machine listener | EN | Azure en-US speech-to-text: word accuracy on unpredictable sentences | Azure | A Check measure, labelled lenient |
| Prosody score, break and monotone flags | EN | Azure prosody (costs extra), on Check retells and anchors only | Azure | Stored only; in Details |
| Pitch range, pauses, rate | FR | Phone DSP, using Azure fr-FR word timings | Phone + Azure | Hint after V9 |
| Vowel and word length | FR | fr-FR timings mapped through the app's lexicon, or syllable peaks as a fallback. Whether fr-FR phoneme timings are usable is unverified. | Phone + Azure | Silent |
| 1–3 kHz energy, formants | FR | Phone FFT (frequency analysis) and LPC (linear prediction, a common way to estimate formants) | Phone | Hidden experiment |
| Clarity in noise | FR | The phone mixes babble into your WAV at a set SNR. Azure fr-FR speech-to-text then measures keyword accuracy. | Phone + Azure | A Check measure after V9 |
| Azure fr-FR accuracy | FR | Azure fr-FR pronunciation assessment | Azure | Stored, never shown |

**Validation tools** (on your laptop only; never in the app)
- Praat through Parselmouth serves as a reference for the app's own DSP. The phone's numbers must match it within set tolerances.
- MFA can cross-check Azure timings on validation clips.
- These tools use a separate Azure S0 resource when they call Azure (section 2.7).

### 6.11 Data model outline

**On the phone (IndexedDB, through the Dexie library)**

| Store | Key fields |
|---|---|
| `profile` | varieties, target listener, goal, weekly target, plan, backup plan, reminder, English/French split, stress share |
| `contentPacks` | pack id, version, manifest hash, cached status |
| `sessions` | id, start, end, length chosen, stages done, counts toward target (yes/no), language |
| `listeningTrials` | session id, item id, voice id, test-only (yes/no), answer, correct, response time |
| `attempts` | session id, item id, target ids, kind (first / self-correction / after model), audio id, quality results, applied mic settings, scorer provenance (provider, locale, SDK version, era id, date, device), raw Azure JSON, derived measures, a verdict per detector with its trust level, self-check answer, dispute |
| `audio` | id, blob (WAV), kind (practice / check / anchor / baseline / validation), keep-until date, starred |
| `targets` | target id × mode (hear or say): estimate parameters, status, instance counts (words, sessions), self-correction count, dose counts, block, tier |
| `reviewQueue` | item family, due date, step (intervals from the settings file) |
| `checks` | id, week, form, parts done, audio ids, results for each era |
| `eras` | id, start, reason (model update / monthly drift / new phone), SDK version |
| `detectors` | id, trust level, thresholds, validation report path, history |
| `panels` | id, clip ids, link status, imported results |
| `backups` | last snapshot id, date, size, parts |

**Retention.** The app keeps practice audio for 30 days, unless it is starred, disputed or used for validation. It keeps baseline, Check and anchor audio for good. That is about 150–250 MB of rolling practice audio, plus about 25 MB per Check.

**Why not OPFS.** Audio goes in IndexedDB rather than OPFS (the browser's private file system). OPFS's simple write method (`createWritable`) needs Safari 26. Its older method works only inside a Web Worker (Safari 15.2 and later) (checked). IndexedDB is simpler and easy to fake in tests.

**On Cloudflare**
- **D1** (a small SQL database): hashed device tokens, rate counters and panel metadata. No learner content. The app does not use KV (a key-value store): its free plan allows only 1,000 writes a day, and it is slow to update across locations (checked).
- **R2:** encrypted backup snapshots (the last 8 are kept) and encrypted panel packs (kept 14 days).

### 6.12 API sketch

| Method and path | Access | Purpose |
|---|---|---|
| `POST /api/pair` `{pairingCode}` → `{deviceToken}` | One-time code (a Worker secret) | Pair your phone |
| `POST /api/speech/token` → `{token, region, expiresAt}` | Device token | Azure access token. At most 30 an hour and 200 a day. |
| `PUT /api/backup/:snapshotId/parts/:n` | Device token | Upload one encrypted part of a snapshot (under 100 MB) |
| `GET /api/backup`, `GET /api/backup/:id`, `DELETE /api/backup/:id` | Device token | List, download or delete snapshots |
| `POST /api/panels` → `{panelId, listenerLinks[]}` | Device token | Create a listener panel |
| `PUT /api/panels/:id/clips/:clipId` | Device token | Upload an encrypted clip |
| `GET /l/:listenerToken` | Link token (expires after 14 days) | Listener page |
| `GET /api/l/:listenerToken/pack` | Link token | Encrypted clips for that listener |
| `POST /api/l/:listenerToken/responses` | Link token | Answers, encrypted in the listener's browser |
| `GET /api/panels/:id/responses`, `DELETE /api/panels/:id` | Device token | Collect results; delete the panel |
| `GET /api/health` | None | Health check |
| `POST /api/talk/turn` | Device token | **Only if you turn on the optional LLM talk partner** (off by default) |

The app itself and the content packs are static files with long cache lives. Nothing else is served.

### 6.13 Testing strategy (no live services needed)

| Layer | What is tested | How |
|---|---|---|
| `packages/core` (pure TypeScript) | Session builder, scheduler, blocked-then-mixed rule, target model, statistics (estimates, RCI, NAP), trust-level rules, feedback rules, first-attempt rule, held-out separation | Vitest with a fake clock. Property tests with fast-check, for example: "no held-out item is ever scheduled in practice"; "more instances never widen the range"; "self-corrections never change an error estimate". |
| `packages/dsp` (pure TypeScript) | Resampler, WAV encoder, VAD, quality gate, pitch, pauses, prominence, band energy, noise mixing | **Synthetic signals:**<br>• sine waves of known pitch (within ±0.5 semitone);<br>• shaped "syllables" of known length (within 10 ms);<br>• noise at a known SNR (within 2 dB);<br>• clipped signals and silence;<br>• frequency sweeps to check aliasing (below −40 dB).<br>**Golden fixtures:** 20–40 short WAV files (your voice and TTS), with expected values computed once by Parselmouth and committed as JSON. |
| Scorer adapter | Request settings; parsing of en-US words, syllables, spoken phonemes and prosody; parsing of fr-FR results; timeouts; token refresh; one-at-a-time queue | **Recorded Azure JSON** from the R1 phone test, cleaned and committed. `FixtureScorer` replays results by audio hash. v1's bugs become named tests. |
| Live contract tests | 10 real calls (en-US, fr-FR) | `npm run test:live`, run by hand, never in CI. A monthly run flags changes in Azure's response format. |
| Storage | Schema, migrations, retention, backup encryption round trip, splitting into parts under 100 MB, export and import | fake-indexeddb |
| Worker | Pairing, tokens, rate limits, backups, panel links and their expiry | `@cloudflare/vitest-pool-workers`, with Azure's token call mocked |
| UI | Cards, trials, flows | React Testing Library with the fixture scorer |
| End to end | A full session | Playwright in Chromium with a fake microphone fed from a WAV file (`--use-fake-device-for-media-stream --use-file-for-fake-audio-capture`; checked by review). WebKit cannot fake microphone input, so each release also gets a **manual checklist on your iPhone and an Android phone**. |
| Content | Schema, stress patterns, one-sound pairs, variety-dependent stress, held-out overlap and counts, variety tags, licences | Vitest over the content files, in CI |
| CI gates | Type check, lint (warnings count as errors), all tests, build, key scan (section 2.8) | Every commit (the CLAUDE.md pre-commit rules) |

### 6.14 What happens to v1 code

1. **Now:** shut down the Render service and rotate the Azure key.
2. Tag `v1-final`, push the branch `archive/v1`, and record the decision in `docs/adr/001-v2-rewrite.md`. An ADR (architecture decision record) is a short note of one decision and its reasons.
3. **Keep:**
   - the WAV encoder idea and its tests, rewritten test-first in `packages/dsp`;
   - the Vitest scaffolding patterns;
   - the docs and backlog conventions (status icons; tasks named `R{n}-T{NN}`);
   - everything in `docs/research/`.
4. **Delete:**
   - the Express server, the TTS proxy, the SQLite schema and migrations;
   - `useRecorder`, the speed ladders and the articulation index;
   - the practice-average charts and the progress service;
   - the v1 content packs. Several items are mis-tagged, and the nasal-vowel examples are swapped;
   - `render.yaml`.
5. **Update, in the same changes as the code:**
   - `CLAUDE.md`: stack, commands, pre-commit list, and a new check on your phone for audio changes;
   - `docs/prd.md`, `product-design.md`, `technical-design.md` and `api-reference.md`;
   - `database-schema.md`, which becomes the IndexedDB schema;
   - a new backlog, R1–R13, replacing F1–F6.

### 6.15 Rules for the build order

- **One epic in progress at a time.** Every task follows Red → Green → Refactor.
- **Baseline before any training.** Slice 1 records the baseline before the first practice session.
- **Check 1 is due at practice week 4.** So Check recording (R5) ships before Check analysis (R10). The audio waits safely in storage.
- **Decision gates at each Check can stop the build.** If adherence falls below target, we fix friction before we build the next epic.
- **French timing (D14).** By default, R8 follows R7. If you choose "early", R8's first version (paired takes and the compare player) ships right after slice 1. It needs only R2's audio capture. French then starts about practice week 2–4, and slices 2–3 move about a week later.

### 6.16 Build roadmap

**Effort, for one developer with AI agents:** S = 2–4 days, M = 1–2 weeks, L = 3–4 weeks.

| Epic | Goal | Main tasks | Effort | What ships |
|---|---|---|---|---|
| **R1 Reset and phone test** | A clean start, and a go or no-go on your phone | • Shut down Render and rotate the key; tag v1; write ADRs.<br>• Set up the workspace (`apps/pwa`, `apps/worker`, `packages/core`, `packages/dsp`, `tools/content`), TypeScript strict mode, ESLint, Vitest, and CI with the key scan.<br>• Worker endpoints `/pair`, `/speech/token` and `/health`, with tests.<br>• A PWA shell deployed over HTTPS.<br>• **Phone test:** a throwaway capture spike → WAV → token → SDK → en-US assessment with IPA, spoken phonemes, prosody and syllables. 50 attempts on Wi-Fi and 4G. Check playback routing with the mic closed and then open, the audio-session setting, mic permission prompts, the mic settings actually applied, and a 60-second continuous round.<br>• Record the Azure JSON fixtures.<br>• Update CLAUDE.md. | S–M | The app is installed and shows "Paired ✓". A test report with the PWA-or-Capacitor decision. |
| **R2 Audio core** | Reliable recording on both phones | AudioWorklet capture, resampler, WAV encoder, VAD, quality gate, mic that opens at the Say stage, playback that never overlaps recording, audio session, interruptions, Wake Lock, IndexedDB audio store, `storage.persist()`, a record-and-replay screen | M | A mic check and record/replay with quality verdicts |
| **R3 Content, Hear trainer, baseline** | Real training starts | • Content pipeline: CMUdict and SUBTLEX, pair finder, SSML wrong-stress versions, TTS rendering, check against the competing word, frozen held-out split with a failing test.<br>• Packs v0, kept small: stress and /iː–ɪ/ items for the first 2–3 weeks, Check forms A (baseline) and B (Check 1), anchors, baseline prompts. /uː–ʊ/ and the rest follow before they are due.<br>• HVPT engine: identification, stress shapes, sequence recall, stress-pattern quiz, voice pools, test-only voices, difficulty steps, blocked-then-mixed.<br>• Offline cache.<br>• Onboarding: goal, weekly target, if-then plan, calendar file.<br>• The 2 baseline sittings (stored first, analysed later).<br>• 5-minute Hear sessions, listening-only sessions, weekly dots, ZIP export. | M | **Slice 1, "Listen Starter" (the first shippable slice):** your baseline, then daily listening sessions offline. Practice week 1 starts. |
| **R4 Say stage, Azure silent** | Speaking practice with self-check | • `SpeechScorer`, `AzureSdkScorer` and `FixtureScorer`; token cache and refresh; gate-then-send; one-at-a-time queue; timeouts and "still checking".<br>• Parser with v1-bug regression tests; scorer provenance and eras.<br>• Say trials (stress with dots; /iː–ɪ/); self-check and model; retry sequence; first-attempt rule; dispute button.<br>• Session builder v1 (Hear → Say → Wrap; 5 and 10 minutes). | M | **Slice 2:** listen-and-say sessions |
| **R5 Check recording and backup** | Check 1 on time, and safe | Check flow (parts A and B, forms, calm colours, no feedback, 2 sittings, ±3 days); anchors; AES-GCM backup to R2 after each Check and weekly (data plus Check audio, in parts under 100 MB); a restore test; storage status | M | Check 1 is recorded and backed up |
| **R6 Use stage** | Transfer to free speech | 48 story cards; continuous recognition; transcript-then-scripted assessment; fluency measures and clause splitter; 60/50/40 rounds; one tip between rounds; rephrase prompt; measurement of first tellings only; comeback session; 15-minute session builder | M | **Slice 3:** the full 10-minute session |
| **R7 Blocks B and C** | /h/ and the low vowels | /h/ pack (both kinds of made-up words) and real-word decisions; /æ–ʌ–ɑ/ pack; weak-form listening; sentence-stress dialogues; scoring against both words; vowel-length bars; mouth pictures; block scheduler with tiers, dose counts and the extension rule; natural test recordings; Check forms C–E | M | Block B ready for practice week 5, or as soon after as possible (C for week 9) |
| **R8 French clarity, first version** | Your second goal in cycle 1 | French packs; warm-up; paired takes with cue and listener cards; compare player; "Which would your listener catch better?"; retell with start/end playback; rate measure and rate check; French phone measures logged silently | S–M | **Slice 4:** 5-minute Français clair sessions |
| **R9 Trust levels and validation** | Trustworthy hints and corrections | Detector registry and data file; rules for moving up and down (with property tests); validation sittings for known-answer checks; import of listener labels (CSV); reports in `docs/validation/`; stress model v1; hint and correction cards; accepted-variant lists; review of disputes | M | Detectors move up as they pass V4–V6 |
| **R10 Check analysis and Progress** | Honest progress | Re-scoring of all Check audio in the current era; target model; statuses; RCI and NAP; result wording; Progress and Target screens; Then & Now with the blind game; delayed probes; monthly anchor re-score; Cycle Report | M–L | Reports for Checks 1–2, with ranges |
| **R11 Panel and habit tools** | Human judgement, and staying with it | Encrypted panel packs, listener page, shuffled clips, reference and repeated clips, results with a noise band, zip/CSV fallback; weekly review, pause mode, real-life tasks, adherence prompts, optional web push | S–M | Panel ready for week 12 |
| **R12 French measures and noisy café** | The full French track | Babble generation; noise mixing on the phone; SNR setting; the ASR-partner game; fr-FR keyword accuracy; French Check analysis; V9 | M | The complete French track |
| **R13 Experiments (optional; each off by default)** | Test open questions on you | Shadowing; a pitch line in semitones that fades out; "tap the beat" in alternating weeks; an LLM talk partner (text only, never scores); a SpeechSuper pilot on 40–60 items, with its key kept on your laptop; the Capacitor wrap (this moves to R2 if the phone test fails) | S each | Each experiment can be switched on and has its own before-and-after |

**Timing.** Total for R1–R12: about 16–22 build weeks. The epic sizes add up to between about 11 and 26 weeks. You practise from about build week 3–6. If you stop after R6, plus the /h/ part of R7 and the core of R10 (re-scoring, target model and Progress screen), you have Option A.

### 6.17 Validation plan on your voice and your phone

All thresholds below are heuristics, set before the data come in.

| # | When | Protocol | Pass rule → consequence |
|---|---|---|---|
| V1 | R1–R2 | 20 takes on your iPhone (home-screen app) and 20 on an Android phone. Hold a steady vowel and compare the phone's pitch with Praat offline. Check playback volume and routing while the mic is open, with each audio-session setting. | 20 of 20 takes valid; pitch within ±1 semitone on at least 90% of voiced frames; no repeated prompt within a session; model audio clearly audible from the loudspeaker. **Fail → Capacitor.** |
| V2 | R1 | 50 short attempts on Wi-Fi and 4G | Median at most 2.5 s and 90th percentile at most 5 s from end of speech to card. Fail → keep the "still checking" flow and rely more on instant phone signals; consider Capacitor or a server-side SDK. |
| V3 | R4–R5 | Anchor sentences × 2 takes × mic processing on/off × quiet and normal room, on 2 days | SEM and ICC (a 0–1 test–retest agreement score) for each measure. Choose the setting with the lower SEM. Measures with ICC below .70 are never shown as trends. |
| V4 | R9 | Vowel and /h/ known-answer check: you say each member of each contrast on purpose (40 items per contrast); plus native and TTS reference words | Precision of at least .80 for each error type, at least 95% on the references, and at least 80% of verdicts repeating → **Hint**. Deliberate errors are cleaner than natural ones, so V4 probably overstates precision on natural speech. |
| V5 | R9, when a listener is available | A native listener labels 40–60 of your natural attempts per detector, without seeing Azure's verdict | κ ≥ .60 and precision ≥ .80 → **Correction**. Prefer 60 attempts: with 40, κ can be off by about ±0.25. |
| V6 | R9 | Stress: (a) TTS right and wrong versions, 6 voices × 50 words; (b) 40 words said right and deliberately wrong, twice; (c) about 200 natural attempts labelled by 1–2 native listeners | (a) at least 95%; (b) precision of at least .85 → Hint; (c) κ ≥ .60 and precision ≥ .85 → Correction. **Failure is likely.** One research system was right 95% of the time when it flagged a stress error, but it found only 49% of real errors (Add. §4.2 [Unverified]). Compare mode stays useful. |
| V7 | R6 | You hand-label pauses and clause edges in 20–30 retell clips | Pause edges within ±50 ms; mid-clause labels agree at least 80% of the time; pause counts correlate at r ≥ .8. Otherwise the app shows only total pauses and rate. |
| V8 | Each content pack | Automatic check against the competing word; native-listener identification if available; TTS–natural gap | At least 90% per voice per contrast. A gap above 10 points is flagged. |
| V9 | R8, R12 | French: 10 sentences, usual and clear, on 3 days. Find the SNR at which your usual speech gets 60–80% of keywords. 1–2 French listeners transcribe 20 noisy clips. | A "changed" label is shown only when the difference exceeds twice the day-to-day spread. ASR is used only if it ranks usual and clear takes the same way as the humans. |
| V10 | Monthly, and after any phone change | Re-score 20 reference clips (anchors plus native clips) | A shift larger than the RCI starts a new era, re-scores the Check audio, and drops detectors one level until they are re-checked |
| V11 | Each panel round | Repeated and reference clips | Inconsistent raters are left out |

### 6.18 Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| iOS web audio: quiet or earpiece playback, permission prompts, interruptions | Medium | High | No mic during the Hear stage; playback never overlaps recording; audio-session setting; V1; Capacitor |
| The Azure SDK is slow or fails on iOS | Medium | High | V2; "still checking"; Capacitor or a server-side SDK. Not the REST API. |
| Stress detection never passes validation | High | Medium | Listening-first stress training needs no verdict; compare mode; the panel |
| Azure model updates move scores | Certain | Medium | Eras; re-scoring all Check audio; monthly anchors |
| No human listeners | Medium | Medium | Hints need no listener; the machine listener is labelled lenient; paid listeners are optional |
| The dose is too low (stress about half the estimate; vowels at the low end) | Medium | Medium | Dose counted in trials; blocks extend; listening-only sessions; D8's larger stress share; cycle 2 |
| French starts late in cycle 1 | High | Medium | D14's early option; French continues in cycle 2 |
| You stop practising | Medium | High | 5-minute and listening-only sessions; comeback session; weekly review; adherence gate |
| Scope is too large for one developer | High | High | Build in A's order; each slice useful alone; gates; experiments stay in R13 |
| Lost backup passphrase or lost phone | Low | High | Passphrase reminder at setup; ZIP export; automatic backup after each Check |
| Free-tier limits (1 request at a time, 5 hours) | Medium | Low | Requests one at a time; laptop tools on a separate S0 resource; usage warning at 70%; S0 at about $3–8 |
| Held-out items run short | Medium | Medium | Speaking probes use any word with the sound; 50 per target; listening pairs reused in new test voices |
| TTS voices blur a contrast | Medium | Medium | Check against the competing word; native-listener check; natural test recordings; gap alert |
| Privacy of panel clips | Low | Medium | Opt-in; Check clips only; encryption with the key in the link fragment; 14-day expiry; deletion |
| Misuse of the token endpoint | Low | Medium | Pairing; revocation; rate limits; F0 hard cap or a budget alert |

---

## 7. Evidence map

| Feature | Evidence source | Strength |
|---|---|---|
| Intelligibility and comprehensibility as the goal; Azure accuracy secondary | Brief §1, §2 #1; Add. §5.1 | Strong / Moderate |
| Progress Checks separate from practice: held-out items, new prompts, delayed probes | Brief §2 #2, §3.2, §7 cap. 1 | Strong (principle); Moderate (design) |
| Practice performance is not learning; no practice charts as progress | Brief §3.5 (Soderstrom & Bjork) | Moderate |
| Pooling 15–20 instances, 5 words, 3 sessions; ranges, not points | Brief §2 #10, §3.7, §7 cap. 3 | Strong (the noise is real); Weak (the thresholds) |
| Anchor sentences, twice at every Check; SEM, RCI, NAP; no Tau-U | Brief §3.7 (single-learner statistics), §7 cap. 1 | Moderate |
| Three staggered targets (multiple baseline) | Brief §3.7 (Kratochwill; not re-checked) | Moderate (method) |
| Scoring eras; re-scoring stored audio; monthly anchor re-score | Brief §3.7, §4; Add. §4.2, §5.11 | Strong (model updates are documented) |
| Only first attempts count; self-corrections logged separately | Brief §3.2 (implications for the app) | Design inference |
| Panel: message known for ratings; text hidden for transcription; shuffled, undated, reference clips | Brief §3.7 (De Fino; Flege & Fletcher; Yoho), §4, §7 cap. 1 | Moderate |
| 3–5 trained or about 10 untrained listeners | Brief §3.7, §7 cap. 1 | Moderate |
| Machine listener (ASR) as a lenient check only | Add. §5.12; Brief §3.7 | Moderate / Mixed |
| Onboarding diagnostic; errors are only candidates; skipping a block needs probes | Brief §2 #9, §7 cap. 2 | Moderate |
| Target priority model | Brief §2 #6, §7 cap. 3 | Moderate (English); Weak (French) |
| HVPT listening trainer | Brief §2 #3, §3.1; Add. §2 notes | Strong (listening); Moderate (speaking) |
| Identifying the word, with labels and instant feedback | Brief §3.1 (Carlet & Cebrian) | Moderate |
| 4 training voices plus test-only voices and natural recordings | Brief §3.1 | Mixed (number of voices) |
| TTS voices checked for the contrast; TTS–natural gap flagged | Brief §3.1 | Weak |
| Listening dose: about 45–50 minutes per block (about 1.5 hours for the vowels), with extension | Brief §3.1, §7 cap. 4; Add. §4.1 | Moderate (1–7 hours for a vowel set); at the low end; unknown for short sessions |
| Listening and speaking in separate stages for new contrasts | Brief §3.1 (Baese-Berk & Samuel), §4 | Weak (lab listeners) |
| Listening first | Brief §3.3 (Lee, Plonsky & Saito 2020) | Weak |
| Blocked, then mixed | Brief §3.5 | Mixed |
| Word stress first; about 4 hours (target), about 2 planned in cycle 1 | Add. §2 r1, §4.1, §5.3; Brief §3.3 | Moderate (priority); Weak (training) |
| Hard stress tasks (many voices, sequence recall) | Add. §2 notes (Dupoux); Add. §6 | Moderate |
| Teaching and quizzing each word's stress pattern | Add. §2 notes (Tremblay 2008) | Moderate |
| Stress dots hidden on reviews (recall) | Brief §3.2 (Yang et al. 2021) | Moderate (outside language learning; untested for pronunciation) |
| Stress feedback only after validation | Add. §4.2 (Korzekwa), §5.3, §7 Q1; Brief §3.7 | Unverified / Weak |
| Vowel pairs, with the heard vowel named | Add. §2 r2, §5.5 | Moderate (8 sessions per pair is a guess) |
| /h/ with real-word decisions; dropped and added /h/ tracked apart | Add. §2 r3, §5.6, §6 | Moderate (one study) |
| /θ ð/ monitored only | Brief §5.1 (low priority); Add. §2 r7 | Weak–Moderate / Not searched |
| Clusters monitored and probed, not trained by default | Brief §5.1 ranks them high; Add. §2 r7 ranks final clusters last | Moderate (Brief, correlational) vs Not searched (Add.): a judgement call; the probes decide |
| Corrective feedback plus retry | Brief §2 #5, §3.2; Add. §5.4 | Moderate |
| Self-correction before the model | Brief §3.2 (Lyster & Saito) | Mixed |
| At most 1–2 corrections per attempt | Brief §2 #5 | Weak |
| Short cue and mouth picture | Brief §3.1 (Hirata & Kelly), §3.2 (Saito 2013 vs Kissling 2013); Add. §5.14 | Mixed / Weak |
| Self-check on 1 attempt in 4 | Brief §3.2, §3.6 | Weak |
| Trust levels; confidence threshold; dispute button; accepted variants | Brief §3.7, §7 cap. 5 | Strong (noise is real); design heuristics |
| Use stage: retell ×3, new prompt next session | Brief §2 #8, §3.4, §7 cap. 8 | Moderate |
| Gently shrinking limits (60/50/40); rephrase prompt | Brief §3.4 (Tran & Saito 2021, 4/3/2; Suzuki & Hanzawa 2022; Boers 2014) | Moderate / Weak |
| Targets used in real speech | Brief §2 #13 | Weak–Moderate |
| Fluency measures: articulation rate, mid-clause pauses, run length | Brief §3.4 (Suzuki & Kormos; Chau & Huensch) | Moderate |
| French baseline as the first-language pause reference | Brief §3.4 (Kahng 2020; de Jong et al. 2015) | Weak–Moderate |
| Rate judged against a band; no speed reward | Brief §3.4, §4 | Moderate (listener ratings) / Weak–Moderate |
| Sentence-stress dialogues | Brief §3.3 (Hahn 2004), §7 cap. 7 | Moderate |
| Weak forms for listening | Brief §5.1; Add. §2 r5 | Mixed |
| Pitch line, experimental | Brief §2 #14, §7 cap. 7 | Weak |
| "Tap the beat", experimental | Brief §3.3, §7 cap. 12 | Weak (mostly children) |
| Shadowing, experimental | Brief §3.4; Add. §5.13 | Weak |
| LLM talk partner, off | Brief §3.4 (Bibauw: no pronunciation outcome) | Moderate (dialogue systems); Weak (LLM voice chat) |
| Spacing at 1/3/7/14/28 days, in a settings file; at most 3 repeats; backlog cap | Brief §3.5, §7 cap. 6; Add. §5.8 | Strong (L2 in general); Weak (pronunciation) |
| 12-week cycles; at least 4 sessions a week; 10-minute default | Brief §3.5, §7 cap. 6; Add. §4.1, §5.7 | Moderate (longer programs); Weak (session details) |
| Dose counted as trials and attempts | Brief §3.5 | Weak |
| Weekly target, never a streak | Brief §2 #11, §3.6 (Lally) | Weak (outside language learning) |
| If-then plan | Brief §3.6 | Moderate (outside language learning; small effect) |
| Comeback session; review cap | Add. §4.1, §5.7 | Weak |
| Then & Now; plain statements of what is now reliable | Brief §2 #11, §3.6, §7 cap. 11 | Weak–Moderate |
| Explaining why mixed practice feels harder | Brief §3.5 (Abel & de Bruin) | Moderate (outside language learning) |
| Real-life task log | Brief §3.6 (Derwing & Munro) | Weak |
| French paired recordings | Brief §2 #12, §5.3; Add. §3.3 #1, §5.9 | Moderate (immediate); None found (lasting) |
| Concrete cues and a named listener | Add. §3.2, §3.3 #2 | Moderate ("over-enunciate" and a named listener); the mouth cues are untested |
| Clear at your normal speed | Add. §3.2, §3.3 #3; Brief §5.3 | Weak |
| Noisy-café ASR partner (noise mixed in after recording) | Brief §5.3 (Buz 2016), §7 cap. 10 | Moderate (immediate; native English); untested whether it lasts. Noise heard while speaking (Add. §3.3 #4) is not used. |
| ASR in noise as a French check | Add. §3.4; Brief §5.3 | Mixed |
| Several French measures against your own baseline; no single score | Add. §3.4 | Mixed |
| Retell clarity drop; warm-up | Add. §3.3 #5, #7 | Weak |
| French vowel probes hidden until stable | Add. §3.3 #6, §3.4 | Moderate / Mixed |
| No Azure fr-FR accuracy for native French | Brief §3.7, §5.3; Add. §3.4 | Strong (technical) |
| HTTPS; AudioWorklet; 16 kHz WAV; MediaRecorder as fallback only | Add. §4.2, §5.2 | Strong |
| Quality gate before scoring | Add. §4.2 (Microsoft guidance), §5.2 | Strong (guidance) / Moderate |
| Mic open once per session; discard takes when the page is hidden | Add. §4.2, §5.2 | Moderate / Weak |
| Instant phone signals; cloud result within 2–3 s | Add. §4.2, §5.10 | Weak (time targets) |
| en-US only for spoken phonemes, syllables and prosody | Brief §3.7; Add. §4.2 | Strong |
| No speed ladders or tongue twisters | Brief §4; Add. §5.15, §6 | No evidence / None found |
| No rhythm scores as targets | Brief §3.3, §4; Add. §2 notes | Moderate / Mixed |
| No audio-LLM judge | Brief §3.7 | Weak |

---

## 8. Decisions for you

Each decision has a recommended default. Where you have no preference, say "default".

| # | Decision | Choices | Recommended default |
|---|---|---|---|
| D1 | Which option | A · B · C | **B**, built in A's order |
| D2 | Budget ceiling for hosting and APIs | $0 only · up to $10 a month · up to €18 a month | **Start at $0** (Azure F0 and Cloudflare free) for the phone. Ceiling of **$10 a month**. Laptop tools (content checks, validation) run on a separate Azure S0 resource at a few dollars in the months you use them. Move the phone to S0 (about $3–8) only if you reach the 5-hour limit. Prosody does not matter here, because no feature depends on it. $99 a year for Apple only if Capacitor is needed on an iPhone. |
| D3 | Platform | PWA · Capacitor · native app | **PWA**, confirmed by the R1 phone test. Capacitor if the test fails (on an iPhone, it needs a Mac). **Please send your phone model and OS version.** |
| D4 | French variety | fr-FR · fr-CA | **The variety you speak and your listeners speak.** If you grew up in France, choose fr-FR. Azure pronunciation assessment supports both (checked). This choice sets the voices, the ASR locale and which French contrasts count (Brief §5.2). |
| D5 | English target listener | International · native (North American) | **International.** Scoring uses en-US either way, because only en-US gives spoken phonemes. International means stress voices include en-GB and en-AU, and the panel mixes native and proficient non-native listeners. Native means all voices are en-US, the panel is native, and /θ ð/ and weak forms get more weight (Brief §5.1). |
| D6 | Human listeners | None · friends · paid | **Friends if possible:** 1 native English listener for about 2 hours of labelling (V5, V6); about 10 friends for about 20 minutes at weeks 0 and 12, because friends count as untrained listeners (3–5 are enough only if they are trained); 1–2 French listeners for V9. Without listeners, the app still works: hints are the highest trust level, and the machine listener is lenient. Paid listeners raise privacy questions, and their price is unverified. |
| D7 | English/French time split | 90/10 · 75/25 · 60/40 | **75/25** (French 1–2 times a week) |
| D8 | Program defaults | Cycle 8 or 12 weeks; weekly target 3–6; default length 5, 10 or 15 minutes; stress share of a 10-minute session: about 2 minutes or about 4 minutes | **12 weeks plus a week-16 probe; target 4 (5 planned slots); 10 minutes; stress about 2 minutes.** About 2 minutes gives about 2 hours of stress in 12 weeks, half the addendum's estimate. About 4 minutes reaches about 4 hours but roughly halves the time for the sound block. Revisit at Check 1 using your stress listening results. |
| D9 | Block order | Vowels first · /h/ first | **Vowels first**, following the addendum ranking. /h/ first is reasonable too: it has one tested 8-session protocol. |
| D10 | Cloud backup | On (encrypted) · off (ZIP export only) | **On.** You must keep the passphrase; without it the backup cannot be read. |
| D11 | Success criteria | Accept S1–S8 · edit them | **Accept them before practice week 1.** Changing them later weakens the test. |
| D12 | LLM talk partner | Off · on later | **Off.** The evidence is Weak, and it adds a second key and a cost. |
| D13 | Azure region | An EU region · another | **An EU region near you** (for example France Central or West Europe). Pronunciation assessment works in every speech-to-text region (checked). Microsoft says it does not store audio sent for real-time speech-to-text or pronunciation assessment (checked). |
| D14 | When French starts in Option B | After slice 3 (about practice week 6–10) · early (right after slice 1, about practice week 2–4) | **After slice 3.** This keeps the English build order and one epic at a time. Choose "early" if French matters to you in cycle 1: its first version is small (S–M), but slices 2–3 then arrive about a week later. |

---

## Appendix A: Technical facts and their status

| Fact | Status | Source |
|---|---|---|
| Spoken phonemes (`NBestPhonemeCount`), IPA names, syllables and prosody are en-US only. Continuous mode (for audio over 30 s) does not support miscue detection. For accurate recognised text, Microsoft recommends speech-to-text first, then a scripted assessment. | Checked | MicrosoftDocs `how-to-pronunciation-assessment.md` |
| Pronunciation assessment supports 33 locales, including en-US, en-GB, fr-FR and fr-CA, in every speech-to-text region | Checked | MicrosoftDocs language-support include; speech-to-text release notes |
| The REST short-audio Pronunciation-Assessment header documents only ReferenceText, GradingSystem, Granularity, Dimension, EnableMiscue, EnableProsodyAssessment and ScenarioId. Assessment audio: at most 30 s. Formats: WAV/PCM or OGG/Opus, 16 kHz mono. | Checked (documented keys). Whether REST accepts undocumented keys is unverified. | MicrosoftDocs `rest-speech-to-text-short.md` |
| F0 real-time speech-to-text allows 1 concurrent request, and the limit cannot be changed. S0 defaults to 100 and can be raised. | Checked | MicrosoftDocs `speech-services-quotas-and-limits.md` |
| The JS SDK (1.51.0, the latest on npm) exposes `nbestPhonemeCount`, `phonemeAlphabet` ("SAPI" or "IPA"), `enableProsodyAssessment`, `fromAuthorizationToken` and `PushAudioInputStream` | Checked | npm package; SDK source |
| The SDK's browser bundle is about 378 KB minified (about 76 KB gzipped) and contains the string `Ocp-Apim-Subscription-Key` | Checked | npm package 1.51.0 |
| Pronunciation-assessment models for en-US and fr-FR (and zh-CN, es-ES, es-MX, pt-BR) were updated in August 2026. No way to lock a version is documented. | Checked (update); Brief §3.7 (no lock) | Speech-to-text release notes |
| Access tokens last 10 minutes; Microsoft recommends reusing one for 9 | Checked | MicrosoftDocs REST authentication include |
| Pronunciation assessment costs the same as speech-to-text; prosody is an add-on charge | Checked | `pronunciation-assessment-tool.md` |
| Speech-to-text costs about $1–1.32 an hour; F0 gives 5 audio hours a month and 0.5 million TTS characters | Secondary | Search summaries; the official price page was blocked |
| Whether F0 includes prosody | Unverified | — |
| Microsoft does not retain audio sent for real-time speech-to-text or pronunciation assessment | Checked | MicrosoftDocs speech-to-text data, privacy and security |
| TTS bills every character in the SSML body, including markup, except the `<speak>` and `<voice>` tags | Checked | MicrosoftDocs `text-to-speech.md` |
| SSML IPA supports stress marks | Checked by review | MicrosoftDocs SSML pronunciation |
| Safari and iOS: AudioWorklet from 14.1; `storage.persist()` from 15.2; Audio Session API from 16.4 (not in Chrome); OPFS `createSyncAccessHandle` from 15.2 and `createWritable` from 26; Screen Wake Lock from 16.4, but in home-screen apps only from 18.4 | Checked | MDN browser-compat-data |
| Home-screen web apps are exempt from Safari's 7-day storage deletion | Checked by review | WebKit storage policy blog |
| Web push works for home-screen apps from iOS 16.4 | Checked by review | WebKit blog |
| WebKit bug 215884 is titled "getUserMedia recurring permissions prompts in standalone when hash changes". It is reported as resolved (February 2026). | Title: checked via search results. Status: secondary (the tracker was blocked). | bugs.webkit.org 215884 |
| An active microphone on iOS can lower playback volume or route it to the earpiece | Secondary (developer reports and WebKit bugs for some iOS versions). Your phone: unverified. | Search results |
| Apple Developer Program costs $99 a year; free signing expires after 7 days | Checked by review | Apple membership page |
| Chromium fake-microphone flags work; Playwright WebKit cannot fake microphone input | Checked by review | Chromium switches; Playwright |
| Azure-Samples issue #1327 (November 2021; SDK 1.18–1.19; browser; `recognizeOnceAsync` with pronunciation assessment): about 5% of requests took about 20 s | Checked (the report). Current behaviour: unverified. | GitHub issue |
| SpeechSuper: pay-as-you-go with a $20 monthly minimum, about $0.004 per word and $0.006 per sentence request; claims French support and English syllable-stress analysis | Secondary (prices). The accuracy claims are the vendor's own and unverified. | Search summaries of SpeechSuper pages |
| Hetzner after 15 June 2026: CX23 €5.49 a month; CX33 (4 vCPUs, 8 GB) €8.49 a month, both before VAT and a paid IPv4 address | Secondary | Hosting news and search summaries; Hetzner's own page was blocked |
| MFA needs at least 8 GB of memory | Secondary (MFA's own installation page states no requirement) | Search summary |
| Cloudflare Workers free plan: 100,000 requests a day, 10 ms of CPU per request, 100 MB request body | Checked | Cloudflare docs source |
| R2 free tier: 10 GB-month of storage, 1 million Class A and 10 million Class B operations a month, free egress | Checked | Cloudflare docs source |
| R2 asks for a payment method before you can turn it on | Secondary | Community reports |
| Workers KV free plan: 1,000 writes a day, 1 write per second per key | Checked | Cloudflare docs source |
| Azure voice counts (31 against 50+ en-US voices) | The sources disagree; not material | MicrosoftDocs voice list |
| **Unverified:** whether iOS obeys the "off" settings for echo cancellation, noise suppression and automatic gain; whether "play-and-record" keeps playback on the loudspeaker; whether the SDK push stream works end to end in an iOS home-screen app; whether F0 includes prosody; whether fr-FR phoneme timings map to a lexicon; the Speech SDK inside Cloudflare Workers; a Node relay with the SDK for pronunciation assessment; Lingua Libre coverage for each word; MFA speed on a small VPS; Cloudflare Access inside an installed app | Unverified | We test these in R1, R2, V1, V2, V3 and V9 before relying on them |

## Appendix B: What each design contributed, and what was dropped

| Design | Taken into Option B | Dropped or fixed |
|---|---|---|
| evidence-max | Success criteria written in advance, with honest expectations; three staggered targets aligned with the Checks; scoring eras and re-scoring of all Check audio; the panel protocol; dose counted in trials, with block extension; checking each TTS clip against the competing word; measuring fluency on first tellings only, with a rephrase prompt; listening-only sessions; one-cue French feedback | A scope too large before the first practice; withholding speaking during listening phases; a mixed-variety voice pool for vowels; starting values presented as evidence; the REST fallback; the claim that the order followed the addendum ranking |
| learner-ux | The Hear → Say → Use → Wrap stages; trust levels with Azure silent from day 1; the mic opening at the Say stage; playback never overlapping recording; the audio-session setting; stress dots hidden on reviews; parallel Check forms; automatic backup after each Check; encrypted panel links; backup plan, pause mode and weekly review; plain result wording | Too little listening per contrast; 60/45/30 limits (now 60/50/40); round-to-round numbers; merging the machine listener into the "Understood" headline card; counting any 3-minute session (only the comeback session now counts); the CI scan for hex strings; the REST fallback |
| lean-mvp | The build order, with offline listening first; the first-attempt rule; a token-only Worker; the CI scan for the real key value and the key's name (the header-name scan now covers only the app's own code); decision gates with adherence first; story cards with French bullets; recording the French baseline in week 0; usage warnings | The κ ≥ .4 gate; only two staggered targets; fluency as the most trusted outcome; "cart" scored in en-US; the REST fallback |
| measurement | Committed validation reports and moving detectors down after scorer or phone changes; known-answer checks; repeated panel clips; a mix of native and non-native panel listeners; "no verdict" handling; gate-then-send; the note that the REST API lacks spoken phonemes | Raters not told the intended message (a fatal flaw); corrective feedback that waited for human listeners; calibration chores inside sessions; a delayed probe only 7 days after training; home-server hosting; server operations as the default; an 8-week cycle too short for three staggered blocks |
