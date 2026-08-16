import assert from 'node:assert/strict';
import {
  buildRecommendationTankSemantics,
  getLoadPressureLevel,
} from '../src/modules/recommendation/recommendation-explanation';

const configured = buildRecommendationTankSemantics({
  estimatedWaterVolumeLiters: 54,
  loadRate: 68,
  capacityKnown: true,
});

assert.equal(configured.estimatedWaterVolume.liters, 54);
assert.equal(configured.estimatedWaterVolume.labelZh, '估算有效水量');
assert.equal(
  configured.loadPressure.level,
  'moderate',
  '68% heuristic load must be presented as a pressure band rather than a physical volume',
);
assert.equal(configured.loadPressure.estimatedRate, 68);
assert.equal(configured.loadPressure.isHeuristic, true);
assert.match(configured.loadPressure.explanationZh, /不代表.*百分比.*水量/);
assert.match(configured.loadPressure.explanationZh, /不是安全概率/);
assert.match(configured.estimatedWaterVolume.explanationZh, /不会.*更多升水/);

const unknownCapacity = buildRecommendationTankSemantics({
  estimatedWaterVolumeLiters: null,
  loadRate: 0,
  capacityKnown: false,
});
assert.equal(unknownCapacity.estimatedWaterVolume.liters, null);
assert.equal(unknownCapacity.loadPressure.level, 'unknown');
assert.equal(
  unknownCapacity.loadPressure.estimatedRate,
  null,
  'unknown capacity must not surface a fake 0% load pressure',
);
assert.match(unknownCapacity.loadPressure.explanationZh, /避免把未知显示成 0%/);

assert.equal(getLoadPressureLevel(49, true), 'low');
assert.equal(getLoadPressureLevel(50, true), 'moderate');
assert.equal(getLoadPressureLevel(75, true), 'high');
assert.equal(getLoadPressureLevel(90, true), 'near_limit');
assert.equal(getLoadPressureLevel(Number.NaN, true), 'unknown');
assert.equal(getLoadPressureLevel(42, false), 'unknown');

const samePhysicalTankDifferentPressure = [
  buildRecommendationTankSemantics({
    estimatedWaterVolumeLiters: 54,
    loadRate: 35,
    capacityKnown: true,
  }),
  buildRecommendationTankSemantics({
    estimatedWaterVolumeLiters: 54,
    loadRate: 88,
    capacityKnown: true,
  }),
];
assert.equal(samePhysicalTankDifferentPressure[0].estimatedWaterVolume.liters, 54);
assert.equal(samePhysicalTankDifferentPressure[1].estimatedWaterVolume.liters, 54);
assert.notEqual(
  samePhysicalTankDifferentPressure[0].loadPressure.level,
  samePhysicalTankDifferentPressure[1].loadPressure.level,
  'stocking pressure may change while physical water volume remains the same concept',
);

console.log(JSON.stringify({
  ok: true,
  configured,
  unknownCapacity,
}, null, 2));
