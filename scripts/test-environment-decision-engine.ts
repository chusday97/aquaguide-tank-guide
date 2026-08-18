import assert from 'node:assert/strict';
import {
  buildEnvironmentDecision,
  deriveHeatingRequirement,
  deriveOxygenationRequirement,
  evaluatePlantMatch,
} from '../src/modules/environment/environmentDecisionEngine';
import type {
  PlantEnvironmentProfile,
  SpeciesEnvironmentProfile,
  TankContext,
} from '../src/modules/environment/environment.types';

const evidence = {
  confidence: 'medium' as const,
  reviewStatus: 'reviewed' as const,
  sourceRefs: ['synthetic-regression-fixture'],
};

const baseSpecies: SpeciesEnvironmentProfile = {
  speciesId: 'fixture-animal',
  environment: {
    waterType: 'freshwater',
    temperature: { min: 24, max: 28 },
    ph: { min: 6, max: 7.5 },
    oxygenDemand: 'medium',
    minimumVolumeLiters: 40,
  },
  habitat: {
    coverNeed: 'high',
    shelterNeed: 'high',
    diggingBehavior: 'none',
    uprootingRisk: 'none',
    plantEatingRisk: 'none',
  },
  evidence,
};

const basePlant: PlantEnvironmentProfile = {
  speciesId: 'fixture-plant',
  environment: {
    waterType: 'freshwater',
    temperature: { min: 20, max: 29 },
    ph: { min: 6, max: 8 },
    light: 'low',
    co2: 'optional',
  },
  planting: {
    type: 'epiphyte',
    substrateRequired: 'none',
    leafDurability: 'tough',
  },
  habitatValue: {
    cover: 'high',
    fryShelter: 'high',
    shrimpShelter: 'medium',
    visualBarrier: 'medium',
  },
  evidence,
};

const tank = (overrides: Partial<TankContext> = {}): TankContext => ({
  water: {
    type: 'freshwater',
    volumeLiters: 60,
    targetTemperature: 25,
  },
  habitat: {
    substrate: '水草泥',
    plants: [],
    hardscape: [],
  },
  equipment: {
    filterType: '瀑布过滤',
    heater: false,
    airPump: false,
    light: '水草灯',
    surfaceAgitation: 'medium',
  },
  stocking: {
    loadRate: 40,
    speciesIds: [],
  },
  ...overrides,
});

// 1. Heating must be required when measured low temperature is below the species minimum.
{
  const result = deriveHeatingRequirement(baseSpecies, tank({
    water: {
      type: 'freshwater',
      volumeLiters: 60,
      targetTemperature: 25,
      lowestObservedTemperature: 19,
    },
  }));
  assert.equal(result.level, 'required');
  assert.equal(result.reasons[0]?.code, 'heating_below_minimum');
}

// 2. A target temperature alone must not prove that a heater is required or unnecessary.
{
  const result = deriveHeatingRequirement(baseSpecies, tank());
  assert.equal(result.level, 'unknown');
  assert.equal(result.reasons[0]?.code, 'heating_low_temperature_unknown');
}

// 3. High oxygen demand + warm water + high load + low surface agitation should recommend oxygenation support.
{
  const highOxygenSpecies: SpeciesEnvironmentProfile = {
    ...baseSpecies,
    environment: { ...baseSpecies.environment, oxygenDemand: 'high' },
  };
  const result = deriveOxygenationRequirement(highOxygenSpecies, tank({
    water: {
      type: 'freshwater',
      volumeLiters: 60,
      targetTemperature: 29,
      lowestObservedTemperature: 25,
    },
    equipment: {
      filterType: '桶滤',
      heater: true,
      airPump: false,
      light: '普通灯',
      surfaceAgitation: 'low',
    },
    stocking: {
      loadRate: 82,
      speciesIds: ['a', 'b'],
    },
  }));
  assert.equal(result.level, 'recommended');
  assert.ok(result.actions.some(action => action.includes('水面扰动')));
  assert.ok(result.actions.some(action => action.includes('气泵')));
}

// 4. High oxygen demand with no support/risk observations must remain unknown, not auto-map to an air pump requirement.
{
  const highOxygenSpecies: SpeciesEnvironmentProfile = {
    ...baseSpecies,
    environment: { ...baseSpecies.environment, oxygenDemand: 'high' },
  };
  const result = deriveOxygenationRequirement(highOxygenSpecies, tank({
    water: { type: 'freshwater', volumeLiters: 60 },
    equipment: { surfaceAgitation: 'unknown' },
    stocking: { speciesIds: [] },
  }));
  assert.equal(result.level, 'unknown');
  assert.ok(result.reasons.some(reason => reason.code === 'oxygen_support_unknown'));
}

// 5. A high uprooting animal should caution against rooted plants.
{
  const diggingSpecies: SpeciesEnvironmentProfile = {
    ...baseSpecies,
    habitat: {
      ...baseSpecies.habitat,
      diggingBehavior: 'high',
      uprootingRisk: 'high',
    },
  };
  const rootedPlant: PlantEnvironmentProfile = {
    ...basePlant,
    planting: { ...basePlant.planting, type: 'rooted', leafDurability: 'medium' },
  };
  const result = evaluatePlantMatch(diggingSpecies, rootedPlant, tank());
  assert.equal(result.status, 'caution');
  assert.ok(result.reasons.some(reason => reason.code === 'plant_uprooting_risk'));
}

// 6. The same animal should not be blocked solely for uprooting when the plant is epiphytic and tough.
{
  const diggingSpecies: SpeciesEnvironmentProfile = {
    ...baseSpecies,
    habitat: {
      ...baseSpecies.habitat,
      diggingBehavior: 'high',
      uprootingRisk: 'high',
    },
  };
  const result = evaluatePlantMatch(diggingSpecies, basePlant, tank());
  assert.equal(result.status, 'compatible');
  assert.ok(result.benefits.some(reason => reason.code === 'plant_cover_benefit'));
}

// 7. Strong plant-eating risk + delicate leaves is a real blocking interaction.
{
  const grazer: SpeciesEnvironmentProfile = {
    ...baseSpecies,
    habitat: { ...baseSpecies.habitat, plantEatingRisk: 'high' },
  };
  const delicatePlant: PlantEnvironmentProfile = {
    ...basePlant,
    planting: { ...basePlant.planting, type: 'rooted', leafDurability: 'delicate' },
  };
  const result = evaluatePlantMatch(grazer, delicatePlant, tank());
  assert.equal(result.status, 'not_recommended');
  assert.ok(result.reasons.some(reason => reason.code === 'plant_eating_delicate'));
}

// 8. End-to-end decision keeps environment, plant and equipment outputs separate.
{
  const result = buildEnvironmentDecision({
    species: baseSpecies,
    tank: tank({
      water: {
        type: 'freshwater',
        volumeLiters: 60,
        targetTemperature: 25,
        lowestObservedTemperature: 25,
      },
    }),
    plant: basePlant,
  });
  assert.equal(result.environment.status, 'compatible');
  assert.equal(result.plantMatch?.status, 'compatible');
  assert.equal(result.equipment.find(item => item.type === 'heating')?.level, 'not_needed');
}

console.log('environment decision engine: PASS');
