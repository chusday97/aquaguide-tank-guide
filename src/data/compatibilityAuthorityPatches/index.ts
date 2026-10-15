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
import {
  compatibilityFastLaneWave3AuthorityPatch,
  compatibilityFastLaneWave3FieldReviews,
  compatibilityFastLaneWave3ProfilePatches,
  compatibilityFastLaneWave3Sources,
  compatibilityFastLaneWave3VerifiedSourceIds,
} from './fast-lane-wave3-20261014';
import {
  compatibilityFastLaneWave4AuthorityPatch,
  compatibilityFastLaneWave4FieldReviews,
  compatibilityFastLaneWave4ProfilePatches,
  compatibilityFastLaneWave4Sources,
  compatibilityFastLaneWave4VerifiedSourceIds,
} from './fast-lane-wave4-20261014';
import {
  compatibilityHighLeverageWave1AuthorityPatch,
  compatibilityHighLeverageWave1FieldReviews,
  compatibilityHighLeverageWave1ProfilePatches,
  compatibilityHighLeverageWave1Sources,
  compatibilityHighLeverageWave1VerifiedSourceIds,
} from './high-leverage-wave1-20261015';
import {
  compatibilityNumericWave1AuthorityPatch,
  compatibilityNumericWave1FieldReviews,
  compatibilityNumericWave1ProfilePatches,
  compatibilityNumericWave1Sources,
  compatibilityNumericWave1VerifiedSourceIds,
} from './numeric-wave1-20261015';

export const compatibilityAuthorityPatchSources = {
  ...compatibilityFastLanePatchSources,
  ...compatibilityFastLaneWave2Sources,
  ...compatibilityFastLaneWave3Sources,
  ...compatibilityFastLaneWave4Sources,
  ...compatibilityHighLeverageWave1Sources,
  ...compatibilityNumericWave1Sources,
};

export const compatibilityAuthorityPatchFieldReviews = [
  ...compatibilityFastLanePatchFieldReviews,
  ...compatibilityFastLaneWave2FieldReviews,
  ...compatibilityFastLaneWave3FieldReviews,
  ...compatibilityFastLaneWave4FieldReviews,
  ...compatibilityHighLeverageWave1FieldReviews,
  ...compatibilityNumericWave1FieldReviews,
];

export const compatibilityAuthorityPatchVerifiedSourceIds = [
  ...compatibilityFastLanePatchVerifiedSourceIds,
  ...compatibilityFastLaneWave2VerifiedSourceIds,
  ...compatibilityFastLaneWave3VerifiedSourceIds,
  ...compatibilityFastLaneWave4VerifiedSourceIds,
  ...compatibilityHighLeverageWave1VerifiedSourceIds,
  ...compatibilityNumericWave1VerifiedSourceIds,
];

export const compatibilityProfileAuthorityPatches = [
  ...compatibilityFastLaneProfilePatches,
  ...compatibilityFastLaneWave2ProfilePatches,
  ...compatibilityFastLaneWave3ProfilePatches,
  ...compatibilityFastLaneWave4ProfilePatches,
  ...compatibilityHighLeverageWave1ProfilePatches,
  ...compatibilityNumericWave1ProfilePatches,
];

export const compatibilityAuthorityPatchManifests = [
  compatibilityFastLaneAuthorityPatch,
  compatibilityFastLaneWave2AuthorityPatch,
  compatibilityFastLaneWave3AuthorityPatch,
  compatibilityFastLaneWave4AuthorityPatch,
  compatibilityHighLeverageWave1AuthorityPatch,
  compatibilityNumericWave1AuthorityPatch,
] as const;
