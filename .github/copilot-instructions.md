# Copilot Instructions for Pronunciation Coach v2

## Session Start

1. Run the bootstrap script: `./scripts/session-bootstrap.sh` (or `.\scripts\session-bootstrap.ps1`).
2. Read, in order:
   | Priority | Document | Why |
   |----------|----------|-----|
   | 1 | `CLAUDE.md` | Project rules, stack, commands |
   | 2 | `docs/backlog/README.md` | Status dashboard |
   | 3 | `docs/prd.md` | What to build |
   | 4 | `docs/product-design.md` | Screens and session |
   | 5 | `docs/technical-design.md` | How it works |
   | 6 | `docs/redesign/elocution-focus.md` | The accepted plan and its evidence |
3. Report status: what is in progress, what is ready, any issues.

## Project Overview

A single-user phone app (installable PWA) that trains **articulation and elocution** in French and English, aimed at **mumbling** in everyday talk. Core practice: clear-speech pairs, a machine listener in noise, and short everyday talks, measured against the owner's own baseline. v1 is retired (`docs/adr/001-v2-rewrite.md`).

## Working Style

- Step-by-step and decision-driven: present 2–4 options for choices.
- TDD: Red → Green → Refactor. Follow `.github/instructions/coding-standards.instructions.md`.
- Update docs in the same change as the code.
- One task in progress at a time. Tasks are `R{n}-T{NN}` in `docs/backlog/epics/`.
