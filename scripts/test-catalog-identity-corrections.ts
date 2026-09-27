import assert from 'node:assert/strict';
import { catalogSeedFishData, fishData } from '../src/data/fishData';
import {
  applyCatalogIdentityCorrection,
  catalogIdentityCorrections,
  getCatalogIdentityCorrection,
} from '../src/data/catalogIdentityCorrections';
import { englishTranslations } from '../src/i18n/localizeData';
import { getKnowledgeSource } from '../src/modules/knowledge/knowledgeSources';
import { getReviewedSpeciesKnowledgeForFish } from '../src/modules/knowledge/speciesKnowledge';
import { getReviewedCompatibilityProfileForFish } from '../src/data/compatibilityEvidence';
import { buildLocalCatalogSnapshot } from '../src/services/catalog/catalog-snapshot.service';
import { getSearchSuggestions } from '../src/services/search/search-suggestions.service';

const seed = catalogSeedFishData.find(item => item.id === 'sp_0120');
const runtime = fishData.find(item => item.id === 'sp_0120');
assert.ok(seed, 'legacy sp_0120 seed missing');
assert.ok(runtime, 'runtime sp_0120 missing');

// Legacy catalogue identity remains immutable under local-fish-data-v1.
assert.equal(seed.name, '电鳗 (观赏型)');
assert.equal(seed.scientificName, 'Gymnotus carapo');
assert.match(seed.description, /会电击同类和室友/);
assert.equal(seed.tankSize, '至少 320 升');

// Runtime product identity is corrected without changing the stable catalog key / taxon.
assert.equal(runtime.id, 'sp_0120');
assert.equal(runtime.scientificName, 'Gymnotus carapo');
assert.equal(runtime.name, '圭亚那裸背电鳗');
assert.equal(runtime.tankSize, '至少 648 升');
assert.equal(runtime.housingMode, '建议单养');
assert.match(runtime.description, /弱电/);
assert.match(runtime.description, /并非能高压放电的真正电鳗/);
assert.doesNotMatch(runtime.description, /会电击同类和室友/);
assert.match(runtime.housingReason, /同类间领地性强/);
assert.match(runtime.housingReason, /大型、强健且无法入口的异种并非绝对禁配/);

const correction = getCatalogIdentityCorrection('sp_0120');
assert.ok(correction);
assert.equal(catalogIdentityCorrections.filter(item => item.catalogKey === 'sp_0120').length, 1);
assert.deepEqual(correction.sourceIds, ['batch20-fishbase-gymnotus-carapo', 'seriouslyfish-gymnotus-carapo']);
for (const sourceId of correction.sourceIds) {
  const source = getKnowledgeSource(sourceId);
  assert.ok(source, `identity correction source missing: ${sourceId}`);
  assert.equal(source.reviewStatus, 'reviewed');
}

// Object-scoped and fail-closed: the correction cannot relabel a different taxon that reuses the same key.
const wrongTaxon = { ...seed, scientificName: 'Electrophorus electricus' };
const wrongTaxonResult = applyCatalogIdentityCorrection(wrongTaxon, 'zh-CN');
assert.equal(wrongTaxonResult.name, seed.name);
assert.equal(wrongTaxonResult.description, seed.description);

const english = applyCatalogIdentityCorrection(seed, 'en');
assert.equal(english.name, 'Banded knifefish');
assert.equal(english.tankSize, 'At least 648 L');
assert.match(english.description, /weakly electric/i);
assert.match(english.description, /not a high-voltage electric eel/i);
assert.equal(englishTranslations.sp_0120?.name, 'Banded knifefish');

// Reviewed knowledge / Compatibility authority stays attached to Gymnotus carapo.
const knowledge = getReviewedSpeciesKnowledgeForFish(runtime);
const profile = getReviewedCompatibilityProfileForFish(runtime);
assert.ok(knowledge, 'reviewed Gymnotus knowledge missing after identity correction');
assert.ok(profile, 'reviewed Gymnotus compatibility profile missing after identity correction');
assert.equal(profile.speciesId, 'sp_0120');
assert.ok(profile.behaviorTraits.includes('predatory'));
assert.ok(profile.predationTargets.includes('small_fish'));
assert.ok(knowledge.spaceAndGrowth?.minVolumeLiters && knowledge.spaceAndGrowth.minVolumeLiters >= 648);

// Search displays the corrected product name but remains discoverable by scientific name.
const zhSearch = getSearchSuggestions({
  query: '圭亚那',
  locale: 'zh-CN',
  scope: 'encyclopedia',
  species: [runtime],
  careTopics: [],
});
assert.equal(zhSearch.suggestions[0]?.label, '圭亚那裸背电鳗');
assert.equal(zhSearch.suggestions[0]?.targetId, 'sp_0120');

const enSearch = getSearchSuggestions({
  query: 'banded',
  locale: 'en',
  scope: 'encyclopedia',
  species: [runtime],
  careTopics: [],
});
assert.equal(enSearch.suggestions[0]?.label, 'Banded knifefish');

const scientificSearch = getSearchSuggestions({
  query: 'Gymnotus',
  locale: 'en',
  scope: 'encyclopedia',
  species: [runtime],
  careTopics: [],
});
assert.equal(scientificSearch.suggestions[0]?.targetId, 'sp_0120');
assert.equal(scientificSearch.suggestions[0]?.label, 'Banded knifefish');

// The immutable local catalogue snapshot still serializes the legacy seed rather than runtime corrections.
const snapshot = await buildLocalCatalogSnapshot();
const snapshotSpecies = snapshot.species.find(item => item.id === 'sp_0120');
assert.ok(snapshotSpecies);
assert.equal(snapshot.manifest.version, 'local-fish-data-v1');
assert.equal(snapshotSpecies.name, '电鳗 (观赏型)');
assert.match(snapshotSpecies.description, /会电击同类和室友/);
assert.equal(snapshotSpecies.tankSizeText, '至少 320 升');
assert.equal(snapshotSpecies.scientificName, 'Gymnotus carapo');

console.log('catalog identity correction passed: Gymnotus runtime identity corrected, reviewed authority retained, legacy catalog snapshot unchanged');
console.log(`catalog identity correction snapshot checksum: ${snapshot.manifest.checksumSha256}`);
