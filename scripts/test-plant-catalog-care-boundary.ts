import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { plantEnvironmentProfiles } from '../src/data/plantEnvironmentProfiles';
import { isAquaticPlantSpecies } from '../src/lib/speciesClassification';
import { auditPlantEnvironmentProfiles } from '../src/modules/environment/environmentProfileRegistry';
import { buildSpeciesCarePresentation } from '../src/modules/knowledge/speciesCarePresentation';

const plants = fishData.filter(isAquaticPlantSpecies);
const reviewedPlantIds = new Set(
  plantEnvironmentProfiles
    .filter(profile => profile.evidence.reviewStatus === 'reviewed')
    .filter(profile => auditPlantEnvironmentProfiles([profile]).length === 0)
    .map(profile => profile.speciesId),
);

assert.ok(plants.length > 0, 'catalog plant boundary requires at least one classified aquatic plant');

for (const plant of plants) {
  const presentation = buildSpeciesCarePresentation(plant);
  assert.equal(
    presentation.feedingItems.length,
    0,
    `${plant.id} ${plant.scientificName} is classified as plant and must never expose animal feeding items`,
  );

  if (reviewedPlantIds.has(plant.id)) {
    assert.equal(
      presentation.sourceStatus,
      'verified',
      `${plant.id} has an audit-clean reviewed plant profile and must surface verified plant care`,
    );
    assert.equal(
      presentation.hasStructuredProfile,
      true,
      `${plant.id} reviewed plant profile must surface structured plant care`,
    );
  } else {
    assert.equal(
      presentation.sourceStatus,
      'pending',
      `${plant.id} has no audit-clean reviewed plant profile and must remain fail-closed`,
    );
    assert.equal(
      presentation.hasStructuredProfile,
      false,
      `${plant.id} unreviewed plant must not inherit a generic animal care profile`,
    );
  }
}

for (const profile of plantEnvironmentProfiles) {
  const catalogRecord = fishData.find(item => item.id === profile.speciesId);
  assert.ok(catalogRecord, `plant environment profile ${profile.speciesId} must resolve to a catalog record`);
  assert.equal(
    isAquaticPlantSpecies(catalogRecord),
    true,
    `plant environment profile ${profile.speciesId} must resolve to a record classified as plant`,
  );
}

const categoryAnomalies = plants.filter(plant => !/水草|植物|plant/i.test(plant.category || ''));
const rawFeedingProfileAnomalies = plants.filter(plant => Boolean(plant.feedingProfile));

// Baseline captured by Environment Decision V1 #95 on 2026-08-18.
// Legacy debt may shrink, but new catalog work must not increase it.
assert.ok(
  categoryAnomalies.length <= 30,
  `raw plant category debt must not grow beyond the audited baseline of 30; got ${categoryAnomalies.length}`,
);
assert.ok(
  rawFeedingProfileAnomalies.length <= 65,
  `raw animal feeding-profile debt on plants must not grow beyond the audited baseline of 65; got ${rawFeedingProfileAnomalies.length}`,
);

console.log(JSON.stringify({
  classifiedPlants: plants.length,
  reviewedPlantProfiles: reviewedPlantIds.size,
  rawCategoryAnomalies: categoryAnomalies.length,
  rawAnimalFeedingProfileAnomalies: rawFeedingProfileAnomalies.length,
  categoryDebtBudget: 30,
  animalFeedingProfileDebtBudget: 65,
  categoryAnomalyIds: categoryAnomalies.slice(0, 20).map(item => item.id),
  feedingProfileAnomalyIds: rawFeedingProfileAnomalies.slice(0, 20).map(item => item.id),
}, null, 2));
console.log('Plant catalog care boundary: PASS (all classified plants fail closed; legacy plant-data debt cannot increase).');
