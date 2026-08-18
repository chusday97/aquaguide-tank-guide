import type {
  DecisionReason,
  EnvironmentDecision,
  EnvironmentFitResult,
  EquipmentRequirement,
  FitStatus,
  PlantEnvironmentProfile,
  PlantMatchResult,
  Range,
  SpeciesEnvironmentProfile,
  TankContext,
} from './environment.types';

const rangesOverlap = (left?: Range, right?: Range) => {
  if (!left || !right) return undefined;
  return Math.max(left.min, right.min) <= Math.min(left.max, right.max);
};

const inRange = (value: number, range: Range) => value >= range.min && value <= range.max;

const statusFromReasons = (reasons: DecisionReason[]): FitStatus => {
  if (reasons.some(reason => reason.severity === 'high')) return 'not_recommended';
  if (reasons.some(reason => reason.code.startsWith('missing_') || reason.code.endsWith('_unknown'))) return 'unknown';
  if (reasons.some(reason => reason.severity === 'medium')) return 'caution';
  return 'compatible';
};

export const evaluateEnvironmentFit = (
  profile: SpeciesEnvironmentProfile,
  tank: TankContext,
): EnvironmentFitResult => {
  const reasons: DecisionReason[] = [];
  const requiredWaterType = profile.environment.waterType;

  if (requiredWaterType && requiredWaterType !== 'unknown') {
    if (!tank.water.type) {
      reasons.push({ code: 'missing_water_type', message: '当前鱼缸缺少水体类型，无法确认环境匹配。', severity: 'medium' });
    } else if (requiredWaterType !== tank.water.type) {
      reasons.push({ code: 'water_type_mismatch', message: `物种需要 ${requiredWaterType} 环境，当前鱼缸为 ${tank.water.type}。`, severity: 'high' });
    } else {
      reasons.push({ code: 'water_type_match', message: '水体类型匹配。', severity: 'info' });
    }
  }

  const temperature = profile.environment.temperature;
  if (temperature) {
    const current = tank.water.targetTemperature;
    if (current === undefined) {
      reasons.push({ code: 'missing_target_temperature', message: '缺少当前目标水温，无法确认温度是否落在物种适温范围内。', severity: 'medium' });
    } else if (!inRange(current, temperature)) {
      reasons.push({ code: 'temperature_mismatch', message: `当前目标水温 ${current}℃ 不在 ${temperature.min}-${temperature.max}℃ 的适温范围内。`, severity: 'high' });
    } else {
      reasons.push({ code: 'temperature_match', message: `当前目标水温 ${current}℃ 落在适温范围内。`, severity: 'info' });
    }
  }

  const ph = profile.environment.ph;
  if (ph && tank.water.ph !== undefined) {
    reasons.push(inRange(tank.water.ph, ph)
      ? { code: 'ph_match', message: `当前 pH ${tank.water.ph} 落在物种参考范围内。`, severity: 'info' }
      : { code: 'ph_mismatch', message: `当前 pH ${tank.water.ph} 不在 ${ph.min}-${ph.max} 的参考范围内。`, severity: 'medium' });
  }

  const minimumVolume = profile.environment.minimumVolumeLiters;
  if (minimumVolume) {
    if (!tank.water.volumeLiters) {
      reasons.push({ code: 'missing_volume', message: '缺少可计算的鱼缸容量，无法确认最低空间要求。', severity: 'medium' });
    } else if (tank.water.volumeLiters < minimumVolume) {
      reasons.push({ code: 'volume_too_small', message: `当前约 ${tank.water.volumeLiters}L，低于最低 ${minimumVolume}L。`, severity: 'high' });
    } else {
      reasons.push({ code: 'volume_match', message: `当前约 ${tank.water.volumeLiters}L，满足最低 ${minimumVolume}L。`, severity: 'info' });
    }
  }

  return { status: statusFromReasons(reasons), reasons };
};

