import type { SpeciesKnowledgeProfile } from './knowledge.types';

export type Phase2Batch44FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };

export const phase2Batch44Subjects: Record<string, Subject> = {
  sp_0094: { source: 'batch46-professional-echinodorus-amazonicus', title: 'Echinodorus amazonicus plant review' },
  sp_0095: { source: 'batch46-professional-ludwigia-inclinata-verticillata', title: 'Ludwigia inclinata var. verticillata plant review' },
  sp_0096: { source: 'batch46-professional-bacopa-caroliniana', title: 'Bacopa caroliniana plant review' },
  sp_0097: { source: 'batch46-professional-myriophyllum-aquaticum', title: 'Myriophyllum aquaticum plant review' },
  sp_0098: { source: 'batch46-professional-blyxa-japonica', title: 'Blyxa japonica plant review' },
  sp_0099: { source: 'batch46-professional-riccia-fluitans', title: 'Riccia fluitans plant review' },
  sp_0100: { source: 'batch46-professional-vesicularia-sp', title: 'Vesicularia sp. plant review' },
  sp_0101: { source: 'batch46-professional-fissidens-fontanus', title: 'Fissidens fontanus plant review' },
  sp_0102: { source: 'batch46-professional-cryptocoryne-aponogetifolia', title: 'Cryptocoryne aponogetifolia plant review' },
  sp_0298: { source: 'batch46-professional-hemianthus-callitrichoides-variant', title: 'Hemianthus callitrichoides variant review' },
  sp_0299: { source: 'batch46-professional-eleocharis-acicularis-variant', title: 'Eleocharis acicularis variant review' },
  sp_0300: { source: 'batch46-professional-utricularia-graminifolia-variant', title: 'Utricularia graminifolia variant review' },
  sp_0301: { source: 'batch46-professional-bucephalandra-blue', title: 'Bucephalandra Blue variant review' },
  sp_0302: { source: 'batch46-professional-anubias-nana-mini', title: 'Anubias nana Mini variant review' },
  sp_0303: { source: 'batch46-professional-rotala-rotundifolia-red-variant', title: 'Rotala rotundifolia red variant review' },
};

const reviewedAt = '2026-09-17';
const evidence = (subject: Subject, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: [subject.source], reviewedAt, note: `${subject.title} was reviewed for ${field}; the professional plant record does not establish complete object-specific authority for this catalog object. No template, name inference, or base-species inheritance is promoted.` });
const makeKnowledge = (subject: Subject): SpeciesKnowledgeProfile['knowledge'] => ({ sexIdentification: { title: '植物不适用鱼类性别判断', summary: '该植物对象不适用鱼类公母辨别。', points: ['不将鱼类字段模板套用于植物。'], confidence: 'unknown', source: { type: 'unknown', label: '植物对象不适用', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: evidence(subject, 'sex identification') }, environment: { waterType: 'unknown', evidence: evidence(subject, 'environment') }, socialBehavior: { mode: 'unknown', summary: '植物对象不适用鱼类社会行为判断。', evidence: evidence(subject, 'social behavior') }, spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(subject, 'space and growth') } });
export const phase2Batch44Knowledge = Object.fromEntries(Object.entries(phase2Batch44Subjects).map(([id, subject]) => [id, makeKnowledge(subject)])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch44Authority = Object.fromEntries(Object.entries(phase2Batch44Subjects).map(([id, subject]) => [id, { feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` }, care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` } } satisfies Record<'feeding' | 'care', Phase2Batch44FieldAuthority>])) as Record<string, Record<'feeding' | 'care', Phase2Batch44FieldAuthority>>;
