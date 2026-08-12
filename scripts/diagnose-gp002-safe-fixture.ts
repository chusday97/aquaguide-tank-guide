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
let targetDecision: ReturnType<typeof evaluateCompatibilityDecision> | null = null;
for (const existing of preferred) {
  for (const candidate of preferred) {
    if (existing.id === candidate.id) continue;
    const decision = evaluateCompatibilityDecision({
      tank,
      items: [
        { species: existing, quantity: existing.id === 'sp_0431' ? 6 : 2, origin: 'existing' },
        { species: candidate, quantity: candidate.id === 'sp_0432' ? 6 : 1, origin: 'candidate' },
      ],
    });
    if (existing.id === 'sp_0431' && candidate.id === 'sp_0432') targetDecision = decision;
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
const counts = rows.reduce<Record<string, number>>((acc, row) => {
  acc[row.status] = (acc[row.status] || 0) + 1;
  return acc;
}, {});
console.log('GP-002 STATUS COUNTS', JSON.stringify(counts));
console.log('GP-002 TARGET sp_0431 → sp_0432', JSON.stringify(targetDecision && {
  status: targetDecision.status,
  summary: targetDecision.summary,
  blocking: targetDecision.blockingRules.map(item => ({ code: item.code, evidence: item.evidence })),
  warnings: targetDecision.warningRules.map(item => ({ code: item.code, evidence: item.evidence })),
  missing: targetDecision.missingData.map(item => ({ code: item.code, severity: item.severity, evidence: item.evidence })),
  pairs: targetDecision.pairResults.map(pair => ({
    status: pair.status,
    summary: pair.rawResult.summary,
    blocking: pair.rawResult.blockingRules.map(item => item.code),
    warnings: pair.rawResult.warningRules.map(item => item.code),
    missing: pair.rawResult.missingData.map(item => `${item.code}:${item.severity}`),
  })),
}, null, 2));
console.log('GP-002 RECORDABLE FIXTURES');
for (const row of recordable) console.log(JSON.stringify(row));
console.log(`recordable=${recordable.length} / tested=${rows.length}`);
if (recordable.length === 0) process.exitCode = 2;
