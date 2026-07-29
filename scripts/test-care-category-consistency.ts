import assert from 'node:assert/strict';
import { careTopicsData } from '../src/data/careTopicsData';
import { applyLocalization } from '../src/i18n/localizeData';
import {
  getCareCategoryTopicIds,
  type CareCategoryId,
} from '../src/services/care/care-category.service';

const categoryIds: CareCategoryId[] = [
  'water_quality',
  'new_stock',
  'fish_health',
  'equipment',
  'breeding',
  'maintenance',
  'feeding',
  'death',
  'beginner',
];

applyLocalization('zh-CN');
const chineseResults = Object.fromEntries(categoryIds.map(id => [id, getCareCategoryTopicIds(careTopicsData, id)]));

applyLocalization('en');
const englishResults = Object.fromEntries(categoryIds.map(id => [id, getCareCategoryTopicIds(careTopicsData, id)]));

categoryIds.forEach(id => {
  assert.deepEqual(englishResults[id], chineseResults[id], `${id} must return the same article IDs in Chinese and English`);
  assert.ok(chineseResults[id].length > 0, `${id} should contain at least one article`);
});

assert.ok(chineseResults.new_stock.includes('guide_new_fish_acclimation'), 'new_stock should include the acclimation guide');
assert.ok(chineseResults.new_stock.includes('qa_gen_013'), 'new_stock should include the direct-stocking safety guide');
assert.ok(chineseResults.new_stock.length >= 2, 'new_stock must not collapse into a single article');

applyLocalization('zh-CN');
console.log('care category IDs verified: Chinese and English return identical article sets');
