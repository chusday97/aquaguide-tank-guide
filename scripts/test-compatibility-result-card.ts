import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fishData } from '../src/data/fishData';
import { reviewSpeciesAdditions } from '../src/services/aquarium/species-addition.service';
import { buildLocalCompatibilityAssessment } from '../src/services/compatibility/compatibility-assessment.service';
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
assert.equal(local.main.judgment, '有条件可以');
assert.ok(local.main.why.length >= 1 && local.main.why.length <= 2);
assert.ok(local.main.howTo.length >= 1 && local.main.howTo.length <= 2);
assert.equal(local.details.label, '查看依据');
assert.equal(local.details.authorityStatus, review.status);

const aquariumSource = readFileSync(new URL('../src/pages/Aquarium.tsx', import.meta.url), 'utf8');
const cardStart = aquariumSource.indexOf(') : addFishCompatibilityReview ? (');
const cardEnd = aquariumSource.indexOf(') : (', cardStart + 10);
assert.ok(cardStart >= 0 && cardEnd > cardStart, 'add-species compatibility result card must exist');
const cardSource = aquariumSource.slice(cardStart, cardEnd);

assert.match(cardSource, /addFishAssessmentView\?\.main\.judgment/);
assert.match(cardSource, /addFishAssessmentView\?\.main\.why/);
assert.match(cardSource, /addFishAssessmentView\?\.main\.howTo/);
assert.match(cardSource, /<details/);
assert.match(cardSource, /查看依据/);
assert.match(cardSource, /data-add-fish-compatibility-result/);
assert.match(cardSource, /border-emerald-100 bg-emerald-50/);
assert.match(cardSource, /已结合当前鱼缸/);

const defaultResultEnd = cardSource.indexOf('<details');
assert.ok(defaultResultEnd > 0);
const defaultResultSource = cardSource.slice(0, defaultResultEnd);
assert.doesNotMatch(defaultResultSource, /keyRules|rule\.code|details\.model|details\.aiStatus/);

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
assert.match(serviceSource, /remote\.details\.authority\.status !== decision\.status/);
assert.doesNotMatch(serviceSource, /method:\s*['"](POST|PATCH|PUT|DELETE)['"]/);
assert.doesNotMatch(serviceSource, /\.insert\(|\.update\(|\.delete\(|\.upsert\(/);

console.log('Compatibility result-card wiring PASS: whole-tank deterministic authority drives status, local/Preview gets immediate readable fallback, cloud explanation is read-only and authority-clamped, and technical evidence stays behind 查看依据.');
