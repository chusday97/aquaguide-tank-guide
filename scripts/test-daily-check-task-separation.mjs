import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

const [statusCard, aquarium, care] = await Promise.all([
  read('src/components/product/StatusSummaryCard.tsx'),
  read('src/pages/Aquarium.tsx'),
  read('src/pages/CareEncyclopedia.tsx'),
]);

assert.ok(
  statusCard.includes('data-daily-check-scope="records-today"'),
  'Today task must expose an explicit scope marker for the record-producing Daily Tank Check.',
);
assert.ok(
  statusCard.includes('Daily Tank Check records today’s aquarium status.'),
  'English Daily Tank Check must explicitly say that it records today’s aquarium status.',
);
assert.ok(
  statusCard.includes('Care Guide Quick Check is symptom troubleshooting and does not complete today’s check.'),
  'The today task must explicitly distinguish Care Guide symptom troubleshooting from the record-producing check.',
);
assert.ok(
  statusCard.includes('每日鱼缸检查会写入今天的巡检记录'),
  'Chinese Daily Tank Check must explicitly say that it writes today’s check record.',
);
assert.ok(
  statusCard.includes('养护指南里的快速检查只用于症状排查，不会完成今日巡检'),
  'Chinese copy must explicitly separate Care Guide Quick Check from the daily record task.',
);

assert.ok(
  aquarium.includes("label: isEn ? 'Daily Tank Check' : '每日鱼缸检查'"),
  'Aquarium quick action must retain the dedicated Daily Tank Check label.',
);
assert.ok(
  aquarium.includes("isEn ? 'Start today’s check' : '开始今日检查'"),
  'Today primary action must remain an explicit Daily Tank Check entry.',
);
assert.ok(
  aquarium.includes("setDiagnosisIssueType('巡检')"),
  'Daily Tank Check must still enter the real patrol flow.',
);
assert.ok(
  aquarium.includes("todayDailyCheckRecord"),
  'Aquarium Daily Tank Check must remain connected to today’s persisted patrol state.',
);

assert.ok(
  care.includes("isEn ? 'Start Quick Check' : '开始快速检查'"),
  'Care must retain its symptom Quick Check as a separate care flow.',
);
assert.equal(
  care.includes('data-daily-check-scope="records-today"'),
  false,
  'Care Quick Check must never present itself as the record-producing Daily Tank Check.',
);
assert.equal(
  care.includes('todayDailyCheckRecord'),
  false,
  'Care Quick Check must not masquerade as or mutate the Aquarium today-check state.',
);

console.log('daily check task separation contract passed: Daily Tank Check records today; Care Quick Check remains symptom troubleshooting.');
