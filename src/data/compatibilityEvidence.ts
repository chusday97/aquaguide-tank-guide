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
];

export const getReviewedCompatibilityProfile = (speciesId: string) => profiles[speciesId];

export const getReviewedPairRule = (leftId: string, rightId: string) => pairRules.find(rule => (
  rule.speciesIds.includes(leftId) && rule.speciesIds.includes(rightId)
));

export const getCompatibilityEvidenceAudit = () => ({
  reviewedSpeciesIds: Object.keys(profiles),
  reviewedPairRules: pairRules,
});
