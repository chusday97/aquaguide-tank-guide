import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  buildCompatibilityResearchReviewManifest,
  reconcileCompatibilityResearchBatchReportToActiveScopes,
  reconcileCompatibilityResearchReviewManifestToActiveScopes,
} from '../src/services/compatibility/research-review-queue.service';

const report = {
  generatedAt: '2026-10-16T12:00:00.000Z',
  pages: [{
    results: [
      {
        researchKey: 'Safeus reviewus',
        scientificName: 'Safeus reviewus',
        catalogObjects: [{ speciesId: 'sp_review', name: 'Review', scientificName: 'Safeus reviewus', isVariant: false, isExactBaseTaxon: true }],
        requestedGapFields: ['ph'],
        researchScope: { unresolvedFields: [], complete: true },
        identity: { status: 'verified', canonicalName: 'Safeus reviewus', reasonCode: 'gbif_exact_accepted_species' },
        workItem: { queue: 'gap_review', reasonCodes: [] },
        packet: {
          sources: [{
            id: 'source-a',
            url: 'https://example.org/a',
            title: 'A',
            publisher: 'Example',
            sourceType: 'university',
            reviewStatus: 'draft',
            contentVerified: true,
          }],
        },
        reviewPacket: {
          fields: [{
            field: 'ph',
            status: 'supported',
            proposedValue: { min: 7, max: 8 },
            sourceIds: ['source-a'],
            notes: ['Direct aquarium pH evidence.'],
            draftReview: { confidence: 'high' },
          }],
        },
        resumeBundle: {
          acquisition: {
            attemptedUrls: ['https://example.org/a', 'https://example.edu/a'],
            round: 2,
            preferredSourceTypes: ['government', 'university'],
          },
          documents: [{
            id: 'source-a',
            url: 'https://example.org/a',
            title: 'A',
            publisher: 'Example',
            sourceType: 'university',
            text: 'RAW TEXT MUST NOT ENTER MANIFEST',
            contentSha256: 'abc123',
          }],
        },
      },
      {
        researchKey: 'Gapus researchus',
        scientificName: 'Gapus researchus',
        catalogObjects: [{ speciesId: 'sp_gap', name: 'Gap', scientificName: 'Gapus researchus', isVariant: false, isExactBaseTaxon: true }],
        requestedGapFields: ['predation', 'ph'],
        researchScope: { unresolvedFields: ['predation'], complete: false },
        workItem: { queue: 'evidence_gap', reasonCodes: ['field_missing_predation'] },
      },
      {
        researchKey: 'Retryus gbif',
        scientificName: 'Retryus gbif',
        requestedGapFields: ['predation'],
        identity: { status: 'provider_unavailable', canonicalName: null, reasonCode: 'gbif_request_failed' },
        workItem: { queue: 'identity_review', reasonCodes: ['gbif_request_failed'] },
      },
      {
        researchKey: 'Ambiguus taxon',
        scientificName: 'Ambiguus taxon',
        requestedGapFields: ['predation'],
        identity: { status: 'ambiguous', canonicalName: 'Ambiguus taxon', reasonCode: 'gbif_match_requires_review' },
        workItem: { queue: 'identity_review', reasonCodes: ['gbif_match_requires_review'] },
      },
    ],
  }],
};

const manifest = buildCompatibilityResearchReviewManifest([{ sourcePath: 'fixture.json', report }], '2026-10-16T13:00:00.000Z');
assert.equal(manifest.writesAuthority, false);
assert.equal(manifest.promotionAllowed, false);
assert.equal(manifest.rawSourceTextCommitted, false);
assert.equal(manifest.summary.field_review, 1);
assert.equal(manifest.summary.targeted_source_expansion, 1);
assert.equal(manifest.summary.identity_provider_retry, 1);
assert.equal(manifest.summary.identity_review, 1);

const review = manifest.items.find(item => item.queue === 'field_review')!;
assert.deepEqual(review.fieldCandidates[0]?.proposedValue, { min: 7, max: 8 });
assert.equal(review.requiresHumanReview, true);
assert.equal(review.promotionAllowed, false);
assert.equal(review.verifiedSources[0]?.id, 'source-a');
assert.equal(review.verifiedSources[0]?.contentSha256, 'abc123');
assert.deepEqual(review.fieldCandidates[0]?.sourceIds, ['source-a']);
assert.equal('text' in (review.verifiedSources[0] || {}), false, 'raw fetched source text must never be copied into the persistent review manifest');
assert.equal(review.researchHistory.rounds, 2);
assert.deepEqual(review.researchHistory.attemptedUrls, ['https://example.org/a', 'https://example.edu/a']);
assert.ok(review.researchHistory.attemptedSourceTypes.includes('university'));

