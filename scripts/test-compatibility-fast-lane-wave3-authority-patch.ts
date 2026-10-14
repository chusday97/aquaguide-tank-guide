import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  compatibilityFastLaneWave3AuthorityPatch,
  compatibilityFastLaneWave3FieldReviews,
  compatibilityFastLaneWave3Sources,
} from '../src/data/compatibilityAuthorityPatches/fast-lane-wave3-20261014';
import { getApprovedCatalogFieldReviews } from '../src/data/catalogFieldReviews';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { compatibilityUnifiedNextWave } from '../src/data/compatibilityNextWaveBatch';
import { fishData } from '../src/data/fishData';
import { evaluateTankCompatibility } from '../src/lib/tankCompatibilityEngine';
import { resolveKnowledgeSources } from '../src/modules/knowledge/knowledgeSources';
import {
  buildCompatibilityCoreFieldCoverage,
  buildCompatibilityFastLaneResearchPackets,
} from '../src/services/compatibility/compatibility-field-coverage.service';

const targets = ['sp_0054', 'sp_0012', 'sp_0103', 'sp_0104', 'sp_0116', 'sp_0283'] as const;
const patch = compatibilityUnifiedNextWave.authorityPatches.find(item => item.patchId === compatibilityFastLaneWave3AuthorityPatch.patchId);
assert.ok(patch);
assert.deepEqual(patch.speciesIds, [...targets]);
assert.equal(patch.authorityOwner, compatibilityFastLaneWave3AuthorityPatch.authorityOwner);
assert.equal(patch.migrationOwner, compatibilityFastLaneWave3AuthorityPatch.migrationOwner);

const migration = readFileSync(patch.migrationOwner, 'utf8');
const priorPatchMigration = readFileSync('supabase/migrations/20261014143000_compatibility_fast_lane_wave2_authority_patch.sql', 'utf8');
for (const source of Object.values(compatibilityFastLaneWave3Sources)) {
  assert.equal(priorPatchMigration.includes(source.id), false, 'wave2 migration must remain immutable: ' + source.id);
  assert.equal(resolveKnowledgeSources([source.id])[0]?.id, source.id, 'wave3 patch source must resolve: ' + source.id);
}
assert.match(migration, /expected 101 reviewed Compatibility profiles/);
assert.match(migration, /expected 181 reviewed evidence sources/);
assert.match(migration, /expected 184 reviewed evidence sources/);
for (const speciesId of targets) assert.match(migration, new RegExp(speciesId));
for (const source of Object.values(compatibilityFastLaneWave3Sources)) assert.match(migration, new RegExp(source.id));
assert.match(migration, /commit;\s*$/);

const approved = (speciesId: string, field: string) => getApprovedCatalogFieldReviews(speciesId).find(item => item.field === field);
assert.deepEqual(approved('sp_0054', 'predation')?.proposedValue, { targets: ['small_fish'] });
assert.deepEqual(approved('sp_0012', 'territoriality')?.proposedValue, { traits: ['breeding_territoriality'] });
for (const speciesId of ['sp_0103', 'sp_0104', 'sp_0116', 'sp_0283']) {
  assert.deepEqual(approved(speciesId, 'territoriality')?.proposedValue, { traits: ['territorial'] });
}

const allCoreFacts = new Set(['water','temperature','ph','adult_size','tank_size','social_behavior','territoriality','predation']);
for (const speciesId of targets) {
  const profile = getReviewedCompatibilityProfile(speciesId);
  assert.ok(profile, 'missing wave3 runtime Profile ' + speciesId);
  assert.deepEqual(new Set(profile.requiredFacts), allCoreFacts, speciesId + ' must expose all eight required facts');
}
assert.deepEqual(getReviewedCompatibilityProfile('sp_0054')?.predationTargets, ['small_fish']);
assert.ok(getReviewedCompatibilityProfile('sp_0054')?.citations.some(item => item.id === compatibilityFastLaneWave3Sources.hemichromisTaiwanFishDb.id));
const cherry = getReviewedCompatibilityProfile('sp_0012')!;
assert.ok(cherry.behaviorTraits.includes('breeding_territoriality'));
assert.equal(cherry.behaviorTraits.includes('territorial'), false, 'breeding-only cherry-barb territory must not become permanent generic territoriality');
assert.ok(cherry.citations.some(item => item.id === compatibilityFastLaneWave3Sources.cherryBarbFischwissen.id));
for (const speciesId of ['sp_0103', 'sp_0104', 'sp_0116', 'sp_0283']) {
  const profile = getReviewedCompatibilityProfile(speciesId)!;
  assert.ok(profile.behaviorTraits.includes('territorial'), speciesId + ' must carry reviewed territoriality');
  assert.ok(profile.citations.some(item => item.id === compatibilityFastLaneWave3Sources.arowanaMyFish.id), speciesId + ' must carry direct territoriality provenance');
}

const byId = (id: string) => {
  const fish = fishData.find(item => item.id === id);
  assert.ok(fish, 'missing catalog fish ' + id);
  return fish;
};
const result = (existingId: string, candidateId: string) => evaluateTankCompatibility({
  scope: 'species_only',
  existingSpecies: [{ species: byId(existingId), record: { quantity: 1 } }],
  candidateSpecies: byId(candidateId),
  candidateQuantity: 1,
});

const hemichromisVsSmallFish = result('sp_0054', 'sp_0431');
assert.equal(hemichromisVsSmallFish.status, 'not_recommended');
assert.ok(hemichromisVsSmallFish.blockingRules.some(rule => rule.code === 'predation_risk'), 'Hemichromis direct small-fish prey authority must reach runtime');

const cherryVsLowTerritory = result('sp_0012', 'sp_0017');
assert.equal(cherryVsLowTerritory.warningRules.some(rule => rule.code === 'territorial_pressure_context'), false, 'breeding-only cherry-barb territoriality must not become permanent territorial pressure');

for (const speciesId of ['sp_0103', 'sp_0104', 'sp_0116', 'sp_0283']) {
  const arowanaVsLowTerritory = result(speciesId, 'sp_0017');
  assert.equal(arowanaVsLowTerritory.status, 'caution');
  assert.ok(arowanaVsLowTerritory.warningRules.some(rule => rule.code === 'territorial_pressure_context'), speciesId + ' reviewed generic territoriality must reach runtime');
  assert.equal(arowanaVsLowTerritory.blockingRules.some(rule => rule.code === 'predation_risk'), false, speciesId + ' territoriality test must not depend on prey-size blocking');
}

const coverage = buildCompatibilityCoreFieldCoverage();
for (const speciesId of targets) {
  const row = coverage.rows.find(item => item.speciesId === speciesId);
  assert.ok(row);
  assert.equal(row.authoritativeFieldCount, 8, speciesId + ' must be 8/8 after wave3');
  assert.equal(row.genericOnboardingReady, true, speciesId + ' must be generic-ready after wave3');
}
const fastLane = buildCompatibilityFastLaneResearchPackets();
assert.deepEqual(
  fastLane.map(item => [item.speciesId, item.missingField]),
  [['sp_0198', 'tank_size'], ['sp_0105', 'territoriality'], ['sp_0468', 'territoriality']],
  'only evidence-honest one-field gaps may remain after wave3',
);
assert.equal(compatibilityFastLaneWave3FieldReviews.length, 6);

console.log('Compatibility Fast Lane wave3 authority PASS: six species close to 8/8 with scoped runtime behavior; Fast Lane reduced to the three evidence-honest gaps.');
