import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

const [routes, onboarding, statusCard, aquarium, search, identify, care, app] = await Promise.all([
  read('src/services/navigation/task-routes.ts'),
  read('src/services/onboarding/onboarding-paths.ts'),
  read('src/components/product/StatusSummaryCard.tsx'),
  read('src/pages/Aquarium.tsx'),
  read('src/pages/Search.tsx'),
  read('src/pages/Identify.tsx'),
  read('src/pages/CareEncyclopedia.tsx'),
  read('src/App.tsx'),
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

assert.ok(statusCard.includes('onClick={onBrowseCare}'), '展示组件只负责触发养护任务，不应自行猜目的地');
assert.ok(aquarium.includes("onBrowseCare={() => navigateToRoute(taskRoutes.care.recommendations)}"), '空养护计划的 CTA 必须由容器传入养护推荐 deep link');
assert.equal(aquarium.includes("onBrowseCare={() => navigateToRoute('/care')}"), false, '空养护计划不得只打开 /care 首页');

assert.ok(/\/encyclopedia\?[^'`\n]*species=/.test(search), '搜索物种结果必须携带 species 定位信息');
assert.ok(/\/care\?topic=/.test(search), '搜索养护结果必须携带 topic 定位信息');
assert.ok(identify.includes('taskRoutes.encyclopedia.compatibility'), '识别后的混养入口必须进入 compatibility task');
assert.ok(identify.includes("taskRoutes.aquarium.create('identify')"), '识别缺少鱼缸时必须直达建缸任务，而不是落鱼缸首页');
assert.ok(care.includes("location.hash === '#care-recommendations'"), '养护页必须消费推荐区 deep link');
assert.ok(care.includes("location.hash === '#care-search'"), '养护页必须消费搜索/检查区 deep link');
assert.ok(care.includes("location.hash === '#care-favorites'"), '养护页必须消费收藏 deep link');

assert.ok(app.includes("'/aquarium': ["), '桌面鱼缸导航必须暴露任务级子菜单，不能只依赖一级 My Aquarium / 我的鱼缸入口');
assert.ok(app.includes("labelKey: 'aquarium.dailyCheck'"), '鱼缸子菜单必须明确命名 Daily Aquarium Check / 每日鱼缸检查');
assert.ok(app.includes("descriptionKey: 'aquarium.dailyCheckDesc'"), '每日检查子菜单必须解释它是实际巡检任务，而不是 Care troubleshooting');
assert.ok(app.includes('path: taskRoutes.aquarium.dailyCheck'), '每日检查子菜单必须直达真实 daily-check route');

console.log('全项目 Task-entry / Deep-link Contract 检查通过。');
