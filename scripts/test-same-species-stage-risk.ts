import assert from 'node:assert/strict';
import type { Aquarium, AquariumFish, Fish } from '../src/types';
import { evaluateTankCompatibility } from '../src/lib/tankCompatibilityEngine';
import { reviewSpeciesAdditions } from '../src/services/aquarium/species-addition.service';

const makeFish = (overrides: Partial<Fish> = {}): Fish => ({
  id: 'sp_0436',
  name: '孔雀鱼',
  scientificName: 'Poecilia reticulata',
  category: '淡水观赏鱼',
  image: '',
  difficulty: 'Easy',
  waterTemperature: '22-28°C',
  phLevel: '6.8-7.8',
  waterChangeCycle: 7,
  description: '小型胎生鳉，群体饲养。',
  diet: '杂食',
  tankSize: '至少 20 升',
  temperament: 'Peaceful',
  size: 'Small',
  housingMode: '适合混养',
  ...overrides,
});

const makeTank = (overrides: Partial<Aquarium> = {}): Aquarium => ({
  id: 'stage-risk-tank',
  name: 'Stage risk tank',
  fishes: [],
  dimensions: { length: '120', width: '50', height: '50' },
  waterType: 'Freshwater',
  targetTemperature: '25',
  substrate: '水草泥',
  plants: ['莫丝', '水榕'],
  hardscape: ['沉木'],
  equipment: { filter: '桶滤', heater: true, oxygen: false, light: '水草灯' },
  ...overrides,
});

const makeAdultRecord = (fishId: string): AquariumFish => ({
  id: `${fishId}-record`,
  fishId,
  quantity: 2,
  entryDate: '2026-01-01T00:00:00.000Z',
  batches: [{
    id: `${fishId}-adult-batch`,
    quantity: 2,
    entryDate: '2026-01-01T00:00:00.000Z',
    lifeStage: 'adult',
    reproductiveState: 'normal',
    stateUpdatedAt: '2026-08-01T00:00:00.000Z',
  }],
});

const guppy = makeFish();
const guppyAdultRecord = makeAdultRecord(guppy.id);

const reviewed = evaluateTankCompatibility({
  tank: makeTank(),
  existingSpecies: [{ species: guppy, record: guppyAdultRecord }],
  candidateSpecies: guppy,
  candidateQuantity: 4,
  candidateLifeStage: 'fry',
});

const reviewedRule = reviewed.blockingRules.find(rule => rule.code === 'conspecific_fry_predation');
assert.equal(reviewed.status, 'not_recommended', 'reviewed guppy adult + fry combination must not be treated as safe');
assert.ok(reviewedRule, 'reviewed guppy adult + fry combination must expose conspecific_fry_predation');
assert.equal(reviewedRule?.reviewStatus, 'reviewed', 'stage-risk block must retain reviewed evidence state');
assert.ok((reviewedRule?.citations.length || 0) >= 1, 'stage-risk block must retain at least one reviewed citation');

const unreviewedFish = makeFish({
  id: 'unreviewed-stage-fish',
  name: '未审核测试鱼',
  scientificName: 'Testus stageensis',
});
const unreviewedRecord = makeAdultRecord(unreviewedFish.id);
const unreviewed = evaluateTankCompatibility({
  tank: makeTank(),
  existingSpecies: [{ species: unreviewedFish, record: unreviewedRecord }],
  candidateSpecies: unreviewedFish,
  candidateQuantity: 4,
  candidateLifeStage: 'fry',
});
assert.equal(unreviewed.status, 'insufficient_data', 'unreviewed adult + fry combination must fail closed instead of being labelled compatible');
assert.ok(
  unreviewed.missingData.some(rule => rule.code === 'life_stage_evidence_unreviewed' && rule.reviewStatus === 'draft'),
  'unreviewed adult + fry combination must expose missing stage evidence',
);

const adultWithAdult = evaluateTankCompatibility({
  tank: makeTank(),
  existingSpecies: [{ species: guppy, record: guppyAdultRecord }],
  candidateSpecies: guppy,
  candidateQuantity: 2,
  candidateLifeStage: 'adult',
});
assert.ok(
  [...adultWithAdult.blockingRules, ...adultWithAdult.warningRules, ...adultWithAdult.missingData]
    .every(rule => !['conspecific_fry_predation', 'life_stage_evidence_unreviewed'].includes(rule.code)),
  'same-species adult + adult must not be misclassified as fry-stage risk',
);

const plannedAdditionReview = reviewSpeciesAdditions({
  aquarium: makeTank({ fishes: [guppyAdultRecord] }),
  items: [{ fishId: guppy.id, quantity: 4, lifeStage: 'fry' }],
  speciesCatalog: [guppy],
});
assert.equal(plannedAdditionReview?.status, 'not_recommended', 'planned-addition review must carry existing batches and candidate life stage into the engine');
assert.equal(plannedAdditionReview?.policy, 'block', 'reviewed adult + fry stage risk must block the planned addition before write');
assert.ok(
  plannedAdditionReview?.keyRules.some(rule => rule.code === 'conspecific_fry_predation'),
  'planned-addition review must surface the stage-risk rule to the product layer',
);

console.log('Same-species stage-risk contract: PASS');
