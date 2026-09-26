import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const matrix = JSON.parse(readFileSync('docs/species_knowledge_completion_matrix.json', 'utf8')) as {
  catalog_object_count: number;
  rows: Array<{ species_id: string; life_type: string; applicable_fields: string[]; field_status: Record<string, string>; gap_fields: string[]; reviewed_unknown_fields: string[]; reviewed_unknown_resolutions: Array<{ field: string; mode: string; reason: string; code: string | null }> }>;
  fields: string[];
  source_conflicts: Array<{ species_id: string; field: string; conflict_status: string; resolution: string }>;
};
const validStatuses = new Set(['reviewed_supported', 'reviewed_unknown', 'inherited_reviewed', 'not_applicable', 'needs_research', 'template_only']);
assert.equal((matrix as Record<string, unknown>).generated_at, undefined, 'source-controlled completion matrix must not embed a runtime timestamp');
assert.equal((matrix as Record<string, unknown>).generation_policy, 'deterministic_source_controlled_artifact');
assert.equal(matrix.catalog_object_count, 486, 'completion matrix must cover all 486 catalog objects');
assert.equal(matrix.rows.length, 486, 'completion matrix row count must match catalog object count');
const oscarTemperatureConflict = matrix.source_conflicts.find(conflict => conflict.species_id === 'sp_0451' && conflict.field === 'environment.temperature');
assert.ok(oscarTemperatureConflict, 'matrix must preserve the reviewed Oscar temperature conflict');
assert.equal(oscarTemperatureConflict?.conflict_status, 'reviewed_conflict');
assert.match(oscarTemperatureConflict?.resolution || '', /no overlap/i);
assert.equal(new Set(matrix.rows.map(row => row.species_id)).size, 486, 'completion matrix species IDs must be unique');
for (const row of matrix.rows) {
  assert.deepEqual(Object.keys(row.field_status).sort(), matrix.fields.slice().sort(), `${row.species_id} must expose every knowledge field`);
  for (const field of matrix.fields) {
    assert.ok(validStatuses.has(row.field_status[field]), `${row.species_id}/${field} has an invalid status`);
    assert.equal(row.field_status[field] === 'not_applicable', !row.applicable_fields.includes(field), `${row.species_id}/${field} applicability must agree with status`);
  }
  assert.deepEqual(row.gap_fields, matrix.fields.filter(field => ['needs_research', 'template_only'].includes(row.field_status[field])), `${row.species_id} gap fields must be derived from statuses`);
  assert.deepEqual(row.reviewed_unknown_fields, matrix.fields.filter(field => row.field_status[field] === 'reviewed_unknown'), `${row.species_id} reviewed_unknown fields must be derived from statuses`);
  assert.deepEqual(row.reviewed_unknown_resolutions.map(item => item.field).sort(), row.reviewed_unknown_fields.slice().sort(), `${row.species_id} every reviewed_unknown field must have one resolution mode`);
}
const backlog = JSON.parse(readFileSync('docs/species_knowledge_research_backlog.json', 'utf8')) as { items: Array<{ rank: number; species_id: string; gap_fields: string[]; reviewed_unknown_fields: string[]; reviewed_unknown_resolutions: Array<{ field: string; mode: string; reason: string; code: string | null }>; field_status: Record<string, string>; research_reason: string[] }> };
assert.equal((backlog as unknown as Record<string, unknown>).generated_at, undefined, 'source-controlled research backlog must not embed a runtime timestamp');
assert.equal((backlog as unknown as Record<string, unknown>).generation_policy, 'deterministic_source_controlled_artifact');
assert.equal(backlog.items.length, 40, 'research backlog must contain the requested 30–50 candidates');
assert.deepEqual(backlog.items.map(item => item.rank), Array.from({ length: 40 }, (_, index) => index + 1));
for (const item of backlog.items) {
  assert.ok(item.gap_fields.length > 0 || item.reviewed_unknown_fields.length > 0, `${item.species_id} backlog item must expose an actionable gap or reviewed evidence limit`);
  assert.ok(item.gap_fields.every(field => ['needs_research', 'template_only'].includes(item.field_status[field])), `${item.species_id} actionable gaps must remain explicit`);
  assert.ok(item.reviewed_unknown_fields.every(field => item.field_status[field] === 'reviewed_unknown'), `${item.species_id} reviewed_unknown fields must be derived from field status`);
  assert.ok(item.research_reason.length > 0, `${item.species_id} backlog item must explain why it is queued`);
}
const neonTetra = matrix.rows.find(row => row.species_id === 'sp_0431');
assert.equal(neonTetra?.field_status.feeding, 'reviewed_supported', 'neon tetra feeding must use the reviewed husbandry expansion source');
assert.equal(neonTetra?.field_status.care, 'reviewed_supported', 'neon tetra care must use the reviewed husbandry expansion source');
const cardinalTetra = matrix.rows.find(row => row.species_id === 'sp_0432');
assert.equal(cardinalTetra?.field_status.feeding, 'reviewed_supported', 'cardinal tetra feeding must use the reviewed husbandry expansion source');
assert.equal(cardinalTetra?.field_status.care, 'reviewed_supported', 'cardinal tetra care must use the reviewed husbandry expansion source');
const whiteCloud = matrix.rows.find(row => row.species_id === 'sp_0434');
assert.equal(whiteCloud?.field_status.feeding, 'reviewed_supported', 'white cloud feeding must use the reviewed husbandry expansion source');
assert.equal(whiteCloud?.field_status.care, 'reviewed_supported', 'white cloud care must use the reviewed husbandry expansion source');
const zebraDanio = matrix.rows.find(row => row.species_id === 'sp_0435');
assert.equal(zebraDanio?.field_status.feeding, 'reviewed_supported', 'zebra danio feeding must use the reviewed husbandry expansion source');
assert.equal(zebraDanio?.field_status.care, 'reviewed_supported', 'zebra danio care must use the reviewed husbandry expansion source');

