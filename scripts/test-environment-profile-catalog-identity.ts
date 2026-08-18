import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { plantEnvironmentProfiles } from '../src/data/plantEnvironmentProfiles';
import { speciesEnvironmentProfiles } from '../src/data/speciesEnvironmentProfiles';
import { isAquaticPlantSpecies, isHardscapeSpecies } from '../src/lib/speciesClassification';
import {
  auditPlantEnvironmentProfiles,
  auditSpeciesEnvironmentProfiles,
} from '../src/modules/environment/environmentProfileRegistry';

const catalogById = new Map(fishData.map(item => [item.id, item]));
const seenProfileIds = new Set<string>();

for (const profile of speciesEnvironmentProfiles) {
  assert.equal(
    seenProfileIds.has(profile.speciesId),
    false,
    `environment profile id ${profile.speciesId} must not be duplicated across livestock and plant registries`,
  );
  seenProfileIds.add(profile.speciesId);

  const catalogRecord = catalogById.get(profile.speciesId);
  assert.ok(catalogRecord, `livestock environment profile ${profile.speciesId} must resolve to a catalog record`);
  assert.equal(
    isAquaticPlantSpecies(catalogRecord),
    false,
    `livestock environment profile ${profile.speciesId} must not resolve to an aquatic plant`,
  );
  assert.equal(
    isHardscapeSpecies(catalogRecord),
    false,
    `livestock environment profile ${profile.speciesId} must not resolve to hardscape/substrate`,
  );
  assert.deepEqual(
    auditSpeciesEnvironmentProfiles([profile]),
    [],
    `livestock environment profile ${profile.speciesId} must pass the evidence audit before catalog identity can be trusted`,
  );
}

for (const profile of plantEnvironmentProfiles) {
  assert.equal(
    seenProfileIds.has(profile.speciesId),
    false,
    `environment profile id ${profile.speciesId} must not be duplicated across livestock and plant registries`,
  );
  seenProfileIds.add(profile.speciesId);

  const catalogRecord = catalogById.get(profile.speciesId);
  assert.ok(catalogRecord, `plant environment profile ${profile.speciesId} must resolve to a catalog record`);
  assert.equal(
    isAquaticPlantSpecies(catalogRecord),
    true,
    `plant environment profile ${profile.speciesId} must resolve to a catalog record classified as aquatic plant`,
  );
  assert.equal(
    isHardscapeSpecies(catalogRecord),
    false,
    `plant environment profile ${profile.speciesId} must not resolve to hardscape/substrate`,
  );
  assert.deepEqual(
    auditPlantEnvironmentProfiles([profile]),
    [],
    `plant environment profile ${profile.speciesId} must pass the evidence audit before catalog identity can be trusted`,
  );
}

assert.equal(
  seenProfileIds.size,
  speciesEnvironmentProfiles.length + plantEnvironmentProfiles.length,
  'every environment profile must have one unique catalog identity',
);

console.log(`Environment profile catalog identity: PASS (${speciesEnvironmentProfiles.length} livestock + ${plantEnvironmentProfiles.length} plants, no cross-type or duplicate ids).`);
