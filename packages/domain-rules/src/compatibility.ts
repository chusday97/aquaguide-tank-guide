export type CompatibilityDecisionStatus = 'compatible' | 'caution' | 'not_recommended' | 'insufficient_data';
export type CompatibilityAddPolicy = 'allow' | 'confirm' | 'block' | 'complete_information';
export type CompatibilityIntent = 'record_existing' | 'planned_addition';

export type DomainSpeciesFact = {
  id: string;
  waterType: 'freshwater' | 'saltwater' | 'unknown';
  temperatureMinC?: number | null;
  temperatureMaxC?: number | null;
  phMin?: number | null;
  phMax?: number | null;
  reviewed: boolean;
};

export type DomainTankFact = {
  waterType?: 'freshwater' | 'saltwater' | 'unknown' | null;
  volumeLiters?: number | null;
  targetTemperatureC?: number | null;
};

export type DomainCompatibilityInput = {
  intent: CompatibilityIntent;
  tank?: DomainTankFact | null;
  existingSpecies: DomainSpeciesFact[];
  candidateSpecies?: DomainSpeciesFact | null;
  explicitPairStatus?: CompatibilityDecisionStatus;
};

export type CompatibilityDecision = {
  status: CompatibilityDecisionStatus;
  addPolicy: CompatibilityAddPolicy;
  ruleCodes: string[];
  catalogVersion: string;
  ruleVersion: string;
};

export const COMPATIBILITY_RULE_VERSION = 'compatibility-domain-v1';

const statusRank: Record<CompatibilityDecisionStatus, number> = {
  compatible: 0,
  caution: 1,
  insufficient_data: 2,
  not_recommended: 3,
};

const policyFor = (intent: CompatibilityIntent, status: CompatibilityDecisionStatus): CompatibilityAddPolicy => {
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

export const evaluateCompatibility = ({
  intent,
  tank,
  existingSpecies,
  candidateSpecies,
  explicitPairStatus,
}: DomainCompatibilityInput): CompatibilityDecision => {
  const ruleCodes: string[] = [];
  let status: CompatibilityDecisionStatus = 'compatible';
  const raise = (next: CompatibilityDecisionStatus, code: string) => {
    ruleCodes.push(code);
    if (statusRank[next] > statusRank[status]) status = next;
  };

  if (!candidateSpecies) raise('insufficient_data', 'candidate_missing');
  if (candidateSpecies && existingSpecies.length === 0) raise('insufficient_data', 'empty_tank_no_existing_species');

  if (candidateSpecies && existingSpecies.length > 0) {
    for (const existing of existingSpecies) {
      if (existing.waterType === 'unknown' || candidateSpecies.waterType === 'unknown') {
        raise('insufficient_data', 'water_type_unknown');
      } else if (existing.waterType !== candidateSpecies.waterType) {
        raise('not_recommended', 'water_type_conflict');
      }
      if (!existing.reviewed || !candidateSpecies.reviewed) raise('insufficient_data', 'species_evidence_unreviewed');
      if (rangesOverlap(existing.temperatureMinC, existing.temperatureMaxC, candidateSpecies.temperatureMinC, candidateSpecies.temperatureMaxC) === null) {
        raise('insufficient_data', 'temperature_range_missing');
      }
      if (rangesOverlap(existing.phMin, existing.phMax, candidateSpecies.phMin, candidateSpecies.phMax) === null) {
        raise('insufficient_data', 'ph_range_missing');
      }
    }
  }

  if (candidateSpecies && tank) {
    if (!tank.waterType || tank.waterType === 'unknown') raise('insufficient_data', 'tank_water_type_missing');
    if (tank.volumeLiters == null || tank.volumeLiters <= 0) raise('insufficient_data', 'tank_volume_missing');
    if (tank.targetTemperatureC == null) raise('insufficient_data', 'tank_temperature_missing');
  }
  if (explicitPairStatus) raise(explicitPairStatus, 'reviewed_pair_rule');

  return {
    status,
    addPolicy: policyFor(intent, status),
    ruleCodes: [...new Set(ruleCodes)],
    catalogVersion: 'unknown',
    ruleVersion: COMPATIBILITY_RULE_VERSION,
  };
};

