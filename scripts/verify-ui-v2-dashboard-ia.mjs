import fs from 'node:fs';

const source = fs.readFileSync('src/pages/Aquarium.tsx', 'utf8');
const styles = fs.readFileSync('src/styles/ui-v2-dashboard.css', 'utf8');

const hasSourceDashboard = [
  'className="aquarium-dashboard-v2"',
  'data-dashboard-priority="today"',
  'data-dashboard-priority="context"',
  'data-dashboard-priority="secondary"',
  'aquarium-dashboard-v2__manage-grid',
].every(marker => source.includes(marker));

if (hasSourceDashboard) {
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
  process.exit(0);
}

const fallbackRules = [
  '.aquarium-observe-grid > .aquarium-status { order: 1 !important; }',
  '.aquarium-observe-grid > .aquarium-tank { order: 2 !important; }',
  '.aquarium-observe-grid > .aquarium-archive { order: 3 !important; }',
  '.aquarium-followup-grid > .aquarium-manage-zone { order: 1; }',
  '.aquarium-followup-grid > .aquarium-learn-zone { order: 2; opacity: 0.94; }',
];

for (const rule of fallbackRules) {
  if (!styles.includes(rule)) {
    throw new Error(`Dashboard migration fallback is missing priority rule: ${rule}`);
  }
}

if (!styles.includes('Legacy DOM fallback')) {
  throw new Error('Legacy Dashboard migration fallback must remain explicit until AquariumWorkspace source migration lands.');
}

console.log('Aquarium Dashboard V2 CSS migration IA contract passed.');
