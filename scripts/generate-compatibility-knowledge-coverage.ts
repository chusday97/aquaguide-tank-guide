import { readFileSync, writeFileSync } from 'node:fs';
import { fishData } from '../src/data/fishData';
import { getCatalogFieldReviews } from '../src/data/catalogFieldReviews';
import { getCatalogIdentityBoundary, type CatalogIdentityBoundaryCode } from '../src/data/catalogIdentityBoundaries';
import {
  getCompatibilityEvidenceAudit,
  getReviewedCompatibilityProfile,
  getReviewedCompatibilityProfileForFish,
} from '../src/data/compatibilityEvidence';
import { evaluateSpeciesCombination } from '../src/lib/tankCompatibilityEngine';
import { getLifeType } from '../src/modules/species/species.service';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';

type CompletionRow = {
  species_id: string;
  common_name: string;
  scientific_name: string;
  life_type: string;
  category: string;
  applicable_fields: string[];
  field_status: Record<string, string>;
  commonness_proxy: string;
  risk_proxy: string;
  priority_score: number;
};

const matrix = JSON.parse(readFileSync('docs/species_knowledge_completion_matrix.json', 'utf8'));
const rows: CompletionRow[] = matrix.rows || matrix.items || matrix;
const rowById = new Map(rows.map(row => [row.species_id, row]));
const fishById = new Map(fishData.map(fish => [fish.id, fish]));
const audit = getCompatibilityEvidenceAudit();

const allFields = ['feeding', 'environment', 'space', 'social', 'care'] as const;
const criticalFields = ['environment', 'space', 'social'] as const;

const fieldCoverage = Object.fromEntries(allFields.map(field => {
  const applicableRows = rows.filter(row => row.applicable_fields.includes(field));
  const supported = applicableRows.filter(row => row.field_status[field] === 'reviewed_supported').length;
  const unknown = applicableRows.filter(row => row.field_status[field] === 'reviewed_unknown').length;
  return [field, {
    applicable: applicableRows.length,
    reviewed_supported: supported,
    reviewed_unknown: unknown,
    supported_pct: applicableRows.length === 0 ? 0 : Number((supported * 100 / applicableRows.length).toFixed(1)),
  }];
}));

const eligibleSpecies = fishData.filter(fish => !['plant', 'hardscape'].includes(getLifeType(fish)));
const launchRows = rows.filter(row => row.commonness_proxy === 'launch_cohort');

type GapBoundaryCode =
  | 'multi_water_type_not_representable'
  | 'variant_authority_not_promotable'
  | CatalogIdentityBoundaryCode
  | 'catalog_identity_unresolved';

const speciesBoundaryCodes = (row: CompletionRow): GapBoundaryCode[] => {
  const knowledge = getReviewedSpeciesKnowledge(row.species_id);
  const environmentText = [
    ...(knowledge?.environment?.notes || []),
    knowledge?.environment?.evidence.note || '',
  ].join(' ');
  const variantText = [
    ...((knowledge?.environment?.notes || [])),
    knowledge?.environment?.evidence.note || '',
    knowledge?.socialBehavior?.summary || '',
    knowledge?.socialBehavior?.evidence.note || '',
    ...((knowledge?.spaceAndGrowth?.spaceNotes || [])),
    knowledge?.spaceAndGrowth?.evidence.note || '',
  ].join(' ');

  const codes: GapBoundaryCode[] = [];
  if (
    knowledge?.environment?.waterType === 'unknown'
    && (knowledge?.environment?.waterTypes?.length || 0) < 2
    && /freshwater/i.test(environmentText)
    && /brackish/i.test(environmentText)
  ) {
    codes.push('multi_water_type_not_representable');
  }
  if (
    row.scientific_name.toLowerCase().includes(' var.')
    && /(禁止把基础种|基础种.*不能|不能把基础种|不能替代.*品系|品系级)/.test(variantText)
  ) {
    codes.push('variant_authority_not_promotable');
  }
  const identityReview = getCatalogFieldReviews(row.species_id).find(review => (
    review.field === 'identity'
    && review.status === 'reviewed'
    && review.resolution === 'unknown'
  ));
  const identityBoundary = getCatalogIdentityBoundary(row.species_id);
  if (identityBoundary) {
    codes.push(identityBoundary.code);
  } else if (
    identityReview
    || /(commercial.*form.*not identified|does not identify.*commercial variant|品系身份.*未.*确认|商业命名.*未.*确认|商业.*品系.*对应关系.*确认|商业名.*物种名.*混用)/i.test(variantText)
  ) {
    codes.push('catalog_identity_unresolved');
  }
  return codes;
};

