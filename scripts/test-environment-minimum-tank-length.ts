import assert from 'node:assert/strict';
import type { Aquarium } from '../src/types';
import { buildTankContext } from '../src/modules/environment/buildTankContext';
import { evaluateEnvironmentFit } from '../src/modules/environment/environmentDecisionEngine';
import { getReviewedSpeciesEnvironmentProfile } from '../src/modules/environment/environmentProfileRegistry';

const neon = getReviewedSpeciesEnvironmentProfile('sp_0431');
assert.ok(neon, 'reviewed Neon tetra profile is required for minimum tank-length regression');
assert.equal(neon.environment.minimumTankLengthCm, 60);

const aquarium = (length?: string): Aquarium => ({
  id: 'tank-length-fixture',
  name: 'Tank length fixture',
  fishes: [],
  waterType: 'Freshwater',
  targetTemperature: '24',
  dimensions: length ? { length, width: '30', height: '30' } : undefined,
  equipment: {
    filter: '瀑布过滤',
    heater: false,
    oxygen: false,
    light: '普通灯',
  },
});

// 1. TankContext carries the physical length directly; it is not derived from volume.
{
  const tank = buildTankContext(aquarium('60'));
  assert.equal(tank.water.tankLengthCm, 60);
}

// 2. Exact minimum length passes.
{
  const result = evaluateEnvironmentFit(neon, buildTankContext(aquarium('60')));
  assert.notEqual(result.status, 'not_recommended');
  assert.ok(result.reasons.some(reason => reason.code === 'tank_length_match'));
}

// 3. A shorter tank is a blocking environment mismatch even if volume could look adequate.
{
  const result = evaluateEnvironmentFit(neon, buildTankContext(aquarium('45')));
  assert.equal(result.status, 'not_recommended');
  assert.ok(result.reasons.some(reason => reason.code === 'tank_length_too_short'));
}

// 4. Missing physical length stays unknown rather than being replaced by volume or prose.
{
  const result = evaluateEnvironmentFit(neon, buildTankContext(aquarium()));
  assert.equal(result.status, 'unknown');
  assert.ok(result.reasons.some(reason => reason.code === 'missing_tank_length'));
}

console.log('Environment minimum tank length: PASS (physical length enforced independently of volume).');
