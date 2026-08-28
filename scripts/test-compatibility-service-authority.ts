import assert from 'node:assert/strict';
import {
  evaluateTankCompatibility,
  getCompatibilityDecision,
} from '../src/services/compatibility/compatibility.service';
import { reviewSpeciesAdditions } from '../src/services/aquarium/species-addition.service';
import type { Aquarium, Fish } from '../src/types';

const makeFish = (id: string, waterType?: Fish['waterType']): Fish => ({
  id,
  name: id,
  scientificName: id,
  category: '小型观赏鱼',
  image: '',
  difficulty: 'Easy',
  waterTemperature: '22-26°C',
  phLevel: '6-8',
  waterChangeCycle: 7,
  description: '',
  diet: '杂食',
  tankSize: '40L',
  temperament: 'Peaceful',
  size: 'Small',
  housingMode: '适合混养',
  ...(waterType ? { waterType } : {}),
});

const tank: Aquarium = {
  id: 'authority-tank',
  name: 'authority tank',
  fishes: [],
  dimensions: { length: '60', width: '30', height: '30' },
  waterType: 'Freshwater',
  targetTemperature: '25',
};

const reviewedA = makeFish('sp_0431', 'freshwater');
const reviewedB = makeFish('sp_0432', 'freshwater');
const reviewedDecision = evaluateTankCompatibility({
  tank,
  existingSpecies: [{ species: reviewedA, record: { quantity: 5 } }],
  candidateSpecies: reviewedB,
  intent: 'planned_addition',
});
assert.equal(reviewedDecision.status, 'caution');
assert.equal(getCompatibilityDecision(reviewedDecision).addPolicy, 'confirm');
assert.equal(reviewedDecision.metadata.domainStatus, reviewedDecision.status);
assert.equal(reviewedDecision.metadata.ruleVersion, 'compatibility-domain-v1');
assert.ok(reviewedDecision.warningRules.some(rule => rule.code === 'pair_rule_group_size_and_shared_water_window'));

const domainOnlyWaterConflict = evaluateTankCompatibility({
  tank,
  existingSpecies: [{ species: reviewedA, record: { quantity: 5 } }],
  candidateSpecies: makeFish('saltwater-candidate', 'saltwater'),
  intent: 'planned_addition',
});
assert.equal(domainOnlyWaterConflict.status, 'not_recommended');
assert.ok(domainOnlyWaterConflict.blockingRules.some(rule => rule.code === 'candidate_tank_water_type_conflict'));

const legacyCompatibleDomainInsufficient = evaluateTankCompatibility({
  tank,
  existingSpecies: [],
  candidateSpecies: makeFish('unreviewed-candidate'),
  intent: 'planned_addition',
});
assert.equal(legacyCompatibleDomainInsufficient.metadata.domainStatus, 'insufficient_data');
assert.equal(legacyCompatibleDomainInsufficient.status, 'insufficient_data');
assert.equal(getCompatibilityDecision(legacyCompatibleDomainInsufficient).addPolicy, 'complete_information');

const recordExistingDecision = evaluateTankCompatibility({
  tank,
  existingSpecies: [],
  candidateSpecies: makeFish('unreviewed-candidate'),
  intent: 'record_existing',
});
assert.equal(recordExistingDecision.status, 'insufficient_data');
assert.equal(getCompatibilityDecision(recordExistingDecision, 'record_existing').addPolicy, 'allow');
const recordReview = reviewSpeciesAdditions({
  aquarium: tank,
  items: [{ fishId: 'unreviewed-candidate', quantity: 1 }],
  speciesCatalog: [makeFish('unreviewed-candidate')],
  intent: 'record_existing',
});
assert.equal(recordReview?.status, 'insufficient_data');
assert.equal(recordReview?.policy, 'save_with_unknown');

const plannedWithoutTank = evaluateTankCompatibility({
  existingSpecies: [{ species: reviewedA, record: { quantity: 1 } }],
  candidateSpecies: reviewedB,
  intent: 'planned_addition',
});
assert.equal(plannedWithoutTank.status, 'insufficient_data');
assert.equal(getCompatibilityDecision(plannedWithoutTank).addPolicy, 'complete_information');

console.log('compatibility service authority verified: Domain status/policy wins and record-existing remains saveable');