const boundaryResolution = (codes: GapBoundaryCode[]) => {
  if (codes.includes('multi_water_type_not_representable')) {
    return 'representation_change';
  }
  if (codes.includes('variant_authority_not_promotable')) {
    return 'variant_authority_review';
  }
  if (
    codes.includes('catalog_identity_unresolved')
    || codes.includes('trade_name_taxon_ambiguous')
    || codes.includes('accepted_taxon_alias_trade_ambiguous')
    || codes.includes('commercial_hybrid_identity_unresolved')
  ) {
    return 'identity_review';
  }
  return 'evidence_research';
};

const speciesGapCandidates = launchRows.map(row => {
  const fish = fishById.get(row.species_id);
  const criticalUnknown = criticalFields.filter(field => (
    row.applicable_fields.includes(field) && row.field_status[field] !== 'reviewed_supported'
  ));
  const directProfile = Boolean(getReviewedCompatibilityProfile(row.species_id));
  const effectiveProfile = fish ? Boolean(getReviewedCompatibilityProfileForFish(fish)) : false;
  const inheritedProfile = effectiveProfile && !directProfile;
  const gapKinds = [
    ...criticalUnknown,
    ...(effectiveProfile ? [] : ['compatibility_profile']),
  ];
  const boundaryCodes = speciesBoundaryCodes(row);
  const identityBoundary = getCatalogIdentityBoundary(row.species_id);
  const score = Number(row.priority_score || 0)
    + criticalUnknown.length * 4
    + (effectiveProfile ? 0 : 5)
    + (row.risk_proxy === 'elevated' ? 2 : 0);
  return {
    species_id: row.species_id,
    common_name: row.common_name,
    scientific_name: row.scientific_name,
    score,
    gap_kinds: gapKinds,
    field_status: Object.fromEntries(criticalFields.map(field => [field, row.field_status[field] || 'missing'])),
    compatibility_profile: directProfile ? 'direct_reviewed' : inheritedProfile ? 'inherited_reviewed' : 'none',
    boundary_codes: boundaryCodes,
    identity_boundary: identityBoundary ? {
      code: identityBoundary.code,
      resolved_granularity: identityBoundary.resolvedGranularity,
      candidate_taxa: identityBoundary.candidateTaxa,
      source_ids: identityBoundary.sourceIds,
      note: identityBoundary.note,
      reviewed_at: identityBoundary.reviewedAt,
    } : null,
    resolution_mode: boundaryResolution(boundaryCodes),
    resolution_note: boundaryCodes.includes('multi_water_type_not_representable')
      ? 'Reviewed evidence supports more than one water type while the current Compatibility profile accepts only one; do not force a single value.'
      : boundaryCodes.includes('variant_authority_not_promotable')
        ? 'Base-species evidence exists, but current reviewed policy forbids automatic promotion to this ornamental variant; require direct variant evidence or an explicit reviewed bridge.'
        : identityBoundary
          ? identityBoundary.note
          : boundaryCodes.includes('catalog_identity_unresolved')
            ? 'The catalog trade-name/object identity is not securely mapped to a reviewed taxon. Resolve identity before promoting husbandry or compatibility evidence.'
            : 'Continue targeted evidence research for the missing compatibility-critical fields.',
    priority_basis: 'launch_cohort_proxy + compatibility-critical evidence gap',
  };
}).filter(item => item.gap_kinds.length > 0);

