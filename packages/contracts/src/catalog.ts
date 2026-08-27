import { z } from 'zod';

export const catalogWaterTypeSchema = z.enum(['freshwater', 'saltwater', 'unknown']);
export const catalogCompletenessSchema = z.enum(['verified', 'partial', 'unknown']);

export const catalogManifestSchema = z.object({
  version: z.string().trim().min(1).max(120),
  schemaVersion: z.number().int().positive(),
  checksumSha256: z.string().regex(/^[a-f0-9]{64}$/i),
  speciesCount: z.number().int().nonnegative(),
  reviewedProfileCount: z.number().int().nonnegative(),
  reviewedPairRuleCount: z.number().int().nonnegative(),
  publishedAt: z.string().datetime({ offset: true }),
  snapshotUrl: z.string().url(),
});

export const catalogEvidenceSourceSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1),
  publisher: z.string().trim().min(1),
  url: z.string().url(),
  sourceType: z.enum(['government', 'peer_reviewed', 'university', 'professional_association', 'curated_husbandry']),
  reviewStatus: z.enum(['draft', 'reviewed', 'rejected']),
});

export const catalogSpeciesSchema = z.object({
  id: z.string().trim().min(1),
  catalogKey: z.string().trim().min(1),
  name: z.string().trim().min(1),
  scientificName: z.string(),
  category: z.string(),
  waterType: catalogWaterTypeSchema,
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  waterTemperatureText: z.string().nullable(),
  waterTemperatureMinC: z.number().nullable(),
  waterTemperatureMaxC: z.number().nullable(),
  phLevelText: z.string().nullable(),
  phMin: z.number().nullable(),
  phMax: z.number().nullable(),
  waterChangeCycleDays: z.number().int().positive().nullable(),
  description: z.string().nullable(),
  diet: z.string().nullable(),
  tankSizeText: z.string().nullable(),
  minTankLiters: z.number().nullable(),
  temperament: z.enum(['Peaceful', 'Aggressive', 'Territorial']).nullable(),
  sizeClass: z.enum(['Small', 'Medium', 'Large']).nullable(),
  housingMode: z.enum(['适合混养', '谨慎混养', '建议单养']).nullable(),
  housingReason: z.string().nullable(),
  completeness: catalogCompletenessSchema,
  evidenceSourceIds: z.array(z.string()),
});

export const catalogCompatibilityProfileSchema = z.object({
  speciesId: z.string().trim().min(1),
  behaviorTraits: z.array(z.string()),
  minimumGroupSize: z.number().int().positive().nullable(),
  predationTargets: z.array(z.string()),
  confidence: z.enum(['high', 'medium', 'low', 'unknown']),
  reviewStatus: z.enum(['draft', 'reviewed', 'rejected']),
  citationIds: z.array(z.string()),
});

export const catalogPairRuleSchema = z.object({
  speciesIds: z.tuple([z.string().trim().min(1), z.string().trim().min(1)]),
  verdict: z.enum(['compatible', 'caution', 'not_recommended', 'insufficient_data']),
  riskType: z.string().trim().min(1),
  reason: z.string().trim().min(1),
  mitigation: z.array(z.string()),
  confidence: z.enum(['high', 'medium', 'low', 'unknown']),
  reviewStatus: z.enum(['draft', 'reviewed', 'rejected']),
  citationIds: z.array(z.string()),
});

export const catalogSnapshotSchema = z.object({
  manifest: catalogManifestSchema,
  species: z.array(catalogSpeciesSchema),
  evidenceSources: z.array(catalogEvidenceSourceSchema),
  compatibilityProfiles: z.array(catalogCompatibilityProfileSchema),
  pairRules: z.array(catalogPairRuleSchema),
});

export type CatalogWaterType = z.infer<typeof catalogWaterTypeSchema>;
export type CatalogCompleteness = z.infer<typeof catalogCompletenessSchema>;
export type CatalogManifest = z.infer<typeof catalogManifestSchema>;
export type CatalogEvidenceSource = z.infer<typeof catalogEvidenceSourceSchema>;
export type CatalogSpecies = z.infer<typeof catalogSpeciesSchema>;
export type CatalogCompatibilityProfile = z.infer<typeof catalogCompatibilityProfileSchema>;
export type CatalogPairRule = z.infer<typeof catalogPairRuleSchema>;
export type CatalogSnapshot = z.infer<typeof catalogSnapshotSchema>;
