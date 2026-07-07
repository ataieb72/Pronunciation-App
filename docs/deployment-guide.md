# Pronunciation Coach — Deployment Guide

**Status:** v1 is designed to run locally. Production deployment is a non-goal for the initial version.

## Local "Production" Run

After implementing builds:

```powershell
npm run build
# Serve client statically + run server
```

## Environment

All secrets (Azure key) must remain server-side only.

Recommended for any remote hosting:
- Use environment variables / secrets manager
- Never embed keys in client bundles

## Azure Considerations

- Pronunciation Assessment and Neural TTS are the only external services.
- Monitor usage against F0 free tier (5 audio hours / month).
- Region must match the Speech resource.

## Potential Deployment Targets (future)

- Render / Railway / Fly.io (easy Node + static)
- Vercel (client) + separate server function or container
- Docker (a Dockerfile may be added later)

See `docs/technical-design.md` for architecture constraints (server must proxy Azure calls).

## Data & Privacy

All recordings and scores stay on the user's machine (SQLite + local audio files). No accounts or cloud user data storage planned for v1.

## Monitoring

- Basic health endpoint (`/api/health`)
- Console / file logging for Azure errors
- No external APM required for personal use

## Backup

Simply copy `server/data/app.db` and `server/audio/` folder.

## CI / CD (future)

When ready:
- GitHub Actions for lint + test + build on PRs
- Deploy on merge to main (if self-hosted)

Current focus: local development and completing F1–F6.
