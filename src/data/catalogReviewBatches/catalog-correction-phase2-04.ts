import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';

const reviewedAt = '2026-10-18T03:20:00+08:00';

export const catalogCorrectionPhase2_04Sources = {
  fishBaseGymnotusCarapo: {
    id: 'fishbase-gymnotus-carapo-phase2-04',
    title: 'Gymnotus carapo (Banded knifefish) species summary',
    publisher: 'FishBase',
    url: 'https://www.fishbase.se/summary/Gymnotus-carapo.html',
    sourceType: 'professional_association',
    reviewStatus: 'reviewed',
  },
  seriouslyFishGymnotusCarapo: {
    id: 'seriouslyfish-gymnotus-carapo-phase2-04',
    title: 'Gymnotus carapo (Banded Knifefish)',
    publisher: 'Seriously Fish',
    url: 'https://www.seriouslyfish.com/species/gymnotus-carapo',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  taiwanFishDbGymnotusCarapo: {
    id: 'sinica-fishdb-gymnotus-carapo-phase2-04',
    title: 'Gymnotus carapo — 圭亞那裸背電鰻',
    publisher: 'Taiwan Fish Database, Academia Sinica',
    url: 'https://fishdb.sinica.edu.tw/chi/chinesequer2.php?R1=&T1=&cn=&dere=&fm=&gc=&me=&orderby=science&page=69&pz=200&vn=',
    sourceType: 'government',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

const identitySources = [
  catalogCorrectionPhase2_04Sources.fishBaseGymnotusCarapo.id,
  catalogCorrectionPhase2_04Sources.taiwanFishDbGymnotusCarapo.id,
];

const husbandrySources = [
  catalogCorrectionPhase2_04Sources.fishBaseGymnotusCarapo.id,
  catalogCorrectionPhase2_04Sources.seriouslyFishGymnotusCarapo.id,
];

const supported = (
  field: CatalogFieldReview['field'],
  proposedValue: unknown,
  citationIds: string[],
  conflictNotes: string[],
  confidence: CatalogFieldReview['confidence'] = 'high',
): CatalogFieldReview => ({
  speciesId: 'sp_0120',
  field,
  proposedValue,
  status: 'reviewed',
  resolution: 'supported',
  confidence,
  citationIds,
  conflictNotes,
  reviewedAt,
});

export const catalogCorrectionPhase2_04FieldReviews: CatalogFieldReview[] = [
  supported('identity', {
    scientificName: 'Gymnotus carapo',
  }, identitySources, [
    'FishBase and the Taiwan Fish Database identify the catalog scientific name as the valid taxon Gymnotus carapo.',
    'The Taiwan Fish Database records the Chinese common name 圭亞那裸背電鰻. The previous catalog label 電鰻（觀賞型）could be confused with Electrophorus electric eels and is therefore corrected rather than treated as a second candidate taxon.',
  ]),
  supported('water', 'freshwater', husbandrySources, [
    'Both reviewed exact-taxon sources describe Gymnotus carapo as freshwater.',
  ]),
  supported('temperature', { min: 22, max: 28 }, husbandrySources, [
    'FishBase and Seriously Fish independently support a 22–28°C aquarium/environment range.',
  ]),
  supported('ph', { min: 6, max: 7.5 }, husbandrySources, [
    'FishBase and Seriously Fish independently support pH 6.0–7.5.',
  ]),
  supported('adult_size', { min: null, max: 76 }, husbandrySources, [
    'FishBase reports 76 cm total length, while Seriously Fish reports 60 cm standard length. The larger published total-length maximum is retained for conservative Compatibility screening; measurement bases are not treated as a contradiction.',
  ]),
  supported('tank_size', { liters: 648, lengthCm: 180 }, [
    catalogCorrectionPhase2_04Sources.seriouslyFishGymnotusCarapo.id,
  ], [
    'Seriously Fish recommends at least 180 × 60 × 60 cm, approximately 648 L, and preferably larger.',
  ]),
  supported('social_behavior', { mode: 'solitary', minimumGroupSize: 1 }, [
    catalogCorrectionPhase2_04Sources.seriouslyFishGymnotusCarapo.id,
  ], [
    'Seriously Fish states the species is very territorial with conspecifics and that more than one specimen requires a massive aquarium; single-specimen planning is therefore the reviewed default.',
  ]),
  supported('territoriality', { traits: ['conspecific_territoriality'] }, [
    catalogCorrectionPhase2_04Sources.seriouslyFishGymnotusCarapo.id,
  ], [
    'The reviewed exact-taxon husbandry source explicitly describes strong territoriality toward conspecifics.',
  ]),
  supported('predation', { targets: ['small_fish'] }, husbandrySources, [
    'Seriously Fish states that small fish will be eaten; FishBase also records fish, especially small characins, in the diet.',
  ]),
];

export const catalogCorrectionPhase2_04VerifiedSourceIds = Object.values(catalogCorrectionPhase2_04Sources)
  .map(source => source.id);

/**
 * Direct taxon correction: this catalog object is the exact species Gymnotus
 * carapo, not a variant inheriting from a second catalog object.
 */
export const resolvedCatalogIdentityCorrectionSpeciesIds = new Set(['sp_0120']);

export const catalogIdentityCorrectionBaseSpeciesIds = {} as const;
