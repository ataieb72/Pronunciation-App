# Pronunciation Coach — Developer Guide

## Prerequisites

- Node.js 20+
- npm
- A modern browser with microphone access (Chrome/Edge recommended for MediaRecorder)
- Azure Speech Services resource (F0 free tier is sufficient)

## Setup

1. Clone or open the project folder.
2. `npm install` (installs both client and server workspaces).
3. `cp .env.example .env` (or copy on Windows) and fill:
   - `AZURE_SPEECH_KEY=...`
   - `AZURE_SPEECH_REGION=...`
4. `npm run dev`

## Available Scripts

| Command          | Description                              |
|------------------|------------------------------------------|
| `npm run dev`    | Run client + server concurrently         |
| `npm run build`  | Build production bundles                 |
| `npm run lint`   | Lint client + server                     |
| `npm test`       | Run all tests (Vitest + server)          |

Run individual workspaces by `cd client` or `cd server` if needed.

## Environment Variables

| Variable                | Required | Notes |
|-------------------------|----------|-------|
| AZURE_SPEECH_KEY        | Yes      | Never commit. Server only. |
| AZURE_SPEECH_REGION     | Yes      | e.g. `eastus` |
| PORT (server)           | No       | Defaults to 3001 |
| CLIENT_PORT             | No       | Vite default 5173 |

## Database

SQLite file lives at `server/data/app.db`.

Migrations live in `server/migrations/`.

See `docs/database-schema.md` and F1 epic.

## Audio Storage

Attempts and cached TTS are stored under `server/audio/`. This folder is gitignored.

## Testing

- Always follow TDD (see `.github/instructions/coding-standards.instructions.md`).
- Client tests use Vitest + React Testing Library.
- Server tests use Vitest or Node's built-in test runner.
- Golden file tests for the WAV encoder are critical.

## Common Workflows

### Adding a new language pack
1. Add folder `client/src/languages/xx-XX/`
2. Provide `phonemes.json` and `exercises.json`
3. Update server voice mapping
4. Update docs + backlog

### Running the app in production-like mode
`npm run build && node server/dist/index.js` (after implementing build)

## Troubleshooting

- **No microphone permission**: Browser will prompt. Use https in production or localhost.
- **Azure errors**: Check region/key. Free tier has limited hours.
- **WAV not accepted**: Verify 16 kHz, 16-bit, mono, PCM.

## Contributing

This is a solo project. Still follow the full workflow:
- Update backlog status
- TDD
- Pre-commit checks
- Update docs

See `.github/copilot-instructions.md`.
