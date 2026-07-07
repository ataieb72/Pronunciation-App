import { useState } from 'react';
import { useRecorder } from './hooks/useRecorder';
import './App.css';

// Hardcoded exercises for F2-T02 shell (will be replaced by language packs later)
const EXERCISES = {
  'en-US': [
    { id: 'en-001', text: 'The quick brown fox jumps over the lazy dog.', track: 'Phoneme' },
    { id: 'en-002', text: 'She sells seashells by the seashore.', track: 'Articulation' },
    { id: 'en-003', text: 'How much wood would a woodchuck chuck?', track: 'Prosody' },
  ],
  'fr-FR': [
    { id: 'fr-001', text: 'Bonjour, comment allez-vous aujourd\'hui ?', track: 'Phoneme' },
    { id: 'fr-002', text: 'Les chaussettes de l\'archiduchesse.', track: 'Articulation' },
    { id: 'fr-003', text: 'Un chasseur sachant chasser sans son chien.', track: 'Prosody' },
  ],
};

type Language = 'en-US' | 'fr-FR';

function App() {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || 'en-US';
  });

  const exercises = EXERCISES[language];
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentExercise = exercises[currentIndex];

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
    onWavReady: (blob) => {
      console.log('[F2-T02] WAV ready, size:', blob.size, 'bytes');
      // In real F2-T03 this will auto upload
    },
  });

  const toggleLanguage = () => {
    const next: Language = language === 'en-US' ? 'fr-FR' : 'en-US';
    setLanguage(next);
    localStorage.setItem('language', next);
    setCurrentIndex(0);
    reset();
  };

  const nextExercise = () => {
    setCurrentIndex((i) => (i + 1) % exercises.length);
    reset();
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
