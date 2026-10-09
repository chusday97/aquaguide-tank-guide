import assert from 'node:assert/strict';
import { ApiError } from '../apps/api/src/http';
import { readPublishedCatalogDecision } from '../apps/api/src/routes/aquariums';
import { LOCAL_CATALOG_VERSION } from '../src/data/catalogVersion';

type Result = { data: any; error: any };

const query = (result: Result) => {
  const chain: Record<string, any> = {};
  for (const method of ['select', 'eq', 'is', 'not', 'order', 'limit', 'in', 'or', 'maybeSingle']) chain[method] = () => chain;
  chain.then = (resolve: (value: Result) => unknown, reject: (error: unknown) => unknown) => Promise.resolve(result).then(resolve, reject);
  return chain;
};

type CatalogClient = Parameters<typeof readPublishedCatalogDecision>[0]['client'];
const clientForAquarium = (aquarium: any, error: any = null) => ({
  from: (table: string) => {
    assert.equal(table, 'aquariums', 'planned-addition compatibility must read only user tank facts from Supabase');
    return query({ data: aquarium, error });
  },
}) as unknown as CatalogClient;

const baseAquarium = (speciesCatalogKey?: string) => ({
  water_type: 'Freshwater',
  length_cm: 60,
  width_cm: 40,
  height_cm: 40,
  target_temperature_c: 25,
  aquarium_species: speciesCatalogKey
    ? [{ species_catalog_key: speciesCatalogKey, quantity: 5, deleted_at: null }]
    : [],
});

const expectApiError = async (run: () => Promise<unknown>, status: number, code: string) => {
  await assert.rejects(run, (error: unknown) => error instanceof ApiError && error.status === status && error.code === code);
};

const emptyTankDecision = await readPublishedCatalogDecision({
  client: clientForAquarium(baseAquarium()),
  aquariumId: 'tank-1',
  speciesCatalogKey: 'sp_0436',
  catalogVersion: LOCAL_CATALOG_VERSION,
});
assert.notEqual(emptyTankDecision.status, 'not_recommended');

await expectApiError(
  () => readPublishedCatalogDecision({
    client: clientForAquarium(baseAquarium()),
    aquariumId: 'tank-1',
    speciesCatalogKey: 'sp_0436',
    catalogVersion: 'stale-catalog',
  }),
  409,
  'VERSION_CONFLICT',
);

await expectApiError(
  () => readPublishedCatalogDecision({
    client: clientForAquarium(baseAquarium()),
    aquariumId: 'tank-1',
    speciesCatalogKey: 'not-in-reviewed-catalog',
    catalogVersion: LOCAL_CATALOG_VERSION,
  }),
  400,
  'COMPATIBILITY_INFORMATION_REQUIRED',
);

await expectApiError(
  () => readPublishedCatalogDecision({
    client: clientForAquarium(baseAquarium('legacy-unmapped-species')),
    aquariumId: 'tank-1',
    speciesCatalogKey: 'sp_0436',
    catalogVersion: LOCAL_CATALOG_VERSION,
  }),
  400,
  'COMPATIBILITY_INFORMATION_REQUIRED',
);

// Reviewed authority badcase: Tiger Barb (sp_0439) + Guppy (sp_0436)
// must remain blocked by fin-nipping / long-fin conflict without DB knowledge tables.
const blocked = await readPublishedCatalogDecision({
  client: clientForAquarium(baseAquarium('sp_0439')),
  aquariumId: 'tank-1',
  speciesCatalogKey: 'sp_0436',
  catalogVersion: LOCAL_CATALOG_VERSION,
});
assert.equal(blocked.status, 'not_recommended');
assert.equal(blocked.addPolicy, 'block');
assert.ok(blocked.ruleCodes.includes('reviewed_pair_rule'));
assert.ok(blocked.ruleCodes.includes('fin_nipping_target_vulnerability'));
assert.ok(!blocked.ruleCodes.some(code => code.includes('predation')));

console.log('livestock addition API behavior verified: Git catalog version, unknown species, unresolved tank species and reviewed pair block');
