import type { SpeciesKnowledgeProfile } from './knowledge.types';

export type Phase2Batch37FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };

export const phase2Batch37Subjects: Record<string, Subject> = {
  sp_0473: { source: 'batch39-fishbase-nannostomus-beckfordi', title: 'Nannostomus beckfordi species review' },
  sp_0474: { source: 'batch39-fishbase-oryzias-latipes-killifish-variant', title: 'Oryzias latipes variant species review' },
  sp_0476: { source: 'batch39-professional-pomacea-diffusa', title: 'Pomacea diffusa species review' },
  sp_0012: { source: 'batch39-fishbase-puntius-titteya', title: 'Puntius titteya species review' },
  sp_0147: { source: 'batch39-fishbase-amatitlania-nigrofasciata-blue', title: 'Amatitlania nigrofasciata Blue variant review' },
  sp_0148: { source: 'batch39-fishbase-amatitlania-nigrofasciata-white', title: 'Amatitlania nigrofasciata White variant review' },
  sp_0222: { source: 'batch39-fishbase-amatitlania-nigrofasciata-jellybean', title: 'Amatitlania nigrofasciata Jellybean variant review' },
  sp_0258: { source: 'batch39-fishbase-betta-splendens-koi', title: 'Betta splendens Koi variant review' },
  sp_0433: { source: 'batch39-fishbase-hemigrammus-rhodostomus', title: 'Hemigrammus rhodostomus species review' },
  sp_0434: { source: 'batch39-fishbase-tanichthys-albonubes', title: 'Tanichthys albonubes species review' },
};

const reviewedAt = '2026-09-17';
const evidence = (subject: Subject, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: [subject.source], reviewedAt, note: `${subject.title} was reviewed for ${field}; the available professional record does not establish complete object-specific authority for this catalog object. No template, name inference, or base-species inheritance is promoted.` });
const makeKnowledge = (subject: Subject): SpeciesKnowledgeProfile['knowledge'] => ({ sexIdentification: { title: '本轮不提供稳定的公母辨别规则', summary: '来源不足以形成稳定的对象级性别判断。', points: ['不凭名称、品系或类别模板猜测性别。'], confidence: 'unknown', source: { type: 'unknown', label: '本批次性别证据不足', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: evidence(subject, 'sex identification') }, environment: { waterType: 'unknown', evidence: evidence(subject, 'environment') }, socialBehavior: { mode: 'unknown', summary: '来源不足以确认稳定水族箱社会模式。', evidence: evidence(subject, 'social behavior') }, spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(subject, 'space and growth') } });
export const phase2Batch37Knowledge = Object.fromEntries(Object.entries(phase2Batch37Subjects).map(([id, subject]) => [id, makeKnowledge(subject)])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch37Authority = Object.fromEntries(Object.entries(phase2Batch37Subjects).map(([id, subject]) => [id, { feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` }, care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` } } satisfies Record<'feeding' | 'care', Phase2Batch37FieldAuthority>])) as Record<string, Record<'feeding' | 'care', Phase2Batch37FieldAuthority>>;
