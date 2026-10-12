export type NextWaveUnified11IdentityOutcome = {
  speciesId: string;
  code: 'catalog_scientific_name_unresolved' | 'catalog_variant_identity_unresolved' | 'catalog_parent_taxon_unresolved';
  candidateTaxa: string[];
  sourceIds: string[];
  note: string;
};

export type NextWaveUnified11EvidenceCeilingOutcome = {
  speciesId: string;
  field: 'social';
  code: 'variant_social_not_established';
  sourceIds: string[];
  note: string;
};

const identityHold = (
  speciesId: string,
  code: NextWaveUnified11IdentityOutcome['code'],
  candidateTaxon: string,
  sourceId: string,
  note: string,
): NextWaveUnified11IdentityOutcome => ({
  speciesId,
  code,
  candidateTaxa: [candidateTaxon],
  sourceIds: [sourceId],
  note,
});

const socialCeiling = (
  speciesId: string,
  sourceId: string,
  title: string,
): NextWaveUnified11EvidenceCeilingOutcome => ({
  speciesId,
  field: 'social',
  code: 'variant_social_not_established',
  sourceIds: [sourceId],
  note: `${title} is already reviewed for this catalog object, but environment, space and social behavior remain reviewed_unknown and the review explicitly does not promote base-species inheritance. No reviewed bridge establishes a variant-specific household social mode, so positive Compatibility remains fail-closed.`,
});

export const nextWaveUnified11IdentityOutcomes: readonly NextWaveUnified11IdentityOutcome[] = [
  identityHold('sp_0065', 'catalog_scientific_name_unresolved', 'Carassius auratus ornamental Butterfly Tail lineage', 'batch26-fishbase-carassius-auratus-butterfly-tail', 'The catalog scientific name ends at “Carassius auratus var.” without a variant identifier. A review entry exists for the Butterfly Tail catalog object, but it does not repair the incomplete scientific identity or authorize inheritance of base-goldfish Compatibility fields.'),
  identityHold('sp_0124', 'catalog_parent_taxon_unresolved', 'Ancistrus spp. trade lineage', 'batch27-fishbase-ancistrus-sp', 'The catalog resolves only to Ancistrus sp. without a species-level parent taxon. The reviewed catalog record does not establish which Ancistrus taxon this trade object belongs to, so species-level Compatibility inheritance is unsafe.'),
  identityHold('sp_0141', 'catalog_scientific_name_unresolved', 'Hyphessobrycon pulchripinnis ornamental Sweet Lemon lineage', 'batch05-fishbase-hyphessobrycon-pulchripinnis', 'The catalog scientific name ends at “var.” and the reviewed source describes only the base species, explicitly not the Sweet Lemon commercial variant. Exact variant identity remains unresolved.'),
  identityHold('sp_0142', 'catalog_scientific_name_unresolved', 'Poecilia sphenops ornamental Balloon lineage', 'batch27-fishbase-poecilia-sphenops-balloon', 'The catalog scientific name ends at “Poecilia sphenops var.” without a variant identifier. The catalog-object review does not establish a taxonomically stable exact variant identity that can inherit base-species Compatibility fields.'),
  identityHold('sp_0143', 'catalog_scientific_name_unresolved', 'Poecilia reticulata ornamental Red Grass lineage', 'batch05-fishbase-poecilia-reticulata', 'The catalog scientific name ends at “var.” and the reviewed source covers only Poecilia reticulata, explicitly not the Red Grass commercial variant. Exact variant identity remains unresolved.'),
  identityHold('sp_0145', 'catalog_variant_identity_unresolved', 'Poecilia reticulata ornamental Dumbo lineage', 'batch05-fishbase-poecilia-reticulata', 'The catalog names a Dumbo ornamental variant, but the reviewed source describes only the base species and explicitly does not identify the Dumbo commercial variant. No reviewed identity bridge supports Compatibility inheritance.'),
  identityHold('sp_0154', 'catalog_scientific_name_unresolved', 'Hemigrammus bleheri ornamental Improved lineage', 'batch05-fishbase-hemigrammus-bleheri', 'The catalog scientific name ends at “var.” and the reviewed source covers only the base species, explicitly not the Improved commercial variant. Exact variant identity remains unresolved.'),
  identityHold('sp_0155', 'catalog_scientific_name_unresolved', 'Paracheirodon innesi ornamental Longfin lineage', 'batch05-fishbase-paracheirodon-innesi', 'The catalog scientific name ends at “var.” and the reviewed source covers only the base species, explicitly not the Longfin commercial variant. Exact variant identity remains unresolved.'),
  identityHold('sp_0159', 'catalog_parent_taxon_unresolved', 'Ancistrus spp. ornamental Gold lineage', 'batch27-fishbase-ancistrus-sp-gold', 'The catalog parent remains Ancistrus sp. rather than a species-level taxon. A Gold trade-line review does not resolve the underlying species, so species-level Compatibility inheritance is not defensible.'),
  identityHold('sp_0160', 'catalog_parent_taxon_unresolved', 'Ancistrus spp. ornamental Longfin Platinum lineage', 'batch28-fishbase-ancistrus-sp-longfin-platinum', 'The catalog parent remains Ancistrus sp. rather than a species-level taxon. The Longfin Platinum trade-line review does not resolve the parent species, so Compatibility inheritance remains fail-closed.'),
  identityHold('sp_0167', 'catalog_variant_identity_unresolved', 'Hemigrammus bleheri ornamental Balloon lineage', 'batch05-fishbase-hemigrammus-bleheri', 'The catalog names a Balloon morph, but the reviewed source describes only the base species and explicitly does not identify the Balloon commercial variant. No exact reviewed bridge exists.'),
  identityHold('sp_0170', 'catalog_variant_identity_unresolved', 'Poecilia reticulata ornamental Full Black lineage', 'batch06-fishbase-poecilia-reticulata', 'The reviewed source describes Poecilia reticulata but explicitly does not identify the Full Black commercial variant, and the existing review prohibits base-species inheritance. Keep the exact trade lineage unresolved.'),
] as const;

