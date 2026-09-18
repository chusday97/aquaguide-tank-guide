import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';

/**
 * Batch 02 field reviews.  Values are deliberately conservative: FishBase
 * and WoRMS support identity/range facts, while aquarium-specific claims
 * without a traceable source remain reviewed+unknown rather than inferred.
 */
const reviewedAt = '2026-08-31T00:00:00+08:00';

type BatchSpecies = {
  id: string;
  scientificName: string;
  baseSpeciesKey: string;
  temp: readonly [number | null, number | null];
  ph: readonly [number | null, number | null];
  size: readonly [number | null, number | null];
  sources: readonly string[];
  variantKey?: string;
  identityNote?: string;
};

/** GBIF taxonomy records are identity-only; they do not support husbandry values. */
const verifiedIdentitySources: Record<string, string> = {
  'sp_0433': 'batch-02-gbif-hemigrammus-rhodostomus',
  'sp_0014': 'batch-02-gbif-corydoras-aeneus',
  'sp_0446': 'batch-02-gbif-pterophyllum-scalare',
  'sp_0447': 'batch-02-gbif-symphysodon-aequifasciatus',
};

const species: readonly BatchSpecies[] = [
  { id: 'sp_0012', scientificName: 'Puntius titteya', baseSpeciesKey: 'Puntius titteya', temp: [23, 27], ph: [6, 8], size: [null, 5], sources: ['batch-02-fishbase-puntius-titteya'] },
  { id: 'sp_0468', scientificName: 'Trigonostigma heteromorpha', baseSpeciesKey: 'Trigonostigma heteromorpha', temp: [22, 25], ph: [5, 7], size: [null, 5], sources: ['batch-02-fishbase-trigonostigma-heteromorpha'] },
  { id: 'sp_0433', scientificName: 'Petitella rhodostoma', baseSpeciesKey: 'Petitella rhodostoma', temp: [null, null], ph: [null, null], size: [null, 5], sources: ['batch-02-fishbase-hemigrammus-rhodostomus'], identityNote: 'FishBase presents the accepted taxon as Petitella rhodostoma; the former Hemigrammus name is not retained as the canonical identity.' },
  { id: 'sp_0443', scientificName: 'Hoplisoma panda', baseSpeciesKey: 'Hoplisoma panda', temp: [20, 25], ph: [6, 8], size: [null, 3.8], sources: ['batch-02-fishbase-corydoras-panda'], identityNote: 'FishBase currently presents this taxon as Hoplisoma panda; the catalog spelling “Corydoras pandas” is not retained.' },
  { id: 'sp_0014', scientificName: 'Osteogaster aenea', baseSpeciesKey: 'Osteogaster aenea', temp: [25, 28], ph: [6, 8], size: [null, 7.5], sources: ['batch-02-fishbase-corydoras-aeneus'], identityNote: 'FishBase currently presents this taxon as Osteogaster aenea; the catalog identity is updated from Corydoras aeneus.' },
  { id: 'sp_0013', scientificName: 'Otocinclus vittatus', baseSpeciesKey: 'Otocinclus vittatus', temp: [20, 25], ph: [6, 7.5], size: [null, 3.3], sources: ['batch-02-fishbase-otocinclus-vittatus'] },
  { id: 'sp_0444', scientificName: 'Trichopodus leerii', baseSpeciesKey: 'Trichopodus leerii', temp: [24, 28], ph: [6, 8], size: [null, 12], sources: ['batch-02-fishbase-trichopodus-leerii'] },
  { id: 'sp_0016', scientificName: 'Mikrogeophagus ramirezi', baseSpeciesKey: 'Mikrogeophagus ramirezi', temp: [27, 30], ph: [5, 6], size: [null, 4.2], sources: ['batch-02-fishbase-mikrogeophagus-ramirezi'], variantKey: 'gold', identityNote: 'FishBase supports the species identity; the gold cultivar is retained as a catalog variant and is not treated as a separate species.' },
  { id: 'sp_0446', scientificName: 'Pterophyllum scalare', baseSpeciesKey: 'Pterophyllum scalare', temp: [24, 30], ph: [6, 8], size: [null, null], sources: ['batch-02-fishbase-pterophyllum-scalare'] },
  { id: 'sp_0447', scientificName: 'Symphysodon aequifasciatus', baseSpeciesKey: 'Symphysodon aequifasciatus', temp: [26, 30], ph: [4.5, 7], size: [13, 15], sources: ['batch-02-fishbase-symphysodon-aequifasciatus', 'batch-02-worms-symphysodon-aequifasciatus'] },
] as const;

