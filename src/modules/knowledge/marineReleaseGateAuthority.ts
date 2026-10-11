import type { SpeciesKnowledgeProfile } from './knowledge.types';

type Subject = {
  sourceId: string;
  title: string;
  waterType: 'saltwater';
  socialMode: 'group' | 'variable';
  adultMaxCm: number;
};

export const marineReleaseGateSubjects: Record<string, Subject> = {
  sp_0022: {
    sourceId: 'fishbase-lutjanus-kasmira',
    title: 'Lutjanus kasmira species summary',
    waterType: 'saltwater',
    socialMode: 'group',
    adultMaxCm: 40,
  },
  sp_0023: {
    sourceId: 'fishbase-zebrasoma-flavescens',
    title: 'Zebrasoma flavescens species summary',
    waterType: 'saltwater',
    socialMode: 'variable',
    adultMaxCm: 20,
  },
  sp_0024: {
    sourceId: 'fishbase-paracanthurus-hepatus',
    title: 'Paracanthurus hepatus species summary',
    waterType: 'saltwater',
    socialMode: 'group',
    adultMaxCm: 31,
  },
};

const reviewedAt = '2026-10-11';

const evidence = (subject: Subject, field: string) => ({
  confidence: 'verified' as const,
  reviewStatus: 'reviewed' as const,
  sourceIds: [subject.sourceId],
  reviewedAt,
  note: subject.title + ' directly supports the reviewed ' + field + ' fact used here. Unsupported aquarium husbandry details remain unknown.',
});

const unknownEvidence = (subject: Subject, field: string) => ({
  confidence: 'unknown' as const,
  reviewStatus: 'reviewed' as const,
  sourceIds: [subject.sourceId],
  reviewedAt,
  note: subject.title + ' was reviewed for ' + field + ', but does not establish an aquarium-specific rule for this field.',
});

export const marineReleaseGateKnowledge = Object.fromEntries(
  Object.entries(marineReleaseGateSubjects).map(([id, subject]) => [id, {
    sexIdentification: {
      title: '暂无稳定的公母辨别规则',
      summary: '当前来源不足以形成稳定的对象级性别判断。',
      points: ['不根据名称或体色模板推断性别。'],
      confidence: 'unknown',
      source: { type: 'unknown', label: '当前性别证据不足', confidence: 'unknown' },
      reliableFromLifeStage: 'unknown',
      evidence: unknownEvidence(subject, 'sex identification'),
    },
    environment: {
      waterType: subject.waterType,
      evidence: evidence(subject, 'marine environment'),
    },
    socialBehavior: {
      mode: subject.socialMode,
      summary: subject.socialMode === 'group'
        ? '来源记录该物种存在群聚行为；不据此推导固定水族箱最小群体数量。'
        : '来源记录该物种可单独或松散群聚；不据此推导固定水族箱群体规则。',
      evidence: evidence(subject, 'social behavior'),
    },
    spaceAndGrowth: {
      activityLevel: 'unknown',
      adultLengthCm: { max: subject.adultMaxCm, measurement: 'TL' },
      evidence: evidence(subject, 'maximum adult length'),
    },
  } satisfies SpeciesKnowledgeProfile['knowledge']]),
) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
