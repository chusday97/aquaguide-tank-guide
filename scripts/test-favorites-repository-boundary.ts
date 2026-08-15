import fs from 'node:fs';
import assert from 'node:assert/strict';

const read = (path: string) => fs.readFileSync(path, 'utf8');
const repository = read('src/services/repository/aquaguide.repository.ts');
const localRepository = read('src/services/repository/local-aquaguide.repository.ts');
const apiRepository = read('src/services/repository/api-aquaguide.repository.ts');
const apiRoutes = read('apps/api/src/routes/user-records.ts');
const collectionService = read('src/services/collection/collection.service.ts');
const collectionPage = read('src/pages/Collection.tsx');
const encyclopedia = read('src/pages/Encyclopedia.tsx');
const care = read('src/pages/CareEncyclopedia.tsx');

assert.match(repository, /export type FavoriteSnapshot = \{/);
assert.match(repository, /speciesCatalogKeys: string\[\]/);
assert.match(repository, /careFavorites: Array<\{ catalogKey: string; title: string; favoritedAt: string \}>/);
assert.match(repository, /getFavorites\(\): Promise<FavoriteSnapshot>/);

assert.match(localRepository, /async getFavorites\(\)/);
assert.match(localRepository, /speciesCatalogKeys: getSpeciesFavoriteIds\(\)/);
assert.match(localRepository, /careFavorites: Object\.values\(getCareFavorites\(\)\)/);

assert.match(apiRepository, /apiRequest<\{ items: ApiFavorite\[\] \}>\('\/favorites\/species'\)/);
assert.match(apiRepository, /apiRequest<\{ items: ApiFavorite\[\] \}>\('\/favorites\/care'\)/);
assert.match(apiRepository, /speciesCatalogKeys: \(speciesResponse\.items \|\| \[\]\)\.map\(item => item\.catalogKey\)/);
assert.match(apiRepository, /catalogKey: item\.catalogKey, title: item\.title!, favoritedAt: item\.favoritedAt/);

// API reads use literal table/select branches so Supabase's type parser stays sound,
// while internal UUID foreign keys are resolved back to stable catalog keys.
assert.match(apiRoutes, /\.from\('species_favorites'\)\s+\.select\('species_id,created_at,version'\)/s);
assert.match(apiRoutes, /\.from\('species'\)\s+\.select\('id,catalog_key'\)/s);
assert.match(apiRoutes, /\.from\('care_favorites'\)\s+\.select\('article_id,created_at,version'\)/s);
assert.match(apiRoutes, /\.from\('care_articles'\)\s+\.select\('id,catalog_key,title'\)/s);
assert.match(apiRoutes, /catalogKey: content\.catalog_key/);
assert.match(apiRoutes, /favoritedAt: row\.created_at/);
const favoriteRouteStart = apiRoutes.indexOf("const registerFavoriteRoutes = (type: 'species' | 'care') => {");
const favoriteRouteEnd = apiRoutes.indexOf("registerFavoriteRoutes('species');");
assert.ok(favoriteRouteStart >= 0 && favoriteRouteEnd > favoriteRouteStart, 'favorite route block must be discoverable');
const favoriteRouteBlock = apiRoutes.slice(favoriteRouteStart, favoriteRouteEnd);
assert.doesNotMatch(favoriteRouteBlock, /return sendData\(request, response, camelize\(data \|\| \[\]\)\);/);
assert.doesNotMatch(favoriteRouteBlock, /const contentTable = type ===/);
assert.doesNotMatch(favoriteRouteBlock, /const contentSelect = type ===/);

// Collection hydration must make cloud favorites authoritative only after successful reads.
assert.match(collectionService, /const \[memorials, favorites\] = await Promise\.all\(\[/);
assert.match(collectionService, /repository\.getFavorites\(\)/);
assert.match(collectionService, /setSpeciesFavoriteIds\(favorites\.speciesCatalogKeys\)/);
assert.match(collectionService, /setCareFavorites\(Object\.fromEntries\(favorites\.careFavorites/);
assert.match(collectionService, /export const hydrateCollectionMemorials = async .*hydrateCollectionData\(\)/s);
assert.match(collectionPage, /hydrateCollectionMemorials\(\)/);

// Collection removals are persisted first; local mirror refresh happens afterward.
assert.match(collectionPage, /await repository\.updateFavorite\(\{ type: 'species', catalogKey: target\.id, favorite: false \}\);\s+setSnapshot\(await hydrateCollectionData\(\)\)/s);
assert.match(collectionPage, /await repository\.updateFavorite\(\{ type: 'care', catalogKey: target\.id, title: target\.title, favorite: false \}\);\s+setSnapshot\(await hydrateCollectionData\(\)\)/s);
assert.doesNotMatch(collectionPage, /toggleCareFavorite\(/);
assert.doesNotMatch(collectionPage, /setSpeciesFavoriteIds\(snapshot\.wishlistIds/);

// Direct entry to both source pages must hydrate cloud favorites and mutations must be repository-first.
assert.match(encyclopedia, /Promise\.all\(\[repository\.getAquariums\(\), repository\.getFavorites\(\)\]\)/);
assert.match(encyclopedia, /await repository\.updateFavorite\(\{ type: 'species', catalogKey: fish\.id, favorite: !wasFavorite \}\);\s+const favorites = await repository\.getFavorites\(\)/s);
assert.match(encyclopedia, /onToggleWishlist=\{\(id\) => \{\s+const fish = fishData\.find\(item => item\.id === id\);\s+if \(fish\) void handleWishlistToggle\(fish\);\s+\}\}/s);
assert.doesNotMatch(encyclopedia, /const toggleWishlist = \(id: string\)/);

// Care may hydrate favorites together with aquarium facts; the contract is semantic,
// not tied to one exact Promise chaining shape.
assert.match(care, /getCurrentAquaGuideRepository\(\)/);
assert.match(care, /repository\.getFavorites\(\)/);
assert.match(care, /repository\.getAquariums\(\)/);
assert.match(care, /await repository\.updateFavorite\(\{ type: 'care', catalogKey: topic\.id, title: getDisplayTitle\(topic\), favorite: isAdding \}\);\s+const snapshot = await repository\.getFavorites\(\)/s);
assert.doesNotMatch(care, /const next = toggleCareFavorite\(/);

console.log('favorites repository boundary: typed catalog-key reads, direct-entry hydration, and repository-first add/remove verified');
