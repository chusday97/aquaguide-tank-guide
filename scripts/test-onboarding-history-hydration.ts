import fs from 'node:fs';
import assert from 'node:assert/strict';

const onboarding = fs.readFileSync('src/services/onboarding/onboarding.service.ts', 'utf8');
const paths = fs.readFileSync('src/services/onboarding/onboarding-paths.ts', 'utf8');
const app = fs.readFileSync('src/App.tsx', 'utf8');

// App must still wait for onboarding/profile hydration before routing.
assert.match(app, /const \[preferencesReady, setPreferencesReady\] = useState\(false\)/);
assert.match(app, /void hydrateOnboardingFromProfile\(\)\.finally\(\(\) => \{\s+if \(active\) setPreferencesReady\(true\);\s+\}\)/s);
assert.match(app, /if \(!preferencesReady && !isLogin && !isAdminContent && !isSharedReport\) return <PageLoading \/>/);

// Valid cloud onboarding remains authoritative when local onboarding is absent.
assert.match(onboarding, /if \(!local && cloud\.success\) return patchLocalAppState\(\{ onboarding: cloud\.data \}\)\.onboarding/);
// Existing local onboarding still syncs to a profile that lacks it.
assert.match(onboarding, /if \(local && !cloud\.success\) \{\s+queueProfileSync\(local\);\s+return local;\s+\}/s);

// Legacy/migration fallback restores real cloud business history instead of inventing onboarding completion.
assert.match(onboarding, /if \(!local && !cloud\.success\) \{/);
assert.match(onboarding, /const \[aquariums, favorites\] = await Promise\.all\(\[\s+repository\.getAquariums\(\),\s+repository\.getFavorites\(\),\s+\]\)/s);
assert.match(onboarding, /const currentAquariumId = cached\.currentAquariumId\s+&& aquariums\.some\(item => item\.id === cached\.currentAquariumId\)/s);
assert.match(onboarding, /patchLocalAppState\(\{ aquariums, currentAquariumId \}\);/);
assert.match(onboarding, /setSpeciesFavoriteIds\(favorites\.speciesCatalogKeys\)/);
assert.match(onboarding, /setCareFavorites\(Object\.fromEntries\(favorites\.careFavorites/);
assert.doesNotMatch(onboarding, /!local && !cloud\.success[\s\S]{0,1200}status:\s*'completed'/);
assert.doesNotMatch(onboarding, /!local && !cloud\.success[\s\S]{0,1200}status:\s*'skipped'/);

// Historical-user routing remains fact-derived and now includes species favorites.
assert.match(onboarding, /const hasSupplementalCareActivity = getSpeciesFavoriteIds\(\)\.length > 0/);
assert.match(onboarding, /return !hasHistoricalUserActivity\(state, hasSupplementalCareActivity\)/);
assert.match(paths, /state\.aquariums\.length > 0/);

console.log('onboarding history hydration contract passed: missing profile preference restores cloud history without fabricating onboarding completion');
