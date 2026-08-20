from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise SystemExit(f'{label} anchor missing; refusing migration')
    return text.replace(old, new, 1)

# 1) Shared life-stage contract.
types_path = Path('src/types.ts')
types_text = types_path.read_text()
types_text = replace_once(
    types_text,
    "export type LifeStage = 'unknown' | 'juvenile' | 'adult';",
    "export type LifeStage = 'unknown' | 'fry' | 'juvenile' | 'subadult' | 'adult';",
    'src/types LifeStage',
)
types_path.write_text(types_text)

business_path = Path('packages/contracts/src/business.ts')
business_text = business_path.read_text()
business_text = replace_once(
    business_text,
    "export const lifeStageSchema = z.enum(['unknown', 'juvenile', 'adult']);",
    "export const lifeStageSchema = z.enum(['unknown', 'fry', 'juvenile', 'subadult', 'adult']);",
    'business lifeStageSchema',
)
business_path.write_text(business_text)

# 2) Reviewed same-species stage evidence.
evidence_path = Path('src/data/compatibilityEvidence.ts')
evidence = evidence_path.read_text()
evidence = replace_once(
    evidence,
    "import type { CompatibilityEvidenceDto, EvidenceSourceDto } from '../../packages/contracts/src';\n",
    "import type { CompatibilityEvidenceDto, EvidenceSourceDto } from '../../packages/contracts/src';\nimport type { LifeStage } from '../types';\n",
    'compatibility evidence import',
)

type_anchor = "const tigerBarbStudy: EvidenceSourceDto = {"
stage_type = """export type ReviewedStageRiskProfile = CompatibilityEvidenceDto & {
  speciesId: string;
  youngerStages: LifeStage[];
  olderStages: LifeStage[];
  verdict: 'caution' | 'not_recommended';
  riskType: 'conspecific_fry_predation';
  reason: string;
  mitigation: string[];
};

"""
evidence = replace_once(evidence, type_anchor, stage_type + type_anchor, 'stage risk type')

source_anchor = "const oscarZebrafishLivePredatorStudy: EvidenceSourceDto = {"
stage_sources = """const guppyCannibalismRefugeStudy: EvidenceSourceDto = {
  id: 'guppy-cannibalism-refuge-study',
  title: 'Guppy populations differ in cannibalistic degree and adaptation to structural environments',
  publisher: 'Oecologia',
  url: 'https://pubmed.ncbi.nlm.nih.gov/21516310/',
  sourceType: 'peer_reviewed',
  reviewStatus: 'reviewed',
};

const guppyFryYieldStudy: EvidenceSourceDto = {
  id: 'guppy-fry-yield-cannibalism-study',
  title: 'The effects of illumination and daily number of collections on fry yields in guppy breeding tanks',
  publisher: 'Aquacultural Engineering',
  url: 'https://www.sciencedirect.com/science/article/abs/pii/S0144860913000848',
  sourceType: 'peer_reviewed',
  reviewStatus: 'reviewed',
};

"""
evidence = replace_once(evidence, source_anchor, stage_sources + source_anchor, 'guppy stage evidence sources')

pair_anchor = "const pairRules: ReviewedPairRule[] = ["
stage_profiles = """const stageRiskProfiles: Record<string, ReviewedStageRiskProfile> = {
  sp_0436: {
    speciesId: 'sp_0436',
    youngerStages: ['fry'],
    olderStages: ['adult'],
    verdict: 'not_recommended',
    riskType: 'conspecific_fry_predation',
    reason: '孔雀鱼成体捕食同种幼体在水族箱实验与繁育研究中均有记录，且捕食程度会受到幼体体型与躲避结构影响。当前不应把成鱼与新生鱼苗直接同缸视为已证明安全。',
    mitigation: ['鱼苗优先使用育苗隔离区或独立育苗缸。', '不要把水草躲避物当作能够消除同类吞食风险的保证。'],
    basis: 'species_trait',
    confidence: 'medium',
    reviewStatus: 'reviewed',
    affectedSpeciesIds: ['sp_0436'],
    citations: [guppyCannibalismRefugeStudy, guppyFryYieldStudy],
  },
};

"""
evidence = replace_once(evidence, pair_anchor, stage_profiles + pair_anchor, 'stage risk profiles')

