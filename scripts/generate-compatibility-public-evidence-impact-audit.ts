import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfileForFish } from '../src/data/compatibilityEvidence';
import { evaluateCompatibilityDecision } from '../src/modules/knowledge/compatibilityKnowledge';
import { getLifeType } from '../src/modules/species/species.service';
import {
  buildCompatibilityCoreFieldCoverage,
  type CompatibilityCoreField,
  type CompatibilityFieldCoverageRow,
} from '../src/services/compatibility/compatibility-field-coverage.service';
import { buildCompatibilityDecisionPlan } from '../src/services/compatibility/compatibility-decision-plan.service';
import type { Aquarium, Fish } from '../src/types';

const root = new URL('../', import.meta.url).pathname;
const outputDir = `${root}docs`;
mkdirSync(outputDir, { recursive: true });

const HARD_PUBLIC_EVIDENCE_FACTS = ['water', 'temperature', 'adult_size'] as const satisfies readonly CompatibilityCoreField[];

type HardFact = typeof HARD_PUBLIC_EVIDENCE_FACTS[number];
type PairBlocker = {
  speciesId: string;
  speciesName: string;
  scientificName: string;
  field: HardFact;
  coverageDisposition: string;
  authoritySource: string;
  reasonCode: string | null;
  reviewedProfile: CompatibilityFieldCoverageRow['reviewedProfile'];
};

const coverage = buildCompatibilityCoreFieldCoverage();
const coverageRowsById = new Map(coverage.rows.map(row => [row.speciesId, row]));
const fishDomainSpecies = fishData.filter(species => getLifeType(species) === 'fish');
const decisionAudit = JSON.parse(readFileSync(`${outputDir}/compatibility_decision_audit.json`, 'utf8'));
const expectedPublicEvidencePairs = Number(decisionAudit.unknownReasons?.public_evidence_insufficient || 0);

const baseTank: Aquarium = {
  id: 'compatibility-public-evidence-impact-audit',
  name: 'Compatibility public evidence impact audit',
  fishes: [],
  dimensions: { length: '500', width: '200', height: '100' },
  waterType: 'Freshwater',
  targetTemperature: '25',
  equipment: { filter: '桶滤', heater: true, oxygen: true, light: '普通灯' },
};

const runtimeDisposition = (
  fish: Fish,
  row: CompatibilityFieldCoverageRow,
  field: CompatibilityCoreField,
) => {
  const cell = row.fields[field];
  const reviewed = getReviewedCompatibilityProfileForFish(fish);
  if (cell.disposition === 'targeted_source_expansion') return 'research_pending' as const;
  if (cell.disposition === 'terminal_hold' && cell.authoritySource === 'identity_boundary') return 'identity_unresolved' as const;
  if (cell.disposition === 'terminal_hold') {
    return reviewed?.requiredFacts?.includes(field) ? 'ready' as const : 'public_evidence_insufficient' as const;
  }
  if (cell.disposition === 'domain_extension_required') {
    return reviewed ? 'ready' as const : 'public_evidence_insufficient' as const;
  }
  return 'ready' as const;
};

const blockersForSpecies = (species: Fish): PairBlocker[] => {
  const row = coverageRowsById.get(species.id);
  if (!row) return [];
  // Attribute with the same field-level disposition used by the runtime.
  // A reviewed Profile can still have a terminal hard fact outside its
  // requiredFacts (for example temperature). Pair overlap checks remain
  // fail-closed for that fact, so reviewed species must not be excluded here.
  return HARD_PUBLIC_EVIDENCE_FACTS.flatMap(field => {
    if (runtimeDisposition(species, row, field) !== 'public_evidence_insufficient') return [];
    const cell = row.fields[field];
    return [{
      speciesId: species.id,
      speciesName: species.name,
      scientificName: species.scientificName,
      field,
      coverageDisposition: cell.disposition,
      authoritySource: cell.authoritySource,
      reasonCode: cell.reasonCode,
      reviewedProfile: row.reviewedProfile,
    }];
  });
};

