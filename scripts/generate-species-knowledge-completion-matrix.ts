import { mkdirSync, writeFileSync } from 'node:fs';
import { fishData } from '../src/data/fishData';
import { selectCompatibilityLaunchCohort } from '../src/data/compatibility-launch-cohort';
import { getReviewedCompatibilityProfile, getReviewedCompatibilityProfileForFish } from '../src/data/compatibilityEvidence';
import { getReviewedSpeciesKnowledge, getReviewedSpeciesKnowledgeForFish } from '../src/modules/knowledge/speciesKnowledge';
import { getLifeType } from '../src/modules/species/species.service';

type FieldStatus = 'reviewed_supported' | 'reviewed_unknown' | 'inherited_reviewed' | 'not_applicable' | 'needs_research' | 'template_only';
type KnowledgeField = 'feeding' | 'environment' | 'space' | 'social' | 'care';

const root = new URL('../', import.meta.url).pathname;
const outputDir = `${root}docs`;
mkdirSync(outputDir, { recursive: true });
const launchIds = new Set(selectCompatibilityLaunchCohort().map(fish => fish.id));
const fields: KnowledgeField[] = ['feeding', 'environment', 'space', 'social', 'care'];
const applicableFields = (lifeType: string): KnowledgeField[] => {
  if (lifeType === 'hardscape') return [];
  if (lifeType === 'plant') return ['environment', 'space', 'care'];
  return fields;
};
const csvRows = new Map<string, Record<string, string>>();
for (const fish of fishData) {
  csvRows.set(fish.id, {
    feeding_uses_template: fish.feedingProfile?.sourceName?.toLowerCase().includes('template') || fish.feedingProfile?.sourceName === 'rule_fallback' ? 'yes' : 'no',
    feeding_needs_review: fish.feedingProfile?.needsReview ? 'yes' : 'no',
    missing_species_specific_care: fish.housingReason ? (fish.housingReason.includes('通常') || fish.housingReason.includes('类别') ? 'yes' : 'no') : 'yes',
  });
}

const statusForEvidence = (section: any, inherited: boolean): FieldStatus => {
  if (!section) return 'needs_research';
  const evidence = section.evidence;
  if (!evidence || evidence.reviewStatus !== 'reviewed') return 'needs_research';
  if (evidence.confidence === 'unknown') return 'reviewed_unknown';
  return inherited ? 'inherited_reviewed' : 'reviewed_supported';
};

const rows = fishData.map((fish) => {
  const lifeType = getLifeType(fish);
  const applicable = applicableFields(lifeType);
  const directKnowledge = getReviewedSpeciesKnowledge(fish.id);
  const knowledge = getReviewedSpeciesKnowledgeForFish(fish);
  const inheritedKnowledge = Boolean(knowledge && !directKnowledge);
  const directCompatibility = getReviewedCompatibilityProfile(fish.id);
  const compatibility = getReviewedCompatibilityProfileForFish(fish);
  const audit = csvRows.get(fish.id)!;
  const fieldStatus: Record<KnowledgeField, FieldStatus> = {} as Record<KnowledgeField, FieldStatus>;
  for (const field of fields) {
    if (!applicable.includes(field)) {
      fieldStatus[field] = 'not_applicable';
      continue;
    }
    if (field === 'feeding') {
      if (!fish.feedingProfile) fieldStatus[field] = 'needs_research';
      else if (audit.feeding_uses_template === 'yes') fieldStatus[field] = 'template_only';
      else if (audit.feeding_needs_review === 'yes' || fish.feedingProfile.sourceUrl?.includes('google.com')) fieldStatus[field] = 'needs_research';
      else fieldStatus[field] = fish.feedingProfile.sourceName?.toLowerCase().includes('inherited') ? 'inherited_reviewed' : 'reviewed_supported';
      continue;
    }
    if (field === 'care') {
      fieldStatus[field] = audit.missing_species_specific_care === 'yes' ? 'template_only' : 'reviewed_supported';
      continue;
    }
    fieldStatus[field] = statusForEvidence(knowledge?.[field === 'social' ? 'socialBehavior' : field === 'space' ? 'spaceAndGrowth' : field], inheritedKnowledge);
  }
  const gaps = fields.filter(field => ['needs_research', 'template_only'].includes(fieldStatus[field]));
  const commonnessProxy = launchIds.has(fish.id) ? 'launch_cohort' : 'catalog_only';
  const riskProxy = launchIds.has(fish.id) || Boolean(compatibility) || fish.temperament !== 'Peaceful' ? 'elevated' : 'standard';
  const priorityScore = gaps.reduce((score, field) => score + (fieldStatus[field] === 'template_only' ? 4 : 5), 0)
    + (commonnessProxy === 'launch_cohort' ? 6 : 0)
    + (riskProxy === 'elevated' ? 3 : 0);
  return {
    species_id: fish.id,
    common_name: fish.name,
    scientific_name: fish.scientificName,
    life_type: lifeType,
    category: fish.category,
    applicable_fields: applicable,
    field_status: fieldStatus,
    gap_fields: gaps,
    direct_species_knowledge: Boolean(directKnowledge),
    inherited_species_knowledge: inheritedKnowledge,
    direct_compatibility_profile: Boolean(directCompatibility),
    inherited_compatibility_profile: Boolean(compatibility && !directCompatibility),
    commonness_proxy: commonnessProxy,
    risk_proxy: riskProxy,
    priority_score: priorityScore,
    evidence_boundary: 'No legacy fishData prose, template text, or base-species inheritance is treated as species-specific reviewed evidence.',
  };
});

