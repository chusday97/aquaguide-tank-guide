import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fishData } from '../src/data/fishData';
import { evaluateSpeciesCombination } from '../src/lib/tankCompatibilityEngine';

const files = [
  'docs/compatibility_knowledge_coverage.json',
  'docs/compatibility_knowledge_gap_queue.json',
  'docs/compatibility_knowledge_coverage.md',
];

const generate = () => {
  const result = spawnSync(process.execPath, ['--import', 'tsx', 'scripts/generate-compatibility-knowledge-coverage.ts'], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
};

generate();
const first = Object.fromEntries(files.map(file => [file, readFileSync(file, 'utf8')]));
generate();
const second = Object.fromEntries(files.map(file => [file, readFileSync(file, 'utf8')]));
assert.deepEqual(second, first, 'coverage outputs must be deterministic');

const report = JSON.parse(first['docs/compatibility_knowledge_coverage.json']);
const queue = JSON.parse(first['docs/compatibility_knowledge_gap_queue.json']);

assert.equal(report.catalog_objects, 486);
assert.equal(report.completion_matrix_objects, 486);
assert.equal(report.uses_real_user_telemetry, false);
assert.match(report.telemetry_boundary, /proxy/i);
assert.match(report.telemetry_boundary, /not used|not claimed/i);

for (const value of Object.values(report.field_coverage) as Array<{ applicable: number; reviewed_supported: number; reviewed_unknown: number }>) {
  assert.ok(value.reviewed_supported <= value.applicable);
  assert.ok(value.reviewed_unknown <= value.applicable);
  assert.ok(value.reviewed_supported + value.reviewed_unknown <= value.applicable);
}

for (const item of queue.species_gaps) {
  assert.ok(Array.isArray(item.gap_kinds) && item.gap_kinds.length > 0);
  assert.ok(Number.isInteger(item.blocked_pair_count) && item.blocked_pair_count >= 0);
  assert.match(item.priority_basis, /launch_cohort_proxy/);
  assert.match(item.priority_basis, /pair-gap unlock impact/);
}
if (queue.pair_gaps.length > 0) {
  assert.ok(queue.species_gaps.some(item => item.blocked_pair_count > 0), 'pair gaps must feed species-level unlock impact');
}

const fishById = new Map(fishData.map(fish => [fish.id, fish]));
for (const item of queue.pair_gaps) {
  const left = fishById.get(item.species_a_id);
  const right = fishById.get(item.species_b_id);
  assert.ok(left && right);
  const result = evaluateSpeciesCombination([left, right]);
  assert.equal(result.status, 'insufficient_data');
  assert.match(item.priority_basis, /launch_cohort/);
}

assert.equal(queue.uses_real_user_telemetry, false);
console.log('compatibility knowledge coverage contract passed: deterministic coverage, fail-closed unknowns, and actionable gap queues');
