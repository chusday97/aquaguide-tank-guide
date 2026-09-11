import { assessBioloadScreening } from './bioload';

export type CompatibilityDecisionStatus = 'compatible' | 'caution' | 'not_recommended' | 'insufficient_data';
export type CompatibilityAddPolicy = 'allow' | 'confirm' | 'block' | 'complete_information';
export type CompatibilityIntent = 'record_existing' | 'planned_addition';
export type CompatibilityDecisionReadiness = 'reviewed' | 'partial' | 'unknown';
export type ObservedCoexistenceStatus = 'stable' | 'observe' | 'intervene' | 'emergency';
export type CompatibilityRequiredFact = 'water' | 'temperature' | 'ph' | 'adult_size' | 'tank_size' | 'social_behavior' | 'territoriality' | 'predation' | 'breeding_behavior';

export type CompatibilityIndividualContext = {
  lifeStage: 'unknown' | 'juvenile' | 'adult' | 'fry' | 'subadult';
  reproductiveState: 'unknown' | 'not_applicable' | 'normal' | 'pregnant_or_gravid' | 'in_labor_or_spawning' | 'postpartum_recovery';
  averageLengthCm?: number;
  guardingEggsOrFry?: boolean;
};

export type StockingGuidance = {
  kind: 'reviewed_range' | 'minimum_group_only' | 'screening_only' | 'unknown';
  recommendedMin: number | null;
  recommendedMax: number | null;
  constraints: string[];
  confidence: 'high' | 'medium' | 'low' | 'unknown';
  evidenceIds: string[];
};

export type ObservedCoexistenceSignals = {
  repeatedChasing?: boolean;
  feedingExclusion?: boolean;
  injuries?: boolean;
  respiratoryDistress?: boolean;
  multipleDeaths?: boolean;
};

export type DomainSpeciesFact = {
  id: string;
  waterType: 'freshwater' | 'saltwater' | 'brackish' | 'unknown';
  temperatureMinC?: number | null;
  temperatureMaxC?: number | null;
  phMin?: number | null;
  phMax?: number | null;
  minTankLiters?: number | null;
  minTankLengthCm?: number | null;
  reviewed: boolean;
  compatibilityRequiredFacts?: CompatibilityRequiredFact[];
  adultLengthMinCm?: number | null;
  adultLengthMaxCm?: number | null;
  socialMode?: 'solitary' | 'pair' | 'group' | 'colony' | 'variable' | 'unknown';
  minimumGroupSize?: number | null;
  stockingGuidance?: StockingGuidance;
  evidenceIds?: string[];
  loadMultiplier?: number;
  behaviorTraits?: string[];
  size?: 'Small' | 'Medium' | 'Large' | string;
};

export type DomainTankFact = {
  waterType?: 'freshwater' | 'saltwater' | 'brackish' | 'unknown' | null;
  volumeLiters?: number | null;
  lengthCm?: number | null;
  targetTemperatureC?: number | null;
  observedSignals?: ObservedCoexistenceSignals;
};

export type DomainCompatibilityInput = {
  intent: CompatibilityIntent;
  tank?: DomainTankFact | null;
  existingSpecies: DomainSpeciesFact[];
  candidateSpecies?: DomainSpeciesFact | null;
  candidateQuantity?: number | null;
  existingQuantities?: Record<string, number>;
  candidateContext?: CompatibilityIndividualContext;
  individualContexts?: Record<string, CompatibilityIndividualContext>;
  explicitPairStatus?: CompatibilityDecisionStatus;
  catalogVersion?: string;
};

export type CompatibilityDecision = {
  status: CompatibilityDecisionStatus;
  addPolicy: CompatibilityAddPolicy;
  ruleCodes: string[];
  catalogVersion: string;
  ruleVersion: string;
  decisionReadiness: CompatibilityDecisionReadiness;
  stockingGuidance: StockingGuidance;
  observedStatus: ObservedCoexistenceStatus;
  evidenceIds: string[];
};

export const COMPATIBILITY_RULE_VERSION = 'compatibility-domain-v1';

const statusRank: Record<CompatibilityDecisionStatus, number> = {
  compatible: 0,
  caution: 1,
  insufficient_data: 2,
  not_recommended: 3,
};

const isInsufficientData = (value: CompatibilityDecisionStatus) => value === 'insufficient_data';

const observedStatusOf = (signals?: ObservedCoexistenceSignals): ObservedCoexistenceStatus => {
  if (!signals) return 'stable';
  if (signals.respiratoryDistress || signals.multipleDeaths || signals.injuries) return 'emergency';
  if (signals.repeatedChasing || signals.feedingExclusion) return 'intervene';
  return 'observe';
};

