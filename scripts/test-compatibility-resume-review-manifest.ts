import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const path = 'evaluation/product/compatibility-resume-review.v1.json';
const raw = readFileSync(path, 'utf8');
const manifest = JSON.parse(raw) as {
  rawSourceTextCommitted: boolean;
  writesAuthority: boolean;
  resumableJobs: number;
  verifiedDocumentSnapshots: number;
  jobs: Array<{
    scientificName: string;
    targetFields: string[];
    currentQueue: string;
    verifiedDocumentCount: number;
    verifiedDocuments: Array<{ url: string; publisher: string; sourceType: string; contentSha256: string }>;
    retry: { repeatsIdentityLookup: boolean; repeatsSourceDiscovery: boolean; repeatsSourceFetch: boolean; writesAuthority: boolean };
  }>;
};

assert.equal(manifest.rawSourceTextCommitted, false);
assert.equal(manifest.writesAuthority, false);
assert.equal(manifest.resumableJobs, 9);
assert.equal(manifest.jobs.length, 9);
assert.equal(manifest.verifiedDocumentSnapshots, 22);
assert.equal(manifest.jobs.reduce((sum, job) => sum + job.verifiedDocumentCount, 0), 22);
assert.ok(manifest.jobs.every(job => job.scientificName && job.targetFields.length > 0 && job.currentQueue === 'extraction_retry'));
assert.ok(manifest.jobs.every(job => job.retry.repeatsIdentityLookup === false
  && job.retry.repeatsSourceDiscovery === false
  && job.retry.repeatsSourceFetch === false
  && job.retry.writesAuthority === false));
assert.ok(manifest.jobs.flatMap(job => job.verifiedDocuments).every(document => (
  document.url.startsWith('https://')
  && document.publisher.length > 0
  && document.sourceType.length > 0
  && /^[a-f0-9]{64}$/.test(document.contentSha256)
)));
const forbiddenKeys = ['"text"', '"apiKey"', '"authorization"', 'Bearer ', 'Navigation filler without husbandry evidence'];
for (const key of forbiddenKeys) assert.equal(raw.includes(key), false, `safe manifest must not contain ${key}`);
console.log('Compatibility resume review manifest PASS: 9 resumable jobs / 22 verified snapshot hashes are auditable without committing raw source text, credentials, or repeated-fetch semantics.');
