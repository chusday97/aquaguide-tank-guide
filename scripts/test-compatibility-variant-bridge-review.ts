import assert from 'node:assert/strict';
import {
  buildCompatibilityVariantBridgeReviewManifest,
} from '../src/services/compatibility/variant-bridge-review.service';
import type { CompatibilityResearchReviewManifest } from '../src/services/compatibility/research-review-queue.service';

const queue = {
  version: 1,
  kind: 'compatibility_research_review_queue',
  generatedAt: '2026-10-17T00:00:00+08:00',
  generatedFrom: ['synthetic-variant-bridge-test'],
  rawSourceTextCommitted: false,
  writesAuthority: false,
  promotionAllowed: false,
  summary: {
    total: 2,
    field_review: 0,
    variant_bridge_review: 2,
    multi_water_review: 0,
    targeted_source_expansion: 0,
    source_strategy_review: 0,
    evidence_ceiling_review: 0,
    identity_review: 0,
    identity_provider_retry: 0,
    source_snapshot_retry: 0,
    extraction_retry: 0,
    provider_retry: 0,
    terminal_hold: 0,
    onboarding_review: 0,
  },
  items: [{
    id: 'Betta splendens|sp_0258',
    researchKey: 'Betta splendens',
    scientificName: 'Betta splendens',
    catalogObjects: [{
      speciesId: 'sp_0258',
      name: '糖果KOI斗鱼',
      scientificName: 'Betta splendens var. Koi',
      isVariant: true,
      isExactBaseTaxon: false,
    }],
    requestedGapFields: ['tank_size'],
    unresolvedFields: ['tank_size'],
    sourceReport: 'synthetic',
    sourceReportGeneratedAt: null,
    sourceQueue: 'gap_review',
    queue: 'variant_bridge_review',
    reasonCodes: ['variant_bridge_required'],
    identity: { status: 'verified', canonicalName: 'Betta splendens', reasonCode: null },
    fieldCandidates: [{
      field: 'tank_size',
      proposedValue: 41,
      sourceIds: ['seriouslyfish-betta-splendens'],
      confidence: 'high',
      notes: ['base taxon candidate only'],
    }],
    verifiedSources: [],
    researchHistory: { rounds: 1, attemptedUrls: [], attemptedSourceTypes: [], attemptedRouteIds: [], preferredNextSourceTypes: [] },
    nextResearch: null,
    requiresHumanReview: true,
    promotionAllowed: false,
    writesAuthority: false,
  }, {
    id: 'Danio rerio|sp_0419',
    researchKey: 'Danio rerio',
    scientificName: 'Danio rerio',
    catalogObjects: [{
      speciesId: 'sp_0419',
      name: '长鳍荧光斑马',
      scientificName: 'Danio rerio var. Longfin GloFish',
      isVariant: true,
      isExactBaseTaxon: false,
    }],
    requestedGapFields: ['water'],
    unresolvedFields: ['water'],
    sourceReport: 'synthetic',
    sourceReportGeneratedAt: null,
    sourceQueue: 'gap_review',
    queue: 'variant_bridge_review',
    reasonCodes: ['variant_bridge_required'],
    identity: { status: 'verified', canonicalName: 'Danio rerio', reasonCode: null },
    fieldCandidates: [],
    verifiedSources: [],
    researchHistory: { rounds: 1, attemptedUrls: [], attemptedSourceTypes: [], attemptedRouteIds: [], preferredNextSourceTypes: [] },
    nextResearch: null,
    requiresHumanReview: true,
    promotionAllowed: false,
    writesAuthority: false,
  }],
} as CompatibilityResearchReviewManifest;

