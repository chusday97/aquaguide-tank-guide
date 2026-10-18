import { mkdirSync, writeFileSync } from 'node:fs';
import { fishData } from '../src/data/fishData';
import { evaluateCompatibilityDecision } from '../src/modules/knowledge/compatibilityKnowledge';
import { getLifeType } from '../src/modules/species/species.service';
import {
  buildCompatibilityCoreFieldCoverage,
  buildCompatibilityTaxonResearchPlan,
} from '../src/services/compatibility/compatibility-field-coverage.service';
import {
  buildCompatibilityDecisionPlan,
  isCompatibilityDecisionFullyInformed,
} from '../src/services/compatibility/compatibility-decision-plan.service';
import type { Aquarium } from '../src/types';
import { isCompatibilityCalculatorSelectableSpecies } from '../src/services/compatibility/compatibility-domain-scope.service';

const root = new URL('../', import.meta.url).pathname;
const outputDir = `${root}docs`;
mkdirSync(outputDir, { recursive: true });

const coverage = buildCompatibilityCoreFieldCoverage();
const taxonResearchPlan = buildCompatibilityTaxonResearchPlan();
const researchKeyBySpeciesId = new Map(
  taxonResearchPlan.flatMap(job => job.catalogObjects.map(object => [object.speciesId, job.researchKey] as const)),
);
const compatibilityDomainObjects = fishData.filter(
  species => !['plant', 'hardscape'].includes(getLifeType(species)),
);
const calculatorSelectableSpecies = fishData.filter(isCompatibilityCalculatorSelectableSpecies);
const unsupportedSelectorObjects = compatibilityDomainObjects.filter(species => !isCompatibilityCalculatorSelectableSpecies(species));
const unsupportedSelectorByLifeType = unsupportedSelectorObjects.reduce<Record<string, number>>((acc, species) => {
  const lifeType = getLifeType(species);
  acc[lifeType] = (acc[lifeType] || 0) + 1;
  return acc;
}, {});
const fishDomainSpecies = fishData.filter(species => getLifeType(species) === 'fish');
const readyIds = new Set(
  coverage.rows.filter(row => row.genericOnboardingReady).map(row => row.speciesId),
);
const readySpecies = fishData.filter(species => readyIds.has(species.id));
const coverageRowsById = new Map(coverage.rows.map(row => [row.speciesId, row]));

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
  system_gap: 0,
};
const unknownRuleCodes = new Map<string, number>();
const unknownPairImpactBySpecies = new Map<string, number>();
const unknownPairImpactByTaxon = new Map<string, number>();
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
      unknownPairImpactBySpecies.set(left.id, (unknownPairImpactBySpecies.get(left.id) || 0) + 1);
      unknownPairImpactBySpecies.set(right.id, (unknownPairImpactBySpecies.get(right.id) || 0) + 1);
      const affectedTaxa = new Set(
        [researchKeyBySpeciesId.get(left.id), researchKeyBySpeciesId.get(right.id)]
          .filter((researchKey): researchKey is string => Boolean(researchKey)),
      );
      for (const researchKey of affectedTaxa) {
        unknownPairImpactByTaxon.set(researchKey, (unknownPairImpactByTaxon.get(researchKey) || 0) + 1);
      }
      if (fullyInformed) fullyInformedUnknownPairs += 1;
      const plan = buildCompatibilityDecisionPlan(decision);
      const reason = plan.unknownReason || 'system_gap';
      unknownReasons[reason] = (unknownReasons[reason] || 0) + 1;
      for (const rule of decision.missingData) {
        unknownRuleCodes.set(rule.code, (unknownRuleCodes.get(rule.code) || 0) + 1);
      }
    }
  }
}

