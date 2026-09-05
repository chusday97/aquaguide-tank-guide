import { z } from 'zod';
import { versionSchema } from './business';

export const compatibilityConfidenceSchema = z.enum(['high', 'medium', 'low', 'unknown']);
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

export const compatibilityProfileRevisionInputSchema = z.object({
  catalogKey: z.string().trim().min(1).max(160).regex(/^[\w.-]+$/),
  behaviorTraits: z.array(z.string().trim().min(1).max(120)).max(40).default([]),
  minimumGroupSize: z.number().int().positive().max(10000).nullable().optional(),
  predationTargets: z.array(z.string().trim().min(1).max(120)).max(40).default([]),
  confidence: compatibilityConfidenceSchema,
  citations: z.array(compatibilityCitationSnapshotSchema).min(1).max(30),
});

export const compatibilityProfileRevisionUpdateSchema = compatibilityProfileRevisionInputSchema
  .omit({ catalogKey: true })
  .partial()
  .extend({ version: versionSchema });

export const compatibilityProfileRevisionStatusMutationSchema = z.object({
  version: versionSchema,
});

export type CompatibilityProfileRevisionInput = z.infer<typeof compatibilityProfileRevisionInputSchema>;
export type CompatibilityCitationSnapshot = z.infer<typeof compatibilityCitationSnapshotSchema>;
export type CompatibilityProfileRevisionStatus = z.infer<typeof compatibilityProfileRevisionStatusSchema>;

export const compatibilityVerdictSchema = z.enum(['compatible', 'caution', 'not_recommended', 'insufficient_data']);
export const compatibilityRuleBasisSchema = z.enum(['species_trait', 'pair_rule', 'tank_condition', 'rule_inference']);

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