const plan = [{
  researchKey: 'Betta splendens',
  baseScientificName: 'Betta splendens',
  catalogObjects: [{
    speciesId: 'sp_0258',
    name: '糖果KOI斗鱼',
    scientificName: 'Betta splendens var. Koi',
    isVariant: true,
    isExactBaseTaxon: false,
    gaps: ['tank_size'],
  }],
}, {
  researchKey: 'Danio rerio',
  baseScientificName: 'Danio rerio',
  catalogObjects: [{
    speciesId: 'sp_0419',
    name: '长鳍荧光斑马',
    scientificName: 'Danio rerio var. Longfin GloFish',
    isVariant: true,
    isExactBaseTaxon: false,
    gaps: ['water'],
  }],
}] as any;

const manifest = buildCompatibilityVariantBridgeReviewManifest(
  queue,
  plan,
  '2026-10-16T21:30:00+08:00',
  'test-queue.json',
  [{
    groups: [{
      baseScientificName: 'Danio rerio',
      candidates: [],
      unresolvedSpeciesIds: ['sp_0419'],
      attemptedUrls: ['https://example.edu/round1'],
    }],
  }, {
    groups: [{
      baseScientificName: 'Danio rerio',
      candidates: [],
      unresolvedSpeciesIds: ['sp_0419'],
      attemptedUrls: ['https://example.edu/round2'],
    }],
  }],
  [{
    speciesId: 'sp_0258',
    field: 'tank_size',
    packet: { sources: [] },
    resumeBundle: { acquisition: { round: 1, attemptedUrls: ['https://example.edu/koi-tank-round1'] } },
  }, {
    speciesId: 'sp_0258',
    field: 'tank_size',
    packet: { sources: [] },
    resumeBundle: { acquisition: { round: 2, attemptedUrls: [] } },
  }],
);

const objects = manifest.groups.flatMap(group => group.objects);
const byId = new Map(objects.map(item => [item.speciesId, item] as const));

assert.equal(manifest.promotionAllowed, false);
assert.equal(manifest.writesAuthority, false);
assert.equal(manifest.summary.groupCount, 2, 'synthetic bridge fixture must exercise one field-ceiling and one identity-ceiling group');
assert.equal(manifest.summary.objectCount, objects.length);
assert.equal(byId.get('sp_0258')?.status, 'field_bridge_evidence_ceiling', 'two exhausted exact-variant field research rounds must terminalize Koi tank-size bridge review');
assert.ok(byId.get('sp_0258')?.reasonCodes.includes('variant_field_bridge_research_exhausted'));
assert.deepEqual(byId.get('sp_0258')?.candidateFields, ['tank_size'], 'object-level bridge review must not inherit group-wide fields that are already closed for Koi Betta');
assert.equal(byId.has('sp_0224'), false, 'synthetic state-machine test must not depend on stale canonical queue membership');
assert.equal(byId.get('sp_0419')?.status, 'identity_evidence_ceiling', 'two exhausted identity-research rounds must terminalize the variant instead of repeating search');
assert.ok(byId.get('sp_0419')?.reasonCodes.includes('variant_identity_research_exhausted'));
assert.equal(manifest.summary.identityReviewRequired, 0, 'two exhausted identity rounds must not leave the tested variant bridge open');
assert.ok((byId.get('sp_0419')?.identitySourceCandidates.length || 0) > 0, 'existing catalog source candidates should be surfaced for identity review without auto-promotion');
assert.equal(objects.every(item => item.promotionAllowed === false && item.writesAuthority === false), true);

console.log(JSON.stringify({
  pass: true,
  summary: manifest.summary,
  fieldBridgeObjects: objects.filter(item => item.status === 'field_bridge_review_required').map(item => item.speciesId),
  fieldBridgeEvidenceCeilings: objects.filter(item => item.status === 'field_bridge_evidence_ceiling').length,
  identityReviewObjects: objects.filter(item => item.status === 'identity_review_required').length,
  identityEvidenceCeilings: objects.filter(item => item.status === 'identity_evidence_ceiling').length,
  identityBoundaryHolds: objects.filter(item => item.status === 'identity_boundary_hold').length,
}, null, 2));
