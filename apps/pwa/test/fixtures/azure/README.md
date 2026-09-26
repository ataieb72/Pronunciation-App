# Azure fixtures

Real Azure Speech results from the R1 phone test, run 2 (2026-09-26, Pixel 10 Pro XL, Chrome 154, Azure Free F0). `docs/validation/r1-phone-test.md` describes the run.

- The owner approved storing them here on 2026-09-26. They hold scores and timings for fixed test sentences only: no audio and no free talk.
- The request `Id` is removed. Nothing else is changed.
- Shape: the SDK's `SpeechServiceResponse_JsonResult`, with scores nested under `PronunciationAssessment`.

| File | Language | Reference sentence | Notes |
|---|---|---|---|
| `r1-en-US-sentence-{1,2,3}.json` | en-US | I asked her to help me with the world map. | IPA phoneme names, 5 "sounded like" candidates, syllables, prosody |
| `r1-fr-FR-sentence-{1,2,3}.json` | fr-FR | Le ministre a pris la table du fond. | Scores only: no phoneme names, no prosody |

Use them in tests of anything that reads Azure results (now `src/azure/summary.ts`; from R4, the `SpeechScorer` and `FixtureScorer`).
