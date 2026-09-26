# Pronunciation Coach v2 — Data Model

Everything lives on the phone (`docs/adr/002-no-server.md`). There is no server database. The Cloudflare D1 tables built in R1-T04 were removed with the Worker (commit `8fd3a99` holds them).

## 1. localStorage (phone) ✅

| Key | Value | Written by |
|---|---|---|
| `pc.azure` | `{"key": "<Azure key>", "region": "<region>"}`. Checked on read: key 32–128 letters and digits, region `^[a-z0-9]{2,32}$` | "Connect to Azure" screen (R1) |
| `pc.spike.attempts` | Phone test attempts (throwaway, R1-T07) | Phone test page |

Clearing Chrome's site data for the app removes both.

## 2. IndexedDB (phone, through Dexie)

Database `pronunciation-coach`, version 1 (`apps/pwa/src/audio/takeStore.ts`). The first save asks the browser to keep the data (`navigator.storage.persist()`).

### takes ✅ (R2, first fields)
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

### audio ✅ (R2)
| Field | Notes |
|---|---|
| id | auto-increment key |
| kind | `practice` for now |
| createdAt | ISO time |
| wav | 16-bit mono PCM WAV, as an ArrayBuffer |

### Planned stores and fields

Adapted from `docs/redesign/design-options.md` §6.11 for the elocution focus. The fields planned for `takes` and `audio` below come in later epics.

| Store | Key fields | Epic |
|---|---|---|
| `profile` | languages split, weekly target, if-then plan, reminder, French variety | R3 |
| `sessions` | id, start, end, length, language, stages done, counts toward target | R3 |
| `takes` | id, session id, item id, kind (usual / clear / talk round / check), audio id, quality results, applied mic settings, clarity measures, scorer provenance, self-judgement, dispute | R3 |
| `audio` | id, WAV blob, kind (practice / check / anchor / baseline), keep-until, starred | R3 |
| `summaries` | block summaries shown, features changed / not changed, cue chosen | R3 |
| `checks` | id, week, parts done, audio ids, results per era | R5 |
| `eras` | id, start, reason (model update / new phone / drift), SDK version | R4 |
| `backups` | last backup file made: date, size, parts | R5 |

Retention: practice audio 30 days unless starred or disputed; baseline, Check and anchor audio kept for good.
