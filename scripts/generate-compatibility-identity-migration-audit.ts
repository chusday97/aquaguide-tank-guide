import { mkdirSync, writeFileSync } from 'node:fs';
import { fishData } from '../src/data/fishData';
import {
  getCatalogIdentityBoundary,
  type CatalogIdentityBoundaryCode,
} from '../src/data/catalogIdentityBoundaries';
import { getCatalogCanonicalIdentity } from '../src/data/catalogCanonicalIdentity';
import { getCatalogFieldReviews } from '../src/data/catalogFieldReviews';
import { getCatalogIdentityResearchDebt } from '../src/data/catalogIdentityResearchDebt';
import { evaluateCompatibilityDecision } from '../src/modules/knowledge/compatibilityKnowledge';
import { getLifeType } from '../src/modules/species/species.service';
import { buildCompatibilityCoreFieldCoverage } from '../src/services/compatibility/compatibility-field-coverage.service';
import { buildCompatibilityDecisionPlan } from '../src/services/compatibility/compatibility-decision-plan.service';
import type { Aquarium, Fish } from '../src/types';

type MigrationBucket =
  | 'taxonomic_research_candidate'
  | 'variant_object_evidence_required'
  | 'parent_taxon_resolution_required'
  | 'trade_name_disambiguation_required'
  | 'accepted_alias_trade_disambiguation_required'
  | 'commercial_hybrid_hold'
  | 'catalog_structure_correction_required';


type MigrationPath =
  | 'identity_only_after_exact_evidence'
  | 'partial_inheritance_review'
  | 'exact_variant_label_disambiguation'
  | 'base_authority_or_parent_resolution'
  | 'taxonomic_review'
  | 'trade_name_disambiguation'
  | 'hybrid_object_specific_hold'
  | 'catalog_structure_correction';

type ExistingIdentityEvidenceStatus =
  | 'supported_identity_review_present'
  | 'reviewed_identity_hold_present'
  | 'no_object_identity_review';

const outputDir = new URL('../docs/', import.meta.url).pathname;
mkdirSync(outputDir, { recursive: true });

const coverage = buildCompatibilityCoreFieldCoverage();
const coverageById = new Map(coverage.rows.map(row => [row.speciesId, row]));
const activeBoundaryRows = fishData
  .map(species => ({ species, boundary: getCatalogIdentityBoundary(species.id) }))
  .filter((item): item is { species: Fish; boundary: NonNullable<ReturnType<typeof getCatalogIdentityBoundary>> } => Boolean(item.boundary));
const activeBoundaryIds = new Set(activeBoundaryRows.map(item => item.species.id));

const baseTank: Aquarium = {
  id: 'compatibility-identity-migration-audit',
  name: 'Compatibility identity migration audit',
  fishes: [],
  dimensions: { length: '500', width: '200', height: '100' },
  waterType: 'Freshwater',
  targetTemperature: '25',
  equipment: { filter: '桶滤', heater: true, oxygen: true, light: '普通灯' },
};

const isPlainBinomial = (scientificName: string) => (
  /^[A-Z][a-z-]+\s+[a-z][a-z-]+$/.test(scientificName.trim())
);


const stripVariantSuffix = (scientificName: string) => (
  scientificName.trim().replace(/\s+(?:var\.?|cf\.?|aff\.?).*$/i, '').trim()
);

const hasBlankVariantSuffix = (scientificName: string) => (
  /\s+var\.?\s*$/i.test(scientificName.trim())
);

const hasMorphologyRisk = (species: Fish) => {
  const text = (species.name || '') + ' ' + (species.scientificName || '');
  return /balloon|super\s*balloon|short\s*body|shortbody|longfin|long\s*fin|high\s*fin|veil|double\s*tail|doubletail|球形|短身|长鳍|高鳍|大帆|蝶尾|水泡|珠鳞|狮头|虎头|鹤顶|兰寿|琉金/i.test(text);
};

const getExistingIdentityEvidenceStatus = (speciesId: string): ExistingIdentityEvidenceStatus => {
  const identityReviews = getCatalogFieldReviews(speciesId).filter(review => review.field === 'identity');
  if (identityReviews.some(review => review.status === 'reviewed' && review.resolution === 'supported')) {
    return 'supported_identity_review_present';
  }
  if (identityReviews.some(review => review.status === 'reviewed')) {
    return 'reviewed_identity_hold_present';
  }
  return 'no_object_identity_review';
};

