# Evidence brief: redesigning Pronunciation Coach for clearer English and French

## How to read this brief

This brief sums up the research evidence for a from-scratch redesign of the app. It covers two goals. The first is pronunciation: getting single speech sounds right. The second is articulation: clarity, pacing, rhythm, stress and being understood. The brief does not choose a tech stack.

**Evidence labels.** Every claim has one of these labels.
- **[Strong]**: several meta-analyses agree, or the claim is a documented technical fact. A meta-analysis pools the results of many studies.
- **[Moderate]**: some controlled studies, or several consistent correlational studies, with clear limits.
- **[Weak]**: one or a few small studies, conference papers or preprints, or numbers seen only in secondary sources.
- **[Mixed]**: good studies disagree, or experts dispute the claim.
- **[No evidence]**: no study was found either way. This is not proof that something is harmful.

**Who was studied.** Most of the evidence comes from adult university learners of English, often Japanese or Mandarin speakers. When evidence comes from another group, this brief marks it: *children*, *clinical* (people with speech disorders), *native speakers*, *lab listeners* (untrained people learning a new sound in a lab), or *non-language* (studies of other skills or school subjects).

**Limits of checking.** The research team could not open most publisher websites. They checked sources through abstracts, author copies and public mirrors, so most numbers come from abstracts. Where a number was "not re-checked", confirm it before it goes into product documents. The team also ran two analyses of its own: a re-analysis of the expert scores in the speechocean762 corpus, and a count of French minimal pairs in the Lexique 3.83 word database. Neither has been peer reviewed.

**Key terms**
- **L1 / L2**: a person's first (native) language / a second language they are learning.
- **n / N**: the number of people (or items) in a study.
- **Intelligibility**: how many of the speaker's words a listener actually understands. Researchers usually measure it by having listeners write down what they heard.
- **Comprehensibility**: how easy the listener finds it to understand the speaker. Listeners usually rate it on a 9-point scale.
- **Accentedness**: how different the speech sounds from a native accent.
- **Segmental**: about single sounds (vowels and consonants).
- **Prosody (or suprasegmentals)**: features that stretch across sounds: stress, rhythm, intonation (pitch patterns) and pausing.
- **Nuclear stress**: the main stress in a phrase, usually on its most important word ("No, I rented a FLAT").
- **Schwa and weak forms**: schwa is the short, relaxed vowel in the first syllable of "about" or in French "le". Weak forms are reduced versions of small words, such as "to" said as "tuh".
- **Functional load**: how many word pairs a sound contrast keeps apart. English /l/–/r/ separates many words (light/right), so its functional load is high.
- **Minimal pair**: two words that differ in only one sound, such as ship/sheep or tu/tout.
- **HVPT (high variability phonetic training)**: listening practice. The learner hears minimal-pair words spoken by several voices, picks the word they heard, and gets instant feedback.
- **Transfer**: whether a gain made in practice also appears with new words and in unscripted speech.
- **ASR (automatic speech recognition)**: software that turns speech into text.
- **TTS (text-to-speech)**: software that reads text aloud in a synthetic voice.
- **Azure**: Microsoft's cloud speech service. v1 uses it to score pronunciation and to make its TTS model audio.
- **IPA**: the International Phonetic Alphabet, a standard set of symbols for speech sounds.
- **LLM (large language model)**: AI software, such as a chatbot, that works with text. An audio LLM also takes sound as input.
- **Effect size (d or g)**: a standard measure of how big a difference is. As a guide, 0.2 is small, 0.5 medium and 0.8 large. **r** is a correlation. Its size runs from 0 (no link) to 1 (a perfect link). A negative r means one measure falls as the other rises.

---

## 1. Summary

- **Aim for being understood, not for sounding native.** Accent, ease of understanding and actual understanding are partly separate. Speech with a strong accent can still be fully intelligible. Researchers agree the goal should be intelligibility and comprehensibility. [Strong]
- **Training works for adults, but most measured gains are in read-aloud speech.** On average, pronunciation teaching has a medium-to-large effect (d ≈ 0.76–0.80 in two meta-analyses). The biggest gains are on practised features in read-aloud tasks. Evidence that these gains reach unscripted speech is much weaker. The app must therefore test progress on unscripted speech, unseen prompts, unpractised words and delayed checks. [Strong]
- **Some errors matter much more than others.** In English, these features are most closely linked to being understood:
  - sound contrasts with high functional load;
  - consonants dropped from clusters;
  - word stress and sentence stress;
  - pausing and speaking rate.

  Many other features mostly affect accent. [Moderate; correlational; English only, mostly Japanese and Cantonese learners] The French evidence is thin. [Weak]
- **Train listening as well as speaking.** HVPT reliably improves how well learners hear hard sound contrasts, with large effects. It improves their speaking by roughly half to two-thirds as much (d = 0.54 vs 0.92). So pair each listening block with a speaking block on the same contrast. [Strong for listening; Moderate for speaking]
- **Give corrective feedback, then a retry.** Programmes with corrective feedback show larger gains. In one study of one English sound, teaching plus feedback improved careful and spontaneous speech, while teaching without feedback produced no significant change (Saito & Lyster 2012). Colour-coded scores on their own do not count as corrective feedback. Whether adding an explanation of how to make the sound helps is less clear. [Moderate for feedback; Mixed for how-to explanations]
- **Spread practice over weeks.** In L2 learning generally (mostly vocabulary and grammar), practice spread across days is remembered better than practice crammed into one sitting. Pronunciation programmes in the research typically ran 10–16 weeks. This is a common study length, not a proven minimum. Research on the best spacing for pronunciation specifically is thin. [Strong for spacing in general; Weak for exact pronunciation schedules]
- **Automatic scores are noisy, and French gets much less from Azure.** On an English benchmark (Mandarin speakers, half of them *children*), open scoring models agree fairly well with expert raters on whole sentences (r ≈ .72–.74). They agree less well on words and single sounds (r ≈ .55–.68) and poorly on word stress (r ≈ .15–.33). For French, Azure returns no prosody score and no phoneme names. The app therefore needs to pool evidence across many attempts. It also needs its own timing and pitch measures and occasional checks by human listeners. [Strong for the Azure facts; Moderate for the agreement levels]
- **Speed ladders, tongue twisters and non-speech mouth exercises lack supporting evidence.** No study was found showing that they improve clarity. The evidence on mouth exercises comes from *children* with speech disorders. Better-supported options:
  - repeating meaningful speaking tasks [Moderate];
  - a normal speaking rate with well-placed pauses [Moderate; from listener-rating studies, not training studies];
  - for a native language, practice in "clear speech" [Moderate for the immediate effect in *native speakers*; Weak for lasting change].

  [No evidence found for the v1 drills]

---

## 2. Key principles

The table is ranked roughly by evidence strength, then by likely impact. Row 12 applies only if one of the two languages is native.

| # | Principle | What to do in the app | Evidence strength | Key sources |
|---|---|---|---|---|
| 1 | Make intelligibility and comprehensibility the goal | Make the main progress metric words understood and ease of understanding in unscripted speech. Show Azure accuracy only as a secondary "closeness to a native model" number. | Strong | Munro & Derwing 1995, 2020; Derwing & Munro 1997; Chau & Huensch 2025; Levis 2005, 2020 |
| 2 | Measure transfer, not practice scores | Run a separate Progress Check every 2–4 weeks. Use unseen prompts, held-out words, and delayed probes 2–4 weeks after training. | Strong (the gap between practice and transfer); Moderate (the exact design) | Saito & Plonsky 2019; Lee, Jang & Plonsky 2015; Thomson & Derwing 2015; Uchihara et al. 2024 |
| 3 | Include listening training (HVPT) | Ask the learner which word they heard. Show word labels, give instant feedback, use 4–6 voices, and keep some voices for tests only. | Strong (listening); Moderate (speaking); Mixed (number of voices) | Uchihara et al. 2025; Sakai & Moorman 2018; Uchihara et al. 2024 |
| 4 | Space practice over days and weeks | Keep a spaced review queue for each target. Plan multi-week cycles of short, frequent sessions. | Strong (L2 in general, mostly vocabulary and grammar); Weak (pronunciation-specific) | Kim & Webb 2022; Cepeda et al. 2006; Lee et al. 2015 |
| 5 | Give specific corrective feedback, then a retry | Name the sound and say what to change. Prompt self-correction first, then play the model. Flag only 1–2 errors per attempt. | Moderate (feedback); Mixed (prompts first; how-to explanations); Weak (the 1–2 error limit) | Saito & Lyster 2012; Saito 2013; Kissling 2013; Lyster & Saito 2010; Ngo et al. 2024 |
| 6 | Rank targets by their effect on understanding | Weight each contrast by functional load × the learner's error rate. Include dropped sounds, stress and pausing as targets. | Moderate (English, correlational); Weak (French proxy) | Suzukida & Saito 2021; Munro & Derwing 2006; Kang et al. 2018, 2020 |
| 7 | Give prosody and fluency substantial weight, at least as much as single sounds | Use measures the learner can act on: stress placement, pause location, pitch rise or fall, speaking rate. | Moderate (small classroom studies; no fixed ratio shown) | Derwing, Munro & Wiebe 1998; Gordon & Darcy 2016, 2022; Kang 2010; Hahn 2004 |
| 8 | Build fluency by repeating meaningful tasks | Have the learner retell the same story 3 times in one session, with a new prompt next session. Measure on new prompts. | Moderate | de Jong & Perfetti 2011; Suzuki 2021; Suzuki & Hanzawa 2022 |
| 9 | Diagnose the learner first | Collect the first language, baseline recordings, a listening screener, a level check, a target-listener setting and an accent-variety setting. | Moderate | Derwing & Munro 2013; Iverson & Evans 2009; Yan et al. 2016; Munro 2018 |
| 10 | Treat automatic scores as noisy | Call a sound weak only after 15–20 tokens, in at least 5 different words, over at least 3 sessions. Show uncertainty. Store the scoring-model date with each score. | Strong (the noise is real); Weak (the thresholds are a heuristic) | Open scoring-model benchmark (GOPT); speechocean762 re-analysis; Microsoft docs |
| 11 | Support the habit without streaks | Set a concrete goal, an if-then plan and a weekly target. Show sessions per week instead of a streak, and never reset progress after a missed day. Offer a way back after breaks, and before/after recordings. | Moderate (general, *non-language*); Weak (language apps) | Gollwitzer & Sheeran 2006; Sheeran et al. 2025; Hwang et al. 2024; Lally et al. 2010 |
| 12 | For a native language: practise clear speech | Record ordinary and "over-enunciated" versions of the same item. Add a simulated listener who sometimes mishears. | Moderate (immediate effect, *native speakers*); Weak (lasting change) | Lam & Tjaden 2013; Buz et al. 2016; Krause & Braida 2002 |
| 13 | Practise targets inside real speaking tasks | After drills, have the learner use the sound in a spoken retell or role-play, with feedback on that sound only. | Weak to Moderate | Saito & Lyster 2012; Saito 2015; Bibauw et al. 2022 |
| 14 | Use simple visual feedback for pitch | Show pitch in semitones (a unit of pitch that treats high and low voices alike), scaled to the learner's own range. Only a pitch-variation meter has been tested. A pitch line scored by its shape at key points is untested. | Weak | Hincks & Edlund 2009; Hardison 2004 (secondary) |

---

## 3. Detail by area

### 3.1 Perception training (listening)

**What the evidence says**
- **HVPT improves how well adults hear the contrasts they train.** [Strong]
  - Uchihara, Karas & Thomson (2025) pooled 79 studies. The effect was g = 0.92 from before to after training, and g = 0.67 against control groups. Gains lasted, and partly carried over to new words and voices.
  - Yao et al. (2025) pooled 65 phonetic-training studies (2,793 learners) and found d = 0.76.
  - Most studies used university learners of English in labs.
- **Listening gains carry over to speaking, but less.** [Moderate]
  - Sakai & Moorman (2018) found d = 0.92 for listening and d = 0.54 for speaking.
  - Uchihara et al. (2024) pooled 31 studies and found g = 0.49–0.66 for speaking.
  - Speaking improved about 10.5% on trained words and only 4.5% on untrained words.
  - One learner's listening gain barely predicts their speaking gain.
  - Whether speaking gains last is under-tested. One /r/–/l/ study found them still present at 3 months (Bradlow et al. 1999).
- **More voices are not reliably better.** [Mixed]
  - A pooled analysis found a benefit from many voices right after training (g = 0.46), but it disappeared at later tests (Zhang, Cheng & Zhang 2021; not re-checked).
  - Training with a single voice also produces learning.
  - A large registered replication gave ambiguous results (Brekelmans et al. 2022).
  - One trial of 458 learners reportedly found that 2 voices worked as well as 6 (Nagle et al. 2025; not re-checked).
  - The benefit of more voices seems limited to higher-proficiency learners (Uchihara et al. 2025). High variety can hinder low-aptitude beginners.
  - A pool of about 4–6 voices is a sensible default.
- **The evidence on synthetic (TTS) voices is thin.** [Weak]
  - In an older study, training on one synthetic sound continuum did not carry over to natural speech (as described by Giannakopoulou et al. 2017).
  - Two small studies suggest HVPT with several TTS voices can work (Qian et al. 2018; Al-Shami & Cardoso 2025, n = 30).
  - Moving gradually from synthetic to natural speech improved vowels, and the gains lasted 3 months (Wang & Munro 2004).
- **Task type matters.** For vowels, picking which word was heard (with the words shown on screen and feedback given) beat "same or different?" tasks (Carlet & Cebrian 2022). The meta-analyses also found that task type matters. [Moderate]
- **For brand-new contrasts, keep listening and speaking in separate blocks.** Saying each word aloud during listening training disrupted perceptual learning (Baese-Berk & Samuel 2016). [Weak; *lab listeners*, single sessions]
- **Dose: about 3–15 short sessions (1–7 hours in total) gave lasting gains.** Most of these studies trained a whole set of vowels, not a single contrast. [Moderate]
  - First language matters. In one study, Spanish speakers needed about 15 sessions to reach what German speakers reached in 5 (Iverson & Evans 2009).
  - Eight sessions improved English vowels for French speakers (Iverson, Pinet & Evans 2012).
  - Eight online sessions improved French speakers' hearing of English /h/, and the gain was still present at 4 months (Melnik & Peperkamp 2021).
- **Seeing the mouth helps for some sounds.** [Weak]
  - Video of the lips improved learning of Japanese vowel length more than audio alone, but differences at the final test were only marginal (Hirata & Kelly 2010; listening only; *lab listeners* with no Japanese).
  - Audio with video improved French nasal-vowel production more than audio alone (Inceoglu 2016; not re-checked).
- **There is almost no evidence for French contrasts.** [Weak]
  - Only nasal vowels have a verified listening-training study.
  - Shadowing improved /ɥi/ (as in "lui") for intermediate Mandarin-speaking learners (Fu et al. 2024).
  - Studies of /y/ with ASR (Liakin et al. 2015) and with ultrasound feedback (Kocjančič Antolík et al. 2019) exist but were not opened.
  - No controlled HVPT studies were found for /y/–/u/, /e/–/ɛ/, /ø/–/œ/ or /ʁ/.

**What this means for the app**
- Give listening practice its own daily slot.
- Track listening accuracy for each contrast separately from speaking scores. This shows whether a problem is in hearing or in producing the sound.
- Include roughly 10 minutes of listening screening at onboarding.
- Keep some voices and some natural human recordings out of training and use them only for tests. If accuracy rises on TTS items but not on natural recordings, flag it.
- Before using a TTS voice, check that it actually produces the contrast being trained.

### 3.2 Production practice and feedback

