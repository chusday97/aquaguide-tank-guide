import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { LocalAquaGuideRepository } from '../src/services/repository/local-aquaguide.repository';
import { saveAppStateToStorage } from '../src/services/storage/local-app-state';

class MemoryStorage {
  private data = new Map<string,string>();
  getItem(key:string){ return this.data.get(key) ?? null; }
  setItem(key:string,value:string){ this.data.set(key,value); }
  removeItem(key:string){ this.data.delete(key); }
  clear(){ this.data.clear(); }
  key(index:number){ return [...this.data.keys()][index] ?? null; }
  get length(){ return this.data.size; }
}
Object.defineProperty(globalThis,'localStorage',{value:new MemoryStorage(),configurable:true});

const baseTank = (id:string,name:string) => ({
  id, name, fishes: [], startedAt:'2026-10-01T00:00:00.000Z', startedAtSource:'user' as const,
});
saveAppStateToStorage({
  version:1,
  currentAquariumId:'tank-a',
  aquariums:[baseTank('tank-a','A'),baseTank('tank-b','B')],
  wishlist:[],
  dismissedRecommendations:[],
  diagnosisRecords:[],
  compatibilityRecords:[],
  deceasedRecords:[],
  feedingRecords:[],
  observationRecords:[],
  careEvents:[],
  riskReminderState:{},
  updatedAt:'2026-10-17T00:00:00.000Z',
});

const repository = new LocalAquaGuideRepository();
await repository.deleteAquarium('tank-a');
const remaining = await repository.getAquariums();
assert.deepEqual(remaining.map(item => item.id), ['tank-b']);

await assert.rejects(() => repository.deleteAquarium('tank-b'), /至少需要保留一个鱼缸/);

const page = readFileSync(resolve('src/pages/Aquarium.tsx'),'utf8');
const contract = readFileSync(resolve('src/services/repository/aquaguide.repository.ts'),'utf8');
const apiRepo = readFileSync(resolve('src/services/repository/api-aquaguide.repository.ts'),'utf8');
assert.match(contract,/deleteAquarium\(aquariumId: string\): Promise<void>/);
assert.match(apiRepo,/async deleteAquarium\(aquariumId: string\)/);
assert.match(apiRepo,/method: 'DELETE'/);
assert.match(page,/await repository\.deleteAquarium\(target\.id\)/);
assert.match(page,/eventType: 'aquarium_deleted'/);
assert.doesNotMatch(page,/const confirmDeleteAquarium = \(\) => \{[\s\S]*?saveAquariums\(updated\)/);

console.log('aquarium delete repository boundary verified: local delete persists, last tank is protected, cloud contract uses DELETE, and UI records explicit deletion history');
