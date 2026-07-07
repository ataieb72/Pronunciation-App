# Copilot Instructions for Pronunciation Coach

## Session Start

At the beginning of every new session:

1. **Run the bootstrap script**:
   ```powershell
   .\scripts\session-bootstrap.ps1
   ```

2. **Read these documents** (in order):
   | Priority | Document | Why |
   |----------|----------|-----|
   | 1 | `docs/backlog/README.md` | Project status dashboard |
   | 2 | `docs/prd.md` | What to build |
   | 3 | `docs/product-design.md` | How it looks |
   | 4 | `docs/technical-design.md` | How it works |
   | 5 | `docs/database-schema.md` | Data model |
   | 6 | `docs/api-reference.md` | API surface |

3. **Report status** — what's in progress, what's ready, any issues.

## Project Overview

Single-user web app to improve **pronunciation** (phoneme accuracy) AND **articulation** (clarity, pacing, stress) in French and English.

Core loop: pick exercise → hear native reference (Azure Neural TTS) → record → Azure Pronunciation Assessment (phoneme + prosody) → targeted drills on weak sounds + speed ladders → progress tracking.

See `docs/prd.md` for full requirements. Greenfield project — full specs and backlog (F1–F6) authored; implementation just starting.

## Working Style

- **Step-by-step**: Walk through each task incrementally
- **Decision-driven**: Present 2-4 options with pros/cons for choices
- **Explain as you go**: Brief "why" for each action
- **Test-Driven Development**: Write tests first (Red), implement (Green), refactor
- Update documentation in the same change as the code it describes.
- One task in progress at a time.

## Build & Test Commands

**Monorepo root** (`/client` + `/server` via npm workspaces):

```powershell
npm install                  # Installs both workspaces
npm run dev                  # Starts client (Vite 5173) + server (Express ~3001) via concurrently
npm run build                # Build client + server
npm run lint                 # Lint both (treat warnings as errors)
npm test                     # Vitest (client) + server tests
```

**Server only** (in `/server`):
```powershell
npm run dev
```

**Client only** (in `/client`):
```powershell
npm run dev
```

**Environment**:
- Copy `.env.example` → `.env`
- Set `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION`
- Server fails fast with clear message if keys missing

## Pre-Commit Verification (MANDATORY)

```powershell
# From project root
npm run build && npm run lint && npm test

# For UI changes: also run the app and manually verify
npm run dev
```

Additional rules:
- `AZURE_SPEECH_KEY` **never** appears in client code or bundles.
- All audio conversion (webm → 16kHz WAV) must be covered by golden-file tests.
- Relevant docs (`prd.md`, `technical-design.md`, `api-reference.md`, `database-schema.md`, backlog epics) updated with the change.

## Documentation Strategy

Update docs **with every commit**:

| Change | Update |
|--------|--------|
| New/changed endpoint | `docs/api-reference.md` |
| New/changed model | `docs/database-schema.md` |
| Setup/tooling changed | `docs/developer-guide.md` |
| User-facing feature | `docs/user-guide.md` |
| Architecture decision | `docs/adr/` + `docs/technical-design.md` |
| Behavior/scope changed | `docs/prd.md`, `docs/product-design.md`, `docs/technical-design.md` |

## Stack Summary

- **Frontend**: React + Vite (TypeScript), plain CSS, Recharts (or similar) for progress
- **Backend**: Node.js + Express, `microsoft-cognitiveservices-speech-sdk`, `better-sqlite3`
- **Database**: SQLite (local `server/data/app.db`)
- **Audio**: MediaRecorder → client-side WAV conversion (16 kHz mono PCM) → server storage + Azure
- **External**: Azure Speech Services (Pronunciation Assessment + Neural TTS). No other cloud for v1.
- **No auth**: Single-user, local data only.

## Workflow & Backlog

Task tracking lives in `docs/backlog/`:
| File | Purpose |
|------|---------|
| `docs/backlog/README.md` | Status dashboard |
| `docs/backlog/epics/F*.md` | One file per feature (F1–F6) |
| `docs/backlog/done/` | Completed epics |

- Epics use `F{n}-T{nn}` task IDs.
- Status: `⬚` ready, `🔄` in progress, `✅` done, `🚫` blocked.
- Build order: F1 → F2 → F3 → {F4, F5} → F6

## Agent / Skill Reference

Use the Agent Smith skills when appropriate:
- `/onboard` or onboard skill — already completed for this project
- spec-agent — for breaking down features
- coding-standards — follow TDD + conventions
- review / audit — before committing
- product-writer — only if PRD needs major revision
- debugging — for hard bugs (after adding tests)

Always prefer these over ad-hoc approaches.
