import type { SpeciesKnowledgeProfile } from './knowledge.types';

const reviewedAt = '2026-10-11';

const reviewedEvidence = (sourceIds: string[], note: string) => ({
  confidence: 'verified' as const,
  reviewStatus: 'reviewed' as const,
  sourceIds,
  reviewedAt,
  note,
});

const unknownEvidence = (sourceIds: string[], note: string) => ({
  confidence: 'unknown' as const,
  reviewStatus: 'reviewed' as const,
  sourceIds,
  reviewedAt,
  note,
});

const unknownSex = (sourceIds: string[]): SpeciesKnowledgeProfile['knowledge']['sexIdentification'] => ({
  title: '本轮不提供稳定的公母外观判断',
  summary: '当前批次只提升与环境、空间和混养直接相关的字段；没有足够对象级证据支持稳定性别判断。',
  points: ['不要从同属物种、贸易名或旧模板继承性别特征。'],
  confidence: 'unknown',
  source: { type: 'unknown', label: '缺少稳定的对象级性别鉴别规则', confidence: 'unknown' },
  reliableFromLifeStage: 'unknown',
  evidence: unknownEvidence(sourceIds, 'No stable object-level sex-identification rule is promoted in this batch.'),
});

const build = (
  sourceIds: string[],
  environment: Omit<NonNullable<SpeciesKnowledgeProfile['knowledge']['environment']>, 'evidence'>,
  socialBehavior: Omit<NonNullable<SpeciesKnowledgeProfile['knowledge']['socialBehavior']>, 'evidence'>,
  spaceAndGrowth: Omit<NonNullable<SpeciesKnowledgeProfile['knowledge']['spaceAndGrowth']>, 'evidence'>,
  notes: { environment?: string; social?: string; space?: string } = {},
): SpeciesKnowledgeProfile['knowledge'] => ({
  sexIdentification: unknownSex(sourceIds),
  environment: {
    ...environment,
    evidence: reviewedEvidence(sourceIds, notes.environment ?? 'Only reviewed object-level environment facts are promoted.'),
  },
  socialBehavior: {
    ...socialBehavior,
    evidence: reviewedEvidence(sourceIds, notes.social ?? 'Only reviewed object-level social and predation boundaries are promoted.'),
  },
  spaceAndGrowth: {
    activityLevel: 'unknown',
    ...spaceAndGrowth,
    evidence: reviewedEvidence(sourceIds, notes.space ?? 'Only reviewed object-level adult-size and/or minimum-space facts are promoted.'),
  },
});

const scleropages = ['batch19-fishbase-scleropages-formosus', 'seriouslyfish-scleropages-formosus'];
const ram = ['seriouslyfish-mikrogeophagus-ramirezi', 'fishbase-mikrogeophagus-ramirezi'];
const tetra = ['seriouslyfish-gymnocorymbus-ternetzi', 'fishbase-gymnocorymbus-ternetzi'];

