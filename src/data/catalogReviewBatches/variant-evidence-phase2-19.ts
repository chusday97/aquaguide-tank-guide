import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';

const reviewedAt = '2026-10-20T16:10:00+08:00';

export const variantEvidencePhase2_19Sources = {
  goldfishOata: {
    id: 'oata-carassius-auratus-goldfish-phase2-19',
    title: 'How to look after goldfish in an aquarium / fish tank',
    publisher: 'Ornamental Aquatic Trade Association',
    url: 'https://ornamentalfish.org/what-we-do/advice-information/care-sheets/caresheets-coldwater-fish/how-to-look-after-goldfish-in-an-aquarium-fishtank/',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  goldfishRspca: {
    id: 'rspca-carassius-auratus-goldfish-phase2-19',
    title: 'How should I care for my goldfish?',
    publisher: 'RSPCA Australia',
    url: 'https://kb.rspca.org.au/categories/companion-animals/fish/how-should-i-care-for-my-goldfish',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  goldfishAdw: {
    id: 'adw-carassius-auratus-behavior-phase2-19',
    title: 'Carassius auratus species account',
    publisher: 'Animal Diversity Web',
    url: 'https://animaldiversity.org/accounts/Carassius_auratus/',
    sourceType: 'reference',
    reviewStatus: 'reviewed',
  },
  redGrassGuppyMasukoap: {
    id: 'masukoap-red-grass-guppy-phase2-19',
    title: 'Red Grass Guppy exact-strain care and breeding profile',
    publisher: 'Aquarium Encyclopedia / Masukoap',
    url: 'https://masukoap.com/aquacrypt/%E3%83%AC%E3%83%83%E3%83%89%E3%82%B0%E3%83%A9%E3%82%B9%E3%82%B0%E3%83%83%E3%83%94%E3%83%BC%E3%81%AE%E9%A3%BC%E3%81%84%E6%96%B9%E3%81%A8%E5%9B%B3%E9%91%91%E6%83%85%E5%A0%B1/',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  longfinWhiteCloudTropicalFishCo: {
    id: 'tropicalfishco-longfin-white-cloud-phase2-19',
    title: 'Longfin White Cloud Mountain Minnow exact-form care profile',
    publisher: 'Tropical Fish Co',
    url: 'https://tropicalfishco.co.uk/products/tropical-fish-uk-for-sale-buy-live-online-longfin-white-cloud',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

const supported = (
  speciesId: string,
  field: CatalogFieldReview['field'],
  proposedValue: unknown,
  citationIds: string[],
  conflictNotes: string[],
  confidence: CatalogFieldReview['confidence'] = 'high',
): CatalogFieldReview => ({
  speciesId,
  field,
  proposedValue,
  status: 'reviewed',
  resolution: 'supported',
  confidence,
  citationIds,
  conflictNotes,
  reviewedAt,
});

const oata = variantEvidencePhase2_19Sources.goldfishOata.id;
const rspca = variantEvidencePhase2_19Sources.goldfishRspca.id;
const adw = variantEvidencePhase2_19Sources.goldfishAdw.id;
const redGrassGuppy = variantEvidencePhase2_19Sources.redGrassGuppyMasukoap.id;
const longfinWhiteCloud = variantEvidencePhase2_19Sources.longfinWhiteCloudTropicalFishCo.id;

export const variantEvidencePhase2_19FieldReviews: CatalogFieldReview[] = [
  // sp_0162 — Red Grass Goldfish. Its identity review resolves the catalog
  // object to a red colour form of Carassius auratus. These reviews deliberately
  // materialize taxon-level husbandry into exact-object Catalog authority so
  // runtime calculations never fall back to the legacy 5–30°C / pH 7–8.5
  // strings merely because the colour morph is inheritance-eligible.
  supported('sp_0162', 'water', 'freshwater', [oata, adw], [
    'The reviewed identity resolves this object to the Red Grass Goldfish colour form of Carassius auratus; OATA and Animal Diversity Web both describe C. auratus as a freshwater goldfish.',
  ]),
  supported('sp_0162', 'temperature', { min: 4, max: 25 }, [oata], [
    'OATA gives 4–25°C as the maintained aquarium guideline range for Carassius auratus. This replaces the broader legacy catalog survival-style range.',
  ]),
  supported('sp_0162', 'ph', { min: 6, max: 8 }, [oata], [
    'OATA gives pH 6.0–8.0 for aquarium goldfish.',
  ]),
  supported('sp_0162', 'adult_size', { min: null, max: 25 }, [oata], [
    'OATA states that aquarium goldfish commonly reach up to about 25 cm; this is used as the aquarium husbandry maximum rather than the larger wild maximum.',
  ]),
  supported('sp_0162', 'tank_size', { liters: 100, lengthCm: null }, [oata], [
    'OATA recommends at least 100 L for one adult goldfish, with additional volume for further adults.',
  ]),
  supported('sp_0162', 'social_behavior', { mode: 'group', minimumGroupSize: 2 }, [rspca, adw], [
    'RSPCA describes goldfish as social and recommends at least two for companionship; Animal Diversity Web independently describes schooling/social behavior.',
  ]),
  supported('sp_0162', 'territoriality', { traits: [] }, [adw], [
    'Animal Diversity Web explicitly states that Carassius auratus do not defend a territory. This is direct territorial-scope evidence, not an inference from generic peacefulness.',
  ]),
  supported('sp_0162', 'predation', { targets: ['fish_fry'] }, [oata, adw], [
    'OATA explicitly states that goldfish are notorious for eating eggs and fry; Animal Diversity Web independently states that adults consume their own offspring. Only fish-fry predation is promoted here.',
  ]),

  // Exact ornamental-object evidence: fry consumption is explicitly stated.
  supported('sp_0143', 'predation', { targets: ['fish_fry'] }, [redGrassGuppy], [
    'The exact Red Grass Guppy profile states that fry may be eaten by the adults. This supports fry predation only and does not establish general small-fish predation.',
  ], 'medium'),
  supported('sp_0361', 'predation', { targets: ['fish_fry'] }, [longfinWhiteCloud], [
    'The exact Longfin White Cloud profile states that adults may eat newly hatched fry. This supports fry predation only.',
  ], 'medium'),
];

export const variantEvidencePhase2_19VerifiedSourceIds = Object.values(variantEvidencePhase2_19Sources)
  .map(source => source.id);

export const variantEvidencePhase2_19ProfileIds = ['sp_0143', 'sp_0162', 'sp_0361'] as const;
