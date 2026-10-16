import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';
import type { CompatibilityProfileAuthorityPatch } from './fast-lane-20261014';
import { compatibilityResearchCoverageWave21Sources } from './research-coverage-wave21-20261015';

const reviewedAt = '2026-10-16T18:10:00+08:00';

const source = (id: string, title: string, url: string): CatalogEvidenceSource => ({
  id,
  title,
  publisher: 'Fishipedia',
  url,
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
});

/**
 * Wave25 promotes only explicit, exact-taxon husbandry labels found during the
 * post-Wave24 source expansion. Diet wording, community suitability, and a
 * single optimum pH point are deliberately excluded.
 */
export const compatibilityResearchDirectWave25Sources = {
  zaccoPlatypusFishipedia: source(
    'research-wave25-fishipedia-zacco-platypus',
    'Zacco platypus exact-taxon species profile',
    'https://www.fishipedia.fr/fr/poissons/zacco-platypus',
  ),
  paracanthurusHepatusFishipedia: source(
    'research-wave25-fishipedia-paracanthurus-hepatus',
    'Paracanthurus hepatus exact-taxon species profile',
    'https://www.fishipedia.fr/fr/poissons/paracanthurus-hepatus',
  ),
  zebrasomaFlavescensFishipedia: source(
    'research-wave25-fishipedia-zebrasoma-flavescens',
    'Zebrasoma flavescens exact-taxon species profile',
    'https://www.fishipedia.fr/fr/poissons/zebrasoma-flavescens',
  ),
} satisfies Record<string, CatalogEvidenceSource>;

const rhodeus = compatibilityResearchCoverageWave21Sources.fishipedia_rhodeus_ocellatus.id;
const amphiprion = compatibilityResearchCoverageWave21Sources.fishipedia_amphiprion_ocellaris.id;
const zacco = compatibilityResearchDirectWave25Sources.zaccoPlatypusFishipedia.id;
const paracanthurus = compatibilityResearchDirectWave25Sources.paracanthurusHepatusFishipedia.id;
const zebrasoma = compatibilityResearchDirectWave25Sources.zebrasomaFlavescensFishipedia.id;

const supported = (
  speciesId: string,
  field: CatalogFieldReview['field'],
  proposedValue: unknown,
  citationIds: string[],
  note: string,
): CatalogFieldReview => ({
  speciesId,
  field,
  proposedValue,
  status: 'reviewed',
  resolution: 'supported',
  confidence: 'medium',
  citationIds,
  conflictNotes: [note],
  reviewedAt,
});

export const compatibilityResearchDirectWave25FieldReviews: CatalogFieldReview[] = [
  supported(
    'sp_0475',
    'territoriality',
    { traits: [] },
    [rhodeus],
    'Fishipedia exact-taxon Rhodeus ocellatus page explicitly labels “territorialité Non”. Omnivore/carnivore-tendency wording is not used to close predation.',
  ),
  supported(
    'sp_0452',
    'territoriality',
    { traits: ['territorial'] },
    [amphiprion],
    'Fishipedia exact-taxon Amphiprion ocellaris page explicitly labels “territorialité Oui”. Carnivore wording is not promoted into a fish-predation target.',
  ),
  supported(
    'sp_0129',
    'territoriality',
    { traits: [] },
    [zacco],
    'Fishipedia exact-taxon Zacco platypus page explicitly labels “territorialité Non”. Existing reviewed predation authority remains separate and is not changed by this field review.',
  ),
  supported(
    'sp_0024',
    'temperature',
    { min: 23, max: 27 },
    [paracanthurus],
    'Fishipedia exact-taxon Paracanthurus hepatus page explicitly labels a 23–27 °C husbandry range.',
  ),
  supported(
    'sp_0024',
    'tank_size',
    { liters: 1000, lengthCm: null },
    [paracanthurus],
    'Fishipedia exact-taxon Paracanthurus hepatus maintenance section explicitly states “Volume min 1000 litres”; no tank-length minimum is inferred.',
  ),
  supported(
    'sp_0024',
    'territoriality',
    { traits: [] },
    [paracanthurus],
    'Fishipedia exact-taxon Paracanthurus hepatus page explicitly labels the species non-territorial. This does not infer absence of all aggression or close predation.',
  ),
  supported(
    'sp_0023',
    'temperature',
    { min: 23, max: 27 },
    [zebrasoma],
    'Fishipedia exact-taxon Zebrasoma flavescens page explicitly labels a 23–27 °C husbandry range.',
  ),
  supported(
    'sp_0023',
    'ph',
    { min: 8.2, max: 8.4 },
    [zebrasoma],
    'Fishipedia exact-taxon Zebrasoma flavescens page explicitly labels a pH 8.2–8.4 husbandry range.',
  ),
  supported(
    'sp_0023',
    'tank_size',
    { liters: 600, lengthCm: null },
    [zebrasoma],
    'Fishipedia exact-taxon Zebrasoma flavescens maintenance section explicitly states a minimum 600 L aquarium; no tank-length minimum is inferred.',
  ),
  supported(
    'sp_0023',
    'territoriality',
    { traits: [] },
    [zebrasoma],
    'Fishipedia exact-taxon Zebrasoma flavescens page explicitly labels “territorialité Non”. Herbivory/zooplankton ecology is not used to close predation.',
  ),
];

export const compatibilityResearchDirectWave25VerifiedSourceIds = Object.values(
  compatibilityResearchDirectWave25Sources,
).map(item => item.id);

export const compatibilityResearchDirectWave25ProfilePatches: readonly CompatibilityProfileAuthorityPatch[] = [
  {
    speciesId: 'sp_0475',
    addCitationIds: [rhodeus],
    addRequiredFacts: ['territoriality'],
  },
  {
    speciesId: 'sp_0452',
    addBehaviorTraits: ['territorial'],
    addCitationIds: [amphiprion],
    addRequiredFacts: ['territoriality'],
  },
  {
    speciesId: 'sp_0129',
    addCitationIds: [zacco],
    addRequiredFacts: ['territoriality'],
  },
  {
    speciesId: 'sp_0024',
    addCitationIds: [paracanthurus],
    addRequiredFacts: ['temperature', 'tank_size', 'territoriality'],
  },
  {
    speciesId: 'sp_0023',
    addCitationIds: [zebrasoma],
    addRequiredFacts: ['temperature', 'ph', 'tank_size', 'territoriality'],
  },
] as const;

export const compatibilityResearchDirectWave25AuthorityPatch = {
  patchId: 'research-direct-wave25-20261016',
  speciesIds: ['sp_0475', 'sp_0452', 'sp_0129', 'sp_0024', 'sp_0023'],
  authorityOwner: 'src/data/compatibilityAuthorityPatches/research-direct-wave25-20261016.ts',
  runtimeScope: 'source_controlled_only',
  writesProductionAuthority: false,
  exactTaxonOnly: true,
  promotedFieldCount: 10,
} as const;
