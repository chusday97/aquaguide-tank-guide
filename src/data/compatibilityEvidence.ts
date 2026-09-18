import type { CompatibilityEvidenceDto, EvidenceSourceDto } from '../../packages/contracts/src';

export type CompatibilityEvidenceDimension = 'sociality' | 'aggression' | 'predation' | 'territoriality' | 'housing';

export type ReviewedCompatibilityProfile = {
  speciesId: string;
  scientificName: string;
  behaviorTraits: string[];
  reviewedDimensions: CompatibilityEvidenceDimension[];
  inheritToVariants?: boolean;
  minimumGroupSize?: number;
  predationTargets: string[];
  confidence: CompatibilityEvidenceDto['confidence'];
  reviewStatus: CompatibilityEvidenceDto['reviewStatus'];
  citations: EvidenceSourceDto[];
};

export type ReviewedPairRule = CompatibilityEvidenceDto & {
  speciesIds: [string, string];
  verdict: 'compatible' | 'caution' | 'not_recommended' | 'insufficient_data';
  riskType: string;
  reason: string;
  mitigation: string[];
};

const ornamentalFishGroupSizeStudy: EvidenceSourceDto = {
  id: 'tiger-barb-group-size-study',
  title: 'The effect of group size on the behaviour and welfare of four fish species commonly kept in home aquaria',
  publisher: 'Applied Animal Behaviour Science',
  url: 'https://www.sciencedirect.com/science/article/pii/S0168159110001292',
  sourceType: 'peer_reviewed',
  reviewStatus: 'reviewed',
};

const convictCichlidTerritoryStudy: EvidenceSourceDto = {
  id: 'convict-cichlid-territory-study',
  title: 'Sex Differences in How Territory Quality Affects Aggression in Convict Cichlids',
  publisher: 'Integrative and Comparative Biology',
  url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8522484/',
  sourceType: 'peer_reviewed',
  reviewStatus: 'reviewed',
};

const smallSnakeheadAssessment: EvidenceSourceDto = {
  id: 'small-snakehead-fws-assessment',
  title: 'Ecological Risk Screening Summary: Small Snakehead (Channa asiatica)',
  publisher: 'U.S. Fish and Wildlife Service',
  url: 'https://www.fws.gov/sites/default/files/documents/Ecological-Risk-Screening-Summary-Small-Snakehead.pdf',
  sourceType: 'government',
  reviewStatus: 'reviewed',
};

const mixedSpeciesAssemblageStudy: EvidenceSourceDto = {
  id: 'ornamental-fish-mixed-assemblage-study',
  title: 'The effects of mixed-species assemblage on the behaviour and welfare of fish held in home aquaria',
  publisher: 'Applied Animal Behaviour Science',
  url: 'https://www.sciencedirect.com/science/article/pii/S0168159111002681',
  sourceType: 'peer_reviewed',
  reviewStatus: 'reviewed',
};

const neonTetraShoalingStudy: EvidenceSourceDto = {
  id: 'neon-tetra-social-bubble-study',
  title: 'Fish evacuate smoothly respecting a social bubble',
  publisher: 'Scientific Reports',
  url: 'https://www.nature.com/articles/s41598-023-36869-9',
  sourceType: 'peer_reviewed',
  reviewStatus: 'reviewed',
};

const bronzeCorySocialStudy: EvidenceSourceDto = {
  id: 'bronze-cory-social-development-study',
  title: 'Developmental Social Experience Changes Behavior in a Threatening Environment in Corydoras Catfish',
  publisher: 'Ecology and Evolution',
  url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11470158/',
  sourceType: 'peer_reviewed',
  reviewStatus: 'reviewed',
};

const guppyCollectiveBehaviourStudy: EvidenceSourceDto = {
  id: 'guppy-collective-motion-study',
  title: 'Familiarity affects collective motion in shoals of guppies (Poecilia reticulata)',
  publisher: 'Royal Society Open Science',
  url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5627077/',
  sourceType: 'peer_reviewed',
  reviewStatus: 'reviewed',
};

const guppySocialAggressionStudy: EvidenceSourceDto = {
  id: 'guppy-social-aggression-study',
  title: 'Male sexual harassment alters female social behaviour towards other females',
  publisher: 'Biology Letters',
  url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3297391/',
  sourceType: 'peer_reviewed',
  reviewStatus: 'reviewed',
};

