import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fishData } from '../src/data/fishData';
import { reviewSpeciesAdditions } from '../src/services/aquarium/species-addition.service';
import {
  adaptRemoteCompatibilityAssessmentForPlan,
  buildLocalCompatibilityAssessment,
  type RemoteCompatibilityAssessment,
} from '../src/services/compatibility/compatibility-assessment.service';
import { COMPATIBILITY_PRODUCT_SCHEMA_VERSION } from '../src/services/compatibility/compatibility-product-contract';
import type { Aquarium } from '../src/types';

const aquarium: Aquarium = {
  id: 'compatibility-result-card-tank',
  name: 'Compatibility Result Card',
  fishes: [
    {
      id: 'existing-red-tetra',
      fishId: 'sp_0114',
      quantity: 8,
      entryDate: '2026-10-01T00:00:00.000Z',
    },
  ],
  dimensions: { length: '120', width: '50', height: '50' },
  waterType: 'Freshwater',
  targetTemperature: '25',
};

const review = reviewSpeciesAdditions({
  aquarium,
  items: [
    { fishId: 'sp_0469', quantity: 8 },
    { fishId: 'sp_0013', quantity: 1 },
  ],
  speciesCatalog: fishData,
});
assert.ok(review);
assert.equal(review.status, review.decision.status);
assert.equal(review.decision.pairResults.length, 3, 'whole-tank result must evaluate all three pair relationships');
assert.ok(review.decision.tankAggregateResult, 'whole-tank aggregate must be available for 3+ species');
assert.equal(review.status, 'caution');

const local = buildLocalCompatibilityAssessment(review.decision);
assert.equal(local.source, 'local_deterministic');
assert.equal(local.main.judgment, '条件混养');
assert.ok(local.main.why.length >= 1 && local.main.why.length <= 2);
assert.ok(local.main.howTo.length >= 1 && local.main.howTo.length <= 2);
assert.equal(local.details.label, '查看依据');
assert.equal(local.details.authorityStatus, review.status);
assert.equal(local.assessmentMode, 'planned_addition');
assert.equal(local.decisionPlan.judgment, local.main.judgment);
assert.equal(local.decisionPlan.verdict, 'add_with_conditions');
assert.ok(local.decisionPlan.nextSteps.length >= 1);
assert.ok(local.decisionPlan.expectedAfterAdjustment.length > 0);
assert.ok(local.decisionPlan.reviewCheckpoint.length > 0);
assert.ok(local.decisionPlan.stopCondition.length > 0);

const remoteFixture: RemoteCompatibilityAssessment = {
  schemaVersion: COMPATIBILITY_PRODUCT_SCHEMA_VERSION,
  assessmentMode: 'planned_addition',
  main: local.main,
  details: {
    label: '查看依据',
    reasons: [{ text: 'fixture reason', ruleCodes: ['predation_vulnerability_context'] }],
    adjustments: [],
    uncertainties: [],
    explanation: {
      source: 'deterministic_fallback',
      aiStatus: 'skipped',
      model: null,
    },
    authority: {
      status: review.status,
      finalSource: 'deterministic',
    },
  },
};
const adaptedRemote = adaptRemoteCompatibilityAssessmentForPlan(remoteFixture, review.decision);
assert.ok(adaptedRemote);
assert.equal(adaptedRemote.assessmentMode, 'planned_addition');
assert.equal(adaptedRemote.details.authorityStatus, review.status);
assert.equal(
  adaptRemoteCompatibilityAssessmentForPlan({ ...remoteFixture, schemaVersion: 2 as any }, review.decision),
  null,
  'unknown response schema versions must fail closed to the local deterministic result',
);
assert.equal(
  adaptRemoteCompatibilityAssessmentForPlan({ ...remoteFixture, assessmentMode: 'current_tank' }, review.decision),
  null,
  'planned-addition UI must not consume a current-tank response',
);
assert.equal(
  adaptRemoteCompatibilityAssessmentForPlan({
    ...remoteFixture,
    details: {
      ...remoteFixture.details,
      authority: { ...remoteFixture.details.authority, status: 'compatible' },
    },
  }, review.decision),
  null,
  'remote deterministic authority must exactly match the local whole-tank decision',
);
assert.equal(
  adaptRemoteCompatibilityAssessmentForPlan({
    ...remoteFixture,
    main: { ...remoteFixture.main, judgment: '可以混养' },
  }, review.decision),
  null,
  'remote readable judgment must exactly match the local deterministic authority status',
);
assert.equal(
  adaptRemoteCompatibilityAssessmentForPlan({
    ...remoteFixture,
    main: { ...remoteFixture.main, why: ['ruleCodes: predation_risk'] },
  }, review.decision),
  null,
  'remote main reasons must remain user-readable and must not leak technical rule identifiers',
);
assert.equal(
  adaptRemoteCompatibilityAssessmentForPlan({
    ...remoteFixture,
    main: { ...remoteFixture.main, howTo: ['风险需要关注。'] },
  }, review.decision),
  null,
  'remote main actions must remain concretely actionable before replacing the local deterministic fallback',
);

