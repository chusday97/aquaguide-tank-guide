import type { SpeciesKnowledgeProfile } from './knowledge.types';

export type Phase2Batch16FieldAuthority = { status: 'reviewed_supported' | 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };
export const phase2Batch16Subjects: Record<string, Subject> = {
  sp_0001: { source: 'batch18-fishbase-neocaridina-davidi-red', title: 'Neocaridina davidi Red variant review' },
  sp_0007: { source: 'batch18-fishbase-ambystoma-mexicanum', title: 'Ambystoma mexicanum species review' },
  sp_0008: { source: 'batch18-fishbase-cynops-orientalis', title: 'Cynops orientalis species review' },
  sp_0009: { source: 'batch18-fishbase-ceratophrys-ornata', title: 'Ceratophrys ornata species review' },
  sp_0015: { source: 'batch18-fishbase-helostoma-temminkii', title: 'Helostoma temminkii species review' },
  sp_0022: { source: 'batch18-fishbase-lutjanus-kasmira', title: 'Lutjanus kasmira species review' },
  sp_0038: { source: 'batch18-fishbase-opsariichthys-bidens', title: 'Opsariichthys bidens species review' },
  sp_0043: { source: 'batch18-fishbase-macropodus-ocellatus', title: 'Macropodus ocellatus species review' },
  sp_0044: { source: 'batch18-fishbase-macropodus-spechti', title: 'Macropodus spechti species review' },
  sp_0047: { source: 'batch18-fishbase-tachysurus-fulvidraco', title: 'Tachysurus fulvidraco species review' },
};
const reviewedAt = '2026-09-16';
const evidence = (subject: Subject, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: [subject.source], reviewedAt, note: `${subject.title} was reviewed for ${field}; the available professional record does not establish complete object-specific authority for this catalog object. No template, name inference, or base-species inheritance is promoted.` });
const makeKnowledge = (subject: Subject): SpeciesKnowledgeProfile['knowledge'] => ({
  sexIdentification: { title: '本轮不提供稳定的公母辨别规则', summary: '来源不足以形成稳定的对象级性别判断。', points: ['不凭名称、品系或类别模板猜测性别。'], confidence: 'unknown', source: { type: 'unknown', label: '本批次性别证据不足', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: evidence(subject, 'sex identification') },
  environment: { waterType: 'unknown', evidence: evidence(subject, 'environment') },
  socialBehavior: { mode: 'unknown', summary: '来源不足以确认稳定水族箱社会模式。', evidence: evidence(subject, 'social behavior') },
  spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(subject, 'space and growth') },
});
const kissingGouramiKnowledge: SpeciesKnowledgeProfile['knowledge'] = {
  ...makeKnowledge(phase2Batch16Subjects.sp_0015),
  environment: {
    waterType: 'freshwater',
    temperatureRangeC: { min: 22, max: 28 },
    phRange: { min: 6, max: 8 },
    notes: [
      'FishBase records freshwater habitat, 22–28°C and pH 6–8.',
      'Seriously Fish describes slow-moving or standing habitats and gives a broader 22–30°C aquarium range; the narrower FishBase temperature range is retained for compatibility planning.',
    ],
    evidence: {
      confidence: 'verified',
      reviewStatus: 'reviewed',
      sourceIds: ['batch18-fishbase-helostoma-temminkii', 'seriouslyfish-helostoma-temminkii'],
      reviewedAt: '2026-10-10',
      note: 'Object-specific environmental authority from FishBase plus curated aquarium husbandry.',
    },
  },
  socialBehavior: {
    mode: 'variable',
    territoriality: 'medium',
    predationRisk: 'low',
    summary: '成体并非必须群居；空间不足时可对同类或相似体型鱼表现攻击，“接吻”至少部分与社会支配有关。可在足够大的缸中群养，但不设未经证据支持的最低群体数。',
    evidence: {
      confidence: 'verified',
      reviewStatus: 'reviewed',
      sourceIds: ['seriouslyfish-helostoma-temminkii'],
      reviewedAt: '2026-10-10',
      note: 'Seriously Fish directly describes conditional aggression, dominance-related kissing and non-obligate adult grouping.',
    },
  },
  spaceAndGrowth: {
    adultLengthCm: { max: 30, measurement: 'TL' },
    minVolumeLiters: 304,
    minTankLengthCm: 150,
    activityLevel: 'medium',
    spaceNotes: [
      'FishBase reports up to 30 cm TL and at least 150 cm aquarium length.',
      'Seriously Fish recommends a long-term base of at least 150 × 45 cm, approximately 304 L.',
    ],
    evidence: {
      confidence: 'verified',
      reviewStatus: 'reviewed',
      sourceIds: ['batch18-fishbase-helostoma-temminkii', 'seriouslyfish-helostoma-temminkii'],
      reviewedAt: '2026-10-10',
      note: 'Reviewed adult-size and aquarium-space authority; no maximum stocking count is inferred.',
    },
  },
};

