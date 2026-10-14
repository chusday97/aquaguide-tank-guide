import { nextWaveUnified08EvidenceCeilings } from './catalogReviewBatches/next-wave-unified-08';
import { nextWaveUnified09EvidenceCeilings } from './catalogReviewBatches/next-wave-unified-09';
import { nextWaveUnified10EvidenceCeilings } from './catalogReviewBatches/next-wave-unified-10';
import { nextWaveUnified11EvidenceCeilings } from './catalogReviewBatches/next-wave-unified-11';
import { nextWaveUnified12EvidenceCeilings } from './catalogReviewBatches/next-wave-unified-12';
import { nextWaveUnified13EvidenceCeilings } from './catalogReviewBatches/next-wave-unified-13';
import { nextWaveUnified14EvidenceCeilings } from './catalogReviewBatches/next-wave-unified-14';
import { nextWaveUnified16EvidenceCeilings } from './catalogReviewBatches/next-wave-unified-16';

export type KnowledgeEvidenceCeilingCode =
  | 'variant_social_not_established'
  | 'variant_husbandry_not_established'
  | 'species_social_not_established'
  | 'species_space_minimum_conflicted';

export type KnowledgeEvidenceField = 'feeding' | 'environment' | 'space' | 'social' | 'care';

export type KnowledgeEvidenceCeiling = {
  speciesId: string;
  field: KnowledgeEvidenceField;
  code: KnowledgeEvidenceCeilingCode;
  sourceIds: string[];
  note: string;
  reviewedAt: string;
  researchDisposition?: 'terminal_unknown_hold';
};

