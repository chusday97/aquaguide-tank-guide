import type { Aquarium, Fish } from '../types';
import { getLifeType, getSpeciesWaterType } from '../modules/species/species.service';
import { isAquaticPlantSpecies, isHardscapeSpecies } from './speciesClassification';
import { estimateWaterProfile } from './waterProfileEstimate';

export type SpeciesFitStatus = 'suitable' | 'adjustable' | 'unsuitable' | 'unknown';

export type SpeciesFitItem = {
  type: string;
  title: string;
  detail: string;
  severity?: 'low' | 'medium' | 'high';
};

export type SpeciesFitEvaluation = {
  speciesId: string;
  status: SpeciesFitStatus;
  score: number;
  hardBlocks: SpeciesFitItem[];
  warnings: SpeciesFitItem[];
  confirmations: SpeciesFitItem[];
  matchedItems: SpeciesFitItem[];
  reasonSummary: string;
};

type AquariumWaterType = 'freshwater' | 'saltwater' | 'unknown';

const textOf = (species: Fish) => [
  species.name,
  species.scientificName,
  species.category,
  species.description,
  species.diet,
  species.housingMode,
  species.housingReason,
  species.feedingProfile?.specialNotes,
].filter(Boolean).join(' ');

const identityTextOf = (species: Fish) => [
  species.name,
  species.scientificName,
  species.category,
  species.description,
  species.housingMode,
  species.housingReason,
  species.feedingProfile?.specialNotes,
].filter(Boolean).join(' ');

const parseRange = (value?: string) => {
  const matches = value?.match(/(\d+(?:\.\d+)?)/g);
  if (!matches || matches.length === 0) return null;
  const values = matches.map(Number).filter(Number.isFinite);
  if (values.length === 0) return null;
  return { min: Math.min(...values), max: Math.max(...values) };
};

export const getAquariumVolumeLiters = (aquarium?: Aquarium | null) => {
  if (!aquarium?.dimensions) return null;
  const length = Number(aquarium.dimensions.length);
  const width = Number(aquarium.dimensions.width);
  const height = Number(aquarium.dimensions.height);
  if (!Number.isFinite(length) || !Number.isFinite(width) || !Number.isFinite(height) || length <= 0 || width <= 0 || height <= 0) return null;
  return Math.round((length * width * height * 0.85) / 1000);
};

const getAquariumLengthCm = (aquarium?: Aquarium | null) => {
  const length = Number(aquarium?.dimensions?.length);
  return Number.isFinite(length) && length > 0 ? length : null;
};

const getSpeciesMinVolumeLiters = (species: Fish) => {
  const range = parseRange(species.tankSize);
  return range?.min ?? null;
};

const getSpeciesMinLengthCm = (species: Fish) => {
  const explicit = (species as Fish & { minLengthCm?: unknown }).minLengthCm;
  if (typeof explicit === 'number' && Number.isFinite(explicit)) return explicit;
  const text = `${species.tankSize} ${textOf(species)}`;
  const match = text.match(/(\d+(?:\.\d+)?)\s*(?:cm|厘米|公分)/i);
  return match ? Number(match[1]) : null;
};

const getAquariumWaterType = (aquarium: Aquarium): AquariumWaterType => {
  if (aquarium.waterType === 'Saltwater') return 'saltwater';
  if (aquarium.waterType === 'Freshwater') return 'freshwater';
  return 'unknown';
};

const isSpecialTankSpecies = (species: Fish) => {
  const text = textOf(species);
  if (/水母|jellyfish|Aurelia|Chrysaora|Phyllorhiza|Cassiopea|Cotylorhiza|Sanderia/i.test(text)) return 'jellyfish';
  if (/珊瑚|coral|SPS|LPS|Zoanthus|Acropora|Euphyllia|Tubastraea/i.test(text)) return 'coral';
  if (/海葵|anemone|Entacmaea|Stichodactyla|Heteractis/i.test(text)) return 'anemone';
  return null;
};

