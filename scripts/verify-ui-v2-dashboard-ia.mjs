import fs from 'node:fs';

const source = fs.readFileSync('src/pages/Aquarium.tsx', 'utf8');
const statusCardSource = fs.readFileSync('src/components/product/StatusSummaryCard.tsx', 'utf8');
const aquariumComponentStyles = fs.readFileSync('src/styles/ui-v2-aquarium-components.css', 'utf8');
const dashboardStyles = fs.readFileSync('src/styles/ui-v2-dashboard.css', 'utf8');

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
  throw new Error('Dashboard DOM order must remain today -> context -> manage -> secondary; responsive CSS may reprioritize mobile presentation.');
}

const workspaceSlice = source.slice(
  source.indexOf('function AquariumWorkspace('),
  source.indexOf('const getSubstrateLabelLocalized'),
);

if (/AquariumZoneHeader|aquarium-observe-zone|aquarium-followup-grid/.test(workspaceSlice)) {
  throw new Error('Legacy equal-weight Observe / Manage / Learn workspace structure returned.');
}

const carePlanMarkers = [
  'data-disclosure-purpose="care_plan_details"',
  'data-care-plan-details',
  'const careItems = showCarePlan ? carePlan.visibleItems : [];',
  '{showCarePlan && (',
];

for (const marker of carePlanMarkers) {
  if (!statusCardSource.includes(marker)) {
    throw new Error(`Daily decision card must keep care-plan detail behind disclosure: ${marker}`);
  }
}

if (statusCardSource.includes('carePlan.visibleItems.slice(0, 1)')) {
  throw new Error('Daily decision card must not render the first care-plan item before the user expands details.');
}

const nestedSurfacePatterns = [
  /status-summary-task[^\n]*bg-white/,
  /id="care-plan"[^\n]*border[^\n]*bg-white/,
];
for (const pattern of nestedSurfacePatterns) {
  if (pattern.test(statusCardSource)) {
    throw new Error(`Today decision card must remain one continuous surface; nested card styling returned: ${pattern}`);
  }
}

if (!/\.status-summary-task\s*\{[^}]*border-top:[^}]*padding:\s*16px 0 0;/s.test(aquariumComponentStyles)) {
  throw new Error('Today task content must use a lightweight divider instead of a nested card surface.');
}
if (!/#care-plan\s*\{[^}]*border-top:[^}]*padding:\s*13px 0 0;/s.test(aquariumComponentStyles)) {
  throw new Error('Care-plan summary must remain a divider row inside Today instead of a nested panel.');
}

const semanticHeadingRule = dashboardStyles.match(/\.aquarium-dashboard-v2__section-heading\s*\{([^}]*)\}/s)?.[1] || '';
for (const declaration of [
  'position: absolute',
  'width: 1px',
  'height: 1px',
  'overflow: hidden',
  'clip-path: inset(50%)',
]) {
  if (!semanticHeadingRule.includes(declaration)) {
    throw new Error(`Dashboard outer section heading must remain semantic-only so content cards own the visible hierarchy: ${declaration}`);
  }
}

console.log('Aquarium Dashboard V2 source IA contract passed (decision-first + flat Today + one visible heading per content section).');
