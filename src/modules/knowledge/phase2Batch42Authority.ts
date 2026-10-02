import type { SpeciesKnowledgeProfile } from './knowledge.types';

export type Phase2Batch42FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };

export const phase2Batch42Subjects: Record<string, Subject> = {
  sp_0261: { source: 'batch44-fishbase-betta-splendens-large-ear', title: 'Betta splendens Large-ear variant review' },
  sp_0262: { source: 'batch44-fishbase-betta-splendens-blue-dragon', title: 'Betta splendens Blue-dragon variant review' },
  sp_0389: { source: 'batch44-fishbase-betta-splendens-platinum-halfmoon', title: 'Betta splendens Platinum Halfmoon variant review' },
  sp_0390: { source: 'batch44-fishbase-betta-splendens-red-white-crown', title: 'Betta splendens Red-white Crown variant review' },
  sp_0391: { source: 'batch44-fishbase-betta-splendens-blue-dragon-crown', title: 'Betta splendens Blue-dragon Crown variant review' },
  sp_0071: { source: 'batch44-professional-hemianthus-callitrichoides', title: 'Hemianthus callitrichoides plant review' },
  sp_0072: { source: 'batch44-professional-eleocharis-acicularis', title: 'Eleocharis acicularis plant review' },
  sp_0073: { source: 'batch44-professional-utricularia-graminifolia', title: 'Utricularia graminifolia plant review' },
  sp_0074: { source: 'batch44-professional-bucephalandra', title: 'Bucephalandra plant review' },
  sp_0075: { source: 'batch44-professional-anubias-barteri-nana', title: 'Anubias barteri var. nana plant review' },
  sp_0076: { source: 'batch44-professional-anubias-barteri', title: 'Anubias barteri plant review' },
};

const reviewedAt = '2026-09-17';
const evidence = (subject: Subject, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: [subject.source], reviewedAt, note: `${subject.title} was reviewed for ${field}; the available professional record does not establish complete object-specific authority for this catalog object. No template, name inference, or base-species inheritance is promoted.` });
const makeKnowledge = (subject: Subject): SpeciesKnowledgeProfile['knowledge'] => ({ sexIdentification: { title: '本轮不提供稳定的对象级性别规则', summary: '该对象不适用或来源不足以形成稳定的对象级性别判断。', points: ['不凭名称、品系或类别模板猜测。'], confidence: 'unknown', source: { type: 'unknown', label: '本批次性别证据不足', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: evidence(subject, 'sex identification') }, environment: { waterType: 'unknown', evidence: evidence(subject, 'environment') }, socialBehavior: { mode: 'unknown', summary: '来源不足以确认稳定的水族箱社会模式。', evidence: evidence(subject, 'social behavior') }, spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(subject, 'space and growth') } });
export const phase2Batch42Knowledge = Object.fromEntries(Object.entries(phase2Batch42Subjects).map(([id, subject]) => [id, makeKnowledge(subject)])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch42Authority = Object.fromEntries(Object.entries(phase2Batch42Subjects).map(([id, subject]) => [id, { feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` }, care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` } } satisfies Record<'feeding' | 'care', Phase2Batch42FieldAuthority>])) as Record<string, Record<'feeding' | 'care', Phase2Batch42FieldAuthority>>;