const reviewedPairKeys = new Set(
  audit.reviewedPairRules.map(rule => [...rule.speciesIds].sort().join('::')),
);
const launchFish = launchRows
  .map(row => fishById.get(row.species_id))
  .filter((fish): fish is NonNullable<typeof fish> => Boolean(fish));

const pairGaps: Array<Record<string, unknown>> = [];
for (let leftIndex = 0; leftIndex < launchFish.length; leftIndex += 1) {
  for (let rightIndex = leftIndex + 1; rightIndex < launchFish.length; rightIndex += 1) {
    const left = launchFish[leftIndex];
    const right = launchFish[rightIndex];
    const result = evaluateSpeciesCombination([left, right]);
    if (result.status !== 'insufficient_data') continue;
    const leftRow = rowById.get(left.id);
    const rightRow = rowById.get(right.id);
    const pairKey = [left.id, right.id].sort().join('::');
    const directPair = reviewedPairKeys.has(pairKey);
    const missingCodes = Array.from(new Set(result.missingData.map(rule => rule.code))).sort();
    const warningCodes = Array.from(new Set(result.warningRules.map(rule => rule.code))).sort();
    const score = 20
      + (leftRow?.risk_proxy === 'elevated' ? 2 : 0)
      + (rightRow?.risk_proxy === 'elevated' ? 2 : 0)
      + (directPair ? 0 : 3)
      + Math.min(missingCodes.length, 4);
    pairGaps.push({
      species_a_id: left.id,
      species_a_name: left.name,
      species_b_id: right.id,
      species_b_name: right.name,
      status: result.status,
      direct_reviewed_pair_rule: directPair,
      missing_codes: missingCodes,
      warning_codes: warningCodes,
      score,
      priority_basis: 'launch_cohort pair + current insufficient_data + evidence gap',
    });
  }
}
pairGaps.sort((left, right) => {
  const scoreDiff = Number(right.score) - Number(left.score);
  if (scoreDiff !== 0) return scoreDiff;
  const leftKey = String(left.species_a_id) + '::' + String(left.species_b_id);
  const rightKey = String(right.species_a_id) + '::' + String(right.species_b_id);
  return leftKey.localeCompare(rightKey);
});

const boundaryCodesBySpecies = new Map(
  launchRows.map(row => [row.species_id, speciesBoundaryCodes(row)]),
);
for (const item of pairGaps) {
  const leftCodes = boundaryCodesBySpecies.get(String(item.species_a_id)) || [];
  const rightCodes = boundaryCodesBySpecies.get(String(item.species_b_id)) || [];
  const boundaryCodes = Array.from(new Set([...leftCodes, ...rightCodes])).sort();
  item.boundary_codes = boundaryCodes;
  item.resolution_mode = boundaryCodes.length > 0 ? 'boundary_blocked' : 'evidence_research';
  item.resolution_note = boundaryCodes.length > 0
    ? 'At least one root species is blocked by a representation or reviewed-variant authority boundary; ordinary evidence search alone may not clear this pair.'
    : 'Continue targeted pair/species evidence research.';
}

const pairGapImpact = new Map<string, number>();
for (const item of pairGaps) {
  const leftId = String(item.species_a_id);
  const rightId = String(item.species_b_id);
  pairGapImpact.set(leftId, (pairGapImpact.get(leftId) || 0) + 1);
  pairGapImpact.set(rightId, (pairGapImpact.get(rightId) || 0) + 1);
}

