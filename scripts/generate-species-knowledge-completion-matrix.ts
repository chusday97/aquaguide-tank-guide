import { mkdirSync, writeFileSync } from 'node:fs';
import { fishData } from '../src/data/fishData';
import { selectCompatibilityLaunchCohort } from '../src/data/compatibility-launch-cohort';
import { getReviewedCompatibilityProfile, getReviewedCompatibilityProfileForFish } from '../src/data/compatibilityEvidence';
import { getReviewedSpeciesKnowledge, getReviewedSpeciesKnowledgeForFish } from '../src/modules/knowledge/speciesKnowledge';
import { getLifeType } from '../src/modules/species/species.service';
import { phase2Batch01Authority } from '../src/modules/knowledge/phase2Batch01Authority';
import { phase2Batch02Authority } from '../src/modules/knowledge/phase2Batch02Authority';
import { phase2Batch03Authority } from '../src/modules/knowledge/phase2Batch03Authority';
import { phase2Batch04Authority } from '../src/modules/knowledge/phase2Batch04Authority';
import { phase2Batch05Authority } from '../src/modules/knowledge/phase2Batch05Authority';
import { phase2Batch06Authority } from '../src/modules/knowledge/phase2Batch06Authority';
import { phase2Batch07Authority } from '../src/modules/knowledge/phase2Batch07Authority';
import { phase2Batch08Authority } from '../src/modules/knowledge/phase2Batch08Authority';
import { phase2Batch09Authority } from '../src/modules/knowledge/phase2Batch09Authority';
import { phase2Batch10Authority } from '../src/modules/knowledge/phase2Batch10Authority';
import { phase2Batch11Authority } from '../src/modules/knowledge/phase2Batch11Authority';
import { phase2Batch12Authority } from '../src/modules/knowledge/phase2Batch12Authority';
import { phase2Batch13Authority } from '../src/modules/knowledge/phase2Batch13Authority';
import { phase2Batch14Authority } from '../src/modules/knowledge/phase2Batch14Authority';
import { phase2Batch15Authority } from '../src/modules/knowledge/phase2Batch15Authority';
import { phase2Batch16Authority } from '../src/modules/knowledge/phase2Batch16Authority';
import { phase2Batch17Authority } from '../src/modules/knowledge/phase2Batch17Authority';
import { phase2Batch18Authority } from '../src/modules/knowledge/phase2Batch18Authority';
import { phase2Batch19Authority } from '../src/modules/knowledge/phase2Batch19Authority';
import { phase2Batch20Authority } from '../src/modules/knowledge/phase2Batch20Authority';
import { phase2Batch21Authority } from '../src/modules/knowledge/phase2Batch21Authority';
import { phase2Batch22Authority } from '../src/modules/knowledge/phase2Batch22Authority';
import { phase2Batch23Authority } from '../src/modules/knowledge/phase2Batch23Authority';
import { phase2Batch24Authority } from '../src/modules/knowledge/phase2Batch24Authority';
import { phase2Batch25Authority } from '../src/modules/knowledge/phase2Batch25Authority';
import { phase2Batch26Authority } from '../src/modules/knowledge/phase2Batch26Authority';
import { phase2Batch27Authority } from '../src/modules/knowledge/phase2Batch27Authority';
import { phase2Batch28Authority } from '../src/modules/knowledge/phase2Batch28Authority';
import { phase2Batch29Authority } from '../src/modules/knowledge/phase2Batch29Authority';
import { phase2Batch30Authority } from '../src/modules/knowledge/phase2Batch30Authority';
import { phase2Batch31Authority } from '../src/modules/knowledge/phase2Batch31Authority';
import { phase2Batch32Authority } from '../src/modules/knowledge/phase2Batch32Authority';
import { phase2Batch33Authority } from '../src/modules/knowledge/phase2Batch33Authority';
import { phase2Batch34Authority } from '../src/modules/knowledge/phase2Batch34Authority';
import { phase2Batch35Authority } from '../src/modules/knowledge/phase2Batch35Authority';
import { phase2Batch36Authority } from '../src/modules/knowledge/phase2Batch36Authority';
import { phase2Batch37Authority } from '../src/modules/knowledge/phase2Batch37Authority';

type FieldStatus = 'reviewed_supported' | 'reviewed_unknown' | 'inherited_reviewed' | 'not_applicable' | 'needs_research' | 'template_only';
type KnowledgeField = 'feeding' | 'environment' | 'space' | 'social' | 'care';

