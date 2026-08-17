import type { CompatibilityEvidenceDto, EvidenceSourceDto } from '../../packages/contracts/src';

export type ReviewedCompatibilityProfile = {
  speciesId: string;
  behaviorTraits: string[];
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

const tigerBarbStudy: EvidenceSourceDto = {
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

const neonTetraFishBase: EvidenceSourceDto = {
  id: 'fishbase-paracheirodon-innesi',
  title: 'Paracheirodon innesi (Neon tetra) species summary',
  publisher: 'FishBase',
  url: 'https://www.fishbase.org/summary/Paracheirodon-innesi.html',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const cardinalTetraFishBase: EvidenceSourceDto = {
  id: 'fishbase-paracheirodon-axelrodi',
  title: 'Paracheirodon axelrodi (Cardinal tetra) species summary',
  publisher: 'FishBase',
  url: 'https://www.fishbase.org/summary/Paracheirodon-axelrodi.html',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const whiteCloudFishBase: EvidenceSourceDto = {
  id: 'fishbase-tanichthys-albonubes',
  title: 'Tanichthys albonubes (White cloud mountain minnow) species summary',
  publisher: 'FishBase',
  url: 'https://www.fishbase.se/summary/Tanichthys-albonubes.html',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const whiteCloudShoalingStudy: EvidenceSourceDto = {
  id: 'white-cloud-shoaling-study',
  title: 'Shoaling in White Cloud Mountain minnows, Tanichthys albonubes: effects of predation risk and prey hunger',
  publisher: 'Animal Behaviour',
  url: 'https://www.sciencedirect.com/science/article/pii/S0003347284712917',
  sourceType: 'peer_reviewed',
  reviewStatus: 'reviewed',
};

const guppyFishBase: EvidenceSourceDto = {
  id: 'fishbase-poecilia-reticulata',
  title: 'Poecilia reticulata (Guppy) species summary',
  publisher: 'FishBase',
  url: 'https://www.fishbase.se/summary/Poecilia-reticulata.html',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const guppyShoalingStudy: EvidenceSourceDto = {
  id: 'guppy-schooling-learning-study',
  title: 'Schooling and learning: early social environment predicts social learning ability in the guppy, Poecilia reticulata',
  publisher: 'Animal Behaviour',
  url: 'https://www.sciencedirect.com/science/article/abs/pii/S0003347208002364',
  sourceType: 'peer_reviewed',
  reviewStatus: 'reviewed',
};

const oscarZebrafishLivePredatorStudy: EvidenceSourceDto = {
  id: 'oscar-zebrafish-live-predator-study',
  title: 'Live Predators, Robots, and Computer-Animated Images Elicit Differential Avoidance Responses in Zebrafish',
  publisher: 'Zebrafish',
  url: 'https://journals.sagepub.com/doi/10.1089/zeb.2014.1041',
  sourceType: 'peer_reviewed',
  reviewStatus: 'reviewed',
};

const oscarZebrafishDevelopmentStudy: EvidenceSourceDto = {
  id: 'oscar-zebrafish-development-predator-study',
  title: 'Modulation of Cortisol Responses to an Acute Stressor in Zebrafish Visually Exposed to Heterospecific Fish During Development',
  publisher: 'Zebrafish',
  url: 'https://journals.sagepub.com/doi/10.1089/zeb.2017.1509',
  sourceType: 'peer_reviewed',
  reviewStatus: 'reviewed',
};

const profiles: Record<string, ReviewedCompatibilityProfile> = {
  sp_0439: {
    speciesId: 'sp_0439',
    behaviorTraits: ['shoaling', 'interspecific_aggression', 'fin_nipping'],
    minimumGroupSize: 6,
    predationTargets: [],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [tigerBarbStudy],
  },
  sp_0021: {
    speciesId: 'sp_0021',
    behaviorTraits: ['territorial', 'breeding_defense', 'chasing', 'biting'],
    predationTargets: [],
    confidence: 'high',
    reviewStatus: 'reviewed',
    citations: [convictCichlidTerritoryStudy],
  },
  sp_0049: {
    speciesId: 'sp_0049',
    behaviorTraits: ['predatory', 'solitary_required', 'territorial'],
    predationTargets: ['small_fish'],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [smallSnakeheadAssessment],
  },
  sp_0431: {
    speciesId: 'sp_0431',
    behaviorTraits: ['shoaling'],
    minimumGroupSize: 5,
    predationTargets: [],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [neonTetraFishBase],
  },
  sp_0432: {
    speciesId: 'sp_0432',
    behaviorTraits: ['shoaling'],
    minimumGroupSize: 5,
    predationTargets: [],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [cardinalTetraFishBase],
  },
  sp_0434: {
    speciesId: 'sp_0434',
    behaviorTraits: ['shoaling'],
    minimumGroupSize: 5,
    predationTargets: [],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [whiteCloudFishBase, whiteCloudShoalingStudy],
  },
  sp_0436: {
    speciesId: 'sp_0436',
    behaviorTraits: ['shoaling'],
    minimumGroupSize: 5,
    predationTargets: [],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [guppyFishBase, guppyShoalingStudy],
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
    citations: [tigerBarbStudy, convictCichlidTerritoryStudy],
  },
  {
    speciesIds: ['sp_0431', 'sp_0432'],
    verdict: 'caution',
    riskType: 'group_size_and_shared_water_window',
    reason: 'FishBase 将红绿灯与宝莲灯都记录为小型淡水群游/群养鱼；两者温度区间在约 23–26°C、pH 区间在约 5.0–6.0 有共同范围。当前没有直接配对实验，因此只作为有条件可尝试，而不是“已证明安全”。',
    mitigation: ['两种鱼都按群体饲养，不以单条长期混养作为目标。', '把温度和 pH 保持在两者共同区间，并避免快速波动。', '分批加入并持续观察摄食、追逐和应激表现。'],
    basis: 'rule_inference',
    confidence: 'medium',
    reviewStatus: 'reviewed',
    affectedSpeciesIds: ['sp_0431', 'sp_0432'],
    citations: [neonTetraFishBase, cardinalTetraFishBase],
  },
  {
    speciesIds: ['sp_0451', 'sp_0435'],
    verdict: 'not_recommended',
    riskType: 'predation_threat',
    reason: '多项斑马鱼 predator-response 实验明确把地图鱼 Astronotus ocellatus 作为 Danio rerio 的捕食者刺激；活体地图鱼可诱发稳定回避/恐惧反应，长期视觉暴露研究也将该组合定义为 predator–prey 模型。证据支持存在明确捕食威胁，但这些实验并不是家庭水族箱中的长期同缸吞食试验。',
    mitigation: ['不要把地图鱼与斑马鱼作为长期同缸组合；优先物理分缸。', '不要用增加躲避物或“先试试看”替代捕食风险隔离。'],
    basis: 'pair_rule',
    confidence: 'medium',
    reviewStatus: 'reviewed',
    affectedSpeciesIds: ['sp_0451', 'sp_0435'],
    citations: [oscarZebrafishLivePredatorStudy, oscarZebrafishDevelopmentStudy],
  },
];

export const getReviewedCompatibilityProfile = (speciesId: string) => profiles[speciesId];

export const getReviewedPairRule = (leftId: string, rightId: string) => pairRules.find(rule => (
  rule.speciesIds.includes(leftId) && rule.speciesIds.includes(rightId)
));

export const getCompatibilityEvidenceAudit = () => ({
  reviewedSpeciesIds: Object.keys(profiles),
  reviewedPairRules: pairRules,
});