const fireRedShrimpKnowledge: SpeciesKnowledgeProfile['knowledge'] = {
  ...makeKnowledge(phase2Batch16Subjects.sp_0001),
  environment: {
    waterType: 'freshwater',
    notes: ['UF/IFAS identifies the red/cherry morph as Neocaridina davidi and describes the species as a freshwater ornamental shrimp from freshwater streams.'],
    evidence: {
      confidence: 'verified',
      reviewStatus: 'reviewed',
      sourceIds: ['uf-ifas-neocaridina-davidi'],
      reviewedAt: '2026-09-22',
    },
  },
  socialBehavior: {
    mode: 'group',
    swimmingZone: 'bottom',
    territoriality: 'unknown',
    predationRisk: 'unknown',
    summary: 'Peer-reviewed work describes red cherry shrimp as highly gregarious; reviewed ecology sources also place the species as a benthic freshwater shrimp. This supports group-living context, but not a hard minimum group count.',
    evidence: {
      confidence: 'verified',
      reviewStatus: 'reviewed',
      sourceIds: ['neocaridina-social-environment-study', 'uf-ifas-neocaridina-davidi'],
      reviewedAt: '2026-09-22',
    },
  },
  spaceAndGrowth: {
    adultLengthCm: { max: 4, measurement: 'unknown' },
    activityLevel: 'unknown',
    swimmingZone: 'bottom',
    spaceNotes: ['UF/IFAS reports Neocaridina davidi adults around 3-4 cm. No minimum aquarium volume or tank length is inferred from body size alone.'],
    evidence: {
      confidence: 'verified',
      reviewStatus: 'reviewed',
      sourceIds: ['uf-ifas-neocaridina-davidi'],
      reviewedAt: '2026-09-22',
    },
  },
};


const roundtailParadiseFishKnowledge: SpeciesKnowledgeProfile['knowledge'] = {
  ...makeKnowledge(phase2Batch16Subjects.sp_0043),
  environment: {
    waterType: 'freshwater',
    temperatureRangeC: { min: 10, max: 22 },
    phRange: { min: 6, max: 7.5 },
    hardnessDgh: { min: 5, max: 20 },
    notes: [
      'Seriously Fish gives aquarium conditions of 10–22°C, pH 6.0–7.5 and 5–20 dGH.',
      'FishBase records a broader natural thermal envelope of roughly 4–25°C; the narrower aquarium range is retained for compatibility planning.',
    ],
    evidence: {
      confidence: 'verified',
      reviewStatus: 'reviewed',
      sourceIds: ['batch18-fishbase-macropodus-ocellatus', 'seriouslyfish-macropodus-ocellatus'],
      reviewedAt: '2026-10-10',
      note: 'Object-specific environment authority from FishBase plus direct aquarium husbandry.',
    },
  },
  socialBehavior: {
    mode: 'variable',
    territoriality: 'medium',
    predationRisk: 'low',
    summary: '繁殖期雄鱼会明显护域；在空间足够、布置充分的缸中可以群养，因此不应把该物种永久标记为“必须单养”。',
    evidence: {
      confidence: 'verified',
      reviewStatus: 'reviewed',
      sourceIds: ['seriouslyfish-macropodus-ocellatus'],
      reviewedAt: '2026-10-10',
      note: 'Seriously Fish directly states breeding males are territorial while groups can be maintained in a suitably sized, well-decorated aquarium.',
    },
  },
  spaceAndGrowth: {
    adultLengthCm: { max: 8.6, measurement: 'TL' },
    minVolumeLiters: 72,
    minTankLengthCm: 80,
    activityLevel: 'medium',
    needsCover: true,
    spaceNotes: [
      'FishBase reports up to 8.6 cm TL.',
      'Seriously Fish recommends at least an 80 × 30 cm base, approximately 72 L, for a single pair.',
    ],
    evidence: {
      confidence: 'verified',
      reviewStatus: 'reviewed',
      sourceIds: ['batch18-fishbase-macropodus-ocellatus', 'seriouslyfish-macropodus-ocellatus'],
      reviewedAt: '2026-10-10',
      note: 'Reviewed adult-size and aquarium-space authority.',
    },
  },
};

