import { nextWaveUnified02DirectSubjects } from '../../data/catalogReviewBatches/next-wave-unified-02';
import { opsariichthysBidensKnowledge } from './opsariichthysBidensAuthority';
import { nextWaveFreshwaterBatchKnowledge } from './nextWaveFreshwaterBatchAuthority';
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
  summary: '当前批次只提升与环境、空间和混养直接相关的字段；没有足够证据支持稳定性别外观规则。',
  points: ['不要用旧模板中的颜色、体型或鳍形描述直接判断性别。'],
  confidence: 'unknown',
  source: { type: 'unknown', label: '缺少稳定的对象级性别鉴别规则', confidence: 'unknown' },
  reliableFromLifeStage: 'unknown',
  evidence: unknownEvidence(sourceIds, 'No stable aquarium-level sex-identification rule is promoted in this batch.'),
});

const directKnowledge = Object.fromEntries(nextWaveUnified02DirectSubjects.map(subject => {
  const sourceIds = [subject.fishBase.id, subject.husbandry.id];
  const territoriality = subject.territorialityTraits?.includes('species_tank_required')
    ? 'high'
    : subject.territorialityTraits?.length ? 'medium' : 'unknown';
  const predationRisk = subject.predationTargets?.length ? 'high' : 'unknown';
  return [subject.speciesId, {
    sexIdentification: unknownSex(sourceIds),
    environment: {
      waterType: 'freshwater',
      temperatureRangeC: subject.temperature,
      phRange: subject.ph,
      evidence: reviewedEvidence(
        sourceIds,
        'FishBase identity/ecology and reviewed husbandry source support the promoted freshwater environment envelope.',
      ),
    },
    socialBehavior: {
      mode: subject.socialMode,
      territoriality,
      predationRisk,
      summary: subject.socialNote,
      evidence: reviewedEvidence(
        [subject.husbandry.id],
        'Only the explicitly reviewed social, territorial and predation boundaries are promoted; no numeric group minimum is inferred.',
      ),
    },
    spaceAndGrowth: {
      adultLengthCm: { max: subject.adultSizeMaxCm },
      minTankLengthCm: subject.tankLengthCm,
      ...(subject.tankLiters ? { minVolumeLiters: subject.tankLiters } : {}),
      activityLevel: 'medium',
      spaceNotes: ['Minimum aquarium dimensions are retained from the reviewed husbandry source; no smaller legacy template value is used.'],
      evidence: reviewedEvidence(
        sourceIds,
        'Reviewed species identity/adult size and husbandry minimum aquarium dimensions are promoted together.',
      ),
    },
  } satisfies SpeciesKnowledgeProfile['knowledge']];
}));

export const nextWaveUnifiedBatchKnowledge: Record<string, SpeciesKnowledgeProfile['knowledge']> = {
  ...directKnowledge,
  sp_0130: opsariichthysBidensKnowledge.sp_0038,
  sp_0131: nextWaveFreshwaterBatchKnowledge.sp_0048,
};
