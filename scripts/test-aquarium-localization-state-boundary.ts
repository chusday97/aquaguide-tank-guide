import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  getObservationOptionLabel,
  normalizeObservationNote,
  normalizeObservationValue,
  observationOptions,
  presentObservationNote,
} from '../src/services/aquarium/observation-presentation.service';
import {
  getRiskReminderStatusLabel,
  isRiskReminderDone,
  normalizeRiskReminderState,
  normalizeRiskReminderStatus,
} from '../src/services/aquarium/risk-reminder-state.service';

const hasCjk = (value: string) => /[\u3400-\u9fff]/.test(value);

for (const option of observationOptions) {
  assert.equal(getObservationOptionLabel(option.value, false), option.value);
  assert.equal(getObservationOptionLabel(option.value, true), option.en);
  assert.equal(hasCjk(option.en), false);
  assert.equal(normalizeObservationValue(option.en), option.value);
}

assert.equal(
  normalizeObservationNote('Fish floating at surface、Rapid breathing'),
  '鱼浮在水面、呼吸明显急促',
  'legacy English observation notes must normalize to canonical values',
);
assert.equal(
  presentObservationNote('鱼浮在水面、呼吸明显急促', true),
  'Fish floating at surface, Rapid breathing',
);
assert.equal(presentObservationNote('未发现明显呼吸异常', true), 'No obvious breathing abnormality');
assert.equal(normalizeObservationNote('Abnormality observed'), '发现异常');

assert.equal(normalizeRiskReminderStatus('已观察'), 'observed_normal');
assert.equal(normalizeRiskReminderStatus('已发现异常'), 'observed_abnormal');
assert.equal(normalizeRiskReminderStatus('已查看'), 'reviewed');
assert.equal(normalizeRiskReminderStatus('Observed'), 'observed_normal');
assert.equal(normalizeRiskReminderStatus('Abnormality logged'), 'observed_abnormal');
assert.equal(normalizeRiskReminderStatus('Reviewed'), 'reviewed');
assert.deepEqual(
  normalizeRiskReminderState({
    observeBreathing: '已观察',
    viewMixingRisk: 'Reviewed',
    staleUnknown: '旧文案',
  }),
  {
    observeBreathing: 'observed_normal',
    viewMixingRisk: 'reviewed',
  },
);
assert.equal(isRiskReminderDone('observed_normal'), true);
assert.equal(isRiskReminderDone(undefined), false);
assert.equal(getRiskReminderStatusLabel('observed_normal', true), 'Observed');
assert.equal(getRiskReminderStatusLabel('observed_abnormal', true), 'Abnormality logged');
assert.equal(getRiskReminderStatusLabel('reviewed', true), 'Reviewed');
assert.equal(getRiskReminderStatusLabel('observed_normal', false), '已观察');

const aquariumSource = readFileSync(new URL('../src/pages/Aquarium.tsx', import.meta.url), 'utf8');
assert.doesNotMatch(aquariumSource, /task\.actionText\.startsWith\('已'\)/, 'completion cannot depend on Chinese display text');
assert.match(aquariumSource, /const isDone = task\.isDone;/);
assert.match(aquariumSource, /observationOptions\.map\(option =>/);
assert.match(aquariumSource, /markPriorityTask\('observeBreathing', 'observed_normal'\)/);
assert.match(aquariumSource, /markPriorityTask\('observeBreathing', 'observed_abnormal'\)/);
assert.match(aquariumSource, /markPriorityTask\('viewMixingRisk', 'reviewed'\)/);
assert.doesNotMatch(aquariumSource, /isEn \? \['Fish floating at surface'/, 'English labels must not become observation values');
assert.match(aquariumSource, /eventType: 'observation',[\s\S]*title: '记录观察',[\s\S]*label: createdRecord\.note/);

const timelineSource = readFileSync(new URL('../src/components/aquarium/AquariumTimeline.tsx', import.meta.url), 'utf8');
assert.match(timelineSource, /presentObservationNote\(item\.label, isEn\)/);
assert.match(timelineSource, /getObservationHistoryTitle\(isEn\)/);

console.log('aquarium localization state boundary verified: observation values and reminder completion use canonical codes, presentation remains locale-specific');
