export type KnowledgeEvidenceCeilingCode =
  | 'variant_social_not_established'
  | 'variant_husbandry_not_established';

export type KnowledgeEvidenceField = 'feeding' | 'environment' | 'space' | 'social' | 'care';

export type KnowledgeEvidenceCeiling = {
  speciesId: string;
  field: KnowledgeEvidenceField;
  code: KnowledgeEvidenceCeilingCode;
  sourceIds: string[];
  note: string;
  reviewedAt: string;
};

export const knowledgeEvidenceCeilings: Record<string, KnowledgeEvidenceCeiling[]> = {
  sp_0224: [
    {
      speciesId: 'sp_0224',
      field: 'social',
      code: 'variant_husbandry_not_established',
      sourceIds: ['batch03-fishbase-channa-argus', 'northern-snakehead-fws-erss-2024', 'northern-snakehead-usgs-diet-2012'],
      note: 'Reviewed Channa argus sources establish the base species ecology, predation risk and diet, but targeted review did not establish a Platinum-morph-specific stable social profile. Do not promote base-species behavior to the ornamental morph without an explicit reviewed bridge.',
      reviewedAt: '2026-09-22',
    },
    {
      speciesId: 'sp_0224',
      field: 'feeding',
      code: 'variant_husbandry_not_established',
      sourceIds: ['batch03-fishbase-channa-argus', 'northern-snakehead-usgs-diet-2012'],
      note: 'Reviewed sources establish Channa argus feeding ecology, but no reviewed source establishes Platinum-morph-specific feeding authority. Keep this field fail-closed rather than converting base-species diet evidence into a morph husbandry recommendation.',
      reviewedAt: '2026-09-22',
    },
    {
      speciesId: 'sp_0224',
      field: 'care',
      code: 'variant_husbandry_not_established',
      sourceIds: ['batch03-fishbase-channa-argus', 'northern-snakehead-fws-erss-2024'],
      note: 'Reviewed Channa argus sources do not establish a Platinum-morph-specific aquarium care protocol. Existing base-species temperature, size and ecological evidence remains useful context but is not promoted into morph-specific care authority.',
      reviewedAt: '2026-09-22',
    },
  ],
  sp_0258: [
    {
      speciesId: 'sp_0258',
      field: 'social',
      code: 'variant_social_not_established',
      sourceIds: [
        'sciadv-betta-phenotypic-diversity',
        'ygcen-betta-behavior-variation-2022',
      ],
      note: 'Koi/candy is a reviewed mosaic commercial phenotype of domesticated Betta splendens, but published aggression work shows substantial individual/strain variation and does not establish a Koi-specific stable social mode. Keep social authority fail-closed instead of promoting the base-species profile by color-name alone.',
      reviewedAt: '2026-09-22',
    },
    {
      speciesId: 'sp_0258',
      field: 'feeding',
      code: 'variant_husbandry_not_established',
      sourceIds: ['sciadv-betta-phenotypic-diversity'],
      note: 'The Koi/candy phenotype identity is reviewed, but no reviewed source establishes a Koi-specific feeding protocol. Base-species Betta feeding guidance is not promoted to the commercial phenotype without an explicit reviewed bridge.',
      reviewedAt: '2026-09-22',
    },
    {
      speciesId: 'sp_0258',
      field: 'care',
      code: 'variant_husbandry_not_established',
      sourceIds: ['sciadv-betta-phenotypic-diversity'],
      note: 'The Koi/candy phenotype identity is reviewed, but no reviewed source establishes Koi-specific husbandry beyond the explicitly bridged water, temperature, pH and adult-size fields. Keep broader care authority fail-closed.',
      reviewedAt: '2026-09-22',
    },
  ],
};

export const getKnowledgeEvidenceCeilings = (speciesId: string) => knowledgeEvidenceCeilings[speciesId] ?? [];
export const getKnowledgeEvidenceCeiling = (speciesId: string, field?: KnowledgeEvidenceField) => {
  const ceilings = getKnowledgeEvidenceCeilings(speciesId);
  return field ? ceilings.find(item => item.field === field) : ceilings[0];
};
