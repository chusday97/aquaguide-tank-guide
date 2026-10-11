import { nextWaveUnified03DirectSubjects } from '../../data/catalogReviewBatches/next-wave-unified-03';
import type { SpeciesKnowledgeProfile } from './knowledge.types';

const reviewedAt = '2026-10-11';

const reviewedEvidence = (sourceIds: string[], note: string) => ({
  confidence: 'verified' as const,
  reviewStatus: 'reviewed' as const,
  sourceIds,
  reviewedAt,
  note,
});

const unknownEvidence = (sourceIds: string[], note: string) => ({
  confidence: 'unknown' as const,
  reviewStatus: 'reviewed' as const,
  sourceIds,
  reviewedAt,
  note,
});

const unknownSex = (sourceIds: string[]): SpeciesKnowledgeProfile['knowledge']['sexIdentification'] => ({
  title: '本轮不提供稳定的公母外观判断',
  summary: '当前批次只提升与环境、空间和混养直接相关的字段；没有足够对象级证据支持稳定性别判断。',
  points: ['不要从同属物种、贸易名或旧模板继承性别特征。'],
  confidence: 'unknown',
  source: { type: 'unknown', label: '缺少稳定的对象级性别鉴别规则', confidence: 'unknown' },
  reliableFromLifeStage: 'unknown',
  evidence: unknownEvidence(sourceIds, 'No stable object-level sex-identification rule is promoted in this batch.'),
});

const directKnowledge = Object.fromEntries(nextWaveUnified03DirectSubjects.map(subject => {
  const sourceIds = subject.sources.map(source => source.id);
  const territoriality = subject.territorialityTraits?.some(trait =>
    trait.includes('species_tank_required') || trait.includes('severe_') || trait.includes('high_')
  )
    ? 'high'
    : subject.territorialityTraits?.length ? 'medium' : 'unknown';
  const predationRisk = subject.predationTargets?.length ? 'high' : 'unknown';

  const environment: NonNullable<SpeciesKnowledgeProfile['knowledge']['environment']> = {
    waterType: subject.waterType,
    ...(subject.temperature ? { temperatureRangeC: subject.temperature } : {}),
    ...(subject.ph ? { phRange: subject.ph } : {}),
    evidence: reviewedEvidence(
      sourceIds,
      'Only reviewed taxon-specific water chemistry and temperature facts are promoted; absent ranges remain absent rather than inferred.',
    ),
  };

  const socialBehavior: NonNullable<SpeciesKnowledgeProfile['knowledge']['socialBehavior']> = {
    mode: subject.socialMode ?? 'unknown',
    territoriality,
    predationRisk,
    summary: subject.socialNote ?? 'No stable social-mode rule is promoted beyond the reviewed compatibility traits.',
    evidence: subject.socialMode || subject.territorialityTraits?.length || subject.predationTargets?.length
      ? reviewedEvidence(sourceIds, 'Taxon-specific social, territorial and predation boundaries are promoted without inventing a numeric group minimum.')
      : unknownEvidence(sourceIds, 'Reviewed sources do not establish a stable social-mode rule for Compatibility.'),
  };

  const hasSpaceEvidence = subject.adultSizeMaxCm != null || subject.tankLengthCm != null || subject.tankLiters != null;
  const spaceAndGrowth: NonNullable<SpeciesKnowledgeProfile['knowledge']['spaceAndGrowth']> = {
    ...(subject.adultSizeMaxCm != null ? { adultLengthCm: { max: subject.adultSizeMaxCm } } : {}),
    ...(subject.tankLengthCm != null ? { minTankLengthCm: subject.tankLengthCm } : {}),
    ...(subject.tankLiters != null ? { minVolumeLiters: subject.tankLiters } : {}),
    activityLevel: 'unknown',
    ...(hasSpaceEvidence ? { spaceNotes: ['Only reviewed adult-size or minimum-space facts are promoted; no smaller legacy template value is inherited.'] } : {}),
    evidence: hasSpaceEvidence
      ? reviewedEvidence(sourceIds, 'Reviewed object-level adult-size and/or minimum-space evidence is promoted.')
      : unknownEvidence(sourceIds, 'No reviewed minimum-space value is promoted in this batch.'),
  };

  return [subject.speciesId, {
    sexIdentification: unknownSex(sourceIds),
    environment,
    socialBehavior,
    spaceAndGrowth,
  } satisfies SpeciesKnowledgeProfile['knowledge']];
}));

export const nextWaveUnified03BatchKnowledge: Record<string, SpeciesKnowledgeProfile['knowledge']> = directKnowledge;
