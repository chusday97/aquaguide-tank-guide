import type { SpeciesKnowledgeProfile } from './knowledge.types';

export type Phase2Batch35FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };

export const phase2Batch35Subjects: Record<string, Subject> = {
  sp_0404: { source: 'batch37-worms-trachyphyllia-geoffroyi-purple', title: 'Trachyphyllia geoffroyi Purple variant taxonomy review' },
  sp_0405: { source: 'batch37-worms-tubastraea-coccinea-red', title: 'Tubastraea coccinea Red variant taxonomy review' },
  sp_0406: { source: 'batch37-fishbase-synchiropus-splendidus-xl', title: 'Synchiropus splendidus XL variant species review' },
  sp_0413: { source: 'batch37-fishbase-pangio-kuhlii-longfin', title: 'Pangio kuhlii Longfin variant species review' },
  sp_0426: { source: 'batch37-fishbase-tanichthys-albonubes-polar', title: 'Tanichthys albonubes Polar variant species review' },
  sp_0427: { source: 'batch37-fishbase-caridina-multidentata', title: 'Caridina multidentata species review' },
  sp_0439: { source: 'batch37-fishbase-puntigrus-tetrazona', title: 'Puntigrus tetrazona species review' },
  sp_0454: { source: 'batch37-fishbase-caridina-multidentata-duplicate', title: 'Caridina multidentata duplicate catalog object review' },
  sp_0458: { source: 'batch37-fishbase-kryptopterus-vitreolus', title: 'Kryptopterus vitreolus species review' },
  sp_0460: { source: 'batch37-fishbase-trachemys-scripta-elegans', title: 'Trachemys scripta elegans species review' },
};

const reviewedAt = '2026-09-17';
const evidence = (subject: Subject, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: [subject.source], reviewedAt, note: `${subject.title} was reviewed for ${field}; the available professional record does not establish complete object-specific authority for this catalog object. No template, name inference, or base-species inheritance is promoted.` });
const makeKnowledge = (subject: Subject): SpeciesKnowledgeProfile['knowledge'] => ({ sexIdentification: { title: '本轮不提供稳定的公母辨别规则', summary: '来源不足以形成稳定的对象级性别判断。', points: ['不凭名称、品系或类别模板猜测性别。'], confidence: 'unknown', source: { type: 'unknown', label: '本批次性别证据不足', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: evidence(subject, 'sex identification') }, environment: { waterType: 'unknown', evidence: evidence(subject, 'environment') }, socialBehavior: { mode: 'unknown', summary: '来源不足以确认稳定水族箱社会模式。', evidence: evidence(subject, 'social behavior') }, spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(subject, 'space and growth') } });
export const phase2Batch35Knowledge = Object.fromEntries(Object.entries(phase2Batch35Subjects).map(([id, subject]) => [id, makeKnowledge(subject)])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch35Authority = Object.fromEntries(Object.entries(phase2Batch35Subjects).map(([id, subject]) => [id, { feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` }, care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` } } satisfies Record<'feeding' | 'care', Phase2Batch35FieldAuthority>])) as Record<string, Record<'feeding' | 'care', Phase2Batch35FieldAuthority>>;
