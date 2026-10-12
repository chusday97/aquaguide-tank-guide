import type { SpeciesKnowledgeProfile } from './knowledge.types';

const reviewedAt = '2026-10-12';
const reviewedEvidence = (sourceIds: string[], note: string) => ({ confidence: 'verified' as const, reviewStatus: 'reviewed' as const, sourceIds, reviewedAt, note });
const unknownEvidence = (sourceIds: string[], note: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds, reviewedAt, note });
const unknownSex = (sourceIds: string[]): SpeciesKnowledgeProfile['knowledge']['sexIdentification'] => ({
  title: '本轮不提供稳定的公母外观判断',
  summary: '没有足够证据时不从母种或贸易品系推断性别特征。',
  points: ['无稳定对象级证据的字段继续保持 unknown。'],
  confidence: 'unknown',
  source: { type: 'unknown', label: '缺少稳定对象级性别鉴别规则', confidence: 'unknown' },
  reliableFromLifeStage: 'unknown',
  evidence: unknownEvidence(sourceIds, 'No stable object-level sex-identification rule is promoted in wave05.'),
});
const build = (
  sourceIds: string[],
  environment: Omit<NonNullable<SpeciesKnowledgeProfile['knowledge']['environment']>, 'evidence'>,
  socialBehavior: Omit<NonNullable<SpeciesKnowledgeProfile['knowledge']['socialBehavior']>, 'evidence'>,
  spaceAndGrowth: Omit<NonNullable<SpeciesKnowledgeProfile['knowledge']['spaceAndGrowth']>, 'evidence'>,
): SpeciesKnowledgeProfile['knowledge'] => ({
  sexIdentification: unknownSex(sourceIds),
  environment: { ...environment, evidence: reviewedEvidence(sourceIds, 'Reviewed object-level environment authority.') },
  socialBehavior: { ...socialBehavior, evidence: reviewedEvidence(sourceIds, 'Reviewed object-level social authority.') },
  spaceAndGrowth: { activityLevel: 'unknown', ...spaceAndGrowth, evidence: reviewedEvidence(sourceIds, 'Only reviewed object-level space facts are promoted.') },
});

const tetraSources = ['wave05-cbd-gymnocorymbus-albino-white', 'seriouslyfish-gymnocorymbus-ternetzi', 'fishbase-gymnocorymbus-ternetzi'];

export const nextWaveUnified05BatchKnowledge: Record<string, SpeciesKnowledgeProfile['knowledge']> = {
  sp_0173: build(
    ['wave05-fishbase-salminus-brasiliensis', 'wave05-seriouslyfish-salminus-brasiliensis'],
    { waterType: 'freshwater' },
    { mode: 'variable', territoriality: 'unknown', predationRisk: 'high', summary: 'Very large open-water predator; smaller fishes are prey and ordinary home aquaria are unsuitable.' },
    { adultLengthCm: { max: 100 }, activityLevel: 'high', spaceNotes: ['No numeric aquarium minimum is invented.'] },
  ),
  sp_0174: build(
    tetraSources,
    { waterType: 'freshwater', temperatureRangeC: { min: 20, max: 26 }, phRange: { min: 6, max: 7 }, hardnessDgh: { min: 5, max: 20 } },
    { mode: 'school', minimumGroupSize: 12, territoriality: 'none', finNipping: 'medium', predationRisk: 'low', summary: 'Reviewed albino form retains the black-skirt tetra schooling and fin-nipping boundary.' },
    { adultLengthCm: { max: 7.5, measurement: 'SL' }, minVolumeLiters: 68, minTankLengthCm: 75, activityLevel: 'high' },
  ),
  sp_0207: build(
    tetraSources,
    { waterType: 'freshwater', temperatureRangeC: { min: 20, max: 26 }, phRange: { min: 6, max: 7 }, hardnessDgh: { min: 5, max: 20 } },
    { mode: 'school', minimumGroupSize: 12, territoriality: 'none', finNipping: 'medium', predationRisk: 'low', summary: 'Reviewed white form retains the black-skirt tetra schooling and fin-nipping boundary.' },
    { adultLengthCm: { max: 7.5, measurement: 'SL' }, minVolumeLiters: 68, minTankLengthCm: 75, activityLevel: 'high' },
  ),
  sp_0214: build(
    ['wave05-seriouslyfish-pelvicachromis-pulcher'],
    { waterType: 'freshwater', temperatureRangeC: { min: 24, max: 27 }, phRange: { min: 5, max: 7.5 } },
    { mode: 'pair', territoriality: 'medium', predationRisk: 'unknown', summary: 'The reviewed source explicitly includes an albino sport; pairs show parental care and breeding territory defense.' },
    { adultLengthCm: { max: 10 }, minVolumeLiters: 71, minTankLengthCm: 60, activityLevel: 'unknown' },
  ),
};
