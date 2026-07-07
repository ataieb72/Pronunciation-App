import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { checkDbHealth } from '../db/index.js';
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('Health checks (T03)', () => {
  let tempDb: string;

  beforeEach(() => {
    tempDb = path.join(__dirname, `health-test-${Date.now()}.db`);
  });

  afterEach(() => {
    [tempDb, tempDb + '-wal', tempDb + '-shm'].forEach(f => {
      if (fs.existsSync(f)) try { fs.unlinkSync(f); } catch {}
    });
  });

  it('Health_DbUp_Returns200 logic', () => {
    // Create a valid DB
    const db = new Database(tempDb);
    db.exec('CREATE TABLE t (id INTEGER)');
    db.close();

    const healthy = checkDbHealth(tempDb);
    expect(healthy).toBe(true);
  });

  it('Health_DbBroken_Returns500 logic', () => {
    // Non-existent or corrupt path
    const badPath = path.join(__dirname, 'nonexistent-corrupt.db');
    // Make sure it doesn't exist
    if (fs.existsSync(badPath)) fs.unlinkSync(badPath);

    const healthy = checkDbHealth(badPath);
    expect(healthy).toBe(false);
  });
});
