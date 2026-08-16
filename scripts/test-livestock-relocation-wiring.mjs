import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const index = readFileSync('packages/contracts/src/index.ts', 'utf8');
const repository = readFileSync('src/services/repository/aquaguide.repository.ts', 'utf8');
const localRepository = readFileSync('src/services/repository/local-aquaguide.repository.ts', 'utf8');
const apiRepository = readFileSync('src/services/repository/api-aquaguide.repository.ts', 'utf8');
const apiRoute = readFileSync('apps/api/src/routes/aquariums.ts', 'utf8');

assert.match(index, /export \* from '\.\/livestock-relocation';/);
assert.match(repository, /export type LivestockRelocationInput/);
assert.match(repository, /relocateLivestock\(input: LivestockRelocationInput\)/);
assert.match(localRepository, /relocateLivestockInAquariums/);
assert.match(localRepository, /async relocateLivestock\(input: LivestockRelocationInput\)/);
assert.match(apiRepository, /\/relocate`/);
assert.match(apiRepository, /committed: true/);
assert.match(apiRoute, /livestockRelocationSchema/);
assert.match(apiRoute, /relocate_verified_aquarium_livestock/);
assert.match(apiRoute, /committed: true/);
assert.doesNotMatch(apiRoute, /sourceAquarium:/);
assert.doesNotMatch(apiRoute, /destinationAquarium:/);
assert.match(apiRoute, /UNRESOLVED_SOURCE_SPECIES/);
assert.match(apiRoute, /DUPLICATE_OPERATION_KEY/);
assert.doesNotMatch(apiRoute, /source_batch_version/);

console.log('livestock relocation wiring contract passed: shared contract, repository implementations, atomic API route, mutation receipt boundary');
