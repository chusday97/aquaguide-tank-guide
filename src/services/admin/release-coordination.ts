import type { ReleaseEventDto } from '../../../packages/contracts/src';

const catalogKeyPattern = /^sp_\d+$/i;

const stringArray = (value: unknown) => Array.isArray(value)
  ? value.filter((item): item is string => typeof item === 'string')
  : [];

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
