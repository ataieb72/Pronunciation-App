import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

export interface MigrationResult {
  applied: number;
  currentVersion: number;
}

export class MigrationRunner {
  private readonly dbPath: string;
  private readonly migrationsDir: string;

  constructor(dbPath: string, migrationsDir: string) {
    this.dbPath = dbPath;
    this.migrationsDir = migrationsDir;
  }

  /**
   * Applies pending migrations in order.
   * Idempotent: safe to call multiple times.
   */
  applyMigrations(): MigrationResult {
    // Ensure parent directory exists (e.g. server/data)
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const db = new Database(this.dbPath);
    db.pragma('journal_mode = WAL'); // good for concurrency / durability

    try {
      // 1. Ensure schema_version table
      db.exec(`
        CREATE TABLE IF NOT EXISTS schema_version (
          version INTEGER PRIMARY KEY
        );
      `);

      // 2. Get current version
      const currentRow = db.prepare('SELECT version FROM schema_version').get() as { version: number } | undefined;
      let currentVersion = currentRow ? currentRow.version : 0;

      // 3. Find migration files (001_*.sql, 002_*.sql, ...)
      const files = fs.readdirSync(this.migrationsDir)
        .filter(f => /^\d+_.+\.sql$/.test(f))
        .sort(); // lexical sort works for 001, 002...

      let applied = 0;

      for (const file of files) {
        const match = file.match(/^(\d+)_/);
        if (!match) continue;

        const fileVersion = parseInt(match[1], 10);

        if (fileVersion > currentVersion) {
          const sql = fs.readFileSync(path.join(this.migrationsDir, file), 'utf8');

          // Run the entire migration in a transaction
          const transaction = db.transaction(() => {
            db.exec(sql);

            // Update version
            if (currentVersion === 0) {
              db.prepare('INSERT INTO schema_version (version) VALUES (?)').run(fileVersion);
            } else {
              db.prepare('UPDATE schema_version SET version = ?').run(fileVersion);
            }
          });

          transaction();
          currentVersion = fileVersion;
          applied++;
        }
      }

      return { applied, currentVersion };
    } finally {
      db.close();
    }
  }
}
