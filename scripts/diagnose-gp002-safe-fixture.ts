import { fishData } from '../src/data/fishData';
import { evaluateCompatibilityDecision } from '../src/modules/knowledge/compatibilityKnowledge';
import { getLifeType } from '../src/modules/species/species.service';
import type { Aquarium } from '../src/types';

const tank: Aquarium = {
  id: 'tank-gp2',
  name: 'Golden Path 测试缸',
  fishes: [],
  dimensions: { length: '60', width: '40', height: '40' },
  waterType: 'Freshwater',
  targetTemperature: '24',
  substrate: '水草泥',
  plants: [],
  hardscape: [],
  equipment: { filter: '瀑布过滤', heater: true, oxygen: false, light: '普通灯' },
};

const preferredNames = ['红绿灯', '宝莲灯', '黑壳虾', '极火虾', '斑马螺', '咖啡鼠', '白云金丝', '孔雀鱼', '水晶虾'];
const preferred = fishData.filter(fish => preferredNames.includes(fish.name) && !['plant', 'hardscape'].includes(getLifeType(fish)));

const rows: Array<{ existing: string; existingId: string; candidate: string; candidateId: string; status: string; reason: string }> = [];
for (const existing of preferred) {
  for (const candidate of preferred) {
    if (existing.id === candidate.id) continue;
    const decision = evaluateCompatibilityDecision({
      tank,
      items: [
        { species: existing, quantity: 2, origin: 'existing' },
        { species: candidate, quantity: 1, origin: 'candidate' },
      ],
    });
    const pair = decision.pairResults[0];
    if (!pair) continue;
    rows.push({
      existing: existing.name,
      existingId: existing.id,
      candidate: candidate.name,
      candidateId: candidate.id,
      status: pair.status,
      reason: pair.primaryReason?.evidence || pair.rawResult.summary,
    });
  }
}

const recordable = rows.filter(row => row.status === 'compatible' || row.status === 'caution');
console.log('GP-002 RECORDABLE FIXTURES');
for (const row of recordable) console.log(JSON.stringify(row));
console.log(`recordable=${recordable.length} / tested=${rows.length}`);
if (recordable.length === 0) process.exitCode = 2;
