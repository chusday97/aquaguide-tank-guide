import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { DiagnosisRecord } from '../src/modules/diagnosis/diagnosis.types';

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

const makeRecord = (overrides: Partial<DiagnosisRecord>): DiagnosisRecord => ({
  diagnosisId: crypto.randomUUID(),
  createdAt: '2026-08-16T12:00:00+09:00',
  aquariumId: 'tank-a',
  source: { type: 'home' },
  problemType: '巡检',
  answers: { breathing: '正常' },
  structuredAnswers: [],
  resultSummary: '状态稳定',
  riskLevel: '低风险',
  riskCode: 'low',
  conclusion: '状态稳定',
  keyMetrics: [],
  suggestedActions: ['继续观察'],
  avoidActions: [],
  observeItems: [],
  missingInfo: [],
  optionalMissingInfo: [],
  followUpNotes: [],
  ...overrides,
});

const patrol1 = makeRecord({ diagnosisId: 'patrol-1', id: 'patrol-1' });
await repository.saveDiagnosis(patrol1);
let tankA = await repository.getDiagnosisRecords('tank-a');
assert.equal(tankA.length, 1);
assert.equal(tankA[0].diagnosisId, 'patrol-1');

const patrolUpdate = makeRecord({
  diagnosisId: 'patrol-2',
  id: 'patrol-2',
  createdAt: '2026-08-16T15:00:00+09:00',
  resultSummary: '下午重新检查',
});
await repository.saveDiagnosis(patrolUpdate);
tankA = await repository.getDiagnosisRecords('tank-a');
assert.equal(tankA.filter(record => record.problemType === '巡检').length, 1, 'daily patrol must remain one record per tank per local day');
assert.equal(tankA.find(record => record.problemType === '巡检')?.resultSummary, '下午重新检查');

const abnormal = makeRecord({
  diagnosisId: 'diag-abnormal-1',
  id: 'diag-abnormal-1',
  createdAt: '2026-08-16T16:00:00+09:00',
  problemType: '鱼只异常',
  resultSummary: '发现呼吸异常',
  riskLevel: '中风险',
  riskCode: 'medium',
});
await repository.saveDiagnosis(abnormal);
tankA = await repository.getDiagnosisRecords('tank-a');
assert.equal(tankA.length, 2, 'general diagnoses must append beside the daily patrol instead of replacing it');
assert.equal(tankA.some(record => record.problemType === '鱼只异常'), true);

await repository.saveDiagnosis(makeRecord({ diagnosisId: 'other-tank', id: 'other-tank', aquariumId: 'tank-b', problemType: '水质异常' }));
assert.equal((await repository.getDiagnosisRecords('tank-a')).length, 2, 'diagnosis reads must be isolated by aquarium');
assert.equal((await repository.getDiagnosisRecords('tank-b')).length, 1);

const contractSource = readFileSync(resolve('src/services/repository/aquaguide.repository.ts'), 'utf8');
const apiRepositorySource = readFileSync(resolve('src/services/repository/api-aquaguide.repository.ts'), 'utf8');
const apiRouteSource = readFileSync(resolve('apps/api/src/routes/user-records.ts'), 'utf8');
const aquariumSource = readFileSync(resolve('src/pages/Aquarium.tsx'), 'utf8');

assert.match(contractSource, /getDiagnosisRecords\(aquariumId: string\): Promise<DiagnosisRecord\[]>/,
  'repository contract must expose diagnosis reads');
assert.match(apiRepositorySource, /async getDiagnosisRecords\(aquariumId: string\)/,
  'cloud repository must read persisted diagnosis history');
assert.match(apiRepositorySource, /\/aquariums\/\$\{aquariumId\}\/diagnoses\?limit=50/,
  'cloud diagnosis reads must use the aquarium-scoped API route');
assert.match(apiRepositorySource, /if \(record\.problemType === '巡检'\)[\s\S]*daily-checks/,
  'daily patrol writes must keep the date-upsert route');
assert.match(apiRepositorySource, /method: 'POST'[\s\S]*diagnoses\/\$\{localDate\}/,
  'general diagnosis writes must use the append-only diagnosis route');
assert.match(apiRepositorySource, /diagnosis:\$\{record\.diagnosisId\}/,
  'general diagnosis idempotency must be stable across retries of the same result');
assert.match(apiRouteSource, /get\('\/aquariums\/:id\/diagnoses'/,
  'API must expose aquarium-scoped diagnosis history');
assert.match(apiRouteSource, /post\('\/aquariums\/:id\/diagnoses\/:localDate'/,
  'API must expose append-only general diagnosis creation');
assert.match(apiRouteSource, /parsed\.data\.problemType === '巡检'/,
  'general diagnosis endpoint must reject patrol writes');
assert.match(apiRouteSource, /problem_type:\s*parsed\.data\.problemType/,
  'general diagnosis endpoint must preserve the real problem type');
assert.match(aquariumSource, /repository\.getDiagnosisRecords\(aquarium\.id\)/,
  'cloud bootstrap must hydrate diagnosis history from the repository');
assert.match(aquariumSource, /const persistedRecord = await repository\.saveDiagnosis\(record\)/,
  'diagnosis UI must persist through the active repository');
assert.match(aquariumSource, /await repository\.saveDiagnosis\(record\)[\s\S]*persistDiagnosisRecords/,
  'canonical diagnosis persistence must happen before the local compatibility mirror');
assert.match(aquariumSource, /const handleSaveDiagnosisRecord = async \(\): Promise<boolean>/,
  'diagnosis save handler must await repository persistence');
assert.match(aquariumSource, /const saved = await handleSaveDiagnosisRecord\(\)/,
  'result CTA must await diagnosis persistence before continuing');
assert.match(aquariumSource, /diagnosisSaveIdRef\.current/,
  'general diagnosis retries must retain one logical diagnosis key');
assert.doesNotMatch(apiRepositorySource, /async saveDiagnosis\(record: DiagnosisRecord\)[\s\S]*const saved = await apiRequest<ApiDiagnosis>\(`\/aquariums\/\$\{record\.aquariumId\}\/daily-checks\/\$\{date\}`/,
  'saveDiagnosis must not route every problem type through the patrol endpoint');

console.log('diagnosis repository boundary: daily upsert, general append, cloud hydration and repository-first persistence verified');
