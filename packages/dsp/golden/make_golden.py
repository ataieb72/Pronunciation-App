#!/usr/bin/env python3
"""Makes the golden fixtures for packages/dsp.

1. Synthesises short English and French sentences with espeak-ng, in several versions
   (normal, slow, fast, low, high, quiet, noisy, fading), as 16 kHz 16-bit mono WAV files.
2. Measures each file with Praat (through Parselmouth) and writes the reference values
   that the app's own measures must match (see docs/backlog/epics/R2-audio-core.md).

Run from the repository root:  python3 packages/dsp/golden/make_golden.py
Needs: espeak-ng 1.51, and the Python packages in requirements.txt.
"""
from __future__ import annotations

import json
import math
import pathlib
import subprocess
import tempfile
import wave

import numpy as np
import parselmouth
from parselmouth.praat import call

HERE = pathlib.Path(__file__).resolve().parent
WAV_DIR = HERE / "wav"
EXPECTED_DIR = HERE / "expected"

RATE = 16_000
SEED = 20260926
PAD_S = 0.3  # silence before and after the speech, as in a real take
FLOOR_DBFS = -70.0  # a quiet noise floor, so no file is digitally silent
PEAK_DBFS = -3.0  # clean versions are normalised to this peak

TIME_STEP = 0.01
PITCH_FLOOR, PITCH_CEILING = 75.0, 600.0
MIN_PAUSE = 0.25  # pauses are silences of at least 250 ms (R2 definition)
MIN_SOUNDING = 0.1
SILENCE_DB = -25.0  # de Jong & Wempe (2009): threshold below the 99th percentile intensity
MIN_DIP = 2.0  # de Jong & Wempe (2009): dip between peaks, in dB
PRAAT_DB_OFFSET = 20 * math.log10(1 / 2e-5)  # Praat intensity (dB re 20 µPa) minus this = dBFS

SENTENCES = {
    "en1": ("en", "en-us", "I asked her to help me with the world map."),
    "en2": ("en", "en-us", "The ship left the harbour at eight."),
    "en3": ("en", "en-us", "Please text me when you get home."),
    "en4": ("en", "en-us", 'We walked to the old market <break time="500ms"/> and asked for the best bread <break time="800ms"/> before it closed.'),
    "fr1": ("fr", "fr-fr", "Le ministre a pris la table du fond."),
    "fr2": ("fr", "fr-fr", "Je voudrais un café, s'il vous plaît."),
    "fr3": ("fr", "fr-fr", "Il faut prendre le train de huit heures."),
    "fr4": ("fr", "fr-fr", 'Nous avons marché jusqu\'au marché <break time="500ms"/> pour acheter du pain <break time="800ms"/> avant la fermeture.'),
}

# (sentence, variant): variant options
FIXTURES: list[tuple[str, str, dict]] = [
    *[(s, "normal", {}) for s in SENTENCES],
    ("en1", "slow", {"speed": 130}),
    ("fr1", "slow", {"speed": 130}),
    ("en1", "fast", {"speed": 230}),
    ("fr1", "fast", {"speed": 230}),
    ("en2", "low", {"pitch": 20}),
    ("fr2", "low", {"pitch": 20}),
    ("en2", "high", {"pitch": 80}),
    ("fr2", "high", {"pitch": 80}),
    ("en1", "quiet", {"gain_db": -20.0}),
    ("fr1", "quiet", {"gain_db": -20.0}),
    ("en3", "noise20", {"snr_db": 20.0}),
    ("fr3", "noise20", {"snr_db": 20.0}),
    ("en3", "noise10", {"snr_db": 10.0}),
    ("fr3", "noise10", {"snr_db": 10.0}),
    ("en1", "fade", {"fade_db": -12.0}),
    ("fr1", "fade", {"fade_db": -12.0}),
]


def synthesise(voice: str, text: str, speed: int, pitch: int) -> np.ndarray:
    """espeak-ng output, resampled to 16 kHz by Praat (sinc interpolation)."""
    with tempfile.TemporaryDirectory() as tmp:
        raw = pathlib.Path(tmp) / "raw.wav"
        subprocess.run(
            ["espeak-ng", "-m", "-v", voice, "-s", str(speed), "-p", str(pitch), "-w", str(raw), f"<speak>{text}</speak>"],
            check=True,
        )
        sound = parselmouth.Sound(str(raw)).resample(RATE, 50)
        return sound.values[0].astype(np.float64)


def db_to_gain(db: float) -> float:
    return 10 ** (db / 20)


