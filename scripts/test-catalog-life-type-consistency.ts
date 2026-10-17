import assert from 'node:assert/strict';

import { fishData } from '../src/data/fishData';
import { getCatalogIdentityBoundary } from '../src/data/catalogIdentityBoundaries';
import { getCompatibilityDomainBoundary } from '../src/data/compatibilityDomainBoundaries';
import { getLifeType } from '../src/modules/species/species.service';

const expectedLifeType = (category: string) => {
  if (category === '水草') return 'plant';
  if (category === '硬景/底床') return 'hardscape';
  if (['虾螺蟹', '虾类', '螺类'].includes(category)) return 'invertebrate';
  if (['珊瑚/海水无脊椎', '水母'].includes(category)) return 'coral';
  if (['龟类', '两栖/爬宠'].includes(category)) return 'reptile';
  if (['鱼类', '灯科鱼', '鲶鱼/异型', '慈鲷/斗鱼', '海水鱼'].includes(category)) return 'fish';
  return null;
};

const mismatches = fishData.flatMap(species => {
  const expected = expectedLifeType(species.category);
  const actual = getLifeType(species);
  return expected && expected !== actual
    ? [{ speciesId: species.id, name: species.name, category: species.category, expected, actual }]
    : [];
});

assert.deepEqual(mismatches, [], 'catalog category and runtime life type must agree');

const byId = (id: string) => {
  const species = fishData.find(item => item.id === id);
  assert.ok(species, 'missing catalog fixture: ' + id);
  return species;
};

assert.equal(getLifeType(byId('sp_0077')), 'plant', 'Cabomba caroliniana must remain a plant');
assert.equal(getLifeType(byId('sp_0089')), 'plant', 'Limnophila aquatica must remain a plant');
assert.equal(getLifeType(byId('sp_0334')), 'coral', 'Stichodactyla gigantea must remain marine non-fish');
assert.equal(getCompatibilityDomainBoundary('sp_0334')?.lifeType, 'coral_or_anemone', 'corrected sea anemone must route to the explicit cross-taxa domain boundary');
assert.equal(getLifeType(byId('sp_0211')), 'fish', 'Thorichthys must not be mistaken for shrimp genus Thor');

for (const id of ['sp_0241', 'sp_0266', 'sp_0271', 'sp_0372', 'sp_0373', 'sp_0411', 'sp_0416']) {
  const boundary = getCatalogIdentityBoundary(id);
  assert.ok(boundary, id + ': corrected fish category must not erase unresolved variant identity');
  assert.equal(boundary.code, 'catalog_variant_identity_unresolved', id + ': category correction must preserve fail-closed variant identity');
}
for (const id of ['sp_0077', 'sp_0089', 'sp_0334']) {
  assert.equal(getCatalogIdentityBoundary(id), undefined, id + ': resolved object classification must not keep a stale identity boundary');
}

const counts = fishData.reduce<Record<string, number>>((acc, species) => {
  const type = getLifeType(species);
  acc[type] = (acc[type] || 0) + 1;
  return acc;
}, {});

console.log('Catalog life-type consistency PASS:', JSON.stringify({ catalogObjects: fishData.length, mismatches: mismatches.length, counts }));