const pairRows: Array<{
  pairId: string;
  speciesIds: [string, string];
  speciesNames: [string, string];
  scientificNames: [string, string];
  blockers: PairBlocker[];
  blockerFields: HardFact[];
  blockerSpeciesIds: string[];
  singleFactUnlockable: boolean;
  singleSpeciesBlocked: boolean;
  terminalByCurrentEvidenceStrategy: boolean;
  domainRuleCodes: string[];
  missingDataRuleCodes: string[];
}> = [];

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
    if (decision.status !== 'insufficient_data') continue;
    const plan = buildCompatibilityDecisionPlan(decision);
    if (plan.unknownReason !== 'public_evidence_insufficient') continue;

    const blockers = [...blockersForSpecies(left), ...blockersForSpecies(right)];
    const blockerFields = [...new Set(blockers.map(blocker => blocker.field))].sort() as HardFact[];
    const blockerSpeciesIds = [...new Set(blockers.map(blocker => blocker.speciesId))].sort();
    pairRows.push({
      pairId: [left.id, right.id].sort().join('__'),
      speciesIds: [left.id, right.id],
      speciesNames: [left.name, right.name],
      scientificNames: [left.scientificName, right.scientificName],
      blockers,
      blockerFields,
      blockerSpeciesIds,
      singleFactUnlockable: blockers.length === 1,
      singleSpeciesBlocked: blockerSpeciesIds.length === 1,
      terminalByCurrentEvidenceStrategy: blockers.length > 0 && blockers.every(blocker => (
        blocker.coverageDisposition === 'terminal_hold' || blocker.coverageDisposition === 'domain_extension_required'
      )),
      domainRuleCodes: [...new Set(decision.metadata?.domainRuleCodes || [])].sort(),
      missingDataRuleCodes: [...new Set(decision.missingData.map(rule => rule.code))].sort(),
    });
  }
}

const byField = HARD_PUBLIC_EVIDENCE_FACTS.map(field => {
  const pairs = pairRows.filter(pair => pair.blockers.some(blocker => blocker.field === field));
  const blockers = pairs.flatMap(pair => pair.blockers.filter(blocker => blocker.field === field));
  return {
    field,
    pairCount: pairs.length,
    blockerInstances: blockers.length,
    speciesCount: new Set(blockers.map(blocker => blocker.speciesId)).size,
    singleFactUnlockablePairs: pairs.filter(pair => pair.singleFactUnlockable).length,
    reasonCodes: [...new Set(blockers.map(blocker => blocker.reasonCode).filter((value): value is string => Boolean(value)))].sort(),
  };
});

const speciesAccumulator = new Map<string, {
  speciesId: string;
  name: string;
  scientificName: string;
  affectedPairs: Set<string>;
  soleSpeciesBlockingPairs: Set<string>;
  singleFactUnlockablePairs: Set<string>;
  hardFields: Set<HardFact>;
  reasonCodes: Set<string>;
}>();

for (const pair of pairRows) {
  for (const blocker of pair.blockers) {
    const row = speciesAccumulator.get(blocker.speciesId) || {
      speciesId: blocker.speciesId,
      name: blocker.speciesName,
      scientificName: blocker.scientificName,
      affectedPairs: new Set<string>(),
      soleSpeciesBlockingPairs: new Set<string>(),
      singleFactUnlockablePairs: new Set<string>(),
      hardFields: new Set<HardFact>(),
      reasonCodes: new Set<string>(),
    };
    row.affectedPairs.add(pair.pairId);
    if (pair.singleSpeciesBlocked) row.soleSpeciesBlockingPairs.add(pair.pairId);
    if (pair.singleFactUnlockable) row.singleFactUnlockablePairs.add(pair.pairId);
    row.hardFields.add(blocker.field);
    if (blocker.reasonCode) row.reasonCodes.add(blocker.reasonCode);
    speciesAccumulator.set(blocker.speciesId, row);
  }
}

const bySpecies = [...speciesAccumulator.values()]
  .map(row => ({
    speciesId: row.speciesId,
    name: row.name,
    scientificName: row.scientificName,
    affectedPairs: row.affectedPairs.size,
    soleSpeciesBlockingPairs: row.soleSpeciesBlockingPairs.size,
    singleFactUnlockablePairs: row.singleFactUnlockablePairs.size,
    hardFields: [...row.hardFields].sort(),
    reasonCodes: [...row.reasonCodes].sort(),
  }))
  .sort((a, b) => (
    b.singleFactUnlockablePairs - a.singleFactUnlockablePairs
    || b.soleSpeciesBlockingPairs - a.soleSpeciesBlockingPairs
    || b.affectedPairs - a.affectedPairs
    || a.speciesId.localeCompare(b.speciesId)
  ));