export const phase2Batch16Knowledge = Object.fromEntries(Object.entries(phase2Batch16Subjects).map(([id, subject]) => [
  id,
  id === 'sp_0001' ? fireRedShrimpKnowledge
    : id === 'sp_0015' ? kissingGouramiKnowledge
      : id === 'sp_0043' ? roundtailParadiseFishKnowledge
        : makeKnowledge(subject),
])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch16Authority = Object.fromEntries(Object.entries(phase2Batch16Subjects).map(([id, subject]) => [id, {
  feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` },
  care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` },
} satisfies Record<'feeding' | 'care', Phase2Batch16FieldAuthority>])) as Record<string, Record<'feeding' | 'care', Phase2Batch16FieldAuthority>>;

Object.assign(phase2Batch16Authority.sp_0001!, {
  feeding: {
    status: 'reviewed_supported',
    citationIds: ['batch18-fishbase-neocaridina-davidi-red', 'uf-ifas-neocaridina-davidi'],
    factEvidence: 'The reviewed red-variant record anchors this catalog object to Neocaridina davidi, while UF/IFAS explicitly covers red/cherry morphs and describes N. davidi as an opportunistic detritivore grazing leaf litter, algae, biofilm, dead plant/animal material and meiofauna. This supports feeding ecology without inventing a packaged-food schedule.',
  },
} satisfies Partial<Record<'feeding' | 'care', Phase2Batch16FieldAuthority>>);

Object.assign(phase2Batch16Authority.sp_0001!, {
  care: {
    status: 'reviewed_supported',
    citationIds: ['lajar-neocaridina-davidi-culture-2024', 'uf-ifas-neocaridina-davidi'],
    factEvidence: 'A peer-reviewed aquarium experiment explicitly included the fire-red/red Neocaridina davidi phenotype in previously cycled 40-L freshwater tanks with filtration/aeration, sand and plants, monitored water chemistry, 28 ± 2°C and weekly 30% water renewal. These are demonstrated culture conditions, not universal optimum or minimum claims.',
  },
} satisfies Partial<Record<'feeding' | 'care', Phase2Batch16FieldAuthority>>);


Object.assign(phase2Batch16Authority.sp_0015!, {
  feeding: {
    status: 'reviewed_supported',
    citationIds: ['batch18-fishbase-helostoma-temminkii', 'seriouslyfish-helostoma-temminkii'],
    factEvidence: 'FishBase records plants, green algae, zooplankton and aquatic insects in the diet. Seriously Fish describes specialised microphagous filter-feeding plus algae/microorganism grazing and recommends suitably small dried, vegetable-rich, live and frozen foods; no rigid feeding frequency is inferred.',
  },
  care: {
    status: 'reviewed_supported',
    citationIds: ['seriouslyfish-helostoma-temminkii'],
    factEvidence: 'Seriously Fish provides direct long-term husbandry guidance: at least 150 × 45 cm (~304 L), efficient filtration without excessive flow, open swimming space, access to atmospheric air, and regular 30–50% weekly water changes. These are reviewed care requirements, not a generic template.',
  },
} satisfies Partial<Record<'feeding' | 'care', Phase2Batch16FieldAuthority>>);
