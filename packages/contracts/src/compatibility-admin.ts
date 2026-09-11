import { z } from 'zod';
import { versionSchema } from './business';
import { compatibilityRequiredFactSchema } from './catalog';

export const compatibilityConfidenceSchema = z.enum(['high', 'medium', 'low', 'unknown']);
export const compatibilityRuleBasisSchema = z.enum(['species_trait', 'pair_rule', 'tank_condition', 'rule_inference']);
export const compatibilityLifeStageSchema = z.enum(['unknown', 'juvenile', 'adult', 'fry', 'subadult']);
export const compatibilityProfileRevisionStatusSchema = z.enum([
  'draft',
  'pending_review',
  'approved',
  'rejected',
  'published',
  'superseded',
]);

export const compatibilityCitationSnapshotSchema = z.object({
  sourceKey: z.string().trim().min(1).max(200),
  title: z.string().trim().min(1).max(500),
  publisher: z.string().trim().min(1).max(240),
  url: z.string().url().max(2000),
  sourceType: z.enum(['government', 'peer_reviewed', 'university', 'professional_association', 'curated_husbandry']),
  reviewStatus: z.enum(['draft', 'reviewed', 'rejected']),
});

export const compatibilityStockingGuidanceSchema = z.object({
  kind: z.enum(['reviewed_range', 'minimum_group_only', 'screening_only', 'unknown']),
  recommendedMin: z.number().int().positive().nullable(),
  recommendedMax: z.number().int().positive().nullable(),
  constraints: z.array(z.string().trim().min(1).max(1200)).max(30).default([]),
  confidence: compatibilityConfidenceSchema,
  evidenceIds: z.array(z.string().trim().min(1).max(200)).max(30).default([]),
});

export const compatibilityStageRiskRuleInputSchema = z.object({
  ruleKey: z.string().trim().min(1).max(200).regex(/^[\w.:-]+$/),
  youngerStages: z.array(compatibilityLifeStageSchema).min(1).max(5),
  olderStages: z.array(compatibilityLifeStageSchema).min(1).max(5),
  verdict: z.enum(['caution', 'not_recommended']),
  riskType: z.string().trim().min(1).max(160),
  reason: z.string().trim().min(1).max(6000),
  mitigation: z.array(z.string().trim().min(1).max(1200)).max(30).default([]),
  basis: compatibilityRuleBasisSchema.default('species_trait'),
  confidence: compatibilityConfidenceSchema,
  citations: z.array(compatibilityCitationSnapshotSchema).min(1).max(30),
});

export const compatibilityProfileRevisionInputSchema = z.object({
  catalogKey: z.string().trim().min(1).max(160).regex(/^[\w.-]+$/),
  behaviorTraits: z.array(z.string().trim().min(1).max(120)).max(40).default([]),
  minimumGroupSize: z.number().int().positive().max(10000).nullable().optional(),
  predationTargets: z.array(z.string().trim().min(1).max(120)).max(40).default([]),
  confidence: compatibilityConfidenceSchema,
  citations: z.array(compatibilityCitationSnapshotSchema).min(1).max(30),
  requiredFacts: z.array(compatibilityRequiredFactSchema).min(1).max(9),
  stockingGuidance: compatibilityStockingGuidanceSchema.optional(),
  stageRiskRules: z.array(compatibilityStageRiskRuleInputSchema).max(20).default([]),
}).superRefine((value, ctx) => {
  const keys = value.stageRiskRules.map(rule => rule.ruleKey);
  if (new Set(keys).size !== keys.length) ctx.addIssue({ code: 'custom', path: ['stageRiskRules'], message: 'Stage Risk ruleKey 不能重复。' });
});

export const compatibilityProfileRevisionUpdateSchema = z.object({
  behaviorTraits: z.array(z.string().trim().min(1).max(120)).max(40).optional(),
  minimumGroupSize: z.number().int().positive().max(10000).nullable().optional(),
  predationTargets: z.array(z.string().trim().min(1).max(120)).max(40).optional(),
  confidence: compatibilityConfidenceSchema.optional(),
  citations: z.array(compatibilityCitationSnapshotSchema).min(1).max(30).optional(),
  requiredFacts: z.array(compatibilityRequiredFactSchema).min(1).max(9).optional(),
  stockingGuidance: compatibilityStockingGuidanceSchema.optional(),
  stageRiskRules: z.array(compatibilityStageRiskRuleInputSchema).max(20).optional(),
  version: versionSchema,
});

export const compatibilityProfileRevisionStatusMutationSchema = z.object({
  version: versionSchema,
});

export type CompatibilityProfileRevisionInput = z.infer<typeof compatibilityProfileRevisionInputSchema>;
export type CompatibilityCitationSnapshot = z.infer<typeof compatibilityCitationSnapshotSchema>;
export type CompatibilityStageRiskRuleInput = z.infer<typeof compatibilityStageRiskRuleInputSchema>;
export type CompatibilityStockingGuidance = z.infer<typeof compatibilityStockingGuidanceSchema>;
export type CompatibilityProfileRevisionStatus = z.infer<typeof compatibilityProfileRevisionStatusSchema>;

export const compatibilityVerdictSchema = z.enum(['compatible', 'caution', 'not_recommended', 'insufficient_data']);
const compatibilityPairRuleRevisionBaseSchema = z.object({
  catalogKeyA: z.string().trim().min(1).max(160).regex(/^[\w.-]+$/),
  catalogKeyB: z.string().trim().min(1).max(160).regex(/^[\w.-]+$/),
  verdict: compatibilityVerdictSchema,
  riskType: z.string().trim().min(1).max(160),
  reason: z.string().trim().min(1).max(6000),
  mitigation: z.array(z.string().trim().min(1).max(1200)).max(30).default([]),
  basis: compatibilityRuleBasisSchema,
  confidence: compatibilityConfidenceSchema,
  citations: z.array(compatibilityCitationSnapshotSchema).min(1).max(30),
});

export const compatibilityPairRuleRevisionInputSchema = compatibilityPairRuleRevisionBaseSchema
  .refine(value => value.catalogKeyA !== value.catalogKeyB, { message: 'Pair Rule 必须包含两个不同物种。' });

export const compatibilityPairRuleRevisionUpdateSchema = compatibilityPairRuleRevisionBaseSchema
  .omit({ catalogKeyA: true, catalogKeyB: true })
  .partial()
  .extend({ version: versionSchema });

export const compatibilityPairRuleRevisionStatusMutationSchema = z.object({ version: versionSchema });

export const compatibilityRevisionReviewMutationSchema = z.object({
  version: versionSchema,
  decision: z.enum(['approve', 'reject']),
  note: z.string().trim().max(2000).optional(),
}).superRefine((value, ctx) => {
  if (value.decision === 'reject' && !value.note?.trim()) {
    ctx.addIssue({ code: 'custom', path: ['note'], message: '驳回时必须填写审核说明。' });
  }
});

export type CompatibilityRevisionReviewMutation = z.infer<typeof compatibilityRevisionReviewMutationSchema>;

export type CompatibilityPairRuleRevisionInput = z.infer<typeof compatibilityPairRuleRevisionInputSchema>;
export type CompatibilityVerdict = z.infer<typeof compatibilityVerdictSchema>;
export type CompatibilityRuleBasisValue = z.infer<typeof compatibilityRuleBasisSchema>;
