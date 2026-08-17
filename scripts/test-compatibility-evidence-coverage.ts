import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { evaluateCompatibilityDecision } from '../src/modules/knowledge/compatibilityKnowledge';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { getLifeType } from '../src/modules/species/species.service';
import type { Aquarium } from '../src/types';

const tank: Aquarium = {
  id: 'compatibility-evidence-gate',
  name: 'Compatibility evidence gate',
  fishes: [],
  dimensions: { length: '60', width: '40', height: '40' },
  waterType: 'Freshwater',
  targetTemperature: '24',
  substrate: '水草泥',
  plants: [],
  hardscape: [],
  equipment: { filter: '瀑布过滤', heater: true, oxygen: false, light: '普通灯' },
};

const commonNames = ['红绿灯', '宝莲灯', '黑壳虾', '极火虾', '斑马螺', '咖啡鼠', '白云金丝', '孔雀鱼', '水晶虾'];
const commonSpecies = fishData.filter(fish => commonNames.includes(fish.name) && !['plant', 'hardscape'].includes(getLifeType(fish)));

type RuleAudit = { code: string; severity: string; evidence: string };
type Row = {
  existingId: string;
  existingName: string;
  candidateId: string;
  candidateName: string;
  status: string;
  blockingRules: RuleAudit[];
  warningRules: RuleAudit[];
  missingRules: RuleAudit[];
  passedRules: RuleAudit[];
};

const toAudit = (items: Array<{ code: string; severity: string; evidence: string }>): RuleAudit[] => (
  items.map(item => ({ code: item.code, severity: item.severity, evidence: item.evidence }))
);

const rows: Row[] = [];
for (const existing of commonSpecies) {
  for (const candidate of commonSpecies) {
    if (existing.id === candidate.id) continue;
    const decision = evaluateCompatibilityDecision({
      tank,
      items: [
        { species: existing, quantity: existing.id === 'sp_0431' ? 6 : 2, origin: 'existing' },
        { species: candidate, quantity: candidate.id === 'sp_0432' ? 6 : 1, origin: 'candidate' },
      ],
    });
    const pair = decision.pairResults[0];
    if (!pair) continue;
    rows.push({
      existingId: existing.id,
      existingName: existing.name,
      candidateId: candidate.id,
      candidateName: candidate.name,
      status: pair.status,
      blockingRules: toAudit(pair.rawResult.blockingRules),
      warningRules: toAudit(pair.rawResult.warningRules),
      missingRules: toAudit(pair.rawResult.missingData),
      passedRules: toAudit(pair.rawResult.passedRules),
    });
  }
}

assert.ok(rows.length > 0, 'compatibility evidence gate must evaluate real catalog pairs');

const tetraPair = rows.find(row => row.existingId === 'sp_0431' && row.candidateId === 'sp_0432');
assert.ok(tetraPair, 'reviewed 红绿灯 → 宝莲灯 pair must exist in the catalog matrix');
assert.equal(tetraPair.status, 'caution', 'explicitly reviewed 红绿灯 → 宝莲灯 pair must stay caution, not absolute compatible or blocked');
assert.equal(tetraPair.blockingRules.some(item => item.code === 'predation_risk'), false, 'peaceful small tetra pair must not regress into a predation block');

const guppyNeon = rows.find(row => row.existingId === 'sp_0436' && row.candidateId === 'sp_0431');
assert.ok(guppyNeon, 'reviewed guppy and neon profiles must be present in the priority matrix');
assert.equal(guppyNeon.status, 'insufficient_data', 'reviewed species profiles without a reviewed pair rule must not become recordable by absence-of-risk inference');
assert.ok(guppyNeon.missingRules.some(item => item.code === 'pair_evidence_unreviewed' && item.severity === 'medium'), 'guppy → neon must expose the missing pair-evidence boundary');

const whiteCloudGuppy = rows.find(row => row.existingId === 'sp_0434' && row.candidateId === 'sp_0436');
assert.ok(whiteCloudGuppy, 'reviewed white-cloud and guppy profiles must be present in the priority matrix');
assert.ok(
  whiteCloudGuppy.status === 'insufficient_data' || whiteCloudGuppy.status === 'not_recommended',
  'two reviewed species profiles without a reviewed pair rule must never become recordable; a higher-priority hard block may correctly return not_recommended.',
);
if (whiteCloudGuppy.status === 'insufficient_data') {
  assert.ok(whiteCloudGuppy.missingRules.some(item => item.code === 'pair_evidence_unreviewed' && item.severity === 'medium'), 'white cloud → guppy must expose pair-evidence missing when no hard block outranks it');
} else {
  assert.ok(whiteCloudGuppy.blockingRules.length > 0, 'white cloud → guppy may bypass pair-evidence missing only when an explicit hard block is present');
}

const recordable = rows.filter(row => row.status === 'compatible' || row.status === 'caution');
assert.equal(recordable.length, 2, 'Batch 1 adds species-profile coverage only; recordable priority directions must remain the explicit tetra pair in both directions.');

for (const row of recordable) {
  assert.ok(
    getReviewedCompatibilityProfile(row.existingId),
    `recordable pair ${row.existingName} → ${row.candidateName} is missing reviewed existing-species evidence`,
  );
  assert.ok(
    getReviewedCompatibilityProfile(row.candidateId),
    `recordable pair ${row.existingName} → ${row.candidateName} is missing reviewed candidate-species evidence`,
  );
  const blockingMissing = row.missingRules.filter(item => item.severity === 'high' || item.severity === 'medium');
  assert.equal(
    blockingMissing.length,
    0,
    `recordable pair ${row.existingName} → ${row.candidateName} must not retain high/medium unresolved missing-data rules: ${JSON.stringify(blockingMissing)}`,
  );
}

const counts = rows.reduce<Record<string, number>>((acc, row) => {
  acc[row.status] = (acc[row.status] || 0) + 1;
  return acc;
}, {});
const recordableDirections = recordable.map(row => ({
  direction: `${row.existingId}/${row.existingName} -> ${row.candidateId}/${row.candidateName}`,
  status: row.status,
  warningRules: row.warningRules,
  missingRules: row.missingRules,
  passedRules: row.passedRules,
}));
console.log(`Compatibility evidence coverage passed: ${rows.length} real common-species directions; recordable=${recordable.length}; statuses=${JSON.stringify(counts)}.`);
console.log(`Recordable priority direction audit: ${JSON.stringify(recordableDirections)}`);
