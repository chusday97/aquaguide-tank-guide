import type { TankCompatibilityRule } from '../tankCompatibilityEngine';

export type PrioritizableRule = {
  code: string;
  title?: string;
  evidence?: string;
  severity?: string;
  affectedSpeciesIds?: string[];
};

const RULE_PRIORITY: Record<string, number> = {
  observed_emergency: 0,
  water_type_conflict: 10,
  species_water_type_conflict: 10,
  candidate_tank_water_type_conflict: 10,
  fry_predation_risk: 19,
  predation_risk: 20,
  predation_scope_uncertain: 45,
  species_tank_required: 22,
  single_housing_required: 25,
  temperature_range_conflict: 30,
  temperature_no_overlap: 30,
  tank_temperature_conflict: 32,
  reviewed_pair_rule: 35,
  observed_intervention: 40,
  predation_vulnerability_context: 50,
  fin_nipping_target_vulnerability: 60,
  length_too_short: 65,
  territorial_pressure_context: 70,
  territorial_conflict: 72,
  breeding_territory_active: 74,
  fin_nipping_group_pressure: 80,
  group_requirement_gap: 89,
  minimum_group_not_met: 89,
  ph_range_conflict: 100,
  tank_ph_conflict: 102,
  ph_range_edge_overlap: 105,
  tank_length_below_species_minimum: 65,
  volume_too_small: 112,
  tank_volume_below_species_minimum: 112,
  volume_needs_adjustment: 116,
  bioload_screening_high: 120,
  bioload_over_limit: 122,
  bioload_screening_elevated: 125,
  bioload_near_limit: 127,
  tank_missing: 200,
  tank_water_type_missing: 205,
  candidate_water_type_missing: 210,
  tank_temperature_missing: 215,
  temperature_range_missing: 220,
  species_evidence_unreviewed: 225,
  ph_range_missing: 230,
};

export const getCompatibilityRuleFamily = (code: string) => {
  const normalized = code.toLowerCase();
  if (normalized.includes('water_type')) return 'water_type';
  if (normalized.includes('predation') || normalized.includes('prey')) return 'predation';
  if (normalized.includes('species_tank') || normalized.includes('single_housing')) return 'housing';
  if (normalized.includes('temperature')) return 'temperature';
  if (normalized.includes('fin_nipping') || normalized.includes('attack') || normalized.includes('aggression')) return 'aggression';
  if (normalized.includes('territor')) return 'territory';
  if (normalized.includes('ph_') || normalized === 'ph' || normalized.includes('ph_range')) return 'ph';
  if (normalized.includes('minimum_group') || normalized.includes('group_requirement') || normalized.includes('school')) return 'group_size';
  if (normalized.includes('volume') || normalized.includes('length') || normalized.includes('space')) return 'space';
  if (normalized.includes('bioload')) return 'bioload';
  if (normalized.includes('observed_')) return 'observed';
  if (normalized.includes('equipment') || normalized.includes('filter') || normalized.includes('heater') || normalized.includes('oxygen')) return 'equipment';
  if (normalized.includes('unreviewed') || normalized.includes('unknown') || normalized.includes('missing')) return 'missing_information';
  return normalized;
};

const severityPriority = (severity?: string) => (
  severity === 'high' ? 0 : severity === 'medium' ? 1 : severity === 'low' ? 2 : 3
);

const deterministicRuleTieBreakKey = (rule: PrioritizableRule) => ([
  rule.code,
  [...(rule.affectedSpeciesIds || [])].sort().join(','),
  rule.title || '',
  rule.evidence || '',
].join('::'));

export const prioritizeCompatibilityRules = <T extends PrioritizableRule>(rules: T[]): T[] => (
  rules
    .map((rule, index) => ({ rule, index }))
    .sort((a, b) => (
      (RULE_PRIORITY[a.rule.code] ?? (a.rule.code.startsWith('pair_rule_') ? 35 : 500))
      - (RULE_PRIORITY[b.rule.code] ?? (b.rule.code.startsWith('pair_rule_') ? 35 : 500))
      || severityPriority(a.rule.severity) - severityPriority(b.rule.severity)
      || deterministicRuleTieBreakKey(a.rule).localeCompare(deterministicRuleTieBreakKey(b.rule), 'en')
      || a.index - b.index
    ))
    .map(item => item.rule)
);

export const prioritizeDistinctCompatibilityRules = <T extends PrioritizableRule>(rules: T[]): T[] => {
  const seenFamilies = new Set<string>();
  return prioritizeCompatibilityRules(rules).filter(rule => {
    const family = getCompatibilityRuleFamily(rule.code);
    if (seenFamilies.has(family)) return false;
    seenFamilies.add(family);
    return true;
  });
};