export const knowledgeEvidenceCeilings: Record<string, KnowledgeEvidenceCeiling[]> = {
  ...Object.fromEntries(nextWaveUnified08EvidenceCeilings.map(outcome => [outcome.speciesId, [{
    ...outcome,
    reviewedAt: '2026-10-12',
    researchDisposition: 'terminal_unknown_hold' as const,
  }]])),
  ...Object.fromEntries(nextWaveUnified09EvidenceCeilings.map(outcome => [outcome.speciesId, [{
    ...outcome,
    reviewedAt: '2026-10-12',
    researchDisposition: 'terminal_unknown_hold' as const,
  }]])),
  ...Object.fromEntries(nextWaveUnified10EvidenceCeilings.map(outcome => [outcome.speciesId, [{
    ...outcome,
    reviewedAt: '2026-10-12',
    researchDisposition: 'terminal_unknown_hold' as const,
  }]])),
  ...Object.fromEntries(nextWaveUnified11EvidenceCeilings.map(outcome => [outcome.speciesId, [{
    ...outcome,
    reviewedAt: '2026-10-12',
    researchDisposition: 'terminal_unknown_hold' as const,
  }]])),
  ...Object.fromEntries(nextWaveUnified12EvidenceCeilings.map(outcome => [outcome.speciesId, [{
    ...outcome,
    reviewedAt: '2026-10-12',
    researchDisposition: 'terminal_unknown_hold' as const,
  }]])),
  ...Object.fromEntries(nextWaveUnified13EvidenceCeilings.map(outcome => [outcome.speciesId, [{
    ...outcome,
    reviewedAt: '2026-10-12',
    researchDisposition: 'terminal_unknown_hold' as const,
  }]])),
  ...Object.fromEntries(nextWaveUnified14EvidenceCeilings.map(outcome => [outcome.speciesId, [{
    ...outcome,
    reviewedAt: '2026-10-12',
    researchDisposition: 'terminal_unknown_hold' as const,
  }]])),
  ...Object.fromEntries(nextWaveUnified16EvidenceCeilings.map(outcome => [outcome.speciesId, [{
    ...outcome,
    reviewedAt: '2026-10-13',
    researchDisposition: 'terminal_unknown_hold' as const,
  }]])),
  sp_0047: [
    {
      speciesId: 'sp_0047',
      field: 'social',
      code: 'species_social_not_established',
      sourceIds: ['batch18-fishbase-tachysurus-fulvidraco', 'fws-tachysurus-fulvidraco-erss'],
      note: 'Targeted review established accepted identity, freshwater environment, aquarium planning temperature, adult size and male nest guarding, but did not establish a stable household community/social mode or a defensible prey-size threshold for occasional fish consumption. Keep positive community compatibility fail-closed instead of repeating ordinary source search.',
      reviewedAt: '2026-10-11',
      researchDisposition: 'terminal_unknown_hold',
    },
  ],
  sp_0198: [
    {
      speciesId: 'sp_0198',
      field: 'space',
      code: 'species_space_minimum_conflicted',
      sourceIds: [
        'seriouslyfish-channa-diplogramma',
        'baqua-channa-diplogramma-tank-minimum',
        'fishipedia-channa-diplogramma-tank-minimum',
      ],
      note: 'Targeted exact-taxon review found irreconcilable aquarium-minimum guidance: Seriously Fish records no numeric aquarium base and recommends only public installations or the very largest private aquaria, B-Aqua gives 500 L, and Fishi-pedia gives 3000 L. Keep tank_size terminal-unknown until a stronger exact-taxon numeric husbandry authority resolves the conflict; do not infer from adult size or choose a value merely to clear coverage.',
      reviewedAt: '2026-10-14',
      researchDisposition: 'terminal_unknown_hold',
    },
  ],
  sp_0224: [
    {
      speciesId: 'sp_0224',
      field: 'social',
      code: 'variant_husbandry_not_established',
      sourceIds: ['batch03-fishbase-channa-argus', 'northern-snakehead-fws-erss-2024', 'northern-snakehead-usgs-diet-2012'],
      note: 'Reviewed Channa argus sources establish the base species ecology, predation risk and diet, but targeted review did not establish a Platinum-morph-specific stable social profile. Do not promote base-species behavior to the ornamental morph without an explicit reviewed bridge.',
      reviewedAt: '2026-09-22',
      researchDisposition: 'terminal_unknown_hold',
    },
    {
      speciesId: 'sp_0224',
      field: 'feeding',
      code: 'variant_husbandry_not_established',
      sourceIds: ['batch03-fishbase-channa-argus', 'northern-snakehead-usgs-diet-2012'],
      note: 'Reviewed sources establish Channa argus feeding ecology, but no reviewed source establishes Platinum-morph-specific feeding authority. Keep this field fail-closed rather than converting base-species diet evidence into a morph husbandry recommendation.',
      reviewedAt: '2026-09-22',
      researchDisposition: 'terminal_unknown_hold',
    },
    {
      speciesId: 'sp_0224',
      field: 'care',
      code: 'variant_husbandry_not_established',
      sourceIds: ['batch03-fishbase-channa-argus', 'northern-snakehead-fws-erss-2024'],
      note: 'Reviewed Channa argus sources do not establish a Platinum-morph-specific aquarium care protocol. Existing base-species temperature, size and ecological evidence remains useful context but is not promoted into morph-specific care authority.',
      reviewedAt: '2026-09-22',
      researchDisposition: 'terminal_unknown_hold',
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
      researchDisposition: 'terminal_unknown_hold',
    },
    {
      speciesId: 'sp_0258',
      field: 'feeding',
      code: 'variant_husbandry_not_established',
      sourceIds: ['sciadv-betta-phenotypic-diversity'],
      note: 'The Koi/candy phenotype identity is reviewed, but no reviewed source establishes a Koi-specific feeding protocol. Base-species Betta feeding guidance is not promoted to the commercial phenotype without an explicit reviewed bridge.',
      reviewedAt: '2026-09-22',
      researchDisposition: 'terminal_unknown_hold',
    },
    {
      speciesId: 'sp_0258',
      field: 'care',
      code: 'variant_husbandry_not_established',
      sourceIds: ['sciadv-betta-phenotypic-diversity'],
      note: 'The Koi/candy phenotype identity is reviewed, but no reviewed source establishes Koi-specific husbandry beyond the explicitly bridged water, temperature, pH and adult-size fields. Keep broader care authority fail-closed.',
      reviewedAt: '2026-09-22',
      researchDisposition: 'terminal_unknown_hold',
    },
  ],
};

export const getKnowledgeEvidenceCeilings = (speciesId: string) => knowledgeEvidenceCeilings[speciesId] ?? [];
export const getKnowledgeEvidenceCeiling = (speciesId: string, field?: KnowledgeEvidenceField) => {
  const ceilings = getKnowledgeEvidenceCeilings(speciesId);
  return field ? ceilings.find(item => item.field === field) : ceilings[0];
};
