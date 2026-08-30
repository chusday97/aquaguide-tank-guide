import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { selectCompatibilityLaunchCohort } from '../src/data/compatibility-launch-cohort';

const batchSizeArg = Number(process.argv[process.argv.indexOf('--batch') + 1]);
const batchSize = Number.isInteger(batchSizeArg) && batchSizeArg > 0 ? batchSizeArg : 10;
const offsetArg = Number(process.argv[process.argv.indexOf('--offset') + 1]);
const offset = Number.isInteger(offsetArg) && offsetArg >= 0 ? offsetArg : 0;
const outputRoot = process.env.CATALOG_RESEARCH_OUTPUT_DIR || 'build/catalog/research';

const cohort = selectCompatibilityLaunchCohort();
const draft = cohort.slice(offset, offset + batchSize).map(species => ({
  speciesId: species.id,
  commonName: species.name,
  scientificName: species.scientificName,
  status: 'draft' as const,
  fields: [
    'identity',
    'water',
    'temperature',
    'ph',
    'adult_size',
    'tank_size',
    'social_behavior',
    'territoriality',
    'predation',
    'breeding_behavior',
  ],
  sources: [],
  reviewNotes: ['Research draft only. Add field-level source URLs and reviewer decision before runtime use.'],
}));

await mkdir(outputRoot, { recursive: true });
const outputPath = join(outputRoot, `batch-${String(Math.floor(offset / batchSize) + 1).padStart(2, '0')}.json`);
await writeFile(outputPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), batchSize, species: draft }, null, 2)}\n`, 'utf8');
console.log(`catalog research draft created: ${draft.length} species -> ${outputPath}`);
