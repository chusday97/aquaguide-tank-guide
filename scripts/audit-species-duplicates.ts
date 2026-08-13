import { fishData } from '../src/data/fishData';

const MAX_LIKELY_DUPLICATE_ENTITY_GROUPS = 28;

const normalize = (value?: string) => (value || '').trim().toLowerCase().replace(/\s+/g, ' ');

const byScientificName = new Map<string, typeof fishData>();
for (const species of fishData) {
  const key = normalize(species.scientificName);
  if (!key) continue;
  const group = byScientificName.get(key) || [];
  group.push(species);
  byScientificName.set(key, group);
}

const exactScientificNameDuplicates = [...byScientificName.entries()]
  .filter(([, group]) => group.length > 1)
  .map(([normalizedScientificName, group]) => ({
    normalizedScientificName,
    count: group.length,
    records: group.map(species => ({
      id: species.id,
      name: species.name,
      scientificName: species.scientificName,
      category: species.category,
      difficulty: species.difficulty,
      tankSize: species.tankSize,
    })),
  }))
  .sort((a, b) => b.count - a.count || a.normalizedScientificName.localeCompare(b.normalizedScientificName));

const businessFingerprint = (species: typeof fishData[number]) => JSON.stringify({
  name: normalize(species.name),
  scientificName: normalize(species.scientificName),
  category: normalize(species.category),
  difficulty: species.difficulty,
  waterTemperature: normalize(species.waterTemperature),
  phLevel: normalize(species.phLevel),
  tankSize: normalize(species.tankSize),
  temperament: species.temperament,
  size: species.size,
  housingMode: normalize(species.housingMode),
  housingReason: normalize(species.housingReason),
});

const byBusinessFingerprint = new Map<string, typeof fishData>();
for (const species of fishData) {
  const key = businessFingerprint(species);
  const group = byBusinessFingerprint.get(key) || [];
  group.push(species);
  byBusinessFingerprint.set(key, group);
}

const likelyDuplicateEntities = [...byBusinessFingerprint.values()]
  .filter(group => group.length > 1)
  .map(group => ({
    count: group.length,
    records: group.map(species => ({
      id: species.id,
      name: species.name,
      scientificName: species.scientificName,
      category: species.category,
      difficulty: species.difficulty,
      waterTemperature: species.waterTemperature,
      phLevel: species.phLevel,
      tankSize: species.tankSize,
      temperament: species.temperament,
      size: species.size,
      housingMode: species.housingMode,
    })),
  }))
  .sort((a, b) => b.count - a.count || a.records[0].scientificName.localeCompare(b.records[0].scientificName));

const coarseScientificNameGroups = exactScientificNameDuplicates.filter(group => {
  const names = new Set(group.records.map(record => normalize(record.name)));
  return names.size > 1;
});

const report = {
  totalSpecies: fishData.length,
  scientificNameCollisionGroups: exactScientificNameDuplicates.length,
  scientificNameCollisionRecords: exactScientificNameDuplicates.reduce((sum, group) => sum + group.count, 0),
  likelyDuplicateEntityGroups: likelyDuplicateEntities.length,
  maxAllowedLikelyDuplicateEntityGroups: MAX_LIKELY_DUPLICATE_ENTITY_GROUPS,
  likelyDuplicateEntityRecords: likelyDuplicateEntities.reduce((sum, group) => sum + group.count, 0),
  coarseScientificNameGroups: coarseScientificNameGroups.length,
  likelyDuplicateEntities,
  coarseScientificNames: coarseScientificNameGroups,
};

console.log(JSON.stringify(report, null, 2));

if (likelyDuplicateEntities.length > MAX_LIKELY_DUPLICATE_ENTITY_GROUPS) {
  console.error(
    `Duplicate catalog debt increased: ${likelyDuplicateEntities.length} likely duplicate entity groups; maximum allowed is ${MAX_LIKELY_DUPLICATE_ENTITY_GROUPS}.`,
  );
  process.exit(1);
}
