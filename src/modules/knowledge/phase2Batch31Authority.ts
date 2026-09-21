import type { SpeciesKnowledgeProfile } from './knowledge.types';

export type Phase2Batch31FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };

export const phase2Batch31Subjects: Record<string, Subject> = {
  sp_0014: { source: 'batch33-fishbase-corydoras-aeneus', title: 'Corydoras aeneus species review' },
  sp_0049: { source: 'batch33-fishbase-channa-asiatica', title: 'Channa asiatica species review' },
  sp_0431: { source: 'batch33-fishbase-paracheirodon-innesi', title: 'Paracheirodon innesi species review' },
  sp_0432: { source: 'batch33-fishbase-paracheirodon-axelrodi', title: 'Paracheirodon axelrodi species review' },
  sp_0436: { source: 'batch33-fishbase-poecilia-reticulata', title: 'Poecilia reticulata species review' },
  sp_0443: { source: 'batch33-fishbase-corydoras-panda', title: 'Corydoras panda species review' },
  sp_0435: { source: 'batch33-fishbase-danio-rerio', title: 'Danio rerio species review' },
  sp_0191: { source: 'batch33-worms-paguristes-cadenati', title: 'Paguristes cadenati professional taxonomy review' },
  sp_0192: { source: 'batch33-worms-entacmaea-quadricolor', title: 'Entacmaea quadricolor professional taxonomy review' },
  sp_0193: { source: 'batch33-worms-stichodactyla-haddoni', title: 'Stichodactyla haddoni professional taxonomy review' },
};

const reviewedAt = '2026-09-17';
const evidence = (subject: Subject, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: [subject.source], reviewedAt, note: `${subject.title} was reviewed for ${field}; the available professional record does not establish complete object-specific authority for this catalog object. No template, name inference, or base-species inheritance is promoted.` });
const makeKnowledge = (subject: Subject): SpeciesKnowledgeProfile['knowledge'] => ({ sexIdentification: { title: '本轮不提供稳定的公母辨别规则', summary: '来源不足以形成稳定的对象级性别判断。', points: ['不凭名称、品系或类别模板猜测性别。'], confidence: 'unknown', source: { type: 'unknown', label: '本批次性别证据不足', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: evidence(subject, 'sex identification') }, environment: { waterType: 'unknown', evidence: evidence(subject, 'environment') }, socialBehavior: { mode: 'unknown', summary: '来源不足以确认稳定水族箱社会模式。', evidence: evidence(subject, 'social behavior') }, spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(subject, 'space and growth') } });
const pearlRedSnakeheadKnowledge: SpeciesKnowledgeProfile['knowledge'] = {
  ...makeKnowledge(phase2Batch31Subjects.sp_0049),
  environment: {
    waterType: 'freshwater',
    temperatureRangeC: { min: 22, max: 28 },
    notes: ['FishBase records Channa asiatica as a freshwater tropical species at 22-28C.'],
    evidence: {
      confidence: 'verified',
      reviewStatus: 'reviewed',
      sourceIds: ['batch33-fishbase-channa-asiatica'],
      reviewedAt: '2026-09-22',
    },
  },
  spaceAndGrowth: {
    adultLengthCm: { max: 23.5, measurement: 'TL' },
    activityLevel: 'unknown',
    spaceNotes: ['FishBase reports a maximum published total length of 23.5 cm. No minimum aquarium volume is inferred from body length alone.'],
    evidence: {
      confidence: 'verified',
      reviewStatus: 'reviewed',
      sourceIds: ['batch33-fishbase-channa-asiatica'],
      reviewedAt: '2026-09-22',
    },
  },
  socialBehavior: {
    mode: 'solitary',
    territoriality: 'high',
    finNipping: 'unknown',
    predationRisk: 'high',
    summary: 'The reviewed U.S. Fish and Wildlife Service compatibility authority supports predatory, territorial and solitary-required planning for Channa asiatica; FishBase also records fish among its prey.',
    evidence: {
      confidence: 'verified',
      reviewStatus: 'reviewed',
      sourceIds: ['small-snakehead-fws-assessment', 'batch33-fishbase-channa-asiatica'],
      reviewedAt: '2026-09-22',
    },
  },
};

export const phase2Batch31Knowledge = Object.fromEntries(Object.entries(phase2Batch31Subjects).map(([id, subject]) => [
  id,
  id === 'sp_0049' ? pearlRedSnakeheadKnowledge : makeKnowledge(subject),
])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch31Authority = Object.fromEntries(Object.entries(phase2Batch31Subjects).map(([id, subject]) => [id, { feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` }, care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` } } satisfies Record<'feeding' | 'care', Phase2Batch31FieldAuthority>])) as Record<string, Record<'feeding' | 'care', Phase2Batch31FieldAuthority>>;
