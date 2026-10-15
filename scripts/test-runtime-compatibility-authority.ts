import { COMPATIBILITY_RULE_VERSION } from '../packages/domain-rules/src';
import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getCompatibilityEvidenceAudit } from '../src/data/compatibilityEvidence';
import {
  applyReviewedCompatibilityBootstrap,
  getRuntimeCompatibilityStatus,
  resetRuntimeCompatibilityEvidenceForTest,
} from '../src/data/runtimeCompatibilityEvidence';
import { evaluateSpeciesCombination } from '../src/lib/tankCompatibilityEngine';
import { buildCompatibilityProfileRolloutKeysets } from '../src/data/compatibilityAuthorityRollout';

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
const stageRiskRulesFor = (catalogKey: string) => audit.reviewedStageRiskProfiles
  .filter(rule => rule.speciesId === catalogKey)
  .map(rule => ({
    ruleKey: `${rule.speciesId}:${rule.riskType}`,
    youngerStages: [...rule.youngerStages], olderStages: [...rule.olderStages],
    verdict: rule.verdict, riskType: rule.riskType, reason: rule.reason, mitigation: [...rule.mitigation],
    basis: rule.basis, confidence: rule.confidence, reviewStatus: 'reviewed' as const,
    citations: rule.citations.map(toCitation),
  }));

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
    requiredFacts: [...(profile.requiredFacts || [])],
    ...(profile.stockingGuidance ? { stockingGuidance: { ...profile.stockingGuidance, constraints: [...profile.stockingGuidance.constraints], evidenceIds: [...profile.stockingGuidance.evidenceIds] } } : {}),
    stageRiskRules: stageRiskRulesFor(profile.speciesId),
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
    authorityVersion: decision.metadata.authorityVersion,
  };
};

resetRuntimeCompatibilityEvidenceForTest();
const staticSignature = signature();
assert.equal(getRuntimeCompatibilityStatus().source, 'static-fallback');
assert.equal(staticSignature.status, 'caution');
assert.equal(staticSignature.ruleVersion, COMPATIBILITY_RULE_VERSION);
assert.equal(staticSignature.authorityVersion, 'tank-compatibility-v3-reviewed-evidence');
applyReviewedCompatibilityBootstrap({
  ...bootstrap,
  profiles: bootstrap.profiles.slice(0, -3),
  counts: { profiles: bootstrap.profiles.length - 3, pairRules: bootstrap.pairRules.length },
});
assert.equal(getRuntimeCompatibilityStatus().source, 'static-fallback', 'invalid 98-Profile partial DB authority must fail closed');
assert.deepEqual(signature(), staticSignature, 'partial DB authority must not change Compatibility decisions');

const rolloutKeysets = buildCompatibilityProfileRolloutKeysets(bootstrap.profiles.map(profile => profile.catalogKey));
const profilesFor = (keys: ReadonlySet<string>) => bootstrap.profiles.filter(profile => keys.has(profile.catalogKey));

const currentProductionProfiles = profilesFor(rolloutKeysets.currentProduction);
assert.equal(currentProductionProfiles.length, 63);
applyReviewedCompatibilityBootstrap({
  ...bootstrap,
  profiles: currentProductionProfiles,
  counts: { profiles: currentProductionProfiles.length, pairRules: bootstrap.pairRules.length },
});
const currentProductionStatus = getRuntimeCompatibilityStatus();
assert.equal(currentProductionStatus.source, 'reviewed-db', 'exact 63-Profile Production baseline must stay usable during rollout');
assert.equal(currentProductionStatus.profiles, 63);
assert.equal(currentProductionStatus.pairRules, bootstrap.pairRules.length);

resetRuntimeCompatibilityEvidenceForTest();

const productionTargetProfiles = profilesFor(rolloutKeysets.productionTarget);
assert.equal(productionTargetProfiles.length, 85);
applyReviewedCompatibilityBootstrap({
  ...bootstrap,
  profiles: productionTargetProfiles,
  counts: { profiles: productionTargetProfiles.length, pairRules: bootstrap.pairRules.length },
});
const productionTargetStatus = getRuntimeCompatibilityStatus();
assert.equal(productionTargetStatus.source, 'reviewed-db', 'exact 85-Profile Production target must stay usable during stacked rollout');
assert.equal(productionTargetStatus.profiles, 85);
assert.equal(productionTargetStatus.pairRules, bootstrap.pairRules.length);

resetRuntimeCompatibilityEvidenceForTest();

const wave04TargetProfiles = profilesFor(rolloutKeysets.wave04Target);
assert.equal(wave04TargetProfiles.length, 95);
applyReviewedCompatibilityBootstrap({
  ...bootstrap,
  profiles: wave04TargetProfiles,
  counts: { profiles: wave04TargetProfiles.length, pairRules: bootstrap.pairRules.length },
});
const wave04TargetStatus = getRuntimeCompatibilityStatus();
assert.equal(wave04TargetStatus.source, 'reviewed-db', 'exact 95-Profile wave04 target must stay usable during wave05 rollout');
assert.equal(wave04TargetStatus.profiles, 95);
assert.equal(wave04TargetStatus.pairRules, bootstrap.pairRules.length);

