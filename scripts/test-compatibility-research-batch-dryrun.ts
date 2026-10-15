import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import type { CompatibilityTaxonResearchPlanItem } from '../src/services/compatibility/compatibility-field-coverage.service';
import type { CompatibilitySpeciesIdentityResolver, CompatibilitySpeciesResearchProvider } from '../src/services/compatibility/species-onboarding-research.service';
import { runCompatibilityResearchBatchDryRun } from './run-compatibility-research-batch-dryrun';

const jobs: CompatibilityTaxonResearchPlanItem[] = [
  {
    researchKey: 'Example exactus', baseScientificName: 'Example exactus', priorityScore: 100,
    catalogObjectCount: 1, exactObjectCount: 1, variantObjectCount: 0, unresolvedObjectCount: 0,
    combinedGapFields: ['water', 'predation'], requiresVariantBridgeReview: false,
    researchDisposition: 'exact_taxon_research', promotionPolicy: 'review required',
    catalogObjects: [{ speciesId: 'sp_test_exact', name: 'Exact', scientificName: 'Example exactus', gaps: ['water', 'predation'], isVariant: false, isExactBaseTaxon: true }],
  },
  {
    researchKey: 'Example variantus', baseScientificName: 'Example variantus', priorityScore: 90,
    catalogObjectCount: 1, exactObjectCount: 0, variantObjectCount: 1, unresolvedObjectCount: 0,
    combinedGapFields: ['water'], requiresVariantBridgeReview: true,
    researchDisposition: 'base_taxon_candidate_research_with_variant_bridge', promotionPolicy: 'must never auto-promote',
    catalogObjects: [{ speciesId: 'sp_test_variant', name: 'Variant', scientificName: 'Example variantus red', gaps: ['water'], isVariant: true, isExactBaseTaxon: false }],
  },
];

const identityResolver: CompatibilitySpeciesIdentityResolver = {
  id: 'mock-identity',
  resolve: async scientificName => ({ status: 'verified', queriedScientificName: scientificName, canonicalName: scientificName, externalId: 'mock:1', sourceUrl: 'https://example.edu/taxon/1', confidence: 100, reasonCode: 'gbif_exact_species_match' }),
};

const researchTargets: string[][] = [];
const researchProvider: CompatibilitySpeciesResearchProvider = {
  id: 'mock-research',
  research: async input => {
    researchTargets.push([...(input.targetFields || [])].sort());
    return ({
    packetId: 'packet-' + input.catalogKey,
    providerId: 'mock-research', catalogKey: input.catalogKey, commonName: input.commonName || input.scientificName,
    scientificName: input.scientificName, identityStatus: 'verified',
    sources: [{ id: 'src-1', title: 'Direct species page', publisher: 'Test Authority', url: 'https://example.edu/species', sourceType: 'university', reviewStatus: 'draft', contentVerified: true }],
    claims: [{ field: 'water', proposedValue: 'freshwater', sourceId: 'src-1', evidenceKind: 'direct', confidence: 'high' }],
    });
  },
};

const report = await runCompatibilityResearchBatchDryRun({ jobs, identityResolver, researchProvider, concurrency: 2 });
assert.equal(report.writesAuthority, false);
assert.equal(report.summary.jobs, 2);
assert.equal(report.summary.requestedCatalogFieldGaps, 3);
assert.equal(report.summary.potentialCatalogFieldClosures, 1, 'exact taxon hit may be counted as a potential reviewed closure');
assert.equal(report.summary.variantCandidateFieldHits, 1, 'variant base-taxon hit must remain candidate-only');
assert.deepEqual(researchTargets, [['predation', 'water'], ['water']], 'batch research must request only unresolved fields for each taxon job');
assert.equal(report.results[0].potentialCatalogFieldClosures, 1);
assert.deepEqual(report.results[0].reviewCandidates, [{
  field: 'water',
  proposedValue: 'freshwater',
  sourceIds: ['src-1'],
  sourceUrls: ['https://example.edu/species'],
  notes: [],
}], 'dry-run output must retain the exact proposed value and source provenance needed for later human review');
assert.equal(report.results[1].potentialCatalogFieldClosures, 0);
assert.equal(report.results[1].variantCandidateFieldHits, 1);

const source = readFileSync('scripts/run-compatibility-research-batch-dryrun.ts', 'utf8');
assert.doesNotMatch(source, /getAdminSupabase|SUPABASE_SERVICE_ROLE_KEY|\.from\(['"]|\.insert\(|\.update\(|\.upsert\(|\.delete\(/, 'dry-run runner must not contain DB-authority write paths');
assert.match(source, /writesAuthority:\s*false/);
assert.match(source, /targetFields:\s*job\.combinedGapFields/);
assert.match(source, /arg\('offset'\)/);
console.log('Compatibility research batch dry-run PASS: GBIF/research assessment orchestration is read-only; exact hits and variant candidate hits stay separated.');
