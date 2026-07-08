# Pronunciation Coach — Deployment Guide

**Status:** Ready for production on platforms like Render.com.

## Quick Deploy on Render (Recommended)

1. Push your code to GitHub.
2. On [Render.com](https://render.com):
   - New > Blueprint
   - Connect your repo
   - It will detect `render.yaml`
3. Set these **Environment Variables** (in the service settings):
   - `AZURE_SPEECH_KEY` (your key - **secret**)
   - `AZURE_SPEECH_REGION` (e.g. `eastus`)
   - `NODE_ENV=production` (already in blueprint)
4. Attach a **Disk** (for SQLite + audio files):
   - Name: `app-data`
   - Mount Path: `/data`
   - Size: 1 GB (free tier)
5. Deploy.

The `render.yaml` configures:
- Build: `npm install && npm run build`
- Start: server (which now serves the built React client in production)
- Health check on `/api/health`
- Persistent disk mounted at `/data` (we set `DATABASE_PATH=/data/app.db`)

## Environment Variables (Required)

| Variable              | Required | Notes |
|-----------------------|----------|-------|
| AZURE_SPEECH_KEY      | Yes      | Never commit. Server only. |
| AZURE_SPEECH_REGION   | Yes      | e.g. `eastus` |
| NODE_ENV              | Prod     | Set to `production` |
| DATABASE_PATH         | Prod     | e.g. `/data/app.db` when using disk |
| PORT                  | No       | Render sets this |

## How Production Serving Works

- `npm run build` builds client → `client/dist` and server → `server/dist`
- In production (`NODE_ENV=production`), the Express server:
  - Serves static files from `client/dist`
  - Falls back to `index.html` for SPA routes
  - Keeps all `/api/*` routes working

## Data Persistence

- SQLite DB: `server/data/app.db` (use `DATABASE_PATH` env + disk)
- Audio recordings: `server/audio/`
- Use a persistent disk on your platform (Render disk, Railway volume, etc.)

## Azure Free Tier Warning

Free tier = 5 audio hours / month. Monitor usage.

## Alternative Platforms

- **Railway.app**: Easy, good free tier trial.
- **Fly.io**: Great for global, uses Dockerfile.
- **Vercel**: Frontend on Vercel + backend on another service (more complex).

## Local Production Test

```powershell
npm run build
npm start
```

Then visit the port shown by the server.

## Next Steps After Deploy

- Set up a custom domain
- Add logging / error monitoring (Sentry, etc.)
- Consider PostgreSQL if you outgrow SQLite

See also: `docs/technical-design.md` and `render.yaml`.
