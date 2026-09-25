import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { scanFiles, type ScannedFile } from './scan.ts';

/** Text files a browser can receive. Images and fonts cannot hold the key in readable form. */
const TEXT_FILE = /\.(?:js|mjs|cjs|html|css|json|map|webmanifest|txt|svg)$/i;

interface Output {
  log: (message: string) => void;
  error: (message: string) => void;
}

function listFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? listFiles(full) : [full];
  });
}

/**
 * Scans built client output for Azure key leaks. Returns an exit code:
 * 0 clean, 1 violations found, 2 usage error (for example, the build did not run).
 * Never prints the key value.
 */
export function run(dirs: readonly string[], env: Readonly<Record<string, string | undefined>>, out: Output): number {
  if (dirs.length === 0) {
    out.error('key-scan: usage: cli.ts <dist-dir> [more dirs]');
    return 2;
  }

  const files: ScannedFile[] = [];
  for (const dir of dirs) {
    if (!existsSync(dir) || !statSync(dir).isDirectory()) {
      out.error(`key-scan: ${dir} not found. Run the build first.`);
      return 2;
    }
    for (const full of listFiles(dir)) {
      if (TEXT_FILE.test(full)) {
        files.push({ path: relative(dir, full).split(sep).join('/'), content: readFileSync(full, 'utf8') });
      }
    }
  }

  const keyValue = env['AZURE_SPEECH_KEY'];
  if (keyValue === undefined || keyValue === '') {
    out.log('key-scan: AZURE_SPEECH_KEY is not set, so the key-value rule is skipped.');
  }

  const violations = scanFiles(files, { keyValue });
  if (violations.length > 0) {
    for (const v of violations) out.error(`key-scan: ${v.rule} in ${v.path}`);
    return 1;
  }
  out.log(`key-scan: ${String(files.length)} files clean.`);
  return 0;
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(run(process.argv.slice(2), process.env, console));
}
