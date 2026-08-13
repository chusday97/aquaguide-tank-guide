import { fishData } from '../src/data/fishData';

const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');

const byScientificName = new Map<string, typeof fishData>();
for (const species of fishData) {
  const key = normalize(species.scientificName || '');
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

console.log(JSON.stringify({
  totalSpecies: fishData.length,
  exactScientificNameDuplicateGroups: exactScientificNameDuplicates.length,
  exactScientificNameDuplicateRecords: exactScientificNameDuplicates.reduce((sum, group) => sum + group.count, 0),
  groups: exactScientificNameDuplicates,
}, null, 2));
