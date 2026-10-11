import {
  compatibilityProductionRolloutPendingProfileIds,
  compatibilityStackedWave04PendingProfileIds,
} from './compatibilityNextWaveBatch';

export type CompatibilityProfileRolloutGeneration =
  | 'current-production'
  | 'predecessor-target'
  | 'target';

export const exactStringSet = (
  actual: ReadonlySet<string>,
  expected: ReadonlySet<string>,
) => actual.size === expected.size && [...expected].every(key => actual.has(key));

export const buildCompatibilityProfileRolloutKeysets = (targetKeys: Iterable<string>) => {
  const target = new Set(targetKeys);
  const productionPending = new Set<string>(compatibilityProductionRolloutPendingProfileIds);
  const stackedPending = new Set<string>(compatibilityStackedWave04PendingProfileIds);

  for (const speciesId of [...productionPending, ...stackedPending]) {
    if (!target.has(speciesId)) {
      throw new Error('Compatibility rollout pending Profile is not present in target authority: ' + speciesId);
    }
  }
  for (const speciesId of stackedPending) {
    if (productionPending.has(speciesId)) {
      throw new Error('Compatibility rollout generations must not overlap pending Profile IDs: ' + speciesId);
    }
  }

  const predecessorTarget = new Set([...target].filter(key => !stackedPending.has(key)));
  const currentProduction = new Set([...predecessorTarget].filter(key => !productionPending.has(key)));

  if (target.size - predecessorTarget.size !== stackedPending.size) {
    throw new Error('Compatibility stacked rollout keysets do not form the expected wave04 delta.');
  }
  if (predecessorTarget.size - currentProduction.size !== productionPending.size) {
    throw new Error('Compatibility Production rollout keysets do not form the expected predecessor delta.');
  }

  return { currentProduction, predecessorTarget, target };
};

export const getCompatibilityProfileRolloutGeneration = (
  actualKeys: Iterable<string>,
  targetKeys: Iterable<string>,
): CompatibilityProfileRolloutGeneration | null => {
  const actual = new Set(actualKeys);
  const expected = buildCompatibilityProfileRolloutKeysets(targetKeys);
  if (exactStringSet(actual, expected.target)) return 'target';
  if (exactStringSet(actual, expected.predecessorTarget)) return 'predecessor-target';
  if (exactStringSet(actual, expected.currentProduction)) return 'current-production';
  return null;
};