evidence = replace_once(
    evidence,
    "export const getReviewedPairRule = (leftId: string, rightId: string) => pairRules.find(rule => (",
    "export const getReviewedStageRiskProfile = (speciesId: string) => stageRiskProfiles[speciesId];\n\nexport const getReviewedPairRule = (leftId: string, rightId: string) => pairRules.find(rule => (",
    'stage risk getter',
)
evidence = replace_once(
    evidence,
    "  reviewedSpeciesIds: Object.keys(profiles),\n  reviewedPairRules: pairRules,",
    "  reviewedSpeciesIds: Object.keys(profiles),\n  reviewedStageRiskSpeciesIds: Object.keys(stageRiskProfiles),\n  reviewedPairRules: pairRules,",
    'compatibility evidence audit stage coverage',
)
evidence_path.write_text(evidence)

# 3) Compatibility engine consumes same-species batches instead of dropping them.
engine_path = Path('src/lib/tankCompatibilityEngine.ts')
engine = engine_path.read_text()
engine = replace_once(
    engine,
    "import type { Aquarium, Fish } from '../types';",
    "import type { Aquarium, AquariumSpeciesBatch, Fish, LifeStage } from '../types';",
    'engine type import',
)
engine = replace_once(
    engine,
    "import { getReviewedCompatibilityProfile, getReviewedPairRule, type ReviewedPairRule } from '../data/compatibilityEvidence';",
    "import { getReviewedCompatibilityProfile, getReviewedPairRule, getReviewedStageRiskProfile, type ReviewedPairRule, type ReviewedStageRiskProfile } from '../data/compatibilityEvidence';",
    'engine evidence import',
)
engine = replace_once(
    engine,
    "  existingSpecies?: Array<Fish | { species?: Fish | null; record?: { quantity?: number } | null }>;\n  candidateSpecies?: Fish | null;\n  candidateQuantity?: number;",
    "  existingSpecies?: Array<Fish | { species?: Fish | null; record?: { quantity?: number; batches?: AquariumSpeciesBatch[] } | null }>;\n  candidateSpecies?: Fish | null;\n  candidateQuantity?: number;\n  candidateLifeStage?: LifeStage;",
    'engine input stage fields',
)
engine = replace_once(
    engine,
    "const RULE_VERSION = 'tank-compatibility-v2-reviewed-evidence';\nconst SPECIES_DATA_VERSION = 'local-fish-data-v1+compatibility-evidence-v1';",
    "const RULE_VERSION = 'tank-compatibility-v3-stage-risk';\nconst SPECIES_DATA_VERSION = 'local-fish-data-v1+compatibility-evidence-v2-stage-risk';",
    'engine version',
)

normalize_start = engine.index("const normalizeExistingSpecies = (")
normalize_end = engine.index("const parseRange =", normalize_start)
if normalize_start < 0 or normalize_end < 0:
    raise SystemExit('normalizeExistingSpecies boundary missing; refusing migration')
normalize_block = """const normalizeExistingSpecies = (
  existingSpecies: EvaluateTankCompatibilityInput['existingSpecies'] = [],
) => existingSpecies
  .map(item => {
    if (!item || typeof item !== 'object') return null;
    if ('species' in item) {
      const species = (item as { species?: Fish | null }).species || null;
      if (!species?.id) return null;
      const record = (item as { record?: { quantity?: number; batches?: AquariumSpeciesBatch[] } | null }).record;
      return {
        species,
        quantity: getQuantity(record?.quantity),
        batches: Array.isArray(record?.batches) ? record.batches : [],
      };
    }
    const species = item as Fish;
    return species?.id ? { species, quantity: 1, batches: [] as AquariumSpeciesBatch[] } : null;
  })
  .filter((item): item is { species: Fish; quantity: number; batches: AquariumSpeciesBatch[] } => Boolean(item?.species?.id));

"""
engine = engine[:normalize_start] + normalize_block + engine[normalize_end:]

