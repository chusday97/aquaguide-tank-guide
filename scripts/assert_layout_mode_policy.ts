import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  PHONE_LAYOUT_MAX_WIDTH,
  detectLayoutMode,
} from '../src/components/layout/LayoutModeProvider';

const desktopNavigator = { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/150 Safari/537.36' };
const phoneNavigator = { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Mobile/15E148 Safari/604.1' };

const viewportCases = [
  { name: '390px desktop UA still uses compact layout', navigator: desktopNavigator, width: 390, expected: 'phone' },
  { name: '600px desktop UA still uses compact layout', navigator: desktopNavigator, width: 600, expected: 'phone' },
  { name: '767px is the compact boundary', navigator: desktopNavigator, width: PHONE_LAYOUT_MAX_WIDTH, expected: 'phone' },
  { name: '768px starts desktop workspace', navigator: phoneNavigator, width: PHONE_LAYOUT_MAX_WIDTH + 1, expected: 'desktop' },
  { name: '1024px phone UA still uses available desktop space', navigator: phoneNavigator, width: 1024, expected: 'desktop' },
] as const;

for (const testCase of viewportCases) {
  assert.equal(detectLayoutMode(testCase.navigator, testCase.width), testCase.expected, testCase.name);
}

const fallbackCases = [
  { name: 'UA Client Hint phone fallback', navigator: { userAgentData: { mobile: true } }, expected: 'phone' },
  { name: 'UA Client Hint desktop fallback', navigator: { userAgentData: { mobile: false } }, expected: 'desktop' },
  { name: 'iPhone fallback', navigator: phoneNavigator, expected: 'phone' },
  { name: 'iPad fallback', navigator: { userAgent: 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1' }, expected: 'desktop' },
] as const;

for (const testCase of fallbackCases) {
  assert.equal(detectLayoutMode(testCase.navigator), testCase.expected, testCase.name);
}

const providerSource = readFileSync(new URL('../src/components/layout/LayoutModeProvider.tsx', import.meta.url), 'utf8');
assert.match(providerSource, /PHONE_LAYOUT_MAX_WIDTH\s*=\s*767/, 'layout provider must expose one compact-width boundary');
assert.match(providerSource, /window\.innerWidth/, 'layout mode must use the actual available viewport width');
assert.match(providerSource, /window\.matchMedia\(PHONE_LAYOUT_MEDIA_QUERY\)/, 'layout mode must react to compact/desktop width changes');
assert.match(providerSource, /media\.addEventListener\('change'/, 'layout mode must update after resize/media changes');

console.log(`layout mode policy: ${viewportCases.length} viewport cases + ${fallbackCases.length} fallback cases passed`);