**What the evidence says**
- **Instruction works, and computer-based practice helps moderately.** [Strong for instruction; Moderate for computer-based practice, whose results vary widely]
  - Lee, Jang & Plonsky (2015) pooled 86 reports and found d = 0.80 between groups. Effects were larger with longer programmes, with feedback and with controlled tests.
  - One meta-analysis of computer-assisted training reported d = 0.68 (Mahdi & Al Khateeb 2019; 20 studies; overall figure not re-checked). The widely quoted d = 0.46 comes from a 6-study subset of *children and adolescents*.
  - Training based on ASR gave g = 0.69 (Ngo et al. 2024).
  - Treat these as upper limits, because most studies used controlled tests.
- **Gains shrink in spontaneous speech.** [Strong]
  - Saito & Plonsky (2019) pooled 77 studies. Instruction worked best on specific features in careful speech. Its effect on overall ratings of spontaneous speech was unclear.
  - A review of 30 computer-assisted training studies found mostly listen-and-repeat practice and controlled tests (Amrate & Tsai 2025).
- **In one study, transfer to spontaneous speech needed corrective feedback.** [Weak to Moderate; one sound, one research group]
  - Saito & Lyster (2012) taught 65 Japanese learners the English /ɹ/ sound for 4 hours. Teaching plus feedback improved both careful and spontaneous speech. Teaching without feedback produced no significant change.
  - Other evidence qualifies this. Beginners improved without feedback in a communicative lesson (Saito 2015). Listening training improves speaking with no speaking feedback at all (Uchihara et al. 2024).
  - In ASR-based training, explicit feedback reportedly raised the effect to g = 0.86, against g = 0.69 overall (Ngo et al. 2024; not re-checked).
- **Explaining how to make the sound: the evidence is mixed.** [Mixed]
  - Saito (2013, n = 49) found that adding explicit information about how to form the sound helped gains carry over to new words.
  - Kissling (2013) found explicit phonetics teaching no better than the same practice without the explanation.
- **Prompts versus recasts: the evidence is mixed.** [Mixed] A prompt asks the learner to correct themselves. A recast simply gives the correct form. Prompts beat recasts in a classroom meta-analysis (Lyster & Saito 2010; 15 studies, N = 827). But most of those studies were about grammar, and the comparison is disputed.
- **Focus the feedback on a few errors.** [Moderate for the reasoning; Weak for direct pronunciation evidence]
  - Accent and being understood are partly separate (Derwing & Munro 1997).
  - Researchers of computer-assisted pronunciation training argue that feedback should cover only errors that affect understanding and that the system detects reliably (Neri et al. 2002; Levis 2007).
  - The direct evidence that focused feedback beats unfocused feedback comes mainly from grammar and writing research.
- **Learners do not judge their own speech well.** [Moderate]
  - Learners' ratings of their own L2 speech match listeners' ratings poorly (Trofimovich et al. 2016; details not re-checked).
  - Across 160 studies, mostly of university students in many subjects, learners overrated themselves (g = 0.21). They became more accurate with feedback (León et al. 2023).
- **Visual displays for hard sounds.** [Weak]
  - About 1 hour per vowel with a live vowel chart improved production of Danish vowels by 17% (Kartushina et al. 2015; *lab listeners*: French speakers new to Danish, n = 27).
  - Waveform displays improved voice onset time, the short delay before the voice starts after sounds like /p/ (Olson 2014; English-speaking classroom learners of Spanish).
- **"Would a listener understand you?"** [Weak] Learners of French found ASR dictation useful for seeing where they were not understood (Mroz 2018; n = 16, interviews only).
- **Ideas from motor learning (how people learn movement skills).** Most of this evidence comes from *non-language* limb tasks and *clinical* groups, not L2 learners.
  - Accuracy during practice is not the same as learning. Judge learning with delayed checks done without help. [Moderate] (Soderstrom & Bjork 2015)
  - Giving feedback less often showed no reliable benefit in a meta-analysis (McKay et al. 2022). [Mixed]
  - The benefit of mixing items rather than practising them in blocks is small or unreliable in real-world settings, and meta-analyses disagree. [Weak]
  - Feedback shown the instant an attempt ended hurt learning compared with feedback delayed by a few seconds (Swinnen et al. 1990). Asking learners to estimate their own error before seeing the result helped learning (Guadagnoli & Kohl 2001). A later study found this benefit in only one of two experiments (Barros et al. 2019). [Weak; lab limb tasks]
  - Earlier meta-analyses found that cues pointing attention at the outcome, rather than at the body, helped in limb and sport tasks. After correction for publication bias, the effect was near zero (McKay et al. 2024). It is untested in speech. [Weak]
  - In short lab studies of *native speakers*, speech-movement learning was sometimes tied to the exact words practised (Tremblay et al. 2008). Other studies found partial transfer to new words (Houde & Jordan 1998). Practising in varied words and contexts is a sensible default, but it is untested for L2 learners. [Weak]
  - Feedback on how to move ("knowledge of performance") is thought to matter most when a sound is new. A score ("knowledge of results") may suit later refinement. [Weak; limb tasks and *clinical* groups] Azure gives only scores.
- **Say it before hearing it.** In classroom learning of other subjects, recalling an answer beat re-studying it (g = 0.50; Yang et al. 2021). [Moderate; *non-language*] This is untested for pronunciation. For brand-new contrasts it also conflicts with the "listening first" finding in 3.1.

**What this means for the app**
- For each flagged error, show a feedback card with:
  - the target sound in the word;
  - the sound the learner probably said instead (available in en-US only);
  - a one-sentence tip on how to form the sound;
  - a short lip or tongue picture.
- Then run a retry, followed by a new word with the same sound.
- Use a two-step loop: first ask the learner to correct themselves, then play the model.
- Count a self-correction as stronger evidence of mastery than a correct attempt made just after hearing the model.

### 3.3 Prosody (stress, rhythm, intonation)

**What the evidence says**
- **Prosody-focused training carried over to spontaneous speech in small studies.** [Moderate; small samples]
  - In Derwing, Munro & Wiebe (1998, 12 weeks), the group taught prosody and general speaking skills improved comprehensibility and fluency in unscripted stories. The group taught single sounds improved only on sentence reading.
  - In Gordon & Darcy (2016, 2022), only the prosody group improved comprehensibility and fluency in spontaneous speech. No group changed in accent.
  - This does not rule out segment training. Segment training with feedback can transfer too (Saito & Lyster 2012).
  - ASR-based training shows larger effects on sounds (g = 0.82) than on prosody (g = 0.37). But few prosody studies exist, and the gap may reflect that current tools mainly target sounds (Ngo et al. 2024).
- **Which prosodic features matter.** [Moderate; correlational]
  - Speaking rate was most strongly linked to comprehensibility. Pitch range and word stress were linked to accent (Kang 2010; 11 teaching assistants, 58 raters).
  - Correct sentence stress improved listeners' memory of a lecture (Hahn 2004).
  - Prosody best predicted pronunciation ratings for 60 speakers from 11 first languages (Anderson-Hsieh et al. 1992).
  - Comprehensibility also depends on vocabulary, grammar and sounds (Trofimovich & Isaacs 2012; Saito, Trofimovich & Isaacs 2017).
- **French speakers and English word stress.** [Moderate]
  - French listeners have trouble holding stress differences in memory. Researchers call this "stress deafness" (Dupoux et al. 1997; native French listeners, not learners).
  - It persisted in advanced French learners of Spanish (Dupoux et al. 2008).
  - French speakers learned stress contrasts in a short lab study (Schwab & Llisterri 2011).
  - These studies did not test French learners of English directly.
  - Field (2005) reportedly found that stress moved to a later syllable was especially damaging to understanding (content not re-opened).
- **French prosody works differently from English.** [Moderate; descriptive]
  - French groups words into short "accentual phrases" of about 3–4 syllables. The last syllable of each phrase is lengthened.
  - Phrases that do not end the sentence usually finish with a pitch rise. Statements end with a fall.
  - English speakers bring over stress on the first syllable of a word and falling pitch (Walton 2023).
  - Dutch listeners used the French final rise to find word boundaries more than English listeners did (Tremblay et al. 2018).
  - Japanese learners produced the rises but used lengthening unevenly (Albar 2020).
  - None of these are training studies. The few French prosody training studies appear below.
- **Rhythm scores are unreliable.** [Moderate]
  - Measures such as %V (the share of time taken by vowels) and PVI try to classify rhythm as "stress-timed" or "syllable-timed". In *native speakers* of six languages, their values varied between speakers and tasks often as much as between languages (Arvaniti 2012).
  - Expert guidance for international intelligibility rates stress-timed rhythm as "not important" (Walker, Low & Setter 2021).
- **Train listening first.** [Weak] One randomised study (n = 115 Japanese university learners, 2 weeks) suggested that listening-based teaching may beat speaking-based teaching, for sounds and for word stress (Lee, Plonsky & Saito 2020).
- **Visual pitch feedback.** [Weak]
  - Hincks & Edlund (2009) studied 14 Chinese learners of English, 7 per group. A display of flashing lights showed how much their pitch varied. It increased pitch variation more than listening back to one's own recording, though both groups improved. The gain held in a new talk 48 hours later. Two raters saw little change in intelligibility.
  - The authors argue, without testing it, that matching a model's pitch line point by point frustrates learners.
  - Hardison (2004) reportedly found that live pitch displays helped English speakers learning French. This is known only through a secondary description.
  - A feasibility study with 2 beginners used gesture-controlled speech synthesis to teach French intonation (Xiao et al. 2024; no control group).
- **Clapping or tapping to the rhythm.** [Weak; mostly *children*]
  - Clapping improved accent and final-vowel lengthening in 28 Catalan children learning French words (Baills & Prieto 2023).
  - Clapping also helped Chinese adolescents pronounce French words (Zhang, Baills & Prieto 2020).
  - An adult study exists, but sources describe its results in conflicting ways (Baills et al. 2022).
- **Liaison and enchaînement.**
  - Liaison: a normally silent final consonant is pronounced before a word that starts with a vowel, as in *les‿amis*.
  - Enchaînement: a final consonant that is always pronounced links to the next vowel, as in *il‿a*.
  - No L2 training study could be verified. At least one classroom study of TTS practice for liaison exists (Liakin, Cardoso & Liakina 2017) but was not opened. [Weak; not verified]
  - A doctoral study of Italian-speaking learners, compared with other first-language groups, found similar errors across first languages. Learners often did not know when liaison is optional (thesis 2015PA100186). [Weak]
- **Azure prosody is limited.** [Strong]
  - It works for en-US only.
  - It gives one number for the whole utterance, plus word-level "unexpected or missing break" flags and a whole-utterance "monotone" flag.
  - It has no error type for word stress.

### 3.4 Fluency and speaking rate

Fluency here means smooth, well-paced speech. It has three parts: speed, pauses and repairs (self-corrections).

**What the evidence says**
- **Listeners judge fluency mainly by pauses and speed. Repairs matter little.** Perceived fluency is only weakly linked to accent. [Strong; native Dutch raters judging L2 Dutch] (Bosker et al. 2013; Pinget et al. 2014)
- **Fluency and comprehensibility are closely linked.** A meta-analysis of 49 reports gave r = .82 (Chau & Huensch 2025). [Moderate; correlational]
- **The most useful automatic measures are articulation rate and mid-clause pauses.** [Moderate]
  - Articulation rate is syllables per second, not counting pauses.
  - Mid-clause pauses are pauses inside a clause rather than between clauses.
  - Source: Suzuki & Kormos 2023, 128 Japanese learners.
  - Pause length and filled pauses ("um") tracked the speaker's own first-language habits in one study (Kahng 2020, n = 44). In another, pause length did not predict proficiency, and correcting for first-language habits improved only one measure (de Jong et al. 2015, n = 51). So give these measures less weight, and record a first-language baseline if possible. [Weak to Moderate]
- **Speaking rate works on a curve: too slow and too fast both hurt.** [Moderate; listener-rating studies, not training]
  - Listeners judged a rate slightly faster than the L2 speaker's usual rate as best (Munro & Derwing 1998, 2001; not re-checked).
  - Trained native talkers kept the intelligibility benefit of clear speech at a normal rate (Krause & Braida 2002; *native speakers*).
  - In a preprint using synthetic speech, L2 listeners (mainly French speakers hearing English) heard phrases slowed in different ways. Slowing the whole phrase cut errors on some vowels and raised them on others. Listeners rated some slowed versions as clearer even when those versions caused more errors (Tuttösí et al. 2026). [Weak]
- **Repeating the same task builds fluency.** [Moderate]
  - The one pooled figure that could be checked, g = 0.51 for fluency, comes from a meta-analysis of *written* task repetition, seen through a secondary source (Liu & Tang 2025).
  - A 2025 meta-analysis of spoken task repetition reportedly names fluency as the most reliable benefit. Its figures could not be verified, and secondary accounts disagree (Abdi Tabari et al. 2025).
  - Only repetition on the same topic kept its gains on new topics (de Jong & Perfetti 2011; n = 24).
  - Suzuki (2021; n = 50, randomised) had learners practise at home. One group told one story 3 times a day, with a new story each day. On new stories, this group spoke faster and made shorter mid-clause pauses than a group that rotated through three stories each day.
  - Six back-to-back repetitions cut pausing but slowed articulation and increased word-for-word repeating. Differences between schedules faded after 1 week (Suzuki & Hanzawa 2022; n = 79; quasi-experiment in intact classes).
  - In the 4/3/2 activity, the learner gives the same talk in 4, then 3, then 2 minutes. Combined with short grammar corrections, it improved fluency and grammar accuracy (irregular past tense) across topics. Mid-clause pauses did not change (Tran & Saito 2021; n = 36).
  - Time pressure alone may lower accuracy and lead learners to recycle the same words (Boers 2014; n = 10). [Weak]
- **Shadowing (speaking along with a recording, slightly behind it).** [Weak]
  - A review of 44 studies, most of them low-quality pre/post designs, found fluency improved in 8 of 8, comprehensibility in 7 of 9, and mixed-to-positive results for prosody. Effects on sounds and accent were unclear. Only 1 study had a delayed test (Whitworth & Rose 2025; figures via a secondary source).
  - The review's best-rated accent study found comprehensibility and fluency gains but no accent change after 8 weeks of phone-based shadowing (Foote & McDonough 2017; 16 completers; no control group).
  - In a French study, shadowing improved production of /ɥi/ only for intermediate learners (Fu et al. 2024; n = 30 Mandarin speakers).
  - A typical dose was 10–15 minutes, 3–4 times a week, for 4–8 weeks, with about 5 passes per passage.
- **Chunks (fixed multi-word phrases).** [Moderate; correlational] Learners who use more multi-word phrases tend to be more fluent (Tavakoli & Uchihara 2020). Causal evidence that teaching chunks helps is thin. No French data were found.
- **Conversation practice with software.** [Moderate for dialogue systems in general; Weak for LLM voice chat]
  - A meta-analysis of 17 studies of software conversation partners found d = 0.59 overall (Bibauw et al. 2022). Most learners were adults or university students.
  - Spoken practice tested with spoken tests gave d = 0.84. Typed practice tested with spoken tests gave d = 0.29, which was not significant.
  - Guided task dialogues, feedback and beginner-to-intermediate levels (A1–B1) looked stronger. These are subgroup estimates based on few studies, and the differences were not significant. There was no significant gain at B2 (upper intermediate).
  - The analysis had no pronunciation outcome category.
  - An update covering the LLM era (67 studies, including *children* and teenagers) found g = 0.61, and g = 0.54 for adults. It is a conference abstract of a paper under review (Wang et al. 2026).
  - Early AI voice-chat trials report fluency gains and more voluntary practice. But the groups practised for different amounts of time, the tests were made by the researchers, and no trial used blind listener ratings of comprehensibility (Abdelrady et al. 2026; Dai & Wu 2025).
