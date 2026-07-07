# Pronunciation Coach

Single-user web application to improve **pronunciation** (phoneme-level accuracy) and **articulation** (clarity, pacing, rhythm, stress) for French and English.

Record your speech → receive detailed Azure-powered feedback (per-phoneme + prosody) → practice targeted drills and speed ladders → track progress over time.

## Quick Start (once scaffolded)

```powershell
npm install
copy .env.example .env   # edit with your Azure Speech key
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:3001

See `docs/prd.md` for full product requirements.

## Project Structure (planned)

```
/client          # React + Vite frontend
/server          # Node + Express backend + SQLite
/docs            # All project documentation + backlog
/scripts         # session-bootstrap.ps1 etc.
```

## Documentation

Start here:
- `docs/backlog/README.md` — current task status
- `docs/prd.md` — what we're building and why
- `docs/technical-design.md` — architecture
- `.github/copilot-instructions.md` — agent workflow rules

## Onboarding Status

✅ Onboarded with Agent Smith workflow (copilot-instructions, coding standards, bootstrap scripts, docs structure).

## License

Personal project.
