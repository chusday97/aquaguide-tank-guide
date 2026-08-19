import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');

const [
  foundation,
  typography,
  systemCss,
  main,
  layoutProvider,
  quickActions,
  collectionHub,
  search,
] = await Promise.all([
  read('src/styles/ui-v2-foundation.css'),
  read('src/styles/typography-system.css'),
  read('src/styles/uiux-system-refactor.css'),
  read('src/main.tsx'),
  read('src/components/layout/LayoutModeProvider.tsx'),
  read('src/components/product/QuickActionGrid.tsx'),
  read('src/pages/CollectionHub.tsx'),
  read('src/pages/Search.tsx'),
]);

for (const token of [
  '--ui-space-1', '--ui-space-7', '--ui-radius-control', '--ui-radius-card', '--ui-radius-surface',
  '--ui-shadow-card', '--ui-shadow-card-hover', '--type-display-size', '--type-card-size', '--type-meta-size',
]) {
  assert.ok(foundation.includes(token), `ui-v2-foundation must own ${token}`);
}
for (const duplicate of ['--type-display-size:', '--type-section-size:', '--type-body-size:', '--type-meta-size:']) {
  assert.equal(typography.includes(duplicate), false, `typography compatibility layer must not redefine ${duplicate}`);
}
assert.ok(main.indexOf("./styles/uiux-system-refactor.css") > main.indexOf("./styles/ui-v2-shell.css"), 'cross-surface UX contract must load after page/shell V2 styles');
assert.ok(systemCss.includes('.desktop-workspace-scroll::-webkit-scrollbar'), 'desktop workspace must expose a scroll-position affordance');
assert.ok(systemCss.includes('.aquaguide-app button[aria-label]'), 'named interactive controls must inherit a system-level minimum target');
assert.ok(systemCss.includes('min-width: 44px') && systemCss.includes('min-height: 44px'), 'system-level named controls must meet the 44px interaction target');
assert.ok(systemCss.includes('@media (prefers-reduced-motion: reduce)'), 'system layer must honor reduced-motion preferences');

assert.ok(layoutProvider.includes('PHONE_LAYOUT_MAX_WIDTH'), 'layout system must expose one compact-width boundary');
assert.ok(layoutProvider.includes('window.innerWidth'), 'layout system must be driven by available viewport width');
assert.ok(layoutProvider.includes('window.matchMedia(PHONE_LAYOUT_MEDIA_QUERY)'), 'layout system must react to viewport changes');

assert.ok(quickActions.includes("new Set(['recordWaterChange', 'recordFeeding', 'recordExistingSpecies'])"), 'Aquarium must keep a deliberately small primary action set');
assert.ok(quickActions.includes('data-quick-action-priority="primary"'), 'primary action hierarchy must be machine-verifiable');
assert.ok(quickActions.includes('<details className="quick-action-more">'), 'secondary Aquarium actions must remain progressively disclosed');

assert.ok(collectionHub.includes('function CollectionCarousel'), 'collection hub must use focus-carousel IA');
assert.ok(collectionHub.includes('useReducedMotion'), 'collection carousel must respect reduced motion');
assert.ok(collectionHub.includes('inert={!isActive}'), 'inactive carousel cards must be removed from keyboard focus order');
assert.equal((collectionHub.match(/<CollectionModuleCard/g) || []).length, 3, 'collection primary IA must contain three live modules');
assert.ok(collectionHub.includes('data-collection-coming-soon'), 'building achievements must live outside primary carousel IA');

assert.ok(search.includes('const [showAllSpecies, setShowAllSpecies]'), 'search must support explicit species expansion');
assert.ok(search.includes('const [showAllCare, setShowAllCare]'), 'search must support explicit care expansion');
assert.ok(search.includes('data-search-show-all="species"'), 'species result section must expose a discoverable show-all control');
assert.ok(search.includes('data-search-show-all="care"'), 'care result section must expose a discoverable show-all control');

console.log('AquaGuide UI/UX system contract PASS: canonical tokens, width-driven layout, progressive disclosure, focus carousel IA, complete search expansion, 44px controls, reduced motion and desktop scroll affordance.');
