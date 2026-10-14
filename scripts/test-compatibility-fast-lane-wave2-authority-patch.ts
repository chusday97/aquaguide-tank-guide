import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  compatibilityFastLaneWave2AuthorityPatch,
  compatibilityFastLaneWave2FieldReviews,
  compatibilityFastLaneWave2Sources,
} from '../src/data/compatibilityAuthorityPatches/fast-lane-wave2-20261014';
import { getApprovedCatalogFieldReviews } from '../src/data/catalogFieldReviews';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { compatibilityUnifiedNextWave } from '../src/data/compatibilityNextWaveBatch';
import { buildCompatibilityCoreFieldCoverage, buildCompatibilityFastLaneResearchPackets } from '../src/services/compatibility/compatibility-field-coverage.service';
import { resolveKnowledgeSources } from '../src/modules/knowledge/knowledgeSources';
import { fishData } from '../src/data/fishData';
import { evaluateTankCompatibility } from '../src/lib/tankCompatibilityEngine';

const patch = compatibilityUnifiedNextWave.authorityPatches.find(item => item.patchId === compatibilityFastLaneWave2AuthorityPatch.patchId);
assert.ok(patch);
assert.deepEqual(patch.speciesIds, ['sp_0139', 'sp_0199']);
assert.equal(patch.authorityOwner, compatibilityFastLaneWave2AuthorityPatch.authorityOwner);
assert.equal(patch.migrationOwner, compatibilityFastLaneWave2AuthorityPatch.migrationOwner);

const migration = readFileSync(patch.migrationOwner, 'utf8');
const priorPatchMigration = readFileSync('supabase/migrations/20261014133500_compatibility_fast_lane_authority_patch.sql', 'utf8');
assert.equal(priorPatchMigration.includes(compatibilityFastLaneWave2Sources.piaractusAnimalDiversity.id), false, 'prior patch migration must remain immutable');

for (const source of Object.values(compatibilityFastLaneWave2Sources)) {
  assert.equal(resolveKnowledgeSources([source.id])[0]?.id, source.id, 'wave2 patch source must resolve: ' + source.id);
}
assert.match(migration, /expected 101 reviewed Compatibility profiles/);
assert.match(migration, /expected 180 reviewed evidence sources/);
assert.match(migration, /expected 181 reviewed evidence sources/);
assert.match(migration, /sp_0139/);
assert.match(migration, /sp_0199/);
assert.match(migration, /animaldiversity-piaractus-brachypomus/);
assert.match(migration, /seriouslyfish-badis-badis/);
assert.match(migration, /commit;\s*$/);

const approved = (speciesId: string, field: string) => getApprovedCatalogFieldReviews(speciesId).find(item => item.field === field);
assert.deepEqual(approved('sp_0139', 'territoriality')?.proposedValue, { traits: ['territorial', 'age_increasing_territoriality'] });
assert.deepEqual(approved('sp_0199', 'predation')?.proposedValue, { targets: ['very_small_fish'] });

const piaractus = getReviewedCompatibilityProfile('sp_0139')!;
assert.deepEqual(piaractus.predationTargets, ['small_fish'], 'existing reviewed Piaractus predation authority must be synced into runtime Profile');
assert.ok(piaractus.behaviorTraits.includes('territorial'));
assert.ok(piaractus.behaviorTraits.includes('age_increasing_territoriality'));
assert.deepEqual(new Set(piaractus.requiredFacts), new Set(['water','temperature','ph','adult_size','tank_size','social_behavior','territoriality','predation']));
assert.ok(piaractus.citations.some(item => item.id === compatibilityFastLaneWave2Sources.piaractusAnimalDiversity.id));

const badis = getReviewedCompatibilityProfile('sp_0199')!;
assert.deepEqual(badis.predationTargets, ['very_small_fish']);
assert.deepEqual(new Set(badis.requiredFacts), new Set(['water','temperature','ph','adult_size','tank_size','social_behavior','territoriality','predation']));
assert.ok(badis.citations.some(item => item.id === compatibilityFastLaneWave2Sources.badisSeriouslyFish.id));

const byId = (id: string) => {
  const fish = fishData.find(item => item.id === id);
  assert.ok(fish, 'missing catalog fish ' + id);
  return fish;
};
const piaractusVsSmallFish = evaluateTankCompatibility({
  scope: 'species_only',
  existingSpecies: [{ species: byId('sp_0139'), record: { quantity: 1 } }],
  candidateSpecies: byId('sp_0431'),
  candidateQuantity: 6,
});
assert.equal(piaractusVsSmallFish.status, 'not_recommended');
assert.ok(piaractusVsSmallFish.blockingRules.some(rule => rule.code === 'predation_risk'), 'Piaractus reviewed small_fish scope must reach the runtime engine');
const badisVsOrdinarySmallFish = evaluateTankCompatibility({
  scope: 'species_only',
  existingSpecies: [{ species: byId('sp_0199'), record: { quantity: 1 } }],
  candidateSpecies: byId('sp_0431'),
  candidateQuantity: 6,
});
assert.equal(badisVsOrdinarySmallFish.blockingRules.some(rule => rule.code === 'predation_risk'), false, 'Badis very_small_fish/fry evidence must not widen to every Small fish');

const coverage = buildCompatibilityCoreFieldCoverage();
for (const speciesId of ['sp_0139', 'sp_0199']) {
  const row = coverage.rows.find(item => item.speciesId === speciesId);
  assert.ok(row);
  assert.equal(row.authoritativeFieldCount, 8, speciesId + ' must be 8/8 after wave2');
  assert.equal(row.genericOnboardingReady, true, speciesId + ' must be generic-ready after wave2');
}
const fastLane = buildCompatibilityFastLaneResearchPackets();
assert.equal(fastLane.some(item => ['sp_0139','sp_0199'].includes(item.speciesId)), false);
assert.equal(compatibilityFastLaneWave2FieldReviews.length, 2);

console.log('Compatibility Fast Lane wave2 authority PASS: 2 species close to 8/8, runtime Profile authority stays aligned, Production target remains additive 101 Profiles / 181 Evidence.');