const gap = manifest.items.find(item => item.queue === 'targeted_source_expansion')!;
assert.deepEqual(gap.nextResearch, {
  mode: 'targeted_source_expansion',
  targetFields: ['predation'],
  repeatsReviewedFields: false,
  preferredSourceTypes: ['government', 'peer_reviewed', 'university', 'professional_association', 'curated_husbandry'],
  excludeAttemptedUrlCount: 0,
});
assert.equal(gap.requiresHumanReview, false);

const retry = manifest.items.find(item => item.queue === 'identity_provider_retry')!;
assert.equal(retry.identity?.reasonCode, 'gbif_request_failed');
assert.equal(retry.requiresHumanReview, false, 'temporary identity-provider failure should retry instead of consuming manual identity-review capacity');

const identity = manifest.items.find(item => item.queue === 'identity_review')!;
assert.equal(identity.identity?.reasonCode, 'gbif_match_requires_review');
assert.equal(identity.requiresHumanReview, true);

const persistedBase = buildCompatibilityResearchReviewManifest([{
  sourcePath: 'base.json',
  report: {
    pages: [{
      results: [{
        researchKey: 'Persisted review',
        scientificName: 'Persisted review',
        catalogObjects: [{ speciesId: 'sp_persisted', name: 'Persisted', scientificName: 'Persisted review', isVariant: false, isExactBaseTaxon: true }],
        requestedGapFields: ['ph'],
        workItem: { queue: 'gap_review', reasonCodes: [] },
        packet: { sources: [{ id: 'persisted-source', url: 'https://example.org/persisted', title: 'Persisted', publisher: 'Example', sourceType: 'university', contentVerified: true }] },
        reviewPacket: { fields: [{ field: 'ph', status: 'supported', proposedValue: { min: 7, max: 8 }, sourceIds: ['persisted-source'], notes: ['Direct.'], draftReview: { confidence: 'high' } }] },
        resumeBundle: { documents: [{ url: 'https://example.org/persisted', title: 'Persisted', publisher: 'Example', sourceType: 'university', text: 'not persisted', contentSha256: 'persisted-hash' }] },
      }],
    }],
  },
}], '2026-10-16T13:00:00.000Z');
const refreshedFromNewReportOnly = buildCompatibilityResearchReviewManifest([{
  sourcePath: 'new-only.json',
  report: {
    pages: [{
      results: [{
        researchKey: 'New gap',
        scientificName: 'New gap',
        catalogObjects: [{ speciesId: 'sp_new_gap', name: 'New gap', scientificName: 'New gap', isVariant: false, isExactBaseTaxon: true }],
        requestedGapFields: ['predation'],
        researchScope: { unresolvedFields: ['predation'], complete: false },
        workItem: { queue: 'evidence_gap', reasonCodes: ['field_missing_predation'] },
      }],
    }],
  },
}], '2026-10-16T14:00:00.000Z', persistedBase);
assert.equal(refreshedFromNewReportOnly.summary.field_review, 1, 'persisted queue state must survive refresh even when prior raw reports are unavailable');
assert.equal(refreshedFromNewReportOnly.summary.targeted_source_expansion, 1);
assert.equal(refreshedFromNewReportOnly.items.find(item => item.researchKey === 'Persisted review')?.researchHistory.rounds, 0, 'persisted review without acquisition history remains stable');
assert.ok(refreshedFromNewReportOnly.items.some(item => item.researchKey === 'Persisted review'));
assert.ok(refreshedFromNewReportOnly.generatedFrom.includes('base.json'));
assert.ok(refreshedFromNewReportOnly.generatedFrom.includes('new-only.json'));

