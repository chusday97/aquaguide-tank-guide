import { mkdirSync, writeFileSync } from 'node:fs';
import { fishData } from '../src/data/fishData';
import {
  getCatalogIdentityBoundary,
  type CatalogIdentityBoundaryCode,
} from '../src/data/catalogIdentityBoundaries';
import { getCatalogCanonicalIdentity } from '../src/data/catalogCanonicalIdentity';
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

const classifyBucket = (
  code: CatalogIdentityBoundaryCode,
  scientificName: string,
): MigrationBucket => {
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
    blockingRequirement: blockingRequirement(bucket),
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

const fishDomainBoundaryCount = rows.filter(row => row.lifeType === 'fish').length;
const pairAttributionCount = rows.reduce((sum, row) => sum + row.affectedIdentityUnknownPairs, 0);

const report = {
  schemaVersion: 1,
  generatedFrom: 'source-controlled active catalog identity boundaries + deterministic Compatibility runtime',
  policy: {
    unitOfWork: 'catalog-object identity debt, not precomputed pair packs',
    autoMigrationRule: 'No active identity boundary is auto-migrated from names, suffixes, aliases, parent-taxon similarity, or pair impact. Reviewed identity evidence is required.',
    impactSemantics: 'affectedIdentityUnknownPairs counts current unresolved-identity fish pairs in which the catalog object participates. soleBoundaryIdentityUnknownPairs is the stronger prioritization signal because the opposite fish has no active identity boundary. Neither metric guarantees a compatible verdict after migration; other evidence constraints may remain.',
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
  `- Active identity boundaries: **${report.activeIdentityBoundaries}**`,
  `- Fish-domain identity boundaries: **${report.fishDomainIdentityBoundaries}**`,
  `- Current unresolved-identity fish pairs: **${report.identityUnknownPairs}**`,
  `- One-boundary pairs: **${report.identityUnknownPairsWithOneActiveBoundary}**`,
  `- Two-boundary pairs: **${report.identityUnknownPairsWithTwoActiveBoundaries}**`,
  `- Auto-migratable active boundaries: **${report.autoMigratableCount}**`,
  '',
  '## Migration buckets',
  '',
  ...Object.entries(bucketCounts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([bucket, count]) => `- ${bucket}: ${count}`),
  '',
  '## Highest-impact catalog identity debt',
  '',
  '| Catalog object | Boundary | Required resolution | Identity-unknown pairs | Sole-boundary pairs |',
  '| --- | --- | --- | ---: | ---: |',
  ...rows.slice(0, 30).map(row => (
    `| ${row.speciesId} ${row.name} | ${row.boundaryCode} | ${row.migrationBucket} | ${row.affectedIdentityUnknownPairs} | ${row.soleBoundaryIdentityUnknownPairs} |`
  )),
  '',
  'Pair impact is diagnostic prioritization only. A row remains fail-closed until its identity review graduates through the canonical identity/onboarding gate.',
  '',
].join('\n');

writeFileSync(`${outputDir}/compatibility_identity_migration_audit.md`, markdown);
console.log(JSON.stringify(report, null, 2));
