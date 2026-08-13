import { normalizeSpeciesIds, resolveCanonicalSpeciesId, speciesIdAliases } from '../src/modules/species/speciesAliases';
import { normalizePersistedSpeciesReferences } from '../src/services/storage/local-app-state';
import type { Aquarium } from '../src/types';

const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

assert(Object.keys(speciesIdAliases).length === 28, `expected 28 duplicate-id aliases, got ${Object.keys(speciesIdAliases).length}`);
assert(resolveCanonicalSpeciesId('sp_0027') === 'sp_0001', 'duplicate shrimp id must resolve to canonical id');
assert(resolveCanonicalSpeciesId('sp_0001') === 'sp_0001', 'canonical id must resolve to itself');
assert(resolveCanonicalSpeciesId('custom_species') === 'custom_species', 'unknown/custom ids must remain untouched');

const normalizedIds = normalizeSpeciesIds(['sp_0027', 'sp_0001', 'sp_0032', 'sp_0004', 'custom_species']);
assert(normalizedIds.length === 3, `alias/canonical pairs must dedupe; got ${normalizedIds.join(', ')}`);
assert(normalizedIds.includes('sp_0001') && normalizedIds.includes('sp_0004') && normalizedIds.includes('custom_species'), 'normalized id list lost expected values');

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
  deceasedRecords: [
    { id: 'mem_1', fishId: 'sp_0457', date: '2026-01-01' },
    { id: 'mem_2', fishId: 'custom_species', date: '2026-01-02' },
    { id: 'opaque_record', note: 'must remain structurally valid' },
  ],
});

assert(migrated.aquariums?.[0].fishes[0].fishId === 'sp_0038', 'aquarium fishId must migrate to canonical id');
assert(migrated.aquariums?.[0].fishes[1].fishId === 'custom_species', 'custom aquarium species id must remain untouched');
assert(JSON.stringify(migrated.wishlist) === JSON.stringify(['sp_0427', 'sp_0002']), `wishlist aliases must migrate and dedupe: ${JSON.stringify(migrated.wishlist)}`);
assert((migrated.deceasedRecords?.[0] as { fishId?: string }).fishId === 'sp_0430', 'deceased record fishId must migrate');
assert((migrated.deceasedRecords?.[1] as { fishId?: string }).fishId === 'custom_species', 'custom deceased fishId must remain untouched');
assert((migrated.deceasedRecords?.[2] as { note?: string }).note === 'must remain structurally valid', 'opaque deceased records without fishId must remain intact');

console.log(JSON.stringify({
  ok: true,
  aliasCount: Object.keys(speciesIdAliases).length,
  migratedAquariumFishId: migrated.aquariums?.[0].fishes[0].fishId,
  normalizedWishlist: migrated.wishlist,
  migratedDeceasedFishId: (migrated.deceasedRecords?.[0] as { fishId?: string }).fishId,
}, null, 2));
