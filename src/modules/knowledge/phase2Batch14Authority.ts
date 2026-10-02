import type { SpeciesKnowledgeProfile } from './knowledge.types';

export type Phase2Batch14FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };
export const phase2Batch14Subjects: Record<string, Subject> = {
  sp_0372: { source: 'batch16-fishbase-andinoacara-pulcher-balloon', title: 'Andinoacara pulcher Balloon variant review' },
  sp_0373: { source: 'batch16-fishbase-hemichromis-bimaculatus-balloon', title: 'Hemichromis bimaculatus Balloon variant review' },
  sp_0374: { source: 'batch16-fishbase-astronotus-ocellatus-balloon', title: 'Astronotus ocellatus Balloon variant review' },
  sp_0376: { source: 'batch16-fishbase-peckoltia-compta-super-gold', title: 'Peckoltia compta Super Gold variant review' },
  sp_0388: { source: 'batch16-fishbase-pterophyllum-scalare-super-red', title: 'Pterophyllum scalare Super Red variant review' },
  sp_0393: { source: 'batch16-fishbase-gymnocorymbus-ternetzi-platinum-longfin', title: 'Gymnocorymbus ternetzi Platinum Longfin variant review' },
  sp_0394: { source: 'batch16-fishbase-gymnocorymbus-ternetzi-glo-orange', title: 'Gymnocorymbus ternetzi Glo Orange variant review' },
  sp_0399: { source: 'batch16-fishbase-chrysiptera-cyanea-platinum', title: 'Chrysiptera cyanea Platinum variant review' },
  sp_0414: { source: 'batch16-fishbase-geophagus-sp-longfin-platinum', title: 'Geophagus sp. Longfin Platinum catalog variant review' },
  sp_0415: { source: 'batch16-fishbase-xiphophorus-hellerii-high-fin', title: 'Xiphophorus hellerii High Fin variant review' },
};
const reviewedAt = '2026-09-16';
const evidence = (subject: Subject, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: [subject.source], reviewedAt, note: `${subject.title} was reviewed for ${field}; the professional species record does not establish complete object-specific authority for this catalog variant. No template, name inference, or base-species inheritance is promoted.` });
const makeKnowledge = (subject: Subject): SpeciesKnowledgeProfile['knowledge'] => ({
  sexIdentification: { title: '本轮不提供稳定的公母辨别规则', summary: '来源不足以形成稳定的对象级性别判断。', points: ['不凭名称、品系或类别模板猜测性别。'], confidence: 'unknown', source: { type: 'unknown', label: '本批次性别证据不足', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: evidence(subject, 'sex identification') },
  environment: { waterType: 'unknown', evidence: evidence(subject, 'environment') },
  socialBehavior: { mode: 'unknown', summary: '来源不足以确认稳定水族箱社会模式。', evidence: evidence(subject, 'social behavior') },
  spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(subject, 'space and growth') },
});
export const phase2Batch14Knowledge = Object.fromEntries(Object.entries(phase2Batch14Subjects).map(([id, subject]) => [id, makeKnowledge(subject)])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch14Authority = Object.fromEntries(Object.entries(phase2Batch14Subjects).map(([id, subject]) => [id, {
  feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` },
  care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` },
} satisfies Record<'feeding' | 'care', Phase2Batch14FieldAuthority>])) as Record<string, Record<'feeding' | 'care', Phase2Batch14FieldAuthority>>;
