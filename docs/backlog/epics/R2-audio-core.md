# R2 — Audio core + clarity signals

**Goal:** reliable recording on the Pixel, and the first clarity measures computed on the phone, each checked against Praat. **Depends on:** R1 ✅ (PWA confirmed). **Plan:** `docs/redesign/elocution-focus.md` §5 and §9; `docs/redesign/design-options.md` §6.9 (audio pipeline) and §6.17 (V1). **Ships:** a record-and-replay screen with a quality verdict and first clarity readings.

## Measures (definitions for this epic)

Each measure is computed in `packages/dsp` (pure TypeScript) and compared with a Praat reference (`packages/dsp/golden/`). None is shown as a trend or a hint yet: trust levels come in R8, and baselines in R3.

| Measure | Definition | Praat reference | Target agreement |
|---|---|---|---|
| Speech level | Mean intensity (dB) over speech frames, relative to full scale | `To Intensity` | ±0.5 dB |
| Pitch and pitch range | F0 every 10 ms (autocorrelation, 75–600 Hz); range = 12·log₂(P90/P10) of voiced F0, in semitones | `To Pitch (ac)` | ±1 semitone on ≥ 90% of frames voiced in both (V1); range ±1 semitone |
| Pauses | Silent intervals ≥ 250 ms between stretches of speech: count, total and mean length | `To TextGrid (silences)` | Edges ±50 ms; count exact on clean fixtures |
| Articulation rate | Syllable nuclei ÷ phonation time (pauses excluded), after de Jong & Wempe (2009) | Their nuclei method, run through Parselmouth | Nuclei count ±10%; rate ±10% |
| Fade at phrase ends | Peak level of the last nucleus in a phrase minus the median peak of the other nuclei in that phrase (dB); median over phrases | Same nuclei and intensity | ±1 dB |

Evidence for these measures and their limits: `elocution-focus.md` §5 (level [Moderate]; fade [None found], experiment only; rate [Moderate]; pauses [Moderate]; pitch [Moderate]).

### R2-T01: Praat golden fixtures and WAV decoder ✅
**Type:** tooling/test | **Effort:** M | **Priority:** high

#### What to Build
`packages/dsp/golden/`: a script that makes 26 short test recordings with the espeak-ng speech synthesizer (English and French everyday sentences; slow, fast, high, low, with pauses, quiet, noisy and fading versions) at 16 kHz, and computes Praat reference values for each through Parselmouth: levels, pitch frames, silences, syllable nuclei and articulation rate. The WAV files and the expected JSON are committed. `decodeWav` in `packages/dsp` reads 16-bit PCM WAV files.

#### Acceptance Criteria
- [x] One command regenerates the fixtures; versions are pinned (espeak-ng, Parselmouth, Praat)
- [x] The expected JSON holds every reference value in the table above
- [x] A golden test reads every fixture and matches Praat's peak and RMS within 0.1 dB

#### Testing Requirements (TDD — write these FIRST)
- DecodeWav_Pcm16Mono_RoundTripsEncodeWav · DecodeWav_NotRiffOrNotPcm16_Throws · Golden_AllFixtures_LevelsMatchPraat

**Completed (2026-09-26):** `packages/dsp/golden/make_golden.py` makes 24 recordings (4 EN and 4 FR sentences; slow, fast, low, high, quiet, noisy and fading versions) with espeak-ng 1.51 and measures them with Praat 6.1.38 through Parselmouth 0.4.7. Deterministic: a re-run gives identical files. The reference behaves as expected: 10 nuclei in the 10-syllable "I asked her to help me with the world map"; 2 pauses in each sentence with two breaks and none elsewhere; quiet versions exactly 20 dB lower with the same nuclei; fading versions more negative than their originals (−4.1 vs −0.3 dB in English; −1.4 vs +2.1 dB in French). `decodeWav` added to `packages/dsp` (skips extra chunks; rejects non-PCM16-mono). 30 new tests (DSP: 50). The files take 2.4 MB.

### R2-T02: Voice activity detection and quality gate ✅
**Type:** dsp | **Effort:** M | **Depends on:** R2-T01

