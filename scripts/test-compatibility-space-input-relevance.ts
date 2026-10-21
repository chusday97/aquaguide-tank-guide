import assert from 'node:assert/strict';
import { evaluateCompatibility, type DomainSpeciesFact } from '../packages/domain-rules/src/compatibility';
import { fishData } from '../src/data/fishData';
import { evaluateCompatibilityDecision } from '../src/modules/knowledge/compatibilityKnowledge';
import { buildCompatibilityReadableConclusion } from '../src/services/compatibility/compatibility-readable-copy.service';
import type { Aquarium } from '../src/types';

const species = (id: string) => {
  const value = fishData.find(item => item.id === id);
  assert.ok(value, 'missing fixture ' + id);
  return value;
};

const baseFact = (id: string): DomainSpeciesFact => ({
  id,
  waterType: 'freshwater',
  temperatureMinC: 22,
  temperatureMaxC: 26,
  reviewed: true,
  compatibilityRequiredFacts: ['water', 'temperature'],
  evidenceIds: ['fixture-source'],
  lifeType: 'fish',
  size: 'Medium',
});

const existing = baseFact('existing');
const lengthRequired: DomainSpeciesFact = {
  ...baseFact('length-required'),
  minTankLengthCm: 120,
  compatibilityRequiredFacts: ['water', 'temperature', 'tank_size'],
};
const volumeRequired: DomainSpeciesFact = {
  ...baseFact('volume-required'),
  minTankLiters: 180,
  compatibilityRequiredFacts: ['water', 'temperature', 'tank_size'],
};

// Exact field relevance: volume being known does not satisfy a reviewed length requirement.
const missingLength = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'freshwater', volumeLiters: 250, lengthCm: null, targetTemperatureC: 24 },
  existingSpecies: [existing],
  candidateSpecies: lengthRequired,
  candidateQuantity: 1,
  existingQuantities: { existing: 1 },
});
assert.equal(missingLength.status, 'insufficient_data');
assert.ok(missingLength.ruleCodes.includes('tank_length_missing'));
assert.equal(missingLength.ruleCodes.includes('tank_volume_missing'), false);

// Exact field relevance: length being known does not satisfy a reviewed volume requirement.
const missingVolume = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'freshwater', volumeLiters: null, lengthCm: 150, targetTemperatureC: 24 },
  existingSpecies: [existing],
  candidateSpecies: volumeRequired,
  candidateQuantity: 1,
  existingQuantities: { existing: 1 },
});
assert.equal(missingVolume.status, 'insufficient_data');
assert.ok(missingVolume.ruleCodes.includes('tank_volume_missing'));
assert.equal(missingVolume.ruleCodes.includes('tank_length_missing'), false);

// No reviewed space threshold means omitted dimensions are not promoted into a fake blocker.
const noSpaceThreshold = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'freshwater', volumeLiters: null, lengthCm: null, targetTemperatureC: 24 },
  existingSpecies: [existing],
  candidateSpecies: baseFact('no-space-threshold'),
  candidateQuantity: 1,
  existingQuantities: { existing: 1 },
});
assert.equal(noSpaceThreshold.status, 'compatible');
assert.equal(noSpaceThreshold.ruleCodes.includes('tank_volume_missing'), false);
assert.equal(noSpaceThreshold.ruleCodes.includes('tank_length_missing'), false);

// A hard biological blocker must remain the user-facing answer even when space inputs are absent.
const hardBlockTank: Aquarium = {
  id: 'space-relevance-hard-block',
  name: 'Space relevance hard block',
  fishes: [],
  waterType: 'Freshwater',
  dimensions: undefined,
  targetTemperature: '',
};
const hardBlock = evaluateCompatibilityDecision({
  tank: hardBlockTank,
  items: [
    { species: species('sp_0010'), quantity: 12, origin: 'existing' },
    { species: species('sp_0022'), quantity: 1, origin: 'candidate' },
  ],
});
assert.equal(hardBlock.status, 'not_recommended');
assert.ok(hardBlock.blockingRules.some(rule => /water_type/.test(rule.code)));
assert.equal(hardBlock.missingData.length, 0);
const hardBlockCopy = buildCompatibilityReadableConclusion(hardBlock);
assert.doesNotMatch(hardBlockCopy.howTo.join(' '), /鱼缸长度|长宽高|水体容量|补齐鱼缸尺寸/);

// Real reviewed species with a liter threshold: knowing length alone must still request volume.
const lengthOnlyTank: Aquarium = {
  id: 'space-relevance-volume',
  name: 'Space relevance volume',
  fishes: [],
  waterType: 'Freshwater',
  dimensions: { length: '150', width: '', height: '' },
  targetTemperature: '24',
};
const realVolumeMissing = evaluateCompatibilityDecision({
  tank: lengthOnlyTank,
  items: [
    { species: species('sp_0010'), quantity: 12, origin: 'existing' },
    { species: species('sp_0020'), quantity: 5, origin: 'candidate' },
  ],
});
assert.equal(realVolumeMissing.status, 'insufficient_data');
assert.ok(realVolumeMissing.missingData.some(rule => rule.code === 'tank_volume_missing'));
const volumeCopy = buildCompatibilityReadableConclusion(realVolumeMissing);
assert.match(volumeCopy.howTo.join(' '), /水体容量|长宽高/);

console.log('Compatibility space-input relevance PASS: hard blockers outrank omitted dimensions, reviewed length/volume thresholds request only the missing decision-critical field, and species without space thresholds do not invent a tank-size blocker.');
