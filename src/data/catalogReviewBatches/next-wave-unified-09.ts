export type NextWaveUnified09EvidenceCeilingOutcome = {
  speciesId: string;
  field: 'social';
  code: 'species_social_not_established';
  sourceIds: string[];
  note: string;
};

export type NextWaveUnified09DomainOutcome = {
  speciesId: string;
  lifeType: 'coral_or_anemone' | 'crustacean_or_mollusk';
  sourceIds: string[];
  note: string;
};

const speciesCeiling = (
  speciesId: string,
  sourceId: string,
  title: string,
): NextWaveUnified09EvidenceCeilingOutcome => ({
  speciesId,
  field: 'social',
  code: 'species_social_not_established',
  sourceIds: [sourceId],
  note: `${title} is already reviewed but does not establish a stable household aquarium social mode, defensible community compatibility rule, or sufficiently complete environment/space/social authority for a positive Compatibility Profile. Keep this exact catalog object fail-closed until stronger object-level reviewed evidence is added.`,
});

const domainHold = (
  speciesId: string,
  lifeType: NextWaveUnified09DomainOutcome['lifeType'],
  sourceId: string,
  note: string,
): NextWaveUnified09DomainOutcome => ({
  speciesId,
  lifeType,
  sourceIds: [sourceId],
  note,
});

export const nextWaveUnified09EvidenceCeilings: readonly NextWaveUnified09EvidenceCeilingOutcome[] = [
  speciesCeiling('sp_0136', 'batch32-fishbase-sphaerichthys-osphromenoides', 'Sphaerichthys osphromenoides species review'),
  speciesCeiling('sp_0137', 'batch32-fishbase-semaprochilodus-insignis', 'Semaprochilodus insignis species review'),
  speciesCeiling('sp_0362', 'batch07-fishbase-hemigrammus-rodwayi', 'Hemigrammus rodwayi species review'),
  speciesCeiling('sp_0458', 'batch37-fishbase-kryptopterus-vitreolus', 'Kryptopterus vitreolus species review'),
  speciesCeiling('sp_0467', 'batch38-fishbase-hyphessobrycon-megalopterus', 'Hyphessobrycon megalopterus species review'),
  speciesCeiling('sp_0470', 'batch38-fishbase-hyphessobrycon-herbertaxelrodi', 'Hyphessobrycon herbertaxelrodi species review'),
  speciesCeiling('sp_0471', 'batch38-fishbase-moenkhausia-pittieri', 'Moenkhausia pittieri species review'),
  speciesCeiling('sp_0472', 'batch38-fishbase-thayeria-boehlkei', 'Thayeria boehlkei species review'),
  speciesCeiling('sp_0473', 'batch39-fishbase-nannostomus-beckfordi', 'Nannostomus beckfordi species review'),
] as const;

