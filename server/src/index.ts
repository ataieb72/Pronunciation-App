import express from 'express';
import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import { loadConfig, MissingEnvError } from './config.js';
import { applyMigrations, checkDbHealth, insertAttempt, getAttemptAudioPath, updateAttemptAndStats } from './db/index.js';
import { assessPronunciation } from './services/assess.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure audio storage dir
const AUDIO_BASE = path.resolve('audio');
function ensureAudioDir(date = new Date()) {
  const yyyymm = date.toISOString().slice(0, 7); // yyyy-mm
  const dir = path.join(AUDIO_BASE, yyyymm);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

// Multer setup for WAV uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = ensureAudioDir();
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${unique}.wav`);
  },
});
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'audio/wav' || file.originalname.endsWith('.wav')) {
      cb(null, true);
    } else {
      cb(new Error('Only WAV files allowed'));
    }
  }
});

try {
  const config = loadConfig();
  console.log(`[config] Loaded. Region: ${config.azureSpeechRegion}`);
  console.log(`[config] Azure key present (length=${config.azureSpeechKey.length})`);

  // Apply SQLite migrations (idempotent)
  const migrationResult = applyMigrations();
  console.log(`[db] Migrations applied: ${migrationResult.applied}, version: ${migrationResult.currentVersion}`);
} catch (err) {
  if (err instanceof MissingEnvError) {
    console.error(`\n[ERROR] ${err.message}\n`);
    console.error('Please create a .env file from .env.example in the project root.\n');
    process.exit(1);
  }
  throw err;
}

app.get('/api/health', (_req, res) => {
  const dbOk = checkDbHealth();
  const statusCode = dbOk ? 200 : 500;
  res.status(statusCode).json({
    status: 'ok',
    db: dbOk,
  });
});

// F2-T03: Upload attempt
app.post('/api/attempts', upload.single('audio'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'audio file is required' });
    }
    const { language, exercise_id } = req.body;
    if (!language || !exercise_id) {
      return res.status(400).json({ error: 'language and exercise_id are required' });
    }

    // audio_path relative to project root for storage
    const relPath = path.relative(process.cwd(), req.file.path).replace(/\\/g, '/');

    const id = insertAttempt({
      language,
      exercise_id,
      audio_path: relPath,
    });

    res.status(201).json({
      id,
      language,
      exercise_id,
      audio_path: relPath,
    });
  } catch (err: any) {
    console.error('[upload error]', err);
    res.status(500).json({ error: 'upload failed' });
  }
});

// F2-T03: Serve audio for playback/review
app.get('/api/attempts/:id/audio', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'invalid id' });
  }

  const audioPath = getAttemptAudioPath(id);
  if (!audioPath) {
    return res.status(404).json({ error: 'not found' });
  }

  const fullPath = path.resolve(process.cwd(), audioPath);
  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ error: 'file missing' });
  }

  res.sendFile(fullPath);
});

// F3-T01: Assess pronunciation (called after upload)
app.post('/api/assess', express.json(), async (req, res) => {
  const { attemptId, referenceText, language } = req.body;

  if (!attemptId || !referenceText || !language) {
    return res.status(400).json({ error: 'attemptId, referenceText and language required' });
  }

  const audioPath = getAttemptAudioPath(attemptId);
  if (!audioPath) {
    return res.status(404).json({ error: 'attempt not found' });
  }

  const fullPath = path.resolve(process.cwd(), audioPath);

  try {
    const assessment = await assessPronunciation({
      audioPath: fullPath,
      referenceText,
      language,
    });

    if (assessment.status !== 200 || !assessment.scores || !assessment.phonemeJson) {
      // Keep the attempt but mark as error
      return res.status(assessment.status).json({ error: assessment.error || 'assessment failed' });
    }

    // Extract phoneme scores for stats update (simplified from fixture shape)
    const phonemeUpdates: Array<{ language: string; phoneme: string; score: number }> = [];
    try {
      const parsed = JSON.parse(assessment.phonemeJson);
      const words = parsed.NBest?.[0]?.Words || [];
      for (const word of words) {
        for (const ph of word.Phonemes || []) {
          if (ph.Phoneme && typeof ph.AccuracyScore === 'number') {
            phonemeUpdates.push({
              language,
              phoneme: ph.Phoneme,
              score: ph.AccuracyScore,
            });
          }
        }
      }
    } catch (e) {
      console.warn('Could not parse phonemes for stats');
    }

    // Update in transaction
    updateAttemptAndStats(
      attemptId,
      assessment.scores,
      assessment.phonemeJson,
      phonemeUpdates
    );

    res.json({
      scores: assessment.scores,
      phonemeJson: assessment.phonemeJson,
    });
  } catch (err: any) {
    res.status(502).json({ error: 'Azure assessment failed: ' + err.message });
  }
});

// Export app for testing (TDD)
export { app };

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[server] Listening on http://localhost:${PORT}`);
    console.log('[server] Ready for client connections.');
  });
}
