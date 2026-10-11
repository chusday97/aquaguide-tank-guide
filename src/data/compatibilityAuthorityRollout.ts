import { compatibilityProductionRolloutPendingProfileIds } from './compatibilityNextWaveBatch';

export type CompatibilityProfileRolloutGeneration = 'current-production' | 'target';

export const exactStringSet = (
  actual: ReadonlySet<string>,
  expected: ReadonlySet<string>,
) => actual.size === expected.size && [...expected].every(key => actual.has(key));

export const buildCompatibilityProfileRolloutKeysets = (targetKeys: Iterable<string>) => {
  const target = new Set(targetKeys);
  const pending = new Set<string>(compatibilityProductionRolloutPendingProfileIds);
  for (const speciesId of pending) {
    if (!target.has(speciesId)) throw new Error('Compatibility rollout pending Profile is not present in target authority: ' + speciesId);
  }
  const currentProduction = new Set([...target].filter(key => !pending.has(key)));
  if (target.size - currentProduction.size !== pending.size) throw new Error('Compatibility rollout Profile keysets do not form the expected exact delta.');
  return { currentProduction, target };
};

export const getCompatibilityProfileRolloutGeneration = (
  actualKeys: Iterable<string>,
  targetKeys: Iterable<string>,
): CompatibilityProfileRolloutGeneration | null => {
  const actual = new Set(actualKeys);
  const expected = buildCompatibilityProfileRolloutKeysets(targetKeys);
  if (exactStringSet(actual, expected.target)) return 'target';
  if (exactStringSet(actual, expected.currentProduction)) return 'current-production';
  return null;
};
