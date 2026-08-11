const withSource = (path: string, source?: string) => {
  if (!source) return path;
  const hashIndex = path.indexOf('#');
  const base = hashIndex >= 0 ? path.slice(0, hashIndex) : path;
  const hash = hashIndex >= 0 ? path.slice(hashIndex) : '';
  const separator = base.includes('?') ? '&' : '?';
  return `${base}${separator}source=${encodeURIComponent(source)}${hash}`;
};

const encyclopediaBrowseWith = (options: { source?: string; difficulty?: string; speciesId?: string } = {}) => {
  const query = new URLSearchParams({ mode: 'browse' });
  if (options.difficulty) query.set('difficulty', options.difficulty);
  if (options.speciesId) query.set('species', options.speciesId);
  if (options.source) query.set('source', options.source);
  return `/encyclopedia?${query.toString()}`;
};

const encyclopediaCompatibilityWith = (options: { source?: string; speciesId?: string } = {}) => {
  const query = new URLSearchParams({ mode: 'compatibility' });
  if (options.speciesId) query.set('species', options.speciesId);
  if (options.source) query.set('source', options.source);
  return `/encyclopedia?${query.toString()}`;
};

export const taskRoutes = {
  aquarium: {
    home: '/aquarium',
    create: (source?: string) => source
      ? `/aquarium?action=create&source=${encodeURIComponent(source)}`
      : '/aquarium?action=create',
    setup: (source?: string) => source
      ? `/aquarium?action=setup&source=${encodeURIComponent(source)}`
      : '/aquarium?action=setup',
    addSpecies: (speciesId?: string, source?: string) => withSource(
      speciesId
        ? `/aquarium?action=add-species&species=${encodeURIComponent(speciesId)}`
        : '/aquarium?action=add-species',
      source,
    ),
    recordExisting: (speciesId?: string, source?: string) => withSource(
      speciesId
        ? `/aquarium?action=record-existing&species=${encodeURIComponent(speciesId)}`
        : '/aquarium?action=record-existing',
      source,
    ),
    planSpecies: (speciesId?: string, source?: string) => withSource(
      speciesId
        ? `/aquarium?action=plan-species&species=${encodeURIComponent(speciesId)}`
        : '/aquarium?action=plan-species',
      source,
    ),
    dailyCheck: '/aquarium?action=daily-check',
    dailyCheckFrom: (source?: string) => withSource('/aquarium?action=daily-check', source),
    livestock: '/aquarium?action=livestock',
    livestockFrom: (source?: string) => withSource('/aquarium?action=livestock', source),
    waterChange: '/aquarium?action=water-change',
    waterChangeFrom: (source?: string) => withSource('/aquarium?action=water-change', source),
    timeline: (aquariumId: string, source?: string) => withSource(`/aquarium?action=timeline&tank=${encodeURIComponent(aquariumId)}`, source),
    settings: (panel: 'size' | 'parameters' | 'equipment', source?: string) => withSource(`/aquarium#settings-${panel}`, source),
  },
  encyclopedia: {
    home: '/encyclopedia',
    compatibility: '/encyclopedia?mode=compatibility',
    compatibilityWith: (source?: string) => encyclopediaCompatibilityWith({ source }),
    compatibilitySpecies: (speciesId: string, source?: string) => encyclopediaCompatibilityWith({ speciesId, source }),
    browse: '/encyclopedia?mode=browse',
    browseWith: (options: { source?: string; difficulty?: string } = {}) => encyclopediaBrowseWith(options),
    species: (speciesId: string, source?: string) => encyclopediaBrowseWith({ speciesId, source }),
  },
  care: {
    home: '/care',
    recommendations: '/care#care-recommendations',
    search: '/care#care-search',
    results: '/care#care-results',
    favorites: '/care#care-favorites',
    topic: (topicId: string, source?: string) => withSource(`/care?topic=${encodeURIComponent(topicId)}`, source),
  },
  collection: {
    home: '/collection',
    wishlist: '/collection/wishlist',
    care: '/collection/care',
    memorial: '/collection/memorial',
    memorialDetail: (recordId: string) => `/collection/memorial/${encodeURIComponent(recordId)}`,
  },
  identify: {
    home: '/identify',
  },
  search: {
    home: '/search',
    query: (value: string, source?: string) => withSource(`/search?q=${encodeURIComponent(value)}`, source),
  },
} as const;

export type AquariumTaskAction =
  | 'add-species'
  | 'record-existing'
  | 'plan-species'
  | 'daily-check'
  | 'livestock'
  | 'water-change'
  | 'create'
  | 'setup';

export const isAquariumTaskAction = (value: string | null): value is AquariumTaskAction => (
  value === 'add-species'
  || value === 'record-existing'
  || value === 'plan-species'
  || value === 'daily-check'
  || value === 'livestock'
  || value === 'water-change'
  || value === 'create'
  || value === 'setup'
);
