import assert from 'node:assert/strict';
import { buildCompatibilityEvidencePresentation } from '../src/modules/knowledge/compatibilityEvidencePresentation';
import type { TankCompatibilityResult } from '../src/lib/tankCompatibilityEngine';

const baseRule = {
  basis: 'pair_rule' as const,
  confidence: 'high' as const,
  affectedSpeciesIds: ['a', 'b'],
  citations: [],
};

const result: TankCompatibilityResult = {
  status: 'caution',
  riskLevel: 'medium',
  summary: '需要观察',
  blockingRules: [],
  warningRules: [{
    code: 'aggression-watch',
    title: '攻击风险',
    evidence: '需要观察追咬行为。',
    severity: 'medium',
    ...baseRule,
    reviewStatus: 'reviewed',
  }],
  missingData: [{
    code: 'behavior-evidence-unreviewed',
    title: '行为资料待核验',
    evidence: '当前缺少人工审核的行为资料。',
    severity: 'info',
    ...baseRule,
    confidence: 'unknown',
    reviewStatus: 'draft',
  }],
  passedRules: [],
  suggestions: [],
  metadata: {
    ruleVersion: 'test',
    speciesDataVersion: 'test',
    calculatedAt: new Date(0).toISOString(),
    scope: 'tank',
  },
};

const presentation = buildCompatibilityEvidencePresentation(result);
assert.equal(presentation.items.length, 2);
assert.equal(presentation.items[0]?.label, '攻击风险');
assert.equal(presentation.items[0]?.status, 'warning');
assert.equal(presentation.items[1]?.status, 'info');
assert.equal(presentation.sourceStatus, 'mixed');
assert.equal(presentation.reviewedCount, 1);
assert.equal(presentation.pendingCount, 1);

const empty = buildCompatibilityEvidencePresentation(undefined);
assert.equal(empty.sourceStatus, 'pending');
assert.equal(empty.items.length, 0);

console.log('compatibility evidence presentation assertions passed');
