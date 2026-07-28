import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { careTopicsData } from '../src/data/careTopicsData';
import { getSearchSuggestions } from '../src/services/search/search-suggestions.service';

const speciesFirst = getSearchSuggestions({
  query: '孔',
  locale: 'zh-CN',
  scope: 'global',
  species: fishData,
  careTopics: careTopicsData,
});

assert.ok(speciesFirst.totalSpeciesMatches >= 8, '“孔”应保留多个具体物种候选');
assert.equal(speciesFirst.suggestions[0]?.kind, 'species', '全局搜索必须优先展示具体物种');
assert.equal(new Set(speciesFirst.suggestions.filter(item => item.kind === 'species').map(item => item.targetId)).size, 8, '物种候选必须按 ID 去重');
assert.ok(speciesFirst.suggestions.filter(item => item.kind === 'species').every(item => item.scientificName && item.category), '物种候选必须带学名和类别');

const exact = getSearchSuggestions({
  query: '孔雀鱼',
  locale: 'zh-CN',
  scope: 'encyclopedia',
  species: fishData,
  careTopics: careTopicsData,
});
assert.equal(exact.suggestions[0]?.targetId, 'sp_0436', '完整名称完全匹配必须排在相似变种之前');
assert.equal(exact.suggestions[0]?.matchedBy, 'exact');

const scientific = getSearchSuggestions({
  query: 'Poecilia',
  locale: 'en',
  scope: 'identify',
  species: fishData,
  careTopics: careTopicsData,
});
assert.ok(scientific.suggestions.length > 1, '部分学名应返回多个具体候选');
assert.ok(scientific.suggestions.every(item => item.kind === 'species'), '识别页手动搜索只能返回物种');

const careOnly = getSearchSuggestions({
  query: '浮头',
  locale: 'zh-CN',
  scope: 'care',
  species: fishData,
  careTopics: careTopicsData,
});
assert.ok(careOnly.suggestions.some(item => item.kind === 'care'), '养护搜索应先返回相关文章');
assert.ok(careOnly.suggestions.some(item => item.kind === 'related_query' && item.label === '缺氧'), '养护搜索应提供受控相关词');
assert.ok(careOnly.suggestions.every(item => item.kind !== 'species'), '养护搜索不得混入无关物种');

const globalRelated = getSearchSuggestions({
  query: '工具鱼',
  locale: 'zh-CN',
  scope: 'global',
  species: fishData,
  careTopics: careTopicsData,
});
const firstRelatedIndex = globalRelated.suggestions.findIndex(item => item.kind === 'related_query');
const lastSpeciesIndex = globalRelated.suggestions.reduce((last, item, index) => item.kind === 'species' ? index : last, -1);
assert.ok(firstRelatedIndex === -1 || firstRelatedIndex > lastSpeciesIndex, '相关概念必须排在明确物种候选之后');

console.log('Search suggestion ranking checks passed.');
