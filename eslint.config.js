import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/dev-dist/**',
      '**/.wrangler/**',
      '**/coverage/**',
      '**/worker-configuration.d.ts',
      'docs/**',
    ],
  },
  js.configs.recommended,
  // Type-aware rules catch the v1 bug class, e.g. `await-thenable` and `no-floating-promises`.
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          // Config files run in Node, not in the Worker runtime, so they sit outside the Worker's tsconfig.
          allowDefaultProject: ['apps/worker/vitest.config.ts'],
          defaultProject: 'apps/worker/tsconfig.config.json',
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    ...tseslint.configs.disableTypeChecked,
    languageOptions: {
      ...tseslint.configs.disableTypeChecked.languageOptions,
      globals: globals.node,
    },
  },
  {
    // AudioWorklet modules run in their own global scope.
    files: ['apps/pwa/public/worklets/**/*.js'],
    languageOptions: { globals: globals.audioWorklet },
  },
  {
    files: ['apps/pwa/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    languageOptions: { globals: globals.browser },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['error', { allowConstantExport: true }],
    },
  },
);