for (const [speciesId, label] of [
  ['sp_0433', 'rummy nose'],
  ['sp_0436', 'guppy'],
  ['sp_0437', 'molly'],
  ['sp_0438', 'swordtail'],
  ['sp_0439', 'tiger barb'],
  ['sp_0443', 'panda cory'],
  ['sp_0446', 'angelfish'],
  ['sp_0468', 'harlequin rasbora'],
] as const) {
  const row = matrix.rows.find(candidate => candidate.species_id === speciesId);
  assert.equal(row?.field_status.feeding, 'reviewed_supported', `${label} feeding must use the reviewed husbandry expansion source`);
  assert.equal(row?.field_status.care, 'reviewed_supported', `${label} care must use the reviewed husbandry expansion source`);
}

for (const [speciesId, label] of [['sp_0444', 'pearl gourami'], ['sp_0447', 'discus']] as const) {
  const row = matrix.rows.find(candidate => candidate.species_id === speciesId);
  assert.equal(row?.field_status.feeding, 'reviewed_supported', `${label} feeding must use the reviewed husbandry expansion source`);
  assert.equal(row?.field_status.care, 'reviewed_supported', `${label} care must use the reviewed husbandry expansion source`);
}
const oscar = matrix.rows.find(row => row.species_id === 'sp_0451');
assert.equal(oscar?.field_status.feeding, 'reviewed_supported', 'Oscar feeding must use the reviewed husbandry source');
assert.equal(oscar?.field_status.care, 'reviewed_supported', 'Oscar care must use the reviewed husbandry source');
const fireRedShrimp = matrix.rows.find(row => row.species_id === 'sp_0001');
assert.equal(fireRedShrimp?.field_status.feeding, 'reviewed_supported', 'fire red shrimp feeding must use reviewed identity plus UF/IFAS feeding ecology');
assert.equal(fireRedShrimp?.field_status.care, 'reviewed_supported', 'fire red shrimp care must use direct red-phenotype aquarium culture evidence');
const wildNeocaridina = matrix.rows.find(row => row.species_id === 'sp_0459');
assert.equal(wildNeocaridina?.field_status.feeding, 'reviewed_supported', 'wild-type Neocaridina feeding must use reviewed identity plus UF/IFAS feeding ecology');
assert.equal(wildNeocaridina?.field_status.care, 'reviewed_supported', 'wild-type Neocaridina care must use direct wild-phenotype aquarium culture evidence');
const pearlRedSnakehead = matrix.rows.find(row => row.species_id === 'sp_0049');
assert.equal(pearlRedSnakehead?.field_status.feeding, 'reviewed_supported', 'Channa asiatica feeding must use direct species husbandry authority');
assert.equal(pearlRedSnakehead?.field_status.care, 'reviewed_supported', 'Channa asiatica care must use direct species husbandry authority');
const rosyBitterling = matrix.rows.find(row => row.species_id === 'sp_0475');
assert.equal(rosyBitterling?.field_status.feeding, 'reviewed_supported', 'Rhodeus ocellatus feeding must use direct peer-reviewed captive husbandry evidence');
assert.equal(rosyBitterling?.field_status.care, 'reviewed_supported', 'Rhodeus ocellatus care must use direct peer-reviewed captive husbandry evidence');
const platinumSnakehead = matrix.rows.find(row => row.species_id === 'sp_0224');
for (const field of ['feeding', 'social', 'care'] as const) {
  const resolution = platinumSnakehead?.reviewed_unknown_resolutions.find(item => item.field === field);
  assert.equal(resolution?.mode, 'do_not_repeat_ordinary_research', `platinum snakehead ${field} must be an explicit evidence ceiling`);
  assert.equal(resolution?.reason, 'explicit_evidence_ceiling');
  assert.equal(resolution?.code, 'variant_husbandry_not_established');
}

