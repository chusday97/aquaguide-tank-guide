import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { aquariumCreateSchema } from '../packages/contracts/src/business';
import { evaluateCompatibility } from '../packages/domain-rules/src';
import { fishData } from '../src/data/fishData';
import { evaluateSpeciesForAquarium } from '../src/lib/speciesFitEngine';
import { aquariumSchema } from '../src/modules/aquarium/aquarium.schema';
import type { Aquarium } from '../src/types';

assert.equal(aquariumCreateSchema.safeParse({ name: '参数测试缸', ph: 7.2, hardnessDgh: 8 }).success, true);
assert.equal(aquariumCreateSchema.safeParse({ name: '参数清空测试缸', ph: null, hardnessDgh: null }).success, true);
assert.equal(aquariumCreateSchema.safeParse({ name: '错误 pH', ph: 14.1 }).success, false);
assert.equal(aquariumCreateSchema.safeParse({ name: '错误 GH', hardnessDgh: -0.1 }).success, false);

const localTank = aquariumSchema.parse({
  id: 'water-parameter-local',
  name: 'Local parameter tank',
  fishes: [],
  waterType: 'Freshwater',
  targetTemperature: '24',
  ph: '7.2',
  hardnessDgh: '8',
});
assert.equal(localTank.ph, '7.2');
assert.equal(localTank.hardnessDgh, '8');

const domainSpecies = {
  id: 'parameter-species',
  waterType: 'freshwater' as const,
  temperatureMinC: 22,
  temperatureMaxC: 26,
  phMin: 6,
  phMax: 7,
  minTankLiters: 30,
  reviewed: true,
};
const noMeasuredPh = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'freshwater', volumeLiters: 60, targetTemperatureC: 24 },
  existingSpecies: [],
  candidateSpecies: domainSpecies,
});
assert.equal(noMeasuredPh.status, 'compatible', 'missing optional measured pH must not degrade existing complete-tank decisions');
assert.equal(noMeasuredPh.ruleCodes.includes('tank_ph_conflict'), false);

const measuredPhConflict = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'freshwater', volumeLiters: 60, targetTemperatureC: 24, ph: 8.2 },
  existingSpecies: [],
  candidateSpecies: domainSpecies,
});
assert.equal(measuredPhConflict.status, 'caution');
assert.ok(measuredPhConflict.ruleCodes.includes('tank_ph_conflict'));

const measuredPhMatch = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'freshwater', volumeLiters: 60, targetTemperatureC: 24, ph: 6.5 },
  existingSpecies: [],
  candidateSpecies: domainSpecies,
});
assert.equal(measuredPhMatch.ruleCodes.includes('tank_ph_conflict'), false);

const redRainbowfish = fishData.find(item => item.id === 'sp_0133');
assert.ok(redRainbowfish, 'reviewed red rainbowfish fixture must exist');

const makeFitTank = (ph: string, hardnessDgh: string): Aquarium => ({
  id: 'fit-parameter-tank',
  name: 'Fit parameter tank',
  fishes: [],
  waterType: 'Freshwater',
  targetTemperature: '24',
  ph,
  hardnessDgh,
  dimensions: { length: '120', width: '45', height: '45' },
  equipment: { filter: '桶滤', heater: true, oxygen: true, light: '普通灯' },
});

const reviewedMatch = evaluateSpeciesForAquarium(redRainbowfish, makeFitTank('7.5', '15'));
assert.ok(reviewedMatch.matchedItems.some(item => item.type === 'ph'), 'recorded pH inside reviewed range must be consumed');
assert.ok(reviewedMatch.matchedItems.some(item => item.type === 'hardness'), 'recorded GH inside reviewed range must be consumed');
assert.equal(reviewedMatch.confirmations.some(item => item.type === 'missing_ph'), false);
assert.equal(reviewedMatch.confirmations.some(item => item.type === 'missing_hardness'), false);

const reviewedMismatch = evaluateSpeciesForAquarium(redRainbowfish, makeFitTank('6.5', '4'));
assert.ok(reviewedMismatch.warnings.some(item => item.type === 'ph_mismatch'), 'out-of-range recorded pH must surface a warning');
assert.ok(reviewedMismatch.warnings.some(item => item.type === 'hardness_mismatch'), 'out-of-range reviewed GH must surface a warning');

const migration = readFileSync(resolve('supabase/migrations/20261017081435_aquarium_water_parameters.sql'), 'utf8');
assert.match(migration, /add column if not exists ph numeric\(4, 2\)/);
assert.match(migration, /add column if not exists hardness_dgh numeric\(6, 2\)/);
assert.match(migration, /ph >= 0 and ph <= 14/);
assert.match(migration, /hardness_dgh >= 0 and hardness_dgh <= 100/);

const repositorySource = readFileSync(resolve('src/services/repository/api-aquaguide.repository.ts'), 'utf8');
assert.match(repositorySource, /ph: aquarium\.ph[\s\S]{0,160}\? Number\(aquarium\.ph\) : null/);
assert.match(repositorySource, /hardnessDgh: aquarium\.hardnessDgh[\s\S]{0,180}\? Number\(aquarium\.hardnessDgh\) : null/);

const apiSource = readFileSync(resolve('apps/api/src/routes/aquariums.ts'), 'utf8');
assert.ok((apiSource.match(/target_temperature_c,ph,hardness_dgh/g) || []).length >= 2, 'cloud compatibility reads must include measured water parameters');

const pageSource = readFileSync(resolve('src/pages/Aquarium.tsx'), 'utf8');
assert.match(pageSource, /Measured pH/);
assert.match(pageSource, /GH \/ Hardness \(dGH\)/);
assert.match(pageSource, /repository\.saveAquarium\(nextAquarium\)/);

console.log('Aquarium water parameters PASS: pH/GH persist across contracts, measured pH informs deterministic caution, reviewed GH informs species fit, and missing optional values stay non-blocking.');
