import fs from 'node:fs';

const source = fs.readFileSync('src/pages/Aquarium.tsx', 'utf8');

const required = [
  'className="aquarium-dashboard-v2"',
  'data-dashboard-priority="today"',
  'data-dashboard-priority="context"',
  'data-dashboard-priority="secondary"',
  'aquarium-dashboard-v2__manage-grid',
];

for (const marker of required) {
  if (!source.includes(marker)) {
    throw new Error(`Missing Aquarium Dashboard V2 marker: ${marker}`);
  }
}

const dashboardStart = source.indexOf('className="aquarium-dashboard-v2"');
const todayIndex = source.indexOf('data-dashboard-priority="today"', dashboardStart);
const contextIndex = source.indexOf('data-dashboard-priority="context"', dashboardStart);
const manageIndex = source.indexOf('id="aquarium-manage-zone"', dashboardStart);
const secondaryIndex = source.indexOf('data-dashboard-priority="secondary"', dashboardStart);

if (!(todayIndex < contextIndex && contextIndex < manageIndex && manageIndex < secondaryIndex)) {
  throw new Error('Dashboard priority order must be today -> context -> manage -> secondary.');
}

const workspaceSlice = source.slice(
  source.indexOf('function AquariumWorkspace('),
  source.indexOf('const getSubstrateLabelLocalized'),
);

if (/AquariumZoneHeader|aquarium-observe-zone|aquarium-followup-grid/.test(workspaceSlice)) {
  throw new Error('Legacy equal-weight Observe / Manage / Learn workspace structure returned.');
}

console.log('Aquarium Dashboard V2 source IA contract passed.');
