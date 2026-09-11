import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getCompatibilityEvidenceAudit } from '../src/data/compatibilityEvidence';
import {
  buildPairRuleRevisionRegression,
  buildProfileRevisionRegression,
  isCompatibilityRegressionReportFresh,
  type ReviewedCompatibilityAuthority,
} from '../apps/api/src/compatibility-authority';

const audit = getCompatibilityEvidenceAudit();
const citation = (source: (typeof audit.reviewedProfiles)[number]['citations'][number]) => ({
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
    citations: rule.citations.map(citation),
  }));


const authority: ReviewedCompatibilityAuthority = {
  authority: 'reviewed-db',
  counts: { profiles: audit.reviewedProfiles.length, pairRules: audit.reviewedPairRules.length },
  profiles: audit.reviewedProfiles.map(profile => ({
    catalogKey: profile.speciesId,
    behaviorTraits: [...profile.behaviorTraits],
    minimumGroupSize: profile.minimumGroupSize,
    predationTargets: [...profile.predationTargets],
    confidence: profile.confidence,
    reviewStatus: 'reviewed' as const,
    citations: profile.citations.map(citation),
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
    citations: rule.citations.map(citation),
    version: 1,
  })),
};
const cohortIds = new Set(['sp_0049', 'sp_0431', 'sp_0432', 'sp_0439', 'sp_0021', 'sp_0435', 'sp_0451', 'sp_0224', 'sp_0475']);
const cohort = fishData.filter(item => cohortIds.has(item.id));
assert.ok(cohort.length >= 8, 'regression cohort must include reviewed Compatibility species');

const predatorProfile = authority.profiles.find(profile => profile.catalogKey === 'sp_0049');
assert.ok(predatorProfile, 'predator profile baseline must exist');
const profileReport = buildProfileRevisionRegression({
  authority,
  fish: cohort,
  authoritySequence: 7,
  catalogKey: predatorProfile.catalogKey,
  baselineVersion: predatorProfile.version,
  behaviorTraits: predatorProfile.behaviorTraits.filter(trait => trait !== 'predatory'),
  minimumGroupSize: predatorProfile.minimumGroupSize,
  predationTargets: [],
  confidence: predatorProfile.confidence,
  requiredFacts: [...predatorProfile.requiredFacts], stockingGuidance: predatorProfile.stockingGuidance, stageRiskRules: predatorProfile.stageRiskRules.map(rule => ({ ...rule, citations: rule.citations.map(source => ({ sourceKey: source.id, title: source.title, publisher: source.publisher, url: source.url, sourceType: source.sourceType, reviewStatus: source.reviewStatus })) })),
  sourceKeys: predatorProfile.citations.map(source => source.id),
});
assert.equal(profileReport.authoritySequence, 7);
assert.equal(profileReport.baselineVersion, 1);
assert.equal(profileReport.evaluatedScenarios, (cohort.length - 1) * 3 + 1, 'Profile regression must include one explicit same-species adult-to-fry scenario');
assert.ok(profileReport.changedScenarios > 0, 'removing reviewed predatory evidence must change at least one engine scenario');

const sameProfileReport = buildProfileRevisionRegression({
  authority,
  fish: cohort,
  authoritySequence: 7,
  catalogKey: predatorProfile.catalogKey,
  baselineVersion: predatorProfile.version,
  behaviorTraits: predatorProfile.behaviorTraits.filter(trait => trait !== 'predatory'),
  minimumGroupSize: predatorProfile.minimumGroupSize,
  predationTargets: [],
  confidence: predatorProfile.confidence,
  requiredFacts: [...predatorProfile.requiredFacts], stockingGuidance: predatorProfile.stockingGuidance, stageRiskRules: predatorProfile.stageRiskRules.map(rule => ({ ...rule, citations: rule.citations.map(source => ({ sourceKey: source.id, title: source.title, publisher: source.publisher, url: source.url, sourceType: source.sourceType, reviewStatus: source.reviewStatus })) })),
  sourceKeys: predatorProfile.citations.map(source => source.id),
});
assert.equal(isCompatibilityRegressionReportFresh(profileReport, sameProfileReport), true, 'same authority/product/engine context must reproduce the regression digest');
const newerSequenceReport = { ...sameProfileReport, authoritySequence: 8 };
assert.equal(isCompatibilityRegressionReportFresh(profileReport, newerSequenceReport), false, 'authority sequence changes must stale the report');

