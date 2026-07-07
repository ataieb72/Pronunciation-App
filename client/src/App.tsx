import { useState } from 'react';
import { useRecorder } from './hooks/useRecorder';
import { assessPronunciation, getTtsUrl } from './lib/api';
import { Feedback } from './components/Feedback';
import { parseAssessmentWords } from './lib/parseAssessment';
import { loadPack } from './lib/languagePacks';
import './App.css';

type Language = 'en-US' | 'fr-FR';

function App() {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || 'en-US';
  });

  const pack = loadPack(language);
  const exercises = pack.exercises.length > 0 ? pack.exercises : [
    // fallback until F5-T02/T03 content is added
    { id: 'en-001', track: 'phoneme' as const, text: 'The quick brown fox jumps over the lazy dog.', focus: ['θ'], difficulty: 2, level: 'sentence' as const },
    { id: 'en-002', track: 'articulation' as const, text: 'She sells seashells by the seashore.', focus: ['s'], difficulty: 2, level: 'sentence' as const },
    { id: 'en-003', track: 'prosody' as const, text: 'How much wood would a woodchuck chuck?', focus: ['w'], difficulty: 2, level: 'sentence' as const },
  ];
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentExercise = exercises[currentIndex];

  const [assessment, setAssessment] = useState<any>(null);

  const {
    state,
    error,
    start,
    stop,
    audioUrl,
    wavBlob,
    reset,
    isRecording,
  } = useRecorder({
    onWavReady: async (blob, durationMs) => {
      console.log('[F2-T03] WAV ready, size:', blob.size, 'bytes - auto uploading...');
      setAssessment(null);
      try {
        const form = new FormData();
        form.append('language', language);
        form.append('exercise_id', currentExercise.id);
        form.append('audio', blob, 'recording.wav');
        if (durationMs) form.append('duration', durationMs.toString());

        const uploadRes = await fetch('/api/attempts', {
          method: 'POST',
          body: form,
        });
        if (!uploadRes.ok) {
          console.error('[F2-T03] Upload failed', await uploadRes.text());
          return;
        }
        const uploadData = await uploadRes.json();
        console.log('[F2-T03] Upload success, attempt id:', uploadData.id, 'path:', uploadData.audio_path);

        // F3-T03: call assess, store in state
        const assessData = await assessPronunciation(uploadData.id, currentExercise.text, language);
        console.log('[F3] Assessment scores:', assessData);
        setAssessment(assessData);
      } catch (e) {
        console.error('[F2-T03] Upload/assess error', e);
      }
    },
  });

  const toggleLanguage = () => {
    const next: Language = language === 'en-US' ? 'fr-FR' : 'en-US';
    setLanguage(next);
    localStorage.setItem('language', next);
    setCurrentIndex(0);
    setAssessment(null);
    reset();
  };

  const nextExercise = () => {
    setCurrentIndex((i) => (i + 1) % exercises.length);
    setAssessment(null);
    reset();
  };

  const playReference = () => {
    const url = getTtsUrl(currentExercise.text, language, 1.0);
    const audio = new Audio(url);
    audio.play().catch(console.error);
  };

  return (
    <div className="app">
      <header>
        <h1>Pronunciation Coach</h1>
        <button onClick={toggleLanguage} className="lang-toggle">
          {language === 'en-US' ? '🇺🇸 EN' : '🇫🇷 FR'} — Switch
        </button>
      </header>

      <main>
        <div className="exercise-card">
          <div className="meta">
            <span className="track">{currentExercise.track}</span>
            <span className="id">{currentExercise.id}</span>
          </div>
          <p className="exercise-text">{currentExercise.text}</p>
        </div>

        <div className="controls">
          <button onClick={playReference} className="secondary">
            ▶ Play Reference (TTS)
          </button>

          <button
            onClick={isRecording ? stop : start}
            disabled={state === 'processing' || state === 'requesting'}
            className={`record-btn ${isRecording ? 'recording' : ''}`}
          >
            {isRecording ? '⏹ Stop' : '⏺ Record'}
          </button>

          {audioUrl && (
            <button onClick={reset} className="secondary">Reset</button>
          )}

          <button onClick={nextExercise} className="secondary">Next Exercise →</button>
        </div>

        {assessment && (
          <Feedback
            scores={assessment.scores || assessment}
            words={parseAssessmentWords(assessment)}
            attemptDurationMs={assessment.attempt_duration_ms}
            referenceDurationMs={assessment.reference_duration_ms}
            pauses={assessment.pauses}
            onRetry={() => setAssessment(null)}
            onNext={nextExercise}
          />
        )}

        {state === 'recording' && (
          <div className="waveform">
            <canvas id="wave" width="300" height="60" />
            <p>Recording... Speak clearly</p>
          </div>
        )}

        {error && (
          <div className="error">
            {error} — <button onClick={reset}>Try again</button>
          </div>
        )}

        {audioUrl && wavBlob && (
          <div className="playback">
            <p>✅ Recording captured ({Math.round(wavBlob.size / 1024)} KB WAV)</p>
            <audio controls src={audioUrl} />
            <small>Local playback only (F2-T02 shell). Will upload in T03.</small>
          </div>
        )}

        <div className="status">
          State: <strong>{state}</strong>
          {wavBlob && ' • WAV ready for upload'}
        </div>
      </main>

      <footer>
        F2-T02 shell • Uses wavEncoder from T01 • TDD in progress
      </footer>
    </div>
  );
}

export default App;
