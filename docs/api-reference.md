# Pronunciation Coach v2 — API Reference

**Base URL:** the Worker's HTTPS origin (the same origin that serves the app). All bodies are JSON.
**Auth:** endpoints marked "device" need `Authorization: Bearer <deviceToken>`.

Status legend: ✅ built · ⬚ planned (epic in brackets).

## GET /api/health ⬚ (R1)
No auth. → `200 {"status":"ok","db":true}`. If D1 is unreachable → `503 {"status":"degraded","db":false}`.

## POST /api/pair ⬚ (R1)
No auth. Body `{"pairingCode":"..."}`.
- `201 {"deviceToken":"<43-char base64url>"}` — the token is shown once. The server stores only its SHA-256 hash.
- `400` malformed body · `401 {"error":"invalid_code"}` · `403 {"error":"device_limit"}` when the maximum number of active devices is reached · `429 {"error":"rate_limited"}` after too many failed attempts.

## DELETE /api/pair ⬚ (R1)
Device. Revokes the calling device. → `204`.

## POST /api/speech/token ⬚ (R1)
Device. No body.
- `200 {"token":"<Azure access token>","region":"<azure region>","expiresAt":"<ISO time, 10 minutes ahead>"}`
- `401` missing or unknown device token · `429 {"error":"rate_limited","retryAfter":<seconds>}` above 30 an hour or 200 a day · `502 {"error":"azure_unavailable"}` when Azure's token service fails or times out.

## Later epics

Backups (`/api/backup/*`, R5) and listener panels (`/api/panels/*`, `/l/:token`, R10) follow `docs/redesign/design-options.md` §6.12.
