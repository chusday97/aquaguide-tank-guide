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
  {
    speciesId: 'sp_0431',
    environment: {
      waterType: 'freshwater',
      temperature: { min: 20, max: 26 },
      minimumTankLengthCm: 60,
    },
    evidence: {
      confidence: 'medium',
      reviewStatus: 'reviewed',
      sourceRefs: [
        'paracheirodon-innesi-fishbase-10691',
        'paracheirodon-innesi-fishkeeper',
      ],
      claimRefs: {
        'environment.waterType': [
          'paracheirodon-innesi-fishbase-10691',
          'paracheirodon-innesi-fishkeeper',
        ],
        'environment.temperature': [
          'paracheirodon-innesi-fishbase-10691',
          'paracheirodon-innesi-fishkeeper',
        ],
        'environment.minimumTankLengthCm': ['paracheirodon-innesi-fishbase-10691'],
      },
    },
  },
  {
    speciesId: 'sp_0468',
    environment: {
      waterType: 'freshwater',
      ph: { min: 5, max: 7 },
      minimumTankLengthCm: 60,
    },
    evidence: {
      confidence: 'medium',
      reviewStatus: 'reviewed',
      sourceRefs: [
        'trigonostigma-heteromorpha-fishbase-10881',
        'trigonostigma-heteromorpha-fishkeeper',
      ],
      claimRefs: {
        'environment.waterType': [
          'trigonostigma-heteromorpha-fishbase-10881',
          'trigonostigma-heteromorpha-fishkeeper',
        ],
        'environment.ph': [
          'trigonostigma-heteromorpha-fishbase-10881',
          'trigonostigma-heteromorpha-fishkeeper',
        ],
        'environment.minimumTankLengthCm': ['trigonostigma-heteromorpha-fishbase-10881'],
      },
    },
  },
];