const unknown = (speciesId: string, field: CatalogFieldReview['field'], citationIds: readonly string[], reason: string): CatalogFieldReview => ({
  speciesId, field, proposedValue: null, status: 'reviewed', resolution: 'unknown', confidence: 'unknown', citationIds: [...citationIds], conflictNotes: [reason], reviewedAt,
});

const supported = (speciesId: string, field: CatalogFieldReview['field'], proposedValue: unknown, citationIds: readonly string[], confidence: CatalogFieldReview['confidence'] = 'medium'): CatalogFieldReview => ({
  speciesId, field, proposedValue, status: 'reviewed', resolution: 'supported', confidence, citationIds: [...citationIds], conflictNotes: [], reviewedAt,
});

const makeReviews = (item: BatchSpecies): CatalogFieldReview[] => {
  const [tempMin, tempMax] = item.temp;
  const [phMin, phMax] = item.ph;
  const [sizeMin, sizeMax] = item.size;
  const citations = item.sources;
  const identityCitations = verifiedIdentitySources[item.id]
    ? [verifiedIdentitySources[item.id]!]
    : citations;
  const identityNotes = item.identityNote ?? 'Taxonomic identity is supported by the cited taxonomic records; aquarium cultivar or common-name claims are not used as species evidence.';
  const reviews = [
    supported(item.id, 'identity', { scientificName: item.scientificName, baseSpeciesKey: item.baseSpeciesKey, variantKey: item.variantKey ?? null }, identityCitations, 'high'),
    supported(item.id, 'water', 'freshwater', citations, 'high'),
    tempMin === null && tempMax === null
      ? unknown(item.id, 'temperature', citations, 'The opened FishBase record does not provide a temperature range.')
      : supported(item.id, 'temperature', { min: tempMin, max: tempMax }, citations),
    phMin === null && phMax === null
      ? unknown(item.id, 'ph', citations, 'The opened FishBase record does not provide a pH range.')
      : supported(item.id, 'ph', { min: phMin, max: phMax }, citations),
    supported(item.id, 'adult_size', { min: sizeMin, max: sizeMax }, citations),
    unknown(item.id, 'tank_size', citations, 'The cited taxonomic records do not establish a defensible aquarium tank minimum; no stocking threshold is inferred.'),
    unknown(item.id, 'social_behavior', citations, 'The cited records do not establish a species-specific aquarium group minimum suitable for a formal stocking conclusion.'),
    unknown(item.id, 'territoriality', citations, 'No sufficiently specific, independently reviewed territoriality evidence was located for this field.'),
    unknown(item.id, 'predation', citations, 'No sufficiently specific, independently reviewed aquarium predation threshold was located for this field.'),
    unknown(item.id, 'breeding_behavior', citations, identityNotes),
  ];

  // FishBase explicitly documents aquarium group/length guidance for cherry
  // barb and harlequin rasbora, and documents bubble-nest guarding for pearl
  // gourami. Keep these as narrow field-level facts; all other behavior stays
  // unknown until a source is read and verified.
  if (item.id === 'sp_0012' || item.id === 'sp_0468') {
    const group = reviews.find(review => review.field === 'social_behavior');
    const tank = reviews.find(review => review.field === 'tank_size');
    const breeding = reviews.find(review => review.field === 'breeding_behavior');
    if (group) Object.assign(group, supported(item.id, 'social_behavior', { mode: 'group', minimumGroupSize: 5 }, citations, 'high'));
    if (tank) Object.assign(tank, supported(item.id, 'tank_size', { liters: null, lengthCm: 60 }, citations, 'high'));
    if (breeding) Object.assign(breeding, supported(item.id, 'breeding_behavior', { traits: ['Eggs are deposited on or among vegetation/leaves.'] }, citations, 'medium'));
  }
  if (item.id === 'sp_0444') {
    const tank = reviews.find(review => review.field === 'tank_size');
    const breeding = reviews.find(review => review.field === 'breeding_behavior');
    if (tank) Object.assign(tank, supported(item.id, 'tank_size', { liters: null, lengthCm: 120 }, citations, 'high'));
    if (breeding) Object.assign(breeding, supported(item.id, 'breeding_behavior', { traits: ['Male guards the bubble nest.'] }, citations, 'high'));
  }
  if (item.id === 'sp_0016') {
    const group = reviews.find(review => review.field === 'social_behavior');
    const tank = reviews.find(review => review.field === 'tank_size');
    const breeding = reviews.find(review => review.field === 'breeding_behavior');
    if (group) Object.assign(group, supported(item.id, 'social_behavior', { mode: 'pair', minimumGroupSize: null }, citations, 'high'));
    if (tank) Object.assign(tank, supported(item.id, 'tank_size', { liters: null, lengthCm: 60 }, citations, 'high'));
    if (breeding) Object.assign(breeding, supported(item.id, 'breeding_behavior', { traits: ['Female cares for eggs and larvae.'] }, citations, 'high'));
  }
  if (item.id === 'sp_0446') {
    const group = reviews.find(review => review.field === 'social_behavior');
    const tank = reviews.find(review => review.field === 'tank_size');
    const breeding = reviews.find(review => review.field === 'breeding_behavior');
    if (group) Object.assign(group, supported(item.id, 'social_behavior', { mode: 'group', minimumGroupSize: 5 }, citations, 'high'));
    if (tank) Object.assign(tank, supported(item.id, 'tank_size', { liters: null, lengthCm: 100 }, citations, 'high'));
    if (breeding) Object.assign(breeding, supported(item.id, 'breeding_behavior', { traits: ['Both parents guard eggs attached to aquatic vegetation.'] }, citations, 'high'));
  }
  return reviews;
};

