import type { SpeciesKnowledgeProfile } from './knowledge.types';

export type Phase2Batch33FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };

export const phase2Batch33Subjects: Record<string, Subject> = {
  sp_0327: { source: 'batch35-worms-sabellastarte-spectabilis', title: 'Sabellastarte spectabilis professional taxonomy review' },
  sp_0328: { source: 'batch35-worms-fromia-milleporella', title: 'Fromia milleporella professional taxonomy review' },
  sp_0329: { source: 'batch35-worms-acropora-sp', title: 'Acropora sp. professional taxonomy review' },
  sp_0330: { source: 'batch35-worms-zoanthus-sp', title: 'Zoanthus sp. professional taxonomy review' },
  sp_0331: { source: 'batch35-worms-tubastraea-faulkneri', title: 'Tubastraea faulkneri professional taxonomy review' },
  sp_0332: { source: 'batch35-worms-palythoa-sp', title: 'Palythoa sp. professional taxonomy review' },
  sp_0335: { source: 'batch35-worms-clavularia-sp', title: 'Clavularia sp. professional taxonomy review' },
  sp_0336: { source: 'batch35-worms-tubastraea-coccinea', title: 'Tubastraea coccinea professional taxonomy review' },
  sp_0337: { source: 'batch35-worms-xenia-sp', title: 'Xenia sp. professional taxonomy review' },
  sp_0361: { source: 'batch35-fishbase-tanichthys-albonubes-longfin', title: 'Tanichthys albonubes Longfin variant review' },
};

const reviewedAt = '2026-09-17';
const evidence = (subject: Subject, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: [subject.source], reviewedAt, note: `${subject.title} was reviewed for ${field}; the available professional record does not establish complete object-specific authority for this catalog object. No template, name inference, or base-species inheritance is promoted.` });
const makeKnowledge = (subject: Subject): SpeciesKnowledgeProfile['knowledge'] => ({ sexIdentification: { title: '本轮不提供稳定的公母辨别规则', summary: '来源不足以形成稳定的对象级性别判断。', points: ['不凭名称、品系或类别模板猜测性别。'], confidence: 'unknown', source: { type: 'unknown', label: '本批次性别证据不足', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: evidence(subject, 'sex identification') }, environment: { waterType: 'unknown', evidence: evidence(subject, 'environment') }, socialBehavior: { mode: 'unknown', summary: '来源不足以确认稳定水族箱社会模式。', evidence: evidence(subject, 'social behavior') }, spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(subject, 'space and growth') } });
export const phase2Batch33Knowledge = Object.fromEntries(Object.entries(phase2Batch33Subjects).map(([id, subject]) => [id, makeKnowledge(subject)])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch33Authority = Object.fromEntries(Object.entries(phase2Batch33Subjects).map(([id, subject]) => [id, { feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` }, care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` } } satisfies Record<'feeding' | 'care', Phase2Batch33FieldAuthority>])) as Record<string, Record<'feeding' | 'care', Phase2Batch33FieldAuthority>>;
