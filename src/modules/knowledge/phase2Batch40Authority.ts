import type { SpeciesKnowledgeProfile } from './knowledge.types';

export type Phase2Batch40FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };

export const phase2Batch40Subjects: Record<string, Subject> = {
  sp_0398: { source: 'batch42-professional-caridina-cantonensis-panda', title: 'Caridina cantonensis Panda variant review' },
  sp_0455: { source: 'batch42-professional-neritina-natalensis', title: 'Neritina natalensis species review' },
  sp_0027: { source: 'batch42-professional-neocaridina-davidi-red', title: 'Neocaridina davidi Red variant review' },
  sp_0010: { source: 'batch42-fishbase-gymnocorymbus-ternetzi', title: 'Gymnocorymbus ternetzi species review' },
  sp_0011: { source: 'batch42-fishbase-xiphophorus-maculatus', title: 'Xiphophorus maculatus species review' },
  sp_0014: { source: 'batch42-fishbase-corydoras-aeneus', title: 'Corydoras aeneus species review' },
  sp_0431: { source: 'batch42-fishbase-paracheirodon-innesi', title: 'Paracheirodon innesi species review' },
  sp_0432: { source: 'batch42-fishbase-paracheirodon-axelrodi', title: 'Paracheirodon axelrodi species review' },
  sp_0434: { source: 'batch42-fishbase-tanichthys-albonubes', title: 'Tanichthys albonubes species review' },
  sp_0435: { source: 'batch42-fishbase-danio-rerio', title: 'Danio rerio species review' },
};

const reviewedAt = '2026-09-17';
const evidence = (subject: Subject, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: [subject.source], reviewedAt, note: `${subject.title} was reviewed for ${field}; the available professional record does not establish complete object-specific authority for this catalog object. No template, name inference, or base-species inheritance is promoted.` });
const makeKnowledge = (subject: Subject): SpeciesKnowledgeProfile['knowledge'] => ({ sexIdentification: { title: '本轮不提供稳定的公母辨别规则', summary: '来源不足以形成稳定的对象级性别判断。', points: ['不凭名称、品系或类别模板猜测性别。'], confidence: 'unknown', source: { type: 'unknown', label: '本批次性别证据不足', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: evidence(subject, 'sex identification') }, environment: { waterType: 'unknown', evidence: evidence(subject, 'environment') }, socialBehavior: { mode: 'unknown', summary: '来源不足以确认稳定水族箱社会模式。', evidence: evidence(subject, 'social behavior') }, spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(subject, 'space and growth') } });
export const phase2Batch40Knowledge = Object.fromEntries(Object.entries(phase2Batch40Subjects).map(([id, subject]) => [id, makeKnowledge(subject)])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch40Authority = Object.fromEntries(Object.entries(phase2Batch40Subjects).map(([id, subject]) => [id, { feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` }, care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` } } satisfies Record<'feeding' | 'care', Phase2Batch40FieldAuthority>])) as Record<string, Record<'feeding' | 'care', Phase2Batch40FieldAuthority>>;
