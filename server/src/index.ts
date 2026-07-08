import express from 'express';
import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig, MissingEnvError } from './config.js';
import { applyMigrations, checkDbHealth, insertAttempt, getAttemptAudioPath, updateAttemptAndStats } from './db/index.js';
import { assessPronunciation } from './services/assess.js';
import { synthesizeTts, getTtsCacheKey } from './services/tts.js';
import { getAttempt, getWeakPhonemes, getLadderProgress, updateLadderProgress, getDailyScores, getPhonemeHeatmap, getArticulationSeries } from './db/index.js';
import { applyLadderRule } from './services/drills.js';

const app = express();
const PORT = process.env.PORT || 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure audio storage dir (use env for persistent disk in prod)
const AUDIO_BASE = process.env.AUDIO_DIR || path.resolve('audio');
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
    const { language, exercise_id, duration, tempo_tier } = req.body;
    if (!language || !exercise_id) {
      return res.status(400).json({ error: 'language and exercise_id are required' });
    }

    // audio_path relative to project root for storage
    const relPath = path.relative(process.cwd(), req.file.path).replace(/\\/g, '/');
    const durationMs = duration ? parseInt(duration, 10) : null;
    const tier = tempo_tier !== undefined ? parseInt(tempo_tier, 10) : null;

    const id = insertAttempt({
      language,
      exercise_id,
      audio_path: relPath,
      duration_ms: durationMs ?? undefined,
      tempo_tier: tier ?? undefined,
    });

    res.status(201).json({
      id,
      language,
      exercise_id,
      audio_path: relPath,
      duration_ms: durationMs,
      tempo_tier: tier,
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
    let detail: any = {};
    try {
      detail = JSON.parse(assessment.phonemeJson);
      const words = detail.NBest?.[0]?.Words || [];
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

    // F6-T02: apply speed ladder if tempo_tier was set on attempt
    let ladderInfo = null;
    const attemptInfoForLadder = getAttempt(attemptId);
    if (attemptInfoForLadder && attemptInfoForLadder.tempo_tier != null) {
      const currentTier = attemptInfoForLadder.tempo_tier;
      const accuracy = assessment.scores?.accuracy ?? 0;
      const ladderRes = applyLadderRule(currentTier, accuracy);
      if (ladderRes.newTier !== currentTier) {
        updateLadderProgress(
          attemptInfoForLadder.exercise_id,
          language,
          ladderRes.newTier,
          accuracy
        );
      }
      const prog = getLadderProgress(attemptInfoForLadder.exercise_id, language);
      ladderInfo = {
        tier: prog ? prog.tier : ladderRes.newTier,
        advanced: ladderRes.advanced,
      };
    }

    // Enrich for F4-T02
    const attemptInfo = getAttempt(attemptId);
    const attemptDuration = attemptInfo?.duration_ms || null;

    // Reference duration from TTS cache (assume rate 1.0)
    let referenceDuration: number | null = null;
    try {
      const refKey = getTtsCacheKey(referenceText, language, 1.0);
      const cacheDir = path.resolve('tts-cache');
      const indexPath = path.join(cacheDir, 'index.json');
      if (fs.existsSync(indexPath)) {
        const idx = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
        if (idx[refKey]) referenceDuration = idx[refKey].duration;
      }
    } catch {}

    // Extract pauses/stress from detail (word level)
    const words = detail.NBest?.[0]?.Words || [];
    const pauses: any[] = [];
    let prevEnd = 0;
    for (const w of words) {
      const start = w.Offset || 0;
      const dur = w.Duration || 0;
      const end = start + dur;
      if (start > prevEnd + 2000000) { // >0.2s gap in 100ns units
        pauses.push({
          start: prevEnd / 10000, // to ms approx
          end: start / 10000,
          duration: (start - prevEnd) / 10000,
          word_before: words.find((ww: any) => (ww.Offset + (ww.Duration||0)) === prevEnd)?.Word || '',
          word_after: w.Word,
        });
      }
      prevEnd = end;
      // stress if present
      if (w.Stress) {
        // attach to word if needed
      }
    }

    const enriched = {
      scores: assessment.scores,
      phonemeJson: assessment.phonemeJson,
      attempt_duration_ms: attemptDuration,
      reference_duration_ms: referenceDuration,
      pauses,
      words, // include for frontend
      ladder: ladderInfo,
      // stress would be in words if present in Azure result
    };

    res.json(enriched);
  } catch (err: any) {
    res.status(502).json({ error: 'Azure assessment failed: ' + err.message });
  }
});

// F3-T02: TTS with cache
app.get('/api/tts', async (req, res) => {
  const text = req.query.text as string;
  const lang = (req.query.lang as string) || 'en-US';
  const rate = parseFloat((req.query.rate as string) || '1.0');

  if (!text) {
    return res.status(400).json({ error: 'text parameter is required' });
  }

  if (![0.75, 1.0, 1.25].includes(rate)) {
    return res.status(400).json({ error: 'rate must be 0.75, 1.0 or 1.25' });
  }

  try {
    const result = await synthesizeTts({ text, lang, rate });

    if (result.status !== 200 || !result.audio) {
      return res.status(result.status).json({ error: 'TTS failed' });
    }

    res.setHeader('Content-Type', result.contentType);
    res.setHeader('X-Reference-Duration', result.duration.toString());
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day

    res.send(result.audio);
  } catch (err: any) {
    res.status(502).json({ error: 'TTS error: ' + err.message });
  }
});

// F6-T01: Weak phonemes
app.get('/api/weak-phonemes', (req, res) => {
  const lang = (req.query.lang as string) || 'en-US';
  const weak = getWeakPhonemes(lang);
  res.json({ phonemes: weak });
});

// F6-T04: Progress
app.get('/api/progress', (req, res) => {
  const lang = (req.query.lang as string) || 'en-US';
  const daily = getDailyScores(lang);
  const heatmap = getPhonemeHeatmap(lang);
  const articulationIndex = getArticulationSeries(lang);
  // weakest from weak endpoint logic
  const weakest = getWeakPhonemes(lang, 5);
  res.json({ daily, heatmap, articulationIndex, weakest });
});

// Serve React client in production (SPA fallback for client-side routing)
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.resolve(__dirname, '../../client/dist');
  app.use(express.static(clientDist));

  // Must come after all API routes
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Export app for testing (TDD)
export { app };

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[server] Listening on http://localhost:${PORT}`);
    console.log('[server] Ready for client connections.');
  });
}
