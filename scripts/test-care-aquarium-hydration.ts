import fs from 'node:fs';
import assert from 'node:assert/strict';

const care = fs.readFileSync('src/pages/CareEncyclopedia.tsx', 'utf8');

assert.match(care, /loadAppStateFromStorage, patchLocalAppState, subscribeToAppState/);
assert.match(care, /const \[appStateSnapshot, setAppStateSnapshot\] = useState\(loadAppStateFromStorage\)/);
assert.match(care, /subscribeToAppState\(\(\) => \{\s+setAppStateSnapshot\(loadAppStateFromStorage\(\)\);\s+\}\)/s);

// Direct Care entry hydrates both collection favorites and canonical aquarium facts.
assert.match(care, /const \[favoriteSnapshot, aquariums\] = await Promise\.all\(\[\s+repository\.getFavorites\(\),\s+repository\.getAquariums\(\),\s+\]\)/s);
assert.match(care, /const currentAquariumId = cachedState\.currentAquariumId\s+&& aquariums\.some\(item => item\.id === cachedState\.currentAquariumId\)/s);
assert.match(care, /patchLocalAppState\(\{ aquariums, currentAquariumId \}\);/);
assert.match(care, /鱼缸数据暂时无法同步，当前显示本机缓存。/);

// Recommendations are derived from the reactive snapshot, not a one-time localStorage read.
assert.match(care, /const activeAquarium = useMemo\(\(\) => \(\s+appStateSnapshot\.aquariums\.find/s);
assert.match(care, /const careRecommendations = useMemo\(\(\) => getCareRecommendations\(activeAquarium, careTopicsData\), \[activeAquarium\]\)/);
assert.doesNotMatch(care, /const appStateSnapshot = useMemo\(\(\) => loadAppStateFromStorage\(\), \[\]\)/);

// Quick diagnosis remains live if cloud aquarium facts arrive after its dialog opened.
assert.match(care, /function StepDiagnosisPanel/);
assert.match(care, /const \[appState, setAppState\] = useState\(loadAppStateFromStorage\);\s+useEffect\(\(\) => subscribeToAppState/s);
assert.match(care, /\}, \[defaultAquariumId, topic\.id\]\);/);
assert.doesNotMatch(care, /const appState = useMemo\(\(\) => loadAppStateFromStorage\(\), \[\]\)/);

console.log('care aquarium hydration contract passed: direct care entry and quick diagnosis use repository-hydrated aquarium facts');