const verifiedThenTransient = buildCompatibilityResearchReviewManifest([
  {
    sourcePath: 'verified.json',
    report: {
      pages: [{
        results: [{
          researchKey: 'Stableus identity',
          scientificName: 'Stableus identity',
          catalogObjects: [{ speciesId: 'sp_stable', name: 'Stable', scientificName: 'Stableus identity', isVariant: false, isExactBaseTaxon: true }],
          requestedGapFields: ['predation'],
          researchScope: { unresolvedFields: ['predation'], complete: false },
          identity: { status: 'verified', canonicalName: 'Stableus identity', reasonCode: 'gbif_exact_accepted_species' },
          workItem: { queue: 'evidence_gap', reasonCodes: ['field_missing_predation'] },
        }],
      }],
    },
  },
  {
    sourcePath: 'transient.json',
    report: {
      pages: [{
        results: [{
          researchKey: 'Stableus identity',
          scientificName: 'Stableus identity',
          catalogObjects: [{ speciesId: 'sp_stable', name: 'Stable', scientificName: 'Stableus identity', isVariant: false, isExactBaseTaxon: true }],
          requestedGapFields: ['predation'],
          identity: { status: 'provider_unavailable', canonicalName: null, reasonCode: 'gbif_request_failed' },
          workItem: { queue: 'identity_review', reasonCodes: ['gbif_request_failed'] },
        }],
      }],
    },
  },
], '2026-10-16T13:00:00.000Z');
assert.equal(verifiedThenTransient.items.length, 1);
assert.equal(verifiedThenTransient.items[0]?.queue, 'targeted_source_expansion', 'temporary GBIF failure must not downgrade an already verified identity/research task');
assert.equal(verifiedThenTransient.items[0]?.identity?.status, 'verified');

const inferenceBadcase = buildCompatibilityResearchReviewManifest([{
  sourcePath: 'predation-inference.json',
  report: {
    pages: [{
      results: [{
        researchKey: 'Moenkhausia sanctaefilomenae',
        scientificName: 'Moenkhausia sanctaefilomenae',
        catalogObjects: [{ speciesId: 'sp_inference', name: 'Inference', scientificName: 'Moenkhausia sanctaefilomenae', isVariant: false, isExactBaseTaxon: true }],
        requestedGapFields: ['predation'],
        researchScope: { unresolvedFields: [], complete: true },
        workItem: { queue: 'gap_review', reasonCodes: [] },
        packet: { sources: [{ id: 'source-inference', url: 'https://example.org/inference', title: 'Inference', publisher: 'Example', sourceType: 'curated_husbandry', contentVerified: true }] },
        reviewPacket: { fields: [{
          field: 'predation',
          status: 'supported',
          proposedValue: { targets: ['fish_fry'] },
          sourceIds: ['source-inference'],
          notes: ["The source states that during spawning, adults will eat the eggs given the chance and fry become free-swimming after hatching; since adults consume their own offspring (eggs/fry), this constitutes predation on fish_fry."],
          draftReview: { confidence: 'medium' },
        }] },
        resumeBundle: { documents: [{ url: 'https://example.org/inference', title: 'Inference', publisher: 'Example', sourceType: 'curated_husbandry', text: 'raw', contentSha256: 'inference-hash' }] },
      }],
    }],
  },
}], '2026-10-16T15:00:00.000Z');
assert.equal(inferenceBadcase.summary.field_review, 0);
assert.equal(inferenceBadcase.summary.targeted_source_expansion, 1);
assert.equal(inferenceBadcase.items[0]?.fieldCandidates.length, 0);
assert.ok(inferenceBadcase.items[0]?.reasonCodes.includes('review_candidate_scope_rejected'));

const legacyBase = JSON.parse(JSON.stringify(persistedBase));
for (const item of legacyBase.items) {
  delete item.researchHistory;
  if (item.nextResearch) {
    delete item.nextResearch.preferredSourceTypes;
    delete item.nextResearch.excludeAttemptedUrlCount;
  }
}
const normalizedLegacy = buildCompatibilityResearchReviewManifest([], '2026-10-16T15:30:00.000Z', legacyBase);
const normalizedLegacyItem = normalizedLegacy.items[0]!;
assert.ok(normalizedLegacyItem.researchHistory.attemptedUrls.includes('https://example.org/persisted'));
assert.ok(normalizedLegacyItem.researchHistory.attemptedSourceTypes.includes('university'));

