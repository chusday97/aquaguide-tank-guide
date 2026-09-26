import type { SpeciesKnowledgeProfile } from './knowledge.types';

export type Phase2Batch25FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };

export const phase2Batch25Subjects: Record<string, Subject> = {
  sp_0067: { source: 'batch27-fishbase-carassius-auratus-pearlscale', title: 'Carassius auratus Pearlscale variant review' },
  sp_0068: { source: 'batch27-fishbase-carassius-auratus-bubble-eye', title: 'Carassius auratus Bubble Eye variant review' },
  sp_0077: { source: 'batch27-aquaplant-cabomba-caroliniana', title: 'Cabomba caroliniana species review' },
  sp_0089: { source: 'batch27-kew-limnophila-aquatica', title: 'Limnophila aquatica species review' },
  sp_0111: { source: 'batch27-fishbase-sawbwa-resplendens', title: 'Sawbwa resplendens species review' },
  sp_0124: { source: 'batch27-fishbase-ancistrus-sp', title: 'Ancistrus sp. catalog review' },
  sp_0142: { source: 'batch27-fishbase-poecilia-sphenops-balloon', title: 'Poecilia sphenops Balloon variant review' },
  sp_0149: { source: 'batch27-fishbase-carassius-auratus-panda', title: 'Carassius auratus Panda variant review' },
  sp_0150: { source: 'batch27-fishbase-carassius-auratus-oranda-short-tail', title: 'Carassius auratus Oranda Short Tail variant review' },
  sp_0159: { source: 'batch27-fishbase-ancistrus-sp-gold', title: 'Ancistrus sp. Gold variant review' },
};

const reviewedAt = '2026-09-17';
const evidence = (subject: Subject, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: [subject.source], reviewedAt, note: `${subject.title} was reviewed for ${field}; the available professional record does not establish complete object-specific authority for this catalog object. No template, name inference, or base-species inheritance is promoted.` });
const makeKnowledge = (subject: Subject): SpeciesKnowledgeProfile['knowledge'] => ({
  sexIdentification: { title: '本轮不提供稳定的公母辨别规则', summary: '来源不足以形成稳定的对象级性别判断。', points: ['不凭名称、品系或类别模板猜测性别。'], confidence: 'unknown', source: { type: 'unknown', label: '本批次性别证据不足', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: evidence(subject, 'sex identification') },
  environment: { waterType: 'unknown', evidence: evidence(subject, 'environment') },
  socialBehavior: { mode: 'unknown', summary: '来源不足以确认稳定水族箱社会模式。', evidence: evidence(subject, 'social behavior') },
  spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(subject, 'space and growth') },
});

export const phase2Batch25Knowledge = Object.fromEntries(Object.entries(phase2Batch25Subjects).map(([id, subject]) => [id, makeKnowledge(subject)])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch25Authority = Object.fromEntries(Object.entries(phase2Batch25Subjects).map(([id, subject]) => [id, {
  feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` },
  care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` },
} satisfies Record<'feeding' | 'care', Phase2Batch25FieldAuthority>])) as Record<string, Record<'feeding' | 'care', Phase2Batch25FieldAuthority>>;
