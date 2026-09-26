import assert from 'node:assert/strict';
import { selectCompatibilityLaunchCohort } from '../src/data/compatibility-launch-cohort';
import { evaluateSpeciesCombination } from '../src/lib/tankCompatibilityEngine';

const launchFish = selectCompatibilityLaunchCohort();
const codes = (rules: Array<{ code: string }>) => Array.from(new Set(rules.map(rule => rule.code))).sort();

let pairCount = 0;
for (let leftIndex = 0; leftIndex < launchFish.length; leftIndex += 1) {
  for (let rightIndex = leftIndex + 1; rightIndex < launchFish.length; rightIndex += 1) {
    const left = launchFish[leftIndex];
    const right = launchFish[rightIndex];
    const forward = evaluateSpeciesCombination([left, right]);
    const reverse = evaluateSpeciesCombination([right, left]);
    const label = left.name + ' × ' + right.name;

    assert.equal(reverse.status, forward.status, label + ': status must be order-independent');
    assert.deepEqual(codes(reverse.blockingRules), codes(forward.blockingRules), label + ': blocking rules must be order-independent');
    assert.deepEqual(codes(reverse.warningRules), codes(forward.warningRules), label + ': warning rules must be order-independent');
    assert.deepEqual(codes(reverse.missingData), codes(forward.missingData), label + ': missing-data rules must be order-independent');
    pairCount += 1;
  }
}

assert.equal(pairCount, launchFish.length * (launchFish.length - 1) / 2);
console.log('compatibility symmetry gate: ' + pairCount + ' launch-cohort pairs are order-independent');