const isAnimalSpecies = (species: Fish) => {
  const lifeType = getLifeType(species);
  return lifeType !== 'plant' && lifeType !== 'hardscape' && !isAquaticPlantSpecies(species) && !isHardscapeSpecies(species);
};

export const getCurrentLivestockForAquarium = (aquarium: Aquarium | null | undefined, allSpecies: Fish[]) => (
  (aquarium?.fishes || [])
    .map(item => ({ record: item, species: allSpecies.find(species => species.id === item.fishId) }))
    .filter((item): item is { record: Aquarium['fishes'][number]; species: Fish } => Boolean(item.species) && isAnimalSpecies(item.species))
);

const hasEquipment = (aquarium: Aquarium | null | undefined, keyword: string) => {
  const equipment = aquarium?.equipment;
  if (!equipment) return false;
  const text = `${equipment.filter || ''} ${equipment.heater ? '加热棒 heater' : ''} ${equipment.oxygen ? '氧气 oxygen' : ''} ${equipment.light || ''}`;
  return text.toLowerCase().includes(keyword.toLowerCase());
};

const getCompatibilityRisk = (species: Fish, currentLivestock: Array<{ species?: Fish; record?: { quantity?: number } }>): SpeciesFitItem | null => {
  const validLivestock = currentLivestock.filter((item): item is { species: Fish; record?: { quantity?: number } } => (
    Boolean(item?.species?.id) && item.species?.id !== species.id
  ));
  if (validLivestock.length === 0) return null;
  const speciesText = textOf(species);
  const selectedIsSmall = species.size === 'Small';
  const selectedIsLongFin = /长鳍|蝶尾|神仙|斗鱼|孔雀/i.test(speciesText);
  const predator = validLivestock.find(item => {
    const predatorIdentity = `${item.species.name} ${item.species.category}`;
    return item.species.temperament === 'Aggressive'
      || item.species.size === 'Large'
      || /掠食鱼|肉食鱼|龙鱼|雷龙|地图(?:鱼)?|雀鳝|魟|鳗/i.test(predatorIdentity);
  });
  if (predator && selectedIsSmall) {
    return {
      type: 'predation_risk',
      title: '存在捕食或吞食风险',
      detail: `当前鱼缸已有 ${predator.species.name}，不建议再加入体型明显更小的 ${species.name}。`,
      severity: 'high',
    };
  }

  const nipper = validLivestock.find(item => /虎皮|黑裙|红十字|彩裙|玫瑰鲫|啄鳍|追咬/i.test(textOf(item.species)));
  if (nipper && selectedIsLongFin) {
    return {
      type: 'fin_nipping_risk',
      title: '长鳍被啄咬风险',
      detail: `当前鱼缸已有 ${nipper.species.name}，长鳍或慢游鱼可能被追咬。`,
      severity: 'medium',
    };
  }

  const territorial = validLivestock.find(item => item.species?.temperament === 'Territorial' || item.species?.housingMode === '建议单养');
  if (territorial && (species.temperament === 'Territorial' || species.housingMode === '建议单养')) {
    return {
      type: 'territorial_conflict',
      title: '领地冲突风险',
      detail: `当前已有 ${territorial.species.name}，不建议再加入强领地或建议单养物种。`,
      severity: 'high',
    };
  }

  return null;
};

