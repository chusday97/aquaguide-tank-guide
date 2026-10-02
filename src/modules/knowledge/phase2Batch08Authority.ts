import type { SpeciesKnowledgeProfile } from './knowledge.types';

export type Phase2Batch08FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };

export const phase2Batch08Subjects: Record<string, Subject> = {
  sp_0123: { source: 'batch10-fishbase-pterygoplichthys-gibbiceps', title: 'Pterygoplichthys gibbiceps FishBase species summary' },
  sp_0125: { source: 'batch10-fishbase-hypancistrus-inspector', title: 'Hypancistrus inspector FishBase species summary' },
  sp_0129: { source: 'batch10-fishbase-zacco-platypus', title: 'Zacco platypus FishBase species summary' },
  sp_0146: { source: 'batch10-fishbase-mikrogeophagus-ramirezi-platinum', title: 'Mikrogeophagus ramirezi Platinum variant review' },
  sp_0152: { source: 'batch10-fishbase-danio-rerio-glofish', title: 'Danio rerio GloFish variant review' },
  sp_0157: { source: 'batch10-fishbase-mikrogeophagus-ramirezi-blue', title: 'Mikrogeophagus ramirezi Blue variant review' },
  sp_0158: { source: 'batch10-fishbase-xiphophorus-hellerii-var', title: 'Xiphophorus hellerii catalog variant review' },
  sp_0163: { source: 'batch10-fishbase-cyprinus-carpio-kohaku', title: 'Cyprinus carpio Kohaku variant review' },
  sp_0173: { source: 'batch10-fishbase-salminus-brasiliensis-var', title: 'Salminus brasiliensis catalog variant review' },
  sp_0174: { source: 'batch10-fishbase-gymnocorymbus-ternetzi-albino', title: 'Gymnocorymbus ternetzi Albino variant review' },
};

const reviewedAt = '2026-09-16';
const evidence = (subject: Subject, field: string) => ({
  confidence: 'unknown' as const,
  reviewStatus: 'reviewed' as const,
  sourceIds: [subject.source],
  reviewedAt,
  note: `${subject.title} was reviewed for ${field}; the available record does not establish a complete object-specific aquarium authority. No template, name inference, or base-species inheritance is promoted.`,
});
const makeKnowledge = (subject: Subject): SpeciesKnowledgeProfile['knowledge'] => ({
  sexIdentification: { title: '本轮不提供稳定的公母辨别规则', summary: '来源不足以形成稳定的对象级性别判断。', points: ['不凭名称、品系或类别模板猜测性别。'], confidence: 'unknown', source: { type: 'unknown', label: '本批次性别证据不足', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: evidence(subject, 'sex identification') },
  environment: { waterType: 'unknown', evidence: evidence(subject, 'environment') },
  socialBehavior: { mode: 'unknown', summary: '来源不足以确认稳定水族箱社会模式。', evidence: evidence(subject, 'social behavior') },
  spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(subject, 'space and growth') },
});
export const phase2Batch08Knowledge = Object.fromEntries(Object.entries(phase2Batch08Subjects).map(([id, subject]) => [id, makeKnowledge(subject)])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch08Authority = Object.fromEntries(Object.entries(phase2Batch08Subjects).map(([id, subject]) => [id, {
  feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` },
  care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` },
} satisfies Record<'feeding' | 'care', Phase2Batch08FieldAuthority>])) as Record<string, Record<'feeding' | 'care', Phase2Batch08FieldAuthority>>;
