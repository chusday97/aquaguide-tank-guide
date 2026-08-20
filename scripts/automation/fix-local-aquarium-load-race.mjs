import fs from 'node:fs';

const path = 'src/pages/Aquarium.tsx';
const source = fs.readFileSync(path, 'utf8');
const search = `        const repository = getAquaGuideRepository(resolvedMode);\n        const [repositoryAquariums, repositoryReminders, repositoryEvents] = resolvedMode === 'cloud'\n          ? await Promise.all([repository.getAquariums(), repository.getCareReminders(), repository.getCareEvents()])\n          : [loadAppStateFromStorage().aquariums, await repository.getCareReminders(), await repository.getCareEvents()];\n`;
const replacement = `        const repository = getAquaGuideRepository(resolvedMode);\n        let repositoryAquariums: Aquarium[];\n        let repositoryReminders: CareReminderRecord[];\n        let repositoryEvents: CareTimelineRecord[];\n        if (resolvedMode === 'cloud') {\n          [repositoryAquariums, repositoryReminders, repositoryEvents] = await Promise.all([\n            repository.getAquariums(),\n            repository.getCareReminders(),\n            repository.getCareEvents(),\n          ]);\n        } else {\n          [repositoryReminders, repositoryEvents] = await Promise.all([\n            repository.getCareReminders(),\n            repository.getCareEvents(),\n          ]);\n          // Read local aquariums after async ancillary loads so a just-saved plant edit\n          // cannot be overwritten by a stale aquarium snapshot captured before the awaits.\n          repositoryAquariums = loadAppStateFromStorage().aquariums;\n        }\n`;
const first = source.indexOf(search);
if (first < 0) throw new Error('local repository load marker not found');
if (source.indexOf(search, first + search.length) >= 0) throw new Error('local repository load marker is not unique');
fs.writeFileSync(path, source.slice(0, first) + replacement + source.slice(first + search.length));
console.log('Local aquarium load race fix applied.');
