import type { PlantEnvironmentProfile } from '../modules/environment/environment.types';

export const plantEnvironmentProfiles: PlantEnvironmentProfile[] = [
  {
    speciesId: 'sp_0081',
    environment: {
      waterType: 'freshwater',
      light: 'low',
      co2: 'optional',
    },
    planting: {
      type: 'epiphyte',
      substrateRequired: 'none',
      leafDurability: 'tough',
    },
    habitatValue: {
      cover: 'medium',
      fryShelter: 'medium',
    },
    evidence: {
      confidence: 'medium',
      reviewStatus: 'reviewed',
      sourceRefs: [
        'microsorum-pteropus-tropica-4408',
        'microsorum-pteropus-aquarium-coop',
      ],
    },
  },
];