const speciesImpactRows = [...unknownPairImpactBySpecies.entries()].map(([speciesId, unknownPairs]) => {
  const species = fishData.find(item => item.id === speciesId);
  const row = coverageRowsById.get(speciesId);
  const actionableFields = Object.entries(row?.fields || {})
    .filter(([, cell]) => cell.disposition === 'targeted_source_expansion')
    .map(([field]) => field);
  const terminalReasons = Array.from(new Set(
    Object.values(row?.fields || {})
      .filter(cell => ['terminal_hold', 'domain_extension_required'].includes(cell.disposition))
      .map(cell => cell.reasonCode)
      .filter((reason): reason is string => Boolean(reason)),
  ));
  return {
    speciesId,
    name: species?.name || speciesId,
    scientificName: species?.scientificName || '',
    unknownPairs,
    actionableFields,
    terminalReasons,
  };
});

const highestLeverageEvidenceTargets = speciesImpactRows
  .filter(item => item.actionableFields.length > 0 && item.terminalReasons.length === 0)
  .sort((a, b) => b.unknownPairs - a.unknownPairs || a.actionableFields.length - b.actionableFields.length || a.speciesId.localeCompare(b.speciesId))
  .slice(0, 20);

const taxonDecisionImpactQueue = taxonResearchPlan.map(job => {
  const gapInstances = job.catalogObjects.reduce((sum, object) => sum + object.gaps.length, 0);
  const nearReadyCatalogObjects = job.catalogObjects.filter(object => (
    coverageRowsById.get(object.speciesId)?.authoritativeFieldCount === 7
  )).length;
  const terminalGapInstances = job.catalogObjects.reduce((sum, object) => (
    sum + (coverageRowsById.get(object.speciesId)?.terminalGapCount || 0)
  ), 0);
  const terminalBlockedCatalogObjects = job.catalogObjects.filter(object => (
    (coverageRowsById.get(object.speciesId)?.terminalGapCount || 0) > 0
  )).length;
  const completionEligible = terminalGapInstances === 0;
  const affectedUnknownPairs = unknownPairImpactByTaxon.get(job.researchKey) || 0;
  return {
    researchKey: job.researchKey,
    baseScientificName: job.baseScientificName,
    completionEligible,
    affectedUnknownPairs,
    gapInstances,
    terminalGapInstances,
    terminalBlockedCatalogObjects,
    impactPerGap: gapInstances > 0 ? Number((affectedUnknownPairs / gapInstances).toFixed(2)) : 0,
    nearReadyCatalogObjects,
    catalogObjectCount: job.catalogObjectCount,
    combinedGapFields: job.combinedGapFields,
    requiresVariantBridgeReview: job.requiresVariantBridgeReview,
    researchDisposition: job.researchDisposition,
    existingCoveragePriorityScore: job.priorityScore,
  };
}).sort((a, b) => (
  Number(b.completionEligible) - Number(a.completionEligible)
  || b.impactPerGap - a.impactPerGap
  || b.affectedUnknownPairs - a.affectedUnknownPairs
  || b.nearReadyCatalogObjects - a.nearReadyCatalogObjects
  || a.gapInstances - b.gapInstances
  || b.catalogObjectCount - a.catalogObjectCount
  || a.researchKey.localeCompare(b.researchKey)
));

const completionEligibleTaxonQueue = taxonDecisionImpactQueue.filter(item => item.completionEligible);
const terminalBlockedTaxonQueue = taxonDecisionImpactQueue.filter(item => !item.completionEligible);

const terminalReasonCounts = new Map<string, number>();
for (const item of speciesImpactRows) {
  for (const reason of item.terminalReasons) {
    terminalReasonCounts.set(reason, (terminalReasonCounts.get(reason) || 0) + 1);
  }
}

const maxOppositeSpecies = Math.max(1, fishDomainSpecies.length - 1);
const terminalUserExposureTargets = speciesImpactRows
  .filter(item => item.terminalReasons.length > 0)
  .map(item => {
    const exposureSharePct = Number(((item.unknownPairs / maxOppositeSpecies) * 100).toFixed(2));
    return {
      ...item,
      exposureSharePct,
      impactBand: exposureSharePct >= 80
        ? 'high'
        : exposureSharePct >= 40
          ? 'medium'
          : 'low',
    };
  })
  .sort((a, b) => b.unknownPairs - a.unknownPairs || a.speciesId.localeCompare(b.speciesId));

