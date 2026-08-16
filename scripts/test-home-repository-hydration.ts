import fs from 'node:fs';

const home = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const required = [
  'hydrateCollectionData',
  'resolveRepositoryMode',
  'await repository.getAquariums()',
  "await repository.updateFavorite({ type: 'species', catalogKey: id, favorite })",
  'const favorites = await repository.getFavorites()',
  'setSpeciesFavoriteIds(favorites.speciesCatalogKeys)',
  "subscribeToCollection(refresh)",
  "currentAquariumId: selectedAquarium?.id || ''",
  "Cloud sync is temporarily unavailable. Showing this device cache.",
  "No aquarium recorded yet",
  '<ThreeAquarium aquarium={defaultAquarium} />',
];

for (const snippet of required) {
  if (!home.includes(snippet)) throw new Error(`Home repository hydration contract missing: ${snippet}`);
}

const forbidden = [
  "localStorage.getItem('aquariums')",
  "localStorage.getItem('deceasedRecords')",
  'toggleSpeciesFavorite(',
  'emptyAquariumFallback',
  'defaultAquarium || emptyAquariumFallback',
];

for (const snippet of forbidden) {
  if (home.includes(snippet)) throw new Error(`Home still contains local-only/fabricated path: ${snippet}`);
}

console.log('Home repository hydration contract passed');
