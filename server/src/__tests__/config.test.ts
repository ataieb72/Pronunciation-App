import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadConfig, MissingEnvError } from '../config.js';

describe('config loader (TDD)', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Clean relevant env for isolation
    delete process.env.AZURE_SPEECH_KEY;
    delete process.env.AZURE_SPEECH_REGION;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('throws named MissingEnvError when AZURE_SPEECH_KEY is absent', () => {
    // This test MUST fail until config.ts implements proper validation + throw
    expect(() => loadConfig()).toThrowError(MissingEnvError);
  });

  it('throws named MissingEnvError when AZURE_SPEECH_REGION is absent', () => {
    process.env.AZURE_SPEECH_KEY = 'dummy-key-for-test';
    expect(() => loadConfig()).toThrowError(MissingEnvError);
  });

  it('returns config object with required fields when env vars present', () => {
    process.env.AZURE_SPEECH_KEY = 'test-key-123';
    process.env.AZURE_SPEECH_REGION = 'eastus';

    const config = loadConfig();
    expect(config).toHaveProperty('azureSpeechKey', 'test-key-123');
    expect(config).toHaveProperty('azureSpeechRegion', 'eastus');
    expect(config).toHaveProperty('port');
  });
});
