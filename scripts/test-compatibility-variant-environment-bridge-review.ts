import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { catalogCanonicalIdentities } from '../src/data/catalogCanonicalIdentity';
import { buildCompatibilityVariantEnvironmentBridgeReview } from '../src/services/compatibility/variant-bridge-review.service';

const outputPath = 'evaluation/product/compatibility-variant-environment-bridge-review.v1.json';
const raw = readFileSync(outputPath, 'utf8');
const disk = JSON.parse(raw);
const review = buildCompatibilityVariantEnvironmentBridgeReview();

assert.deepEqual(disk, review, 'environment bridge review artifact must be generated from current candidate evidence, canonical identity and bridge policy');
assert.equal(review.policy.promotionAllowed, false);
assert.equal(review.policy.writesAuthority, false);
assert.equal(review.policy.grantsInheritance, false);
assert.equal(review.policy.wholeProfileInheritanceAllowed, false);
assert.equal(review.summary.variantObjects, 0);
assert.equal(review.summary.reviewedSlots, 0);
assert.equal(review.summary.bridgeSupported, 0);
assert.equal(review.summary.variantSpecificEvidenceRequired, 0);
assert.equal(review.summary.blockedByCandidateContract, 0);

const zeroInheritanceHistoricalTargetIds = ['sp_0065', 'sp_0066', 'sp_0067', 'sp_0068', 'sp_0143', 'sp_0144', 'sp_0155', 'sp_0361'];
for (const speciesId of zeroInheritanceHistoricalTargetIds) {
  const identity = catalogCanonicalIdentities[speciesId];
  assert.ok(identity, speciesId + ' must retain reviewed canonical identity');
  assert.deepEqual(identity.inheritancePolicy.inheritedFacts, [], speciesId + ' historical bridge evidence must still grant zero runtime inheritance');
}
const independentlyReviewedColorMorph = catalogCanonicalIdentities['sp_0162'];
assert.ok(independentlyReviewedColorMorph);
assert.equal(independentlyReviewedColorMorph.relationshipType, 'color_morph');
assert.equal(independentlyReviewedColorMorph.inheritancePolicy.blockedFacts.length, 0);
assert.equal(independentlyReviewedColorMorph.inheritancePolicy.inheritedFacts.length, 8, 'independently approved color-morph inheritance must not be revoked by an empty active bridge-review queue');
assert.deepEqual(review.decisions, [], 'no active completion candidate means no active environment bridge decision should be emitted');

assert.doesNotMatch(raw, /"promotionAllowed"\s*:\s*true|"writesAuthority"\s*:\s*true|"grantsInheritance"\s*:\s*true/);

console.log('Compatibility variant environment bridge review PASS: active review is empty after completion research closes; historical reviewed variants remain canonical-known with zero runtime inheritance.');
