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

type Row = {
  existingId: string;
  existingName: string;
  candidateId: string;
  candidateName: string;
  status: string;
  blockingCodes: string[];
};

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
      blockingCodes: pair.rawResult.blockingRules.map(item => item.code),
    });
  }
}

assert.ok(rows.length > 0, 'compatibility evidence gate must evaluate real catalog pairs');

const target = rows.find(row => row.existingId === 'sp_0431' && row.candidateId === 'sp_0432');
assert.ok(target, 'reviewed 红绿灯 → 宝莲灯 pair must exist in the catalog matrix');
assert.equal(target.status, 'caution', 'reviewed 红绿灯 → 宝莲灯 inference must stay caution, not absolute compatible or blocked');
assert.equal(target.blockingCodes.includes('predation_risk'), false, 'peaceful small tetra pair must not regress into a predation block');

const recordable = rows.filter(row => row.status === 'compatible' || row.status === 'caution');
assert.ok(recordable.length >= 2, 'at least one reviewed real pair must remain reachable in both directions');

for (const row of recordable) {
  assert.ok(
    getReviewedCompatibilityProfile(row.existingId),
    `recordable pair ${row.existingName} → ${row.candidateName} is missing reviewed existing-species evidence`,
  );
  assert.ok(
    getReviewedCompatibilityProfile(row.candidateId),
    `recordable pair ${row.existingName} → ${row.candidateName} is missing reviewed candidate-species evidence`,
  );
}

const counts = rows.reduce<Record<string, number>>((acc, row) => {
  acc[row.status] = (acc[row.status] || 0) + 1;
  return acc;
}, {});
const recordableDirections = recordable.map(row => `${row.existingId}/${row.existingName} -> ${row.candidateId}/${row.candidateName} [${row.status}]`);
console.log(`Compatibility evidence coverage passed: ${rows.length} real common-species directions; recordable=${recordable.length}; statuses=${JSON.stringify(counts)}.`);
console.log(`Recordable priority directions: ${JSON.stringify(recordableDirections)}`);
