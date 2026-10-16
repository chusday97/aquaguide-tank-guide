import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildCompatibilityTaxonResearchPlan } from '../src/services/compatibility/compatibility-field-coverage.service';
import {
  buildCompatibilityVariantBridgeReviewManifest,
} from '../src/services/compatibility/variant-bridge-review.service';
import type { CompatibilityResearchReviewManifest } from '../src/services/compatibility/research-review-queue.service';

const queue = JSON.parse(
  readFileSync('evaluation/product/compatibility-research-review-queue.v1.json', 'utf8'),
) as CompatibilityResearchReviewManifest;

const manifest = buildCompatibilityVariantBridgeReviewManifest(
  queue,
  buildCompatibilityTaxonResearchPlan(),
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
assert.equal(manifest.summary.groupCount, 9, 'current queue must remain nine base-taxon variant bridge groups');
assert.equal(manifest.summary.objectCount, objects.length);
assert.equal(byId.get('sp_0258')?.status, 'field_bridge_evidence_ceiling', 'two exhausted exact-variant field research rounds must terminalize Koi tank-size bridge review');
assert.ok(byId.get('sp_0258')?.reasonCodes.includes('variant_field_bridge_research_exhausted'));
assert.deepEqual(byId.get('sp_0258')?.candidateFields, ['tank_size'], 'object-level bridge review must not inherit group-wide fields that are already closed for Koi Betta');
assert.equal(byId.get('sp_0224')?.status, 'identity_review_required', 'base-species FishBase mapping is not direct Platinum variant identity evidence');
assert.equal(byId.get('sp_0419')?.status, 'identity_evidence_ceiling', 'two exhausted identity-research rounds must terminalize the variant instead of repeating search');
assert.ok(byId.get('sp_0419')?.reasonCodes.includes('variant_identity_research_exhausted'));
assert.equal(byId.get('sp_0295')?.status, 'identity_review_required', 'longfin rainbowfish must remain identity-review gated');
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
