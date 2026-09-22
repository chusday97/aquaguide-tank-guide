import type { SpeciesKnowledgeProfile } from './knowledge.types';

export type Phase2Batch41FieldAuthority = { status: 'reviewed_supported' | 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };

export const phase2Batch41Subjects: Record<string, Subject> = {
  sp_0437: { source: 'batch43-fishbase-poecilia-sphenops', title: 'Poecilia sphenops species review' },
  sp_0438: { source: 'batch43-fishbase-xiphophorus-hellerii', title: 'Xiphophorus hellerii species review' },
  sp_0447: { source: 'batch43-fishbase-symphysodon-aequifasciatus', title: 'Symphysodon aequifasciatus variant review' },
  sp_0451: { source: 'batch43-fishbase-astronotus-ocellatus', title: 'Astronotus ocellatus species review' },
  sp_0444: { source: 'batch43-fishbase-trichopodus-leerii', title: 'Trichopodus leerii species review' },
  sp_0468: { source: 'batch43-fishbase-trigonostigma-heteromorpha', title: 'Trigonostigma heteromorpha variant review' },
  sp_0053: { source: 'batch43-fishbase-corydoras-pygmaeus', title: 'Corydoras pygmaeus species review' },
  sp_0114: { source: 'batch43-fishbase-hyphessobrycon-amandae', title: 'Hyphessobrycon amandae species review' },
  sp_0259: { source: 'batch43-fishbase-betta-splendens-halfmoon', title: 'Betta splendens Halfmoon variant review' },
  sp_0260: { source: 'batch43-fishbase-betta-splendens-crown-tail', title: 'Betta splendens Crown-tail variant review' },
};

const reviewedAt = '2026-09-17';
const evidence = (subject: Subject, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: [subject.source], reviewedAt, note: `${subject.title} was reviewed for ${field}; the available professional record does not establish complete object-specific authority for this catalog object. No template, name inference, or base-species inheritance is promoted.` });
const makeKnowledge = (subject: Subject): SpeciesKnowledgeProfile['knowledge'] => ({ sexIdentification: { title: '本轮不提供稳定的公母辨别规则', summary: '来源不足以形成稳定的对象级性别判断。', points: ['不凭名称、品系或类别模板猜测性别。'], confidence: 'unknown', source: { type: 'unknown', label: '本批次性别证据不足', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: evidence(subject, 'sex identification') }, environment: { waterType: 'unknown', evidence: evidence(subject, 'environment') }, socialBehavior: { mode: 'unknown', summary: '来源不足以确认稳定水族箱社会模式。', evidence: evidence(subject, 'social behavior') }, spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(subject, 'space and growth') } });
export const phase2Batch41Knowledge = Object.fromEntries(Object.entries(phase2Batch41Subjects).map(([id, subject]) => [id, makeKnowledge(subject)])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch41Authority = Object.fromEntries(Object.entries(phase2Batch41Subjects).map(([id, subject]) => [id, { feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` }, care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` } } satisfies Record<'feeding' | 'care', Phase2Batch41FieldAuthority>])) as Record<string, Record<'feeding' | 'care', Phase2Batch41FieldAuthority>>;

Object.assign(phase2Batch41Authority.sp_0437!, {
  feeding: {
    status: 'reviewed_supported',
    citationIds: ['seriouslyfish-poecilia-sphenops'],
    factEvidence: 'Seriously Fish describes Poecilia sphenops as an omnivore taking zoobenthos and detritus and recommends that aquarium diets include a substantial vegetable component such as vegetable flakes or suitable greens.',
  },
  care: {
    status: 'reviewed_supported',
    citationIds: ['seriouslyfish-poecilia-sphenops'],
    factEvidence: 'Seriously Fish provides direct molly husbandry guidance including a 90 × 30 cm base, planted cover, moderately hard or harder alkaline water, 21–28°C conditions, and notes that salt is not required when mineral hardness is appropriate.',
  },
} satisfies Record<'feeding' | 'care', Phase2Batch41FieldAuthority>);