#### What to Build
An energy detector that adapts to the room's noise floor and returns speech stretches; a take ends 0.8 s after speech stops. A quality gate returns a verdict with reasons: clipping > 0.1%, peak < −35 dBFS, SNR < 15 dB, speech < 250 ms. The first 150 ms are ignored (the Pixel's mic delivers about 120 ms of silence at start, R1 run 1).

#### Acceptance Criteria
- [x] ~~Speech stretches match Praat's sounding intervals within ±50 ms on clean fixtures~~ → refined: speech onset within ±50 ms of Praat's, and speech never ends more than 50 ms before Praat's end, on all clean fixtures (the detector serves endpointing; pause edges against Praat are R2-T04's check)
- [x] Each gate reason fires on a synthetic signal built to trip it, and no reason fires on clean fixtures

#### Testing Requirements (TDD)
- Vad_SilenceThenTone_FindsOnsetWithin20ms · Vad_NoiseFloorRises_Adapts · Vad_GoldenFixtures_MatchPraatSounding · Gate_Clipped_Retake · Gate_TooQuiet_Retake · Gate_LowSnr_Retake · Gate_TooShort_Retake · Gate_CleanSpeech_Passes · Vad_StartupSilence_Ignored

**Completed (2026-09-26):** `packages/dsp/src/vad.ts`: a streaming detector on 10 ms frames (noise level = lowest 50 ms-smoothed energy over the last 3 s; onset 10 dB above it for 30 ms; end after 150 ms within 6 dB; nothing below −60 dBFS counts; first 150 ms ignored), plus `detectSpeech` for whole takes. Streaming in uneven chunks gives the same result as a whole take. `packages/dsp/src/quality.ts`: `checkQuality` with the four retake reasons and the limits in `QUALITY_LIMITS`. On the golden set: onsets within 24 ms of Praat; ends from 30 ms early to 120 ms late; all clean and 20 dB files pass the gate; both 10 dB files get "noisy". **Finding:** at 10 dB SNR Praat's relative threshold marks the whole file as sounding, so noisy files are compared with their clean originals. **Limit:** below about 10 dB SNR the detector hears no speech, so the verdict is "too-short"; R2-T07's message must cover both ("No speech heard: move closer or find a quieter place"). 38 new tests (DSP: 112).

### R2-T03: Pitch tracker and pitch range ⬚
**Type:** dsp | **Effort:** M | **Depends on:** R2-T01

#### What to Build
An autocorrelation pitch tracker modelled on Praat's (Boersma 1993): 10 ms steps, 75–600 Hz, voicing decision, path smoothing. Pitch range in semitones as defined above.

#### Acceptance Criteria
- [ ] Sine waves 80–500 Hz within ±0.5 semitone
- [ ] Golden fixtures: within ±1 semitone of Praat on ≥ 90% of frames voiced in both; range within ±1 semitone

#### Testing Requirements (TDD)
- Pitch_Sines_WithinHalfSemitone · Pitch_Silence_Unvoiced · Pitch_Noise_MostlyUnvoiced · Pitch_GoldenFixtures_MatchPraat · PitchRange_KnownGlide_Semitones

### R2-T04: Pauses, syllable nuclei and articulation rate ⬚
**Type:** dsp | **Effort:** M | **Depends on:** R2-T02, R2-T03

#### What to Build
Pauses from the detector's silences (≥ 250 ms, inside the take). Syllable nuclei after de Jong & Wempe (2009): intensity peaks above a threshold, a 2 dB dip between peaks, and voicing at the peak. Articulation rate = nuclei ÷ phonation time.

#### Acceptance Criteria
- [ ] Pause edges within ±50 ms of Praat's silences; counts exact on clean fixtures
- [ ] Nuclei counts and rates within ±10% of the Praat reference, in English and French

#### Testing Requirements (TDD)
- Pauses_KnownGaps_FoundWithin50ms · Pauses_ShortGap_Ignored · Nuclei_SyntheticSyllables_CountExact · Nuclei_GoldenFixtures_MatchPraat · Rate_SlowAndFastFixtures_OrderedAndWithin10pct

