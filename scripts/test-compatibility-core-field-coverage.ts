import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS } from '../packages/contracts/src';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfileForFish } from '../src/data/compatibilityEvidence';
import { getLifeType } from '../src/modules/species/species.service';
import { buildCompatibilityCoreFieldCoverage, buildCompatibilityFastLaneResearchPackets } from '../src/services/compatibility/compatibility-field-coverage.service';

const { rows, summary, backlog } = buildCompatibilityCoreFieldCoverage();
const fastLanePackets = buildCompatibilityFastLaneResearchPackets();
const fields = [...GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS];
assert.equal(rows.length, fishData.length);
assert.equal(rows.length, 486);
assert.deepEqual(summary.coreFields, fields);
assert.ok(summary.runtimeReviewedProfileSpecies >= 101);
assert.ok(summary.coreFieldCompleteSpecies >= summary.genericOnboardingReadySpecies);
assert.ok(summary.oneFieldGapSpecies > 0);
assert.ok(summary.genericOnboardingReadySpecies >= 27, 'Fast Lane should preserve at least 27 fully sourced generic-ready profiles');
for (const speciesId of ['sp_0017','sp_0020','sp_0045','sp_0048','sp_0050','sp_0053','sp_0114','sp_0126','sp_0131','sp_0133','sp_0214','sp_0440','sp_0448','sp_0469']) {
  const row = rows.find(item => item.speciesId === speciesId);
  const fish = fishData.find(item => item.id === speciesId);
  const profile = fish ? getReviewedCompatibilityProfileForFish(fish) : undefined;
  assert.equal(row?.genericOnboardingReady, true, `${speciesId} should be promoted only from already-reviewed 8/8 field authority`);
  assert.ok(profile);
  const citationIds = new Set(profile.citations.map(source => source.id));
  for (const field of fields) {
    assert.ok(row?.fields[field].evidenceIds.length, `${speciesId}/${field} must retain field-level provenance`);
    assert.ok(row?.fields[field].evidenceIds.every(id => citationIds.has(id)), `${speciesId}/${field} evidence must already be contained in the reviewed Profile citations before requiredFacts sync`);
  }
}
assert.equal(rows.find(row => row.speciesId === 'sp_0015')?.fields.predation.status, 'reviewed_supported');
assert.equal(rows.find(row => row.speciesId === 'sp_0059')?.fields.predation.status, 'reviewed_supported');
assert.equal(rows.find(row => row.speciesId === 'sp_0441')?.fields.predation.status, 'reviewed_neutral_or_negative');
assert.equal(rows.find(row => row.speciesId === 'sp_0450')?.fields.predation.status, 'reviewed_supported');
assert.equal(rows.find(row => row.speciesId === 'sp_0050')?.fields.tank_size.status, 'reviewed_supported');
assert.equal(rows.find(row => row.speciesId === 'sp_0214')?.fields.predation.status, 'reviewed_neutral_or_negative');
for (const speciesId of ['sp_0121','sp_0122','sp_0123','sp_0200','sp_0440']) {
  assert.equal(rows.find(row => row.speciesId === speciesId)?.fields.predation.status, 'reviewed_neutral_or_negative', `${speciesId} should only close predation from reviewed diet + tankmate/community evidence`);
}
for (const field of fields) {
  assert.equal(Object.values(summary.fieldCounts[field]).reduce((sum, value) => sum + value, 0), rows.length);
}
for (const row of rows) {
  assert.equal(Object.keys(row.fields).length, fields.length);
  if (row.genericOnboardingReady) {
    assert.equal(row.lifeType, 'fish');
    assert.notEqual(row.reviewedProfile, 'none');
    assert.equal(row.authoritativeFieldCount, fields.length);
    assert.ok(fields.every(field => ['reviewed_supported', 'reviewed_neutral_or_negative'].includes(row.fields[field].status)));
  }
  if (row.lifeType === 'hardscape') assert.ok(fields.every(field => row.fields[field].status === 'not_applicable'));
  else if (row.lifeType !== 'fish') {
    assert.ok(fields.every(field => row.fields[field].status === 'missing_identity_or_domain'));
    assert.equal(row.genericOnboardingReady, false);
  }
}
assert.ok(backlog.length > 0);
assert.ok(backlog.every(item => ['reviewed_unknown', 'needs_research'].includes(item.status)));
assert.ok(backlog.every(item => rows.find(row => row.speciesId === item.speciesId)?.fields[item.field].disposition === 'targeted_source_expansion'));
assert.ok(backlog.every((item, index) => item.rank === index + 1));
assert.ok(!backlog.some(item => getLifeType(fishData.find(fish => fish.id === item.speciesId)!) !== 'fish'));
assert.ok(summary.fieldActionableGaps.every((item, index, all) => index === 0 || all[index - 1].count >= item.count));
const matrixArtifact = JSON.parse(readFileSync('docs/compatibility_core_field_coverage.json', 'utf8')) as Record<string, unknown> & { rows: unknown[] };
const backlogArtifact = JSON.parse(readFileSync('docs/compatibility_core_field_backlog.json', 'utf8')) as Record<string, unknown> & { items: unknown[] };
const fastLaneArtifact = JSON.parse(readFileSync('docs/compatibility_fast_lane_research_packets.json', 'utf8')) as Record<string, unknown> & { packets: unknown[] };
assert.equal(matrixArtifact.generatedAt, undefined);
assert.equal(backlogArtifact.generatedAt, undefined);
assert.equal(fastLaneArtifact.generatedAt, undefined);
assert.equal(matrixArtifact.speciesCount, summary.speciesCount);
assert.equal(matrixArtifact.coreFieldCompleteSpecies, summary.coreFieldCompleteSpecies);
assert.equal(matrixArtifact.genericOnboardingReadySpecies, summary.genericOnboardingReadySpecies);
assert.deepEqual(matrixArtifact.fieldActionableGaps, summary.fieldActionableGaps);
assert.deepEqual(matrixArtifact.rows, rows, 'source-controlled core-field matrix must be regenerated with current authority');
assert.equal(backlogArtifact.totalItems, backlog.length);
assert.deepEqual(backlogArtifact.items, backlog, 'source-controlled field backlog must be regenerated with current authority');
assert.equal(fastLaneArtifact.totalPackets, fastLanePackets.length);
assert.deepEqual(fastLaneArtifact.packets, fastLanePackets, 'Fast Lane research packets must be regenerated with current authority');
assert.ok(fastLanePackets.every(packet => packet.existingEvidenceIds.length > 0), 'near-ready research packet must preserve existing provenance');
console.log(`Compatibility core-field coverage PASS: ${rows.length} catalog objects × ${fields.length} fields; ${summary.genericOnboardingReadySpecies} generic-ready; ${backlog.length} actionable field gaps; terminal/domain holds excluded.`);
