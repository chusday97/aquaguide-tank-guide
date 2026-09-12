import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const css = fs.readFileSync(path.join(root, 'src/styles/seo-system.css'), 'utf8');
const species = fs.readFileSync(path.join(root, 'src/pages/SpeciesLanding.tsx'), 'utf8');

const requiredTokens = [
  '--seo-max-width: 1280px',
  '--seo-gutter: 80px',
  '--seo-section-gap: 96px',
  '--seo-control-min: 44px',
];
for (const token of requiredTokens) {
  assert.ok(css.includes(token), `SEO system is missing ${token}`);
}

const responsiveRules = [
  [/@media \(max-width: 1023px\)[\s\S]*?--seo-gutter: 32px[\s\S]*?\.seo-data-rail[\s\S]*?repeat\(3, minmax\(0, 1fr\)\)/, 'tablet data rail contract'],
  [/@media \(max-width: 767px\)[\s\S]*?--seo-gutter: 24px[\s\S]*?\.seo-data-rail[\s\S]*?repeat\(2, minmax\(0, 1fr\)\)[\s\S]*?\.seo-editorial-pair[\s\S]*?grid-template-columns: 1fr/, 'mobile single-column contract'],
  [/@media \(max-width: 559px\)[\s\S]*?-webkit-mask-image:[\s\S]*?mask-image:/, 'narrow chapter navigation affordance'],
  [/@media \(min-width: 560px\) and \(max-width: 767px\)[\s\S]*?grid-template-columns: minmax\(0, 1fr\) minmax\(0, 1fr\)[\s\S]*?\.seo-hero__media[\s\S]*?min-height: 280px[\s\S]*?\.seo-data-rail[\s\S]*?repeat\(3, minmax\(0, 1fr\)\)/, 'tablet-specific hero contract'],
  [/@media \(prefers-reduced-motion: reduce\)[\s\S]*?scroll-behavior: auto[\s\S]*?animation-duration: 0\.01ms/, 'reduced motion contract'],
];

for (const [pattern, label] of responsiveRules) {
  assert.match(css, pattern, `Missing ${label}`);
}

assert.match(species, /aria-label=\{labels\.chapters\}[\s\S]*?overflow-x-auto/, 'chapter navigation must remain horizontally scrollable on narrow screens');
assert.match(css, /#root:has\(\.seo-page-shell\)[\s\S]*?height: auto[\s\S]*?overflow: visible/, 'public SEO root must not inherit app-shell scroll clipping');
assert.match(css, /html:has\(\.public-seo-root\),[\s\S]*?height: auto !important[\s\S]*?overflow-y: auto/, 'public SEO document must not inherit the app height constraint');
assert.match(css, /\.seo-hero__media:has\(> \[role="img"\]\)[\s\S]*?min-height: 320px/, 'missing hero fallback must use a compact stable media frame');

console.log('Public SEO responsive contract checks passed: desktop, tablet, mobile and reduced-motion rules are present.');
