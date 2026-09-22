import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fishData } from '../src/data/fishData';
import { evaluateSpeciesCombination } from '../src/lib/tankCompatibilityEngine';
import { selectCompatibilityLaunchCohort } from '../src/data/compatibility-launch-cohort';

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

assert.equal(report.launch_pair_count, report.launch_cohort_species * (report.launch_cohort_species - 1) / 2);
assert.equal(
  Object.values(report.launch_pair_status_counts).reduce((sum: number, value: unknown) => sum + Number(value), 0),
  report.launch_pair_count,
);
assert.equal(report.launch_pair_status_counts.insufficient_data, queue.pair_gaps.length);
assert.equal(report.launch_pair_status_counts.insufficient_data, report.priority_pair_gap_count);
assert.equal(report.evidence_research_pair_gap_count, 0, 'launch pair insufficiency must not have unexplained evidence-research roots');

const exhaustiveInsufficientKeys = new Set<string>();
const launchFish = selectCompatibilityLaunchCohort();
for (let leftIndex = 0; leftIndex < launchFish.length; leftIndex += 1) {
  for (let rightIndex = leftIndex + 1; rightIndex < launchFish.length; rightIndex += 1) {
    const result = evaluateSpeciesCombination([launchFish[leftIndex], launchFish[rightIndex]]);
    if (result.status === 'insufficient_data') {
      exhaustiveInsufficientKeys.add([launchFish[leftIndex].id, launchFish[rightIndex].id].sort().join('::'));
    }
  }
}
const queuedInsufficientKeys = new Set(queue.pair_gaps.map(item => [item.species_a_id, item.species_b_id].sort().join('::')));
assert.deepEqual(queuedInsufficientKeys, exhaustiveInsufficientKeys, 'gap queue must account for every exhaustive launch-cohort insufficient pair');

for (const value of Object.values(report.field_coverage) as Array<{ applicable: number; reviewed_supported: number; reviewed_unknown: number }>) {
  assert.ok(value.reviewed_supported <= value.applicable);
  assert.ok(value.reviewed_unknown <= value.applicable);
  assert.ok(value.reviewed_supported + value.reviewed_unknown <= value.applicable);
}

for (const item of queue.species_gaps) {
  assert.ok(Array.isArray(item.gap_kinds) && item.gap_kinds.length > 0);
  assert.ok(Array.isArray(item.boundary_codes));
  assert.ok(['evidence_research', 'evidence_ceiling', 'representation_change', 'variant_authority_review', 'identity_review'].includes(item.resolution_mode));
  assert.ok(Number.isInteger(item.blocked_pair_count) && item.blocked_pair_count >= 0);
  assert.match(item.priority_basis, /launch_cohort_proxy/);
  assert.match(item.priority_basis, /pair-gap unlock impact/);
}
const bitterlingGap = queue.species_gaps.find(item => item.species_id === 'sp_0475');
assert.equal(bitterlingGap, undefined, 'high-body bitterling must clear after multi-water + reviewed schooling/profile authority');

const guppyGap = queue.species_gaps.find(item => item.species_id === 'sp_0436');
assert.equal(guppyGap, undefined, 'guppy multi-water environment must be fully represented and no longer queued');

const platinumSnakeheadGap = queue.species_gaps.find(item => item.species_id === 'sp_0224');
assert.ok(platinumSnakeheadGap, 'platinum snakehead gap must remain visible');
assert.ok(platinumSnakeheadGap.boundary_codes.includes('variant_authority_not_promotable'));
assert.equal(platinumSnakeheadGap.resolution_mode, 'variant_authority_review');

const crystalShrimpGap = queue.species_gaps.find(item => item.species_id === 'sp_0002');
assert.ok(crystalShrimpGap, 'Crystal Shrimp identity gap must remain visible');
assert.ok(crystalShrimpGap.boundary_codes.includes('trade_name_taxon_ambiguous'));
assert.equal(crystalShrimpGap.identity_boundary.resolved_granularity, 'trade_name_only');
assert.equal(crystalShrimpGap.resolution_mode, 'identity_review');

const miniParrotGap = queue.species_gaps.find(item => item.species_id === 'sp_0021');
assert.ok(miniParrotGap, 'Mini-parrot commercial identity gap must remain visible');
assert.ok(miniParrotGap.boundary_codes.includes('commercial_hybrid_identity_unresolved'));
assert.equal(miniParrotGap.identity_boundary.resolved_granularity, 'commercial_lineage_only');
assert.equal(miniParrotGap.resolution_mode, 'identity_review');

const zebraNeriteGap = queue.species_gaps.find(item => item.species_id === 'sp_0428');
assert.ok(zebraNeriteGap, 'Zebra nerite catalog identity gap must remain visible');
assert.ok(zebraNeriteGap.boundary_codes.includes('accepted_taxon_alias_trade_ambiguous'));
assert.equal(zebraNeriteGap.identity_boundary.resolved_granularity, 'accepted_taxon_alias_only');
assert.equal(zebraNeriteGap.resolution_mode, 'identity_review');
const candyKoiGap = queue.species_gaps.find(item => item.species_id === 'sp_0258');
assert.ok(candyKoiGap, 'Candy Koi Betta social gap must remain visible');
assert.equal(candyKoiGap.boundary_codes.includes('catalog_identity_unresolved'), false);
assert.equal(candyKoiGap.identity_boundary, null);
assert.equal(candyKoiGap.resolution_mode, 'evidence_ceiling');
assert.equal(candyKoiGap.evidence_ceiling.code, 'variant_social_not_established');
assert.equal(candyKoiGap.evidence_ceiling.field, 'social');
assert.match(candyKoiGap.resolution_note, /Koi\/candy|mosaic/i);
assert.equal(report.evidence_ceiling_species_gap_count, 1);

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
  assert.ok(Array.isArray(item.boundary_codes));
  assert.ok(['boundary_blocked', 'evidence_research'].includes(item.resolution_mode));
  assert.match(item.priority_basis, /launch_cohort/);
}
assert.equal(
  report.boundary_blocked_pair_gap_count + report.evidence_research_pair_gap_count,
  report.priority_pair_gap_count,
);
assert.equal(
  queue.pair_gaps.filter(item => item.resolution_mode === 'boundary_blocked').length,
  report.boundary_blocked_pair_gap_count,
);

assert.equal(queue.uses_real_user_telemetry, false);
console.log('compatibility knowledge coverage contract passed: deterministic coverage, fail-closed unknowns, and actionable gap queues');
