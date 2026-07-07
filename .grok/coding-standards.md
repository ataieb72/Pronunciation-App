# Coding Standards — Pronunciation Coach

See the canonical version at:
`.github/instructions/coding-standards.instructions.md`

## Quick Reference (Stack-Specific)

**Frontend**: React + Vite + TypeScript
- Components in `client/src/components/`
- Pages in `client/src/pages/`
- Language data in `client/src/languages/`
- Audio utils + API client in `client/src/lib/`

**Backend**: Node + Express + better-sqlite3
- Routes thin
- Services for Azure + drill logic
- Migrations in `server/migrations/`

**Core Rules**
- TDD always
- Pre-commit: build + lint + test
- Secrets only server-side
- Update docs + backlog on every change

For full details read `.github/instructions/coding-standards.instructions.md` and `docs/technical-design.md`.
