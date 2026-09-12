import { isEnglishLocale } from './localization.js';

export const INDEX_STRATEGIES = [
  { value: 'noindex', label: 'Noindex / 暂不收录' },
  { value: 'index', label: 'Independent Index / 独立收录' },
  { value: 'canonical_to_sibling', label: 'Canonical to sibling / 指向同组主页面' },
];

export function slugifyScientificName(value) {
  const slug = String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'species';
}
export function speciesPublicPath(member, group, locale = 'en') {
  const prefix = isEnglishLocale(locale) ? '' : '/zh';
  const baseSlug = slugifyScientificName(group?.base_scientific_name || member?.scientific_name);
  const catalogSlug = String(member?.catalog_key || member?.id || 'unknown').replaceAll('_', '-');
  return `${prefix}/species/${baseSlug}/${catalogSlug}.html`;
}

export function resolveCanonicalMember(member, group, strategy, canonicalCatalogKey) {
  if (strategy !== 'canonical_to_sibling') return member;
  const target = group?.members?.find((item) => item.catalog_key === canonicalCatalogKey);
  return target || null;
}

export function buildSpeciesSeoRouteMeta({ member, group, locale = 'en', indexStrategy = 'noindex', canonicalCatalogKey = '' }) {
  const selfPath = speciesPublicPath(member, group, locale);
  const canonicalMember = resolveCanonicalMember(member, group, indexStrategy, canonicalCatalogKey);
  const canonicalPath = canonicalMember ? speciesPublicPath(canonicalMember, group, locale) : selfPath;
  const alternateMember = canonicalMember || member;
  const englishPath = speciesPublicPath(alternateMember, group, 'en');
  const chinesePath = speciesPublicPath(alternateMember, group, 'zh-CN');
  const canonicalMissing = indexStrategy === 'canonical_to_sibling' && !canonicalMember;
  return {
    selfPath,
    canonicalPath,
    robots: indexStrategy === 'noindex' || canonicalMissing ? 'noindex,follow' : 'index,follow',
    alternates: {
      en: englishPath,
      'zh-CN': chinesePath,
      'x-default': englishPath,
    },
    publishReady: !canonicalMissing,
    warning: canonicalMissing ? 'Canonical strategy selected but no valid same-group target is selected.' : '',
  };
}
