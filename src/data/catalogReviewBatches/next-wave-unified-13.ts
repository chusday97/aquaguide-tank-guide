export type NextWaveUnified13IdentityOutcome = {
  speciesId: string;
  code: 'catalog_scientific_name_unresolved' | 'catalog_variant_identity_unresolved' | 'catalog_parent_taxon_unresolved';
  candidateTaxa: string[];
  sourceIds: string[];
  note: string;
};

export type NextWaveUnified13EvidenceCeilingOutcome = {
  speciesId: string;
  field: 'social';
  code: 'variant_social_not_established';
  sourceIds: string[];
  note: string;
};

export type NextWaveUnified13DomainOutcome = {
  speciesId: string;
  lifeType: 'coral_or_anemone';
  sourceIds: string[];
  note: string;
};

const identityHold = (
  speciesId: string,
  code: NextWaveUnified13IdentityOutcome['code'],
  candidateTaxon: string,
  sourceId: string,
  note: string,
): NextWaveUnified13IdentityOutcome => ({
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
): NextWaveUnified13EvidenceCeilingOutcome => ({
  speciesId,
  field: 'social',
  code: 'variant_social_not_established',
  sourceIds: [sourceId],
  note: `${title} is already reviewed for this exact catalog object, but the object-specific Compatibility fields remain reviewed_unknown and no reviewed bridge authorizes inheritance from the base species. A stable variant-specific household social mode is therefore not established; positive Compatibility remains fail-closed.`,
});

export const nextWaveUnified13IdentityOutcomes: readonly NextWaveUnified13IdentityOutcome[] = [
  identityHold('sp_0067', 'catalog_scientific_name_unresolved', 'Carassius auratus ornamental Pearlscale lineage', 'batch27-fishbase-carassius-auratus-pearlscale', 'The catalog scientific name ends at “Carassius auratus var.” without a variant identifier. The Pearlscale catalog-object review does not repair that incomplete scientific identity or authorize generic goldfish Compatibility inheritance.'),
  identityHold('sp_0255', 'catalog_variant_identity_unresolved', 'Hyphessobrycon sweglesi ornamental Longfin lineage', 'batch07-fishbase-hyphessobrycon-sweglesi', 'The reviewed source covers Hyphessobrycon sweglesi and explicitly states that the Longfin commercial variant is not identified. No reviewed identity bridge supports exact-variant Compatibility inheritance.'),
  identityHold('sp_0280', 'catalog_parent_taxon_unresolved', 'Ancistrus spp. ornamental Gold Longfin lineage', 'batch29-fishbase-ancistrus-sp-gold-longfin-2', 'The catalog parent remains Ancistrus sp. rather than a species-level taxon. The Gold Longfin catalog-object review does not resolve the underlying species, so species-level Compatibility inheritance remains unsafe.'),
  identityHold('sp_0281', 'catalog_parent_taxon_unresolved', 'Ancistrus spp. ornamental White Longfin lineage', 'batch29-fishbase-ancistrus-sp-white-longfin', 'The catalog parent remains Ancistrus sp. rather than a species-level taxon. The White Longfin catalog-object review does not resolve the underlying species, so species-level Compatibility inheritance remains unsafe.'),
  identityHold('sp_0287', 'catalog_variant_identity_unresolved', 'Hemigrammus bleheri ornamental Balloon lineage', 'batch07-fishbase-hemigrammus-bleheri', 'The reviewed source covers Hemigrammus bleheri and explicitly states that the Balloon commercial variant is not identified. Base-species Compatibility inheritance is prohibited.'),
  identityHold('sp_0339', 'catalog_variant_identity_unresolved', 'Hemigrammus rodwayi ornamental Gold lineage', 'batch07-fishbase-hemigrammus-rodwayi', 'The reviewed source covers Hemigrammus rodwayi and explicitly states that the Gold commercial variant is not identified. No reviewed bridge supports exact-variant Compatibility inheritance.'),
  identityHold('sp_0358', 'catalog_scientific_name_unresolved', 'Prionobrama filigera improved ornamental lineage', 'batch07-fishbase-prionobrama-filigera', 'The catalog scientific name ends at “Prionobrama filigera var.” without a variant identifier, while the reviewed source explicitly does not identify the improved commercial form. Exact identity remains unresolved.'),
] as const;

export const nextWaveUnified13EvidenceCeilings: readonly NextWaveUnified13EvidenceCeilingOutcome[] = [
  socialCeiling('sp_0253', 'batch29-fishbase-sahyadria-denisonii-red-line', 'Sahyadria denisonii Red Line variant review'),
  socialCeiling('sp_0254', 'batch29-fishbase-crossocheilus-langei-platinum', 'Crossocheilus langei Platinum variant review'),
  socialCeiling('sp_0259', 'batch43-fishbase-betta-splendens-halfmoon', 'Betta splendens Halfmoon variant review'),
  socialCeiling('sp_0260', 'batch43-fishbase-betta-splendens-crown-tail', 'Betta splendens Crown-tail variant review'),
  socialCeiling('sp_0261', 'batch44-fishbase-betta-splendens-large-ear', 'Betta splendens Large-ear variant review'),
  socialCeiling('sp_0262', 'batch44-fishbase-betta-splendens-blue-dragon', 'Betta splendens Blue-dragon variant review'),
  socialCeiling('sp_0267', 'batch34-fishbase-trichopodus-leerii-red-head', 'Trichopodus leerii Red Head variant review'),
  socialCeiling('sp_0289', 'batch15-fishbase-danio-rerio-glo-red', 'Danio rerio Glo Red variant review'),
  socialCeiling('sp_0290', 'batch15-fishbase-danio-rerio-glo-green', 'Danio rerio Glo Green variant review'),
  socialCeiling('sp_0291', 'batch15-fishbase-danio-rerio-glo-orange', 'Danio rerio Glo Orange variant review'),
  socialCeiling('sp_0292', 'batch30-fishbase-poecilia-latipinna-gold-balloon', 'Poecilia latipinna Gold Balloon variant review'),
  socialCeiling('sp_0293', 'batch30-fishbase-poecilia-sphenops-black-balloon', 'Poecilia sphenops Black Balloon variant review'),
  socialCeiling('sp_0295', 'batch34-fishbase-melanotaenia-praecox-longfin', 'Melanotaenia praecox Longfin variant review'),
  socialCeiling('sp_0348', 'batch30-fishbase-carassius-auratus-tigerhead', 'Carassius auratus Tigerhead variant review'),
  socialCeiling('sp_0349', 'batch30-fishbase-carassius-auratus-calico-ranchu', 'Carassius auratus Calico Ranchu variant review'),
  socialCeiling('sp_0350', 'batch30-fishbase-carassius-auratus-black-oranda', 'Carassius auratus Black Oranda variant review'),
  socialCeiling('sp_0351', 'batch30-fishbase-carassius-auratus-butterfly-tail', 'Carassius auratus Butterfly Tail variant review'),
] as const;

export const nextWaveUnified13DomainOutcomes: readonly NextWaveUnified13DomainOutcome[] = [
  {
    speciesId: 'sp_0332',
    lifeType: 'coral_or_anemone',
    sourceIds: ['batch35-worms-palythoa-sp'],
    note: 'Reviewed WoRMS taxonomy identifies Palythoa sp. as a zoantharian cnidarian, not a fish. The catalog category “海水鱼” must not override reviewed life type. Zoanthid stinging, colony growth and reef placement require the coral/anemone domain rather than the current fish Compatibility profile.',
  },
] as const;

export const nextWaveUnified13AllSpeciesIds = [
  'sp_0067','sp_0253','sp_0254','sp_0255','sp_0259',
  'sp_0260','sp_0261','sp_0262','sp_0267','sp_0280',
  'sp_0281','sp_0287','sp_0289','sp_0290','sp_0291',
  'sp_0292','sp_0293','sp_0295','sp_0332','sp_0339',
  'sp_0348','sp_0349','sp_0350','sp_0351','sp_0358',
] as const;

export const nextWaveUnified13ProfileIds = [] as const;