- **Talking with a peer improved fluency** (Sato & Lyster 2012; n = 167; intact classes). Long gaps before answering lowered perceived fluency (Van Os et al. 2020; native Dutch raters). [Moderate]
- **Filler words.** [Moderate for cutting fillers; *native* college students]
  - Habit-reversal training teaches awareness and a silent pause instead of "um". It cut fillers from 7.4 to 1.4 per minute, and the result held 2–5 weeks later (Mancuso & Miltenberger 2016; n = 6).
  - No benefit to listeners was measured. Fillers can even help listeners (Corley et al. 2007; Fox Tree 2001).
- **Automatic fluency measures.** For French, counting syllables from ASR text beat counting them from the sound wave alone (Bibauw et al. 2021; teenagers; conference talk). [Weak]

### 3.5 Practice schedule and learning science

- **Spacing works.** [Strong for L2 learning in general]
  - Spaced practice gave a medium-to-large benefit over cramming (Kim & Webb 2022; 48 experiments, N = 3,411; mostly vocabulary and grammar; figures from secondary sources).
  - Longer gaps did better on delayed tests.
  - Gaps of equal length and gaps that grow longer worked about equally well (see also Latimier et al. 2021).
- **Spacing for pronunciation specifically.** [Weak / Mixed]
  - Spaced listening training reportedly doubled gains and retention compared with crammed training (Saito & Chen 2025; the "double" figure was not re-checked).
  - Seven-day gaps kept gains and 1-day gaps did not (Li 2026; one study).
  - But 3.3-day gaps beat 7-day gaps for spoken grammar in an artificial mini-language learned in the lab (Suzuki 2017; n = 60).
  - One-day and 7-day gaps gave similar fluency gains (Kakitani & Kormos 2024; secondary source).
  - So do not fix one interval in the code.
- **Programme length.** [Moderate]
  - Longer programmes show larger effects. This comes from comparing different studies, so other factors may explain it.
  - Studies with good results typically ran 10–16 weeks. This is a common study length, not a proven minimum.
  - ASR programmes of 1–4 weeks showed almost no effect (g = 0.07), against g = 1.01 for 5–8 weeks (secondary extraction of Ngo et al. 2024).
  - Still, 4 hours of teaching with feedback did improve one sound (Saito & Lyster 2012).
- **Block practice first, then mix.** [Mixed]
  - For a brand-new hard contrast, practising one vowel context at a time beat mixing contexts, for learning and for retention. Only higher-aptitude listeners coped with mixing (Fuhrmeister & Myers 2020; one session, *lab listeners*).
  - Across category-learning studies, mixing helped on average (g = 0.42), but blocking did better for learning words (Brunmair & Richter 2019; mostly *non-language*). Switching to mixed practice once a contrast is stable is a design inference, not a tested rule.
  - For fluency tasks, blocked repetition won (Suzuki 2021). For grammar accuracy, mixing won (Suzuki et al. 2020).
- **Scores during a session can mislead.** [Moderate]
  - Performance during practice can differ from later retention (Soderstrom & Bjork 2015).
  - In lab category-learning studies, learners chose blocked practice even when mixing would help. Explaining why mixing helps made them choose it more (Abel & de Bruin 2024; *non-language*).
- **Amount of practice.** Accumulated practice explains only a modest share of skill differences: about 5% in education and about 14% overall (Macnamara et al. 2014, corrected in 2018; *non-language*). [Moderate] Focusing on the quality of practice is a reasonable design idea, not a proven finding.
- **Measure dose as the number of spoken attempts per target, not minutes.** Short items allow an estimated 60–100 attempts in 10 minutes. [Weak; one study of 2 *clinical* children with apraxia of speech; a review of dose was inconclusive]
- **Session length.** Sessions of 10–20 minutes, 3–5 times a week, are a default inferred from other evidence. [Weak]

### 3.6 Motivation and self-monitoring

- **Self-assessment is biased.** [Moderate]
  - Learners overrate their own performance and become more accurate with feedback (León et al. 2023; mostly university students in many subjects).
  - In L2 speech, weaker speakers reportedly overrate themselves and stronger speakers underrate themselves (Trofimovich et al. 2016; not re-checked).
- **Ask for self-ratings only on some trials.** In one series of word-pair experiments, a required memory rating on every trial reversed the benefit of retrieval practice, so restudying won ("Spaced retrieval practice: Can restudying trump retrieval?"). [Weak]
- **If-then plans help modestly.** An example plan: "After my morning coffee, I do one 10-minute session." [Moderate; *non-language*]
  - The first meta-analysis found d = .65 (Gollwitzer & Sheeran 2006).
  - A later analysis of 642 tests found d ≈ .36, about .15 after correcting for bias, and smaller effects outside the lab (Sheeran et al. 2025).
- **Habits take weeks to months to form.** The median was 66 days. Missing one day did not harm habit formation (Lally et al. 2010; 96 adults; health habits). [Weak; *non-language*]
- **Dropout is common.** [Weak]
  - About 43% of adult app users stopped within 3 months (Hwang et al. 2024; figures from a secondary source).
  - Users who kept going tended to have sessions of 5+ minutes, 4+ sessions a week and 7+ active weeks.
  - Stopping for a while and then returning was common.
- **Belief in one's ability goes with achievement.** [Moderate; correlational]
  - Self-efficacy (belief that you can succeed) correlates with L2 achievement (r = .46; SSLLT meta-analysis 2022).
  - In academic samples, past success is its strongest source (sources-of-self-efficacy meta-analysis; *non-language*).
  - A growth mindset about language learning correlates with outcomes at r = .26 (language-mindset meta-analysis).
- **Game features.** [Moderate for learning; Weak for motivation; *non-language*]
  - Game features improved learning in two education meta-analyses (g ≈ 0.49, Sailer & Homner 2020; g ≈ 0.50, Bai et al. 2020).
  - Effects on motivation were less robust.
  - No study was found showing that streaks improve learning.
- **Real-world use matters.** [Weak]
  - In a 7-year study, one first-language group improved and another did not. The authors linked this to conversation experience and willingness to talk, but these differences were confounded with first language (Derwing & Munro 2013).
  - Over 22 months, only the group that used English more outside class improved, and only slightly (Derwing, Munro & Thomson 2007).
- **Adults can still improve after many years.** Workplace training helped speakers who had lived in Canada for about 19 years (Derwing et al. 2014; small study, no randomised control). [Weak]
- **Interactive spoken tasks drew more voluntary practice.** [Weak]
  - One conversation bot drew 104 minutes against 45 for listen-and-repeat (Dai & Wu 2025).
  - In another trial, 71% of learners practised longer than required (Abdelrady et al. 2026).

### 3.7 Technology and measurement: what automatic scoring can and cannot do

**Azure Pronunciation Assessment by language** [Strong; vendor documentation]

| Azure output | en-US | fr-FR |
|---|---|---|
| Overall accuracy, fluency and completeness scores | Yes | Yes |
| Word-level error types (mispronounced, omitted, inserted) | Yes | Yes |
| Scores for each phoneme | Yes | Yes, but without phoneme names |
| Phoneme names (IPA) | Yes | No |
| "Spoken phoneme": the sound the learner most likely said instead | Yes | No |
| Syllable-level results | Yes | No |
| Prosody score, plus "break" and "monotone" flags | Yes (at extra cost) | No |
| Word-stress error detection | No | No |
| Published agreement with human raters by language | No | No |

More technical facts from the documentation:
- In continuous mode (audio longer than 30 seconds), Azure does not detect omitted or inserted words. The app must do that itself.
- Content assessment was retired in version 1.46 of the Speech SDK (software development kit).
- Microsoft updated the en-US and fr-FR scoring models in August 2026, and other models in April and June 2025. No new agreement figures were published. The documentation describes no way to lock the app to one model version.
- Scores assume a normal speaking speed and volume.

**How well machine scores agree with humans**
- **Microsoft publishes only one figure: a correlation above 0.5 with human judges.** It tells customers to run their own checks and set their own thresholds. [Strong]
- **On an open English benchmark, open scoring models agree best on whole sentences and worst on word stress.** [Moderate] The benchmark is speechocean762: Mandarin-speaking children and adults reading English, scored by 5 experts. These figures come from an open model (GOPT), not Azure.
  - Whole sentence: r ≈ 0.72–0.74.
  - Single sound: r ≈ 0.61–0.68.
  - Word: r ≈ 0.55–0.61. So agreement does not simply fall as the unit gets smaller.
  - Word stress: r ≈ 0.15–0.33. The benchmark's very coarse stress labels partly explain this.
  - Error detection: F1 ≈ 0.64 (HMamba model). F1 is a 0–1 score that balances missed errors against false alarms.
- **On the same benchmark, Azure's overall score correlated r = .78 with the experts** (prosody .84), as reported by Ahn & Nam (2025) from an earlier study. In the team's re-analysis, one expert against the other four gave r = .77–.80. So, across different speakers, Azure matches roughly one expert rater. No test-retest data were found for Azure or other vendors: no study was found that checked whether the same learner gets the same score on two attempts. No French validation was found either. [Moderate]
- **Human raters are also noisy.** [Moderate] Sources: the team's re-analysis of speechocean762 (English read by Mandarin speakers, half of them *children*), and one study of native raters (Issa & Ali 2026).
  - One expert's reliability was .51–.64 (ICC, a 0–1 measure of how well raters agree).
  - Averaging 3–4 trained raters reached about .80, and 5 reached .84–.90. Untrained native listeners may need about 10 raters on some dimensions.
  - Pooled untrained listeners approached expert ratings in some tasks. Much of this evidence comes from *clinical* child speech and *native* talkers (McAllister et al. 2020; Yoho et al. 2019; Warren et al. 2009).
  - Experts agreed only moderately on single-sound errors (kappa .60, a 0–1 agreement measure that corrects for chance).
  - A reliable estimate of one phoneme's error rate needed about 8–22 tokens (median about 14), even with five-expert labels. Tracking one learner's change over time needs more.
- **Ratings drift within a session and shift with context.** [Moderate]
  - Ratings change with which other recordings are heard and with listeners' expectations (Flege & Fletcher 1992; Gao 2019, a dissertation; Kang & Rubin 2009).
  - So old and new recordings should be rated together, in random order, without dates.
- **Raters who do not know what the speaker meant rate L2 French as easier to understand than raters who do.** 80 raters, 9 German-speaking learners; large effect (De Fino et al. 2024; conference paper). [Moderate]
- **Written-down intelligibility and 9-point ratings are related (r ≈ .57–.66) but not interchangeable** (Yoho et al. 2019; *native* talkers in noise). [Moderate]
- **Agreement drops for unscripted speech.** Word-level agreement fell from 0.52 to 0.42 when the reference text came from transcripts made by Whisper, OpenAI's open-source speech recogniser (MultiPA 2024). No study has validated sound-level verdicts on free speech. [Moderate]
- **ASR has accent bias and hides errors.** [Moderate]
  - Word error rates were 2–12 points higher for non-American accents (Tadimeti et al. 2022, before Whisper).
  - Whisper's own documentation reports accent differences and invented text.
  - More accurate ASR "corrects" mispronunciations more often (Park 2026).
  - ASR matched listeners on average but not for 3 of 4 individual speakers (Inceoglu, Chen & Lim 2023).
  - Older ASR was far worse than human listeners (Derwing, Munro & Carbonaro 2000).
- **Scorers compare speech with one dictionary pronunciation.** [Weak]
  - In Azure's own documentation example, the speaker says [ə] where "hello" expects /ɛ/. That phoneme scores 47, yet the word scores 99 with no error flag. So the risk shows up mainly in phoneme-level displays.
  - A 2022 report of valid variants being flagged as errors was reportedly fixed in 2023.
- **Recording quality matters.** [Moderate]
  - Microsoft recommends 16 kHz or higher, a close microphone and low noise.
  - In a small device comparison, pitch was measured accurately on all devices. Only steady vowels were tested, so this may not hold for changing pitch (Zhang et al. 2021).
  - Vowel formants (the resonances that define vowel quality) varied by device and analysis tool.
  - Studies reviewed by the same authors report that lossy compression distorts formants unpredictably.
- **French learner-speech technology is thin.** [Moderate] No public French benchmark like speechocean762 was found. Published detectors cover narrow targets: 72.6% yes/no accuracy on /R/ and /v/ for 23 Japanese learners (Pellegrini et al. 2016).
- **Open-source tools.** [Moderate]
  - The Montreal Forced Aligner (MFA) matches text to audio to find where each sound starts and ends. It has French and English models trained on native read speech.
  - Parselmouth gives access to Praat for pitch, loudness, formants and durations.
  - A multilingual wav2vec2 phoneme recogniser and a Kaldi scoring recipe also exist.
  - These tools have little validation on learner speech. Forced alignment found omitted words with F1 ≈ 0.85 on simulated English errors (MultiPA).
- **French timing measures.** Timing features separated Japanese A2 learners from native speakers as groups, using samples of 30 seconds or more. Learners of mixed levels showed only a trend (Coulange & Rossato 2020). [Weak]
- **Off-the-shelf audio LLMs are not reliable judges of pronunciation.** [Weak]
  - Off-the-shelf models were beaten by models tuned for the task at spotting errors and writing feedback (Liu et al. 2026).
  - Judge models showed biases from answer length and position (AudioJudge 2026).
  - Used zero-shot (without task-specific training), they agreed poorly with native raters on accent, comprehensibility and intelligibility (best r ≈ .28–.32; Issa & Ali 2026).
  - By contrast, speech models fine-tuned for the task reached near-expert agreement on the English benchmark (Ahn & Nam 2025).
- **Commercial alternatives.** No agreement figures by language were found for the vendors checked. SpeechSuper offers a French scripted API. None has been checked independently. [Weak]
- **Single-learner statistics.** Standard single-case measures can help separate real change from noise, with limits. [Moderate]
  - Non-overlap of all pairs (NAP: the share of before–after pairs where the later score is higher) and the log response ratio (the change in average score, as a ratio) are standard options. Their error margins assume independent sessions, which may not hold for one learner.
  - The reliable change index flags change larger than measurement error. It needs a reliability estimate, for example from repeat recordings.
  - Avoid Tau-U (another non-overlap statistic) as the main statistic, because it has no confidence interval.
  - A "multiple baseline across sounds" design trains one sound at a time and checks that untrained sounds stay flat. Published standards reportedly ask for at least 3 target sounds (Kratochwill et al. 2013; not re-checked).

---

## 4. What does not work, or lacks evidence