const exhaustedGenericSearch = buildCompatibilityResearchReviewManifest([{
  sourcePath: 'exhausted.json',
  report: {
    pages: [{
      results: [{
        researchKey: 'Exhaustus genericus',
        scientificName: 'Exhaustus genericus',
        catalogObjects: [{ speciesId: 'sp_exhausted', name: 'Exhausted', scientificName: 'Exhaustus genericus', isVariant: false, isExactBaseTaxon: true }],
        requestedGapFields: ['predation'],
        researchScope: { unresolvedFields: ['predation'], complete: false },
        identity: { status: 'verified', canonicalName: 'Exhaustus genericus', reasonCode: 'gbif_exact_accepted_species' },
        workItem: { queue: 'evidence_gap', reasonCodes: ['field_missing_predation'] },
        resumeBundle: {
          acquisition: {
            attemptedUrls: [
              'https://example.org/1',
              'https://example.org/2',
              'https://example.org/3',
              'https://example.org/4',
              'https://example.org/5',
            ],
            round: 2,
            preferredSourceTypes: ['government', 'university'],
          },
          documents: [],
        },
      }],
    }],
  },
}], '2026-10-16T16:00:00.000Z');
assert.equal(exhaustedGenericSearch.summary.targeted_source_expansion, 0);
assert.equal(exhaustedGenericSearch.summary.source_strategy_review, 1);
const strategyReview = exhaustedGenericSearch.items[0]!;
assert.equal(strategyReview.queue, 'source_strategy_review');
assert.equal(strategyReview.nextResearch, null, 'generic runner must stop once source strategy is exhausted');
assert.equal(strategyReview.requiresHumanReview, false, 'source-strategy review is a research-planning state, not authority approval');
assert.ok(strategyReview.reasonCodes.includes('generic_source_strategy_exhausted'));
assert.deepEqual(strategyReview.unresolvedFields, ['predation']);

assert.deepEqual(strategyReview.researchHistory.attemptedRouteIds, []);

const exhaustedSpecializedBase = JSON.parse(JSON.stringify(exhaustedGenericSearch));
exhaustedSpecializedBase.items[0].researchHistory.attemptedRouteIds = [
  'predation_peer_reviewed_diet',
  'predation_government_ecology',
  'predation_university_ecology',
];
const evidenceCeiling = buildCompatibilityResearchReviewManifest([], '2026-10-16T16:10:00.000Z', exhaustedSpecializedBase);
assert.equal(evidenceCeiling.summary.source_strategy_review, 0);
assert.equal(evidenceCeiling.summary.evidence_ceiling_review, 1);
assert.equal(evidenceCeiling.items[0]?.queue, 'evidence_ceiling_review');
assert.equal(evidenceCeiling.items[0]?.requiresHumanReview, false);
assert.equal(evidenceCeiling.items[0]?.nextResearch, null);
assert.ok(evidenceCeiling.items[0]?.reasonCodes.includes('specialized_source_routes_exhausted'));

const transientRetryBase = JSON.parse(JSON.stringify(evidenceCeiling));
transientRetryBase.items[0].queue = 'extraction_retry';
transientRetryBase.items[0].reasonCodes = [];
const recoveredEvidenceCeiling = buildCompatibilityResearchReviewManifest([], '2026-10-16T16:15:00.000Z', transientRetryBase);
assert.equal(recoveredEvidenceCeiling.summary.extraction_retry, 0, 'exhausted specialized-route history must not regress to extraction retry on a base-only rebuild');
assert.equal(recoveredEvidenceCeiling.summary.evidence_ceiling_review, 1);
assert.equal(recoveredEvidenceCeiling.items[0]?.queue, 'evidence_ceiling_review');
assert.ok(recoveredEvidenceCeiling.items[0]?.reasonCodes.includes('specialized_source_routes_exhausted'));