const classifyBucket = (
  code: CatalogIdentityBoundaryCode,
  scientificName: string,
): MigrationBucket => {
  if (
    (code === 'catalog_scientific_name_unresolved' || code === 'catalog_variant_identity_unresolved')
    && hasBlankVariantSuffix(scientificName)
  ) {
    return 'catalog_structure_correction_required';
  }
  switch (code) {
    case 'trade_name_taxon_ambiguous':
      return 'trade_name_disambiguation_required';
    case 'accepted_taxon_alias_trade_ambiguous':
      return 'accepted_alias_trade_disambiguation_required';
    case 'commercial_hybrid_identity_unresolved':
      return 'commercial_hybrid_hold';
    case 'catalog_parent_taxon_unresolved':
      return 'parent_taxon_resolution_required';
    case 'catalog_variant_identity_unresolved':
      return 'variant_object_evidence_required';
    case 'catalog_scientific_name_unresolved':
      return isPlainBinomial(scientificName)
        ? 'taxonomic_research_candidate'
        : 'variant_object_evidence_required';
    case 'catalog_common_name_identity_mismatch':
    case 'catalog_object_type_mismatch':
    case 'catalog_category_mismatch':
      return 'catalog_structure_correction_required';
  }
};

const blockingRequirement = (bucket: MigrationBucket) => {
  switch (bucket) {
    case 'taxonomic_research_candidate':
      return 'Confirm the exact scientific taxon in an authoritative taxonomy source before identity review can graduate.';
    case 'variant_object_evidence_required':
      return 'Provide exact-object evidence for the named ornamental variant/lineage and an explicit field-level inheritance policy; base-species naming alone is insufficient.';
    case 'parent_taxon_resolution_required':
      return 'Resolve the catalog object to one exact parent taxon before any base-species Compatibility authority can be inherited.';
    case 'trade_name_disambiguation_required':
      return 'Disambiguate the aquarium trade object to an exact taxon; the trade name currently spans multiple taxa or hybrid lineages.';
    case 'accepted_alias_trade_disambiguation_required':
      return 'An accepted taxonomic alias is known, but the trade object still needs exact-taxon disambiguation before migration.';
    case 'commercial_hybrid_hold':
      return 'Keep commercial hybrid lineage authority object-specific; do not coerce the object into a single parent taxon.';
    case 'catalog_structure_correction_required':
      return 'Correct the catalog identity/type/category record and re-review the object before Compatibility readiness.';
  }
};

type Impact = {
  affectedIdentityUnknownPairs: number;
  soleBoundaryIdentityUnknownPairs: number;
  sharedBoundaryIdentityUnknownPairs: number;
};


const migrationPathFor = ({
  speciesId,
  bucket,
  scientificName,
  morphologyRisk,
  readyBaseCandidateCount,
}: {
  speciesId: string;
  bucket: MigrationBucket;
  scientificName: string;
  morphologyRisk: boolean;
  readyBaseCandidateCount: number;
}): MigrationPath => {
  const researchDebt = getCatalogIdentityResearchDebt(speciesId);
  if (researchDebt?.migrationPathOverride) return researchDebt.migrationPathOverride;
  if (bucket === 'commercial_hybrid_hold') return 'hybrid_object_specific_hold';
  if (bucket === 'trade_name_disambiguation_required' || bucket === 'accepted_alias_trade_disambiguation_required') return 'trade_name_disambiguation';
  if (bucket === 'parent_taxon_resolution_required') return 'base_authority_or_parent_resolution';
  if (bucket === 'taxonomic_research_candidate') return 'taxonomic_review';
  if (bucket === 'catalog_structure_correction_required') return 'catalog_structure_correction';
  if (hasBlankVariantSuffix(scientificName)) return 'exact_variant_label_disambiguation';
  if (readyBaseCandidateCount === 0) return 'base_authority_or_parent_resolution';
  if (morphologyRisk) return 'partial_inheritance_review';
  return 'identity_only_after_exact_evidence';
};

