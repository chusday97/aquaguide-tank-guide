export type NextWaveUnified08IdentityOutcome = {
  speciesId: string;
  code: 'catalog_variant_identity_unresolved' | 'catalog_scientific_name_unresolved' | 'catalog_category_mismatch';
  candidateTaxa: string[];
  sourceIds: string[];
  note: string;
};

export type NextWaveUnified08EvidenceCeilingOutcome = {
  speciesId: string;
  field: 'social';
  code: 'species_social_not_established';
  sourceIds: string[];
  note: string;
};

export type NextWaveUnified08DomainOutcome = {
  speciesId: string;
  lifeType: 'coral_or_anemone';
  sourceIds: string[];
  note: string;
};

const variantHold = (
  speciesId: string,
  candidateTaxon: string,
  sourceId: string,
  note: string,
): NextWaveUnified08IdentityOutcome => ({
  speciesId,
  code: 'catalog_variant_identity_unresolved',
  candidateTaxa: [candidateTaxon],
  sourceIds: [sourceId],
  note,
});

const speciesCeiling = (
  speciesId: string,
  sourceId: string,
  title: string,
): NextWaveUnified08EvidenceCeilingOutcome => ({
  speciesId,
  field: 'social',
  code: 'species_social_not_established',
  sourceIds: [sourceId],
  note: `${title} already ended in reviewed_unknown for aquarium social/environment/space authority. The repository contains no independent reviewed Compatibility source establishing a stable household social mode for this exact catalog species. Keep positive community compatibility fail-closed until new object-level reviewed evidence is added.`,
});

export const nextWaveUnified08IdentityOutcomes: readonly NextWaveUnified08IdentityOutcome[] = [
  {
    speciesId: 'sp_0365',
    code: 'catalog_scientific_name_unresolved',
    candidateTaxa: ['Lutjanus kasmira ornamental Longfin lineage; catalog scientificName has a blank var. suffix'],
    sourceIds: ['batch24-fishbase-lutjanus-kasmira-longfin'],
    note: 'Catalog common name claims a Longfin form but scientificName ends at an unspecified “var.”. The prior professional review remained reviewed_unknown and does not supply an explicit variant-to-base authority bridge, so base Lutjanus kasmira Compatibility authority must not be inherited.',
  },
  variantHold(
    'sp_0421',
    'Gymnocorymbus ternetzi ornamental Platinum Balloon Longfin lineage',
    'batch17-fishbase-gymnocorymbus-ternetzi-platinum-balloon-longfin',
    'The exact Platinum Balloon Longfin trade object was reviewed only to reviewed_unknown. Existing Gymnocorymbus ternetzi base-species sources do not independently establish that this compound ornamental morph can inherit base space/social authority.',
  ),
  {
    speciesId: 'sp_0442',
    code: 'catalog_scientific_name_unresolved',
    candidateTaxa: ['Gyrinocheilus aymonieri ornamental lineage; catalog scientificName has a blank var. suffix'],
    sourceIds: ['batch25-fishbase-gyrinocheilus-aymonieri-var'],
    note: 'The catalog scientificName ends at an unspecified “var.” and the reviewed record did not resolve which ornamental form is intended. Do not promote base Gyrinocheilus aymonieri husbandry or social authority to an unidentified variant.',
  },
  variantHold(
    'sp_0445',
    'Trichopodus trichopterus ornamental Blue lineage',
    'batch26-fishbase-trichopodus-trichopterus-blue',
    'The Blue trade object has only reviewed_unknown object-level authority. The repository does not contain an explicit reviewed bridge proving that this exact variant can inherit base Trichopodus trichopterus Compatibility fields.',
  ),
  {
    speciesId: 'sp_0211',
    code: 'catalog_scientific_name_unresolved',
    candidateTaxa: ['Thorichthys meeki ornamental lineage; catalog scientificName has a blank var. suffix'],
    sourceIds: ['batch12-fishbase-thorichthys-meeki-var'],
    note: 'The catalog scientificName stops at an unspecified “var.” and the existing catalog-variant review remained reviewed_unknown. The precise trade lineage must be resolved before any Thorichthys meeki base-species Compatibility authority is inherited.',
  },
  {
    speciesId: 'sp_0077',
    code: 'catalog_category_mismatch',
    candidateTaxa: ['Cabomba caroliniana aquatic plant'],
    sourceIds: ['batch27-aquaplant-cabomba-caroliniana'],
    note: 'Reviewed authority identifies Cabomba caroliniana as an aquatic plant while the catalog category is “鱼类”. Do not force plant light/growth/placement needs into fish social Compatibility fields; correct life type/category before domain-specific compatibility work.',
  },
  {
    speciesId: 'sp_0089',
    code: 'catalog_category_mismatch',
    candidateTaxa: ['Limnophila aquatica aquatic plant'],
    sourceIds: ['batch27-kew-limnophila-aquatica'],
    note: 'Reviewed authority identifies Limnophila aquatica as an aquatic plant while the catalog category is “鱼类”. Plant light, nutrient, growth and placement semantics must not be represented as a fish Compatibility Profile.',
  },
] as const;

