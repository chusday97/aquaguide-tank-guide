import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getCompatibilityEvidenceAudit } from '../src/data/compatibilityEvidence';
import {
  applyReviewedCompatibilityBootstrap,
  getRuntimeCompatibilityStatus,
  resetRuntimeCompatibilityEvidenceForTest,
} from '../src/data/runtimeCompatibilityEvidence';
import { evaluateSpeciesCombination } from '../src/lib/tankCompatibilityEngine';

const audit = getCompatibilityEvidenceAudit();
const toCitation = (source: (typeof audit.reviewedProfiles)[number]['citations'][number]) => ({
  id: source.id,
  title: source.title,
  publisher: source.publisher,
  url: source.url,
  sourceType: source.sourceType,
  reviewStatus: 'reviewed' as const,
  version: 1,
});
const bootstrap = {
  authority: 'reviewed-db' as const,
  counts: { profiles: audit.reviewedProfiles.length, pairRules: audit.reviewedPairRules.length },
  profiles: audit.reviewedProfiles.map(profile => ({
    catalogKey: profile.speciesId,
    behaviorTraits: [...profile.behaviorTraits],
    minimumGroupSize: profile.minimumGroupSize,
    predationTargets: [...profile.predationTargets],
    confidence: profile.confidence,
    reviewStatus: 'reviewed' as const,
    citations: profile.citations.map(toCitation),
    version: 1,
  })),
  pairRules: audit.reviewedPairRules.map(rule => ({
    catalogKeys: [...rule.speciesIds].sort() as [string, string],
    verdict: rule.verdict,
    riskType: rule.riskType,
    reason: rule.reason,
    mitigation: [...rule.mitigation],
    basis: rule.basis,
    confidence: rule.confidence,
    reviewStatus: 'reviewed' as const,
    citations: rule.citations.map(toCitation),
    version: 1,
  })),
};

const pair = ['sp_0431', 'sp_0432'].map(id => fishData.find(item => item.id === id));
assert.ok(pair.every(Boolean), 'test pair must exist in fishData');
const signature = () => {
  const decision = evaluateSpeciesCombination(pair as any);
  return {
    status: decision.status,
    risk: decision.riskLevel,
    blocking: decision.blockingRules.map(rule => rule.code).sort(),
    warning: decision.warningRules.map(rule => rule.code).sort(),
    missing: decision.missingData.map(rule => rule.code).sort(),
    ruleVersion: decision.metadata.ruleVersion,
    evidenceAuthorityVersion: decision.metadata.evidenceAuthorityVersion,
  };
};

resetRuntimeCompatibilityEvidenceForTest();
const staticSignature = signature();
assert.equal(getRuntimeCompatibilityStatus().source, 'static-fallback');
assert.equal(staticSignature.status, 'caution');
assert.equal(staticSignature.ruleVersion, 'compatibility-domain-v1');
assert.equal(staticSignature.evidenceAuthorityVersion, 'tank-compatibility-v2-reviewed-evidence');
applyReviewedCompatibilityBootstrap({
  ...bootstrap,
  profiles: bootstrap.profiles.slice(0, -1),
  counts: { profiles: bootstrap.profiles.length - 1, pairRules: bootstrap.pairRules.length },
});
assert.equal(getRuntimeCompatibilityStatus().source, 'static-fallback', 'partial DB authority must fail closed');
assert.deepEqual(signature(), staticSignature, 'partial DB authority must not change Compatibility decisions');

const changedPairRules = bootstrap.pairRules.map(rule => (
  rule.catalogKeys.includes('sp_0431') && rule.catalogKeys.includes('sp_0432')
    ? { ...rule, verdict: 'not_recommended' as const, riskType: 'controlled_runtime_override', reason: 'Controlled runtime authority injection for contract testing.' }
    : rule
));
applyReviewedCompatibilityBootstrap({ ...bootstrap, pairRules: changedPairRules });
const dbStatus = getRuntimeCompatibilityStatus();
assert.equal(dbStatus.source, 'reviewed-db');
assert.match(dbStatus.authorityVersion, /^tank-compatibility-v2-reviewed-db-[0-9a-f]{8}$/);
const dbDecision = evaluateSpeciesCombination(pair as any);
assert.equal(dbDecision.status, 'not_recommended', 'complete reviewed DB authority must be consumable by the existing engine');
assert.ok(dbDecision.blockingRules.some(rule => rule.code.includes('controlled_runtime_override')));
assert.equal(dbDecision.metadata.ruleVersion, 'compatibility-domain-v1');
assert.equal(dbDecision.metadata.evidenceAuthorityVersion, dbStatus.authorityVersion);
assert.notEqual(dbDecision.metadata.evidenceAuthorityVersion, staticSignature.evidenceAuthorityVersion);
const firstProfile = bootstrap.profiles[0];
const evidenceVersionPayload = {
  ...bootstrap,
  pairRules: changedPairRules,
  profiles: [
    { ...firstProfile, citations: firstProfile.citations.map((source, index) => index === 0 ? { ...source, version: source.version + 1 } : source) },
    ...bootstrap.profiles.slice(1),
  ],
};
applyReviewedCompatibilityBootstrap(evidenceVersionPayload);
assert.notEqual(getRuntimeCompatibilityStatus().authorityVersion, dbStatus.authorityVersion, 'evidence version must advance the runtime authority fingerprint');

resetRuntimeCompatibilityEvidenceForTest();
assert.deepEqual(signature(), staticSignature, 'reset must restore the exact static reviewed fallback behavior');
console.log('runtime compatibility authority: exact-baseline DB switch + partial fallback PASS');
