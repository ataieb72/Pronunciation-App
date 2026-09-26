# Pronunciation Coach — Project Config

> Master configuration for the Agent Smith dev workflow. The agent reads this each session.

## Project Overview
- **Name:** Pronunciation Coach (v2)
- **Description:** Single-user phone app that trains **articulation and elocution** in French and English, aimed at the owner's main problem: **mumbling** in everyday talk. Core practice: clear-speech pairs (usual → "big and clear"), a machine listener in noise, and short everyday talks, measured against the owner's own baseline. See `docs/prd.md`.
- **Stage:** v2 rewrite in progress (epic R1). v1 is retired (`docs/adr/001-v2-rewrite.md`, docs in `docs/archive/v1/`). The v1 code was deleted on 2026-09-25; commit `20b075a` holds it in git history. The Cloudflare Worker was removed on 2026-09-26 (`docs/adr/002-no-server.md`); commit `8fd3a99` holds it.
- **Platform:** Installable web app (PWA), phone-first. Target device: Pixel 10 Pro XL, Android Chrome.
- **Stack:** React + TypeScript + Vite (PWA) · static hosting on GitHub Pages, no server · Azure Speech via the browser JS SDK, with the key the owner types on the phone · on-phone DSP in TypeScript · IndexedDB via Dexie
- **Cloud / hosting:** GitHub Pages (free; the repository must stay public on the free GitHub plan). External API: Azure Speech on the **Free F0** tier (speech-to-text and pronunciation assessment).
- **Auth strategy:** No accounts and no server. The owner types the Azure key and region once on the phone; they stay in that browser's storage and go only to Azure.
- **Team:** Solo (minimal ceremony, but keep docs + backlog current)

## Working Style
- Step-by-step and decision-driven: present 2–4 options and let the developer choose; never decide architecture unilaterally.
- **Fewer stops (owner's instruction, 2026-09-26):**
  - Claude may open its own pull requests into `master` and merge them once all CI checks pass. The owner can withdraw this at any time.
  - Claude asks the owner only about real choices: what the app does, and big architecture changes. Routine steps go ahead without a question.
  - No separate test sessions on the phone. Claude checks the measures on the owner's voice from a ZIP of normal practice takes.
- Test-Driven Development (TDD) is the default: Red → Green → Refactor.
- Update documentation in the same change as the code it describes.
- One task in progress at a time (solo cadence).
- Every product claim carries its evidence label from `docs/research/` ([Strong] / [Moderate] / [Weak] / [Mixed] / [None found]). Never present weak evidence as strong.

## Build & Test Commands
From the project root (npm workspaces: `apps/*`, `packages/*`, `tools/*`). Node ≥ 22.18 (the key scan runs TypeScript through Node's type stripping). **Use npm 11** (`packageManager` is pinned; npm 10.9 fails on Vitest 4 peer dependencies). If the system npm is older, prefix commands with `npx -y npm@11`.
- Install deps: `npm install`
- Dev: `npm run dev` (PWA dev server). To test a build under the Pages folder: `PC_BASE_PATH=/Pronunciation-App/ npm run build`, then `npx vite preview` in `apps/pwa` with the same variable.
- Type check: `npm run typecheck`
- Lint: `npm run lint` (warnings are errors)
- Tests: `npm test` (Vitest in every workspace)
- Build: `npm run build`
- Key scan: `npm run scan:keys` (after build)
- Praat golden fixtures: `python3 packages/dsp/golden/make_golden.py` (needs espeak-ng 1.51 and `packages/dsp/golden/requirements.txt`; outputs are committed; see its README)
- Secrets: none in the repository, the build or GitHub. The Azure key is typed on the phone at run time. To let the key scan check the value too, set `AZURE_SPEECH_KEY` in your local shell only. See `docs/deployment-guide.md`.
- Deploy: every push to `master` publishes to GitHub Pages (`.github/workflows/pages.yml`). Claude merges its own pull requests once CI is green (see Working Style).

## Documentation Strategy
All project knowledge lives in `docs/`:

| Doc | Purpose |
|-----|---------|
| `docs/prd.md` | Product Requirements (what & why) |
| `docs/product-design.md` | Screens, session, feedback rules |
| `docs/technical-design.md` | Architecture & implementation |
| `docs/database-schema.md` | Phone storage (localStorage and IndexedDB) |
| `docs/deployment-guide.md` | Azure setup, GitHub Pages deploy, phone install |
| `docs/backlog/` | Task tracking (dashboard + epics R1–R11) |
| `docs/adr/` | Architecture decision records |
| `docs/research/` | Evidence base (literature review, learner profile, mumbling note) |
| `docs/redesign/` | v2 design options and the owner's accepted revision |
| `docs/validation/` | Validation reports on the owner's voice and phone |
| `docs/archive/v1/` | Retired v1 docs (read-only) |
| `docs/archive/worker/` | Retired Worker API reference (read-only, ADR 002) |

## Pre-Commit Verification
1. `npm run typecheck` and `npm run build` succeed (zero errors).
2. `npm run lint` clean (warnings treated as errors).
3. `npm test` passes.
4. `npm run scan:keys` passes: the Azure key and the name `AZURE_SPEECH_KEY` never appear in client code or bundles. The key reaches the app only when the owner types it on the phone.
5. For audio or UI changes: check on the Pixel (or Chrome with a fake mic) and note it in the task.
6. Relevant docs updated.

## Backlog Conventions
- Epics: `docs/backlog/epics/R{n}-*.md`; tasks `R{n}-T{NN}`.
- Status icons: `⬚` ready · `🔄` in progress · `✅` done · `🚫` blocked.
- Order: R1 → R2 → R3 (first practice slice) → R4 → … → R11.
- After completing a task, update the epic file and `docs/backlog/README.md`.
