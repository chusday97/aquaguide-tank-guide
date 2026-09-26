export type CompatibilityPairEvidenceCeilingCode =
  | 'prey_trade_identity_not_resolved'
  | 'gastropod_predation_not_established'
  | 'large_fish_outside_supported_prey_window';

export type CompatibilityPairEvidenceCeiling = {
  speciesIds: [string, string];
  code: CompatibilityPairEvidenceCeilingCode;
  sourceIds: string[];
  note: string;
  reviewedAt: string;
};

const keyOf = (leftId: string, rightId: string) => [leftId, rightId].sort().join('::');

const ceilings: CompatibilityPairEvidenceCeiling[] = [
  {
    speciesIds: ['sp_0002', 'sp_0224'],
    code: 'prey_trade_identity_not_resolved',
    sourceIds: [
      'northern-snakehead-fws-erss-2024',
      'northern-snakehead-usgs-diet-2012',
      'identity-zootaxa-caridina-logemanni',
      'identity-worms-caridina-logemanni',
    ],
    note: 'Channa argus has reviewed crustacean-predation evidence, but the catalog trade object “水晶虾/Crystal Shrimp” is not securely mapped to one taxon and lacks object-level reviewed size/behavior authority. Do not promote a hard pair verdict from base-species or generic shrimp assumptions.',
    reviewedAt: '2026-09-22',
  },
  {
    speciesIds: ['sp_0224', 'sp_0428'],
    code: 'gastropod_predation_not_established',
    sourceIds: [
      'northern-snakehead-fws-erss-2024',
      'northern-snakehead-usgs-diet-2012',
      'batch03-obis-neritina-natalensis',
    ],
    note: 'Reviewed Channa argus sources support strong piscivory and some crustacean prey, but do not establish gastropod/snail predation. Zebra-nerite trade identity is also taxonomically ambiguous. Crustacean evidence must not be extrapolated to gastropods.',
    reviewedAt: '2026-09-22',
  },
  {
    speciesIds: ['sp_0224', 'sp_0451'],
    code: 'large_fish_outside_supported_prey_window',
    sourceIds: [
      'northern-snakehead-fws-erss-2024',
      'northern-snakehead-usgs-diet-2012',
      'batch03-fishbase-astronotus-ocellatus',
      'seriouslyfish-astronotus-ocellatus',
    ],
    note: 'USGS records adult Channa argus taking fish up to roughly one-third of its body length. Platinum snakehead reviewed maximum is about 100 cm, while Oscar reviewed maximum is about 45.7 cm, outside that supported prey-size window. No direct Channa argus × Astronotus ocellatus pair authority is reviewed, so neither safety nor predation risk is promoted.',
    reviewedAt: '2026-09-22',
  },
];

const byPair = new Map(ceilings.map(item => [keyOf(...item.speciesIds), item]));

export const compatibilityPairEvidenceCeilings = ceilings;

export const getCompatibilityPairEvidenceCeiling = (leftId: string, rightId: string) => (
  byPair.get(keyOf(leftId, rightId))
);
