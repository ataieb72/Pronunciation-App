export interface ScannedFile {
  readonly path: string;
  readonly content: string;
}

export type Rule = 'key-value' | 'env-name' | 'subscription-header' | 'from-subscription';

export interface Violation {
  readonly path: string;
  readonly rule: Rule;
}

export interface ScanOptions {
  /** The real Azure key. When set, its value must appear in no file. */
  readonly keyValue?: string | undefined;
}

/**
 * The Azure Speech SDK chunk legitimately contains the subscription header
 * name and a `fromSubscription` method. The PWA build names that chunk
 * `azure-speech-sdk-*`; only the header and method rules skip it.
 */
export const SDK_CHUNK_PATTERN = /(^|\/)azure-speech-sdk-[^/]*$/;

/** Shorter values would match by accident; real keys are 32+ characters. */
const MIN_KEY_LENGTH = 16;

const SUBSCRIPTION_HEADER = /ocp-apim-subscription-key/i;

export function scanFiles(files: readonly ScannedFile[], opts: ScanOptions): Violation[] {
  const key =
    opts.keyValue !== undefined && opts.keyValue.length >= MIN_KEY_LENGTH ? opts.keyValue : undefined;
  const violations: Violation[] = [];

  for (const file of files) {
    const path = file.path.replaceAll('\\', '/');
    const isSdkChunk = SDK_CHUNK_PATTERN.test(path);

    if (key !== undefined && file.content.includes(key)) {
      violations.push({ path, rule: 'key-value' });
    }
    if (file.content.includes('AZURE_SPEECH_KEY')) {
      violations.push({ path, rule: 'env-name' });
    }
    if (!isSdkChunk && SUBSCRIPTION_HEADER.test(file.content)) {
      violations.push({ path, rule: 'subscription-header' });
    }
    if (!isSdkChunk && file.content.includes('fromSubscription')) {
      violations.push({ path, rule: 'from-subscription' });
    }
  }
  return violations;
}
