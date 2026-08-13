import { fishData } from '../src/data/fishData';
import { speciesIdAliases } from '../src/modules/species/speciesAliases';

const MAX_LIKELY_DUPLICATE_ENTITY_GROUPS = 0;
const MAX_ALIAS_LIKE_COLLISION_GROUPS = 11;
const EXPECTED_STABLE_ALIAS_COUNT = 28;

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

const aliasFingerprint = (species: typeof fishData[number]) => JSON.stringify({
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
const byAliasFingerprint = new Map<string, typeof fishData>();
for (const species of fishData) {
  const businessKey = businessFingerprint(species);
  const businessGroup = byBusinessFingerprint.get(businessKey) || [];
  businessGroup.push(species);
  byBusinessFingerprint.set(businessKey, businessGroup);

  const aliasKey = aliasFingerprint(species);
  const aliasGroup = byAliasFingerprint.get(aliasKey) || [];
  aliasGroup.push(species);
  byAliasFingerprint.set(aliasKey, aliasGroup);
}

const likelyDuplicateEntities = [...byBusinessFingerprint.values()]
  .filter(group => group.length > 1)
  .map(group => ({
    count: group.length,
    records: [...group]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(species => ({
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

const aliasLikeCollisionGroups = [...byAliasFingerprint.values()]
  .filter(group => group.length > 1 && new Set(group.map(species => normalize(species.name))).size > 1)
  .map(group => ({
    count: group.length,
    records: [...group]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(species => ({
        id: species.id,
        name: species.name,
        scientificName: species.scientificName,
        category: species.category,
        difficulty: species.difficulty,
        tankSize: species.tankSize,
      })),
  }))
  .sort((a, b) => b.count - a.count || a.records[0].scientificName.localeCompare(b.records[0].scientificName));

const coarseScientificNameGroups = exactScientificNameDuplicates.filter(group => {
  const names = new Set(group.records.map(record => normalize(record.name)));
  return names.size > 1;
});

const remainingLegacyAliasIds = Object.keys(speciesIdAliases).filter(aliasId => fishData.some(species => species.id === aliasId));
const missingCanonicalAliasTargets = Array.from(new Set(Object.values(speciesIdAliases)))
  .filter(canonicalId => !fishData.some(species => species.id === canonicalId));

const report = {
  totalSpecies: fishData.length,
  scientificNameCollisionGroups: exactScientificNameDuplicates.length,
  scientificNameCollisionRecords: exactScientificNameDuplicates.reduce((sum, group) => sum + group.count, 0),
  likelyDuplicateEntityGroups: likelyDuplicateEntities.length,
  maxAllowedLikelyDuplicateEntityGroups: MAX_LIKELY_DUPLICATE_ENTITY_GROUPS,
  likelyDuplicateEntityRecords: likelyDuplicateEntities.reduce((sum, group) => sum + group.count, 0),
  aliasLikeCollisionGroups: aliasLikeCollisionGroups.length,
  maxAllowedAliasLikeCollisionGroups: MAX_ALIAS_LIKE_COLLISION_GROUPS,
  aliasLikeCollisionRecords: aliasLikeCollisionGroups.reduce((sum, group) => sum + group.count, 0),
  stableAliasCount: Object.keys(speciesIdAliases).length,
  expectedStableAliasCount: EXPECTED_STABLE_ALIAS_COUNT,
  remainingLegacyAliasIds,
  missingCanonicalAliasTargets,
  coarseScientificNameGroups: coarseScientificNameGroups.length,
  likelyDuplicateEntities,
  aliasLikeCollisions: aliasLikeCollisionGroups,
  coarseScientificNames: coarseScientificNameGroups,
};

console.log(JSON.stringify(report, null, 2));

if (likelyDuplicateEntities.length > MAX_LIKELY_DUPLICATE_ENTITY_GROUPS) {
  console.error(
    `Duplicate catalog debt increased: ${likelyDuplicateEntities.length} likely duplicate entity groups; maximum allowed is ${MAX_LIKELY_DUPLICATE_ENTITY_GROUPS}.`,
  );
  process.exit(1);
}

if (aliasLikeCollisionGroups.length > MAX_ALIAS_LIKE_COLLISION_GROUPS) {
  console.error(
    `Alias-like catalog collision debt increased: ${aliasLikeCollisionGroups.length} groups; maximum allowed is ${MAX_ALIAS_LIKE_COLLISION_GROUPS}.`,
  );
  process.exit(1);
}

if (Object.keys(speciesIdAliases).length !== EXPECTED_STABLE_ALIAS_COUNT) {
  console.error(`Stable species alias count changed unexpectedly: ${Object.keys(speciesIdAliases).length}`);
  process.exit(1);
}

if (remainingLegacyAliasIds.length > 0) {
  console.error(`Deduplicated legacy species IDs reappeared in catalog: ${remainingLegacyAliasIds.join(', ')}`);
  process.exit(1);
}

if (missingCanonicalAliasTargets.length > 0) {
  console.error(`Canonical species IDs required by aliases are missing: ${missingCanonicalAliasTargets.join(', ')}`);
  process.exit(1);
}
