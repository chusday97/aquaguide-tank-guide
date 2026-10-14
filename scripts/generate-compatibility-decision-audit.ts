import { mkdirSync, writeFileSync } from 'node:fs';
import { fishData } from '../src/data/fishData';
import { evaluateCompatibilityDecision } from '../src/modules/knowledge/compatibilityKnowledge';
import { getLifeType } from '../src/modules/species/species.service';
import { buildCompatibilityCoreFieldCoverage } from '../src/services/compatibility/compatibility-field-coverage.service';
import {
  buildCompatibilityDecisionPlan,
  isCompatibilityDecisionFullyInformed,
} from '../src/services/compatibility/compatibility-decision-plan.service';
import type { Aquarium } from '../src/types';

const root = new URL('../', import.meta.url).pathname;
const outputDir = `${root}docs`;
mkdirSync(outputDir, { recursive: true });

const coverage = buildCompatibilityCoreFieldCoverage();
const compatibilityDomainObjects = fishData.filter(
  species => !['plant', 'hardscape'].includes(getLifeType(species)),
);
const fishDomainSpecies = fishData.filter(species => getLifeType(species) === 'fish');
const readyIds = new Set(
  coverage.rows.filter(row => row.genericOnboardingReady).map(row => row.speciesId),
);
const readySpecies = fishData.filter(species => readyIds.has(species.id));

const baseTank: Aquarium = {
  id: 'compatibility-decision-audit',
  name: 'Compatibility decision audit',
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
const unknownReasons: Record<string, number> = {
  missing_user_input: 0,
  unresolved_identity: 0,
  public_evidence_insufficient: 0,
  missing_species_fact: 0,
  other: 0,
};
const unknownRuleCodes = new Map<string, number>();
let fullyInformedPairs = 0;
let fullyInformedUnknownPairs = 0;

for (let leftIndex = 0; leftIndex < fishDomainSpecies.length; leftIndex += 1) {
  for (let rightIndex = leftIndex + 1; rightIndex < fishDomainSpecies.length; rightIndex += 1) {
    const left = fishDomainSpecies[leftIndex];
    const right = fishDomainSpecies[rightIndex];
    const bothSaltwater = String(left.waterType || '').toLowerCase().includes('salt')
      && String(right.waterType || '').toLowerCase().includes('salt');

    const decision = evaluateCompatibilityDecision({
      tank: { ...baseTank, waterType: bothSaltwater ? 'Saltwater' : 'Freshwater' },
      items: [
        { species: left, quantity: 10 },
        { species: right, quantity: 10 },
      ],
    });

    statuses[decision.status] = (statuses[decision.status] || 0) + 1;
    const fullyInformed = isCompatibilityDecisionFullyInformed(decision);
    if (fullyInformed) fullyInformedPairs += 1;

    if (decision.status === 'insufficient_data') {
      if (fullyInformed) fullyInformedUnknownPairs += 1;
      const plan = buildCompatibilityDecisionPlan(decision);
      const reason = plan.unknownReason || 'other';
      unknownReasons[reason] = (unknownReasons[reason] || 0) + 1;
      for (const rule of decision.missingData) {
        unknownRuleCodes.set(rule.code, (unknownRuleCodes.get(rule.code) || 0) + 1);
      }
    }
  }
}

const fishPairs = (fishDomainSpecies.length * (fishDomainSpecies.length - 1)) / 2;
const report = {
  auditPolicy: {
    scope: 'all unique fish-domain pairs under complete synthetic tank inputs',
    note: 'The fixed large tank is a deterministic audit fixture, not a husbandry recommendation. Pair verdict distribution is diagnostic; the hard invariant is fully-informed UNKNOWN = 0.',
  },
  catalogObjects: fishData.length,
  compatibilityDomainObjects: compatibilityDomainObjects.length,
  fishDomainSpecies: fishDomainSpecies.length,
  genericOnboardingReadySpecies: readySpecies.length,
  genericReadyUniquePairs: (readySpecies.length * (readySpecies.length - 1)) / 2,
  fishPairs,
  statuses,
  decisionCoveragePct: Number((((fishPairs - statuses.insufficient_data) / fishPairs) * 100).toFixed(2)),
  fullyInformedPairs,
  fullyInformedUnknownPairs,
  unknownReasons,
  topUnknownRuleCodes: [...unknownRuleCodes.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 20)
    .map(([code, count]) => ({ code, count })),
  coreFieldBacklog: {
    actionableGaps: coverage.backlog.length,
    fieldActionableGaps: coverage.summary.fieldActionableGaps,
    domainOrIdentityHeldSpecies: coverage.summary.domainOrIdentityHeldSpecies,
  },
};

writeFileSync(
  `${outputDir}/compatibility_decision_audit.json`,
  JSON.stringify(report, null, 2) + '\n',
);

console.log(JSON.stringify(report, null, 2));
