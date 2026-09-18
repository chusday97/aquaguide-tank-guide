import type { CareTopic } from '../../data/careTopicsData';
import { careTranslations } from '../../i18n/localizeCareDataAuto';
import { autoTranslations } from '../../i18n/localizeDataAuto';
import { categoryTranslations, englishTranslations } from '../../i18n/localizeData';
import { getCareVisualSources } from '../../lib/careVisual';
import { getSpeciesVisualSources } from '../../lib/speciesVisual';
import { getSpeciesFilterTags } from '../../modules/species/species.service';
import type { Fish } from '../../types';

export type SearchSuggestionKind = 'species' | 'care' | 'related_query' | 'filter';
export type SearchSuggestionMatch = 'exact' | 'prefix' | 'alias' | 'scientific' | 'keyword' | 'related';
export type SearchSuggestionScope = 'global' | 'encyclopedia' | 'care' | 'identify';

export interface SearchSuggestion {
  id: string;
  kind: SearchSuggestionKind;
  label: string;
  scientificName?: string;
  category?: string;
  image?: string;
  query: string;
  matchedBy: SearchSuggestionMatch;
  ownedQuantity?: number;
  targetId?: string;
}

interface SearchSuggestionInput {
  query: string;
  locale: 'zh-CN' | 'en';
  scope: SearchSuggestionScope;
  species: Fish[];
  careTopics: CareTopic[];
  ownedQuantityBySpeciesId?: ReadonlyMap<string, number>;
  speciesLimit?: number;
}

export interface SearchSuggestionResult {
  suggestions: SearchSuggestion[];
  totalSpeciesMatches: number;
}

type FishWithAliases = Fish & {
  aliases?: unknown;
  alias?: unknown;
  commonNames?: unknown;
  _originalName?: string;
  _originalCategory?: string;
};

const normalize = (value: unknown) => String(value ?? '').trim().toLocaleLowerCase();

const getAliases = (fish: FishWithAliases) => {
  const raw = fish.aliases ?? fish.alias ?? fish.commonNames;
  if (Array.isArray(raw)) return raw.map(normalize).filter(Boolean);
  if (typeof raw === 'string') return raw.split(/[、,，/]/).map(normalize).filter(Boolean);
  return [];
};

const getLocalizedSpeciesName = (fish: Fish, locale: 'zh-CN' | 'en') => {
  if (locale === 'zh-CN') return fish.name;
  const translatedName = englishTranslations[fish.id]?.name || autoTranslations[fish.id]?.name;
  if (translatedName && normalize(translatedName) !== normalize(fish.scientificName)) return translatedName;
  return fish.name;
};

const getLocalizedCategory = (fish: FishWithAliases, locale: 'zh-CN' | 'en') => {
  if (locale === 'zh-CN') return fish.category;
  return categoryTranslations[fish.category]
    || categoryTranslations[fish._originalCategory || '']
    || fish.category;
};

const getSpeciesRank = (fish: FishWithAliases, query: string) => {
  const names = [
    normalize(fish.name),
    normalize(fish._originalName),
    normalize(englishTranslations[fish.id]?.name),
    normalize(autoTranslations[fish.id]?.name),
  ].filter(Boolean);
  const aliases = getAliases(fish);
  const scientificName = normalize(fish.scientificName);
  const category = normalize(fish.category);
  const originalCategory = normalize(fish._originalCategory);
  const tags = getSpeciesFilterTags(fish);
  const tagText = normalize([
    ...tags.functionTags,
    ...tags.environmentTags,
    ...tags.difficultyTags,
    ...tags.housingTags,
    ...tags.searchKeywords,
  ].join(' '));

  if (names.some(name => name === query)) return { rank: 0, matchedBy: 'exact' as const };
  if (names.some(name => name.startsWith(query))) return { rank: 1, matchedBy: 'prefix' as const };
  if (aliases.some(alias => alias === query || alias.startsWith(query))) return { rank: 2, matchedBy: 'alias' as const };
  if (scientificName === query || scientificName.startsWith(query)) return { rank: 3, matchedBy: 'scientific' as const };
  if (names.some(name => name.includes(query))) return { rank: 4, matchedBy: 'keyword' as const };
  if (aliases.some(alias => alias.includes(query))) return { rank: 5, matchedBy: 'alias' as const };
  if (scientificName.includes(query)) return { rank: 6, matchedBy: 'scientific' as const };
  if (category.includes(query) || originalCategory.includes(query) || tagText.includes(query)) {
    return { rank: 7, matchedBy: 'keyword' as const };
  }
  return null;
};

const RELATED_QUERY_MAP: Array<{ terms: string[]; related: string[] }> = [
  { terms: ['浮头', 'gasping'], related: ['缺氧', '呼吸急促', '水质变差'] },
  { terms: ['水浑', '浑水', 'cloudy water'], related: ['白浊', '绿水', '过滤', '换水'] },
  { terms: ['不吃食', '不吃', 'not eating'], related: ['拒食', '应激', '水温异常'] },
  { terms: ['工具鱼', 'cleanup fish'], related: ['除藻', '清残饵', '清洁生物'] },
  { terms: ['小缸', 'small tank'], related: ['小型鱼', '虾螺', '新手好养'] },
];