| Practice | What the evidence says | Label | In v1? |
|---|---|---|---|
| Making native accent the goal | Accent is partly separate from being understood. It moves a little in read speech and little in free speech. | Strong | Yes: Azure accuracy is the main score |
| Assuming read-aloud or listen-and-repeat drills will carry over on their own | Sound-only teaching improved read sentences only (Derwing et al. 1998). Meta-analyses find larger effects on controlled tests than on spontaneous speech. | Strong | Yes: all practice is scripted |
| Score-only (colour-coded) feedback; practice without corrective feedback | Teaching without feedback showed no change in one study of one sound. Feedback goes with larger effects. | Moderate | Yes |
| Choosing weak sounds from a few single-attempt scores; treating all errors as equal | Sound-level agreement is about 0.6. A reliable estimate needed about 8–22 tokens even with expert labels. Only high functional-load errors lowered comprehensibility (Japanese learners of English). | Moderate | Yes: 5 lowest averages after 3 attempts |
| Tongue-twister speed ladders | No controlled study of clarity outcomes was found, in L2 learners or native speakers. Tongue twisters are a research tool for causing speech errors. In story retelling, many back-to-back repetitions slowed articulation and caused word-for-word reciting. | No evidence | Yes |
| Rewarding faster speech (or uniformly slower speech) | L2 speakers are often too slow. Listeners preferred a rate moderately faster than the speaker's habit, not maximal. Slow is not the same as clear. (Listener-rating studies, not training studies.) | Weak to Moderate | Yes: articulation index and tempo tiers |
| Non-speech mouth exercises; cork, pen or bite-block drills | A Cochrane systematic review found no strong evidence (*children* with speech disorders). No adult training data were found. | No evidence of benefit | No |
| "Over-articulation" scored as phoneme accuracy, with no comparison to ordinary speech | Not studied as a drill. But a concrete instruction ("over-enunciate") makes speech more intelligible right away (*native speakers*), and a listener who sometimes mishears triggers targeted clarity. Do not group it with speed drills. | No evidence (drill); Moderate (clear speech) | Partly |
| Rhythm scores ("stress-timing", "even syllables") as targets | Rhythm measures vary between speakers and tasks often as much as between languages (*native speakers*). | Moderate | Yes |
| Using English word-stress drills for French | French prominence falls at the end of the phrase. | Moderate (descriptive) | Yes: shared prosody track |
| One overall prosody score; Azure prosody for French | Azure prosody exists only for en-US and does not tell the learner what to change. | Strong (technical) | Yes |
| Hearing the model, then repeating, on every trial of a new contrast | This disrupted perceptual learning in lab studies. | Weak (*lab listeners*) | Yes |
| Listening training alone as the route to better speaking | It improves speaking by roughly half to two-thirds as much as listening. | Moderate | No listening training at all |
| Cramming; judging mastery from in-session scores after hearing the model | Spacing beats cramming. Practice performance is not learning. | Strong / Moderate | Yes: retry until green, advance at ≥85 |
| One human rater as the true answer; self-rating as the main measure | One rater's reliability is .51–.64. Self-ratings are biased. | Moderate | No human check at all |
| Rating comprehensibility without knowing the intended message | Scores come out higher (one L2 French study). | Moderate | Not applicable |
| ASR transcript or word error rate as a pronunciation score | ASR is biased by accent and hides errors. | Moderate | No, but tempting |
| An audio LLM as a zero-shot pronunciation judge | Biased, weak agreement with raters, and beaten by task-tuned models. | Weak | No |
| Comparing Azure scores across months without noting model updates | Microsoft updated models in 2025 and August 2026. | Strong (documented) | Yes |
| Typed chat as speaking practice | Typed practice tested with spoken tests: d = 0.29, not significant. | Moderate | Not applicable |
| Correcting every error mid-conversation | No learning advantage over end-of-session feedback (typed chat, grammar only). | Weak | Not applicable |
| Unguided "hear the model, hear yourself" as the main feedback | Weaker than targeted feedback. Not enough on its own. | Weak | Yes |
| Streaks, and resetting them after a missed day | No evidence was found that streaks help learning. One missed day did not harm habit formation. | Weak (*non-language*) | v1 leaves streaks out, which fits the evidence |
| Voice-care or diction courses as clarity training | No intelligibility outcome was measured. Low-quality evidence (teachers and telemarketers). | Weak | No |
| Exposure alone | One first-language group showed no change over 7 years. | Weak | Not applicable |
| Counting filler words as a clarity measure | Fillers can help listeners. | Weak | Not applicable |
| Vowel-chart targets from compressed browser audio | Formants vary with device and compression. | Moderate | Recording is lossy (WebM/Opus) |

---

## 5. Priorities per language

The learner's first language decides which evidence applies:

| Learner's first language | English | French |
|---|---|---|
| French | L2 pronunciation track | Native clarity track |
| English | Native clarity track | L2 pronunciation track |
| Another language | L2 pronunciation track | L2 pronunciation track |

A very advanced L2 speaker can also use the clarity track.

### 5.1 English as an L2

For being understood by international listeners (the default target):
1. **Consonant contrasts with high functional load, and not dropping consonants from clusters** at the start or middle of words. [Moderate; correlational] Expert guidance adds aspirating /p t k/ (a puff of air) at the start of words, and says that adding a short vowel is tolerated better than dropping a consonant. [Mixed; expert guidance]
2. **Word stress and sentence (nuclear) stress.** [Moderate]
3. **Long versus short vowels** (fill/feel), and shorter vowels before voiceless consonants (back/bag). [Mixed; expert guidance]
4. **Pausing at phrase boundaries, and an articulation rate in the normal range.** [Moderate]

Lower priority for international intelligibility:
- /θ ð/ replaced by t, f or d;
- exact vowel quality;
- weak forms and schwa in production (teach them for listening);
- stress-timed rhythm;
- sound linking.

This order combines functional-load studies with the Lingua Franca Core, an expert list of features that matter for international intelligibility. The list is disputed. [Mixed] The lower-priority items matter more if the learner picks a native-listener target, such as General American.

Suzukida & Saito (2021) found that vowel errors did not lower comprehensibility for Japanese learners. Another study found vowel accuracy mattered for Mandarin speakers (Bent et al. 2007; flagged by reviewers). Do not give vowels zero weight.

How the priorities change with first language:
- **French speakers:**
  - word stress, listening first and then speaking;
  - vowel categories (ship/sheep);
  - /h/;
  - question intonation.

  Give /θ ð/ low priority. [Weak to Moderate; small studies; a reasonable hypothesis rather than an established ranking]
- **Japanese speakers:** /r/–/l/ and other high functional-load consonants such as /v/–/b/. [Moderate]
- **Mandarin speakers:** vowels (Thomson 2011) and prosody (Warren et al. 2009). [Weak]
- **Spanish speakers:** vowels, and plan for more sessions (Iverson & Evans 2009; one study). [Weak]
- **Cantonese speakers:** high functional-load errors (Munro & Derwing 2006, exploratory). [Weak]
- **Other first languages:** rely on the diagnostic. Predictions based on first language miss many individual difficulties (Munro 2018; flagged by reviewers).

### 5.2 French as an L2

