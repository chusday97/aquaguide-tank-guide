import { fishData } from '../../data/fishData';
import { speciesGroups } from '../../../apps/admin-content/src/speciesGroups.js';
import { resolveEffectiveSeo } from '../../../apps/admin-content/src/seoInheritance.js';
import type { CareSeoHealthIndexEntryDto } from '../../../packages/contracts/src/index';
import { contentAdminService, type AdminCareArticleRecord } from './content-admin.service';

export type SeoPageType = 'species' | 'care' | 'compatibility' | 'product_feature' | 'guide' | 'category';
export type SeoRegistryLocale = 'zh-CN' | 'en';
export type SeoRegistryAvailability = 'ready' | 'auth_required' | 'unavailable';
export type SeoRegistryEditorialState =
  | 'not_started'
  | 'editing'
  | 'ready_for_review'
  | 'approved'
  | 'source_not_published'
  | 'unknown';

export type SeoHealthSeverity = 'healthy' | 'attention' | 'blocked' | 'unknown';
export type SeoHealthIssueCode =
  | 'missing_meta_title'
  | 'missing_meta_description'
  | 'missing_h1'
  | 'missing_bilingual_pair'
  | 'canonical_conflict'
  | 'missing_editorial_review'
  | 'source_not_published'
  | 'source_not_snapshot'
  | 'source_drift'
  | 'index_strategy_unknown'
  | 'source_state_unknown';

export type SeoHealthSummary = {
  severity: SeoHealthSeverity;
  issues: SeoHealthIssueCode[];
};

export type SeoPageRegistryEntry = {
  pageKey: string;
  pageType: SeoPageType;
  locale: SeoRegistryLocale;
  label: string;
  secondaryLabel?: string;
  sourceAuthority: 'product_catalog' | 'published_care';
  sourceKey: string;
  editorialAuthority: 'species_seo_repo' | 'care_seo_editorial';
  editorialState: SeoRegistryEditorialState;
  indexStrategy: 'index' | 'noindex' | 'canonical_to_sibling' | 'unknown';
  editorHref: string;
  health: SeoHealthSummary;
};
export type SeoPageRegistrySource = {
  key: 'species' | 'care';
  label: string;
  availability: SeoRegistryAvailability;
  detail: string;
};

export type SeoPageRegistrySnapshot = {
  entries: SeoPageRegistryEntry[];
  sources: SeoPageRegistrySource[];
};

type SpeciesSeoRow = {
  catalog_key?: string;
  locale?: SeoRegistryLocale;
  review_state?: 'editing' | 'ready_for_review' | 'approved';
  index_strategy?: 'index' | 'noindex' | 'canonical_to_sibling';
  localized_name?: string;
  seo_title?: string;
  meta_title?: string;
  meta_description?: string;
  h1?: string;
  intro?: string;
  canonical_catalog_key?: string;
  deleted_at?: string | null;
};

type SpeciesGroupSeoRow = {
  group_key?: string;
  locale?: SeoRegistryLocale;
  review_state?: 'editing' | 'ready_for_review' | 'approved';
  seo_title_template?: string;
  meta_description_template?: string;
  h1_template?: string;
  shared_intro?: string;
  deleted_at?: string | null;
};

type RepoResult<T> = { data: T | null; error?: { message?: string } | null };
const locales: SeoRegistryLocale[] = ['zh-CN', 'en'];
const productCatalogKeys = new Set(fishData.map(item => item.id));
const speciesGroupByMemberId = new Map<string, any>();
for (const group of speciesGroups as any[]) {
  for (const member of group.members || []) speciesGroupByMemberId.set(member.id, group);
}
const otherLocale = (locale: SeoRegistryLocale): SeoRegistryLocale => locale === 'en' ? 'zh-CN' : 'en';
const nonBlank = (value: unknown) => typeof value === 'string' && value.trim().length > 0;

export const speciesSeoAdminHref = import.meta.env?.VITE_SEO_ADMIN_URL
  || (import.meta.env?.DEV ? 'http://127.0.0.1:3010/' : '/admin/seo/');