export const nextWaveUnified08EvidenceCeilings: readonly NextWaveUnified08EvidenceCeilingOutcome[] = [
  speciesCeiling('sp_0025', 'batch31-fishbase-pterapogon-kauderni', 'Pterapogon kauderni species review'),
  speciesCeiling('sp_0037', 'batch26-fishbase-acheilognathus-macropterus', 'Acheilognathus macropterus species review'),
  speciesCeiling('sp_0039', 'batch31-fishbase-pseudogastromyzon-fangi', 'Pseudogastromyzon fangi species review'),
  speciesCeiling('sp_0040', 'batch31-fishbase-cobitis-sinensis', 'Cobitis sinensis species review'),
  speciesCeiling('sp_0041', 'batch26-fishbase-abbottina-rivularis', 'Abbottina rivularis species review'),
  speciesCeiling('sp_0046', 'batch26-fishbase-aphyocypris-chinensis', 'Aphyocypris chinensis species review'),
  speciesCeiling('sp_0060', 'batch31-fishbase-sphaerichthys-osphromenoides', 'Sphaerichthys osphromenoides species review'),
  speciesCeiling('sp_0061', 'batch31-fishbase-semaprochilodus-insignis', 'Semaprochilodus insignis species review'),
  speciesCeiling('sp_0106', 'batch31-fishbase-erpetichthys-calabaricus', 'Erpetoichthys calabaricus species review'),
  speciesCeiling('sp_0107', 'batch31-fishbase-semaprochilodus-taeniurus', 'Semaprochilodus taeniurus species review'),
  speciesCeiling('sp_0111', 'batch27-fishbase-sawbwa-resplendens', 'Sawbwa resplendens species review'),
  speciesCeiling('sp_0113', 'batch31-fishbase-epiplatys-annulatus', 'Epiplatys annulatus species review'),
  speciesCeiling('sp_0128', 'batch32-fishbase-beaufortia-kweichowensis', 'Beaufortia kweichowensis species review'),
  speciesCeiling('sp_0132', 'batch32-fishbase-parambassis-ranga', 'Parambassis ranga species review'),
  speciesCeiling('sp_0134', 'batch32-fishbase-iriatherina-werneri', 'Iriatherina werneri species review'),
  speciesCeiling('sp_0135', 'batch32-fishbase-pseudomugil-furcatus', 'Pseudomugil furcatus species review'),
  speciesCeiling('sp_0186', 'batch32-fishbase-chaetodon-auriga', 'Chaetodon auriga species review'),
] as const;

export const nextWaveUnified08DomainOutcomes: readonly NextWaveUnified08DomainOutcome[] = [
  {
    speciesId: 'sp_0333',
    lifeType: 'coral_or_anemone',
    sourceIds: ['batch24-worms-stichodactyla-haddoni-blue'],
    note: 'Stichodactyla haddoni Blue is a sea-anemone trade object. The current fish Compatibility profile cannot represent nematocyst stings, wandering/placement, host relationships, light/flow or reef-space interactions, so it remains fail-closed until a reef/anemone compatibility domain exists.',
  },
] as const;

export const nextWaveUnified08AllSpeciesIds = [
  'sp_0365','sp_0421','sp_0442','sp_0445','sp_0211',
  'sp_0025','sp_0037','sp_0039','sp_0040','sp_0041',
  'sp_0046','sp_0060','sp_0061','sp_0077','sp_0089',
  'sp_0106','sp_0107','sp_0111','sp_0113','sp_0128',
  'sp_0132','sp_0134','sp_0135','sp_0186','sp_0333',
] as const;

export const nextWaveUnified08ProfileIds = [] as const;
