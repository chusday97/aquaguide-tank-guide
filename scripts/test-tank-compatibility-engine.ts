import type { Aquarium, Fish } from '../src/types';
import { evaluateTankCompatibility as evaluateLegacyTankCompatibility } from '../src/lib/tankCompatibilityEngine';
import { getTankCompatibilityAddPolicy } from '../src/services/compatibility/compatibility.service';
import { evaluateCompatibilityDecision } from '../src/modules/knowledge/compatibilityKnowledge';
import { executeSpeciesAddition, reviewSpeciesAdditions } from '../src/services/aquarium/species-addition.service';
import { estimateWaterProfile } from '../src/lib/waterProfileEstimate';
import { getCompatibilityPreviewSpecies } from '../src/services/compatibility/compatibility-preview.service';

const makeFish = (overrides: Partial<Fish> = {}): Fish => ({
  id: 'peaceful-small-fish',
  name: '测试小型淡水鱼',
  scientificName: 'Testus freshwater',
  category: '淡水观赏鱼',
  image: '',
  difficulty: 'Easy',
  waterTemperature: '22-28°C',
  phLevel: '6.0-8.0',
  waterChangeCycle: 7,
  description: '和平的小型淡水鱼。',
  diet: '杂食',
  tankSize: '至少 20 升',
  temperament: 'Peaceful',
  size: 'Small',
  housingMode: '适合混养',
  waterType: 'freshwater',
  ...overrides,
});

const makeTank = (overrides: Partial<Aquarium> = {}): Aquarium => ({
  id: 'test-tank',
  name: '测试鱼缸',
  fishes: [],
  dimensions: { length: '60', width: '30', height: '30' },
  waterType: 'Freshwater',
  targetTemperature: '25',
  equipment: { filter: '瀑布过滤', heater: true, oxygen: false, light: '普通灯' },
  ...overrides,
});

