import { fishData } from '../../data/fishData';
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
export type SeoHealthIssueCode = 'missing_editorial_review' | 'index_strategy_unknown' | 'source_state_unknown';

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
  deleted_at?: string | null;
};

type RepoResult<T> = { data: T | null; error?: { message?: string } | null };
const locales: SeoRegistryLocale[] = ['zh-CN', 'en'];
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

export function deriveSeoHealth(entry: Omit<SeoPageRegistryEntry, 'health'>): SeoHealthSummary {
  const issues: SeoHealthIssueCode[] = [];
  if (entry.indexStrategy === 'unknown') issues.push('index_strategy_unknown');
  if (entry.editorialState === 'unknown') issues.push('source_state_unknown');
  if (['not_started', 'editing', 'ready_for_review'].includes(entry.editorialState)) issues.push('missing_editorial_review');
  return {
    severity: issues.includes('source_state_unknown') ? 'unknown' : issues.includes('missing_editorial_review') ? 'attention' : 'healthy',
    issues,
  };
}

const normalizeSpeciesState = (row?: SpeciesSeoRow): SeoRegistryEditorialState => {
  if (!row) return 'not_started';
  if (row.review_state === 'approved') return 'approved';
  if (row.review_state === 'ready_for_review') return 'ready_for_review';
  return 'editing';
};

export function buildSpeciesRegistryEntries(rows: SpeciesSeoRow[] | null): SeoPageRegistryEntry[] {
  const rowMap = new Map((rows || []).filter(row => !row.deleted_at).map(row => [`${row.catalog_key}:${row.locale}`, row]));
  return fishData.flatMap(item => locales.map(locale => {
    const row = rowMap.get(`${item.id}:${locale}`);
    return {
      pageKey: pageKey('species', item.id, locale),
      pageType: 'species' as const,
      locale,
      label: item.name,
      secondaryLabel: item.scientificName,
      sourceAuthority: 'product_catalog' as const,
      sourceKey: item.id,
      editorialAuthority: 'species_seo_repo' as const,
      editorialState: rows ? normalizeSpeciesState(row) : 'unknown',
      indexStrategy: row?.index_strategy || 'unknown',
      editorHref: `${speciesSeoAdminHref}${speciesSeoAdminHref.includes('?') ? '&' : '?'}species=${encodeURIComponent(item.id)}&locale=${encodeURIComponent(locale)}`,
      health: deriveSeoHealth({ pageKey: pageKey('species', item.id, locale), pageType: 'species', locale, label: item.name, secondaryLabel: item.scientificName, sourceAuthority: 'product_catalog', sourceKey: item.id, editorialAuthority: 'species_seo_repo', editorialState: rows ? normalizeSpeciesState(row) : 'unknown', indexStrategy: row?.index_strategy || 'unknown', editorHref: '' }),
    };
  }));
}

export function buildCareRegistryEntries(items: AdminCareArticleRecord[]): SeoPageRegistryEntry[] {
  return items.flatMap(item => locales.map(locale => ({
    pageKey: pageKey('care', item.catalogKey, locale),
    pageType: 'care' as const,
    locale,
    label: item.title,
    secondaryLabel: item.catalogKey,
    sourceAuthority: 'published_care' as const,
    sourceKey: item.catalogKey,
    editorialAuthority: 'care_seo_editorial' as const,
    editorialState: item.status === 'published' ? 'unknown' : 'source_not_published',
    indexStrategy: 'noindex' as const,
    editorHref: `/admin/product-content?type=care&id=${encodeURIComponent(item.id)}&seo=1&locale=${encodeURIComponent(locale)}`,
    health: deriveSeoHealth({ pageKey: pageKey('care', item.catalogKey, locale), pageType: 'care', locale, label: item.title, secondaryLabel: item.catalogKey, sourceAuthority: 'published_care', sourceKey: item.catalogKey, editorialAuthority: 'care_seo_editorial', editorialState: item.status === 'published' ? 'unknown' : 'source_not_published', indexStrategy: 'noindex', editorHref: '' }),
  })));
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
    const rows = await repoSelect<SpeciesSeoRow>('species_seo');
    return {
      entries: buildSpeciesRegistryEntries(rows),
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
    return {
      entries: buildCareRegistryEntries(items),
      source: {
        key: 'care', label: 'Published Care / Care SEO Editorial', availability: 'ready',
        detail: 'Care 页面来自 Business Admin；SEO 编辑仍回到 Care SEO Editorial authority。',
      },
    };
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
