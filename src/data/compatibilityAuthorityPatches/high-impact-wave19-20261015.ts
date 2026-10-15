import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';
import type { CompatibilityProfileAuthorityPatch } from './fast-lane-20261014';

const reviewedAt = '2026-10-15T20:10:00+09:00';

export const compatibilityHighImpactWave19Sources = {
  acrossocheilusGrowoutPatent: {
    id: 'cnipa-acrossocheilus-fasciatus-growout-wave19',
    title: 'High-density green ecological culture method for Acrossocheilus fasciatus (CN104509469A)',
    publisher: 'China National Intellectual Property Administration',
    url: 'https://patents.google.com/patent/CN104509469A/zh',
    sourceType: 'government',
    reviewStatus: 'reviewed',
  },
  acrossocheilusBreedingPatent: {
    id: 'cnipa-acrossocheilus-fasciatus-breeding-wave19',
    title: 'Artificial breeding method for Acrossocheilus fasciatus (CN102090361A)',
    publisher: 'China National Intellectual Property Administration',
    url: 'https://patents.google.com/patent/CN102090361A/zh',
    sourceType: 'government',
    reviewStatus: 'reviewed',
  },
  acrossocheilusTemperatureStudy: {
    id: 'jwas-acrossocheilus-fasciatus-temperature-wave19',
    title: 'Effect of temperature on the growth, feeding performance, gonadal development, and nutritive compositions in the muscle of fry stream groupers, Acrossocheilus fasciatus',
    publisher: 'Journal of the World Aquaculture Society',
    url: 'https://doi.org/10.1111/jwas.13024',
    sourceType: 'peer_reviewed',
    reviewStatus: 'reviewed',
  },
  acrossocheilusDietStudy: {
    id: 'dlou-acrossocheilus-fasciatus-diet-wave19',
    title: 'Early developmental characteristics of Acrossocheilus fasciatus and effects of abiotic environmental factors',
    publisher: 'Journal of Dalian Ocean University',
    url: 'https://doi.org/10.16535/j.cnki.dlhyxb.2025-236',
    sourceType: 'peer_reviewed',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

const growout = compatibilityHighImpactWave19Sources.acrossocheilusGrowoutPatent.id;
const breeding = compatibilityHighImpactWave19Sources.acrossocheilusBreedingPatent.id;

const supported = (
  field: CatalogFieldReview['field'],
  proposedValue: unknown,
  citationIds: string[],
  conflictNotes: string[],
): CatalogFieldReview => ({
  speciesId: 'sp_0051',
  field,
  proposedValue,
  status: 'reviewed',
  resolution: 'supported',
  confidence: 'high',
  citationIds,
  conflictNotes,
  reviewedAt,
});

export const compatibilityHighImpactWave19FieldReviews: CatalogFieldReview[] = [
  supported(
    'ph',
    { min: 7.2, max: 7.8 },
    [growout, breeding],
    [
      'CN104509469A describes successful high-density grow-out of 光唇鱼 in flowing culture water maintained at pH 7.2–7.8, with reported survival up to 97%. This is a production grow-out condition rather than a one-off laboratory exposure.',
      'CN102090361A explicitly identifies 光唇鱼 as Acrossocheilus fasciatus and independently documents managed breeding at pH 6.7–7.2. The grow-out range is promoted because the Compatibility field is for general maintenance rather than spawning-only conditions.',
    ],
  ),
];

export const compatibilityHighImpactWave19VerifiedSourceIds = Object.values(
  compatibilityHighImpactWave19Sources,
).map(item => item.id);

export const compatibilityHighImpactWave19ProfilePatches: readonly CompatibilityProfileAuthorityPatch[] = [
  {
    speciesId: 'sp_0051',
    addCitationIds: [growout, breeding],
    addRequiredFacts: ['ph'],
  },
] as const;

export const compatibilityHighImpactWave19AuthorityPatch = {
  patchId: 'high-impact-acrossocheilus-evidence-wave19-20261015',
  speciesIds: ['sp_0051'],
  authorityOwner: 'src/data/compatibilityAuthorityPatches/high-impact-wave19-20261015.ts',
  runtimeScope: 'source_controlled_only',
  writesProductionAuthority: false,
} as const;
