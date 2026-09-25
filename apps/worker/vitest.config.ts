import path from 'node:path';
import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-pool-workers';
import { defineConfig } from 'vitest/config';

const migrations = await readD1Migrations(path.join(import.meta.dirname, 'migrations'));

export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: { configPath: './wrangler.jsonc' },
      miniflare: {
        bindings: {
          TEST_MIGRATIONS: migrations,
          // Test-only values. Real secrets live in Worker secrets (see docs/deployment-guide.md).
          AZURE_SPEECH_KEY: 'test-azure-key-0123456789abcdef0123',
          AZURE_SPEECH_REGION: 'uksouth',
          PAIRING_CODE: 'correct-horse-battery-staple',
        },
      },
    }),
  ],
  test: {
    setupFiles: ['./test/setup.ts'],
  },
});