export const getCompatibilityRuleSemanticKey = (code: string) => {
  const normalized = code.toLowerCase();

  if (normalized.startsWith('pair_rule_predation')) return 'predation:threat';
  if (normalized.startsWith('pair_rule_fin_nipping')) return 'aggression:fin_nipping_target';
  if (normalized.startsWith('pair_rule_behavior_and_territor')) return 'territory:conflict';

  if (
    normalized === 'water_type_conflict'
    || normalized === 'species_water_type_conflict'
    || normalized === 'candidate_tank_water_type_conflict'
    || normalized === 'water_type_mismatch'
  ) return 'water_type:conflict';

  if (
    normalized === 'temperature_range_conflict'
    || normalized === 'temperature_no_overlap'
    || normalized === 'tank_temperature_conflict'
    || normalized === 'temperature_mismatch'
  ) return 'temperature:conflict';

  if (
    normalized === 'ph_range_conflict'
    || normalized === 'ph_range_gap'
    || normalized === 'ph_range_edge_overlap'
    || normalized === 'tank_ph_conflict'
    || normalized === 'ph_mismatch'
  ) return 'ph:fit';

  if (normalized === 'predation_risk') return 'predation:threat';
  if (normalized === 'fry_predation_risk' || normalized === 'conspecific_fry_predation') return 'predation:fry';
  if (normalized === 'juvenile_predation_risk') return 'predation:juvenile';
  if (normalized === 'predation_scope_uncertain') return 'predation:scope';
  if (normalized === 'predation_vulnerability_context') return 'predation:vulnerability';

  if (normalized === 'territorial_conflict') return 'territory:conflict';
  if (normalized === 'territorial_pressure_context') return 'territory:pressure';
  if (normalized === 'breeding_territory_active') return 'territory:breeding';

  if (normalized === 'fin_nipping_target_vulnerability') return 'aggression:fin_nipping_target';
  if (normalized === 'fin_nipping_group_pressure') return 'aggression:fin_nipping_group';
  if (normalized === 'fin_nipping_risk') return 'aggression:fin_nipping_generic';

  if (normalized === 'minimum_group_not_met' || normalized === 'group_requirement_gap') {
    return 'group_size:minimum';
  }

  if (normalized === 'tank_length_below_species_minimum' || normalized === 'length_too_short') {
    return 'space:length';
  }
  if (
    normalized === 'tank_volume_below_species_minimum'
    || normalized === 'volume_too_small'
    || normalized === 'volume_needs_adjustment'
  ) return 'space:volume';

  if (
    normalized === 'bioload_screening_high'
    || normalized === 'bioload_screening_elevated'
    || normalized === 'bioload_screening_high_stable_context'
    || normalized === 'bioload_over_limit'
    || normalized === 'bioload_near_limit'
  ) return 'bioload:screening';

  return `${getCompatibilityRuleFamily(normalized)}:${normalized}`;
};

const isConcretePairRule = (rule: TankCompatibilityRule) => (
  rule.code.startsWith('pair_rule_')
  && rule.reviewStatus === 'reviewed'
  && rule.citations.length > 0
);

const CANONICAL_DOMAIN_RULE_CODES = new Set([
  'water_type_conflict',
  'species_water_type_conflict',
  'candidate_tank_water_type_conflict',
  'temperature_range_conflict',
  'tank_temperature_conflict',
  'ph_range_conflict',
  'ph_range_edge_overlap',
  'tank_ph_conflict',
  'tank_volume_below_species_minimum',
  'tank_length_below_species_minimum',
  'predation_risk',
  'fry_predation_risk',
  'juvenile_predation_risk',
  'predation_scope_uncertain',
  'predation_vulnerability_context',
  'territorial_conflict',
  'territorial_pressure_context',
  'breeding_territory_active',
  'species_tank_required',
  'single_housing_required',
  'minimum_group_not_met',
  'fin_nipping_group_pressure',
  'fin_nipping_target_vulnerability',
  'shared_bottom_zone_context',
  'bioload_screening_high',
  'bioload_screening_elevated',
  'bioload_screening_high_stable_context',
  'observed_emergency',
  'observed_intervention',
]);

const representativeRank = (rule: TankCompatibilityRule) => {
  // A direct reviewed pair rule is the most specific authority for that exact
  // relationship. Otherwise preserve Domain's canonical vocabulary instead of
  // allowing an older legacy alias to become the surviving runtime rule.
  if (isConcretePairRule(rule)) return 0;
  if (CANONICAL_DOMAIN_RULE_CODES.has(rule.code)) return 1;
  if (rule.reviewStatus === 'reviewed' && rule.citations.length > 0) return 2;
  if (rule.reviewStatus === 'reviewed') return 3;
  return 4;
};

const dedupeCitations = (rules: TankCompatibilityRule[], reviewedOnly: boolean) => {
  const seen = new Set<string>();
  return rules.flatMap(rule => rule.citations).filter(citation => {
    if (reviewedOnly && citation.reviewStatus !== 'reviewed') return false;
    if (seen.has(citation.id)) return false;
    seen.add(citation.id);
    return true;
  });
};

const explicitThresholdEvidence = (
  semanticKey: string,
  rules: TankCompatibilityRule[],
) => {
  if (
    semanticKey !== 'space:length'
    && semanticKey !== 'space:volume'
    && semanticKey !== 'group_size:minimum'
  ) return null;

  const candidates = rules.filter(rule => /\d/.test(rule.evidence || ''));
  if (!candidates.length) return null;
  return [...candidates].sort((left, right) => (
    (right.evidence?.length || 0) - (left.evidence?.length || 0)
  ))[0].evidence;
};

