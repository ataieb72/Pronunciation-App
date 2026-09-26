# R1 phone test — web audio and Azure on the Pixel

**Status:** 🔄 run 1 done (partial, 2026-09-26); waiting for the full run · **Device:** Pixel 10 Pro XL, Android, Chrome (installed app)
**Page:** `https://ataieb72.github.io/Pronunciation-App/#/spike` (link "Run the phone test" on the start page after you save the Azure key)

## What to do (about 25 minutes)

1. Install the app and paste the Azure key (`docs/deployment-guide.md`, Part 3). Open **Run the phone test**.
2. **Microphone:** tap **Check microphone**. Allow the microphone. Note the table values.
3. **Record and score, English:** choose English. For each sentence, tap **Record**, say it clearly, tap **Stop**. Repeat until about 25 attempts **on Wi-Fi**.
4. Turn Wi-Fi off. Do about 25 more attempts **on mobile data**. Mix in 5 French attempts.
5. **60-second round:** do 2 rounds, once on Wi-Fi and once on data.
6. **Earbuds (optional):** set "Microphone in use" to Wired or Bluetooth, and do 3 attempts each. Listen: can you hear the page normally? Does the level change?
7. **Report:** tap **Download report (JSON)**, then **Download last recording (WAV)**. Send both files (or attach them in the chat), with a note on anything odd.

## Pass rules (set before the run)

| Check | Pass rule | Result |
|---|---|---|
| Mic settings | Echo cancellation, noise suppression and auto gain show `false`; sample rate reported | |
| Capture | Every take has a plausible level (peak between −30 and −1 dBFS; clipping under 0.1%) | |
| Scoring works | en-US returns scores, IPA phoneme names and a prosody score; fr-FR returns scores (phoneme names expected missing) | |
| V2 latency | Median ≤ 2.5 s and 90th percentile ≤ 5 s from "Stop" to result, on Wi-Fi and on data | |
| Long take | The 60-second round returns a transcript without error | |
| Earbuds | Note whether Bluetooth switches to its own microphone (lower sample rate or level) | |
| Stability | No page reload, no repeated permission prompt, no stuck "Scoring…" | |

**Decision:** ⬚ PWA confirmed · ⬚ fallback needed (Capacitor Android app). Fill in after the run.

If latency fails, the fallback order is: keep the "still checking" flow and lean on instant phone measures, then a Capacitor app, then a server-side SDK relay (which would bring a server back; ADR 002) (`docs/redesign/design-options.md` §6.9).

## Run 1 — 2026-09-26 (partial)

Chrome 154 on the Pixel, in a Chrome tab (the app was not installed yet), on Wi-Fi. 2 attempts: 1 English sentence and 1 60-second round. The raw report and WAV stay with the owner: the repository is public, and they hold the owner's voice and a transcript.

An earlier try of the 60-second round timed out after 90 s. Cause: the content security policy blocked the Speech SDK's timer worker, so sending stopped after 5 s of audio. It was fixed the same day ([ataieb72/Pronunciation-App#2](https://github.com/ataieb72/Pronunciation-App/pull/2)); both attempts below ran on the fixed version.

| Check | Result | Verdict |
|---|---|---|
| Mic settings | Echo cancellation, noise suppression, auto gain and voice isolation all `false`; 48 kHz, 16-bit, mono; mic "Default" | ✅ pass |
| Capture | Sentence: peak −10.6 dBFS, RMS −28.9 dBFS, no clipping. 60-second round: peak −0.2 dBFS (short plosive peaks at 30, 47 and 52 s; 3 samples above 0.9 of full scale, none clipped). WAV: 16 kHz, 16-bit, 57.9 s, about 40 dB between speech and background, no gaps except 119 ms of silence at the very start while the mic starts up | ✅ sentence · ⚠️ round just above the −1 dBFS rule: hold the phone about 20–30 cm away |
| Scoring works | en-US: accuracy 98, fluency 99, completeness 100, pronunciation 94.6, prosody 87.9; IPA phoneme names; 5 "sounded like" candidates per phoneme; syllables; prosody feedback (breaks, monotone); Azure's SNR 23.7 dB. fr-FR: not run | ✅ en-US · ⬚ fr-FR |
| V2 latency | 1 sentence: 1.65 s from Stop to result, on Wi-Fi | ⬚ needs about 25 on Wi-Fi and 25 on mobile data |
| Long take | 58 s round: transcript returned, 27.3 s after Stop (the SDK sends audio at 2× real time after the first 5 s) | ✅ pass |
| Earbuds | Not run | ⬚ |
| Stability | No reload, no repeated permission prompt; report and WAV downloads work | ✅ so far |

**Notes for later epics (single observations, not evidence):**
- The read sentence scored near the top of Azure's scale (accuracy 98). Careful reading may leave pronunciation scores little room to show mumbling. This fits the plan to measure habitual speech, noise and talk rounds rather than a pronunciation score. Watch it in R3 and R4.
- The mic delivers about 120 ms of pure silence at start. R2's pre-roll and voice detection should skip it.

**Decision:** not yet. Still needed: the full run (about 50 sentences split across Wi-Fi and mobile data, about 5 in French, one 60-second round on mobile data, earbuds if available), run from the installed app.
