/**
 * Explicit catalogue-row duplicate groups.
 *
 * These entries mean only that the current catalogue contains duplicated rows
 * with the same user-facing identity and core husbandry fields. They are NOT a
 * generic scientific-name alias system and must not be used to collapse
 * distinct trade forms / morphs that merely share a base taxon.
 */
export type ExactCatalogDuplicateGroup = {
  canonicalId: string;
  duplicateIds: string[];
  basis: 'exact_catalog_row_duplicate';
  note: string;
};

export const exactCatalogDuplicateGroups: ExactCatalogDuplicateGroup[] = [
  { canonicalId: 'sp_0001', duplicateIds: ['sp_0001', 'sp_0027'], basis: 'exact_catalog_row_duplicate', note: '极火虾 duplicate catalogue rows.' },
  { canonicalId: 'sp_0002', duplicateIds: ['sp_0002', 'sp_0028'], basis: 'exact_catalog_row_duplicate', note: '水晶虾 duplicate catalogue rows; taxon ambiguity remains separately governed by identity boundaries.' },
  { canonicalId: 'sp_0003', duplicateIds: ['sp_0003', 'sp_0029'], basis: 'exact_catalog_row_duplicate', note: '苏拉威西虾 duplicate catalogue rows.' },
  { canonicalId: 'sp_0004', duplicateIds: ['sp_0004', 'sp_0032'], basis: 'exact_catalog_row_duplicate', note: '洋葱螺 duplicate catalogue rows.' },
  { canonicalId: 'sp_0005', duplicateIds: ['sp_0005', 'sp_0033'], basis: 'exact_catalog_row_duplicate', note: '角螺 duplicate catalogue rows.' },
  { canonicalId: 'sp_0006', duplicateIds: ['sp_0006', 'sp_0035'], basis: 'exact_catalog_row_duplicate', note: '恶魔蟹 duplicate catalogue rows.' },
  { canonicalId: 'sp_0038', duplicateIds: ['sp_0038', 'sp_0130'], basis: 'exact_catalog_row_duplicate', note: '马口鱼 duplicate catalogue rows.' },
  { canonicalId: 'sp_0060', duplicateIds: ['sp_0060', 'sp_0136'], basis: 'exact_catalog_row_duplicate', note: '巧克力曼龙 duplicate catalogue rows.' },
  { canonicalId: 'sp_0061', duplicateIds: ['sp_0061', 'sp_0137'], basis: 'exact_catalog_row_duplicate', note: '飞凤鱼 duplicate catalogue rows.' },
  { canonicalId: 'sp_0214', duplicateIds: ['sp_0214', 'sp_0338'], basis: 'exact_catalog_row_duplicate', note: '白金西非凤凰 duplicate catalogue rows.' },
  { canonicalId: 'sp_0427', duplicateIds: ['sp_0427', 'sp_0454'], basis: 'exact_catalog_row_duplicate', note: '大和藻虾 duplicate catalogue rows.' },
  { canonicalId: 'sp_0428', duplicateIds: ['sp_0428', 'sp_0455'], basis: 'exact_catalog_row_duplicate', note: '斑马螺 duplicate catalogue rows; trade-name identity boundary remains unchanged.' },
  { canonicalId: 'sp_0429', duplicateIds: ['sp_0429', 'sp_0456'], basis: 'exact_catalog_row_duplicate', note: '神秘螺 duplicate catalogue rows.' },
  { canonicalId: 'sp_0430', duplicateIds: ['sp_0430', 'sp_0457'], basis: 'exact_catalog_row_duplicate', note: '杀手螺 duplicate catalogue rows.' },
];

const groupBySpeciesId = new Map<string, ExactCatalogDuplicateGroup>();
for (const group of exactCatalogDuplicateGroups) {
  for (const id of group.duplicateIds) groupBySpeciesId.set(id, group);
}

export const getExactCatalogDuplicateGroup = (speciesId: string) => groupBySpeciesId.get(speciesId);

export const getExactCatalogDuplicateCanonicalId = (speciesId: string) => (
  getExactCatalogDuplicateGroup(speciesId)?.canonicalId || speciesId
);

export const areExactCatalogDuplicateAliases = (leftId: string, rightId: string) => {
  if (leftId === rightId) return true;
  const left = getExactCatalogDuplicateGroup(leftId);
  return Boolean(left && left.duplicateIds.includes(rightId));
};
