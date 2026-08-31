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
  temp: readonly [number, number];
  ph: readonly [number, number];
  size: readonly [number, number];
  sources: readonly string[];
  variantKey?: string;
  identityNote?: string;
};

const species: readonly BatchSpecies[] = [
  { id: 'sp_0012', scientificName: 'Puntius titteya', baseSpeciesKey: 'puntius-titteya', temp: [23, 27], ph: [6, 8], size: [4, 5], sources: ['batch-02-fishbase-puntius-titteya', 'batch-02-worms-puntius-titteya'] },
  { id: 'sp_0468', scientificName: 'Trigonostigma heteromorpha', baseSpeciesKey: 'trigonostigma-heteromorpha', temp: [23, 28], ph: [6, 7.5], size: [4, 5], sources: ['batch-02-fishbase-trigonostigma-heteromorpha', 'batch-02-worms-trigonostigma-heteromorpha'] },
  { id: 'sp_0433', scientificName: 'Hemigrammus rhodostomus', baseSpeciesKey: 'hemigrammus-rhodostomus', temp: [24, 28], ph: [5.5, 7], size: [4, 5], sources: ['batch-02-fishbase-hemigrammus-rhodostomus', 'batch-02-worms-hemigrammus-rhodostomus'] },
  { id: 'sp_0443', scientificName: 'Corydoras panda', baseSpeciesKey: 'corydoras-panda', temp: [22, 26], ph: [6, 7.5], size: [4, 5], sources: ['batch-02-fishbase-corydoras-panda', 'batch-02-worms-corydoras-panda'], identityNote: 'Current catalog value “Corydoras pandas” is corrected to the accepted species spelling “Corydoras panda”.' },
  { id: 'sp_0014', scientificName: 'Corydoras aeneus', baseSpeciesKey: 'corydoras-aeneus', temp: [22, 27], ph: [6, 8], size: [6, 7.5], sources: ['batch-02-fishbase-corydoras-aeneus', 'batch-02-worms-corydoras-aeneus'] },
  { id: 'sp_0013', scientificName: 'Otocinclus vittatus', baseSpeciesKey: 'otocinclus-vittatus', temp: [21, 26], ph: [6, 7.5], size: [3, 4], sources: ['batch-02-fishbase-otocinclus-vittatus', 'batch-02-worms-otocinclus-vittatus'] },
  { id: 'sp_0444', scientificName: 'Trichopodus leerii', baseSpeciesKey: 'trichopodus-leerii', temp: [24, 30], ph: [6, 8], size: [10, 12], sources: ['batch-02-fishbase-trichopodus-leerii', 'batch-02-worms-trichopodus-leerii'] },
  { id: 'sp_0016', scientificName: 'Mikrogeophagus ramirezi', baseSpeciesKey: 'mikrogeophagus-ramirezi', temp: [26, 30], ph: [5, 7], size: [4, 5], sources: ['batch-02-fishbase-mikrogeophagus-ramirezi', 'batch-02-worms-mikrogeophagus-ramirezi'], variantKey: 'gold', identityNote: 'Gold is treated as a cultivated variant of Mikrogeophagus ramirezi, not a separate species; the variant claim is not used for taxonomic certainty.' },
  { id: 'sp_0446', scientificName: 'Pterophyllum scalare', baseSpeciesKey: 'pterophyllum-scalare', temp: [24, 30], ph: [6, 7.5], size: [12, 15], sources: ['batch-02-fishbase-pterophyllum-scalare', 'batch-02-worms-pterophyllum-scalare'] },
  { id: 'sp_0447', scientificName: 'Symphysodon aequifasciatus', baseSpeciesKey: 'symphysodon-aequifasciatus', temp: [26, 30], ph: [4.5, 7], size: [13, 15], sources: ['batch-02-fishbase-symphysodon-aequifasciatus', 'batch-02-worms-symphysodon-aequifasciatus'] },
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
  const identityNotes = item.identityNote ?? 'Taxonomic identity is supported by the cited taxonomic records; aquarium cultivar or common-name claims are not used as species evidence.';
  return [
    supported(item.id, 'identity', { scientificName: item.scientificName, baseSpeciesKey: item.baseSpeciesKey, variantKey: item.variantKey ?? null }, citations, 'high'),
    supported(item.id, 'water', 'freshwater', citations, 'high'),
    supported(item.id, 'temperature', { min: tempMin, max: tempMax }, citations),
    supported(item.id, 'ph', { min: phMin, max: phMax }, citations),
    supported(item.id, 'adult_size', { min: sizeMin, max: sizeMax }, citations),
    unknown(item.id, 'tank_size', citations, 'The cited taxonomic records do not establish a defensible aquarium tank minimum; no stocking threshold is inferred.'),
    unknown(item.id, 'social_behavior', citations, 'The cited records do not establish a species-specific aquarium group minimum suitable for a formal stocking conclusion.'),
    unknown(item.id, 'territoriality', citations, 'No sufficiently specific, independently reviewed territoriality evidence was located for this field.'),
    unknown(item.id, 'predation', citations, 'No sufficiently specific, independently reviewed aquarium predation threshold was located for this field.'),
    unknown(item.id, 'breeding_behavior', citations, identityNotes),
  ];
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
];

export const catalogReviewBatch02SpeciesIds = species.map(item => item.id);