const stockingGuidanceOf = (species?: DomainSpeciesFact | null, quantity?: number | null): StockingGuidance => {
  if (!species) return { kind: 'unknown', recommendedMin: null, recommendedMax: null, constraints: [], confidence: 'unknown', evidenceIds: [] };
  if (species.stockingGuidance) return species.stockingGuidance;
  if (species.minimumGroupSize != null) return {
    kind: 'minimum_group_only',
    recommendedMin: species.minimumGroupSize,
    recommendedMax: null,
    constraints: [`最低群体数量 ${species.minimumGroupSize}`],
    confidence: species.reviewed ? 'medium' : 'unknown',
    evidenceIds: species.evidenceIds || [],
  };
  if (species.minTankLiters != null || species.adultLengthMaxCm != null || quantity != null) return {
    kind: 'screening_only',
    recommendedMin: null,
    recommendedMax: null,
    constraints: ['仅用于空间与负荷初筛，不能作为安全上限'],
    confidence: species.reviewed ? 'low' : 'unknown',
    evidenceIds: species.evidenceIds || [],
  };
  return { kind: 'unknown', recommendedMin: null, recommendedMax: null, constraints: [], confidence: 'unknown', evidenceIds: species.evidenceIds || [] };
};

export const getCompatibilityAddPolicy = (
  intent: CompatibilityIntent,
  status: CompatibilityDecisionStatus,
): CompatibilityAddPolicy => {
  if (intent === 'record_existing') return 'allow';
  if (status === 'compatible') return 'allow';
  if (status === 'caution') return 'confirm';
  if (status === 'not_recommended') return 'block';
  return 'complete_information';
};

const rangesOverlap = (leftMin?: number | null, leftMax?: number | null, rightMin?: number | null, rightMax?: number | null) => {
  if (leftMin == null || leftMax == null || rightMin == null || rightMax == null) return null;
  return Math.max(leftMin, rightMin) <= Math.min(leftMax, rightMax);
};

const rangeContains = (value: number | null | undefined, min?: number | null, max?: number | null) => {
  if (value == null || min == null || max == null) return null;
  return value >= min && value <= max;
};

