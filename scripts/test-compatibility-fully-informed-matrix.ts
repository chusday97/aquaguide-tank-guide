import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { evaluateCompatibilityDecision } from '../src/modules/knowledge/compatibilityKnowledge';
import { buildCompatibilityCoreFieldCoverage } from '../src/services/compatibility/compatibility-field-coverage.service';
import {
  buildCompatibilityDecisionPlan,
  isCompatibilityDecisionFullyInformed,
} from '../src/services/compatibility/compatibility-decision-plan.service';
import type { Aquarium } from '../src/types';

const baselineReadySpecies = 53;

const coverage = buildCompatibilityCoreFieldCoverage();
const readyIds = new Set(
  coverage.rows
    .filter(row => row.genericOnboardingReady)
    .map(row => row.speciesId),
);
const readySpecies = fishData.filter(species => readyIds.has(species.id));

assert.ok(
  readySpecies.length >= baselineReadySpecies,
  `generic Compatibility-ready species regressed below baseline: ${readySpecies.length} < ${baselineReadySpecies}`,
);

const baseTank: Aquarium = {
  id: 'compatibility-fully-informed-matrix',
  name: 'Compatibility fully informed matrix',
  fishes: [],
  dimensions: { length: '500', width: '200', height: '100' },
  waterType: 'Freshwater',
  targetTemperature: '25',
  equipment: { filter: '桶滤', heater: true, oxygen: true, light: '普通灯' },
};

const statuses: Record<string, number> = {
  compatible: 0,
  caution: 0,
  not_recommended: 0,
  insufficient_data: 0,
};
let evaluatedPairs = 0;

for (let leftIndex = 0; leftIndex < readySpecies.length; leftIndex += 1) {
  for (let rightIndex = leftIndex + 1; rightIndex < readySpecies.length; rightIndex += 1) {
    const left = readySpecies[leftIndex];
    const right = readySpecies[rightIndex];
    const bothSaltwater = String(left.waterType || '').toLowerCase().includes('salt')
      && String(right.waterType || '').toLowerCase().includes('salt');

    const decision = evaluateCompatibilityDecision({
      tank: { ...baseTank, waterType: bothSaltwater ? 'Saltwater' : 'Freshwater' },
      items: [
        { species: left, quantity: 10 },
        { species: right, quantity: 10 },
      ],
    });

    evaluatedPairs += 1;
    statuses[decision.status] = (statuses[decision.status] || 0) + 1;

    assert.equal(
      isCompatibilityDecisionFullyInformed(decision),
      true,
      `8/8-ready pair must remain fully informed: ${left.id} + ${right.id}`,
    );
    assert.notEqual(
      decision.status,
      'insufficient_data',
      `8/8-ready pair must never surface 暂时无法判断: ${left.id} + ${right.id}`,
    );

    const plan = buildCompatibilityDecisionPlan(decision);
    assert.notEqual(plan.judgment, '暂时无法判断');
    assert.equal(plan.unknownReason, null);
    assert.ok(plan.nextSteps.length > 0);
    assert.ok(plan.reviewCheckpoint.length > 0);
    assert.ok(plan.stopCondition.length > 0);
  }
}

assert.equal(
  evaluatedPairs,
  (readySpecies.length * (readySpecies.length - 1)) / 2,
  'fully informed matrix must evaluate every unique pair',
);
assert.equal(statuses.insufficient_data, 0);

console.log(JSON.stringify({
  readySpecies: readySpecies.length,
  evaluatedPairs,
  statuses,
  invariant: '8/8 ready species + complete tank inputs => zero insufficient_data',
}, null, 2));
