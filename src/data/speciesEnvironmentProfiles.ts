import type { SpeciesEnvironmentProfile } from '../modules/environment/environment.types';

export const speciesEnvironmentProfiles: SpeciesEnvironmentProfile[] = [
  {
    speciesId: 'sp_0045',
    environment: {
      waterType: 'freshwater',
      oxygenDemand: 'high',
      flowPreference: 'high',
    },
    habitat: {
      substratePreference: ['rock', 'gravel'],
    },
    evidence: {
      confidence: 'medium',
      reviewStatus: 'reviewed',
      sourceRefs: [
        'sewellia-lineolata-fishbase-40433',
        'sewellia-lineolata-practical-fishkeeping',
        'sewellia-lineolata-fishkeeper',
      ],
    },
  },
];
