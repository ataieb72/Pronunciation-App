# Pronunciation Coach — Database Schema (SQLite)

Single file `server/data/app.db`, accessed via better-sqlite3. Migrations = numbered SQL files in `server/migrations/`, applied at startup, tracked in `schema_version`.

## attempts
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK AUTOINCREMENT | |
| language | TEXT | 'fr-FR' or 'en-US' |
| exercise_id | TEXT | matches language-pack exercise id |
| audio_path | TEXT | relative path under server/audio/ |
| overall_score | REAL | Azure PronScore (null until assessed) |
| accuracy_score | REAL | |
| fluency_score | REAL | |
| prosody_score | REAL | nullable (not all locales/modes) |
| phoneme_json | TEXT | full Azure result JSON |
| tempo_tier | INTEGER | null unless speed-ladder attempt (0 slow, 1 normal, 2 fast) |
| created_at | TEXT | ISO 8601 |

Indexes: (language, created_at), (exercise_id).

## phoneme_stats
| Column | Type | Notes |
|--------|------|-------|
| language | TEXT | |
| phoneme | TEXT | Azure phoneme label |
| avg_score | REAL | rolling average |
| attempt_count | INTEGER | |
| updated_at | TEXT | |

PK (language, phoneme). Updated in the same transaction as the attempt row: new_avg = (avg_score*attempt_count + score) / (attempt_count+1).

## ladder_progress
| Column | Type | Notes |
|--------|------|-------|
| exercise_id | TEXT | |
| language | TEXT | |
| tier | INTEGER | current tier 0–2 |
| best_score_at_tier | REAL | |
| updated_at | TEXT | |

PK (exercise_id, language). Tier increments only when an attempt at the current tier scores accuracy ≥85.

## schema_version
Single row: version INTEGER.
