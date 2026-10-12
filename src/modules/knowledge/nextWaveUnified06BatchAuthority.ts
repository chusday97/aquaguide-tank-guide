import type { SpeciesKnowledgeProfile } from './knowledge.types';

const sourceIds = [
  'wave06-peer-reviewed-scleropages-formosus-super-red',
  'batch19-fishbase-scleropages-formosus',
  'seriouslyfish-scleropages-formosus',
];
const reviewedAt = '2026-10-12';
const evidence = (note: string) => ({
  confidence: 'verified' as const,
  reviewStatus: 'reviewed' as const,
  sourceIds,
  reviewedAt,
  note,
});
const unknownEvidence = (note: string) => ({
  confidence: 'unknown' as const,
  reviewStatus: 'reviewed' as const,
  sourceIds,
  reviewedAt,
  note,
});

export const nextWaveUnified06BatchKnowledge: Record<string, SpeciesKnowledgeProfile['knowledge']> = {
  sp_0283: {
    sexIdentification: {
      title: '本轮不提供稳定的公母外观判断',
      summary: 'Super Red 的对象身份已经确认，但没有把颜色表现扩展成稳定的性别判断规则。',
      points: ['颜色品系身份不能替代可靠的性别鉴别证据。'],
      confidence: 'unknown',
      source: { type: 'unknown', label: '缺少稳定对象级性别鉴别规则', confidence: 'unknown' },
      reliableFromLifeStage: 'unknown',
      evidence: unknownEvidence('No stable phenotype-level sex-identification rule is promoted in wave06.'),
    },
    environment: {
      waterType: 'freshwater',
      temperatureRangeC: { min: 22, max: 28 },
      phRange: { min: 5, max: 8 },
      evidence: evidence('Super Red identity is peer-reviewed; husbandry parameters come only from the reviewed Scleropages formosus base authority.'),
    },
    socialBehavior: {
      mode: 'variable',
      territoriality: 'unknown',
      predationRisk: 'high',
      summary: 'Super Red is an Scleropages formosus red phenotype; smaller fish remain prey under the reviewed base-taxon authority.',
      evidence: evidence('No phenotype-specific social behavior is invented; reviewed base-taxon Compatibility boundaries are reused.'),
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 90 },
      activityLevel: 'unknown',
      spaceNotes: ['Very large adult size; no phenotype-specific numeric tank minimum is invented.'],
      evidence: evidence('Adult-size and space boundary come only from the reviewed Scleropages formosus base authority.'),
    },
  },
};
