export type CatalogIdentityBoundaryCode =
  | 'trade_name_taxon_ambiguous'
  | 'accepted_taxon_alias_trade_ambiguous'
  | 'commercial_hybrid_identity_unresolved'
  | 'catalog_scientific_name_unresolved'
  | 'catalog_common_name_identity_mismatch'
  | 'catalog_object_type_mismatch'
  | 'catalog_category_mismatch'
  | 'catalog_variant_identity_unresolved'
  | 'catalog_parent_taxon_unresolved';

export type CatalogIdentityBoundary = {
  speciesId: string;
  code: CatalogIdentityBoundaryCode;
  resolvedGranularity: 'trade_name_only' | 'accepted_taxon_alias_only' | 'commercial_lineage_only' | 'scientific_name_unresolved' | 'catalog_name_mismatch' | 'object_type_mismatch' | 'catalog_category_mismatch' | 'variant_identity_unresolved' | 'parent_taxon_unresolved';
  candidateTaxa: string[];
  sourceIds: string[];
  note: string;
  reviewedAt: string;
  researchDisposition?: 'terminal_unknown_hold';
};

export const catalogIdentityBoundaries: Record<string, CatalogIdentityBoundary> = {
  ...Object.fromEntries(([
    ['sp_0158', 'Xiphophorus hellerii ornamental red lineage', 'seriouslyfish-xiphophorus-hellerii'],
    ['sp_0163', 'Cyprinus carpio ornamental Kohaku lineage', 'batch09-fishbase-cyprinus-carpio-var'],
    ['sp_0175', 'Pterophyllum scalare ornamental red lineage', 'seriouslyfish-pterophyllum-scalare'],
    ['sp_0177', 'Pterophyllum scalare ornamental blue lineage', 'seriouslyfish-pterophyllum-scalare'],
    ['sp_0178', 'Pterophyllum scalare ornamental panda lineage', 'seriouslyfish-pterophyllum-scalare'],
    ['sp_0182', 'Panaque sp. L191 trade identity', 'batch11-fishbase-panaque-sp-l191'],
    ['sp_0201', 'Leporacanthicus cf. galaxias L240 trade identity', 'batch11-fishbase-leporacanthicus-cf-galaxias'],
    ['sp_0219', 'Mikrogeophagus ramirezi ornamental gold-balloon lineage', 'seriouslyfish-mikrogeophagus-ramirezi'],
    ['sp_0221', 'Apistogramma agassizii ornamental Fire Red/longfin lineage', 'seriouslyfish-apistogramma-agassizii'],
    ['sp_0227', 'Gymnocorymbus ternetzi ornamental longfin lineage', 'fishbase-gymnocorymbus-ternetzi'],
    ['sp_0229', 'Gyrinocheilus aymonieri ornamental albino lineage', 'seriouslyfish-gyrinocheilus-aymonieri'],
    ['sp_0236', 'Xiphophorus hellerii ornamental albino-red lineage', 'seriouslyfish-xiphophorus-hellerii'],
  ] as const).map(([speciesId, candidateTaxon, sourceId]) => [speciesId, {
    speciesId,
    code: 'catalog_variant_identity_unresolved' as const,
    resolvedGranularity: 'variant_identity_unresolved' as const,
    candidateTaxa: [candidateTaxon],
    sourceIds: [sourceId],
    note: '母种或近似贸易对象可辨认，但本轮没有足够强的对象级来源确认该精确变体身份及其 Compatibility 字段可安全继承；弱零售、论坛和爱好者来源不用于提升 consequential claims。',
    reviewedAt: '2026-10-12',
    researchDisposition: 'terminal_unknown_hold' as const,
  }])),
  sp_0176: {
    speciesId: 'sp_0176',
    code: 'catalog_category_mismatch',
    resolvedGranularity: 'catalog_category_mismatch',
    candidateTaxa: ['Pterophyllum scalare ornamental marble lineage'],
    sourceIds: ['seriouslyfish-pterophyllum-scalare'],
    note: 'Catalog scientificName 指向 Pterophyllum scalare 大理石改良品系，来源也明确其为神仙鱼改良品种，但 catalog category 却是“硬景/底床”。在类别修正前，鱼类 Compatibility runtime 不应接受这个对象。',
    reviewedAt: '2026-10-12',
    researchDisposition: 'terminal_unknown_hold',
  },
  sp_0179: {
    speciesId: 'sp_0179',
    code: 'catalog_variant_identity_unresolved',
    resolvedGranularity: 'variant_identity_unresolved',
    candidateTaxa: ['Trichopodus trichopterus ornamental balloon lineage'],
    sourceIds: ['seriouslyfish-trichopodus-trichopterus'],
    note: '母种 Trichopodus trichopterus 已有 reviewed authority，但本轮没有找到能独立确认“Balloon”对象身份及其形态是否可安全继承母种空间/行为参数的 reviewed 变体来源，因此禁止自动桥接。',
    reviewedAt: '2026-10-12',
    researchDisposition: 'terminal_unknown_hold',
  },
  sp_0208: {
    speciesId: 'sp_0208',
    code: 'catalog_variant_identity_unresolved',
    resolvedGranularity: 'variant_identity_unresolved',
    candidateTaxa: ['Aphyocharax anisitsi ornamental balloon lineage'],
    sourceIds: ['batch11-fishbase-aphyocharax-anisitsi-balloon'],
    note: 'Aphyocharax anisitsi 母种可确认，但“Balloon”是会改变体型比例的贸易形态；当前没有对象级来源证明该变体可直接继承母种空间与混养边界，因此保持 fail-closed。',
    reviewedAt: '2026-10-12',
    researchDisposition: 'terminal_unknown_hold',
  },
  sp_0216: {
    speciesId: 'sp_0216',
    code: 'catalog_variant_identity_unresolved',
    resolvedGranularity: 'variant_identity_unresolved',
    candidateTaxa: ['Channa aurantimaculata ornamental golden lineage'],
    sourceIds: ['batch19-fishbase-channa-aurantimaculata'],
    note: 'Channa aurantimaculata 母种已 reviewed，但 catalog 的“黄金”改良对象没有独立 reviewed 变体来源；不能把大型掠食性雷龙母种 authority 无条件赋给一个未验证贸易品系。',
    reviewedAt: '2026-10-12',
    researchDisposition: 'terminal_unknown_hold',
  },
  sp_0217: {
    speciesId: 'sp_0217',
    code: 'catalog_parent_taxon_unresolved',
    resolvedGranularity: 'parent_taxon_unresolved',
    candidateTaxa: ['Geophagus spp. (32 recognized species; exact parent taxon unresolved)'],
    sourceIds: ['batch12-fishbase-geophagus-sp-platinum'],
    note: 'Catalog scientificName 只有 “Geophagus sp. var. Platinum”，没有解析到单一母种。Geophagus 属含多个有效物种，属级信息不足以继承任一物种的水质、体型或攻击性 authority。',
    reviewedAt: '2026-10-12',
    researchDisposition: 'terminal_unknown_hold',
  },
  sp_0220: {
    speciesId: 'sp_0220',
    code: 'catalog_variant_identity_unresolved',
    resolvedGranularity: 'variant_identity_unresolved',
    candidateTaxa: ['Mikrogeophagus ramirezi ornamental platinum balloon lineage'],
    sourceIds: ['seriouslyfish-mikrogeophagus-ramirezi'],
    note: 'Mikrogeophagus ramirezi 母种和部分已审阅色系可用，但本轮没有找到能独立确认“Platinum Balloon”这一精确对象的 reviewed 变体来源；Balloon 体型也不能按普通色系处理。',
    reviewedAt: '2026-10-12',
    researchDisposition: 'terminal_unknown_hold',
  },
  sp_0228: {
    speciesId: 'sp_0228',
    code: 'catalog_variant_identity_unresolved',
    resolvedGranularity: 'variant_identity_unresolved',
    candidateTaxa: ['Gymnocorymbus ternetzi ornamental balloon lineage'],
    sourceIds: ['fishbase-gymnocorymbus-ternetzi'],
    note: 'Gymnocorymbus ternetzi 母种、白化和长鳍色系都有可核验来源，但“Balloon”体型变体没有对象级 reviewed 来源证明可以继承母种空间与社会参数，因此继续 fail-closed。',
    reviewedAt: '2026-10-12',
    researchDisposition: 'terminal_unknown_hold',
  },
  sp_0234: {
    speciesId: 'sp_0234',
    code: 'catalog_variant_identity_unresolved',
    resolvedGranularity: 'variant_identity_unresolved',
    candidateTaxa: ['Dario dario ornamental gold lineage'],
    sourceIds: ['batch22-fishbase-dario-dario'],
    note: 'Dario dario 母种已 reviewed，但“Gold”贸易品系没有独立 reviewed 身份来源；不因 scientificName 的 var. Gold 字符串自动继承母种行为和空间 authority。',
    reviewedAt: '2026-10-12',
    researchDisposition: 'terminal_unknown_hold',
  },
  sp_0235: {
    speciesId: 'sp_0235',
    code: 'catalog_variant_identity_unresolved',
    resolvedGranularity: 'variant_identity_unresolved',
    candidateTaxa: ['Nematobrycon palmeri ornamental platinum lineage'],
    sourceIds: ['batch12-fishbase-nematobrycon-palmeri-platinum'],
    note: 'Nematobrycon palmeri 母种资料可确认，但没有找到“Platinum”精确改良品系的独立 reviewed 身份来源；因此不将母种群游和空间规则自动提升给该 catalog object。',
    reviewedAt: '2026-10-12',
    researchDisposition: 'terminal_unknown_hold',
  },
  sp_0055: {
    speciesId: 'sp_0055',
    code: 'commercial_hybrid_identity_unresolved',
    resolvedGranularity: 'commercial_lineage_only',
    candidateTaxa: ['ornamental parrot-cichlid hybrid lineage', 'Cichlasoma spp. trade attribution is not a resolved taxon'],
    sourceIds: ['batch09-fishbase-cichlasoma-var'],
    note: '“金刚鹦鹉鱼”是商业观赏杂交/品系名称，而 catalog scientificName 仅为 “Cichlasoma var.”。现有来源不能把该商业对象安全映射到单一有效 taxon，因此不能继承任一 Cichlasoma 物种的行为或混养 authority。',
    reviewedAt: '2026-10-11',
    researchDisposition: 'terminal_unknown_hold',
  },
  sp_0002: {
    speciesId: 'sp_0002',
    code: 'trade_name_taxon_ambiguous',
    resolvedGranularity: 'trade_name_only',
    candidateTaxa: ['Caridina logemanni', 'Caridina cantonensis complex'],
    sourceIds: ['batch03-itis-caridina-cantonensis', 'identity-zootaxa-caridina-logemanni', 'identity-worms-caridina-logemanni'],
    note: '“水晶虾/Crystal”是贸易层名称。2014 年分类修订描述了 Caridina logemanni，且现代数据库接受该种，但当前 catalog object 没有批次级来源证明所有“水晶虾”均对应同一 taxon，因此不把贸易名强制映射到单一物种。',
    reviewedAt: '2026-09-22',
    researchDisposition: 'terminal_unknown_hold',
  },
  sp_0428: {
    speciesId: 'sp_0428',
    code: 'accepted_taxon_alias_trade_ambiguous',
    resolvedGranularity: 'accepted_taxon_alias_only',
    candidateTaxa: ['Vittina natalensis', 'other aquarium-trade zebra nerites'],
    sourceIds: ['batch03-obis-neritina-natalensis'],
    note: 'Neritina natalensis 的接受名可确认到 Vittina natalensis；但“斑马螺/zebra nerite”贸易名可用于多个 nerite taxon。接受学名修订不能自动证明用户所指贸易个体就是 V. natalensis。',
    reviewedAt: '2026-09-22',
    researchDisposition: 'terminal_unknown_hold',
  },
  sp_0021: {
    speciesId: 'sp_0021',
    code: 'commercial_hybrid_identity_unresolved',
    resolvedGranularity: 'commercial_lineage_only',
    candidateTaxa: ['Amatitlania nigrofasciata lineage', 'commercial parrot/convict hybrid lineage'],
    sourceIds: ['batch03-fishbase-amatitlania-nigrofasciata', 'biology-2026-mini-parrot-taxonomy-boundary'],
    note: '“迷你鹦鹉鱼”是商业品系名。2026 年同行评审研究将 platinum/sapphire mini parrot cichlid 作为人工杂交观赏品系，并明确指出尚无系统分类研究确认其有效属种归属；因此当前只能保留 commercial-lineage 级身份，继续禁止把 Amatitlania nigrofasciata 基础种全部字段自动提升为该商业品系 authority。',
    reviewedAt: '2026-10-10',
    researchDisposition: 'terminal_unknown_hold',
  },
  sp_0110: {
    speciesId: 'sp_0110',
    code: 'catalog_scientific_name_unresolved',
    resolvedGranularity: 'scientific_name_unresolved',
    candidateTaxa: ['Channa lorti (catalog string; authoritative taxon unresolved)'],
    sourceIds: ['batch19-fishbase-channa-lorti'],
    note: 'Catalog 中的 scientificName 为 “Channa lorti”，但本轮无法在权威分类来源中确认该精确 taxon。不能因为中文贸易名或同属 Channa 的其他物种而继承混养、体型或攻击性字段，因此该 catalog object 保持 fail-closed。',
    reviewedAt: '2026-10-11',
    researchDisposition: 'terminal_unknown_hold',
  },
  sp_0120: {
    speciesId: 'sp_0120',
    code: 'catalog_common_name_identity_mismatch',
    resolvedGranularity: 'catalog_name_mismatch',
    candidateTaxa: ['Gymnotus carapo', 'Electrophorus spp. implied by the Chinese common name 电鳗'],
    sourceIds: ['batch20-fishbase-gymnotus-carapo'],
    note: 'Gymnotus carapo 是可确认的刀鱼类 taxon，但 catalog 中文名“电鳗 (观赏型)”通常指向 Electrophorus 电鳗，名称与 scientificName 存在会直接误导混养判断的身份冲突。在名称修正前不提升为单一 Compatibility Profile。',
    reviewedAt: '2026-10-11',
    researchDisposition: 'terminal_unknown_hold',
  },
  sp_0334: {
    speciesId: 'sp_0334',
    code: 'catalog_object_type_mismatch',
    resolvedGranularity: 'object_type_mismatch',
    candidateTaxa: ['Stichodactyla gigantea (sea anemone; Cnidaria)'],
    sourceIds: ['batch24-worms-stichodactyla-gigantea'],
    note: 'Stichodactyla gigantea 是海葵而非鱼类，但当前 catalog 将该对象放在“海水鱼”类别。鱼类 Compatibility Profile 的行为、空间和捕食字段不能套用到刺胞动物，因此该对象在类型修正前保持 terminal hold。',
    reviewedAt: '2026-10-11',
    researchDisposition: 'terminal_unknown_hold',
  },
  sp_0127: {
    speciesId: 'sp_0127',
    code: 'trade_name_taxon_ambiguous',
    resolvedGranularity: 'trade_name_only',
    candidateTaxa: ['Botia almorhae sensu stricto', 'Botia lohachata', 'Botia sp. Kosi', 'Botia sp. Teesta', 'aquarium-trade hybrids'],
    sourceIds: ['batch20-fishbase-botia-almorhae', 'seriouslyfish-botia-almorhae-trade-boundary'],
    note: '“巴基斯坦鼠/Yoyo loach”是贸易层名称。Reviewed husbandry authority 明确指出 B. almorhae sensu stricto 未必进入过观赏贸易，市场个体还可能来自 B. lohachata、Kosi/Teesta 未定种或杂交来源；因此当前 catalog object 不能安全提升为单一 taxon Compatibility authority。',
    reviewedAt: '2026-10-11',
    researchDisposition: 'terminal_unknown_hold',
  },
};

export const getCatalogIdentityBoundary = (speciesId: string) => catalogIdentityBoundaries[speciesId];
