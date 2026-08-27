import assert from 'node:assert/strict';
import { ApiError } from '../apps/api/src/http';
import { readPublishedCatalogDecision } from '../apps/api/src/routes/aquariums';

type Result = { data: any; error: any };

const query = (result: Result) => {
  const chain: Record<string, any> = {};
  for (const method of ['select', 'eq', 'is', 'not', 'order', 'limit', 'in', 'or', 'maybeSingle']) chain[method] = () => chain;
  chain.then = (resolve: (value: Result) => unknown, reject: (error: unknown) => unknown) => Promise.resolve(result).then(resolve, reject);
  return chain;
};

type CatalogClient = Parameters<typeof readPublishedCatalogDecision>[0]['client'];
const clientFor = (tables: Record<string, Result>) => ({
  from: (table: string) => query(tables[table] || { data: [], error: null }),
}) as unknown as CatalogClient;

const release = { version_key: 'catalog-v1' };
const aquarium = {
  water_type: 'Freshwater', length_cm: 60, width_cm: 40, height_cm: 40, target_temperature_c: 25,
  aquarium_species: [{ species_catalog_key: 'existing', quantity: 2, deleted_at: null }],
};
const speciesRows = [
  { id: 'existing-db', catalog_key: 'existing', water_type: 'Freshwater', water_temperature_min_c: 22, water_temperature_max_c: 28, ph_min: 6, ph_max: 8, status: 'published' },
  { id: 'candidate-db', catalog_key: 'candidate', water_type: 'Freshwater', water_temperature_min_c: 22, water_temperature_max_c: 28, ph_min: 6, ph_max: 8, status: 'published' },
];
const reviewed = [{ species_id: 'existing-db' }, { species_id: 'candidate-db' }];

const baseTables = () => ({
  catalog_releases: { data: release, error: null },
  aquariums: { data: aquarium, error: null },
  species: { data: speciesRows, error: null },
  species_reference_links: { data: reviewed, error: null },
  species_pair_compatibility_rules: { data: null, error: null },
});

const expectApiError = async (run: () => Promise<unknown>, status: number, code: string) => {
  await assert.rejects(run, (error: unknown) => error instanceof ApiError && error.status === status && error.code === code);
};

const compatible = await readPublishedCatalogDecision({ client: clientFor(baseTables()), aquariumId: 'tank-1', speciesCatalogKey: 'candidate', catalogVersion: 'catalog-v1' });
assert.equal(compatible.status, 'compatible');
assert.equal(compatible.addPolicy, 'allow');

await expectApiError(
  () => readPublishedCatalogDecision({ client: clientFor(baseTables()), aquariumId: 'tank-1', speciesCatalogKey: 'candidate', catalogVersion: 'stale' }),
  409,
  'VERSION_CONFLICT',
);

const unknownTables = baseTables();
unknownTables.species = { data: speciesRows.map(row => row.catalog_key === 'candidate' ? { ...row, water_type: 'unknown' } : row), error: null };
const insufficient = await readPublishedCatalogDecision({ client: clientFor(unknownTables), aquariumId: 'tank-1', speciesCatalogKey: 'candidate', catalogVersion: 'catalog-v1' });
assert.equal(insufficient.status, 'insufficient_data');
assert.equal(insufficient.addPolicy, 'complete_information');

const blockedTables = baseTables();
blockedTables.species_pair_compatibility_rules = { data: { verdict: 'not_recommended' }, error: null };
const blocked = await readPublishedCatalogDecision({ client: clientFor(blockedTables), aquariumId: 'tank-1', speciesCatalogKey: 'candidate', catalogVersion: 'catalog-v1' });
assert.equal(blocked.status, 'not_recommended');
assert.equal(blocked.addPolicy, 'block');

const missingReleaseTables = baseTables();
missingReleaseTables.catalog_releases = { data: null, error: null };
await expectApiError(
  () => readPublishedCatalogDecision({ client: clientFor(missingReleaseTables), aquariumId: 'tank-1', speciesCatalogKey: 'candidate', catalogVersion: 'catalog-v1' }),
  503,
  'COMPATIBILITY_INFORMATION_REQUIRED',
);

console.log('livestock addition API behavior verified: version, missing data, pair block and published catalog gates');
