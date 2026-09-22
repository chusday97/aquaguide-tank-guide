import type { SpeciesKnowledgeProfile } from './knowledge.types';

export type Phase2Batch46FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };

export const phase2Batch46Subjects: Record<string, Subject> = {
  sp_0355: { source: 'batch48-professional-vallisneria-nana', title: 'Vallisneria nana plant review' },
  sp_0356: { source: 'batch48-professional-vallisneria-gigantea', title: 'Vallisneria gigantea plant review' },
  sp_0357: { source: 'batch48-professional-vesicularia-giant', title: 'Vesicularia sp. Giant variant review' },
  sp_0477: { source: 'batch48-professional-glossostigma-elatinoides', title: 'Glossostigma elatinoides plant review' },
  sp_0478: { source: 'batch48-professional-eleocharis-parvula', title: 'Eleocharis parvula plant review' },
  sp_0479: { source: 'batch48-professional-alternanthera-reineckii', title: 'Alternanthera reineckii plant review' },
  sp_0480: { source: 'batch48-professional-bacopa-monnieri', title: 'Bacopa monnieri plant review' },
  sp_0481: { source: 'batch48-professional-hygrophila-difformis', title: 'Hygrophila difformis plant review' },
  sp_0482: { source: 'batch48-professional-ludwigia-repens', title: 'Ludwigia repens plant review' },
  sp_0483: { source: 'batch48-professional-proserpinaca-palustris', title: 'Proserpinaca palustris plant review' },
  sp_0484: { source: 'batch48-professional-phyllanthus-fluitans', title: 'Phyllanthus fluitans plant review' },
  sp_0485: { source: 'batch48-professional-ceratopteris-thalictroides', title: 'Ceratopteris thalictroides plant review' },
  sp_0486: { source: 'batch48-professional-sagittaria-subulata', title: 'Sagittaria subulata plant review' },
};

const reviewedAt = '2026-09-17';
const evidence = (subject: Subject, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: [subject.source], reviewedAt, note: `${subject.title} was reviewed for ${field}; the professional plant record does not establish complete object-specific authority for this catalog object. No template, name inference, or base-species inheritance is promoted.` });
const makeKnowledge = (subject: Subject): SpeciesKnowledgeProfile['knowledge'] => ({ sexIdentification: { title: '植物不适用鱼类性别判断', summary: '该植物对象不适用鱼类公母辨别。', points: ['不将鱼类字段模板套用于植物。'], confidence: 'unknown', source: { type: 'unknown', label: '植物对象不适用', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: evidence(subject, 'sex identification') }, environment: { waterType: 'unknown', evidence: evidence(subject, 'environment') }, socialBehavior: { mode: 'unknown', summary: '植物对象不适用鱼类社会行为判断。', evidence: evidence(subject, 'social behavior') }, spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(subject, 'space and growth') } });
export const phase2Batch46Knowledge = Object.fromEntries(Object.entries(phase2Batch46Subjects).map(([id, subject]) => [id, makeKnowledge(subject)])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch46Authority = Object.fromEntries(Object.entries(phase2Batch46Subjects).map(([id, subject]) => [id, { feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` }, care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` } } satisfies Record<'feeding' | 'care', Phase2Batch46FieldAuthority>])) as Record<string, Record<'feeding' | 'care', Phase2Batch46FieldAuthority>>;