const aquariumSource = readFileSync(new URL('../src/pages/Aquarium.tsx', import.meta.url), 'utf8');
const cardStart = aquariumSource.indexOf(') : addFishCompatibilityReview ? (');
const cardEnd = aquariumSource.indexOf('\n                </section>\n              ) : (', cardStart + 10);
assert.ok(cardStart >= 0 && cardEnd > cardStart, 'add-species compatibility result card must exist');
const cardSource = aquariumSource.slice(cardStart, cardEnd);

assert.match(cardSource, /addFishAssessmentPresentation\?\.judgment/);
assert.match(cardSource, /addFishAssessmentPresentation\?\.why/);
assert.match(cardSource, /addFishAssessmentPresentation\?\.howTo/);
assert.doesNotMatch(cardSource, /addFishAssessmentView\?\.main\./, 'localized result card must not read canonical Chinese assessment presentation directly');
assert.match(cardSource, /data-compatibility-risk-level/);
assert.match(cardSource, /高风险/);
assert.match(cardSource, /需要调整/);
assert.match(cardSource, /可混养/);
assert.match(cardSource, /信息不足/);
assert.match(cardSource, /data-compatibility-primary-action/);
assert.match(cardSource, /addFishAssessmentPresentation\?\.howTo \|\| \[\]\)\.slice\(0, 1\)/);
assert.doesNotMatch(cardSource, /data-compatibility-next-steps/);
assert.doesNotMatch(cardSource, /addFishAssessmentPresentation\.plan\.nextSteps\.slice\(0, 2\)/);
assert.doesNotMatch(cardSource, /data-compatibility-decision-plan/);
assert.match(cardSource, /data-compatibility-secondary-plan/);
assert.match(cardSource, /addFishAssessmentPresentation\.plan\.expectedAfterAdjustment/);
assert.match(cardSource, /addFishAssessmentPresentation\.plan\.reviewCheckpoint/);
assert.match(cardSource, /addFishAssessmentPresentation\.plan\.stopCondition/);
assert.match(cardSource, /addFishCompatibilityReview\.status !== 'compatible'/);
assert.doesNotMatch(cardSource, /main\.judgment !== '可以混养'/);
assert.match(cardSource, /<details/);
assert.match(cardSource, /查看依据/);
assert.match(cardSource, /data-add-fish-compatibility-result/);
assert.match(cardSource, /border-red-200 bg-red-50/);
assert.match(cardSource, /border-amber-100 bg-amber-50/);
assert.match(cardSource, /border-emerald-100 bg-emerald-50/);
assert.match(cardSource, /border-slate-200 bg-slate-50/);
assert.match(cardSource, /border-slate-200 bg-slate-100 text-slate-700/);
assert.match(cardSource, /已结合当前鱼缸/);

