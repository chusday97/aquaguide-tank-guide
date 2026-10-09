import type { SpeciesKnowledgeProfile } from './knowledge.types';

export type Phase2Batch02FieldAuthority = {
  status: 'reviewed_unknown';
  citationIds: string[];
  factEvidence: string;
};

type Batch02Subject = {
  sourceId: string;
  sourceTitle: string;
  scientificName: string;
  variantNote: string;
};

export const phase2Batch02Subjects: Record<string, Batch02Subject> = {
  sp_0006: { sourceId: 'batch04-raffles-geosesarma-dennerle', sourceTitle: 'Geosesarma dennerle species description', scientificName: 'Geosesarma dennerle', variantNote: 'The source is a species description, not a captive aquarium protocol.' },
  sp_0035: { sourceId: 'batch04-raffles-geosesarma-dennerle', sourceTitle: 'Geosesarma dennerle species description', scientificName: 'Geosesarma dennerle', variantNote: 'The source is a species description, not a captive aquarium protocol.' },
  sp_0430: { sourceId: 'batch04-keys-anentome-helena', sourceTitle: "Anentome 'helena' freshwater mollusc account", scientificName: 'Anentome helena', variantNote: 'The source notes taxonomic uncertainty around the aquarium trade name.' },
  sp_0457: { sourceId: 'batch04-keys-anentome-helena', sourceTitle: "Anentome 'helena' freshwater mollusc account", scientificName: 'Anentome helena', variantNote: 'The source notes taxonomic uncertainty around the aquarium trade name.' },
  sp_0003: { sourceId: 'batch04-itis-caridina-dennerli', sourceTitle: 'Caridina dennerli ITIS taxon record', scientificName: 'Caridina dennerli', variantNote: 'The taxon record establishes identity only; it does not establish ornamental aquarium husbandry.' },
  sp_0029: { sourceId: 'batch04-itis-caridina-dennerli', sourceTitle: 'Caridina dennerli ITIS taxon record', scientificName: 'Caridina dennerli', variantNote: 'The taxon record establishes identity only; it does not establish ornamental aquarium husbandry.' },
  sp_0004: { sourceId: 'batch04-worms-vittina-turrita', sourceTitle: 'Vittina turrita WoRMS taxon record', scientificName: 'Vittina turrita', variantNote: 'The record confirms the accepted name but does not establish a complete aquarium care profile.' },
  sp_0032: { sourceId: 'batch04-worms-vittina-turrita', sourceTitle: 'Vittina turrita WoRMS taxon record', scientificName: 'Vittina turrita', variantNote: 'The record confirms the accepted name but does not establish a complete aquarium care profile.' },
  sp_0021: { sourceId: 'batch04-fishbase-amatitlania-nigrofasciata', sourceTitle: 'Amatitlania nigrofasciata FishBase species summary', scientificName: 'Amatitlania nigrofasciata var.', variantNote: 'The source describes the base species and does not identify the mini-parrot commercial variant.' },
  sp_0036: { sourceId: 'batch04-worms-vittina-turrita', sourceTitle: 'Vittina turrita WoRMS taxon record', scientificName: 'Neritina turrita var.', variantNote: 'The catalog object is a commercial variant and the source does not identify that variant.' },
};

const reviewedAt = '2026-09-16';
const unknownEvidence = (subject: Batch02Subject, field: string) => ({
  confidence: 'unknown' as const,
  reviewStatus: 'reviewed' as const,
  sourceIds: [subject.sourceId],
  reviewedAt,
  note: `${subject.sourceTitle} was reviewed for ${field}. ${subject.variantNote} No defensible object-specific claim is promoted.`,
});

const makeKnowledge = (subject: Batch02Subject): SpeciesKnowledgeProfile['knowledge'] => ({
  sexIdentification: {
    title: '本轮不提供稳定的公母辨别规则',
    summary: '已审阅来源不足以形成适用于该 catalog object 的稳定用户性别判断。',
    points: ['不凭名称、体色或类别模板猜测性别。'],
    confidence: 'unknown',
    source: { type: 'unknown', label: '本批次性别证据不足', confidence: 'unknown' },
    reliableFromLifeStage: 'unknown',
    evidence: unknownEvidence(subject, 'sex identification'),
  },
  environment: { waterType: 'unknown', evidence: unknownEvidence(subject, 'environment') },
  socialBehavior: { mode: 'unknown', summary: '来源不足以确认适用于该 catalog object 的稳定水族箱社会模式。', evidence: unknownEvidence(subject, 'social behavior') },
  spaceAndGrowth: { activityLevel: 'unknown', evidence: unknownEvidence(subject, 'space and growth') },
});

const miniParrotKnowledge: SpeciesKnowledgeProfile['knowledge'] = {
  ...makeKnowledge(phase2Batch02Subjects.sp_0021),
  spaceAndGrowth: {
    adultLengthCm: { max: 10, measurement: 'unknown' },
    activityLevel: 'unknown',
    spaceNotes: ['Catalog Review approved a maximum adult size of about 10 cm for this catalog object. No minimum aquarium volume or tank length is inferred from body size alone.'],
    evidence: {
      confidence: 'verified',
      reviewStatus: 'reviewed',
      sourceIds: ['batch03-fishbase-amatitlania-nigrofasciata'],
      reviewedAt: '2026-09-22',
      note: 'Explicit reviewed catalog-object bridge for adult size only; commercial-variant identity remains unresolved.',
    },
  },
};

export const phase2Batch02Knowledge: Record<string, SpeciesKnowledgeProfile['knowledge']> = Object.fromEntries(
  Object.entries(phase2Batch02Subjects).map(([speciesId, subject]) => [
    speciesId,
    speciesId === 'sp_0021' ? miniParrotKnowledge : makeKnowledge(subject),
  ]),
);

export const phase2Batch02Authority: Record<string, Partial<Record<'feeding' | 'care', Phase2Batch02FieldAuthority>>> = Object.fromEntries(
  Object.entries(phase2Batch02Subjects).map(([speciesId, subject]) => [speciesId, {
    feeding: { status: 'reviewed_unknown', citationIds: [subject.sourceId], factEvidence: `${subject.sourceTitle} was reviewed for feeding. ${subject.variantNote} No object-specific feeding regime is promoted.` },
    care: { status: 'reviewed_unknown', citationIds: [subject.sourceId], factEvidence: `${subject.sourceTitle} was reviewed for care. ${subject.variantNote} No object-specific care protocol is promoted.` },
  }]),
);
