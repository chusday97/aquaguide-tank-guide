import type { SpeciesKnowledgeProfile } from './knowledge.types';

export type Phase2Batch32FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };

export const phase2Batch32Subjects: Record<string, Subject> = {
  sp_0194: { source: 'batch34-worms-protula-bispiralis', title: 'Protula bispiralis professional taxonomy review' },
  sp_0195: { source: 'batch34-worms-astropecten-polyacanthus', title: 'Astropecten polyacanthus professional taxonomy review' },
  sp_0210: { source: 'batch34-fishbase-pangio-kuhlii-variant', title: 'Pangio kuhlii variant species review' },
  sp_0233: { source: 'batch34-fishbase-trichopodus-leerii-albino-balloon', title: 'Trichopodus leerii Albino Balloon variant review' },
  sp_0252: { source: 'batch34-fishbase-synodontis-nigriventris-white', title: 'Synodontis nigriventris White variant review' },
  sp_0267: { source: 'batch34-fishbase-trichopodus-leerii-red-head', title: 'Trichopodus leerii Red Head variant review' },
  sp_0295: { source: 'batch34-fishbase-melanotaenia-praecox-longfin', title: 'Melanotaenia praecox Longfin variant review' },
  sp_0320: { source: 'batch34-worms-sarcophyton-sp', title: 'Sarcophyton sp. professional taxonomy review' },
  sp_0324: { source: 'batch34-worms-actinodiscus-sp', title: 'Actinodiscus sp. professional taxonomy review' },
  sp_0326: { source: 'batch34-worms-trachyphyllia-geoffroyi', title: 'Trachyphyllia geoffroyi professional taxonomy review' },
};

const reviewedAt = '2026-09-17';
const evidence = (subject: Subject, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: [subject.source], reviewedAt, note: `${subject.title} was reviewed for ${field}; the available professional record does not establish complete object-specific authority for this catalog object. No template, name inference, or base-species inheritance is promoted.` });
const makeKnowledge = (subject: Subject): SpeciesKnowledgeProfile['knowledge'] => ({ sexIdentification: { title: '本轮不提供稳定的公母辨别规则', summary: '来源不足以形成稳定的对象级性别判断。', points: ['不凭名称、品系或类别模板猜测性别。'], confidence: 'unknown', source: { type: 'unknown', label: '本批次性别证据不足', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: evidence(subject, 'sex identification') }, environment: { waterType: 'unknown', evidence: evidence(subject, 'environment') }, socialBehavior: { mode: 'unknown', summary: '来源不足以确认稳定水族箱社会模式。', evidence: evidence(subject, 'social behavior') }, spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(subject, 'space and growth') } });
export const phase2Batch32Knowledge = Object.fromEntries(Object.entries(phase2Batch32Subjects).map(([id, subject]) => [id, makeKnowledge(subject)])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch32Authority = Object.fromEntries(Object.entries(phase2Batch32Subjects).map(([id, subject]) => [id, { feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` }, care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` } } satisfies Record<'feeding' | 'care', Phase2Batch32FieldAuthority>])) as Record<string, Record<'feeding' | 'care', Phase2Batch32FieldAuthority>>;
