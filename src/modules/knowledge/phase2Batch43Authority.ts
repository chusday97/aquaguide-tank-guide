import type { SpeciesKnowledgeProfile } from './knowledge.types';

export type Phase2Batch43FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };

export const phase2Batch43Subjects: Record<string, Subject> = {
  sp_0078: { source: 'batch45-professional-limnophila-aromatica', title: 'Limnophila aromatica plant review' },
  sp_0079: { source: 'batch45-professional-rotala-rotundifolia-red', title: 'Rotala rotundifolia red form review' },
  sp_0080: { source: 'batch45-professional-vesicularia-dubyana', title: 'Vesicularia dubyana plant review' },
  sp_0081: { source: 'batch45-professional-bolbitis-heudelotii', title: 'Bolbitis heudelotii plant review' },
  sp_0082: { source: 'batch45-professional-microsorum-pteropus', title: 'Microsorum pteropus plant review' },
  sp_0083: { source: 'batch45-professional-cryptocoryne-wendtii', title: 'Cryptocoryne wendtii green form review' },
  sp_0084: { source: 'batch45-professional-nymphaea-lotus', title: 'Nymphaea lotus plant review' },
  sp_0085: { source: 'batch45-professional-limnobium-laevigatum', title: 'Limnobium laevigatum plant review' },
  sp_0086: { source: 'batch45-professional-salvinia-natans', title: 'Salvinia natans plant review' },
  sp_0087: { source: 'batch45-professional-egeria-densa', title: 'Egeria densa plant review' },
  sp_0088: { source: 'batch45-professional-nymphaea-zenkeri', title: 'Nymphaea zenkeri red form review' },
  sp_0090: { source: 'batch45-professional-microsorum-pteropus-narrow', title: 'Microsorum pteropus narrow-leaf form review' },
  sp_0091: { source: 'batch45-professional-staurogyne-repens', title: 'Staurogyne repens plant review' },
  sp_0092: { source: 'batch45-professional-ludwigia-repens', title: 'Ludwigia repens red form review' },
  sp_0093: { source: 'batch45-professional-hemiantus-micranthemoides', title: 'Hemiantus micranthemoides plant review' },
};

const reviewedAt = '2026-09-17';
const evidence = (subject: Subject, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: [subject.source], reviewedAt, note: `${subject.title} was reviewed for ${field}; the professional plant record does not establish complete object-specific authority for this catalog object. No template, name inference, or base-species inheritance is promoted.` });
const makeKnowledge = (subject: Subject): SpeciesKnowledgeProfile['knowledge'] => ({ sexIdentification: { title: '植物不适用鱼类性别判断', summary: '该植物对象不适用鱼类公母辨别。', points: ['不将鱼类字段模板套用于植物。'], confidence: 'unknown', source: { type: 'unknown', label: '植物对象不适用', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: evidence(subject, 'sex identification') }, environment: { waterType: 'unknown', evidence: evidence(subject, 'environment') }, socialBehavior: { mode: 'unknown', summary: '植物对象不适用鱼类社会行为判断。', evidence: evidence(subject, 'social behavior') }, spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(subject, 'space and growth') } });
export const phase2Batch43Knowledge = Object.fromEntries(Object.entries(phase2Batch43Subjects).map(([id, subject]) => [id, makeKnowledge(subject)])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch43Authority = Object.fromEntries(Object.entries(phase2Batch43Subjects).map(([id, subject]) => [id, { feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` }, care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` } } satisfies Record<'feeding' | 'care', Phase2Batch43FieldAuthority>])) as Record<string, Record<'feeding' | 'care', Phase2Batch43FieldAuthority>>;