const repoRequest = async <T>(path: string, options: RequestInit = {}) => {
  const response = await fetch(path, {
    credentials: 'include', ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const payload = await response.json().catch(() => null) as T | null;
  return { response, payload };
};

const repoSelect = async <T>(table: string, limit = 1200): Promise<T[]> => {
  const { response, payload } = await repoRequest<RepoResult<T[]>>('/api/admin-content/query', {
    method: 'POST',
    body: JSON.stringify({
      action: 'select', table, filters: [],
      order: { column: 'updated_at', ascending: false }, limit,
    }),
  });
  if (!response.ok || payload?.error) {
    throw new Error(payload?.error?.message || `Repo ${table} read failed.`);
  }
  return payload?.data || [];
};

const pageKey = (type: 'species' | 'care', sourceKey: string, locale: SeoRegistryLocale) => `${type}:${sourceKey}:${locale}`;

type SeoHealthInput = Omit<SeoPageRegistryEntry, 'health'> & Partial<SpeciesSeoRow> & {
  editorialContentKnown?: boolean;
  bilingualComplete?: boolean;
  canonicalConflict?: boolean;
  sourceNotSnapshot?: boolean;
  sourceDrift?: boolean;
};

export function deriveSeoHealth(entry: SeoHealthInput): SeoHealthSummary {
  const issues: SeoHealthIssueCode[] = [];
  if (entry.indexStrategy === 'unknown') issues.push('index_strategy_unknown');
  if (entry.editorialState === 'unknown') issues.push('source_state_unknown');
  if (entry.editorialState === 'source_not_published') issues.push('source_not_published');
  if (entry.sourceNotSnapshot) issues.push('source_not_snapshot');
  if (entry.sourceDrift) issues.push('source_drift');
  if (entry.editorialContentKnown) {
    if (!nonBlank(entry.meta_title)) issues.push('missing_meta_title');
    if (!nonBlank(entry.meta_description)) issues.push('missing_meta_description');
    if (!nonBlank(entry.h1)) issues.push('missing_h1');
  }
  if (entry.bilingualComplete === false) issues.push('missing_bilingual_pair');
  if (entry.canonicalConflict) issues.push('canonical_conflict');
  if (['not_started', 'editing', 'ready_for_review'].includes(entry.editorialState)) issues.push('missing_editorial_review');
  const hardBlockers: SeoHealthIssueCode[] = [
    'missing_meta_title', 'missing_meta_description', 'missing_h1', 'canonical_conflict', 'source_not_published', 'source_not_snapshot', 'source_drift',
  ];
  if (entry.indexStrategy === 'index' && issues.includes('missing_bilingual_pair')) hardBlockers.push('missing_bilingual_pair');
  return {
    severity: issues.includes('source_state_unknown')
      ? 'unknown'
      : issues.some(issue => hardBlockers.includes(issue))
        ? 'blocked'
        : issues.length ? 'attention' : 'healthy',
    issues,
  };
}

const normalizeSpeciesState = (row?: SpeciesSeoRow, groupRow?: SpeciesGroupSeoRow): SeoRegistryEditorialState => {
  if (!row && !groupRow) return 'not_started';
  if (!row || !groupRow) return 'editing';
  if (row.review_state === 'approved' && groupRow.review_state === 'approved') return 'approved';
  const states = [row.review_state, groupRow.review_state];
  if (states.every(state => state === 'approved' || state === 'ready_for_review') && states.includes('ready_for_review')) return 'ready_for_review';
  return 'editing';
};

const hasCanonicalConflict = (
  row: SpeciesSeoRow | undefined,
  sourceKey: string,
  locale: SeoRegistryLocale,
  rowMap: Map<string, SpeciesSeoRow>,
) => {
  if (!row) return false;
  const target = String(row.canonical_catalog_key || '').trim();
  if (row.index_strategy !== 'canonical_to_sibling') return Boolean(target);
  if (!target || target === sourceKey || !productCatalogKeys.has(target)) return true;
  const targetRow = rowMap.get(`${target}:${locale}`);
  return !targetRow || targetRow.index_strategy !== 'index';
};

export function buildSpeciesRegistryEntries(rows: SpeciesSeoRow[] | null, groupRows: SpeciesGroupSeoRow[] | null = rows ? [] : null): SeoPageRegistryEntry[] {
  const rowMap = new Map<string, SpeciesSeoRow>((rows || []).filter(row => !row.deleted_at && row.catalog_key && row.locale).map(row => [`${row.catalog_key}:${row.locale}`, row]));
  const groupRowMap = new Map<string, SpeciesGroupSeoRow>((groupRows || []).filter(row => !row.deleted_at && row.group_key && row.locale).map(row => [`${row.group_key}:${row.locale}`, row]));
  return fishData.flatMap(item => locales.map(locale => {
    const row = rowMap.get(`${item.id}:${locale}`);
    const group = speciesGroupByMemberId.get(item.id);
    const member = group?.members?.find((candidate: any) => candidate.id === item.id);
    const groupRow = group ? groupRowMap.get(`${group.group_key}:${locale}`) : undefined;
    const counterpartLocale = otherLocale(locale);
    const counterpartRow = rowMap.get(`${item.id}:${counterpartLocale}`);
    const counterpartGroupRow = group ? groupRowMap.get(`${group.group_key}:${counterpartLocale}`) : undefined;
    const editorialState = rows && groupRows ? normalizeSpeciesState(row, groupRow) : 'unknown';
    const counterpartState = rows && groupRows ? normalizeSpeciesState(counterpartRow, counterpartGroupRow) : 'unknown';
    const anyLocaleStarted = Boolean(row || groupRow || counterpartRow || counterpartGroupRow);
    let bilingualComplete: boolean | undefined;
    if (anyLocaleStarted) {
      bilingualComplete = Boolean(row && groupRow && counterpartRow && counterpartGroupRow);
      if (row?.index_strategy === 'index' && bilingualComplete) bilingualComplete = counterpartState === 'approved';
    }
    const effective = row || groupRow
      ? resolveEffectiveSeo({ member: member || item, group, groupRow, variantRow: row, locale }).effective
      : null;
    const indexStrategy = row?.index_strategy || 'unknown';
    const editorHref = `${speciesSeoAdminHref}${speciesSeoAdminHref.includes('?') ? '&' : '?'}species=${encodeURIComponent(item.id)}&locale=${encodeURIComponent(locale)}`;
    const health = deriveSeoHealth({
      pageKey: pageKey('species', item.id, locale), pageType: 'species', locale, label: item.name, secondaryLabel: item.scientificName,
      sourceAuthority: 'product_catalog', sourceKey: item.id, editorialAuthority: 'species_seo_repo', editorialState,
      indexStrategy, editorHref, editorialContentKnown: Boolean(row && groupRow),
      meta_title: effective?.seoTitle, meta_description: effective?.metaDescription, h1: effective?.h1,
      bilingualComplete, canonicalConflict: hasCanonicalConflict(row, item.id, locale, rowMap),
    });
    return {
      pageKey: pageKey('species', item.id, locale),
      pageType: 'species' as const,
      locale,
      label: item.name,
      secondaryLabel: item.scientificName,
      sourceAuthority: 'product_catalog' as const,
      sourceKey: item.id,
      editorialAuthority: 'species_seo_repo' as const,
      editorialState,
      indexStrategy,
      editorHref,
      health,
    };
  }));
}

const normalizeCareState = (healthRow: CareSeoHealthIndexEntryDto | undefined, healthKnown: boolean): SeoRegistryEditorialState => {
  if (!healthKnown) return 'unknown';
  if (!healthRow) return 'source_not_published';
  if (!healthRow.persistenceAvailable) return 'unknown';
  if (!healthRow.editorial) return 'not_started';
  if (healthRow.editorial.sourceDrift) return 'editing';
  if (healthRow.editorial.reviewState === 'approved') return 'approved';
  if (healthRow.editorial.reviewState === 'ready_for_review') return 'ready_for_review';
  return 'editing';
};

export function buildCareRegistryEntries(items: AdminCareArticleRecord[], healthIndex: CareSeoHealthIndexEntryDto[] | null = null): SeoPageRegistryEntry[] {
  const healthKnown = healthIndex !== null;
  const healthMap = new Map((healthIndex || []).map(row => [`${row.sourceCareId}:${row.locale}`, row]));
  return items.flatMap(item => locales.map(locale => {
    const healthRow = healthMap.get(`${item.id}:${locale}`);
    const counterpart = healthMap.get(`${item.id}:${otherLocale(locale)}`);
    const editorial = healthRow?.editorial || null;
    const counterpartEditorial = counterpart?.editorial || null;
    const anyEditorialStarted = Boolean(editorial || counterpartEditorial);
    const editorialState = normalizeCareState(healthRow, healthKnown);
    let bilingualComplete: boolean | undefined;
    if (healthKnown && healthRow && healthRow.persistenceAvailable && counterpart?.persistenceAvailable && anyEditorialStarted) {
      bilingualComplete = Boolean(
        editorial
        && counterpartEditorial
        && !editorial.sourceDrift
        && !counterpartEditorial.sourceDrift
        && counterpart.sourceCareVersion === healthRow.sourceCareVersion,
      );
      if (editorial?.indexStrategy === 'index' && bilingualComplete) bilingualComplete = counterpartEditorial?.reviewState === 'approved';
    }
    const indexStrategy = editorial?.indexStrategy
      || (editorialState === 'source_not_published' ? 'noindex' : 'unknown');
    const editorHref = `/admin/product-content?type=care&id=${encodeURIComponent(item.id)}&seo=1&locale=${encodeURIComponent(locale)}`;
    const health = deriveSeoHealth({
      pageKey: pageKey('care', item.catalogKey, locale), pageType: 'care', locale, label: item.title, secondaryLabel: item.catalogKey,
      sourceAuthority: 'published_care', sourceKey: item.catalogKey, editorialAuthority: 'care_seo_editorial', editorialState,
      indexStrategy, editorHref, editorialContentKnown: Boolean(editorial && !editorial.sourceDrift),
      meta_title: editorial?.seoTitle, meta_description: editorial?.metaDescription, h1: editorial?.h1,
      bilingualComplete, sourceNotSnapshot: healthRow?.sourceAuthority === 'legacy-published', sourceDrift: Boolean(editorial?.sourceDrift),
    });
    return {
      pageKey: pageKey('care', item.catalogKey, locale),
      pageType: 'care' as const,
      locale,
      label: item.title,
      secondaryLabel: item.catalogKey,
      sourceAuthority: 'published_care' as const,
      sourceKey: item.catalogKey,
      editorialAuthority: 'care_seo_editorial' as const,
      editorialState,
      indexStrategy,
      editorHref,
      health,
    };
  }));
}

export function summarizeSeoRegistry(entries: SeoPageRegistryEntry[]) {
  const byType = entries.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.pageType] = (acc[entry.pageType] || 0) + 1;
    return acc;
  }, {});
  const byState = entries.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.editorialState] = (acc[entry.editorialState] || 0) + 1;
    return acc;
  }, {});
  const healthCounts = entries.reduce<Record<SeoHealthSeverity, number>>((acc, entry) => {
    acc[entry.health.severity] = (acc[entry.health.severity] || 0) + 1;
    return acc;
  }, { healthy: 0, attention: 0, blocked: 0, unknown: 0 });
  const priorityQueue = entries
    .filter(entry => entry.health.severity !== 'healthy')
    .reduce<Record<SeoHealthSeverity, number>>((acc, entry) => {
      acc[entry.health.severity] = (acc[entry.health.severity] || 0) + 1;
      return acc;
    }, { healthy: 0, attention: 0, blocked: 0, unknown: 0 });
  return {
    total: entries.length,
    byType,
    byState,
    healthCounts,
    priorityQueue,
    needsAttention: entries.filter(entry => ['not_started', 'editing', 'ready_for_review', 'source_not_published'].includes(entry.editorialState)).length,
  };
}

