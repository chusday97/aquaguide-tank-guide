import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildCompatibilityV4ShadowEval } from './compatibility-v4-shadow-eval-fixtures';

const report = await buildCompatibilityV4ShadowEval();
assert.equal(report.summary.totalCases, 4);
assert.equal(report.summary.acceptedAi, 2);
assert.equal(report.summary.rejectedAi, 1);
assert.equal(report.summary.skippedAi, 1);
assert.equal(report.summary.finalDecisionMutations, 0);

const byId = new Map(report.cases.map(item => [item.caseId, item]));
assert.equal(byId.get('V4-SHADOW-3SP-COMPATIBLE')?.deterministic.status, 'compatible');
assert.equal(byId.get('V4-SHADOW-3SP-COMPATIBLE')?.ai.status, 'accepted');
assert.equal(byId.get('V4-SHADOW-3SP-CAUTION')?.deterministic.status, 'caution');
assert.equal(byId.get('V4-SHADOW-3SP-CAUTION')?.ai.status, 'accepted');
assert.equal(byId.get('V4-SHADOW-3SP-BLOCKED')?.deterministic.status, 'not_recommended');
assert.equal(byId.get('V4-SHADOW-3SP-BLOCKED')?.ai.status, 'rejected');
assert.equal(byId.get('V4-SHADOW-3SP-BLOCKED')?.ai.reason, 'provider_output_conflicts_with_deterministic_authority');
assert.equal(byId.get('V4-SHADOW-3SP-INSUFFICIENT')?.deterministic.status, 'insufficient_data');
assert.equal(byId.get('V4-SHADOW-3SP-INSUFFICIENT')?.ai.status, 'skipped');
assert.equal(byId.get('V4-SHADOW-3SP-INSUFFICIENT')?.ai.providerCalls, 0);

const committed = JSON.parse(readFileSync('docs/compatibility_v4_shadow_eval.json', 'utf8'));
assert.deepEqual(committed, report, 'committed V4 shadow eval JSON must match current runtime authority');

const markdown = readFileSync('docs/compatibility_v4_shadow_eval.md', 'utf8');
for (const item of report.cases) {
  assert.equal(markdown.includes(item.caseId), true);
}
assert.match(markdown, /Final-decision mutations: 0/);

console.log('Compatibility V4 shadow eval PASS: four real 3-species runtime states preserve deterministic authority with accepted/rejected/skipped AI behavior.');
