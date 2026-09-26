import type { SpeciesKnowledgeProfile } from './knowledge.types';

export type Phase2Batch18FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };
export const phase2Batch18Subjects: Record<string, Subject> = {
  sp_0117: { source: 'batch20-fishbase-osteoglossum-bicirrhosum', title: 'Osteoglossum bicirrhosum species review' },
  sp_0118: { source: 'batch20-fishbase-osteoglossum-ferreirai', title: 'Osteoglossum ferreirai species review' },
  sp_0119: { source: 'batch20-fishbase-pantodon-buchholzi', title: 'Pantodon buchholzi species review' },
  sp_0120: { source: 'batch20-fishbase-gymnotus-carapo', title: 'Gymnotus carapo species review' },
  sp_0127: { source: 'batch20-fishbase-botia-almorhae', title: 'Botia almorhae species review' },
  sp_0130: { source: 'batch20-fishbase-opsariichthys-bidens', title: 'Opsariichthys bidens species review' },
  sp_0131: { source: 'batch20-fishbase-mastacembelus-armatus', title: 'Mastacembelus armatus species review' },
  sp_0138: { source: 'batch20-fishbase-leporinus-fasciatus', title: 'Leporinus fasciatus species review' },
  sp_0139: { source: 'batch20-fishbase-piaractus-brachypomus', title: 'Piaractus brachypomus species review' },
  sp_0140: { source: 'batch20-fishbase-serrasalmus-rhombeus', title: 'Serrasalmus rhombeus species review' },
};
const reviewedAt = '2026-09-17';
const evidence = (subject: Subject, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: [subject.source], reviewedAt, note: `${subject.title} was reviewed for ${field}; the available professional record does not establish complete object-specific authority for this catalog object. No template, name inference, or base-species inheritance is promoted.` });
const makeKnowledge = (subject: Subject): SpeciesKnowledgeProfile['knowledge'] => ({
  sexIdentification: { title: '本轮不提供稳定的公母辨别规则', summary: '来源不足以形成稳定的对象级性别判断。', points: ['不凭名称、品系或类别模板猜测性别。'], confidence: 'unknown', source: { type: 'unknown', label: '本批次性别证据不足', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: evidence(subject, 'sex identification') },
  environment: { waterType: 'unknown', evidence: evidence(subject, 'environment') },
  socialBehavior: { mode: 'unknown', summary: '来源不足以确认稳定水族箱社会模式。', evidence: evidence(subject, 'social behavior') },
  spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(subject, 'space and growth') },
});
export const phase2Batch18Knowledge = Object.fromEntries(Object.entries(phase2Batch18Subjects).map(([id, subject]) => [id, makeKnowledge(subject)])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch18Authority = Object.fromEntries(Object.entries(phase2Batch18Subjects).map(([id, subject]) => [id, {
  feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` },
  care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` },
} satisfies Record<'feeding' | 'care', Phase2Batch18FieldAuthority>])) as Record<string, Record<'feeding' | 'care', Phase2Batch18FieldAuthority>>;