async function loadSpeciesSource(): Promise<{ entries: SeoPageRegistryEntry[]; source: SeoPageRegistrySource }> {
  const session = await repoRequest<{ session?: { user?: { email?: string } } | null }>('/api/admin-content/session', { method: 'GET' });
  if (!session.response.ok || !session.payload?.session) {
    return {
      entries: buildSpeciesRegistryEntries(null),
      source: {
        key: 'species', label: 'Species SEO Repo Admin', availability: 'auth_required',
        detail: '页面库存可读取；编辑/审核状态需要独立登录 SEO Repo Admin。',
      },
    };
  }
  try {
    const [rows, groupRows] = await Promise.all([
      repoSelect<SpeciesSeoRow>('species_seo'),
      repoSelect<SpeciesGroupSeoRow>('species_seo_groups'),
    ]);
    return {
      entries: buildSpeciesRegistryEntries(rows, groupRows),
      source: {
        key: 'species', label: 'Species SEO Repo Admin', availability: 'ready',
        detail: 'Species 页面库存与当前 Draft/Review/Index 状态可读取。',
      },
    };
  } catch (error) {
    return {
      entries: buildSpeciesRegistryEntries(null),
      source: {
        key: 'species', label: 'Species SEO Repo Admin', availability: 'unavailable',
        detail: error instanceof Error ? error.message : 'Species SEO 状态暂不可读取。',
      },
    };
  }
}