export const evaluatePlantMatch = (
  animal: SpeciesEnvironmentProfile,
  plant: PlantEnvironmentProfile,
  tank?: TankContext,
): PlantMatchResult => {
  const reasons: DecisionReason[] = [];
  const benefits: DecisionReason[] = [];

  if (
    animal.environment.waterType
    && plant.environment.waterType
    && animal.environment.waterType !== 'unknown'
    && plant.environment.waterType !== 'unknown'
    && animal.environment.waterType !== plant.environment.waterType
  ) {
    reasons.push({ code: 'plant_water_type_conflict', message: '动物与水草要求的水体类型不同。', severity: 'high' });
  }

  const temperatureOverlap = rangesOverlap(animal.environment.temperature, plant.environment.temperature);
  if (temperatureOverlap === false) {
    reasons.push({ code: 'plant_temperature_conflict', message: '动物与水草的适温区间没有交集。', severity: 'high' });
  } else if (temperatureOverlap === true) {
    reasons.push({ code: 'plant_temperature_overlap', message: '动物与水草存在共同适温区间。', severity: 'info' });
  } else {
    reasons.push({ code: 'plant_temperature_unknown', message: '动物或水草缺少结构化温度范围，暂不能确认共同温度窗口。', severity: 'low' });
  }

  const phOverlap = rangesOverlap(animal.environment.ph, plant.environment.ph);
  if (phOverlap === false) {
    reasons.push({ code: 'plant_ph_conflict', message: '动物与水草的 pH 参考区间没有交集。', severity: 'medium' });
  } else if (phOverlap === true) {
    reasons.push({ code: 'plant_ph_overlap', message: '动物与水草存在共同 pH 区间。', severity: 'info' });
  }

  if (animal.habitat?.plantEatingRisk === 'high') {
    if (plant.planting.leafDurability === 'delicate') {
      reasons.push({ code: 'plant_eating_delicate', message: '该动物有较高植物啃食风险，而候选水草叶片较脆弱。', severity: 'high' });
    } else if (plant.planting.leafDurability === 'medium' || plant.planting.leafDurability === 'tough') {
      reasons.push({ code: 'plant_eating_risk', message: '该动物有较高植物啃食风险，即使叶片较耐受也需要观察。', severity: 'medium' });
    } else {
      reasons.push({ code: 'plant_leaf_durability_unknown', message: '已知存在植物啃食风险，但缺少候选水草叶片耐受资料。', severity: 'medium' });
    }
  }

  if (animal.habitat?.uprootingRisk === 'high' && plant.planting.type === 'rooted') {
    reasons.push({ code: 'plant_uprooting_risk', message: '该动物有较高翻动或拔起水草风险，根植型水草需要额外保护。', severity: 'medium' });
  }

  if (animal.habitat?.diggingBehavior === 'high' && plant.planting.type === 'rooted') {
    reasons.push({ code: 'plant_digging_risk', message: '该动物会明显翻动底床，根植型水草稳定性可能受影响。', severity: 'medium' });
  }

  if (animal.habitat?.coverNeed === 'high' && plant.habitatValue?.cover === 'high') {
    benefits.push({ code: 'plant_cover_benefit', message: '候选水草可以提供该动物需要的高遮蔽环境。', severity: 'info' });
  }

  if (
    animal.habitat?.shelterNeed === 'high'
    && (plant.habitatValue?.fryShelter === 'high' || plant.habitatValue?.shrimpShelter === 'high')
  ) {
    benefits.push({ code: 'plant_shelter_benefit', message: '候选水草可以提供密集藏身结构。', severity: 'info' });
  }

  if (tank?.water.targetTemperature !== undefined && plant.environment.temperature) {
    if (!inRange(tank.water.targetTemperature, plant.environment.temperature)) {
      reasons.push({ code: 'plant_tank_temperature_mismatch', message: '候选水草不适合当前目标水温。', severity: 'high' });
    }
  }

  return { status: statusFromReasons(reasons), reasons, benefits };
};

export const deriveHeatingRequirement = (
  profile: SpeciesEnvironmentProfile,
  tank: TankContext,
): EquipmentRequirement => {
  const range = profile.environment.temperature;
  if (!range) {
    return {
      type: 'heating',
      level: 'unknown',
      reasons: [{ code: 'heating_temperature_unknown', message: '缺少物种结构化适温范围，无法判断加热需求。', severity: 'medium' }],
      actions: ['先补充已审核的适温范围。'],
      confidence: 'unknown',
    };
  }

  const observedMin = tank.water.lowestObservedTemperature;
  if (observedMin !== undefined) {
    if (observedMin < range.min) {
      return {
        type: 'heating',
        level: 'required',
        reasons: [{ code: 'heating_below_minimum', message: `已知最低水温 ${observedMin}℃ 低于物种适温下限 ${range.min}℃。`, severity: 'high' }],
        actions: ['提供稳定加热或其他可靠保温方式，使低温时段不低于适温下限。'],
        confidence: profile.evidence.confidence,
      };
    }
    if (observedMin <= range.min + 1) {
      return {
        type: 'heating',
        level: 'recommended',
        reasons: [{ code: 'heating_near_minimum', message: `最低水温 ${observedMin}℃ 接近适温下限 ${range.min}℃，温度余量较小。`, severity: 'medium' }],
        actions: ['优先保证夜间和冬季温度稳定；必要时使用恒温加热。'],
        confidence: profile.evidence.confidence,
      };
    }
    return {
      type: 'heating',
      level: 'not_needed',
      reasons: [{ code: 'heating_minimum_supported', message: `已知最低水温 ${observedMin}℃ 未低于适温下限 ${range.min}℃。`, severity: 'info' }],
      actions: ['继续监测低温时段，不需要仅因物种标签额外判定必须加热。'],
      confidence: profile.evidence.confidence,
    };
  }

  const target = tank.water.targetTemperature;
  if (target !== undefined && target < range.min) {
    return {
      type: 'heating',
      level: 'required',
      reasons: [{ code: 'heating_target_below_minimum', message: `当前目标水温 ${target}℃ 已低于适温下限 ${range.min}℃。`, severity: 'high' }],
      actions: ['先把目标水温调整到物种适温范围，并确认能够稳定维持。'],
      confidence: profile.evidence.confidence,
    };
  }

  return {
    type: 'heating',
    level: 'unknown',
    reasons: [{ code: 'heating_low_temperature_unknown', message: '目标水温不能证明夜间或冬季最低水温；缺少最低实测/可靠估计，不能判断是否必须加热。', severity: 'medium' }],
    actions: ['记录或估计低温时段的最低水温后再判断加热需求。'],
    confidence: 'unknown',
  };
};

