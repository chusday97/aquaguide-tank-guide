import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../src/pages/Aquarium.tsx', import.meta.url), 'utf8');
const checks = [
  ['AQ-WATER-002', !/const shortestCycle = currentFishesDetails\.length > 0 \? Math\.min/.test(source), 'species shortest cycle must not remain the sole recommendation authority'],
  ['AQ-WATER-004', !/else if \(!waterChangedToday && isChangeOverdue\)[\s\S]{0,500}priority: 'high'/.test(source), 'calendar overdue alone must not create a high-priority water-change Today Action'],
  ['AQ-WATER-001', /evaluateWaterChangeRecommendation|deriveWaterChangeRecommendation/.test(source), 'history recording and recommendation should have a distinct Water Change Engine'],
];
let passed = 0;
for (const [id, ok, detail] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${id} — ${detail}`);
  if (ok) passed += 1;
}
console.log(`P0 Water Change fail-before diagnostic: ${passed}/${checks.length} pass`);
process.exit(passed === checks.length ? 0 : 1);
