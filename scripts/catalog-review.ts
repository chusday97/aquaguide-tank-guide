import { readFile } from 'node:fs/promises';
import { catalogEvidenceSourceSchema } from '../packages/contracts/src';

const inputPath = process.argv[process.argv.indexOf('--input') + 1];
if (!inputPath) throw new Error('usage: catalog:review --input <draft.json>');

const payload = JSON.parse(await readFile(inputPath, 'utf8')) as {
  species?: Array<{ speciesId: string; status: string; sources?: unknown[]; fields?: string[] }>;
};
const species = payload.species || [];
const invalidSources = species.flatMap(item => (item.sources || []).map(source => {
  try { catalogEvidenceSourceSchema.parse(source); return null; } catch { return item.speciesId; }
}).filter(Boolean));
const notReady = species.filter(item => item.status !== 'reviewed' || !item.sources?.length);

console.log(JSON.stringify({
  inputPath,
  speciesCount: species.length,
  reviewedCount: species.length - notReady.length,
  pendingCount: notReady.length,
  invalidSourceSpeciesIds: invalidSources,
  promotion: 'blocked_until_explicit_field_review',
}, null, 2));

if (invalidSources.length > 0) throw new Error('catalog review contains invalid evidence sources');
