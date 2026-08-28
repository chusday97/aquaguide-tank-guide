import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(here, '..');
const catalogPath = path.join(appRoot, 'src/catalog.generated.json');
const outputPath = path.join(appRoot, 'src/species-groups.generated.json');

const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));

const clean = (value = '') => String(value).replace(/\s+/g, ' ').trim();
const slugify = (value) => clean(value)
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

function parseScientificName(rawScientificName, displayName) {
  const scientificName = clean(rawScientificName);
  if (!scientificName) {
    return { baseScientificName: displayName, variantLabel: null, relationType: 'unresolved', confidence: 'low' };
  }
  const varietyMatch = scientificName.match(/^(.+?)\s+var\.\s*(.*)$/i);
  if (varietyMatch) {
    return {
      baseScientificName: clean(varietyMatch[1]),
      variantLabel: clean(varietyMatch[2]) || displayName,
      relationType: 'variety',
      confidence: 'high',
    };
  }

  const cultivarMatch = scientificName.match(/^(.+?)\s+'([^']+)'$/);
  if (cultivarMatch) {
    return {
      baseScientificName: clean(cultivarMatch[1]),
      variantLabel: clean(cultivarMatch[2]),
      relationType: 'cultivar',
      confidence: 'high',
    };
  }

  const wildTypeMatch = scientificName.match(/^(.+?)\s+wild\s+type$/i);
  if (wildTypeMatch) {
    return {
      baseScientificName: clean(wildTypeMatch[1]),
      variantLabel: 'wild type',
      relationType: 'wild_type',
      confidence: 'high',
    };
  }
  return {
    baseScientificName: scientificName,
    variantLabel: null,
    relationType: scientificName.includes(' sp.') ? 'open_species' : 'exact_species',
    confidence: scientificName.includes(' sp.') ? 'medium' : 'high',
  };
}

const members = catalog.map((item) => {
  const parsed = parseScientificName(item.scientific_name, item.name);
  const baseKey = slugify(parsed.baseScientificName) || item.catalog_key;
  return {
    id: item.id,
    catalog_key: item.catalog_key,
    name: item.name,
    scientific_name: item.scientific_name,
    category: item.category,
    status: item.status,
    base_species_key: `base:${baseKey}`,
    base_scientific_name: parsed.baseScientificName,
    variant_label: parsed.variantLabel,
    relation_type: parsed.relationType,
    grouping_confidence: parsed.confidence,
  };
});

const grouped = new Map();
for (const member of members) {
  const list = grouped.get(member.base_species_key) || [];
  list.push(member);
  grouped.set(member.base_species_key, list);
}
const groups = [...grouped.entries()].map(([groupKey, groupMembers]) => {
  const categoryCounts = new Map();
  for (const member of groupMembers) {
    categoryCounts.set(member.category, (categoryCounts.get(member.category) || 0) + 1);
  }
  const categories = [...categoryCounts.keys()].filter(Boolean);
  const primaryCategory = [...categoryCounts.entries()]
    .sort((a, b) => b[1] - a[1])[0]?.[0] || '未分类';
  const exactDuplicateKeys = new Map();
  for (const member of groupMembers) {
    const key = `${clean(member.name).toLowerCase()}::${clean(member.scientific_name).toLowerCase()}`;
    exactDuplicateKeys.set(key, (exactDuplicateKeys.get(key) || 0) + 1);
  }
  const duplicateCount = [...exactDuplicateKeys.values()].reduce((sum, count) => sum + Math.max(0, count - 1), 0);

  return {
    group_key: groupKey,
    base_scientific_name: groupMembers[0].base_scientific_name,
    primary_category: primaryCategory,
    categories,
    category_conflict: categories.length > 1,
    member_count: groupMembers.length,
    variant_count: groupMembers.filter((item) => item.variant_label).length,
    duplicate_count: duplicateCount,
    batch_candidate: groupMembers.length > 1,
    seo_strategy: groupMembers.length > 1 ? 'shared_base_plus_variant_override' : 'single_species',
    members: groupMembers,
  };
});
groups.sort((a, b) => {
  const categoryCompare = a.primary_category.localeCompare(b.primary_category, 'zh-CN');
  if (categoryCompare !== 0) return categoryCompare;
  return a.base_scientific_name.localeCompare(b.base_scientific_name, 'en');
});

const stats = {
  catalog_count: catalog.length,
  base_group_count: groups.length,
  grouped_member_count: groups.filter((group) => group.member_count > 1)
    .reduce((sum, group) => sum + group.member_count, 0),
  batch_candidate_groups: groups.filter((group) => group.batch_candidate).length,
  explicit_variant_members: members.filter((item) => item.variant_label).length,
  exact_duplicate_records: groups.reduce((sum, group) => sum + group.duplicate_count, 0),
  category_conflict_groups: groups.filter((group) => group.category_conflict).length,
  unresolved_members: members.filter((item) => item.grouping_confidence === 'low').length,
};

await writeFile(outputPath, `${JSON.stringify({ stats, groups }, null, 2)}\n`, 'utf8');
console.log(`Generated Species groups: ${groups.length} base groups from ${catalog.length} catalog rows`);
console.log(JSON.stringify(stats));