export const evaluateSpeciesForAquarium = (
  species: Fish,
  aquarium: Aquarium | null | undefined,
  currentLivestock: Array<{ species: Fish; record?: { quantity?: number } }> = [],
): SpeciesFitEvaluation => {
  const hardBlocks: SpeciesFitItem[] = [];
  const warnings: SpeciesFitItem[] = [];
  const confirmations: SpeciesFitItem[] = [];
  const matchedItems: SpeciesFitItem[] = [];
  let score = 40;
  const otherLivestock = currentLivestock.filter(item => item.species?.id !== species.id);

  if (!aquarium) {
    return {
      speciesId: species.id,
      status: 'unknown',
      score: 0,
      hardBlocks: [],
      warnings: [],
      confirmations: [{ type: 'missing_aquarium', title: '缺少当前鱼缸', detail: '请先选择一个鱼缸，再判断适配。' }],
      matchedItems: [],
      reasonSummary: '缺少当前鱼缸，无法判断。',
    };
  }

  const speciesWaterType = getSpeciesWaterType(species);
  const aquariumWaterType = getAquariumWaterType(aquarium);
  const specialTankType = isSpecialTankSpecies(species);
  const lifeType = getLifeType(species);
  const missingCoreSpeciesData = !species.category || !species.waterTemperature || !species.tankSize;

  if (aquariumWaterType === 'unknown') {
    confirmations.push({ type: 'unknown_aquarium_water_type', title: '需要确认鱼缸水体类型', detail: '当前鱼缸未设置淡水或海水类型，不应默认按淡水判断。' });
  } else if (speciesWaterType === 'unknown') {
    confirmations.push({ type: 'unknown_water_type', title: '物种水体资料不足', detail: '该物种缺少可靠水体类型，不应默认判断为适合。' });
  } else if (aquariumWaterType === 'freshwater' && speciesWaterType !== 'freshwater') {
    hardBlocks.push({ type: 'water_type_mismatch', title: '水体类型不匹配', detail: '当前是淡水鱼缸，不能推荐海水、汽水、珊瑚、水母或海葵等特殊水体生物。', severity: 'high' });
  } else if (aquariumWaterType === 'saltwater' && speciesWaterType !== 'saltwater') {
    hardBlocks.push({ type: 'water_type_mismatch', title: '水体类型不匹配', detail: '当前是海水鱼缸，只能匹配明确海水物种；普通淡水或汽水物种需要独立规划。', severity: 'high' });
  } else {
    matchedItems.push({ type: 'water_type', title: '水体类型匹配', detail: aquariumWaterType === 'saltwater' ? '当前为海水鱼缸。' : '当前为淡水鱼缸。' });
    score += 24;
  }

  if (specialTankType === 'jellyfish') {
    hardBlocks.push({ type: 'special_tank_required', title: '需要水母专用缸', detail: '水母需要圆形缸体和柔和循环水流，普通鱼缸不应推荐。', severity: 'high' });
  } else if ((specialTankType === 'coral' || specialTankType === 'anemone') && aquariumWaterType === 'freshwater') {
    hardBlocks.push({ type: 'special_tank_required', title: '需要海水特殊缸体', detail: '珊瑚和海葵需要稳定盐度、光照和水流条件。', severity: 'high' });
  } else if ((specialTankType === 'coral' || specialTankType === 'anemone') && aquarium.equipment?.light !== '海水灯') {
    warnings.push({ type: 'special_light_required', title: '需要确认海水灯光', detail: '珊瑚或海葵通常需要海水灯和稳定水流，当前设备未完整确认。', severity: 'medium' });
    score -= 18;
  }

  const volumeLiters = getAquariumVolumeLiters(aquarium);
  const minVolume = getSpeciesMinVolumeLiters(species);
  if (!volumeLiters || !minVolume) {
    confirmations.push({ type: 'missing_volume', title: '需要确认水体容量', detail: '当前鱼缸或物种缺少可靠容量数据。' });
    score -= 8;
  } else if (volumeLiters < minVolume * 0.8) {
    hardBlocks.push({ type: 'volume_too_small', title: '水体严重不足', detail: `当前约 ${volumeLiters}L，低于该物种最低 ${minVolume}L 要求。`, severity: 'high' });
  } else if (volumeLiters < minVolume) {
    warnings.push({ type: 'volume_needs_adjustment', title: '水体略小', detail: `当前约 ${volumeLiters}L，建议至少 ${minVolume}L。`, severity: 'medium' });
    score -= 16;
  } else {
    matchedItems.push({ type: 'volume', title: '水体容量匹配', detail: `当前约 ${volumeLiters}L，满足最低 ${minVolume}L。` });
    score += 16;
  }

  const aquariumLength = getAquariumLengthCm(aquarium);
  const minLength = getSpeciesMinLengthCm(species);
  if (minLength && (!aquariumLength || aquariumLength < minLength)) {
    warnings.push({ type: 'length_too_short', title: '鱼缸长度不足', detail: `该物种建议至少 ${minLength}cm 缸长，当前缸长未满足。`, severity: 'medium' });
    score -= 12;
  } else if (minLength && aquariumLength) {
    matchedItems.push({ type: 'length', title: '鱼缸长度匹配', detail: `当前缸长约 ${aquariumLength}cm。` });
    score += 6;
  }

  const tempRange = parseRange(species.waterTemperature);
  const currentTemp = aquarium.targetTemperature ? Number(aquarium.targetTemperature) : null;
  if (!tempRange || !currentTemp || !Number.isFinite(currentTemp)) {
    confirmations.push({ type: 'missing_temperature', title: '需要确认温度', detail: '当前鱼缸或物种缺少可靠温度数据。' });
    score -= 8;
  } else if (currentTemp < tempRange.min || currentTemp > tempRange.max) {
    const delta = currentTemp < tempRange.min ? tempRange.min - currentTemp : currentTemp - tempRange.max;
    if (delta <= 1) {
      warnings.push({ type: 'temperature_adjustable', title: '温度轻微偏差', detail: `当前 ${currentTemp}℃，需求 ${species.waterTemperature}。`, severity: 'low' });
      score -= 8;
    } else {
      hardBlocks.push({ type: 'temperature_mismatch', title: '温度明显不匹配', detail: `当前 ${currentTemp}℃，需求 ${species.waterTemperature}。`, severity: 'high' });
    }
  } else {
    matchedItems.push({ type: 'temperature', title: '温度匹配', detail: `当前 ${currentTemp}℃，需求 ${species.waterTemperature}。` });
    score += 14;
  }

  const phRange = parseRange(species.phLevel);
  const identityText = identityTextOf(species);
  const phSensitive = Boolean(phRange && (phRange.max - phRange.min <= 1.5 || species.difficulty === 'Hard' || /水晶虾|苏虾|虾|短鲷|七彩|珊瑚|海葵|水母/i.test(identityText)));
  if (phSensitive && species.phLevel && phRange) {
    const waterProfile = estimateWaterProfile(aquarium);
    confirmations.push({
      type: 'missing_ph',
      title: '敏感物种建议实测水质',
      detail: `环境线索仅显示“${waterProfile.tendency === 'acidic' ? '可能偏酸' : waterProfile.tendency === 'alkaline' ? '可能偏碱' : waterProfile.tendency === 'marine' ? '海水环境' : '倾向不明确'}”，不能代替 pH 实测；该物种参考范围为 ${species.phLevel}。`,
      severity: 'low',
    });
    score -= 2;
  }
  if (/虾|螺|珊瑚|海葵|水母|苏拉威西|水晶/i.test(identityText)) {
    confirmations.push({ type: 'missing_hardness', title: '敏感物种建议实测硬度', detail: '该物种对硬度或矿物质更敏感；可用试纸或滴定测试确认，不要求在鱼缸资料中长期填写。', severity: 'low' });
    score -= 2;
  }

  if (!aquarium.equipment?.filter || aquarium.equipment.filter === '无') {
    confirmations.push({ type: 'missing_filter', title: '需要确认过滤', detail: '当前未确认稳定过滤设备。' });
    score -= 8;
  } else {
    matchedItems.push({ type: 'filter', title: '过滤已配置', detail: `当前过滤：${aquarium.equipment.filter}。` });
    score += 7;
  }
  const needsHeater = tempRange ? tempRange.min >= 20 : false;
  if (needsHeater && aquarium.equipment?.heater === false) {
    warnings.push({ type: 'heater_needed', title: '需要加热设备', detail: '该物种需要较稳定的热带水温，建议配置加热棒。', severity: 'medium' });
    score -= 12;
  } else if (needsHeater && aquarium.equipment?.heater === undefined) {
    confirmations.push({ type: 'missing_heater', title: '需要确认加热', detail: '当前未确认是否有加热设备。' });
    score -= 5;
  }
  if (/高氧|强氧|溪流|吸鳅|虾虎/i.test(textOf(species)) && !aquarium.equipment?.oxygen) {
    warnings.push({ type: 'oxygen_needed', title: '可能需要增氧', detail: '该物种可能更适合高溶氧环境，建议确认打氧或水流。', severity: 'low' });
    score -= 7;
  }
  if (/CO2|强光|水草泥/i.test(textOf(species)) && lifeType === 'plant' && !hasEquipment(aquarium, '水草灯')) {
    warnings.push({ type: 'plant_equipment_needed', title: '水草设备需确认', detail: '该水草可能需要较强光照或 CO2，当前设备未完全确认。', severity: 'low' });
    score -= 7;
  }

  const compatibilityRisk = getCompatibilityRisk(species, otherLivestock);
  if (compatibilityRisk?.severity === 'high') {
    hardBlocks.push(compatibilityRisk);
  } else if (compatibilityRisk) {
    warnings.push(compatibilityRisk);
    score -= 18;
  } else if (otherLivestock.length === 0) {
    matchedItems.push({ type: 'empty_tank', title: '暂无混养冲突', detail: '当前鱼缸没有活体生物，不触发混养冲突。' });
    score += 8;
  } else {
    matchedItems.push({ type: 'compatibility', title: '未发现明确混养冲突', detail: '已有活体中未发现明确捕食、吞食或强领地冲突。' });
    score += 8;
  }

  const livestockCount = currentLivestock.reduce((sum, item) => sum + (item.record?.quantity || 1), 0);
  if (volumeLiters && livestockCount > 0 && livestockCount >= Math.max(20, volumeLiters / 3)) {
    warnings.push({ type: 'density_high', title: '当前密度偏高', detail: `当前已有约 ${livestockCount} 只/条活体，新增前建议先复核密度。`, severity: 'medium' });
    score -= 14;
  }

  if (species.difficulty === 'Easy') score += 8;
  if (species.difficulty === 'Hard') {
    warnings.push({ type: 'hard_species', title: '养护难度较高', detail: '该物种对经验和稳定性要求更高。', severity: 'low' });
    score -= 10;
  }
  if (species.temperament === 'Peaceful') score += 5;
  if (species.housingMode === '建议单养' && otherLivestock.length > 0) {
    warnings.push({ type: 'single_housing', title: '更适合单养', detail: '该物种更适合单独规划缸位。', severity: 'medium' });
    score -= 15;
  }

  const status: SpeciesFitStatus = hardBlocks.length > 0
    ? 'unsuitable'
    : matchedItems.length === 0 || aquariumWaterType === 'unknown' || speciesWaterType === 'unknown' || missingCoreSpeciesData
      ? 'unknown'
      : warnings.length > 0 || confirmations.length > 0
        ? 'adjustable'
        : 'suitable';

  const reasonSummary = status === 'suitable'
    ? '已通过水质、温度、空间、设备和混养基础条件筛选。'
    : status === 'adjustable'
      ? [...warnings, ...confirmations][0]?.detail || '基础条件接近匹配，但需要补充确认。'
      : status === 'unsuitable'
        ? hardBlocks[0]?.detail || '存在硬性不匹配。'
        : confirmations[0]?.detail || '信息不足，无法可靠判断。';

  return {
    speciesId: species.id,
    status,
    score: Math.max(0, Math.min(100, Math.round(score))),
    hardBlocks,
    warnings,
    confirmations,
    matchedItems,
    reasonSummary,
  };
};

export const getSuitableSpeciesForCurrentTank = (
  currentAquarium: Aquarium | null | undefined,
  allSpecies: Fish[],
  currentLivestock: Array<{ species: Fish; record?: { quantity?: number } }> = getCurrentLivestockForAquarium(currentAquarium, allSpecies),
) => (
  allSpecies
    .map(species => ({
      species,
      evaluation: evaluateSpeciesForAquarium(species, currentAquarium, currentLivestock),
    }))
    .filter(item => item.evaluation.status === 'suitable')
    .sort((a, b) => b.evaluation.score - a.species.name.localeCompare ? 0 : 0)
);
