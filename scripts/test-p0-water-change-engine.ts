import assert from 'node:assert/strict';
import { evaluateWaterChangeDecision } from '../packages/domain-rules/src/index';

const TODAY = '2026-08-23';

const cases = [
  {
    name: 'BC-WATER-001 overdue baseline without abnormal evidence is maintenance, not urgent',
    run: () => {
      const result = evaluateWaterChangeDecision({ baselineDays: 7, history: ['2026-08-10'], today: TODAY });
      assert.equal(result.scheduleStatus, 'overdue');
      assert.equal(result.action, 'record_water_change');
      assert.equal(result.priority, 'medium');
      assert.notEqual(result.priority, 'high');
      assert.ok(result.matchedRules.includes('AQ-WATER-004'));
    },
  },
  {
    name: 'AQ-WATER-002 baseline due window can surface a maintenance task',
    run: () => {
      const result = evaluateWaterChangeDecision({ baselineDays: 7, history: ['2026-08-17'], today: TODAY });
      assert.equal(result.scheduleStatus, 'due');
      assert.equal(result.action, 'record_water_change');
      assert.equal(result.priority, 'medium');
    },
  },
  {
    name: 'AQ-WATER-001 completed today is history fact and produces no duplicate task',
    run: () => {
      const result = evaluateWaterChangeDecision({ baselineDays: 7, history: [TODAY], today: TODAY });
      assert.equal(result.scheduleStatus, 'complete');
      assert.equal(result.action, 'none');
    },
  },
  {
    name: 'AQ-WATER-001 no completed history remains unknown instead of fabricated overdue',
    run: () => {
      const result = evaluateWaterChangeDecision({ baselineDays: 7, history: [], today: TODAY });
      assert.equal(result.scheduleStatus, 'unknown');
      assert.equal(result.action, 'none');
    },
  },
  {
    name: 'AQ-WATER-002 no reviewed baseline remains unknown instead of defaulting to seven days',
    run: () => {
      const result = evaluateWaterChangeDecision({ baselineDays: null, history: ['2026-08-10'], today: TODAY });
      assert.equal(result.scheduleStatus, 'unknown');
      assert.equal(result.action, 'none');
      assert.equal(result.baselineDays, null);
    },
  },
  {
    name: 'AQ-WATER-002 cloudy-water evidence changes recommendation from automatic change to water check',
    run: () => {
      const result = evaluateWaterChangeDecision({
        baselineDays: 7,
        history: ['2026-08-10'],
        today: TODAY,
        currentSignals: ['cloudy_water'],
      });
      assert.equal(result.scheduleStatus, 'overdue');
      assert.equal(result.action, 'check_water_quality');
      assert.equal(result.priority, 'medium');
    },
  },
  {
    name: 'AQ-WATER-004 severe current evidence can justify high-priority water-state checking',
    run: () => {
      const result = evaluateWaterChangeDecision({
        baselineDays: 7,
        history: ['2026-08-10'],
        today: TODAY,
        currentSignals: ['respiratory_distress'],
      });
      assert.equal(result.action, 'check_water_quality');
      assert.equal(result.priority, 'high');
      assert.ok(result.matchedRules.includes('AQ-WATER-004'));
    },
  },
  {
    name: 'AQ-WATER-003 future history is ignored as completed history',
    run: () => {
      const result = evaluateWaterChangeDecision({ baselineDays: 7, history: ['2026-08-24'], today: TODAY });
      assert.equal(result.scheduleStatus, 'unknown');
      assert.equal(result.latestChangeDate, null);
      assert.ok(result.matchedRules.includes('AQ-WATER-003'));
    },
  },
];

let failed = 0;
for (const testCase of cases) {
  try {
    testCase.run();
    console.log(`PASS ${testCase.name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${testCase.name}`);
    console.error(error);
  }
}
if (failed > 0) process.exitCode = 1;
else console.log(`P0 Water Change Engine V1: ${cases.length}/${cases.length} pass`);
