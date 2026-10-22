import { assessBioloadScreening } from './bioload';

export type CompatibilityDecisionStatus = 'compatible' | 'caution' | 'not_recommended' | 'insufficient_data';
export type CompatibilityAddPolicy = 'allow' | 'confirm' | 'block' | 'complete_information';
export type CompatibilityIntent = 'record_existing' | 'planned_addition';
export type CompatibilityDecisionReadiness = 'reviewed' | 'partial' | 'unknown';
export type ObservedCoexistenceStatus = 'stable' | 'observe' | 'intervene' | 'emergency';
export type CompatibilityRequiredFact = 'water' | 'temperature' | 'ph' | 'adult_size' | 'tank_size' | 'social_behavior' | 'territoriality' | 'predation' | 'breeding_behavior';
export type CompatibilityFactDisposition = 'ready' | 'research_pending' | 'public_evidence_insufficient' | 'identity_unresolved';
export type BehaviorRiskLevel = 'none' | 'low' | 'medium' | 'high' | 'unknown';

export type CompatibilityTraitReadiness = {
  ready: boolean;
  requiredFacts: CompatibilityRequiredFact[];
  missingFacts: CompatibilityRequiredFact[];
};

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

export type TankStabilityContext = {
  establishedDays?: number | null;
  stableCoexistenceDays?: number | null;
  maintenanceConsistent?: boolean | null;
  recentWaterQualityIncident?: boolean | null;
};

export type DomainSpeciesFact = {
  id: string;
  waterType: 'freshwater' | 'saltwater' | 'brackish' | 'unknown';
  waterTypes?: Array<'freshwater' | 'saltwater' | 'brackish'>;
  temperatureMinC?: number | null;
  temperatureMaxC?: number | null;
  phMin?: number | null;
  phMax?: number | null;
  minTankLiters?: number | null;
  minTankLengthCm?: number | null;
  reviewed: boolean;
  compatibilityRequiredFacts?: CompatibilityRequiredFact[];
  compatibilityFactDispositions?: Partial<Record<CompatibilityRequiredFact, CompatibilityFactDisposition>>;
  adultLengthMinCm?: number | null;
  adultLengthMaxCm?: number | null;
  socialMode?: 'solitary' | 'pair' | 'harem' | 'shoal' | 'school' | 'group' | 'colony' | 'variable' | 'unknown';
  swimmingZone?: 'surface' | 'upper' | 'middle' | 'bottom' | 'all' | 'unknown';
  minimumGroupSize?: number | null;
  stockingGuidance?: StockingGuidance;
  evidenceIds?: string[];
  behaviorTraits?: string[];
  territoriality?: BehaviorRiskLevel;
  finNippingRisk?: BehaviorRiskLevel;
  finNipVulnerability?: BehaviorRiskLevel;
  swimmingPace?: 'slow' | 'moderate' | 'fast' | 'unknown';
  predationRisk?: BehaviorRiskLevel;
  predationTargets?: string[];
  predationVulnerability?: BehaviorRiskLevel;
  lifeType?: 'fish' | 'invertebrate' | 'reptile' | 'coral' | 'plant' | 'hardscape' | 'unknown';
  size?: 'Small' | 'Medium' | 'Large' | string;
};

export type DomainTankFact = {
  waterType?: 'freshwater' | 'saltwater' | 'brackish' | 'unknown' | null;
  volumeLiters?: number | null;
  lengthCm?: number | null;
  targetTemperatureC?: number | null;
  ph?: number | null;
  observedSignals?: ObservedCoexistenceSignals;
  stabilityContext?: TankStabilityContext;
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
  pairEvidenceBoundaries?: Array<{
    status: Extract<CompatibilityDecisionStatus, 'caution' | 'insufficient_data'>;
    code: string;
    evidenceIds?: string[];
  }>;
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

export const COMPATIBILITY_RULE_VERSION = 'compatibility-domain-v17-decision-readiness';

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
  return 'stable';
};

