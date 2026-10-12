export type NextWaveUnified12IdentityOutcome = {
  speciesId: string;
  code: 'catalog_scientific_name_unresolved' | 'catalog_variant_identity_unresolved' | 'catalog_parent_taxon_unresolved';
  candidateTaxa: string[];
  sourceIds: string[];
  note: string;
};

export type NextWaveUnified12EvidenceCeilingOutcome = {
  speciesId: string;
  field: 'social';
  code: 'variant_social_not_established';
  sourceIds: string[];
  note: string;
};

const identityHold = (
  speciesId: string,
  code: NextWaveUnified12IdentityOutcome['code'],
  candidateTaxon: string,
  sourceId: string,
  note: string,
): NextWaveUnified12IdentityOutcome => ({
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
): NextWaveUnified12EvidenceCeilingOutcome => ({
  speciesId,
  field: 'social',
  code: 'variant_social_not_established',
  sourceIds: [sourceId],
  note: `${title} is already reviewed for this catalog object, but environment, space and social behavior remain reviewed_unknown and the review does not promote base-species inheritance. No reviewed bridge establishes a variant-specific household social mode, so positive Compatibility remains fail-closed.`,
});

export const nextWaveUnified12IdentityOutcomes: readonly NextWaveUnified12IdentityOutcome[] = [
  identityHold('sp_0066', 'catalog_scientific_name_unresolved', 'Carassius auratus ornamental Red Cap lineage', 'batch26-fishbase-carassius-auratus-red-cap', 'The catalog scientific name ends at “Carassius auratus var.” without a variant identifier. The Red Cap catalog-object review does not repair the incomplete scientific identity or authorize base-goldfish Compatibility inheritance.'),
  identityHold('sp_0144', 'catalog_scientific_name_unresolved', 'Poecilia reticulata ornamental Blue Grass lineage', 'batch05-fishbase-poecilia-reticulata', 'The catalog scientific name ends at “var.” and the reviewed source describes only Poecilia reticulata, explicitly not the Blue Grass commercial variant. Exact variant identity remains unresolved.'),
  identityHold('sp_0204', 'catalog_scientific_name_unresolved', 'Hemigrammus bleheri ornamental Black Diamond lineage', 'batch06-fishbase-hemigrammus-bleheri', 'The catalog scientific name ends at “var.” while the reviewed source covers only the base species and does not identify the Black Diamond commercial variant.'),
  identityHold('sp_0205', 'catalog_scientific_name_unresolved', 'Hyphessobrycon herbertaxelrodi ornamental Purple Emperor lineage', 'batch06-fishbase-hyphessobrycon-herbertaxelrodi', 'The catalog scientific name ends at “var.” while the reviewed source covers only the base species and does not identify the Purple Emperor commercial variant.'),
  identityHold('sp_0210', 'catalog_scientific_name_unresolved', 'Pangio kuhlii ornamental Golden Cobra lineage', 'batch34-fishbase-pangio-kuhlii-variant', 'The catalog scientific name ends at “Pangio kuhlii var.” without a stable variant identifier. The reviewed catalog-object record does not establish a taxonomically precise lineage suitable for Compatibility inheritance.'),
  identityHold('sp_0212', 'catalog_scientific_name_unresolved', 'Hemigrammus rodwayi ornamental Gold/Blue-eye lineage', 'batch06-fishbase-hemigrammus-rodwayi', 'The catalog scientific name ends at “var.” and the reviewed source covers only the base species. The exact ornamental identity remains unresolved.'),

  identityHold('sp_0206', 'catalog_variant_identity_unresolved', 'Paracheirodon innesi ornamental Diamond lineage', 'batch06-fishbase-paracheirodon-innesi', 'The catalog names a Diamond ornamental variant, but the reviewed source describes only the base species and does not identify that commercial lineage. No reviewed identity bridge supports Compatibility inheritance.'),
  identityHold('sp_0225', 'catalog_variant_identity_unresolved', 'Hemigrammus bleheri ornamental Longfin lineage', 'batch06-fishbase-hemigrammus-bleheri', 'The reviewed source covers Hemigrammus bleheri but explicitly does not identify the Longfin commercial variant. Base-species inheritance is prohibited.'),
  identityHold('sp_0226', 'catalog_variant_identity_unresolved', 'Hemigrammus bleheri ornamental Platinum lineage', 'batch06-fishbase-hemigrammus-bleheri', 'The reviewed source covers Hemigrammus bleheri but explicitly does not identify the Platinum commercial variant. Base-species inheritance is prohibited.'),
  identityHold('sp_0231', 'catalog_variant_identity_unresolved', 'Corydoras panda ornamental Albino lineage', 'batch06-fishbase-corydoras-panda', 'The reviewed source covers Corydoras panda but does not identify the Albino commercial variant. No reviewed bridge supports exact-variant Compatibility inheritance.'),
  identityHold('sp_0232', 'catalog_variant_identity_unresolved', 'Corydoras aeneus ornamental Platinum lineage', 'batch06-fishbase-corydoras-aeneus', 'The reviewed source covers Corydoras aeneus but does not identify the Platinum commercial variant. No reviewed bridge supports exact-variant Compatibility inheritance.'),
  identityHold('sp_0244', 'catalog_variant_identity_unresolved', 'Poecilia reticulata ornamental Yellow Grass lineage', 'batch06-fishbase-poecilia-reticulata', 'The reviewed source describes Poecilia reticulata but does not identify the Yellow Grass commercial variant. Base-species inheritance is prohibited.'),
  identityHold('sp_0245', 'catalog_variant_identity_unresolved', 'Poecilia reticulata ornamental Kohaku lineage', 'batch07-fishbase-poecilia-reticulata', 'The reviewed source describes the base species and explicitly notes that the Kohaku variant is not identified. Keep the exact commercial lineage unresolved.'),
  identityHold('sp_0246', 'catalog_variant_identity_unresolved', 'Poecilia reticulata ornamental Albino Kohaku lineage', 'batch07-fishbase-poecilia-reticulata', 'The reviewed source describes the base species and explicitly notes that the Albino Kohaku variant is not identified. Keep the exact commercial lineage unresolved.'),

  identityHold('sp_0230', 'catalog_parent_taxon_unresolved', 'Ancistrus spp. ornamental Gold Longfin lineage', 'batch29-fishbase-ancistrus-sp-gold-longfin', 'The catalog parent remains Ancistrus sp. rather than a species-level taxon. The Gold Longfin catalog-object review does not resolve the underlying species, so species-level Compatibility inheritance remains unsafe.'),
] as const;

export const nextWaveUnified12EvidenceCeilings: readonly NextWaveUnified12EvidenceCeilingOutcome[] = [
  socialCeiling('sp_0150', 'batch27-fishbase-carassius-auratus-oranda-short-tail', 'Carassius auratus Oranda Short Tail variant review'),
  socialCeiling('sp_0203', 'batch29-fishbase-poecilia-sphenops-green', 'Poecilia sphenops Green variant review'),
  socialCeiling('sp_0209', 'batch29-fishbase-poecilia-latipinna-blood', 'Poecilia latipinna Blood variant review'),
  socialCeiling('sp_0213', 'batch29-fishbase-crossocheilus-langei-gold', 'Crossocheilus langei Gold variant review'),
  socialCeiling('sp_0215', 'batch29-fishbase-sahyadria-denisonii-longfin', 'Sahyadria denisonii Longfin variant review'),
  socialCeiling('sp_0222', 'batch39-fishbase-amatitlania-nigrofasciata-jellybean', 'Amatitlania nigrofasciata Jellybean variant review'),
  socialCeiling('sp_0223', 'batch40-sciencedirect-channa-asiatica-albino', 'Channa asiatica Albino variant review'),
  socialCeiling('sp_0233', 'batch34-fishbase-trichopodus-leerii-albino-balloon', 'Trichopodus leerii Albino Balloon variant review'),
  socialCeiling('sp_0237', 'batch29-fishbase-poecilia-latipinna-high-fin-red', 'Poecilia latipinna High Fin Red variant review'),
  socialCeiling('sp_0252', 'batch34-fishbase-synodontis-nigriventris-white', 'Synodontis nigriventris White variant review'),
] as const;

export const nextWaveUnified12AllSpeciesIds = [
  'sp_0066','sp_0144','sp_0150','sp_0203','sp_0204',
  'sp_0205','sp_0206','sp_0209','sp_0210','sp_0212',
  'sp_0213','sp_0215','sp_0222','sp_0223','sp_0225',
  'sp_0226','sp_0230','sp_0231','sp_0232','sp_0233',
  'sp_0237','sp_0244','sp_0245','sp_0246','sp_0252',
] as const;

export const nextWaveUnified12ProfileIds = [] as const;