const speciesGaps = speciesGapCandidates.map(item => {
  const blockedPairCount = pairGapImpact.get(item.species_id) || 0;
  return {
    ...item,
    blocked_pair_count: blockedPairCount,
    score: item.score + Math.min(blockedPairCount, 20) * 2,
    priority_basis: item.priority_basis + ' + pair-gap unlock impact',
  };
}).sort((left, right) => (
  right.blocked_pair_count - left.blocked_pair_count
  || right.score - left.score
  || left.species_id.localeCompare(right.species_id)
));

const report = {
  schema_version: 1,
  completion_boundary: 'Completion means every catalog object reached a reviewed terminal state. reviewed_unknown is valid completion, not evidence for a positive compatibility claim.',
  coverage_boundary: 'Coverage counts reviewed_supported evidence. reviewed_unknown remains fail-closed and becomes a research opportunity, not a data error.',
  telemetry_boundary: 'Priority uses launch_cohort/commonness proxy plus evidence gaps. Real user-query telemetry is not used or claimed.',
  uses_real_user_telemetry: false,
  catalog_objects: fishData.length,
  completion_matrix_objects: rows.length,
  compatibility_eligible_species: eligibleSpecies.length,
  reviewed_compatibility_profiles: audit.reviewedSpeciesIds.length,
  reviewed_pair_rules: audit.reviewedPairRules.length,
  reviewed_stage_risk_profiles: audit.reviewedStageRiskProfiles.length,
  launch_cohort_species: launchRows.length,
  compatibility_critical_fields: ['environment', 'space', 'social', 'compatibility_profile', 'pair_evidence'],
  field_coverage: fieldCoverage,
  priority_species_gap_count: speciesGaps.length,
  priority_pair_gap_count: pairGaps.length,
  evidence_research_pair_gap_count: pairGaps.filter(item => item.resolution_mode === 'evidence_research').length,
  boundary_blocked_pair_gap_count: pairGaps.filter(item => item.resolution_mode === 'boundary_blocked').length,
  top_pair_gap_root_species: speciesGaps
    .filter(item => item.blocked_pair_count > 0)
    .slice(0, 10)
    .map(item => ({
      species_id: item.species_id,
      common_name: item.common_name,
      blocked_pair_count: item.blocked_pair_count,
      gap_kinds: item.gap_kinds,
      boundary_codes: item.boundary_codes,
      resolution_mode: item.resolution_mode,
      score: item.score,
    })),
};

const gapQueue = {
  schema_version: 1,
  telemetry_boundary: report.telemetry_boundary,
  uses_real_user_telemetry: false,
  species_gaps: speciesGaps,
  pair_gaps: pairGaps,
};

writeFileSync('docs/compatibility_knowledge_coverage.json', JSON.stringify(report, null, 2) + '\n');
writeFileSync('docs/compatibility_knowledge_gap_queue.json', JSON.stringify(gapQueue, null, 2) + '\n');