const profiles: Record<string, ReviewedCompatibilityProfile> = {
  sp_0439: {
    speciesId: 'sp_0439',
    scientificName: 'Puntigrus tetrazona',
    behaviorTraits: ['shoaling', 'interspecific_aggression', 'fin_nipping'],
    reviewedDimensions: ['sociality', 'aggression'],
    inheritToVariants: true,
    minimumGroupSize: 6,
    predationTargets: [],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [ornamentalFishGroupSizeStudy, mixedSpeciesAssemblageStudy],
  },
  sp_0021: {
    speciesId: 'sp_0021',
    scientificName: 'Amatitlania nigrofasciata',
    behaviorTraits: ['territorial', 'breeding_defense', 'chasing', 'biting'],
    reviewedDimensions: ['aggression', 'territoriality'],
    predationTargets: [],
    confidence: 'high',
    reviewStatus: 'reviewed',
    citations: [convictCichlidTerritoryStudy],
  },
  sp_0049: {
    speciesId: 'sp_0049',
    scientificName: 'Channa asiatica',
    behaviorTraits: ['predatory', 'solitary_required', 'territorial'],
    reviewedDimensions: ['predation', 'territoriality', 'housing'],
    inheritToVariants: true,
    predationTargets: ['small_fish'],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [smallSnakeheadAssessment],
  },
  sp_0431: {
    speciesId: 'sp_0431',
    scientificName: 'Paracheirodon innesi',
    behaviorTraits: ['shoaling'],
    reviewedDimensions: ['sociality', 'aggression'],
    inheritToVariants: true,
    minimumGroupSize: 6,
    predationTargets: [],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [ornamentalFishGroupSizeStudy, mixedSpeciesAssemblageStudy, neonTetraShoalingStudy],
  },
  sp_0434: {
    speciesId: 'sp_0434',
    scientificName: 'Tanichthys albonubes',
    behaviorTraits: ['shoaling'],
    reviewedDimensions: ['sociality', 'aggression'],
    inheritToVariants: true,
    predationTargets: [],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [ornamentalFishGroupSizeStudy, mixedSpeciesAssemblageStudy],
  },
  sp_0014: {
    speciesId: 'sp_0014',
    scientificName: 'Corydoras aeneus',
    behaviorTraits: ['shoaling', 'highly_social'],
    reviewedDimensions: ['sociality', 'aggression'],
    inheritToVariants: true,
    predationTargets: [],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [bronzeCorySocialStudy],
  },
  sp_0436: {
    speciesId: 'sp_0436',
    scientificName: 'Poecilia reticulata',
    behaviorTraits: ['shoaling', 'social', 'sexual_harassment'],
    reviewedDimensions: ['sociality', 'aggression'],
    inheritToVariants: true,
    predationTargets: [],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [guppyCollectiveBehaviourStudy, guppySocialAggressionStudy],
  },
};

const pairRules: ReviewedPairRule[] = [
  {
    speciesIds: ['sp_0021', 'sp_0439'],
    verdict: 'not_recommended',
    riskType: 'behavior_and_territory_conflict',
    reason: '虎皮鱼有追鳍与种间攻击倾向，迷你鹦鹉鱼会追逐、啃咬并在繁殖期强烈护域；两者同缸容易形成持续追逐和领地冲突。',
    mitigation: ['优先分缸饲养；不要把增加躲避物当作消除行为冲突的保证。'],
    basis: 'rule_inference',
    confidence: 'medium',
    reviewStatus: 'reviewed',
    affectedSpeciesIds: ['sp_0021', 'sp_0439'],
    citations: [ornamentalFishGroupSizeStudy, convictCichlidTerritoryStudy],
  },
  {
    speciesIds: ['sp_0439', 'sp_0431'],
    verdict: 'caution',
    riskType: 'mixed_assemblage_behavior_risk',
    reason: '虎皮鱼与红绿灯曾在受控混合群落研究中共同观察；群落组成会改变攻击与群游行为，虎皮鱼在这些组合中攻击行为更高，因此不能把该组合视为无条件安全。',
    mitigation: ['保证各自足够的群游数量与空间；若出现持续追逐、缩群或拒食，应立即分开。'],
    basis: 'rule_inference',
    confidence: 'medium',
    reviewStatus: 'reviewed',
    affectedSpeciesIds: ['sp_0439', 'sp_0431'],
    citations: [mixedSpeciesAssemblageStudy, ornamentalFishGroupSizeStudy],
  },
  {
    speciesIds: ['sp_0439', 'sp_0434'],
    verdict: 'caution',
    riskType: 'mixed_assemblage_behavior_risk',
    reason: '虎皮鱼与白云金丝曾在受控混合群落研究中共同观察；群落组成会改变攻击与群游行为，虎皮鱼在这些组合中攻击行为更高，因此只能作为条件性混养方案。',
    mitigation: ['保证各自足够的群游数量与空间；若出现持续追逐、缩群或拒食，应立即分开。'],
    basis: 'rule_inference',
    confidence: 'medium',
    reviewStatus: 'reviewed',
    affectedSpeciesIds: ['sp_0439', 'sp_0434'],
    citations: [mixedSpeciesAssemblageStudy, ornamentalFishGroupSizeStudy],
  },
];

const compatibilityDecisionDimensions: CompatibilityEvidenceDimension[] = ['aggression', 'predation', 'territoriality', 'housing'];

export const hasCompatibilityDecisionCoverage = (profile?: ReviewedCompatibilityProfile) => Boolean(
  profile && compatibilityDecisionDimensions.every(dimension => profile.reviewedDimensions.includes(dimension)),
);

export const normalizeScientificSpeciesKey = (scientificName?: string) => {
  const parts = String(scientificName || '').trim().replace(/\s+/g, ' ').split(' ').filter(Boolean);
  if (parts.length < 2) return '';
  const genus = parts[0].replace(/[^A-Za-z-]/g, '').toLowerCase();
  const species = parts[1].replace(/[^A-Za-z-]/g, '').toLowerCase();
  return genus && species ? `${genus} ${species}` : '';
};

export const getReviewedCompatibilityProfile = (speciesId: string) => profiles[speciesId];

export const getReviewedCompatibilityProfileForSpecies = (species: { id: string; scientificName?: string }) => {
  const exact = profiles[species.id];
  if (exact) return exact;
  const key = normalizeScientificSpeciesKey(species.scientificName);
  if (!key) return undefined;
  const inherited = Object.values(profiles).filter(profile => (
    profile.inheritToVariants && normalizeScientificSpeciesKey(profile.scientificName) === key
  ));
  return inherited.length === 1 ? inherited[0] : undefined;
};

export const getReviewedPairRule = (leftId: string, rightId: string) => pairRules.find(rule => (
  rule.speciesIds.includes(leftId) && rule.speciesIds.includes(rightId)
));

export const getCompatibilityEvidenceAudit = () => ({
  reviewedSpeciesIds: Object.keys(profiles),
  reviewedPairRules: pairRules,
});
