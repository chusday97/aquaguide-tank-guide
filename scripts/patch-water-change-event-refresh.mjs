import { readFileSync, writeFileSync } from 'node:fs';

const path = 'src/pages/Aquarium.tsx';
let source = readFileSync(path, 'utf8');
const from = '        const events = await repository.getCareEvents(activeAquarium.id);';
const to = '        const events = await repository.getCareEvents();';
const first = source.indexOf(from);
const last = source.lastIndexOf(from);
if (first < 0 || first !== last) throw new Error('expected exactly one scoped water-change event refresh');
source = source.replace(from, to);
writeFileSync(path, source);
console.log('Water-change refresh now preserves the full page event cache.');
