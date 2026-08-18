import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

const [aquariumPage, waterChangeService, apiRepository, businessContracts] = await Promise.all([
  read('src/pages/Aquarium.tsx'),
  read('src/services/aquarium/water-change.service.ts'),
  read('src/services/repository/api-aquaguide.repository.ts'),
  read('packages/contracts/src/business.ts'),
]);

assert.match(
  waterChangeService,
  /export const hydrateWaterChangeHistoryFromEvents\s*=/,
  'Water-change history must be reconstructable from persisted care events after cloud reload.',
);
assert.match(
  waterChangeService,
  /sourceType\s*===\s*['"]water_change_day['"]/,
  'Only canonical water_change_day care events may rebuild the exact calendar history.',
);

assert.match(
  aquariumPage,
  /normalizeAquariumPlants\(repositoryAquariums\)\.map\([^\n]*hydrateWaterChangeHistoryFromEvents/,
  'Repository loading must hydrate waterChangeHistory from cloud care events before rendering the aquarium.',
);

const tankHandlerStart = aquariumPage.indexOf('const handleTankWaterChange = async');
const tankHandlerEnd = aquariumPage.indexOf('\n  };', tankHandlerStart);
assert.ok(tankHandlerStart >= 0 && tankHandlerEnd > tankHandlerStart, 'Today water-change handler could not be isolated.');
const tankHandler = aquariumPage.slice(tankHandlerStart, tankHandlerEnd + 5);
assert.doesNotMatch(tankHandler, /saveAquariums\(/, 'Today water-change action must not write only the legacy local aquarium cache.');
assert.match(tankHandler, /getCurrentAquaGuideRepository\(\)/, 'Today water-change action must resolve the active repository.');
assert.match(tankHandler, /await repository\.saveAquarium\(/, 'Today water-change action must await the aquarium fact save before success.');
assert.match(tankHandler, /water_change_day/, 'Today water-change action must persist the exact date as a canonical care event.');

assert.match(
  aquariumPage,
  /const handleToggleWaterChangeDate = async \(dateStr: string\): Promise<boolean> =>/,
  'Calendar add/remove must use an async persistence handler.',
);
const calendarHandlerStart = aquariumPage.indexOf('const handleToggleWaterChangeDate = async');
const calendarHandlerEnd = aquariumPage.indexOf('\n  };', calendarHandlerStart);
assert.ok(calendarHandlerStart >= 0 && calendarHandlerEnd > calendarHandlerStart, 'Calendar water-change handler could not be isolated.');
const calendarHandler = aquariumPage.slice(calendarHandlerStart, calendarHandlerEnd + 5);
assert.doesNotMatch(calendarHandler, /saveAquariums\(/, 'Calendar water-change action must not write only the legacy local aquarium cache.');
assert.match(calendarHandler, /getCurrentAquaGuideRepository\(\)/, 'Calendar water-change action must resolve the active repository.');
assert.match(calendarHandler, /await repository\.saveAquarium\(/, 'Calendar water-change action must await the aquarium summary fact save.');
assert.match(calendarHandler, /persistCareTimelineEvent|removeCareTimelineEventBySource/, 'Calendar water-change action must persist or remove the exact date care event.');

assert.match(
  businessContracts,
  /lastWaterChangeAt:\s*isoDateTimeSchema\.nullable\(\)\.optional\(\)/,
  'Aquarium update contracts must allow clearing lastWaterChangeAt when the final history record is removed.',
);
assert.match(
  apiRepository,
  /lastWaterChangeAt:\s*aquarium\.lastWaterChangeDate\s*\?\?\s*null/,
  'API repository must send null when the aquarium has no remaining water-change history.',
);
assert.match(
  apiRepository,
  /lastWaterChangeAt:\s*fish\.lastWaterChangeDate\s*\?\?\s*null/,
  'API repository must clear per-species lastWaterChangeAt with the aquarium history.',
);

console.log('Water-change cloud persistence contract: PASS');
