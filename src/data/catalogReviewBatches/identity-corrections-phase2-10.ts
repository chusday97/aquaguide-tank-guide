import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';
import { nextWaveUnified04Sources } from './next-wave-unified-04';

const reviewedAt = '2026-10-19T14:00:00+08:00';

export const identityCorrectionsPhase2_10Sources = {
  fishBaseBlueGourami: {
    id: 'phase2-10-fishbase-trichopodus-trichopterus-blue-gourami',
    title: 'Trichopodus trichopterus common names — Blue gourami',
    publisher: 'FishBase',
    url: 'https://fishbase.se/ComNames/CommonNamesList.php?GenusName=Trichopodus&ID=4675&SpeciesName=trichopterus&StockCode=4893',
    sourceType: 'professional_association',
    reviewStatus: 'reviewed',
  },
  fishesOfAustraliaBlueMorph: {
    id: 'phase2-10-fishes-of-australia-trichopodus-trichopterus-blue-morph',
    title: 'Trichopodus trichopterus — Blue Gourami / Blue Sumatran morph',
    publisher: 'Fishes of Australia',
    url: 'https://fishesofaustralia.net.au/home/species/4843',
    sourceType: 'professional_association',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

const identityIds = Object.values(identityCorrectionsPhase2_10Sources).map(source => source.id);
const baseIds = [
  nextWaveUnified04Sources.trichopodusSeriouslyFish.id,
  identityCorrectionsPhase2_10Sources.fishBaseBlueGourami.id,
];

const supported = (
  field: CatalogFieldReview['field'],
  proposedValue: unknown,
  citationIds: string[],
  conflictNotes: string[] = [],
  confidence: CatalogFieldReview['confidence'] = 'high',
): CatalogFieldReview => ({
  speciesId: 'sp_0445',
  field,
  proposedValue,
  status: 'reviewed',
  resolution: 'supported',
  confidence,
  citationIds,
  conflictNotes,
  reviewedAt,
});

export const identityCorrectionsPhase2_10FieldReviews: CatalogFieldReview[] = [
  supported(
    'identity',
    {
      scientificName: 'Trichopodus trichopterus',
      baseSpeciesKey: 'Trichopodus trichopterus',
      variantKey: 'Blue',
    },
    identityIds,
    [
      'FishBase lists Blue gourami among the common names of Trichopodus trichopterus.',
      'Fishes of Australia independently lists Blue Gourami under Trichopodus trichopterus and explicitly describes the Blue Sumatran morph within this species.',
      'The legacy blank “var.” suffix is not retained as a pseudo-scientific variant name. Formal taxon and ornamental colour label are stored separately as baseSpeciesKey + variantKey.',
      'This review is specific to the Blue colour morph and does not establish class-wide identity for arbitrary blue-labelled catalog objects.',
    ],
  ),
  supported('water', 'freshwater', baseIds, ['Blue is reviewed as a colour morph of the same Trichopodus trichopterus taxon; reuse the reviewed species-level freshwater authority.']),
  supported('temperature', { min: 24, max: 30 }, baseIds, ['Reuse reviewed Trichopodus trichopterus husbandry authority after exact same-species colour identity review.']),
  supported('ph', { min: 5.5, max: 8.5 }, baseIds, ['Reuse reviewed Trichopodus trichopterus husbandry authority after exact same-species colour identity review.']),
  supported('adult_size', { min: null, max: 15 }, baseIds, ['Reuse reviewed Trichopodus trichopterus adult-size authority; no morphology-changing claim is introduced by the Blue colour identity.']),
  supported('tank_size', { liters: 81, lengthCm: 90 }, baseIds, ['Reuse reviewed Trichopodus trichopterus space authority for the reviewed same-species colour morph.']),
  supported('social_behavior', { mode: 'variable', minimumGroupSize: null }, baseIds, ['Reuse reviewed Trichopodus trichopterus social authority; colour identity does not erase individual temperament variation.']),
  supported('territoriality', { traits: ['male_territoriality', 'breeding_aggression'] }, [nextWaveUnified04Sources.trichopodusSeriouslyFish.id], ['Reuse reviewed Trichopodus trichopterus male territorial/breeding authority.']),
  supported('predation', { targets: [] }, [nextWaveUnified04Sources.trichopodusSeriouslyFish.id], ['Reviewed species husbandry does not establish a fish-prey scope; territoriality remains modeled separately.'], 'medium'),
  supported('breeding_behavior', { traits: ['male_breeding_aggression'] }, [nextWaveUnified04Sources.trichopodusSeriouslyFish.id], ['Reuse reviewed Trichopodus trichopterus breeding-behavior authority.']),
];

export const identityCorrectionsPhase2_10VerifiedSourceIds = Object.values(identityCorrectionsPhase2_10Sources).map(source => source.id);

export const resolvedCatalogIdentityCorrectionSpeciesIds = new Set(['sp_0445']);

export const catalogIdentityCorrectionBaseSpeciesIds = {} as const;
