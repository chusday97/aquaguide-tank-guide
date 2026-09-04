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