export const nextWaveUnified11EvidenceCeilings: readonly NextWaveUnified11EvidenceCeilingOutcome[] = [
  socialCeiling('sp_0064', 'batch26-fishbase-carassius-auratus-oranda', 'Carassius auratus Oranda variant review'),
  socialCeiling('sp_0147', 'batch39-fishbase-amatitlania-nigrofasciata-blue', 'Amatitlania nigrofasciata Blue variant review'),
  socialCeiling('sp_0148', 'batch39-fishbase-amatitlania-nigrofasciata-white', 'Amatitlania nigrofasciata White variant review'),
  socialCeiling('sp_0149', 'batch27-fishbase-carassius-auratus-panda', 'Carassius auratus Panda variant review'),
  socialCeiling('sp_0152', 'batch10-fishbase-danio-rerio-glofish', 'Danio rerio GloFish variant review'),
  socialCeiling('sp_0153', 'batch32-fishbase-trichopodus-leerii-balloon', 'Trichopodus leerii Balloon variant review'),
  socialCeiling('sp_0161', 'batch28-fishbase-poecilia-sphenops-chocolate', 'Poecilia sphenops Chocolate variant review'),
  socialCeiling('sp_0168', 'batch28-fishbase-poecilia-latipinna-gold', 'Poecilia latipinna Gold variant review'),
  socialCeiling('sp_0169', 'batch28-fishbase-poecilia-latipinna-silver', 'Poecilia latipinna Silver variant review'),
  socialCeiling('sp_0171', 'batch32-fishbase-tanichthys-albonubes-albino', 'Tanichthys albonubes Albino variant review'),
  socialCeiling('sp_0172', 'batch32-fishbase-tanichthys-albonubes-longfin', 'Tanichthys albonubes Longfin variant review'),
  socialCeiling('sp_0180', 'batch28-fishbase-carassius-auratus-telescope', 'Carassius auratus Telescope variant review'),
  socialCeiling('sp_0196', 'batch28-fishbase-sahyadria-denisonii-gold', 'Sahyadria denisonii Gold variant review'),
] as const;

export const nextWaveUnified11AllSpeciesIds = [
  'sp_0064','sp_0065','sp_0124','sp_0141','sp_0142',
  'sp_0143','sp_0145','sp_0147','sp_0148','sp_0149',
  'sp_0152','sp_0153','sp_0154','sp_0155','sp_0159',
  'sp_0160','sp_0161','sp_0167','sp_0168','sp_0169',
  'sp_0170','sp_0171','sp_0172','sp_0180','sp_0196',
] as const;

export const nextWaveUnified11ProfileIds = [] as const;
