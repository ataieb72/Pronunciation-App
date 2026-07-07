import { MigrationRunner } from './migrationRunner.js';
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
