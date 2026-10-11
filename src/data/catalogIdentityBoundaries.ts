export type CatalogIdentityBoundaryCode =
  | 'trade_name_taxon_ambiguous'
  | 'accepted_taxon_alias_trade_ambiguous'
  | 'commercial_hybrid_identity_unresolved'
  | 'catalog_scientific_name_unresolved'
  | 'catalog_common_name_identity_mismatch'
  | 'catalog_object_type_mismatch';

export type CatalogIdentityBoundary = {
  speciesId: string;
  code: CatalogIdentityBoundaryCode;
  resolvedGranularity: 'trade_name_only' | 'accepted_taxon_alias_only' | 'commercial_lineage_only' | 'scientific_name_unresolved' | 'catalog_name_mismatch' | 'object_type_mismatch';
  candidateTaxa: string[];
  sourceIds: string[];
  note: string;
  reviewedAt: string;
  researchDisposition?: 'terminal_unknown_hold';
};

export const catalogIdentityBoundaries: Record<string, CatalogIdentityBoundary> = {
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
