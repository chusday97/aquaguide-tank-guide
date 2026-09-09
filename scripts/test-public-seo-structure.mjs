import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = relativeFile => fs.readFileSync(path.join(root, relativeFile), 'utf8');

const publicPages = [
  ['src/pages/MarketingLanding.tsx', ['SeoPageShell', 'SeoCapabilityCard', 'SeoRelatedLinks', 'SeoSourceFooter']],
  ['src/pages/CategoryLanding.tsx', ['SeoPageShell', 'SeoBreadcrumbs', 'SeoCapabilityCard', 'SeoSourceFooter']],
  ['src/pages/SpeciesLanding.tsx', ['SeoPageShell', 'SeoHero', 'SeoDataRail', 'SeoCapabilityCard', 'SeoSourceFooter']],
  ['src/pages/CareGuideLanding.tsx', ['SeoPageShell', 'SeoBreadcrumbs', 'SeoSourceFooter']],
];

for (const [relativeFile, requiredPieces] of publicPages) {
  const source = read(relativeFile);
  assert.match(source, /<h1\b/, `${relativeFile} must define a visible H1`);
  for (const piece of requiredPieces) {
    assert.match(source, new RegExp(`\\b${piece}\\b`), `${relativeFile} is missing ${piece}`);
  }
}

const species = read('src/pages/SpeciesLanding.tsx');
assert.match(species, /profile\.editorial\?\.(overview|habitat|feeding|maintenance)/, 'Species must render published editorial conditionally');
assert.match(species, /groupVariants\.length > 1/, 'Species must keep Base/Variant content conditional');
assert.match(species, /profile\.faq\.length > 0/, 'Species must keep FAQ fail-closed');
assert.match(species, /lifeAnswers\.map/, 'Species must render life answers from published evidence');

const guide = read('src/pages/CareGuideLanding.tsx');
for (const phrase of ['先看核心结论', '再看分步操作', '最后做后续观察', '资料状态']) {
  assert.ok(guide.includes(phrase), `Guide preparation state is missing ${phrase}`);
}

const marketing = read('src/pages/MarketingLanding.tsx');
assert.match(marketing, /marketingSpeciesAsset \? <ResilientImage[\s\S]*?物种图片暂不可用/, 'Marketing Hero must have a visible image fallback');

console.log('Public SEO structure checks passed: all page types have a stable content skeleton and conditional content gates.');
