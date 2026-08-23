import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/pages/Aquarium.tsx', import.meta.url), 'utf8');
const cases = [
  {
    id: 'AQ-BC-MIX-001',
    ok: !/if \(hasAggressive && hasPeaceful\)[\s\S]{0,1400}severity: 'danger'[\s\S]{0,1400}优先移除攻击性生物/.test(source),
    detail: 'static Aggressive + Peaceful metadata must not become an active danger/removal instruction',
  },
  {
    id: 'AQ-BC-SPACE-001',
    ok: !/if \(tankLiters < minRequiredLiters\)[\s\S]{0,1600}升级缸体[\s\S]{0,1600}更大的已循环鱼缸/.test(source),
    detail: 'generic tank-size guidance must not become an immediate upgrade/move instruction',
  },
  {
    id: 'AQ-STATE-005',
    ok: !/else if \(blockingCompatibilityRisk\)[\s\S]{0,900}actionType: 'compatibility_review'[\s\S]{0,900}priority: 'high'/.test(source),
    detail: 'static compatibility prior must not bypass Current Tank State and own Today Action',
  },
];
let passed = 0;
for (const item of cases) {
  if (item.ok) {
    passed += 1;
    console.log(`PASS ${item.id} — ${item.detail}`);
  } else {
    console.error(`FAIL ${item.id} — ${item.detail}`);
  }
}
console.log(`P0 Tank State fail-before diagnostic: ${passed}/${cases.length} pass`);
if (passed !== cases.length) process.exitCode = 1;
