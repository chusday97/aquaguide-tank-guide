import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { selectCompatibilityLaunchCohort } from '../src/data/compatibility-launch-cohort';
import { evaluateCompatibility, type DomainSpeciesFact } from '../packages/domain-rules/src';

const parseRange = (value?: string) => {
  if (!value) return [null, null] as const;
  const numbers = value.match(/\d+(?:\.\d+)?/g)?.map(Number) || [];
  return numbers.length >= 2 ? [numbers[0], numbers[1]] as const : [null, null] as const;
};

const toFact = (species: (typeof fishData)[number]): DomainSpeciesFact => {
  const reviewed = getReviewedCompatibilityProfile(species.id);
  const [temperatureMinC, temperatureMaxC] = parseRange(species.waterTemperature);
  const [phMin, phMax] = parseRange(species.phLevel);
  return {
    id: species.id,
    waterType: species.waterType || 'unknown',
    temperatureMinC,
    temperatureMaxC,
    phMin,
    phMax,
    minTankLiters: null,
    minTankLengthCm: null,
    reviewed: Boolean(reviewed && reviewed.reviewStatus === 'reviewed' && reviewed.citations.length > 0),
    compatibilityRequiredFacts: reviewed?.requiredFacts,
    minimumGroupSize: reviewed?.minimumGroupSize,
    behaviorTraits: reviewed?.behaviorTraits,
    evidenceIds: reviewed?.citations.map(citation => citation.id) || [],
    size: species.size,
  };
};

const cohort = selectCompatibilityLaunchCohort();
assert.equal(cohort.length, 30);
assert.equal(cohort.length * (cohort.length - 1) / 2, 435);
const facts = cohort.map(toFact);
const tank = { waterType: 'freshwater' as const, volumeLiters: 1000, lengthCm: 200, targetTemperatureC: 25 };
let insufficientPairs = 0;

for (let left = 0; left < facts.length; left += 1) {
  for (let right = left + 1; right < facts.length; right += 1) {
    const forward = evaluateCompatibility({
      intent: 'planned_addition',
      tank,
      existingSpecies: [facts[left]],
      candidateSpecies: facts[right],
      candidateQuantity: 1,
      existingQuantities: { [facts[left].id]: 1 },
      catalogVersion: 'matrix-test-v1',
    });
    const reverse = evaluateCompatibility({
      intent: 'planned_addition',
      tank,
      existingSpecies: [facts[right]],
      candidateSpecies: facts[left],
      candidateQuantity: 1,
      existingQuantities: { [facts[right].id]: 1 },
      catalogVersion: 'matrix-test-v1',
    });
    const repeat = evaluateCompatibility({
      intent: 'planned_addition',
      tank,
      existingSpecies: [facts[left]],
      candidateSpecies: facts[right],
      candidateQuantity: 1,
      existingQuantities: { [facts[left].id]: 1 },
      catalogVersion: 'matrix-test-v1',
    });
    assert.equal(forward.status, reverse.status, `${facts[left].id}/${facts[right].id} must be symmetric`);
    assert.deepEqual(forward, repeat, `${facts[left].id}/${facts[right].id} must be deterministic`);
    if (forward.status === 'insufficient_data') insufficientPairs += 1;
  }
}

assert.ok(insufficientPairs > 0, 'unreviewed cohort pairs must fail closed as insufficient_data');
console.log(`compatibility launch matrix verified: 435 unordered pairs, ${insufficientPairs} safely insufficient, deterministic and symmetric`);
