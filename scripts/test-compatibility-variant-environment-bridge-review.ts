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
assert.equal(review.summary.variantObjects, 9);
assert.equal(review.summary.reviewedSlots, 27);
assert.equal(review.summary.bridgeSupported, 15);
assert.equal(review.summary.variantSpecificEvidenceRequired, 10);
assert.equal(review.summary.blockedByCandidateContract, 2);

const targetIds = ['sp_0065', 'sp_0066', 'sp_0067', 'sp_0068', 'sp_0143', 'sp_0144', 'sp_0155', 'sp_0162', 'sp_0361'];
for (const speciesId of targetIds) {
  const identity = catalogCanonicalIdentities[speciesId];
  assert.ok(identity, speciesId + ' must retain reviewed canonical identity');
  assert.deepEqual(identity.inheritancePolicy.inheritedFacts, [], speciesId + ' bridge review must not grant runtime inheritance');
  assert.equal(review.decisions.filter(item => item.speciesId === speciesId).length, 3);
}
assert.equal(review.decisions.every(item => (
  item.promotionAllowed === false
  && item.writesAuthority === false
  && item.grantsInheritance === false
)), true);

for (const speciesId of ['sp_0065', 'sp_0066', 'sp_0067', 'sp_0068', 'sp_0155', 'sp_0361']) {
  const temperature = review.decisions.find(item => item.speciesId === speciesId && item.field === 'temperature');
  assert.ok(temperature);
  assert.equal(temperature.decisionStatus, 'variant_specific_evidence_required');
}
for (const speciesId of ['sp_0065', 'sp_0066', 'sp_0067', 'sp_0068', 'sp_0155', 'sp_0361']) {
  for (const field of ['water', 'ph'] as const) {
    const decision = review.decisions.find(item => item.speciesId === speciesId && item.field === field);
    assert.ok(decision);
    assert.equal(decision.decisionStatus, 'bridge_supported');
  }
}

const colorMorph = review.decisions.filter(item => item.speciesId === 'sp_0162');
assert.equal(colorMorph.length, 3);
assert.equal(colorMorph.every(item => item.decisionStatus === 'bridge_supported'), true);

for (const speciesId of ['sp_0143', 'sp_0144']) {
  const water = review.decisions.find(item => item.speciesId === speciesId && item.field === 'water');
  const temperature = review.decisions.find(item => item.speciesId === speciesId && item.field === 'temperature');
  const ph = review.decisions.find(item => item.speciesId === speciesId && item.field === 'ph');
  assert.ok(water && temperature && ph);
  assert.equal(water.decisionStatus, 'blocked_by_candidate_contract');
  assert.equal(water.reasonCode, 'multi_environment_not_representable_by_single_water_value');
  assert.equal(temperature.decisionStatus, 'variant_specific_evidence_required');
  assert.equal(ph.decisionStatus, 'variant_specific_evidence_required');
}

assert.doesNotMatch(raw, /"promotionAllowed"\s*:\s*true|"writesAuthority"\s*:\s*true|"grantsInheritance"\s*:\s*true/);

console.log('Compatibility variant environment bridge review PASS: 27 slots reviewed -> 15 bridge-supported / 10 variant-specific evidence required / 2 candidate-contract blocked; zero inheritance granted.');
