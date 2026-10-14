import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  compatibilityFastLaneAuthorityPatch,
  compatibilityFastLanePatchSources,
  compatibilityFastLanePatchFieldReviews,
} from '../src/data/compatibilityAuthorityPatches/fast-lane-20261014';
import { getApprovedCatalogFieldReviews } from '../src/data/catalogFieldReviews';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { compatibilityUnifiedNextWave } from '../src/data/compatibilityNextWaveBatch';
import { resolveKnowledgeSources } from '../src/modules/knowledge/knowledgeSources';

const patch = compatibilityUnifiedNextWave.authorityPatches.find(item => item.patchId === compatibilityFastLaneAuthorityPatch.patchId);
assert.ok(patch);
assert.deepEqual(patch.speciesIds, ['sp_0197', 'sp_0447', 'sp_0451']);
assert.equal(patch.authorityOwner, compatibilityFastLaneAuthorityPatch.authorityOwner);
assert.equal(patch.migrationOwner, compatibilityFastLaneAuthorityPatch.migrationOwner);

const migration = readFileSync(patch.migrationOwner, 'utf8');
const historicalMigration = readFileSync('supabase/migrations/20261011234500_compatibility_unified_next25_authority.sql', 'utf8');
assert.equal(historicalMigration.includes(compatibilityFastLanePatchSources.channaStewartiiCifa.id), false, 'historical migration must remain immutable');

for (const speciesId of patch.speciesIds) {
  assert.equal(migration.includes(speciesId), true, 'patch migration must name ' + speciesId);
  assert.ok(getReviewedCompatibilityProfile(speciesId));
}
for (const source of Object.values(compatibilityFastLanePatchSources)) {
  assert.equal(resolveKnowledgeSources([source.id])[0]?.id, source.id, 'patch source must resolve: ' + source.id);
}
for (const newSourceId of [
  compatibilityFastLanePatchSources.oscarFishBase.id,
  compatibilityFastLanePatchSources.oscarAnimalDiversity.id,
  compatibilityFastLanePatchSources.channaStewartiiCifa.id,
]) {
  assert.equal(migration.includes(newSourceId), true, 'migration must own new evidence: ' + newSourceId);
}

assert.match(migration, /expected 101 reviewed Compatibility profiles/);
assert.match(migration, /expected 177 reviewed evidence sources/);
assert.match(migration, /expected 180 reviewed evidence sources/);
assert.match(migration, /commit;\s*$/);

const channa = getReviewedCompatibilityProfile('sp_0197')!;
assert.deepEqual(channa.predationTargets, []);
assert.ok(channa.requiredFacts?.includes('predation'));
assert.ok(channa.citations.some(item => item.id === compatibilityFastLanePatchSources.channaStewartiiCifa.id));

const discus = getReviewedCompatibilityProfile('sp_0447')!;
assert.ok(discus.behaviorTraits.includes('breeding_territoriality'));
assert.ok(discus.requiredFacts?.includes('territoriality'));
assert.ok(discus.requiredFacts?.includes('predation'));

const oscar = getReviewedCompatibilityProfile('sp_0451')!;
assert.ok(oscar.behaviorTraits.includes('territorial'));
assert.ok(oscar.behaviorTraits.includes('territory_defense'));
assert.ok(oscar.requiredFacts?.includes('territoriality'));
assert.ok(oscar.citations.some(item => item.id === compatibilityFastLanePatchSources.oscarAnimalDiversity.id));

const approved = (speciesId: string, field: string) => getApprovedCatalogFieldReviews(speciesId).find(item => item.field === field);
assert.deepEqual(approved('sp_0197', 'predation')?.proposedValue, { targets: [] });
assert.deepEqual(approved('sp_0447', 'territoriality')?.proposedValue, { traits: ['breeding_territoriality'] });
assert.deepEqual(approved('sp_0451', 'territoriality')?.proposedValue, { traits: ['territorial', 'territory_defense'] });
assert.equal(compatibilityFastLanePatchFieldReviews.length, 7);

console.log('Compatibility Fast Lane authority patch PASS: immutable history + additive 3-species evidence/profile upgrade, 101 Profiles retained and Evidence target 177->180.');
