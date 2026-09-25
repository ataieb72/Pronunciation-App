import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { checkDeployEnv, findDatabaseId, injectDatabaseId, parseWorkersDevUrl, secretsJson } from './deploy.ts';

const DB_NAME = 'pronunciation-coach';

function wrangler(args: string[], cwd: string): string {
  return execFileSync('npx', ['wrangler', ...args], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
}

function listDatabases(workerDir: string): unknown {
  return JSON.parse(wrangler(['d1', 'list', '--json'], workerDir)) as unknown;
}

const [command, ...args] = process.argv.slice(2);

switch (command) {
  case 'check-env': {
    const problems = checkDeployEnv(process.env);
    for (const p of problems) console.error(`deploy: ${p}`);
    if (problems.length > 0) {
      console.error('deploy: see docs/deployment-guide.md, Part 3.');
      process.exit(1);
    }
    console.log('deploy: all settings present.');
    break;
  }
  case 'resolve-d1': {
    // Finds the D1 database (creating it on first deploy) and writes its id into the Wrangler config.
    const workerDir = args[0] ?? 'apps/worker';
    const configPath = `${workerDir}/wrangler.jsonc`;
    let id = findDatabaseId(listDatabases(workerDir), DB_NAME);
    if (id === null) {
      console.log(`deploy: creating D1 database ${DB_NAME} (Western Europe).`);
      wrangler(['d1', 'create', DB_NAME, '--location', 'weur'], workerDir);
      id = findDatabaseId(listDatabases(workerDir), DB_NAME);
    }
    if (id === null) throw new Error('D1 database not found after creation');
    writeFileSync(configPath, injectDatabaseId(readFileSync(configPath, 'utf8'), id));
    console.log(`deploy: using D1 database ${id}.`);
    break;
  }
  case 'write-secrets': {
    const path = args[0];
    if (path === undefined) throw new Error('usage: write-secrets <path>');
    writeFileSync(path, secretsJson(process.env), { mode: 0o600 });
    break;
  }
  case 'url': {
    const url = parseWorkersDevUrl(readFileSync(0, 'utf8'));
    if (url === null) process.exit(1);
    console.log(url);
    break;
  }
  default:
    console.error('usage: cli.ts check-env | resolve-d1 [workerDir] | write-secrets <path> | url < wrangler-output');
    process.exit(2);
}
