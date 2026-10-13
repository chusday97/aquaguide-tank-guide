import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS } from '../packages/contracts/src';
import { fishData } from '../src/data/fishData';
import { getLifeType } from '../src/modules/species/species.service';
import { buildCompatibilityCoreFieldCoverage } from '../src/services/compatibility/compatibility-field-coverage.service';

const { rows, summary, backlog } = buildCompatibilityCoreFieldCoverage();
const fields = [...GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS];
assert.equal(rows.length, fishData.length);
assert.equal(rows.length, 486);
assert.deepEqual(summary.coreFields, fields);
assert.ok(summary.runtimeReviewedProfileSpecies >= 101);
assert.ok(summary.coreFieldCompleteSpecies >= summary.genericOnboardingReadySpecies);
assert.ok(summary.oneFieldGapSpecies > 0);
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
assert.equal(matrixArtifact.generatedAt, undefined);
assert.equal(backlogArtifact.generatedAt, undefined);
assert.equal(matrixArtifact.speciesCount, summary.speciesCount);
assert.equal(matrixArtifact.coreFieldCompleteSpecies, summary.coreFieldCompleteSpecies);
assert.equal(matrixArtifact.genericOnboardingReadySpecies, summary.genericOnboardingReadySpecies);
assert.deepEqual(matrixArtifact.fieldActionableGaps, summary.fieldActionableGaps);
assert.deepEqual(matrixArtifact.rows, rows, 'source-controlled core-field matrix must be regenerated with current authority');
assert.equal(backlogArtifact.totalItems, backlog.length);
assert.deepEqual(backlogArtifact.items, backlog, 'source-controlled field backlog must be regenerated with current authority');
console.log(`Compatibility core-field coverage PASS: ${rows.length} catalog objects × ${fields.length} fields; ${summary.genericOnboardingReadySpecies} generic-ready; ${backlog.length} actionable field gaps; terminal/domain holds excluded.`);
