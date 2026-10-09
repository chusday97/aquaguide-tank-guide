import type { SpeciesKnowledgeProfile } from './knowledge.types';

export type Phase2Batch39FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };

export const phase2Batch39Subjects: Record<string, Subject> = {
  sp_0239: { source: 'batch41-professional-neocaridina-davidi-bloody-mary', title: 'Neocaridina davidi Bloody Mary variant review' },
  sp_0274: { source: 'batch41-professional-neocaridina-davidi-neon-gold', title: 'Neocaridina davidi Neon Gold variant review' },
  sp_0275: { source: 'batch41-professional-neocaridina-davidi-rili', title: 'Neocaridina davidi Rili variant review' },
  sp_0276: { source: 'batch41-professional-neocaridina-davidi-deep-blue', title: 'Neocaridina davidi Deep Blue variant review' },
  sp_0277: { source: 'batch41-professional-caridina-cantonensis-s-class', title: 'Caridina cantonensis S-Class variant review' },
  sp_0278: { source: 'batch41-professional-caridina-cantonensis-black-king-kong', title: 'Caridina cantonensis Black King Kong variant review' },
  sp_0279: { source: 'batch41-professional-neocaridina-davidi-blue-gold-back', title: 'Neocaridina davidi Blue Gold Back variant review' },
  sp_0342: { source: 'batch41-professional-neocaridina-davidi-blue-gold', title: 'Neocaridina davidi Blue Gold variant review' },
  sp_0396: { source: 'batch41-professional-neocaridina-davidi-blue-pearl', title: 'Neocaridina davidi Blue Pearl variant review' },
  sp_0397: { source: 'batch41-professional-caridina-cantonensis-flower', title: 'Caridina cantonensis Flower variant review' },
};

const reviewedAt = '2026-09-17';
const evidence = (subject: Subject, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: [subject.source], reviewedAt, note: `${subject.title} was reviewed for ${field}; the available professional record does not establish complete object-specific authority for this catalog object. No template, name inference, or base-species inheritance is promoted.` });
const makeKnowledge = (subject: Subject): SpeciesKnowledgeProfile['knowledge'] => ({ sexIdentification: { title: '本轮不提供稳定的公母辨别规则', summary: '来源不足以形成稳定的对象级性别判断。', points: ['不凭名称、品系或类别模板猜测性别。'], confidence: 'unknown', source: { type: 'unknown', label: '本批次性别证据不足', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: evidence(subject, 'sex identification') }, environment: { waterType: 'unknown', evidence: evidence(subject, 'environment') }, socialBehavior: { mode: 'unknown', summary: '来源不足以确认稳定水族箱社会模式。', evidence: evidence(subject, 'social behavior') }, spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(subject, 'space and growth') } });
export const phase2Batch39Knowledge = Object.fromEntries(Object.entries(phase2Batch39Subjects).map(([id, subject]) => [id, makeKnowledge(subject)])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch39Authority = Object.fromEntries(Object.entries(phase2Batch39Subjects).map(([id, subject]) => [id, { feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` }, care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` } } satisfies Record<'feeding' | 'care', Phase2Batch39FieldAuthority>])) as Record<string, Record<'feeding' | 'care', Phase2Batch39FieldAuthority>>;
