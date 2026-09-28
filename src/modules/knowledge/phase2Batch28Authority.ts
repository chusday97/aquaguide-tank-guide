import type { SpeciesKnowledgeProfile } from './knowledge.types';
export type Phase2Batch28FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };
export const phase2Batch28Subjects: Record<string, Subject> = {
  sp_0292: { source: 'batch30-fishbase-poecilia-latipinna-gold-balloon', title: 'Poecilia latipinna Gold Balloon variant review' },
  sp_0293: { source: 'batch30-fishbase-poecilia-sphenops-black-balloon', title: 'Poecilia sphenops Black Balloon variant review' },
  sp_0348: { source: 'batch30-fishbase-carassius-auratus-tigerhead', title: 'Carassius auratus Tigerhead variant review' },
  sp_0349: { source: 'batch30-fishbase-carassius-auratus-calico-ranchu', title: 'Carassius auratus Calico Ranchu variant review' },
  sp_0350: { source: 'batch30-fishbase-carassius-auratus-black-oranda', title: 'Carassius auratus Black Oranda variant review' },
  sp_0351: { source: 'batch30-fishbase-carassius-auratus-butterfly-tail', title: 'Carassius auratus Butterfly Tail variant review' },
  sp_0385: { source: 'batch30-fishbase-carassius-auratus-white-gold', title: 'Carassius auratus White Gold variant review' },
  sp_0386: { source: 'batch30-fishbase-carassius-auratus-black-moor', title: 'Carassius auratus Black Moor variant review' },
  sp_0387: { source: 'batch30-fishbase-carassius-auratus-panda-butterfly', title: 'Carassius auratus Panda Butterfly variant review' },
  sp_0392: { source: 'batch30-fishbase-ancistrus-sp-snowflake-gold', title: 'Ancistrus sp. Snowflake Gold variant review' },
};
const reviewedAt = '2026-09-17';
const evidence = (subject: Subject, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: [subject.source], reviewedAt, note: `${subject.title} was reviewed for ${field}; the available professional record does not establish complete object-specific authority for this catalog object. No template, name inference, or base-species inheritance is promoted.` });
const makeKnowledge = (subject: Subject): SpeciesKnowledgeProfile['knowledge'] => ({
  sexIdentification: { title: '本轮不提供稳定的公母辨别规则', summary: '来源不足以形成稳定的对象级性别判断。', points: ['不凭名称、品系或类别模板猜测性别。'], confidence: 'unknown', source: { type: 'unknown', label: '本批次性别证据不足', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: evidence(subject, 'sex identification') },
  environment: { waterType: 'unknown', evidence: evidence(subject, 'environment') }, socialBehavior: { mode: 'unknown', summary: '来源不足以确认稳定水族箱社会模式。', evidence: evidence(subject, 'social behavior') }, spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(subject, 'space and growth') },
});
export const phase2Batch28Knowledge = Object.fromEntries(Object.entries(phase2Batch28Subjects).map(([id, subject]) => [id, makeKnowledge(subject)])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch28Authority = Object.fromEntries(Object.entries(phase2Batch28Subjects).map(([id, subject]) => [id, { feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` }, care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` } } satisfies Record<'feeding' | 'care', Phase2Batch28FieldAuthority>])) as Record<string, Record<'feeding' | 'care', Phase2Batch28FieldAuthority>>;
