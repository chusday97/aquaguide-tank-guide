export const speciesIdAliases: Record<string, string> = {
  sp_0027: 'sp_0001',
  sp_0028: 'sp_0002',
  sp_0029: 'sp_0003',
  sp_0032: 'sp_0004',
  sp_0033: 'sp_0005',
  sp_0035: 'sp_0006',
  sp_0130: 'sp_0038',
  sp_0136: 'sp_0060',
  sp_0137: 'sp_0061',
  sp_0298: 'sp_0071',
  sp_0299: 'sp_0072',
  sp_0300: 'sp_0073',
  sp_0303: 'sp_0079',
  sp_0305: 'sp_0081',
  sp_0306: 'sp_0082',
  sp_0309: 'sp_0083',
  sp_0311: 'sp_0086',
  sp_0313: 'sp_0087',
  sp_0314: 'sp_0091',
  sp_0310: 'sp_0094',
  sp_0316: 'sp_0097',
  sp_0308: 'sp_0101',
  sp_0317: 'sp_0102',
  sp_0338: 'sp_0214',
  sp_0454: 'sp_0427',
  sp_0455: 'sp_0428',
  sp_0456: 'sp_0429',
  sp_0457: 'sp_0430',
};

export const resolveCanonicalSpeciesId = (speciesId: string) => {
  let current = speciesId;
  const visited = new Set<string>();
  while (speciesIdAliases[current] && !visited.has(current)) {
    visited.add(current);
    current = speciesIdAliases[current];
  }
  return current;
};

export const normalizeSpeciesIds = (ids: Iterable<string>) => (
  Array.from(new Set(Array.from(ids).filter(Boolean).map(resolveCanonicalSpeciesId)))
);
