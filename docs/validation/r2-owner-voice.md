# R2 voice check — the app's measures on the owner's voice (V1)

**Status:** ⬚ waits for the first R3 practice takes · **Device:** Pixel 10 Pro XL, installed app · **Task:** R2-T08, now the last task of R3 · **Plan:** `docs/redesign/design-options.md` §6.17 (V1)

The app's measures match Praat on synthetic voices (R2-T01 to T05). This check tests them on a real voice: the owner's. Claude runs Praat on the same recordings and compares. Only numbers go into this file; the recordings stay with the owner and in the chat, never in the public repository (decision D-R2-1).

**Changed (owner's instruction, 2026-09-26):** no separate test session. The owner practises as normal in R3. The check runs on those practice takes.

## What to do

1. After the first few R3 practice sessions, open the recorder screen.
2. Scroll down to **Your last takes** and select **Download all takes (ZIP)**.
3. Attach the ZIP file in the chat. Claude does the rest.

Earbuds (optional): if you practise with earbuds, say which kind. Claude notes the settings the phone applied.

## Pass rules (set before the run)

| Check | Pass rule | Result |
|---|---|---|
| V1 pitch | On each sentence take: the app's pitch within ±1 semitone of Praat on ≥ 90% of frames voiced in both (was: 20 held vowels) | |
| Pitch range | Sentences: range within ±1 semitone of Praat | |
| Syllable nuclei | Sentences: count within ±10% of the Praat reference; articulation rate within ±10% | |
| Pauses | Sentences: pause count exact; edges within ±50 ms | |
| Level and fade | Level within ±0.5 dB; fade within ±1 dB of the Praat reference | |
| Earbuds | Note the applied settings and sample rate with each kind | |

A measure that fails stays hidden from practice until it passes (R8 trust levels). The readings on the record screen are test readings only.