export const nextWaveUnified04BatchKnowledge: Record<string, SpeciesKnowledgeProfile['knowledge']> = {
  sp_0116: build(
    ['batch19-fishbase-scleropages-formosus-green', ...scleropages],
    { waterType: 'freshwater', temperatureRangeC: { min: 22, max: 28 }, phRange: { min: 5, max: 8 } },
    { mode: 'variable', territoriality: 'unknown', predationRisk: 'high', summary: 'Reviewed Green variant identity bridges to the reviewed Scleropages formosus authority; smaller fish remain prey.' },
    { adultLengthCm: { max: 90 }, spaceNotes: ['Very large adult size; no new variant-specific numeric tank minimum is invented.'] },
  ),
  sp_0104: build(
    ['batch19-fishbase-scleropages-formosus-red', ...scleropages],
    { waterType: 'freshwater', temperatureRangeC: { min: 22, max: 28 }, phRange: { min: 5, max: 8 } },
    { mode: 'variable', territoriality: 'unknown', predationRisk: 'high', summary: 'Reviewed Red variant identity bridges to the reviewed Scleropages formosus authority; smaller fish remain prey.' },
    { adultLengthCm: { max: 90 }, spaceNotes: ['Very large adult size; no new variant-specific numeric tank minimum is invented.'] },
  ),

  sp_0146: build(
    ['batch10-fishbase-mikrogeophagus-ramirezi-platinum', ...ram],
    { waterType: 'freshwater', temperatureRangeC: { min: 27, max: 30 }, phRange: { min: 4, max: 7 } },
    { mode: 'pair', territoriality: 'low', predationRisk: 'unknown', summary: 'Platinum morph bridges to reviewed M. ramirezi pair-oriented authority; breeding defense is contextual rather than generic aggression.' },
    { adultLengthCm: { max: 4.2 }, minVolumeLiters: 54, minTankLengthCm: 60 },
  ),
  sp_0157: build(
    ['batch10-fishbase-mikrogeophagus-ramirezi-blue', ...ram],
    { waterType: 'freshwater', temperatureRangeC: { min: 27, max: 30 }, phRange: { min: 4, max: 7 } },
    { mode: 'pair', territoriality: 'low', predationRisk: 'unknown', summary: 'Blue morph bridges to reviewed M. ramirezi pair-oriented authority; breeding defense is contextual rather than generic aggression.' },
    { adultLengthCm: { max: 4.2 }, minVolumeLiters: 54, minTankLengthCm: 60 },
  ),

  sp_0151: build(
    ['batch21-fishbase-gymnocorymbus-ternetzi-color-morph', ...tetra],
    { waterType: 'freshwater', temperatureRangeC: { min: 20, max: 26 }, phRange: { min: 6, max: 7 } },
    { mode: 'school', minimumGroupSize: 12, territoriality: 'none', finNipping: 'medium', predationRisk: 'unknown', summary: 'Color morph bridges to reviewed Gymnocorymbus ternetzi shoaling authority; maintain a real school rather than a pair.' },
    { adultLengthCm: { max: 7.5 }, minVolumeLiters: 68, minTankLengthCm: 75 },
  ),

  sp_0452: build(
    ['batch17-fishbase-amphiprion-ocellaris'],
    { waterType: 'saltwater' },
    { mode: 'pair', territoriality: 'unknown', predationRisk: 'unknown', summary: 'FishBase records a distinct monogamous pair and anemone association; no broader territoriality score is inferred.' },
    { adultLengthCm: { max: 11 } },
    { environment: 'No aquarium temperature or pH range is promoted from the current reviewed source.', space: 'Adult size is reviewed; no minimum aquarium size is promoted in this wave.' },
  ),

  sp_0453: build(
    ['batch26-fishbase-pterois-volitans'],
    { waterType: 'saltwater' },
    { mode: 'solitary', territoriality: 'unknown', predationRisk: 'high', summary: 'Often solitary and explicitly hunts small fishes; venomous dorsal spines are a handling/safety constraint.' },
    { adultLengthCm: { max: 45.7 }, spaceNotes: ['Large marine predator; no numeric aquarium minimum is promoted from the current reviewed source.'] },
    { environment: 'No aquarium temperature or pH range is promoted from the current reviewed source.' },
  ),

  sp_0069: build(
    ['batch09-fishbase-cyprinus-carpio-var'],
    { waterType: 'freshwater' },
    { mode: 'group', minimumGroupSize: 5, territoriality: 'unknown', predationRisk: 'unknown', summary: 'FishBase aquarium guidance states groups of five or more for common carp; this is pond-scale rather than ordinary home-aquarium planning.' },
    { minTankLengthCm: 200, spaceNotes: ['FishBase states aquarium size >200 cm and does not recommend the species for ordinary home aquariums.'] },
    { environment: 'No single ornamental long-term temperature or pH range is promoted in this wave.', space: 'Only the reviewed >200 cm planning floor is encoded; no ornamental adult-size ceiling is invented.' },
  ),
  sp_0070: build(
    ['batch09-fishbase-cyprinus-carpio-longfin'],
    { waterType: 'freshwater' },
    { mode: 'group', minimumGroupSize: 5, territoriality: 'unknown', predationRisk: 'unknown', summary: 'Longfin is an ornamental Cyprinus carpio form; FishBase aquarium guidance supports groups of five or more and pond-scale planning.' },
    { minTankLengthCm: 200, spaceNotes: ['FishBase states aquarium size >200 cm and does not recommend the species for ordinary home aquariums.'] },
    { environment: 'No single ornamental long-term temperature or pH range is promoted in this wave.', space: 'Only the reviewed >200 cm planning floor is encoded; no ornamental adult-size ceiling is invented.' },
  ),

  sp_0156: build(
    ['batch21-fishbase-trichopodus-trichopterus-platinum', 'seriouslyfish-trichopodus-trichopterus'],
    { waterType: 'freshwater', temperatureRangeC: { min: 24, max: 30 }, phRange: { min: 5.5, max: 8.5 } },
    { mode: 'variable', territoriality: 'medium', predationRisk: 'unknown', summary: 'Temperament varies by individual and maturity; males become territorial and can be especially aggressive during breeding.' },
    { adultLengthCm: { max: 15 }, minVolumeLiters: 81, minTankLengthCm: 90 },
  ),
};
