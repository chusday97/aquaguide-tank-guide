import { readFile } from 'node:fs/promises';
import { catalogEvidenceSourceSchema } from '../packages/contracts/src';
import { catalogFieldReviewSchema, REVIEWABLE_CATALOG_FIELDS } from '../src/data/catalogFieldReviews';

const inputPath = process.argv[process.argv.indexOf('--input') + 1];
if (!inputPath) throw new Error('usage: catalog:review --input <draft.json>');

const payload = JSON.parse(await readFile(inputPath, 'utf8')) as {
  species?: Array<{ speciesId: string; status: string; sources?: unknown[]; fieldReviews?: unknown[] }>;
};
const species = payload.species || [];
const invalidSourceSpeciesIds = species.flatMap(item => (item.sources || []).map(source => {
  try { catalogEvidenceSourceSchema.parse(source); return null; } catch { return item.speciesId; }
}).filter(Boolean));
const invalidFieldSpeciesIds: string[] = [];
const reviewedFieldKeys = new Set<string>();
for (const item of species) {
  const fieldReviews = (item.fieldReviews || []).map(value => {
    try { return catalogFieldReviewSchema.parse({ speciesId: item.speciesId, ...(value as object) }); }
    catch { invalidFieldSpeciesIds.push(item.speciesId); return null; }
  }).filter(Boolean) as Array<ReturnType<typeof catalogFieldReviewSchema.parse>>;
  const fieldNames = new Set(fieldReviews.map(field => field.field));
  if (fieldReviews.length !== REVIEWABLE_CATALOG_FIELDS.length || fieldNames.size !== REVIEWABLE_CATALOG_FIELDS.length) {
    invalidFieldSpeciesIds.push(item.speciesId);
  }
  for (const field of fieldReviews) {
    if (field.status === 'reviewed' && field.citationIds.length > 0) reviewedFieldKeys.add(`${item.speciesId}:${field.field}`);
  }
}
const notReady = species.filter(item => (
  item.status !== 'reviewed'
  || !item.sources?.length
  || REVIEWABLE_CATALOG_FIELDS.some(field => !reviewedFieldKeys.has(`${item.speciesId}:${field}`))
));

console.log(JSON.stringify({
  inputPath,
  speciesCount: species.length,
  reviewedCount: species.length - notReady.length,
  pendingCount: notReady.length,
  reviewedFieldCount: reviewedFieldKeys.size,
  expectedFieldCount: species.length * REVIEWABLE_CATALOG_FIELDS.length,
  invalidFieldSpeciesIds: [...new Set(invalidFieldSpeciesIds)],
  invalidSourceSpeciesIds,
  promotion: 'blocked_until_explicit_field_review',
}, null, 2));

if (invalidSourceSpeciesIds.length > 0) throw new Error('catalog review contains invalid evidence sources');
if (invalidFieldSpeciesIds.length > 0) throw new Error('catalog review contains invalid or incomplete field records');
