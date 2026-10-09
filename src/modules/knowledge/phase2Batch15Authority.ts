import type { SpeciesKnowledgeProfile } from './knowledge.types';

export type Phase2Batch15FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };
export const phase2Batch15Subjects: Record<string, Subject> = {
  sp_0416: { source: 'batch17-fishbase-andinoacara-pulcher-super-balloon', title: 'Andinoacara pulcher Super Balloon variant review' },
  sp_0417: { source: 'batch17-fishbase-mikrogeophagus-ramirezi-super-red-balloon', title: 'Mikrogeophagus ramirezi Super Red Balloon variant review' },
  sp_0419: { source: 'batch17-fishbase-danio-rerio-glo-orange-longfin', title: 'Danio rerio Glo Orange Longfin variant review' },
  sp_0421: { source: 'batch17-fishbase-gymnocorymbus-ternetzi-platinum-balloon-longfin', title: 'Gymnocorymbus ternetzi Platinum Balloon Longfin variant review' },
  sp_0428: { source: 'batch17-fishbase-neritina-natalensis', title: 'Neritina natalensis species review' },
  sp_0429: { source: 'batch17-fishbase-pomacea-bridgesii', title: 'Pomacea bridgesii species review' },
  sp_0449: { source: 'batch17-fishbase-labidochromis-caeruleus', title: 'Labidochromis caeruleus species review' },
  sp_0450: { source: 'batch17-fishbase-andinoacara-pulcher', title: 'Andinoacara pulcher species review' },
  sp_0452: { source: 'batch17-fishbase-amphiprion-ocellaris', title: 'Amphiprion ocellaris species review' },
  sp_0456: { source: 'batch17-fishbase-pomacea-bridgesii-duplicate-catalog', title: 'Pomacea bridgesii catalog object review' },
};
const reviewedAt = '2026-09-16';
const evidence = (subject: Subject, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: [subject.source], reviewedAt, note: `${subject.title} was reviewed for ${field}; the available professional record does not establish complete object-specific authority for this catalog object. No template, name inference, or base-species inheritance is promoted.` });
const makeKnowledge = (subject: Subject): SpeciesKnowledgeProfile['knowledge'] => ({
  sexIdentification: { title: '本轮不提供稳定的公母辨别规则', summary: '来源不足以形成稳定的对象级性别判断。', points: ['不凭名称、品系或类别模板猜测性别。'], confidence: 'unknown', source: { type: 'unknown', label: '本批次性别证据不足', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: evidence(subject, 'sex identification') },
  environment: { waterType: 'unknown', evidence: evidence(subject, 'environment') },
  socialBehavior: { mode: 'unknown', summary: '来源不足以确认稳定水族箱社会模式。', evidence: evidence(subject, 'social behavior') },
  spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(subject, 'space and growth') },
});
export const phase2Batch15Knowledge = Object.fromEntries(Object.entries(phase2Batch15Subjects).map(([id, subject]) => [id, makeKnowledge(subject)])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch15Authority = Object.fromEntries(Object.entries(phase2Batch15Subjects).map(([id, subject]) => [id, {
  feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` },
  care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` },
} satisfies Record<'feeding' | 'care', Phase2Batch15FieldAuthority>])) as Record<string, Record<'feeding' | 'care', Phase2Batch15FieldAuthority>>;