### R2-T05: Speech level and fade at phrase ends ⬚
**Type:** dsp | **Effort:** S | **Depends on:** R2-T04

#### What to Build
Speech level over speech frames (dBFS). Fade at phrase ends as defined above, per phrase and as a median.

#### Acceptance Criteria
- [ ] Level within ±0.5 dB of Praat; the quiet fixtures read 20 dB lower than their originals (±0.5 dB)
- [ ] The fading fixtures show more fade than their originals; values within ±1 dB of the Praat reference

#### Testing Requirements (TDD)
- Level_GainChange_ShiftsExactly · Level_GoldenFixtures_MatchPraat · Fade_RampedEnding_Negative · Fade_FlatEnding_NearZero · Fade_GoldenFixtures_MatchPraat

### R2-T06: Audio core in the app ⬚
**Type:** frontend/audio | **Effort:** L | **Depends on:** R2-T02

#### What to Build
A recording session: one AudioContext and one mic stream per session; processing requested off and the applied settings stored with each take; AudioWorklet frames to a Web Worker that resamples to 16 kHz, keeps a 300 ms pre-roll and runs the detector; takes stop by themselves at their cap (word 8 s, sentence 15 s, talk 60 s) or 0.8 s after speech; a hidden page discards the take; Wake Lock while recording. Takes (WAV and metadata) go to IndexedDB through Dexie, with `navigator.storage.persist()`.

#### Acceptance Criteria
- [ ] Takes stop at their cap without a tap (R1 run 2: the 60-second round ran to 89 s)
- [ ] A take survives an app restart; storage is marked persistent where the browser allows
- [ ] Hiding the page mid-take discards it with a message

#### Testing Requirements (TDD)
- Session_SpeechThenSilence_StopsAfter800ms · Session_Cap_StopsAt60s · Session_PageHidden_DiscardsTake · Session_PreRoll_Keeps300ms · TakeStore_SaveLoad_RoundTrips (fake IndexedDB) · TakeStore_Metadata_HasAppliedSettings

### R2-T07: Record-and-replay screen ⬚
**Type:** frontend | **Effort:** M | **Depends on:** R2-T03 … R2-T06

#### What to Build
A screen to record a sentence or a short talk, replay it, and see the quality verdict and the first readings (level, pitch range, pauses, rate, fade), labelled "test readings". A distance check: hold the phone a hand-span away; the app compares the warm-up level with your last takes and asks you to adjust if it is far off. The R1 phone-test page is removed when this screen ships.

#### Acceptance Criteria
- [ ] Record, stop (by tap or by itself), replay, verdict and readings work in Chrome with a fake mic and on the Pixel
- [ ] Readings never appear as scores or targets; wording follows `docs/product-design.md` §3

#### Testing Requirements (TDD)
- Recorder_Take_ShowsVerdictAndReadings · Recorder_RetakeReason_Shown · DistanceCheck_FarOff_AsksToAdjust · Replay_PlaysStoredTake

### R2-T08: Owner-voice checks on the Pixel (V1) ⬚
**Type:** validation | **Effort:** S | **Depends on:** R2-T07

#### What to Build
The owner records 20 steady vowels and 10 sentences in each language on the Pixel, and sends the WAVs in the chat. Claude runs the Praat reference on them and compares the app's readings. Results go to `docs/validation/r2-owner-voice.md`; only numbers are committed, never the audio. Also the earbud check carried from R1.

#### Acceptance Criteria
- [ ] V1: pitch within ±1 semitone of Praat on ≥ 90% of voiced frames, on 20 of 20 steady-vowel takes
- [ ] Nuclei and pauses within the golden tolerances on the owner's sentences, or the gap is reported and the measure stays hidden

## Decisions for this epic

- **D-R2-1 (owner, decided 2026-09-26: A):** only synthetic voices (espeak-ng) go into the public repository as test recordings. The owner's voice is checked in the chat, and only numbers are committed.
- **Pitch method:** Praat-style autocorrelation, because Praat is the reference (design-options §6.10).
- **Rate method:** de Jong & Wempe (2009) syllable nuclei, because it needs no transcript and works in both languages (mumbling-note §5 [Moderate]).
