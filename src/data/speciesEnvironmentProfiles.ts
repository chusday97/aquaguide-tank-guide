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
      claimRefs: {
        'environment.waterType': ['sewellia-lineolata-fishbase-40433'],
        'environment.oxygenDemand': [
          'sewellia-lineolata-practical-fishkeeping',
          'sewellia-lineolata-fishkeeper',
        ],
        'environment.flowPreference': [
          'sewellia-lineolata-fishbase-40433',
          'sewellia-lineolata-practical-fishkeeping',
          'sewellia-lineolata-fishkeeper',
        ],
        'habitat.substratePreference': [
          'sewellia-lineolata-fishbase-40433',
          'sewellia-lineolata-practical-fishkeeping',
        ],
      },
    },
  },
];
