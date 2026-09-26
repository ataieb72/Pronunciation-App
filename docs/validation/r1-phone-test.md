# R1 phone test — web audio and Azure on the Pixel

**Status:** ⬚ waiting for the phone run · **Device:** Pixel 10 Pro XL, Android, Chrome (installed app)
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