const partialSpecializedResult = buildCompatibilityResearchReviewManifest([{
  sourcePath: 'partial-specialized.json',
  report: {
    pages: [{
      results: [{
        researchKey: 'Partialus evidence',
        scientificName: 'Partialus evidence',
        catalogObjects: [{ speciesId: 'sp_partial', name: 'Partial', scientificName: 'Partialus evidence', isVariant: false, isExactBaseTaxon: true }],
        requestedGapFields: ['ph', 'predation'],
        researchScope: { unresolvedFields: ['predation'], complete: false },
        identity: { status: 'verified', canonicalName: 'Partialus evidence', reasonCode: 'gbif_exact_accepted_species' },
        workItem: { queue: 'evidence_gap', reasonCodes: ['field_missing_predation'] },
        packet: { sources: [{ id: 'source-ph', url: 'https://example.edu/ph', title: 'pH', publisher: 'Example University', sourceType: 'university', contentVerified: true }] },
        reviewPacket: { fields: [{
          field: 'ph',
          status: 'supported',
          proposedValue: { min: 7, max: 8 },
          sourceIds: ['source-ph'],
          notes: ['The exact taxon is maintained at pH 7.0-8.0 in routine captive husbandry.'],
          draftReview: { confidence: 'high' },
        }, {
          field: 'predation',
          status: 'missing',
          sourceIds: [],
          notes: [],
        }] },
        resumeBundle: {
          acquisition: {
            attemptedUrls: ['https://example.edu/ph'],
            round: 3,
            preferredSourceTypes: ['peer_reviewed'],
            attemptedRouteIds: ['ph_institutional_husbandry'],
          },
          documents: [{
            id: 'source-ph',
            url: 'https://example.edu/ph',
            title: 'pH',
            publisher: 'Example University',
            sourceType: 'university',
            text: 'raw',
            contentSha256: 'ph-hash',
          }],
        },
      }],
    }],
  },
}], '2026-10-16T16:20:00.000Z');
assert.equal(partialSpecializedResult.summary.field_review, 1, 'supported requested fields must survive even when another requested field remains unresolved');
assert.deepEqual(partialSpecializedResult.items[0]?.fieldCandidates.map(item => item.field), ['ph']);
assert.deepEqual(partialSpecializedResult.items[0]?.unresolvedFields, ['predation']);
assert.deepEqual(partialSpecializedResult.items[0]?.researchHistory.attemptedRouteIds, ['ph_institutional_husbandry']);


const variantBridgeReport = {
  pages: [{
    results: [{
      researchKey: 'Variantus baseus',
      scientificName: 'Variantus baseus',
      researchDisposition: 'base_taxon_candidate_research_with_variant_bridge',
      catalogObjects: [{
        speciesId: 'sp_variant',
        name: 'Variant',
        scientificName: 'Variantus baseus var. Fancy',
        isVariant: true,
        isExactBaseTaxon: false,
      }],
      requestedGapFields: ['ph'],
      researchScope: { unresolvedFields: [], complete: true },
      workItem: { queue: 'gap_review', reasonCodes: [] },
      packet: { sources: [{
        id: 'source-variant-base',
        url: 'https://example.edu/variant-base',
        title: 'Base taxon husbandry',
        publisher: 'Example University',
        sourceType: 'university',
        contentVerified: true,
      }] },
      reviewPacket: { fields: [{
        field: 'ph',
        status: 'supported',
        proposedValue: { min: 6, max: 8 },
        sourceIds: ['source-variant-base'],
        notes: ['Direct pH evidence for the base taxon only.'],
        draftReview: { confidence: 'high' },
      }] },
      resumeBundle: { documents: [{
        url: 'https://example.edu/variant-base',
        title: 'Base taxon husbandry',
        publisher: 'Example University',
        sourceType: 'university',
        text: 'raw',
        contentSha256: 'variant-base-hash',
      }] },
    }],
  }],
};
const variantBridge = buildCompatibilityResearchReviewManifest([{ sourcePath: 'variant.json', report: variantBridgeReport }], '2026-10-16T17:00:00.000Z');
assert.equal(variantBridge.summary.field_review, 0);
assert.equal(variantBridge.summary.variant_bridge_review, 1);
assert.equal(variantBridge.items[0]?.queue, 'variant_bridge_review');
assert.equal(variantBridge.items[0]?.requiresHumanReview, true);
assert.equal(variantBridge.items[0]?.promotionAllowed, false);
assert.deepEqual(variantBridge.items[0]?.fieldCandidates.map(item => item.field), ['ph']);
assert.ok(variantBridge.items[0]?.reasonCodes.includes('variant_bridge_required'));

