// Bindings and project-wide type hints for the Worker.
declare namespace Cloudflare {
  interface GlobalProps {
    mainModule: typeof import('./index');
  }
  interface Env {
    DB: D1Database;
    /** Secret. Never sent to the phone, never logged. */
    AZURE_SPEECH_KEY?: string | undefined;
    /** Plain Azure region name, e.g. "uksouth". */
    AZURE_SPEECH_REGION?: string | undefined;
    /** Secret. At least 12 characters, or pairing is disabled. */
    PAIRING_CODE?: string | undefined;
    /** Optional. Maximum active paired devices (default 2). */
    MAX_DEVICES?: string | undefined;
    /** Optional. Timeout for Azure's token call in ms (default 5000). */
    AZURE_TOKEN_TIMEOUT_MS?: string | undefined;
  }
}
