# Learner-profile addendum: one French-speaking adult training English and native French on a phone

**Who this is for.** This addendum applies the evidence brief to one learner:
- One adult whose first language is French.
- **Main goal:** English as a second language. The aim is to be easily understood, not to sound native.
- **Second goal:** clearer diction in native French. This is not accent work.
- **Practice setting:** mostly on a phone, in sessions of about 5–15 minutes.

**How to read the strength labels.** Each claim has a label in brackets.
- **[Strong]:** many studies agree, or official technical documentation states it.
- **[Moderate]:** several studies agree, but the samples are small, or the studies show links but not causes.
- **[Weak]:** one small study, a study with no comparison group, or indirect evidence.
- **[Mixed]:** the studies disagree.
- **[Unverified]:** the reviewers found the source but could not check it. Some of these are leads they flagged but did not read.
- **[None found]:** the reviewers searched and found no evidence either way.
- **[Not searched]:** the reviewers ran out of search time before they could look.

**Method caveat.** The reviewers could not open most full papers. Most numbers come from abstracts, index summaries or secondary summaries. This addendum marks some of these "secondary". Treat all figures as approximate until someone checks the original papers.

**Key terms.**
- *Comprehensibility:* how easy a listener finds it to understand you. Listeners rate it on a scale.
- *Intelligibility:* how many of your words a listener actually gets right, for example when writing down what you said.
- *Accentedness:* how different you sound from a native speaker. You can have a strong accent and still be easy to understand.
- *Prosody:* the timing, loudness and pitch patterns of speech. It covers stress, rhythm and intonation.
- *Word stress:* making one syllable of a word stronger than the others, as in PHOto and phoTOgraphy.
- *Schwa:* the short, weak "uh" vowel /ə/ that English uses in many unstressed syllables.
- *Weak forms:* the short, reduced way English says small words in running speech, such as "tuh" for "to".
- *Phoneme:* one of the sounds that tells words apart in a language, such as /p/ and /b/ in "pat" and "bat".
- *Pitch (F0):* how high or low the voice is. F0 is the technical name.
- *Formants:* resonances of the mouth that make one vowel sound different from another. Software measures them to judge vowel quality.
- *Carrier phrase:* a fixed sentence frame with a slot for the test word, so every word is said in the same setting.
- *HVPT (high-variability phonetic training):* listening practice where you identify sounds spoken by many different voices. You get right/wrong feedback after each answer.
- *ASR (automatic speech recognition):* software that turns speech into text.

---

## 1. Summary

- **English priorities.** The reviewers rank the targets for a French speaker in this order: word stress (including reduced unstressed vowels), English vowel pairs that French lacks, /h/, and fluency in free speech. **[Moderate]** Word stress is a strong candidate for first place, but no study shows it matters most. Most of this evidence shows links, not causes. Much of it comes from one Montreal research group.
- **Methods that worked for French speakers.** Listening practice with many voices (HVPT) improved English vowels and /h/. **[Moderate]** Short listening training improved stress identification, but only on Spanish words and with no untrained group. **[Weak]** In that study, training without rule explanations worked as well as training with them. **[Weak]** Listening training carries over to speaking only partly. So the app pairs it with speaking practice and specific feedback. This pairing is a design choice that no reviewed study tested.
- **Native French.** The target should be "clear speech": a speaking style that most adult native speakers can switch into when asked. Train it at a natural speed. Record the same material twice, first in your usual style and then clearly, and compare the two. Give concrete cues, and score each user against their own baseline. **[Strong that clear speech helps listeners with hearing loss or in noise, mostly in English; Moderate for the paired-recording method; Weak for training at natural speed; None found for lasting gains]** The reviewed studies did not test whether clearer native speech helps everyday listeners in a quiet room. **[Not searched]**
- **Phone sessions.** Short phone practice can work when it runs for 6–8 weeks or more, at about 10 minutes a session, at least 4 times a week. Spread practice across days. The spacing evidence comes mostly from vocabulary and grammar learning. Use a weekly goal, not a daily streak that breaks. **[Weak to Moderate]**
- **Technical limits shape the design.** Azure's prosody and syllable outputs are US English only. **[Strong]** The reviewers found no word-stress error type in Azure. **[Unverified]** Phones allow the microphone only on secure (HTTPS) pages. **[Strong]** Azure accepts only 16 kHz WAV or OGG/Opus audio. Neither phone's default recording format fits. **[Strong]** The app should capture uncompressed audio, because compression distorts the app's own sound measures. **[Moderate]** Show scores as trends, not as single takes. **[Strong]** No evidence supports tongue-twister speed ladders as clarity training. **[None found]**

---

## 2. English for a French speaker

The ranking weighs two things. The first is how strongly each feature is linked to comprehensibility. The second is whether a training method has worked for French speakers. **[Moderate overall]**

Main caveats:
- Most comprehensibility evidence comes from one Montreal group. It often reuses the same 40 Quebec French speakers.
- The /h/ and vowel training studies come from France. The reviewers found no study that tested whether Quebec and European French speakers share the same priorities. A reviewer lead suggests Canadian French speakers may use stress cues more than European French speakers (Qin, Chien & Tremblay 2017). **[Unverified]**
- Most stress studies with French listeners used Spanish words or made-up words, not English.
- Almost all training studies are small, with short follow-up.

