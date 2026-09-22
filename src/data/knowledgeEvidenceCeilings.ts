export type KnowledgeEvidenceCeilingCode = 'variant_social_not_established';

export type KnowledgeEvidenceCeiling = {
  speciesId: string;
  field: 'social';
  code: KnowledgeEvidenceCeilingCode;
  sourceIds: string[];
  note: string;
  reviewedAt: string;
};

export const knowledgeEvidenceCeilings: Record<string, KnowledgeEvidenceCeiling> = {
  sp_0258: {
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
};

export const getKnowledgeEvidenceCeiling = (speciesId: string) => knowledgeEvidenceCeilings[speciesId];
