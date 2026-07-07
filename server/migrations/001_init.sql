-- F1-T02: Initial schema for Pronunciation Coach
-- Creates attempts, phoneme_stats, ladder_progress + schema_version tracking

-- Ensure version table exists (runner may create it too)
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY
);

-- Main attempts log
CREATE TABLE IF NOT EXISTS attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  language TEXT NOT NULL,
  exercise_id TEXT NOT NULL,
  audio_path TEXT NOT NULL,
  duration_ms INTEGER,
  overall_score REAL,
  accuracy_score REAL,
  fluency_score REAL,
  prosody_score REAL,
  phoneme_json TEXT,
  tempo_tier INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes per schema
CREATE INDEX IF NOT EXISTS idx_attempts_language_created ON attempts(language, created_at);
CREATE INDEX IF NOT EXISTS idx_attempts_exercise ON attempts(exercise_id);

-- Per-phoneme rolling stats
CREATE TABLE IF NOT EXISTS phoneme_stats (
  language TEXT NOT NULL,
  phoneme TEXT NOT NULL,
  avg_score REAL NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (language, phoneme)
);

-- Speed ladder progress per exercise
CREATE TABLE IF NOT EXISTS ladder_progress (
  exercise_id TEXT NOT NULL,
  language TEXT NOT NULL,
  tier INTEGER NOT NULL DEFAULT 0,
  best_score_at_tier REAL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (exercise_id, language)
);
