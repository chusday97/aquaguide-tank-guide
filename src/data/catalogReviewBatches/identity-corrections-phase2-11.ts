import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';

const reviewedAt = '2026-10-19T20:30:00+08:00';

export const identityCorrectionsPhase2_11Sources = {
  fishBaseGoldfish: {
    id: 'phase2-11-fishbase-carassius-auratus-goldfish',
    title: 'Carassius auratus — Goldfish',
    publisher: 'FishBase',
    url: 'https://www.fishbase.org/summary/Carassius_auratus.html',
    sourceType: 'professional_association',
    reviewStatus: 'reviewed',
  },
  goldfishCouncilRedCapOranda: {
    id: 'phase2-11-goldfish-council-red-cap-oranda',
    title: 'Red Cap Oranda',
    publisher: 'The Goldfish Council',
    url: 'https://www.thegoldfishcouncil.org/post/red-cap-oranda',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  goldfishCouncilPearlscale: {
    id: 'phase2-11-goldfish-council-pearlscale',
    title: 'Pearlscale',
    publisher: 'The Goldfish Council',
    url: 'https://www.thegoldfishcouncil.org/post/pearlscale',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  goldfishCouncilBubbleEye: {
    id: 'phase2-11-goldfish-council-bubble-eye',
    title: 'Bubble Eye and Celestial',
    publisher: 'The Goldfish Council',
    url: 'https://www.thegoldfishcouncil.org/post/bubble-eye-and-celestial',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

const identityReview = (
  speciesId: string,
  variantKey: string,
  lineageSourceId: string,
  lineageNote: string,
): CatalogFieldReview => ({
  speciesId,
  field: 'identity',
  proposedValue: {
    scientificName: 'Carassius auratus',
    baseSpeciesKey: 'Carassius auratus',
    variantKey,
  },
  status: 'reviewed',
  resolution: 'supported',
  confidence: 'high',
  citationIds: [
    identityCorrectionsPhase2_11Sources.fishBaseGoldfish.id,
    lineageSourceId,
  ],
  conflictNotes: [
    'FishBase identifies Goldfish as the formal taxon Carassius auratus.',
    lineageNote,
    'This closes catalog object identity only. No Compatibility husbandry, body-size, tank-size, social, territoriality or predation fact is inherited from the base taxon in this batch.',
    'The legacy blank “var.” suffix is not promoted as a scientific varietal name; the ornamental breed label is stored separately in variantKey.',
  ],
  reviewedAt,
});

export const identityCorrectionsPhase2_11FieldReviews: CatalogFieldReview[] = [
  identityReview(
    'sp_0066',
    'Red Cap Oranda',
    identityCorrectionsPhase2_11Sources.goldfishCouncilRedCapOranda.id,
    'The Goldfish Council treats Red Cap Oranda as an Oranda goldfish colour type/breed division, closing the 鹤顶红 catalog object to the goldfish taxon without asserting morphology-neutral husbandry.',
  ),
  identityReview(
    'sp_0067',
    'Pearlscale',
    identityCorrectionsPhase2_11Sources.goldfishCouncilPearlscale.id,
    'The Goldfish Council documents Pearlscale as a distinct goldfish breed with breed-development standards, closing the 珠鳞 catalog object to the goldfish taxon.',
  ),
  identityReview(
    'sp_0068',
    'Bubble Eye',
    identityCorrectionsPhase2_11Sources.goldfishCouncilBubbleEye.id,
    'The Goldfish Council documents Bubble-eye as a goldfish breed originating in China, closing the 水泡 catalog object to the goldfish taxon.',
  ),
];

export const identityCorrectionsPhase2_11VerifiedSourceIds = Object.values(identityCorrectionsPhase2_11Sources)
  .map(source => source.id);

export const resolvedCatalogIdentityCorrectionSpeciesIds = new Set([
  'sp_0066',
  'sp_0067',
  'sp_0068',
]);

export const catalogIdentityCorrectionBaseSpeciesIds = {} as const;
