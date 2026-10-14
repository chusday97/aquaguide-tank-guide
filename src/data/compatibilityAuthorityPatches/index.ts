import {
  compatibilityFastLaneAuthorityPatch,
  compatibilityFastLanePatchFieldReviews,
  compatibilityFastLanePatchSources,
  compatibilityFastLanePatchVerifiedSourceIds,
  compatibilityFastLaneProfilePatches,
} from './fast-lane-20261014';
import {
  compatibilityFastLaneWave2AuthorityPatch,
  compatibilityFastLaneWave2FieldReviews,
  compatibilityFastLaneWave2ProfilePatches,
  compatibilityFastLaneWave2Sources,
  compatibilityFastLaneWave2VerifiedSourceIds,
} from './fast-lane-wave2-20261014';

export const compatibilityAuthorityPatchSources = {
  ...compatibilityFastLanePatchSources,
  ...compatibilityFastLaneWave2Sources,
};

export const compatibilityAuthorityPatchFieldReviews = [
  ...compatibilityFastLanePatchFieldReviews,
  ...compatibilityFastLaneWave2FieldReviews,
];

export const compatibilityAuthorityPatchVerifiedSourceIds = [
  ...compatibilityFastLanePatchVerifiedSourceIds,
  ...compatibilityFastLaneWave2VerifiedSourceIds,
];

export const compatibilityProfileAuthorityPatches = [
  ...compatibilityFastLaneProfilePatches,
  ...compatibilityFastLaneWave2ProfilePatches,
];

export const compatibilityAuthorityPatchManifests = [
  compatibilityFastLaneAuthorityPatch,
  compatibilityFastLaneWave2AuthorityPatch,
] as const;