const nextActionForPath = (path: MigrationPath) => {
  switch (path) {
    case 'identity_only_after_exact_evidence':
      return 'Find exact-object identity evidence tying the named ornamental form to the ready canonical base; if confirmed, use canonical inheritance rather than copying base facts.';
    case 'partial_inheritance_review':
      return 'Verify exact object identity, then review a partial inheritance allowlist because morphology-changing forms must not inherit all Compatibility facts by default.';
    case 'exact_variant_label_disambiguation':
      return 'Resolve the missing or blank ornamental variant label before canonical mapping; base-species similarity alone is insufficient.';
    case 'base_authority_or_parent_resolution':
      return 'Resolve one exact parent or base taxon and ensure its Compatibility authority is ready before inheritance can be considered.';
    case 'taxonomic_review':
      return 'Confirm the exact accepted taxon in an authoritative taxonomy source before Compatibility onboarding.';
    case 'trade_name_disambiguation':
      return 'Disambiguate the trade or common-name object to one exact taxon or lineage before Compatibility onboarding.';
    case 'hybrid_object_specific_hold':
      return 'Keep this commercial hybrid object-specific; do not force it onto a single parent species without lineage evidence.';
    case 'catalog_structure_correction':
      return 'Correct the catalog identity, type, or category record and re-review the object before Compatibility onboarding.';
  }
};

const impactBySpecies = new Map<string, Impact>();
for (const id of activeBoundaryIds) {
  impactBySpecies.set(id, {
    affectedIdentityUnknownPairs: 0,
    soleBoundaryIdentityUnknownPairs: 0,
    sharedBoundaryIdentityUnknownPairs: 0,
  });
}

const fishDomainSpecies = fishData.filter(species => getLifeType(species) === 'fish');
let identityUnknownPairs = 0;
let identityUnknownPairsWithOneActiveBoundary = 0;
let identityUnknownPairsWithTwoActiveBoundaries = 0;
let identityUnknownPairsWithoutActiveBoundary = 0;

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
    const reason = buildCompatibilityDecisionPlan(decision).unknownReason || 'system_gap';
    if (reason !== 'unresolved_identity') continue;

    identityUnknownPairs += 1;
    const boundarySpeciesIds = [left.id, right.id].filter(id => activeBoundaryIds.has(id));
    if (boundarySpeciesIds.length === 1) identityUnknownPairsWithOneActiveBoundary += 1;
    else if (boundarySpeciesIds.length === 2) identityUnknownPairsWithTwoActiveBoundaries += 1;
    else identityUnknownPairsWithoutActiveBoundary += 1;

    for (const speciesId of boundarySpeciesIds) {
      const impact = impactBySpecies.get(speciesId);
      if (!impact) continue;
      impact.affectedIdentityUnknownPairs += 1;
      if (boundarySpeciesIds.length === 1) impact.soleBoundaryIdentityUnknownPairs += 1;
      else impact.sharedBoundaryIdentityUnknownPairs += 1;
    }
  }
}

const rows = activeBoundaryRows.map(({ species, boundary }) => {
  const bucket = classifyBucket(boundary.code, species.scientificName || '');
  const impact = impactBySpecies.get(species.id) || {
    affectedIdentityUnknownPairs: 0,
    soleBoundaryIdentityUnknownPairs: 0,
    sharedBoundaryIdentityUnknownPairs: 0,
  };
  const coverageRow = coverageById.get(species.id);
  const canonicalIdentity = getCatalogCanonicalIdentity(species.id);
  const strippedBaseScientificName = stripVariantSuffix(species.scientificName || '');
  const baseCandidates = fishData
    .filter(candidate => candidate.id !== species.id && (candidate.scientificName || '').trim() === strippedBaseScientificName)
    .map(candidate => {
      const baseCoverage = coverageById.get(candidate.id);
      return {
        speciesId: candidate.id,
        name: candidate.name,
        scientificName: candidate.scientificName || '',
        genericOnboardingReady: baseCoverage?.genericOnboardingReady || false,
        authoritativeFieldCount: baseCoverage?.authoritativeFieldCount || 0,
      };
    });
  const readyBaseCandidates = baseCandidates.filter(candidate => candidate.genericOnboardingReady);
  const morphologyRisk = hasMorphologyRisk(species);
  const identityEvidenceStatus = getExistingIdentityEvidenceStatus(species.id);
  const identityResearchDebt = getCatalogIdentityResearchDebt(species.id);
  const migrationPath = migrationPathFor({
    speciesId: species.id,
    bucket,
    scientificName: species.scientificName || '',
    morphologyRisk,
    readyBaseCandidateCount: readyBaseCandidates.length,
  });
  return {
    speciesId: species.id,
    name: species.name,
    scientificName: species.scientificName || '',
    lifeType: getLifeType(species),
    boundaryCode: boundary.code,
    resolvedGranularity: boundary.resolvedGranularity,
    migrationBucket: bucket,
    migrationReadiness: 'blocked_review_required' as const,
    autoMigrationAllowed: false as const,
    candidateTaxa: boundary.candidateTaxa,
    singleCandidateHint: boundary.candidateTaxa.length === 1 ? boundary.candidateTaxa[0] : null,
    sourceIds: boundary.sourceIds,
    reviewedAt: boundary.reviewedAt,
    researchDisposition: boundary.researchDisposition || null,
    blockingRequirement: blockingRequirement(bucket),
    migrationPath,
    nextAction: nextActionForPath(migrationPath),
    identityEvidenceStatus,
    identityResearchDebt: identityResearchDebt || null,
    researchDebtStatus: identityResearchDebt?.status || null,
    researchDebtReviewedAt: identityResearchDebt?.reviewedAt || null,
    researchDebtBlockingReason: identityResearchDebt?.blockingReason || null,
    researchDebtReopenRequirement: identityResearchDebt?.reopenRequirement || null,
    nonQualifyingReferenceCount: identityResearchDebt?.nonQualifyingReferences.length || 0,
    blankVariantSuffix: hasBlankVariantSuffix(species.scientificName || ''),
    morphologyRisk,
    strippedBaseScientificName,
    baseCandidates,
    readyBaseCandidates,
    readyBaseCandidateCount: readyBaseCandidates.length,
    genericOnboardingReady: coverageRow?.genericOnboardingReady || false,
    canonicalIdentityPresent: Boolean(canonicalIdentity),
    ...impact,
  };
}).sort((a, b) => (
  b.soleBoundaryIdentityUnknownPairs - a.soleBoundaryIdentityUnknownPairs
  || b.affectedIdentityUnknownPairs - a.affectedIdentityUnknownPairs
  || a.speciesId.localeCompare(b.speciesId)
));

