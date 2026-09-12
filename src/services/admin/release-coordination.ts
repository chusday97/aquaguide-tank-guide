import type { ReleaseEventDto } from '../../../packages/contracts/src';

const catalogKeyPattern = /^sp_\d+$/i;

const stringArray = (value: unknown) => Array.isArray(value)
  ? value.filter((item): item is string => typeof item === 'string')
  : [];

const metadataString = (value: unknown) => typeof value === 'string' && value.trim() ? value.trim() : null;

const compatibilityRevisionId = (event: ReleaseEventDto) => {
  const sourceRef = event.sourceRef || '';
  const localPrefix = event.domain === 'compatibility_pair' ? 'local:compat-pair:' : 'local:compat-profile:';
  if (sourceRef.startsWith(localPrefix)) return sourceRef.slice(localPrefix.length).split(':')[0] || null;
  const tablePrefix = event.domain === 'compatibility_pair'
    ? 'species_pair_compatibility_rule_revisions:'
    : 'species_compatibility_profile_revisions:';
  if (sourceRef.startsWith(tablePrefix)) return sourceRef.slice(tablePrefix.length) || null;
  const eventPrefix = event.domain === 'compatibility_pair' ? 'compat-pair:' : 'compat-profile:';
  if (event.id.startsWith(eventPrefix)) return event.id.slice(eventPrefix.length) || null;
  return null;
};

export const releaseEventAuthorityHref = (event: ReleaseEventDto) => {
  if (event.authority === 'product_care') {
    const resourceId = metadataString(event.metadata?.resourceId);
    if (!resourceId) return '/admin/product-content';
    const type = event.domain === 'care' ? 'care' : 'species';
    return `/admin/product-content?type=${type}&id=${encodeURIComponent(resourceId)}`;
  }
  if (event.authority === 'compatibility') {
    const revisionId = compatibilityRevisionId(event);
    if (!revisionId) return '/admin/compatibility';
    const kind = event.domain === 'compatibility_pair' ? 'pair' : 'profile';
    return `/admin/compatibility?kind=${kind}&revision=${encodeURIComponent(revisionId)}`;
  }
  if (event.domain === 'seo_page' && event.resourceKey) {
    const locale = event.locale === 'en' ? 'en' : 'zh-CN';
    return `/admin/seo/?species=${encodeURIComponent(event.resourceKey)}&locale=${locale}`;
  }
  return '/admin/seo/';
};

export const releaseEventCatalogKeys = (event: ReleaseEventDto) => {
  const keys = new Set<string>();
  if (event.resourceKey) {
    if (catalogKeyPattern.test(event.resourceKey)) keys.add(event.resourceKey);
    for (const part of event.resourceKey.split('__')) {
      if (catalogKeyPattern.test(part)) keys.add(part);
    }
  }
  for (const key of stringArray(event.metadata?.catalogKeys)) {
    if (catalogKeyPattern.test(key)) keys.add(key);
  }
  return keys;
};
export const getRelatedReleaseEvents = (
  events: ReleaseEventDto[],
  selected: ReleaseEventDto,
) => {
  const selectedKeys = releaseEventCatalogKeys(selected);
  if (!selectedKeys.size) return [];
  return events
    .filter(event => event.id !== selected.id && event.authority !== selected.authority)
    .filter(event => {
      const keys = releaseEventCatalogKeys(event);
      return Array.from(keys).some(key => selectedKeys.has(key));
    })
    .sort((left, right) => Date.parse(right.occurredAt) - Date.parse(left.occurredAt));
};
