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
  {
    speciesId: 'sp_0071',
    environment: {
      waterType: 'freshwater',
      light: 'high',
      co2: 'recommended',
    },
    planting: {
      type: 'rooted',
      substrateRequired: 'soil',
    },
    evidence: {
      confidence: 'medium',
      reviewStatus: 'reviewed',
      sourceRefs: [
        'micranthemum-callitrichoides-tropica-4478',
        'micranthemum-callitrichoides-aquarium-coop',
      ],
    },
  },
];