export const nextWaveUnified09DomainOutcomes: readonly NextWaveUnified09DomainOutcome[] = [
  domainHold(
    'sp_0336',
    'coral_or_anemone',
    'batch35-worms-tubastraea-coccinea',
    'Tubastraea coccinea is a coral. The current fish Compatibility Profile cannot represent coral feeding, placement, flow/light, stinging or reef-space interactions; the catalog category “海水鱼” must not cause fish-social semantics to be applied.',
  ),
  domainHold(
    'sp_0368',
    'coral_or_anemone',
    'batch24-worms-catalaphyllia-jardinei-green',
    'Catalaphyllia jardinei Green is a coral trade object. Even where the base taxon is recognizable, the fish Compatibility domain cannot encode coral stinging radius, placement, light/flow, or coral competition; no fish Profile is permitted.',
  ),
  domainHold(
    'sp_0370',
    'coral_or_anemone',
    'batch24-worms-entacmaea-quadricolor-red',
    'Entacmaea quadricolor Red is a sea-anemone trade object. Nematocyst stings, host relationships, wandering behavior, reef placement and light/flow are outside the fish-profile schema.',
  ),
  domainHold(
    'sp_0400',
    'coral_or_anemone',
    'batch24-worms-catalaphyllia-jardinei-ultra-green',
    'Catalaphyllia jardinei Ultra Green is a coral trade object. Variant naming does not justify inheriting a fish Compatibility Profile, and reef placement/stinging/light-flow semantics remain structurally outside the fish domain.',
  ),
  domainHold(
    'sp_0401',
    'coral_or_anemone',
    'batch24-worms-entacmaea-quadricolor-rose',
    'Entacmaea quadricolor Rose is a sea-anemone trade object. The current fish Compatibility engine cannot model wandering, host relationships, stinging, reef placement or anemone-specific husbandry.',
  ),
  domainHold(
    'sp_0402',
    'coral_or_anemone',
    'batch25-worms-stichodactyla-gigantea-green',
    'Stichodactyla gigantea Green is a sea-anemone trade object. Fish territoriality/social fields cannot safely represent anemone stinging, host relationships, movement or reef-space requirements.',
  ),
  domainHold(
    'sp_0003',
    'crustacean_or_mollusk',
    'batch04-itis-caridina-dennerli',
    'Caridina dennerli is a shrimp. Shrimp-specific predation exposure, colony stocking, mineral/water sensitivity and invertebrate cohabitation semantics are not safely representable by the current fish Compatibility Profile.',
  ),
  domainHold(
    'sp_0004',
    'crustacean_or_mollusk',
    'batch04-worms-vittina-turrita',
    'Vittina turrita is a gastropod. Snail grazing, shell/mineral requirements, predation exposure and invertebrate stocking rules require a non-fish compatibility domain.',
  ),
  domainHold(
    'sp_0005',
    'crustacean_or_mollusk',
    'batch08-fishbase-clithon-corona',
    'Clithon corona is a gastropod. The fish-profile schema cannot represent snail-specific shell chemistry, grazing, escape/predation or invertebrate stocking semantics.',
  ),
  domainHold(
    'sp_0188',
    'crustacean_or_mollusk',
    'batch28-fishbase-lysmata-amboinensis',
    'Lysmata amboinensis is a marine shrimp despite the catalog category “海水鱼”. Cleaning interactions, predation exposure, molting and invertebrate stocking are outside fish social-profile semantics.',
  ),
  domainHold(
    'sp_0189',
    'crustacean_or_mollusk',
    'batch28-fishbase-thor-amboinensis',
    'Thor amboinensis is a marine shrimp despite the catalog category “海水鱼”. Its invertebrate-specific predation and cohabitation rules must not be encoded as fish territoriality/social fields.',
  ),
  domainHold(
    'sp_0190',
    'crustacean_or_mollusk',
    'batch28-fishbase-lysmata-boggesi',
    'Lysmata boggesi is a marine shrimp despite the catalog category “海水鱼”. Molting, predation, reef interactions and shrimp stocking require a cross-taxa compatibility model.',
  ),
  domainHold(
    'sp_0191',
    'crustacean_or_mollusk',
    'batch33-worms-paguristes-cadenati',
    'Paguristes cadenati is a hermit crab despite the catalog category “海水鱼”. Shell availability, scavenging, reef interactions and invertebrate predation/cohabitation rules are outside fish-profile semantics.',
  ),
  domainHold(
    'sp_0427',
    'crustacean_or_mollusk',
    'batch37-fishbase-caridina-multidentata',
    'Caridina multidentata is a shrimp. The current fish Compatibility Profile cannot safely represent shrimp colony behavior, molting, predation exposure or invertebrate-specific stocking.',
  ),
  domainHold(
    'sp_0429',
    'crustacean_or_mollusk',
    'batch17-fishbase-pomacea-bridgesii',
    'Pomacea bridgesii is an apple-snail catalog object. Snail-specific grazing, shell chemistry, reproduction and predation rules are not modeled by the current fish Compatibility domain.',
  ),
  domainHold(
    'sp_0476',
    'crustacean_or_mollusk',
    'batch39-professional-pomacea-diffusa',
    'Pomacea diffusa is an apple snail. The fish Compatibility Profile cannot encode shell/mineral requirements, grazing, reproduction, predation exposure or invertebrate stocking semantics.',
  ),
] as const;

export const nextWaveUnified09AllSpeciesIds = [
  'sp_0136','sp_0137','sp_0336','sp_0362','sp_0368',
  'sp_0370','sp_0400','sp_0401','sp_0402','sp_0458',
  'sp_0467','sp_0470','sp_0471','sp_0472','sp_0473',
  'sp_0003','sp_0004','sp_0005','sp_0188','sp_0189',
  'sp_0190','sp_0191','sp_0427','sp_0429','sp_0476',
] as const;

export const nextWaveUnified09ProfileIds = [] as const;
