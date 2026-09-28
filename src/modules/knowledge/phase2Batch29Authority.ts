import type { SpeciesKnowledgeProfile } from './knowledge.types';
export type Phase2Batch29FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };
export const phase2Batch29Subjects: Record<string, Subject> = {
  sp_0395: { source: 'batch31-fishbase-crossocheilus-langei-gold-longfin', title: 'Crossocheilus langei Gold Longfin variant review' },
  sp_0418: { source: 'batch31-fishbase-ancistrus-sp-albino-longfin', title: 'Ancistrus sp. Albino Longfin variant review' },
  sp_0025: { source: 'batch31-fishbase-pterapogon-kauderni', title: 'Pterapogon kauderni species review' },
  sp_0039: { source: 'batch31-fishbase-pseudogastromyzon-fangi', title: 'Pseudogastromyzon fangi species review' },
  sp_0040: { source: 'batch31-fishbase-cobitis-sinensis', title: 'Cobitis sinensis species review' },
  sp_0060: { source: 'batch31-fishbase-sphaerichthys-osphromenoides', title: 'Sphaerichthys osphromenoides species review' },
  sp_0061: { source: 'batch31-fishbase-semaprochilodus-insignis', title: 'Semaprochilodus insignis species review' },
  sp_0106: { source: 'batch31-fishbase-erpetichthys-calabaricus', title: 'Erpetoichthys calabaricus species review' },
  sp_0107: { source: 'batch31-fishbase-semaprochilodus-taeniurus', title: 'Semaprochilodus taeniurus species review' },
  sp_0113: { source: 'batch31-fishbase-epiplatys-annulatus', title: 'Epiplatys annulatus species review' },
};
const reviewedAt = '2026-09-17';
const evidence = (subject: Subject, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: [subject.source], reviewedAt, note: `${subject.title} was reviewed for ${field}; the available professional record does not establish complete object-specific authority for this catalog object. No template, name inference, or base-species inheritance is promoted.` });
const makeKnowledge = (subject: Subject): SpeciesKnowledgeProfile['knowledge'] => ({ sexIdentification: { title: '本轮不提供稳定的公母辨别规则', summary: '来源不足以形成稳定的对象级性别判断。', points: ['不凭名称、品系或类别模板猜测性别。'], confidence: 'unknown', source: { type: 'unknown', label: '本批次性别证据不足', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: evidence(subject, 'sex identification') }, environment: { waterType: 'unknown', evidence: evidence(subject, 'environment') }, socialBehavior: { mode: 'unknown', summary: '来源不足以确认稳定水族箱社会模式。', evidence: evidence(subject, 'social behavior') }, spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(subject, 'space and growth') } });
export const phase2Batch29Knowledge = Object.fromEntries(Object.entries(phase2Batch29Subjects).map(([id, subject]) => [id, makeKnowledge(subject)])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch29Authority = Object.fromEntries(Object.entries(phase2Batch29Subjects).map(([id, subject]) => [id, { feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` }, care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` } } satisfies Record<'feeding' | 'care', Phase2Batch29FieldAuthority>])) as Record<string, Record<'feeding' | 'care', Phase2Batch29FieldAuthority>>;
