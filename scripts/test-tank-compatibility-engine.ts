import type { Aquarium, Fish } from '../src/types';
import { fishData } from '../src/data/fishData';
import { evaluateTankCompatibility as evaluateLegacyTankCompatibility } from '../src/lib/tankCompatibilityEngine';
import { getTankCompatibilityAddPolicy } from '../src/services/compatibility/compatibility.service';
import { evaluateCompatibilityDecision } from '../src/modules/knowledge/compatibilityKnowledge';
import { executeSpeciesAddition, reviewSpeciesAdditions } from '../src/services/aquarium/species-addition.service';
import { estimateWaterProfile } from '../src/lib/waterProfileEstimate';
import { getCompatibilityPreviewSpecies } from '../src/services/compatibility/compatibility-preview.service';
import { applyCompatibilityStabilityConfirmation } from '../src/services/compatibility/compatibility-stability.service';
import { getReviewedCompatibilityProfile, getReviewedCompatibilityProfileForFish } from '../src/data/compatibilityEvidence';

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
        && result.metadata.ruleVersion === 'compatibility-domain-v6-tank-requirements-symmetry'
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
        && result.blockingRules.some(rule => rule.code === 'candidate_tank_water_type_conflict')
        && /候选物种水体类型与当前鱼缸不一致/.test(result.summary);
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
    name: 'same species quantity counts toward soft load screening without self conflict',
    run: () => {
      const species = makeFish();
      const result = evaluateLegacyTankCompatibility({
        tank: makeTank({ dimensions: { length: '40', width: '25', height: '30' } }),
        existingSpecies: [{ species, record: { quantity: 10 } }],
        candidateSpecies: species,
        candidateQuantity: 10,
      });
      return result.status !== 'not_recommended'
        && result.blockingRules.every(rule => !['bioload_over_limit', 'bioload_near_limit', 'territorial_conflict', 'single_housing_required'].includes(rule.code))
        && result.warningRules.some(rule => ['bioload_screening_high', 'bioload_screening_elevated', 'bioload_over_limit', 'bioload_near_limit'].includes(rule.code));
    },
  },
  {
    name: 'user-confirmed stable tank context is explicit and non-mutating',
    run: () => {
      const tank = makeTank();
      const confirmed = applyCompatibilityStabilityConfirmation(tank, 'stable');
      const unknown = applyCompatibilityStabilityConfirmation(tank, 'unknown');
      return !tank.stabilityContext
        && unknown === tank
        && confirmed !== tank
        && confirmed?.stabilityContext?.establishedDays === 90
        && confirmed.stabilityContext.stableCoexistenceDays === 60
        && confirmed.stabilityContext.maintenanceConsistent === true
        && confirmed.stabilityContext.recentWaterQualityIncident === false;
    },
  },
  {
    name: 'reviewed Species Knowledge V2 group size overrides legacy profile minimum',
    run: () => {
      const neon = makeFish({
        id: 'sp_0431',
        name: '红绿灯',
        scientificName: 'Paracheirodon innesi',
        tankSize: '至少 32 升',
      });
      const result = evaluateLegacyTankCompatibility({
        tank: makeTank({ dimensions: { length: '80', width: '35', height: '35' } }),
        candidateSpecies: neon,
        candidateQuantity: 5,
      });
      return result.status === 'caution'
        && result.metadata.domainStatus === 'caution'
        && result.stockingGuidance?.recommendedMin === 8
        && result.warningRules.some(rule => rule.code === 'group_requirement_gap' && rule.evidence.includes('8'))
        && result.metadata.domainRuleCodes.includes('minimum_group_not_met');
    },
  },
  {
    name: 'tiger barb under-grouped plan surfaces fin-nipping group pressure without hard block',
    run: () => {
      const tigerBarb = makeFish({
        id: 'sp_0439',
        name: '虎皮鱼',
        scientificName: 'Puntigrus tetrazona',
        tankSize: '至少 72 升',
        size: 'Small',
      });
      const result = evaluateLegacyTankCompatibility({
        tank: makeTank({ dimensions: { length: '100', width: '40', height: '35' } }),
        candidateSpecies: tigerBarb,
        candidateQuantity: 4,
      });
      return result.status === 'caution'
        && result.metadata.domainRuleCodes.includes('fin_nipping_group_pressure')
        && result.metadata.domainRuleCodes.includes('minimum_group_not_met')
        && result.warningRules.some(rule => rule.code === 'fin_nipping_group_pressure')
        && result.blockingRules.every(rule => rule.code !== 'fin_nipping_group_pressure');
    },
  },
  {
    name: 'tiger barb reviewed group size removes fin-nipping group-pressure warning',
    run: () => {
      const tigerBarb = makeFish({
        id: 'sp_0439',
        name: '虎皮鱼',
        scientificName: 'Puntigrus tetrazona',
        tankSize: '至少 72 升',
        size: 'Small',
      });
      const result = evaluateLegacyTankCompatibility({
        tank: makeTank({ dimensions: { length: '100', width: '40', height: '35' } }),
        candidateSpecies: tigerBarb,
        candidateQuantity: 8,
      });
      return result.status !== 'not_recommended'
        && !result.metadata.domainRuleCodes.includes('fin_nipping_group_pressure')
        && result.warningRules.every(rule => rule.code !== 'fin_nipping_group_pressure');
    },
  },
  {
    name: 'tiger barb and guppy direct reviewed pair blocks long-fin fin-nipping mix',
    run: () => {
      const tigerBarb = makeFish({
        id: 'sp_0439',
        name: '虎皮鱼',
        scientificName: 'Puntigrus tetrazona',
        waterTemperature: '20-28°C',
        tankSize: '至少 72 升',
        size: 'Small',
      });
      const guppy = makeFish({
        id: 'sp_0436',
        name: '孔雀鱼',
        scientificName: 'Poecilia reticulata',
        waterTemperature: '18-28°C',
        tankSize: '至少 41 升',
        size: 'Small',
      });
      const result = evaluateCompatibilityDecision({
        tank: makeTank({ dimensions: { length: '100', width: '40', height: '35' }, targetTemperature: '24' }),
        items: [
          { species: tigerBarb, quantity: 8, origin: 'existing' },
          { species: guppy, quantity: 5, origin: 'candidate' },
        ],
      });
      return result.status === 'not_recommended'
        && result.metadata.domainRuleCodes.includes('reviewed_pair_rule')
        && result.blockingRules.some(rule => rule.code === 'pair_rule_fin_nipping_long_fin_conflict')
        && result.blockingRules.some(rule => rule.reviewStatus === 'reviewed' && rule.citations.length >= 2);
    },
  },
  {
    name: 'reviewed territorial fish creates caution for reviewed peaceful platy',
    run: () => {
      const territorial = makeFish({
        id: 'sp_0021', name: '迷你鹦鹉鱼', scientificName: 'Amatitlania nigrofasciata var.',
        temperament: 'Aggressive', size: 'Medium',
      });
      const platy = makeFish({
        id: 'sp_0011', name: '月光鱼', scientificName: 'Xiphophorus maculatus',
        waterTemperature: '20-28°C', phLevel: '7.0-8.5', tankSize: '至少 48 升',
        temperament: 'Peaceful', size: 'Small',
      });
      const result = evaluateCompatibilityDecision({
        tank: makeTank({ targetTemperature: '24', dimensions: { length: '80', width: '40', height: '40' } }),
        items: [{ species: territorial, quantity: 1 }, { species: platy, quantity: 2, origin: 'candidate' }],
      });
      return result.status === 'caution'
        && result.warningRules.some(rule => rule.code === 'territorial_pressure_context')
        && result.blockingRules.every(rule => rule.code !== 'territorial_pressure_context');
    },
  },
  {
    name: 'reviewed platy environment overrides broader legacy catalog temperature',
    run: () => {
      const platy = makeFish({
        id: 'sp_0011',
        name: '月光鱼',
        scientificName: 'Xiphophorus maculatus',
        waterTemperature: '20-28°C',
        phLevel: '7.0-8.5',
        tankSize: '至少 48 升',
        temperament: 'Peaceful',
        size: 'Small',
      });
      const result = evaluateCompatibilityDecision({
        tank: makeTank({ targetTemperature: '27', dimensions: { length: '60', width: '30', height: '30' } }),
        items: [{ species: platy, quantity: 2, origin: 'candidate' }],
      });
      return result.status === 'not_recommended'
        && result.blockingRules.some(rule => rule.code === 'tank_temperature_conflict')
        && result.evidenceIds?.includes('seriouslyfish-xiphophorus-maculatus');
    },
  },
  {
    name: 'reviewed ember-tetra aliases share authority and override legacy temperature plus group context',
    run: () => {
      const ember = fishData.find(item => item.id === 'sp_0114');
      const emberAlias = fishData.find(item => item.id === 'sp_0469');
      if (!ember || !emberAlias) return false;
      const underGrouped = evaluateLegacyTankCompatibility({
        tank: makeTank({ dimensions: { length: '45', width: '30', height: '31' }, targetTemperature: '22' }),
        candidateSpecies: ember,
        candidateQuantity: 4,
      });
      const fullGroup = evaluateLegacyTankCompatibility({
        tank: makeTank({ dimensions: { length: '45', width: '30', height: '31' }, targetTemperature: '22' }),
        candidateSpecies: emberAlias,
        candidateQuantity: 8,
      });
      return underGrouped.warningRules.some(rule => rule.code === 'minimum_group_not_met')
        && underGrouped.blockingRules.every(rule => rule.code !== 'tank_temperature_conflict')
        && fullGroup.warningRules.every(rule => rule.code !== 'minimum_group_not_met')
        && fullGroup.metadata.domainStatus !== 'insufficient_data'
        && fullGroup.evidenceIds?.includes('seriouslyfish-hyphessobrycon-amandae');
    },
  },
  {
    name: 'reviewed cherry-barb authority overrides legacy 40L catalog and enforces six-fish group context',
    run: () => {
      const cherryBarb = fishData.find(item => item.id === 'sp_0012');
      if (!cherryBarb) return false;
      const underGrouped = evaluateLegacyTankCompatibility({
        tank: makeTank({ dimensions: { length: '60', width: '30', height: '28' }, targetTemperature: '22' }),
        candidateSpecies: cherryBarb,
        candidateQuantity: 4,
      });
      const fullGroup = evaluateLegacyTankCompatibility({
        tank: makeTank({ dimensions: { length: '60', width: '30', height: '30' }, targetTemperature: '22' }),
        candidateSpecies: cherryBarb,
        candidateQuantity: 6,
      });
      return underGrouped.warningRules.some(rule => rule.code === 'minimum_group_not_met')
        && underGrouped.warningRules.some(rule => rule.code === 'tank_volume_below_species_minimum')
        && fullGroup.warningRules.every(rule => rule.code !== 'minimum_group_not_met')
        && fullGroup.metadata.domainStatus !== 'insufficient_data'
        && fullGroup.evidenceIds?.includes('seriouslyfish-puntius-titteya');
    },
  },
  {
    name: 'reviewed black-skirt authority replaces stale territorial label and enforces 12-fish group context',
    run: () => {
      const blackSkirt = fishData.find(item => item.id === 'sp_0010');
      if (!blackSkirt) return false;
      const underGrouped = evaluateLegacyTankCompatibility({
        tank: makeTank({ dimensions: { length: '80', width: '30', height: '30' }, targetTemperature: '24' }),
        candidateSpecies: blackSkirt,
        candidateQuantity: 6,
      });
      const fullGroup = evaluateLegacyTankCompatibility({
        tank: makeTank({ dimensions: { length: '80', width: '30', height: '30' }, targetTemperature: '24' }),
        candidateSpecies: blackSkirt,
        candidateQuantity: 12,
      });
      const hotTank = evaluateLegacyTankCompatibility({
        tank: makeTank({ dimensions: { length: '80', width: '30', height: '30' }, targetTemperature: '27' }),
        candidateSpecies: blackSkirt,
        candidateQuantity: 12,
      });
      return underGrouped.warningRules.some(rule => rule.code === 'minimum_group_not_met')
        && fullGroup.warningRules.every(rule => rule.code !== 'minimum_group_not_met')
        && fullGroup.blockingRules.every(rule => rule.code !== 'single_housing_required')
        && hotTank.blockingRules.some(rule => rule.code === 'tank_temperature_conflict')
        && underGrouped.metadata.domainStatus !== 'insufficient_data';
    },
  },
  {
    name: 'reviewed harlequin authority overrides legacy catalog and enforces group plus space context',
    run: () => {
      const harlequin = fishData.find(item => item.id === 'sp_0468');
      if (!harlequin) return false;
      const underGrouped = evaluateLegacyTankCompatibility({
        tank: makeTank({ dimensions: { length: '60', width: '30', height: '28' }, targetTemperature: '22' }),
        candidateSpecies: harlequin,
        candidateQuantity: 4,
      });
      const reviewedGroupWarning = underGrouped.warningRules.some(rule => rule.code === 'minimum_group_not_met');
      const reviewedSpaceWarning = underGrouped.warningRules.some(rule => rule.code === 'tank_volume_below_species_minimum');
      const fullGroup = evaluateLegacyTankCompatibility({
        tank: makeTank({ dimensions: { length: '60', width: '30', height: '30' }, targetTemperature: '22' }),
        candidateSpecies: harlequin,
        candidateQuantity: 8,
      });
      return reviewedGroupWarning
        && reviewedSpaceWarning
        && fullGroup.warningRules.every(rule => rule.code !== 'minimum_group_not_met')
        && fullGroup.metadata.domainStatus !== 'insufficient_data';
    },
  },
  {
    name: 'reviewed molly space authority overrides legacy 48L catalog minimum',
    run: () => {
      const molly = makeFish({
        id: 'sp_0437',
        name: '玛丽鱼',
        scientificName: 'Poecilia sphenops',
        waterTemperature: '22-28°C',
        phLevel: '7.0-8.5',
        tankSize: '至少 48 升',
        temperament: 'Peaceful',
        size: 'Small',
      });
      const result = evaluateCompatibilityDecision({
        tank: makeTank({ targetTemperature: '25', dimensions: { length: '60', width: '34', height: '30' } }),
        items: [{ species: molly, quantity: 1, origin: 'candidate' }],
      });
      return result.status === 'caution'
        && result.warningRules.some(rule => rule.code === 'tank_volume_below_species_minimum')
        && result.warningRules.some(rule => rule.code === 'tank_length_below_species_minimum')
        && result.evidenceIds?.includes('seriouslyfish-poecilia-sphenops');
    },
  },
  {
    name: 'reviewed swordtail space caution is independent of candidate direction',
    run: () => {
      const swordtail = makeFish({
        id: 'sp_0438', name: '红剑鱼', scientificName: 'Xiphophorus hellerii',
        waterTemperature: '20-28°C', phLevel: '7.0-8.5', tankSize: '至少 96 升', temperament: 'Territorial', size: 'Medium',
      });
      const platy = makeFish({
        id: 'sp_0011', name: '月光鱼', scientificName: 'Xiphophorus maculatus',
        waterTemperature: '20-28°C', phLevel: '7.0-8.5', tankSize: '至少 48 升', temperament: 'Peaceful', size: 'Small',
      });
      const tank = makeTank({ targetTemperature: '24', dimensions: { length: '100', width: '34', height: '30' } });
      const forward = evaluateCompatibilityDecision({ tank, items: [{ species: platy, quantity: 2, origin: 'existing' }, { species: swordtail, quantity: 1, origin: 'candidate' }] });
      const reverse = evaluateCompatibilityDecision({ tank, items: [{ species: swordtail, quantity: 1, origin: 'existing' }, { species: platy, quantity: 2, origin: 'candidate' }] });
      return forward.status === 'caution'
        && reverse.status === 'caution'
        && forward.warningRules.some(rule => rule.code === 'tank_length_below_species_minimum')
        && reverse.warningRules.some(rule => rule.code === 'tank_length_below_species_minimum')
        && forward.warningRules.some(rule => rule.code === 'tank_volume_below_species_minimum')
        && reverse.warningRules.some(rule => rule.code === 'tank_volume_below_species_minimum');
    },
  },
  {
    name: 'white cloud reviewed V2 group size overrides legacy five-fish fallback',
    run: () => {
      const whiteCloud = makeFish({
        id: 'sp_0434',
        name: '白云金丝',
        scientificName: 'Tanichthys albonubes',
        waterTemperature: '14-22°C',
        tankSize: '至少 32 升',
      });
      const result = evaluateLegacyTankCompatibility({
        tank: makeTank({ dimensions: { length: '80', width: '35', height: '35' }, targetTemperature: '20' }),
        candidateSpecies: whiteCloud,
        candidateQuantity: 5,
      });
      return result.status === 'caution'
        && result.stockingGuidance?.recommendedMin === 10
        && result.warningRules.some(rule => rule.code === 'group_requirement_gap' && rule.evidence.includes('10'))
        && result.metadata.domainRuleCodes.includes('minimum_group_not_met');
    },
  },
  {
    name: 'zebrafish second cohort has independent reviewed compatibility authority',
    run: () => {
      const zebra = makeFish({
        id: 'sp_0435',
        name: '斑马鱼',
        scientificName: 'Brachydanio rerio',
        waterTemperature: '18-25°C',
        tankSize: '至少 40 升',
      });
      const result = evaluateLegacyTankCompatibility({
        tank: makeTank({ dimensions: { length: '100', width: '40', height: '30' }, targetTemperature: '22' }),
        candidateSpecies: zebra,
        candidateQuantity: 8,
      });
      return result.status === 'compatible'
        && result.metadata.decisionReadiness === 'reviewed'
        && result.stockingGuidance?.recommendedMin === 8
        && result.missingData.every(rule => rule.code !== 'species_evidence_unreviewed');
    },
  },
  {
    name: 'mini parrot ornamental variant inherits reviewed territorial authority',
    run: () => {
      const variant = makeFish({
        id: 'sp_0147',
        name: '蓝宝鹦鹉鱼',
        scientificName: 'Amatitlania nigrofasciata var. Blue',
        temperament: 'Aggressive',
      });
      const reviewed = getReviewedCompatibilityProfileForFish(variant);
      return reviewed?.speciesId === 'base:Amatitlania nigrofasciata'
        && reviewed.behaviorTraits.includes('territorial')
        && reviewed.behaviorTraits.includes('breeding_defense');
    },
  },
  {
    name: 'Channa albino variant inherits reviewed predator and solitary authority',
    run: () => {
      const variant = makeFish({
        id: 'sp_0223',
        name: '红眼白子雷龙',
        scientificName: 'Channa asiatica var. Albino',
        temperament: 'Aggressive',
        size: 'Large',
      });
      const reviewed = getReviewedCompatibilityProfileForFish(variant);
      if (reviewed?.speciesId !== 'base:Channa asiatica' || !reviewed.behaviorTraits.includes('predatory') || !reviewed.behaviorTraits.includes('solitary_required')) return false;
      const result = evaluateCompatibilityDecision({
        tank: makeTank({ dimensions: { length: '120', width: '50', height: '50' } }),
        items: [
          { species: variant, quantity: 1 },
          { species: makeFish({ id: 'small-reviewed-target', size: 'Small' }), quantity: 1 },
        ],
      });
      return result.status === 'not_recommended'
        && result.blockingRules.some(rule => rule.code === 'predation_risk');
    },
  },
  {
    name: 'betta ornamental variant inherits reviewed base-species authority without faking direct audit',
    run: () => {
      const halfmoon = makeFish({
        id: 'sp_0259',
        name: '半月斗鱼 (蓝蝴蝶)',
        scientificName: 'Betta splendens var. Halfmoon',
        waterTemperature: '24-30°C',
        tankSize: '至少 56 升',
        temperament: 'Aggressive',
        housingMode: '建议单养',
      });
      const neon = makeFish({
        id: 'sp_0431',
        name: '红绿灯',
        scientificName: 'Paracheirodon innesi',
        waterTemperature: '20-26°C',
        tankSize: '至少 54 升',
      });
      const directAudit = getReviewedCompatibilityProfile(halfmoon.id);
      const inherited = getReviewedCompatibilityProfileForFish(halfmoon);
      const result = evaluateCompatibilityDecision({
        tank: makeTank({ dimensions: { length: '80', width: '40', height: '35' }, targetTemperature: '25' }),
        items: [
          { species: neon, quantity: 8, origin: 'existing' },
          { species: halfmoon, quantity: 1, origin: 'candidate' },
        ],
      });
      return !directAudit
        && inherited?.speciesId === 'base:Betta splendens'
        && inherited.reviewStatus === 'reviewed'
        && result.status === 'not_recommended'
        && result.metadata.domainRuleCodes.includes('single_housing_required')
        && result.missingData.every(rule => rule.code !== 'species_evidence_unreviewed');
    },
  },
  {
    name: 'angelfish reviewed target vulnerability creates fin-nipping caution without stale single-housing block',
    run: () => {
      const tigerBarb = makeFish({
        id: 'sp_0439',
        name: '虎皮鱼',
        scientificName: 'Puntigrus tetrazona',
        waterTemperature: '20-28°C',
        tankSize: '至少 72 升',
        size: 'Small',
      });
      const angelfish = makeFish({
        id: 'sp_0446',
        name: '天使鱼（神仙鱼）',
        scientificName: 'Pterophyllum scalare',
        waterTemperature: '24-30°C',
        tankSize: '至少 120 升',
        size: 'Medium',
        temperament: 'Territorial',
        housingMode: '建议单养',
      });
      const result = evaluateCompatibilityDecision({
        tank: makeTank({ dimensions: { length: '100', width: '50', height: '50' }, targetTemperature: '25' }),
        items: [
          { species: tigerBarb, quantity: 8, origin: 'existing' },
          { species: angelfish, quantity: 1, origin: 'candidate' },
        ],
      });
      return result.status === 'caution'
        && result.metadata.domainRuleCodes.includes('fin_nipping_target_vulnerability')
        && result.blockingRules.every(rule => rule.code !== 'single_housing_required')
        && result.blockingRules.every(rule => rule.code !== 'predation_risk')
        && result.warningRules.some(rule => rule.code === 'fin_nipping_target_vulnerability');
    },
  },
  {
    name: 'reviewed corydoras share bottom-zone context without automatic incompatibility',
    run: () => {
      const bronze = makeFish({ id: 'sp_0014', name: '咖啡鼠', scientificName: 'Corydoras aeneus', waterTemperature: '21-27°C', tankSize: '至少 72 升' });
      const panda = makeFish({ id: 'sp_0443', name: '熊猫鼠', scientificName: 'Corydoras panda', waterTemperature: '22-25°C', tankSize: '至少 41 升' });
      const result = evaluateLegacyTankCompatibility({
        tank: makeTank({ dimensions: { length: '100', width: '40', height: '35' }, targetTemperature: '24' }),
        existingSpecies: [{ species: bronze, record: { quantity: 6 } }],
        candidateSpecies: panda,
        candidateQuantity: 6,
      });
      return result.status !== 'not_recommended'
        && result.metadata.domainRuleCodes.includes('shared_bottom_zone_context')
        && result.passedRules.some(rule => rule.code === 'shared_bottom_zone_context')
        && result.stockingGuidance?.recommendedMin === 6;
    },
  },
  {
    name: 'mini parrot juvenile record is allowed without inventing a safe maximum',
    run: () => {
      const miniParrot = makeFish({
        id: 'sp_0021',
        name: '迷你鹦鹉鱼',
        size: 'Medium',
        tankSize: '至少 64 升',
        temperament: 'Aggressive',
      });
      const result = evaluateLegacyTankCompatibility({
        tank: makeTank({ dimensions: { length: '100', width: '40', height: '30' } }),
        candidateSpecies: miniParrot,
        candidateQuantity: 4,
        candidateContext: { lifeStage: 'juvenile', reproductiveState: 'normal', averageLengthCm: 2.5 },
        intent: 'record_existing',
      });
      return result.status === 'compatible'
        && result.metadata.domainStatus === 'compatible'
        && result.metadata.decisionReadiness === 'reviewed'
        && result.stockingGuidance?.kind === 'screening_only'
        && result.stockingGuidance.recommendedMax === null;
    },
  },
  {
    name: 'aggressive temperament does not turn coarse load screening into a hard block',
    run: () => {
      const aggressive = makeFish({ size: 'Large', temperament: 'Aggressive' });
      const result = evaluateLegacyTankCompatibility({
        tank: makeTank({ dimensions: { length: '70', width: '40', height: '25' } }),
        existingSpecies: [{ species: aggressive, record: { quantity: 6 } }],
        candidateSpecies: makeFish({ id: 'candidate-small', size: 'Small' }),
        candidateQuantity: 1,
      });
      return result.status !== 'not_recommended'
        && result.blockingRules.every(rule => !['bioload_over_limit', 'bioload_near_limit'].includes(rule.code))
        && result.warningRules.some(rule => ['bioload_screening_high', 'bioload_screening_elevated', 'bioload_over_limit', 'bioload_near_limit'].includes(rule.code));
    },
  },
  {
    name: 'temperament never changes coarse load screening for the same body size and quantity',
    run: () => {
      const tank = makeTank({ dimensions: { length: '70', width: '40', height: '25' } });
      const calm = makeFish({ id: 'sp_0436', name: '孔雀鱼', scientificName: 'Poecilia reticulata', size: 'Medium', temperament: 'Peaceful' });
      const aggressive = { ...calm, temperament: 'Aggressive' as const };
      const evaluate = (species: Fish) => evaluateLegacyTankCompatibility({
        tank,
        existingSpecies: [{ species, record: { quantity: 9 } }],
        candidateSpecies: species,
        candidateQuantity: 1,
      });
      const loadCodes = (result: ReturnType<typeof evaluateLegacyTankCompatibility>) => [
        ...result.blockingRules,
        ...result.warningRules,
      ].map(rule => rule.code).filter(code => /bioload|density/.test(code)).sort();
      return JSON.stringify(loadCodes(evaluate(calm))) === JSON.stringify(loadCodes(evaluate(aggressive)));
    },
  },
  {
    name: 'species fit no longer invents density risk from raw livestock count',
    run: () => {
      const tiny = makeFish({ id: 'sp_0431', name: '红绿灯', scientificName: 'Paracheirodon innesi', size: 'Small' });
      const result = evaluateLegacyTankCompatibility({
        tank: makeTank({ dimensions: { length: '120', width: '50', height: '50' } }),
        existingSpecies: [{ species: tiny, record: { quantity: 40 } }],
        candidateSpecies: tiny,
        candidateQuantity: 1,
      });
      return [...result.warningRules, ...result.blockingRules].every(rule => rule.code !== 'density_high');
    },
  },
  {
    name: 'reviewed guppy adult-to-fry stage risk survives canonicalization',
    run: () => {
      const guppy = fishData.find(item => item.id === 'sp_0436');
      if (!guppy) return false;
      const result = evaluateLegacyTankCompatibility({
        scope: 'species_only',
        existingSpecies: [{
          species: guppy,
          record: {
            quantity: 1,
            batches: [{
              id: 'guppy-adult-stage-risk', quantity: 1, entryDate: '2026-01-01',
              lifeStage: 'adult', reproductiveState: 'unknown', stateUpdatedAt: '2026-01-01T00:00:00.000Z',
            }],
          },
        }],
        candidateSpecies: guppy,
        candidateLifeStage: 'fry',
      });
      return result.status === 'not_recommended'
        && result.blockingRules.some(rule => rule.code === 'conspecific_fry_predation' && rule.reviewStatus === 'reviewed');
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
