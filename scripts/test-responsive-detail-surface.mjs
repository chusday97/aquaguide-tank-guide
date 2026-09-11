import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

const adaptive = await read('src/components/common/AdaptiveDetailContent.tsx');
const taskSurface = await read('src/components/common/AdaptiveTaskContent.tsx');
const typography = await read('src/styles/typography-system.css');
const confirm = await read('src/components/common/ConfirmDialog.tsx');
const encyclopedia = await read('src/pages/Encyclopedia.tsx');
const care = await read('src/pages/CareEncyclopedia.tsx');
const compatibility = await read('src/components/CompatibilityRiskCalculator.tsx');

assert.ok(adaptive.includes("data-surface={isPhoneLayout ? 'bottom-sheet' : 'detail-rail'}"), 'detail surface must expose mobile bottom-sheet and desktop detail-rail states');
assert.ok(adaptive.includes("data-detail-viewport={isPhoneLayout ? 'phone-sheet' : 'desktop-rail'}"), 'detail surface must expose the responsive viewport contract');
assert.ok(adaptive.includes("data-detail-behavior={isPhoneLayout ? 'bottom-sheet' : 'persistent-browse-rail'}"), 'desktop browsing details must remain a persistent rail');
assert.ok(adaptive.includes('bottom-0 left-1/2 top-auto h-[68dvh] min-h-[52dvh] max-h-[82dvh]'), 'mobile detail surface must preserve the bounded bottom-sheet geometry');
assert.ok(adaptive.includes('right-0 top-0'), 'desktop detail surface must attach to the right edge');
assert.ok(adaptive.includes('h-[100dvh]'), 'desktop detail surface must use full viewport height');
assert.ok(adaptive.includes('w-[clamp(480px,42vw,600px)]'), 'desktop detail rail must use the bounded reading width');
assert.ok(adaptive.includes('max-w-[calc(100vw-280px)]'), 'desktop detail rail must respect workspace width');
assert.equal(adaptive.includes("width: '50vw'"), false, 'desktop detail surface must not hard-code 50vw');
assert.equal(adaptive.includes('w-[50vw]'), false, 'desktop detail surface must not regress to a utility-class 50vw width');
assert.ok(adaptive.includes('data-open:slide-in-from-right'), 'desktop detail surface must slide in from the right');
assert.ok(adaptive.includes('data-closed:slide-out-to-right'), 'desktop detail surface must slide out to the right');
assert.equal(adaptive.includes('centered-dialog'), false, 'AdaptiveDetailContent desktop mode must not regress to centered-dialog');

assert.ok(taskSurface.includes('--surface-editing-width'), 'task drawer must use the semantic editing width token');
assert.ok(taskSurface.includes('--desktop-sidebar-width'), 'task drawer must respect the desktop workspace width');
assert.equal(taskSurface.includes("width: '50vw'"), false, 'task drawer must not hard-code 50vw');

assert.ok(typography.includes('--surface-reading-width: 520px'), 'reading surface token must remain near 520px');
assert.ok(typography.includes('--surface-editing-width: 560px'), 'editing surface token must remain near 560px');
assert.ok(typography.includes('--surface-decision-width: 640px'), 'complex decision surface token must remain near 640px');
assert.ok(typography.includes('.livestock-roster-surface'), 'livestock task must opt into the editing width');
assert.ok(typography.includes('[data-surface="compatibility-checkout-drawer"]'), 'compatibility drawer must be sized as a complex decision surface');

assert.ok(encyclopedia.includes('<AdaptiveDetailContent showCloseButton={false}>'), 'species category/variant detail must use the shared detail rail');
assert.equal(encyclopedia.includes('DialogContent className="w-[94vw] max-w-[920px]'), false, 'species category detail must not regress to a centered 94vw modal');
assert.ok(encyclopedia.includes("setCalculatorSpeciesIds(prev => prev.includes(fish.id) ? prev : [...prev, fish.id]);\n    closeAtlasDetail(false);\n    setViewMode('compatibility');"), 'adding a species to compatibility must open the checkout drawer immediately');
assert.equal(encyclopedia.includes("{viewMode === 'browse' ? ("), false, 'compatibility mode must not replace/unmount the atlas workspace');
assert.ok(encyclopedia.includes("{viewMode === 'compatibility' && (\n        <div id=\"compatibility-calculator\""), 'compatibility calculator must render as an overlay while the atlas remains mounted');

assert.ok(care.includes('<AdaptiveDetailContent>'), 'care guide detail must use the shared right drawer');
assert.ok(compatibility.includes('data-surface="compatibility-checkout-drawer"'), 'compatibility must expose a dedicated checkout drawer surface');
assert.ok(compatibility.includes('page-frame overflow-hidden'), 'compatibility checkout surface must preserve the page-frame contract');
assert.equal(compatibility.includes('sm:w-[50vw]'), false, 'compatibility checkout drawer must not carry a legacy 50vw utility width');

assert.ok(confirm.includes("from '@/components/ui/dialog'"), 'ConfirmDialog must keep using the centered base dialog');
assert.equal(confirm.includes('AdaptiveDetailContent'), false, 'ConfirmDialog must not become a right-side drawer');

console.log('响应式 Surface 通过：reading/editing/decision 使用任务型宽度；mobile 保持 bottom sheet；confirm 保持居中。');