Object.assign(phase2Batch41Authority.sp_0438!, {
  feeding: {
    status: 'reviewed_supported',
    citationIds: ['seriouslyfish-xiphophorus-hellerii'],
    factEvidence: 'Seriously Fish describes Xiphophorus hellerii as a generalised omnivore and recommends a balanced aquarium diet of quality dried products with small live and frozen foods.',
  },
  care: {
    status: 'reviewed_supported',
    citationIds: ['seriouslyfish-xiphophorus-hellerii'],
    factEvidence: 'Seriously Fish provides direct swordtail husbandry guidance including a 120 × 30 cm base, planted cover with some water movement, 16–28°C water and moderately hard-to-hard conditions.',
  },
} satisfies Record<'feeding' | 'care', Phase2Batch41FieldAuthority>);

Object.assign(phase2Batch41Authority.sp_0468!, {
  feeding: {
    status: 'reviewed_supported',
    citationIds: ['seriouslyfish-trigonostigma-heteromorpha'],
    factEvidence: 'Seriously Fish describes Trigonostigma heteromorpha as a micropredator on small insects, worms, crustaceans and zooplankton and recommends small live/frozen foods alongside quality dried flakes and granules.',
  },
  care: {
    status: 'reviewed_supported',
    citationIds: ['seriouslyfish-trigonostigma-heteromorpha'],
    factEvidence: 'Seriously Fish provides direct harlequin rasbora husbandry guidance including a 60 × 30 cm minimum base, well-furnished or natural-style cover, relatively dim lighting, and 21–28°C water.',
  },
} satisfies Record<'feeding' | 'care', Phase2Batch41FieldAuthority>);

Object.assign(phase2Batch41Authority.sp_0444!, {
  feeding: {
    status: 'reviewed_supported',
    citationIds: ['seriouslyfish-trichopodus-leerii'],
    factEvidence: 'Seriously Fish records Trichopodus leerii as an unfussy feeder that accepts most foods offered.',
  },
  care: {
    status: 'reviewed_supported',
    citationIds: ['seriouslyfish-trichopodus-leerii'],
    factEvidence: 'Seriously Fish provides direct pearl gourami husbandry guidance including a 90 × 30 cm base, planted cover with floating vegetation and open swimming areas, and 24–30°C water.',
  },
} satisfies Record<'feeding' | 'care', Phase2Batch41FieldAuthority>);

Object.assign(phase2Batch41Authority.sp_0447!, {
  feeding: {
    status: 'reviewed_supported',
    citationIds: ['seriouslyfish-symphysodon-aequifasciatus'],
    factEvidence: 'Seriously Fish records wild Symphysodon aequifasciatus feeding mainly on zooplankton, insects and other small invertebrates.',
  },
  care: {
    status: 'reviewed_supported',
    citationIds: ['seriouslyfish-symphysodon-aequifasciatus'],
    factEvidence: 'Seriously Fish provides direct discus husbandry guidance supporting a large aquarium with substantial horizontal and vertical space and abundant planted or structural cover because the fish are shy and skittish.',
  },
} satisfies Record<'feeding' | 'care', Phase2Batch41FieldAuthority>);

Object.assign(phase2Batch41Authority.sp_0451!, {
  feeding: {
    status: 'reviewed_supported',
    citationIds: ['seriouslyfish-astronotus-ocellatus'],
    factEvidence: 'Seriously Fish describes Astronotus ocellatus as a generalised omnivore and recommends a quality cichlid pellet as the staple aquarium diet with regular live or frozen foods, while warning against overfeeding and routine mammalian/avian meat or feeder fish.',
  },
  care: {
    status: 'reviewed_supported',
    citationIds: ['seriouslyfish-astronotus-ocellatus'],
    factEvidence: 'Seriously Fish provides direct Oscar husbandry guidance including a 150 × 60 cm base for a single adult, efficient filtration, weekly 30–50% water changes, 20–28°C water and a robust natural-style setup rather than a delicate aquascape.',
  },
} satisfies Record<'feeding' | 'care', Phase2Batch41FieldAuthority>);
