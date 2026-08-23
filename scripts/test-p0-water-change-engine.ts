import assert from 'node:assert/strict';
import { evaluateWaterChangeRecommendation } from '../packages/domain-rules/src/water-change';
import { deriveWaterChangeRecommendation } from '../src/services/aquarium/water-change-recommendation.service';
import type { Aquarium, Fish } from '../src/types';
import type { CurrentTankStateEvidence } from '../src/services/aquarium/tank-state-evidence.service';

const now = '2026-08-23T12:00:00.000Z';
const run = (name: string, fn: () => void) => { fn(); console.log(`PASS ${name}`); };

run('today recorded water change is not duplicated', () => {
  const result = evaluateWaterChangeRecommendation({ baselineCycleDays: 7, lastWaterChangeAt: now, waterChangedToday: true, now });
  assert.equal(result.status, 'not_needed');
  assert.equal(result.priority, 'none');
});

run('calendar overdue alone is recommended but never urgent/high', () => {
  const result = evaluateWaterChangeRecommendation({ baselineCycleDays: 7, lastWaterChangeAt: '2026-08-14T12:00:00Z', currentTankState: 'stable', now });
  assert.equal(result.status, 'recommended');
  assert.equal(result.priority, 'medium');
  assert.match(result.summary, /不属于紧急处置/);
});

run('due soon is a low-priority maintenance signal', () => {
  const result = evaluateWaterChangeRecommendation({ baselineCycleDays: 7, lastWaterChangeAt: '2026-08-17T12:00:00Z', currentTankState: 'stable', now });
  assert.equal(result.status, 'due_soon');
  assert.equal(result.priority, 'low');
});

run('not near baseline and no water evidence means not needed', () => {
  const result = evaluateWaterChangeRecommendation({ baselineCycleDays: 7, lastWaterChangeAt: '2026-08-20T12:00:00Z', currentTankState: 'stable', now });
  assert.equal(result.status, 'not_needed');
});

run('cloudy water can recommend water change before calendar due', () => {
  const result = evaluateWaterChangeRecommendation({ baselineCycleDays: 7, lastWaterChangeAt: '2026-08-20T12:00:00Z', currentTankState: 'watch', currentSignals: ['cloudy_water'], now });
  assert.equal(result.status, 'recommended');
  assert.equal(result.priority, 'medium');
});

run('water abnormality plus physiological danger can be urgent', () => {
  const result = evaluateWaterChangeRecommendation({ baselineCycleDays: 7, lastWaterChangeAt: '2026-08-20T12:00:00Z', currentTankState: 'urgent', currentSignals: ['odor', 'respiratory_distress'], now });
  assert.equal(result.status, 'urgent');
  assert.equal(result.priority, 'high');
});

run('respiratory distress alone does not invent water-change urgency', () => {
  const result = evaluateWaterChangeRecommendation({ baselineCycleDays: 7, lastWaterChangeAt: '2026-08-20T12:00:00Z', currentTankState: 'urgent', currentSignals: ['respiratory_distress'], now });
  assert.equal(result.status, 'not_needed');
});

run('missing history remains unknown instead of fake schedule certainty', () => {
  const result = evaluateWaterChangeRecommendation({ baselineCycleDays: 7, currentTankState: 'stable', now });
  assert.equal(result.status, 'unknown');
});

const fish: Fish = { id: 'f1', name: '测试鱼', scientificName: 'Test', category: '鱼类', image: '', difficulty: 'Easy', waterTemperature: '22-26°C', phLevel: '6.5-7.5', waterChangeCycle: 7, description: '', diet: '', tankSize: '40L', temperament: 'Peaceful', size: 'Small' };
const aquarium: Aquarium = { id: 'tank', name: '测试缸', fishes: [{ id: 'r1', fishId: 'f1', quantity: 2, entryDate: '2026-08-01' }], waterChangeHistory: ['2026-08-14'] };
const stableEvidence = { compatibilityDecision: null, priors: [], hardConstraints: [], observations: [], cohabitationDays: 22, result: { state: 'stable', confidence: 'high', primaryAction: 'no_action', summary: 'stable', reasons: [], matchedRules: [], activeSignals: [], priorCodes: [], observationTargets: [] } } as CurrentTankStateEvidence;
run('aquarium adapter treats shortest species cycle as baseline only', () => {
  const result = deriveWaterChangeRecommendation({ aquarium, speciesCatalog: [fish], tankStateEvidence: stableEvidence, now: new Date(now) });
  assert.equal(result.status, 'recommended');
  assert.equal(result.priority, 'medium');
  assert.equal(result.daysSinceChange, 9);
});

console.log('P0 Water Change Engine V1: 9/9 PASS');
