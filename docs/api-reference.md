# Pronunciation Coach v2 — API Reference

**Base URL:** the Worker's HTTPS origin (the same origin that serves the app). Bodies are JSON. Every API response has `cache-control: no-store`.
**Auth:** endpoints marked "device" need `Authorization: Bearer <deviceToken>`, where the token is the 43-character value from `POST /api/pair`.
**Common errors:** `404 {"error":"not_found"}` for an unknown `/api/*` path · `405 {"error":"method_not_allowed"}` with an `allow` header for a wrong method.

Status legend: ✅ built · ⬚ planned (epic in brackets).

## GET /api/health ✅ (R1)
No auth.
- `200 {"status":"ok","db":true}`
- `503 {"status":"degraded","db":false}` when D1 is unreachable.

## POST /api/pair ✅ (R1)
No auth. Body `{"pairingCode":"..."}` (1–128 characters).
- `201 {"deviceToken":"<43-char base64url>"}` — shown once. The server stores only its SHA-256 hash.
- `400 {"error":"bad_request"}` — body missing, not JSON, or `pairingCode` not a 1–128 character string.
- `401 {"error":"invalid_code"}` — wrong code. Counts as a failed attempt.
- `403 {"error":"device_limit"}` — the maximum number of active devices (`MAX_DEVICES`, default 2) is reached. Revoke a device to free a slot.
- `429 {"error":"rate_limited","retryAfter":<s>}` with a `retry-after` header — 10 failed attempts in the current UTC hour, across all callers. Applies even to the correct code until the hour ends.
- `503 {"error":"pairing_disabled"}` — `PAIRING_CODE` is unset or shorter than 12 characters.

## DELETE /api/pair ✅ (R1)
Device. Revokes the calling device.
- `204` · `401 {"error":"unauthorized"}`.

## POST /api/speech/token ✅ (R1)
Device. No body.
- `200 {"token":"<Azure access token>","region":"<azure region>","expiresAt":"<ISO time, 10 minutes ahead>"}`. Refresh after about 9 minutes.
- `401 {"error":"unauthorized"}` — missing, malformed, unknown or revoked device token.
- `429 {"error":"rate_limited","retryAfter":<s>}` with a `retry-after` header — more than 30 requests in the current UTC hour or 200 in the current UTC day, per device.
- `502 {"error":"azure_unavailable"}` — Azure's token service failed, refused, or did not answer within 5 seconds.
- `503 {"error":"speech_not_configured"}` — `AZURE_SPEECH_KEY` unset, or `AZURE_SPEECH_REGION` unset or not a plain region name.

## Later epics

Backups (`/api/backup/*`, R5) and listener panels (`/api/panels/*`, `/l/:token`, R10) follow `docs/redesign/design-options.md` §6.12.