const unattributedPairs = pairRows.filter(pair => pair.blockers.length === 0);
const nonTerminalAttributionPairs = pairRows.filter(pair => pair.blockers.length > 0 && !pair.terminalByCurrentEvidenceStrategy);
const singleFactUnlockablePairs = pairRows.filter(pair => pair.singleFactUnlockable);
const singleSpeciesBlockedPairs = pairRows.filter(pair => pair.singleSpeciesBlocked);

const pairIds = new Set<string>();
for (const pair of pairRows) {
  if (pairIds.has(pair.pairId)) throw new Error(`duplicate pair attribution: ${pair.pairId}`);
  pairIds.add(pair.pairId);
  if (pair.blockers.length === 0) throw new Error(`unattributed public-evidence pair: ${pair.pairId}`);
  if (pair.blockerSpeciesIds.length === 0) throw new Error(`missing blocker species: ${pair.pairId}`);
  for (const blocker of pair.blockers) {
    if (!HARD_PUBLIC_EVIDENCE_FACTS.includes(blocker.field)) {
      throw new Error(`soft field cannot explain public-evidence UNKNOWN: ${pair.pairId}:${blocker.field}`);
    }
    if (blocker.authoritySource === 'identity_boundary') {
      throw new Error(`identity blocker leaked into public-evidence audit: ${pair.pairId}`);
    }
    if (blocker.coverageDisposition !== 'terminal_hold' && blocker.coverageDisposition !== 'domain_extension_required') {
      throw new Error(`non-terminal blocker leaked into public-evidence audit: ${pair.pairId}:${blocker.coverageDisposition}`);
    }
  }
}

const pairIdDigest = createHash('sha256')
  .update([...pairIds].sort().join('\n'))
  .digest('hex');

const report = {
  auditPolicy: {
    scope: 'all unique fish-domain pairs classified as public_evidence_insufficient by the canonical decision evaluator under the same complete synthetic tank fixture as compatibility_decision_audit.json',
    hardFacts: HARD_PUBLIC_EVIDENCE_FACTS,
    note: 'Legacy missingData entries are presentation diagnostics and are not treated as causal blockers. Attribution follows the runtime coverage-to-domain disposition mapping for every participating species, including reviewed Profiles that retain a terminal hard-fact ceiling outside requiredFacts.',
  },
  summary: {
    fishDomainSpecies: fishDomainSpecies.length,
    decisionAuditPublicEvidencePairs: expectedPublicEvidencePairs,
    attributedPublicEvidencePairs: pairRows.length,
    exactDecisionAuditParity: pairRows.length === expectedPublicEvidencePairs,
    unattributedPairs: unattributedPairs.length,
    nonTerminalAttributionPairs: nonTerminalAttributionPairs.length,
    singleFactUnlockablePairs: singleFactUnlockablePairs.length,
    multiFactBlockedPairs: pairRows.length - singleFactUnlockablePairs.length,
    singleSpeciesBlockedPairs: singleSpeciesBlockedPairs.length,
    multiSpeciesBlockedPairs: pairRows.length - singleSpeciesBlockedPairs.length,
    terminalByCurrentEvidenceStrategyPairs: pairRows.filter(pair => pair.terminalByCurrentEvidenceStrategy).length,
    pairIdDigest,
  },
  byField,
  bySpecies,
  topSingleFactUnlockTargets: bySpecies
    .filter(row => row.singleFactUnlockablePairs > 0)
    .slice(0, 30),
  unattributedPairIds: unattributedPairs.map(pair => pair.pairId),
  nonTerminalAttributionPairIds: nonTerminalAttributionPairs.map(pair => pair.pairId),
};

writeFileSync(
  `${outputDir}/compatibility_public_evidence_impact_audit.json`,
  JSON.stringify(report, null, 2) + '\n',
);

console.log(JSON.stringify({
  summary: report.summary,
  byField: report.byField,
  topSingleFactUnlockTargets: report.topSingleFactUnlockTargets.slice(0, 10),
}, null, 2));
