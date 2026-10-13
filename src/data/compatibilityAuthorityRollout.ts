import {
  compatibilityProductionRolloutPendingProfileIds,
  compatibilityStackedWave04PendingProfileIds,
  compatibilityStackedWave05PendingProfileIds,
  compatibilityStackedWave06PendingProfileIds,
  compatibilityStackedWave16PendingProfileIds,
} from './compatibilityNextWaveBatch';

export type CompatibilityProfileRolloutGeneration =
  | 'current-production'
  | 'production-target'
  | 'wave04-target'
  | 'wave05-target'
  | 'wave06-target'
  | 'target';

export type CompatibilityProfileAuthorityGeneration =
  | CompatibilityProfileRolloutGeneration
  | 'post-target-superset';

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
  const wave16Pending = new Set<string>(compatibilityStackedWave16PendingProfileIds);

  const generations = [productionPending, wave04Pending, wave05Pending, wave06Pending, wave16Pending];
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

  const wave06Target = new Set([...target].filter(key => !wave16Pending.has(key)));
  const wave05Target = new Set([...wave06Target].filter(key => !wave06Pending.has(key)));
  const wave04Target = new Set([...wave05Target].filter(key => !wave05Pending.has(key)));
  const productionTarget = new Set([...wave04Target].filter(key => !wave04Pending.has(key)));
  const currentProduction = new Set([...productionTarget].filter(key => !productionPending.has(key)));

  if (target.size - wave06Target.size !== wave16Pending.size) {
    throw new Error('Compatibility rollout keysets do not form the expected wave16 delta.');
  }
  if (wave06Target.size - wave05Target.size !== wave06Pending.size) {
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

  return { currentProduction, productionTarget, wave04Target, wave05Target, wave06Target, target };
};

export const getCompatibilityProfileRolloutGeneration = (
  actualKeys: Iterable<string>,
  targetKeys: Iterable<string>,
): CompatibilityProfileRolloutGeneration | null => {
  const actual = new Set(actualKeys);
  const expected = buildCompatibilityProfileRolloutKeysets(targetKeys);
  if (exactStringSet(actual, expected.target)) return 'target';
  if (exactStringSet(actual, expected.wave06Target)) return 'wave06-target';
  if (exactStringSet(actual, expected.wave05Target)) return 'wave05-target';
  if (exactStringSet(actual, expected.wave04Target)) return 'wave04-target';
  if (exactStringSet(actual, expected.productionTarget)) return 'production-target';
  if (exactStringSet(actual, expected.currentProduction)) return 'current-production';
  return null;
};

/**
 * Keeps every currently authorised rollout generation exact/fail-closed, then
 * allows monotonic Profile growth once the full repository target has landed.
 * This is the key scalability contract: a reviewed new species may add one
 * Profile without requiring a new hard-coded rollout generation.
 */
export const getCompatibilityProfileAuthorityGeneration = (
  actualKeys: Iterable<string>,
  targetKeys: Iterable<string>,
): CompatibilityProfileAuthorityGeneration | null => {
  const rollout = getCompatibilityProfileRolloutGeneration(actualKeys, targetKeys);
  if (rollout) return rollout;
  const actual = new Set(actualKeys);
  const target = new Set(targetKeys);
  if (actual.size > target.size && [...target].every(key => actual.has(key))) return 'post-target-superset';
  return null;
};