def make_signal(sentence: str, options: dict, rng: np.random.Generator) -> np.ndarray:
    _, voice, text = SENTENCES[sentence]
    speech = synthesise(voice, text, options.get("speed", 175), options.get("pitch", 50))
    speech *= db_to_gain(PEAK_DBFS) / np.max(np.abs(speech))
    pad = np.zeros(int(PAD_S * RATE))
    x = np.concatenate([pad, speech, pad])
    if "fade_db" in options:
        # The level falls linearly in dB over the last 40% of the speech, as if trailing off.
        start = len(pad) + int(0.6 * len(speech))
        ramp_db = np.linspace(0.0, options["fade_db"], len(x) - start)
        x[start:] *= 10 ** (ramp_db / 20)
    x += rng.normal(0.0, db_to_gain(FLOOR_DBFS), len(x))
    if "snr_db" in options:
        # White noise, scaled against the RMS of the speech part only.
        speech_rms = np.sqrt(np.mean(x[len(pad) : len(pad) + len(speech)] ** 2))
        x += rng.normal(0.0, speech_rms / db_to_gain(options["snr_db"]), len(x))
        peak = np.max(np.abs(x))
        if peak > db_to_gain(-1.0):
            x *= db_to_gain(PEAK_DBFS) / peak
    if "gain_db" in options:
        x *= db_to_gain(options["gain_db"])
    return x


def write_wav(path: pathlib.Path, x: np.ndarray) -> None:
    pcm = np.clip(np.round(x * 32768), -32768, 32767).astype("<i2")
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes(pcm.tobytes())


def r(v: float, digits: int = 4) -> float | None:
    return None if v is None or not math.isfinite(v) else round(float(v), digits)


def intervals(textgrid, label: str) -> list[list[float]]:
    out = []
    for i in range(1, call(textgrid, "Get number of intervals", 1) + 1):
        if call(textgrid, "Get label of interval", 1, i) == label:
            out.append([r(call(textgrid, "Get start time of interval", 1, i)), r(call(textgrid, "Get end time of interval", 1, i))])
    return out