const backlog = rows
  .filter(row => row.gap_fields.length > 0 && row.life_type !== 'hardscape')
  .sort((a, b) => b.priority_score - a.priority_score || a.species_id.localeCompare(b.species_id))
  .slice(0, 40)
  .map((row, index) => ({ rank: index + 1, ...row, research_reason: row.gap_fields.map(field => `${field}:${row.field_status[field]}`) }));

const counts = Object.fromEntries(fields.map(field => [field, Object.fromEntries((['reviewed_supported', 'reviewed_unknown', 'inherited_reviewed', 'not_applicable', 'needs_research', 'template_only'] as FieldStatus[]).map(status => [status, rows.filter(row => row.field_status[field] === status).length]))]));
const matrix = { generated_at: new Date().toISOString(), catalog_object_count: rows.length, fields, rows, status_counts: counts, backlog_size: backlog.length, backlog_scope: 'Top 40 research candidates; no authority data was written by this phase.' };
writeFileSync(`${outputDir}/species_knowledge_completion_matrix.json`, `${JSON.stringify(matrix, null, 2)}\n`);
const csvEscape = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;
const csvHeader = ['species_id', 'common_name', 'scientific_name', 'life_type', 'category', ...fields.flatMap(field => fields.includes(field) ? [`${field}_status`] : []), 'gap_fields', 'commonness_proxy', 'risk_proxy', 'priority_score'];
const csv = [csvHeader.join(','), ...rows.map(row => [row.species_id, row.common_name, row.scientific_name, row.life_type, row.category, ...fields.map(field => row.field_status[field]), row.gap_fields.join('|'), row.commonness_proxy, row.risk_proxy, row.priority_score].map(csvEscape).join(','))].join('\n');
writeFileSync(`${outputDir}/species_knowledge_completion_matrix.csv`, `${csv}\n`);
writeFileSync(`${outputDir}/species_knowledge_research_backlog.json`, `${JSON.stringify({ generated_at: matrix.generated_at, selection: 'Priority score uses explicit gap status, launch-cohort commonness proxy, and compatibility-risk proxy; no user telemetry was inferred.', items: backlog }, null, 2)}\n`);
const markdown = ['# Species Knowledge Research Backlog', '', `Generated from ${rows.length} catalog objects. This phase writes no reviewed authority data.`, '', '| Rank | Species | Life type | Gap fields | Commonness proxy | Risk proxy | Score |', '|---:|---|---|---|---|---|---:|', ...backlog.map(item => `| ${item.rank} | ${item.common_name} (${item.species_id}) | ${item.life_type} | ${item.research_reason.join(', ')} | ${item.commonness_proxy} | ${item.risk_proxy} | ${item.priority_score} |`), '', 'Selection note: launch-cohort membership is an operational proxy, not a claim about measured user frequency. Every candidate requires source-by-source human review before authority writes.'].join('\n');
writeFileSync(`${outputDir}/species_knowledge_research_backlog.md`, `${markdown}\n`);
console.log(`species knowledge completion matrix: ${rows.length} catalog objects, ${backlog.length} prioritized research candidates`);
console.log(JSON.stringify(counts, null, 2));
