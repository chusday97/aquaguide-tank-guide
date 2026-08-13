import type { Aquarium, Fish } from '../src/types';
import { recommendationService } from '../src/modules/recommendation/recommendation.service';

const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

const candidate: Fish = {
  id: 'certainty_candidate',
  name: '确定性测试鱼',
  scientificName: 'Certainty testus',
  category: '淡水鱼',
  image: '',
  difficulty: 'Easy',
  waterTemperature: '24-26°C',
  phLevel: '6.5-7.5',
  waterChangeCycle: 7,
  description: '淡水、温和、适合混养的测试候选。',
  diet: 'Omnivore',
  tankSize: '60L',
  temperament: 'Peaceful',
  size: 'Small',
  housingMode: '适合混养',
};

const legacyAquarium: Aquarium = {
  id: 'legacy_unknown_tank',
  name: 'Legacy unknown tank',
  fishes: [],
};

const legacyProfile = recommendationService.buildAquariumProfile(legacyAquarium, [candidate], 'empty_tank');
assert(legacyProfile.waterType === 'Unknown', `missing water type must remain Unknown, got ${legacyProfile.waterType}`);
assert(legacyProfile.volumeLiters === 0, `missing dimensions must not synthesize tank volume, got ${legacyProfile.volumeLiters}`);
assert(legacyProfile.effectiveVolumeLiters === 0, `missing dimensions must not synthesize effective capacity, got ${legacyProfile.effectiveVolumeLiters}`);
assert(legacyProfile.load.capacity === 0, `missing dimensions must keep load capacity at 0, got ${legacyProfile.load.capacity}`);
assert(legacyProfile.load.remainingCapacity === 0, `unknown capacity must not expose fake remaining capacity, got ${legacyProfile.load.remainingCapacity}`);
assert(legacyProfile.missingData.includes('水体类型'), 'missing water type must be explicitly requested');
assert(legacyProfile.missingData.includes('鱼缸容量'), 'missing dimensions must request tank capacity');

const legacySmart = recommendationService.recommendSmartForAquarium({
  aquarium: legacyAquarium,
  speciesPool: [candidate],
  mode: 'empty_tank',
});
assert(legacySmart.needsMoreInfo === true, 'legacy unknown tank must request more information');
assert(legacySmart.infoRequests.includes('水体类型'), 'smart recommendation must surface missing water type');
assert(legacySmart.infoRequests.includes('鱼缸容量'), 'smart recommendation must surface missing tank capacity');
assert(legacySmart.direct.length === 0, 'unknown tank must not produce direct-add recommendations');
assert(legacySmart.emptyPlans.length === 0, 'unknown tank must not generate empty-tank plans from synthetic defaults');

const configuredAquarium: Aquarium = {
  id: 'configured_tank',
  name: 'Configured tank',
  fishes: [],
  dimensions: { length: '60', width: '30', height: '35' },
  waterType: 'Freshwater',
  targetTemperature: '25',
  equipment: { filter: '桶滤', heater: true, oxygen: false },
};
const configuredProfile = recommendationService.buildAquariumProfile(configuredAquarium, [candidate], 'empty_tank');
assert(configuredProfile.waterType === 'Freshwater', 'configured freshwater tank must preserve water type');
assert(configuredProfile.volumeLiters === 54, `60×30×35 tank must calculate to 54L usable volume, got ${configuredProfile.volumeLiters}`);
assert(configuredProfile.effectiveVolumeLiters > 0, 'configured dimensions must produce positive effective capacity');
assert(!configuredProfile.missingData.includes('水体类型'), 'configured water type must not be reported missing');
assert(!configuredProfile.missingData.includes('鱼缸容量'), 'configured dimensions must not be reported missing');

console.log(JSON.stringify({
  ok: true,
  legacy: {
    waterType: legacyProfile.waterType,
    volumeLiters: legacyProfile.volumeLiters,
    capacity: legacyProfile.load.capacity,
    directCandidates: legacySmart.direct.length,
    infoRequests: legacySmart.infoRequests,
  },
  configured: {
    waterType: configuredProfile.waterType,
    volumeLiters: configuredProfile.volumeLiters,
    capacity: configuredProfile.load.capacity,
  },
}, null, 2));
