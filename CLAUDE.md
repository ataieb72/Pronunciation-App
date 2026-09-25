# Pronunciation Coach — Project Config

> Master configuration for the Agent Smith dev workflow. The agent reads this each session.

## Project Overview
- **Name:** Pronunciation Coach (v2)
- **Description:** Single-user phone app that trains **articulation and elocution** in French and English, aimed at the owner's main problem: **mumbling** in everyday talk. Core practice: clear-speech pairs (usual → "big and clear"), a machine listener in noise, and short everyday talks, measured against the owner's own baseline. See `docs/prd.md`.
- **Stage:** v2 rewrite in progress (epic R1). v1 is retired (`docs/adr/001-v2-rewrite.md`, docs in `docs/archive/v1/`). The v1 code was deleted on 2026-09-25; commit `20b075a` holds it in git history.
- **Platform:** Installable web app (PWA), phone-first. Target device: Pixel 10 Pro XL, Android Chrome.
- **Stack:** React + TypeScript + Vite (PWA) · one Cloudflare Worker (static assets + small API, D1) · Azure Speech via the browser JS SDK with 10-minute tokens · on-phone DSP in TypeScript · IndexedDB via Dexie
- **Cloud / hosting:** Cloudflare Workers (free plan). External API: Azure Speech (speech-to-text and pronunciation assessment).
- **Auth strategy:** No accounts. The phone pairs once with a code; the Worker stores only a hash of the device token.
- **Team:** Solo (minimal ceremony, but keep docs + backlog current)

## Working Style
- Step-by-step and decision-driven: present 2–4 options and let the developer choose; never decide architecture unilaterally.
- Test-Driven Development (TDD) is the default: Red → Green → Refactor.
- Update documentation in the same change as the code it describes.
- One task in progress at a time (solo cadence).
- Every product claim carries its evidence label from `docs/research/` ([Strong] / [Moderate] / [Weak] / [Mixed] / [None found]). Never present weak evidence as strong.

## Build & Test Commands
From the project root (npm workspaces: `apps/*`, `packages/*`, `tools/*`). Node ≥ 22.18 (the key scan runs TypeScript through Node's type stripping). **Use npm 11** (`packageManager` is pinned; npm 10.9 fails on Vitest 4 peer dependencies). If the system npm is older, prefix commands with `npx -y npm@11`.
- Install deps: `npm install`
- Dev: `npm run dev` (PWA dev server; the Worker's local dev with static assets arrives in R1-T06)
- Type check: `npm run typecheck`
- Lint: `npm run lint` (warnings are errors)
- Tests: `npm test` (Vitest in every workspace; the Worker runs in the real `workerd` runtime)
- Build: `npm run build`
- Key scan: `npm run scan:keys` (after build)
- Secrets: Worker secrets `AZURE_SPEECH_KEY`, `PAIRING_CODE`; variable `AZURE_SPEECH_REGION`. For local dev, put them in `apps/worker/.dev.vars` (git-ignored). See `docs/deployment-guide.md`.

## Documentation Strategy
All project knowledge lives in `docs/`:

| Doc | Purpose |
|-----|---------|
| `docs/prd.md` | Product Requirements (what & why) |
| `docs/product-design.md` | Screens, session, feedback rules |
| `docs/technical-design.md` | Architecture & implementation |
| `docs/api-reference.md` | Worker API |
| `docs/database-schema.md` | D1 tables and IndexedDB stores |
| `docs/deployment-guide.md` | Cloudflare + Azure setup and deploy |
| `docs/backlog/` | Task tracking (dashboard + epics R1–R11) |
| `docs/adr/` | Architecture decision records |
| `docs/research/` | Evidence base (literature review, learner profile, mumbling note) |
| `docs/redesign/` | v2 design options and the owner's accepted revision |
| `docs/validation/` | Validation reports on the owner's voice and phone |
| `docs/archive/v1/` | Retired v1 docs (read-only) |

## Pre-Commit Verification
1. `npm run typecheck` and `npm run build` succeed (zero errors).
2. `npm run lint` clean (warnings treated as errors).
3. `npm test` passes.
4. `npm run scan:keys` passes: `AZURE_SPEECH_KEY` never appears in client code or bundles.
5. For audio or UI changes: check on the Pixel (or Chrome with a fake mic) and note it in the task.
6. Relevant docs updated.

## Backlog Conventions
- Epics: `docs/backlog/epics/R{n}-*.md`; tasks `R{n}-T{NN}`.
- Status icons: `⬚` ready · `🔄` in progress · `✅` done · `🚫` blocked.
- Order: R1 → R2 → R3 (first practice slice) → R4 → … → R11.
- After completing a task, update the epic file and `docs/backlog/README.md`.
