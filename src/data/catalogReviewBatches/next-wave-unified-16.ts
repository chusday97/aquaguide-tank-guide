import type { CatalogEvidenceSource } from '../../../packages/contracts/src';

export type NextWaveUnified16EvidenceCeilingOutcome = {
  speciesId: string;
  field: 'social';
  code: 'species_social_not_established';
  sourceIds: string[];
  note: string;
};

export type NextWaveUnified16DomainOutcome = {
  speciesId: string;
  lifeType: 'coral_or_anemone' | 'marine_invertebrate' | 'reptile';
  sourceIds: string[];
  note: string;
};

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

export const nextWaveUnified16Sources = {
  corydorasHastatusFishBase: source(
    'batch05-fishbase-gastrodermus-hastatus',
    'Gastrodermus hastatus species summary',
    'FishBase',
    'https://www.fishbase.se/summary/Corydoras-hastatus',
    'curated_husbandry',
  ),
} satisfies Record<string, CatalogEvidenceSource>;

const speciesCeiling = (
  speciesId: string,
  sourceId: string,
  title: string,
): NextWaveUnified16EvidenceCeilingOutcome => ({
  speciesId,
  field: 'social',
  code: 'species_social_not_established',
  sourceIds: [sourceId],
  note: `${title} has reviewed environment/size authority but still does not establish a stable household aquarium social mode or defensible positive community rule. Keep this exact species fail-closed until stronger object-level reviewed social evidence is added.`,
});

const domainHold = (
  speciesId: string,
  lifeType: NextWaveUnified16DomainOutcome['lifeType'],
  sourceId: string,
  note: string,
): NextWaveUnified16DomainOutcome => ({
  speciesId,
  lifeType,
  sourceIds: [sourceId],
  note,
});

export const nextWaveUnified16EvidenceCeilings: readonly NextWaveUnified16EvidenceCeilingOutcome[] = [
  speciesCeiling('sp_0112', 'batch05-fishbase-poropanchax-normani', 'Poropanchax normani species review'),
  speciesCeiling('sp_0115', 'batch05-fishbase-hyphessobrycon-amapaensis', 'Hyphessobrycon amapaensis species review'),
] as const;

export const nextWaveUnified16DomainOutcomes: readonly NextWaveUnified16DomainOutcome[] = [
  domainHold('sp_0330', 'coral_or_anemone', 'batch35-worms-zoanthus-sp', 'Zoanthus sp. is a zoanthid cnidarian. Colony overgrowth, stinging, light/flow and reef-space competition require coral-domain semantics rather than fish social Compatibility.'),
  domainHold('sp_0335', 'coral_or_anemone', 'batch35-worms-clavularia-sp', 'Clavularia sp. is a soft-coral taxon. Growth, allelopathy, placement and reef-space interactions are outside the fish Compatibility Profile.'),
  domainHold('sp_0337', 'coral_or_anemone', 'batch35-worms-xenia-sp', 'Xenia sp. is a soft-coral taxon. Pulsing-colony growth, placement and reef-space competition require reef-specific compatibility semantics.'),
  domainHold('sp_0367', 'coral_or_anemone', 'batch36-worms-zoanthus-sp-snowflake', 'Zoanthus sp. Snowflake is a zoanthid trade object. Variant naming does not move it into fish-profile semantics.'),
  domainHold('sp_0371', 'marine_invertebrate', 'batch36-worms-haliclona-sp', 'Haliclona sp. Blue is a sponge. Filter-feeding, flow, fouling and invertebrate interactions require a marine-invertebrate domain rather than fish social fields.'),
  domainHold('sp_0403', 'coral_or_anemone', 'batch36-worms-zoanthus-sp-snowflake', 'Zoanthus sp. Gold Center is a zoanthid trade object. Colony growth, stinging and reef placement remain outside fish-profile semantics.'),
  domainHold('sp_0404', 'coral_or_anemone', 'batch37-worms-trachyphyllia-geoffroyi-purple', 'Trachyphyllia geoffroyi Purple is a stony-coral trade object. Stinging, tissue expansion, placement, light/flow and reef-space interactions require coral-specific semantics.'),
  domainHold('sp_0405', 'coral_or_anemone', 'batch37-worms-tubastraea-coccinea-red', 'Tubastraea coccinea Red is a coral trade object. Feeding, placement, stinging and reef-space semantics are outside the current fish Compatibility Profile.'),
  domainHold('sp_0460', 'reptile', 'batch37-fishbase-trachemys-scripta-elegans', 'Trachemys scripta elegans is a turtle/reptile. Basking, terrestrial access, shell/body growth, waste load and reptile-specific cohabitation cannot be represented by fish Compatibility fields.'),
] as const;

export const nextWaveUnified16ProfileIds = ['sp_0052'] as const;

export const nextWaveUnified16AllSpeciesIds = [
  'sp_0330','sp_0335','sp_0337','sp_0367','sp_0371',
  'sp_0403','sp_0404','sp_0405','sp_0460','sp_0112',
  'sp_0115','sp_0052',
] as const;
