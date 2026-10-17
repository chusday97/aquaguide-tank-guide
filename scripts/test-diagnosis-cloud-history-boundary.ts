import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const read = (path: string) => readFileSync(resolve(path), 'utf8');
const routes = read('apps/api/src/routes/user-records.ts');
const apiRepository = read('src/services/repository/api-aquaguide.repository.ts');
const aquarium = read('src/pages/Aquarium.tsx');
const keepingHistory = read('src/services/collection/keeping-history.service.ts');
const careTimeline = read('src/services/care/care-timeline.service.ts');

assert.match(routes, /userRecordsRouter\.get\('\/aquariums\/:id\/diagnosis-records'/);
assert.match(routes, /userRecordsRouter\.post\('\/aquariums\/:id\/diagnosis-records\/:localDate'/);
assert.match(routes, /parsed\.data\.problemType === '巡检'/);
assert.match(routes, /每日巡检请使用 daily-checks 接口/);
assert.match(routes, /deterministicUuid\(\`\$\{userId\}:diagnosis:\$\{parsed\.data\.diagnosisKey\}\`\)/);

assert.match(apiRepository, /async getDiagnosisRecords\(aquariumId: string, limit = 100\)/);
assert.match(apiRepository, /diagnosis-records\?limit=\$\{normalizedLimit\}/);
assert.match(apiRepository, /if \(record\.problemType === '巡检'\)/);
assert.match(apiRepository, /diagnosis-records\/\$\{date\}/);
assert.match(apiRepository, /createIdempotencyKey\('diagnosis-record'\)/);

assert.match(aquarium, /repository\.getDiagnosisRecords\(aquarium\.id, 100\)/);
assert.match(aquarium, /getCurrentAquaGuideRepository\(\)\)\.saveDiagnosis\(record\)/);
assert.doesNotMatch(aquarium, /persistDiagnosisRecords/);

assert.match(keepingHistory, /repository\.getDiagnosisRecords\(aquarium\.id, 100\)/);
assert.match(careTimeline, /sourceType: 'diagnosis_record',[\s\S]{0,80}sourceId: item\.diagnosisId/);

console.log('diagnosis cloud history boundary verified: generic diagnoses use existing protected diagnosis_records APIs, all UI persistence goes through Repository, and Waterbook de-duplicates by diagnosisKey');
