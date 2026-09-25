import { describe, expect, it } from 'vitest';
import {
  PLACEHOLDER_DB_ID,
  checkDeployEnv,
  findDatabaseId,
  injectDatabaseId,
  parseWorkersDevUrl,
  secretsJson,
} from '../src/deploy.ts';

const ID = '4f6c2a8e-1b3d-4e5f-9a7b-0c1d2e3f4a5b';
const GOOD_ENV = {
  CLOUDFLARE_API_TOKEN: 'cf-token',
  CLOUDFLARE_ACCOUNT_ID: '0123456789abcdef0123456789abcdef',
  AZURE_SPEECH_KEY: 'k'.repeat(32),
  AZURE_SPEECH_REGION: 'uksouth',
  PAIRING_CODE: 'four random words here',
};

describe('checkDeployEnv', () => {
  it('Env_AllSet_NoProblems', () => {
    expect(checkDeployEnv(GOOD_ENV)).toEqual([]);
  });

  it('Env_Missing_ListsEachNameWithoutValues', () => {
    const problems = checkDeployEnv({});
    expect(problems).toHaveLength(5);
    for (const name of Object.keys(GOOD_ENV)) {
      expect(problems.some((p) => p.includes(name))).toBe(true);
    }
  });

  it('Env_ShortPairingCode_IsAProblem_AndValueNotPrinted', () => {
    const problems = checkDeployEnv({ ...GOOD_ENV, PAIRING_CODE: 'short-code' });
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain('12');
    expect(problems[0]).not.toContain('short-code');
  });

  it('Env_BadRegion_IsAProblem', () => {
    expect(checkDeployEnv({ ...GOOD_ENV, AZURE_SPEECH_REGION: 'UK South' })).toHaveLength(1);
  });

  it('Env_BadAccountId_IsAProblem', () => {
    expect(checkDeployEnv({ ...GOOD_ENV, CLOUDFLARE_ACCOUNT_ID: 'my-account' })).toHaveLength(1);
  });
});

describe('findDatabaseId', () => {
  const list = [
    { uuid: '11111111-2222-4333-8444-555555555555', name: 'other' },
    { uuid: ID, name: 'pronunciation-coach' },
  ];

  it('Find_ByName_ReturnsUuid', () => {
    expect(findDatabaseId(list, 'pronunciation-coach')).toBe(ID);
  });

  it('Find_Absent_ReturnsNull', () => {
    expect(findDatabaseId(list, 'missing')).toBeNull();
  });

  it.each([[null], [{}], [[{ name: 'pronunciation-coach' }]], [[{ uuid: 'not-a-uuid', name: 'pronunciation-coach' }]]])(
    'Find_MalformedOutput_ReturnsNull (%j)',
    (value) => {
      expect(findDatabaseId(value, 'pronunciation-coach')).toBeNull();
    },
  );
});

describe('injectDatabaseId', () => {
  const config = `{\n  "d1_databases": [{ "binding": "DB", "database_id": "${PLACEHOLDER_DB_ID}" }]\n}`;

  it('Inject_ReplacesPlaceholder', () => {
    const out = injectDatabaseId(config, ID);
    expect(out).toContain(`"database_id": "${ID}"`);
    expect(out).not.toContain(PLACEHOLDER_DB_ID);
  });

  it('Inject_AlreadySet_Unchanged', () => {
    const set = injectDatabaseId(config, ID);
    expect(injectDatabaseId(set, ID)).toBe(set);
  });

  it('Inject_NoPlaceholder_Throws', () => {
    expect(() => injectDatabaseId('{}', ID)).toThrow(/placeholder/);
  });

  it('Inject_InvalidId_Throws', () => {
    expect(() => injectDatabaseId(config, 'x"; evil')).toThrow(/invalid/);
  });
});

describe('secretsJson', () => {
  it('Secrets_ContainsOnlyTheTwoSecrets', () => {
    expect(JSON.parse(secretsJson(GOOD_ENV))).toEqual({
      AZURE_SPEECH_KEY: GOOD_ENV.AZURE_SPEECH_KEY,
      PAIRING_CODE: GOOD_ENV.PAIRING_CODE,
    });
  });
});

describe('parseWorkersDevUrl', () => {
  it('Url_FoundInWranglerOutput', () => {
    const out = 'Uploaded pronunciation-coach (3.1 sec)\nDeployed pronunciation-coach triggers (0.5 sec)\n  https://pronunciation-coach.my-name.workers.dev\nCurrent Version ID: abc';
    expect(parseWorkersDevUrl(out)).toBe('https://pronunciation-coach.my-name.workers.dev');
  });

  it('Url_Absent_ReturnsNull', () => {
    expect(parseWorkersDevUrl('no url here')).toBeNull();
  });
});
