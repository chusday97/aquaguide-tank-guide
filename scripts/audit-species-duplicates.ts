import { fishData } from '../src/data/fishData';
import { speciesIdAliases } from '../src/modules/species/speciesAliases';
import { speciesCollisionReviews } from './species-collision-reviews';

const MAX_LIKELY_DUPLICATE_ENTITY_GROUPS = 0;
const EXPECTED_STABLE_ALIAS_COUNT = 28;
const MAX_UNREVIEWED_ALIAS_LIKE_COLLISION_GROUPS = 0;

const normalize = (value?: string) => (value || '').trim().toLowerCase().replace(/\s+/g, ' ');
const collisionKey = (ids: Iterable<string>) => [...ids].sort().join('|');

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

const comparableRecord = (species: typeof fishData[number]) => {
  const { id: _id, name: _name, image: _image, ...rest } = species;
  return rest as Record<string, unknown>;
};

const mismatchedRecordFields = (records: Array<Record<string, unknown>>) => {
  const keys = new Set(records.flatMap(record => Object.keys(record)));
  return [...keys]
    .filter(key => new Set(records.map(record => JSON.stringify(record[key]))).size > 1)
    .sort();
};

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
    key: collisionKey(group.map(species => species.id)),
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

const scientificNameCollisionsWithDifferentNames = exactScientificNameDuplicates.filter(group => {
  const names = new Set(group.records.map(record => normalize(record.name)));
  return names.size > 1;
});

const reviewByKey = new Map<string, typeof speciesCollisionReviews[number]>();
const duplicateReviewKeys: string[] = [];
const malformedReviewPairs = speciesCollisionReviews.filter(review => (
  review.ids.length !== 2
  || review.ids.some(id => !id)
  || new Set(review.ids).size !== review.ids.length
));
for (const review of speciesCollisionReviews) {
  const key = collisionKey(review.ids);
  if (reviewByKey.has(key)) duplicateReviewKeys.push(key);
  reviewByKey.set(key, review);
}

const collisionKeys = new Set(aliasLikeCollisionGroups.map(group => group.key));
const unreviewedAliasLikeCollisions = aliasLikeCollisionGroups.filter(group => !reviewByKey.has(group.key));
const staleCollisionReviews = speciesCollisionReviews.filter(review => !collisionKeys.has(collisionKey(review.ids)));
const reviewedAliasLikeCollisions = aliasLikeCollisionGroups
  .filter(group => reviewByKey.has(group.key))
  .map(group => ({
    ...group,
    review: reviewByKey.get(group.key),
  }));

const reviewStatusCounts = speciesCollisionReviews.reduce<Record<string, number>>((counts, review) => {
  counts[review.status] = (counts[review.status] || 0) + 1;
  return counts;
}, {});

const speciesById = new Map(fishData.map(species => [species.id, species]));
const probableAliasRecordParity = speciesCollisionReviews
  .filter(review => review.status === 'probable_alias')
  .map(review => {
    const missingIds = review.ids.filter(id => !speciesById.has(id));
    const records = review.ids
      .map(id => speciesById.get(id))
      .filter((species): species is typeof fishData[number] => Boolean(species));
    const comparableRecords = records.map(comparableRecord);
    const mismatchedFields = comparableRecords.length === review.ids.length
      ? mismatchedRecordFields(comparableRecords)
      : [];
    return {
      key: collisionKey(review.ids),
      ids: review.ids,
      names: records.map(species => species.name),
      confidence: review.confidence,
      missingIds,
      fullRecordParity: missingIds.length === 0 && mismatchedFields.length === 0,
      mismatchedFields,
    };
  });
const fullRecordParityCandidates = probableAliasRecordParity.filter(candidate => candidate.fullRecordParity);
const probableAliasesNeedingRecordReview = probableAliasRecordParity.filter(candidate => !candidate.fullRecordParity);

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
  aliasLikeCollisionRecords: aliasLikeCollisionGroups.reduce((sum, group) => sum + group.count, 0),
  reviewedAliasLikeCollisionGroups: reviewedAliasLikeCollisions.length,
  unreviewedAliasLikeCollisionGroups: unreviewedAliasLikeCollisions.length,
  maxAllowedUnreviewedAliasLikeCollisionGroups: MAX_UNREVIEWED_ALIAS_LIKE_COLLISION_GROUPS,
  reviewStatusCounts,
  probableAliasGroups: probableAliasRecordParity.length,
  fullRecordParityCandidateGroups: fullRecordParityCandidates.length,
  probableAliasGroupsNeedingRecordReview: probableAliasesNeedingRecordReview.length,
  duplicateReviewKeys,
  malformedReviewPairCount: malformedReviewPairs.length,
  staleCollisionReviewCount: staleCollisionReviews.length,
  stableAliasCount: Object.keys(speciesIdAliases).length,
  expectedStableAliasCount: EXPECTED_STABLE_ALIAS_COUNT,
  remainingLegacyAliasIds,
  missingCanonicalAliasTargets,
  scientificNameCollisionsWithDifferentNames: scientificNameCollisionsWithDifferentNames.length,
  likelyDuplicateEntities,
  reviewedAliasLikeCollisions,
  probableAliasRecordParity,
  fullRecordParityCandidates,
  probableAliasesNeedingRecordReview,
  unreviewedAliasLikeCollisions,
  malformedReviewPairs,
  staleCollisionReviews,
  scientificNameCollisionDetails: scientificNameCollisionsWithDifferentNames,
};

console.log(JSON.stringify(report, null, 2));

if (likelyDuplicateEntities.length > MAX_LIKELY_DUPLICATE_ENTITY_GROUPS) {
  console.error(
    `Duplicate catalog debt increased: ${likelyDuplicateEntities.length} likely duplicate entity groups; maximum allowed is ${MAX_LIKELY_DUPLICATE_ENTITY_GROUPS}.`,
  );
  process.exit(1);
}

if (malformedReviewPairs.length > 0) {
  console.error(`Malformed species collision review pairs: ${malformedReviewPairs.map(review => collisionKey(review.ids)).join(', ')}`);
  process.exit(1);
}

if (duplicateReviewKeys.length > 0) {
  console.error(`Duplicate species collision review keys: ${duplicateReviewKeys.join(', ')}`);
  process.exit(1);
}

if (unreviewedAliasLikeCollisions.length > MAX_UNREVIEWED_ALIAS_LIKE_COLLISION_GROUPS) {
  console.error(
    `Unreviewed alias-like catalog collisions detected: ${unreviewedAliasLikeCollisions.length}; maximum allowed is ${MAX_UNREVIEWED_ALIAS_LIKE_COLLISION_GROUPS}.`,
  );
  process.exit(1);
}

if (staleCollisionReviews.length > 0) {
  console.error(
    `Species collision review ledger is stale: ${staleCollisionReviews.map(review => collisionKey(review.ids)).join(', ')}`,
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
