import assert from 'node:assert/strict';
import { getPublishedCategoryLanding, getPublishedCareGuide } from '../src/data/publishedPublicSeo';
import { getPublishedSpeciesProfile } from '../src/data/publishedSpeciesProfile';
import { getSpeciesLandingSelection } from '../src/services/species/species-landing.service';

const category = getPublishedCategoryLanding('shrimp-snails-crabs');
assert.ok(category, 'known category should resolve');
assert.equal(category.metadata.indexPolicy, 'noindex');
assert.equal(category.featuredBaseSpecies.some(item => item.id === 'sp_0001'), true);
assert.equal(getPublishedCategoryLanding('missing-category'), null);

const guide = getPublishedCareGuide('new-fish-acclimation');
assert.ok(guide, 'known guide should resolve to a public preparation state');
assert.equal(guide.metadata.indexPolicy, 'noindex');
assert.equal(guide.sections.length, 0, 'unreviewed guide steps must fail closed');
assert.equal(guide.assets.length, 0, 'unreviewed guide assets must fail closed');
assert.equal(getPublishedCareGuide('missing-guide'), null);

const baseSelection = getSpeciesLandingSelection('sp_0001', null);
assert.ok(baseSelection, 'known species should resolve');
const baseProfile = getPublishedSpeciesProfile(baseSelection, 'zh-CN');
assert.equal(baseProfile.variants.length, 2, 'public profile should omit unreviewed placeholder variants');
assert.equal(baseProfile.faq.length, 3, 'confirmed FAQ should enter the Chinese profile');
assert.equal(baseProfile.sources.some(source => source.id === 'uf-ifas-neocaridina-davidi-2025'), true);
assert.equal(baseProfile.sources.some(source => source.url?.startsWith('src/')), false, 'project paths must not become public links');
assert.equal(baseProfile.sources.some(source => /Product Truth|source-row map/i.test(source.title)), false, 'internal source labels must not reach public copy');

const englishProfile = getPublishedSpeciesProfile(baseSelection, 'en');
assert.equal(englishProfile.editorial, undefined, 'Chinese confirmed editorial must not leak into English Draft');
assert.equal(englishProfile.faq.length, 0, 'Chinese confirmed FAQ must not leak into English Draft');
assert.equal(englishProfile.sources.length, 0, 'English Draft must not expose Chinese editorial sources');

console.log('public SEO contract checks passed');
