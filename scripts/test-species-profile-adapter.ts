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

console.log('species profile adapter verified: explicit water type only, no text inference');