const cases: Array<{ name: string; run: () => boolean }> = [
  {
    name: 'compatibility statuses map to one add policy',
    run: () => (
      getTankCompatibilityAddPolicy('compatible') === 'allow'
      && getTankCompatibilityAddPolicy('caution') === 'confirm'
      && getTankCompatibilityAddPolicy('insufficient_data') === 'complete_information'
      && getTankCompatibilityAddPolicy('not_recommended') === 'block'
    ),
  },
  {
    name: 'legacy result exposes the domain authority metadata',
    run: () => {
      const result = evaluateLegacyTankCompatibility({
        tank: makeTank(),
        candidateSpecies: makeFish(),
      });
      return result.metadata.catalogVersion === 'local-fish-data-v1'
        && result.metadata.ruleVersion === 'compatibility-domain-v1'
        && result.metadata.domainRuleCodes.length > 0
        && ['compatible', 'caution', 'not_recommended', 'insufficient_data'].includes(result.metadata.domainStatus);
    },
  },
  {
    name: 'ordinary species does not require a stored pH value',
    run: () => {
      const result = evaluateLegacyTankCompatibility({
        tank: makeTank({ substrate: '无', plants: [], hardscape: [] }),
        candidateSpecies: makeFish(),
      });
      return result.status === 'insufficient_data'
        && result.missingData.every(rule => !['missing_ph', 'missing_hardness'].includes(rule.code));
    },
  },
  {
    name: 'sensitive species gets an optional test reminder instead of insufficient data',
    run: () => {
      const result = evaluateLegacyTankCompatibility({
        tank: makeTank({ substrate: '水草泥', hardscape: ['沉木'] }),
        candidateSpecies: makeFish({
          id: 'sensitive-shrimp',
          name: '测试水晶虾',
          scientificName: 'Caridina test',
          category: '虾螺蟹',
          phLevel: '6.0-6.8',
        }),
      });
      return result.status === 'insufficient_data'
        && result.missingData.some(rule => rule.code === 'missing_ph' && rule.severity === 'low')
        && result.suggestions.some(item => item.includes('试纸'));
    },
  },
  {
    name: 'water profile only exposes a tendency and never invents numeric pH',
    run: () => {
      const acidic = estimateWaterProfile(makeTank({ substrate: '水草泥', hardscape: ['沉木'], plants: ['水榕', '莫丝'] }));
      const conflict = estimateWaterProfile(makeTank({ substrate: '水草泥', hardscape: ['青龙石'] }));
      return acidic.tendency === 'acidic'
        && acidic.limitation.includes('不代表实际 pH 数值')
        && conflict.tendency === 'unknown';
    },
  },
  {
    name: 'freshwater tank blocks saltwater species',
    run: () => {
      const result = evaluateLegacyTankCompatibility({
        tank: makeTank(),
        candidateSpecies: makeFish({ id: 'saltwater-fish', name: '测试海水鱼', category: '海水观赏鱼', waterType: 'saltwater' }),
      });
      return result.status === 'not_recommended'
        && result.blockingRules.some(rule => rule.code === 'water_type_mismatch');
    },
  },
  {
    name: 'direct legacy entry carries Domain blocking evidence',
    run: () => {
      const result = evaluateLegacyTankCompatibility({
        tank: makeTank(),
        existingSpecies: [{ species: makeFish({ id: 'existing-freshwater' }), record: { quantity: 1 } }],
        candidateSpecies: makeFish({ id: 'saltwater-candidate', waterType: 'saltwater' }),
        intent: 'planned_addition',
      });
      return result.status === 'not_recommended'
        && result.blockingRules.some(rule => rule.code === 'candidate_tank_water_type_conflict');
    },
  },
  {
    name: 'unknown tank water type is insufficient instead of freshwater',
    run: () => {
      const result = evaluateLegacyTankCompatibility({
        tank: makeTank({ waterType: undefined }),
        candidateSpecies: makeFish({ id: 'saltwater-fish', name: '测试海水鱼', category: '海水观赏鱼' }),
      });
      return result.status === 'insufficient_data'
        && result.blockingRules.every(rule => rule.code !== 'water_type_mismatch')
        && result.missingData.some(rule => rule.code === 'missing_tank_water_type');
    },
  },
  {
    name: 'empty tank compatibility preview does not invent candidates',
    run: () => getCompatibilityPreviewSpecies({
      selectedAquarium: makeTank({ fishes: [] }),
      currentLivestock: [],
      activeSpeciesIds: [],
      preferredSpeciesIds: ['peaceful-small-fish'],
      candidateSpecies: [makeFish()],
      fallbackSpecies: [makeFish()],
    }).length === 0,
  },
  {
    name: 'missing tank dimensions and temperature is insufficient data',
    run: () => {
      const result = evaluateLegacyTankCompatibility({
        tank: makeTank({ dimensions: undefined, targetTemperature: undefined }),
        candidateSpecies: makeFish(),
      });
      return result.status === 'insufficient_data'
        && result.missingData.some(rule => /volume|temperature/.test(rule.code));
    },
  },
  {
    name: 'adjustable heater issue returns caution',
    run: () => {
      const result = evaluateLegacyTankCompatibility({
        tank: makeTank({ equipment: { filter: '瀑布过滤', heater: false, oxygen: false, light: '普通灯' } }),
        candidateSpecies: makeFish({ waterTemperature: '24-28°C' }),
      });
      return result.status === 'insufficient_data'
        && result.warningRules.some(rule => rule.code === 'heater_needed');
    },
  },
  {
    name: 'predator blocks a smaller candidate',
    run: () => {
      const predator = makeFish({
        id: 'sp_0049',
        name: '珍珠赤雷龙',
        description: '会捕食小型鱼。',
        temperament: 'Aggressive',
        size: 'Large',
        tankSize: '至少 100 升',
      });
      const result = evaluateLegacyTankCompatibility({
        tank: makeTank({ dimensions: { length: '100', width: '50', height: '50' } }),
        existingSpecies: [{ species: predator, record: { quantity: 1 } }],
        candidateSpecies: makeFish(),
      });
      return result.status === 'not_recommended'
        && result.blockingRules.some(rule => rule.code === 'predation_risk');
    },
  },
  {
    name: 'pair result is independent of selection order',
    run: () => {
      const smallFish = makeFish();
      const predator = makeFish({
        id: 'sp_0049',
        name: '珍珠赤雷龙',
        description: '会捕食小型鱼。',
        temperament: 'Aggressive',
        size: 'Large',
        tankSize: '至少 100 升',
      });
      const tank = makeTank({ dimensions: { length: '100', width: '50', height: '50' } });
      const forward = evaluateCompatibilityDecision({
        tank,
        items: [{ species: smallFish, quantity: 1 }, { species: predator, quantity: 1 }],
      });
      const reverse = evaluateCompatibilityDecision({
        tank,
        items: [{ species: predator, quantity: 1 }, { species: smallFish, quantity: 1 }],
      });
      return forward.status === 'not_recommended'
        && reverse.status === 'not_recommended'
        && forward.blockingRules.some(rule => rule.code === 'predation_risk')
        && reverse.blockingRules.some(rule => rule.code === 'predation_risk');
    },
  },
  {
    name: 'aggressive does not automatically mean predatory',
    run: () => {
      const aggressive = makeFish({
        id: 'unreviewed-aggressive-fish',
        name: '测试攻击性鱼',
        temperament: 'Aggressive',
        size: 'Large',
        description: '会争夺领地，但没有明确捕食资料。',
      });
      const result = evaluateLegacyTankCompatibility({
        scope: 'species_only',
        existingSpecies: [aggressive],
        candidateSpecies: makeFish(),
      });
      return result.status === 'insufficient_data'
        && result.blockingRules.every(rule => rule.code !== 'predation_risk')
        && result.missingData.some(rule => rule.code === 'behavior_evidence_unreviewed');
    },
  },
  {
    name: 'tiger barb and mini parrot use reviewed behavior evidence instead of size predation',
    run: () => {
      const tigerBarb = makeFish({
        id: 'sp_0439',
        name: '虎皮鱼',
        temperament: 'Aggressive',
        description: '活泼，有追鳍倾向。',
      });
      const miniParrot = makeFish({
        id: 'sp_0021',
        name: '迷你鹦鹉鱼',
        temperament: 'Aggressive',
        size: 'Medium',
        description: '繁殖期会防御领地。',
      });
      const result = evaluateLegacyTankCompatibility({
        scope: 'species_only',
        existingSpecies: [tigerBarb],
        candidateSpecies: miniParrot,
      });
      const behaviorRule = result.blockingRules.find(rule => rule.code === 'pair_rule_behavior_and_territory_conflict');
      return result.status === 'not_recommended'
        && Boolean(behaviorRule)
        && behaviorRule?.basis === 'rule_inference'
        && behaviorRule?.reviewStatus === 'reviewed'
        && behaviorRule.citations.length === 2
        && result.blockingRules.every(rule => rule.code !== 'predation_risk')
        && /追鳍|领地/.test(result.summary);
    },
  },
  {
    name: 'direct engine, calculator decision, and addition review share one status',
    run: () => {
      const candidate = makeFish({ waterTemperature: '24-28°C' });
      const tank = makeTank({ equipment: { filter: '瀑布过滤', heater: false, oxygen: false, light: '普通灯' } });
      const direct = evaluateLegacyTankCompatibility({
        tank,
        candidateSpecies: candidate,
        candidateQuantity: 1,
      });
      const calculator = evaluateCompatibilityDecision({
        tank,
        items: [{ species: candidate, quantity: 1 }],
      });
      const addition = reviewSpeciesAdditions({
        aquarium: tank,
        items: [{ fishId: candidate.id, quantity: 1 }],
        speciesCatalog: [candidate],
      });
      return direct.status === 'insufficient_data'
        && calculator.status === 'insufficient_data'
        && addition?.status === 'insufficient_data';
    },
  },
  {
    name: 'same species quantity counts toward load without self conflict',
    run: () => {
      const species = makeFish();
      const result = evaluateLegacyTankCompatibility({
        tank: makeTank({ dimensions: { length: '40', width: '25', height: '30' } }),
        existingSpecies: [{ species, record: { quantity: 10 } }],
        candidateSpecies: species,
        candidateQuantity: 10,
      });
      return result.status === 'not_recommended'
        && result.blockingRules.some(rule => rule.code === 'bioload_over_limit')
        && result.blockingRules.every(rule => !['territorial_conflict', 'single_housing_required'].includes(rule.code));
    },
  },
  {
    name: 'aggressive temperament keeps the legacy load threshold',
    run: () => {
      const aggressive = makeFish({ size: 'Large', temperament: 'Aggressive' });
      const result = evaluateLegacyTankCompatibility({
        tank: makeTank({ dimensions: { length: '70', width: '40', height: '25' } }),
        existingSpecies: [{ species: aggressive, record: { quantity: 6 } }],
        candidateSpecies: makeFish({ id: 'candidate-small', size: 'Small' }),
        candidateQuantity: 1,
      });
      return result.status === 'not_recommended'
        && result.blockingRules.some(rule => rule.code === 'bioload_over_limit');
    },
  },
  {
    name: 'addition service blocks incompatible species before write',
    run: () => {
      const freshwater = makeFish({ waterType: 'freshwater' });
      const saltwater = makeFish({ id: 'blocked-saltwater', category: '海水观赏鱼', waterType: 'saltwater' });
      const tank = makeTank({ fishes: [{ id: 'existing', fishId: freshwater.id, quantity: 1, entryDate: '2026-01-01' }] });
      const result = executeSpeciesAddition({
        aquariums: [tank],
        aquarium: tank,
        items: [{ fishId: saltwater.id, quantity: 1 }],
        speciesCatalog: [freshwater, saltwater],
      });
      return !result.added
        && result.reason === 'blocked'
        && result.aquariums[0].fishes.length === 1
        && result.aquariums[0].fishes[0]?.fishId === freshwater.id;
    },
  },
  {
    name: 'addition service requires complete information when Catalog facts are unreviewed',
    run: () => {
      const fish = makeFish({ waterTemperature: '24-28°C' });
      const tank = makeTank({ equipment: { filter: '瀑布过滤', heater: false, oxygen: false, light: '普通灯' } });
      const review = reviewSpeciesAdditions({
        aquarium: tank,
        items: [{ fishId: fish.id, quantity: 1 }],
        speciesCatalog: [fish],
      });
      const pending = executeSpeciesAddition({
        aquariums: [tank],
        aquarium: tank,
        items: [{ fishId: fish.id, quantity: 1 }],
        speciesCatalog: [fish],
      });
      const confirmed = executeSpeciesAddition({
        aquariums: [tank],
        aquarium: tank,
        items: [{ fishId: fish.id, quantity: 1 }],
        speciesCatalog: [fish],
        confirmedCaution: true,
      });
      return review?.policy === 'complete_information'
        && pending.reason === 'missing_information'
        && !confirmed.added
        && confirmed.aquariums[0].fishes.length === 0;
    },
  },
  {
    name: 'addition service merges quantity for existing species',
    run: () => {
      const fish = makeFish({ id: 'sp_0431', waterType: 'freshwater' });
      const tank = makeTank({
        dimensions: { length: '120', width: '50', height: '50' },
        fishes: [{ id: 'existing', fishId: fish.id, quantity: 2, entryDate: '2026-01-01', lastWaterChangeDate: '2026-01-01' }],
      });
      const result = executeSpeciesAddition({
        aquariums: [tank],
        aquarium: tank,
        items: [{ fishId: fish.id, quantity: 2 }],
        speciesCatalog: [fish],
        confirmedCaution: true,
      });
      return result.added
        && result.aquariums[0].fishes.length === 1
        && result.aquariums[0].fishes[0].quantity === 4;
    },
  },
];

let failed = 0;
for (const testCase of cases) {
  if (testCase.run()) {
    console.log(`PASS ${testCase.name}`);
  } else {
    failed += 1;
    console.error(`FAIL ${testCase.name}`);
  }
}

if (failed > 0) process.exitCode = 1;