const ENCYCLOPEDIA_FILTERS = [
  '清洁工具',
  '新手好养',
  '除藻',
  '清残饵',
  '观赏鱼',
  '工具生物',
  '适合草缸',
  '小缸适合',
  '淡水',
  '海水',
  '草缸',
  '小缸',
  '需加热',
  '不需加热',
  '简单',
  '中等',
  '困难',
  '适合混养',
  '谨慎混养',
  '建议单养',
];

const COMMON_SPECIES_NAMES = ['孔雀鱼', '红莲灯', '斑马鱼', '樱花虾', '苹果螺'];
const COMMON_CARE_IDS = ['guide_water_deteriorate', 'guide_new_fish_acclimation', 'guide_fish_gasping'];

const buildSpeciesSuggestions = (
  input: SearchSuggestionInput,
  normalizedQuery: string,
): SearchSuggestion[] => {
  const ranked = normalizedQuery
    ? input.species
      .map((fish, index) => ({ fish, index, match: getSpeciesRank(fish as FishWithAliases, normalizedQuery) }))
      .filter((item): item is typeof item & { match: NonNullable<typeof item.match> } => Boolean(item.match))
      .sort((a, b) => a.match.rank - b.match.rank || a.index - b.index)
    : COMMON_SPECIES_NAMES
      .map((name, index) => {
        const fish = input.species.find(item => item.name === name);
        return fish ? { fish, index, match: { rank: 0, matchedBy: 'exact' as const } } : null;
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return ranked.map(({ fish, match }) => ({
    id: `species:${fish.id}`,
    kind: 'species' as const,
    label: getLocalizedSpeciesName(fish, input.locale),
    scientificName: fish.scientificName,
    category: getLocalizedCategory(fish as FishWithAliases, input.locale),
    image: getSpeciesVisualSources(fish).thumbnail,
    query: getLocalizedSpeciesName(fish, input.locale),
    matchedBy: match.matchedBy,
    ownedQuantity: input.ownedQuantityBySpeciesId?.get(fish.id),
    targetId: fish.id,
  }));
};

const buildCareSuggestions = (input: SearchSuggestionInput, normalizedQuery: string): SearchSuggestion[] => {
  const candidates = normalizedQuery
    ? input.careTopics
      .map((topic, index) => {
        const translation = careTranslations[topic.id];
        const names = [topic.title, translation?.title].map(normalize).filter(Boolean);
        const searchable = normalize([
          topic.category,
          topic.summary,
          ...topic.keywords,
          ...topic.symptoms,
          translation?.category,
          translation?.summary,
          ...(translation?.keywords || []),
          ...(translation?.symptoms || []),
        ].join(' '));
        const rank = names.some(name => name === normalizedQuery)
          ? 0
          : names.some(name => name.startsWith(normalizedQuery))
            ? 1
            : names.some(name => name.includes(normalizedQuery))
              ? 2
              : searchable.includes(normalizedQuery) ? 3 : 99;
        return { topic, index, rank };
      })
      .filter(item => item.rank < 99)
      .sort((a, b) => a.rank - b.rank || a.index - b.index)
    : COMMON_CARE_IDS
      .map((id, index) => {
        const topic = input.careTopics.find(item => item.id === id);
        return topic ? { topic, index, rank: 0 } : null;
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return candidates.slice(0, 5).map(({ topic, rank }) => {
    const translation = careTranslations[topic.id];
    const label = input.locale === 'en' && translation?.title ? translation.title : topic.title;
    return {
      id: `care:${topic.id}`,
      kind: 'care' as const,
      label,
      category: input.locale === 'en' && translation?.category ? translation.category : topic.category,
      image: getCareVisualSources(topic.imageUrl).thumbnail,
      query: label,
      matchedBy: rank <= 1 ? 'prefix' as const : 'keyword' as const,
      targetId: topic.id,
    };
  });
};

const buildRelatedSuggestions = (query: string): SearchSuggestion[] => {
  if (!query) return [];
  const relation = RELATED_QUERY_MAP.find(item => item.terms.some(term => normalize(term).includes(query) || query.includes(normalize(term))));
  if (!relation) return [];
  return relation.related.map(label => ({
    id: `related:${label}`,
    kind: 'related_query' as const,
    label,
    query: label,
    matchedBy: 'related' as const,
  }));
};

const buildFilterSuggestions = (query: string): SearchSuggestion[] => {
  if (!query) return [];
  return ENCYCLOPEDIA_FILTERS
    .filter(label => normalize(label).includes(query))
    .slice(0, 4)
    .map(label => ({
      id: `filter:${label}`,
      kind: 'filter' as const,
      label,
      query: label,
      matchedBy: 'keyword' as const,
    }));
};

export const getSearchSuggestions = (input: SearchSuggestionInput): SearchSuggestionResult => {
  const normalizedQuery = normalize(input.query);
  const allSpecies = input.scope === 'care'
    ? []
    : buildSpeciesSuggestions(input, normalizedQuery);
  const speciesLimit = input.speciesLimit ?? 8;
  const species = allSpecies.slice(0, speciesLimit);
  const care = input.scope === 'global' || input.scope === 'care'
    ? buildCareSuggestions(input, normalizedQuery)
    : [];
  const related = input.scope === 'global' || input.scope === 'care'
    ? buildRelatedSuggestions(normalizedQuery)
    : [];
  const filters = input.scope === 'encyclopedia'
    ? buildFilterSuggestions(normalizedQuery)
    : [];

  return {
    suggestions: input.scope === 'care'
      ? [...care, ...related]
      : [...species, ...care, ...related, ...filters],
    totalSpeciesMatches: allSpecies.length,
  };
};
