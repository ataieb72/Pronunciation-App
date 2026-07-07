import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { app } from '../index.js';
import Database from 'better-sqlite3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('F2-T03 Upload endpoint (TDD)', () => {
  const testAudioBase = path.resolve(__dirname, '../../audio');

  beforeEach(() => {
    // Clean any previous test audio
    if (fs.existsSync(testAudioBase)) {
      fs.rmSync(testAudioBase, { recursive: true, force: true });
    }
    // Ensure duration_ms column for tests (migration may be old in this env)
    try {
      const dbPath = path.resolve(__dirname, '../../data/app.db');
      const db = new Database(dbPath);
      db.exec('ALTER TABLE attempts ADD COLUMN duration_ms INTEGER');
      db.close();
    } catch {}
  });

  afterEach(() => {
    if (fs.existsSync(testAudioBase)) {
      fs.rmSync(testAudioBase, { recursive: true, force: true });
    }
  });

  it('Upload_ValidWav_Creates201AndRow', async () => {
    const fakeWav = Buffer.from('RIFF\x00\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00\x00\x7d\x00\x00\x00\xfa\x00\x00\x02\x00\x10\x00data\x00\x00\x00\x00');
    const res = await request(app)
      .post('/api/attempts')
      .field('language', 'en-US')
      .field('exercise_id', 'en-001')
      .field('duration', '1234')
      .attach('audio', fakeWav, 'test.wav');

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('audio_path');

    // Verify file exists on disk
    const audioPath = res.body.audio_path;
    const full = path.resolve(process.cwd(), audioPath);
    expect(fs.existsSync(full)).toBe(true);
  });

  it('Upload_MissingFields_400', async () => {
    const fakeWav = Buffer.from('fake');
    const res = await request(app)
      .post('/api/attempts')
      .attach('audio', fakeWav, 'test.wav');

    expect(res.status).toBe(400);
  });

  it('GetAudio_UnknownId_404', async () => {
    const res = await request(app).get('/api/attempts/999/audio');
    expect(res.status).toBe(404);
  });
});
