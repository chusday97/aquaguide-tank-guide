import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';

const reviewedAt = '2026-10-18T04:10:00+08:00';

export const behaviorEvidencePhase2_05Sources = {
  poropanchaxNormaniAquaristAtlas: {
    id: 'aquaristatlas-poropanchax-normani-behavior-phase2-05',
    title: 'Poropanchax normani — Norman’s lampeye aquarium behaviour and grouping',
    publisher: 'Aquarist Atlas',
    url: 'https://www.aquaristatlas.com/killifish/poropanchax-normani/',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  hyphessobryconAmapaensisSeriouslyFish: {
    id: 'seriouslyfish-hyphessobrycon-amapaensis-behavior-phase2-05',
    title: 'Hyphessobrycon amapaensis — behaviour and compatibility',
    publisher: 'Seriously Fish',
    url: 'https://www.seriouslyfish.com/species/hyphessobrycon-amapaensis',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  hemigrammusRodwayiSeriouslyFish: {
    id: 'wave30-seriouslyfish-hemigrammus-rodwayi',
    title: 'Hemigrammus rodwayi (Golden Tetra) — behaviour and compatibility',
    publisher: 'Seriously Fish',
    url: 'https://www.seriouslyfish.com/species/hemigrammus-rodwayi',
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

const normani = behaviorEvidencePhase2_05Sources.poropanchaxNormaniAquaristAtlas.id;
const amapaensis = behaviorEvidencePhase2_05Sources.hyphessobryconAmapaensisSeriouslyFish.id;
const rodwayi = behaviorEvidencePhase2_05Sources.hemigrammusRodwayiSeriouslyFish.id;

export const behaviorEvidencePhase2_05FieldReviews: CatalogFieldReview[] = [
  supported('sp_0112', 'social_behavior', { mode: 'group', minimumGroupSize: 6 }, [normani], [
    'The exact-taxon husbandry page describes Poropanchax normani as a peaceable schooling fish and recommends a group of six or more.',
  ]),
  supported('sp_0112', 'territoriality', { traits: [] }, [normani], [
    'The exact-taxon page states there is no spawning-site territory defence and that fish are non-aggressive toward similarly sized tankmates; no stable territorial/resource-defence trait is promoted.',
  ], 'medium'),
  supported('sp_0112', 'predation', { targets: [] }, [normani], [
    'The exact-taxon page describes an insectivore taking tiny invertebrates and explicitly recommends small rasboras/dwarf corydoras as tankmates; no generic fish-predation target is promoted.',
  ], 'medium'),

  supported('sp_0115', 'social_behavior', { mode: 'group', minimumGroupSize: 8 }, [amapaensis], [
    'Seriously Fish describes Hyphessobrycon amapaensis as very peaceful and recommends a mixed-sex group of at least 8–10 specimens.',
  ]),
  supported('sp_0115', 'territoriality', { traits: [] }, [amapaensis], [
    'Seriously Fish describes the exact species as very peaceful and a community fish maintained in a school; no stable territorial/resource-defence behaviour is reported.',
  ]),
  supported('sp_0115', 'predation', { targets: [] }, [amapaensis], [
    'Seriously Fish lists similarly sized characids/catfish and non-predatory small-to-medium cichlids as suitable tankmates, while the diet is small invertebrates/crustacea/algae/fruit rather than fish; no generic fish-predation target is promoted.',
  ]),

  supported('sp_0362', 'social_behavior', { mode: 'group', minimumGroupSize: 6 }, [rodwayi], [
    'Seriously Fish describes exact-taxon Hemigrammus rodwayi as a very peaceful shoaling species and recommends a group of at least six, preferably ten or more.',
  ]),
  supported('sp_0362', 'territoriality', { traits: [] }, [rodwayi], [
    'The exact-taxon page describes a peaceful shoaling community fish and does not report stable territorial or resource-defence behaviour; no generic territorial trait is promoted.',
  ], 'medium'),
  supported('sp_0362', 'predation', { targets: [] }, [rodwayi], [
    'Seriously Fish recommends peaceful community tankmates and describes a diet centred on small invertebrate foods; no generic fish-predation target is promoted. This does not assert safety for eggs or fry.',
  ], 'medium'),
];

export const behaviorEvidencePhase2_05VerifiedSourceIds = Object.values(behaviorEvidencePhase2_05Sources)
  .map(source => source.id);

export const behaviorEvidencePhase2_05ProfileIds = ['sp_0112', 'sp_0115', 'sp_0362'] as const;
