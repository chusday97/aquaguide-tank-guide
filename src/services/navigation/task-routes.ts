export const taskRoutes = {
  aquarium: {
    create: (source?: string) => source
      ? `/aquarium?action=create&source=${encodeURIComponent(source)}`
      : '/aquarium?action=create',
    setup: (source?: string) => source
      ? `/aquarium?action=setup&source=${encodeURIComponent(source)}`
      : '/aquarium?action=setup',
    addSpecies: (speciesId?: string) => speciesId
      ? `/aquarium?action=add-species&species=${encodeURIComponent(speciesId)}`
      : '/aquarium?action=add-species',
    recordExisting: (speciesId?: string) => speciesId
      ? `/aquarium?action=record-existing&species=${encodeURIComponent(speciesId)}`
      : '/aquarium?action=record-existing',
    planSpecies: (speciesId?: string) => speciesId
      ? `/aquarium?action=plan-species&species=${encodeURIComponent(speciesId)}`
      : '/aquarium?action=plan-species',
    dailyCheck: '/aquarium?action=daily-check',
    livestock: '/aquarium?action=livestock',
    waterChange: '/aquarium?action=water-change',
    timeline: (aquariumId: string) => `/aquarium?action=timeline&tank=${encodeURIComponent(aquariumId)}`,
    settings: (panel: 'size' | 'parameters' | 'equipment') => `/aquarium#settings-${panel}`,
  },
  encyclopedia: {
    compatibility: '/encyclopedia?mode=compatibility',
    browse: '/encyclopedia?mode=browse',
  },
  care: {
    recommendations: '/care#care-recommendations',
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
