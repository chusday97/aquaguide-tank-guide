import type { SpeciesKnowledgeProfile } from './knowledge.types';

export type Phase2Batch07FieldAuthority = {
  status: 'reviewed_unknown';
  citationIds: string[];
  factEvidence: string;
};

type Subject = { source: string; title: string };

export const phase2Batch07Subjects: Record<string, Subject> = {
  sp_0054: { source: 'batch09-fishbase-hemichromis-bimaculatus', title: 'Hemichromis bimaculatus FishBase species summary' },
  sp_0055: { source: 'batch09-fishbase-cichlasoma-var', title: 'Cichlasoma var. catalog taxon review' },
  sp_0056: { source: 'batch09-fishbase-heros-severus', title: 'Heros severus FishBase species summary' },
  sp_0057: { source: 'batch09-fishbase-altolamprologus-calvus', title: 'Altolamprologus calvus FishBase species summary' },
  sp_0058: { source: 'batch09-fishbase-neolamprologus-multifasciatus', title: 'Neolamprologus multifasciatus FishBase species summary' },
  sp_0062: { source: 'batch09-fishbase-moenkhausia-sanctaefilomenae', title: 'Moenkhausia sanctaefilomenae FishBase species summary' },
  sp_0069: { source: 'batch09-fishbase-cyprinus-carpio-var', title: 'Cyprinus carpio var. catalog taxon review' },
  sp_0070: { source: 'batch09-fishbase-cyprinus-carpio-longfin', title: 'Cyprinus carpio var. Longfin catalog variant review' },
  sp_0121: { source: 'batch09-fishbase-peckoltia-compta', title: 'Peckoltia compta FishBase species summary' },
  sp_0122: { source: 'batch09-fishbase-panaque-nigrolineatus', title: 'Panaque nigrolineatus FishBase species summary' },
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
  sexIdentification: {
    title: '本轮不提供稳定的公母辨别规则',
    summary: '来源不足以形成稳定的对象级性别判断。',
    points: ['不凭名称、品系或类别模板猜测性别。'],
    confidence: 'unknown',
    source: { type: 'unknown', label: '本批次性别证据不足', confidence: 'unknown' },
    reliableFromLifeStage: 'unknown',
    evidence: evidence(subject, 'sex identification'),
  },
  environment: { waterType: 'unknown', evidence: evidence(subject, 'environment') },
  socialBehavior: { mode: 'unknown', summary: '来源不足以确认稳定水族箱社会模式。', evidence: evidence(subject, 'social behavior') },
  spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(subject, 'space and growth') },
});

export const phase2Batch07Knowledge = Object.fromEntries(
  Object.entries(phase2Batch07Subjects).map(([id, subject]) => [id, makeKnowledge(subject)]),
) as Record<string, SpeciesKnowledgeProfile['knowledge']>;

export const phase2Batch07Authority = Object.fromEntries(
  Object.entries(phase2Batch07Subjects).map(([id, subject]) => [id, {
    feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` },
    care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` },
  } satisfies Record<'feeding' | 'care', Phase2Batch07FieldAuthority>]),
) as Record<string, Record<'feeding' | 'care', Phase2Batch07FieldAuthority>>;
