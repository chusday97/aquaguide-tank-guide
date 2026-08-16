import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const repository = readFileSync('src/services/repository/aquaguide.repository.ts', 'utf8');
const localRepository = readFileSync('src/services/repository/local-aquaguide.repository.ts', 'utf8');
const apiRepository = readFileSync('src/services/repository/api-aquaguide.repository.ts', 'utf8');
const apiRoute = readFileSync('apps/api/src/routes/aquariums.ts', 'utf8');

const between = (content, start, end) => {
  const startIndex = content.indexOf(start);
  const endIndex = content.indexOf(end, startIndex + start.length);
  assert.ok(startIndex >= 0 && endIndex > startIndex, `missing bounded section ${start}`);
  return content.slice(startIndex, endIndex);
};

const repositoryResult = between(
  repository,
  'export type LivestockRelocationMutationResult = {',
  'export type AquariumCreateCommand',
);
assert.match(repositoryResult, /committed: true/);
assert.doesNotMatch(repositoryResult, /sourceAquarium/);
assert.doesNotMatch(repositoryResult, /destinationAquarium:/);

const localMethod = between(localRepository, '  async relocateLivestock(input: LivestockRelocationInput)', '  async getFavorites()');
assert.match(localMethod, /persistAquariums\(/, 'local relocation must still persist the atomic state transform');
assert.match(localMethod, /committed: true/);
assert.doesNotMatch(localMethod, /迁移后鱼缸状态无法确认/);
assert.doesNotMatch(localMethod, /sourceAquarium,/);
assert.doesNotMatch(localMethod, /destinationAquarium,/);

const apiMethod = between(apiRepository, '  async relocateLivestock(input: LivestockRelocationInput)', '  private async resolveContentId');
assert.match(apiMethod, /committed: true/);
assert.doesNotMatch(apiMethod, /rememberAquarium/);
assert.doesNotMatch(apiMethod, /sourceAquarium: ApiAquarium/);
assert.doesNotMatch(apiMethod, /destinationAquarium: ApiAquarium/);

const route = between(
  apiRoute,
  "aquariumsRouter.post('/aquariums/:id/species/:recordId/batches/:batchId/relocate'",
  "aquariumsRouter.post('/aquariums/:id/species/:recordId/batches/:batchId/memorial'",
);
assert.match(route, /committed: true/);
assert.doesNotMatch(route, /\.from\('aquariums'\)/, 'post-RPC snapshot reads must not turn a committed relocation into an API error');
assert.doesNotMatch(route, /sourceAquarium:/);
assert.doesNotMatch(route, /destinationAquarium:/);
assert.doesNotMatch(route, /迁移已完成，但最新鱼缸状态暂时无法读取/);

console.log('livestock relocation receipt boundary passed: RPC success is returned as a mutation receipt; canonical source/destination refresh is a separate post-mutation concern');
