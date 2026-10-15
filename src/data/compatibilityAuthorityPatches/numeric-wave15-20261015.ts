import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';
import type { CompatibilityProfileAuthorityPatch } from './fast-lane-20261014';

const reviewedAt = '2026-10-15T15:40:00+08:00';

const source = (
  id: string,
  title: string,
  url: string,
): CatalogEvidenceSource => ({
  id,
  title,
  publisher: 'Fishipedia',
  url,
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
});

export const compatibilityNumericWave15Sources = {
  corydorasHastatusFishipedia: source(
    'fishipedia-corydoras-hastatus-wave15',
    'Gastrodermus (Corydoras) hastatus • Fish sheet',
    'https://www.fishi-pedia.com/fishes/corydoras-hastatus',
  ),
  moenkhausiaSanctaefilomenaeFishipedia: source(
    'fishipedia-moenkhausia-sanctaefilomenae-wave15',
    'Moenkhausia sanctaefilomenae • Fish sheet',
    'https://www.fishi-pedia.com/fishes/moenkhausia-sanctaefilomenae',
  ),
  hypancistrusInspectorFishipedia: source(
    'fishipedia-hypancistrus-inspector-wave15',
    'Hypancistrus inspector • catfish • Fish sheet',
    'https://www.fishi-pedia.com/fishes/hypancistrus-inspector',
  ),
} satisfies Record<string, CatalogEvidenceSource>;

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

const cHastatus = compatibilityNumericWave15Sources.corydorasHastatusFishipedia.id;
const mSanctaefilomenae = compatibilityNumericWave15Sources.moenkhausiaSanctaefilomenaeFishipedia.id;
const hInspector = compatibilityNumericWave15Sources.hypancistrusInspectorFishipedia.id;

export const compatibilityNumericWave15FieldReviews: CatalogFieldReview[] = [
  supported('sp_0052', 'territoriality', { traits: [] }, [cHastatus],
    'Fishipedia explicitly marks exact Gastrodermus hastatus (syn. Corydoras hastatus) as non-territorial. This closes territoriality only; scavenger/peaceful wording is not used to infer fish-predation safety.'),
  supported('sp_0062', 'territoriality', { traits: [] }, [mSanctaefilomenae],
    'Fishipedia explicitly marks exact Moenkhausia sanctaefilomenae as non-territorial. Its separate note that the species may show interspecific aggression is preserved as a distinct behavior and is not converted into territoriality.'),
  supported('sp_0125', 'territoriality', { traits: ['territorial'] }, [hInspector],
    'Fishipedia explicitly marks exact Hypancistrus inspector as territorial and describes defense against nearby intruders, especially similar-behavior animals and conspecifics. Predation remains unresolved.'),
];

export const compatibilityNumericWave15VerifiedSourceIds = Object.values(
  compatibilityNumericWave15Sources,
).map(item => item.id);

export const compatibilityNumericWave15ProfilePatches: readonly CompatibilityProfileAuthorityPatch[] = [
  {
    speciesId: 'sp_0052',
    addCitationIds: [cHastatus],
    addRequiredFacts: ['territoriality'],
  },
  {
    speciesId: 'sp_0062',
    addCitationIds: [mSanctaefilomenae],
    addRequiredFacts: ['territoriality'],
  },
  {
    speciesId: 'sp_0125',
    addBehaviorTraits: ['territorial'],
    addCitationIds: [hInspector],
    addRequiredFacts: ['territoriality'],
  },
] as const;

export const compatibilityNumericWave15AuthorityPatch = {
  patchId: 'numeric-evidence-wave15-20261015',
  speciesIds: ['sp_0052', 'sp_0062', 'sp_0125'],
  authorityOwner: 'src/data/compatibilityAuthorityPatches/numeric-wave15-20261015.ts',
  runtimeScope: 'source_controlled_only',
  writesProductionAuthority: false,
} as const;