format_anchor = "const formatReviewedPairRuleEvidence = (rule: ReviewedPairRule) => rule.basis === 'pair_rule'\n  ? `${rule.reason} 该结论有直接配对或捕食风险实验支持；实验条件不等于家庭水族箱长期同缸，因此不外推为“已观察到长期同缸捕食”。`\n  : `${rule.reason} 此结论根据两种生物各自的已审核行为资料推断，并非直接配对实验。`;\n\n"
stage_formatter = """const formatReviewedStageRiskEvidence = (rule: ReviewedStageRiskProfile) => (
  `${rule.reason} 这是生命阶段相关风险，不代表每一只成体都会发生吞食；在没有隔离措施时不应默认安全。`
);

"""
engine = replace_once(engine, format_anchor, format_anchor + stage_formatter, 'stage evidence formatter')

engine = replace_once(
    engine,
    "  candidateSpecies,\n  candidateQuantity = 1,\n  scope = 'tank',",
    "  candidateSpecies,\n  candidateQuantity = 1,\n  candidateLifeStage = 'unknown',\n  scope = 'tank',",
    'engine candidate stage destructure',
)

current_species_anchor = """  const currentSpecies = currentLivestock
    .map(item => item.species)
    .filter(species => species.id !== candidateSpecies.id);

"""
stage_logic = """  const sameSpeciesLivestock = currentLivestock.filter(item => item.species.id === candidateSpecies.id);
  const existingSameSpeciesStages = Array.from(new Set(
    sameSpeciesLivestock
      .flatMap(item => item.batches.map(batch => batch.lifeStage))
      .filter((stage): stage is LifeStage => Boolean(stage) && stage !== 'unknown'),
  ));
  const reviewedStageRisk = getReviewedStageRiskProfile(candidateSpecies.id);
  const stageRiskApplies = Boolean(
    reviewedStageRisk
    && reviewedStageRisk.youngerStages.includes(candidateLifeStage)
    && reviewedStageRisk.olderStages.some(stage => existingSameSpeciesStages.includes(stage)),
  );

  if (stageRiskApplies && reviewedStageRisk) {
    const target = reviewedStageRisk.verdict === 'not_recommended' ? blockingRules : warningRules;
    target.push(asRule(
      reviewedStageRisk.riskType,
      reviewedStageRisk.verdict === 'not_recommended' ? '同种成鱼与鱼苗存在吞食风险' : '同种不同生命阶段需要谨慎混养',
      formatReviewedStageRiskEvidence(reviewedStageRisk),
      reviewedStageRisk.verdict === 'not_recommended' ? 'high' : 'medium',
      reviewedStageRisk,
    ));
    suggestions.push(...reviewedStageRisk.mitigation);
  } else if (
    candidateLifeStage === 'fry'
    && existingSameSpeciesStages.some(stage => stage === 'adult' || stage === 'subadult')
  ) {
    missingData.push(asRule(
      'life_stage_evidence_unreviewed',
      '同种生命阶段风险资料不足',
      `${candidateSpecies.name} 当前已有较大阶段个体，而候选记录为鱼苗；缺少该阶段组合的已审核风险资料，不能默认判断为安全。`,
      'medium',
      {
        basis: 'species_trait',
        confidence: 'unknown',
        reviewStatus: 'draft',
        affectedSpeciesIds: [candidateSpecies.id],
        citations: [],
      },
    ));
  }

"""
engine = replace_once(engine, current_species_anchor, current_species_anchor + stage_logic, 'same species stage logic')
engine = replace_once(
    engine,
    "    if (currentSpecies.length === 0) {",
    "    if (currentSpecies.length === 0 && sameSpeciesLivestock.length === 0) {",
    'species-only same species stage pair',
)
engine_path.write_text(engine)

