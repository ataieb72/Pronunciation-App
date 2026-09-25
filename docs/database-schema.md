# Pronunciation Coach v2 — Data Model

Two stores: **D1** on Cloudflare (no learner content) and **IndexedDB** on the phone (all learner content).

## 1. D1 (Worker) — migrations in `apps/worker/migrations/`

### devices ⬚ (R1)
| Column | Type | Notes |
|---|---|---|
| id | TEXT PK | random id |
| token_hash | TEXT UNIQUE NOT NULL | SHA-256 of the device token, hex |
| created_at | TEXT NOT NULL | ISO time |
| revoked_at | TEXT | null while active |

### rate_counters ⬚ (R1)
| Column | Type | Notes |
|---|---|---|
| scope | TEXT | for example `token:<deviceId>` or `pair:<ip-hash>` |
| window | TEXT | window key, for example `h:2026-09-25T10` or `d:2026-09-25` |
| count | INTEGER NOT NULL | |
| PRIMARY KEY | (scope, window) | old windows are deleted on write |

## 2. IndexedDB (phone, through Dexie) — planned

Adapted from `docs/redesign/design-options.md` §6.11 for the elocution focus.

| Store | Key fields | Epic |
|---|---|---|
| `profile` | languages split, weekly target, if-then plan, reminder, French variety | R3 |
| `sessions` | id, start, end, length, language, stages done, counts toward target | R3 |
| `takes` | id, session id, item id, kind (usual / clear / talk round / check), audio id, quality results, applied mic settings, clarity measures, scorer provenance, self-judgement, dispute | R3 |
| `audio` | id, WAV blob, kind (practice / check / anchor / baseline), keep-until, starred | R3 |
| `summaries` | block summaries shown, features changed / not changed, cue chosen | R3 |
| `checks` | id, week, parts done, audio ids, results per era | R5 |
| `eras` | id, start, reason (model update / new phone / drift), SDK version | R4 |
| `backups` | last snapshot, date, size, parts | R5 |

Retention: practice audio 30 days unless starred or disputed; baseline, Check and anchor audio kept for good.