const defaultResultEnd = cardSource.indexOf('<details');
assert.ok(defaultResultEnd > 0);
const defaultResultSource = cardSource.slice(0, defaultResultEnd);
assert.doesNotMatch(defaultResultSource, /keyRules|rule\.code|details\.model|details\.aiStatus/);
assert.doesNotMatch(defaultResultSource, /expectedAfterAdjustment|reviewCheckpoint|stopCondition|data-compatibility-secondary-plan/);
assert.doesNotMatch(defaultResultSource, /plan\.nextSteps|现在先做|必须停止|复查点/);
const detailsResultSource = cardSource.slice(defaultResultEnd);
assert.match(detailsResultSource, /data-compatibility-secondary-plan/);
assert.match(detailsResultSource, /expectedAfterAdjustment|reviewCheckpoint|stopCondition/);
assert.match(detailsResultSource, /data-compatibility-action-sequence/);
assert.match(detailsResultSource, /处理顺序/);
assert.match(detailsResultSource, /step\.state !== 'deferred'/, 'hard-stop deferred soft risks must stay out of the user-visible action order');
assert.match(detailsResultSource, /\.slice\(0, 3\)/, 'expanded action order must remain bounded');

const riskFooterStart = aquariumSource.indexOf("addFishCompatibilityReview?.status === 'not_recommended'");
const riskFooterEnd = aquariumSource.indexOf("!addFishSuccess && addFishCompatibilityReview?.status !== 'not_recommended'", riskFooterStart);
assert.ok(riskFooterStart >= 0 && riskFooterEnd > riskFooterStart);
const riskFooterSource = aquariumSource.slice(riskFooterStart, riskFooterEnd);
assert.doesNotMatch(riskFooterSource, /aquaguide:feature-preview|AI 建议|AI advice/);

const resetMatch = aquariumSource.match(/const resetAddFishAssessmentState = \(\) => \{([\s\S]*?)\n  \};/);
assert.ok(resetMatch, 'add-species adjustment flow needs a single assessment reset helper');
assert.match(resetMatch[1], /addFishAssessmentRequestRef\.current \+= 1/);
assert.match(resetMatch[1], /setIsAddFishAssessmentLoading\(false\)/);
assert.match(resetMatch[1], /setAddFishProductAssessment\(null\)/);
assert.match(resetMatch[1], /setAddFishCompatibilityReview\(null\)/);
assert.equal((aquariumSource.match(/setAddFishCompatibilityReview\(null\);/g) || []).length, 1, 'all exits/edits must clear review through the reset helper so stale async explanations cannot revive');
assert.match(aquariumSource, /if \(addFishCompatibilityReview\) \{\s*resetAddFishAssessmentState\(\);\s*return;/s);

const serviceSource = readFileSync(new URL('../src/services/compatibility/compatibility-assessment.service.ts', import.meta.url), 'utf8');
assert.match(serviceSource, /if \(mode !== 'cloud'\) return fallback/);
assert.match(serviceSource, /compatibility-assessment/);
assert.match(serviceSource, /schemaVersion !== COMPATIBILITY_PRODUCT_SCHEMA_VERSION/);
assert.match(serviceSource, /assessmentMode !== 'planned_addition'/);
assert.match(serviceSource, /remote\.details\.authority\.status !== decision\.status/);
assert.match(serviceSource, /main\?\.judgment === getCompatibilityStatusLabel\(status, 'zh-CN'\)/);
assert.match(serviceSource, /isCompatibilityUserReadableText\(text, 'reason'\)/);
assert.match(serviceSource, /isCompatibilityUserReadableText\(text, 'action'\)/);
assert.doesNotMatch(serviceSource, /method:\s*['"](POST|PATCH|PUT|DELETE)['"]/);
assert.doesNotMatch(serviceSource, /\.insert\(|\.update\(|\.delete\(|\.upsert\(/);

console.log('Compatibility result-card wiring PASS: whole-tank deterministic authority drives status, local/Preview gets immediate readable fallback, cloud explanation is read-only and authority-clamped, and technical evidence stays behind 查看依据.');