# 4) Planned-addition service carries the stage context through to the engine and stored batch.
addition_path = Path('src/services/aquarium/species-addition.service.ts')
addition = addition_path.read_text()
addition = replace_once(
    addition,
    "import type { Aquarium, Fish } from '../../types';",
    "import type { Aquarium, Fish, LifeStage } from '../../types';",
    'addition LifeStage import',
)
addition = replace_once(
    addition,
    "export type SpeciesAdditionItem = {\n  fishId: string;\n  quantity: number;\n  entryDate?: string;\n};",
    "export type SpeciesAdditionItem = {\n  fishId: string;\n  quantity: number;\n  entryDate?: string;\n  lifeStage?: LifeStage;\n};",
    'addition item stage',
)
addition = replace_once(
    addition,
    "    const existing = grouped.get(item.fishId);\n    grouped.set(item.fishId, {\n      fishId: item.fishId,\n      quantity: (existing?.quantity || 0) + quantity,\n      entryDate: item.entryDate || existing?.entryDate,\n    });",
    "    const lifeStage = item.lifeStage ?? 'unknown';\n    const groupingKey = `${item.fishId}::${lifeStage}`;\n    const existing = grouped.get(groupingKey);\n    grouped.set(groupingKey, {\n      fishId: item.fishId,\n      quantity: (existing?.quantity || 0) + quantity,\n      entryDate: item.entryDate || existing?.entryDate,\n      lifeStage,\n    });",
    'addition grouping by stage',
)
addition = replace_once(
    addition,
    "    return species ? [{ species, record: { quantity: Math.max(1, record.quantity || 1) } }] : [];",
    "    return species ? [{ species, record: { quantity: Math.max(1, record.quantity || 1), batches: record.batches } }] : [];",
    'addition existing batches',
)
addition = replace_once(
    addition,
    "        candidateSpecies: fish,\n        candidateQuantity: item.quantity,",
    "        candidateSpecies: fish,\n        candidateQuantity: item.quantity,\n        candidateLifeStage: item.lifeStage,",
    'addition candidate stage to engine',
)
addition = replace_once(
    addition,
    "        nextFishes[existingIndex] = appendSpeciesBatch(nextFishes[existingIndex], {\n          quantity: addition.quantity,\n          entryDate,\n        });",
    "        nextFishes[existingIndex] = appendSpeciesBatch(nextFishes[existingIndex], {\n          quantity: addition.quantity,\n          entryDate,\n          lifeStage: addition.lifeStage,\n        });",
    'append batch life stage',
)
addition = replace_once(
    addition,
    "        batches: [createSpeciesBatch({ quantity: addition.quantity, entryDate })],",
    "        batches: [createSpeciesBatch({ quantity: addition.quantity, entryDate, lifeStage: addition.lifeStage })],",
    'create batch life stage',
)
addition_path.write_text(addition)

required = {
    'src/types.ts': ["'fry'", "'subadult'"],
    'packages/contracts/src/business.ts': ["'fry'", "'subadult'"],
    'src/data/compatibilityEvidence.ts': ['getReviewedStageRiskProfile', 'guppy-cannibalism-refuge-study', 'conspecific_fry_predation'],
    'src/lib/tankCompatibilityEngine.ts': ['candidateLifeStage', 'life_stage_evidence_unreviewed', 'conspecific_fry_predation'],
    'src/services/aquarium/species-addition.service.ts': ['lifeStage?: LifeStage', 'candidateLifeStage: item.lifeStage', 'batches: record.batches'],
}
for filename, needles in required.items():
    text = Path(filename).read_text()
    for needle in needles:
        if needle not in text:
            raise SystemExit(f'{filename} missing required stage-risk contract: {needle}')

print('Same-species life-stage risk migration prepared')
