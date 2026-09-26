export type CatalogIdentityBoundaryCode =
  | 'trade_name_taxon_ambiguous'
  | 'accepted_taxon_alias_trade_ambiguous'
  | 'commercial_hybrid_identity_unresolved';

export type CatalogIdentityBoundary = {
  speciesId: string;
  code: CatalogIdentityBoundaryCode;
  resolvedGranularity: 'trade_name_only' | 'accepted_taxon_alias_only' | 'commercial_lineage_only';
  candidateTaxa: string[];
  sourceIds: string[];
  note: string;
  reviewedAt: string;
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
  },
  sp_0428: {
    speciesId: 'sp_0428',
    code: 'accepted_taxon_alias_trade_ambiguous',
    resolvedGranularity: 'accepted_taxon_alias_only',
    candidateTaxa: ['Vittina natalensis', 'other aquarium-trade zebra nerites'],
    sourceIds: ['batch03-obis-neritina-natalensis'],
    note: 'Neritina natalensis 的接受名可确认到 Vittina natalensis；但“斑马螺/zebra nerite”贸易名可用于多个 nerite taxon。接受学名修订不能自动证明用户所指贸易个体就是 V. natalensis。',
    reviewedAt: '2026-09-22',
  },
  sp_0021: {
    speciesId: 'sp_0021',
    code: 'commercial_hybrid_identity_unresolved',
    resolvedGranularity: 'commercial_lineage_only',
    candidateTaxa: ['Amatitlania nigrofasciata lineage', 'commercial parrot/convict hybrid lineage'],
    sourceIds: ['batch03-fishbase-amatitlania-nigrofasciata'],
    note: '“迷你鹦鹉鱼”是商业品系名，现有 reviewed source 只能确认 Amatitlania nigrofasciata 基础种资料，不能确认该贸易名的稳定亲本组合或独立 taxon；继续禁止把基础种全部字段自动提升为品系 authority。',
    reviewedAt: '2026-09-22',
  },
};

export const getCatalogIdentityBoundary = (speciesId: string) => catalogIdentityBoundaries[speciesId];
