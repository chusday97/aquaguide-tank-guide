import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

const adaptive = await read('src/components/common/AdaptiveDetailContent.tsx');
const confirm = await read('src/components/common/ConfirmDialog.tsx');

assert.ok(adaptive.includes("data-surface={isPhoneLayout ? 'bottom-sheet' : 'right-drawer'}"), 'detail surface must expose mobile bottom-sheet and desktop right-drawer states');
assert.ok(adaptive.includes("bottom-0 left-1/2 top-auto h-[92dvh] max-h-[92dvh] !w-full !max-w-[430px] -translate-x-1/2 translate-y-0 rounded-b-none rounded-t-[28px]"), 'mobile detail surface must preserve the existing bottom-sheet geometry');
assert.ok(adaptive.includes('right-0 top-0'), 'desktop detail surface must attach to the right edge');
assert.ok(adaptive.includes('h-[100dvh]'), 'desktop detail surface must use full viewport height');
assert.ok(adaptive.includes('w-[50vw]'), 'desktop detail surface must target half viewport width');
assert.ok(adaptive.includes('max-w-[760px]'), 'desktop detail surface must retain a readable maximum width');
assert.ok(adaptive.includes('data-open:slide-in-from-right-full'), 'desktop detail surface must slide in from the right');
assert.ok(adaptive.includes('data-closed:slide-out-to-right-full'), 'desktop detail surface must slide out to the right');
assert.equal(adaptive.includes('centered-dialog'), false, 'AdaptiveDetailContent desktop mode must not regress to centered-dialog');

assert.ok(confirm.includes("from '@/components/ui/dialog'"), 'ConfirmDialog must keep using the centered base dialog');
assert.equal(confirm.includes('AdaptiveDetailContent'), false, 'ConfirmDialog must not become a right-side drawer');

console.log('响应式详情 Surface 通过：mobile bottom sheet / desktop right drawer / centered confirm boundary。');
