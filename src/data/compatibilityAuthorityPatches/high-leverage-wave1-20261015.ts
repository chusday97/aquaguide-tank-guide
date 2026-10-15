import type { CatalogEvidenceSource, CompatibilityRequiredFact } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';
import type { CompatibilityProfileAuthorityPatch } from './fast-lane-20261014';

const reviewedAt = '2026-10-15T00:00:00+08:00';

const source = (
  id: string,
  title: string,
  publisher: string,
  url: string,
  sourceType: CatalogEvidenceSource['sourceType'],
): CatalogEvidenceSource => ({
  id,
  title,
  publisher,
  url,
  sourceType,
  reviewStatus: 'reviewed',
});

export const compatibilityHighLeverageWave1Sources = {
  otocinclusFishipedia: source(
    'fishipedia-otocinclus-vittatus-direct-husbandry',
    'Otocinclus vittatus • Poisson-chat nain • Fiche poissons',
    'Fishipedia',
    'https://www.fishipedia.fr/fr/poissons/otocinclus-vittatus',
    'curated_husbandry',
  ),
  swordtailGovernmentReview: source(
    'australian-government-xiphophorus-hellerii-territoriality',
    'Review of the impacts of introduced ornamental fish species that have established wild populations in Australia',
    'Australian Government Department of the Environment, Water, Heritage and the Arts',
    'https://www.agriculture.gov.au/sites/default/files/documents/ornamental-fish.pdf',
    'government',
  ),
  swordtailFishBase: source(
    'fishbase-xiphophorus-hellerii-male-aggression',
    'Xiphophorus hellerii (Green swordtail) species summary',
    'FishBase',
    'https://www.fishbase.se/summary/Xiphophorus-hellerii.html',
    'curated_husbandry',
  ),
} satisfies Record<string, CatalogEvidenceSource>;

const supported = (
  speciesId: string,
  field: CatalogFieldReview['field'],
  proposedValue: unknown,
  citationIds: string[],
  conflictNotes: string[],
  confidence: CatalogFieldReview['confidence'] = 'medium',
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

const otocinclusSourceId = compatibilityHighLeverageWave1Sources.otocinclusFishipedia.id;
const swordtailTerritorialitySourceIds = [
  compatibilityHighLeverageWave1Sources.swordtailGovernmentReview.id,
  compatibilityHighLeverageWave1Sources.swordtailFishBase.id,
];

export const compatibilityHighLeverageWave1FieldReviews: CatalogFieldReview[] = [
  supported(
    'sp_0013',
    'tank_size',
    { liters: 60, lengthCm: null },
    [otocinclusSourceId],
    [
      'Fishipedia’s exact Otocinclus vittatus husbandry page lists a 60 L minimum aquarium volume. This is used as a curated husbandry minimum, not as a scientific physiological threshold.',
    ],
  ),
  supported(
    'sp_0013',
    'social_behavior',
    { mode: 'group', minimumGroupSize: 6 },
    [otocinclusSourceId],
    [
      'The exact species page labels O. vittatus as gregarious and gives a structured minimum population of 6; the maintenance section likewise recommends at least six individuals.',
      'The page also notes relatively independent individual behavior, so the authority is limited to group planning and the stated minimum rather than stronger schooling claims.',
    ],
  ),
  supported(
    'sp_0013',
    'territoriality',
    { traits: [] },
    [otocinclusSourceId],
    [
      'Fishipedia explicitly marks territoriality as “Non” on the exact O. vittatus species page. This is direct negative evidence, not an inference from peaceful temperament.',
    ],
  ),
  supported(
    'sp_0438',
    'territoriality',
    { traits: ['male_conspecific_territoriality'] },
    swordtailTerritorialitySourceIds,
    [
      'The Australian Government review reports that X. hellerii males form long-term hierarchies, are territorial to an extent, and spend much of their time fighting conspecifics; the same review limits uncertainty to whether aggression extends to other species.',
      'FishBase independently records that males are aggressive toward each other in aquaria. The promoted trait is therefore restricted to male conspecific territoriality and is not widened to general interspecific aggression.',
    ],
    'medium',
  ),
];

export const compatibilityHighLeverageWave1VerifiedSourceIds = Object.values(
  compatibilityHighLeverageWave1Sources,
).map(item => item.id);

const otocinclusAdditionalRequiredFacts: CompatibilityRequiredFact[] = ['tank_size', 'territoriality'];
const swordtailAdditionalRequiredFacts: CompatibilityRequiredFact[] = ['tank_size', 'territoriality', 'predation'];

export const compatibilityHighLeverageWave1ProfilePatches: readonly CompatibilityProfileAuthorityPatch[] = [
  {
    speciesId: 'sp_0013',
    addCitationIds: [],
    addRequiredFacts: otocinclusAdditionalRequiredFacts,
  },
  {
    speciesId: 'sp_0438',
    addCitationIds: swordtailTerritorialitySourceIds,
    addRequiredFacts: swordtailAdditionalRequiredFacts,
    addBehaviorTraits: ['male_conspecific_territoriality'],
  },
] as const;

export const compatibilityHighLeverageWave1AuthorityPatch = {
  patchId: 'high-leverage-evidence-wave1-20261015',
  speciesIds: ['sp_0013', 'sp_0438'],
  authorityOwner: 'src/data/compatibilityAuthorityPatches/high-leverage-wave1-20261015.ts',
  runtimeScope: 'source_controlled_only',
  writesProductionAuthority: false,
} as const;
