import express from 'express';
import { loadConfig, MissingEnvError } from './config.js';
import { applyMigrations } from './db/index.js';

const app = express();
const PORT = process.env.PORT || 3001;

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
  res.json({ status: 'ok', service: 'pronunciation-coach-server' });
});

app.listen(PORT, () => {
  console.log(`[server] Listening on http://localhost:${PORT}`);
  console.log('[server] Ready for client connections.');
});
