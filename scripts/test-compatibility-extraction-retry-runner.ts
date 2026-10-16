import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const runner = readFileSync('scripts/run-compatibility-extraction-retry.ts', 'utf8');
assert.match(runner, /retryCompatibilityDeterministicExtractionFromResume/);
assert.match(runner, /providerMode === 'ai' && preflight\.status === 'ready'[\s\S]*retryCompatibilityExtractionFromResume[\s\S]*retryCompatibilityDeterministicExtractionFromResume/);
assert.match(runner, /deterministic_fallback_completed/);
assert.match(runner, /providerMode = arg\('provider-mode'\) === 'ai' \? 'ai' : 'deterministic'/);
assert.match(runner, /status: 'skipped' as const/);
assert.doesNotMatch(runner, /if \(preflight\.status === 'ready'\) \{\s*for \(const candidate/);
assert.match(runner, /catalogObjects: candidate\.catalogObjects/);
assert.match(runner, /researchDisposition: candidate\.researchDisposition/);
assert.match(runner, /identity: candidate\.identity/);
assert.match(runner, /resumeBundle,/);
console.log('Compatibility extraction retry runner PASS: verified resume jobs always attempt cached deterministic extraction; model extraction is an optional enhancement only when provider preflight is ready.');
