import type { SpeciesKnowledgeProfile } from './knowledge.types';

export type Phase2Batch47FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };

export const phase2Batch47Subjects: Record<string, Subject> = {
  sp_0017: { source: 'batch49-fishbase-apistogramma-agassizii', title: 'Apistogramma agassizii species review' },
  sp_0440: { source: 'batch49-fishbase-sahyadria-denisonii', title: 'Sahyadria denisonii species review' },
  sp_0448: { source: 'batch49-fishbase-mikrogeophagus-ramirezi', title: 'Mikrogeophagus ramirezi species review' },
  sp_0469: { source: 'batch49-fishbase-hyphessobrycon-amandae-variant', title: 'Hyphessobrycon amandae variant review' },
  sp_0020: { source: 'batch49-fishbase-phenacogrammus-interruptus', title: 'Phenacogrammus interruptus species review' },
  sp_0045: { source: 'batch49-fishbase-sewellia-lineolata', title: 'Sewellia lineolata species review' },
  sp_0126: { source: 'batch49-fishbase-chromobotia-macracanthus', title: 'Chromobotia macracanthus species review' },
  sp_0133: { source: 'batch49-fishbase-glossolepis-incisus-variant', title: 'Glossolepis incisus variant review' },
};

const reviewedAt = '2026-09-17';
const evidence = (subject: Subject, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: [subject.source], reviewedAt, note: `${subject.title} was reviewed for ${field}; the professional record does not establish complete object-specific feeding authority for this catalog object. No template, name inference, or base-species inheritance is promoted.` });
const makeKnowledge = (subject: Subject): SpeciesKnowledgeProfile['knowledge'] => ({ sexIdentification: { title: '本轮不提供稳定的对象级性别规则', summary: '来源不足以形成稳定的对象级性别判断。', points: ['不凭名称、品系或类别模板猜测性别。'], confidence: 'unknown', source: { type: 'unknown', label: '本批次性别证据不足', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: evidence(subject, 'sex identification') }, environment: { waterType: 'unknown', evidence: evidence(subject, 'environment') }, socialBehavior: { mode: 'unknown', summary: '来源不足以确认稳定水族箱社会模式。', evidence: evidence(subject, 'social behavior') }, spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(subject, 'space and growth') } });
export const phase2Batch47Knowledge = Object.fromEntries(Object.entries(phase2Batch47Subjects).map(([id, subject]) => [id, makeKnowledge(subject)])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch47Authority = Object.fromEntries(Object.entries(phase2Batch47Subjects).map(([id, subject]) => [id, { feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` }, care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` } } satisfies Record<'feeding' | 'care', Phase2Batch47FieldAuthority>])) as Record<string, Record<'feeding' | 'care', Phase2Batch47FieldAuthority>>;
