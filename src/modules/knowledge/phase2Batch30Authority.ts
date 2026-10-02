import type { SpeciesKnowledgeProfile } from './knowledge.types';
export type Phase2Batch30FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };
export const phase2Batch30Subjects: Record<string, Subject> = {
  sp_0128: { source: 'batch32-fishbase-beaufortia-kweichowensis', title: 'Beaufortia kweichowensis species review' },
  sp_0132: { source: 'batch32-fishbase-parambassis-ranga', title: 'Parambassis ranga species review' },
  sp_0134: { source: 'batch32-fishbase-iriatherina-werneri', title: 'Iriatherina werneri species review' },
  sp_0135: { source: 'batch32-fishbase-pseudomugil-furcatus', title: 'Pseudomugil furcatus species review' },
  sp_0136: { source: 'batch32-fishbase-sphaerichthys-osphromenoides', title: 'Sphaerichthys osphromenoides species review' },
  sp_0137: { source: 'batch32-fishbase-semaprochilodus-insignis', title: 'Semaprochilodus insignis species review' },
  sp_0153: { source: 'batch32-fishbase-trichopodus-leerii-balloon', title: 'Trichopodus leerii Balloon variant review' },
  sp_0171: { source: 'batch32-fishbase-tanichthys-albonubes-albino', title: 'Tanichthys albonubes Albino variant review' },
  sp_0172: { source: 'batch32-fishbase-tanichthys-albonubes-longfin', title: 'Tanichthys albonubes Longfin variant review' },
  sp_0186: { source: 'batch32-fishbase-chaetodon-auriga', title: 'Chaetodon auriga species review' },
};
const reviewedAt = '2026-09-17';
const evidence = (subject: Subject, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: [subject.source], reviewedAt, note: `${subject.title} was reviewed for ${field}; the available professional record does not establish complete object-specific authority for this catalog object. No template, name inference, or base-species inheritance is promoted.` });
const makeKnowledge = (subject: Subject): SpeciesKnowledgeProfile['knowledge'] => ({ sexIdentification: { title: '本轮不提供稳定的公母辨别规则', summary: '来源不足以形成稳定的对象级性别判断。', points: ['不凭名称、品系或类别模板猜测性别。'], confidence: 'unknown', source: { type: 'unknown', label: '本批次性别证据不足', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: evidence(subject, 'sex identification') }, environment: { waterType: 'unknown', evidence: evidence(subject, 'environment') }, socialBehavior: { mode: 'unknown', summary: '来源不足以确认稳定水族箱社会模式。', evidence: evidence(subject, 'social behavior') }, spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(subject, 'space and growth') } });
export const phase2Batch30Knowledge = Object.fromEntries(Object.entries(phase2Batch30Subjects).map(([id, subject]) => [id, makeKnowledge(subject)])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch30Authority = Object.fromEntries(Object.entries(phase2Batch30Subjects).map(([id, subject]) => [id, { feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` }, care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` } } satisfies Record<'feeding' | 'care', Phase2Batch30FieldAuthority>])) as Record<string, Record<'feeding' | 'care', Phase2Batch30FieldAuthority>>;
