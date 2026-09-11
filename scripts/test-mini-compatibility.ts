import assert from 'node:assert/strict';
import { evaluateSpeciesCombination } from '../src/services/compatibility/compatibility.service';
import type { Fish } from '../src/types';

const makeFish = (overrides: Partial<Fish> & Pick<Fish, 'id' | 'name'>): Fish => ({
  id: overrides.id,
  name: overrides.name,
  scientificName: `${overrides.name} scientific`,
  category: '小型观赏鱼',
  image: '/test.png',
  difficulty: 'Easy',
  waterTemperature: '22-26°C',
  phLevel: '6.5-7.5',
  waterChangeCycle: 7,
  description: '温和小型淡水鱼',
  diet: '杂食',
  tankSize: '40L',
  temperament: 'Peaceful',
  size: 'Small',
  housingMode: '适合混养',
  ...overrides,
});

const peacefulA = makeFish({ id: 'peaceful-a', name: '温和鱼 A' });
const peacefulB = makeFish({ id: 'peaceful-b', name: '温和鱼 B' });
const territorial = makeFish({ id: 'territorial', name: '领地鱼', temperament: 'Territorial', housingMode: '谨慎混养' });
const predator = makeFish({ id: 'predator', name: '大型捕食鱼', size: 'Large', temperament: 'Aggressive', description: '会吞食小鱼' });
const incomplete = makeFish({ id: 'incomplete', name: '资料缺失鱼', waterTemperature: '' });

const unreviewed = evaluateSpeciesCombination([peacefulA, peacefulB]);
assert.equal(unreviewed.status, 'insufficient_data');
assert.equal(unreviewed.metadata.scope, 'species_only');
assert.ok(unreviewed.missingData.some(rule => rule.code === 'behavior_evidence_unreviewed'));

const caution = evaluateSpeciesCombination([peacefulA, territorial]);
assert.equal(caution.status, 'insufficient_data');

const reviewedPredator = { ...predator, id: 'sp_0049', name: '珍珠赤雷龙' };
const blockedForward = evaluateSpeciesCombination([reviewedPredator, peacefulA]);
const blockedReverse = evaluateSpeciesCombination([peacefulA, reviewedPredator]);
assert.equal(blockedForward.status, 'not_recommended');
assert.equal(blockedReverse.status, 'not_recommended', '选择顺序不得改变捕食结论');

const insufficient = evaluateSpeciesCombination([peacefulA, incomplete]);
assert.equal(insufficient.status, 'insufficient_data');

const needsMore = evaluateSpeciesCombination([peacefulA]);
assert.equal(needsMore.status, 'insufficient_data');
assert.equal(needsMore.missingData[0]?.code, 'species_evidence_unreviewed');

console.log('mini compatibility: reviewed blockers and unreviewed evidence gate passed');
