# Golden fixtures (Praat reference)

Test recordings and the values Praat measures on them. The app's own measures in `packages/dsp` must match these values within the tolerances in `docs/backlog/epics/R2-audio-core.md`. Tests read them through `test/golden.ts`.

- **Voices:** synthetic only (espeak-ng 1.51), so the public repository holds no real person's voice. The owner's voice is checked separately and never committed (R2-T08).
- **24 files, 16 kHz, 16-bit, mono:** 4 English and 4 French sentences, plus slow, fast, low, high, quiet (−20 dB), noisy (20 and 10 dB SNR, white noise) and fading (−12 dB over the last 40%) versions. Each file has 0.3 s of silence at both ends and a −70 dBFS noise floor.
- **Reference values** (`expected/<name>.json`): peak and RMS; pitch every 10 ms (Praat `To Pitch (ac)`, 75–600 Hz) with median, P10, P90 and range in semitones (NumPy's default linear percentiles); intensity every 10 ms in dBFS; sounding stretches and pauses ≥ 250 ms (`To TextGrid (silences)`); syllable nuclei and articulation rate after de Jong & Wempe (2009); speech level; fade at phrase ends.
- **Changes from the published nuclei script:** a fixed 10 ms step and a 250 ms minimum pause (the script uses an automatic step and 300 ms). Like the script, the last intensity peak is never counted as a nucleus; the fade measure adds it back when it has a 2 dB dip before the phrase ends.

## Regenerate

From the repository root, with espeak-ng 1.51 installed:

```bash
pip install -r packages/dsp/golden/requirements.txt
python3 packages/dsp/golden/make_golden.py
```

The script is deterministic (fixed random seed), so the same tool versions give identical files. Another espeak-ng version changes the audio; then commit the new WAV and JSON files together.
