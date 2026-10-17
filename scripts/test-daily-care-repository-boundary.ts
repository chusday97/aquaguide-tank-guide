import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const aquarium = readFileSync(resolve('src/pages/Aquarium.tsx'), 'utf8');
const apiRepository = readFileSync(resolve('src/services/repository/api-aquaguide.repository.ts'), 'utf8');

assert.match(aquarium, /projectCareEventsToDailyRecords\(repositoryEvents\)/);
assert.match(aquarium, /repository\.getDiagnosisRecords\(aquarium\.id, 100\)/);
assert.doesNotMatch(aquarium, /setDiagnosisRecords\(Array\.isArray\(appState\.diagnosisRecords\)/);
assert.doesNotMatch(aquarium, /setFeedingRecords\(appState\.feedingRecords\)/);
assert.doesNotMatch(aquarium, /setObservationRecords\(appState\.observationRecords\)/);
assert.match(aquarium, /getCurrentAquaGuideRepository\(\)\)\.saveDiagnosis\(record\)/);
assert.match(aquarium, /if \(await resolveRepositoryMode\(\) === 'local'\) patchLocalAppState\(\{ feedingRecords: nextRecords \}\)/);
assert.match(aquarium, /if \(await resolveRepositoryMode\(\) === 'local'\) patchLocalAppState\(\{ observationRecords: nextRecords \}/);
assert.match(apiRepository, /const date = getLocalDayKey\(record\.createdAt\)/);
assert.match(apiRepository, /async getDailyCheck\(aquariumId: string, localDate: string\)/);

console.log('daily care repository boundary verified: cloud hydration uses Care Events + complete diagnosis history, cloud writes avoid new feed/observation local business state, and patrol dates still use the local calendar day');
