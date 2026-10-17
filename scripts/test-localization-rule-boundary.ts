import assert from 'node:assert/strict';
import type { Fish } from '../src/types';
import type { CareTopic } from '../src/data/careTopicsData';
import { runtimeCareTopicsData, runtimeFishData } from '../src/data/runtimeContentCatalog';
import { getCanonicalRuntimeCareTopic, getCanonicalRuntimeFish } from '../src/data/runtimeRuleContent';
import { applyLocalization } from '../src/i18n/localizeData';
import { isAquaticPlantSpecies } from '../src/lib/speciesClassification';
import { buildSpeciesDiagnosisContextAnswers, isSpeciesEligibleForHealthTriage } from '../src/lib/speciesRecognition';
import { getLifeType } from '../src/modules/species/species.service';
import { matchCareArticles } from '../src/modules/diagnosis/diagnosis.rules';
import { matchesCareCategory } from '../src/services/care/care-category.service';

const marine = runtimeFishData.find(item => item.category === '海水鱼');
const plant = runtimeFishData.find(item => item.category === '水草' && isAquaticPlantSpecies(item));
const waterCare = runtimeCareTopicsData.find(item => item.id === 'guide_water_deteriorate');
assert.ok(marine, 'fixture requires one marine species');
assert.ok(plant, 'fixture requires one aquatic plant');
assert.ok(waterCare, 'fixture requires guide_water_deteriorate');

const marineCanonicalBefore = getCanonicalRuntimeFish(marine);
const careCanonicalBefore = getCanonicalRuntimeCareTopic(waterCare);
assert.ok(marineCanonicalBefore);
assert.ok(careCanonicalBefore);
assert.equal(marineCanonicalBefore.category, '海水鱼');
assert.equal(careCanonicalBefore.category, '水质异常');

const saltwaterTank = {
  id: 'locale-rule-tank',
  name: 'Locale Rule Tank',
  waterType: 'Saltwater' as const,
  targetTemperature: '25',
  dimensions: { length: '90', width: '45', height: '45' },
  equipment: { filter: '桶滤' as const, oxygen: true, heater: true, light: '普通灯' as const },
  fishes: [],
};

const baselineHealthEligibility = isSpeciesEligibleForHealthTriage(marine);
const baselineWaterFit = buildSpeciesDiagnosisContextAnswers(marine, saltwaterTank).water_fit;
const baselineLifeType = getLifeType(marine);
const baselinePlant = isAquaticPlantSpecies(plant);
const baselineCareCategory = matchesCareCategory(waterCare, 'water_quality');
const baselineCareMatches = matchCareArticles('水质异常', {}, [waterCare]).map(item => item.id);

applyLocalization('en');

const localizedMarine = runtimeFishData.find(item => item.id === marine.id)!;
const localizedPlant = runtimeFishData.find(item => item.id === plant.id)!;
const localizedCare = runtimeCareTopicsData.find(item => item.id === waterCare.id)!;
assert.notEqual(localizedMarine.category, '海水鱼', 'presentation species should localize independently');
assert.notEqual(localizedCare.category, '水质异常', 'presentation care content should localize independently');

const marineCanonicalAfter = getCanonicalRuntimeFish(localizedMarine);
const careCanonicalAfter = getCanonicalRuntimeCareTopic(localizedCare);
assert.equal(marineCanonicalAfter?.category, '海水鱼', 'language switch must not mutate canonical species rules');
assert.equal(careCanonicalAfter?.category, '水质异常', 'language switch must not mutate canonical care rules');

assert.equal(isSpeciesEligibleForHealthTriage(localizedMarine), baselineHealthEligibility);
assert.equal(buildSpeciesDiagnosisContextAnswers(localizedMarine, saltwaterTank).water_fit, baselineWaterFit);
assert.equal(getLifeType(localizedMarine), baselineLifeType);
assert.equal(isAquaticPlantSpecies(localizedPlant), baselinePlant);
assert.equal(matchesCareCategory(localizedCare, 'water_quality'), baselineCareCategory);
assert.deepEqual(matchCareArticles('水质异常', {}, [localizedCare]).map(item => item.id), baselineCareMatches);

const englishOnlySpecies = {
  ...localizedMarine,
  name: 'English display name',
  category: 'Marine Fish',
  description: 'English presentation copy only',
} as Fish;
assert.equal(isSpeciesEligibleForHealthTriage(englishOnlySpecies), baselineHealthEligibility);
assert.equal(buildSpeciesDiagnosisContextAnswers(englishOnlySpecies, saltwaterTank).water_fit, baselineWaterFit);
assert.equal(getLifeType(englishOnlySpecies), baselineLifeType);

const englishOnlyCare = {
  ...localizedCare,
  title: 'Water Quality Emergency',
  category: 'Water Quality Problems',
  summary: 'English presentation copy only',
  keywords: ['water quality'],
  symptoms: ['cloudy water'],
  firstSteps: ['check water'],
  avoid: ['avoid large changes'],
} as CareTopic;
assert.equal(matchesCareCategory(englishOnlyCare, 'water_quality'), true);
assert.deepEqual(matchCareArticles('水质异常', {}, [englishOnlyCare]).map(item => item.id), baselineCareMatches);

applyLocalization('zh-CN');

console.log('localization rule boundary verified: localized presentation may change, canonical species/care semantics and rule outcomes do not');
