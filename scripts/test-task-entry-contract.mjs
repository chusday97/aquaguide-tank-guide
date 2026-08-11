import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

const [routes, onboarding, statusCard, search, identify, care] = await Promise.all([
  read('src/services/navigation/task-routes.ts'),
  read('src/services/onboarding/onboarding-paths.ts'),
  read('src/components/product/StatusSummaryCard.tsx'),
  read('src/pages/Search.tsx'),
  read('src/pages/Identify.tsx'),
  read('src/pages/CareEncyclopedia.tsx'),
]);

for (const required of [
  "recommendations: '/care#care-recommendations'",
  "search: '/care#care-search'",
  "results: '/care#care-results'",
  "favorites: '/care#care-favorites'",
  'topic: (topicId: string',
  "wishlist: '/collection/wishlist'",
  "care: '/collection/care'",
  "memorial: '/collection/memorial'",
  'compatibilitySpecies:',
  'species: (speciesId: string',
]) {
  assert.ok(routes.includes(required), `taskRoutes 缺少任务级目的地: ${required}`);
}

assert.ok(onboarding.includes("taskRoutes.aquarium.setup('onboarding')"), 'onboarding 的鱼缸设置必须进入真实 setup task');
assert.ok(onboarding.includes("taskRoutes.encyclopedia.compatibilityWith('onboarding')"), 'onboarding 的混养任务必须直接进入 compatibility mode');
assert.ok(onboarding.includes("taskRoutes.aquarium.dailyCheckFrom('onboarding')"), 'onboarding 的每日检查必须直达巡检 task');
assert.equal(onboarding.includes('action=settings&panel=setup'), false, '禁止把不存在的 action=settings 当任务入口');

assert.ok(statusCard.includes('navigate(taskRoutes.care.recommendations)'), '空养护计划的 CTA 必须直达养护推荐，不得只打开 /care 首页');
assert.equal(statusCard.includes('onClick={onBrowseCare}'), false, '养护 CTA 不得继续依赖泛 /care 跳转');

assert.ok(/\/encyclopedia\?[^'`\n]*species=/.test(search), '搜索物种结果必须携带 species 定位信息');
assert.ok(/\/care\?topic=/.test(search), '搜索养护结果必须携带 topic 定位信息');
assert.ok(identify.includes('taskRoutes.encyclopedia.compatibility'), '识别后的混养入口必须进入 compatibility task');
assert.ok(identify.includes('taskRoutes.aquarium.setup'), '识别缺少鱼缸信息时必须直达 setup task');
assert.ok(care.includes("location.hash === '#care-recommendations'"), '养护页必须消费推荐区 deep link');
assert.ok(care.includes("location.hash === '#care-search'"), '养护页必须消费搜索/检查区 deep link');
assert.ok(care.includes("location.hash === '#care-favorites'"), '养护页必须消费收藏 deep link');

console.log('全项目 Task-entry / Deep-link Contract 检查通过。');
