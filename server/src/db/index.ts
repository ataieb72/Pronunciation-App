import { MigrationRunner } from './migrationRunner.js';
import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Default location: server/data/app.db relative to this file
const DEFAULT_DB_PATH = path.resolve(__dirname, '../../data/app.db');
const DEFAULT_MIGRATIONS_DIR = path.resolve(__dirname, '../../migrations');

export { MigrationRunner };

/**
 * Apply all pending migrations using the default paths.
 * Called at server startup.
 */
export function applyMigrations(dbPath = DEFAULT_DB_PATH): { applied: number; currentVersion: number } {
  const runner = new MigrationRunner(dbPath, DEFAULT_MIGRATIONS_DIR);
  return runner.applyMigrations();
}

/**
 * Future: export a shared Database instance after migrations.
 * For now migrations are the focus of T02.
 */
export const DB_PATH = DEFAULT_DB_PATH;

/**
 * Simple DB health check used by /api/health.
 * Returns true if we can run a basic query.
 */
export function checkDbHealth(dbPath = DEFAULT_DB_PATH): boolean {
  try {
    const db = new Database(dbPath, { readonly: true });
    db.prepare('SELECT 1').get();
    db.close();
    return true;
  } catch {
    return false;
  }
}

export interface NewAttempt {
  language: string;
  exercise_id: string;
  audio_path: string;
}

export function insertAttempt(attempt: NewAttempt, dbPath = DEFAULT_DB_PATH): number {
  const db = new Database(dbPath);
  const stmt = db.prepare(`
    INSERT INTO attempts (language, exercise_id, audio_path, created_at)
    VALUES (?, ?, ?, datetime('now'))
  `);
  const info = stmt.run(attempt.language, attempt.exercise_id, attempt.audio_path);
  db.close();
  return Number(info.lastInsertRowid);
}

export function getAttemptAudioPath(id: number | string, dbPath = DEFAULT_DB_PATH): string | null {
  const db = new Database(dbPath, { readonly: true });
  const row = db.prepare('SELECT audio_path FROM attempts WHERE id = ?').get(id) as { audio_path?: string } | undefined;
  db.close();
  return row?.audio_path ?? null;
}

export interface PhonemeStat {
  language: string;
  phoneme: string;
  avg_score: number;
  attempt_count: number;
}

export function getPhonemeStat(language: string, phoneme: string, dbPath = DEFAULT_DB_PATH): PhonemeStat | null {
  const db = new Database(dbPath, { readonly: true });
  const row = db.prepare('SELECT * FROM phoneme_stats WHERE language = ? AND phoneme = ?').get(language, phoneme) as PhonemeStat | undefined;
  db.close();
  return row || null;
}

export function updatePhonemeStat(stat: PhonemeStat, dbPath = DEFAULT_DB_PATH) {
  const db = new Database(dbPath);
  db.prepare(`
    INSERT INTO phoneme_stats (language, phoneme, avg_score, attempt_count, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'))
    ON CONFLICT(language, phoneme) DO UPDATE SET
      avg_score = excluded.avg_score,
      attempt_count = excluded.attempt_count,
      updated_at = excluded.updated_at
  `).run(stat.language, stat.phoneme, stat.avg_score, stat.attempt_count);
  db.close();
}

export function updateAttemptScores(
  id: number,
  scores: { overall: number; accuracy: number; fluency: number; prosody?: number },
  phonemeJson: string,
  dbPath = DEFAULT_DB_PATH
) {
  const db = new Database(dbPath);
  db.prepare(`
    UPDATE attempts SET
      overall_score = ?,
      accuracy_score = ?,
      fluency_score = ?,
      prosody_score = ?,
      phoneme_json = ?
    WHERE id = ?
  `).run(scores.overall, scores.accuracy, scores.fluency, scores.prosody ?? null, phonemeJson, id);
  db.close();
}

/**
 * Update attempt scores + phoneme stats in a single transaction.
 */
export function updateAttemptAndStats(
  attemptId: number,
  scores: { overall: number; accuracy: number; fluency: number; prosody?: number },
  phonemeJson: string,
  phonemeUpdates: Array<{ language: string; phoneme: string; score: number }>,
  dbPath = DEFAULT_DB_PATH
) {
  const db = new Database(dbPath);
  const tx = db.transaction(() => {
    // Update attempt
    db.prepare(`
      UPDATE attempts SET
        overall_score = ?,
        accuracy_score = ?,
        fluency_score = ?,
        prosody_score = ?,
        phoneme_json = ?
      WHERE id = ?
    `).run(scores.overall, scores.accuracy, scores.fluency, scores.prosody ?? null, phonemeJson, attemptId);

    // Update each phoneme stat with rolling average
    for (const p of phonemeUpdates) {
      const existing = db.prepare('SELECT avg_score, attempt_count FROM phoneme_stats WHERE language = ? AND phoneme = ?')
        .get(p.language, p.phoneme) as { avg_score: number; attempt_count: number } | undefined;

      const count = existing ? existing.attempt_count : 0;
      const avg = existing ? existing.avg_score : 0;
      const newCount = count + 1;
      const newAvg = (avg * count + p.score) / newCount;

      db.prepare(`
        INSERT INTO phoneme_stats (language, phoneme, avg_score, attempt_count, updated_at)
        VALUES (?, ?, ?, ?, datetime('now'))
        ON CONFLICT(language, phoneme) DO UPDATE SET
          avg_score = excluded.avg_score,
          attempt_count = excluded.attempt_count,
          updated_at = excluded.updated_at
      `).run(p.language, p.phoneme, Math.round(newAvg * 100) / 100, newCount);
    }
  });
  tx();
  db.close();
}


