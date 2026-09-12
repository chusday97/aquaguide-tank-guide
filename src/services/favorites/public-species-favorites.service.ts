export const PUBLIC_SPECIES_FAVORITES_CHANGED_EVENT = 'aquaguide:favorites-changed';
export const PUBLIC_SPECIES_FAVORITES_STORAGE_KEY = 'wishlistFishIds';

const readJson = (key: string) => {
  if (typeof window === 'undefined') return [] as unknown;
  try {
    return JSON.parse(window.localStorage.getItem(key) || '') as unknown;
  } catch {
    return [] as unknown;
  }
};

const normalizeSpeciesIds = (value: unknown) => (
  Array.isArray(value)
    ? value.filter((id): id is string => typeof id === 'string' && id.length > 0)
    : []
);

const emitFavoritesChanged = () => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(PUBLIC_SPECIES_FAVORITES_CHANGED_EVENT));
};

export const getPublicSpeciesFavoriteIds = () => {
  if (typeof window === 'undefined') return [] as string[];
  return normalizeSpeciesIds(readJson(PUBLIC_SPECIES_FAVORITES_STORAGE_KEY));
};

export const setPublicSpeciesFavoriteIds = (ids: Iterable<string>) => {
  const normalized = Array.from(new Set(Array.from(ids).filter(Boolean)));
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(PUBLIC_SPECIES_FAVORITES_STORAGE_KEY, JSON.stringify(normalized));
    } catch (error) {
      console.warn('AquaGuide public species favorites save failed', error);
      throw error;
    }
  }
  emitFavoritesChanged();
  return normalized;
};

export const togglePublicSpeciesFavorite = (speciesId: string) => {
  const next = new Set(getPublicSpeciesFavoriteIds());
  const isFavorite = !next.has(speciesId);
  if (isFavorite) next.add(speciesId);
  else next.delete(speciesId);
  setPublicSpeciesFavoriteIds(next);
  return isFavorite;
};

export const subscribeToPublicSpeciesFavorites = (listener: () => void) => {
  if (typeof window === 'undefined') return () => undefined;
  const handleStorage = (event: StorageEvent) => {
    if (event.key === PUBLIC_SPECIES_FAVORITES_STORAGE_KEY) listener();
  };
  window.addEventListener(PUBLIC_SPECIES_FAVORITES_CHANGED_EVENT, listener);
  window.addEventListener('storage', handleStorage);
  return () => {
    window.removeEventListener(PUBLIC_SPECIES_FAVORITES_CHANGED_EVENT, listener);
    window.removeEventListener('storage', handleStorage);
  };
};
