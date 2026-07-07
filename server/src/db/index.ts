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

