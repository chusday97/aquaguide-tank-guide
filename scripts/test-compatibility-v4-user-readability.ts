import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { evaluateCompatibilityDecision } from '../src/modules/knowledge/compatibilityKnowledge';
import { getCompatibilityDecision } from '../src/services/compatibility/compatibility.service';
import {
  isCompatibilityUserReadableText,
} from '../src/services/compatibility/compatibility-readable-copy.service';
import type { Aquarium } from '../src/types';
import { buildCompatibilityProductAssessment } from '../apps/api/src/compatibility-ai-product';
import type { CompatibilityAiShadowResult } from '../apps/api/src/compatibility-ai-reasoner';

type ExpectedStatus = 'compatible' | 'caution' | 'not_recommended' | 'insufficient_data';

type Fixture = {
  id: string;
  ids: [string, string];
  expected: ExpectedStatus;
  reviewed: boolean;
};

const fixtures: Fixture[] = [
  { id: 'R-COMP-01', ids: ['sp_0010', 'sp_0012'], expected: 'compatible', reviewed: true },
  { id: 'R-COMP-02', ids: ['sp_0010', 'sp_0014'], expected: 'compatible', reviewed: true },
  { id: 'R-COMP-03', ids: ['sp_0010', 'sp_0017'], expected: 'compatible', reviewed: true },
  { id: 'R-COMP-04', ids: ['sp_0010', 'sp_0020'], expected: 'compatible', reviewed: true },
  { id: 'R-COMP-05', ids: ['sp_0010', 'sp_0042'], expected: 'compatible', reviewed: true },

  { id: 'R-CAUTION-01', ids: ['sp_0001', 'sp_0002'], expected: 'caution', reviewed: true },
  { id: 'R-CAUTION-02', ids: ['sp_0001', 'sp_0010'], expected: 'caution', reviewed: true },
  { id: 'R-CAUTION-03', ids: ['sp_0001', 'sp_0011'], expected: 'caution', reviewed: true },
  { id: 'R-CAUTION-04', ids: ['sp_0001', 'sp_0012'], expected: 'caution', reviewed: true },
  { id: 'R-CAUTION-05', ids: ['sp_0001', 'sp_0013'], expected: 'caution', reviewed: true },

  { id: 'R-BLOCK-01', ids: ['sp_0001', 'sp_0019'], expected: 'not_recommended', reviewed: true },
  { id: 'R-BLOCK-02', ids: ['sp_0001', 'sp_0022'], expected: 'not_recommended', reviewed: true },
  { id: 'R-BLOCK-03', ids: ['sp_0001', 'sp_0023'], expected: 'not_recommended', reviewed: true },
  { id: 'R-BLOCK-04', ids: ['sp_0001', 'sp_0024'], expected: 'not_recommended', reviewed: true },
  { id: 'R-BLOCK-05', ids: ['sp_0001', 'sp_0043'], expected: 'not_recommended', reviewed: true },

  { id: 'R-UNKNOWN-01', ids: ['sp_0001', 'sp_0004'], expected: 'insufficient_data', reviewed: false },
  { id: 'R-UNKNOWN-02', ids: ['sp_0001', 'sp_0005'], expected: 'insufficient_data', reviewed: false },
  { id: 'R-UNKNOWN-03', ids: ['sp_0001', 'sp_0006'], expected: 'insufficient_data', reviewed: false },
  { id: 'R-UNKNOWN-04', ids: ['sp_0001', 'sp_0009'], expected: 'insufficient_data', reviewed: false },
  { id: 'R-UNKNOWN-05', ids: ['sp_0001', 'sp_0025'], expected: 'insufficient_data', reviewed: false },
];

const expectedJudgment: Record<ExpectedStatus, string> = {
  compatible: '可以养',
  caution: '有条件可以',
  not_recommended: '不建议',
  insufficient_data: '暂时无法判断',
};

const tank: Aquarium = {
  id: 'compatibility-readability-audit',
  name: 'Compatibility Readability Audit',
  fishes: [],
  dimensions: { length: '120', width: '50', height: '50' },
  waterType: 'Freshwater',
  targetTemperature: '25',
};

const byId = (id: string) => {
  const fish = fishData.find(item => item.id === id);
  assert.ok(fish, 'missing catalog object ' + id);
  return fish;
};

const quantityFor = (id: string) => Math.max(1, getReviewedCompatibilityProfile(id)?.minimumGroupSize || 1);

const statusCounts: Record<ExpectedStatus, number> = {
  compatible: 0,
  caution: 0,
  not_recommended: 0,
  insufficient_data: 0,
};

