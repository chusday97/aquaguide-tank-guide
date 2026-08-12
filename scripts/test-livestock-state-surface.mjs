import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');

const [roster, taskSurface, typography] = await Promise.all([
  read('src/components/aquarium/LivestockRosterDialog.tsx'),
  read('src/components/common/AdaptiveTaskContent.tsx'),
  read('src/styles/typography-system.css'),
]);

assert.ok(roster.includes("from '../common/AdaptiveDetailContent'"), 'livestock roster must use the responsive right-drawer/bottom-sheet surface');
assert.ok(roster.includes('<AdaptiveDetailContent'), 'livestock roster must not stay in the old centered 900px dialog');
assert.equal(roster.includes('w-[min(94vw,900px)]'), false, 'old 94vw/900px centered roster geometry must be removed');
assert.ok(roster.includes("editingRecordId ? 'grid grid-cols-1 gap-3'"), 'editing one livestock record must use the full available drawer width');
assert.equal(roster.includes('displayedRecords.length > 0 ? (\n              <div className="grid gap-3 md:grid-cols-2">'), false, 'editing mode must not be trapped in the two-column roster grid');
assert.ok(typography.includes('.livestock-roster-surface'), 'livestock drawer must have an explicit editing-surface width contract');
assert.ok(typography.includes('--surface-editing-width: 560px'), 'editing surface width must remain distinct from reading and decision surfaces');

assert.ok(taskSurface.includes("data-surface={isPhoneLayout ? 'task-flow-mobile' : 'task-flow-drawer'}"), 'task surface must expose mobile and desktop presentation modes');
assert.ok(taskSurface.includes('right-0 top-0'), 'desktop task flow must attach to the right edge');
assert.ok(taskSurface.includes('--surface-editing-width'), 'desktop task flow must use the semantic editing width instead of 50vw');
assert.equal(taskSurface.includes('w-[50vw]'), false, 'desktop task flow must not hard-code half the viewport');
assert.ok(taskSurface.includes('data-open:slide-in-from-right-full'), 'desktop task flow must slide in from the right');
assert.ok(taskSurface.includes("bottom-0 left-0 right-auto top-0 h-[100dvh]"), 'mobile task flow must preserve its existing full-screen geometry');

console.log('Livestock state surface verified: single-record editing fills a workspace-aware editing drawer; mobile behavior is preserved.');
