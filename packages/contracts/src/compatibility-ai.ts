import { z } from 'zod';

export const compatibilityAiVerdictSchema = z.enum([
  'compatible',
  'caution',
  'not_recommended',
  'insufficient_data',
]);

export const compatibilityAiConfidenceSchema = z.enum(['high', 'medium', 'low', 'unknown']);

const evidenceIdsSchema = z.array(z.string().trim().min(1).max(180)).max(80);

const rangeSchema = z.object({
  min: z.number().finite().optional(),
  max: z.number().finite().optional(),
}).strict();

export const compatibilityAiSpeciesFactSchema = z.object({
  speciesId: z.string().trim().min(1).max(160),
  name: z.string().trim().min(1).max(160),
  scientificName: z.string().trim().max(220),
  quantity: z.number().int().min(1).max(1000),
  environment: z.object({
    waterType: z.enum(['freshwater', 'saltwater', 'brackish', 'unknown']).optional(),
    waterTypes: z.array(z.enum(['freshwater', 'saltwater', 'brackish'])).max(3).optional(),
    temperatureRangeC: rangeSchema.optional(),
    phRange: rangeSchema.optional(),
    hardnessDgh: rangeSchema.optional(),
    notes: z.array(z.string().trim().min(1).max(500)).max(8).optional(),
    evidenceIds: evidenceIdsSchema,
  }).strict(),
  socialBehavior: z.object({
    mode: z.enum(['solitary', 'pair', 'harem', 'shoal', 'school', 'group', 'colony', 'variable', 'unknown']),
    minimumGroupSize: z.number().int().min(1).max(1000).optional(),
    recommendedGroupSize: rangeSchema.optional(),
    swimmingZone: z.enum(['surface', 'upper', 'middle', 'bottom', 'all', 'unknown']).optional(),
    territoriality: z.enum(['none', 'low', 'medium', 'high', 'unknown']).optional(),
    finNipping: z.enum(['none', 'low', 'medium', 'high', 'unknown']).optional(),
    finNipVulnerability: z.enum(['none', 'low', 'medium', 'high', 'unknown']).optional(),
    swimmingPace: z.enum(['slow', 'moderate', 'fast', 'unknown']).optional(),
    predationRisk: z.enum(['none', 'low', 'medium', 'high', 'unknown']).optional(),
    predationVulnerability: z.enum(['none', 'low', 'medium', 'high', 'unknown']).optional(),
    summary: z.string().trim().min(1).max(1000),
    evidenceIds: evidenceIdsSchema,
  }).strict(),
  spaceAndGrowth: z.object({
    adultLengthCm: rangeSchema.optional(),
    minVolumeLiters: z.number().positive().max(100000).optional(),
    minTankLengthCm: z.number().positive().max(10000).optional(),
    activityLevel: z.enum(['low', 'medium', 'high', 'unknown']).optional(),
    swimmingZone: z.enum(['surface', 'upper', 'middle', 'bottom', 'all', 'unknown']).optional(),
    needsCover: z.boolean().optional(),
    needsHidingPlaces: z.boolean().optional(),
    substrateNotes: z.array(z.string().trim().min(1).max(500)).max(8).optional(),
    spaceNotes: z.array(z.string().trim().min(1).max(500)).max(8).optional(),
    evidenceIds: evidenceIdsSchema,
  }).strict(),
}).strict();

export const compatibilityAiReasoningRequestSchema = z.object({
  tank: z.object({
    waterType: z.enum(['freshwater', 'saltwater', 'unknown']),
    volumeLiters: z.number().positive().max(100000).nullable(),
    lengthCm: z.number().positive().max(10000).nullable(),
    targetTemperatureC: z.number().finite().min(-10).max(60).nullable(),
    substrate: z.string().trim().max(160).nullable(),
    plantCount: z.number().int().min(0).max(10000),
    hardscapeCount: z.number().int().min(0).max(10000),
  }).strict().nullable(),
  species: z.array(compatibilityAiSpeciesFactSchema).min(2).max(12),
  deterministic: z.object({
    status: compatibilityAiVerdictSchema,
    blockingRuleCodes: z.array(z.string().trim().min(1).max(160)).max(80),
    warningRuleCodes: z.array(z.string().trim().min(1).max(160)).max(80),
    missingDataCodes: z.array(z.string().trim().min(1).max(160)).max(80),
    passedRuleCodes: z.array(z.string().trim().min(1).max(160)).max(80),
  }).strict(),
  allowedEvidenceIds: evidenceIdsSchema,
  authorityVersion: z.string().trim().min(1).max(240),
}).strict();

export const compatibilityAiModelOutputSchema = z.object({
  verdict: compatibilityAiVerdictSchema,
  reasons: z.array(z.string().trim().min(1).max(700)).min(1).max(6),
  adjustments: z.array(z.string().trim().min(1).max(700)).max(6),
  uncertainties: z.array(z.string().trim().min(1).max(700)).max(6),
  confidence: compatibilityAiConfidenceSchema,
  evidenceIds: evidenceIdsSchema,
}).strict();

export const compatibilityAiProvenanceSchema = z.object({
  mode: z.enum(['ai_assisted', 'deterministic_only', 'fallback']),
  model: z.string().trim().min(1).max(160).optional(),
  authorityVersion: z.string().trim().min(1).max(240),
  speciesIds: z.array(z.string().trim().min(1).max(160)).min(1).max(12),
}).strict();

export const compatibilityAiReasoningSchema = compatibilityAiModelOutputSchema.extend({
  provenance: compatibilityAiProvenanceSchema,
});

export type CompatibilityAiVerdict = z.infer<typeof compatibilityAiVerdictSchema>;
export type CompatibilityAiConfidence = z.infer<typeof compatibilityAiConfidenceSchema>;
export type CompatibilityAiSpeciesFact = z.infer<typeof compatibilityAiSpeciesFactSchema>;
export type CompatibilityAiReasoningRequest = z.infer<typeof compatibilityAiReasoningRequestSchema>;
export type CompatibilityAiModelOutput = z.infer<typeof compatibilityAiModelOutputSchema>;
export type CompatibilityAiReasoning = z.infer<typeof compatibilityAiReasoningSchema>;
