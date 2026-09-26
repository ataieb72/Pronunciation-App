# ADR 001 — Rewrite as v2: an elocution-first phone app

**Date:** 2026-09-25 · **Status:** accepted; the Worker parts are replaced by ADR 002 (2026-09-26: no server, GitHub Pages, key on the phone)

## Context

- A review of v1 (2026-09-24) found its core loop broken with a real Azure key: the SDK call was awaited as a promise, the result reason was compared to a string, prosody was never turned on, and words were read from the wrong JSON path. Several "done" features were not built, and the content packs were small and partly mis-tagged.
- A source-checked literature review (`docs/research/`) found that v1's main methods lack evidence: tongue-twister speed ladders, score-only feedback, and practice scores used as progress.
- The owner is a French speaker who practises on a phone (Pixel 10 Pro XL, Android Chrome) in 5–15 minute sessions. The owner's goal is **articulation and elocution in both languages**, and the main problem is **mumbling** in everyday talk.
- Four independent designs were judged and merged into three options (`docs/redesign/design-options.md`). The owner chose **Option B** and the elocution-first revision (`docs/redesign/elocution-focus.md`).

## Decision

1. Rewrite the app from scratch. Do not reuse v1 code.
2. **Stack:**
   - an installable web app (PWA): React, TypeScript and Vite;
   - one Cloudflare Worker that serves the app and a small API (pairing, short-lived Azure tokens, and later encrypted backups);
   - Azure Speech through its browser JS SDK, signed in with 10-minute tokens, so the key never reaches the phone;
   - speech measures (level, pauses, pitch, rate) computed on the phone in TypeScript;
   - IndexedDB (through Dexie) as the main data store, on the phone.
3. **Workspace:** npm workspaces `apps/pwa`, `apps/worker`, `packages/core`, `packages/dsp`. The project pins **npm 11**, because npm 10.9 fails to resolve Vitest 4's peer dependencies.
4. **v1 code is deleted** (`client/`, `server/`, `render.yaml`, the v1 root package files), with the owner's approval on 2026-09-25. Commit `20b075a` on this branch is the last v1 commit, so git history keeps v1 in full. v1 docs move to `docs/archive/v1/`. `docs/research/` and `docs/redesign/` stay.
5. The backlog restarts as epics **R1–R11**, with tasks named `R{n}-T{NN}`.

## Consequences

- Nothing from v1 carries risk into v2. The WAV encoder idea returns, rewritten test-first, in `packages/dsp`.
- The v1 Render service holds an open text-to-speech proxy. Its Azure key died when Microsoft deleted the owner's expired free-trial subscription (2026-09-11). The owner should still delete the Render service.
- Deployment needs a Cloudflare account and an Azure Speech resource. Secrets live only in Worker secrets and CI secrets.
- The first practice slice needs no cloud scoring. This lowers early risk.
