import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getCompatibilityEvidenceAudit, getReviewedCompatibilityProfileForSpecies, hasCompatibilityDecisionCoverage } from '../src/data/compatibilityEvidence';

const audit = fishData.map(species => {
  const profile = getReviewedCompatibilityProfileForSpecies(species);
  return {
    speciesId: species.id,
    name: species.name,
    scientificName: species.scientificName,
    reviewStatus: profile?.reviewStatus || 'draft',
    confidence: profile?.confidence || 'unknown',
    citationCount: profile?.citations.length || 0,
    evidenceProfileId: profile?.speciesId || null,
    inherited: Boolean(profile && profile.speciesId !== species.id),
    decisionReady: hasCompatibilityDecisionCoverage(profile),
  };
});

const reviewed = audit.filter(item => item.reviewStatus === 'reviewed');
const pending = audit.filter(item => item.reviewStatus !== 'reviewed');
const decisionReady = reviewed.filter(item => item.decisionReady);
const inheritedReviewed = reviewed.filter(item => item.inherited);
const evidenceAudit = getCompatibilityEvidenceAudit();
const pairRules = evidenceAudit.reviewedPairRules;
const reviewedCoverage = audit.length > 0 ? reviewed.length / audit.length : 0;
const coverageStatus = reviewedCoverage >= 0.8 ? 'healthy' : reviewedCoverage >= 0.25 ? 'partial' : 'coverage_gap';

assert.equal(new Set(audit.map(item => item.speciesId)).size, audit.length, '证据审核清单中的物种 ID 必须唯一');
assert.ok(reviewed.every(item => item.citationCount > 0), '审核通过的物种画像必须至少有一个来源');
assert.ok(evidenceAudit.reviewedSpeciesIds.length >= 3, '直接审核行为画像不得低于当前最低基线 3 条；新增覆盖应只增不减');
assert.ok(pairRules.length >= 1, '已审核配对规则不得低于当前最低基线 1 条；新增覆盖应只增不减');
assert.ok(pairRules.every(rule => rule.reviewStatus === 'reviewed' && rule.citations.length > 0), '审核通过的配对规则必须有来源');

console.log(JSON.stringify({
  total: audit.length,
  reviewed: reviewed.length,
  pending: pending.length,
  directReviewedProfiles: evidenceAudit.reviewedSpeciesIds.length,
  effectiveReviewedSpecies: reviewed.length,
  inheritedReviewedSpecies: inheritedReviewed.length,
  decisionReadySpecies: decisionReady.length,
  reviewedPairRules: pairRules.length,
  reviewedCoveragePct: Number((reviewedCoverage * 100).toFixed(2)),
  coverageStatus,
  reviewedSpecies: reviewed,
  decisionReadySpeciesSample: decisionReady.slice(0, 20),
  pendingSpeciesSample: pending.slice(0, 20).map(item => item.speciesId),
}, null, 2));
