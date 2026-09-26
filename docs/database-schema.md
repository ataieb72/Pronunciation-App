# Pronunciation Coach v2 — Data Model

Everything lives on the phone (`docs/adr/002-no-server.md`). There is no server database. The Cloudflare D1 tables built in R1-T04 were removed with the Worker (commit `8fd3a99` holds them).

## 1. localStorage (phone) ✅

| Key | Value | Written by |
|---|---|---|
| `pc.azure` | `{"key": "<Azure key>", "region": "<region>"}`. Checked on read: key 32–128 letters and digits, region `^[a-z0-9]{2,32}$` | "Connect to Azure" screen (R1) |
| `pc.spike.attempts` | Phone test attempts (throwaway, R1-T07) | Phone test page |

Clearing Chrome's site data for the app removes both.

## 2. IndexedDB (phone, through Dexie)

Database `pronunciation-coach`, version 2 (`apps/pwa/src/data/database.ts`; version 1 shipped in R2 and upgrades in place). The first save asks the browser to keep the data (`navigator.storage.persist()`).

### takes ✅ (R2; session fields R3)
| Field | Notes |
|---|---|
| id | auto-increment key |
| createdAt | ISO time (indexed) |
| kind | `word` / `sentence` / `talk` (indexed) |
| stopReason | `silence` (stopped by itself after speech), `cap`, `manual` |
| durationS, sampleRate | kept audio: 16 kHz mono |
| startOffsetS | silence dropped before the 300 ms pre-roll |
| speech | speech stretches from the detector, relative to the kept audio |
| noiseFloorDb | the detector's room noise level (dBFS) |
| audioId | row in `audio` |
| mic | label, requested and applied settings, capabilities, context sample rate |
| device | the browser's user agent |
| language, prompt | the prompt's language and text, when there was one (R2-T07) |
| readings | quality verdict and test readings: level, pitch, pauses, syllables, rate, fade (R2-T07) |
| sessionId | the session, for takes recorded in one (indexed; R3) |
| itemId | the sentence id from `packages/core` (for example `fr-p07`, `en-base-01`) (R3) |
| role | `warm-up`, `usual` or `clear` (R3) |

### audio ✅ (R2)
| Field | Notes |
|---|---|
| id | auto-increment key |
| kind | `practice` for now |
| createdAt | ISO time |
| wav | 16-bit mono PCM WAV, as an ArrayBuffer |

### sessions ✅ (R3)
| Field | Notes |
|---|---|
| id | auto-increment key |
| startedAt, endedAt | ISO times (`startedAt` indexed) |
| language | `en` / `fr` |
| kind | `practice` / `baseline` (the first session in each language) |
| length | 5 or 10 minutes; null for the baseline |
| warmUp | `{ itemId, takeId }` for each warm-up sentence |
| blocks | per block: cue (null in the baseline), pairs `{ itemId, usualTakeId, clearTakeId, judgement (usual / clear / same), skipped }`, and the block summary shown |
| counted | the session counts toward the week (its first block, or the whole baseline, was done) |
| nextCue | the cue shown at the Wrap, for next time |

### profile ✅ (R3)
One row, id `owner`: `weeklyTarget` (3–6, default 4) and `lastCue` (default "Open your jaw").

### Planned stores and fields

Adapted from `docs/redesign/design-options.md` §6.11 for the elocution focus. The fields planned for `takes` and `audio` below come in later epics.

| Store | Key fields | Epic |
|---|---|---|
| `profile` | languages split, if-then plan, reminder, French variety (weekly target and last cue: done in R3) | R10 |
| `takes` | talk round and check roles, scorer provenance, dispute (session, item and role: done in R3; self-judgement lives on the session's pair) | R4–R6 |
| `audio` | id, WAV blob, kind (practice / check / anchor / baseline), keep-until, starred | R3 |
| `checks` | id, week, parts done, audio ids, results per era | R5 |
| `eras` | id, start, reason (model update / new phone / drift), SDK version | R4 |
| `backups` | last backup file made: date, size, parts | R5 |

Retention: practice audio 30 days unless starred or disputed; baseline, Check and anchor audio kept for good.
