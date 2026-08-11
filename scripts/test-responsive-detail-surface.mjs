import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

const adaptive = await read('src/components/common/AdaptiveDetailContent.tsx');
const confirm = await read('src/components/common/ConfirmDialog.tsx');
const encyclopedia = await read('src/pages/Encyclopedia.tsx');
const care = await read('src/pages/CareEncyclopedia.tsx');
const compatibility = await read('src/components/CompatibilityRiskCalculator.tsx');

assert.ok(adaptive.includes("data-surface={isPhoneLayout ? 'bottom-sheet' : 'right-drawer'}"), 'detail surface must expose mobile bottom-sheet and desktop right-drawer states');
assert.ok(adaptive.includes("bottom-0 left-1/2 top-auto h-[92dvh] max-h-[92dvh] !w-full !max-w-[430px] -translate-x-1/2 translate-y-0 rounded-b-none rounded-t-[28px]"), 'mobile detail surface must preserve the existing bottom-sheet geometry');
assert.ok(adaptive.includes('right-0 top-0'), 'desktop detail surface must attach to the right edge');
assert.ok(adaptive.includes('h-[100dvh]'), 'desktop detail surface must use full viewport height');
assert.ok(adaptive.includes('w-[50vw]'), 'desktop detail surface must target half viewport width');
assert.ok(adaptive.includes("width: '50vw'"), 'desktop detail surface must enforce exact 50vw geometry instead of relying only on utility class order');
assert.ok(adaptive.includes("maxWidth: '50vw'"), 'desktop detail surface must not grow wider than half the viewport');
assert.equal(adaptive.includes('min-w-[520px]'), false, 'desktop detail surface must not exceed half-screen because of a minimum width');
assert.ok(adaptive.includes('max-w-none'), 'desktop detail surface must not collapse to a narrow fixed-width sidebar');
assert.ok(adaptive.includes('data-open:slide-in-from-right-full'), 'desktop detail surface must slide in from the right');
assert.ok(adaptive.includes('data-closed:slide-out-to-right-full'), 'desktop detail surface must slide out to the right');
assert.equal(adaptive.includes('centered-dialog'), false, 'AdaptiveDetailContent desktop mode must not regress to centered-dialog');

assert.ok(encyclopedia.includes('<AdaptiveDetailContent showCloseButton={false}>'), 'species category/variant detail must use the shared right drawer');
assert.equal(encyclopedia.includes('DialogContent className="w-[94vw] max-w-[920px]'), false, 'species category detail must not regress to a centered 94vw modal');
assert.ok(encyclopedia.includes("setCalculatorSpeciesIds(prev => prev.includes(fish.id) ? prev : [...prev, fish.id]);\n    closeAtlasDetail(false);\n    setViewMode('compatibility');"), 'adding a species to compatibility must open the checkout drawer immediately');
assert.equal(encyclopedia.includes("{viewMode === 'browse' ? ("), false, 'compatibility mode must not replace/unmount the atlas workspace');
assert.ok(encyclopedia.includes("{viewMode === 'compatibility' && (\n        <div id=\"compatibility-calculator\""), 'compatibility calculator must render as an overlay while the atlas remains mounted');

assert.ok(care.includes('<AdaptiveDetailContent>'), 'care guide detail must use the shared right drawer');

assert.ok(compatibility.includes('data-surface="compatibility-checkout-drawer"'), 'compatibility must expose a dedicated checkout drawer surface');
assert.ok(compatibility.includes('fixed bottom-0 right-0 top-0'), 'compatibility checkout drawer must attach to the right viewport edge');
assert.ok(compatibility.includes('sm:w-[50vw]'), 'compatibility checkout drawer must occupy half the desktop viewport');
assert.ok(compatibility.includes('slide-in-from-right-full'), 'compatibility checkout drawer must slide in from the right');
assert.ok(compatibility.includes("aria-label={isEn ? 'Close compatibility plan' : '关闭混养方案'}"), 'compatibility checkout drawer must expose an explicit close control');

assert.ok(confirm.includes("from '@/components/ui/dialog'"), 'ConfirmDialog must keep using the centered base dialog');
assert.equal(confirm.includes('AdaptiveDetailContent'), false, 'ConfirmDialog must not become a right-side drawer');

console.log('响应式详情 Surface 通过：species/care = 50vw right drawer；compatibility = checkout drawer；confirm = centered。');
