import assert from 'node:assert/strict';
import type { Aquarium } from '../src/types';
import { buildReviewedEnvironmentDecision } from '../src/modules/environment/reviewedEnvironmentAdapter';

const aquarium = (overrides: Partial<Aquarium> = {}): Aquarium => ({
  id: 'adapter-fixture',
  name: 'Adapter fixture',
  fishes: [],
  dimensions: { length: '60', width: '30', height: '30' },
  waterType: 'Freshwater',
  targetTemperature: '24',
  substrate: '水草泥',
  plants: [],
  hardscape: [],
  equipment: {
    filter: '瀑布过滤',
    heater: false,
    oxygen: false,
    light: '水草灯',
  },
  ...overrides,
});

// 1. Missing livestock knowledge is explicit and no decision is fabricated.
{
  const result = buildReviewedEnvironmentDecision({
    speciesId: 'species-without-reviewed-profile',
    aquarium: aquarium(),
  });
  assert.equal(result.status, 'missing_species_profile');
  assert.equal('decision' in result, false);
}

// 2. A reviewed livestock profile can enter the deterministic engine.
{
  const result = buildReviewedEnvironmentDecision({
    speciesId: 'sp_0431',
    aquarium: aquarium(),
  });
  assert.equal(result.status, 'ready');
  if (result.status !== 'ready') throw new Error('expected reviewed Neon tetra decision');
  assert.equal(result.speciesId, 'sp_0431');
  assert.equal(result.tank.water.type, 'freshwater');
  assert.equal(result.tank.water.targetTemperature, 24);
  assert.equal(result.decision.environment.status, 'compatible');
  assert.equal(result.decision.plantMatch, undefined);
}

// 3. Reviewed livestock + reviewed plant can produce a plant match.
{
  const result = buildReviewedEnvironmentDecision({
    speciesId: 'sp_0431',
    plantSpeciesId: 'sp_0081',
    aquarium: aquarium(),
  });
  assert.equal(result.status, 'ready');
  if (result.status !== 'ready') throw new Error('expected reviewed species + plant decision');
  assert.equal(result.plantSpeciesId, 'sp_0081');
  assert.ok(result.decision.plantMatch, 'reviewed plant must be passed into the deterministic engine');
}

// 4. Supplying an unreviewed plant is not equivalent to “no plant issue”.
{
  const result = buildReviewedEnvironmentDecision({
    speciesId: 'sp_0431',
    plantSpeciesId: 'sp_0080',
    aquarium: aquarium(),
  });
  assert.equal(result.status, 'missing_plant_profile');
  assert.equal('decision' in result, false);
}

// 5. Species evidence is resolved only through the reviewed registry; raw catalog
// prose is never used to synthesize a missing reviewed profile.
{
  const result = buildReviewedEnvironmentDecision({
    speciesId: 'sp_0469',
    aquarium: aquarium(),
  });
  assert.equal(result.status, 'missing_species_profile');
}

// 6. High oxygen demand does not become an automatic air-pump requirement when
// tank support/risk observations are absent.
{
  const result = buildReviewedEnvironmentDecision({
    speciesId: 'sp_0045',
    aquarium: aquarium({
      targetTemperature: undefined,
      equipment: {
        filter: '无',
        heater: false,
        oxygen: false,
        light: '普通灯',
      },
    }),
  });
  assert.equal(result.status, 'ready');
  if (result.status !== 'ready') throw new Error('expected reviewed Sewellia decision');
  const oxygenation = result.decision.equipment.find(item => item.type === 'oxygenation');
  assert.equal(oxygenation?.level, 'unknown');
  assert.ok(oxygenation?.reasons.some(reason => reason.code === 'oxygen_support_unknown'));
  assert.equal(
    oxygenation?.level === 'required',
    false,
    'reviewed adapter must not translate high oxygen demand into a mandatory air pump',
  );
}

// 7. Observed tank values may be supplied through the normalized context override
// without changing the reviewed species facts.
{
  const result = buildReviewedEnvironmentDecision({
    speciesId: 'sp_0431',
    aquarium: aquarium(),
    overrides: {
      lowestObservedTemperature: 19,
      ph: 6.5,
      surfaceAgitation: 'medium',
    },
  });
  assert.equal(result.status, 'ready');
  if (result.status !== 'ready') throw new Error('expected reviewed Neon tetra decision with observations');
  assert.equal(result.tank.water.lowestObservedTemperature, 19);
  const heating = result.decision.equipment.find(item => item.type === 'heating');
  assert.equal(heating?.level, 'required');
}

console.log('Reviewed Environment adapter: PASS (reviewed-only entry, explicit missing knowledge, no prose fallback).');