const root = new URL('../', import.meta.url).pathname;
const outputDir = `${root}docs`;
mkdirSync(outputDir, { recursive: true });
const launchIds = new Set(selectCompatibilityLaunchCohort().map(fish => fish.id));
const fields: KnowledgeField[] = ['feeding', 'environment', 'space', 'social', 'care'];
const reviewedSourceConflicts = [{
  species_id: 'sp_0451',
  field: 'environment.temperature',
  conflict_status: 'reviewed_conflict',
  sources: [
    { source_id: 'batch03-fishbase-astronotus-ocellatus', range_c: { min: 22, max: 25 }, role: 'catalog_runtime_authority' },
    { source_id: 'seriouslyfish-astronotus-ocellatus', range_c: { min: 20, max: 28 }, role: 'husbandry_guidance' },
  ],
  resolution: 'Do not collapse the disagreement into a universal narrow hard block. Domain hard incompatibility is valid only when reviewed ranges have no overlap; this conflict retains 22–25°C as the catalog runtime value, treats 20–28°C as contextual husbandry guidance, and exposes out-of-overlap conditions as caution unless a stronger species-specific source resolves the conflict.',
}];
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
  const phase2DirectOnly = new Set([
    'sp_0016', 'sp_0224', 'sp_0475', 'sp_0006', 'sp_0035', 'sp_0430', 'sp_0457',
    'sp_0003', 'sp_0029', 'sp_0004', 'sp_0032', 'sp_0021', 'sp_0036',
    'sp_0052', 'sp_0112', 'sp_0115', 'sp_0141', 'sp_0143', 'sp_0144', 'sp_0145', 'sp_0154', 'sp_0155', 'sp_0167',
    'sp_0170', 'sp_0204', 'sp_0205', 'sp_0206', 'sp_0212', 'sp_0225', 'sp_0226', 'sp_0231', 'sp_0232', 'sp_0244',
    'sp_0245', 'sp_0246', 'sp_0255', 'sp_0287', 'sp_0339', 'sp_0358', 'sp_0360', 'sp_0362', 'sp_0375', 'sp_0002',
    'sp_0005', 'sp_0051', 'sp_0018', 'sp_0019', 'sp_0023', 'sp_0024', 'sp_0026', 'sp_0033', 'sp_0034', 'sp_0042',
    'sp_0054', 'sp_0055', 'sp_0056', 'sp_0057', 'sp_0058', 'sp_0062', 'sp_0069', 'sp_0070', 'sp_0121', 'sp_0122',
    'sp_0123', 'sp_0125', 'sp_0129', 'sp_0146', 'sp_0152', 'sp_0157', 'sp_0158', 'sp_0163', 'sp_0173', 'sp_0174',
    'sp_0175', 'sp_0176', 'sp_0177', 'sp_0178', 'sp_0182', 'sp_0187', 'sp_0201', 'sp_0202', 'sp_0207', 'sp_0208',
    'sp_0211', 'sp_0214', 'sp_0217', 'sp_0218', 'sp_0219', 'sp_0220', 'sp_0221', 'sp_0227', 'sp_0228', 'sp_0235',
    'sp_0236', 'sp_0240', 'sp_0241', 'sp_0243', 'sp_0247', 'sp_0249', 'sp_0250', 'sp_0251', 'sp_0256', 'sp_0257',
    'sp_0263', 'sp_0264', 'sp_0265', 'sp_0266', 'sp_0270', 'sp_0271', 'sp_0272', 'sp_0273', 'sp_0282', 'sp_0288',
    'sp_0289', 'sp_0290', 'sp_0291', 'sp_0294', 'sp_0338', 'sp_0340', 'sp_0341', 'sp_0359', 'sp_0363', 'sp_0364',
    'sp_0372', 'sp_0373', 'sp_0374', 'sp_0376', 'sp_0388', 'sp_0393', 'sp_0394', 'sp_0399', 'sp_0414', 'sp_0415',
    'sp_0416', 'sp_0417', 'sp_0419', 'sp_0421', 'sp_0428', 'sp_0429', 'sp_0449', 'sp_0450', 'sp_0452', 'sp_0456',
    'sp_0001', 'sp_0007', 'sp_0008', 'sp_0009', 'sp_0015', 'sp_0022', 'sp_0038', 'sp_0043', 'sp_0044', 'sp_0047',
    'sp_0048', 'sp_0050', 'sp_0059', 'sp_0103', 'sp_0104', 'sp_0105', 'sp_0108', 'sp_0109', 'sp_0110', 'sp_0116',
    'sp_0117', 'sp_0118', 'sp_0119', 'sp_0120', 'sp_0127', 'sp_0130', 'sp_0131', 'sp_0138', 'sp_0139', 'sp_0140',
    'sp_0151', 'sp_0156', 'sp_0179', 'sp_0181', 'sp_0183', 'sp_0184', 'sp_0185', 'sp_0197', 'sp_0198', 'sp_0199',
    'sp_0200', 'sp_0216', 'sp_0229', 'sp_0234', 'sp_0242', 'sp_0248', 'sp_0268', 'sp_0269', 'sp_0283', 'sp_0284',
    'sp_0285', 'sp_0286', 'sp_0296', 'sp_0297', 'sp_0318', 'sp_0319', 'sp_0321', 'sp_0322', 'sp_0323', 'sp_0325',
    'sp_0333', 'sp_0334', 'sp_0365', 'sp_0368', 'sp_0370', 'sp_0379', 'sp_0382', 'sp_0384', 'sp_0400', 'sp_0401',
    'sp_0402', 'sp_0407', 'sp_0408', 'sp_0409', 'sp_0410', 'sp_0411', 'sp_0412', 'sp_0420', 'sp_0441', 'sp_0442',
    'sp_0445', 'sp_0453', 'sp_0459', 'sp_0037', 'sp_0041', 'sp_0046', 'sp_0063', 'sp_0064', 'sp_0065', 'sp_0066',
    'sp_0067', 'sp_0068', 'sp_0077', 'sp_0089', 'sp_0111', 'sp_0124', 'sp_0142', 'sp_0149', 'sp_0150', 'sp_0159',
    'sp_0160', 'sp_0161', 'sp_0162', 'sp_0168', 'sp_0169', 'sp_0180', 'sp_0188', 'sp_0189', 'sp_0190', 'sp_0196',
    'sp_0203', 'sp_0209', 'sp_0213', 'sp_0215', 'sp_0230', 'sp_0237', 'sp_0253', 'sp_0254', 'sp_0280', 'sp_0281',
    'sp_0292', 'sp_0293', 'sp_0348', 'sp_0349', 'sp_0350', 'sp_0351', 'sp_0385', 'sp_0386', 'sp_0387', 'sp_0392',
    'sp_0395', 'sp_0418', 'sp_0025', 'sp_0039', 'sp_0040', 'sp_0060', 'sp_0061', 'sp_0106', 'sp_0107', 'sp_0113',
    'sp_0128', 'sp_0132', 'sp_0134', 'sp_0135', 'sp_0136', 'sp_0137', 'sp_0153', 'sp_0171', 'sp_0172', 'sp_0186',
    'sp_0014', 'sp_0049', 'sp_0431', 'sp_0432', 'sp_0436', 'sp_0443', 'sp_0435', 'sp_0191', 'sp_0192', 'sp_0193',
    'sp_0194', 'sp_0195', 'sp_0210', 'sp_0233', 'sp_0252', 'sp_0267', 'sp_0295', 'sp_0320', 'sp_0324', 'sp_0326',
    'sp_0327', 'sp_0328', 'sp_0329', 'sp_0330', 'sp_0331', 'sp_0332', 'sp_0335', 'sp_0336', 'sp_0337', 'sp_0361',
    'sp_0366', 'sp_0367', 'sp_0369', 'sp_0371', 'sp_0377', 'sp_0378', 'sp_0380', 'sp_0381', 'sp_0383', 'sp_0403',
    'sp_0404', 'sp_0405', 'sp_0406', 'sp_0413', 'sp_0426', 'sp_0427', 'sp_0439', 'sp_0454', 'sp_0458', 'sp_0460',
    'sp_0461', 'sp_0462', 'sp_0463', 'sp_0464', 'sp_0465', 'sp_0466', 'sp_0467', 'sp_0470', 'sp_0471', 'sp_0472',
    'sp_0473', 'sp_0474', 'sp_0476', 'sp_0012', 'sp_0147', 'sp_0148', 'sp_0222', 'sp_0258', 'sp_0433', 'sp_0434',
  ]);
  const knowledge = phase2DirectOnly.has(fish.id) ? directKnowledge : getReviewedSpeciesKnowledgeForFish(fish);
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
      const phase2 = phase2Batch01Authority[fish.id]?.feeding ?? phase2Batch02Authority[fish.id]?.feeding ?? phase2Batch03Authority[fish.id]?.feeding ?? phase2Batch04Authority[fish.id]?.feeding ?? phase2Batch05Authority[fish.id]?.feeding ?? phase2Batch06Authority[fish.id]?.feeding ?? phase2Batch07Authority[fish.id]?.feeding ?? phase2Batch08Authority[fish.id]?.feeding ?? phase2Batch09Authority[fish.id]?.feeding ?? phase2Batch10Authority[fish.id]?.feeding ?? phase2Batch11Authority[fish.id]?.feeding ?? phase2Batch12Authority[fish.id]?.feeding ?? phase2Batch13Authority[fish.id]?.feeding ?? phase2Batch14Authority[fish.id]?.feeding ?? phase2Batch15Authority[fish.id]?.feeding ?? phase2Batch16Authority[fish.id]?.feeding ?? phase2Batch17Authority[fish.id]?.feeding ?? phase2Batch18Authority[fish.id]?.feeding ?? phase2Batch19Authority[fish.id]?.feeding ?? phase2Batch20Authority[fish.id]?.feeding ?? phase2Batch21Authority[fish.id]?.feeding ?? phase2Batch22Authority[fish.id]?.feeding ?? phase2Batch23Authority[fish.id]?.feeding ?? phase2Batch24Authority[fish.id]?.feeding ?? phase2Batch25Authority[fish.id]?.feeding ?? phase2Batch26Authority[fish.id]?.feeding ?? phase2Batch27Authority[fish.id]?.feeding ?? phase2Batch28Authority[fish.id]?.feeding ?? phase2Batch29Authority[fish.id]?.feeding ?? phase2Batch30Authority[fish.id]?.feeding ?? phase2Batch31Authority[fish.id]?.feeding ?? phase2Batch32Authority[fish.id]?.feeding ?? phase2Batch33Authority[fish.id]?.feeding ?? phase2Batch34Authority[fish.id]?.feeding ?? phase2Batch35Authority[fish.id]?.feeding ?? phase2Batch36Authority[fish.id]?.feeding ?? phase2Batch37Authority[fish.id]?.feeding;
      if (phase2) fieldStatus[field] = phase2.status;
      else if (!fish.feedingProfile) fieldStatus[field] = 'needs_research';
      else if (audit.feeding_uses_template === 'yes') fieldStatus[field] = 'template_only';
      else if (audit.feeding_needs_review === 'yes' || fish.feedingProfile.sourceUrl?.includes('google.com')) fieldStatus[field] = 'needs_research';
      else fieldStatus[field] = fish.feedingProfile.sourceName?.toLowerCase().includes('inherited') ? 'inherited_reviewed' : 'reviewed_supported';
      continue;
    }
    if (field === 'care') {
      const phase2 = phase2Batch01Authority[fish.id]?.care ?? phase2Batch02Authority[fish.id]?.care ?? phase2Batch03Authority[fish.id]?.care ?? phase2Batch04Authority[fish.id]?.care ?? phase2Batch05Authority[fish.id]?.care ?? phase2Batch06Authority[fish.id]?.care ?? phase2Batch07Authority[fish.id]?.care ?? phase2Batch08Authority[fish.id]?.care ?? phase2Batch09Authority[fish.id]?.care ?? phase2Batch10Authority[fish.id]?.care ?? phase2Batch11Authority[fish.id]?.care ?? phase2Batch12Authority[fish.id]?.care ?? phase2Batch13Authority[fish.id]?.care ?? phase2Batch14Authority[fish.id]?.care ?? phase2Batch15Authority[fish.id]?.care ?? phase2Batch16Authority[fish.id]?.care ?? phase2Batch17Authority[fish.id]?.care ?? phase2Batch18Authority[fish.id]?.care ?? phase2Batch19Authority[fish.id]?.care ?? phase2Batch20Authority[fish.id]?.care ?? phase2Batch21Authority[fish.id]?.care ?? phase2Batch22Authority[fish.id]?.care ?? phase2Batch23Authority[fish.id]?.care ?? phase2Batch24Authority[fish.id]?.care ?? phase2Batch25Authority[fish.id]?.care ?? phase2Batch26Authority[fish.id]?.care ?? phase2Batch27Authority[fish.id]?.care ?? phase2Batch28Authority[fish.id]?.care ?? phase2Batch29Authority[fish.id]?.care ?? phase2Batch30Authority[fish.id]?.care ?? phase2Batch31Authority[fish.id]?.care ?? phase2Batch32Authority[fish.id]?.care ?? phase2Batch33Authority[fish.id]?.care ?? phase2Batch34Authority[fish.id]?.care ?? phase2Batch35Authority[fish.id]?.care ?? phase2Batch36Authority[fish.id]?.care ?? phase2Batch37Authority[fish.id]?.care;
      fieldStatus[field] = phase2?.status ?? (audit.missing_species_specific_care === 'yes' ? 'template_only' : 'reviewed_supported');
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
    source_conflicts: reviewedSourceConflicts.filter(conflict => conflict.species_id === fish.id),
    evidence_boundary: 'No legacy fishData prose, template text, or base-species inheritance is treated as species-specific reviewed evidence.',
  };
});

