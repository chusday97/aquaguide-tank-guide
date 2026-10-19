import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';

const reviewedAt = '2026-10-19T21:30:00+08:00';

export const identityCorrectionsPhase2_12Sources = {
  fishBaseNeonTetra: {
    id: 'phase2-12-fishbase-paracheirodon-innesi',
    title: 'Paracheirodon innesi — Neon tetra',
    publisher: 'FishBase',
    url: 'https://www.fishbase.org/summary/10691',
    sourceType: 'professional_association',
    reviewStatus: 'reviewed',
  },
  fishBaseWhiteCloud: {
    id: 'phase2-12-fishbase-tanichthys-albonubes',
    title: 'Tanichthys albonubes — White cloud mountain minnow',
    publisher: 'FishBase',
    url: 'https://fishbase.se/Fieldguide/FieldGuideSummary.php?c_code=156&genusname=Tanichthys&speciesname=albonubes',
    sourceType: 'professional_association',
    reviewStatus: 'reviewed',
  },
  aquariumCoopWhiteCloudLongfin: {
    id: 'phase2-12-aquarium-coop-white-cloud-longfin',
    title: 'Top 5 Underrated Aquarium Fish — White Cloud Mountain Minnow',
    publisher: 'Aquarium Co-Op',
    url: 'https://www.aquariumcoop.com/blogs/aquarium/underrated-fish',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  aquariumCoopNeonLongfin: {
    id: 'phase2-12-aquarium-coop-neon-longfin',
    title: '5 Best Beginner Schooling Fish — Neon Tetra varieties',
    publisher: 'Aquarium Co-Op',
    url: 'https://www.aquariumcoop.com/blogs/aquarium/schooling-fish-for-beginners',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

const identityReview = (
  speciesId: string,
  scientificName: string,
  baseSourceId: string,
  lineageSourceId: string,
  lineageNote: string,
): CatalogFieldReview => ({
  speciesId,
  field: 'identity',
  proposedValue: {
    scientificName,
    baseSpeciesKey: scientificName,
    variantKey: 'Longfin',
  },
  status: 'reviewed',
  resolution: 'supported',
  confidence: 'high',
  citationIds: [baseSourceId, lineageSourceId],
  conflictNotes: [
    lineageNote,
    'This closes catalog object identity only. Longfin morphology can affect swimming, flow tolerance, fin damage risk and other Compatibility-relevant traits, so no husbandry, size, space, social, territoriality or predation fact is inherited in this batch.',
    'The legacy blank “var.” suffix is not promoted as a scientific varietal name; the ornamental morphology label is stored separately in variantKey.',
  ],
  reviewedAt,
});

export const identityCorrectionsPhase2_12FieldReviews: CatalogFieldReview[] = [
  identityReview(
    'sp_0155',
    'Paracheirodon innesi',
    identityCorrectionsPhase2_12Sources.fishBaseNeonTetra.id,
    identityCorrectionsPhase2_12Sources.aquariumCoopNeonLongfin.id,
    'Aquarium Co-Op identifies neon tetra as Paracheirodon innesi and explicitly lists longfin among the aquarium varieties/types of that species, closing the 长鳍红绿灯 catalog object to the formal neon-tetra taxon without asserting morphology-neutral Compatibility.',
  ),
  identityReview(
    'sp_0361',
    'Tanichthys albonubes',
    identityCorrectionsPhase2_12Sources.fishBaseWhiteCloud.id,
    identityCorrectionsPhase2_12Sources.aquariumCoopWhiteCloudLongfin.id,
    'Aquarium Co-Op identifies White Cloud Mountain Minnow as Tanichthys albonubes and explicitly lists long-fin among its aquarium varieties, closing the 长鳍白云金丝 catalog object to the formal white-cloud taxon without asserting morphology-neutral Compatibility.',
  ),
];

export const identityCorrectionsPhase2_12VerifiedSourceIds = Object.values(identityCorrectionsPhase2_12Sources)
  .map(source => source.id);

export const resolvedCatalogIdentityCorrectionSpeciesIds = new Set([
  'sp_0155',
  'sp_0361',
]);

export const catalogIdentityCorrectionBaseSpeciesIds = {} as const;
