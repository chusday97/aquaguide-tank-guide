import {
  compatibilityProductionRolloutPendingProfileIds,
  compatibilityStackedWave04PendingProfileIds,
  compatibilityStackedWave05PendingProfileIds,
  compatibilityStackedWave06PendingProfileIds,
} from './compatibilityNextWaveBatch';

export type CompatibilityProfileRolloutGeneration =
  | 'current-production'
  | 'production-target'
  | 'wave04-target'
  | 'wave05-target'
  | 'target';

export const exactStringSet = (
  actual: ReadonlySet<string>,
  expected: ReadonlySet<string>,
) => actual.size === expected.size && [...expected].every(key => actual.has(key));

export const buildCompatibilityProfileRolloutKeysets = (targetKeys: Iterable<string>) => {
  const target = new Set(targetKeys);
  const productionPending = new Set<string>(compatibilityProductionRolloutPendingProfileIds);
  const wave04Pending = new Set<string>(compatibilityStackedWave04PendingProfileIds);
  const wave05Pending = new Set<string>(compatibilityStackedWave05PendingProfileIds);
  const wave06Pending = new Set<string>(compatibilityStackedWave06PendingProfileIds);

  const generations = [productionPending, wave04Pending, wave05Pending, wave06Pending];
  for (const pending of generations) {
    for (const speciesId of pending) {
      if (!target.has(speciesId)) {
        throw new Error('Compatibility rollout pending Profile is not present in target authority: ' + speciesId);
      }
    }
  }
  for (let i = 0; i < generations.length; i += 1) {
    for (let j = i + 1; j < generations.length; j += 1) {
      for (const speciesId of generations[i]) {
        if (generations[j].has(speciesId)) {
          throw new Error('Compatibility rollout generations must not overlap pending Profile IDs: ' + speciesId);
        }
      }
    }
  }

  const wave05Target = new Set([...target].filter(key => !wave06Pending.has(key)));
  const wave04Target = new Set([...wave05Target].filter(key => !wave05Pending.has(key)));
  const productionTarget = new Set([...wave04Target].filter(key => !wave04Pending.has(key)));
  const currentProduction = new Set([...productionTarget].filter(key => !productionPending.has(key)));

  if (target.size - wave05Target.size !== wave06Pending.size) {
    throw new Error('Compatibility rollout keysets do not form the expected wave06 delta.');
  }
  if (wave05Target.size - wave04Target.size !== wave05Pending.size) {
    throw new Error('Compatibility rollout keysets do not form the expected wave05 delta.');
  }
  if (wave04Target.size - productionTarget.size !== wave04Pending.size) {
    throw new Error('Compatibility rollout keysets do not form the expected wave04 delta.');
  }
  if (productionTarget.size - currentProduction.size !== productionPending.size) {
    throw new Error('Compatibility rollout keysets do not form the expected Production delta.');
  }

  return { currentProduction, productionTarget, wave04Target, wave05Target, target };
};

export const getCompatibilityProfileRolloutGeneration = (
  actualKeys: Iterable<string>,
  targetKeys: Iterable<string>,
): CompatibilityProfileRolloutGeneration | null => {
  const actual = new Set(actualKeys);
  const expected = buildCompatibilityProfileRolloutKeysets(targetKeys);
  if (exactStringSet(actual, expected.target)) return 'target';
  if (exactStringSet(actual, expected.wave05Target)) return 'wave05-target';
  if (exactStringSet(actual, expected.wave04Target)) return 'wave04-target';
  if (exactStringSet(actual, expected.productionTarget)) return 'production-target';
  if (exactStringSet(actual, expected.currentProduction)) return 'current-production';
  return null;
};
