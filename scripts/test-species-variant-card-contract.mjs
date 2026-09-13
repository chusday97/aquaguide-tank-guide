import assert from 'node:assert/strict';
import fs from 'node:fs';

const page = fs.readFileSync(new URL('../src/pages/SpeciesLanding.tsx', import.meta.url), 'utf8');
const styles = fs.readFileSync(new URL('../src/styles/seo-system.css', import.meta.url), 'utf8');
const fishData = fs.readFileSync(new URL('../src/data/fishData.ts', import.meta.url), 'utf8');
const service = fs.readFileSync(new URL('../src/services/species/species-landing.service.ts', import.meta.url), 'utf8');

assert.match(page, /mode\?: 'hero' \| 'variant-card'/, 'MediaFrame must expose a variant-card mode');
assert.match(page, /mode="variant-card"/, 'variant cards must use the dedicated media mode');
assert.match(page, /className="seo-variant-card__name"/, 'variant names must use the shared copy role');
assert.match(page, /seo-variant-card__scientific/, 'variant scientific names must use the shared copy role');
assert.doesNotMatch(page, /className="mt-3 truncate text-sm font-bold text-ink"/, 'variant names must not be truncated');
assert.doesNotMatch(page, /className="seo-meta mt-1 truncate"/, 'variant scientific names must not be truncated');
assert.match(styles, /\.seo-variant-card__media,\n\.seo-variant-card__fallback[\s\S]*aspect-ratio: 4 \/ 3;/, 'variant media must keep a stable 4:3 frame');
assert.match(styles, /\.seo-variant-card__image[\s\S]*width: auto;[\s\S]*height: auto;[\s\S]*max-width: 100%;[\s\S]*max-height: 100%;[\s\S]*object-fit: contain;/, 'variant images must preserve intrinsic proportions');
assert(!page.includes("profile.editorial?.signature || fish.description"), 'unreviewed catalog descriptions must not become SEO hero copy');
assert.match(styles, /@media \(max-width: 559px\) \{[\s\S]*\.seo-variant-grid \{[\s\S]*grid-template-columns: 1fr;/, 'mobile variant cards must use a comfortable single column');
assert.match(styles, /@media \(min-width: 560px\) and \(max-width: 767px\) \{[\s\S]*\.seo-variant-grid \{[\s\S]*grid-template-columns: repeat\(2/, 'tablet variant cards must use two columns');
assert.match(fishData, /"id": "sp_0436"[\s\S]*"name": "孔雀鱼"[\s\S]*"scientificName": "Poecilia reticulata"/, 'the guppy catalog entry must remain available');
assert.match(service, /const routeSpecies = byId\.get\(slug\);/, 'species routes must resolve from the catalog by id');
assert.match(page, /noindex|noindex,follow|setSeoDocument/, 'Species page must retain its existing SEO metadata path');

console.log('Species variant card contract passed: 4:3 contain media, consistent copy roles, guppy catalog case, and no truncation.');
