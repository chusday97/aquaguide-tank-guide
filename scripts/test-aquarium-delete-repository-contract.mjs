import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const contract = read('src/services/repository/aquaguide.repository.ts');
const localRepository = read('src/services/repository/local-aquaguide.repository.ts');
const apiRepository = read('src/services/repository/api-aquaguide.repository.ts');
const aquariumPage = read('src/pages/Aquarium.tsx');
const apiRoute = read('apps/api/src/routes/aquariums.ts');

assert.match(
  apiRoute,
  /aquariumsRouter\.delete\('\/aquariums\/:id'/,
  'Backend already exposes DELETE /aquariums/:id; the product repository layer must wire that real capability.',
);

assert.match(
  contract,
  /deleteAquarium\(input:\s*AquariumDeleteCommand\):\s*Promise<void>/,
  'AquaGuideRepository must expose a deleteAquarium command instead of letting the UI mutate only local cache.',
);

assert.match(
  localRepository,
  /async deleteAquarium\(input:\s*AquariumDeleteCommand\)/,
  'LocalAquaGuideRepository must implement the same aquarium deletion contract.',
);

assert.match(
  apiRepository,
  /async deleteAquarium\(input:\s*AquariumDeleteCommand\)/,
  'ApiAquaGuideRepository must implement aquarium deletion through the existing DELETE endpoint.',
);
assert.match(
  apiRepository,
  /method:\s*'DELETE'/,
  'ApiAquaGuideRepository aquarium deletion must issue a real DELETE request.',
);

const deleteHandlerStart = aquariumPage.indexOf('const confirmDeleteAquarium =');
const deleteHandlerEnd = aquariumPage.indexOf('const openLocalDataManager =', deleteHandlerStart);
assert.ok(deleteHandlerStart >= 0 && deleteHandlerEnd > deleteHandlerStart, 'Aquarium delete handler must remain discoverable.');
const deleteHandler = aquariumPage.slice(deleteHandlerStart, deleteHandlerEnd);
assert.match(deleteHandler, /const confirmDeleteAquarium = async \(\) =>/, 'Aquarium deletion must await repository persistence.');
assert.match(deleteHandler, /await repository\.deleteAquarium\(/, 'Aquarium deletion must call repository.deleteAquarium before showing success.');
assert.doesNotMatch(deleteHandler, /saveAquariums\(updated\)/, 'Aquarium deletion must not be implemented as a local-only array rewrite.');
assert.match(deleteHandler, /showToast\([^)]*删除[^)]*成功|showToast\([^)]*deleted/i, 'Successful deletion should produce observable user feedback.');
assert.match(deleteHandler, /catch\s*\(/, 'Aquarium deletion must expose a stable failure path and allow retry.');

console.log('Aquarium delete repository contract: PASS');
