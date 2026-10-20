import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';
import type { CompatibilityProfileAuthorityPatch } from './fast-lane-20261014';

const reviewedAt = '2026-10-20T21:30:00+09:00';

export const compatibilityTemperatureDirectWave30Sources = {
  aphyocypris_spawning_temperature_2001: {
    id: 'temperature-wave30-aphyocypris-spawning-2001',
    title: 'Influence of Water Temperature on Spawning of Chinese Bleak, Aphyocypris chinensis',
    publisher: 'Korean Journal of Ecology and Environment',
    url: 'https://kiss.kstudy.com/Detail/Ar?key=1829354',
    sourceType: 'peer_reviewed',
    reviewStatus: 'reviewed',
  },
  aphyocypris_managed_rearing_22c: {
    id: 'temperature-wave30-aphyocypris-managed-rearing-22c',
    title: 'Intersubfamilial Hybridization of Two Danio and Six Related Cyprinid Fishes',
    publisher: 'Bulletin of the Faculty of Fisheries Sciences, Hokkaido University',
    url: 'https://eprints.lib.hokudai.ac.jp/dspace/bitstream/2115/80066/1/bull.fish.70.2.133.pdf',
    sourceType: 'peer_reviewed',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

export const compatibilityTemperatureDirectWave30FieldReviews: CatalogFieldReview[] = [{
  speciesId: 'sp_0046',
  field: 'temperature',
  proposedValue: { min: 19, max: 25 },
  status: 'reviewed',
  resolution: 'supported',
  confidence: 'medium',
  citationIds: [
    compatibilityTemperatureDirectWave30Sources.aphyocypris_spawning_temperature_2001.id,
    compatibilityTemperatureDirectWave30Sources.aphyocypris_managed_rearing_22c.id,
  ],
  conflictNotes: [
    'Exact-taxon adult Aphyocypris chinensis were maintained for two months at 19, 22, 25 and 28 C. Spawning, egg production and hatching performance improved from 19 through 25 C but declined at 28 C. The reviewed Compatibility range is therefore conservatively bounded at 19-25 C rather than treating every experimental temperature as a husbandry recommendation.',
    'An independent exact-taxon study reports managed A. chinensis rearing at 22 C. This corroborates the selected interval but is not used to widen it.',
  ],
  reviewedAt,
}];

export const compatibilityTemperatureDirectWave30VerifiedSourceIds = Object.values(
  compatibilityTemperatureDirectWave30Sources,
).map(item => item.id);

export const compatibilityTemperatureDirectWave30ProfilePatches: readonly CompatibilityProfileAuthorityPatch[] = [];

export const compatibilityTemperatureDirectWave30AuthorityPatch = {
  patchId: 'temperature-direct-wave30-20261020',
  speciesIds: ['sp_0046'],
  authorityOwner: 'src/data/compatibilityAuthorityPatches/temperature-direct-wave30-20261020.ts',
  runtimeScope: 'source_controlled_only',
  writesProductionAuthority: false,
  exactTaxonOnly: true,
  promotedFieldCount: 1,
  addsPairRules: false,
} as const;
