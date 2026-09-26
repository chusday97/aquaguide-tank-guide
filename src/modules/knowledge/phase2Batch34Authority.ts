import type { SpeciesKnowledgeProfile } from './knowledge.types';

export type Phase2Batch34FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };

export const phase2Batch34Subjects: Record<string, Subject> = {
  sp_0366: { source: 'batch36-fishbase-synchiropus-splendidus-variant', title: 'Synchiropus splendidus variant species review' },
  sp_0367: { source: 'batch36-worms-zoanthus-sp-snowflake', title: 'Zoanthus sp. Snowflake professional taxonomy review' },
  sp_0369: { source: 'batch36-worms-micromussa-lordhowensis', title: 'Micromussa lordhowensis professional taxonomy review' },
  sp_0371: { source: 'batch36-worms-haliclona-sp', title: 'Haliclona sp. professional taxonomy review' },
  sp_0377: { source: 'batch36-worms-aurelia-aurita', title: 'Aurelia aurita professional taxonomy review' },
  sp_0378: { source: 'batch36-worms-aurelia-coerulea', title: 'Aurelia coerulea professional taxonomy review' },
  sp_0380: { source: 'batch36-worms-phyllorhiza-punctata', title: 'Phyllorhiza punctata professional taxonomy review' },
  sp_0381: { source: 'batch36-worms-cassiopea-andromeda', title: 'Cassiopea andromeda professional taxonomy review' },
  sp_0383: { source: 'batch36-worms-cotylorhiza-tuberculata', title: 'Cotylorhiza tuberculata professional taxonomy review' },
  sp_0403: { source: 'batch36-worms-zoanthus-sp-snowflake', title: 'Zoanthus sp. Gold Center variant taxonomy review' },
};

const reviewedAt = '2026-09-17';
const evidence = (subject: Subject, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: [subject.source], reviewedAt, note: `${subject.title} was reviewed for ${field}; the available professional record does not establish complete object-specific authority for this catalog object. No template, name inference, or base-species inheritance is promoted.` });
const makeKnowledge = (subject: Subject): SpeciesKnowledgeProfile['knowledge'] => ({ sexIdentification: { title: '本轮不提供稳定的公母辨别规则', summary: '来源不足以形成稳定的对象级性别判断。', points: ['不凭名称、品系或类别模板猜测性别。'], confidence: 'unknown', source: { type: 'unknown', label: '本批次性别证据不足', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: evidence(subject, 'sex identification') }, environment: { waterType: 'unknown', evidence: evidence(subject, 'environment') }, socialBehavior: { mode: 'unknown', summary: '来源不足以确认稳定水族箱社会模式。', evidence: evidence(subject, 'social behavior') }, spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(subject, 'space and growth') } });
export const phase2Batch34Knowledge = Object.fromEntries(Object.entries(phase2Batch34Subjects).map(([id, subject]) => [id, makeKnowledge(subject)])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch34Authority = Object.fromEntries(Object.entries(phase2Batch34Subjects).map(([id, subject]) => [id, { feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` }, care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` } } satisfies Record<'feeding' | 'care', Phase2Batch34FieldAuthority>])) as Record<string, Record<'feeding' | 'care', Phase2Batch34FieldAuthority>>;
