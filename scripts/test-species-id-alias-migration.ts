import { normalizeSpeciesIds, resolveCanonicalSpeciesId, speciesIdAliases } from '../src/modules/species/speciesAliases';
import { speciesService } from '../src/modules/species/species.service';
import { speciesDetailInputSchema } from '../src/modules/species/species.schema';
import { setCompatibilitySelection } from '../src/services/compatibility/compatibility-selection.service';
import { normalizePersistedSpeciesReferences } from '../src/services/storage/local-app-state';
import type { Aquarium } from '../src/types';

const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

assert(Object.keys(speciesIdAliases).length === 28, `expected 28 duplicate-id aliases, got ${Object.keys(speciesIdAliases).length}`);
assert(resolveCanonicalSpeciesId('sp_0027') === 'sp_0001', 'duplicate shrimp id must resolve to canonical id');
assert(resolveCanonicalSpeciesId('sp_0001') === 'sp_0001', 'canonical id must resolve to itself');
assert(resolveCanonicalSpeciesId('custom_species') === 'custom_species', 'unknown/custom ids must remain untouched');

const legacyDetailInput = speciesDetailInputSchema.parse({ speciesId: 'sp_0454' });
assert(legacyDetailInput.speciesId === 'sp_0427', `legacy detail input must resolve to canonical id, got ${legacyDetailInput.speciesId}`);
const legacyDetail = speciesService.detail({ speciesId: 'sp_0454' });
const canonicalDetail = speciesService.detail({ speciesId: 'sp_0427' });
assert(legacyDetail.item?.id === 'sp_0427', `legacy detail lookup must return canonical item, got ${legacyDetail.item?.id || 'null'}`);
assert(canonicalDetail.item?.id === 'sp_0427', 'canonical detail lookup must continue to work');
assert(legacyDetail.item?.id === canonicalDetail.item?.id, 'legacy and canonical detail lookups must resolve to the same catalog entity');
assert(speciesService.detail({ speciesId: 'custom_species' }).item === null, 'unknown/custom detail ids must remain unresolved rather than aliasing to another species');

const normalizedIds = normalizeSpeciesIds(['sp_0027', 'sp_0001', 'sp_0032', 'sp_0004', 'custom_species']);
assert(normalizedIds.length === 3, `alias/canonical pairs must dedupe; got ${normalizedIds.join(', ')}`);
assert(normalizedIds.includes('sp_0001') && normalizedIds.includes('sp_0004') && normalizedIds.includes('custom_species'), 'normalized id list lost expected values');

const compatibilitySelection = setCompatibilitySelection(['sp_0454', 'sp_0427', 'sp_0028', 'custom_species']);
assert(
  JSON.stringify(compatibilitySelection) === JSON.stringify(['sp_0427', 'sp_0002', 'custom_species']),
  `compatibility selection aliases must migrate and dedupe: ${JSON.stringify(compatibilitySelection)}`,
);

const aquarium: Aquarium = {
  id: 'aq_alias_test',
  name: 'Alias test',
  fishes: [
    { id: 'stock_1', fishId: 'sp_0130', quantity: 2, entryDate: '2026-01-01' },
    { id: 'stock_2', fishId: 'custom_species', quantity: 1, entryDate: '2026-01-01' },
  ],
};

const migrated = normalizePersistedSpeciesReferences({
  aquariums: [aquarium],
  wishlist: ['sp_0454', 'sp_0427', 'sp_0028'],
  compatibilityRecords: [
    {
      id: 'compat_1',
      aquariumId: aquarium.id,
      speciesIds: ['sp_0454', 'sp_0427', 'sp_0028', 'custom_species'],
      status: 'caution',
      scope: 'tank',
      evaluatedAt: '2026-01-03T00:00:00.000Z',
    },
    { id: 'opaque_compatibility_record', note: 'must remain structurally valid' },
  ],
  deceasedRecords: [
    { id: 'mem_1', fishId: 'sp_0457', date: '2026-01-01' },
    { id: 'mem_2', fishId: 'custom_species', date: '2026-01-02' },
    { id: 'opaque_record', note: 'must remain structurally valid' },
  ],
  discoveryState: {
    dateKey: '2026-01-03',
    queueIds: ['sp_0454', 'sp_0427', 'sp_0028'],
    consumedIds: ['sp_0130', 'sp_0038', 'custom_species'],
    history: [
      { id: 'sp_0457', dateKey: '2026-01-02' },
      { id: 'custom_species', dateKey: '2026-01-01' },
    ],
  },
});

assert(migrated.aquariums?.[0].fishes[0].fishId === 'sp_0038', 'aquarium fishId must migrate to canonical id');
assert(migrated.aquariums?.[0].fishes[1].fishId === 'custom_species', 'custom aquarium species id must remain untouched');
assert(JSON.stringify(migrated.wishlist) === JSON.stringify(['sp_0427', 'sp_0002']), `wishlist aliases must migrate and dedupe: ${JSON.stringify(migrated.wishlist)}`);
assert(
  JSON.stringify((migrated.compatibilityRecords?.[0] as { speciesIds?: string[] }).speciesIds) === JSON.stringify(['sp_0427', 'sp_0002', 'custom_species']),
  `compatibility history aliases must migrate and dedupe: ${JSON.stringify((migrated.compatibilityRecords?.[0] as { speciesIds?: string[] }).speciesIds)}`,
);
assert(
  (migrated.compatibilityRecords?.[1] as { note?: string }).note === 'must remain structurally valid',
  'opaque compatibility records without speciesIds must remain intact',
);
assert((migrated.deceasedRecords?.[0] as { fishId?: string }).fishId === 'sp_0430', 'deceased record fishId must migrate');
assert((migrated.deceasedRecords?.[1] as { fishId?: string }).fishId === 'custom_species', 'custom deceased fishId must remain untouched');
assert((migrated.deceasedRecords?.[2] as { note?: string }).note === 'must remain structurally valid', 'opaque deceased records without fishId must remain intact');
assert(JSON.stringify(migrated.discoveryState?.queueIds) === JSON.stringify(['sp_0427', 'sp_0002']), `discovery queue aliases must migrate and dedupe: ${JSON.stringify(migrated.discoveryState?.queueIds)}`);
assert(JSON.stringify(migrated.discoveryState?.consumedIds) === JSON.stringify(['sp_0038', 'custom_species']), `discovery consumed aliases must migrate and dedupe: ${JSON.stringify(migrated.discoveryState?.consumedIds)}`);
assert(migrated.discoveryState?.history[0].id === 'sp_0430', 'discovery history species id must migrate');
assert(migrated.discoveryState?.history[1].id === 'custom_species', 'custom discovery history id must remain untouched');

console.log(JSON.stringify({
  ok: true,
  aliasCount: Object.keys(speciesIdAliases).length,
  legacyDetailResolvedTo: legacyDetail.item?.id,
  compatibilitySelection,
  migratedAquariumFishId: migrated.aquariums?.[0].fishes[0].fishId,
  normalizedWishlist: migrated.wishlist,
  migratedCompatibilityIds: (migrated.compatibilityRecords?.[0] as { speciesIds?: string[] }).speciesIds,
  migratedDiscoveryQueue: migrated.discoveryState?.queueIds,
  migratedDeceasedFishId: (migrated.deceasedRecords?.[0] as { fishId?: string }).fishId,
}, null, 2));
