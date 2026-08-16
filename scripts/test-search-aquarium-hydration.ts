import fs from 'node:fs';
import assert from 'node:assert/strict';

const search = fs.readFileSync('src/pages/Search.tsx', 'utf8');

assert.match(search, /loadAppStateFromStorage, patchLocalAppState, subscribeToAppState/);
assert.match(search, /getCurrentAquaGuideRepository/);
assert.match(search, /const \[appState, setAppState\] = useState\(loadAppStateFromStorage\)/);
assert.match(search, /subscribeToAppState\(\(\) => \{\s+setAppState\(loadAppStateFromStorage\(\)\);\s+\}\)/s);
assert.doesNotMatch(search, /const aquarium = useMemo\(\(\) => \{\s+const state = loadAppStateFromStorage\(\)/s);

assert.match(search, /getCurrentAquaGuideRepository\(\)\s+\.then\(repository => repository\.getAquariums\(\)\)/s);
assert.match(search, /const currentAquariumId = cachedState\.currentAquariumId\s+&& aquariums\.some\(item => item\.id === cachedState\.currentAquariumId\)/s);
assert.match(search, /patchLocalAppState\(\{ aquariums, currentAquariumId \}\);/);

assert.match(search, /const ownedQuantityBySpeciesId = useMemo\(\(\) => new Map\(\s+\(aquarium\?\.fishes \|\| \[\]\)\.map/s);
assert.match(search, /ownedQuantityBySpeciesId,\s+\}\), \[draft, isEn, ownedQuantityBySpeciesId\]\)/s);

assert.match(search, /const \[syncNotice, setSyncNotice\] = useState\(''\)/);
assert.match(search, /鱼缸数据暂时无法同步，已拥有数量当前使用本机缓存。/);
assert.match(search, /\{syncNotice && \(\s+<div role="status"/s);

console.log('search aquarium hydration contract passed: direct search entry refreshes canonical tank ownership counts and labels cache fallback');