export const deriveOxygenationRequirement = (
  profile: SpeciesEnvironmentProfile,
  tank: TankContext,
): EquipmentRequirement => {
  const demand = profile.environment.oxygenDemand || 'unknown';
  if (demand === 'unknown') {
    return {
      type: 'oxygenation',
      level: 'unknown',
      reasons: [{ code: 'oxygen_demand_unknown', message: '缺少结构化溶氧需求，不能根据物种名称或自由文本直接要求气泵。', severity: 'medium' }],
      actions: ['补充已审核的溶氧/水流需求资料。'],
      confidence: 'unknown',
    };
  }

  let risk = demand === 'high' ? 3 : demand === 'medium' ? 1 : 0;
  const reasons: DecisionReason[] = [{
    code: `oxygen_demand_${demand}`,
    message: `物种溶氧需求为 ${demand}。`,
    severity: demand === 'high' ? 'medium' : 'info',
  }];

  const temperature = tank.water.targetTemperature;
  if (temperature !== undefined && temperature >= 28) {
    risk += 2;
    reasons.push({ code: 'oxygen_warm_water', message: `当前目标水温 ${temperature}℃ 较高，需要给氧交换留出更大余量。`, severity: 'medium' });
  }

  const loadRate = tank.stocking.loadRate;
  if (loadRate !== undefined && loadRate >= 75) {
    risk += 2;
    reasons.push({ code: 'oxygen_high_load', message: `当前估算生物负荷约 ${loadRate}%，高负荷会提高氧交换压力。`, severity: 'medium' });
  }

  const agitation = tank.equipment.surfaceAgitation;
  if (agitation === 'low' || agitation === 'still') {
    risk += 2;
    reasons.push({ code: 'oxygen_low_surface_agitation', message: '当前水面扰动较弱，氧交换能力可能不足。', severity: 'medium' });
  } else if (agitation === 'medium') {
    risk -= 1;
    reasons.push({ code: 'oxygen_surface_agitation_medium', message: '当前已有中等水面扰动，可提供一定氧交换。', severity: 'info' });
  } else if (agitation === 'high') {
    risk -= 2;
    reasons.push({ code: 'oxygen_surface_agitation_high', message: '当前已有明显水面扰动，可提供较强氧交换。', severity: 'info' });
  }

  if (tank.equipment.airPump) {
    risk -= 2;
    reasons.push({ code: 'oxygen_air_pump_present', message: '当前已记录气泵/增氧设备，可作为氧交换支持之一。', severity: 'info' });
  }

  const hasSupportObservation = agitation !== 'unknown' || tank.equipment.airPump === true;
  const hasRiskObservation = temperature !== undefined || loadRate !== undefined;
  if (demand === 'high' && !hasSupportObservation && !hasRiskObservation) {
    return {
      type: 'oxygenation',
      level: 'unknown',
      reasons: [...reasons, { code: 'oxygen_support_unknown', message: '缺少水面扰动、温度和负荷信息，不能把“高溶氧需求”直接翻译成“必须买气泵”。', severity: 'medium' }],
      actions: ['先确认水面扰动、目标水温和生物负荷，再决定是否需要额外增氧。'],
      confidence: 'unknown',
    };
  }

  if (risk >= 5) {
    return {
      type: 'oxygenation',
      level: 'recommended',
      reasons,
      actions: ['优先提高水面扰动或调整过滤出水。', '若仍无法提供足够氧交换，再考虑气泵/气石。'],
      confidence: profile.evidence.confidence,
    };
  }
  if (risk >= 2) {
    return {
      type: 'oxygenation',
      level: 'optional',
      reasons,
      actions: ['继续观察呼吸、聚集水面等信号，并维持稳定水面扰动。'],
      confidence: profile.evidence.confidence,
    };
  }
  return {
    type: 'oxygenation',
    level: 'not_needed',
    reasons,
    actions: ['当前没有证据要求额外增加气泵；继续维持现有氧交换条件。'],
    confidence: profile.evidence.confidence,
  };
};

export const buildEnvironmentDecision = ({
  species,
  tank,
  plant,
}: {
  species: SpeciesEnvironmentProfile;
  tank: TankContext;
  plant?: PlantEnvironmentProfile;
}): EnvironmentDecision => ({
  environment: evaluateEnvironmentFit(species, tank),
  plantMatch: plant ? evaluatePlantMatch(species, plant, tank) : undefined,
  equipment: [
    deriveHeatingRequirement(species, tank),
    deriveOxygenationRequirement(species, tank),
  ],
});
