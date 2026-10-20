import { mkdirSync, writeFileSync } from 'node:fs';
import { fishData } from '../src/data/fishData';
import { evaluateCompatibilityDecision } from '../src/modules/knowledge/compatibilityKnowledge';
import { getLifeType } from '../src/modules/species/species.service';
import {
  COMPATIBILITY_HARD_DECISION_FIELDS,
  buildCompatibilityCoreFieldCoverage,
  type CompatibilityFieldCoverageRow,
} from '../src/services/compatibility/compatibility-field-coverage.service';
import type { Aquarium, Fish } from '../src/types';

const root = new URL('../', import.meta.url).pathname;
const outputDir = `${root}docs`;
mkdirSync(outputDir, { recursive: true });

const authoritativeStatuses = new Set(['reviewed_supported', 'reviewed_neutral_or_negative']);
const coverage = buildCompatibilityCoreFieldCoverage();
const rowsById = new Map(coverage.rows.map(row => [row.speciesId, row]));
const predationBacklog = coverage.backlog.filter(item => item.field === 'predation');
const fishDomainSpecies = fishData.filter(species => getLifeType(species) === 'fish');

const unresolvedHardFields = (row: CompatibilityFieldCoverageRow) => (
  COMPATIBILITY_HARD_DECISION_FIELDS.filter(field => !authoritativeStatuses.has(row.fields[field].status))
);

const hardHoldDetails = (row: CompatibilityFieldCoverageRow) => unresolvedHardFields(row).map(field => ({
  field,
  status: row.fields[field].status,
  disposition: row.fields[field].disposition,
  authoritySource: row.fields[field].authoritySource,
  reasonCode: row.fields[field].reasonCode,
}));

const classify = (row: CompatibilityFieldCoverageRow) => {
  const unresolved = hardHoldDetails(row);
  if (unresolved.length === 0) return 'risk_discovery_ready' as const;
  if (unresolved.every(item => item.authoritySource === 'identity_boundary' || item.authoritySource === 'variant_evidence_ceiling')) {
    return 'blocked_by_identity_or_variant' as const;
  }
  return 'blocked_by_other_hard_evidence' as const;
};

const baseTank: Aquarium = {
  id: 'compatibility-predation-decision-impact-audit',
  name: 'Compatibility predation decision impact audit',
  fishes: [],
  dimensions: { length: '500', width: '200', height: '100' },
  waterType: 'Freshwater',
  targetTemperature: '25',
  equipment: { filter: '桶滤', heater: true, oxygen: true, light: '普通灯' },
};

const pairDecision = (candidate: Fish, other: Fish) => {
  const bothSaltwater = String(candidate.waterType || '').toLowerCase().includes('salt')
    && String(other.waterType || '').toLowerCase().includes('salt');
  return evaluateCompatibilityDecision({
    tank: { ...baseTank, waterType: bothSaltwater ? 'Saltwater' : 'Freshwater' },
    items: [
      { species: candidate, quantity: 10 },
      { species: other, quantity: 10 },
    ],
  });
};

const classified = predationBacklog.map(item => {
  const row = rowsById.get(item.speciesId);
  if (!row) throw new Error(`Missing coverage row for ${item.speciesId}`);
  return {
    speciesId: item.speciesId,
    name: item.name,
    scientificName: item.scientificName,
    classification: classify(row),
    authoritativeFieldCount: row.authoritativeFieldCount,
    reviewedProfile: row.reviewedProfile,
    hardHolds: hardHoldDetails(row),
    softTerminalFields: Object.entries(row.fields)
      .filter(([field, cell]) => !COMPATIBILITY_HARD_DECISION_FIELDS.includes(field as typeof COMPATIBILITY_HARD_DECISION_FIELDS[number])
        && field !== 'predation'
        && (cell.disposition === 'terminal_hold' || cell.disposition === 'domain_extension_required'))
      .map(([field]) => field)
      .sort(),
  };
});

const riskDiscoveryReady = classified.filter(item => item.classification === 'risk_discovery_ready').map(item => {
  const candidate = fishDomainSpecies.find(species => species.id === item.speciesId);
  if (!candidate) throw new Error(`Predation candidate ${item.speciesId} is outside fish domain`);

  const statusCounts = {
    compatible: 0,
    caution: 0,
    not_recommended: 0,
    insufficient_data: 0,
  };
  let smallFishReviewSurfacePairs = 0;
  let currentPredationRulePairs = 0;

  for (const other of fishDomainSpecies) {
    if (other.id === candidate.id) continue;
    const decision = pairDecision(candidate, other);
    statusCounts[decision.status] += 1;
    const isReviewSurface = decision.status === 'compatible' || decision.status === 'caution';
    if (isReviewSurface && other.size === 'Small') smallFishReviewSurfacePairs += 1;
    if ((decision.metadata?.domainRuleCodes || []).some(code => /predation|prey/.test(code))) currentPredationRulePairs += 1;
  }

  return {
    ...item,
    pairSurface: {
      totalCounterpartPairs: fishDomainSpecies.length - 1,
      ...statusCounts,
      riskManagementReviewSurfacePairs: statusCounts.compatible + statusCounts.caution,
      smallFishReviewSurfacePairs,
      currentPredationRulePairs,
    },
  };
}).sort((a, b) => (
  b.pairSurface.riskManagementReviewSurfacePairs - a.pairSurface.riskManagementReviewSurfacePairs
  || b.pairSurface.smallFishReviewSurfacePairs - a.pairSurface.smallFishReviewSurfacePairs
  || a.speciesId.localeCompare(b.speciesId)
));

