export type NextWaveUnified14IdentityOutcome = {
  speciesId: string;
  code: 'catalog_scientific_name_unresolved' | 'catalog_variant_identity_unresolved' | 'catalog_parent_taxon_unresolved';
  candidateTaxa: string[];
  sourceIds: string[];
  note: string;
};

export type NextWaveUnified14EvidenceCeilingOutcome = {
  speciesId: string;
  field: 'social';
  code: 'variant_social_not_established';
  sourceIds: string[];
  note: string;
};

export type NextWaveUnified14DomainOutcome = {
  speciesId: string;
  lifeType: 'crustacean_or_mollusk';
  sourceIds: string[];
  note: string;
};

const identityHold = (
  speciesId: string,
  code: NextWaveUnified14IdentityOutcome['code'],
  candidateTaxon: string,
  sourceId: string,
  note: string,
): NextWaveUnified14IdentityOutcome => ({
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
): NextWaveUnified14EvidenceCeilingOutcome => ({
  speciesId,
  field: 'social',
  code: 'variant_social_not_established',
  sourceIds: [sourceId],
  note: `${title} is already reviewed for this exact catalog object, but the object-specific Compatibility fields remain reviewed_unknown and no reviewed bridge authorizes inheritance from the base species. A stable variant-specific household social mode is therefore not established; positive Compatibility remains fail-closed.`,
});

const shrimpDomainHold = (
  speciesId: string,
  sourceId: string,
  title: string,
): NextWaveUnified14DomainOutcome => ({
  speciesId,
  lifeType: 'crustacean_or_mollusk',
  sourceIds: [sourceId],
  note: `${title} identifies a shrimp catalog object. Shrimp colony behavior, molting, mineral/water sensitivity, predation exposure and invertebrate cohabitation are not safely represented by the current fish Compatibility Profile; keep this object outside fish-profile semantics.`,
});

export const nextWaveUnified14IdentityOutcomes: readonly NextWaveUnified14IdentityOutcome[] = [
  identityHold('sp_0068', 'catalog_scientific_name_unresolved', 'Carassius auratus ornamental Bubble Eye lineage', 'batch27-fishbase-carassius-auratus-bubble-eye', 'The catalog scientific name ends at “Carassius auratus var.” without a variant identifier. The Bubble Eye object review does not repair that incomplete scientific identity or authorize generic goldfish Compatibility inheritance.'),
  identityHold('sp_0360', 'catalog_scientific_name_unresolved', 'Hyphessobrycon herbertaxelrodi ornamental Platinum lineage', 'batch07-fishbase-hyphessobrycon-herbertaxelrodi', 'The catalog scientific name ends at “Hyphessobrycon herbertaxelrodi var.” and the reviewed source explicitly states that the Platinum variant is not identified. Exact identity remains unresolved.'),
  identityHold('sp_0361', 'catalog_scientific_name_unresolved', 'Tanichthys albonubes ornamental Longfin lineage', 'batch35-fishbase-tanichthys-albonubes-longfin', 'The catalog scientific name ends at “Tanichthys albonubes var.” without a variant identifier. The exact-object review does not repair the incomplete scientific identity or create a Compatibility inheritance bridge.'),
  identityHold('sp_0366', 'catalog_scientific_name_unresolved', 'Synchiropus splendidus ornamental improved lineage', 'batch36-fishbase-synchiropus-splendidus-variant', 'The catalog scientific name ends at “Synchiropus splendidus var.” without a variant identifier. The reviewed variant record does not establish a taxonomically resolved commercial lineage for Compatibility inheritance.'),
  identityHold('sp_0375', 'catalog_variant_identity_unresolved', 'Hyphessobrycon herbertaxelrodi ornamental Balloon lineage', 'batch07-fishbase-hyphessobrycon-herbertaxelrodi', 'The reviewed source covers Hyphessobrycon herbertaxelrodi and explicitly states that the Balloon commercial variant is not identified. No reviewed identity bridge supports exact-variant Compatibility inheritance.'),
  identityHold('sp_0392', 'catalog_parent_taxon_unresolved', 'Ancistrus spp. ornamental Snowflake Gold lineage', 'batch30-fishbase-ancistrus-sp-snowflake-gold', 'The catalog parent remains Ancistrus sp. rather than a species-level taxon. The Snowflake Gold object review does not resolve the underlying species, so species-level Compatibility inheritance remains unsafe.'),
  identityHold('sp_0418', 'catalog_parent_taxon_unresolved', 'Ancistrus spp. ornamental Albino Longfin lineage', 'batch31-fishbase-ancistrus-sp-albino-longfin', 'The catalog parent remains Ancistrus sp. rather than a species-level taxon. The Albino Longfin object review does not resolve the underlying species, so species-level Compatibility inheritance remains unsafe.'),
  identityHold('sp_0474', 'catalog_scientific_name_unresolved', 'Oryzias latipes ornamental killifish lineage', 'batch39-fishbase-oryzias-latipes-killifish-variant', 'The catalog scientific name ends at “Oryzias latipes var.” without a variant identifier. The catalog-object review does not repair that incomplete scientific identity or authorize base-species Compatibility inheritance.'),
] as const;

export const nextWaveUnified14EvidenceCeilings: readonly NextWaveUnified14EvidenceCeilingOutcome[] = [
  socialCeiling('sp_0363', 'batch15-fishbase-danio-rerio-glo-purple', 'Danio rerio Glo Purple variant review'),
  socialCeiling('sp_0364', 'batch15-fishbase-danio-rerio-glo-pink', 'Danio rerio Glo Pink variant review'),
  socialCeiling('sp_0385', 'batch30-fishbase-carassius-auratus-white-gold', 'Carassius auratus White Gold variant review'),
  socialCeiling('sp_0386', 'batch30-fishbase-carassius-auratus-black-moor', 'Carassius auratus Black Moor variant review'),
  socialCeiling('sp_0387', 'batch30-fishbase-carassius-auratus-panda-butterfly', 'Carassius auratus Panda Butterfly variant review'),
  socialCeiling('sp_0389', 'batch44-fishbase-betta-splendens-platinum-halfmoon', 'Betta splendens Platinum Halfmoon variant review'),
  socialCeiling('sp_0390', 'batch44-fishbase-betta-splendens-red-white-crown', 'Betta splendens Red-white Crown variant review'),
  socialCeiling('sp_0391', 'batch44-fishbase-betta-splendens-blue-dragon-crown', 'Betta splendens Blue-dragon Crown variant review'),
  socialCeiling('sp_0395', 'batch31-fishbase-crossocheilus-langei-gold-longfin', 'Crossocheilus langei Gold Longfin variant review'),
  socialCeiling('sp_0406', 'batch37-fishbase-synchiropus-splendidus-xl', 'Synchiropus splendidus XL variant review'),
  socialCeiling('sp_0413', 'batch37-fishbase-pangio-kuhlii-longfin', 'Pangio kuhlii Longfin variant review'),
  socialCeiling('sp_0419', 'batch17-fishbase-danio-rerio-glo-orange-longfin', 'Danio rerio Glo Orange Longfin variant review'),
  socialCeiling('sp_0426', 'batch37-fishbase-tanichthys-albonubes-polar', 'Tanichthys albonubes Polar variant review'),
] as const;

export const nextWaveUnified14DomainOutcomes: readonly NextWaveUnified14DomainOutcome[] = [
  shrimpDomainHold('sp_0027', 'batch42-professional-neocaridina-davidi-red', 'Neocaridina davidi Red variant review'),
  shrimpDomainHold('sp_0028', 'batch40-fishbase-caridina-cantonensis-variant', 'Caridina cantonensis variant species review'),
  shrimpDomainHold('sp_0030', 'batch40-professional-neocaridina-davidi-yellow', 'Neocaridina davidi Yellow variant review'),
  shrimpDomainHold('sp_0031', 'batch40-professional-neocaridina-davidi-blue', 'Neocaridina davidi Blue variant review'),
] as const;

export const nextWaveUnified14AllSpeciesIds = [
  'sp_0068','sp_0360','sp_0361','sp_0363','sp_0364',
  'sp_0366','sp_0375','sp_0385','sp_0386','sp_0387',
  'sp_0389','sp_0390','sp_0391','sp_0392','sp_0395',
  'sp_0406','sp_0413','sp_0418','sp_0419','sp_0426',
  'sp_0474','sp_0027','sp_0028','sp_0030','sp_0031',
] as const;

export const nextWaveUnified14ProfileIds = [] as const;
