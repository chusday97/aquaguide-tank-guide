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
);

const objects = manifest.groups.flatMap(group => group.objects);
const byId = new Map(objects.map(item => [item.speciesId, item] as const));

assert.equal(manifest.promotionAllowed, false);
assert.equal(manifest.writesAuthority, false);
assert.equal(manifest.summary.groupCount, 9, 'current queue must remain nine base-taxon variant bridge groups');
assert.equal(manifest.summary.objectCount, objects.length);
assert.equal(byId.get('sp_0258')?.status, 'field_bridge_review_required', 'Koi Betta has a reviewed base-species identity bridge');
assert.deepEqual(byId.get('sp_0258')?.candidateFields, ['tank_size'], 'object-level bridge review must not inherit group-wide fields that are already closed for Koi Betta');
assert.equal(byId.get('sp_0224')?.status, 'field_bridge_review_required', 'Platinum Channa has a reviewed base-species identity bridge');
assert.equal(byId.get('sp_0419')?.status, 'identity_review_required', 'longfin GloFish must not inherit Danio authority from its name alone');
assert.equal(byId.get('sp_0295')?.status, 'identity_review_required', 'longfin rainbowfish must remain identity-review gated');
assert.ok((byId.get('sp_0419')?.identitySourceCandidates.length || 0) > 0, 'existing catalog source candidates should be surfaced for identity review without auto-promotion');
assert.equal(objects.every(item => item.promotionAllowed === false && item.writesAuthority === false), true);

console.log(JSON.stringify({
  pass: true,
  summary: manifest.summary,
  fieldBridgeObjects: objects.filter(item => item.status === 'field_bridge_review_required').map(item => item.speciesId),
  identityReviewObjects: objects.filter(item => item.status === 'identity_review_required').length,
  identityBoundaryHolds: objects.filter(item => item.status === 'identity_boundary_hold').length,
}, null, 2));
