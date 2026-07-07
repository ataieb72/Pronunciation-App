import express from 'express';
import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import { loadConfig, MissingEnvError } from './config.js';
import { applyMigrations, checkDbHealth, insertAttempt, getAttemptAudioPath } from './db/index.js';

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

// Export app for testing (TDD)
export { app };

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[server] Listening on http://localhost:${PORT}`);
    console.log('[server] Ready for client connections.');
  });
}
