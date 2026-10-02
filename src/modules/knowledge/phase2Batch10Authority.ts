import type { SpeciesKnowledgeProfile } from './knowledge.types';

export type Phase2Batch10FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };
export const phase2Batch10Subjects: Record<string, Subject> = {
  sp_0211: { source: 'batch12-fishbase-thorichthys-meeki-var', title: 'Thorichthys meeki catalog variant review' },
  sp_0214: { source: 'batch12-fishbase-pelvicachromis-pulcher-albino', title: 'Pelvicachromis pulcher Albino variant review' },
  sp_0217: { source: 'batch12-fishbase-geophagus-sp-platinum', title: 'Geophagus sp. Platinum catalog variant review' },
  sp_0218: { source: 'batch12-fishbase-hyphessobrycon-erythrostigma', title: 'Hyphessobrycon erythrostigma FishBase species summary' },
  sp_0219: { source: 'batch12-fishbase-mikrogeophagus-ramirezi-gold-balloon', title: 'Mikrogeophagus ramirezi Gold Balloon variant review' },
  sp_0220: { source: 'batch12-fishbase-mikrogeophagus-ramirezi-platinum-balloon', title: 'Mikrogeophagus ramirezi Platinum Balloon variant review' },
  sp_0221: { source: 'batch12-fishbase-apistogramma-agassizii-fire-red', title: 'Apistogramma agassizii Fire Red variant review' },
  sp_0227: { source: 'batch12-fishbase-gymnocorymbus-ternetzi-longfin', title: 'Gymnocorymbus ternetzi Longfin variant review' },
  sp_0228: { source: 'batch12-fishbase-gymnocorymbus-ternetzi-balloon', title: 'Gymnocorymbus ternetzi Balloon variant review' },
  sp_0235: { source: 'batch12-fishbase-nematobrycon-palmeri-platinum', title: 'Nematobrycon palmeri Platinum variant review' },
};
const reviewedAt = '2026-09-16';
const evidence = (subject: Subject, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: [subject.source], reviewedAt, note: `${subject.title} was reviewed for ${field}; the available record does not establish a complete object-specific aquarium authority. No template, name inference, or base-species inheritance is promoted.` });
const makeKnowledge = (subject: Subject): SpeciesKnowledgeProfile['knowledge'] => ({
  sexIdentification: { title: '本轮不提供稳定的公母辨别规则', summary: '来源不足以形成稳定的对象级性别判断。', points: ['不凭名称、品系或类别模板猜测性别。'], confidence: 'unknown', source: { type: 'unknown', label: '本批次性别证据不足', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: evidence(subject, 'sex identification') },
  environment: { waterType: 'unknown', evidence: evidence(subject, 'environment') },
  socialBehavior: { mode: 'unknown', summary: '来源不足以确认稳定水族箱社会模式。', evidence: evidence(subject, 'social behavior') },
  spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(subject, 'space and growth') },
});
export const phase2Batch10Knowledge = Object.fromEntries(Object.entries(phase2Batch10Subjects).map(([id, subject]) => [id, makeKnowledge(subject)])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch10Authority = Object.fromEntries(Object.entries(phase2Batch10Subjects).map(([id, subject]) => [id, {
  feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` },
  care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` },
} satisfies Record<'feeding' | 'care', Phase2Batch10FieldAuthority>])) as Record<string, Record<'feeding' | 'care', Phase2Batch10FieldAuthority>>;