const crystalShrimp = matrix.rows.find(row => row.species_id === 'sp_0002');
assert.ok(crystalShrimp, 'crystal shrimp must exist in completion matrix');
assert.ok(crystalShrimp?.reviewed_unknown_resolutions.every(item => item.mode === 'do_not_repeat_ordinary_research' && item.reason === 'catalog_identity_boundary'), 'trade-name identity boundary must pause ordinary repeated field research');
const koiBetta = matrix.rows.find(row => row.species_id === 'sp_0258');
const koiSocial = koiBetta?.reviewed_unknown_resolutions.find(item => item.field === 'social');
assert.equal(koiSocial?.mode, 'do_not_repeat_ordinary_research');
assert.equal(koiSocial?.reason, 'explicit_evidence_ceiling');
assert.equal(koiSocial?.code, 'variant_social_not_established');
for (const field of ['feeding', 'care'] as const) {
  const resolution = koiBetta?.reviewed_unknown_resolutions.find(item => item.field === field);
  assert.equal(resolution?.mode, 'do_not_repeat_ordinary_research', `Koi Betta ${field} must be an explicit variant evidence ceiling`);
  assert.equal(resolution?.reason, 'explicit_evidence_ceiling');
  assert.equal(resolution?.code, 'variant_husbandry_not_established');
}
const blackSkirt = matrix.rows.find(row => row.species_id === 'sp_0010');
assert.equal(blackSkirt?.field_status.feeding, 'reviewed_supported', 'black skirt feeding must use the reviewed husbandry expansion source');
assert.equal(blackSkirt?.field_status.care, 'reviewed_supported', 'black skirt care must use the reviewed husbandry expansion source');
const platy = matrix.rows.find(row => row.species_id === 'sp_0011');
assert.equal(platy?.field_status.feeding, 'reviewed_supported', 'platy feeding must use the reviewed husbandry expansion source');
assert.equal(platy?.field_status.care, 'reviewed_supported', 'platy care must use the reviewed husbandry expansion source');
const cherryBarb = matrix.rows.find(row => row.species_id === 'sp_0012');
assert.equal(cherryBarb?.field_status.feeding, 'reviewed_supported', 'cherry barb feeding must use the reviewed husbandry expansion source');
assert.equal(cherryBarb?.field_status.care, 'reviewed_supported', 'cherry barb care must use the reviewed husbandry expansion source');
const otocinclus = matrix.rows.find(row => row.species_id === 'sp_0013');
assert.equal(otocinclus?.field_status.feeding, 'reviewed_supported', 'otocinclus feeding must use the reviewed husbandry expansion source');
assert.equal(otocinclus?.field_status.care, 'reviewed_supported', 'otocinclus care must use the reviewed husbandry expansion source');
const bronzeCory = matrix.rows.find(row => row.species_id === 'sp_0014');
assert.equal(bronzeCory?.field_status.feeding, 'reviewed_supported', 'bronze cory feeding must use the reviewed husbandry expansion source');
assert.equal(bronzeCory?.field_status.care, 'reviewed_supported', 'bronze cory care must use the reviewed husbandry expansion source');

console.log(`species knowledge completion matrix contract passed: ${matrix.rows.length} unique species, ${backlog.items.length} prioritized research candidates`);