const bucketCounts = rows.reduce<Record<string, number>>((acc, row) => {
  acc[row.migrationBucket] = (acc[row.migrationBucket] || 0) + 1;
  return acc;
}, {});

const boundaryCodeCounts = rows.reduce<Record<string, number>>((acc, row) => {
  acc[row.boundaryCode] = (acc[row.boundaryCode] || 0) + 1;
  return acc;
}, {});

const migrationPathCounts = rows.reduce<Record<string, number>>((acc, row) => {
  acc[row.migrationPath] = (acc[row.migrationPath] || 0) + 1;
  return acc;
}, {});

const migrationPathSoleBoundaryImpact = rows.reduce<Record<string, number>>((acc, row) => {
  acc[row.migrationPath] = (acc[row.migrationPath] || 0) + row.soleBoundaryIdentityUnknownPairs;
  return acc;
}, {});

const identityEvidenceStatusCounts = rows.reduce<Record<string, number>>((acc, row) => {
  acc[row.identityEvidenceStatus] = (acc[row.identityEvidenceStatus] || 0) + 1;
  return acc;
}, {});

const researchDebtStatusCounts = rows.reduce<Record<string, number>>((acc, row) => {
  if (!row.researchDebtStatus) return acc;
  acc[row.researchDebtStatus] = (acc[row.researchDebtStatus] || 0) + 1;
  return acc;
}, {});

const terminalIdentityHoldCount = rows.filter(row => row.researchDisposition === 'terminal_unknown_hold').length;

const fishDomainBoundaryCount = rows.filter(row => row.lifeType === 'fish').length;
const pairAttributionCount = rows.reduce((sum, row) => sum + row.affectedIdentityUnknownPairs, 0);

