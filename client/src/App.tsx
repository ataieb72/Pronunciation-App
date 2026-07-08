import { useState } from 'react';
import { useRecorder } from './hooks/useRecorder';
import { assessPronunciation, getTtsUrl } from './lib/api';
import { Feedback } from './components/Feedback';
import { parseAssessmentWords } from './lib/parseAssessment';
import { loadPack } from './lib/languagePacks';
import { filterExercises, type ExerciseFilters } from './lib/filterExercises';
import './App.css';

type Language = 'en-US' | 'fr-FR';

function App() {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || 'en-US';
  });

  const pack = loadPack(language);
  const allExercises = pack.exercises;
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentExercise = allExercises[currentIndex] || allExercises[0];

  const [assessment, setAssessment] = useState<any>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [filters, setFilters] = useState<ExerciseFilters>({});
  const filteredExercises = filterExercises(allExercises, filters);
  const [bestScores, setBestScores] = useState<Record<string, number>>({});
  const [currentLadderTier, setCurrentLadderTier] = useState(0);

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
        if (currentExercise.speedLadder) {
          form.append('tempo_tier', currentLadderTier.toString());
        }

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
        if (assessData.scores?.overall) {
          setBestScores(prev => ({
            ...prev,
            [currentExercise.id]: Math.max(prev[currentExercise.id] || 0, Math.round(assessData.scores.overall))
          }));
        }
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
    setShowPicker(false);
    setFilters({});
    reset();
  };

  const nextExercise = () => {
    setCurrentIndex((i) => (i + 1) % allExercises.length);
    setAssessment(null);
    reset();
  };

  const openPicker = () => {
    setShowPicker(true);
    setAssessment(null);
  };

  const selectExercise = (index: number) => {
    setCurrentIndex(index);
    setShowPicker(false);
    setAssessment(null);
    setCurrentLadderTier(0);
    reset();
  };

  const updateFilter = (key: keyof ExerciseFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value || undefined }));
  };

  const playReference = () => {
    const rate = currentExercise.speedLadder ? [0.75, 1.0, 1.25][currentLadderTier] || 1.0 : 1.0;
    const url = getTtsUrl(currentExercise.text, language, rate);
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
        <button onClick={openPicker} className="secondary" style={{marginBottom: '12px'}}>Pick exercise</button>

        {showPicker ? (
          <div className="picker">
            <h3>Exercise Picker</h3>
            <div className="filters">
              <select value={filters.track || ''} onChange={e => updateFilter('track', e.target.value)}>
                <option value="">All tracks</option>
                <option value="phoneme">Phoneme</option>
                <option value="articulation">Articulation</option>
                <option value="prosody">Prosody</option>
              </select>
              <select value={filters.difficulty || ''} onChange={e => updateFilter('difficulty', e.target.value ? Number(e.target.value) : undefined)}>
                <option value="">All difficulties</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
              <select value={filters.focus || ''} onChange={e => updateFilter('focus', e.target.value)}>
                <option value="">All focus</option>
                {Object.keys(pack.phonemes).map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <select value={filters.level || ''} onChange={e => updateFilter('level', e.target.value)}>
                <option value="">All levels</option>
                <option value="word">Word</option>
                <option value="sentence">Sentence</option>
                <option value="passage">Passage</option>
              </select>
              <button onClick={() => setFilters({})}>Clear filters</button>
            </div>
            <ul className="exercise-list">
              {filteredExercises.map((ex) => {
                const origIdx = allExercises.findIndex(e => e.id === ex.id);
                const best = bestScores[ex.id];
                return (
                  <li key={ex.id} onClick={() => selectExercise(origIdx)} style={{cursor: 'pointer', padding: '8px', border: '1px solid #ddd', margin: '4px 0'}}>
                    <strong>{ex.text}</strong>
                    <div style={{fontSize: '0.8em'}}>
                      {ex.track} • diff {ex.difficulty} • {ex.level} {best ? `• best: ${best}` : ''}
                    </div>
                  </li>
                );
              })}
            </ul>
            {filteredExercises.length === 0 && <p>No matching exercises.</p>}
          </div>
        ) : (
          <div className="exercise-card">
            <div className="meta">
              <span className="track">{currentExercise.track.charAt(0).toUpperCase() + currentExercise.track.slice(1)}</span>
              <span className="id">{currentExercise.id}</span>
            </div>
            <p className="exercise-text">{currentExercise.text}</p>
            {currentExercise.speedLadder && (
              <div className="ladder">
                <span>Ladder: </span>
                {['Slow', 'Normal', 'Fast'].map((label, t) => (
                  <button
                    key={t}
                    className={currentLadderTier === t ? 'active' : ''}
                    onClick={() => setCurrentLadderTier(t)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {!showPicker && (
          <>
            <div className="controls">
              <button onClick={async () => {
                try {
                  const res = await fetch(`/api/weak-phonemes?lang=${language}`);
                  const data = await res.json();
                  if (data.phonemes && data.phonemes.length > 0) {
                    const weak = data.phonemes[0].phoneme;
                    const match = allExercises.find(e => e.focus.includes(weak) && e.track === 'phoneme');
                    if (match) {
                      const idx = allExercises.findIndex(e => e.id === match.id);
                      setCurrentIndex(idx);
                      setAssessment(null);
                      reset();
                      console.log('Drilling weak:', weak);
                    }
                  }
                } catch (e) { console.error(e); }
              }} className="secondary">Drill my weak sounds</button>
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
                ladder={assessment.ladder}
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
          </>
        )}
      </main>

      <footer>
        F2-T02 shell • Uses wavEncoder from T01 • TDD in progress
      </footer>
    </div>
  );
}

export default App;
