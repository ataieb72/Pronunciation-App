# Pronunciation Coach v2

A single-user phone app that trains **articulation and elocution** in French and English. It targets **mumbling** in everyday talk.

Each session practises three things, in both languages:
- **Clear-speech pairs:** say a sentence your usual way, then "big and clear" (open the jaw, full vowels, finish every ending). Judge the pair yourself; the app summarises what changed.
- **A machine listener in noise:** the phone mixes café noise into your take, and speech recognition shows what it heard.
- **Short everyday talks:** 45–60 seconds, 2–3 rounds.

Progress comes from Progress Checks every 4 weeks, on habitual speech, compared with your own baseline. The methods and their limits come from a source-checked literature review in `docs/research/`.

## Status

v2 rewrite in progress. Current epic: **R1 — Reset and phone test** (`docs/backlog/`). The v1 code was removed; git history keeps it at commit `20b075a`.

To install it on your phone, follow `docs/deployment-guide.md`.

## Stack

Installable web app (React, TypeScript, Vite) on GitHub Pages, with no server · Azure Speech through the browser SDK, with a key you type once on the phone · speech measures computed on the phone · IndexedDB storage. See `docs/technical-design.md` and `docs/adr/002-no-server.md`.

## Start here

| Doc | What |
|-----|------|
| `CLAUDE.md` | Project rules, commands, pre-commit checks |
| `docs/prd.md` | What and why |
| `docs/product-design.md` | Screens and session |
| `docs/technical-design.md` | Architecture |
| `docs/backlog/README.md` | Task status |
| `docs/redesign/elocution-focus.md` | The accepted plan and its evidence |
| `docs/research/` | The evidence base |

## Health note

The app trains a speaking habit. It cannot tell a habit from a medical cause. If heaviness in the tongue or lips is new, getting worse, or comes with other changes (slurred speech, trouble swallowing, drooling, facial weakness), see a doctor first.

## License

Personal project.