const report = {
  schemaVersion: 3,
  generatedFrom: 'source-controlled active catalog identity boundaries + deterministic Compatibility runtime',
  policy: {
    unitOfWork: 'catalog-object identity debt, not precomputed pair packs',
    autoMigrationRule: 'No active identity boundary is auto-migrated from names, suffixes, aliases, parent-taxon similarity, or pair impact. Reviewed identity evidence is required.',
    impactSemantics: 'affectedIdentityUnknownPairs counts current unresolved-identity fish pairs in which the catalog object participates. soleBoundaryIdentityUnknownPairs is the stronger prioritization signal because the opposite fish has no active identity boundary. Neither metric guarantees a compatible verdict after migration; other evidence constraints may remain.',
    migrationPathSemantics: 'migrationPath is a planning lane, not authority. identity_only_after_exact_evidence still requires exact-object identity evidence before canonical inheritance can graduate.',
    researchDebtSemantics: 'identityResearchDebt records reviewed failed/insufficient evidence passes and known false bridges. It never grants authority; it can only keep or narrow a migration lane.',
    terminalDispositionSemantics: 'catalogIdentityBoundaries.researchDisposition=terminal_unknown_hold means the reviewed identity lane is closed to automatic re-search until new qualifying evidence or an explicit catalog correction reopens it.',
  },
  activeIdentityBoundaries: rows.length,
  fishDomainIdentityBoundaries: fishDomainBoundaryCount,
  identityUnknownPairs,
  identityUnknownPairsWithOneActiveBoundary,
  identityUnknownPairsWithTwoActiveBoundaries,
  identityUnknownPairsWithoutActiveBoundary,
  pairAttributionCount,
  autoMigratableCount: rows.filter(row => row.autoMigrationAllowed).length,
  boundaryCodeCounts,
  migrationBucketCounts: bucketCounts,
  migrationPathCounts,
  migrationPathSoleBoundaryImpact,
  identityEvidenceStatusCounts,
  researchDebtStatusCounts,
  researchedHighImpactHoldCount: rows.filter(row => row.identityResearchDebt).length,
  terminalIdentityHoldCount,
  identityOnlyAfterExactEvidenceCount: rows.filter(row => row.migrationPath === 'identity_only_after_exact_evidence').length,
  partialInheritanceReviewCount: rows.filter(row => row.migrationPath === 'partial_inheritance_review').length,
  topPriority: rows.slice(0, 30),
  rows,
};

writeFileSync(
  `${outputDir}/compatibility_identity_migration_audit.json`,
  JSON.stringify(report, null, 2) + '\n',
);

const markdown = [
  '# Compatibility Identity Migration Audit',
  '',
  '> Species-level migration planning only. This is not a pair precompute table and does not create Compatibility authority.',
  '',
  '- Active identity boundaries: **' + report.activeIdentityBoundaries + '**',
  '- Fish-domain identity boundaries: **' + report.fishDomainIdentityBoundaries + '**',
  '- Current unresolved-identity fish pairs: **' + report.identityUnknownPairs + '**',
  '- One-boundary pairs: **' + report.identityUnknownPairsWithOneActiveBoundary + '**',
  '- Two-boundary pairs: **' + report.identityUnknownPairsWithTwoActiveBoundaries + '**',
  '- Auto-migratable active boundaries: **' + report.autoMigratableCount + '**',
  '',
  '## Migration buckets',
  '',
  ...Object.entries(bucketCounts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([bucket, count]) => '- ' + bucket + ': ' + count),
  '',
  '## Migration paths',
  '',
  ...Object.entries(migrationPathCounts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([path, count]) => '- ' + path + ': ' + count + ' objects / ' + (migrationPathSoleBoundaryImpact[path] || 0) + ' sole-boundary pairs'),
  '',
  '- Identity-only after exact evidence: **' + report.identityOnlyAfterExactEvidenceCount + '**',
  '- Partial inheritance review: **' + report.partialInheritanceReviewCount + '**',
  '- Reviewed research-debt holds: **' + report.researchedHighImpactHoldCount + '**',
  '- Source-controlled terminal identity holds: **' + report.terminalIdentityHoldCount + '**',
  '',
  '## Reviewed evidence-debt holds',
  '',
  '| Catalog object | Research status | Blocking reason | Reopen requirement |',
  '| --- | --- | --- | --- |',
  ...rows.filter(row => row.identityResearchDebt).map(row => (
    '| ' + row.speciesId + ' ' + row.name
    + ' | ' + row.researchDebtStatus
    + ' | ' + row.researchDebtBlockingReason
    + ' | ' + row.researchDebtReopenRequirement + ' |'
  )),
  '',
  '## Highest-impact catalog identity debt',
  '',
  '| Catalog object | Boundary | Migration path | Ready base | Morphology risk | Identity-unknown pairs | Sole-boundary pairs |',
  '| --- | --- | --- | ---: | --- | ---: | ---: |',
  ...rows.slice(0, 30).map(row => '| ' + row.speciesId + ' ' + row.name + ' | ' + row.boundaryCode + ' | ' + row.migrationPath + ' | ' + row.readyBaseCandidateCount + ' | ' + (row.morphologyRisk ? 'yes' : 'no') + ' | ' + row.affectedIdentityUnknownPairs + ' | ' + row.soleBoundaryIdentityUnknownPairs + ' |'),
  '',
  'Pair impact is diagnostic prioritization only. A row remains fail-closed until its identity review graduates through the canonical identity/onboarding gate.',
  '',
].join('\n');

writeFileSync(`${outputDir}/compatibility_identity_migration_audit.md`, markdown);
console.log(JSON.stringify(report, null, 2));
