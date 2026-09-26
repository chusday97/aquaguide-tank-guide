import type { SpeciesKnowledgeProfile } from './knowledge.types';

export type Phase2Batch19FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };
export const phase2Batch19Subjects: Record<string, Subject> = {
  sp_0151: { source: 'batch21-fishbase-gymnocorymbus-ternetzi-color-morph', title: 'Gymnocorymbus ternetzi Color morph variant review' },
  sp_0156: { source: 'batch21-fishbase-trichopodus-trichopterus-platinum', title: 'Trichopodus trichopterus Platinum variant review' },
  sp_0179: { source: 'batch21-fishbase-trichopodus-trichopterus-balloon', title: 'Trichopodus trichopterus Balloon variant review' },
  sp_0181: { source: 'batch21-fishbase-gnathonemus-petersii', title: 'Gnathonemus petersii species review' },
  sp_0183: { source: 'batch21-fishbase-xanthichthys-mento', title: 'Xanthichthys mento species review' },
  sp_0184: { source: 'batch21-fishbase-centropyge-heraldi', title: 'Centropyge heraldi species review' },
  sp_0185: { source: 'batch21-fishbase-pomacanthus-annularis', title: 'Pomacanthus annularis species review' },
  sp_0197: { source: 'batch21-fishbase-channa-stewartii', title: 'Channa stewartii species review' },
  sp_0198: { source: 'batch21-fishbase-channa-diplogramma', title: 'Channa diplogramma species review' },
  sp_0199: { source: 'batch21-fishbase-badis-badis', title: 'Badis badis species review' },
};
const reviewedAt = '2026-09-17';
const evidence = (subject: Subject, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: [subject.source], reviewedAt, note: `${subject.title} was reviewed for ${field}; the available professional record does not establish complete object-specific authority for this catalog object. No template, name inference, or base-species inheritance is promoted.` });
const makeKnowledge = (subject: Subject): SpeciesKnowledgeProfile['knowledge'] => ({
  sexIdentification: { title: '本轮不提供稳定的公母辨别规则', summary: '来源不足以形成稳定的对象级性别判断。', points: ['不凭名称、品系或类别模板猜测性别。'], confidence: 'unknown', source: { type: 'unknown', label: '本批次性别证据不足', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: evidence(subject, 'sex identification') },
  environment: { waterType: 'unknown', evidence: evidence(subject, 'environment') },
  socialBehavior: { mode: 'unknown', summary: '来源不足以确认稳定水族箱社会模式。', evidence: evidence(subject, 'social behavior') },
  spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(subject, 'space and growth') },
});
export const phase2Batch19Knowledge = Object.fromEntries(Object.entries(phase2Batch19Subjects).map(([id, subject]) => [id, makeKnowledge(subject)])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch19Authority = Object.fromEntries(Object.entries(phase2Batch19Subjects).map(([id, subject]) => [id, {
  feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` },
  care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` },
} satisfies Record<'feeding' | 'care', Phase2Batch19FieldAuthority>])) as Record<string, Record<'feeding' | 'care', Phase2Batch19FieldAuthority>>;
