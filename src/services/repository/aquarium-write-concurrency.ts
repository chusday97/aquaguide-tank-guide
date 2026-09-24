export type AquariumAggregateVersionShape = {
  id: string;
  version: number;
  species?: Array<{
    id: string;
    version: number;
    batches?: Array<{ id: string; version: number }>;
  }>;
  equipment?: { id: string; version: number };
};

export type AquariumWriteBaseline = {
  aquariumVersion: number;
  species: Record<string, { version: number; batches: Record<string, number> }>;
  equipment: { id: string; version: number } | null;
};

const versionMap = (items: Array<{ id: string; version: number }> = []) => Object.fromEntries(
  items.map(item => [item.id, item.version]),
);

export const createAquariumWriteBaseline = (record: AquariumAggregateVersionShape): AquariumWriteBaseline => ({
  aquariumVersion: record.version,
  species: Object.fromEntries((record.species || []).map(item => [
    item.id,
    {
      version: item.version,
      batches: versionMap(item.batches || []),
    },
  ])),
  equipment: record.equipment
    ? { id: record.equipment.id, version: record.equipment.version }
    : null,
});

const sameVersionMap = (expected: Record<string, number>, actual: Record<string, number>) => {
  const expectedIds = Object.keys(expected).sort();
  const actualIds = Object.keys(actual).sort();
  if (expectedIds.length !== actualIds.length) return false;
  return expectedIds.every((id, index) => id === actualIds[index] && expected[id] === actual[id]);
};

export const aquariumWriteBaselineMatches = (
  baseline: AquariumWriteBaseline,
  current: AquariumAggregateVersionShape,
  options: { ignoreAquariumVersion?: boolean } = {},
) => {
  if (!options.ignoreAquariumVersion && baseline.aquariumVersion !== current.version) return false;

  const currentSpecies = Object.fromEntries((current.species || []).map(item => [
    item.id,
    {
      version: item.version,
      batches: versionMap(item.batches || []),
    },
  ]));
  const baselineSpeciesIds = Object.keys(baseline.species).sort();
  const currentSpeciesIds = Object.keys(currentSpecies).sort();
  if (baselineSpeciesIds.length !== currentSpeciesIds.length) return false;

  for (let index = 0; index < baselineSpeciesIds.length; index += 1) {
    const id = baselineSpeciesIds[index];
    if (id !== currentSpeciesIds[index]) return false;
    const expected = baseline.species[id];
    const actual = currentSpecies[id];
    if (!actual || expected.version !== actual.version || !sameVersionMap(expected.batches, actual.batches)) return false;
  }

  if (!baseline.equipment && !current.equipment) return true;
  if (!baseline.equipment || !current.equipment) return false;
  return baseline.equipment.id === current.equipment.id && baseline.equipment.version === current.equipment.version;
};