for (const [index, fixture] of fixtures.entries()) {
  const a = byId(fixture.ids[0]);
  const b = byId(fixture.ids[1]);
  const decision = evaluateCompatibilityDecision({
    tank,
    items: [
      { species: a, quantity: quantityFor(a.id), origin: 'existing' },
      { species: b, quantity: quantityFor(b.id), origin: 'candidate' },
    ],
  });

  assert.equal(decision.status, fixture.expected, fixture.id + ' deterministic status drifted');
  assert.equal(
    decision.metadata.decisionReadiness === 'reviewed',
    fixture.reviewed,
    fixture.id + ' readiness drifted',
  );

  const finalDecision = getCompatibilityDecision(decision.aggregateResult, 'planned_addition');
  const technicalAi = index % 2 === 0;
  const shadow = {
    mode: 'shadow',
    finalDecision,
    ai: fixture.expected === 'insufficient_data'
      ? {
          status: 'skipped',
          reason: 'deterministic_decision_not_fully_reviewed',
          suggestedVerdict: undefined,
          reasons: [],
          adjustments: [],
          uncertainties: [],
          confidence: undefined,
        }
      : {
          status: 'accepted',
          reason: undefined,
          suggestedVerdict: finalDecision.status,
          reasons: [{
            text: technicalAi
              ? 'predation_vulnerability_context requires deterministic mitigation'
              : '这组生物的活动区域或行为需求有重叠，需要先处理主要风险。',
            ruleCodes: finalDecision.ruleCodes.slice(0, 1),
          }],
          adjustments: fixture.expected === 'compatible'
            ? []
            : [{
                text: technicalAi
                  ? 'apply_ruleCodes before finalDecision'
                  : '先调整数量或空间，并准备分隔方案，再决定是否加入。',
                ruleCodes: finalDecision.ruleCodes.slice(0, 1),
              }],
          uncertainties: [],
          confidence: 'high',
        },
    provenance: {
      promptVersion: 'readability-audit',
      ruleCodes: finalDecision.ruleCodes,
      evidenceIds: finalDecision.evidenceIds,
      repairCount: 0,
      model: 'fixture-model',
    },
  } as unknown as CompatibilityAiShadowResult;

  const product = buildCompatibilityProductAssessment(decision, shadow);
  statusCounts[fixture.expected] += 1;

  assert.equal(product.main.judgment, expectedJudgment[fixture.expected], fixture.id + ' judgment must be user language');
  assert.ok(product.main.why.length >= 1 && product.main.why.length <= 2, fixture.id + ' why must stay compact');
  assert.ok(product.main.howTo.length >= 1 && product.main.howTo.length <= 2, fixture.id + ' howTo must stay compact');

  for (const text of product.main.why) {
    assert.equal(isCompatibilityUserReadableText(text, 'reason'), true, fixture.id + ' unreadable why: ' + text);
    assert.doesNotMatch(text, /ruleCodes|evidenceIds|finalDecision|decisionReadiness|deterministic|domainStatus|provider|schema|model|sp_\d+|[a-z0-9]+_[a-z0-9_]+/i);
  }
  for (const text of product.main.howTo) {
    assert.equal(isCompatibilityUserReadableText(text, 'action'), true, fixture.id + ' unreadable action: ' + text);
    assert.doesNotMatch(text, /ruleCodes|evidenceIds|finalDecision|decisionReadiness|deterministic|domainStatus|provider|schema|model|sp_\d+|[a-z0-9]+_[a-z0-9_]+/i);
  }

  if (technicalAi && fixture.expected !== 'insufficient_data') {
    assert.equal(
      product.main.why.some(text => text.includes('predation_vulnerability_context')),
      false,
      fixture.id + ' technical AI reason leaked into main copy',
    );
    assert.equal(
      product.main.howTo.some(text => text.includes('ruleCodes')),
      false,
      fixture.id + ' technical AI action leaked into main copy',
    );
  }

  if (fixture.expected === 'caution' || fixture.expected === 'not_recommended') {
    assert.match(product.main.howTo[0], /先|不要|暂停|减少|调整|分隔|确认|测|更换|加入/);
  }
  if (fixture.expected === 'insufficient_data') {
    assert.match(product.main.why.join(' '), /资料|确认|缺少|审核|水体|水温|水质/);
    assert.match(product.main.howTo.join(' '), /先|补齐|确认|重新判断/);
    assert.equal(product.details.explanation.aiStatus, 'skipped');
  }

  assert.equal(product.details.label, '查看依据');
  assert.equal(product.details.authority.finalSource, 'deterministic');
  assert.equal(product.details.authority.status, finalDecision.status);
}

assert.deepEqual(statusCounts, {
  compatible: 5,
  caution: 5,
  not_recommended: 5,
  insufficient_data: 5,
});

console.log('Compatibility V4 readability audit PASS: 20 real-catalog cases (5 per status) keep the main result to judgment/why/how-to, reject technical AI copy, preserve deterministic authority, and fail closed when evidence is incomplete.');