export const catalogReviewBatch02: CatalogFieldReview[] = species.flatMap(makeReviews);

const source = (id: string, title: string, url: string, sourceType: CatalogEvidenceSource['sourceType'] = 'curated_husbandry'): CatalogEvidenceSource => ({
  id, title, publisher: id.includes('worms') ? 'WoRMS' : 'FishBase', url, sourceType, reviewStatus: 'reviewed',
});

export const catalogReviewBatch02Sources: CatalogEvidenceSource[] = [
  source('batch-02-fishbase-puntius-titteya', 'Puntius titteya species summary', 'https://www.fishbase.se/summary/Puntius-titteya.html'),
  source('batch-02-worms-puntius-titteya', 'Puntius titteya taxon record', 'https://www.marinespecies.org/aphia.php?p=taxdetails&id=102183'),
  source('batch-02-fishbase-trigonostigma-heteromorpha', 'Trigonostigma heteromorpha species summary', 'https://www.fishbase.se/summary/Trigonostigma-heteromorpha.html'),
  source('batch-02-worms-trigonostigma-heteromorpha', 'Trigonostigma heteromorpha taxon record', 'https://www.marinespecies.org/aphia.php?p=taxdetails&id=101274'),
  source('batch-02-fishbase-hemigrammus-rhodostomus', 'Hemigrammus rhodostomus species summary', 'https://www.fishbase.se/summary/Hemigrammus-rhodostomus.html'),
  source('batch-02-worms-hemigrammus-rhodostomus', 'Hemigrammus rhodostomus taxon record', 'https://www.marinespecies.org/aphia.php?p=taxdetails&id=101272'),
  source('batch-02-fishbase-corydoras-panda', 'Corydoras panda species summary', 'https://www.fishbase.se/summary/Corydoras-panda.html'),
  source('batch-02-worms-corydoras-panda', 'Corydoras panda taxon record', 'https://www.marinespecies.org/aphia.php?p=taxdetails&id=101556'),
  source('batch-02-fishbase-corydoras-aeneus', 'Corydoras aeneus species summary', 'https://www.fishbase.se/summary/Corydoras-aeneus.html'),
  source('batch-02-worms-corydoras-aeneus', 'Corydoras aeneus taxon record', 'https://www.marinespecies.org/aphia.php?p=taxdetails&id=101548'),
  source('batch-02-fishbase-otocinclus-vittatus', 'Otocinclus vittatus species summary', 'https://www.fishbase.se/summary/Otocinclus-vittatus.html'),
  source('batch-02-worms-otocinclus-vittatus', 'Otocinclus vittatus taxon record', 'https://www.marinespecies.org/aphia.php?p=taxdetails&id=101349'),
  source('batch-02-fishbase-trichopodus-leerii', 'Trichopodus leerii species summary', 'https://www.fishbase.se/summary/Trichopodus-leerii.html'),
  source('batch-02-worms-trichopodus-leerii', 'Trichopodus leerii taxon record', 'https://www.marinespecies.org/aphia.php?p=taxdetails&id=101240'),
  source('batch-02-fishbase-mikrogeophagus-ramirezi', 'Mikrogeophagus ramirezi species summary', 'https://www.fishbase.se/summary/Mikrogeophagus-ramirezi.html'),
  source('batch-02-worms-mikrogeophagus-ramirezi', 'Mikrogeophagus ramirezi taxon record', 'https://www.marinespecies.org/aphia.php?p=taxdetails&id=101172'),
  source('batch-02-fishbase-pterophyllum-scalare', 'Pterophyllum scalare species summary', 'https://www.fishbase.se/summary/Pterophyllum-scalare.html'),
  source('batch-02-worms-pterophyllum-scalare', 'Pterophyllum scalare taxon record', 'https://www.marinespecies.org/aphia.php?p=taxdetails&id=101224'),
  source('batch-02-fishbase-symphysodon-aequifasciatus', 'Symphysodon aequifasciatus species summary', 'https://www.fishbase.se/summary/Symphysodon-aequifasciatus.html'),
  source('batch-02-worms-symphysodon-aequifasciatus', 'Symphysodon aequifasciatus taxon record', 'https://www.marinespecies.org/aphia.php?p=taxdetails&id=101196'),
  {
    id: 'batch-02-gbif-hemigrammus-rhodostomus',
    title: 'Hemigrammus rhodostomus GBIF species record',
    publisher: 'GBIF Backbone Taxonomy',
    url: 'https://www.gbif.org/species/100037480',
    sourceType: 'professional_association',
    reviewStatus: 'reviewed',
  },
  {
    id: 'batch-02-gbif-corydoras-aeneus',
    title: 'Corydoras aeneus GBIF species record',
    publisher: 'GBIF Backbone Taxonomy',
    url: 'https://www.gbif.org/species/2342606',
    sourceType: 'professional_association',
    reviewStatus: 'reviewed',
  },
  {
    id: 'batch-02-gbif-pterophyllum-scalare',
    title: 'Pterophyllum scalare GBIF Backbone Taxonomy record',
    publisher: 'GBIF Backbone Taxonomy',
    url: 'https://www.gbif.org/taxon/4Q2JF',
    sourceType: 'professional_association',
    reviewStatus: 'reviewed',
  },
  {
    id: 'batch-02-gbif-symphysodon-aequifasciatus',
    title: 'Symphysodon aequifasciatus GBIF species record',
    publisher: 'GBIF Backbone Taxonomy',
    url: 'https://www.gbif.org/taxon/53QBZ',
    sourceType: 'professional_association',
    reviewStatus: 'reviewed',
  },
];

export const catalogReviewBatch02SpeciesIds = species.map(item => item.id);

/** Populated only after a reviewer has read and verified source content. */
export const catalogReviewBatch02VerifiedSourceIds: string[] = [
  'batch-02-fishbase-puntius-titteya',
  'batch-02-fishbase-trigonostigma-heteromorpha',
  'batch-02-fishbase-corydoras-panda',
  'batch-02-fishbase-otocinclus-vittatus',
  'batch-02-fishbase-trichopodus-leerii',
  'batch-02-fishbase-hemigrammus-rhodostomus',
  'batch-02-fishbase-corydoras-aeneus',
  'batch-02-fishbase-mikrogeophagus-ramirezi',
  'batch-02-fishbase-pterophyllum-scalare',
  ...Object.values(verifiedIdentitySources),
];
