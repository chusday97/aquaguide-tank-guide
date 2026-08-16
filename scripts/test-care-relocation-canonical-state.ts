import assert from 'node:assert/strict';
import { applyCareCanonicalAquariums } from '../src/services/care/care-relocation-canonical-state';
import type { Aquarium } from '../src/types';
import type { LocalAppState } from '../src/services/storage/local-app-state';

const aquarium = (id: string): Aquarium => ({
  id,
  name: id,
  fishes: [],
  waterType: 'Freshwater',
});

const canonical = [aquarium('source'), aquarium('destination')];

const mirrorState = (patch: Pick<LocalAppState, 'aquariums' | 'currentAquariumId'>): LocalAppState => ({
  version: 1,
  currentAquariumId: patch.currentAquariumId,
  aquariums: patch.aquariums,
  wishlist: [],
  dismissedRecommendations: [],
  diagnosisRecords: [],
  compatibilityRecords: [],
  deceasedRecords: [],
  feedingRecords: [],
  observationRecords: [],
  careEvents: [],
  riskReminderState: {},
  updatedAt: '2026-08-17T00:00:00.000Z',
});

// Canonical state must be shown before mirror persistence is attempted.
{
  const order: string[] = [];
  const result = applyCareCanonicalAquariums({
    aquariums: canonical,
    currentAquariumId: 'source',
    showCanonicalAquariums: value => {
      assert.equal(value, canonical);
      order.push('show');
    },
    persistMirror: patch => {
      order.push('persist');
      return mirrorState(patch);
    },
  });
  assert.deepEqual(order, ['show', 'persist']);
  assert.equal(result.mirrorPersisted, true);
  if (result.mirrorPersisted) {
    assert.equal(result.currentAquariumId, 'source');
    assert.equal(result.mirrorState.aquariums, canonical);
  }
}

// Mirror failure is a compatibility-cache problem, not a canonical relocation
// failure. Helper must return the mirror error rather than throw it after the
// canonical state was already made visible.
{
  let canonicalShown = false;
  const result = applyCareCanonicalAquariums({
    aquariums: canonical,
    currentAquariumId: 'source',
    showCanonicalAquariums: value => {
      canonicalShown = true;
      assert.equal(value, canonical);
    },
    persistMirror: () => {
      throw new Error('localStorage quota exceeded');
    },
  });
  assert.equal(canonicalShown, true);
  assert.deepEqual(result, {
    mirrorPersisted: false,
    currentAquariumId: 'source',
    errorMessage: 'localStorage quota exceeded',
  });
}

// If the prior current aquarium no longer exists, choose a factual aquarium
// from the canonical list rather than persisting a stale current id.
{
  const result = applyCareCanonicalAquariums({
    aquariums: canonical,
    currentAquariumId: 'deleted-aquarium',
    showCanonicalAquariums: () => undefined,
    persistMirror: patch => mirrorState(patch),
  });
  assert.equal(result.currentAquariumId, 'source');
}

// Empty canonical state is represented truthfully with no invented aquarium id.
{
  const result = applyCareCanonicalAquariums({
    aquariums: [],
    currentAquariumId: 'old',
    showCanonicalAquariums: () => undefined,
    persistMirror: patch => mirrorState(patch),
  });
  assert.equal(result.currentAquariumId, '');
}

console.log('Care canonical aquarium state passed: canonical view wins before mirror persistence; mirror failure cannot reclassify canonical success');
