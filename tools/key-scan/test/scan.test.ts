import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { run } from '../src/cli.ts';
import { scanFiles, type ScannedFile } from '../src/scan.ts';

const KEY = 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6';
const clean: ScannedFile = { path: 'assets/index-abc.js', content: 'console.log("hello")' };

describe('scanFiles', () => {
  it('KeyScan_CleanBundle_Passes', () => {
    expect(scanFiles([clean], { keyValue: KEY })).toEqual([]);
  });

  it('KeyScan_KeyValueInBundle_Fails', () => {
    const f = { path: 'assets/index-abc.js', content: `const k="${KEY}"` };
    expect(scanFiles([f], { keyValue: KEY })).toEqual([{ path: f.path, rule: 'key-value' }]);
  });

  it('KeyScan_KeyValueInSdkChunk_Fails', () => {
    const f = { path: 'assets/azure-speech-sdk-x1.js', content: `x="${KEY}"` };
    expect(scanFiles([f], { keyValue: KEY })).toEqual([{ path: f.path, rule: 'key-value' }]);
  });

  it('KeyScan_EnvNameInBundle_Fails', () => {
    const f = { path: 'index.html', content: 'AZURE_SPEECH_KEY' };
    expect(scanFiles([f], {})).toEqual([{ path: f.path, rule: 'env-name' }]);
  });

  it('KeyScan_SubscriptionHeaderInAppChunk_Fails', () => {
    const f = { path: 'assets/index-abc.js', content: 'h["Ocp-Apim-Subscription-Key"]=k' };
    expect(scanFiles([f], {})).toEqual([{ path: f.path, rule: 'subscription-header' }]);
  });

  it('KeyScan_FromSubscriptionInAppChunk_Passes', () => {
    // ADR 002: the app passes the key the owner typed on the phone. The value rule still guards the bundle.
    const f = { path: 'assets/spike-abc.js', content: 'SpeechConfig.fromSubscription(s.key,s.region)' };
    expect(scanFiles([f], {})).toEqual([]);
  });

  it('KeyScan_SubscriptionHeaderInSdkChunk_Passes', () => {
    const f = {
      path: 'assets/azure-speech-sdk-x1.js',
      content: 'AuthKey="Ocp-Apim-Subscription-Key";static fromSubscription(a,b){}',
    };
    expect(scanFiles([f], {})).toEqual([]);
  });

  it('KeyScan_ShortOrMissingKeyValue_SkipsValueRule', () => {
    const f = { path: 'assets/index-abc.js', content: 'abc' };
    expect(scanFiles([f], { keyValue: 'abc' })).toEqual([]);
    expect(scanFiles([f], { keyValue: '' })).toEqual([]);
  });
});

describe('run (CLI)', () => {
  function makeDist(files: Record<string, string>): string {
    const dir = mkdtempSync(join(tmpdir(), 'keyscan-'));
    for (const [rel, content] of Object.entries(files)) {
      const full = join(dir, rel);
      mkdirSync(join(full, '..'), { recursive: true });
      writeFileSync(full, content);
    }
    return dir;
  }
  const quiet = { log: () => undefined, error: () => undefined };

  it('Cli_CleanDir_Returns0', () => {
    const dir = makeDist({ 'index.html': '<html></html>', 'assets/index-a.js': 'ok' });
    expect(run([dir], { AZURE_SPEECH_KEY: KEY }, quiet)).toBe(0);
  });

  it('Cli_ViolationInNestedFile_Returns1', () => {
    const dir = makeDist({ 'assets/deep/x.js': `k="${KEY}"` });
    expect(run([dir], { AZURE_SPEECH_KEY: KEY }, quiet)).toBe(1);
  });

  it('Cli_MissingDir_Returns2', () => {
    expect(run([join(tmpdir(), 'does-not-exist-keyscan')], {}, quiet)).toBe(2);
  });

  it('Cli_NoDirs_Returns2', () => {
    expect(run([], {}, quiet)).toBe(2);
  });
});