const hasTrustedStableContext = (tank?: DomainTankFact | null) => {
  const context = tank?.stabilityContext;
  if (!context) return false;
  return (context.establishedDays ?? 0) >= 90
    && (context.stableCoexistenceDays ?? 0) >= 60
    && context.maintenanceConsistent === true
    && context.recentWaterQualityIncident !== true
    && observedStatusOf(tank?.observedSignals) === 'stable';
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

const supportedWaterTypes = (species?: DomainSpeciesFact | null) => {
  if (!species) return [] as Array<'freshwater' | 'saltwater' | 'brackish'>;
  const reviewed = species.waterTypes?.filter((value, index, all) => all.indexOf(value) === index) || [];
  if (reviewed.length > 0) return reviewed;
  return species.waterType === 'unknown' ? [] : [species.waterType];
};

const waterTypesOverlap = (left?: DomainSpeciesFact | null, right?: DomainSpeciesFact | null) => {
  const leftTypes = supportedWaterTypes(left);
  const rightTypes = supportedWaterTypes(right);
  if (leftTypes.length === 0 || rightTypes.length === 0) return null;
  return leftTypes.some(type => rightTypes.includes(type));
};

const supportsTankWaterType = (species: DomainSpeciesFact, tankWaterType?: DomainTankFact['waterType']) => {
  if (!tankWaterType || tankWaterType === 'unknown') return null;
  const supported = supportedWaterTypes(species);
  if (supported.length === 0) return null;
  return supported.includes(tankWaterType);
};

const hasPositiveNumber = (value?: number | null) => value != null && Number.isFinite(value) && value > 0;
const hasFiniteRange = (min?: number | null, max?: number | null) => (
  min != null && max != null && Number.isFinite(min) && Number.isFinite(max) && min <= max
);

const requiredFactAvailable = (species: DomainSpeciesFact, fact: CompatibilityRequiredFact) => {
  if (fact === 'water') return supportedWaterTypes(species).length > 0;
  if (fact === 'temperature') return hasFiniteRange(species.temperatureMinC, species.temperatureMaxC);
  if (fact === 'ph') return hasFiniteRange(species.phMin, species.phMax);
  if (fact === 'adult_size') return hasPositiveNumber(species.adultLengthMaxCm) || hasPositiveNumber(species.adultLengthMinCm);
  if (fact === 'tank_size') return hasPositiveNumber(species.minTankLiters) || hasPositiveNumber(species.minTankLengthCm);
  // Behaviour facts can be a reviewed negative/neutral finding. The reviewed
  // Profile's requiredFacts declaration is therefore the authority that the
  // fact family was assessed; absence of a positive risk flag must not be
  // reinterpreted as missing evidence.
  return true;
};

export const getCompatibilityTraitReadiness = (species: DomainSpeciesFact): CompatibilityTraitReadiness => {
  const requiredFacts = [...new Set(species.compatibilityRequiredFacts || [])];
  const missingFacts = species.reviewed
    ? requiredFacts.filter(fact => !requiredFactAvailable(species, fact))
    : requiredFacts;
  return { ready: species.reviewed && missingFacts.length === 0, requiredFacts, missingFacts };
};

const rangesOverlap = (leftMin?: number | null, leftMax?: number | null, rightMin?: number | null, rightMax?: number | null) => {
  if (leftMin == null || leftMax == null || rightMin == null || rightMax == null) return null;
  return Math.max(leftMin, rightMin) <= Math.min(leftMax, rightMax);
};

const rangesOnlyTouchAtBoundary = (leftMin?: number | null, leftMax?: number | null, rightMin?: number | null, rightMax?: number | null) => {
  if (leftMin == null || leftMax == null || rightMin == null || rightMax == null) return null;
  return Math.max(leftMin, rightMin) === Math.min(leftMax, rightMax);
};

const rangeContains = (value: number | null | undefined, min?: number | null, max?: number | null) => {
  if (value == null || min == null || max == null) return null;
  return value >= min && value <= max;
};

const predationTargetMatch = (
  predator: DomainSpeciesFact,
  prey: DomainSpeciesFact,
  preyContext?: CompatibilityIndividualContext,
): string | null => {
  const targets = predator.predationTargets ?? [];
  if (targets.length > 0) {
    if (targets.includes(prey.id)) return prey.id;
    if (targets.includes('fish_fry') && prey.lifeType === 'fish' && preyContext?.lifeStage === 'fry') return 'fish_fry';
    if (targets.includes('fish_unspecified_size') && prey.lifeType === 'fish' && predator.id !== prey.id) return 'fish_unspecified_size';
    if (targets.includes('small_fish') && prey.lifeType === 'fish' && prey.size === 'Small') return 'small_fish';
    // `fish_unspecified_size` records direct fish-prey evidence without inventing
    // a prey-size threshold. It is handled as a caution below, not a hard block.
    // `very_small_fish` intentionally has no generic size mapping yet: the
    // reviewed evidence does not define a numeric threshold that Domain can
    // safely infer from the coarse Small/Medium/Large catalogue class.
    return null;
  }
  // Backward-compatible fallback for older reviewed profiles that only carry
  // a broad predatory/high-risk trait and no explicit target scope.
  return (predator.behaviorTraits?.includes('predatory') || predator.predationRisk === 'high')
    && prey.size === 'Small'
    ? 'legacy_small_fish'
    : null;
};

const hasConspecificTerritorialTrait = (species: DomainSpeciesFact) => (
  (species.behaviorTraits || []).some(trait => {
    const normalized = trait.toLowerCase();
    const conspecificScope = normalized.includes('conspecific') || normalized.includes('intraspecific');
    const territorialMeaning = normalized.includes('territorial') || normalized.includes('territory');
    return conspecificScope && territorialMeaning;
  })
);

const SOFT_EVIDENCE_CEILING_FACTS = new Set<CompatibilityRequiredFact>([
  'ph',
  'tank_size',
  'social_behavior',
  'territoriality',
  'predation',
  'breeding_behavior',
]);

const isSoftEvidenceCeilingFact = (fact: CompatibilityRequiredFact) => SOFT_EVIDENCE_CEILING_FACTS.has(fact);

const DECISION_CRITICAL_FACTS: readonly CompatibilityRequiredFact[] = ['water', 'temperature', 'adult_size'];
const factDispositionFor = (species: DomainSpeciesFact, fact: CompatibilityRequiredFact) => species.compatibilityFactDispositions?.[fact];
const hasCoverageMetadata = (species: DomainSpeciesFact) => Boolean(
  species.compatibilityFactDispositions && Object.keys(species.compatibilityFactDispositions).length > 0,
);
const hasDecisionAuthority = (species: DomainSpeciesFact) => {
  if (!hasCoverageMetadata(species)) return species.reviewed;
  const decisionDispositions = DECISION_CRITICAL_FACTS.map(fact => factDispositionFor(species, fact));
  if (decisionDispositions.every(disposition => disposition === undefined)) return species.reviewed;
  return DECISION_CRITICAL_FACTS.every(fact => (
    factDispositionFor(species, fact) === 'ready'
    && requiredFactAvailable(species, fact)
  ));
};
const hasSoftRiskCoverageGap = (species: DomainSpeciesFact) => (
  Object.entries(species.compatibilityFactDispositions || {}).some(([fact, disposition]) => (
    isSoftEvidenceCeilingFact(fact as CompatibilityRequiredFact)
    && disposition !== 'ready'
  ))
);

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
  pairEvidenceBoundaries = [],
  catalogVersion = 'unknown',
}: DomainCompatibilityInput): CompatibilityDecision => {
  const ruleCodes: string[] = [];
  let status: CompatibilityDecisionStatus = 'compatible';
  const raise = (next: CompatibilityDecisionStatus, code: string) => {
    ruleCodes.push(code);
    if (statusRank[next] > statusRank[status]) status = next;
  };
  const raiseFactGap = (species: DomainSpeciesFact[], fact: CompatibilityRequiredFact, legacyCode: string) => {
    const dispositions = species.map(item => factDispositionFor(item, fact)).filter(Boolean) as CompatibilityFactDisposition[];
    if (dispositions.includes('identity_unresolved')) return raise('insufficient_data', `identity_${fact}_unresolved`);
    if (dispositions.includes('public_evidence_insufficient')) {
      return isSoftEvidenceCeilingFact(fact)
        ? raise('caution', `evidence_ceiling_${fact}`)
        : raise('insufficient_data', `public_evidence_${fact}_insufficient`);
    }
    if (dispositions.includes('research_pending')) return raise('caution', `review_pending_${fact}`);
    return raise('insufficient_data', legacyCode);
  };
  const participatingSpecies = [...existingSpecies, ...(candidateSpecies ? [candidateSpecies] : [])];

  if (!candidateSpecies) raise('insufficient_data', 'candidate_missing');
  if (candidateSpecies && intent === 'planned_addition' && !tank) raise('insufficient_data', 'tank_missing');

  const allSpeciesReviewed = Boolean(candidateSpecies)
    && existingSpecies.every(species => species.reviewed)
    && Boolean(candidateSpecies?.reviewed);
  const allSpeciesDecisionReady = Boolean(candidateSpecies)
    && existingSpecies.every(hasDecisionAuthority)
    && Boolean(candidateSpecies && hasDecisionAuthority(candidateSpecies));
  const hasIdentityUnresolved = participatingSpecies.some(species => Object.values(species.compatibilityFactDispositions || {}).includes('identity_unresolved'));
  const decisionHeldSpecies = participatingSpecies.filter(species => !hasDecisionAuthority(species));
  const heldPublicEvidenceCeilings = decisionHeldSpecies.flatMap(species => (
    Object.entries(species.compatibilityFactDispositions || {})
      .filter(([, disposition]) => disposition === 'public_evidence_insufficient')
      .map(([fact]) => fact as CompatibilityRequiredFact)
  ));
  const hasUnreviewedHardEvidenceCeiling = heldPublicEvidenceCeilings.some(fact => !isSoftEvidenceCeilingFact(fact));
  const hasHeldSoftEvidenceCeiling = heldPublicEvidenceCeilings.some(isSoftEvidenceCeilingFact);
  const hasDecisionReadySoftEvidenceCeiling = participatingSpecies.some(species => (
    hasDecisionAuthority(species)
    && !species.reviewed
    && Object.entries(species.compatibilityFactDispositions || {}).some(([fact, disposition]) => (
      disposition === 'public_evidence_insufficient'
      && isSoftEvidenceCeilingFact(fact as CompatibilityRequiredFact)
    ))
  ));
  const hasUnreviewedResearchPending = decisionHeldSpecies.some(species => Object.values(species.compatibilityFactDispositions || {}).includes('research_pending'));
  const hasLegacyUnreviewedSpecies = decisionHeldSpecies.some(species => !hasCoverageMetadata(species));
  const hasPartialRiskCoverage = participatingSpecies.some(species => (
    hasDecisionAuthority(species)
    && !species.reviewed
    && hasSoftRiskCoverageGap(species)
  ));
  if (candidateSpecies) {
    if (hasIdentityUnresolved) raise('insufficient_data', 'species_identity_unresolved');
    else if (hasUnreviewedHardEvidenceCeiling) raise('insufficient_data', 'species_public_evidence_insufficient');
    else if (hasLegacyUnreviewedSpecies) raise('insufficient_data', 'species_evidence_unreviewed');
    else if (hasHeldSoftEvidenceCeiling || hasDecisionReadySoftEvidenceCeiling) raise('caution', 'species_evidence_ceiling');
    else if (hasUnreviewedResearchPending || !allSpeciesDecisionReady) raise('caution', 'species_review_pending');
  }
  const reviewedSpeciesReadiness = participatingSpecies.filter(species => species.reviewed).map(species => ({ species, readiness: getCompatibilityTraitReadiness(species) }));
  for (const { species, readiness } of reviewedSpeciesReadiness) {
    for (const fact of readiness.missingFacts) raiseFactGap([species], fact, `required_fact_${fact}_missing`);
    for (const fact of readiness.requiredFacts) {
      const disposition = factDispositionFor(species, fact);
      if (!readiness.missingFacts.includes(fact) && (disposition === 'public_evidence_insufficient' || disposition === 'research_pending')) {
        raiseFactGap([species], fact, `required_fact_${fact}_missing`);
      }
    }
  }
  const allRequiredTraitsReady = reviewedSpeciesReadiness.every(item => item.readiness.ready);

  if (candidateSpecies && existingSpecies.length > 0) {
    for (const existing of existingSpecies) {
      const speciesWaterOverlap = waterTypesOverlap(existing, candidateSpecies);
      if (speciesWaterOverlap === null) {
        const missingWater = [existing, candidateSpecies].filter(species => supportedWaterTypes(species).length === 0);
        raiseFactGap(missingWater, 'water', 'water_type_unknown');
      } else if (!speciesWaterOverlap) {
        raise('not_recommended', 'water_type_conflict');
      }
      if ((!existing.reviewed || !candidateSpecies.reviewed) && !hasCoverageMetadata(existing) && !hasCoverageMetadata(candidateSpecies)) raise('insufficient_data', 'species_evidence_unreviewed');
      const existingPreyContext = individualContexts?.[existing.id];
      const existingTargetsCandidate = predationTargetMatch(existing, candidateSpecies, candidateContext);
      const candidateTargetsExisting = predationTargetMatch(candidateSpecies, existing, existingPreyContext);
      const predator = existingTargetsCandidate ? existing : candidateTargetsExisting ? candidateSpecies : null;
      const matchedTarget = existingTargetsCandidate || candidateTargetsExisting;
      const preyIsCandidate = predator?.id !== candidateSpecies.id;
      if (predator && matchedTarget) {
        const preyContext = preyIsCandidate
          ? candidateContext
          : existingPreyContext;
        if (matchedTarget === 'fish_fry') {
          raise('not_recommended', 'fry_predation_risk');
        } else if (matchedTarget === 'fish_unspecified_size') {
          raise('caution', 'predation_scope_uncertain');
        } else {
          const juvenile = preyContext?.lifeStage === 'fry'
            || preyContext?.lifeStage === 'juvenile'
            || preyContext?.lifeStage === 'subadult';
          const currentSizeClearlyBelowAdultRisk = juvenile
            && preyContext?.averageLengthCm != null
            && predator.adultLengthMaxCm != null
            && preyContext.averageLengthCm < predator.adultLengthMaxCm * 0.4;
          raise(currentSizeClearlyBelowAdultRisk ? 'caution' : 'not_recommended', currentSizeClearlyBelowAdultRisk ? 'juvenile_predation_risk' : 'predation_risk');
        }
      }
      const isPredationVulnerable = (species: DomainSpeciesFact) => (
        species.predationVulnerability === 'medium'
        || species.predationVulnerability === 'high'
      );
      const fishTargetsVulnerableExisting = candidateSpecies.lifeType === 'fish' && isPredationVulnerable(existing);
      const existingFishTargetsVulnerableCandidate = existing.lifeType === 'fish' && isPredationVulnerable(candidateSpecies);
      if (!predator && existing.id !== candidateSpecies.id && (fishTargetsVulnerableExisting || existingFishTargetsVulnerableCandidate)) {
        raise('caution', 'predation_vulnerability_context');
      }
      const existingConspecificTerritorial = hasConspecificTerritorialTrait(existing);
      const candidateConspecificTerritorial = hasConspecificTerritorialTrait(candidateSpecies);
      if (existing.id === candidateSpecies.id && (existingConspecificTerritorial || candidateConspecificTerritorial)) {
        raise('caution', 'territorial_conflict');
      }
      const existingTerritorial = existing.behaviorTraits?.includes('territorial')
        || existing.territoriality === 'medium'
        || existing.territoriality === 'high';
      const candidateTerritorial = candidateSpecies.behaviorTraits?.includes('territorial')
        || candidateSpecies.territoriality === 'medium'
        || candidateSpecies.territoriality === 'high';
      if (existingTerritorial && candidateTerritorial) {
        raise('caution', 'territorial_conflict');
      }
      const hasTerritorialPressure = (species: DomainSpeciesFact) => (
        species.behaviorTraits?.includes('territorial')
        || species.territoriality === 'medium'
        || species.territoriality === 'high'
      );
      const isReviewedLowTerritoryTarget = (species: DomainSpeciesFact) => (
        species.reviewed
        && (species.territoriality === 'none' || species.territoriality === 'low')
      );
      if (existing.id !== candidateSpecies.id && (
        (hasTerritorialPressure(existing) && isReviewedLowTerritoryTarget(candidateSpecies))
        || (hasTerritorialPressure(candidateSpecies) && isReviewedLowTerritoryTarget(existing))
      )) {
        raise('caution', 'territorial_pressure_context');
      }
      const hasFinNippingPressure = (species: DomainSpeciesFact) => (
        species.behaviorTraits?.includes('fin_nipping')
        || species.finNippingRisk === 'medium'
        || species.finNippingRisk === 'high'
      );
      const isFinNipVulnerable = (species: DomainSpeciesFact) => (
        species.finNipVulnerability === 'medium'
        || species.finNipVulnerability === 'high'
        || species.swimmingPace === 'slow'
      );
      if (existing.id !== candidateSpecies.id && (
        (hasFinNippingPressure(existing) && isFinNipVulnerable(candidateSpecies))
        || (hasFinNippingPressure(candidateSpecies) && isFinNipVulnerable(existing))
      )) {
        raise('caution', 'fin_nipping_target_vulnerability');
      }
      if (existing.id !== candidateSpecies.id
        && existing.reviewed
        && candidateSpecies.reviewed
        && existing.swimmingZone === 'bottom'
        && candidateSpecies.swimmingZone === 'bottom') {
        ruleCodes.push('shared_bottom_zone_context');
      }
      if (existing.id !== candidateSpecies.id && (
        existing.behaviorTraits?.includes('species_tank_required')
        || candidateSpecies.behaviorTraits?.includes('species_tank_required')
      )) {
        raise('not_recommended', 'species_tank_required');
      }
      if (existing.behaviorTraits?.includes('solitary_required') || candidateSpecies.behaviorTraits?.includes('solitary_required')) {
        raise('not_recommended', 'single_housing_required');
      }
      const temperatureOverlap = rangesOverlap(existing.temperatureMinC, existing.temperatureMaxC, candidateSpecies.temperatureMinC, candidateSpecies.temperatureMaxC);
      if (temperatureOverlap === null) {
        const missingTemperature = [existing, candidateSpecies].filter(species => !hasFiniteRange(species.temperatureMinC, species.temperatureMaxC));
        raiseFactGap(missingTemperature, 'temperature', 'temperature_range_missing');
      } else if (!temperatureOverlap) {
        raise('not_recommended', 'temperature_range_conflict');
      }
      const phOverlap = rangesOverlap(existing.phMin, existing.phMax, candidateSpecies.phMin, candidateSpecies.phMax);
      if (phOverlap === false) {
        raise('caution', 'ph_range_conflict');
      } else if (phOverlap === true && rangesOnlyTouchAtBoundary(existing.phMin, existing.phMax, candidateSpecies.phMin, candidateSpecies.phMax)) {
        raise('caution', 'ph_range_edge_overlap');
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
    const reportedTankWaterType = Boolean(tank.waterType && tank.waterType !== 'unknown');
    if (!reportedTankWaterType) {
      const waterTypeSets = participatingSpecies.map(supportedWaterTypes);
      const commonWaterTypes = waterTypeSets.length > 0 && waterTypeSets.every(types => types.length > 0)
        ? waterTypeSets.slice(1).reduce(
          (common, types) => common.filter(type => types.includes(type)),
          [...waterTypeSets[0]],
        )
        : [];
      if (commonWaterTypes.length > 0) ruleCodes.push('tank_water_type_unreported_species_overlap');
      else raise('insufficient_data', 'tank_water_type_missing');
    }
    const candidateTankWaterFit = reportedTankWaterType
      ? supportsTankWaterType(candidateSpecies, tank.waterType)
      : null;
    if (candidateTankWaterFit === null && reportedTankWaterType) raiseFactGap([candidateSpecies], 'water', 'candidate_water_type_missing');
    if (candidateTankWaterFit === false) {
      raise('not_recommended', 'candidate_tank_water_type_conflict');
    }
    const hasTankVolume = tank.volumeLiters != null && tank.volumeLiters > 0;
    const hasTankLength = tank.lengthCm != null && tank.lengthCm > 0;
    const requiresTankVolume = participatingSpecies.some(species => hasPositiveNumber(species.minTankLiters));
    const requiresTankLength = participatingSpecies.some(species => hasPositiveNumber(species.minTankLengthCm));
    if (!hasTankVolume && !hasTankLength && (requiresTankVolume || requiresTankLength)) {
      raise('insufficient_data', 'tank_volume_missing');
    } else {
      if (requiresTankVolume && !hasTankVolume) raise('insufficient_data', 'tank_volume_missing');
      if (requiresTankLength && !hasTankLength) raise('insufficient_data', 'tank_length_missing');
      if (!requiresTankVolume && !hasTankVolume && hasTankLength) ruleCodes.push('tank_volume_unreported_length_available');
    }
    if (tank.targetTemperatureC == null) ruleCodes.push('tank_temperature_unreported');
    const candidateTankTemperatureFit = rangeContains(
      tank.targetTemperatureC,
      candidateSpecies.temperatureMinC,
      candidateSpecies.temperatureMaxC,
    );
    if (candidateTankTemperatureFit === null && tank.targetTemperatureC != null) raiseFactGap([candidateSpecies], 'temperature', 'temperature_range_missing');
    if (candidateTankTemperatureFit === false) raise('not_recommended', 'tank_temperature_conflict');
    if (tank.ph != null && Number.isFinite(tank.ph)) {
      const candidateTankPhFit = rangeContains(tank.ph, candidateSpecies.phMin, candidateSpecies.phMax);
      if (candidateTankPhFit === false) raise('caution', 'tank_ph_conflict');
    }
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
      if (existingTankTemperatureFit === null && tank.targetTemperatureC != null) raiseFactGap([existing], 'temperature', 'temperature_range_missing');
      if (existingTankTemperatureFit === false) raise('not_recommended', 'tank_temperature_conflict');
      if (tank.ph != null && Number.isFinite(tank.ph)) {
        const existingTankPhFit = rangeContains(tank.ph, existing.phMin, existing.phMax);
        if (existingTankPhFit === false) raise('caution', 'tank_ph_conflict');
      }
      if (existing.minTankLiters != null && tank.volumeLiters != null && tank.volumeLiters < existing.minTankLiters) {
        raise('caution', 'tank_volume_below_species_minimum');
      }
      if (existing.minTankLengthCm != null && tank.lengthCm != null && tank.lengthCm < existing.minTankLengthCm) {
        raise('caution', 'tank_length_below_species_minimum');
      }
    }
  }
  if (candidateSpecies?.minimumGroupSize != null && candidateSpecies.minimumGroupSize > 1) {
    const existingSameSpecies = existingQuantities?.[candidateSpecies.id] || 0;
    const plannedTotal = existingSameSpecies + (candidateQuantity || 1);
    if (plannedTotal < candidateSpecies.minimumGroupSize) {
      raise('caution', 'minimum_group_not_met');
    }
  }

  const plannedQuantityFor = (species: DomainSpeciesFact) => {
    const existingQuantity = existingQuantities?.[species.id];
    if (candidateSpecies?.id === species.id) return (existingQuantity ?? 0) + (candidateQuantity || 1);
    return existingQuantity ?? null;
  };
  const hasManagedFinNippingRisk = (species: DomainSpeciesFact) => (
    species.behaviorTraits?.includes('fin_nipping')
    || species.finNippingRisk === 'medium'
    || species.finNippingRisk === 'high'
  );
  const behaviorGroupSpecies = [
    ...existingSpecies,
    ...(candidateSpecies && !existingSpecies.some(species => species.id === candidateSpecies.id) ? [candidateSpecies] : []),
  ];
  if (behaviorGroupSpecies.some(species => (
    hasConspecificTerritorialTrait(species)
    && plannedQuantityFor(species) != null
    && plannedQuantityFor(species)! > 1
  ))) {
    raise('caution', 'territorial_conflict');
  }
  if (behaviorGroupSpecies.some(species => (
    hasManagedFinNippingRisk(species)
    && species.minimumGroupSize != null
    && species.minimumGroupSize > 1
    && plannedQuantityFor(species) != null
    && plannedQuantityFor(species)! < species.minimumGroupSize
  ))) {
    raise('caution', 'fin_nipping_group_pressure');
  }

  if (explicitPairStatus) raise(explicitPairStatus, 'reviewed_pair_rule');
  for (const boundary of pairEvidenceBoundaries) {
    raise(boundary.status, boundary.code);
  }

  const observedStatus = observedStatusOf(tank?.observedSignals);
  if (observedStatus === 'emergency') raise('not_recommended', 'observed_emergency');
  if (observedStatus === 'intervene') raise('caution', 'observed_intervention');

  if (candidateSpecies && tank?.volumeLiters && tank.volumeLiters > 0) {
    const screening = assessBioloadScreening([
      ...existingSpecies.map(species => ({ size: species.size, quantity: existingQuantities?.[species.id] || 1 })),
      { size: candidateSpecies.size, quantity: candidateQuantity || 1 },
    ], tank.volumeLiters);
    // Bioload here is deliberately only a coarse screening signal. It uses
    // broad body-size buckets and does not know filtration turnover, mature
    // biomass, oxygen, maintenance history or measured nitrogen waste. It may
    // raise a caution, but it must never be the sole reason to block stocking.
    const trustedStableContext = hasTrustedStableContext(tank);
    if (screening.pressure === 'high') {
      raise('caution', trustedStableContext ? 'bioload_screening_high_stable_context' : 'bioload_screening_high');
    } else if (screening.pressure === 'elevated') {
      if (trustedStableContext) ruleCodes.push('bioload_screening_elevated_stable_context');
      else raise('caution', 'bioload_screening_elevated');
    }
  }

  if (ruleCodes.length === 0 && status === 'compatible') ruleCodes.push('compatibility_clear');
  if (hasPartialRiskCoverage) ruleCodes.push('risk_coverage_partial');

  // Decision-critical authority is identity + water + temperature + adult size.
  // Missing optional risk-detail fields (pH/space/social/territorial/predation)
  // lower evidence completeness but do not create a risk verdict by themselves.
  // Hard safety blocks and genuine decision-critical evidence ceilings still
  // outrank this partial-coverage state.
  const finalStatus: CompatibilityDecisionStatus = status;
  const hasHardPairEvidenceBoundary = pairEvidenceBoundaries.some(boundary => boundary.status === 'insufficient_data');
  const hasDecisionCriticalResearchGap = ruleCodes.some(code => (
    code === 'species_review_pending'
    || code === 'species_evidence_ceiling'
    || code.startsWith('review_pending_')
    || code.startsWith('evidence_ceiling_')
    || code.startsWith('pair_')
  ));
  const hasOptionalTankInputGap = ruleCodes.some(code => (
    code === 'tank_temperature_unreported'
    || code === 'tank_volume_unreported_length_available'
    || code === 'tank_water_type_unreported_species_overlap'
  ));
  const decisionReadiness: CompatibilityDecisionReadiness = hasIdentityUnresolved || hasUnreviewedHardEvidenceCeiling || hasLegacyUnreviewedSpecies || hasHardPairEvidenceBoundary
    ? 'unknown'
    : hasPartialRiskCoverage || hasDecisionCriticalResearchGap || hasOptionalTankInputGap || !allSpeciesReviewed || !allRequiredTraitsReady || isInsufficientData(finalStatus)
      ? 'partial'
      : 'reviewed';

  return {
    status: finalStatus,
    addPolicy: getCompatibilityAddPolicy(intent, finalStatus),
    ruleCodes: [...new Set(ruleCodes)],
    catalogVersion,
    ruleVersion: COMPATIBILITY_RULE_VERSION,
    decisionReadiness,
    stockingGuidance: stockingGuidanceOf(candidateSpecies, candidateQuantity),
    observedStatus,
    evidenceIds: Array.from(new Set([
      ...(candidateSpecies?.evidenceIds || []),
      ...existingSpecies.flatMap(species => species.evidenceIds || []),
      ...pairEvidenceBoundaries.flatMap(boundary => boundary.evidenceIds || []),
    ])),
  };
};