| Rank | Feature | Why it matters for being understood | How to train it | Evidence strength | Sources |
|---|---|---|---|---|---|
| 1 | **Word stress**, and how it is signalled: a longer syllable, a pitch change, and reduced vowels around it | In 40 Quebec French speakers telling picture stories, stress errors were the only pronunciation measure that separated comprehensibility levels at every level. French listeners have trouble holding stress differences in memory ("stress deafness"). This shows mainly in hard tasks. The evidence that this trouble lasts comes from French learners of Spanish tested on made-up words. For French learners of English with real words, the evidence is weaker and mixed. | A listening game: hear a word, then tap the stressed syllable or match a shape (●○ / ○●). Use many voices. Show and quiz each word's stress pattern. Split production feedback into length, pitch and vowel reduction. Choose words of 3+ syllables, suffixes that move stress (photograph / photography, -tion, -ic, -ity), and English words that look like French words. | **Moderate** as a priority (links only). **Weak** for training. | Isaacs & Trofimovich 2012; Saito et al. 2017; Crowther et al. 2015; Dupoux et al. 1997, 2008; Tremblay 2008; Schwab et al. 2022; Carpenter 2015 |
| 2 | **Vowel pairs that French lacks:** /iː-ɪ/ (sheep/ship), /uː-ʊ/ (pool/pull), /æ-ʌ-ɑː/ (cat/cut/cart) | French speakers recognise English vowels less accurately than German or Norwegian speakers. Vowel and consonant errors are linked to comprehensibility. French speakers still learn new cues, so the gap can be trained. | HVPT identification with many voices and instant right/wrong feedback. Then say the same words and get feedback on each vowel. The feedback should name the vowel that was heard ("your /ɪ/ sounded like /iː/"). Train both vowel quality and length. The main French study used about 8 sessions for English vowels as a whole, and the reviewers could not verify that count. Giving each pair about 8 sessions is a design guess. | **Moderate** | Iverson & Evans 2007; Saito et al. 2017; Iverson, Pinet & Evans 2012; Krzonowski et al. 2016 |
| 3 | **/h/:** often dropped ("'oliday"). Added where none belongs far less often. | French learners drop /h/ and often do not hear it. This leads to word-recognition errors: they miss /h/-words like "holiday" and accept made-up words like "usband". The figures on how rarely /h/ is added come from an unchecked secondary summary. | Online HVPT with pairs such as heat/eat, hair/air, hold/old, hand/and, in many voices. Add "Is this a real word?" decisions. Track dropped and added /h/ as two separate error types. | **Moderate** (one training study) | Melnik & Peperkamp 2019, 2021; Mah et al. 2016; Janda & Auger 1992 |
| 4 | **Fluency and pausing in free speech** | Vocabulary and fluency separated low-level speakers. Which features matter changes with the speaking task. Read-aloud cannot show word choice and shows little of free-speech fluency. No reviewed study tested read-aloud directly. | A 60-second picture description or opinion task. Track speech rate. Track where pauses fall: inside phrases or at phrase boundaries. | **Moderate** (links only) | Isaacs & Trofimovich 2012; Trofimovich & Isaacs 2012; Crowther et al. 2015, 2018 |
| 5 | **Rhythm: weak forms and reduced vowels in connected speech** | Among the same 40 speakers, the vowel-reduction ratio was reported as one of the strongest links to comprehensibility. Overall rhythm was tied more to accent than to comprehensibility. | Short drills on weak forms of small words (to, for, can, of, and, that) and on phrases with many schwas. Show rhythm scores only as a secondary indicator, never as pass/fail. | **Mixed** | Isaacs & Trofimovich 2012; Trofimovich & Isaacs 2012; Frost 2011; Tortel & Hirst 2010 |
| 6 | **Intonation** (a pitch rise at the end of every phrase) | One claim says French learners add a rise at the end of each phrase. This would make word stress harder to hear. The reviewers could not check the claim. | A small French study showed the learner's pitch line next to a model's pitch line. Three sessions brought learners' question intonation closer to the model. The abstract reported no comparison group. | **Unverified** | Horgues 2013 and Herment et al. 2014 (not checked); Guyot-Talbot et al. 2016 (lead) |
| 7 | **/θ ð/** ("think", "this") **and consonant clusters at the ends of words** | The reviewers ran out of search time before looking for French-specific evidence on how much these cost in being understood. They rank last until someone checks. | Low priority. Revisit after checking. | **Not searched** | none |

### Notes on training methods for French speakers

- **Many-voice listening training (HVPT) for vowels.** French speakers improved at identifying English vowels. This held both for those living in England and for those in France. So training added something that exposure alone did not. **[Moderate]** (Iverson, Pinet & Evans 2012) The study used about 8 sessions. The reviewers could not verify this count.
- **Online HVPT for /h/.** Eight online sessions improved /h/ identification and word recognition. The gains were still there 4 months later. The authors call this the first evidence that short training improves word recognition, not only sound perception. **[Moderate; one study]** (Melnik & Peperkamp 2021)
- **Stress listening training.** Two 4-hour trainings improved stress identification in French adults who knew no Spanish. An explicit rule version and a non-explicit shape-matching game worked equally well. The training did not improve stress processing in the conditions with more variable speech. **[Weak]** The study had no untrained comparison group, and it trained Spanish stress, not English (Schwab et al. 2022).
  - A trained French group made fewer errors and answered faster on a stress task than untrained French groups. **[Weak]** (Carpenter 2015)
  - After brief training on Spanish stress, French listeners improved but stayed below native level. Pitch was their most useful stress cue. **[Weak]** (Schwab & Llisterri 2011)
- **Listening training versus speaking training.** One study compared listening training, speaking training and no training in 48 French university students over 5 sessions (Krzonowski et al. 2016).
  - Listening training affected both listening and speaking. Speaking-only training had a narrower effect.
  - The authors say the results are hard to read because the untrained group also improved. One summary says the opposite, so the sources disagree. **[Weak]**
  - Meta-analyses across many first languages find that listening training carries over to speaking, but less than it improves listening. None of them focus on French speakers. **[Moderate]** (Uchihara, Karas & Thomson 2024, a reviewer lead; Lengeris 2018, Greek learners)
- **Hard tests are needed to find stress problems.** French listeners struggled mainly when there were many voices and they had to remember sequences. A single-voice "same or different?" test can miss the problem. **[Moderate]** (Dupoux et al. 1997, 2008; the sequence-recall method comes from Dupoux et al. 2001, a reviewer lead) The 2008 study tested French learners of Spanish on made-up words.
- **Knowing a word's stress pattern helps.** Some French Canadian learners used stress to recognise English words, but only when they knew where the stress fell. **[Moderate]** (Tremblay 2008) So the app should store and teach each word's stress pattern.
- **Two cautions on HVPT, flagged by reviewers but not checked.** A replication found no advantage for many voices over few voices (Brekelmans et al. 2022). Another study found that many voices helped high-aptitude learners and hindered low-aptitude ones (Sadakata & McQueen 2014, Dutch speakers learning tones). **[Unverified]**
- **Exaggerated stress cues that fade back to natural speech.** This is a reasonable design idea. The reviewers found no checked evidence for its benefit. **[Unverified]**
- **Measuring rhythm.** Classic rhythm scores (%V, varco, nPVI) are statistics of vowel and consonant timing. One study sorted native speakers, advanced learners and beginners with about 70% accuracy using adjusted versions of these scores (Tortel & Hirst 2010). A reviewer lead reports that the classic scores were unreliable across learner levels (Michardière et al. 2016). Another lead reports that syllable-based measures separated levels better (Ballier et al. 2016). **[Mixed]**
- **Direction of stress errors.** A reviewer lead reports that moving stress to a later syllable hurts intelligibility more than moving it earlier. This fits French speakers' habit of stressing the end of a phrase. **[Unverified]** (Field 2005)

---

## 3. Clearer native French

### 3.1 What "clear speech" is

Clear speech is a speaking style. Ordinary adult native speakers can switch into it when asked. **[Strong]** Most of this evidence comes from English (Smiljanić & Bradlow 2009; Uchanski 2005).

Its measurable features are:
- a slower overall rate, from more pauses and longer sounds;
- a wider pitch range;
- vowels that are more distinct from each other and less reduced;
- released stop consonants (p, t, k, b, d, g) and fully finished final consonants;
- more energy in the 1–3 kHz frequency band, a middle range of sound frequencies.

**[Strong]** (Picheny, Durlach & Braida 1986; Smiljanić & Bradlow 2009)

A few trained speakers also showed deeper slow changes in loudness over time. **[Weak]** (Krause & Braida 2004)

**Benefit.** On average, clear speech makes keywords about 17 percentage points more intelligible for listeners with hearing loss (Picheny, Durlach & Braida 1985). Reviews report gains of about 14–18 points for listeners with normal hearing in noise (Payton, Uchanski & Braida 1994; Smiljanić & Bradlow 2009). **[Strong]** The gain varies a lot between speakers, and some gain little or nothing (see 3.2). The effect appears in English and in Croatian. **[Strong]** (Smiljanić & Bradlow 2005)

**Limits of this evidence.** These studies tested listeners with hearing loss or listeners in noise. The reviewers did not examine whether clearer native speech helps everyday listeners in a quiet room. **[Not searched]**

**French evidence.** Small Canadian French studies found these features in clear speech:
- longer and louder vowels;
- vowels more distinct from their neighbours;
- less variation within each vowel;
- larger lip and tongue movements.

The benefit showed when listening, when lip-reading, and with both together. It varied between speakers. **[Moderate]** (Gagné, Rochette & Charest 2002; Ménard et al. 2016) These studies used syllables, vowels in carrier phrases and short sentences, not everyday conversation. The reviewers verified no European French clear-speech study. A Parisian French study of speech in noise is a lead (Garnier, Henrich & Dubois 2010). **[Unverified]**

### 3.2 Can it be trained?

- **Producing it.** Speakers can produce clear speech right away when given a short instruction. **[Moderate]** (Schum 1996; Lam, Tjaden & Wilding 2012) In one study of 78 Dutch speakers talking in noise, the changes grew over the first few trials. **[Weak]** (Shen, Cooke & Janse 2023)
- **The wording of the instruction matters.** In one study of 12 American English speakers, "over-enunciate" gave the largest change and the largest intelligibility gain. "Speak as if to someone with hearing loss" came second. "Speak clearly" came last, but it still beat habitual speech. **[Moderate]** (Lam, Tjaden & Wilding 2012; Lam & Tjaden 2013)
- **Not everyone gains.** In one database of 41 American English speakers, only 23 were reported to give listeners a significant clear-speech benefit for vowels. The reviewers could not confirm the exact count. Small tests for each speaker may explain part of this. In a follow-up of 12 of these speakers, those with a large benefit lengthened their vowels and spread them apart more. **[Moderate]** (Ferguson & Kewley-Port 2007; Ferguson 2012) Trying harder does not guarantee clearer speech.
- **Speed is not the key.**
  - A few trained speakers produced clear speech at their normal rate. For listeners with normal hearing in noise, it kept about 78% of the benefit of slow clear speech. **[Weak]** (Krause & Braida 2002, 2004)
  - Across 20 ordinary English speakers, speaking rate did not predict intelligibility. Pitch range did. **[Mixed]** (Bradlow, Torretta & Pisoni 1996)
  - Artificially slowing ordinary speech did not reproduce the benefit. **[Moderate]** (Uchanski 1996; Picheny, Durlach & Braida 1989, a reviewer lead)
  - Older listeners may still need slower speech. **[Weak]** (Krause & Panagiotopoulos 2019, a reviewer lead)
- **Noise and a struggling listener bring it out without instruction.** Six Canadian French speakers in loud background chatter changed both lip and tongue movements. They changed more when talking with a partner. British English pairs behaved the same way when the partner heard distorted speech. **[Moderate]** (Garnier, Ménard & Alexandre 2018; Hazan & Baker 2011) The French study measured movements, not how well listeners understood. Read, instructed clear speech shows larger changes than this. The reviewers found no study of whether clarity learned in noise stays after the noise stops. **[None found]**
- **Keeping it.** In conversation, clear speech fades over time and restarts at each new task. **[Weak]** (Lee & Baese-Berk 2020) The reviewers found no controlled trial showing that clarity training carries over into everyday speech weeks later. **[None found]** The only training studies are small ones with partners of people with hearing loss (Caissie et al. 2005).
- **Diction and voice courses.** Voice-training trials, mostly with teachers, target vocal health, not clarity. For voice quality, direct practice beat booklets in low-quality studies. The reviewers could not confirm the cited papers. **[Weak]** The reviewers found no controlled evidence that diction or public-speaking courses improve measured intelligibility. **[None found]**

### 3.3 What to practise

1. **Paired recordings.** Record the same material twice: first in your habitual style, then clearly. The app reports the difference. It finds the features this user does not change and targets them. **[Moderate]** (Ferguson & Kewley-Port 2007)
2. **Concrete cues, not "be clearer".** Examples: "Open your jaw more. Finish every final consonant. Give each vowel its full shape." Add a listener: "Your listener is hard of hearing." **[Moderate for the short "over-enunciate" cue and the listener framing; the concrete mouth cues are untested]** (Lam, Tjaden & Wilding 2012; Lam & Tjaden 2013)
3. **Clear at your normal speed.** Work in two stages. First, speak slowly and clearly. Then keep the clarity while bringing the speed back up. Never reward slowness by itself. **[Weak]** (Krause & Braida 2002, 2004)
4. **Listener simulation.** Each prompt names a specific listener, such as a colleague on a bad phone line or someone in a noisy café. Optional background chatter can play in earbuds at a moderate level, with the volume capped for safety. Fade the noise out over sessions. **[Moderate that noise brings out clearer movements; untested that the effect lasts]** (Garnier, Ménard & Alexandre 2018; Hazan & Baker 2011) A reviewer lead reports that speech aimed at a real listener was more intelligible than speech aimed at an imagined one (Scarborough & Zellou 2013). **[Unverified]**
5. **Semi-free speech.** Describe a picture or retell a story for 60–90 seconds. Measure how much clarity drops from start to finish. **[Weak]** (Lee & Baese-Berk 2020)
6. **French vowel probes.** Use the carrier phrase "Le mot __ me plaît" with the crowded vowel groups /i y e ø ɛ œ/ and /u o ɔ/. Measure how distinct the vowels are, how consistent each vowel is across repeats, and how long each lasts. **[Moderate that clear French speech changes these; Mixed that vowel distinctness predicts intelligibility; reliability on phones unknown]** (Ménard et al. 2016)
7. **Warm-up.** Start each session with a few clear-speech trials. **[Weak]** (Shen, Cooke & Janse 2023)
8. **Later, optional.** A front-camera mode could give feedback on lip opening, because French clarity is partly visible. This feature itself is untested. **[Moderate for the visible part]** (Gagné, Rochette & Charest 2002; Ménard et al. 2016)

### 3.4 What the app can measure automatically

No single measure should serve as a "clarity score". Combine several measures. Compare each one only with the user's own baseline, on the same device. **[Mixed]**

| Measure | What it shows | Reliability notes | Strength |
|---|---|---|---|
| Pauses and speaking rate | Pacing: how often and where the user stops | Easy to compute on the phone. Rate did not predict intelligibility across speakers, so use it to diagnose problems, not as a goal. | Mixed |
| Pitch range | How much the voice moves up and down | Linked to intelligibility in a 20-speaker English study (Bradlow et al. 1996). Phone recordings match a lab recorder for pitch when the audio is not compressed (Zhang et al. 2021). | Mixed (link to intelligibility); Moderate (phone accuracy) |
| Energy in the 1–3 kHz band, relative to overall loudness | Crispness | Together with word length, it explained about half of the differences between speakers in one study (Hazan & Markham 2004). Reliability on phones in ordinary rooms is unknown. Compressed or processed audio distorts loudness measures. | Mixed; phone reliability unknown |
| Vowel and word length | Fuller vowels | Linked to intelligibility, and longer in speakers who gain most from clear speech | Mixed |
| Vowel distinctness and consistency (from formants) | How separate and stable the vowels are | Its link to intelligibility is inconsistent across studies. Phone formants are close to lab values when audio is not compressed, but noise and compression distort them. How stable the measure is from day to day on a phone is unknown. | Mixed |
| Depth of slow loudness changes | A rhythm-of-loudness feature | Found in clear speech, but adding it to ordinary speech recovered only a small part of the benefit (Krause & Braida 2009) | Weak |
| Released final consonants | Finished word endings | The reviewers found no validated automatic method. It may need forced alignment, which matches the text to the audio timing. | None found |
| ASR word accuracy on noise-mixed, hard-to-predict sentences | A rough intelligibility check | On clean audio a native speaker should score almost perfectly, which leaves no room to show gains. This is reasoned, not tested. Mixing in background chatter at a fixed level helps, as do sentences that ASR cannot guess from context. ASR tracks human listeners for moderate-to-severe speech disorders, but not for mild cases or individual second-language speakers. Whisper sometimes inserts fluent but wrong words. Nobody has validated it for native French in the studies reviewed. | Mixed |
| Azure fr-FR pronunciation scores | Accuracy of individual sounds (phonemes) | Prosody, syllable and spoken-phoneme outputs are US English only. The fr-FR model changed in August 2026. French clarity has to rely on the app's own measures. | Strong |

A reviewer-flagged study suggests that ASR accuracy feedback alone made healthy speakers clearer. The reviewers could not verify it. **[Unverified]**

---

## 4. Phone, short sessions

### 4.1 What the evidence says about short mobile practice

- **Automated pronunciation training works on average.** Across 15 ASR studies the average effect was g ≈ 0.69 (Ngo, Chen & Lai 2024). Across 31 computer-assisted pronunciation training (CAPT) studies it was d ≈ 0.68 (Mahdi & Al Khateeb 2019). The reviewers call these medium effects. *g* and *d* are standard effect sizes that let readers compare results across studies. Most learners were Asian university students. Neither review reported a French-L1 group. The figures come from secondary summaries. **[Moderate]**
- **What went with larger effects** (Ngo et al. 2024; secondary figures, small subgroups):

  | Condition | Effect | Compared with |
  |---|---|---|
  | Explicit corrective feedback | 0.86 | Indirect feedback: 0.50 |
  | Programs of 5–8 weeks | 1.01 | 1–4 weeks: 0.07 |
  | Individual sounds as targets | 0.82 | Prosody as targets: 0.37 |

  These subgroup comparisons do not show cause. They say nothing about programs longer than 8 weeks. **[Weak]**
- **Phone and app studies are small.** They had 16–61 learners, roughly 10–30 minutes a session, for 8–14 weeks. Most had no proper comparison group. None involved French speakers. They report gains in comprehensibility, fluency or general speaking. **[Weak]**
  - *Phone shadowing:* listen to short native dialogues and repeat them. 16 learners of English in Canada practised at least 4 times a week, for at least 10 minutes, over 8 weeks. Comprehensibility and fluency improved. Accent did not change significantly. There was no comparison group. **[Weak]** (Foote & McDonough 2017)
  - *Babbel:* 54 US learners of Spanish, about 10 minutes a day, for 12 weeks. Speaking ability improved. Study time was the strongest predictor. **[Weak; secondary]** (Loewen, Isbell & Sporn 2020)
  - Two classroom-linked ASR studies did report accent gains. **[Weak]** (Sun 2023; Abdelrady et al. 2026)
  - A reviewer lead: a 2025 review of 44 shadowing studies found gains in comprehensibility, fluency and prosody. Results for individual sounds were unclear, and study quality was generally weak. **[Unverified]**
- **Spread practice across days.** Spaced practice beat practice crammed into one period, most clearly on later tests. Gaps of equal length worked as well as gaps that grow longer. This comes from 48 experiments with 3,411 learners, mostly on vocabulary and grammar, not pronunciation. **[Moderate]** (Kim & Webb 2022; secondary)
  - Repeating one phrase several times in a row within a session may help fluency. **[Weak]** (Suzuki & DeKeyser 2017; secondary)
  - How often people practised was more consistently linked to gains than total minutes. Among 287 Duolingo users, minutes were linked to written gains but not to speaking gains. These are links, not causes. **[Weak; secondary]** (Sudina & Plonsky 2023)
- **Dropout is the main risk.** (Hwang, Coss, Loewen & Tagarelli 2024)
  - 43% of 3,319 adult app users stopped within 3 months. **[Weak; secondary]**
  - Staying engaged went with at least 5 minutes a session, at least 4 sessions a week, and at least 7 active weeks in a row. **[Weak; secondary]**
  - Users who paused and came back kept going longer. **[Weak; secondary]**
  - In a habit study of 96 adults outside language learning, missing one chance to do the habit did not noticeably slow habit formation. Among those who formed a habit, the median time to make it automatic was 66 days, with a range of 18–254. About half the participants never reached habit status in 12 weeks. **[Weak]** (Lally et al. 2010)
  - A reviewer lead from consumer research reports that broken streaks demotivate users and flexible streak rules help (Silverman & Barasch 2023). **[Unverified]**
- **Dose for this learner.** The studies with French listeners used about 4 hours of training for stress (on Spanish words) and 8 sessions for vowels and /h/. Four hours at 4–5 minutes a session is 48–60 sessions. That takes about 7–9 weeks with daily practice, or 12–15 weeks at 4 sessions a week. The findings do not give the length of the 8 vowel and /h/ sessions, so their dose in minutes is unknown. The best spacing is also unknown.
- **Caution.** The "5 minutes" and "4 sessions a week" figures predict staying with an app. The study did not test them as predictors of how fast a learner improves.

### 4.2 Technical constraints

**Browser audio capture on iOS and Android**
- Browsers allow the microphone only on secure pages: HTTPS pages, or the computer's own address (localhost). A phone opening a plain-http address on the local network will not get the microphone. **[Strong]** (MDN)
- Recording formats differ between phones. MediaRecorder is the browser's built-in recorder. **[Strong]**
  - iOS Safari records audio/mp4 by default. WebM recording depends on a setting that only current WebKit turns on, so older iOS versions lack it.
  - Chrome on Android records audio/webm and audio/mp4.
  - Azure's short-audio REST API is a simple service that takes one uploaded file. It accepts only WAV/PCM (uncompressed, 16 kHz, mono) or OGG/Opus (a compressed format). So neither phone's default recording can go straight to Azure.
- v1's recorder (`client/src/hooks/useRecorder.ts`) hard-codes audio/webm. It fails wherever WebM recording is missing. **[Strong]**
- **Portable approach.**
  - Capture raw audio samples with AudioWorklet, a browser feature that processes audio as it arrives. It needs Chrome 66+ or Safari 14.1+.
  - Reduce the audio to 16 kHz and build the WAV file on the phone.
  - Keep MediaRecorder only as a fallback. Choose its format by checking what the browser supports, trying audio/mp4 first on iOS.

  **[Strong]**
- iOS stops microphone capture and audio when the page is hidden. WebKit has a separate "interrupted" audio state. **[Moderate]** So the app cannot offer background or lock-screen practice on iOS.
- Developers report repeated permission prompts in home-screen web apps when the app asks for the microphone again. **[Weak]** v1 stops the microphone after every take, which may trigger these prompts.
- Azure's REST pronunciation assessment accepts at most 30 seconds of audio. **[Strong]**

**Microphones and noise**
- Uncompressed phone recordings match a lab recorder for pitch, and mostly for formants. Compressed audio, video-call processing and noise distort vowel and loudness measures in unpredictable ways. This comes from device-comparison studies with few speakers; the main one had 7. **[Moderate]** (Zhang et al. 2021; Sanker et al. 2021; De Decker 2016)
- Microsoft documents that Azure's quality drops with low sample rates, distance from the microphone, remote connections, background noise and several speakers. It recommends 16 kHz or higher, a close microphone, a quiet room and one speaker. It suggests asking for a repeat when a take scores below a threshold. **[Strong]**
- The reviewers found no test of whether turning off the browser's noise suppression and automatic volume control helps or hurts Azure scores on phones. **[None found]**

**How reliable Azure's scores are**
- Microsoft reports a Pearson correlation above 0.5 with human judges and calls it "high". A Pearson correlation runs from −1 to 1 and shows how closely two sets of scores move together. **[Strong]** For feedback on a single take from one learner, a correlation this size still allows a lot of disagreement. This reading is the reviewers', not Microsoft's.
- Microsoft updates the scoring models on its servers. The en-US and fr-FR models changed in August 2026, as announced in release notes. The reviewers found no documented way to lock a model version. **[Strong]**
- Prosody, syllable-group and spoken-phoneme outputs are US English only. **[Strong]** Reviewers also found no word-stress error type, and the prosody score covers only a whole text. **[Unverified]**
- In one research system, automatic detection of word-stress errors was right 94.8% of the times it flagged an error, but it found only 49.2% of the real errors (Korzekwa et al. 2021). **[Unverified]** Azure appears to lack a word-stress error type, so stress feedback needs the app's own pitch, length and loudness analysis. The research result shows that such analysis is hard to do well. Check the app's analysis against human judges before showing its scores.

**On-device vs cloud models**
- Small ASR models can run in a phone browser. **[Moderate]** "Parameters" are the learned values inside a model, a rough measure of its size. File sizes are for the whisper.cpp format.

  | Model | Parameters | File size | Memory |
  |---|---|---|---|
  | Whisper tiny | 39M | ~75 MiB | ~273 MB |
  | Whisper base | 74M | ~142 MiB | ~388 MB |

  WebGPU lets a web page use the phone's graphics chip. It works on Chrome Android 121+ and Safari 26. Other browsers fall back to WASM (WebAssembly), which runs on the main processor.
- General ASR is built to cope with accents, so it often recognises mispronounced words as correct. **[Moderate]**
  - In one 7-day study of 28 learners, iOS 15 dictation understood words even when they were mispronounced. The authors judged it unsuitable for self-study pronunciation practice (Umezawa et al. 2023).
  - Whisper's own documentation warns that it can invent text.
- Models that recognise individual sounds (phonemes) are much larger. **[Moderate]** (fairseq wav2vec 2.0 documentation)
- A sensible split:
  - Azure in the cloud scores individual sounds.
  - The phone gives instant signals: voice detection with auto-stop, a level meter, a pitch line, speaking rate and pauses. These cover much of pacing, pausing and pitch range in both languages.

**Latency (waiting time for feedback)**
- General app-design guidance on waiting times, cited by Microsoft from Nielsen Norman Group:

  | Wait | Effect on the user |
  |---|---|
  | Under 0.1 s | Feels instant |
  | 1–5 s | Acceptable |
  | 5–10 s | Attention wanders |
  | 10 s or more | Frustration or abandonment |

  No controlled study covers pronunciation apps. **[Weak]**
- Azure's short-audio REST API returns only final results. Uploading audio in chunks during recording can greatly cut the wait. **[Strong]** One developer reports that Azure adds about 3 seconds per assessment. The findings do not list this source. **[Unverified]**
- Another option is Microsoft's Speech SDK (a code library) over a WebSocket (a connection that stays open while audio streams). The server issues a short-lived token, which keeps `AZURE_SPEECH_KEY` off the phone. This is a design choice, not a tested finding.
- v1's hosting file (render.yaml) uses a free tier with temporary storage. Free tiers that shut down when idle and restart slowly would delay the first feedback. **[Unverified]**

---

## 5. Implications for the redesign (ranked)

1. **Make comprehensibility the main goal and outcome, not a native accent.** Measure it with free-speech tasks as well as read-aloud. *Evidence:* accent and comprehensibility come apart, and which features matter changes with the task (Trofimovich & Isaacs 2012; Crowther et al. 2015, 2018; Munro & Derwing 1995, a reviewer lead). In one small phone study with no comparison group, comprehensibility improved but accent did not (Foote & McDonough 2017). Two classroom ASR studies did find accent gains (Sun 2023; Abdelrady et al. 2026). **[Moderate]**
2. **Build a reliable phone recording setup before any feature.**
   - Serve the app over HTTPS.
   - Capture with AudioWorklet and produce a 16 kHz mono WAV.
   - Open the microphone once per session and reuse it.
   - Keep takes in the foreground: 30 seconds at most, with items of about 10–15 seconds.
   - Stop and discard the take when the page is hidden.
   - Before each upload, check for clipping, loudness, background noise and a single voice. Ask for a re-take when the check fails.

   *Evidence:* MDN; WebKit and Chromium source code; Microsoft Azure documentation; Zhang et al. 2021. **[Strong for HTTPS, audio format and the 30-second limit; Moderate for iOS page hiding and audio quality; Weak for repeated permission prompts]**
3. **Make word stress the first English module.**
   - Listening game with many voices. Diagnose with hard tasks: remembering sequences, or real-word decisions on words that differ only in stress.
   - Show and quiz each word's stress pattern.
   - Split production feedback into length, pitch and vowel reduction, using the app's own analysis. Check it against human judges before showing scores.
   - Plan about 4 hours in total. At 4–5 minutes a session, that is about 7–9 weeks of daily practice, or 12–15 weeks at 4 sessions a week.
   - Test on new words and new voices.

   *Evidence:* Isaacs & Trofimovich 2012; Dupoux et al. 2008; Tremblay 2008; Schwab et al. 2022; Azure documentation. **[Moderate as a priority; Weak for the training method; Unverified that Azure lacks a word-stress error type]**
4. **Give specific feedback after every take:** the word, the sound, what went wrong, one mouth cue, and an immediate retry. A bare 0–100 score is not enough. *Evidence:* explicit feedback went with larger effects (Ngo et al. 2024). **[Moderate overall; Weak for the subgroup figure]**
5. **Build a vowel-pair module.** Each pair gets many-voice listening practice plus speaking practice. Plan about 8 sessions per pair. The source study used about 8 sessions for all English vowels, so the per-pair count is a guess. Feedback names the vowel that was heard. *Evidence:* Iverson & Evans 2007; Iverson, Pinet & Evans 2012. **[Moderate]**
6. **Build an /h/ module:** many-voice listening, "Is it a real word?" decisions, and separate tracking of dropped and added /h/. *Evidence:* Melnik & Peperkamp 2019, 2021. **[Moderate; one training study]**
7. **Design sessions around the phone.**
   - A 10-minute default, a complete 5-minute version, and an optional extension to 15 minutes.
   - A weekly goal of at least 4 sessions instead of a daily streak.
   - A 3-minute comeback session after a gap, with no backlog.
   - One reminder at a time the user chooses.
   - 6–8-week cycles with before and after tests that include free speech.

   *Evidence:* Hwang et al. 2024; Ngo et al. 2024; Foote & McDonough 2017; Lally et al. 2010. **[Weak]**
8. **Bring targets back across days on a simple preset schedule** (about 1, 3, 7 and 14 days). Do not build an adaptive algorithm. *Evidence:* Kim & Webb 2022, mostly vocabulary and grammar studies. **[Moderate]**
9. **Build the native-French clear-speech module.**
   - Paired habitual and clear recordings.
   - Concrete over-enunciation cues and a named listener.
   - Slow and clear first, then clear at a natural speed.
   - Optional noise that fades out over sessions.
   - Retell tasks and French vowel probes.
   - Several measures, each compared with the user's own baseline, and no single clarity score.

   *Evidence:* Smiljanić & Bradlow 2009; Lam et al. 2012, 2013; Ferguson & Kewley-Port 2007; Krause & Braida 2002, 2004; Garnier et al. 2018; Hazan & Baker 2011; Lee & Baese-Berk 2020; Ménard et al. 2016. **[Strong that clear speech helps listeners with hearing loss or in noise; Moderate to Weak for the methods; None found for lasting effects]**
10. **Show instant on-device feedback** (pitch line, speaking rate, pauses, level) while the cloud score loads. Aim for 2–3 seconds or less to first feedback. Upload in chunks, or use the SDK with a server-issued token. *Evidence:* Microsoft Azure REST documentation; Nielsen Norman Group guidance cited by Microsoft; Whisper and transformers.js documentation. **[Weak for time targets; Strong for the Azure documentation]**
11. **Show trends, not single scores.** Save the scoring date, device and browser with each result. Once a month, re-score a fixed set of reference recordings. This catches score changes caused by Azure model updates rather than by the learner. *Evidence:* Microsoft Azure documentation and release notes; Zhang et al. 2021. **[Strong for model changes; Moderate for device effects]**
12. **Use general ASR only as a lenient "Was I understood?" check, and label it that way.** For native French, mix in background noise, use hard-to-predict sentences, and compare with the user's own baseline. *Evidence:* Umezawa et al. 2023; Whisper model card; Inceoglu et al. 2023. **[Moderate / Mixed]**
13. **Add shadowing of short dialogues as a phone activity for fluency and rhythm.** Treat it as an experiment. *Evidence:* Foote & McDonough 2017, with no French-L1 evidence; a 2025 shadowing review is a reviewer lead. **[Weak]**
14. **Keep explanations short and put practice first.** Offer voice-care tips only in an optional side panel, and do not count them as progress. *Evidence:* Schwab et al. 2022 (Spanish stress); voice-training reviews. **[Weak]**
15. **Remove tongue-twister speed ladders as a core trainer.** If kept, make them an optional warm-up. Speed should rise only after accuracy passes a check. Present the task as "keep your clarity while the speed returns to normal". *Evidence:* Wilshire 1999; Ohkubo et al. 2025. **[None found for any benefit]**

---

## 6. What does not work, or lacks evidence

**Not supported, or evidence against**
- **Native accent as the main goal.** Accent and comprehensibility come apart. **[Moderate; links only]** This does not show that accent work is useless.
- **Relying on exposure alone to fix stress and vowels.** French learners living in England still gained from training. **[Moderate]** Exposure is not useless: some Quebec learners do use stress to recognise words. **[Moderate]**
- **A single-voice "same or different?" test to diagnose stress problems.** French listeners fail mainly with many voices and memory load, so an easy test misses the problem. **[Moderate]**
- **Comparing single-take Azure scores across sessions as proof of progress.** Scores change with noise and microphone distance, and the models change on the server. **[Strong]**
- **General dictation ASR as the pronunciation judge.** It can accept mispronounced words as correct. **[Moderate]**
- **Raw ASR error rate on clean audio as a clarity measure for native speakers.** Native speakers should score almost perfectly, so the measure cannot show gains. This is reasoned, not directly tested. **[Mixed]**
- **Rewarding slowness by itself.** Speaking rate did not predict intelligibility. Clear speech at normal speed kept much of the benefit. **[Mixed to Moderate]**
- **Assuming effort equals improvement.** Only 23 of 41 speakers were reported to give a significant vowel benefit. **[Moderate]**
- **Vague "speak clearly" prompts.** They gave the smallest gain of the instructed styles, though still a gain. **[Moderate]**
- **Voice-hygiene tips or booklets as clarity training.** **[Weak]**
- **Expecting results from 1–4-week programs** (g = 0.07). This is a tentative subgroup result. **[Weak]**
- **Growing-gap schedules as a special advantage.** Equal gaps worked as well. **[Moderate]**
- **Azure for French prosody, syllable or spoken-phoneme feedback.** It is not available. **[Strong]**
- **Hard-coding audio/webm, or sending MediaRecorder output straight to Azure REST.** **[Strong]**
- **Background, lock-screen or hands-free recording on iOS.** **[Moderate]**
- **Compressed or conferencing audio for acoustic measures.** **[Moderate]**
- **An /h/ drill that only rewards adding /h/.** It could increase wrong insertions. This is reasoned, not tested.

**Lacks evidence**
- **Tongue-twister speed ladders, in English or French.** No evidence either way. Research uses tongue twisters to cause speech errors. The one training study, which the reviewers could not confirm, measured tongue movement and repetition speed, not clarity (Ohkubo et al. 2025). **[None found]** A reviewer lead: a review found no evidence that non-speech mouth exercises improve speech in children with speech sound disorders (Lee & Gibbon 2015). This is indirect, because tongue twisters are speech. **[Unverified]**
- **Long explicit rule lessons as the main method.** **[Weak]**
- **Read-aloud-only progress checks as proof of real-life gains.** **[Moderate for the task effect]**
- **Visual feedback for word stress.** The reviewers could not read the one study they found, and its learners may not have been French (Ivanova 2024). A small French study found that pitch-line feedback helped question intonation, not word stress (Guyot-Talbot et al. 2016, a lead). **[Unverified]**
- **Exaggerated stress cues that fade back to normal.** **[Unverified]**
- **Rhythm scores (%V, varco, nPVI) as a progress score.** **[Mixed]**
- **Shadowing for French-L1 learners of English.** **[None found for this group]**
- **Lasting carry-over of clarity training into everyday speech.** **[None found]**
- **Diction or public-speaking courses improving measured intelligibility.** **[None found]**

---

## 7. Open questions

1. **Can the app detect stress errors reliably?** Can Azure, or the app's own pitch, length and loudness analysis, detect misplaced word stress and missing vowel reduction in French-accented English? A small check against human judges is needed before stress scores appear as feedback.
2. **How much do /θ ð/ and word-final consonant clusters cost?** The reviewers ran out of search time before looking for French-specific evidence. Their low ranking is provisional. Someone should check research on how much each sound contrast matters to listeners (for example Munro & Derwing).
3. **Does English stress training carry over?** Most stress-training evidence for French listeners used Spanish or made-up words. Does English stress listening training improve speaking and comprehensibility in free speech?
4. **Is shadowing better than listen-and-repeat** for stress and rhythm in French speakers?
5. **Do Quebec and European French speakers share the same English priorities?**
6. **What is the right dose for 5–15-minute phone sessions?** The studies used 4 hours for stress and 8 sessions for vowels and /h/. The best spacing and upkeep schedule are unknown.
7. **How reliable are the app's own measures on a phone?** This covers formants, vowel distinctness and 1–3 kHz energy in ordinary rooms. It needs day-to-day repeat testing on the user's phone.
8. **How stable are Azure scores on this user's phone?** Record the same items in quiet and noisy settings, then check how much the scores vary.
9. **Does turning off browser noise suppression and automatic volume control help or hurt scores?**
10. **What are the norms for European French speaking rate, pauses and vowel reduction?** Meunier & Espesser 2011 is a lead to review before choosing French baselines.
11. **How should the French ASR-in-noise check be calibrated?** Which noise level, which type of background chatter, and which French ASR model should the app use? It needs a small comparison with human transcription.
12. **Does clearer native French help everyday listeners in quiet rooms?** Most clear-speech studies used listeners with hearing loss or in noise.
13. **Does clear-speech training in French carry over to clearer English**, or the reverse? A reviewer lead reports that high-proficiency non-native speakers can also produce a clear-speech benefit (Smiljanic & Bradlow 2011). **[Unverified]**
14. **Does ASR accuracy feedback alone make speakers clearer?** The reviewers could not verify the one study.
15. **How can the app detect released final consonants automatically?** The reviewers found no validated method.
16. **How do iOS 26 home-screen web apps behave?** Test microphone permission persistence and WebGPU memory limits for 75–150 MB models on a real iPhone.
17. **What are the real effect sizes?** Most summaries gave only the direction of effects. Check the full texts of Iverson et al. 2012, Melnik & Peperkamp 2021, Schwab et al. 2022, Carpenter 2015, Ngo et al. 2024, Mahdi & Al Khateeb 2019, Kim & Webb 2022, Hwang et al. 2024, Sudina & Plonsky 2023, Loewen et al. 2020 and Foote & McDonough 2017.

---

## 8. References

### English for French speakers
- Isaacs & Trofimovich (2012). Deconstructing comprehensibility. *SSLA* 34, 475–505. https://doi.org/10.1017/S0272263112000150
- Saito, Trofimovich & Isaacs (2017). Using listener judgments to investigate linguistic influences on L2 comprehensibility and accentedness. *Applied Linguistics* 38(4), 439–462. https://academic.oup.com/applij/article/38/4/439/2952156 ; https://eric.ed.gov/?id=EJ1150935
- Crowther, Trofimovich, Isaacs & Saito (2015). Does a speaking task affect second language comprehensibility? *Modern Language Journal* 99, 80–95. https://eric.ed.gov/?id=EJ1059611
- Crowther, Trofimovich, Saito & Isaacs (2018). Linguistic dimensions of L2 accentedness and comprehensibility vary across speaking tasks. *SSLA* 40, 443–457. https://www.cambridge.org/core/journals/studies-in-second-language-acquisition/article/abs/linguistic-dimensions-of-l2-accentedness-and-comprehensibility-vary-across-speaking-tasks/77720DD72F6673584405559D26AF7539
- Trofimovich & Isaacs (2012). Disentangling accent from comprehensibility. *Bilingualism: Language and Cognition*. https://www.cambridge.org/core/journals/bilingualism-language-and-cognition/article/abs/disentangling-accent-from-comprehensibility/882035A64FBF4694FBE920784B21C58A ; https://eric.ed.gov/?id=EJ980484
- Saito, Trofimovich & Isaacs (2016). Second language speech production. *Applied Psycholinguistics* 37(2). Japanese learners, not French. https://discovery.ucl.ac.uk/id/eprint/1525195/
- Kennedy & Trofimovich (2008). Intelligibility, comprehensibility, and accentedness of L2 speech. *Canadian Modern Language Review* 64(3). Mandarin speakers, not French. https://utppublishing.com/doi/abs/10.3138/cmlr.64.3.459
- Dupoux, Pallier, Sebastián & Mehler (1997). A destressing "deafness" in French? *J. Memory and Language* 36, 406–421. https://web-archive.southampton.ac.uk/cogprints.org/749/
- Dupoux, Sebastián-Gallés, Navarrete & Peperkamp (2008). Persistent stress "deafness". *Cognition* 106(2), 682–706. French learners of Spanish. https://pubmed.ncbi.nlm.nih.gov/17592731/
- Tremblay (2008). Is second language lexical access prosodically constrained? *Applied Psycholinguistics* 29(4), 553–584. https://doi.org/10.1017/S0142716408080247
- Revisiting "stress-deafness" amongst upper intermediate learners of English (HAL, 2023). https://hal.science/hal-04376152
- Schwab, Giroud, Meyer & Dellwo (2022). Explicit versus non-explicit prosodic training in the learning of Spanish L2 stress contrasts by French listeners. *J. Second Language Studies*. https://www.zora.uzh.ch/id/eprint/207754 ; https://www.jbe-platform.com/content/journals/10.1075/jsls.21017.sch
- Schwab & Llisterri (2011). Are French speakers able to learn to perceive lexical stress contrasts? ICPhS XVII. https://www.researchgate.net/publication/228775954_Are_French_speakers_able_to_learn_to_perceive_lexical_stress_contrasts
- Llisterri & Schwab (2019). Perception of lexical stress in Spanish L2. https://ddd.uab.cat/pub/caplli/2019/305227/Llisterri_Schwab_2019.pdf
- Carpenter (2015). Phonetic training significantly mitigates the stress "deafness" of French speakers. *Int. J. Linguistics* 7(3). https://www.macrothink.org/journal/index.php/ijl/article/view/7661
- Frost (2011). Stress and cues to relative prominence in English and French. *JIPA* 41(1). https://doi.org/10.1017/S0025100310000253 ; https://archivesic.ccsd.cnrs.fr/UNIV-GRENOBLE3/hal-03542714v1
- Tortel & Hirst (2010). Rhythm metrics and the production of English L1/L2. Speech Prosody 2010. https://www.isca-archive.org/speechprosody_2010/tortel10_speechprosody.html
- Iverson & Evans (2007). Learning English vowels with different first-language vowel systems. *JASA* 122(5). https://pubmed.ncbi.nlm.nih.gov/18189574/
- Iverson, Pinet & Evans (2012). Auditory training for experienced and inexperienced second-language learners. *Applied Psycholinguistics* 33(1). https://eric.ed.gov/?id=EJ969153
- Krzonowski, Ferragne & Pellegrino (2016). Perception et production de voyelles de l'anglais par des apprenants francophones. JEP-TALN-RECITAL. https://aclanthology.org/2016.jeptalnrecital-jep.55/
- Lengeris (2018). Computer-based auditory training improves second-language vowel production in spontaneous speech. *JASA* 144(3). Greek learners, not French. https://pubmed.ncbi.nlm.nih.gov/30424671/
- Melnik & Peperkamp (2021). High-Variability Phonetic Training enhances second language lexical processing. *Bilingualism: Language and Cognition*. https://www.cambridge.org/core/journals/bilingualism-language-and-cognition/article/abs/highvariability-phonetic-training-enhances-second-language-lexical-processing-evidence-from-online-training-of-french-learners-of-english/029EC735C52FC7BC65CB61C21160446B
- Melnik & Peperkamp (2019). Perceptual deletion and asymmetric lexical access in second language learners. *JASA* 145(1). https://pubmed.ncbi.nlm.nih.gov/30710915/
- Mah, Goad & Steinhauer (2016). Using event-related brain potentials to assess perceptibility. *Frontiers in Psychology* 7, 1469. https://doi.org/10.3389/fpsyg.2016.01469 ; https://pubmed.ncbi.nlm.nih.gov/27757086/
- Janda & Auger (1992). Quantitative evidence, qualitative hypercorrection… *Language & Communication* 12(3–4). https://eric.ed.gov/?id=EJ453039

*Reviewer leads for this section (not verified):*
- Guyot-Talbot, Heidlmayr & Ferragne (2016). https://aclanthology.org/2016.jeptalnrecital-jep.30/
- Michardière et al. (2016). https://aclanthology.org/2016.jeptalnrecital-jep.37/
- Ballier, Martin & Amand (2016). https://aclanthology.org/2016.jeptalnrecital-jep.82/
- Field (2005). *TESOL Quarterly* 39(3). https://doi.org/10.2307/3588487
- Dupoux, Peperkamp & Sebastián-Gallés (2001). https://doi.org/10.1121/1.1380437
- Korzekwa et al. (2021). https://arxiv.org/abs/2012.14788
- Uchihara, Karas & Thomson (2024). https://doi.org/10.1017/S0142716424000195
- Uchihara, Karas & Thomson (2025). https://doi.org/10.1017/S0272263125100879
- Brekelmans et al. (2022). https://doi.org/10.1016/j.jml.2022.104352
- Sadakata & McQueen (2014). *Frontiers in Psychology* 5:1318. Dutch speakers learning tones (no URL given)
- Saito & Plonsky (2019). https://discovery.ucl.ac.uk/id/eprint/10068780/
- Qin, Chien & Tremblay (2017). *Applied Psycholinguistics* 38(3) (no URL given)
- Ivanova (2024). Training English word stress perception and production with technology. *The EuroCALL Review* 31(2). https://doi.org/10.4995/eurocall.2024.20400

### Clearer native French
- Smiljanić & Bradlow (2009). Speaking and hearing clearly. *Language and Linguistics Compass* 3(1). https://doi.org/10.1111/j.1749-818X.2008.00112.x
- Picheny, Durlach & Braida (1986). Speaking clearly for the hard of hearing II. *JSHR* 29. https://pubmed.ncbi.nlm.nih.gov/3795886/
- Uchanski (1996). Speaking clearly for the hard of hearing IV. *JSHR* 39(3). https://pubmed.ncbi.nlm.nih.gov/8783129/
- Smiljanić & Bradlow (2005). Production and perception of clear speech in Croatian and English. *JASA* 118(3). https://pubmed.ncbi.nlm.nih.gov/16240826/
- Uchanski (2005). Clear speech. *Handbook of Speech Perception*. https://profiles.wustl.edu/en/publications/clear-speech/
- Gagné, Rochette & Charest (2002). Auditory, visual and audiovisual clear speech. *Speech Communication* 37(3). https://www.sciencedirect.com/science/article/abs/pii/S0167639301000127
- Ménard et al. (2016). Speaking clearly for the blind. *PLOS ONE* 11(9). https://doi.org/10.1371/journal.pone.0160088
- Garnier, Ménard & Alexandre (2018). Hyper-articulation in Lombard speech. *JASA* 144(2). https://pubmed.ncbi.nlm.nih.gov/30180713/
- Lam, Tjaden & Wilding (2012). Acoustics of clear speech: Effect of instruction. *JSLHR* 55(6). https://pubmed.ncbi.nlm.nih.gov/22411282/
- Lam & Tjaden (2013). Intelligibility of clear speech: Effect of instruction. *JSLHR* 56(5). https://pubmed.ncbi.nlm.nih.gov/23798509/
- Ferguson & Kewley-Port (2007). Talker differences in clear and conversational speech: vowels. *JSLHR* 50. https://pubmed.ncbi.nlm.nih.gov/17905909/
- Ferguson (2012). Talker differences in clear and conversational speech: vowel intelligibility for older adults with hearing loss. *JSLHR*. https://pmc.ncbi.nlm.nih.gov/articles/PMC3370057/
- Krause & Braida (2002). Investigating alternative forms of clear speech. *JASA* 112(5). https://pubmed.ncbi.nlm.nih.gov/12430828/
- Krause & Braida (2004). Acoustic properties of naturally produced clear speech at normal speaking rates. *JASA* 115(1). https://doi.org/10.1121/1.1635842
- Krause & Braida (2009). Evaluating the role of spectral and envelope characteristics… *JASA* 125(5). https://personal.utdallas.edu/~assmann/hcs6367/krause_braida09.pdf
- Bradlow, Torretta & Pisoni (1996). Intelligibility of normal speech I. *Speech Communication* 20. https://doi.org/10.1016/S0167-6393(96)00063-5
- Hazan & Markham (2004). Acoustic-phonetic correlates of talker intelligibility. *JASA* 116(5). https://pubs.aip.org/asa/jasa/article-abstract/116/5/3108/541748/Acoustic-phonetic-correlates-of-talker
- The effect of hyperarticulation on speech comprehension under adverse listening conditions (review). https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9177484/
- Schum (1996). Intelligibility of clear and conversational speech of young and elderly talkers. *J Am Acad Audiol* 7. https://pubmed.ncbi.nlm.nih.gov/8780994/
- Shen, Cooke & Janse (2023). Speaking in the presence of noise. *JASA* 153(4). Dutch speakers. https://doi.org/10.1121/10.0017769
- Lee & Baese-Berk (2020). The maintenance of clear speech in naturalistic conversations. *JASA* 147(5). https://pubmed.ncbi.nlm.nih.gov/32486786/
- Hazan & Baker (2011). Acoustic-phonetic characteristics of speech produced with communicative intent. *JASA* 130(4). https://doi.org/10.1121/1.3623753
- Caissie et al. (2005). Clear speech for adults with a hearing loss. *J Am Acad Audiol* 16. https://pubmed.ncbi.nlm.nih.gov/15844741/
- Moya-Galé, Walsh & Goudarzi (2022). Automatic assessment of intelligibility in noise in Parkinson disease. *JMIR* 24(10). https://www.jmir.org/2022/10/e40567
- Gutz et al. (2022). Validity of off-the-shelf ASR… in speakers with ALS. *JSLHR* 65(6). https://pubmed.ncbi.nlm.nih.gov/35623334/
- ASR for intelligibility assessment in children with dysarthria (2025). *JSLHR*. https://pubmed.ncbi.nlm.nih.gov/41746192/
- Inceoglu, Chen & Lim (2023). Assessment of L2 intelligibility: L1 listeners vs ASR. *ReCALL* 35(1). https://eric.ed.gov/?id=EJ1359077
- Automatic recognition of second language speech-in-noise (2024). *JASA Express Letters* 4(2). https://doi.org/10.1121/10.0024877
- Wilshire (1999). The "tongue twister" paradigm. *Language and Speech* 42(1). https://journals.sagepub.com/doi/abs/10.1177/00238309990420010301
- Ohkubo et al. (2025). Articulation practice with tongue-twister movement distance using ultrasound. *Bull Tokyo Dent Coll* 66(3). https://pubmed.ncbi.nlm.nih.gov/40819896/
- Vocal health programs in teachers: systematic review and meta-analysis (2022). *Journal of Voice*. https://pubmed.ncbi.nlm.nih.gov/36494244/
- Vocal hygiene education programs: systematic review (2022). *JSLHR*. https://pubmed.ncbi.nlm.nih.gov/36351245/
- Voice hygiene and practical training for preschool teachers (2025). *Logopedics Phoniatrics Vocology*. https://www.tandfonline.com/doi/full/10.1080/14015439.2025.2560967

*Reviewer leads for this section (not verified; the reviewers cited several from memory):*
- Picheny, Durlach & Braida (1985). Speaking clearly for the hard of hearing I. *JSHR* 28. https://doi.org/10.1044/jshr.2801.96
- Picheny, Durlach & Braida (1989). Speaking clearly for the hard of hearing III. *JSHR* 32 (no URL given)
- Payton, Uchanski & Braida (1994). Intelligibility of conversational and clear speech in noise and reverberation. *JASA* 95(3). https://doi.org/10.1121/1.408545
- Krause & Panagiotopoulos (2019). Speaking clearly for older adults with normal hearing. *JSLHR* 62(10) (no URL given)
- Meunier & Espesser (2011). https://www.sciencedirect.com/science/article/abs/pii/S0095447010000951
- Garnier, Henrich & Dubois (2010). *JSLHR* 53(3) (no URL given)
- Scarborough & Zellou (2013). https://doi.org/10.1121/1.4824120
- Smiljanic & Bradlow (2011). https://doi.org/10.1121/1.3652882
- Lee & Gibbon (2015). https://doi.org/10.1002/14651858.CD009383.pub2

### Phone, short sessions, and technology
- Ngo, Chen & Lai (2024). ASR in ESL/EFL pronunciation: meta-analysis. *ReCALL* 36(1). https://doi.org/10.1017/S0958344023000113
- Mahdi & Al Khateeb (2019). Effectiveness of computer-assisted pronunciation training. *Review of Education* 7(3). https://doi.org/10.1002/rev3.3165
- Secondary extraction of Ngo / Mahdi effect sizes. https://github.com/alipala/language-tutor/blob/main/backend/VOICE_DNA_DEEP_DIVE.md
- Foote & McDonough (2017). Using shadowing with mobile technology. *JSLP* 3(1). https://doi.org/10.1075/jslp.3.1.02foo ; secondary check: https://github.com/Hchen1218/AlexSkills/blob/main/spoken-english/references/evidence.md
- Loewen, Isbell & Sporn (2020). App-based instruction and oral communicative ability. *Foreign Language Annals* 53(2). https://doi.org/10.1111/flan.12454
- Abdelrady et al. (2026). ELSA Speak and EFL oral proficiency. *WJEL*. https://doi.org/10.5430/wjel.v16n4p311 ; extraction: https://github.com/vassiliphilippov/erct-papers/blob/main/_papers/241-abdelrady-harnessing-ai-pronunciation-development-investigating.md
- Sun (2023). ASR and L2 pronunciation/speaking. *Frontiers in Psychology*. https://doi.org/10.3389/fpsyg.2023.1210187
- Kim & Webb (2022). Spaced practice in L2 learning: meta-analysis. *Language Learning*. https://doi.org/10.1111/lang.12479 ; secondary: https://github.com/savvides/scaleu-intelligence/blob/main/research/spaced-repetition.md
- Suzuki & DeKeyser (2017). *Language Teaching Research*. Secondary summary only; see the next-but-one entry (no URL given)
- Sudina & Plonsky (2023). Frequency, duration, and intensity of L2 learning through Duolingo. *JSLS* 6(2). https://doi.org/10.1075/jsls.00021.plo
- Secondary summaries of spacing and persistence studies. https://github.com/M7641/intimate/blob/main/cocoon/apps/parle/docs/pedagogy/04-motivation-persistence-curriculum.md
- Hwang, Coss, Loewen & Tagarelli (2024). Engagement patterns of MALL: a survival analysis. *SSLA* 46(4). https://www.cambridge.org/core/journals/studies-in-second-language-acquisition/article/C1186B329F808A11DDF2C748E77FD1EE ; WoS record: https://github.com/aleixalcacer/hplot-archetypes/blob/main/data/journals/J-STAT-SOFTW%232024%23Showing-670-citations-in-2024.csv
- Sudina, Teimouri & Plonsky (2025). L2 grit and age as predictors of attrition in MALL. https://doi.org/10.1016/j.lindif.2025.102704
- Lally et al. (2010). How are habits formed. *European Journal of Social Psychology* 40(6). https://doi.org/10.1002/ejsp.674
- Zhang, Jepson, Lohfink & Arvaniti (2021). Comparing acoustic analyses of speech data collected remotely. *JASA* 149(6). https://raw.githubusercontent.com/anniecollins/reproducibility_markers_in_covid19_preprints/main/outputs/data/text-arXiv/2103.01059v2.txt ; https://doi.org/10.1121/10.0005132
- Sanker et al. (2021). Effects of recording devices and software on phonetic analysis. *Language* 97(4). https://doi.org/10.1353/lan.2021.0075
- De Decker (2016). Noise and LPC-based vowel formant estimates. *Linguistics Vanguard*. https://doi.org/10.1515/lingvan-2015-0010
- Microsoft: Characteristics and limitations of Pronunciation Assessment. https://github.com/MicrosoftDocs/azure-ai-docs/blob/main/articles/foundry/responsible-ai/speech-service/pronunciation-assessment/characteristics-and-limitations-pronunciation-assessment.md
- Microsoft: Use pronunciation assessment. https://github.com/MicrosoftDocs/azure-ai-docs/blob/main/articles/ai-services/speech-service/how-to-pronunciation-assessment.md
- Microsoft: Speech to text release notes. https://github.com/MicrosoftDocs/azure-ai-docs/blob/main/articles/ai-services/speech-service/includes/release-notes/release-notes-stt.md
- Microsoft: REST API for short audio. https://github.com/MicrosoftDocs/azure-ai-docs/blob/main/articles/ai-services/speech-service/rest-speech-to-text-short.md
- WebKit MediaRecorderPrivateAVFImpl.cpp. https://github.com/WebKit/WebKit/blob/main/Source/WebCore/platform/mediarecorder/MediaRecorderPrivateAVFImpl.cpp
- WebKit UnifiedWebPreferences.yaml. https://github.com/WebKit/WebKit/blob/main/Source/WTF/Scripts/Preferences/UnifiedWebPreferences.yaml
- WebKit AudioContextState.idl. https://github.com/WebKit/WebKit/blob/main/Source/WebCore/Modules/webaudio/AudioContextState.idl
- Chromium media_recorder_handler.cc. https://github.com/chromium/chromium/blob/main/third_party/blink/renderer/modules/mediarecorder/media_recorder_handler.cc
- MDN browser-compat-data: AudioWorklet. https://github.com/mdn/browser-compat-data/blob/main/api/AudioWorklet.json
- MDN browser-compat-data: AudioContext. https://github.com/mdn/browser-compat-data/blob/main/api/AudioContext.json
- MDN browser-compat-data: GPU (WebGPU). https://github.com/mdn/browser-compat-data/blob/main/api/GPU.json
- MDN: MediaDevices.getUserMedia. https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
- Developer note citing WebKit bug 215884 (unverified). https://github.com/leachiM2k/soundboard/blob/main/src/audio/recorder.ts
- OpenAI Whisper README. https://github.com/openai/whisper/blob/main/README.md
- OpenAI Whisper model card. https://github.com/openai/whisper/blob/main/model-card.md
- whisper.cpp. https://github.com/ggml-org/whisper.cpp
- transformers.js. https://github.com/huggingface/transformers.js
- fairseq wav2vec 2.0 README. https://github.com/facebookresearch/fairseq/blob/main/examples/wav2vec/README.md
- Umezawa et al. (2023). Utilizing ASR for English pronunciation practice. ICEED. https://doi.org/10.1109/ICEED59801.2023.10264049
- Microsoft Power Platform: UX strategies for performance. https://github.com/MicrosoftDocs/power-platform/blob/main/power-platform/architecture/key-concepts/performance/ux-strategies.md

*Reviewer leads for this section (not verified):*
- Systematic review of shadowing for L2 pronunciation (2025). https://www.tandfonline.com/doi/full/10.1080/29984475.2025.2546827
- Silverman & Barasch (2023), secondary summary. https://github.com/Selftend/selftend/blob/main/docs/research/2026-07-14-habit-stacking-behavioral-activation.md
- Munro & Derwing (1995). *Language Learning* 45(1) (no URL given)