const multiWaterReport = {
  pages: [{
    results: [{
      researchKey: 'Multiwater exactus',
      scientificName: 'Multiwater exactus',
      catalogObjects: [{
        speciesId: 'sp_multi_water',
        name: 'Multi Water',
        scientificName: 'Multiwater exactus',
        isVariant: false,
        isExactBaseTaxon: true,
      }],
      requestedGapFields: ['water'],
      researchScope: { unresolvedFields: [], complete: true },
      workItem: { queue: 'gap_review', reasonCodes: [] },
      packet: { sources: [{
        id: 'source-multi-water',
        url: 'https://example.org/multi-water',
        title: 'Multi-water ecology',
        publisher: 'Example',
        sourceType: 'professional_association',
        contentVerified: true,
      }] },
      reviewPacket: { fields: [{
        field: 'water',
        status: 'supported',
        proposedValue: 'freshwater',
        sourceIds: ['source-multi-water'],
        notes: ['Exact-taxon environment states Freshwater; brackish; benthopelagic.'],
        draftReview: { confidence: 'high' },
      }] },
      resumeBundle: { documents: [{
        url: 'https://example.org/multi-water',
        title: 'Multi-water ecology',
        publisher: 'Example',
        sourceType: 'professional_association',
        text: 'raw',
        contentSha256: 'multi-water-hash',
      }] },
    }],
  }],
};
const multiWater = buildCompatibilityResearchReviewManifest([{ sourcePath: 'multi-water.json', report: multiWaterReport }], '2026-10-16T17:10:00.000Z');
assert.equal(multiWater.summary.field_review, 0);
assert.equal(multiWater.summary.multi_water_review, 1);
assert.equal(multiWater.items[0]?.queue, 'multi_water_review');
assert.equal(multiWater.items[0]?.requiresHumanReview, true);
assert.equal(multiWater.items[0]?.promotionAllowed, false);
assert.ok(multiWater.items[0]?.reasonCodes.includes('multi_water_profile_review_required'));

const partialTerminalReport = {
  pages: [{
    results: [{
      researchKey: 'Partial terminal taxon',
      scientificName: 'Partial terminal taxon',
      catalogObjects: [{ speciesId: 'sp_partial_terminal', name: 'Partial terminal', scientificName: 'Partial terminal taxon', isVariant: false, isExactBaseTaxon: true }],
      requestedGapFields: ['ph', 'tank_size'],
      researchScope: { unresolvedFields: ['ph'], complete: false },
      workItem: { queue: 'terminal_hold', reasonCodes: ['field_conflict_ph'] },
      packet: { sources: [{
        id: 'source-partial-terminal',
        url: 'https://example.edu/partial-terminal',
        title: 'Partial terminal husbandry',
        publisher: 'Example University',
        sourceType: 'university',
        contentVerified: true,
      }] },
      reviewPacket: { fields: [
        {
          field: 'ph',
          status: 'conflicted',
          proposedValue: null,
          sourceIds: ['source-partial-terminal'],
          notes: ['Direct pH ranges conflict materially.'],
        },
        {
          field: 'tank_size',
          status: 'supported',
          proposedValue: { liters: 120, lengthCm: null },
          sourceIds: ['source-partial-terminal'],
          notes: ['Direct minimum aquarium volume is 120 L.'],
          draftReview: { confidence: 'high' },
        },
      ] },
      resumeBundle: { documents: [{
        url: 'https://example.edu/partial-terminal',
        title: 'Partial terminal husbandry',
        publisher: 'Example University',
        sourceType: 'university',
        text: 'raw',
        contentSha256: 'partial-terminal-hash',
      }] },
    }],
  }],
};
const partialTerminal = buildCompatibilityResearchReviewManifest([{ sourcePath: 'partial-terminal.json', report: partialTerminalReport }], '2026-10-16T17:20:00.000Z');
assert.equal(partialTerminal.summary.terminal_hold, 0, 'one conflicted field must not discard other directly supported requested fields');
assert.equal(partialTerminal.summary.field_review, 1);
assert.deepEqual(partialTerminal.items[0]?.fieldCandidates.map(item => item.field), ['tank_size']);
assert.deepEqual(partialTerminal.items[0]?.unresolvedFields, ['ph']);

const brokenSnapshotReport = {
  pages: [{
    results: [{
      researchKey: 'Snapshotus missing',
      scientificName: 'Snapshotus missing',
      catalogObjects: [{ speciesId: 'sp_snapshot', name: 'Snapshot', scientificName: 'Snapshotus missing', isVariant: false, isExactBaseTaxon: true }],
      requestedGapFields: ['ph'],
      workItem: { queue: 'gap_review', reasonCodes: [] },
      packet: { sources: [{ id: 'source-missing', url: 'https://example.org/missing', title: 'Missing', publisher: 'Example', sourceType: 'university', contentVerified: true }] },
      reviewPacket: { fields: [{ field: 'ph', status: 'supported', proposedValue: { min: 7, max: 8 }, sourceIds: ['source-missing'], notes: ['Direct.'], draftReview: { confidence: 'high' } }] },
      resumeBundle: { documents: [] },
    }],
  }],
};
const broken = buildCompatibilityResearchReviewManifest([{ sourcePath: 'broken.json', report: brokenSnapshotReport }], '2026-10-16T13:00:00.000Z');
assert.equal(broken.summary.source_snapshot_retry, 1);
assert.equal(broken.items[0]?.requiresHumanReview, false);
assert.ok(broken.items[0]?.reasonCodes.includes('review_source_snapshot_missing'));