export const evaluateCompatibility = ({
  intent,
  tank,
  existingSpecies,
  candidateSpecies,
  candidateQuantity,
  existingQuantities,
  candidateContext,
  individualContexts,
  explicitPairStatus,
  catalogVersion = 'unknown',
}: DomainCompatibilityInput): CompatibilityDecision => {
  const ruleCodes: string[] = [];
  let status: CompatibilityDecisionStatus = 'compatible';
  const raise = (next: CompatibilityDecisionStatus, code: string) => {
    ruleCodes.push(code);
    if (statusRank[next] > statusRank[status]) status = next;
  };

  if (!candidateSpecies) raise('insufficient_data', 'candidate_missing');
  if (candidateSpecies && intent === 'planned_addition' && !tank) raise('insufficient_data', 'tank_missing');

  const allSpeciesReviewed = Boolean(candidateSpecies)
    && existingSpecies.every(species => species.reviewed)
    && Boolean(candidateSpecies?.reviewed);
  if (candidateSpecies && !allSpeciesReviewed) raise('insufficient_data', 'species_evidence_unreviewed');

  if (candidateSpecies && existingSpecies.length > 0) {
    for (const existing of existingSpecies) {
      if (existing.waterType === 'unknown' || candidateSpecies.waterType === 'unknown') {
        raise('insufficient_data', 'water_type_unknown');
      } else if (existing.waterType !== candidateSpecies.waterType) {
        raise('not_recommended', 'water_type_conflict');
      }
      if (!existing.reviewed || !candidateSpecies.reviewed) raise('insufficient_data', 'species_evidence_unreviewed');
      const predator = existing.behaviorTraits?.includes('predatory')
        ? existing
        : candidateSpecies.behaviorTraits?.includes('predatory') ? candidateSpecies : null;
      const preyIsCandidate = predator?.id !== candidateSpecies.id;
      if (predator && (preyIsCandidate ? candidateSpecies.size : existing.size) === 'Small') {
        const preyContext = preyIsCandidate
          ? candidateContext
          : individualContexts?.[existing.id];
        const juvenile = preyContext?.lifeStage === 'fry'
          || preyContext?.lifeStage === 'juvenile'
          || preyContext?.lifeStage === 'subadult';
        const currentSizeClearlyBelowAdultRisk = juvenile
          && preyContext?.averageLengthCm != null
          && predator.adultLengthMaxCm != null
          && preyContext.averageLengthCm < predator.adultLengthMaxCm * 0.4;
        raise(currentSizeClearlyBelowAdultRisk ? 'caution' : 'not_recommended', currentSizeClearlyBelowAdultRisk ? 'juvenile_predation_risk' : 'predation_risk');
      }
      if (existing.behaviorTraits?.includes('territorial') && candidateSpecies.behaviorTraits?.includes('territorial')) {
        raise('caution', 'territorial_conflict');
      }
      if (existing.behaviorTraits?.includes('solitary_required') || candidateSpecies.behaviorTraits?.includes('solitary_required')) {
        raise('not_recommended', 'single_housing_required');
      }
      const temperatureOverlap = rangesOverlap(existing.temperatureMinC, existing.temperatureMaxC, candidateSpecies.temperatureMinC, candidateSpecies.temperatureMaxC);
      if (temperatureOverlap === null) {
        raise('insufficient_data', 'temperature_range_missing');
      } else if (!temperatureOverlap) {
        raise('not_recommended', 'temperature_range_conflict');
      }
      const phRequired = existing.compatibilityRequiredFacts?.includes('ph') || candidateSpecies.compatibilityRequiredFacts?.includes('ph');
      const phOverlap = rangesOverlap(existing.phMin, existing.phMax, candidateSpecies.phMin, candidateSpecies.phMax);
      if (phOverlap === null && phRequired) {
        raise('insufficient_data', 'ph_range_missing');
      } else if (phOverlap === false) {
        raise('caution', 'ph_range_conflict');
      }
    }
  }

  const activeBreedingDefense = [
    candidateSpecies?.behaviorTraits,
    ...existingSpecies.map(species => species.behaviorTraits),
  ].some(traits => traits?.includes('breeding_defense')) && [
    candidateContext,
    ...existingSpecies.map(species => individualContexts?.[species.id]),
  ].some(context => context?.guardingEggsOrFry || context?.reproductiveState === 'in_labor_or_spawning');
  if (activeBreedingDefense) raise('caution', 'breeding_territory_active');

  if (candidateSpecies && tank) {
    if (!tank.waterType || tank.waterType === 'unknown') raise('insufficient_data', 'tank_water_type_missing');
    if (candidateSpecies.waterType === 'unknown') raise('insufficient_data', 'candidate_water_type_missing');
    if (tank.waterType !== 'unknown' && candidateSpecies.waterType !== 'unknown' && tank.waterType !== candidateSpecies.waterType) {
      raise('not_recommended', 'candidate_tank_water_type_conflict');
    }
    if (tank.volumeLiters == null || tank.volumeLiters <= 0) raise('insufficient_data', 'tank_volume_missing');
    if (tank.targetTemperatureC == null) raise('insufficient_data', 'tank_temperature_missing');
    const candidateTankTemperatureFit = rangeContains(
      tank.targetTemperatureC,
      candidateSpecies.temperatureMinC,
      candidateSpecies.temperatureMaxC,
    );
    if (candidateTankTemperatureFit === false) raise('not_recommended', 'tank_temperature_conflict');
    if (candidateSpecies.minTankLiters != null && tank.volumeLiters != null && tank.volumeLiters < candidateSpecies.minTankLiters) {
      raise('caution', 'tank_volume_below_species_minimum');
    }
    if (candidateSpecies.minTankLengthCm != null && tank.lengthCm != null && tank.lengthCm < candidateSpecies.minTankLengthCm) {
      raise('caution', 'tank_length_below_species_minimum');
    }
    // Existing livestock is already present, but its recorded requirements
    // still belong to the same tank fact set. Checking it here keeps a pair
    // decision independent of which species is presented as the candidate.
    for (const existing of existingSpecies) {
      const existingTankTemperatureFit = rangeContains(
        tank.targetTemperatureC,
        existing.temperatureMinC,
        existing.temperatureMaxC,
      );
      if (existingTankTemperatureFit === false) raise('not_recommended', 'tank_temperature_conflict');
    }
  }
  if (explicitPairStatus) raise(explicitPairStatus, 'reviewed_pair_rule');

  const observedStatus = observedStatusOf(tank?.observedSignals);
  if (observedStatus === 'emergency') raise('not_recommended', 'observed_emergency');
  if (observedStatus === 'intervene') raise('caution', 'observed_intervention');

  if (candidateSpecies && tank?.volumeLiters && tank.volumeLiters > 0) {
    const screening = assessBioloadScreening([
      ...existingSpecies.map(species => ({ size: species.size, quantity: (existingQuantities?.[species.id] || 1) * (species.loadMultiplier || 1) })),
      { size: candidateSpecies.size, quantity: (candidateQuantity || 1) * (candidateSpecies.loadMultiplier || 1) },
    ], tank.volumeLiters);
    if (screening.pressure === 'high') raise('not_recommended', 'bioload_over_limit');
    else if (screening.pressure === 'elevated') raise('caution', 'bioload_near_limit');
  }

  if (ruleCodes.length === 0 && status === 'compatible') ruleCodes.push('compatibility_clear');

  // Preserve hard safety blocks (water/temperature/predation/space) even when
  // evidence is incomplete, but never upgrade an unreviewed combination to a
  // positive or cautionary planning result.
  const finalStatus: CompatibilityDecisionStatus = candidateSpecies && !allSpeciesReviewed && statusRank[status] < statusRank.insufficient_data
    ? 'insufficient_data'
    : status;
  const decisionReadiness: CompatibilityDecisionReadiness = !allSpeciesReviewed
    ? 'unknown'
    : isInsufficientData(finalStatus)
      ? 'partial'
      : 'reviewed';

  return {
    status,
    addPolicy: getCompatibilityAddPolicy(intent, status),
    ruleCodes: [...new Set(ruleCodes)],
    catalogVersion,
    ruleVersion: COMPATIBILITY_RULE_VERSION,
    decisionReadiness,
    stockingGuidance: stockingGuidanceOf(candidateSpecies, candidateQuantity),
    observedStatus,
    evidenceIds: Array.from(new Set([
      ...(candidateSpecies?.evidenceIds || []),
      ...existingSpecies.flatMap(species => species.evidenceIds || []),
    ])),
  };
};