const fishPairs = (fishDomainSpecies.length * (fishDomainSpecies.length - 1)) / 2;
const unknownRatePct = fishPairs === 0 ? 0 : Number(((statuses.insufficient_data / fishPairs) * 100).toFixed(2));
const systemGapPairs = unknownReasons.system_gap || 0;
const systemGapPct = fishPairs === 0 ? 0 : Number(((systemGapPairs / fishPairs) * 100).toFixed(4));
const report = {
  auditPolicy: {
    scope: 'all unique fish-domain pairs under complete synthetic tank inputs',
    note: 'The fixed large tank is a deterministic audit fixture, not a husbandry recommendation. Pair verdict distribution is diagnostic; with complete tank inputs the hard invariants are fully-informed UNKNOWN = 0, internal missing_species_fact/system_gap UNKNOWN = 0, and every remaining UNKNOWN must be unresolved identity or genuinely insufficient public evidence.',
  },
  catalogObjects: fishData.length,
  compatibilityDomainObjects: compatibilityDomainObjects.length,
  calculatorSelectableSpecies: calculatorSelectableSpecies.length,
  unsupportedSelectorObjects: unsupportedSelectorObjects.length,
  unsupportedSelectorByLifeType,
  fishDomainSpecies: fishDomainSpecies.length,
  genericOnboardingReadySpecies: readySpecies.length,
  genericReadyUniquePairs: (readySpecies.length * (readySpecies.length - 1)) / 2,
  fishPairs,
  statuses,
  decisionCoveragePct: Number((((fishPairs - statuses.insufficient_data) / fishPairs) * 100).toFixed(2)),
  unknownRatePct,
  systemGapPairs,
  systemGapPct,
  fullyInformedPairs,
  fullyInformedUnknownPairs,
  unknownReasons,
  userPathExposure: {
    scope: 'uniform unique-pair exposure across species currently selectable in the fish Compatibility calculator',
    calculatorSelectableSpecies: calculatorSelectableSpecies.length,
    uniqueSelectablePairs: fishPairs,
    unknownPairs: statuses.insufficient_data,
    uniformUnknownRatePct: unknownRatePct,
    observedTrafficProbability: null,
    note: 'uniformUnknownRatePct is a catalog-pair stress metric, not observed user traffic probability. Unsupported non-fish livestock are excluded from the calculator because the current deterministic domain is explicitly fish-only.',
    unknownReasons,
    fullyInformedUnknownPairs,
    systemGapPairs,
    terminalUserExposureTargets,
  },
  leverageQueues: {
    policy: 'Prioritize reviewed evidence work by actual UNKNOWN-pair impact. affectedUnknownPairs means the taxon participates in that many current UNKNOWN pairs; it is not a guarantee that resolving the taxon alone will unlock every pair because the opposite species or non-core facts can remain blocking.',
    highestLeverageEvidenceTargets,
    taxonDecisionImpactQueue,
    completionEligibleTaxonQueue,
    terminalBlockedTaxonQueue,
    taxonQueueSummary: {
      totalResearchJobs: taxonDecisionImpactQueue.length,
      completionEligibleJobs: completionEligibleTaxonQueue.length,
      terminalBlockedJobs: terminalBlockedTaxonQueue.length,
      completionEligibleCatalogObjects: completionEligibleTaxonQueue.reduce((sum, item) => sum + item.catalogObjectCount, 0),
      terminalBlockedCatalogObjects: terminalBlockedTaxonQueue.reduce((sum, item) => sum + item.catalogObjectCount, 0),
    },
    terminalReasonCounts: [...terminalReasonCounts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([reason, speciesCount]) => ({ reason, speciesCount })),
  },
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
