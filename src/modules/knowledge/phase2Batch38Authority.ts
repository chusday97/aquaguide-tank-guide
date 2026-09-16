import type { SpeciesKnowledgeProfile } from './knowledge.types';

export type Phase2Batch38FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };

export const phase2Batch38Subjects: Record<string, Subject> = {
  sp_0446: { source: 'batch40-fishbase-pterophyllum-scalare', title: 'Pterophyllum scalare species review' },
  sp_0013: { source: 'batch40-fishbase-otocinclus-vittatus', title: 'Otocinclus vittatus species review' },
  sp_0028: { source: 'batch40-fishbase-caridina-cantonensis-variant', title: 'Caridina cantonensis variant species review' },
  sp_0030: { source: 'batch40-professional-neocaridina-davidi-yellow', title: 'Neocaridina davidi Yellow variant review' },
  sp_0031: { source: 'batch40-professional-neocaridina-davidi-blue', title: 'Neocaridina davidi Blue variant review' },
  sp_0164: { source: 'batch40-professional-neocaridina-davidi-black', title: 'Neocaridina davidi Black variant review' },
  sp_0165: { source: 'batch40-professional-neocaridina-davidi-yellow-line', title: 'Neocaridina davidi Yellow Line variant review' },
  sp_0166: { source: 'batch40-professional-neocaridina-davidi-fire-red', title: 'Neocaridina davidi Fire Red variant review' },
  sp_0223: { source: 'batch40-sciencedirect-channa-asiatica-albino', title: 'Channa asiatica Albino variant review' },
  sp_0238: { source: 'batch40-professional-neocaridina-davidi-full-black', title: 'Neocaridina davidi Full Black variant review' },
};

const reviewedAt = '2026-09-17';
const evidence = (subject: Subject, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: [subject.source], reviewedAt, note: `${subject.title} was reviewed for ${field}; the available professional record does not establish complete object-specific authority for this catalog object. No template, name inference, or base-species inheritance is promoted.` });
const makeKnowledge = (subject: Subject): SpeciesKnowledgeProfile['knowledge'] => ({ sexIdentification: { title: '本轮不提供稳定的公母辨别规则', summary: '来源不足以形成稳定的对象级性别判断。', points: ['不凭名称、品系或类别模板猜测性别。'], confidence: 'unknown', source: { type: 'unknown', label: '本批次性别证据不足', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: evidence(subject, 'sex identification') }, environment: { waterType: 'unknown', evidence: evidence(subject, 'environment') }, socialBehavior: { mode: 'unknown', summary: '来源不足以确认稳定水族箱社会模式。', evidence: evidence(subject, 'social behavior') }, spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(subject, 'space and growth') } });
export const phase2Batch38Knowledge = Object.fromEntries(Object.entries(phase2Batch38Subjects).map(([id, subject]) => [id, makeKnowledge(subject)])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch38Authority = Object.fromEntries(Object.entries(phase2Batch38Subjects).map(([id, subject]) => [id, { feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` }, care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` } } satisfies Record<'feeding' | 'care', Phase2Batch38FieldAuthority>])) as Record<string, Record<'feeding' | 'care', Phase2Batch38FieldAuthority>>;
