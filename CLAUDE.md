# Pronunciation Coach — Project Config

> Master configuration for the Agent Smith dev workflow. The agent reads this each session.

## Project Overview
- **Name:** Pronunciation Coach
- **Description:** Single-user web app to improve pronunciation (phoneme accuracy) AND articulation (clarity, pacing, stress) in French and English. Record → Azure phoneme/prosody scoring → targeted drills → speed ladders → progress tracking. See `docs/prd.md`.
- **Stage:** Greenfield — docs and backlog pre-authored (epics F1–F6); no code yet
- **Platform:** Web (desktop browser first, Chrome/Edge for MediaRecorder reliability)
- **Stack:** React + Vite (client), Node.js + Express (server), SQLite via better-sqlite3
- **Cloud / hosting:** None for v1 — runs locally. External API: Azure Speech (Pronunciation Assessment + Neural TTS)
- **Auth strategy:** No accounts — single user, all data local
- **Team:** Solo (minimal ceremony, but keep docs + backlog current)

## Working Style
- Step-by-step and decision-driven: present 2–4 options and let the developer choose; never decide architecture unilaterally.
- Test-Driven Development (TDD) is the default: Red → Green → Refactor.
- Update documentation in the same change as the code it describes.
- One task in progress at a time (solo cadence).

## Build & Test Commands
From the project root (monorepo: `/client`, `/server`):
- Install deps: `npm install` (root workspace installs both)
- Dev (both): `npm run dev`
- Lint: `npm run lint` (must be clean)
- Tests: `npm test` (Vitest client, node:test or Vitest server)
- Env: copy `.env.example` → `.env`, set `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION`

## Documentation Strategy
All project knowledge lives in `docs/`:

| Doc | Purpose |
|-----|---------|
| `docs/prd.md` | Product Requirements (what & why) |
| `docs/product-design.md` | UX/UI specification |
| `docs/technical-design.md` | Architecture & implementation |
| `docs/api-reference.md` | API documentation |
| `docs/database-schema.md` | Data model |
| `docs/backlog/` | Task tracking (dashboard + epics F1–F6) |
| `docs/research/` | Evidence base for the redesign (literature review + learner profile) |
| `docs/redesign/` | v2 design options and the owner's decision |

## Pre-Commit Verification
1. Build succeeds (zero errors).
2. Lint clean (warnings treated as errors).
3. All tests pass.
4. Manual check for UI changes (run the app in the browser).
5. Relevant docs updated.
6. `AZURE_SPEECH_KEY` never appears in client code or client bundles.

## Backlog Conventions
- Epics: `docs/backlog/epics/F{n}-*.md`; tasks `F{n}-T{NN}`.
- Status icons: `⬚` ready · `🔄` in progress · `✅` done · `🚫` blocked.
- Dependency order: F1 → F2 → F3 → {F4, F5} → F6.
- After completing a task, run the unblock check and update `docs/backlog/README.md`.
