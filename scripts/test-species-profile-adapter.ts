import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { speciesProfileFromFish } from '../src/services/catalog/species-profile.adapter';

const source = fishData[0];
assert.ok(source, 'fish fixture must exist');

const legacyProfile = speciesProfileFromFish({
  ...source,
  category: '海水观赏鱼',
  name: '测试海水鱼',
});
assert.equal(legacyProfile.waterType, 'unknown', 'legacy text must not infer water type');

const explicitProfile = speciesProfileFromFish({ ...source, waterType: 'saltwater' });
assert.equal(explicitProfile.waterType, 'saltwater', 'explicit catalog water type must be preserved');
assert.equal(explicitProfile.id, source.id);
assert.equal(explicitProfile.catalogKey, source.id);
assert.ok(explicitProfile.waterTemperatureMinC != null, 'temperature range should be canonicalized by the adapter');
assert.ok(explicitProfile.waterTemperatureMaxC != null, 'temperature range should be canonicalized by the adapter');
assert.ok(explicitProfile.phMin != null, 'pH range should be canonicalized by the adapter');
assert.ok(explicitProfile.phMax != null, 'pH range should be canonicalized by the adapter');

const incompleteProfile = speciesProfileFromFish({
  ...source,
  waterTemperature: '',
  phLevel: '',
  waterChangeCycle: 0,
  description: '',
  diet: '',
  tankSize: '',
});
assert.equal(incompleteProfile.waterTemperatureMinC, null);
assert.equal(incompleteProfile.waterTemperatureMaxC, null);
assert.equal(incompleteProfile.phMin, null);
assert.equal(incompleteProfile.phMax, null);
assert.equal(incompleteProfile.waterChangeCycleDays, null);
assert.equal(incompleteProfile.description, null);
assert.equal(incompleteProfile.diet, null);
assert.equal(incompleteProfile.tankSizeText, null);

console.log('species profile adapter verified: explicit water type only, no text inference');
