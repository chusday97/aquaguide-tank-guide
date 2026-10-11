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

const sourceIds = ['fishbase-chindongo-socolofi', 'seriouslyfish-pseudotropheus-socolofi'];

export const freshwaterReleaseGateKnowledge: Record<string, SpeciesKnowledgeProfile['knowledge']> = {
  sp_0018: {
    sexIdentification: {
      title: '暂无稳定的公母外观判断规则',
      summary: '当前 reviewed sources 不足以把颜色或单一外观特征作为稳定性别判断依据。',
      points: ['不要仅凭蓝色深浅或体型猜测性别。'],
      confidence: 'unknown',
      source: { type: 'unknown', label: '当前性别证据不足', confidence: 'unknown' },
      reliableFromLifeStage: 'unknown',
      evidence: unknownEvidence(sourceIds, 'Reviewed sources do not establish a robust object-level visual sexing rule.'),
    },
    environment: {
      waterType: 'freshwater',
      temperatureRangeC: { min: 24, max: 28 },
      phRange: { min: 7.6, max: 8.8 },
      notes: ['马拉维湖 Mbuna；水族饲养使用 Seriously Fish 的 24–28°C、pH 7.6–8.8 reviewed husbandry range。'],
      evidence: reviewedEvidence(sourceIds, 'FishBase supports freshwater Lake Malawi ecology; Seriously Fish supports the aquarium temperature and pH range.'),
    },
    socialBehavior: {
      mode: 'variable',
      summary: '雄鱼具有领地性，尤其会围绕岩石建立领地；现有证据不支持固定最小群体数量。',
      evidence: reviewedEvidence(sourceIds, 'FishBase directly records territorial males near rocks; no fixed aquarium group minimum is promoted.'),
    },
    spaceAndGrowth: {
      activityLevel: 'unknown',
      adultLengthCm: { max: 11.5, measurement: 'SL' },
      minTankLengthCm: 90,
      evidence: reviewedEvidence(sourceIds, 'Seriously Fish supports 11.5 cm SL and a minimum 90 × 45 cm tank base; only the 90 cm minimum length is promoted.'),
    },
  },
};