const resolvedFieldScopes = new Map<string, ReadonlySet<string>>([
  ['Safeus reviewus', new Set(['tank_size'])],
]);
const reconciledReport = reconcileCompatibilityResearchBatchReportToActiveScopes(report, resolvedFieldScopes);
assert.equal(reconciledReport.pages?.[0]?.results?.length, 0, 'an incoming report that only targets a now-resolved field must be dropped before queue merge');
const reconciledManifest = reconcileCompatibilityResearchReviewManifestToActiveScopes(manifest, resolvedFieldScopes);
assert.equal(reconciledManifest.items.length, 0, 'a persisted review item that only targets a now-resolved field must be pruned even when the taxon still has other active gaps');

const partialScopeReport = {
  pages: [{
    results: [{
      researchKey: 'Partial scope taxon',
      scientificName: 'Partial scope taxon',
      catalogObjects: [{ speciesId: 'sp_partial_scope', name: 'Partial scope', scientificName: 'Partial scope taxon', isVariant: false, isExactBaseTaxon: true }],
      requestedGapFields: ['ph', 'tank_size'],
      researchScope: { unresolvedFields: [], complete: true },
      workItem: { queue: 'gap_review', reasonCodes: ['field_missing_ph', 'field_missing_tank_size'] },
      reviewPacket: {
        reasonCodes: ['field_missing_ph', 'field_missing_tank_size'],
        fields: [
          { field: 'ph', status: 'supported', proposedValue: { min: 6, max: 8 }, sourceIds: ['source-partial'], notes: ['Direct pH evidence.'], draftReview: { confidence: 'high' } },
          { field: 'tank_size', status: 'supported', proposedValue: { liters: 80, lengthCm: null }, sourceIds: ['source-partial'], notes: ['Direct minimum aquarium volume evidence.'], draftReview: { confidence: 'high' } },
        ],
      },
    }],
  }],
};
const partialScopes = new Map<string, ReadonlySet<string>>([
  ['Partial scope taxon', new Set(['tank_size'])],
]);
const reconciledPartial = reconcileCompatibilityResearchBatchReportToActiveScopes(partialScopeReport, partialScopes);
assert.deepEqual(reconciledPartial.pages?.[0]?.results?.[0]?.requestedGapFields, ['tank_size']);
assert.deepEqual(reconciledPartial.pages?.[0]?.results?.[0]?.reviewPacket?.fields.map((field: { field: string }) => field.field), ['tank_size']);
assert.deepEqual(reconciledPartial.pages?.[0]?.results?.[0]?.workItem?.reasonCodes, ['field_missing_tank_size']);

const queueBuilderSource = readFileSync('scripts/build-compatibility-research-review-queue.ts', 'utf8');
assert.match(queueBuilderSource, /selectCompatibilityResearchBatchJobs\('active_completion'\)/, 'canonical review queue builder must reconcile the persisted queue against the current active research plan');
assert.match(queueBuilderSource, /staleResolvedItemsPruned/, 'queue regeneration must report how many resolved stale items were removed');
assert.match(queueBuilderSource, /staleResolvedFieldsPruned/, 'queue regeneration must report field-level reconciliation, not only taxon-level pruning');
assert.match(queueBuilderSource, /resolveReviewedCatalogResearchIdentity/, 'canonical queue rebuild must recover reviewed catalog identity before preserving stale external identity holds');
assert.match(queueBuilderSource, /identityRecoveredBaseManifest/, 'reviewed identity recovery must happen before active-scope reconciliation');
assert.match(queueBuilderSource, /explicitInput \?\? \(basePath \? '' : 'evaluation\/reports\/compatibility-active-completion-batch\.json'\)/, 'base-only queue rebuilds must not silently replay a stale default report');

console.log('Compatibility research review queue PASS: valid field candidates remain draft-only, evidence gaps become targeted expansion work, temporary identity-provider failures retry automatically, and raw source text is excluded.');
