import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const matrix = JSON.parse(readFileSync('docs/species_knowledge_completion_matrix.json', 'utf8')) as {
  catalog_object_count: number;
  rows: Array<{ species_id: string; life_type: string; applicable_fields: string[]; field_status: Record<string, string>; gap_fields: string[] }>;
  fields: string[];
  source_conflicts: Array<{ species_id: string; field: string; conflict_status: string; resolution: string }>;
};
const validStatuses = new Set(['reviewed_supported', 'reviewed_unknown', 'inherited_reviewed', 'not_applicable', 'needs_research', 'template_only']);
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
}
const backlog = JSON.parse(readFileSync('docs/species_knowledge_research_backlog.json', 'utf8')) as { items: Array<{ rank: number; species_id: string }> };
assert.equal(backlog.items.length, 40, 'research backlog must contain the requested 30–50 candidates');
assert.deepEqual(backlog.items.map(item => item.rank), Array.from({ length: 40 }, (_, index) => index + 1));
console.log(`species knowledge completion matrix contract passed: ${matrix.rows.length} unique species, ${backlog.items.length} prioritized research candidates`);
