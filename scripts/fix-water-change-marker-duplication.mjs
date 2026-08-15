import { readFileSync, writeFileSync } from 'node:fs';

const path = 'src/pages/Aquarium.tsx';
let source = readFileSync(path, 'utf8');

const replacements = [
  [
    '  const handleDailyActionPrimary = () => {  const handleDailyActionPrimary = () => {',
    '  const handleDailyActionPrimary = () => {',
  ],
  [
    '  const getConflicts = (_fishes: AquariumFish[]): string[] => {  const getConflicts = (_fishes: AquariumFish[]): string[] => {',
    '  const getConflicts = (_fishes: AquariumFish[]): string[] => {',
  ],
];

for (const [from, to] of replacements) {
  const first = source.indexOf(from);
  const last = source.lastIndexOf(from);
  if (first < 0 || first !== last) throw new Error(`expected exactly one duplicated marker: ${from}`);
  source = source.replace(from, to);
}

writeFileSync(path, source);
console.log('Water change marker duplication removed.');
