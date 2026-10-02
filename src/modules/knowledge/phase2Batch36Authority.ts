import type { SpeciesKnowledgeProfile } from './knowledge.types';

export type Phase2Batch36FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };

export const phase2Batch36Subjects: Record<string, Subject> = {
  sp_0461: { source: 'batch38-ncbi-mauremys-reevesii', title: 'Mauremys reevesii (Chinemys reevesii) taxonomy review' },
  sp_0462: { source: 'batch38-cites-mauremys-sinensis', title: 'Mauremys sinensis taxonomy review' },
  sp_0463: { source: 'batch38-tandfonline-sternotherus-carinatus', title: 'Sternotherus carinatus species review' },
  sp_0464: { source: 'batch38-cites-staurotypus-salvinii', title: 'Staurotypus salvinii taxonomy review' },
  sp_0465: { source: 'batch38-cites-carettochelys-insculpta', title: 'Carettochelys insculpta taxonomy review' },
  sp_0466: { source: 'batch38-cites-sternotherus-odoratus', title: 'Sternotherus odoratus taxonomy review' },
  sp_0467: { source: 'batch38-fishbase-hyphessobrycon-megalopterus', title: 'Hyphessobrycon megalopterus species review' },
  sp_0470: { source: 'batch38-fishbase-hyphessobrycon-herbertaxelrodi', title: 'Hyphessobrycon herbertaxelrodi species review' },
  sp_0471: { source: 'batch38-fishbase-moenkhausia-pittieri', title: 'Moenkhausia pittieri species review' },
  sp_0472: { source: 'batch38-fishbase-thayeria-boehlkei', title: 'Thayeria boehlkei species review' },
};

const reviewedAt = '2026-09-17';
const evidence = (subject: Subject, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: [subject.source], reviewedAt, note: `${subject.title} was reviewed for ${field}; the available professional record does not establish complete object-specific authority for this catalog object. No template, name inference, or base-species inheritance is promoted.` });
const makeKnowledge = (subject: Subject): SpeciesKnowledgeProfile['knowledge'] => ({ sexIdentification: { title: '本轮不提供稳定的公母辨别规则', summary: '来源不足以形成稳定的对象级性别判断。', points: ['不凭名称、品系或类别模板猜测性别。'], confidence: 'unknown', source: { type: 'unknown', label: '本批次性别证据不足', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: evidence(subject, 'sex identification') }, environment: { waterType: 'unknown', evidence: evidence(subject, 'environment') }, socialBehavior: { mode: 'unknown', summary: '来源不足以确认稳定水族箱社会模式。', evidence: evidence(subject, 'social behavior') }, spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(subject, 'space and growth') } });
export const phase2Batch36Knowledge = Object.fromEntries(Object.entries(phase2Batch36Subjects).map(([id, subject]) => [id, makeKnowledge(subject)])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch36Authority = Object.fromEntries(Object.entries(phase2Batch36Subjects).map(([id, subject]) => [id, { feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` }, care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` } } satisfies Record<'feeding' | 'care', Phase2Batch36FieldAuthority>])) as Record<string, Record<'feeding' | 'care', Phase2Batch36FieldAuthority>>;
