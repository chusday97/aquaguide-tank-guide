import type { CatalogIdentityBoundaryCode } from '../catalogIdentityBoundaries';

export type NextWaveUnified07Outcome = {
  speciesId: string;
  code: CatalogIdentityBoundaryCode;
  candidateTaxa: string[];
  sourceIds: string[];
  note: string;
};

const variantHold = (
  speciesId: string,
  candidateTaxon: string,
  sourceId: string,
): NextWaveUnified07Outcome => ({
  speciesId,
  code: 'catalog_variant_identity_unresolved',
  candidateTaxa: [candidateTaxon],
  sourceIds: [sourceId],
  note: '母种或近似 catalog 对象可以辨认，但既有 Phase 2 记录明确停在 reviewed_unknown；本轮没有同行评审、政府或等价对象级来源确认该精确贸易变体可继承母种 husbandry 或 social authority，因此保持 fail-closed。',
});

export const nextWaveUnified07Outcomes: readonly NextWaveUnified07Outcome[] = [
  {
    speciesId: 'sp_0296',
    code: 'catalog_scientific_name_unresolved',
    candidateTaxa: ['Lutjanus kasmira ornamental lineage; catalog variant suffix is blank'],
    sourceIds: ['batch23-fishbase-lutjanus-kasmira-var'],
    note: 'Catalog scientificName 以空白 “var.” 结尾，无法确认“红利鱼 (改良)”代表哪个稳定变体；不得从 Lutjanus kasmira 母种继承 Compatibility authority。',
  },
  {
    speciesId: 'sp_0297',
    code: 'catalog_parent_taxon_unresolved',
    candidateTaxa: ['Pseudochromis spp. ornamental Gold lineage'],
    sourceIds: ['batch23-fishbase-pseudochromis-sp-gold'],
    note: 'Catalog 只解析到 Pseudochromis sp.，没有单一母种；Gold 贸易标签不足以确定 taxon 或继承任一拟雀鲷的水质、空间和社会边界。',
  },
  variantHold('sp_0338', 'Pelvicachromis pulcher ornamental Platinum/Albino lineage', 'batch15-fishbase-pelvicachromis-pulcher-albino'),
  variantHold('sp_0340', 'Aphyocharax anisitsi ornamental Balloon lineage', 'batch15-usgs-aphyocharax-anisitsi-balloon'),
  variantHold('sp_0341', 'Gymnocorymbus ternetzi ornamental Longfin White lineage', 'batch15-fishbase-gymnocorymbus-ternetzi-longfin-white'),
  variantHold('sp_0359', 'Boehlkea fredcochui ornamental Blue lineage', 'batch15-fishbase-boehlkea-fredcochui-blue'),
  {
    speciesId: 'sp_0372',
    code: 'catalog_category_mismatch',
    candidateTaxa: ['Andinoacara pulcher ornamental Balloon lineage'],
    sourceIds: ['batch16-fishbase-andinoacara-pulcher-balloon'],
    note: 'Scientific name 指向鱼类变体，但 catalog category 是“硬景/底床”；精确 Balloon 对象也没有可提升的 reviewed 变体桥接，类别与身份修正前保持 fail-closed。',
  },
  {
    speciesId: 'sp_0373',
    code: 'catalog_category_mismatch',
    candidateTaxa: ['Hemichromis bimaculatus ornamental Balloon lineage'],
    sourceIds: ['batch16-fishbase-hemichromis-bimaculatus-balloon'],
    note: 'Scientific name 指向鱼类变体，但 catalog category 是“硬景/底床”；精确 Balloon 对象也没有可提升的 reviewed 变体桥接，类别与身份修正前保持 fail-closed。',
  },
  variantHold('sp_0374', 'Astronotus ocellatus ornamental Balloon lineage', 'batch16-fishbase-astronotus-ocellatus-balloon'),
  variantHold('sp_0376', 'Peckoltia compta ornamental Super Gold lineage', 'batch16-fishbase-peckoltia-compta-super-gold'),
  variantHold('sp_0388', 'Pterophyllum scalare ornamental Super Red lineage', 'batch16-fishbase-pterophyllum-scalare-super-red'),
  variantHold('sp_0393', 'Gymnocorymbus ternetzi ornamental Platinum Longfin lineage', 'batch16-fishbase-gymnocorymbus-ternetzi-platinum-longfin'),
  variantHold('sp_0394', 'Gymnocorymbus ternetzi ornamental Glo Orange lineage', 'batch16-fishbase-gymnocorymbus-ternetzi-glo-orange'),
  variantHold('sp_0399', 'Chrysiptera cyanea ornamental Platinum lineage', 'batch16-fishbase-chrysiptera-cyanea-platinum'),
  variantHold('sp_0407', 'Scleropages formosus ornamental Blood Red A grade lineage', 'batch25-fishbase-scleropages-formosus-blood-red-a'),
  variantHold('sp_0408', 'Scleropages formosus ornamental Gold Head lineage', 'batch25-fishbase-scleropages-formosus-gold-head'),
  variantHold('sp_0409', 'Potamotrygon leopoldi ornamental Albino lineage', 'batch25-fishbase-potamotrygon-leopoldi-albino'),
  variantHold('sp_0410', 'Potamotrygon leopoldi ornamental Eclipse lineage', 'batch25-fishbase-potamotrygon-leopoldi-eclipse'),
  {
    speciesId: 'sp_0411',
    code: 'catalog_category_mismatch',
    candidateTaxa: ['Channa stewartii ornamental Karbi Anglong lineage'],
    sourceIds: ['batch25-fishbase-channa-stewartii-karbi-anglong'],
    note: 'Scientific name 指向鱼类贸易对象，但 catalog category 是“硬景/底床”；Karbi Anglong 标签也没有对象级 reviewed 桥接，类别与身份修正前保持 fail-closed。',
  },
  variantHold('sp_0412', 'Channa andrao ornamental Red lineage', 'batch25-fishbase-channa-andrao-red'),
  {
    speciesId: 'sp_0414',
    code: 'catalog_parent_taxon_unresolved',
    candidateTaxa: ['Geophagus spp. ornamental Longfin Platinum lineage'],
    sourceIds: ['batch16-fishbase-geophagus-sp-longfin-platinum'],
    note: 'Catalog 只解析到 Geophagus sp.，没有单一母种；Longfin Platinum 贸易标签不足以继承任一 Geophagus 物种的 Compatibility authority。',
  },
  variantHold('sp_0415', 'Xiphophorus hellerii ornamental Red-eye Albino High Fin lineage', 'batch16-fishbase-xiphophorus-hellerii-high-fin'),
  {
    speciesId: 'sp_0416',
    code: 'catalog_category_mismatch',
    candidateTaxa: ['Andinoacara pulcher ornamental Super Balloon lineage'],
    sourceIds: ['batch17-fishbase-andinoacara-pulcher-super-balloon'],
    note: 'Scientific name 指向鱼类变体，但 catalog category 是“硬景/底床”；精确 Super Balloon 对象也没有可提升的 reviewed 变体桥接，类别与身份修正前保持 fail-closed。',
  },
  variantHold('sp_0417', 'Mikrogeophagus ramirezi ornamental Super Red Balloon lineage', 'batch17-fishbase-mikrogeophagus-ramirezi-super-red-balloon'),
  variantHold('sp_0420', 'Trichopodus trichopterus ornamental Balloon Gold XL lineage', 'batch25-fishbase-trichopodus-trichopterus-balloon-gold-xl'),
] as const;

export const nextWaveUnified07ProfileIds = [] as const;
