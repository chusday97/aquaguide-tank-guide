import fs from 'node:fs';
import assert from 'node:assert/strict';

const identify = fs.readFileSync('src/pages/Identify.tsx', 'utf8');

assert.match(identify, /loadAppStateFromStorage, patchLocalAppState, subscribeToAppState/);
assert.match(identify, /getSpeciesFavoriteIds, setSpeciesFavoriteIds, subscribeToFavorites/);
assert.match(identify, /getCurrentAquaGuideRepository/);

// Identify must react to repository-hydrated tank/favorite state, not a one-time localStorage snapshot.
assert.match(identify, /const \[appState, setAppState\] = useState\(loadAppStateFromStorage\)/);
assert.match(identify, /subscribeToAppState\(\(\) => \{\s+setAppState\(loadAppStateFromStorage\(\)\);\s+\}\)/s);
assert.match(identify, /const \[favoriteIds, setFavoriteIds\] = useState\(\(\) => new Set\(getSpeciesFavoriteIds\(\)\)\)/);
assert.match(identify, /subscribeToFavorites\(\(\) => \{\s+setFavoriteIds\(new Set\(getSpeciesFavoriteIds\(\)\)\);\s+\}\)/s);
assert.doesNotMatch(identify, /const appState = useMemo\(\(\) => loadAppStateFromStorage\(\), \[\]\)/);

assert.match(identify, /const \[aquariums, favorites\] = await Promise\.all\(\[\s+repository\.getAquariums\(\),\s+repository\.getFavorites\(\),\s+\]\)/s);
assert.match(identify, /const currentAquariumId = cachedState\.currentAquariumId\s+&& aquariums\.some\(item => item\.id === cachedState\.currentAquariumId\)/s);
assert.match(identify, /patchLocalAppState\(\{ aquariums, currentAquariumId \}\);/);
assert.match(identify, /setSpeciesFavoriteIds\(favorites\.speciesCatalogKeys\);/);

// Wishlist mutations persist first, then refresh the compatibility mirror.
assert.match(identify, /await repository\.updateFavorite\(\{ type: 'species', catalogKey: fishId, favorite: !wasFavorite \}\);\s+const favorites = await repository\.getFavorites\(\);\s+setSpeciesFavoriteIds\(favorites\.speciesCatalogKeys\)/s);
assert.doesNotMatch(identify, /if \(ids\.has\(fishId\)\) ids\.delete/);
assert.match(identify, /favoriteIds\.has\(selectedFish\.id\)/);
assert.match(identify, /inWishlist=\{Boolean\(detailFish && favoriteIds\.has\(detailFish\.id\)\)\}/);

// A tank identity change during triage must invalidate the old answer/evidence chain.
assert.match(identify, /const diagnosisAquariumIdRef = useRef\(aquarium\?\.id \|\| ''\)/);
assert.match(identify, /if \(stage !== 'describe' && stage !== 'question' && stage !== 'result'\) return;/);
assert.match(identify, /cancelDiagnosisSession\(\);\s+setDescription\(''\);\s+setAnswers\(\{\}\);\s+setAskedQuestionIds\(\[\]\);\s+setQuestionHistory\(\[\]\);\s+setDiagnosis\(null\)/s);
assert.match(identify, /setStage\(selectedFish \? 'identified' : 'upload'\)/);
assert.match(identify, /鱼缸数据已更新，健康诊断已重置/);

// Diagnosis and manual search continue deriving from the reactive aquarium.
assert.match(identify, /ownedQuantityBySpeciesId: new Map\(\(aquarium\?\.fishes \|\| \[\]\)\.map/);
assert.match(identify, /aquariumSnapshot: buildSnapshot\(aquarium\)/);

console.log('identify repository hydration contract passed: direct entry uses canonical tank/favorite facts and triage resets on tank identity changes');
