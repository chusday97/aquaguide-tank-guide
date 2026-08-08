import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getCompatibilityEvidenceAudit, getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';

const audit = fishData.map(species => {
  const profile = getReviewedCompatibilityProfile(species.id);
  return {
    speciesId: species.id,
    name: species.name,
    scientificName: species.scientificName,
    reviewStatus: profile?.reviewStatus || 'draft',
    confidence: profile?.confidence || 'unknown',
    citationCount: profile?.citations.length || 0,
  };
});

const reviewed = audit.filter(item => item.reviewStatus === 'reviewed');
const pending = audit.filter(item => item.reviewStatus !== 'reviewed');
const pairRules = getCompatibilityEvidenceAudit().reviewedPairRules;

assert.equal(audit.length, 486, '全部 486 个物种都必须进入证据审核清单');
assert.ok(reviewed.every(item => item.citationCount > 0), '审核通过的物种画像必须至少有一个来源');
assert.ok(pairRules.every(rule => rule.reviewStatus === 'reviewed' && rule.citations.length > 0), '审核通过的配对规则必须有来源');

console.log(JSON.stringify({
  total: audit.length,
  reviewed: reviewed.length,
  pending: pending.length,
  reviewedPairRules: pairRules.length,
  reviewedSpecies: reviewed,
  pendingSpeciesIds: pending.map(item => item.speciesId),
}, null, 2));