const backlog = rows
  .filter(row => row.gap_fields.length > 0 && row.life_type !== 'hardscape')
  .sort((a, b) => b.priority_score - a.priority_score || a.species_id.localeCompare(b.species_id))
  .slice(0, 40)
  .map((row, index) => ({ rank: index + 1, ...row, research_reason: row.gap_fields.map(field => `${field}:${row.field_status[field]}`) }));

const counts = Object.fromEntries(fields.map(field => [field, Object.fromEntries((['reviewed_supported', 'reviewed_unknown', 'inherited_reviewed', 'not_applicable', 'needs_research', 'template_only'] as FieldStatus[]).map(status => [status, rows.filter(row => row.field_status[field] === status).length]))]));
const matrix = { generated_at: new Date().toISOString(), catalog_object_count: rows.length, fields, rows, status_counts: counts, source_conflicts: reviewedSourceConflicts, backlog_size: backlog.length, backlog_scope: 'Top 40 research candidates; reviewed authority is recorded in source-controlled modules and this backlog is regenerated after each batch.' };
writeFileSync(`${outputDir}/species_knowledge_completion_matrix.json`, `${JSON.stringify(matrix, null, 2)}\n`);
const csvEscape = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;
const csvHeader = ['species_id', 'common_name', 'scientific_name', 'life_type', 'category', ...fields.flatMap(field => fields.includes(field) ? [`${field}_status`] : []), 'gap_fields', 'commonness_proxy', 'risk_proxy', 'priority_score'];
const csv = [csvHeader.join(','), ...rows.map(row => [row.species_id, row.common_name, row.scientific_name, row.life_type, row.category, ...fields.map(field => row.field_status[field]), row.gap_fields.join('|'), row.commonness_proxy, row.risk_proxy, row.priority_score].map(csvEscape).join(','))].join('\n');
writeFileSync(`${outputDir}/species_knowledge_completion_matrix.csv`, `${csv}\n`);
writeFileSync(`${outputDir}/species_knowledge_research_backlog.json`, `${JSON.stringify({ generated_at: matrix.generated_at, selection: 'Priority score uses explicit gap status, launch-cohort commonness proxy, and compatibility-risk proxy; no user telemetry was inferred.', items: backlog }, null, 2)}\n`);
const markdown = ['# Species Knowledge Research Backlog', '', `Generated from ${rows.length} catalog objects. Reviewed authority is recorded in source-controlled modules; this file is the unresolved-work queue.`, '', '| Rank | Species | Life type | Gap fields | Commonness proxy | Risk proxy | Score |', '|---:|---|---|---|---|---|---:|', ...backlog.map(item => `| ${item.rank} | ${item.common_name} (${item.species_id}) | ${item.life_type} | ${item.research_reason.join(', ')} | ${item.commonness_proxy} | ${item.risk_proxy} | ${item.priority_score} |`), '', 'Selection note: launch-cohort membership is an operational proxy, not a claim about measured user frequency. Every candidate requires source-by-source human review before authority writes.'].join('\n');
writeFileSync(`${outputDir}/species_knowledge_research_backlog.md`, `${markdown}\n`);
console.log(`species knowledge completion matrix: ${rows.length} catalog objects, ${backlog.length} prioritized research candidates`);
console.log(JSON.stringify(counts, null, 2));
