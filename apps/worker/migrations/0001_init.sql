-- R1-T04: devices paired with the Worker, and fixed-window rate counters.
-- No learner content is ever stored here.

CREATE TABLE devices (
  id          TEXT PRIMARY KEY,
  token_hash  TEXT NOT NULL UNIQUE,  -- SHA-256 of the device token, lowercase hex
  created_at  TEXT NOT NULL,         -- ISO 8601
  revoked_at  TEXT                   -- NULL while active
);

CREATE TABLE rate_counters (
  scope       TEXT NOT NULL,     -- e.g. 'token:<deviceId>' or 'pair-fail'
  bucket      TEXT NOT NULL,     -- e.g. 'h:2026-09-25T10' or 'd:2026-09-25'
  count       INTEGER NOT NULL,
  expires_at  INTEGER NOT NULL,  -- epoch seconds; expired rows are deleted on write
  PRIMARY KEY (scope, bucket)
);
