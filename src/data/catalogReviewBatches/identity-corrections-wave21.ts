import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';

const reviewedAt = '2026-10-15T17:30:00+08:00';

export const identityCorrectionsWave21Sources = {
  angelfishColourVarieties: {
    id: 'ifrj-pterophyllum-scalare-marble-identity-wave21',
    title: 'Reproduction of Three Colour Varieties of Angelfish (Pterophyllum scalare)',
    publisher: 'Indonesian Fisheries Research Journal',
    url: 'https://doi.org/10.15578/ifrj.5.1.1999.19-22',
    sourceType: 'peer_reviewed',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

const identitySource = identityCorrectionsWave21Sources.angelfishColourVarieties.id;
const fishBase = 'batch-02-fishbase-pterophyllum-scalare';
const seriouslyFish = 'seriouslyfish-pterophyllum-scalare';

const supported = (
  field: CatalogFieldReview['field'],
  proposedValue: unknown,
  citationIds: string[],
  conflictNotes: string[],
  confidence: CatalogFieldReview['confidence'] = 'high',
): CatalogFieldReview => ({
  speciesId: 'sp_0176',
  field,
  proposedValue,
  status: 'reviewed',
  resolution: 'supported',
  confidence,
  citationIds,
  conflictNotes,
  reviewedAt,
});

export const identityCorrectionsWave21FieldReviews: CatalogFieldReview[] = [
  supported(
    'identity',
    {
      scientificName: 'Pterophyllum scalare var. Marble',
      baseSpeciesKey: 'Pterophyllum scalare',
      variantKey: 'Marble',
    },
    [identitySource],
    [
      'The peer-reviewed Indonesian Fisheries Research Journal study explicitly treats Black, Black & White, and Marble as colour varieties of angelfish Pterophyllum scalare. This directly resolves the catalog object to the reviewed P. scalare species authority.',
      'The correction is object-specific. It does not authorize automatic inheritance for other Pterophyllum trade morphs such as Balloon, Platinum Longfin, Blue, or Super Red.',
    ],
  ),
  supported('water', 'freshwater', [identitySource, fishBase], [
    'The reviewed Marble identity bridge permits reuse of the same-species Pterophyllum scalare freshwater authority; no broader variant inference is applied.',
  ]),
  supported('temperature', { min: 24, max: 30 }, [identitySource, fishBase], [
    'The reviewed Marble identity bridge reuses the established Pterophyllum scalare long-term temperature authority.',
  ], 'medium'),
  supported('ph', { min: 6, max: 8 }, [identitySource, fishBase], [
    'The reviewed Marble identity bridge reuses the established Pterophyllum scalare pH authority.',
  ], 'medium'),
  supported('adult_size', { min: null, max: 15 }, [identitySource, seriouslyFish], [
    'The reviewed Marble identity bridge reuses the Pterophyllum scalare 150 mm standard-length authority; colour pattern is not treated as an independent body-size taxon.',
  ]),
  supported('tank_size', { liters: null, lengthCm: 100 }, [identitySource, fishBase], [
    'The reviewed Marble identity bridge reuses the established same-species minimum aquarium length. No Balloon or altered-body-form morph is included in this correction.',
  ]),
  supported('social_behavior', { mode: 'group', minimumGroupSize: 5 }, [identitySource, fishBase], [
    'The reviewed Marble identity bridge reuses the established Pterophyllum scalare social authority.',
  ]),
  supported('territoriality', { traits: ['breeding_male_territoriality'] }, [identitySource, seriouslyFish], [
    'The reviewed Marble identity bridge reuses only the established breeding-context male territoriality scope; it does not widen this to permanent generic territoriality.',
  ]),
  supported('predation', { targets: ['small_fish'] }, [identitySource, seriouslyFish], [
    'The reviewed Marble identity bridge reuses the exact-species warning that Pterophyllum scalare may eat small fish such as tetras; prey scope is not widened.',
  ]),
];

export const identityCorrectionsWave21VerifiedSourceIds = Object.values(identityCorrectionsWave21Sources).map(source => source.id);

export const resolvedCatalogIdentityCorrectionSpeciesIds = new Set(['sp_0176']);

/**
 * Explicit catalog-object -> reviewed base catalog-object bridge for cross-layer
 * runtime authority. Only objects with direct reviewed identity correction may
 * appear here; this is not a scientific-name or "var." auto-inheritance table.
 */
export const catalogIdentityCorrectionBaseSpeciesIds = {
  sp_0176: 'sp_0446',
} as const;
