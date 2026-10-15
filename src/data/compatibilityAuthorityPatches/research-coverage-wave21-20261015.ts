import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';
import type { CompatibilityProfileAuthorityPatch } from './fast-lane-20261014';

const reviewedAt = '2026-10-15T22:35:00+08:00';

/**
 * Research coverage wave21 promotes only direct, exact-taxon environment/numeric facts.
 * Variant candidates and behaviour/predation inferences are deliberately excluded.
 */
export const compatibilityResearchCoverageWave21Sources = {
  fishipedia_channa_asiatica: {
    id: 'research-wave21-fishipedia-channa-asiatica',
    title: 'Channa asiatica exact-taxon species profile',
    publisher: 'Fishipedia',
    url: 'https://www.fishipedia.fr/fr/poissons/channa-asiatica',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  fishipedia_chrysiptera_cyanea: {
    id: 'research-wave21-fishipedia-chrysiptera-cyanea',
    title: 'Chrysiptera cyanea exact-taxon species profile',
    publisher: 'Fishipedia',
    url: 'https://www.fishipedia.fr/fr/poissons/chrysiptera-cyanea',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  fishipedia_pomacanthus_annularis: {
    id: 'research-wave21-fishipedia-pomacanthus-annularis',
    title: 'Pomacanthus annularis exact-taxon species profile',
    publisher: 'Fishipedia',
    url: 'https://www.fishipedia.fr/fr/poissons/pomacanthus-annularis',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  fishipedia_rhodeus_ocellatus: {
    id: 'research-wave21-fishipedia-rhodeus-ocellatus',
    title: 'Rhodeus ocellatus exact-taxon species profile',
    publisher: 'Fishipedia',
    url: 'https://www.fishipedia.fr/fr/poissons/rhodeus-ocellatus',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  fishbase_pseudogastromyzon_fangi: {
    id: 'research-wave21-fishbase-pseudogastromyzon-fangi',
    title: 'Pseudogastromyzon fangi exact-taxon species profile',
    publisher: 'FishBase',
    url: 'https://www.fishbase.se/summary/Pseudogastromyzon-fangi.html',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  fishbase_cobitis_sinensis: {
    id: 'research-wave21-fishbase-cobitis-sinensis',
    title: 'Cobitis sinensis exact-taxon species profile',
    publisher: 'FishBase',
    url: 'https://www.fishbase.se/summary/Cobitis-sinensis.html',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  fishbase_aphyocypris_chinensis: {
    id: 'research-wave21-fishbase-aphyocypris-chinensis',
    title: 'Aphyocypris chinensis exact-taxon species profile',
    publisher: 'FishBase',
    url: 'https://www.fishbase.se/summary/Aphyocypris-chinensis.html',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  fishipedia_amphiprion_ocellaris: {
    id: 'research-wave21-fishipedia-amphiprion-ocellaris',
    title: 'Amphiprion ocellaris exact-taxon species profile',
    publisher: 'Fishipedia',
    url: 'https://www.fishipedia.fr/fr/poissons/amphiprion-ocellaris',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
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

export const compatibilityResearchCoverageWave21FieldReviews: CatalogFieldReview[] = [
  supported('sp_0049', 'ph', {min:6,max:7.5}, [compatibilityResearchCoverageWave21Sources.fishipedia_channa_asiatica.id],
    'Fishipedia exact-taxon page explicitly labels the pH range used here; no value is inferred from a related variant.'),
  supported('sp_0049', 'tank_size', {liters:500,lengthCm:null}, [compatibilityResearchCoverageWave21Sources.fishipedia_channa_asiatica.id],
    'Fishipedia exact-taxon page explicitly labels minimum aquarium volume; no tank-length minimum is inferred when the source does not state one.'),
  supported('sp_0187', 'temperature', {min:22,max:26}, [compatibilityResearchCoverageWave21Sources.fishipedia_chrysiptera_cyanea.id],
    'Fishipedia exact-taxon page explicitly labels the temperature range used here; no range is inferred from a different taxon.'),
  supported('sp_0187', 'ph', {min:8.2,max:8.4}, [compatibilityResearchCoverageWave21Sources.fishipedia_chrysiptera_cyanea.id],
    'Fishipedia exact-taxon page explicitly labels the pH range used here; no value is inferred from a related variant.'),
  supported('sp_0185', 'temperature', {min:26,max:29}, [compatibilityResearchCoverageWave21Sources.fishipedia_pomacanthus_annularis.id],
    'Fishipedia exact-taxon page explicitly labels the temperature range used here; no range is inferred from a different taxon.'),
  supported('sp_0475', 'ph', {min:7,max:7.5}, [compatibilityResearchCoverageWave21Sources.fishipedia_rhodeus_ocellatus.id],
    'Fishipedia exact-taxon page explicitly labels the pH range used here; no value is inferred from a related variant.'),
  supported('sp_0475', 'tank_size', {liters:80,lengthCm:null}, [compatibilityResearchCoverageWave21Sources.fishipedia_rhodeus_ocellatus.id],
    'Fishipedia exact-taxon page explicitly labels minimum aquarium volume; no tank-length minimum is inferred when the source does not state one.'),
  supported('sp_0039', 'water', "freshwater", [compatibilityResearchCoverageWave21Sources.fishbase_pseudogastromyzon_fangi.id],
    'FishBase exact-taxon page explicitly identifies the species water/environment type; the fetched page and scientific name were verified before this reviewed promotion.'),
  supported('sp_0039', 'adult_size', {min:null,max:10}, [compatibilityResearchCoverageWave21Sources.fishbase_pseudogastromyzon_fangi.id],
    'FishBase exact-taxon page explicitly labels maximum adult length; the reviewed value preserves the explicit maximum and does not invent a minimum.'),
  supported('sp_0040', 'water', "freshwater", [compatibilityResearchCoverageWave21Sources.fishbase_cobitis_sinensis.id],
    'FishBase exact-taxon page explicitly identifies the species water/environment type; the fetched page and scientific name were verified before this reviewed promotion.'),
  supported('sp_0040', 'adult_size', {min:null,max:15.3}, [compatibilityResearchCoverageWave21Sources.fishbase_cobitis_sinensis.id],
    'FishBase exact-taxon page explicitly labels maximum adult length; the reviewed value preserves the explicit maximum and does not invent a minimum.'),
  supported('sp_0046', 'water', "freshwater", [compatibilityResearchCoverageWave21Sources.fishbase_aphyocypris_chinensis.id],
    'FishBase exact-taxon page explicitly identifies the species water/environment type; the fetched page and scientific name were verified before this reviewed promotion.'),
  supported('sp_0046', 'adult_size', {min:null,max:6}, [compatibilityResearchCoverageWave21Sources.fishbase_aphyocypris_chinensis.id],
    'FishBase exact-taxon page explicitly labels maximum adult length; the reviewed value preserves the explicit maximum and does not invent a minimum.'),
  supported('sp_0452', 'temperature', {min:22,max:28}, [compatibilityResearchCoverageWave21Sources.fishipedia_amphiprion_ocellaris.id],
    'Fishipedia exact-taxon page explicitly labels the temperature range used here; no range is inferred from a different taxon.'),
  supported('sp_0452', 'tank_size', {liters:100,lengthCm:null}, [compatibilityResearchCoverageWave21Sources.fishipedia_amphiprion_ocellaris.id],
    'Fishipedia exact-taxon page explicitly labels minimum aquarium volume; no tank-length minimum is inferred when the source does not state one.'),
];

export const compatibilityResearchCoverageWave21VerifiedSourceIds = Object.values(
  compatibilityResearchCoverageWave21Sources,
).map(item => item.id);

const allCoreFacts = ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation'] as const;

export const compatibilityResearchCoverageWave21ProfilePatches: readonly CompatibilityProfileAuthorityPatch[] = [
  {
    speciesId: 'sp_0049',
    addCitationIds: [compatibilityResearchCoverageWave21Sources.fishipedia_channa_asiatica.id],
    addRequiredFacts: [...allCoreFacts],
  },
  {
    speciesId: 'sp_0187',
    addCitationIds: [compatibilityResearchCoverageWave21Sources.fishipedia_chrysiptera_cyanea.id],
    addRequiredFacts: ['temperature', 'ph'],
  },
  {
    speciesId: 'sp_0185',
    addCitationIds: [compatibilityResearchCoverageWave21Sources.fishipedia_pomacanthus_annularis.id],
    addRequiredFacts: ['temperature'],
  },
  {
    speciesId: 'sp_0475',
    addCitationIds: [compatibilityResearchCoverageWave21Sources.fishipedia_rhodeus_ocellatus.id],
    addRequiredFacts: ['ph', 'tank_size'],
  },
  {
    speciesId: 'sp_0452',
    addCitationIds: [compatibilityResearchCoverageWave21Sources.fishipedia_amphiprion_ocellaris.id],
    addRequiredFacts: ['temperature', 'tank_size'],
  },
] as const;

export const compatibilityResearchCoverageWave21AuthorityPatch = {
  patchId: 'research-coverage-wave21-20261015',
  speciesIds: ['sp_0049', 'sp_0187', 'sp_0185', 'sp_0475', 'sp_0039', 'sp_0040', 'sp_0046', 'sp_0452'],
  authorityOwner: 'src/data/compatibilityAuthorityPatches/research-coverage-wave21-20261015.ts',
  runtimeScope: 'source_controlled_only',
  writesProductionAuthority: false,
  exactTaxonOnly: true,
  promotedFieldCount: 15,
} as const;
