import assert from 'node:assert/strict';
import { evaluateTankState } from '../packages/domain-rules/src/index';

const NOW = '2026-08-23T12:00:00.000Z';
const recent = (daysAgo: number, code: Parameters<typeof evaluateTankState>[0]['observations'][number]['code'], evidence = code) => ({
  code,
  evidence,
  observedAt: new Date(Date.parse(NOW) - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
});
const aggressionPrior = {
  code: 'territory-prior',
  kind: 'territory' as const,
  level: 'medium' as const,
  evidence: '该组合存在理论领地压力。',
  observationTargets: ['持续追逐', '长期躲藏', '摄食受压'],
};
const spacePrior = {
  code: 'space-guideline-gap',
  kind: 'space' as const,
  level: 'high' as const,
  evidence: '当前尺寸低于通用推荐值。',
  observationTargets: ['活动受限', '领地冲突'],
};

const cases = [
  {
    name: 'BC-STATE-001 medium prior + recent normal evidence stays stable',
    run: () => {
      const result = evaluateTankState({
        now: NOW,
        priors: [aggressionPrior],
        observations: [recent(1, 'normal_feeding'), recent(1, 'normal_activity'), recent(1, 'no_persistent_chasing')],
      });
      assert.equal(result.state, 'stable');
      assert.equal(result.primaryAction, 'no_action');
      assert.ok(result.priorCodes.includes('territory-prior'));
    },
  },
  {
    name: 'BC-SPACE-001 generic space prior alone does not force intervention',
    run: () => {
      const result = evaluateTankState({
        now: NOW,
        priors: [spacePrior],
        observations: [recent(1, 'normal_feeding'), recent(1, 'normal_activity')],
      });
      assert.equal(result.state, 'stable');
      assert.equal(result.primaryAction, 'no_action');
    },
  },
  {
    name: 'BC-MIX-001 static aggression prior without observations becomes watch, not conflict',
    run: () => {
      const result = evaluateTankState({ now: NOW, priors: [aggressionPrior] });
      assert.equal(result.state, 'watch');
      assert.equal(result.primaryAction, 'observe');
    },
  },
  {
    name: 'AQ-STATE-003 cohabitation time alone does not prove stability',
    run: () => {
      const result = evaluateTankState({ now: NOW, priors: [aggressionPrior], cohabitationDays: 180 });
      assert.equal(result.state, 'watch');
      assert.notEqual(result.state, 'stable');
      assert.match(result.reasons.join(' '), /180/);
    },
  },
  {
    name: 'AQ-STATE-006 one chasing observation is watch',
    run: () => {
      const result = evaluateTankState({ now: NOW, priors: [aggressionPrior], observations: [recent(1, 'persistent_chasing')] });
      assert.equal(result.state, 'watch');
    },
  },
  {
    name: 'AQ-STATE-006 repeated chasing escalates to intervene',
    run: () => {
      const result = evaluateTankState({
        now: NOW,
        priors: [aggressionPrior],
        observations: [recent(1, 'persistent_chasing'), recent(5, 'persistent_chasing')],
      });
      assert.equal(result.state, 'intervene');
      assert.equal(result.primaryAction, 'adjust');
    },
  },
  {
    name: 'AQ-STATE-006 chasing plus hiding pressure escalates to intervene',
    run: () => {
      const result = evaluateTankState({
        now: NOW,
        priors: [aggressionPrior],
        observations: [recent(1, 'persistent_chasing'), recent(1, 'hiding_pressure')],
      });
      assert.equal(result.state, 'intervene');
    },
  },
  {
    name: 'AQ-STATE-006 injury requires intervention',
    run: () => {
      const result = evaluateTankState({ now: NOW, observations: [recent(1, 'injury')] });
      assert.equal(result.state, 'intervene');
    },
  },
  {
    name: 'AQ-STATE-007 respiratory distress is urgent',
    run: () => {
      const result = evaluateTankState({ now: NOW, observations: [recent(0, 'respiratory_distress')] });
      assert.equal(result.state, 'urgent');
      assert.equal(result.primaryAction, 'urgent_action');
    },
  },
  {
    name: 'BC-MIX-004 hard water-type constraint stays urgent despite normal observations',
    run: () => {
      const result = evaluateTankState({
        now: NOW,
        observations: [recent(0, 'normal_activity'), recent(0, 'normal_feeding')],
        hardConstraints: [{ code: 'water_type_mismatch', active: true, severity: 'urgent', evidence: '淡水和海水需求无法在同一水体满足。' }],
      });
      assert.equal(result.state, 'urgent');
      assert.ok(result.matchedRules.includes('AQ-STATE-004'));
    },
  },
  {
    name: 'AQ-STATE-008 no prior and no observation is unknown',
    run: () => {
      const result = evaluateTankState({ now: NOW });
      assert.equal(result.state, 'unknown');
      assert.equal(result.primaryAction, 'complete_check');
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
else console.log(`P0 Tank State Engine V1: ${cases.length}/${cases.length} pass`);
