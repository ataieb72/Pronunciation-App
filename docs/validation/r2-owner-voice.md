# R2 voice check — the app's measures on the owner's voice (V1)

**Status:** ⬚ waiting for the owner's recordings · **Device:** Pixel 10 Pro XL, installed app · **Task:** R2-T08 · **Plan:** `docs/redesign/design-options.md` §6.17 (V1)

The app's measures match Praat on synthetic voices (R2-T01 to T05). This check tests them on a real voice: the owner's. Claude runs Praat on the same recordings and compares. Only numbers go into this file; the recordings stay with the owner and in the chat, never in the public repository (decision D-R2-1).

## What to do (about 15 minutes)

1. Update the app: close it fully, open it again, then pull down to reload once.
2. On the start page, select **Open the recorder**.
3. Sit in a quiet room. Hold the phone one hand-span (about 20 cm) from your mouth.
4. **Held vowels:** choose **A held vowel**. Say "aah" steadily for about 2 seconds, then stop. Do this **20 times**: about 7 at your usual pitch, 7 a little lower, 6 a little higher. Keep each under 3 seconds: the recorder treats a longer steady sound as background noise.
5. **Sentences:** choose **A sentence**. Record **10 in English**, then change **Language** to **Français** and record **10 in French**. Use **Another sentence** to vary them; repeats are fine. Speak your usual way.
6. **Earbuds (optional):** with wired or Bluetooth earbuds, record 3 English sentences. Tell Claude which kind you used.
7. Scroll down to **Your last takes** and select **Download all takes (ZIP)**. Attach the ZIP file in the chat.

If a take says **Please record again**, record it again. Takes that ask for a retake are still in the file; Claude sees the reason.

## Pass rules (set before the run)

| Check | Pass rule | Result |
|---|---|---|
| V1 pitch | On each of the 20 held vowels: the app's pitch within ±1 semitone of Praat on ≥ 90% of frames voiced in both | |
| Pitch range | Sentences: range within ±1 semitone of Praat | |
| Syllable nuclei | Sentences: count within ±10% of the Praat reference; articulation rate within ±10% | |
| Pauses | Sentences: pause count exact; edges within ±50 ms | |
| Level and fade | Level within ±0.5 dB; fade within ±1 dB of the Praat reference | |
| Earbuds | Note the applied settings and sample rate with each kind | |

A measure that fails stays hidden from practice until it passes (R8 trust levels). The readings on the record screen are test readings only.
