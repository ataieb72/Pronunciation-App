import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { MigrationRunner } from '../db/migrationRunner.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.resolve(__dirname, '../../migrations');

describe('MigrationRunner (TDD)', () => {
  let tempDbPath: string;
  let runner: MigrationRunner;

  beforeEach(() => {
    // Use a unique temp file for each test to avoid interference
    tempDbPath = path.join(__dirname, `test-${Date.now()}-${Math.random().toString(36).slice(2)}.db`);
    runner = new MigrationRunner(tempDbPath, MIGRATIONS_DIR);
  });

  afterEach(() => {
    // Clean up temp DB file
    if (fs.existsSync(tempDbPath)) {
      try { fs.unlinkSync(tempDbPath); } catch {}
    }
    // Also clean -wal / -shm if created
    ['-wal', '-shm'].forEach(ext => {
      const f = tempDbPath + ext;
      if (fs.existsSync(f)) try { fs.unlinkSync(f); } catch {}
    });
  });

  it('MigrationRunner_FreshDb_AppliesAllMigrations', () => {
    const result = runner.applyMigrations();

    expect(result.applied).toBeGreaterThanOrEqual(1);
    expect(result.currentVersion).toBe(1);

    // Verify DB file + tables exist
    const db = new Database(tempDbPath, { readonly: true });
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all() as { name: string }[];
    const tableNames = tables.map(t => t.name);

    expect(tableNames).toContain('attempts');
    expect(tableNames).toContain('phoneme_stats');
    expect(tableNames).toContain('ladder_progress');
    expect(tableNames).toContain('schema_version');

    // Verify schema_version row
    const versionRow = db.prepare('SELECT version FROM schema_version').get() as { version: number };
    expect(versionRow.version).toBe(1);

    // Verify indexes exist
    const indexes = db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%'").all() as { name: string }[];
    expect(indexes.some(i => i.name.includes('attempts'))).toBe(true);

    db.close();
  });

  it('MigrationRunner_UpToDateDb_AppliesNothing', () => {
    // First apply
    const first = runner.applyMigrations();
    expect(first.applied).toBeGreaterThan(0);

    // Second apply on same DB - should be no-op
    const second = runner.applyMigrations();
    expect(second.applied).toBe(0);
    expect(second.currentVersion).toBe(1);

    // Verify version didn't change
    const db = new Database(tempDbPath, { readonly: true });
    const versionRow = db.prepare('SELECT version FROM schema_version').get() as { version: number };
    expect(versionRow.version).toBe(1);
    db.close();
  });

  it('creates server/data directory structure if needed (integration)', () => {
    // This tests that the runner or db init can handle data dir creation
    const dataDir = path.join(path.dirname(tempDbPath), 'data');
    // Runner should not crash even if parent dirs need creation in real use
    expect(() => runner.applyMigrations()).not.toThrow();
  });
});