resetRuntimeCompatibilityEvidenceForTest();

const wave05TargetProfiles = profilesFor(rolloutKeysets.wave05Target);
assert.equal(wave05TargetProfiles.length, 99);
applyReviewedCompatibilityBootstrap({
  ...bootstrap,
  profiles: wave05TargetProfiles,
  counts: { profiles: wave05TargetProfiles.length, pairRules: bootstrap.pairRules.length },
});
const wave05TargetStatus = getRuntimeCompatibilityStatus();
assert.equal(wave05TargetStatus.source, 'reviewed-db', 'exact 99-Profile wave05 target must remain usable during wave06 rollout');
assert.equal(wave05TargetStatus.profiles, 99);

resetRuntimeCompatibilityEvidenceForTest();

const wave06TargetProfiles = profilesFor(rolloutKeysets.wave06Target);
assert.equal(wave06TargetProfiles.length, 100);
applyReviewedCompatibilityBootstrap({
  ...bootstrap,
  profiles: wave06TargetProfiles,
  counts: { profiles: wave06TargetProfiles.length, pairRules: bootstrap.pairRules.length },
});
const wave06TargetStatus = getRuntimeCompatibilityStatus();
assert.equal(wave06TargetStatus.source, 'reviewed-db', 'exact 100-Profile wave06 target must remain usable during wave16 rollout');
assert.equal(wave06TargetStatus.profiles, 100);

resetRuntimeCompatibilityEvidenceForTest();

const releasedTargetProfiles = profilesFor(rolloutKeysets.target);
assert.equal(releasedTargetProfiles.length, 101);
applyReviewedCompatibilityBootstrap({
  ...bootstrap,
  profiles: releasedTargetProfiles,
  counts: { profiles: releasedTargetProfiles.length, pairRules: bootstrap.pairRules.length },
});
const releasedTargetStatus = getRuntimeCompatibilityStatus();
assert.equal(releasedTargetStatus.source, 'reviewed-db', 'exact 101-Profile released repository target must remain usable');
assert.equal(releasedTargetStatus.profiles, 101);

resetRuntimeCompatibilityEvidenceForTest();

assert.equal(bootstrap.profiles.length, 103, 'reviewed source-controlled identity corrections may grow repository authority beyond the released 101-Profile target');
applyReviewedCompatibilityBootstrap(bootstrap);
const postTargetStatus = getRuntimeCompatibilityStatus();
assert.equal(postTargetStatus.source, 'reviewed-db', 'complete released target plus reviewed source-controlled Profiles must be accepted as post-target authority growth');
assert.equal(postTargetStatus.profiles, 103);

resetRuntimeCompatibilityEvidenceForTest();

const invalidIntermediateProfiles = bootstrap.profiles.slice(0, 96);
applyReviewedCompatibilityBootstrap({
  ...bootstrap,
  profiles: invalidIntermediateProfiles,
  counts: { profiles: invalidIntermediateProfiles.length, pairRules: bootstrap.pairRules.length },
});
assert.equal(getRuntimeCompatibilityStatus().source, 'static-fallback', '96-Profile intermediate state must fail closed');

resetRuntimeCompatibilityEvidenceForTest();

const changedPairRules = bootstrap.pairRules.map(rule => (
  rule.catalogKeys.includes('sp_0431') && rule.catalogKeys.includes('sp_0432')
    ? { ...rule, verdict: 'not_recommended' as const, riskType: 'controlled_runtime_override', reason: 'Controlled runtime authority injection for contract testing.' }
    : rule
));
applyReviewedCompatibilityBootstrap({ ...bootstrap, pairRules: changedPairRules });
const dbStatus = getRuntimeCompatibilityStatus();
assert.equal(dbStatus.source, 'reviewed-db');
assert.match(dbStatus.authorityVersion, /^tank-compatibility-v3-reviewed-db-[0-9a-f]{8}$/);
const dbDecision = evaluateSpeciesCombination(pair as any);
assert.equal(dbDecision.status, 'not_recommended', 'complete reviewed DB authority must be consumable by the existing engine');
assert.ok(dbDecision.blockingRules.some(rule => rule.code.includes('controlled_runtime_override')));
assert.equal(dbDecision.metadata.ruleVersion, COMPATIBILITY_RULE_VERSION);
assert.equal(dbDecision.metadata.authorityVersion, dbStatus.authorityVersion);
assert.notEqual(dbDecision.metadata.authorityVersion, staticSignature.authorityVersion);
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
