import assert from 'node:assert/strict';
import {
  buildAquariumArchiveArtifact,
  buildDiagnosisArtifact,
  buildHealthScoreArtifact,
  buildHundredDayArtifact,
  buildWeeklyCareArtifact,
} from '../src/services/export/aquarium-artifact.service';
import type { AquariumArtifactContext } from '../src/services/export/aquarium-artifact.service';

const context: AquariumArtifactContext = {
  aquarium: {
    id: 'tank-1',
    name: '客厅缸',
    fishes: [],
    dimensions: { length: '60', width: '40', height: '40' },
    waterType: 'Freshwater',
    targetTemperature: '25',
    equipment: { filter: '瀑布过滤', heater: true, oxygen: false, light: '普通灯' },
  },
  healthScore: 82,
  healthStatus: '正常',
  healthReasons: ['换水记录正常', '未发现阻断级混养'],
  missingData: [],
  nextAction: '完成今日检查',
  species: [{ name: '孔雀鱼', quantity: 6 }],
  careReminders: [],
};

const health = buildHealthScoreArtifact(context);
assert.equal(health.metric, '82');
assert.match(health.disclaimer, /并非智能设备实时检测/);

const diagnosis = buildDiagnosisArtifact(context, {
  riskLevel: 'high',
  riskLabel: '紧急',
  summary: '先增氧并观察呼吸',
  currentAction: '立即增氧',
  actions: ['停止喂食'],
  avoidActions: ['不要直接下药'],
  possibleCauses: ['缺氧'],
  observeItems: [],
  missingInfo: [],
  evidence: [],
  keyMetrics: [],
  matchedRules: [],
  matchedArticles: [],
  nextCheckAt: '30 分钟后',
});
assert.ok(diagnosis.sections.flatMap(section => section.items).includes('不要直接下药'));
assert.ok(!JSON.stringify(diagnosis).includes('userDescription'));

const weekly = buildWeeklyCareArtifact(context);
assert.equal(weekly.sections[0].title, '优先补做');
assert.equal(buildAquariumArchiveArtifact(context).sections[2].items[0], '孔雀鱼 × 6');
assert.equal(buildHundredDayArtifact(context, 128).metric, '128');

console.log('aquarium artifact builders: ok');