const guppyProfile = authority.profiles.find(profile => profile.catalogKey === 'sp_0436');
assert.ok(guppyProfile, 'guppy profile baseline must exist for stage-risk regression');
assert.ok(guppyProfile.stageRiskRules.length > 0, 'guppy baseline must retain reviewed adult-to-fry stage risk');
const stageRiskReport = buildProfileRevisionRegression({
  authority,
  fish: fishData,
  authoritySequence: 7,
  catalogKey: guppyProfile.catalogKey,
  baselineVersion: guppyProfile.version,
  behaviorTraits: [...guppyProfile.behaviorTraits],
  minimumGroupSize: guppyProfile.minimumGroupSize,
  predationTargets: [...guppyProfile.predationTargets],
  confidence: guppyProfile.confidence,
  requiredFacts: [...guppyProfile.requiredFacts],
  stockingGuidance: guppyProfile.stockingGuidance,
  stageRiskRules: [],
  sourceKeys: guppyProfile.citations.map(source => source.id),
});
assert.ok(stageRiskReport.changes.some(change => change.scenario === 'same_species_adult_to_fry'), 'removing reviewed Stage Risk must change the dedicated adult-to-fry regression scenario');
const changedCatalog = cohort.map(item => item.id === 'sp_0431' ? { ...item, description: `${item.description} changed` } : item);
const changedCatalogReport = buildProfileRevisionRegression({
  authority, fish: changedCatalog, authoritySequence: 7, catalogKey: predatorProfile.catalogKey, baselineVersion: 1,
  behaviorTraits: predatorProfile.behaviorTraits.filter(trait => trait !== 'predatory'), minimumGroupSize: predatorProfile.minimumGroupSize,
  predationTargets: [], confidence: predatorProfile.confidence, requiredFacts: [...predatorProfile.requiredFacts], stockingGuidance: predatorProfile.stockingGuidance, stageRiskRules: predatorProfile.stageRiskRules.map(rule => ({ ...rule, citations: rule.citations.map(source => ({ sourceKey: source.id, title: source.title, publisher: source.publisher, url: source.url, sourceType: source.sourceType, reviewStatus: source.reviewStatus })) })), sourceKeys: predatorProfile.citations.map(source => source.id),
});
assert.equal(isCompatibilityRegressionReportFresh(profileReport, changedCatalogReport), false, 'Product catalog changes must stale the report');

const pairBaseline = authority.pairRules.find(rule => rule.catalogKeys.includes('sp_0021') && rule.catalogKeys.includes('sp_0439'));
assert.ok(pairBaseline, 'reviewed pair baseline must exist');
const pairReport = buildPairRuleRevisionRegression({
  authority,
  fish: cohort,
  authoritySequence: 7,
  catalogKeys: [...pairBaseline.catalogKeys] as [string, string],
  baselineVersion: pairBaseline.version,
  verdict: 'caution',
  riskType: 'behavior_conflict_review',
  reason: 'Regression fixture changes the reviewed outcome for test coverage.',
  mitigation: ['持续观察'],
  basis: pairBaseline.basis,
  confidence: pairBaseline.confidence,
  sourceKeys: pairBaseline.citations.map(source => source.id),
});
assert.equal(pairReport.evaluatedScenarios, 3);
assert.ok(pairReport.changedScenarios > 0, 'Pair Rule change must be visible in before/after engine regression');
assert.ok(pairReport.changes.some(change => change.before.status !== change.after.status || JSON.stringify(change.before) !== JSON.stringify(change.after)));

console.log(`compatibility regression gate: profile ${profileReport.changedScenarios}/${profileReport.evaluatedScenarios}, pair ${pairReport.changedScenarios}/${pairReport.evaluatedScenarios} PASS`);
