import dotenv from 'dotenv';

// Load .env from server root (or project root)
dotenv.config({ path: '../.env' });
dotenv.config({ path: '.env' }); // fallback if run from server/

export interface AppConfig {
  azureSpeechKey: string;
  azureSpeechRegion: string;
  port: number;
}

export class MissingEnvError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MissingEnvError';
  }
}

export function loadConfig(): AppConfig {
  const azureSpeechKey = process.env.AZURE_SPEECH_KEY;
  const azureSpeechRegion = process.env.AZURE_SPEECH_REGION;

  // TODO (TDD): Currently this does NOT throw the named error properly in all cases.
  // The tests in config.test.ts expect MissingEnvError to be thrown.
  // Implement validation below.

  if (!azureSpeechKey) {
    throw new MissingEnvError('AZURE_SPEECH_KEY is required but was not provided. Copy .env.example to .env and set the value.');
  }
  if (!azureSpeechRegion) {
    throw new MissingEnvError('AZURE_SPEECH_REGION is required but was not provided. Copy .env.example to .env and set the value.');
  }

  return {
    azureSpeechKey,
    azureSpeechRegion,
    port: parseInt(process.env.PORT || '3001', 10),
  };
}
