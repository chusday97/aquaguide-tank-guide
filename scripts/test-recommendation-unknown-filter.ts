import assert from 'node:assert/strict';
import { recommendationService } from '../src/modules/recommendation/recommendation.service';
import type { Aquarium, Fish } from '../src/types';

const unknownSpecies: Fish = {
  id: 'unknown-species',
  name: '未审核鱼',
  scientificName: 'Unknown fish',
  category: '小型观赏鱼',
  image: '/test.png',
  difficulty: 'Easy',
  waterTemperature: '22-26°C',
  phLevel: '6.5-7.5',
  waterChangeCycle: 7,
  description: '测试用未审核物种',
  diet: '杂食',
  tankSize: '40L',
  temperament: 'Peaceful',
  size: 'Small',
  housingMode: '谨慎混养',
};

const emptyAquarium: Aquarium = {
  id: 'recommendation-test',
  name: '测试缸',
  fishes: [],
  dimensions: { length: '60', width: '30', height: '30' },
  waterType: 'Freshwater',
  targetTemperature: '25',
  equipment: { filter: '海绵过滤', heater: true, oxygen: true, light: '普通灯' },
  hardscape: [],
  plants: [],
};

const result = recommendationService.recommendSmartForAquarium({
  aquarium: emptyAquarium,
  speciesPool: [unknownSpecies],
});

assert.equal(result.direct.length, 0, 'unreviewed species must not be a direct recommendation');
assert.equal(result.adjustable.length, 0, 'unreviewed species must not be an adjustable recommendation');
assert.equal(result.emptyPlans.length, 0, 'unreviewed species must not form an empty-tank plan');
assert.deepEqual(result.blocked.map(item => item.speciesId), ['unknown-species']);

console.log('recommendation unknown filter: unreviewed candidates stay out of user recommendations');
