import fs from 'node:fs';
import assert from 'node:assert/strict';

const care = fs.readFileSync('src/pages/CareEncyclopedia.tsx', 'utf8');

assert.match(care, /loadAppStateFromStorage, patchLocalAppState, subscribeToAppState/);
assert.match(care, /const \[appStateSnapshot, setAppStateSnapshot\] = useState\(loadAppStateFromStorage\)/);
assert.match(care, /subscribeToAppState\(\(\) => \{\s+setAppStateSnapshot\(loadAppStateFromStorage\(\)\);\s+\}\)/s);

// Direct Care entry hydrates every account-level fact the page consumes.
// Keep this contract capability-based: adding a new canonical read must not fail merely
// because Promise.all gains another item or a local variable changes shape.
for (const canonicalRead of [
  'repository.getFavorites()',
  'repository.getAquariums()',
  'repository.getCareEvents()',
  'repository.getCareChecklistProgress()',
]) {
  assert.ok(care.includes(canonicalRead), `Care direct hydration missing ${canonicalRead}`);
}
assert.match(care, /const currentAquariumId = cachedState\.currentAquariumId\s+&& aquariums\.some\(item => item\.id === cachedState\.currentAquariumId\)/s);
assert.match(care, /setSavedCareChecklists\(checklistProgress\);/);
assert.match(care, /patchLocalAppState\(\{ aquariums, currentAquariumId, careEvents \}\);/);
assert.match(care, /鱼缸数据暂时无法同步，当前显示本机缓存。/);

// Recommendations are derived from the reactive snapshot, not a one-time localStorage read.
assert.match(care, /const activeAquarium = useMemo\(\(\) => \(\s+appStateSnapshot\.aquariums\.find/s);
assert.match(care, /const careRecommendations = useMemo\(\(\) => getCareRecommendations\(activeAquarium, careTopicsData\), \[activeAquarium\]\)/);
assert.doesNotMatch(care, /const appStateSnapshot = useMemo\(\(\) => loadAppStateFromStorage\(\), \[\]\)/);

// Quick diagnosis remains live if cloud/mirror aquarium facts arrive after its dialog opened.
// Do not couple this regression to statement adjacency: Care may insert a direct canonical
// override state between mirror initialization and the subscription while preserving both
// capabilities.
assert.match(care, /function StepDiagnosisPanel/);
assert.match(care, /const \[appState, setAppState\] = useState\(loadAppStateFromStorage\)/);
assert.match(care, /useEffect\(\(\) => subscribeToAppState\(\(\) => \{\s+setAppState\(loadAppStateFromStorage\(\)\);\s+\}\), \[\]\)/s);
assert.match(care, /const \[canonicalAquariums, setCanonicalAquariums\] = useState<Aquarium\[\] \| null>\(null\)/);
assert.match(care, /const aquariums = canonicalAquariums \?\? appState\.aquariums/);
assert.match(care, /\}, \[defaultAquariumId, topic\.id\]\);/);
assert.doesNotMatch(care, /const appState = useMemo\(\(\) => loadAppStateFromStorage\(\), \[\]\)/);

console.log('care aquarium hydration contract passed: direct Care entry hydrates account facts; StepDiagnosis preserves reactive mirror hydration while canonical post-action state can temporarily take precedence');
