export type CompatibilityDecisionStatus = 'compatible' | 'caution' | 'not_recommended' | 'insufficient_data';
export type CompatibilityAddPolicy = 'allow' | 'confirm' | 'block' | 'complete_information';
export type CompatibilityIntent = 'record_existing' | 'planned_addition';
export type CompatibilityDecisionReadiness = 'reviewed' | 'partial' | 'unknown';

export type DomainSpeciesFact = {
  id: string;
  waterType: 'freshwater' | 'saltwater' | 'unknown';
  temperatureMinC?: number | null;
  temperatureMaxC?: number | null;
  phMin?: number | null;
  phMax?: number | null;
  minTankLiters?: number | null;
  minTankLengthCm?: number | null;
  reviewed: boolean;
  behaviorTraits?: string[];
  size?: 'Small' | 'Medium' | 'Large' | string;
};

export type DomainTankFact = {
  waterType?: 'freshwater' | 'saltwater' | 'unknown' | null;
  volumeLiters?: number | null;
  lengthCm?: number | null;
  targetTemperatureC?: number | null;
};

export type DomainCompatibilityInput = {
  intent: CompatibilityIntent;
  tank?: DomainTankFact | null;
  existingSpecies: DomainSpeciesFact[];
  candidateSpecies?: DomainSpeciesFact | null;
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
};

export const COMPATIBILITY_RULE_VERSION = 'compatibility-domain-v1';

const statusRank: Record<CompatibilityDecisionStatus, number> = {
  compatible: 0,
  caution: 1,
  insufficient_data: 2,
  not_recommended: 3,
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
  if (candidateSpecies && existingSpecies.length === 0) raise('insufficient_data', 'empty_tank_no_existing_species');
  if (candidateSpecies && intent === 'planned_addition' && !tank) raise('insufficient_data', 'tank_missing');

  if (candidateSpecies && existingSpecies.length > 0) {
    for (const existing of existingSpecies) {
      if (existing.waterType === 'unknown' || candidateSpecies.waterType === 'unknown') {
        raise('insufficient_data', 'water_type_unknown');
      } else if (existing.waterType !== candidateSpecies.waterType) {
        raise('not_recommended', 'water_type_conflict');
      }
      if (!existing.reviewed || !candidateSpecies.reviewed) raise('insufficient_data', 'species_evidence_unreviewed');
      if (existing.behaviorTraits?.includes('predatory') && candidateSpecies.size === 'Small') {
        raise('not_recommended', 'predation_risk');
      }
      if (existing.behaviorTraits?.includes('territorial') && candidateSpecies.behaviorTraits?.includes('territorial')) {
        raise('not_recommended', 'territorial_conflict');
      }
      if (candidateSpecies.behaviorTraits?.includes('solitary_required')) {
        raise('not_recommended', 'single_housing_required');
      }
      const temperatureOverlap = rangesOverlap(existing.temperatureMinC, existing.temperatureMaxC, candidateSpecies.temperatureMinC, candidateSpecies.temperatureMaxC);
      if (temperatureOverlap === null) {
        raise('insufficient_data', 'temperature_range_missing');
      } else if (!temperatureOverlap) {
        raise('not_recommended', 'temperature_range_conflict');
      }
      const phOverlap = rangesOverlap(existing.phMin, existing.phMax, candidateSpecies.phMin, candidateSpecies.phMax);
      if (phOverlap === null) {
        raise('insufficient_data', 'ph_range_missing');
      } else if (!phOverlap) {
        raise('caution', 'ph_range_conflict');
      }
    }
  }

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
  }
  if (explicitPairStatus) raise(explicitPairStatus, 'reviewed_pair_rule');

  const allSpeciesReviewed = Boolean(candidateSpecies)
    && existingSpecies.every(species => species.reviewed)
    && Boolean(candidateSpecies?.reviewed);
  const decisionReadiness: CompatibilityDecisionReadiness = allSpeciesReviewed ? 'reviewed' : 'unknown';

  return {
    status,
    addPolicy: getCompatibilityAddPolicy(intent, status),
    ruleCodes: [...new Set(ruleCodes)],
    catalogVersion,
    ruleVersion: COMPATIBILITY_RULE_VERSION,
    decisionReadiness,
  };
};
