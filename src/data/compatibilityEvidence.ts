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

export type ReviewedConditionalBehaviorTrait = {
  trait: string;
  context: string;
};

export type ReviewedConditionalBehaviorEvidence = {
  evidenceKey: string;
  scientificSpecies: string;
  behaviorTraits: ReviewedConditionalBehaviorTrait[];
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

const oscarPreyCaptureStudy: EvidenceSourceDto = {
  id: 'oscar-live-guppy-prey-capture-study',
  title: 'Functional morphology of extreme jaw protrusion in Neotropical cichlids',
  publisher: 'Journal of Morphology',
  url: 'https://pubmed.ncbi.nlm.nih.gov/12740901/',
  sourceType: 'peer_reviewed',
  reviewStatus: 'reviewed',
};

const bettaTerritoryPhaseStudy: EvidenceSourceDto = {
  id: 'betta-territory-reproductive-phase-study',
  title: 'Type of intruder and reproductive phase influence male territorial defence in wild-caught Siamese fighting fish',
  publisher: 'Behavioural Processes',
  url: 'https://pubmed.ncbi.nlm.nih.gov/12914992/',
  sourceType: 'peer_reviewed',
  reviewStatus: 'reviewed',
};

const bettaEnvironmentAggressionStudy: EvidenceSourceDto = {
  id: 'betta-environment-aggression-study',
  title: 'Timing of isolation from an enriched environment determines the level of aggressive behavior and sexual maturity in Siamese fighting fish (Betta splendens)',
  publisher: 'Applied Animal Behaviour Science',
  url: 'https://pubmed.ncbi.nlm.nih.gov/37170314/',
  sourceType: 'peer_reviewed',
  reviewStatus: 'reviewed',
};

const angelfishMatingTerritoryStudy: EvidenceSourceDto = {
  id: 'angelfish-mating-territory-study',
  title: 'Mating system of the Amazonian cichlid angel fish, Pterophyllum scalare',
  publisher: 'Brazilian Journal of Biology',
  url: 'https://pubmed.ncbi.nlm.nih.gov/17505764/',
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
  sp_0451: {
    speciesId: 'sp_0451',
    behaviorTraits: ['predatory'],
    predationTargets: ['small_fish'],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [oscarPreyCaptureStudy],
  },
};

const conditionalEvidence: Record<string, ReviewedConditionalBehaviorEvidence> = {
  betta_splendens_contextual_aggression: {
    evidenceKey: 'betta_splendens_contextual_aggression',
    scientificSpecies: 'Betta splendens',
    behaviorTraits: [
      {
        trait: 'territorial',
        context: 'Territorial defence is directly documented in adult/nest-holding males, and response intensity varies with reproductive phase and intruder type.',
      },
      {
        trait: 'intraspecific_aggression',
        context: 'Aggression expression is context-dependent; rearing environment and isolation history can change later aggressive behaviour.',
      },
    ],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [bettaTerritoryPhaseStudy, bettaEnvironmentAggressionStudy],
  },
  pterophyllum_scalare_breeding_territory: {
    evidenceKey: 'pterophyllum_scalare_breeding_territory',
    scientificSpecies: 'Pterophyllum scalare',
    behaviorTraits: [
      {
        trait: 'territorial',
        context: 'Paired fish defend territory and attack intruders in the presence of the mate during the reproductive cycle; the study did not observe the same intruder aggression between breeding cycles.',
      },
      {
        trait: 'breeding_defense',
        context: 'The reviewed evidence supports reproductive-state-dependent territory defence rather than an unconditional always-aggressive trait.',
      },
    ],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [angelfishMatingTerritoryStudy],
  },
};

const conditionalEvidenceAssignments: Record<string, string> = {
  sp_0258: 'betta_splendens_contextual_aggression',
  sp_0259: 'betta_splendens_contextual_aggression',
  sp_0260: 'betta_splendens_contextual_aggression',
  sp_0261: 'betta_splendens_contextual_aggression',
  sp_0262: 'betta_splendens_contextual_aggression',
  sp_0389: 'betta_splendens_contextual_aggression',
  sp_0390: 'betta_splendens_contextual_aggression',
  sp_0391: 'betta_splendens_contextual_aggression',
  sp_0175: 'pterophyllum_scalare_breeding_territory',
  sp_0176: 'pterophyllum_scalare_breeding_territory',
  sp_0177: 'pterophyllum_scalare_breeding_territory',
  sp_0178: 'pterophyllum_scalare_breeding_territory',
  sp_0240: 'pterophyllum_scalare_breeding_territory',
  sp_0241: 'pterophyllum_scalare_breeding_territory',
  sp_0247: 'pterophyllum_scalare_breeding_territory',
  sp_0272: 'pterophyllum_scalare_breeding_territory',
  sp_0388: 'pterophyllum_scalare_breeding_territory',
  sp_0446: 'pterophyllum_scalare_breeding_territory',
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
];

export const getReviewedCompatibilityProfile = (speciesId: string) => profiles[speciesId];

export const getReviewedConditionalBehaviorEvidence = (speciesId: string) => {
  const evidenceKey = conditionalEvidenceAssignments[speciesId];
  return evidenceKey ? conditionalEvidence[evidenceKey] : undefined;
};

export const getReviewedPairRule = (leftId: string, rightId: string) => pairRules.find(rule => (
  rule.speciesIds.includes(leftId) && rule.speciesIds.includes(rightId)
));

export const getConditionalBehaviorEvidenceAudit = () => ({
  evidence: conditionalEvidence,
  assignments: conditionalEvidenceAssignments,
});

export const getCompatibilityEvidenceAudit = () => ({
  reviewedSpeciesIds: Object.keys(profiles),
  reviewedPairRules: pairRules,
  conditionalEvidenceKeys: Object.keys(conditionalEvidence),
  conditionalEvidenceAssignments,
});