The evidence is thin. The ranking below comes from the research team's frequency-weighted count of minimal pairs in the Lexique 3.83 French word database. It lists the contrasts that learners plausibly confuse. Some pairs with higher counts, such as /a/–/e/, are rarely confused. No listener study has tested the ranking. [Weak]
1. **Oral versus nasal vowels, and nasal versus nasal vowels:** à/en, sans/ça, bon/beau, en/on, sans/sont, temps/ton.
2. **Schwa versus /e/ and /a/ in short words that mark number and gender:** le/les, de/des, le/la.
3. **Final consonants that mark gender or verb form** (petit/petite, tout/toute), and final /ʁ/ (fait/faire, dit/dire). The priority is not merging /ʁ/ with /l/, /v/ or silence. A perfect French "r" is not the priority.
4. **/y/–/u/** (tu/tout, vu/vous), **/i/–/y/**, and **/u/–/o/**.

Low priority, and never scored as errors:
- /ø/–/œ/;
- /o/–/ɔ/;
- /ɛ̃/–/œ̃/;
- /a/–/ɑ/;
- word-final /e/–/ɛ/.

The first three pairs separate almost no frequent words in the Lexique count. Lexique does not code /a/–/ɑ/, and native broadcast speech has merged it over the last century (Cęcelewski et al. 2024). Word-final /e/–/ɛ/ does separate many verb forms, but many native speakers merge it. The merger claims for the other pairs rest on general knowledge of native speech, not on this analysis. Québec French keeps some of these contrasts, so review this list in fr-CA mode. Front rounded vowels must still stay distinct from /e/, /ɛ/ and /u/ (deux/des, peur/père).

Other French priorities:
- **Prosody:** group words into accentual phrases, lengthen the final syllable, rise at the end of non-final phrases, fall at the end of statements. [Moderate; descriptive]
- **Fluency:** speech rate, phonation ratio (the share of time spent speaking) and the variability of syllable timing separate learners from native speakers (Coulange & Rossato 2020). [Weak]
- **Liaison:** focus on frequent contexts where liaison is required (les amis, ils ont, un ami) and on pairs where it changes meaning (ils ont / ils sont). Liaison where it is forbidden also matters (les héros vs les zéros). Never mark optional liaison as an error (thesis 2015PA100186). [Weak]
- **Instruction evidence:** a 16-week online course reduced sound errors and pauses but did not change listener ratings (Inceoglu 2019). [Weak]
- **Variety:** choose fr-FR or fr-CA and use it everywhere: model voice, scoring language and aligner. Québec French differs, for example with [ts dz] before /i y/. Standard aligners needed Québec-specific models (Lancien et al. 2020). [Moderate]

How the priorities change with first language:
- **English speakers:**
  - the phrase-final rise and lengthening;
  - dropping stress on the first syllable of words;
  - nasal vowels (training with audio and video helped);
  - /y/.

  [Weak to Moderate]
- **Japanese speakers:** final lengthening, /y/–/u/, /ʁ/ and /v/. [Weak]
- **Mandarin speakers:** /ɥi/, whose /i/ tends to drift toward [y] (Fu et al. 2024). [Weak]
- **Italian speakers:** they carry over marking emphasis with vowel length (De Paolis 2024). [Weak]

### 5.3 If one of the two languages is native

For a native language, the goal is clarity, not pronunciation. Most evidence here comes from *native speakers*.
- **Clear speech on instruction.** Native talkers became clearer at once when told to "over-enunciate", which worked best. "Speak clearly" worked least well, though it still beat ordinary speech. Talkers differed widely in how much they gained (Lam & Tjaden 2013; 12 native American English talkers). [Moderate]
- **Listener simulation.** When a simulated partner occasionally misunderstood, targeted hyperarticulation (exaggerated articulation of the confusable sound) nearly doubled within a session (Buz et al. 2016; native English; web experiments). French speakers also hyperarticulated more in noise and with a partner (Garnier et al. 2018; 6 Canadian French speakers; articulation measured, not intelligibility). [Moderate]
- **Clarity at the speaker's usual rate, not by slowing down.** Trained talkers kept the clear-speech benefit at a normal rate (Krause & Braida 2002). Uniform slowing gave mixed results for listeners (Tuttösí et al. 2026; preprint). [Weak]
- **Carry-over to everyday speech is largely untested.** Clear speech faded within a conversation and restarted at each new one (Lee & Baese-Berk 2020). [Weak]
- **Delivery skills can be trained,** such as fewer fillers (Mancuso & Miltenberger 2016; native students) and more pitch variation (Hincks & Edlund 2009; L2 speakers). No gains in listener understanding were found. [Weak]
- **Measures need room to improve.** A native speaker will score near the top of Azure's accuracy scale. Use instead:
  - speech mixed with background noise;
  - sentences whose words cannot be guessed from context;
  - pseudo-words (made-up words).

  A French pseudo-word intelligibility test was validated with 39 healthy speakers and 78 *clinical* patients (Ghio et al. 2020; Rebourg et al. 2020, 2024). It has not been validated as a progress measure for training. [Moderate]
- **Very advanced L2 speakers also produce a clear-speech benefit** (Smiljanić & Bradlow 2011; details not re-checked). Late bilinguals gained less, and some of their vowels became harder to understand (Rogers et al. 2010). [Moderate]

---

## 6. How v1 compares

### What v1 gets right
- It records real speech and scores it automatically. Computer-based and ASR-based practice has moderate effects. [Moderate]
- It uses minimal pairs. This is the right material, but v1 uses it only for reading aloud.
- It has a prosody track and shadowing. Prosody matters for being understood. Shadowing has weak support for fluency and comprehensibility.
- It includes consonant clusters. Dropped consonants in clusters are linked to lower understanding (correlational).
- It leaves out streaks and leaderboards. That fits the evidence.
- Checking long passages for dropped syllables is plausible, but no study has validated it as a clarity measure.
- The v1 docs already treat the prosody score as nullable (it may be missing) in every language.

### What v1 gets wrong

| Area | v1 design | Problem | Evidence |
|---|---|---|---|
| Goal | Azure accuracy is the main score | It measures closeness to a native acoustic model, which is close to measuring accent | Munro & Derwing 1995; Chau & Huensch 2025 |
| Practice and measurement | Everything is scripted read-aloud; charts average practice scores by day | Cannot show real-world progress. Repeating items inflates scores. Changes in item choice and microphone conditions show up as "progress". | Saito & Plonsky 2019; Thomson & Derwing 2015 |
| Target selection | 5 lowest all-time phoneme averages after 3 or more attempts | Ignores functional load. Far too few tokens. The average never forgets old attempts and shows no uncertainty. | Suzukida & Saito 2021; speechocean762 re-analysis |
| French sound tracking | The stats update stores only phonemes that have a name | Azure gives no phoneme names for fr-FR, so the French weak-sound selector may collect nothing. This needs checking with a live fr-FR call. | Azure docs |
| Feedback | Green ≥85 / amber / red for every word; phoneme scores; expected IPA symbol | Does not show the sound actually produced (it never requests the "spoken phoneme" output). Gives no fix and no prompt to self-correct; the Retry button only invites repetition. Colours every word. | Saito & Lyster 2012; Lyster & Saito 2010 |
| Speed ladders | Tongue twisters at 0.75×, 1.0× and 1.25× TTS speed; advance after one attempt at ≥85; an articulation index that rewards speed | No evidence was found for this method. It rewards speed and decides on one noisy attempt. Azure is calibrated for normal speed. | Munro & Derwing 2001; Suzuki & Hanzawa 2022; Microsoft docs |
| Prosody | One Azure prosody number; "stress-timing" (English); "even-syllable rhythm" (French) | Azure prosody exists only for en-US. The docs say prosody is enabled, but a code review found it is never switched on in `assess.ts`. The French prosody track gets no prosody scoring. "Even-syllable rhythm" misdescribes French. | Azure docs; Arvaniti 2012; Walton 2023 |
| Listening | No listening training; one TTS voice per language; hear-then-repeat on every trial | Misses the best-supported technique for hearing contrasts. Training on one synthetic voice is the setting in which transfer to natural speech failed in an older study. | Uchihara et al. 2025; Giannakopoulou et al. 2017; Baese-Berk & Samuel 2016 |
| Schedule | No multi-week plan and no spacing; "retry until green" | Encourages cramming. Has no retention checks. | Kim & Webb 2022; Soderstrom & Bjork 2015 |
| The learner | No first-language diagnosis; the same design for both languages; no accent-variety setting; no native-language branch | Priorities depend on the first language and on which language is native | Derwing & Munro 2013; Iverson & Evans 2009; Munro 2018 |
| French content | Mostly /ʁ/, /s/ and /ʃ/ tongue twisters. In `phonemes.json` the nasal-vowel examples are swapped: "vin" is listed for /ɑ̃/ and "vent" for /ɛ̃/. The liaison items are optional liaisons. | Misses the high-load contrasts, and contains a factual error | Lexique analysis |
| Audio and scoring | WebM/Opus recording converted to WAV; no quality check; no scorer version stored | Lossy audio and noise. The August 2026 model update could look like learner progress or decline. | Zhang et al. 2021; Microsoft release notes |
| Checks against real listeners | No human-listener check; no self-monitoring | Automatic scores are unvalidated for this learner | Inceoglu et al. 2023; Trofimovich et al. 2016 |
| Staying with it | No goals, plans, reminders or way back after a gap | Dropout is common in self-study apps (about 43% within 3 months, secondary figure) | Hwang et al. 2024 |

---

## 7. Implications for the redesign

### Ranked capabilities

**1. Progress Check, kept separate from practice.** Evidence: Saito & Plonsky 2019; Lee et al. 2015; De Fino et al. 2024; speechocean762 re-analysis; Flege & Fletcher 1992. [Strong for the principle; Moderate for the exact design]
- Run it every 2–4 weeks in each language.
- Tasks:
  - unscripted speaking with a known intended message, such as a picture story, a retell, or a 60-second opinion;
  - held-out words and sentences;
  - delayed probes 2–4 weeks after a target's training block.
- Measures:
  - an ASR intelligibility estimate on unpredictable sentences (a design inference, not tested);
  - articulation rate, mid-clause pauses and mean length of run (the average number of syllables between pauses);
  - accuracy on held-out items.
- Optional listener panel: 3–5 trained listeners per clip, or about 10 untrained ones. They write down what they hear and rate ease of understanding on a 9-point scale. Rate old and new clips together, blind and shuffled, with fixed reference clips.
- A personal "real change" threshold: record the same 10 sentences twice at onboarding and monthly, and use the differences to measure normal score noise.
- Mark a target "learned" only when it holds on untrained items at the delayed probe.

**2. Onboarding diagnostic and routing for each language.** Evidence: Derwing & Munro 2013; Iverson & Evans 2009; Yan et al. 2016; Walker et al. 2021; Munro 2018. [Moderate]
- Ask for the first language, and which of the two languages (if either) is native.
- Record baselines: a 60-second picture story and a 60-second opinion.
- Add a read passage that covers high-load contrasts and stress.
- Add a listening screener: about 15–20 contrasts, 8–12 trials each, 2 voices.
- Add a short sentence-repetition test to set content difficulty. It measures general level, not sound errors.
- Add two settings: target listener (international or native) and accent variety (fr-FR or fr-CA; en-US or other).
- Route each language to the L2 pronunciation track or the native clarity track.
- Treat errors found at onboarding only as candidates. Confirm each one with a targeted probe.

**3. Target priority model.** Evidence: Suzukida & Saito 2021; Munro & Derwing 2006; Kang et al. 2018, 2020; speechocean762 re-analysis. [Moderate for English; Weak for French]
- Score each target as functional load × the learner's error rate × word frequency.
- Include stress, dropped sounds, pausing and phrase-level prosody as targets, not only phonemes.
- Before calling a target weak, require 15–20 tokens, in at least 5 different words, over at least 3 sessions. This threshold is a heuristic from one benchmark re-analysis. [Weak]
- Rank by an interval estimate, not by the raw average.
- Store the French weights as data and label them provisional.

**4. Listening trainer (HVPT).** Evidence: Uchihara et al. 2025; Carlet & Cebrian 2022; Baese-Berk & Samuel 2016; Fuhrmeister & Myers 2020. [Strong for listening training; Mixed or Weak for the details below]
- Ask which word was heard, with word labels and feedback.
- Use 4–6 voices, and keep 1–2 voices plus natural recordings for tests only.
- Plan about 8–15 sessions of 10–20 minutes for each contrast set.
- Practise a new contrast in a block first, then mix it with others.
- Run listening blocks separately from speaking blocks while the learner cannot yet hear the contrast (for example, below about 80% correct; a heuristic).
- Increase difficulty as the learner improves.

**5. Feedback loop for each target.** Evidence: Saito & Lyster 2012; Saito 2013; Kissling 2013; Lyster & Saito 2010; motor-learning reviews. [Moderate for feedback; Mixed for explanations and prompts-first]
- Sequence for each target:
  1. a short explanation of how to make the sound, with a mouth picture or lip video;
  2. controlled practice;
  3. the target placed inside a meaningful spoken task, with feedback on that sound only;
  4. a check with new words, a few days later.
- Show at most 1–2 corrections per attempt, and only for errors that recur and that the system detects with confidence.
- Use cautious wording ("probably"), because the scores are uncertain.
- Add a "that was right" button so the learner can dispute a score.
- Keep lists of accepted variants: English weak forms; French optional liaison and dropped schwa.
- On a sample of trials, ask the learner to judge their attempt before the score appears.

**6. Spaced scheduler and multi-week programme.** Evidence: Kim & Webb 2022; Suzuki 2017, 2021; Ngo et al. 2024; Hwang et al. 2024. [Strong for spacing in general; Weak for exact intervals]
- Bring each target back the next day, after about 3 days, after about 1 week, and later still.
- Allow at most about 3 back-to-back repeats of the same item.
- Plan cycles of 8–12 weeks (up to 16).
- Aim for sessions of about 10–15 minutes, at least 4 times a week.
- Cap the review backlog after a break.

**7. Prosody module for each language.** Evidence: Hahn 2004; Kang 2010; Dupoux et al. 1997; Walton 2023; Hincks & Edlund 2009; Azure docs. [Moderate]
- **English:**
  - word stress, with listening first for French speakers;
  - sentence stress in question-and-answer or correction dialogues ("No, I rented a FLAT");
  - pausing and phrasing.
- **French:**
  - accentual-phrase grouping;
  - final-syllable lengthening;
  - rises at the end of non-final phrases;
  - a fall at the end of statements.
- Show pitch in semitones, scaled to the learner's own range. Score its direction and timing at the target points only. Fade the display out over sessions. Only a pitch-variation meter has been tested, so treat the pitch-line design as experimental. [Weak]
- For French, measure all of this in the app, because Azure does not provide it.

**8. Fluency module (replaces the speed ladders).** Evidence: Suzuki 2021; Suzuki & Hanzawa 2022; de Jong & Perfetti 2011; Tran & Saito 2021; Whitworth & Rose 2025; Fu et al. 2024. [Moderate]
- Retell or monologue tasks: tell one prompt 3 times in a session, with gently shrinking time limits and 1–2 corrections between rounds. Use a new prompt next session.
- Measure articulation rate, mid-clause pauses and mean length of run on new prompts only.
- Detect word-for-word recycling and prompt the learner to rephrase.
- Shadowing:
  - gate it by level, starting beginners on delayed imitation (one study supports this);
  - about 5 passes per passage;
  - human recordings where possible;
  - score timing and pitch alignment, not phonemes.
- Build a phrase bank of frequent spoken chunks for each language.

**9. Spoken task and conversation mode.** Evidence: Bibauw et al. 2022; Kamelabad et al. 2026; Dai & Wu 2025. [Weak to Moderate]
- Use goal-driven spoken tasks: retell, role-play, information gap.
- Keep it spoken only. Typed practice transferred weakly to speaking.
- Give feedback limited to the current targets, plus a short report at the end.
- Measure time to the first word.
- Track minutes spent in each mode, so the app can compare progress per minute across modes.

**10. Native clarity track (only if one language is native).** Evidence: Lam & Tjaden 2013; Buz et al. 2016; Krause & Braida 2002; Ghio et al. 2020; Mancuso & Miltenberger 2016. [Moderate for the immediate effect; Weak for lasting change]
- Record ordinary and clear versions of the same item.
- Add a listener-simulation game: minimal pairs on screen, with ASR in background noise playing the partner, who mishears only occasionally.
- Caution: older ASR misread deliberately exaggerated speech (Shriberg et al. 1992), and ASR reacts to speaking rate differently from human listeners (Tuttösí et al. 2026). Check the ASR partner against a human listener now and then.
- Aim for clarity at the speaker's usual rate.
- Every 1–2 weeks, record an unprompted speech sample.
- Optional delivery work: fillers, pause placement, pitch variation, and rehearsing a real upcoming talk.

**11. Habit and motivation support.** Evidence: Gollwitzer & Sheeran 2006; Sheeran et al. 2025; Lally et al. 2010; Hwang et al. 2024; self-efficacy meta-analyses; Abel & de Bruin 2024. [Moderate to Weak; mostly *non-language*]
- Ask for a concrete goal tied to real use.
- Ask for a weekly target and an if-then plan with a fixed cue time.
- Show sessions per week, never a streak that resets.
- Offer a short welcome-back session after a gap.
- Once a month, play the learner's before-and-after recordings side by side, with plain statements of what is now reliable.
- Explain why the harder, mixed practice is used.
- Set a weekly real-life speaking task that the learner logs.

**12. Optional and experimental tools.** Evidence: Kartushina et al. 2015; Olson 2014; Baills & Prieto 2023; Liu et al. 2026. [Weak]
- A vowel chart scaled to the learner's own vowels, compared only with their own baseline on the same device.
- A voice-onset-time meter for English versus French /p t k/.
- A "tap the beat" mode, tested on this learner by alternating weeks with and without it.
- A text-LLM layer that explains only errors measured by other tools, and says "not sure" when confidence is low.

### Technology constraints
- **Azure fr-FR** returns no prosody score, no phoneme names, no "spoken phoneme" and no syllable results. French phoneme scores must be mapped to sound labels through the app's own pronunciation lexicon. Whether that mapping works reliably is unverified.
- **Azure en-US prosody costs extra.** It gives one number plus break and monotone flags, and no word-stress errors.
- **In continuous mode (over 30 seconds), Azure does not detect omitted or inserted words.**
- **Azure scoring models change without new agreement figures,** and the documentation describes no way to lock a version. Store the date with every score. After an update, re-score stored baseline audio with the new model.
- **Scores assume normal speed and volume, 16 kHz or better audio, a close microphone and low noise.**
- **The v1 Azure free tier caps audio at 5 hours a month.** Conversation and retell modes use audio quickly.
- **General ASR is biased by accent, hides mispronunciations and can invent text.** Do not use it as a pronunciation score.
- **Browser recording formats are lossy.** Formant-based feedback needs uncompressed capture.
- **Most validation data come from Mandarin-speaking learners of English.** How accurate and fair the scores are for this learner's first language is unknown.
- **The app runs locally for a single user.** A human listener panel needs a way to share clips, which raises privacy questions.

### Technology options
- Keep Azure behind a provider interface, and store the provider and model date with each score.
- For en-US, turn on prosody assessment and request the "spoken phoneme" output.
- For unscripted speech, use Azure's unscripted mode, or run speech-to-text first and then a scripted assessment against the transcript.
- Add a local analysis layer, validated on 30–50 of the learner's own recordings before its numbers are shown:
  - forced alignment (for example MFA French and English models) for timing, dropped words and phrase-final lengthening;
  - pitch and duration extraction (for example Praat through Parselmouth, or pitch trackers that run in the browser);
  - optionally a multilingual phoneme recogniser (wav2vec2) or a goodness-of-pronunciation (GOP) scoring recipe for French sound checks, clearly labelled "experimental".
- Capture uncompressed audio (PCM) and check its quality before scoring: clipping, noise floor, distance.
- Use several neural TTS voices, including regional variants, for listening training. Check that each voice produces the contrast. Add natural recordings to the test sets.
- Pilot any other scoring vendor (such as SpeechSuper for French) on 40–60 of the learner's items, scored side by side with a native listener.
- Use a clause segmenter for English and French to label pauses as mid-clause or boundary pauses. Check it against 20–30 hand-labelled recordings.
- Statistics: beta-binomial estimates for sound error rates, which give each rate a likely range and pull estimates based on few tokens toward the average; NAP or log response ratio plus a reliable change index for single-learner progress; randomisation tests if training start dates are randomised.
- A text LLM can write explanations and generate prompts and stories. It should not do the scoring.

---

## 8. Open questions and weak spots in the evidence

**About this learner**
- What is the learner's first language? Is one of English or French native? This decides which track each language uses. The L2 evidence does not apply to a native language.
- Who is the target listener: international speakers or native speakers? Which French variety?
- Can the learner arrange occasional human listeners? How often are they needed? A reasonable default is at baseline and at the end of each 4–6 week block, but no study was found on this.

**Gaps in the research**
- No controlled study was found showing that a self-study pronunciation app improves listener-rated comprehensibility of spontaneous speech.
- French evidence is thin:
  - no validated functional-load ranking;
  - no HVPT studies found for /y/–/u/, /e/–/ɛ/, /ø/–/œ/ or /ʁ/;
  - no verified liaison training studies;
  - no study of how much phrase-level prosody errors reduce comprehensibility.
- No published test-retest reliability was found for Azure or other vendors, and no validation of Azure fr-FR against human listeners.
- The best spacing intervals for pronunciation practice are unknown. The evidence comes mostly from vocabulary, grammar, fluency and listening-only studies, and the studies disagree.
- It is unknown when to switch from blocked to mixed practice for a new contrast, and what the best session length is.
- Whether shadowing gains last is unknown: only 1 of 44 studies had a delayed test.
- No study was found that tested tongue twisters or tempo training for clarity. De Jong & Mora (2019), which asks whether good articulatory skill leads to fluent speech, is relevant but was not opened.
- No study has shown that TTS voices work as well as human voices for HVPT. It is also unknown whether the Azure fr-FR voices keep /e/–/ɛ/ and /ø/–/œ/ distinct.
- Whether clear-speech practice changes everyday speech in native speakers is untested.
- LLM voice partners have not been tested against blind listener ratings of comprehensibility.
- Findings from English (Lingua Franca Core priorities, functional load of vowels) may not hold for native-listener targets or for French.

**Where evidence comes from other groups**
- *Clinical* and *children*: motor-learning principles, non-speech mouth exercises, the crowd-rating protocol (9 listeners per token), speech-therapy probe designs and dose, clapping studies, the French pseudo-word test.
- *Native speakers*: clear speech, rate and clarity, filler reduction, device effects on recordings, speech-movement specificity, rhythm-metric reliability.
- *Lab listeners*: the disruption from speaking during listening training, blocked versus mixed practice for new contrasts, lip video for vowel length (Hirata & Kelly 2010), the Danish vowel chart study (Kartushina et al. 2015).
- *Non-language*: habit formation, if-then plans, much of the spacing and interleaving evidence, retrieval practice, self-assessment accuracy (León et al. 2023), deliberate practice, gamification, learner choice of blocking (Abel & de Bruin 2024).

**Numbers to re-check before citing in product documents**
- Chau & Huensch (2025): the r = .32 link between intelligibility and accent.
- Saito & Chen (2025): the "doubled" spacing gains.
- Ngo et al. (2024): the explicit-feedback and duration results.
- Nagle et al. (2025): 2 voices versus 6.
- Zhang, Cheng & Zhang (2021): the fading of the many-voices benefit.
- Whitworth & Rose (2025): the shadowing outcome counts.
- Liu & Tang (2025) and Abdi Tabari et al. (2025): task-repetition effect sizes.
- Mahdi & Al Khateeb (2019): the overall d = 0.68.
- Hwang et al. (2024): the dropout figures.
- Trofimovich et al. (2016): the level-dependent self-rating pattern.
- Kim & Webb (2022), Macnamara et al. (2014/2018) and Lally et al. (2010): figures seen only through secondary sources.
- Several landmark studies were not opened: Derwing, Munro & Wiebe 1998; Field 2005; Gordon & Darcy 2016/2022; Munro & Derwing 2001; Hardison 2004; Bergeron & Trofimovich 2017; Kennedy et al. 2014; Liakin et al. 2015, 2017; Inceoglu 2016; Kocjančič Antolík et al. 2019.

**Contradictions to keep in mind**
- ASR-based training shows larger effects on sounds than on prosody, but classroom prosody training transferred better to spontaneous speech.
- Findings on adult clapping or gesture training are described inconsistently.
- Evidence on whether explicit phonetic explanation helps is mixed.
- The one study where transfer needed feedback conflicts with evidence that beginners and listening-only training improved without it.

---

## 9. References

### Goals and effects of instruction
- Lee, Jang & Plonsky (2015). The effectiveness of second language pronunciation instruction: A meta-analysis. *Applied Linguistics* 36(3). https://doi.org/10.1093/applin/amu040
- Thomson & Derwing (2015). The effectiveness of L2 pronunciation instruction: A narrative review. *Applied Linguistics* 36(3). https://doi.org/10.1093/applin/amu076
- Saito & Plonsky (2019). Effects of second language pronunciation teaching revisited. *Language Learning* 69(3). https://doi.org/10.1111/lang.12345
- Yao, He, Chen & Zhu (2025). A meta-analysis of second language phonetic training. *JSLHR*. https://pubs.asha.org/doi/abs/10.1044/2024_JSLHR-24-00432
- Mahdi & Al Khateeb (2019). The effectiveness of computer-assisted pronunciation training: A meta-analysis. *Review of Education*. https://doi.org/10.1002/rev3.3165
- Almusharraf et al. (2024). The effect of settings, educational level and tools on computer-assisted pronunciation training: A meta-analysis. *Journal of Computer Assisted Learning*. https://onlinelibrary.wiley.com/doi/abs/10.1111/jcal.12974
- Ngo, Chen & Lai (2024). The effectiveness of automatic speech recognition in ESL/EFL pronunciation: A meta-analysis. *ReCALL* 36(1). https://doi.org/10.1017/S0958344023000113
- Amrate & Tsai (2025). Computer-assisted pronunciation training: A systematic review. *ReCALL*. https://doi.org/10.1017/S0958344024000181
- Munro & Derwing (1995). Foreign accent, comprehensibility, and intelligibility. *Language Learning* 45(1). https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1467-1770.1995.tb00963.x
- Derwing & Munro (1997). Accent, intelligibility, and comprehensibility: Evidence from four L1s. *SSLA* 19(1). https://doi.org/10.1017/S0272263197001010
- Derwing & Munro (2005). Second language accent and pronunciation teaching. *TESOL Quarterly* 39(3). https://doi.org/10.2307/3588486
- Munro & Derwing (2020). Foreign accent, comprehensibility and intelligibility, redux. *JSLP* 6(3). https://doi.org/10.1075/jslp.20038.mun
- Chau & Huensch (2025). Relationships among L2 fluency, intelligibility, comprehensibility, and accentedness: A meta-analysis. *SSLA* 47(1). https://www.cambridge.org/core/journals/studies-in-second-language-acquisition/article/relationships-among-l2-fluency-intelligibility-comprehensibility-and-accentedness/BF27ACC694B94D3B99D8BC6D05BFCA54
- The relationship between intelligibility and comprehensibility in second language speech (2025). *Bilingualism: Language and Cognition*. https://www.cambridge.org/core/journals/bilingualism-language-and-cognition/article/relationship-between-intelligibility-and-comprehensibility-in-second-language-speech/BCBF0D19FF3B9C9E9D43A3F521A23622
- Levis (2005). Changing contexts and shifting paradigms in pronunciation teaching. *TESOL Quarterly* 39(3). https://onlinelibrary.wiley.com/doi/abs/10.2307/3588485
- Levis (2020). Revisiting the intelligibility and nativeness principles. *JSLP* 6(3). https://benjamins.com/catalog/jslp.20050.lev
- Crowther (2026). Teaching for intelligibility. *TESOL Quarterly* 60(2). https://onlinelibrary.wiley.com/doi/10.1002/tesq.70120
- Derwing, Munro & Wiebe (1998). Evidence in favor of a broad framework for pronunciation instruction. *Language Learning* 48(3). https://doi.org/10.1111/0023-8333.00047
- Gordon & Darcy (2016). The development of comprehensible speech in L2 learners. *JSLP* 2(1). https://www.researchgate.net/publication/299572479_The_development_of_comprehensible_speech_in_L2_learners_A_classroom_study_on_the_effects_of_short-term_pronunciation_instruction
- Gordon & Darcy (2022). Teaching segmentals and suprasegmentals. *JSLP*. https://benjamins.com/catalog/jslp.21042.gor
- Darcy & Rocca (2022). Comprehensibility improvements in integrated pronunciation instruction. *JSLP* 8(3). https://benjamins.com/catalog/jslp.21035.dar
- Saito (2021). What characterizes comprehensible and native-like pronunciation among ESL speakers? *TESOL Quarterly* 55(3). https://onlinelibrary.wiley.com/doi/full/10.1002/tesq.3027
- Trofimovich & Isaacs (2012). Disentangling accent from comprehensibility. *Bilingualism: Language and Cognition* 15(4). https://www.cambridge.org/core/journals/bilingualism-language-and-cognition/article/abs/disentangling-accent-from-comprehensibility/882035A64FBF4694FBE920784B21C58A
- Saito, Trofimovich & Isaacs (2017). Using listener judgments to investigate linguistic influences on L2 comprehensibility and accentedness. *Applied Linguistics* 38(4). https://academic.oup.com/applij/article/38/4/439/2952156
- Bergeron & Trofimovich (2017). Linguistic dimensions of accentedness and comprehensibility in L2 French. *Foreign Language Annals* 50 (not opened). https://www.paveltrofimovich.ca/wp-content/uploads/2022/06/Bergeron_Trofimovich_2017.pdf
- Derwing & Munro (2013). The development of L2 oral language skills in two L1 groups: A 7-year study. *Language Learning* 63. https://doi.org/10.1111/lang.12000
- Derwing, Munro, Foote, Waugh & Fleming (2014). Opening the window on comprehensible pronunciation after 19 years. *Language Learning* 64. https://onlinelibrary.wiley.com/doi/abs/10.1111/lang.12053
- Derwing, Munro & Thomson (2007). A longitudinal study of ESL learners' fluency and comprehensibility development. *Applied Linguistics*. https://doi.org/10.1093/applin/amm041
- Inceoglu (2019). Effects of instruction on L2 French learner pronunciation. *JSLP* 5(2). https://benjamins.com/catalog/jslp.18004.inc
- Kennedy, Blanchet & Trofimovich (2014). Learner pronunciation, awareness, and instruction in French as a second language. *Foreign Language Annals* 47 (not opened). https://onlinelibrary.wiley.com/doi/abs/10.1111/flan.12066

### Priorities and functional load
- Munro & Derwing (2006). The functional load principle in ESL pronunciation instruction. *System* 34. https://doi.org/10.1016/j.system.2006.09.004
- Suzukida & Saito (2021). Which segmental features matter for successful L2 comprehensibility? *Language Teaching Research* 25(3). https://doi.org/10.1177/1362168819858246 (abstract checked: https://raw.githubusercontent.com/marcoweb/annif-experiments/main/education-en/raw-files/corpus-training/Corpus_entrenamiento_Education_6000_documentos/D1398.txt)
- Kang, Thomson & Moran (2018). Empirical approaches to measuring the intelligibility of different varieties of English. *Language Learning* 68(1). https://onlinelibrary.wiley.com/doi/abs/10.1111/lang.12270
- Kang, Thomson & Moran (2020). Which features of accent affect understanding? *Applied Linguistics* 41(4). https://doi.org/10.1093/applin/amy053
- Kang & Moran (2014). Functional loads of pronunciation features in nonnative speakers' oral assessment. *TESOL Quarterly* 48. https://doi.org/10.1002/tesq.152
- Walker, Low & Setter (2021). English pronunciation for a global world. OUP ELT position paper. https://www.oup.com/elt/expert
- Field (2005). Intelligibility and the listener: The role of lexical stress. *TESOL Quarterly* 39(3) (not opened). https://doi.org/10.2307/3588487
- Hahn (2004). Primary stress and intelligibility. *TESOL Quarterly* 38(2). https://doi.org/10.2307/3588378
- Anderson-Hsieh, Johnson & Koehler (1992). Native speaker judgments of nonnative pronunciation and deviance in segmentals, prosody, and syllable structure. *Language Learning* 42(4). https://doi.org/10.1111/j.1467-1770.1992.tb01043.x
- Kang (2010). Relative salience of suprasegmental features on judgments of L2 comprehensibility and accentedness. *System* 38. https://doi.org/10.1016/j.system.2010.01.005
- Warren, Elgort & Crabbe (2009). Comprehensibility and prosody ratings for pronunciation software development. *Language Learning & Technology* 13(3). http://kentlee7.com/zs/software.comprehensibility.ratings.pdf
- Bent, Bradlow & Smith (2007). Segmental errors in different word positions and their effects on intelligibility (flagged by reviewers; bibliographic record). https://github.com/cainesap/resources/blob/master/latex/bib.bib
- Munro (2018). How well can we predict second language learners' pronunciation difficulties? *CATESOL Journal* 30(1) (not opened; seen in the reference list of Lučić Rehman et al. 2020). https://raw.githubusercontent.com/marcoweb/annif-experiments/main/education-en/raw-files/corpus-training/Corpus_entrenamiento_Education_6000_documentos/D1420.txt
- Lučić Rehman et al. (2020). The English pronunciation of Arabic speakers (abstract). https://raw.githubusercontent.com/marcoweb/annif-experiments/main/education-en/raw-files/corpus-training/Corpus_entrenamiento_Education_6000_documentos/D1420.txt
- New, Pallier, Brysbaert & Ferrand (2004). Lexique 2; Lexique 3.83 documentation. https://github.com/chrplr/openlexicon/blob/master/datasets-info/Lexique383/README-Lexique.md
- Oh, Coupé, Marsico & Pellegrino (2015). Bridging phonological system and lexicon: functional load (flagged; not opened). https://doi.org/10.1016/j.wocn.2015.08.003

### Perception training
- Uchihara, Karas & Thomson (2025). High variability phonetic training (HVPT): A meta-analysis. *SSLA* 47(3). https://doi.org/10.1017/S0272263125100879
- Uchihara, Karas & Thomson (2024). Does perceptual HVPT improve L2 speech production? *Applied Psycholinguistics* 45(4). https://doi.org/10.1017/S0142716424000195
- Sakai & Moorman (2018). Can perception training improve the production of second language phonemes? *Applied Psycholinguistics* 39(1). https://www.cambridge.org/core/journals/applied-psycholinguistics/article/abs/can-perception-training-improve-the-production-of-second-language-phonemes-a-metaanalytic-review-of-25-years-of-perception-training-research/57401D28450902EE96659AD10AA11488
- Thomson (2018). High Variability [Pronunciation] Training (HVPT). *JSLP* 4(2). https://benjamins.com/catalog/jslp.17038.tho
- Zhang, Cheng & Zhang (2021). The role of talker variability in nonnative phonetic learning. *JSLHR* 64(12). https://pubs.asha.org/doi/10.1044/2021_JSLHR-21-00181
- Zhang et al. (2025). Determining optimal talker variability for nonnative speech training. *JSLHR*. https://pubs.asha.org/doi/10.1044/2024_JSLHR-24-00599
- Brekelmans, Lavan, Saito, Clayards & Wonnacott (2022). Does high variability training improve learning of non-native phoneme contrasts? *JML* 126. https://doi.org/10.1016/j.jml.2022.104352
- Giannakopoulou, Brown, Clayards & Wonnacott (2017). High or low? *PeerJ* 5:e3209. https://peerj.com/articles/3209/
- Nagle, Bruun & Zarate-Sandez (2025). Comparing lower and higher variability multi-talker perceptual training. *Applied Psycholinguistics*. https://resolve.cambridge.org/core/journals/applied-psycholinguistics/article/comparing-lower-and-higher-variability-multitalker-perceptual-training/2755FEDEFB74EC4A3DD83011015BCB97
- Qian, Chukharev-Hudilainen & Levis (2018). A system for adaptive high-variability segmental perceptual training. *LLT* 22(1). https://www.lltjournal.org/item/10125-44582/
- Wang & Munro (2004). Computer-based training for learning English vowel contrasts. *System* 32. https://doi.org/10.1016/j.system.2004.09.011
- Al-Shami & Cardoso (2025). Text-to-speech technology as a tool for HVPT. *Canadian Journal of Applied Linguistics* 28(3). https://journals.lib.unb.ca/index.php/CJAL/article/view/35910
- Carlet & Cebrian (2022). The roles of task, segment type, and attention in L2 perceptual training. *Applied Psycholinguistics* 43(2). https://www.cambridge.org/core/journals/applied-psycholinguistics/article/abs/roles-of-task-segment-type-and-attention-in-l2-perceptual-training/E189C9BF18E3042CBF60A24B1FE02E5D
- Baese-Berk & Samuel (2016). Listeners beware: Speech production may be bad for learning speech sounds. *JML* 89. https://doi.org/10.1016/j.jml.2015.10.008
- Lee, Plonsky & Saito (2020). The effects of perception- vs. production-based pronunciation instruction. *System* 88. https://doi.org/10.1016/j.system.2019.102185
- Iverson & Evans (2009). Learning English vowels with different first-language vowel systems II. *JASA* 126(2). https://pubs.aip.org/asa/jasa/article/126/2/866/903925
- Iverson, Pinet & Evans (2012). Auditory training for experienced and inexperienced second-language learners. *Applied Psycholinguistics* 33(1). https://eric.ed.gov/?id=EJ969153
- Melnik & Peperkamp (2021). HVPT enhances second language lexical processing. *Bilingualism: Language and Cognition*. https://www.cambridge.org/core/journals/bilingualism-language-and-cognition/article/abs/highvariability-phonetic-training-enhances-second-language-lexical-processing-evidence-from-online-training-of-french-learners-of-english/029EC735C52FC7BC65CB61C21160446B
- High variability phonetic training in adaptive adverse conditions (2018). *PLOS ONE* 13(10): e0204888. https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0204888
- Bradlow, Pisoni, Akahane-Yamada & Tohkura (1997). Training Japanese listeners to identify English /r/ and /l/ IV. *JASA* 101(4). https://doi.org/10.1121/1.418276
- Bradlow, Akahane-Yamada, Pisoni & Tohkura (1999). Long-term retention of learning in perception and production. *Perception & Psychophysics* 61(5). https://pubmed.ncbi.nlm.nih.gov/10499009/
- Thomson (2011). Computer assisted pronunciation training: Targeting second language vowel perception improves pronunciation. *CALICO Journal* 28(3). https://eric.ed.gov/?id=EJ956341
- Lengeris (2018). Computer-based auditory training improves second-language vowel production in spontaneous speech. *JASA* 144(3). https://pubs.aip.org/asa/jasa/article/144/3/EL165/830693/Computer-based-auditory-training-improves-second
- Inceoglu (2016). Effects of perceptual training on second language vowel perception and production. *Applied Psycholinguistics* 37(5) (not re-checked). https://www.researchgate.net/publication/285386108_Effects_of_perceptual_training_on_second_language_vowel_perception_and_production
- Becker (2024). Teaching and researching French nasal vowels. https://pdfs.semanticscholar.org/5de2/ed078e637c89907cb92fd764cce376f3d5ca.pdf
- Hirata & Kelly (2010). Effects of lips and hands on auditory learning of second-language speech sounds. *JSLHR* 53(2). https://doi.org/10.1044/1092-4388(2009/08-0243)
- Saito & Chen (2025). Optimizing L2 phonetic learning: Spaced vs massed training schedule. *SSLA*. https://www.cambridge.org/core/journals/studies-in-second-language-acquisition/article/optimizing-l2-phonetic-learning/1DF617B31C08FE04252E293B83481493
- Li (2025/26). Lag effects in L2 phonetic training. *Modern Language Journal*. https://onlinelibrary.wiley.com/doi/10.1111/modl.70081

### Production practice, feedback and motor learning
- Saito & Lyster (2012). Effects of form-focused instruction and corrective feedback on L2 pronunciation development of /ɹ/. *Language Learning* 62(2). https://doi.org/10.1111/j.1467-9922.2011.00639.x
- Saito (2013). Reexamining effects of form-focused instruction: The role of explicit phonetic information. *SSLA* 35(1). https://doi.org/10.1017/S0272263112000666
- Saito (2015). Communicative focus on L2 phonetic form. *Applied Psycholinguistics* (structured extraction). https://github.com/vassiliphilippov/erct-papers/blob/main/_papers/317-saito-communicative-focus-second-language-phonetic.md
- Kissling (2013). Teaching pronunciation: Is explicit phonetics instruction beneficial for FL learners? *Modern Language Journal* 97(3) (flagged; DOI not re-checked). https://doi.org/10.1111/j.1540-4781.2013.12029.x
- Lyster & Saito (2010). Oral feedback in classroom SLA: A meta-analysis. *SSLA* 32(2). https://doi.org/10.1017/S0272263109990520
- Neri, Cucchiarini & Strik (2002). Feedback in computer assisted pronunciation training: Technology push or demand pull? ICSLP 2002. https://doi.org/10.21437/ICSLP.2002-246
- Levis (2007). Computer technology in teaching and researching pronunciation. *Annual Review of Applied Linguistics* 27. https://doi.org/10.1017/S0267190508070098
- Dlaska & Krekeler (2013). The short-term effects of individual corrective feedback on L2 pronunciation. *System* 41(1). https://doi.org/10.1016/j.system.2013.01.005
- Trofimovich, Isaacs, Kennedy, Saito & Crowther (2016). Flawed self-assessment. *Bilingualism: Language and Cognition* 19(1). https://doi.org/10.1017/S1366728914000832
- Hincks & Edlund (2009). Promoting increased pitch variation in oral presentations with transient visual feedback. *LLT* 13(3). https://github.com/timo-b-roettger/ErrorsLing/blob/c8958ca65f08bd2dadd963bdf9a09d6787b88c81/data/subsample/2009-09-LLT-13_03_hincksedlund.txt (original: http://llt.msu.edu/vol13num3/hincksedlund.pdf)
- Hardison (2004). Generalization of computer-assisted prosody training. *LLT* 8(1) (not opened). http://llt.msu.edu/vol8num1/hardison/default.html
- Kartushina, Hervais-Adelman, Frauenfelder & Golestani (2015). Phonetic production training with visual feedback. *JASA* 138(2). https://doi.org/10.1121/1.4926561
- Olson (2014). Benefits of visual feedback on segmental production in the L2 classroom. *LLT* 18(3). http://llt.msu.edu/issues/october2014/olson.pdf
- Mroz (2018). Seeing how people hear you: French learners experiencing intelligibility through ASR. *Foreign Language Annals* 51(3). https://doi.org/10.1111/flan.12348
- McCrocklin & Edalatishams (2020). Revisiting popular speech recognition software for ESL speech. *TESOL Quarterly* 54(4). https://doi.org/10.1002/tesq.3006
- Hirschi, Kang, Yang, Hansen & Beloin (2025). AI-generated feedback for second language intelligibility. *Language Learning* 75(S1). https://onlinelibrary.wiley.com/doi/full/10.1111/lang.12719
- Soderstrom & Bjork (2015). Learning versus performance: An integrative review. *Perspectives on Psychological Science* 10(2). https://doi.org/10.1177/1745691615569000
- Maas et al. (2008). Principles of motor learning in treatment of motor speech disorders. *AJSLP* 17(3). https://doi.org/10.1044/1058-0360(2008/025)
- McKay et al. (2022). Meta-analysis of the reduced relative feedback frequency effect. *Psychology of Sport and Exercise* 61. https://doi.org/10.1016/j.psychsport.2022.102165
- McKay et al. (2024). Reporting bias, not external focus. *Psychological Bulletin* 150(11). https://doi.org/10.1037/bul0000451
- Swinnen, Schmidt, Nicholson & Shapiro (1990). Instantaneous knowledge of results degrades learning. *JEP: LMC* 16(4). https://doi.org/10.1037/0278-7393.16.4.706
- Guadagnoli & Kohl (2001). Knowledge of results for motor learning: Relationship between error estimation and knowledge of results frequency. *Journal of Motor Behavior* 33(2) (not opened). https://doi.org/10.1080/00222890109601915
- Barros, Yantha, Carter, Hussien & Ste-Marie (2019). Examining the impact of error estimation on the effects of self-controlled feedback. *Human Movement Science*. https://doi.org/10.1016/j.humov.2018.12.002
- Tremblay, Houle & Ostry (2008). Specificity of speech motor learning. *Journal of Neuroscience* 28(10). https://doi.org/10.1523/JNEUROSCI.4196-07.2008
- Houde & Jordan (1998). Sensorimotor adaptation in speech production. *Science* 279. https://doi.org/10.1126/science.279.5354.1213
- Sugden, Lloyd, Lam & Cleland (2019). Ultrasound visual biofeedback for speech sound disorders. *IJLCD* 54(5). https://doi.org/10.1111/1460-6984.12478
- Lee & Gibbon (2015). Non-speech oral motor treatment for children with developmental speech sound disorders. *Cochrane* CD009383. https://doi.org/10.1002/14651858.CD009383.pub2
- McCauley, Strand, Lof, Schooling & Frymark (2009). Effects of nonspeech oral motor exercises on speech. *AJSLP* 18(4). https://doi.org/10.1044/1058-0360(2009/09-0006)
- Wilshire (1999). The "tongue twister" paradigm. *Language and Speech* 42(1). https://journals.sagepub.com/doi/abs/10.1177/00238309990420010301
- Yang, Luo, Vadillo, Yu & Shanks (2021). Testing (quizzing) boosts classroom learning. *Psychological Bulletin* 147(4). https://doi.org/10.1037/bul0000309
- Bu, Nagano, Harel & McAllister (2021). Effects of practice variability on second-language speech production training. *Folia Phoniatrica et Logopaedica*. https://doi.org/10.1159/000510621
- McCabe, Preston, Evans & Heard (2023). Pilot RCT of motor-based treatments for childhood apraxia of speech. *AJSLP* 32(2). https://pmc.ncbi.nlm.nih.gov/articles/PMC10171856/

### Prosody
- Dupoux, Pallier, Sebastián-Gallés & Mehler (1997). A destressing "deafness" in French? *JML* 36(3). https://doi.org/10.1006/jmla.1996.2500
- Dupoux, Sebastián-Gallés, Navarrete & Peperkamp (2008). Persistent stress "deafness". *Cognition* 106. http://www.sciencedirect.com/science/article/pii/S0010027707001102
- Schwab & Llisterri (2011). Are French speakers able to learn to perceive lexical stress contrasts? *ICPhS XVII*. http://liceu.uab.cat/~joaquim/publicacions/Schwab_Llisterri_Learning_Lexical_Stress_11.pdf
- Michelas & Dufour (2020). Comment l'oreille de présentation affecte-t-elle la capacité des francophones à discriminer des contrastes accentuels natifs et non-natifs ? JEP 2020. https://aclanthology.org/2020.jeptalnrecital-jep.52/
- Walton (2023). Does social identity play a role in the L2 acquisition of French intonation? Language Science Press. https://doi.org/10.5281/zenodo.7525112
- Tremblay, Broersma & Coughlin (2018). The functional weight of a prosodic cue in the native language. *Bilingualism: Language and Cognition* 21(3). https://doi.org/10.1017/S136672891700030X
- Albar (2020). Production de la continuation du français par des apprenants japonophones. JEP 2020. https://aclanthology.org/2020.jeptalnrecital-jep.2/
- Arvaniti (2012). The usefulness of metrics in the quantification of speech rhythm. *Journal of Phonetics* 40(3). https://doi.org/10.1016/j.wocn.2012.02.003
- Baills & Prieto (2023). Embodying rhythmic properties of a foreign language through hand-clapping helps children to better pronounce words. *Language Teaching Research*. https://doi.org/10.1177/1362168820986716
- Baills, Alazard-Guiu & Prieto (2022). Embodied prosodic training. *Applied Linguistics* 43(4). https://doi.org/10.1093/applin/amac010
- Zhang, Baills & Prieto (2020). Hand-clapping with Chinese adolescents learning French words. *Language Teaching Research* 24(5). https://doi.org/10.1177/1362168818806531
- Guyot-Talbot, Heidlmayr & Ferragne (2016). Entraînements à la prosodie des questions. JEP 2016. https://aclanthology.org/2016.jeptalnrecital-jep.30/
- Xiao et al. (2024). Enseignement de l'intonation du français par une synthèse vocale contrôlée par le geste. JEP 2024. https://aclanthology.org/2024.jeptalnrecital-jep.35/
- Lee & Fraundorf (2022). L1–L2 differences in discourse processing. *SSLA* 44. https://doi.org/10.1017/S0272263121000619
- Korzekwa et al. (2021). Detection of lexical stress errors in non-native English. https://arxiv.org/abs/2012.14788
- De Paolis (2024). Allongement vocalique en italien L2 et en français L2. JEP 2024. https://aclanthology.org/2024.jeptalnrecital-jep.25/
- Doctoral thesis 2015PA100186 (IPFC liaison study, Italian-L1 learners). https://theses.fr/2015PA100186
- Liakin, Cardoso & Liakina (2017). The pedagogical use of mobile speech synthesis (TTS): Focus on French liaison. *Computer Assisted Language Learning* 30(3–4) (not opened). https://scholar.google.com/scholar?q=%22mobile+speech+synthesis%22+%22French+liaison%22

### Fluency and speaking rate
- Bosker, Pinget, Quené, Sanders & de Jong (2013). What makes speech sound fluent? *Language Testing* 30(2). https://doi.org/10.1177/0265532212455394
- Pinget, Bosker, Quené & de Jong (2014). Native speakers' perceptions of fluency and accent in L2 speech. *Language Testing* 31(3). https://doi.org/10.1177/0265532214526177
- Suzuki, Kormos & Uchihara (2021). Utterance and perceived fluency: A meta-analysis. *Modern Language Journal* 105(2). https://doi.org/10.1111/modl.12706
- Suzuki & Kormos (2023). The multidimensionality of second language oral fluency. *SSLA* 45. https://doi.org/10.1017/S0272263121000899
- Kahng (2020). Explaining second language utterance fluency. *Applied Psycholinguistics* 41. https://doi.org/10.1017/S0142716420000065
- De Jong, Groenhout, Schoonen & Hulstijn (2015). Second language fluency: Speaking style or proficiency? *Applied Psycholinguistics* 36. https://doi.org/10.1017/S0142716413000210
- Munro & Derwing (1998). The effects of speaking rate on listener evaluations. *Language Learning* 48(2). https://doi.org/10.1111/1467-9922.00038
- Munro & Derwing (2001). The role of speaking rate. *SSLA* 23(4) (not opened). https://doi.org/10.1017/S0272263101004016
- De Jong & Mora (2019). Does having good articulatory skills lead to more fluent speech in first and second languages? *SSLA* 41(1) (not opened). https://scholar.google.com/scholar?q=%22Does+having+good+articulatory+skills+lead+to+more+fluent+speech%22
- de Jong & Perfetti (2011). Fluency training in the ESL classroom. *Language Learning* 61(2). https://doi.org/10.1111/j.1467-9922.2010.00620.x
- Lambert, Kormos & Minn (2017). Task repetition and second language speech processing. *SSLA*. https://doi.org/10.1017/S0272263116000085
- Suzuki (2021). Blocked vs interleaved task repetition. *Language Learning* 71(2). https://doi.org/10.1111/lang.12433
- Suzuki & Hanzawa (2022). Massed task repetition is a double-edged sword for fluency development. *SSLA*. https://doi.org/10.1017/S0272263121000358
- Tran & Saito (2021). Effects of the 4/3/2 activity revisited. *Language Teaching Research*. http://kazuyasaito.net/LTR2021.pdf
- Abdi Tabari, Zhuang & Farahanynia (2025). Task repetition and L2 oral performance: A meta-analysis. *System* 135. https://doi.org/10.1016/j.system.2025.103868
- Liu & Tang (2025). Written task repetition meta-analysis. *Language Teaching Research* (figures via secondary verification; not opened). https://github.com/mikhailvs/loqui/blob/main/EVIDENCE.md
- Whitworth & Rose (2025). A systematic review of research on shadowing. *Research Synthesis in Applied Linguistics* 1(2). https://doi.org/10.1080/29984475.2025.2546827 (verification: https://raw.githubusercontent.com/danieljchandler/arabic-buddy/main/docs/plateau-research-2026-09.md)
- Foote & McDonough (2017). Using shadowing with mobile technology. *JSLP* 3(1). https://doi.org/10.1075/jslp.3.1.02foo
- Fu, Adda-Decker & Kühnert (2024). Effets du shadowing et de l'imitation /ɥi/. JEP 2024. https://aclanthology.org/2024.jeptalnrecital-jep.34/
- Tavakoli & Uchihara (2020). Multiword sequences and oral fluency. *Language Learning* 70(2). https://doi.org/10.1111/lang.12384
- Sato & Lyster (2012). Peer interaction and corrective feedback for accuracy and fluency development. *SSLA*. https://doi.org/10.1017/S0272263112000356
- Van Os et al. (2020). Turn-taking behavior shapes perceived fluency. *Language Learning* 70(4). https://doi.org/10.1111/lang.12416
- Freed, Segalowitz & Dewey (2004). Context of learning and second language fluency in French. *SSLA*. https://doi.org/10.1017/S0272263104262064
- Bibauw, Escouflaire, François & Desmet (2021). Automatizing L2 fluency measurement. AILA 2021. https://github.com/sbibauw/sbibauw.github.io/blob/main/_talks/2021/aila.md
- Yan, Maeda, Lv & Ginther (2016). Elicited imitation as a measure of L2 proficiency. *Language Testing*. https://doi.org/10.1177/0265532215594643
- Kostromitina & Plonsky (2022). Elicited imitation tasks: A meta-analysis. *SSLA* 44(3). https://doi.org/10.1017/S0272263121000395
- Mancuso & Miltenberger (2016). Using habit reversal to decrease filled pauses. *JABA* 49(1). https://doi.org/10.1002/jaba.267
- Corley, MacGregor & Donaldson (2007). Hesitations in speech affect language comprehension. *Cognition* 105(3). https://doi.org/10.1016/j.cognition.2006.10.010
- Fox Tree (2001). Listeners' uses of um and uh in speech comprehension. *Memory & Cognition* 29(2) (not opened). https://scholar.google.com/scholar?q=%22Listeners%27+uses+of+um+and+uh+in+speech+comprehension%22

### Native-speaker clarity
- Lam & Tjaden (2013). Intelligibility of clear speech: Effect of instruction. *JSLHR* 56(5). https://doi.org/10.1044/1092-4388(2013/12-0335)
- Ferguson & Kewley-Port (2007). Talker differences in clear and conversational speech. *JSLHR* 50. https://pubmed.ncbi.nlm.nih.gov/17905909/
- Krause & Braida (2002). Effects of speaking rate and speaking mode on intelligibility. *JASA* 112(5). https://doi.org/10.1121/1.1509432
- Smiljanić & Bradlow (2011). Clear speech benefit for native and high-proficiency non-native talkers. *JASA* 130(6). https://doi.org/10.1121/1.3652882
- Rogers, DeMasi & Krause (2010). Conversational and clear speech intelligibility by native and non-native speakers. *JASA* 128(1). https://doi.org/10.1121/1.3436523
- Buz, Tanenhaus & Jaeger (2016). Dynamically adapted context-specific hyper-articulation. *JML* 89. https://doi.org/10.1016/j.jml.2015.12.009
- Seyfarth, Buz & Jaeger (2016). Dynamic hyperarticulation of coda voicing contrasts. *JASA* 139(2). https://doi.org/10.1121/1.4942544
- Garnier, Ménard & Alexandre (2018). Hyper-articulation in Lombard speech. *JASA* 144(2). https://pubmed.ncbi.nlm.nih.gov/30180713/
- Lee & Baese-Berk (2020). The maintenance of clear speech in naturalistic conversations. *JASA* 147(5). https://doi.org/10.1121/10.0001315
- Caissie et al. (2005). Clear speech for adults with a hearing loss. *J Am Acad Audiol* 16(3). https://pubmed.ncbi.nlm.nih.gov/15844741/
- Tuttösí, Lim, Yeung, Wang & Aucouturier (2026). Covertly improving intelligibility with data-driven adaptations of speech timing (preprint). https://arxiv.org/abs/2603.30032
- Bourbon, D'Alessandro & Fougeron (2020). Débit et réduction vocalique. JEP 2020. https://aclanthology.org/2020.jeptalnrecital-jep.6/
- Ruotsalainen et al. Interventions for preventing voice disorders in adults. *Cochrane* CD006372 (searches to March 2010). https://doi.org/10.1002/14651858.CD006372.pub2
- Ghio et al. (2020). Evaluation de l'intelligibilité. JEP 2020. https://aclanthology.org/2020.jeptalnrecital-jep.31/
- Rebourg et al. (2020). Évaluer l'intelligibilité, mots ou pseudo-mots ? JEP 2020. https://aclanthology.org/2020.jeptalnrecital-jep.61/
- Rebourg et al. (2024). Pertinence des pseudo-mots. JEP 2024. https://aclanthology.org/2024.jeptalnrecital-jep.14/
- Shriberg, Wade & Price (1992). Human-machine problem solving using spoken language systems. https://aclanthology.org/H92-1009/
- Zhang et al. (2025). WSCoach: Wearable real-time auditory feedback for reducing unwanted words. https://arxiv.org/abs/2507.04238

### Practice schedule, learning science, motivation and adherence
- Kim & Webb (2022). The effects of spaced practice on second language learning: A meta-analysis. *Language Learning* 72. https://doi.org/10.1111/lang.12479
- Cepeda, Pashler, Vul, Wixted & Rohrer (2006). Distributed practice in verbal recall tasks. *Psychological Bulletin* 132(3). https://doi.org/10.1037/0033-2909.132.3.354
- Latimier, Peyre & Ramus (2021). Spacing out retrieval practice episodes. *Educational Psychology Review* 33(3). https://doi.org/10.1007/s10648-020-09572-8
- Suzuki (2017). The optimal distribution of practice for the acquisition of L2 morphology. *Language Learning* 67(3). https://doi.org/10.1111/lang.12236
- Kakitani & Kormos (2024). Distributed practice and L2 fluency development. *SSLA* 46. https://doi.org/10.1017/S0272263124000251
- Li & DeKeyser (2019). Distribution of practice effects in L2 Mandarin tonal word production (not checked). *Modern Language Journal* 103(3). https://doi.org/10.1111/modl.12580
- Fuhrmeister & Myers (2020). Desirable and undesirable difficulties in nonnative phonetic learning. *Attention, Perception & Psychophysics* 82(4). https://github.com/pamfuhrmeister/pamfuhrmeister.github.io/blob/master/Fuhrmeister_Myers_2020.pdf
- Brunmair & Richter (2019). Similarity matters: A meta-analysis of interleaved learning. *Psychological Bulletin* 145(11). https://doi.org/10.1037/bul0000209
- Abel & de Bruin (2024). Why do learners (under)utilize interleaving? *Educational Psychology Review*. https://doi.org/10.1007/s10648-024-09902-0
- Macnamara, Hambrick & Oswald (2014; corrigendum 2018). Deliberate practice and performance (verification dossier). https://github.com/ROI-DANINO/BlackJack/blob/main/docs/superpowers/research/foundation-audit-p1/verification/V3c-deliberate-practice-remediated.md
- León, Panadero & García-Martínez (2023). How accurate are our students? Self-assessment accuracy meta-analysis. *Educational Psychology Review* 35. https://doi.org/10.1007/s10648-023-09819-0
- Spaced retrieval practice: Can restudying trump retrieval? (Scopus abstract; authors not captured). https://github.com/marcoweb/annif-experiments/blob/7b039e495c4618daae2c8600f3950084c15dfabe/education-en/raw-files/corpus-training/Corpus_entrenamiento_Education_6000_documentos/D3124.txt
- Gollwitzer & Sheeran (2006). Implementation intentions and goal achievement. *Advances in Experimental Social Psychology* 38. https://doi.org/10.1016/S0065-2601(06)38002-1
- Sheeran, Listrom & Gollwitzer (2025). The when and how of planning: 642 tests. *European Review of Social Psychology* 36(1). https://doi.org/10.1080/10463283.2024.2334563
- Lally, van Jaarsveld, Potts & Wardle (2010). How are habits formed. *European Journal of Social Psychology* 40(6). https://doi.org/10.1002/ejsp.674
- Hwang, Coss, Loewen & Tagarelli (2024). Engagement patterns of MALL among adult L2 learners: A survival analysis. *SSLA* 46(4). https://www.cambridge.org/core/journals/studies-in-second-language-acquisition/article/C1186B329F808A11DDF2C748E77FD1EE
- Sudina, Teimouri & Plonsky (2025). L2 grit and age as predictors of attrition in MALL. *Learning and Individual Differences*. https://doi.org/10.1016/j.lindif.2025.102704
- Is learning really just believing? Self-efficacy and L2 achievement meta-analysis (2022). *SSLLT* 12(2). https://doi.org/10.14746/ssllt.2022.12.2.4
- Unique effects and moderators of effects of sources on self-efficacy: A model-based meta-analysis. *Journal of Counseling Psychology*. https://doi.org/10.1037/cou0000219
- A multilevel meta-analysis of language mindsets and language learning outcomes in SLA research (Scopus abstract). https://github.com/marcoweb/annif-experiments/blob/7b039e495c4618daae2c8600f3950084c15dfabe/education-en/raw-files/corpus-training/Corpus_entrenamiento_Education_6000_documentos/D3174.txt
- Sailer & Homner (2020). The gamification of learning: A meta-analysis. *Educational Psychology Review* 32. https://doi.org/10.1007/s10648-019-09498-w
- Bai, Hew & Huang (2020). Does gamification improve student learning outcome? *Educational Research Review* 30. https://doi.org/10.1016/j.edurev.2020.100322

### Conversation practice and transfer
- Bibauw, Van den Noortgate, François & Desmet (2022). Dialogue systems for language learning: A meta-analysis. *LLT* 26(1) (author preprint). https://github.com/sbibauw/sbibauw.github.io/blob/main/assets/pdf/Bibauw_et_al_2022_Meta-analysis_pre.pdf
- Wang, Bibauw, Noreillie & Desmet (2026). Hype or hope? A meta-analysis of conversational chatbots on L2 learning (EUROCALL abstract). https://github.com/sbibauw/sbibauw.github.io/blob/main/_talks/2026/09-eurocall-wang.md
- Bibauw (2022). Learning with conversational AI (PhD thesis). https://github.com/sbibauw/sbibauw.github.io/blob/main/assets/pdf/Bibauw_Thesis_2022.pdf
- Abdelrady et al. (2026). Speaking with AI: Microsoft 365 Copilot voice chat and EFL fluency (structured extraction). https://github.com/vassiliphilippov/erct-papers/blob/main/_papers/297-abdelrady-speaking-ai-impact-microsoft-365.md
- Dai & Wu (2025). An AI-powered conversational system for college students learning English (structured extraction). https://github.com/vassiliphilippov/erct-papers/blob/main/_papers/287-dai-aipowered-conversational-system-college-students.md
- Kamelabad, Turano, Lundin & Skantze (2026). Immediate vs delayed corrective feedback with an LLM chatbot (structured extraction). https://github.com/vassiliphilippov/erct-papers/blob/main/_papers/247-kamelabad-personalized-language-learning-llm-chatbot.md
- Abdelrady et al. (2026). Harnessing AI for pronunciation development: ELSA Speak (structured extraction). https://github.com/vassiliphilippov/erct-papers/blob/main/_papers/241-abdelrady-harnessing-ai-pronunciation-development-investigating.md
- Sun (2023). ASR technology and L2 pronunciation and speaking skills (structured extraction). https://github.com/vassiliphilippov/erct-papers/blob/main/_papers/244-sun-impact-automatic-speech-recognition-technology.md
- Liakin, Cardoso & Liakina (2017). Learners' perceptions of two speech technologies. *Languages* 2(3). https://www.mdpi.com/2226-471X/2/3/11

### French-specific evidence
- De Fino, Ferrané, Pinquier & Fontan (2024). Peut-on évaluer la compréhensibilité de la parole sans référence ? JEP 2024. https://aclanthology.org/2024.jeptalnrecital-jep.50/
- Coulange & Rossato (2020). Rhythmic proximity between natives and learners of French. LREC 2020. https://aclanthology.org/2020.lrec-1.304/
- Racine, Detey & Kawaguchi (2012). Les voyelles /y-u/ dans IPFC. JEP-TALN 2012. https://aclanthology.org/F12-1049/
- Cęcelewski, Gendrot, Adda-Decker & Boula de Mareüil (2024). Fusion des /a/ ~ /ɑ/ en français depuis 1925. JEP 2024. https://aclanthology.org/2024.jeptalnrecital-jep.8/
- Krzonowski, Ferragne & Pellegrino (2016). Perception et production de voyelles de l'anglais par des apprenants francophones. JEP 2016. https://aclanthology.org/2016.jeptalnrecital-jep.55/
- Lancien, Côté & Bigi (2020). Developing resources for automated speech processing of Quebec French. LREC 2020. https://aclanthology.org/2020.lrec-1.655/
- Pellegrini, Fontan & Sahraoui (2016). CNN-based pronunciation assessment of Japanese speakers learning French. JEP 2016. https://aclanthology.org/2016.jeptalnrecital-jep.70/
- Contrain, Pinquier, Fontan & Ferrané (2024). Erreurs de prononciation en L2. JEP 2024. https://aclanthology.org/2024.jeptalnrecital-jep.37/
- Liakin, Cardoso & Liakina (2015). Learning L2 pronunciation with a mobile speech recognizer: French /y/. *CALICO Journal* 32(1) (not opened). https://scholar.google.com/scholar?q=%22Learning+L2+pronunciation+with+a+mobile+speech+recognizer%22
- Kocjančič Antolík, Pillot-Loiseau & Kamiyama (2019). The effectiveness of real-time ultrasound visual feedback on tongue movements in L2 pronunciation training. *JSLP* 5(1) (not opened). https://scholar.google.com/scholar?q=%22real-time+ultrasound+visual+feedback%22+%22L2+pronunciation+training%22

### Technology and measurement
- Microsoft. Use pronunciation assessment (docs source). https://github.com/MicrosoftDocs/azure-ai-docs/blob/main/articles/ai-services/speech-service/how-to-pronunciation-assessment.md
- Microsoft. Characteristics and limitations of Pronunciation Assessment. https://github.com/MicrosoftDocs/azure-ai-docs/blob/main/articles/foundry/responsible-ai/speech-service/pronunciation-assessment/characteristics-and-limitations-pronunciation-assessment.md
- Microsoft. Speech-to-text release notes. https://github.com/MicrosoftDocs/azure-ai-docs/blob/main/articles/ai-services/speech-service/includes/release-notes/release-notes-stt.md
- Microsoft. Pronunciation assessment tool. https://github.com/MicrosoftDocs/azure-ai-docs/blob/main/articles/ai-services/speech-service/pronunciation-assessment-tool.md
- Microsoft. Language support: pronunciation assessment. https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=pronunciation-assessment
- Azure Speech SDK issue #1530 (valid pronunciations flagged). https://github.com/Azure-Samples/cognitive-services-speech-sdk/issues/1530
- Gong et al. (2022). GOPT, ICASSP 2022. https://github.com/YuanGongND/gopt
- Zhang et al. (2021). speechocean762 corpus. https://github.com/jimbozhang/speechocean762
- Chao & Chen (2025). HMamba. NAACL 2025. https://aclanthology.org/2025.naacl-long.98/
- Parikh, Tejedor-Garcia, Cucchiarini & Strik (2025). Logit-based GOP scores. Interspeech 2025. https://arxiv.org/abs/2506.12067
- Chen, Yu & Hirschberg (2024). MultiPA: open-response pronunciation assessment. https://github.com/yuwchen/MultiPA
- Yan et al. (2025). HiPPO: pronunciation assessment for unscripted speech. https://aclanthology.org/2025.ijcnlp-long.45/
- Tadimeti, Georgila & Traum (2022). Off-the-shelf speech recognizers on different accents. LREC 2022. https://aclanthology.org/2022.lrec-1.645/
- OpenAI Whisper model card. https://github.com/openai/whisper/blob/main/model-card.md
- Park (2026). Intent vs. surface: Recovering acoustic realization from modern ASR. BEA 2026. https://aclanthology.org/2026.bea-1.23/
- Inceoglu, Chen & Lim (2023). Comparing L1 listeners and ASR. *ReCALL*. https://www.cambridge.org/core/journals/recall/article/abs/assessment-of-l2-intelligibility-comparing-l1-listeners-and-automatic-speech-recognition/7E499AD990383AC65A9688BB5BE17887
- Derwing, Munro & Carbonaro (2000). Does popular speech recognition software work with ESL speech? *TESOL Quarterly* 34(3) (DOI from memory, flagged). https://doi.org/10.2307/3587748
- Automated assessment of second language comprehensibility (2022). *SSLA*. https://www.cambridge.org/core/journals/studies-in-second-language-acquisition/article/automated-assessment-of-second-language-comprehensibility-review-training-validation-and-generalization-studies/ED850D916818C7ABA23EA1CA8CF8A590
- Zhang, Jepson, Lohfink & Arvaniti (2021). Comparing acoustic analyses of speech data collected remotely. *JASA* 149(6). https://doi.org/10.1121/10.0005132
- MFA French acoustic model v3.0.0. https://github.com/MontrealCorpusTools/mfa-models/blob/main/acoustic/french/mfa/v3.0.0/README.md
- MFA English acoustic model v3.0.0. https://github.com/MontrealCorpusTools/mfa-models/blob/main/acoustic/english/mfa/v3.0.0/README.md
- Jadoul, Thompson & de Boer (2018). Introducing Parselmouth. *Journal of Phonetics* 71. https://doi.org/10.1016/j.wocn.2018.07.001
- fairseq wav2vec 2.0 (XLSR-53 phoneme recognition). https://github.com/facebookresearch/fairseq/blob/main/examples/wav2vec/README.md
- Kaldi GOP recipe for speechocean762. https://github.com/kaldi-asr/kaldi/tree/master/egs/gop_speechocean762
- Liu, Cui, Gu & Wang (2026). Large audio-language models for interactive language learning. Findings of EACL 2026. https://aclanthology.org/2026.findings-eacl.190/
- Manakul et al. (2026). AudioJudge. EACL 2026. https://aclanthology.org/2026.eacl-long.168/
- Ahn & Nam (2025). LoRA fine-tuned speech multimodal LLM for pronunciation evaluation. https://arxiv.org/abs/2509.02915
- SpeechSuper API samples. https://github.com/speechsuper/SpeechSuper-API-Samples
- Issa & Ali (2026). Assessment of L2 speech global dimensions using large audio language models. BEA 2026. https://aclanthology.org/2026.bea-1.49/
- McAllister, Preston, Hitchcock & Hill (2020). C-RESULTS RCT protocol. *BMC Pediatrics* 20:66. https://pmc.ncbi.nlm.nih.gov/articles/PMC7014674/
- Yoho, Borrie, Barrett & Whittaker (2019). Sex effects for speech intelligibility (transcription vs ratings). *Attention, Perception & Psychophysics* 81(2). https://pmc.ncbi.nlm.nih.gov/articles/PMC6333506/
- Flege & Fletcher (1992). Talker and listener effects on degree of perceived foreign accent. *JASA* 91(1). https://doi.org/10.1121/1.402780
- Gao (2019). Weighing phonetic patterns in non-native English speech (dissertation, chapter 5). https://github.com/gaozhiyan/Dissertation_Files/blob/master/zhiyan_diss_latex/chapters/chp5.tex
- Kang & Rubin (2009). Reverse linguistic stereotyping. *Journal of Language and Social Psychology* 28(4). https://doi.org/10.1177/0261927X09341950
- Pustejovsky et al. SingleCaseES: effect size definitions. https://github.com/cran/SingleCaseES/blob/master/vignettes/Effect-size-definitions.Rmd
- Kratochwill et al. (2013). Single-case intervention research design standards. *Remedial and Special Education* 34(1) (not opened). https://doi.org/10.1177/0741932512452794
- Saito & Tierney (2024). Domain-general auditory processing: a test-retest reliability study. *SSLA* 46(4). https://doi.org/10.1017/S027226312200047X