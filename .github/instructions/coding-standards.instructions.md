# Coding Standards — Pronunciation Coach

Follow these standards for every code change.

## Test-Driven Development (MANDATORY)

**Red → Green → Refactor** for every non-trivial change.

Order of testing priority:
1. Pure functions / drill engines / WAV conversion utilities (unit tests with fixtures)
2. Server services and Azure proxy logic (unit + integration with SDK mocked)
3. API endpoints (integration tests)
4. Frontend hooks, audio recording logic, and state (Vitest + Testing Library)
5. UI components (render + user-event interactions)

Write the failing test(s) **first**. Commit only after tests pass and docs are updated.

## Pre-Commit Verification (MANDATORY)

Run from project root before every commit:

```powershell
npm run build && npm run lint && npm test
```

For any UI or recording flow change:
- `npm run dev`
- Manual smoke test in browser (record → score → feedback)

Treat lint warnings as errors.

## Technology Conventions

### Monorepo & Tooling
- Root `package.json` uses npm workspaces for `client` and `server`.
- Shared scripts at root when possible (concurrently for dev).
- TypeScript strict mode everywhere. No `any` except for Azure SDK interop (then `// @ts-expect-error` with comment).

### Backend (server/)
- Thin Express routes → dedicated service modules.
- Use `better-sqlite3` with prepared statements.
- All I/O is async.
- Environment config loaded once at startup; fail fast and loudly if required vars missing.
- Audio files stored under `server/audio/...`; never commit audio.
- Never expose raw DB rows to API — always map to DTOs.

### Frontend (client/)
- Functional components + hooks only.
- Centralized API client in `client/src/lib/api.ts` (or equivalent).
- Audio handling isolated in small, well-tested utilities.
- State: local React state + context where needed. No heavy global store for v1.
- Prefer native browser APIs; polyfills only when justified.

### Audio & Azure Specific
- WAV conversion (sample rate, bit depth, mono, header) must have golden file tests.
- All Azure calls happen on the server. Client never receives the speech key.
- Reference texts and exercise data live in language packs under `client/src/languages/{locale}/`.
- Keep TTS cache logic deterministic (content-addressed).

### Database & Schema
- Use migrations (numbered SQL files + schema_version table).
- Every table has `created_at`, `updated_at`.
- Indexes on foreign keys and common query columns (phoneme, exercise_id, date).

## Git & Branching

- Branch naming: `feature/f1-scaffold`, `fix/wav-conversion`, etc.
- Commits follow Conventional Commits: `feat(server): add health endpoint`, `test(client): golden wav fixtures`.
- One logical change per commit.
- Update the relevant epic file status (`⬚` → `🔄` → `✅`) and backlog dashboard when work progresses.

## Security & Secrets

- `AZURE_SPEECH_KEY` and any secrets **only** in `.env` (server-side).
- `.env`, `server/data/`, `server/audio/` are gitignored.
- No PII logging.
- Validate all user input at API boundary.
- Audio is personal only; no upload to third parties except Azure for the current request.

## Documentation Updates (with the code)

When you change behavior or structure, update in the same PR/commit:

- API surface → `docs/api-reference.md`
- Schema → `docs/database-schema.md`
- New setup or scripts → `docs/developer-guide.md`
- User visible → `docs/user-guide.md`
- Architecture decisions → `docs/adr/` + technical-design
- Backlog tasks → mark in the epic + update `docs/backlog/README.md`

## Style Notes

- Clear, readable code over clever.
- Small focused functions.
- Error messages should be actionable for a solo developer.
- When in doubt, add a test and a short comment explaining "why".

## When to Use Agent Smith Skills

- Before implementing: review backlog epic and technical-design.
- For new major feature: consider spec-agent.
- Hard bug or test gap: use debugging skill.
- After significant work: run review + audit skills.
