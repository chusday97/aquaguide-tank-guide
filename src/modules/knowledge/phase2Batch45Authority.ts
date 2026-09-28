import type { SpeciesKnowledgeProfile } from './knowledge.types';

export type Phase2Batch45FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };

export const phase2Batch45Subjects: Record<string, Subject> = {
  sp_0304: { source: 'batch47-professional-rotala-rotundifolia-green', title: "Rotala rotundifolia 'Green' variant review" },
  sp_0305: { source: 'batch47-professional-microsorum-pteropus-iron', title: 'Microsorum pteropus Iron Crown variant review' },
  sp_0306: { source: 'batch47-professional-bolbitis-heudelotii-black', title: 'Bolbitis heudelotii Black Wood variant review' },
  sp_0307: { source: 'batch47-professional-vesicularia-dubyana-triangle', title: 'Vesicularia dubyana Triangle Moss variant review' },
  sp_0308: { source: 'batch47-professional-fissidens-fontanus-feather', title: 'Fissidens fontanus Feather Moss variant review' },
  sp_0309: { source: 'batch47-professional-cryptocoryne-wendtii-green', title: "Cryptocoryne wendtii 'Green' variant review" },
  sp_0310: { source: 'batch47-professional-echinodorus-amazonicus-large', title: 'Echinodorus amazonicus Large-leaf variant review' },
  sp_0311: { source: 'batch47-professional-limnobium-laevigatum-round', title: 'Limnobium laevigatum Round-leaf variant review' },
  sp_0312: { source: 'batch47-professional-nymphaea-lotus-red', title: 'Nymphaea lotus Red form review' },
  sp_0313: { source: 'batch47-professional-egeria-densa-centipede', title: 'Egeria densa Centipede form review' },
  sp_0314: { source: 'batch47-professional-staurogyne-repens-south-american', title: 'Staurogyne repens South-American form review' },
  sp_0315: { source: 'batch47-professional-ludwigia-inclinata-red', title: 'Ludwigia inclinata red form review' },
  sp_0316: { source: 'batch47-professional-myriophyllum-aquaticum-green', title: 'Myriophyllum aquaticum Green Feather variant review' },
  sp_0317: { source: 'batch47-professional-cryptocoryne-aponogetifolia-large', title: 'Cryptocoryne aponogetifolia Large-leaf variant review' },
  sp_0354: { source: 'batch47-professional-echinodorus-tenellus', title: 'Echinodorus tenellus plant review' },
};

const reviewedAt = '2026-09-17';
const evidence = (subject: Subject, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: [subject.source], reviewedAt, note: `${subject.title} was reviewed for ${field}; the professional plant record does not establish complete object-specific authority for this catalog object. No template, name inference, or base-species inheritance is promoted.` });
const makeKnowledge = (subject: Subject): SpeciesKnowledgeProfile['knowledge'] => ({ sexIdentification: { title: '植物不适用鱼类性别判断', summary: '该植物对象不适用鱼类公母辨别。', points: ['不将鱼类字段模板套用于植物。'], confidence: 'unknown', source: { type: 'unknown', label: '植物对象不适用', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: evidence(subject, 'sex identification') }, environment: { waterType: 'unknown', evidence: evidence(subject, 'environment') }, socialBehavior: { mode: 'unknown', summary: '植物对象不适用鱼类社会行为判断。', evidence: evidence(subject, 'social behavior') }, spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(subject, 'space and growth') } });
export const phase2Batch45Knowledge = Object.fromEntries(Object.entries(phase2Batch45Subjects).map(([id, subject]) => [id, makeKnowledge(subject)])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch45Authority = Object.fromEntries(Object.entries(phase2Batch45Subjects).map(([id, subject]) => [id, { feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` }, care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` } } satisfies Record<'feeding' | 'care', Phase2Batch45FieldAuthority>])) as Record<string, Record<'feeding' | 'care', Phase2Batch45FieldAuthority>>;
