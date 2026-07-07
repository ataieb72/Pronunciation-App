# Pronunciation Coach

Single-user web application to improve **pronunciation** (phoneme-level accuracy) and **articulation** (clarity, pacing, rhythm, stress) for French and English.

Record your speech → receive detailed Azure-powered feedback (per-phoneme + prosody) → practice targeted drills and speed ladders → track progress over time.

## Quick Start

```powershell
npm install

# 1. Set up environment (required for server)
copy .env.example .env
# Edit .env and provide your Azure Speech key + region

npm run dev
```

- Client (Vite): http://localhost:5173
- Server (Express): http://localhost:3001

**Important:** The server will exit with a clear error until `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION` are set.

See `docs/prd.md` for full product requirements.

## Available Commands

| Command       | Description                     |
|---------------|---------------------------------|
| `npm run dev` | Start client + server (concurrently) |
| `npm run build` | Build both workspaces         |
| `npm test`    | Run all tests (client + server) |
| `npm run lint` | Lint / type-check             |

See `scripts/session-bootstrap.ps1` for session start.

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
