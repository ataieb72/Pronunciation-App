/** Pure helpers for the deploy workflow (.github/workflows/deploy.yml). They never return secret values in messages. */

export const PLACEHOLDER_DB_ID = '00000000-0000-0000-0000-000000000000';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ACCOUNT_ID = /^[0-9a-f]{32}$/i;
const REGION = /^[a-z0-9]{2,32}$/;
const MIN_PAIRING_CODE = 12;

type Env = Readonly<Record<string, string | undefined>>;

function isSet(value: string | undefined): value is string {
  return value !== undefined && value.trim() !== '';
}

/** Returns one plain message per problem. An empty list means the deploy can start. */
export function checkDeployEnv(env: Env): string[] {
  const problems: string[] = [];
  if (!isSet(env['CLOUDFLARE_API_TOKEN'])) problems.push('Secret CLOUDFLARE_API_TOKEN is not set.');
  const account = env['CLOUDFLARE_ACCOUNT_ID'];
  if (!isSet(account)) problems.push('Secret CLOUDFLARE_ACCOUNT_ID is not set.');
  else if (!ACCOUNT_ID.test(account.trim())) problems.push('CLOUDFLARE_ACCOUNT_ID must be the 32-character account ID.');
  if (!isSet(env['AZURE_SPEECH_KEY'])) problems.push('Secret AZURE_SPEECH_KEY is not set.');
  const region = env['AZURE_SPEECH_REGION'];
  if (!isSet(region)) problems.push('Variable AZURE_SPEECH_REGION is not set.');
  else if (!REGION.test(region.trim())) problems.push('AZURE_SPEECH_REGION must be a plain region name, for example uksouth.');
  const code = env['PAIRING_CODE'];
  if (!isSet(code)) problems.push('Secret PAIRING_CODE is not set.');
  else if (code.length < MIN_PAIRING_CODE) problems.push(`PAIRING_CODE must have at least ${String(MIN_PAIRING_CODE)} characters.`);
  return problems;
}

/** Reads `wrangler d1 list --json` output. */
export function findDatabaseId(list: unknown, name: string): string | null {
  if (!Array.isArray(list)) return null;
  for (const entry of list as unknown[]) {
    if (typeof entry !== 'object' || entry === null) continue;
    const { uuid, name: entryName } = entry as Record<string, unknown>;
    if (entryName === name && typeof uuid === 'string' && UUID.test(uuid)) return uuid;
  }
  return null;
}

/** Writes the real D1 id into the Wrangler config text in place of the placeholder. */
export function injectDatabaseId(configText: string, id: string): string {
  if (!UUID.test(id)) throw new Error('invalid D1 database id');
  if (configText.includes(`"database_id": "${id}"`)) return configText;
  const placeholder = `"database_id": "${PLACEHOLDER_DB_ID}"`;
  if (!configText.includes(placeholder)) throw new Error('D1 placeholder id not found in the Wrangler config');
  return configText.replace(placeholder, `"database_id": "${id}"`);
}

/** Body for `wrangler deploy --secrets-file`. */
export function secretsJson(env: Env): string {
  return JSON.stringify({ AZURE_SPEECH_KEY: env['AZURE_SPEECH_KEY'], PAIRING_CODE: env['PAIRING_CODE'] });
}

export function parseWorkersDevUrl(output: string): string | null {
  return /https:\/\/[a-z0-9-]+\.[a-z0-9-]+\.workers\.dev/i.exec(output)?.[0] ?? null;
}
