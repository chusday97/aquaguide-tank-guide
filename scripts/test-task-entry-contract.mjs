import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [app, aquarium, routes] = await Promise.all([
  read('src/App.tsx'),
  read('src/pages/Aquarium.tsx'),
  read('src/services/navigation/task-routes.ts'),
]);

assert.match(app, /['"]\/aquarium['"]:\s*\[/, 'desktop aquarium navigation must expose task-level submenu');
assert.match(app, /labelKey:\s*['"]aquarium\.dailyCheck['"]/, 'submenu must name Daily Aquarium Check');
assert.match(app, /descriptionKey:\s*['"]aquarium\.dailyCheckDesc['"]/, 'submenu must explain the check task');
assert.match(app, /path:\s*taskRoutes\.aquarium\.dailyCheck/, 'submenu must target the canonical daily-check route');
assert.match(routes, /dailyCheck:\s*['"]\/aquarium\?action=daily-check['"]/, 'daily-check route must remain canonical');
assert.match(aquarium, /onBrowseCare=\{\(\) => navigateToRoute\(taskRoutes\.care\.recommendations\)\}/, 'empty care plan must target the recommendations deep link');
assert.match(routes, /recommendations:\s*['"]\/care#care-recommendations['"]/, 'care recommendations route must remain canonical');

console.log('task-entry contract: explicit aquarium daily-check navigation passed');
