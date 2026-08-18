import type { PlantEnvironmentProfile } from '../modules/environment/environment.types';

export const plantEnvironmentProfiles: PlantEnvironmentProfile[] = [
  {
    speciesId: 'sp_0081',
    environment: {
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
      claimRefs: {
        'environment.light': [
          'microsorum-pteropus-tropica-4408',
          'microsorum-pteropus-aquarium-coop',
        ],
        'environment.co2': [
          'microsorum-pteropus-tropica-4408',
          'microsorum-pteropus-aquarium-coop',
        ],
        'planting.type': [
          'microsorum-pteropus-tropica-4408',
          'microsorum-pteropus-aquarium-coop',
        ],
        'planting.substrateRequired': [
          'microsorum-pteropus-tropica-4408',
          'microsorum-pteropus-aquarium-coop',
        ],
        'planting.leafDurability': ['microsorum-pteropus-aquarium-coop'],
        'habitatValue.cover': ['microsorum-pteropus-aquarium-coop'],
        'habitatValue.fryShelter': ['microsorum-pteropus-aquarium-coop'],
      },
    },
  },
  {
    speciesId: 'sp_0071',
    environment: {
      light: 'high',
      co2: 'recommended',
    },
    planting: {
      type: 'rooted',
    },
    evidence: {
      confidence: 'medium',
      reviewStatus: 'reviewed',
      sourceRefs: [
        'micranthemum-callitrichoides-tropica-4478',
        'micranthemum-callitrichoides-aquarium-coop',
      ],
      claimRefs: {
        'environment.light': [
          'micranthemum-callitrichoides-tropica-4478',
          'micranthemum-callitrichoides-aquarium-coop',
        ],
        'environment.co2': [
          'micranthemum-callitrichoides-tropica-4478',
          'micranthemum-callitrichoides-aquarium-coop',
        ],
        'planting.type': ['micranthemum-callitrichoides-tropica-4478'],
      },
    },
  },
  {
    speciesId: 'sp_0075',
    environment: {
      light: 'low',
      co2: 'optional',
    },
    planting: {
      type: 'epiphyte',
      substrateRequired: 'none',
      leafDurability: 'tough',
    },
    evidence: {
      confidence: 'medium',
      reviewStatus: 'reviewed',
      sourceRefs: [
        'anubias-barteri-nana-tropica-4546',
        'anubias-barteri-nana-aquarium-coop',
      ],
      claimRefs: {
        'environment.light': [
          'anubias-barteri-nana-tropica-4546',
          'anubias-barteri-nana-aquarium-coop',
        ],
        'environment.co2': [
          'anubias-barteri-nana-tropica-4546',
          'anubias-barteri-nana-aquarium-coop',
        ],
        'planting.type': [
          'anubias-barteri-nana-tropica-4546',
          'anubias-barteri-nana-aquarium-coop',
        ],
        'planting.substrateRequired': [
          'anubias-barteri-nana-tropica-4546',
          'anubias-barteri-nana-aquarium-coop',
        ],
        'planting.leafDurability': [
          'anubias-barteri-nana-tropica-4546',
          'anubias-barteri-nana-aquarium-coop',
        ],
      },
    },
  },
];
