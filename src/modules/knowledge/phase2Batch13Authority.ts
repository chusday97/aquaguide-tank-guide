import type { SpeciesKnowledgeProfile } from './knowledge.types';

export type Phase2Batch13FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };

export const phase2Batch13Subjects: Record<string, Subject> = {
  sp_0289: { source: 'batch15-fishbase-danio-rerio-glo-red', title: 'Danio rerio Glo Red variant review' },
  sp_0290: { source: 'batch15-fishbase-danio-rerio-glo-green', title: 'Danio rerio Glo Green variant review' },
  sp_0291: { source: 'batch15-fishbase-danio-rerio-glo-orange', title: 'Danio rerio Glo Orange variant review' },
  sp_0294: { source: 'batch15-fishbase-gymnocorymbus-ternetzi-albino-balloon', title: 'Gymnocorymbus ternetzi Albino Balloon variant review' },
  sp_0338: { source: 'batch15-fishbase-pelvicachromis-pulcher-albino', title: 'Pelvicachromis pulcher Albino variant review' },
  sp_0340: { source: 'batch15-usgs-aphyocharax-anisitsi-balloon', title: 'Aphyocharax anisitsi Balloon variant review' },
  sp_0341: { source: 'batch15-fishbase-gymnocorymbus-ternetzi-longfin-white', title: 'Gymnocorymbus ternetzi Longfin White variant review' },
  sp_0359: { source: 'batch15-fishbase-boehlkea-fredcochui-blue', title: 'Boehlkea fredcochui Blue variant review' },
  sp_0363: { source: 'batch15-fishbase-danio-rerio-glo-purple', title: 'Danio rerio Glo Purple variant review' },
  sp_0364: { source: 'batch15-fishbase-danio-rerio-glo-pink', title: 'Danio rerio Glo Pink variant review' },
};

const reviewedAt = '2026-09-16';
const evidence = (subject: Subject, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: [subject.source], reviewedAt, note: `${subject.title} was reviewed for ${field}; the professional species record does not establish complete object-specific authority for this catalog variant. No template, name inference, or base-species inheritance is promoted.` });
const makeKnowledge = (subject: Subject): SpeciesKnowledgeProfile['knowledge'] => ({
  sexIdentification: { title: '本轮不提供稳定的公母辨别规则', summary: '来源不足以形成稳定的对象级性别判断。', points: ['不凭名称、品系或类别模板猜测性别。'], confidence: 'unknown', source: { type: 'unknown', label: '本批次性别证据不足', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: evidence(subject, 'sex identification') },
  environment: { waterType: 'unknown', evidence: evidence(subject, 'environment') },
  socialBehavior: { mode: 'unknown', summary: '来源不足以确认稳定水族箱社会模式。', evidence: evidence(subject, 'social behavior') },
  spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(subject, 'space and growth') },
});

export const phase2Batch13Knowledge = Object.fromEntries(Object.entries(phase2Batch13Subjects).map(([id, subject]) => [id, makeKnowledge(subject)])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch13Authority = Object.fromEntries(Object.entries(phase2Batch13Subjects).map(([id, subject]) => [id, {
  feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` },
  care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` },
} satisfies Record<'feeding' | 'care', Phase2Batch13FieldAuthority>])) as Record<string, Record<'feeding' | 'care', Phase2Batch13FieldAuthority>>;
