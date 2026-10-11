import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';

const reviewedAt = '2026-10-11T16:20:00+08:00';

export const pseudorasboraParvaFishBase: CatalogEvidenceSource = {
  id: 'batch08-fishbase-pseudorasbora-parva',
  title: 'Pseudorasbora parva species summary',
  publisher: 'FishBase',
  url: 'https://www.fishbase.se/summary/Pseudorasbora-parva.html',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

export const pseudorasboraParvaSpawningCompetitionStudy: CatalogEvidenceSource = {
  id: 'doi-pseudorasbora-parva-spawning-competition-2004',
  title: 'Size-dependent male-male competition for a spawning substrate between Pseudorasbora parva and Pseudorasbora pumila',
  publisher: 'Ichthyological Research',
  url: 'https://doi.org/10.1007/s10228-003-0203-5',
  sourceType: 'peer_reviewed',
  reviewStatus: 'reviewed',
};

export const pseudorasboraParvaShoalingStudy: CatalogEvidenceSource = {
  id: 'doi-pseudorasbora-parva-shoaling-2005',
  title: 'Foraging of a Small Planktivore (Pseudorasbora parva: Cyprinidae) and its Behavioral Flexibility in an Artificial Stream',
  publisher: 'Hydrobiologia',
  url: 'https://doi.org/10.1007/s10750-005-5442-1',
  sourceType: 'peer_reviewed',
  reviewStatus: 'reviewed',
};

const allSources = [
  pseudorasboraParvaFishBase.id,
  pseudorasboraParvaSpawningCompetitionStudy.id,
  pseudorasboraParvaShoalingStudy.id,
];

const supported = (
  field: CatalogFieldReview['field'],
  proposedValue: unknown,
  citationIds: string[],
  conflictNotes: string[] = [],
  confidence: CatalogFieldReview['confidence'] = 'high',
): CatalogFieldReview => ({
  speciesId: 'sp_0042',
  field,
  proposedValue,
  status: 'reviewed',
  resolution: 'supported',
  confidence,
  citationIds,
  conflictNotes,
  reviewedAt,
});

const unknown = (
  field: CatalogFieldReview['field'],
  note: string,
  citationIds = allSources,
): CatalogFieldReview => ({
  speciesId: 'sp_0042',
  field,
  proposedValue: null,
  status: 'reviewed',
  resolution: 'unknown',
  confidence: 'unknown',
  citationIds,
  conflictNotes: [note],
  reviewedAt,
});

export const nextWaveFreshwater03FieldReviews: CatalogFieldReview[] = [
  supported('identity', {
    scientificName: 'Pseudorasbora parva',
    baseSpeciesKey: 'Pseudorasbora parva',
    variantKey: null,
  }, [pseudorasboraParvaFishBase.id]),
  supported('water', 'freshwater', [pseudorasboraParvaFishBase.id], [
    'FishBase also records brackish occurrence. The scalar Catalog field keeps freshwater as the primary value; reviewed Species Knowledge and Compatibility authority preserve the freshwater + brackish set.',
  ], 'medium'),
  unknown(
    'temperature',
    'FishBase records a 5–22°C temperate ecological range, but this batch does not promote that ecological range as a household-aquarium target temperature.',
    [pseudorasboraParvaFishBase.id],
  ),
  unknown(
    'ph',
    'FishBase exposes only an incomplete upper pH record rather than a reviewed household-aquarium pH range.',
    [pseudorasboraParvaFishBase.id],
  ),
  supported('adult_size', { min: null, max: 12.5 }, [pseudorasboraParvaFishBase.id], [
    'FishBase reports 12.5 cm maximum total length; this is a biological size ceiling, not a minimum aquarium-size recommendation.',
  ]),
  unknown('tank_size', 'Reviewed sources do not establish a household-aquarium minimum tank length or volume.'),
  supported('social_behavior', { mode: 'variable', minimumGroupSize: null }, [
    pseudorasboraParvaShoalingStudy.id,
    pseudorasboraParvaSpawningCompetitionStudy.id,
  ], [
    'Shoaling frequency and shoal size changed with predator presence and diel period; no fixed aquarium minimum group size is inferred.',
    'Breeding males can become locally competitive around spawning substrates, so the stable product mode remains variable rather than universally territorial.',
  ], 'medium'),
  unknown(
    'territoriality',
    'Territorial aggression is directly supported around spawning substrates in mature males, but the evidence is breeding-context-specific and must not become a permanent territorial trait.',
    [pseudorasboraParvaSpawningCompetitionStudy.id],
  ),
  unknown(
    'predation',
    'FishBase records fish and fish eggs in the diet, but current Compatibility target classes cannot safely distinguish eggs/fry from every catalog Small adult fish. Do not promote a generic small_fish target.',
    [pseudorasboraParvaFishBase.id],
  ),
  unknown(
    'breeding_behavior',
    'Breeding behavior is directly supported, but Catalog has no typed breeding_behavior value schema. Keep the Catalog field fail-closed while Species Knowledge and Compatibility carry the reviewed breeding-defense authority.',
    [pseudorasboraParvaFishBase.id, pseudorasboraParvaSpawningCompetitionStudy.id],
  ),
];

export const nextWaveFreshwater03VerifiedSourceIds = new Set(allSources);