async function loadCareSource(): Promise<{ entries: SeoPageRegistryEntry[]; source: SeoPageRegistrySource }> {
  try {
    const items = await contentAdminService.listCareArticles();
    try {
      const healthIndex = await contentAdminService.getCareSeoHealthIndex();
      return {
        entries: buildCareRegistryEntries(items, healthIndex),
        source: {
          key: 'care', label: 'Published Care / Care SEO Editorial', availability: 'ready',
          detail: 'Published snapshot 与 Care SEO Editorial 健康状态可批量读取；编辑仍回到原 authority。',
        },
      };
    } catch (error) {
      return {
        entries: buildCareRegistryEntries(items, null),
        source: {
          key: 'care', label: 'Published Care / Care SEO Editorial', availability: 'unavailable',
          detail: error instanceof Error ? error.message : 'Care SEO 健康状态暂不可读取；页面库存仍保留。',
        },
      };
    }
  } catch (error) {
    return {
      entries: [],
      source: {
        key: 'care', label: 'Published Care / Care SEO Editorial', availability: 'unavailable',
        detail: error instanceof Error ? error.message : 'Care SEO 页面库存暂不可读取。',
      },
    };
  }
}

export const seoPageRegistryService = {
  async load(): Promise<SeoPageRegistrySnapshot> {
    const [species, care] = await Promise.all([loadSpeciesSource(), loadCareSource()]);
    return {
      entries: [...species.entries, ...care.entries],
      sources: [species.source, care.source],
    };
  },
};
