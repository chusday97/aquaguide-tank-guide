import type { SpeciesKnowledgeProfile } from './knowledge.types';

export type Phase2Batch17FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };
export const phase2Batch17Subjects: Record<string, Subject> = {
  sp_0048: { source: 'batch19-fishbase-mastacembelus-armatus', title: 'Mastacembelus armatus species review' },
  sp_0050: { source: 'batch19-fishbase-channa-barca', title: 'Channa barca species review' },
  sp_0059: { source: 'batch19-fishbase-macropodus-opercularis', title: 'Macropodus opercularis species review' },
  sp_0103: { source: 'batch19-fishbase-scleropages-formosus', title: 'Scleropages formosus species review' },
  sp_0104: { source: 'batch19-fishbase-scleropages-formosus-red', title: 'Scleropages formosus Red variant review' },
  sp_0105: { source: 'batch19-fishbase-polypterus-ornatipinnis', title: 'Polypterus ornatipinnis species review' },
  sp_0108: { source: 'batch19-fishbase-channa-bleheri', title: 'Channa bleheri species review' },
  sp_0109: { source: 'batch19-fishbase-channa-aurantimaculata', title: 'Channa aurantimaculata species review' },
  sp_0110: { source: 'batch19-fishbase-channa-lorti', title: 'Channa lorti species review' },
  sp_0116: { source: 'batch19-fishbase-scleropages-formosus-green', title: 'Scleropages formosus Green variant review' },
};
const reviewedAt = '2026-09-16';
const evidence = (subject: Subject, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: [subject.source], reviewedAt, note: `${subject.title} was reviewed for ${field}; the available professional record does not establish complete object-specific authority for this catalog object. No template, name inference, or base-species inheritance is promoted.` });
const makeKnowledge = (subject: Subject): SpeciesKnowledgeProfile['knowledge'] => ({
  sexIdentification: { title: '本轮不提供稳定的公母辨别规则', summary: '来源不足以形成稳定的对象级性别判断。', points: ['不凭名称、品系或类别模板猜测性别。'], confidence: 'unknown', source: { type: 'unknown', label: '本批次性别证据不足', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: evidence(subject, 'sex identification') },
  environment: { waterType: 'unknown', evidence: evidence(subject, 'environment') },
  socialBehavior: { mode: 'unknown', summary: '来源不足以确认稳定水族箱社会模式。', evidence: evidence(subject, 'social behavior') },
  spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(subject, 'space and growth') },
});
export const phase2Batch17Knowledge = Object.fromEntries(Object.entries(phase2Batch17Subjects).map(([id, subject]) => [id, makeKnowledge(subject)])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch17Authority = Object.fromEntries(Object.entries(phase2Batch17Subjects).map(([id, subject]) => [id, {
  feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` },
  care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` },
} satisfies Record<'feeding' | 'care', Phase2Batch17FieldAuthority>])) as Record<string, Record<'feeding' | 'care', Phase2Batch17FieldAuthority>>;