def analyse(path: pathlib.Path) -> dict:
    with wave.open(str(path)) as w:
        samples = np.frombuffer(w.readframes(w.getnframes()), dtype="<i2").astype(np.float64) / 32768
    sound = parselmouth.Sound(str(path))

    # Pitch (Praat "To Pitch (ac)", standard settings apart from the 10 ms step and the range).
    pitch = sound.to_pitch_ac(time_step=TIME_STEP, pitch_floor=PITCH_FLOOR, pitch_ceiling=PITCH_CEILING)
    f0 = pitch.selected_array["frequency"]
    voiced = f0[f0 > 0]
    p10, p50, p90 = (np.percentile(voiced, q) for q in (10, 50, 90)) if len(voiced) else (math.nan,) * 3

    # Intensity for silences and nuclei, as in de Jong & Wempe (2009), with a 10 ms step.
    intensity = call(sound, "To Intensity", 50, TIME_STEP, "yes")
    i_values = intensity.values[0]
    i_min, i_max = float(np.min(i_values)), float(np.max(i_values))
    i_99 = call(intensity, "Get quantile", 0, 0, 0.99)
    threshold = max(i_99 + SILENCE_DB, i_min)
    relative_threshold = SILENCE_DB - (i_max - i_99)
    textgrid = call(intensity, "To TextGrid (silences)", relative_threshold, MIN_PAUSE, MIN_SOUNDING, "silent", "sounding")
    sounding = intervals(textgrid, "sounding")
    silent = intervals(textgrid, "silent")
    first_start = sounding[0][0] if sounding else 0.0
    last_end = sounding[-1][1] if sounding else 0.0
    pauses = [s for s in silent if s[0] >= first_start and s[1] <= last_end]

    # Intensity peaks: Praat "To PointProcess (extrema)" on the intensity contour.
    contour = call(call(intensity, "Down to Matrix"), "To Sound (slice)", 1)
    points = call(contour, "To PointProcess (extrema)", "Left", "yes", "no", "Sinc70")
    peaks = []
    for k in range(1, call(points, "Get number of points") + 1):
        t = call(points, "Get time from index", k)
        if call(contour, "Get value at time", t, "cubic") > threshold:
            peaks.append(t)

    # Keep a peak if the intensity dips at least MIN_DIP dB before the next peak (the published
    # algorithm never keeps the last peak), then keep only voiced peaks inside sounding stretches.
    voicing = call(sound, "To Pitch (ac)", 0.02, 30, 4, "no", 0.03, 0.25, 0.01, 0.35, 0.25, 450)

    def voiced_and_sounding(t: float) -> bool:
        interval = call(textgrid, "Get interval at time", 1, t)
        return call(textgrid, "Get label of interval", 1, interval) == "sounding" and not math.isnan(
            call(voicing, "Get value at time", t, "Hertz", "linear")
        )

    nuclei = []
    for a, b in zip(peaks, peaks[1:]):
        dip = call(intensity, "Get minimum", a, b, "none")
        if abs(call(intensity, "Get value at time", a, "cubic") - dip) > MIN_DIP and voiced_and_sounding(a):
            nuclei.append(a)
    phonation = sum(e - s for s, e in sounding)

    # Fade at phrase ends: phrase peaks are the nuclei plus a final peak whose dip to the phrase
    # end is at least MIN_DIP dB. Fade = last peak minus the median of the other peaks (dB).
    fades = []
    for s, e in sounding:
        inside = [t for t in nuclei if s <= t <= e]
        last = [t for t in peaks if s <= t <= e]
        if last and (not inside or last[-1] > inside[-1]):
            t_last = last[-1]
            end_dip = call(intensity, "Get minimum", t_last, e, "none")
            if abs(call(intensity, "Get value at time", t_last, "cubic") - end_dip) > MIN_DIP and voiced_and_sounding(t_last):
                inside.append(t_last)
        if len(inside) >= 3:
            levels = [call(intensity, "Get value at time", t, "cubic") for t in inside]
            fades.append(levels[-1] - float(np.median(levels[:-1])))

    # Speech level: energy mean of the intensity (no mean subtraction) over sounding frames, in dBFS.
    level_intensity = call(sound, "To Intensity", 50, TIME_STEP, "no")
    lv = level_intensity.values[0]
    lt = level_intensity.xs()
    in_speech = np.array([any(s <= t <= e for s, e in sounding) for t in lt])
    speech_level = 10 * math.log10(np.mean(10 ** (lv[in_speech] / 10))) - PRAAT_DB_OFFSET if in_speech.any() else math.nan

    return {
        "sampleRate": RATE,
        "duration": r(len(samples) / RATE),
        "peakDbfs": r(20 * math.log10(np.max(np.abs(samples)))),
        "rmsDbfs": r(10 * math.log10(np.mean(samples**2))),
        "pitch": {
            "timeStep": TIME_STEP,
            "floorHz": PITCH_FLOOR,
            "ceilingHz": PITCH_CEILING,
            "t0": r(pitch.xs()[0]),
            "f0": [r(v, 2) for v in f0],
            "medianHz": r(p50, 2),
            "p10Hz": r(p10, 2),
            "p90Hz": r(p90, 2),
            "rangeSemitones": r(12 * math.log2(p90 / p10), 3) if len(voiced) else None,
        },
        "intensity": {
            "minPitchHz": 50,
            "timeStep": TIME_STEP,
            "t0": r(lt[0]),
            "dbfs": [r(v - PRAAT_DB_OFFSET, 2) for v in lv],
        },
        "silences": {
            "thresholdDb": r(threshold, 3),
            "relativeThresholdDb": r(relative_threshold, 3),
            "minPause": MIN_PAUSE,
            "minSounding": MIN_SOUNDING,
            "sounding": sounding,
            "pauses": pauses,
        },
        "nuclei": {
            "minDipDb": MIN_DIP,
            "times": [r(t) for t in nuclei],
            "count": len(nuclei),
            "phonationTime": r(phonation),
            "articulationRate": r(len(nuclei) / phonation, 3) if phonation > 0 else None,
        },
        "speechLevelDbfs": r(speech_level, 3),
        "fade": {"perPhraseDb": [r(v, 3) for v in fades], "medianDb": r(float(np.median(fades)), 3) if fades else None},
    }


def main() -> None:
    WAV_DIR.mkdir(exist_ok=True)
    EXPECTED_DIR.mkdir(exist_ok=True)
    rng = np.random.default_rng(SEED)
    index = []
    for sentence, variant, options in FIXTURES:
        language, _, text = SENTENCES[sentence]
        name = f"{sentence}-{variant}"
        wav_path = WAV_DIR / f"{name}.wav"
        write_wav(wav_path, make_signal(sentence, options, rng))
        expected = {"file": f"wav/{name}.wav", "language": language, "text": text, "variant": variant, "options": options, **analyse(wav_path)}
        (EXPECTED_DIR / f"{name}.json").write_text(json.dumps(expected, ensure_ascii=False, separators=(",", ":")) + "\n")
        index.append(name)
        print(f"{name:14s} {expected['duration']:5.2f} s  nuclei {expected['nuclei']['count']:2d}  pauses {len(expected['silences']['pauses'])}  "
              f"range {expected['pitch']['rangeSemitones']} st  level {expected['speechLevelDbfs']} dBFS  fade {expected['fade']['medianDb']}")
    (EXPECTED_DIR / "index.json").write_text(json.dumps(index, indent=1) + "\n")


if __name__ == "__main__":
    main()
