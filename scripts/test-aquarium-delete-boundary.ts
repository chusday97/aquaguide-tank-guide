import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

class MemoryStorage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
  clear() { this.values.clear(); }
}

const localStorage = new MemoryStorage();
const eventTarget = new EventTarget();
const fakeWindow = Object.assign(eventTarget, { localStorage, setTimeout, clearTimeout });
Object.defineProperty(globalThis, 'window', { value: fakeWindow, configurable: true });
Object.defineProperty(globalThis, 'localStorage', { value: localStorage, configurable: true });

const { LocalAquaGuideRepository } = await import('../src/services/repository/local-aquaguide.repository');
const repository = new LocalAquaGuideRepository();

await repository.saveAquarium({ id: 'tank-a', name: '鱼缸 A', fishes: [] });
await repository.saveAquarium({ id: 'tank-b', name: '鱼缸 B', fishes: [] });
assert.deepEqual((await repository.getAquariums()).map(item => item.id), ['tank-a', 'tank-b']);

await repository.deleteAquarium('tank-b');
assert.deepEqual(
  (await repository.getAquariums()).map(item => item.id),
  ['tank-a'],
  'deleting one of multiple tanks must persist the remaining local aquarium set',
);
await repository.deleteAquarium('missing-tank');
assert.deepEqual((await repository.getAquariums()).map(item => item.id), ['tank-a'], 'replaying a missing local delete is a no-op');
await assert.rejects(
  repository.deleteAquarium('tank-a'),
  /至少需要保留一个鱼缸/,
  'the last aquarium must not be deleted through the local repository',
);

const repositoryContractSource = readFileSync(resolve('src/services/repository/aquaguide.repository.ts'), 'utf8');
const apiRepositorySource = readFileSync(resolve('src/services/repository/api-aquaguide.repository.ts'), 'utf8');
const aquariumPageSource = readFileSync(resolve('src/pages/Aquarium.tsx'), 'utf8');

assert.match(repositoryContractSource, /deleteAquarium\(aquariumId: string\): Promise<void>/, 'repository contract must expose aquarium deletion');
assert.match(apiRepositorySource, /async deleteAquarium\(aquariumId: string\)/, 'cloud repository must implement aquarium deletion');
assert.match(apiRepositorySource, /apiRequest\(`\/aquariums\/\$\{aquariumId\}\?version=\$\{version\}`,[\s\S]*method: 'DELETE'/, 'cloud deletion must call the versioned aquarium DELETE API');
assert.match(apiRepositorySource, /idempotencyKey: `aquarium-delete:\$\{aquariumId\}:v\$\{version\}`/, 'cloud deletion replay identity must include aquarium and version');

const deleteHandlerStart = aquariumPageSource.indexOf('const confirmDeleteAquarium = async () => {');
const deleteHandlerEnd = aquariumPageSource.indexOf('const openLocalDataManager', deleteHandlerStart);
assert.ok(deleteHandlerStart >= 0 && deleteHandlerEnd > deleteHandlerStart, 'Aquarium delete handler must be discoverable');
const deleteHandlerSource = aquariumPageSource.slice(deleteHandlerStart, deleteHandlerEnd);
assert.match(deleteHandlerSource, /await repository\.deleteAquarium\(aquariumId\);/, 'page deletion must commit through the active repository first');
assert.match(deleteHandlerSource, /const mirrored = persistAquariums\(updated, nextActiveId\);/, 'local state is only a mirror after repository deletion succeeds');
assert.doesNotMatch(deleteHandlerSource, /saveAquariums\(updated\)/, 'page deletion must not use the legacy local-only aquarium save path');
assert.match(deleteHandlerSource, /isDeletingAquarium/, 'page deletion must guard repeated submissions');

console.log('aquarium deletion boundary: local semantics and repository-backed cloud deletion verified');
