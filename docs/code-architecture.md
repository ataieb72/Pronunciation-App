# Pronunciation Coach — Code Architecture

> This document captures the actual code patterns, module structure, and conventions as the implementation evolves. Start with `docs/technical-design.md` for the intended design.

## Current State

**Greenfield** — Implementation of the scaffold (F1) has not started. This file will be populated during/after F1 and subsequent epics.

## Planned High-Level Structure

### Client (`client/src/`)

```
src/
├── App.tsx / main.tsx
├── pages/               # Top-level screens (ExercisePicker, Recorder, Feedback, Progress)
├── components/          # Reusable UI (ScoreBar, PhonemeChip, Waveform, etc.)
├── lib/                 # audio.ts (WAV conversion), api.ts, storage.ts
├── languages/           # fr-FR/ and en-US/ packs (data only)
├── hooks/               # useRecorder, useFeedback, etc.
├── types/               # Shared TypeScript interfaces
└── styles/ or index.css
```

### Server (`server/`)

```
server/
├── src/
│   ├── index.ts         # Express app + middleware
│   ├── routes/          # Thin HTTP handlers
│   ├── services/        # azure.ts, assessment.ts, tts.ts, drills.ts, db.ts
│   ├── db/              # schema, migrations, better-sqlite3 wrapper
│   └── audio/           # wavEncoder.ts (pure), storage.ts
├── migrations/
├── data/                # app.db (gitignored)
└── audio/               # stored attempts + tts cache (gitignored)
```

## Key Patterns to Enforce

- **Client never calls Azure directly.**
- **Pure functions** for scoring rules, drill selection, speed ladder logic (easy to unit test).
- **Migration-based** schema changes.
- **Language packs are data** — no logic mixed in.
- Thin API surface: most complexity lives in services or pure modules.

## Cross-Cutting Concerns

- Error handling: consistent JSON error shape on server.
- Logging: structured, no secrets.
- Validation: at request boundaries.

## Evolution

As code is written:
- Document recurring patterns here (e.g. "How we handle audio conversion", "Drill engine interface").
- Note any deviations from technical-design.md with rationale.
- Add architecture decision records in `docs/adr/`.

## See Also

- `docs/technical-design.md`
- `docs/database-schema.md`
- `docs/api-reference.md`
- `.github/copilot-instructions.md`