const markdown: string[] = [];
markdown.push('# Compatibility Knowledge Coverage');
markdown.push('');
markdown.push('## Interpretation');
markdown.push('');
markdown.push('- Completion and evidence coverage are different.');
markdown.push('- reviewed_unknown is a valid reviewed terminal state, but it is not counted as reviewed_supported.');
markdown.push('- Compatibility research prioritizes environment, space, social/behavior, compatibility profiles, and pair evidence.');
markdown.push('- Feeding and care remain useful knowledge fields but do not outrank compatibility-critical gaps.');
markdown.push('- Priority currently uses the launch-cohort/commonness proxy. It does not claim real user-query telemetry.');
markdown.push('');
markdown.push('## Coverage snapshot');
markdown.push('');
markdown.push('- Catalog objects: ' + report.catalog_objects);
markdown.push('- Compatibility-eligible species: ' + report.compatibility_eligible_species);
markdown.push('- Reviewed compatibility profiles: ' + report.reviewed_compatibility_profiles);
markdown.push('- Reviewed pair rules: ' + report.reviewed_pair_rules);
markdown.push('- Reviewed stage-risk profiles: ' + report.reviewed_stage_risk_profiles);
markdown.push('- Launch-cohort species: ' + report.launch_cohort_species);
markdown.push('- Current insufficient pair gaps: ' + report.priority_pair_gap_count);
markdown.push('- Evidence-research-only pair gaps: ' + report.evidence_research_pair_gap_count);
markdown.push('- Boundary-blocked pair gaps: ' + report.boundary_blocked_pair_gap_count);
markdown.push('');
markdown.push('| Field | Applicable | Reviewed supported | Reviewed unknown | Supported coverage |');
markdown.push('| --- | ---: | ---: | ---: | ---: |');
for (const field of allFields) {
  const value = fieldCoverage[field] as { applicable: number; reviewed_supported: number; reviewed_unknown: number; supported_pct: number };
  markdown.push('| ' + field + ' | ' + value.applicable + ' | ' + value.reviewed_supported + ' | ' + value.reviewed_unknown + ' | ' + value.supported_pct.toFixed(1) + '% |');
}
markdown.push('');
markdown.push('## Highest-priority species gaps');
markdown.push('');
speciesGaps.slice(0, 20).forEach((item, index) => {
  markdown.push(String(index + 1) + '. ' + item.common_name + ' (' + item.species_id + ') — ' + item.gap_kinds.join(', ') + ' — ' + item.resolution_mode + (item.boundary_codes.length ? ' [' + item.boundary_codes.join(', ') + ']' : '') + ' — unlocks ' + item.blocked_pair_count + ' insufficient pairs — score ' + item.score);
});
if (speciesGaps.length === 0) markdown.push('No launch-cohort species gaps.');
markdown.push('');
markdown.push('## Highest-priority pair gaps');
markdown.push('');
pairGaps.slice(0, 20).forEach((item, index) => {
  markdown.push(String(index + 1) + '. ' + item.species_a_name + ' × ' + item.species_b_name + ' — missing: ' + ((item.missing_codes as string[]).join(', ') || 'unspecified') + ' — ' + item.resolution_mode + (Array.isArray(item.boundary_codes) && item.boundary_codes.length ? ' [' + (item.boundary_codes as string[]).join(', ') + ']' : '') + ' — score ' + item.score);
});
if (pairGaps.length === 0) markdown.push('No launch-cohort pair currently returns insufficient_data.');
markdown.push('');
markdown.push('## Research workflow');
markdown.push('');
markdown.push('1. Take the highest-ranked gap.');
markdown.push('2. If resolution_mode is evidence_research, research only the missing compatibility-critical field or pair relationship.');
markdown.push('3. If a boundary code is present, resolve the representation, variant-authority, or catalog-identity boundary before repeating ordinary evidence search.');
markdown.push('4. Add reviewed authority with citations only when reliable evidence exists.');
markdown.push('5. Keep reviewed_unknown when reliable evidence does not exist.');
markdown.push('6. Regenerate this report and add regression coverage.');
markdown.push('7. Run npm run test:backend-release-gate.');

writeFileSync('docs/compatibility_knowledge_coverage.md', markdown.join('\n') + '\n');

console.log(JSON.stringify(report, null, 2));
console.log('TOP_SPECIES_GAPS');
speciesGaps.slice(0, 15).forEach((item, index) => {
  console.log(String(index + 1) + '. ' + item.common_name + ' (' + item.species_id + '): ' + item.gap_kinds.join(', ') + ' mode=' + item.resolution_mode + ' boundaries=' + item.boundary_codes.join(',') + ' blocked_pairs=' + item.blocked_pair_count + ' score=' + item.score);
});
console.log('TOP_PAIR_GAPS');
pairGaps.slice(0, 15).forEach((item, index) => {
  console.log(String(index + 1) + '. ' + item.species_a_name + ' x ' + item.species_b_name + ': ' + (item.missing_codes as string[]).join(', ') + ' score=' + item.score);
});
