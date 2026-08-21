import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  PHONE_LAYOUT_BREAKPOINT_PX,
  PHONE_LAYOUT_QUERY,
  getLayoutModeForViewportWidth,
} from '../lib/layout-mode';

const cases = [
  { name: '390px phone', width: 390, expected: 'phone' },
  { name: '600px phone', width: 600, expected: 'phone' },
  { name: '767px phone boundary', width: 767, expected: 'phone' },
  { name: '768px desktop boundary', width: 768, expected: 'desktop' },
  { name: '1024px desktop', width: 1024, expected: 'desktop' },
  { name: '1440px desktop', width: 1440, expected: 'desktop' },
] as const;

assert.equal(PHONE_LAYOUT_BREAKPOINT_PX, 768, 'phone/desktop breakpoint must remain 768px unless the product contract changes');
assert.equal(PHONE_LAYOUT_QUERY, '(max-width: 767px)');
for (const testCase of cases) {
  assert.equal(getLayoutModeForViewportWidth(testCase.width), testCase.expected, testCase.name);
}

const providerSource = readFileSync(new URL('../src/components/layout/LayoutModeProvider.tsx', import.meta.url), 'utf8');
const dialogSource = readFileSync(new URL('../components/ui/dialog.tsx', import.meta.url), 'utf8');

assert.doesNotMatch(providerSource, /userAgentData|iPhone|iPad|Android\.+Mobile|Mobile\.+Safari/, 'layout provider must not infer product layout from UA/device identity');
assert.match(providerSource, /useSyncExternalStore/, 'layout provider must react to viewport breakpoint changes');
assert.match(providerSource, /@\/lib\/layout-mode/, 'layout provider must consume the shared viewport contract');
assert.match(dialogSource, /@\/lib\/layout-mode/, 'Dialog must consume the same shared viewport contract');
assert.doesNotMatch(dialogSource, /\(max-width:\s*767px\)/, 'Dialog must not own a duplicate phone breakpoint literal');

console.log(`layout mode policy: ${cases.length}/${cases.length} viewport cases protected`);
