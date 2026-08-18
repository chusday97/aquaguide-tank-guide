import fs from 'node:fs';

const path = 'src/pages/Aquarium.tsx';
const source = fs.readFileSync(path, 'utf8');
const before = `routeNavigate('/aquarium', { replace: true });`;
const after = `routeNavigate('/aquarium', { replace: true, state: routeLocation.state });`;
const count = source.split(before).length - 1;

if (count < 4) {
  throw new Error(`Expected multiple Aquarium action-consumption navigations; found ${count}`);
}
if (source.includes(after)) {
  console.log('Aquarium action return-state preservation already present.');
  process.exit(0);
}

const next = source.split(before).join(after);
fs.writeFileSync(path, next);
console.log(`PASS: preserved route state across ${count} Aquarium action-consumption navigations.`);