const mergeSemanticRuleGroup = (semanticKey: string, rules: TankCompatibilityRule[]) => {
  const ordered = prioritizeCompatibilityRules(rules);
  const primary = [...ordered].sort((left, right) => (
    representativeRank(left) - representativeRank(right)
    || ordered.indexOf(left) - ordered.indexOf(right)
  ))[0];
  const primaryIsDirectPair = isConcretePairRule(primary);
  const citationRules = primaryIsDirectPair
    ? rules.filter(isConcretePairRule)
    : rules;
  const affectedSpeciesIds = Array.from(new Set(
    rules.flatMap(rule => rule.affectedSpeciesIds || []),
  )).sort((left, right) => left.localeCompare(right, 'en'));
  const citations = dedupeCitations(
    citationRules,
    primary.reviewStatus === 'reviewed',
  );

  const thresholdEvidence = explicitThresholdEvidence(semanticKey, rules);

  return {
    ...primary,
    ...(thresholdEvidence ? { evidence: thresholdEvidence } : {}),
    affectedSpeciesIds,
    citations,
  };
};

const affectedSpeciesScopeKey = (rule: TankCompatibilityRule) => (
  [...(rule.affectedSpeciesIds || [])].sort().join('|')
);

const PAIRWISE_SCOPE_SEMANTICS = new Set([
  'water_type:conflict',
  'temperature:conflict',
  'ph:fit',
  'predation:threat',
  'predation:fry',
  'predation:juvenile',
  'territory:conflict',
  'aggression:fin_nipping_target',
]);

const prefersSingleSpeciesScope = (semanticKey: string) => (
  semanticKey.startsWith('housing:')
  || semanticKey === 'group_size:minimum'
  || semanticKey === 'space:length'
  || semanticKey === 'space:volume'
);

const scopeSize = (rule: TankCompatibilityRule) => (
  new Set(rule.affectedSpeciesIds || []).size
);

const mergeSemanticRulesByAffectedScope = (
  semanticKey: string,
  rules: TankCompatibilityRule[],
): TankCompatibilityRule[] => {
  const genericRules = rules.filter(rule => affectedSpeciesScopeKey(rule) === '');
  const scopedRules = rules.filter(rule => affectedSpeciesScopeKey(rule) !== '');

  // Whole-tank load is intentionally unscoped. If both a canonical tank-level
  // summary and older scoped aliases exist, keep one tank-level rule.
  if (semanticKey === 'bioload:screening' && genericRules.length) {
    return [mergeSemanticRuleGroup(semanticKey, genericRules)];
  }

  if (!scopedRules.length) return [mergeSemanticRuleGroup(semanticKey, rules)];

  let actionableScopedRules = scopedRules;
  if (PAIRWISE_SCOPE_SEMANTICS.has(semanticKey)) {
    const pairScoped = scopedRules.filter(rule => scopeSize(rule) === 2);
    if (pairScoped.length) actionableScopedRules = pairScoped;
  } else if (prefersSingleSpeciesScope(semanticKey)) {
    const singleScoped = scopedRules.filter(rule => scopeSize(rule) === 1);
    if (singleScoped.length) actionableScopedRules = singleScoped;
  }

  const byScope = new Map<string, TankCompatibilityRule[]>();
  for (const rule of actionableScopedRules) {
    const scopeKey = affectedSpeciesScopeKey(rule);
    const existing = byScope.get(scopeKey);
    if (existing) existing.push(rule);
    else byScope.set(scopeKey, [rule]);
  }

  // Canonical Domain templates often have no affected IDs before provenance is
  // attached. Replicate those templates into each concrete actionable scope so
  // aliases collapse without turning a pair conflict into an all-tank target.
  return Array.from(byScope.values()).map(group => (
    mergeSemanticRuleGroup(semanticKey, [...genericRules, ...group])
  ));
};

export const consolidateCompatibilityRules = (
  rules: TankCompatibilityRule[],
): TankCompatibilityRule[] => {
  const ordered = prioritizeCompatibilityRules(rules);
  const hasSpecificFinNippingRule = ordered.some(rule => (
    rule.code === 'fin_nipping_target_vulnerability'
    || rule.code === 'fin_nipping_group_pressure'
    || rule.code.startsWith('pair_rule_fin_nipping')
  ));
  const groups = new Map<string, TankCompatibilityRule[]>();

  for (const rule of ordered) {
    if (rule.code === 'fin_nipping_risk' && hasSpecificFinNippingRule) continue;
    const key = getCompatibilityRuleSemanticKey(rule.code);
    const existing = groups.get(key);
    if (existing) existing.push(rule);
    else groups.set(key, [rule]);
  }

  return Array.from(groups.entries()).flatMap(([semanticKey, group]) => mergeSemanticRulesByAffectedScope(semanticKey, group));
};
