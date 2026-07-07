# F1 — Project Scaffold

**Goal:** runnable monorepo skeleton with database and health check. **Depends on:** —

### F1-T01: Create monorepo with client and server workspaces ⬚
**Type:** infra | **Effort:** S(2) | **Depends on:** — | **Priority:** high

#### What to Build
Root package.json with npm workspaces `client` and `server`. `/client`: Vite + React (JS or TS — developer's choice, ask once). `/server`: Express app entry, nodemon dev script. Root `npm run dev` starts both via concurrently. `.env.example` with AZURE_SPEECH_KEY, AZURE_SPEECH_REGION. `.gitignore` (node_modules, .env, server/audio, server/data).

#### Acceptance Criteria
- [ ] `npm install && npm run dev` starts client (5173) and server (3001)
- [ ] `.env.example` present; server fails fast with clear message if vars missing

#### Testing Requirements (TDD — write these FIRST)
- server test: config loader throws named error when env vars absent

#### Documentation Updates
- README quickstart section

### F1-T02: SQLite setup with migrations ⬚
**Type:** backend | **Effort:** M(5) | **Depends on:** F1-T01 | **Priority:** high

#### What to Build
better-sqlite3 wrapper; migration runner applying numbered SQL files from server/migrations/, tracked in schema_version. Migration 001: attempts, phoneme_stats, ladder_progress per docs/database-schema.md.

#### Acceptance Criteria
- [ ] Fresh start creates server/data/app.db with all tables and indexes
- [ ] Re-running startup applies nothing (idempotent)

#### Testing Requirements (TDD — write these FIRST)
- MigrationRunner_FreshDb_AppliesAllMigrations
- MigrationRunner_UpToDateDb_AppliesNothing

#### Documentation Updates
- docs/database-schema.md if schema deviates

### F1-T03: Health endpoint 🚫
**Type:** backend | **Effort:** S(2) | **Depends on:** F1-T02 | **Priority:** medium

#### What to Build
GET /api/health returning { status: "ok", db: true } with a real SELECT 1 against SQLite.

#### Acceptance Criteria
- [ ] 200 with db:true when DB reachable; db:false + 500 otherwise

#### Testing Requirements (TDD — write these FIRST)
- Health_DbUp_Returns200 · Health_DbBroken_Returns500

#### Documentation Updates
- docs/api-reference.md confirmed