const blockedByIdentityOrVariant = classified.filter(item => item.classification === 'blocked_by_identity_or_variant');
const blockedByOtherHardEvidence = classified.filter(item => item.classification === 'blocked_by_other_hard_evidence');

const taxonMap = new Map<string, {
  scientificName: string;
  catalogObjectIds: string[];
  names: string[];
  maxRiskManagementReviewSurfacePairs: number;
  maxSmallFishReviewSurfacePairs: number;
}>();
for (const item of riskDiscoveryReady) {
  const current = taxonMap.get(item.scientificName) || {
    scientificName: item.scientificName,
    catalogObjectIds: [],
    names: [],
    maxRiskManagementReviewSurfacePairs: 0,
    maxSmallFishReviewSurfacePairs: 0,
  };
  current.catalogObjectIds.push(item.speciesId);
  current.names.push(item.name);
  current.maxRiskManagementReviewSurfacePairs = Math.max(current.maxRiskManagementReviewSurfacePairs, item.pairSurface.riskManagementReviewSurfacePairs);
  current.maxSmallFishReviewSurfacePairs = Math.max(current.maxSmallFishReviewSurfacePairs, item.pairSurface.smallFishReviewSurfacePairs);
  taxonMap.set(item.scientificName, current);
}
const taxonResearchPriority = [...taxonMap.values()]
  .map(item => ({
    ...item,
    catalogObjectIds: [...item.catalogObjectIds].sort(),
    names: [...new Set(item.names)].sort(),
    catalogObjectCount: item.catalogObjectIds.length,
  }))
  .sort((a, b) => (
    b.maxRiskManagementReviewSurfacePairs - a.maxRiskManagementReviewSurfacePairs
    || b.maxSmallFishReviewSurfacePairs - a.maxSmallFishReviewSurfacePairs
    || a.scientificName.localeCompare(b.scientificName)
  ));

const report = {
  generatedFrom: 'source-controlled Compatibility core-field coverage + deterministic pair runtime',
  policy: {
    purpose: 'Separate current hard-decision evidence blockers from predation safety-risk discovery work.',
    hardDecisionFields: [...COMPATIBILITY_HARD_DECISION_FIELDS],
    predationSemantics: 'Predation is a soft evidence fact: missing predation authority does not itself create public_evidence_insufficient. Direct reviewed predation evidence may later add caution/not_recommended risk rules.',
    reviewSurfaceSemantics: 'riskManagementReviewSurfacePairs counts current compatible+caution pairs where predation research could add or refine a risk reason. It is an investigation surface, not a claim that status will change.',
    smallFishSemantics: 'smallFishReviewSurfacePairs is a catalog-size prioritization heuristic only. It does not infer that the candidate eats small fish.',
    noCounterfactualAuthority: true,
  },
  summary: {
    fishDomainSpecies: fishDomainSpecies.length,
    predationResearchBacklogFields: predationBacklog.length,
    hardDecisionResearchDebtFields: coverage.summary.hardDecisionResearchDebtFields,
    softRiskDiscoveryResearchDebtFields: coverage.summary.softRiskDiscoveryResearchDebtFields,
    riskDiscoveryReadyCatalogObjects: riskDiscoveryReady.length,
    riskDiscoveryReadyUniqueTaxa: taxonResearchPriority.length,
    blockedByIdentityOrVariantCatalogObjects: blockedByIdentityOrVariant.length,
    blockedByOtherHardEvidenceCatalogObjects: blockedByOtherHardEvidence.length,
    currentPredationHardInsufficientDataBlockerFields: 0,
  },
  taxonResearchPriority,
  riskDiscoveryReady,
  blockedByIdentityOrVariant,
  blockedByOtherHardEvidence,
};

writeFileSync(
  `${outputDir}/compatibility_predation_decision_impact_audit.json`,
  JSON.stringify(report, null, 2) + '\n',
);

console.log(JSON.stringify({
  ...report.summary,
  topTaxa: taxonResearchPriority.slice(0, 10),
}, null, 2));
