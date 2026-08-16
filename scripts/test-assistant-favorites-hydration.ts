import fs from 'node:fs';

const source = fs.readFileSync('src/pages/AIAssistant.tsx', 'utf8');

const required = [
  'getCurrentAquaGuideRepository',
  'const favorites = await repository.getFavorites()',
  'setSpeciesFavoriteIds(favorites.speciesCatalogKeys)',
  "await repository.updateFavorite({ type: 'species', catalogKey: speciesId, favorite: true })",
  'subscribeToFavorites(refreshLocal)',
  "Saved species could not be synced. Showing this device cache.",
  "Species was not saved because the favorite could not be persisted.",
  'onClick={() => void addToWishlist(speciesId)}',
];

for (const snippet of required) {
  if (!source.includes(snippet)) throw new Error(`Assistant favorites contract missing: ${snippet}`);
}

const forbidden = [
  'addSpeciesFavorite(speciesId)',
  'onClick={() => addToWishlist(speciesId)}',
];

for (const snippet of forbidden) {
  if (source.includes(snippet)) throw new Error(`Assistant still contains local-only favorite write: ${snippet}`);
}

if (!source.includes("const CHAT_STORAGE_KEY = 'aquaguide_ai_chat_messages'")) {
  throw new Error('Assistant chat-history local-storage contract was unexpectedly removed');
}

console.log('Assistant favorites hydration contract passed');
