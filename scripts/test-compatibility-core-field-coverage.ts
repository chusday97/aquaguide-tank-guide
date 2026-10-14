import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS } from '../packages/contracts/src';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfileForFish } from '../src/data/compatibilityEvidence';
import { getApprovedCatalogFieldReviews } from '../src/data/catalogFieldReviews';
import { getLifeType } from '../src/modules/species/species.service';
import { resolveKnowledgeSources } from '../src/modules/knowledge/knowledgeSources';
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
assert.ok(summary.genericOnboardingReadySpecies >= 43, 'High-yield source-first coverage should preserve at least 43 fully sourced generic-ready profiles');
for (const speciesId of ['sp_0017','sp_0018','sp_0020','sp_0045','sp_0048','sp_0050','sp_0053','sp_0056','sp_0057','sp_0058','sp_0114','sp_0126','sp_0131','sp_0133','sp_0140','sp_0181','sp_0184','sp_0197','sp_0202','sp_0214','sp_0218','sp_0440','sp_0443','sp_0446','sp_0447','sp_0448','sp_0449','sp_0451','sp_0469']) {
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
for (const speciesId of ['sp_0018','sp_0056','sp_0058','sp_0121','sp_0122','sp_0123','sp_0181','sp_0200','sp_0202','sp_0440','sp_0449']) {
  assert.equal(rows.find(row => row.speciesId === speciesId)?.fields.predation.status, 'reviewed_neutral_or_negative', `${speciesId} should only close predation from reviewed diet + tankmate/community evidence`);
}
const rowOf = (speciesId: string) => rows.find(row => row.speciesId === speciesId);
assert.equal(rowOf('sp_0014')?.fields.tank_size.status, 'reviewed_supported');
assert.equal(rowOf('sp_0014')?.fields.social_behavior.status, 'reviewed_supported');
assert.equal(rowOf('sp_0443')?.fields.tank_size.status, 'reviewed_supported');
assert.equal(rowOf('sp_0443')?.fields.social_behavior.status, 'reviewed_supported');
assert.equal(rowOf('sp_0443')?.fields.territoriality.status, 'reviewed_neutral_or_negative');
assert.equal(rowOf('sp_0443')?.fields.predation.status, 'reviewed_neutral_or_negative');
assert.equal(rowOf('sp_0444')?.fields.territoriality.status, 'reviewed_supported');
assert.equal(rowOf('sp_0446')?.fields.adult_size.status, 'reviewed_supported');
assert.equal(rowOf('sp_0446')?.fields.territoriality.status, 'reviewed_supported');
assert.equal(rowOf('sp_0446')?.fields.predation.status, 'reviewed_supported');
assert.equal(rowOf('sp_0447')?.fields.tank_size.status, 'reviewed_supported');
assert.equal(rowOf('sp_0447')?.fields.territoriality.status, 'reviewed_supported');
assert.equal(rowOf('sp_0447')?.genericOnboardingReady, true);
assert.equal(rowOf('sp_0197')?.fields.predation.status, 'reviewed_neutral_or_negative');
assert.equal(rowOf('sp_0197')?.genericOnboardingReady, true);
for (const field of ['ph', 'tank_size', 'social_behavior', 'territoriality', 'predation'] as const) assert.equal(rowOf('sp_0451')?.fields[field].status, 'reviewed_supported');
assert.equal(rowOf('sp_0451')?.genericOnboardingReady, true);
assert.equal(rowOf('sp_0140')?.genericOnboardingReady, true);
assert.equal(rowOf('sp_0140')?.fields.ph.status, 'reviewed_supported');
assert.equal(rowOf('sp_0140')?.fields.predation.status, 'reviewed_supported');
assert.equal(rowOf('sp_0181')?.fields.territoriality.status, 'reviewed_supported');
assert.equal(rowOf('sp_0449')?.fields.territoriality.status, 'reviewed_supported');
assert.equal(rowOf('sp_0012')?.fields.predation.status, 'reviewed_neutral_or_negative');
assert.equal(rowOf('sp_0468')?.fields.predation.status, 'reviewed_neutral_or_negative');
assert.equal(rowOf('sp_0139')?.fields.predation.status, 'reviewed_supported');
assert.equal(rowOf('sp_0184')?.genericOnboardingReady, true);
for (const field of ['temperature', 'ph', 'adult_size', 'predation'] as const) assert.ok(['reviewed_supported', 'reviewed_neutral_or_negative'].includes(rowOf('sp_0184')?.fields[field].status ?? ''));
assert.equal(rowOf('sp_0218')?.genericOnboardingReady, true);
assert.equal(rowOf('sp_0218')?.fields.territoriality.status, 'reviewed_supported');
assert.equal(rowOf('sp_0218')?.fields.predation.status, 'reviewed_neutral_or_negative');
assert.equal(rowOf('sp_0187')?.fields.adult_size.status, 'reviewed_unknown', 'do not promote new Chrysiptera adult-size authority from the migration-owned AI-generated page');
assert.equal(rowOf('sp_0187')?.fields.tank_size.status, 'reviewed_unknown', 'do not promote new Chrysiptera tank-size authority from the migration-owned AI-generated page');
assert.equal(rowOf('sp_0057')?.fields.tank_size.status, 'reviewed_supported');
assert.equal(rowOf('sp_0057')?.fields.predation.status, 'reviewed_neutral_or_negative');
assert.equal(rowOf('sp_0057')?.authoritativeFieldCount, 8);
for (const speciesId of ['sp_0103', 'sp_0104', 'sp_0116', 'sp_0283']) {
  assert.equal(rowOf(speciesId)?.fields.tank_size.status, 'reviewed_supported', `${speciesId} should inherit only the exact reviewed 200 cm base-taxon tank-length minimum`);
  assert.equal(rowOf(speciesId)?.fields.territoriality.status, 'reviewed_unknown', `${speciesId} territoriality must remain unknown rather than inferred from general husbandry`);
}
assert.equal(rowOf('sp_0447')?.fields.social_behavior.status, 'reviewed_supported');
assert.equal(rowOf('sp_0447')?.fields.predation.status, 'reviewed_neutral_or_negative');

const approvedValue = (speciesId: string, field: string) => getApprovedCatalogFieldReviews(speciesId).find(review => review.field === field)?.proposedValue;
assert.deepEqual(approvedValue('sp_0014', 'tank_size'), { liters: 72, lengthCm: 80 });
assert.deepEqual(approvedValue('sp_0014', 'social_behavior'), { mode: 'group', minimumGroupSize: 4 });
assert.deepEqual(approvedValue('sp_0443', 'social_behavior'), { mode: 'group', minimumGroupSize: 6 });
assert.deepEqual(approvedValue('sp_0443', 'territoriality'), { traits: [] });
assert.deepEqual(approvedValue('sp_0446', 'territoriality'), { traits: ['breeding_male_territoriality'] });
assert.deepEqual(approvedValue('sp_0451', 'tank_size'), { liters: 540, lengthCm: 150 });
assert.deepEqual(approvedValue('sp_0181', 'social_behavior'), { mode: 'group', minimumGroupSize: 5 });
assert.deepEqual(approvedValue('sp_0062', 'social_behavior'), { mode: 'group', minimumGroupSize: 6 });
assert.deepEqual(approvedValue('sp_0184', 'temperature'), { min: 24, max: 28 });
assert.deepEqual(approvedValue('sp_0184', 'ph'), { min: 8.1, max: 8.4 });
assert.deepEqual(approvedValue('sp_0184', 'adult_size'), { min: null, max: 10 });
assert.deepEqual(approvedValue('sp_0218', 'social_behavior'), { mode: 'group', minimumGroupSize: 8 });
assert.deepEqual(approvedValue('sp_0057', 'tank_size'), { liters: 250, lengthCm: null });
assert.deepEqual(approvedValue('sp_0057', 'predation'), { targets: [] });
assert.deepEqual(approvedValue('sp_0156', 'predation'), { targets: [] });
assert.equal(rowOf('sp_0156')?.genericOnboardingReady, true);
for (const speciesId of ['sp_0103', 'sp_0104', 'sp_0116', 'sp_0283']) {
  assert.deepEqual(approvedValue(speciesId, 'tank_size'), { liters: null, lengthCm: 200 }, `${speciesId} must not invent a tank-volume minimum`);
}
assert.deepEqual(approvedValue('sp_0447', 'social_behavior'), { mode: 'group', minimumGroupSize: null });
assert.deepEqual(approvedValue('sp_0447', 'predation'), { targets: [] });
assert.deepEqual(approvedValue('sp_0447', 'territoriality'), { traits: ['breeding_territoriality'] });
assert.deepEqual(approvedValue('sp_0451', 'territoriality'), { traits: ['territorial', 'territory_defense'] });
assert.deepEqual(approvedValue('sp_0197', 'predation'), { targets: [] });
const newSourceIds = ['animaldiversity-astronotus-ocellatus-behavior', 'icar-cifa-channa-stewartii-live-fish'];
assert.deepEqual(resolveKnowledgeSources(newSourceIds).map(source => source.id).sort(), [...newSourceIds].sort(), 'new Fast Lane evidence must resolve to source metadata');
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
assert.ok(fastLanePackets.every(packet => packet.existingSources.length > 0), 'near-ready research packet must resolve existing field provenance to source metadata');
for (const speciesId of ['sp_0012', 'sp_0468']) {
  const packet = fastLanePackets.find(item => item.speciesId === speciesId);
  assert.ok(packet, `${speciesId} must remain represented in Fast Lane while its final field is unresolved`);
  assert.ok(packet.existingSources.length > 0, `${speciesId} Fast Lane packet must not lose source metadata when evidence comes from field review rather than Profile citations`);
}
for (const speciesId of ['sp_0197', 'sp_0447', 'sp_0451']) {
  assert.equal(fastLanePackets.find(item => item.speciesId === speciesId), undefined, `${speciesId} must leave Fast Lane only after its final core field is reviewed`);
  assert.equal(rowOf(speciesId)?.authoritativeFieldCount, 8, `${speciesId} must have 8/8 authoritative core fields after Fast Lane closure`);
}
console.log(`Compatibility core-field coverage PASS: ${rows.length} catalog objects × ${fields.length} fields; ${summary.genericOnboardingReadySpecies} generic-ready; ${backlog.length} actionable field gaps; terminal/domain holds excluded.`);
