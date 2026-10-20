import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';
import type { CompatibilityProfileAuthorityPatch } from './fast-lane-20261014';

const reviewedAt = '2026-10-20T22:10:00+08:00';

export const compatibilityTemperatureDirectWave31Sources = {
  acrossocheilus_temperature_adaptation_2023: {
    id: 'temperature-wave31-acrossocheilus-temperature-adaptation-2023',
    title: 'Transcriptional Modulation Reveals Physiological Responses to Temperature Adaptation in Acrossocheilus fasciatus',
    publisher: 'Animals',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10380296/',
    sourceType: 'peer_reviewed',
    reviewStatus: 'reviewed',
  },
  acrossocheilus_fry_rearing_2024: {
    id: 'temperature-wave31-acrossocheilus-fry-rearing-2024',
    title: 'Effect of temperature on the growth, feeding performance, gonadal development, and nutritive compositions in the muscle of fry stream groupers, Acrossocheilus fasciatus',
    publisher: 'Journal of the World Aquaculture Society',
    url: 'https://onlinelibrary.wiley.com/doi/10.1111/jwas.13024',
    sourceType: 'peer_reviewed',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

export const compatibilityTemperatureDirectWave31FieldReviews: CatalogFieldReview[] = [{
  speciesId: 'sp_0051',
  field: 'temperature',
  proposedValue: { min: 12, max: 28 },
  status: 'reviewed',
  resolution: 'supported',
  confidence: 'medium',
  citationIds: [
    compatibilityTemperatureDirectWave31Sources.acrossocheilus_temperature_adaptation_2023.id,
    compatibilityTemperatureDirectWave31Sources.acrossocheilus_fry_rearing_2024.id,
  ],
  conflictNotes: [
    'Exact-taxon literature reports Acrossocheilus fasciatus surviving at approximately 12-30 C.',
    'A controlled 60-day exact-taxon fry rearing study tested 12, 16, 20, 24, 26 and 28 C. The reviewed Compatibility range is conservatively bounded at 12-28 C, the interval directly covered by the controlled rearing treatments, rather than extending to the reported approximate 30 C survival ceiling.',
    'The same rearing study estimated 23.81-26.57 C as optimal for fry growth and feeding. That optimum is not treated as the species-wide maintenance range.',
  ],
  reviewedAt,
}];

export const compatibilityTemperatureDirectWave31VerifiedSourceIds = Object.values(
  compatibilityTemperatureDirectWave31Sources,
).map(item => item.id);

export const compatibilityTemperatureDirectWave31ProfilePatches: readonly CompatibilityProfileAuthorityPatch[] = [];

export const compatibilityTemperatureDirectWave31AuthorityPatch = {
  patchId: 'temperature-direct-wave31-20261020',
  speciesIds: ['sp_0051'],
  authorityOwner: 'src/data/compatibilityAuthorityPatches/temperature-direct-wave31-20261020.ts',
  runtimeScope: 'source_controlled_only',
  writesProductionAuthority: false,
  exactTaxonOnly: true,
  promotedFieldCount: 1,
  addsPairRules: false,
} as const;
