import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const files = {
  enIndex: 'species/neocaridina-davidi/sp-0030.html',
  zhIndex: 'zh/species/neocaridina-davidi/sp-0030.html',
  enCanonical: 'species/neocaridina-davidi/sp-0031.html',
  zhNoindex: 'zh/species/neocaridina-davidi/sp-0164.html',
};
const [enIndex, zhIndex, enCanonical, zhNoindex, sitemap, manifest, receipt] = await Promise.all([
  readFile(path.join(dist, files.enIndex), 'utf8'),
  readFile(path.join(dist, files.zhIndex), 'utf8'),
  readFile(path.join(dist, files.enCanonical), 'utf8'),
  readFile(path.join(dist, files.zhNoindex), 'utf8'),
  readFile(path.join(dist, 'sitemap-species.xml'), 'utf8'),
  readFile(path.join(dist, 'species-pages.manifest.json'), 'utf8').then(JSON.parse),
  readFile(path.join(dist, 'species-pages.integration.json'), 'utf8').then(JSON.parse),
]);

assert.match(enIndex, /<title>Yellow Cherry Shrimp Care Guide \| AquaGuide<\/title>/);
assert.match(enIndex, /<meta name="description"/);
assert.match(enIndex, /<h1>Yellow Cherry Shrimp Care Guide<\/h1>/);
assert.match(enIndex, /<meta name="robots" content="index,follow">/);
assert.match(enIndex, /hreflang="zh-CN"/);
assert.match(enIndex, /alt="Yellow Cherry Shrimp aquarium profile"/);
assert.match(enIndex, /mode=compatibility&amp;species=sp_0030&amp;source=seo-species/);
assert.match(enIndex, /action=plan-species&amp;species=sp_0030&amp;source=seo-species/);
assert.match(zhIndex, /<html lang="zh-CN">/);
assert.match(zhIndex, /hreflang="en"/);
assert.match(enCanonical, /rel="canonical" href="[^"]+\/species\/neocaridina-davidi\/sp-0030\.html"/);
assert.match(zhNoindex, /<meta name="robots" content="noindex,follow">/);
assert.match(sitemap, /\/species\/neocaridina-davidi\/sp-0030\.html/);
assert.match(sitemap, /\/zh\/species\/neocaridina-davidi\/sp-0030\.html/);
assert.doesNotMatch(sitemap, /sp-0031\.html/);
assert.doesNotMatch(sitemap, /sp-0164\.html/);
assert.equal(manifest.environment, 'staging');
assert.equal(manifest.generated_pages, 6);
assert.equal(receipt.generated_pages, 6);
assert.equal(receipt.environment, 'staging');
console.log('Root Species SEO artifact verified: 3 bilingual Species / 6 HTML pages merged into AquaGuide dist.');
